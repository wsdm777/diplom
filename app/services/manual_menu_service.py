"""Python port of the frontend JS menu generator.

Used as a transparent fallback when the LLM is too slow or fails. The output
shape matches LLMGenerationResult so callers cannot tell which path produced
the plan.
"""
import random
from dataclasses import dataclass

from app.models.food import Food, MealType
from app.schemas.menu_plan import DietFilters, MacroRatio, MenuPlanItemCreate
from app.services.llm_menu_service import LLMGenerationResult

MEAL_KCAL_SHARE = {
    MealType.breakfast: 0.30,
    MealType.lunch: 0.35,
    MealType.dinner: 0.25,
    MealType.snack: 0.10,
}


@dataclass
class _Scored:
    food: Food
    score: float


def _macro_score(food: Food, target: MacroRatio | None) -> float:
    if target is None:
        return random.random()
    total = food.protein * 4 + food.fat * 9 + food.carb * 4
    if total == 0:
        return random.random()
    p_pct = (food.protein * 4) / total * 100
    f_pct = (food.fat * 9) / total * 100
    c_pct = (food.carb * 4) / total * 100
    return abs(p_pct - target.protein) + abs(f_pct - target.fat) + abs(c_pct - target.carb)


def _pick_items(
    pool: list[Food],
    target_kcal: int,
    macro_ratio: MacroRatio | None,
) -> list[MenuPlanItemCreate]:
    scored = [
        _Scored(food=f, score=_macro_score(f, macro_ratio) + random.random() * 20)
        for f in pool
    ]
    scored.sort(key=lambda s: s.score)

    selected: list[MenuPlanItemCreate] = []
    remaining = target_kcal

    for s in scored:
        if remaining <= 30:
            break
        if s.food.kcal <= 0:
            continue
        grams = min(round((remaining / s.food.kcal) * 100), 300)
        if grams < 30:
            continue
        kcal = round(s.food.kcal * grams / 100)
        selected.append(
            MenuPlanItemCreate(
                meal_type=s.food.meal_type.value,
                food_id=s.food.id,
                name=s.food.name,
                grams=grams,
                kcal=kcal,
                protein=round(s.food.protein * grams / 100, 1),
                fat=round(s.food.fat * grams / 100, 1),
                carb=round(s.food.carb * grams / 100, 1),
            )
        )
        remaining -= kcal
        if len(selected) >= 3:
            break
    return selected


def _group_by_meal(foods: list[Food]) -> dict[MealType, list[Food]]:
    groups: dict[MealType, list[Food]] = {m: [] for m in MealType}
    for f in foods:
        groups[f.meal_type].append(f)
    return groups


def generate_manual(
    target_kcal: int,
    macro_ratio: MacroRatio | None,
    diet_filters: DietFilters,  # noqa: ARG001 — foods are already pre-filtered upstream
    foods: list[Food],
) -> LLMGenerationResult:
    if not foods:
        raise RuntimeError("No foods available for the chosen diet filters")

    grouped = _group_by_meal(foods)

    b_kcal = round(target_kcal * MEAL_KCAL_SHARE[MealType.breakfast])
    l_kcal = round(target_kcal * MEAL_KCAL_SHARE[MealType.lunch])
    d_kcal = round(target_kcal * MEAL_KCAL_SHARE[MealType.dinner])
    s_kcal = target_kcal - b_kcal - l_kcal - d_kcal

    items: list[MenuPlanItemCreate] = []
    items += _pick_items(grouped[MealType.breakfast], b_kcal, macro_ratio)
    items += _pick_items(grouped[MealType.lunch], l_kcal, macro_ratio)
    items += _pick_items(grouped[MealType.dinner], d_kcal, macro_ratio)
    items += _pick_items(grouped[MealType.snack], s_kcal, macro_ratio)

    if not items:
        raise RuntimeError("Manual generator produced no items")

    total_kcal = sum(i.kcal for i in items)
    total_protein = round(sum(i.protein for i in items), 1)
    total_fat = round(sum(i.fat for i in items), 1)
    total_carb = round(sum(i.carb for i in items), 1)

    return LLMGenerationResult(
        items=items,
        total_kcal=total_kcal,
        total_protein=total_protein,
        total_fat=total_fat,
        total_carb=total_carb,
    )
