import { useEffect, useState } from 'react';
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
} from 'react-icons/hi2';

/* ───── Food database (per 100g) ───── */
const FOODS = {
  breakfast: [
    { name: 'Овсяная каша на воде', kcal: 88, protein: 3, fat: 1.7, carb: 15 },
    { name: 'Яйцо куриное (варёное)', kcal: 155, protein: 12.6, fat: 10.6, carb: 1.1 },
    { name: 'Творог 5%', kcal: 121, protein: 17.2, fat: 5, carb: 1.8 },
    { name: 'Банан', kcal: 89, protein: 1.1, fat: 0.3, carb: 23 },
    { name: 'Цельнозерновой хлеб', kcal: 247, protein: 13, fat: 3.4, carb: 41 },
    { name: 'Йогурт натуральный', kcal: 60, protein: 4, fat: 1.5, carb: 7 },
    { name: 'Омлет из 2 яиц', kcal: 154, protein: 11, fat: 12, carb: 0.7 },
    { name: 'Гречневая каша', kcal: 110, protein: 4.2, fat: 1.1, carb: 21 },
  ],
  lunch: [
    { name: 'Куриная грудка (варёная)', kcal: 165, protein: 31, fat: 3.6, carb: 0 },
    { name: 'Рис бурый (варёный)', kcal: 123, protein: 2.7, fat: 0.9, carb: 25.6 },
    { name: 'Гречка (варёная)', kcal: 110, protein: 4.2, fat: 1.1, carb: 21 },
    { name: 'Говядина (тушёная)', kcal: 232, protein: 25.8, fat: 14.7, carb: 0 },
    { name: 'Овощной салат', kcal: 35, protein: 1.5, fat: 0.2, carb: 7 },
    { name: 'Суп куриный', kcal: 48, protein: 3.6, fat: 1.4, carb: 5 },
    { name: 'Макароны (твёрдые сорта)', kcal: 131, protein: 5.1, fat: 1.1, carb: 27 },
    { name: 'Лосось (запечённый)', kcal: 208, protein: 20, fat: 13, carb: 0 },
    { name: 'Картофель (отварной)', kcal: 82, protein: 2, fat: 0.1, carb: 17 },
  ],
  dinner: [
    { name: 'Рыба (треска запечённая)', kcal: 90, protein: 17.8, fat: 0.7, carb: 0 },
    { name: 'Салат из свежих овощей', kcal: 35, protein: 1.5, fat: 0.2, carb: 7 },
    { name: 'Куриная грудка (гриль)', kcal: 165, protein: 31, fat: 3.6, carb: 0 },
    { name: 'Тушёные овощи', kcal: 55, protein: 2, fat: 1.5, carb: 8 },
    { name: 'Кефир 1%', kcal: 40, protein: 3, fat: 1, carb: 4 },
    { name: 'Индейка (варёная)', kcal: 130, protein: 29, fat: 1, carb: 0 },
    { name: 'Брокколи на пару', kcal: 35, protein: 2.4, fat: 0.4, carb: 7 },
    { name: 'Творог 2%', kcal: 103, protein: 18, fat: 2, carb: 3.3 },
  ],
  snack: [
    { name: 'Яблоко', kcal: 52, protein: 0.3, fat: 0.2, carb: 14 },
    { name: 'Миндаль (30 г)', kcal: 170, protein: 6, fat: 15, carb: 6 },
    { name: 'Греческий йогурт', kcal: 59, protein: 10, fat: 0.7, carb: 3.6 },
    { name: 'Банан', kcal: 89, protein: 1.1, fat: 0.3, carb: 23 },
    { name: 'Протеиновый батончик', kcal: 200, protein: 20, fat: 7, carb: 22 },
    { name: 'Морковь', kcal: 41, protein: 0.9, fat: 0.2, carb: 10 },
  ],
};

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
function pickItems(pool, targetKcal) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
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

function generateMenu(totalKcal) {
  const bKcal = Math.round(totalKcal * 0.3);
  const lKcal = Math.round(totalKcal * 0.35);
  const dKcal = Math.round(totalKcal * 0.25);
  const sKcal = totalKcal - bKcal - lKcal - dKcal;
  return {
    breakfast: { label: 'Завтрак', items: pickItems(FOODS.breakfast, bKcal), targetKcal: bKcal },
    lunch: { label: 'Обед', items: pickItems(FOODS.lunch, lKcal), targetKcal: lKcal },
    dinner: { label: 'Ужин', items: pickItems(FOODS.dinner, dKcal), targetKcal: dKcal },
    snack: { label: 'Перекус', items: pickItems(FOODS.snack, sKcal), targetKcal: sKcal },
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
  const [menu, setMenu] = useState(null);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    api.get(`/users/${user.id}/weight`).then(({ data }) => {
      if (data.length > 0) setLastWeight(data[data.length - 1].weight);
    }).catch(() => {});
  }, [user.id]);

  const age = calcAge(user.birth_date);
  const bmr = lastWeight ? calcBMR(user.gender, lastWeight, user.height, age) : null;
  const tdee = bmr ? bmr * ACTIVITY[activityIdx].factor : null;
  const autoKcal = tdee ? Math.round(tdee * GOALS[goalIdx].factor) : null;
  const targetKcal = customMode && customKcal ? Math.round(Number(customKcal)) : autoKcal;

  const handleGenerate = () => {
    if (!targetKcal) return;
    setAnimating(true);
    setMenu(null);
    setTimeout(() => {
      setMenu(generateMenu(targetKcal));
      setAnimating(false);
      toast.success('Меню сгенерировано!');
    }, 600);
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
              <div className="mb-5">
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

        <Button onClick={handleGenerate} loading={animating} disabled={!targetKcal} icon={menu ? HiOutlineArrowPath : HiOutlineBolt} size="lg">
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
                    <div className="text-right text-white">
                      <p className="text-2xl font-extrabold">{totals.kcal}</p>
                      <p className="text-white/70 text-xs">ккал</p>
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
    </PageTransition>
  );
}
