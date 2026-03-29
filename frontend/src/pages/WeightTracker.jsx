import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import {
  HiOutlinePlusCircle,
  HiOutlineScale,
  HiOutlineArrowTrendingDown,
  HiOutlineArrowTrendingUp,
  HiOutlineChartBar,
  HiOutlineTrash,
} from 'react-icons/hi2';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-100">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-emerald-700">{payload[0].value} кг</p>
    </div>
  );
}

export default function WeightTracker() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = async () => {
    try {
      const { data } = await api.get(`/users/${user.id}/weight`);
      setEntries(data);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchEntries(); }, [user.id]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users/me/weight', { weight: parseFloat(weight) });
      toast.success('Вес записан!');
      setWeight('');
      await fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId) => {
    try {
      await api.delete(`/users/me/weight/${entryId}`);
      toast.success('Запись удалена');
      await fetchEntries();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка удаления');
    }
  };

  const chartData = entries.map((e) => ({
    date: new Date(e.measured_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    weight: e.weight,
  }));

  const lastWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;
  const firstWeight = entries.length > 0 ? entries[0].weight : null;
  const diff = lastWeight && firstWeight ? lastWeight - firstWeight : null;
  const minW = entries.length > 0 ? Math.min(...entries.map(e => e.weight)) : null;
  const maxW = entries.length > 0 ? Math.max(...entries.map(e => e.weight)) : null;

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl sm:text-4xl font-extrabold text-gray-900"
        >
          Отслеживание веса
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mt-1"
        >
          Следите за динамикой и прогрессом
        </motion.p>
      </div>

      {/* Stats row */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Текущий вес" value={lastWeight} suffix=" кг" icon={HiOutlineScale} color="emerald" delay={0} decimals={1} />
          <StatCard title="Записей" value={entries.length} icon={HiOutlineChartBar} color="blue" delay={0.1} decimals={0} />
          <StatCard title="Минимум" value={minW} suffix=" кг" icon={HiOutlineArrowTrendingDown} color="purple" delay={0.2} decimals={1} />
          <StatCard
            title="Изменение"
            value={diff !== null ? (diff >= 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)) : '—'}
            suffix={diff !== null ? ' кг' : ''}
            icon={diff >= 0 ? HiOutlineArrowTrendingUp : HiOutlineArrowTrendingDown}
            color={diff !== null && diff < 0 ? 'emerald' : 'orange'}
            delay={0.3}
          />
        </div>
      )}

      {/* Add weight form */}
      <GlassCard className="p-6" delay={0.1}>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HiOutlinePlusCircle className="w-5 h-5 text-emerald-500" />
          Добавить запись
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Вес (кг)</label>
            <motion.input
              whileFocus={{ boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' }}
              type="number"
              required
              step="0.1"
              min="1"
              max="500"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 text-gray-800 outline-none focus:border-emerald-500 transition-all"
              placeholder="75.0"
            />
          </div>
          <Button type="submit" loading={submitting} icon={HiOutlinePlusCircle}>
            Добавить
          </Button>
        </form>
      </GlassCard>

      {/* Chart */}
      {chartData.length > 1 && (
        <GlassCard className="p-6" delay={0.2}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">График веса</h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#weightGrad)"
                  dot={{ fill: '#fff', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 2, r: 6 }}
                  name="Вес (кг)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </GlassCard>
      )}

      {/* History table */}
      {entries.length > 0 && (
        <GlassCard className="p-6" delay={0.3}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">История измерений</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  <th className="text-left py-3 font-semibold text-xs uppercase tracking-wider">Дата</th>
                  <th className="text-right py-3 font-semibold text-xs uppercase tracking-wider">Вес (кг)</th>
                  <th className="text-right py-3 font-semibold text-xs uppercase tracking-wider">Разница</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {[...entries].reverse().map((e, i, arr) => {
                    const prevEntry = arr[i + 1];
                    const d = prevEntry ? e.weight - prevEntry.weight : null;
                    return (
                      <motion.tr
                        key={e.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="py-3 text-gray-600">
                          {new Date(e.measured_at).toLocaleString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 text-right font-bold text-gray-800">{e.weight}</td>
                        <td className="py-3 text-right">
                          {d !== null ? (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg ${
                              d < 0 ? 'bg-emerald-50 text-emerald-600' :
                              d > 0 ? 'bg-red-50 text-red-500' :
                              'bg-gray-50 text-gray-400'
                            }`}>
                              {d > 0 ? '+' : ''}{d.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Удалить"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {entries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineScale className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-400 text-lg font-medium">Записей пока нет</p>
          <p className="text-gray-300 text-sm mt-1">Добавьте первый вес выше</p>
        </motion.div>
      )}
    </PageTransition>
  );
}
