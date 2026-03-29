import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/client';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import {
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineArchiveBox,
  HiOutlineArrowsUpDown,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const PIE_COLORS = ['#10b981', '#f59e0b'];

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-700">{payload[0].value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Загрузка аналитики...</p>
        </div>
      </PageTransition>
    );
  }

  if (!stats) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <p className="text-gray-400">Не удалось загрузить данные</p>
        </div>
      </PageTransition>
    );
  }

  const genderData = [
    { name: 'Мужчины', value: stats.gender.male },
    { name: 'Женщины', value: stats.gender.female },
  ];

  return (
    <PageTransition className="space-y-6">
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl sm:text-4xl font-extrabold text-gray-900"
        >
          Панель администратора
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mt-1"
        >
          Аналитика и статистика сервиса
        </motion.p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Пользователей" value={stats.total_users} icon={HiOutlineUserGroup} color="emerald" delay={0} decimals={0} />
        <StatCard title="Записей веса" value={stats.total_weight_entries} icon={HiOutlineScale} color="blue" delay={0.1} decimals={0} />
        <StatCard title="Продуктов в базе" value={stats.total_foods} icon={HiOutlineArchiveBox} color="purple" delay={0.2} decimals={0} />
        <StatCard title="Ср. рост" value={stats.avg_height || '—'} suffix={stats.avg_height ? ' см' : ''} icon={HiOutlineArrowsUpDown} color="orange" delay={0.3} decimals={stats.avg_height ? 1 : 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gender pie */}
        <GlassCard className="p-6" delay={0.35}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Распределение по полу</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                stroke="none"
                animationDuration={1000}
              >
                {genderData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {genderData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-gray-600">{d.name}: <b>{d.value}</b></span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Avg weight card */}
        <GlassCard className="p-6 flex flex-col justify-center items-center" delay={0.4}>
          <HiOutlineChartBarSquare className="w-12 h-12 text-emerald-400 mb-4" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Средний вес пользователей</p>
          <p className="text-5xl font-extrabold text-gray-800 mt-2">
            {stats.avg_weight ? `${stats.avg_weight} кг` : '—'}
          </p>
        </GlassCard>
      </div>

      {/* Weight entries chart */}
      {stats.daily_weight_entries.length > 0 && (
        <GlassCard className="p-6" delay={0.45}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Записи веса за последние 30 дней</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.daily_weight_entries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}.${d.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} name="Записей" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* New users chart */}
      {stats.daily_new_users.length > 0 && (
        <GlassCard className="p-6" delay={0.5}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Новые пользователи (по первой записи веса)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.daily_new_users}>
              <defs>
                <linearGradient id="newUsersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getDate()}.${d.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#newUsersGrad)" name="Пользователей" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      )}
    </PageTransition>
  );
}
