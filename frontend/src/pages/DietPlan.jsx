import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import {
  HiOutlineBolt,
  HiOutlineArrowPath,
  HiOutlineSun,
  HiOutlineFire,
  HiOutlineMoon,
  HiOutlineCake,
  HiOutlineScale,
  HiOutlinePrinter,
  HiOutlinePencilSquare,
  HiOutlineCalculator,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
} from 'react-icons/hi2';

/* ───── Diet filter options ───── */
const DIET_FILTERS = [
  { key: 'vegan', label: 'Веган' },
  { key: 'lactose_free', label: 'Без лактозы' },
  { key: 'gluten_free', label: 'Без глютена' },
];

const mealIcons = {
  breakfast: HiOutlineSun,
  lunch: HiOutlineFire,
  dinner: HiOutlineMoon,
  snack: HiOutlineCake,
};

const mealColors = {
  breakfast: 'from-amber-400 to-orange-500',
  lunch: 'from-emerald-400 to-teal-500',
  dinner: 'from-indigo-400 to-purple-500',
  snack: 'from-rose-400 to-pink-500',
};

/* ───── Menu generator ───── */
function macroScore(item, targetRatio) {
  if (!targetRatio) return Math.random();
  const total = item.protein * 4 + item.fat * 9 + item.carb * 4;
  if (total === 0) return Math.random();
  const pPct = (item.protein * 4) / total * 100;
  const fPct = (item.fat * 9) / total * 100;
  const cPct = (item.carb * 4) / total * 100;
  return Math.abs(pPct - targetRatio.protein) + Math.abs(fPct - targetRatio.fat) + Math.abs(cPct - targetRatio.carb);
}

function pickItems(pool, targetKcal, macroRatio, excludeIds = []) {
  const filtered = excludeIds.length > 0 ? pool.filter((f) => !excludeIds.includes(f.id)) : pool;
  const shuffled = [...filtered].sort((a, b) => {
    const sa = macroScore(a, macroRatio) + Math.random() * 20;
    const sb = macroScore(b, macroRatio) + Math.random() * 20;
    return sa - sb;
  });
  const selected = [];
  let remaining = targetKcal;

  for (const item of shuffled) {
    if (remaining <= 30) break;
    const grams = Math.min(Math.round((remaining / item.kcal) * 100), 300);
    if (grams < 30) continue;
    const portion = {
      ...item,
      grams,
      kcal: Math.round((item.kcal * grams) / 100),
      protein: +((item.protein * grams) / 100).toFixed(1),
      fat: +((item.fat * grams) / 100).toFixed(1),
      carb: +((item.carb * grams) / 100).toFixed(1),
    };
    selected.push(portion);
    remaining -= portion.kcal;
    if (selected.length >= 3) break;
  }
  return selected;
}

function groupByMeal(foods) {
  const groups = { breakfast: [], lunch: [], dinner: [], snack: [] };
  for (const f of foods) {
    if (groups[f.meal_type]) groups[f.meal_type].push(f);
  }
  return groups;
}

function generateMenu(totalKcal, macroRatio, foods) {
  const grouped = groupByMeal(foods);
  const bKcal = Math.round(totalKcal * 0.3);
  const lKcal = Math.round(totalKcal * 0.35);
  const dKcal = Math.round(totalKcal * 0.25);
  const sKcal = totalKcal - bKcal - lKcal - dKcal;
  return {
    breakfast: { label: 'Завтрак', items: pickItems(grouped.breakfast, bKcal, macroRatio), targetKcal: bKcal },
    lunch: { label: 'Обед', items: pickItems(grouped.lunch, lKcal, macroRatio), targetKcal: lKcal },
    dinner: { label: 'Ужин', items: pickItems(grouped.dinner, dKcal, macroRatio), targetKcal: dKcal },
    snack: { label: 'Перекус', items: pickItems(grouped.snack, sKcal, macroRatio), targetKcal: sKcal },
  };
}

