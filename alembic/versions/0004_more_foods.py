"""add 150 more foods

Revision ID: 0004
Revises: 0003
Create Date: 2026-03-29

"""

from alembic import op
import sqlalchemy as sa

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

# (name, meal_type, kcal, protein, fat, carb, is_vegan, is_lf, is_gf)
SEED = [
    # ── breakfast (38) ──────────────────────────────────────────────────────
    ("Каша из киноа", "breakfast", 120, 4.4, 1.9, 21.3, True, True, True),
    ("Рисовая каша на воде", "breakfast", 97, 2.2, 0.5, 21, True, True, True),
    ("Кукурузная каша", "breakfast", 86, 2.5, 1.2, 18, True, True, True),
    ("Пшённая каша", "breakfast", 105, 3, 1.1, 21, True, True, True),
    ("Ячневая каша", "breakfast", 109, 3.6, 0.9, 22, True, True, True),
    ("Тост с авокадо", "breakfast", 210, 4, 14, 19, True, True, False),
    ("Блины (2 шт)", "breakfast", 230, 7, 8, 34, False, False, False),
    ("Сырники (2 шт)", "breakfast", 260, 14, 12, 26, False, False, False),
    ("Яйцо пашот", "breakfast", 68, 6, 4.5, 0.3, False, True, True),
    ("Скрэмбл из 3 яиц", "breakfast", 210, 16, 15, 1.5, False, True, True),
    ("Йогурт греческий с ягодами", "breakfast", 95, 9, 2, 9, False, False, True),
    ("Творожная запеканка", "breakfast", 170, 14, 6, 16, False, False, False),
    ("Мюсли с молоком", "breakfast", 310, 9, 6, 56, False, False, False),
    ("Овсяноблин", "breakfast", 190, 12, 8, 19, False, True, False),
    ("Пшеничная каша", "breakfast", 113, 3.5, 1.3, 23, True, True, False),
    ("Chia пудинг на кокосовом молоке", "breakfast", 180, 4, 11, 17, True, True, True),
    ("Кокосовая гранола", "breakfast", 430, 7, 18, 60, True, True, False),
    (
        "Рисовые лепёшки с арахисовой пастой",
        "breakfast",
        220,
        7,
        10,
        27,
        True,
        True,
        True,
    ),
    ("Смузи-боул", "breakfast", 180, 5, 4, 33, True, True, True),
    ("Протеиновый коктейль", "breakfast", 160, 25, 3, 9, False, True, True),
    ("Творог с мёдом", "breakfast", 140, 15, 4, 14, False, False, True),
    ("Ржаной хлеб с маслом", "breakfast", 230, 5, 10, 30, False, True, False),
    ("Яйцо варёное всмятку", "breakfast", 68, 6, 4.5, 0.3, False, True, True),
    ("Льняная каша", "breakfast", 95, 3, 4, 12, True, True, True),
    ("Кефирный смузи с бананом", "breakfast", 110, 4, 1, 22, False, False, True),
    ("Хлопья кукурузные без сахара", "breakfast", 360, 7, 1, 79, True, True, True),
    ("Ореховая смесь (30 г)", "breakfast", 175, 5, 15, 8, True, True, True),
    ("Варёная кукуруза", "breakfast", 96, 3.4, 1.3, 19, True, True, True),
    ("Батат запечённый", "breakfast", 86, 1.6, 0.1, 20, True, True, True),
    ("Тост с рикоттой и томатом", "breakfast", 190, 8, 7, 23, False, False, False),
    ("Фруктовый салат", "breakfast", 65, 0.8, 0.4, 16, True, True, True),
    ("Кукурузный хлеб", "breakfast", 266, 6, 8, 43, False, True, True),
    ("Семга слабосолёная (50 г)", "breakfast", 117, 11, 8, 0, False, True, True),
    ("Паровые овощи с яйцом", "breakfast", 120, 8, 5, 11, False, True, True),
    ("Молочный рис", "breakfast", 130, 4, 3, 23, False, False, True),
    ("Запечённое яблоко с корицей", "breakfast", 78, 0.5, 0.5, 19, True, True, True),
    ("Кокосовый йогурт", "breakfast", 90, 1, 6, 8, True, True, True),
    ("Амарантовая каша", "breakfast", 103, 4, 1.8, 19, True, True, True),
    # ── lunch (52) ──────────────────────────────────────────────────────────
    ("Свинина запечённая", "lunch", 259, 25, 17, 0, False, True, True),
    ("Телятина тушёная", "lunch", 197, 27, 10, 0, False, True, True),
    ("Кролик тушёный", "lunch", 183, 27, 8, 0, False, True, True),
    ("Утка запечённая", "lunch", 308, 19, 26, 0, False, True, True),
    ("Форель запечённая", "lunch", 168, 22, 9, 0, False, True, True),
    ("Скумбрия запечённая", "lunch", 221, 20, 15, 0, False, True, True),
    ("Тунец консервированный", "lunch", 96, 22, 0.5, 0, False, True, True),
    ("Сельдь (варёная)", "lunch", 161, 18, 10, 0, False, True, True),
    ("Минтай запечённый", "lunch", 79, 17, 1, 0, False, True, True),
    ("Перловая каша", "lunch", 102, 3.4, 0.4, 22, True, True, True),
    ("Пшеничная каша с маслом", "lunch", 145, 4, 4, 25, False, True, False),
    ("Кускус варёный", "lunch", 112, 3.8, 0.6, 23, True, True, False),
    ("Полента", "lunch", 70, 1.8, 0.5, 14, True, True, True),
    ("Булгур варёный", "lunch", 83, 3.1, 0.4, 18.6, True, True, False),
    ("Стейк из тунца", "lunch", 144, 24, 5, 0, False, True, True),
    ("Котлета паровая куриная", "lunch", 130, 20, 5, 3, False, True, True),
    ("Запечённый картофель с кожурой", "lunch", 93, 2.5, 0.1, 21, True, True, True),
    ("Пюре картофельное", "lunch", 110, 2, 4, 17, False, False, True),
    ("Тушёная капуста", "lunch", 47, 2, 1.5, 7, True, True, True),
    ("Цветная капуста на пару", "lunch", 30, 2.5, 0.3, 5, True, True, True),
    ("Зелёный горошек (варёный)", "lunch", 81, 5.4, 0.4, 14, True, True, True),
    ("Шпинат тушёный", "lunch", 41, 5, 1, 3, True, True, True),
    ("Кабачки тушёные", "lunch", 34, 1.2, 0.3, 7, True, True, True),
    ("Баклажан запечённый", "lunch", 38, 1.5, 0.2, 8, True, True, True),
    ("Перец фаршированный (без мяса)", "lunch", 95, 3, 2, 17, True, True, True),
    ("Перец фаршированный (с мясом)", "lunch", 150, 12, 7, 11, False, True, True),
    ("Лазанья", "lunch", 220, 12, 10, 22, False, False, False),
    ("Плов с курицей", "lunch", 210, 14, 8, 24, False, True, True),
    ("Гороховый суп", "lunch", 80, 5, 2, 11, True, True, True),
    ("Борщ", "lunch", 55, 3.5, 2, 7, False, True, True),
    ("Щи", "lunch", 45, 2.5, 2, 6, False, True, True),
    ("Рассольник", "lunch", 60, 3, 2.5, 8, False, True, False),
    ("Том-ям с тофу", "lunch", 90, 5, 4, 9, True, True, True),
    ("Мисо-суп с тофу", "lunch", 45, 4, 1.5, 5, True, True, True),
    ("Фалафель (3 шт)", "lunch", 333, 13, 18, 32, True, True, True),
    ("Долма с рисом", "lunch", 170, 8, 8, 18, False, True, True),
    ("Рис с овощами (жареный)", "lunch", 150, 3.5, 4, 26, True, True, True),
    ("Гречка с грибами", "lunch", 120, 5, 3, 20, True, True, True),
    ("Паста с томатным соусом", "lunch", 180, 6, 3, 34, True, True, False),
    ("Паста с курицей", "lunch", 220, 18, 5, 28, False, True, False),
    ("Пицца (1 кусок)", "lunch", 270, 11, 10, 34, False, False, False),
    ("Ролл с авокадо и огурцом", "lunch", 140, 3, 3, 26, True, True, True),
    ("Суши с лососем (4 шт)", "lunch", 220, 12, 6, 30, False, True, True),
    ("Шаурма куриная", "lunch", 260, 18, 12, 22, False, True, False),
    ("Бурger без булки", "lunch", 210, 24, 12, 2, False, True, True),
    ("Нутовый суп", "lunch", 95, 6, 2, 16, True, True, True),
    ("Чечевичный суп", "lunch", 100, 7, 1.5, 17, True, True, True),
    ("Темпе варёный", "lunch", 192, 19, 11, 7, True, True, True),
    ("Сейтан с овощами", "lunch", 140, 25, 2, 7, True, True, False),
    ("Омлет с овощами (на обед)", "lunch", 170, 13, 11, 6, False, True, True),
    ("Яичница с помидорами", "lunch", 155, 10, 11, 5, False, True, True),
    ("Куриные котлеты на пару (2 шт)", "lunch", 175, 23, 7, 4, False, True, True),
    # ── dinner (37) ─────────────────────────────────────────────────────────
    ("Минтай на пару", "dinner", 72, 15.9, 0.9, 0, False, True, True),
    ("Хек запечённый", "dinner", 86, 16.6, 2.2, 0, False, True, True),
    ("Карп тушёный", "dinner", 96, 14, 4.5, 0, False, True, True),
    ("Палтус на пару", "dinner", 103, 19, 3, 0, False, True, True),
    ("Куриные фрикадельки", "dinner", 120, 18, 5, 2, False, True, True),
    ("Индейка с овощами (тушёная)", "dinner", 135, 22, 4, 6, False, True, True),
    ("Телятина на пару", "dinner", 148, 22, 7, 0, False, True, True),
    ("Кролик запечённый с чесноком", "dinner", 170, 24, 8, 1, False, True, True),
    ("Говяжьи котлеты на пару", "dinner", 180, 22, 10, 2, False, True, True),
    ("Тушёный кальмар", "dinner", 110, 18, 2.5, 4, False, True, True),
    ("Креветки варёные", "dinner", 97, 18, 2.2, 0, False, True, True),
    ("Мидии варёные", "dinner", 86, 11.5, 2, 3.7, False, True, True),
    ("Осьминог варёный", "dinner", 82, 15, 1, 2.2, False, True, True),
    ("Рис с тушёными овощами", "dinner", 130, 3, 2, 26, True, True, True),
    ("Гречка с тушёной морковью", "dinner", 118, 4, 2, 22, True, True, True),
    ("Запечённый нут", "dinner", 120, 6, 2.5, 20, True, True, True),
    ("Запечённый кабачок с сыром", "dinner", 100, 5, 5.5, 8, False, False, True),
    ("Рататуй", "dinner", 60, 2, 2.5, 9, True, True, True),
    ("Стир-фрай с тофу и овощами", "dinner", 145, 10, 7, 12, True, True, True),
    ("Фасоль с томатами (тушёная)", "dinner", 100, 6, 1, 18, True, True, True),
    ("Чечевица с овощами", "dinner", 105, 8, 1, 18, True, True, True),
    ("Суп-пюре из тыквы", "dinner", 50, 1.5, 1.5, 9, True, True, True),
    ("Суп-пюре из брокколи", "dinner", 45, 3, 1.5, 6, True, True, True),
    ("Суп-пюре из шпината", "dinner", 55, 4, 2, 6, True, True, True),
    ("Авокадо с лимоном", "dinner", 160, 2, 15, 8.5, True, True, True),
    ("Омлет с грибами", "dinner", 140, 11, 10, 3, False, True, True),
    ("Яйца по-деревенски", "dinner", 155, 12, 11, 4, False, True, True),
    ("Запечённый перец с рисом", "dinner", 130, 4, 2, 26, True, True, True),
    ("Картофельная запеканка", "dinner", 150, 5, 6, 20, False, False, True),
    ("Цветная капуста запечённая", "dinner", 55, 3, 2, 7, True, True, True),
    ("Шпинат с чесноком", "dinner", 35, 3.5, 1, 3.5, True, True, True),
    ("Тыква запечённая", "dinner", 47, 1.5, 0.5, 10, True, True, True),
    ("Баклажаны с томатами", "dinner", 55, 2, 2, 9, True, True, True),
    ("Греческий салат с тофу", "dinner", 130, 7, 9, 8, True, True, True),
    ("Зелёный салат с авокадо", "dinner", 115, 2, 10, 7, True, True, True),
    ("Свёкла запечённая", "dinner", 43, 1.5, 0.1, 10, True, True, True),
    ("Паровые рыбные котлеты", "dinner", 105, 17, 4, 2, False, True, True),
    # ── snack (23) ──────────────────────────────────────────────────────────
    ("Груша", "snack", 57, 0.4, 0.1, 15, True, True, True),
    ("Апельсин", "snack", 47, 0.9, 0.2, 12, True, True, True),
    ("Мандарин", "snack", 38, 0.8, 0.2, 9, True, True, True),
    ("Киви (2 шт)", "snack", 61, 1.1, 0.5, 14, True, True, True),
    ("Персик", "snack", 39, 0.9, 0.1, 10, True, True, True),
    ("Клубника (150 г)", "snack", 48, 1, 0.5, 11, True, True, True),
    ("Черника (100 г)", "snack", 57, 0.7, 0.3, 14, True, True, True),
    ("Виноград (100 г)", "snack", 69, 0.6, 0.2, 18, True, True, True),
    ("Грецкий орех (30 г)", "snack", 196, 4.6, 19.5, 4, True, True, True),
    ("Кешью (30 г)", "snack", 163, 5.1, 13, 9, True, True, True),
    ("Фундук (30 г)", "snack", 188, 4.4, 18, 5, True, True, True),
    ("Фисташки (30 г)", "snack", 171, 6, 14, 8, True, True, True),
    ("Семечки подсолнечника (30 г)", "snack", 173, 6, 15, 6, True, True, True),
    ("Тыквенные семечки (30 г)", "snack", 163, 8, 14, 5, True, True, True),
    ("Огурец с хумусом", "snack", 90, 4, 5, 8, True, True, True),
    ("Сельдерей с арахисовой пастой", "snack", 130, 5, 10, 9, True, True, True),
    ("Рисовые хлебцы (2 шт)", "snack", 70, 1.5, 0.5, 15, True, True, True),
    ("Попкорн без масла (20 г)", "snack", 78, 2.6, 1, 15, True, True, True),
    ("Тёмный шоколад 70% (20 г)", "snack", 114, 1.7, 8, 9, True, True, True),
    ("Кокосовые чипсы (20 г)", "snack", 120, 1, 11, 6, True, True, True),
    ("Творожный сыр на хлебце", "snack", 110, 6, 5, 11, False, False, False),
    ("Ягодное желе", "snack", 45, 1.5, 0, 10, False, True, True),
    ("Рисовый пудинг", "snack", 120, 3, 2.5, 22, False, False, True),
]


def upgrade() -> None:
    conn = op.get_bind()
    for name, meal_type, kcal, protein, fat, carb, is_vegan, is_lf, is_gf in SEED:
        conn.execute(
            sa.text(
                "INSERT INTO foods (name, meal_type, kcal, protein, fat, carb, is_vegan, is_lactose_free, is_gluten_free) "
                f"VALUES (:name, '{meal_type}'::mealtype, :kcal, :protein, :fat, :carb, :is_vegan, :is_lf, :is_gf)"
            ).bindparams(
                name=name, kcal=kcal, protein=protein, fat=fat, carb=carb,
                is_vegan=is_vegan, is_lf=is_lf, is_gf=is_gf,
            )
        )


def downgrade() -> None:
    names = [row[0] for row in SEED]
    op.execute(
        sa.text("DELETE FROM foods WHERE name = ANY(:names)").bindparams(names=names)
    )
