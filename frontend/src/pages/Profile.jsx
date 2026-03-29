import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import {
  HiOutlineUserCircle,
  HiOutlineEnvelope,
  HiOutlineScale,
  HiOutlineArrowsUpDown,
  HiOutlineCake,
  HiOutlineCalendarDays,
  HiOutlineChartBarSquare,
  HiOutlinePencilSquare,
  HiOutlineCheck,
  HiOutlineXMark,
} from 'react-icons/hi2';

function calcAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function Profile() {
  const { user, fetchUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ gender: user.gender, height: user.height, birth_date: user.birth_date });

  useEffect(() => {
    api.get(`/users/${user.id}/weight`).then(({ data }) => setEntries(data)).catch(() => {});
  }, [user.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me', { ...form, height: parseFloat(form.height) });
      await fetchUser();
      setEditing(false);
      toast.success('Профиль обновлён');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ gender: user.gender, height: user.height, birth_date: user.birth_date });
    setEditing(false);
  };

  const age = calcAge(user.birth_date);
  const lastWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;
  const firstWeight = entries.length > 0 ? entries[0].weight : null;
  const diff = lastWeight && firstWeight ? lastWeight - firstWeight : null;

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <PageTransition className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl sm:text-4xl font-extrabold text-gray-900"
      >
        Профиль
      </motion.h1>

      {/* Profile card */}
      <GlassCard className="p-8" delay={0.1}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/20"
          >
            <span className="text-3xl font-extrabold text-white">{initials}</span>
          </motion.div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h2 className="text-2xl font-extrabold text-gray-900">{user.name}</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Редактировать"
                >
                  <HiOutlinePencilSquare className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-gray-400 flex items-center gap-1.5 justify-center sm:justify-start mt-1">
              <HiOutlineEnvelope className="w-4 h-4" />
              {user.email}
            </p>

            {!editing ? (
              <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-lg">
                  <HiOutlineUserCircle className="w-3.5 h-3.5" />
                  {user.gender === 'male' ? 'Мужской' : 'Женский'}
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-lg">
                  <HiOutlineCake className="w-3.5 h-3.5" />
                  {age} лет
                </span>
              </div>
            ) : (
              <div className="mt-4 space-y-4 max-w-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Пол</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/80 text-gray-800 text-sm outline-none focus:border-emerald-500 transition-all"
                    >
                      <option value="male">Мужской</option>
                      <option value="female">Женский</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Рост (см)</label>
                    <input
                      type="number"
                      min="50"
                      max="300"
                      step="0.1"
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/80 text-gray-800 text-sm outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Дата рождения</label>
                  <input
                    type="date"
                    value={form.birth_date}
                    onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/80 text-gray-800 text-sm outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleSave} loading={saving} icon={HiOutlineCheck} size="sm">
                    Сохранить
                  </Button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <HiOutlineXMark className="w-4 h-4" />
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Рост"
          value={user.height}
          suffix=" см"
          icon={HiOutlineArrowsUpDown}
          color="blue"
          delay={0.15}
          decimals={0}
        />
        <StatCard
          title="Текущий вес"
          value={lastWeight || '—'}
          suffix={lastWeight ? ' кг' : ''}
          icon={HiOutlineScale}
          color="emerald"
          delay={0.2}
          decimals={lastWeight ? 1 : 0}
        />
        <StatCard
          title="Записей веса"
          value={entries.length}
          icon={HiOutlineChartBarSquare}
          color="purple"
          delay={0.25}
          decimals={0}
        />
        <StatCard
          title="Дата рождения"
          value={new Date(user.birth_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
          icon={HiOutlineCalendarDays}
          color="orange"
          delay={0.3}
        />
      </div>

      {/* Progress summary */}
      {entries.length > 1 && (
        <GlassCard className="p-6" delay={0.35}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Прогресс</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Стартовый вес</p>
              <p className="text-2xl font-extrabold text-gray-800 mt-1">{firstWeight} кг</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(entries[0].measured_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Текущий вес</p>
              <p className="text-2xl font-extrabold text-gray-800 mt-1">{lastWeight} кг</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(entries[entries.length - 1].measured_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Изменение</p>
              <p className={`text-2xl font-extrabold mt-1 ${diff < 0 ? 'text-emerald-600' : diff > 0 ? 'text-red-500' : 'text-gray-600'}`}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)} кг
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                за {entries.length} {entries.length === 1 ? 'запись' : entries.length < 5 ? 'записи' : 'записей'}
              </p>
            </div>
          </div>
        </GlassCard>
      )}
    </PageTransition>
  );
}
