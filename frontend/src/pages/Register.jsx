import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/ui/PageTransition';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    gender: 'male',
    height: '',
    weight: '',
    birth_date: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, height: parseFloat(form.height) };
      if (form.weight) {
        payload.weight = parseFloat(form.weight);
      } else {
        delete payload.weight;
      }
      await register(payload);
      toast.success('Регистрация успешна! Теперь войдите.');
      navigate('/login');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(detail.map((e) => e.msg.replace(/^Value error, /i, '')).join('; '));
      } else {
        setError('Ошибка регистрации');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-8">
        <div className="w-full max-w-lg">
          <div className="absolute -z-10 top-20 right-1/4 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
          <div className="absolute -z-10 bottom-20 left-1/4 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20"
              >
                <span className="text-2xl">✨</span>
              </motion.div>
              <h1 className="text-2xl font-extrabold text-gray-900">Создать аккаунт</h1>
              <p className="text-sm text-gray-400 mt-1">Заполните данные для персонализации</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-6 flex items-center gap-2"
              >
                <span className="text-red-400">&#9888;</span>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Имя"
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                placeholder="Ваше имя"
                icon={HiOutlineUser}
              />

              <Input
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="email@example.com"
                icon={HiOutlineEnvelope}
              />

              <Input
                label="Пароль"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={set('password')}
                placeholder="Минимум 6 символов"
                icon={HiOutlineLockClosed}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">Пол</label>
                  <motion.select
                    value={form.gender}
                    onChange={set('gender')}
                    whileFocus={{ boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 backdrop-blur-sm text-gray-800 outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="male">Мужской</option>
                    <option value="female">Женский</option>
                  </motion.select>
                </div>
                <Input
                  label="Рост (см)"
                  type="number"
                  required
                  min="50"
                  max="300"
                  step="0.1"
                  value={form.height}
                  onChange={set('height')}
                  placeholder="170"
                />
              </div>

              <Input
                label="Вес (кг)"
                type="number"
                min="1"
                max="500"
                step="0.1"
                value={form.weight}
                onChange={set('weight')}
                placeholder="70 (необязательно)"
              />

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Дата рождения</label>
                <motion.input
                  type="date"
                  required
                  value={form.birth_date}
                  onChange={set('birth_date')}
                  max={(() => { const d = new Date(); d.setFullYear(d.getFullYear() - 16); return d.toISOString().split('T')[0]; })()}
                  whileFocus={{ boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)' }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white/80 backdrop-blur-sm text-gray-800 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <Button type="submit" loading={submitting} size="lg" className="w-full">
                Зарегистрироваться
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Уже есть аккаунт?{' '}
                <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                  Войти
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
