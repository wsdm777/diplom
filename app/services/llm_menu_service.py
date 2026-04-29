import json
import logging
import re
from dataclasses import dataclass

from openai import AsyncOpenAI

from app.core.config import settings
from app.models.food import Food, MealType
from app.schemas.menu_plan import (
    DietFilters,
    MacroRatio,
    MenuPlanItemCreate,
)

logger = logging.getLogger(__name__)

MEAL_KCAL_SHARE = {
    MealType.breakfast: 0.30,
    MealType.lunch: 0.35,
    MealType.dinner: 0.25,
    MealType.snack: 0.10,
}

SYSTEM_PROMPT = (
    "You are a dietitian planning a single day's menu. "
    "You MUST pick foods only from the provided catalog by their numeric `id`. "
    "Never invent foods or ids. "
    "Each food's macros are given per 100 g; you choose `grams` to hit the target calories. "
    "Respond with ONE valid JSON object, no prose, no markdown fences."
)


@dataclass
class LLMGenerationResult:
    items: list[MenuPlanItemCreate]
    total_kcal: int
    total_protein: float
    total_fat: float
    total_carb: float


def _build_user_prompt(
    target_kcal: int,
    macro_ratio: MacroRatio | None,
    diet_filters: DietFilters,
    foods: list[Food],
) -> str:
    catalog = [
        {
            "id": f.id,
            "name": f.name,
            "meal_type": f.meal_type.value,
            "kcal_per_100g": round(f.kcal, 1),
            "protein_per_100g": round(f.protein, 1),
            "fat_per_100g": round(f.fat, 1),
            "carb_per_100g": round(f.carb, 1),
        }
        for f in foods
    ]

    logger.info(f"{catalog=}")

    meal_targets = {
        meal.value: round(target_kcal * share)
        for meal, share in MEAL_KCAL_SHARE.items()
    }

    macro_block = (
        f"Target macro split (% of kcal): protein {macro_ratio.protein}, "
        f"fat {macro_ratio.fat}, carb {macro_ratio.carb}."
        if macro_ratio
        else "No specific macro split — keep it balanced."
    )

    restrictions = []
    if diet_filters.vegan:
        restrictions.append("vegan")
    if diet_filters.lactose_free:
        restrictions.append("lactose-free")
    if diet_filters.gluten_free:
        restrictions.append("gluten-free")
    restrictions_block = (
        f"Dietary restrictions: {', '.join(restrictions)}."
        if restrictions
        else "No dietary restrictions."
    )

    schema_example = {
        "items": [
            {"meal_type": "breakfast", "food_id": 1, "grams": 150},
            {"meal_type": "lunch", "food_id": 2, "grams": 200},
        ]
    }

    return (
        f"Target: {target_kcal} kcal/day across 4 meals "
        f"(breakfast ~{meal_targets['breakfast']}, lunch ~{meal_targets['lunch']}, "
        f"dinner ~{meal_targets['dinner']}, snack ~{meal_targets['snack']}).\n"
        f"{macro_block}\n"
        f"{restrictions_block}\n\n"
        "Rules:\n"
        "- Pick 2–3 items per meal_type (breakfast, lunch, dinner, snack).\n"
        "- Each item's `food_id` MUST exist in the catalog and its `meal_type` must match.\n"
        "- `grams` between 30 and 400, integer.\n"
        "- Avoid repeating the same food across meals.\n"
        "- Do not output kcal/protein/fat/carb — they will be computed from grams.\n\n"
        f"Respond with JSON exactly like:\n{json.dumps(schema_example, ensure_ascii=False)}\n\n"
        f"Catalog:\n{json.dumps(catalog, ensure_ascii=False)}"
    )


def _extract_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise


