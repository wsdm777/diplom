import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineScale,
  HiOutlineClipboardDocumentList,
  HiOutlineUserCircle,
  HiOutlineArrowRightOnRectangle,
  HiBars3,
  HiXMark,
  HiOutlineChartBarSquare,
} from 'react-icons/hi2';

const userLinks = [
  { to: '/', label: 'Главная', icon: HiOutlineHome },
  { to: '/weight', label: 'Вес', icon: HiOutlineScale },
  { to: '/diet', label: 'Диета и меню', icon: HiOutlineClipboardDocumentList },
  { to: '/profile', label: 'Профиль', icon: HiOutlineUserCircle },
];

const adminLinks = [
  { to: '/', label: 'Аналитика', icon: HiOutlineChartBarSquare },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = user?.role === 'admin' ? adminLinks : userLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#fff',
            color: '#374151',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            border: '1px solid rgba(229,231,235,0.5)',
          },
        }}
      />

      {/* ─── Header ─── */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed top-0 inset-x-0 z-50 glass border-b border-white/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                <span className="text-white text-lg">🥗</span>
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                NutriPlan
              </span>
            </Link>

            {/* Desktop nav */}
            {user ? (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const active = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'text-emerald-700'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100/50'
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                      {active && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute inset-0 bg-emerald-50 border border-emerald-200/50 rounded-xl -z-10"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}

                <div className="w-px h-6 bg-gray-200 mx-2" />

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
                    {user.name}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all duration-200 cursor-pointer"
                    title="Выйти"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                  </motion.button>
                </div>
              </nav>
            ) : (
              <nav className="hidden md:flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100/50 transition-all"
                >
                  Вход
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                  Регистрация
                </Link>
              </nav>
            )}

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 cursor-pointer"
            >
              {mobileOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1 bg-white/90 backdrop-blur-lg">
                {user ? (
                  <>
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          location.pathname === link.to
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <link.icon className="w-5 h-5" />
                        {link.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full cursor-pointer"
                    >
                      <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                      Вход
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-xl text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                    >
                      Регистрация
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ─── Main ─── */}
      <main className="pt-20 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-200/50 bg-white/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">🥗</span>
              </div>
              <span className="text-sm font-semibold text-gray-500">NutriPlan</span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Веб-сервис для автоматизированного формирования индивидуальных диет и меню &copy; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
