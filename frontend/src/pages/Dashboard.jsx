import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import PageTransition from '../components/ui/PageTransition';
import StatCard from '../components/ui/StatCard';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import AnimatedNumber from '../components/ui/AnimatedNumber';
import {
  HiOutlineScale,
  HiOutlineArrowsUpDown,
  HiOutlineCake,
  HiOutlineUser,
  HiOutlineFire,
  HiOutlineBolt,
  HiOutlineArrowTrendingDown,
  HiOutlineClipboardDocumentList,
  HiOutlineChartBarSquare,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

function calcAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function calcBMR(gender, weight, height, age) {
  if (gender === 'male') return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

function calcBMI(weight, heightCm) {
  const hm = heightCm / 100;
  return weight / (hm * hm);
}

function bmiCategory(bmi) {
  if (bmi < 18.5) return { label: 'Недостаток', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (bmi < 25) return { label: 'Норма', color: 'text-emerald-600', bg: 'bg-emerald-100' };
  if (bmi < 30) return { label: 'Избыток', color: 'text-orange-600', bg: 'bg-orange-100' };
  return { label: 'Ожирение', color: 'text-red-600', bg: 'bg-red-100' };
}

const activityLevels = [
  { label: 'Минимальная (сидячий образ жизни)', factor: 1.2 },
  { label: 'Лёгкая (1-3 тренировки/нед)', factor: 1.375 },
  { label: 'Средняя (3-5 тренировок/нед)', factor: 1.55 },
  { label: 'Высокая (6-7 тренировок/нед)', factor: 1.725 },
  { label: 'Очень высокая (2 раза/день)', factor: 1.9 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [lastWeight, setLastWeight] = useState(null);
  const [weightCount, setWeightCount] = useState(0);
  const [activityIdx, setActivityIdx] = useState(0);

  useEffect(() => {
    api.get(`/users/${user.id}/weight`).then(({ data }) => {
      setWeightCount(data.length);
      if (data.length > 0) setLastWeight(data[data.length - 1].weight);
    }).catch(() => {});
  }, [user.id]);

  const age = calcAge(user.birth_date);
  const bmr = lastWeight ? calcBMR(user.gender, lastWeight, user.height, age) : null;
  const tdee = bmr ? bmr * activityLevels[activityIdx].factor : null;
  const bmi = lastWeight ? calcBMI(lastWeight, user.height) : null;
  const bmiCat = bmi ? bmiCategory(bmi) : null;

  return (
    <PageTransition className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900"
          >
            Привет, {user.name}! <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>👋</motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-gray-400 mt-1"
          >
            Ваш персональный центр управления питанием
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Link to="/diet">
            <Button icon={HiOutlineClipboardDocumentList}>
              Сформировать меню
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Текущий вес"
          value={lastWeight || '—'}
          suffix={lastWeight ? ' кг' : ''}
          icon={HiOutlineScale}
          color="emerald"
          delay={0}
          decimals={lastWeight ? 1 : 0}
        >
          {!lastWeight && (
            <Link to="/weight" className="text-xs text-emerald-600 hover:underline mt-1 inline-block">
              Добавить
            </Link>
          )}
        </StatCard>

        <StatCard
          title="Рост"
          value={user.height}
          suffix=" см"
          icon={HiOutlineArrowsUpDown}
          color="blue"
          delay={0.1}
          decimals={0}
        />

        <StatCard
          title="Возраст"
          value={age}
          suffix=" лет"
          icon={HiOutlineCake}
          color="purple"
          delay={0.2}
          decimals={0}
        />

        <StatCard
          title="Пол"
          value={user.gender === 'male' ? 'Мужской' : 'Женский'}
          icon={HiOutlineUser}
          color="orange"
          delay={0.3}
        />
      </div>

      {/* BMI Card */}
      {bmi && (
        <GlassCard className="p-6" delay={0.35}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Индекс массы тела (ИМТ)</h2>
            <span className={`${bmiCat.bg} ${bmiCat.color} text-xs font-bold px-3 py-1 rounded-lg`}>
              {bmiCat.label}
            </span>
          </div>

          {/* BMI scale */}
          <div className="relative h-4 bg-gradient-to-r from-blue-400 via-emerald-400 via-60% to-red-400 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ left: '0%' }}
              animate={{ left: `${Math.min(Math.max(((bmi - 15) / 25) * 100, 0), 100)}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-gray-800"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>
          <p className="text-center mt-3 text-2xl font-bold text-gray-800">
            <AnimatedNumber value={bmi} decimals={1} />
          </p>
        </GlassCard>
      )}

      {/* Calorie calculator */}
      {bmr && (
        <GlassCard className="p-6" delay={0.4}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Расчёт калорий</h2>
              <p className="text-sm text-gray-400">Формула Миффлина-Сан Жеора</p>
            </div>
            <select
              value={activityIdx}
              onChange={(e) => setActivityIdx(Number(e.target.value))}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent max-w-sm"
            >
              {activityLevels.map((l, i) => (
                <option key={i} value={i}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 text-center border border-emerald-100"
            >
              <HiOutlineFire className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Базовый обмен</p>
              <p className="text-3xl font-extrabold text-emerald-700 mt-1">
                <AnimatedNumber value={Math.round(bmr)} />
              </p>
              <p className="text-xs text-gray-400 mt-1">ккал/день</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 text-center border border-blue-100"
            >
              <HiOutlineBolt className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Поддержание</p>
              <p className="text-3xl font-extrabold text-blue-700 mt-1">
                <AnimatedNumber value={Math.round(tdee)} />
              </p>
              <p className="text-xs text-gray-400 mt-1">ккал/день</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 text-center border border-orange-100"
            >
              <HiOutlineArrowTrendingDown className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Похудение (-20%)</p>
              <p className="text-3xl font-extrabold text-orange-600 mt-1">
                <AnimatedNumber value={Math.round(tdee * 0.8)} />
              </p>
              <p className="text-xs text-gray-400 mt-1">ккал/день</p>
            </motion.div>
          </div>
        </GlassCard>
      )}

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          {
            to: '/weight',
            icon: HiOutlineChartBarSquare,
            title: 'Отслеживание веса',
            desc: `${weightCount} ${weightCount === 1 ? 'запись' : weightCount < 5 ? 'записи' : 'записей'} в истории`,
            color: 'from-purple-500 to-violet-600',
          },
          {
            to: '/diet',
            icon: HiOutlineClipboardDocumentList,
            title: 'Диета и меню',
            desc: 'Автоматическое формирование плана питания',
            color: 'from-emerald-500 to-teal-600',
          },
        ].map((item, i) => (
          <Link key={i} to={item.to}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 flex items-center gap-4 group cursor-pointer hover:shadow-xl transition-all"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.desc}</p>
              </div>
              <HiOutlineArrowRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </motion.div>
          </Link>
        ))}
      </div>
    </PageTransition>
  );
}
