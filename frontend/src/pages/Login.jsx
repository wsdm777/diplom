import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import PageTransition from '../components/ui/PageTransition';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Добро пожаловать, ${user.name}!`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка входа');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Decorative blobs */}
          <div className="absolute -z-10 top-20 left-1/4 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute -z-10 bottom-20 right-1/4 w-72 h-72 bg-teal-200/20 rounded-full blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-10"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20"
              >
                <span className="text-2xl">🥗</span>
              </motion.div>
              <h1 className="text-2xl font-extrabold text-gray-900">Вход в NutriPlan</h1>
              <p className="text-sm text-gray-400 mt-1">Войдите, чтобы продолжить</p>
            </div>

            {/* Error */}
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
                value={form.password}
                onChange={set('password')}
                placeholder="Введите пароль"
                icon={HiOutlineLockClosed}
              />

              <Button
                type="submit"
                loading={submitting}
                size="lg"
                className="w-full"
              >
                Войти
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Нет аккаунта?{' '}
                <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                  Зарегистрироваться
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