def _build_items(
    raw_items: list[dict],
    foods_by_id: dict[int, Food],
) -> list[MenuPlanItemCreate]:
    out: list[MenuPlanItemCreate] = []
    for raw in raw_items:
        food_id = int(raw["food_id"])
        food = foods_by_id.get(food_id)
        if food is None:
            logger.warning("LLM returned unknown food_id=%s — skipping", food_id)
            continue
        meal_type = str(raw["meal_type"])
        if meal_type != food.meal_type.value:
            logger.warning(
                "LLM mismatched meal_type for food_id=%s (got %s, expected %s) — using catalog value",
                food_id,
                meal_type,
                food.meal_type.value,
            )
            meal_type = food.meal_type.value
        grams = int(raw["grams"])
        grams = max(30, min(grams, 400))

        out.append(
            MenuPlanItemCreate(
                meal_type=meal_type,
                food_id=food.id,
                name=food.name,
                grams=grams,
                kcal=round(food.kcal * grams / 100),
                protein=round(food.protein * grams / 100, 1),
                fat=round(food.fat * grams / 100, 1),
                carb=round(food.carb * grams / 100, 1),
            )
        )
    return out


def _aggregate(items: list[MenuPlanItemCreate]) -> tuple[int, float, float, float]:
    total_kcal = sum(i.kcal for i in items)
    total_protein = round(sum(i.protein for i in items), 1)
    total_fat = round(sum(i.fat for i in items), 1)
    total_carb = round(sum(i.carb for i in items), 1)
    return total_kcal, total_protein, total_fat, total_carb


class LLMMenuService:
    def __init__(self) -> None:
        if not settings.OPENROUTER_API_KEY:
            raise RuntimeError("OPENROUTER_API_KEY is not configured")
        self.client = AsyncOpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url=settings.OPENROUTER_BASE_URL,
            timeout=settings.OPENROUTER_TIMEOUT_SECONDS,
        )
        self.model = settings.OPENROUTER_MODEL

    async def generate(
        self,
        target_kcal: int,
        macro_ratio: MacroRatio | None,
        diet_filters: DietFilters,
        foods: list[Food],
    ) -> LLMGenerationResult:
        if not foods:
            raise RuntimeError("No foods available for the chosen diet filters")

        user_prompt = _build_user_prompt(target_kcal, macro_ratio, diet_filters, foods)

        # Note: response_format=json_object is intentionally omitted — not all
        # OpenRouter providers support it. _extract_json handles fences/prose.
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            extra_headers={
                "HTTP-Referer": "https://localhost",
                "X-Title": "Diet Planner",
            },
        )

        # OpenRouter может вернуть 200 без choices, положив причину в поле error.
        upstream_error = getattr(response, "error", None) or (
            response.model_extra or {}
        ).get("error")
        if upstream_error:
            msg = (
                upstream_error.get("message")
                if isinstance(upstream_error, dict)
                else str(upstream_error)
            )
            logger.error("OpenRouter upstream error: %s", upstream_error)
            raise RuntimeError(f"Провайдер LLM вернул ошибку: {msg or upstream_error}")

        if not response.choices:
            logger.error("LLM response has no choices: %s", response.model_dump())
            raise RuntimeError(
                "LLM вернула пустой ответ (нет choices). "
                "Возможно, превышен лимит бесплатной модели — попробуйте позже "
                "или поменяйте OPENROUTER_MODEL."
            )

        content = response.choices[0].message.content or ""
        if not content.strip():
            raise RuntimeError("LLM returned empty response")

        payload = _extract_json(content)
        raw_items = payload.get("items") or []
        if not isinstance(raw_items, list) or not raw_items:
            raise RuntimeError("LLM response has no 'items' array")

        foods_by_id = {f.id: f for f in foods}
        items = _build_items(raw_items, foods_by_id)
        if not items:
            raise RuntimeError("LLM produced no valid items after validation")

        total_kcal, total_protein, total_fat, total_carb = _aggregate(items)
        return LLMGenerationResult(
            items=items,
            total_kcal=total_kcal,
            total_protein=total_protein,
            total_fat=total_fat,
            total_carb=total_carb,
        )