/* ───── Helpers ───── */
function calcAge(bd) {
  const t = new Date(), b = new Date(bd);
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return a;
}
function calcBMR(g, w, h, a) { return g === 'male' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161; }

const ACTIVITY = [
  { label: 'Минимальная (сидячий)', factor: 1.2 },
  { label: 'Лёгкая (1-3 тренировки/нед)', factor: 1.375 },
  { label: 'Средняя (3-5 тренировок/нед)', factor: 1.55 },
  { label: 'Высокая (6-7 тренировок/нед)', factor: 1.725 },
  { label: 'Очень высокая', factor: 1.9 },
];
const GOALS = [
  { label: 'Похудение (-20%)', factor: 0.8, emoji: '🔥' },
  { label: 'Поддержание веса', factor: 1.0, emoji: '⚖️' },
  { label: 'Набор массы (+15%)', factor: 1.15, emoji: '💪' },
];

const mealTotal = (items) =>
  items.reduce(
    (a, i) => ({ kcal: a.kcal + i.kcal, protein: +(a.protein + i.protein).toFixed(1), fat: +(a.fat + i.fat).toFixed(1), carb: +(a.carb + i.carb).toFixed(1) }),
    { kcal: 0, protein: 0, fat: 0, carb: 0 },
  );

/* ───── Component ───── */
export default function DietPlan() {
  const { user } = useAuth();
  const [lastWeight, setLastWeight] = useState(null);
  const [activityIdx, setActivityIdx] = useState(0);
  const [goalIdx, setGoalIdx] = useState(0);
  const [customMode, setCustomMode] = useState(false);
  const [customKcal, setCustomKcal] = useState('');
  const [macros, setMacros] = useState({ protein: 30, fat: 25, carb: 45 });
  const [dietFilters, setDietFilters] = useState({ vegan: false, lactose_free: false, gluten_free: false });
  const [menu, setMenu] = useState(null);
  const [cachedFoods, setCachedFoods] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [history, setHistory] = useState([]);
  const [expandedPlan, setExpandedPlan] = useState(null);

  const fetchFoods = async (filters) => {
    const params = new URLSearchParams();
    if (filters.vegan) params.set('vegan', 'true');
    if (filters.lactose_free) params.set('lactose_free', 'true');
    if (filters.gluten_free) params.set('gluten_free', 'true');
    const { data } = await api.get(`/foods?${params}`);
    return data;
  };

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/menu-plans');
      setHistory(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    api.get(`/users/${user.id}/weight`).then(({ data }) => {
      if (data.length > 0) setLastWeight(data[data.length - 1].weight);
    }).catch(() => {});
    fetchHistory();
  }, [user.id, fetchHistory]);

  const age = calcAge(user.birth_date);
  const bmr = lastWeight ? calcBMR(user.gender, lastWeight, user.height, age) : null;
  const tdee = bmr ? bmr * ACTIVITY[activityIdx].factor : null;
  const autoKcal = tdee ? Math.round(tdee * GOALS[goalIdx].factor) : null;
  const targetKcal = customMode && customKcal ? Math.round(Number(customKcal)) : autoKcal;

  const handleGenerate = async () => {
    if (!targetKcal) return;
    setAnimating(true);
    setMenu(null);
    try {
      const freshFoods = await fetchFoods(dietFilters);
      setCachedFoods(freshFoods);
      const ratio = customMode ? macros : null;
      const generated = generateMenu(targetKcal, ratio, freshFoods);
      setMenu(generated);

      // build flat items list for saving
      const allItems = Object.entries(generated).flatMap(([mealKey, meal]) =>
        meal.items.map((item) => ({
          meal_type: mealKey,
          food_id: item.id,
          name: item.name,
          grams: item.grams,
          kcal: item.kcal,
          protein: item.protein,
          fat: item.fat,
          carb: item.carb,
        }))
      );
      const total = Object.values(generated).reduce(
        (acc, meal) => {
          const t = mealTotal(meal.items);
          return {
            kcal: acc.kcal + t.kcal,
            protein: +(acc.protein + t.protein).toFixed(1),
            fat: +(acc.fat + t.fat).toFixed(1),
            carb: +(acc.carb + t.carb).toFixed(1),
          };
        },
        { kcal: 0, protein: 0, fat: 0, carb: 0 }
      );

      await api.post('/menu-plans', {
        target_kcal: targetKcal,
        total_kcal: total.kcal,
        total_protein: total.protein,
        total_fat: total.fat,
        total_carb: total.carb,
        items: allItems,
      });
      fetchHistory();
      toast.success('Меню сгенерировано и сохранено!');
    } catch {
      toast.error('Не удалось загрузить продукты');
    } finally {
      setAnimating(false);
    }
  };

  const handleRegenerateMeal = (mealKey) => {
    if (!menu || !cachedFoods) return;
    const grouped = groupByMeal(cachedFoods);
    const ratio = customMode ? macros : null;
    const currentIds = menu[mealKey].items.map((i) => i.id);
    const newItems = pickItems(grouped[mealKey], menu[mealKey].targetKcal, ratio, currentIds);
    setMenu((prev) => ({
      ...prev,
      [mealKey]: { ...prev[mealKey], items: newItems },
    }));
  };

  const handleDeletePlan = async (planId) => {
    try {
      await api.delete(`/menu-plans/${planId}`);
      setHistory((prev) => prev.filter((p) => p.id !== planId));
      if (expandedPlan === planId) setExpandedPlan(null);
    } catch {
      toast.error('Не удалось удалить меню');
    }
  };

  const handleExpandPlan = async (planId) => {
    if (expandedPlan === planId) {
      setExpandedPlan(null);
      return;
    }
    try {
      const { data } = await api.get(`/menu-plans/${planId}`);
      setHistory((prev) => prev.map((p) => (p.id === planId ? data : p)));
      setExpandedPlan(planId);
    } catch {
      toast.error('Не удалось загрузить меню');
    }
  };

  if (!lastWeight) {
    return (
      <PageTransition>
        <div className="text-center py-20 space-y-6">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto"
          >
            <HiOutlineScale className="w-10 h-10 text-emerald-500" />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-gray-900">Диета и меню</h1>
          <p className="text-gray-400 max-w-md mx-auto">Сначала добавьте запись о весе, чтобы рассчитать калорийность и сформировать меню</p>
          <Link to="/weight">
            <Button size="lg">Добавить вес</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  const dayTotal = menu
    ? Object.values(menu).reduce(
        (a, meal) => { const t = mealTotal(meal.items); return { kcal: a.kcal + t.kcal, protein: +(a.protein + t.protein).toFixed(1), fat: +(a.fat + t.fat).toFixed(1), carb: +(a.carb + t.carb).toFixed(1) }; },
        { kcal: 0, protein: 0, fat: 0, carb: 0 },
      )
    : null;

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900"
          >
            Формирование меню
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 mt-1"
          >
            Индивидуальный план питания на основе ваших параметров
          </motion.p>
        </div>
        {menu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="no-print">
            <Button variant="secondary" icon={HiOutlinePrinter} onClick={() => window.print()}>
              Печать
            </Button>
          </motion.div>
        )}
      </div>

      {/* Settings */}
      <GlassCard className="p-6" delay={0.1}>
        {/* Diet filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5 pb-5 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-600">Ограничения:</span>
          {DIET_FILTERS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dietFilters[key]}
                onChange={(e) => { setDietFilters({ ...dietFilters, [key]: e.target.checked }); setMenu(null); }}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setCustomMode(false); setMenu(null); }}
            className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              !customMode
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                : 'bg-white/60 border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <HiOutlineCalculator className="w-4 h-4" />
            Авто
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setCustomMode(true); setMenu(null); }}
            className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
              customMode
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                : 'bg-white/60 border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <HiOutlinePencilSquare className="w-4 h-4" />
            Вручную
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {!customMode ? (
            <motion.div
              key="auto"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Уровень активности</label>
                  <select
                    value={activityIdx}
                    onChange={(e) => { setActivityIdx(Number(e.target.value)); setMenu(null); }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    {ACTIVITY.map((a, i) => (<option key={i} value={i}>{a.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Цель</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GOALS.map((g, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setGoalIdx(i); setMenu(null); }}
                        className={`cursor-pointer py-2.5 px-3 rounded-xl text-xs font-semibold text-center transition-all border ${
                          goalIdx === i
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                            : 'bg-white/60 border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-base block mb-0.5">{g.emoji}</span>
                        {g.label.split(' (')[0]}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-5 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Дневная калорийность (ккал)</label>
                  <motion.input
                    whileFocus={{ boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' }}
                    type="number"
                    min="800"
                    max="10000"
                    step="50"
                    value={customKcal}
                    onChange={(e) => { setCustomKcal(e.target.value); setMenu(null); }}
                    placeholder={autoKcal ? `например ${autoKcal}` : '2000'}
                    className="w-full max-w-xs border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 text-gray-800 outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Соотношение БЖУ (%)</label>
                  <div className="flex items-center gap-3">
                    {[
                      { key: 'protein', label: 'Б' },
                      { key: 'fat', label: 'Ж' },
                      { key: 'carb', label: 'У' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-500">{label}</span>
                        <motion.input
                          whileFocus={{ boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' }}
                          type="number"
                          min="5"
                          max="80"
                          value={macros[key]}
                          onChange={(e) => { setMacros({ ...macros, [key]: Number(e.target.value) }); setMenu(null); }}
                          className="w-16 border border-gray-200 rounded-xl px-3 py-2 bg-white/80 text-gray-800 text-center text-sm outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    ))}
                    <span className={`text-sm font-semibold ${macros.protein + macros.fat + macros.carb === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                      = {macros.protein + macros.fat + macros.carb}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parameters bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-5 pb-5 border-b border-gray-100">
          <span>Вес: <b className="text-gray-800">{lastWeight} кг</b></span>
          <span>Рост: <b className="text-gray-800">{user.height} см</b></span>
          <span>Возраст: <b className="text-gray-800">{age}</b></span>
          <span>BMR: <b className="text-gray-800">{Math.round(bmr)} ккал</b></span>
          <span className="text-emerald-700 font-bold text-base">
            Цель: {targetKcal || '—'} ккал/день
          </span>
        </div>

        <Button onClick={handleGenerate} loading={animating} disabled={!targetKcal || (customMode && macros.protein + macros.fat + macros.carb !== 100)} icon={menu ? HiOutlineArrowPath : HiOutlineBolt} size="lg">
          {menu ? 'Сгенерировать заново' : 'Сгенерировать меню'}
        </Button>
      </GlassCard>

      {/* Menu cards */}
      <AnimatePresence mode="wait">
        {menu && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {Object.entries(menu).map(([key, meal], idx) => {
              const totals = mealTotal(meal.items);
              const Icon = mealIcons[key];
              const gradient = mealColors[key];
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.12, duration: 0.5 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Meal header */}
                  <div className={`bg-gradient-to-r ${gradient} px-6 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{meal.label}</h3>
                        <p className="text-white/70 text-xs">~{meal.targetKcal} ккал</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRegenerateMeal(key)}
                        className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors no-print"
                        title="Заменить блюда"
                      >
                        <HiOutlineArrowPath className="w-4 h-4 text-white" />
                      </motion.button>
                      <div className="text-right text-white">
                        <p className="text-2xl font-extrabold">{totals.kcal}</p>
                        <p className="text-white/70 text-xs">ккал</p>
                      </div>
                    </div>
                  </div>

                  {/* Meal items */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {meal.items.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.12 + i * 0.05 + 0.2 }}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.grams} г</p>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="hidden sm:inline text-gray-400">Б: <b className="text-gray-600">{item.protein}</b></span>
                            <span className="hidden sm:inline text-gray-400">Ж: <b className="text-gray-600">{item.fat}</b></span>
                            <span className="hidden sm:inline text-gray-400">У: <b className="text-gray-600">{item.carb}</b></span>
                            <span className="font-bold text-gray-800 min-w-[50px] text-right">{item.kcal} ккал</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Meal totals */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>Белки: <b className="text-gray-700">{totals.protein} г</b></span>
                      <span>Жиры: <b className="text-gray-700">{totals.fat} г</b></span>
                      <span>Углеводы: <b className="text-gray-700">{totals.carb} г</b></span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Day total */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white relative overflow-hidden"
            >
              <div className="absolute inset-0 animate-shimmer" />
              <div className="relative">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <HiOutlineFire className="w-5 h-5" />
                  Итого за день
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Калории</p>
                    <p className="text-3xl font-extrabold mt-1">
                      <AnimatedNumber value={dayTotal.kcal} />
                    </p>
                    <p className="text-emerald-200 text-xs">ккал</p>
                  </div>
                  <div>
                    <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Белки</p>
                    <p className="text-3xl font-extrabold mt-1">
                      <AnimatedNumber value={dayTotal.protein} decimals={1} />
                    </p>
                    <p className="text-emerald-200 text-xs">грамм</p>
                  </div>
                  <div>
                    <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Жиры</p>
                    <p className="text-3xl font-extrabold mt-1">
                      <AnimatedNumber value={dayTotal.fat} decimals={1} />
                    </p>
                    <p className="text-emerald-200 text-xs">грамм</p>
                  </div>
                  <div>
                    <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Углеводы</p>
                    <p className="text-3xl font-extrabold mt-1">
                      <AnimatedNumber value={dayTotal.carb} decimals={1} />
                    </p>
                    <p className="text-emerald-200 text-xs">грамм</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <GlassCard className="p-6" delay={0.2}>
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HiOutlineClock className="w-5 h-5 text-emerald-500" />
            История меню
          </h2>
          <div className="space-y-2">
            {history.map((plan) => (
              <div key={plan.id} className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-white/60">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      {new Date(plan.created_at).toLocaleDateString('ru-RU', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <span className="font-semibold text-gray-700">{plan.total_kcal} ккал</span>
                    <span className="hidden sm:inline text-gray-400">
                      Б: <b className="text-gray-600">{plan.total_protein}г</b>{' '}
                      Ж: <b className="text-gray-600">{plan.total_fat}г</b>{' '}
                      У: <b className="text-gray-600">{plan.total_carb}г</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExpandPlan(plan.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                      title="Подробнее"
                    >
                      {expandedPlan === plan.id
                        ? <HiOutlineChevronUp className="w-4 h-4" />
                        : <HiOutlineChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      title="Удалить"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedPlan === plan.id && plan.items && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-gray-100"
                    >
                      <div className="px-4 py-3 bg-gray-50/50 space-y-3">
                        {['breakfast', 'lunch', 'dinner', 'snack'].map((mealKey) => {
                          const mealLabels = { breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snack: 'Перекус' };
                          const items = plan.items.filter((i) => i.meal_type === mealKey);
                          if (items.length === 0) return null;
                          return (
                            <div key={mealKey}>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                {mealLabels[mealKey]}
                              </p>
                              <div className="space-y-1">
                                {items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">{item.name} <span className="text-gray-400">{item.grams}г</span></span>
                                    <span className="text-gray-500 font-medium">{item.kcal} ккал</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </PageTransition>
  );
}
