import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineCalculator,
  HiOutlineChartBarSquare,
  HiOutlineClipboardDocumentList,
  HiOutlineUserGroup,
  HiOutlineBolt,
  HiOutlineShieldCheck,
  HiOutlineArrowRight,
} from 'react-icons/hi2';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const features = [
  {
    icon: HiOutlineBolt,
    title: 'Мгновенный результат',
    desc: 'Получите готовый план питания за секунды — без долгих расчётов и подбора продуктов вручную',
    color: 'rose',
  },
  {
    icon: HiOutlineClipboardDocumentList,
    title: 'Генерация меню',
    desc: 'Индивидуальное меню на день с точным подбором продуктов, порций и соотношения БЖУ',
    color: 'blue',
  },
  {
    icon: HiOutlineChartBarSquare,
    title: 'Трекинг веса',
    desc: 'Отслеживайте динамику веса с интерактивными графиками и историей измерений',
    color: 'purple',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Персонализация',
    desc: 'Учёт пола, возраста, роста, уровня активности и индивидуальных целей',
    color: 'orange',
  },
  {
    icon: HiOutlineCalculator,
    title: 'Расчёт калорийности',
    desc: 'Автоматический расчёт BMR и TDEE по формуле Миффлина-Сан Жеора с учётом ваших параметров',
    color: 'emerald',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Научный подход',
    desc: 'Все расчёты основаны на доказательных формулах нутрициологии и диетологии',
    color: 'teal',
  },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-200' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', ring: 'ring-orange-200' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', ring: 'ring-rose-200' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', ring: 'ring-teal-200' },
};

const stats = [
  { value: '30+', label: 'Продуктов в базе' },
  { value: '5', label: 'Уровней активности' },
  { value: '3', label: 'Цели питания' },
  { value: '4', label: 'Приёма пищи/день' },
];

export default function Landing() {
  return (
    <div className="space-y-24 pb-12 -mt-4">
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

        <div className="relative max-w-4xl mx-auto text-center pt-16 sm:pt-24 pb-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Персональный подход к питанию
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6"
          >
            Ваше{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent animate-gradient">
              идеальное
            </span>{' '}
            меню за секунды
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Автоматизированный веб-сервис формирования индивидуальных диет и меню
            на основе ваших физиологических параметров и целей
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2"
              >
                Начать бесплатно
                <HiOutlineArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
            <Link to="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-gray-700 px-8 py-3.5 rounded-2xl font-semibold border border-gray-200 hover:bg-gray-50 shadow-sm transition-all"
              >
                Уже есть аккаунт
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={4}
          className="max-w-3xl mx-auto"
        >
          <div className="glass rounded-2xl p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {s.value}
                </p>
                <p className="text-xs text-gray-400 font-medium mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── Features ─── */}
      <section>
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4"
          >
            Возможности сервиса
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 max-w-xl mx-auto"
          >
            Всё необходимое для формирования сбалансированного рациона питания
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const c = colorMap[f.color];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50 hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className={`${c.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ring-4 ${c.ring} ring-opacity-30 group-hover:scale-110 transition-transform duration-200`}>
                  <f.icon className={`w-6 h-6 ${c.text}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section>
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4"
          >
            Как это работает
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: '01', title: 'Заполните профиль', desc: 'Укажите рост, вес, возраст, пол и уровень активности' },
            { step: '02', title: 'Выберите цель', desc: 'Похудение, поддержание веса или набор массы' },
            { step: '03', title: 'Получите меню', desc: 'Система автоматически подберёт продукты и рассчитает порции' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                <span className="text-white font-bold text-lg">{s.step}</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 animate-shimmer" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Готовы начать?
            </h2>
            <p className="text-emerald-100 mb-8 max-w-lg mx-auto">
              Зарегистрируйтесь и получите персональный план питания уже сегодня
            </p>
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-3.5 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
              >
                Создать аккаунт
                <HiOutlineArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
