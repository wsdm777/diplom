import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

export default function StatCard({
  title,
  value,
  suffix = '',
  prefix = '',
  icon: Icon,
  color = 'emerald',
  delay = 0,
  decimals = 0,
  children,
}) {
  const colors = {
    emerald: {
      bg: 'from-emerald-500 to-teal-600',
      light: 'bg-emerald-50',
      text: 'text-emerald-700',
      icon: 'text-emerald-500',
    },
    blue: {
      bg: 'from-blue-500 to-indigo-600',
      light: 'bg-blue-50',
      text: 'text-blue-700',
      icon: 'text-blue-500',
    },
    orange: {
      bg: 'from-orange-500 to-amber-600',
      light: 'bg-orange-50',
      text: 'text-orange-700',
      icon: 'text-orange-500',
    },
    purple: {
      bg: 'from-purple-500 to-violet-600',
      light: 'bg-purple-50',
      text: 'text-purple-700',
      icon: 'text-purple-500',
    },
    rose: {
      bg: 'from-rose-500 to-pink-600',
      light: 'bg-rose-50',
      text: 'text-rose-700',
      icon: 'text-rose-500',
    },
  };

  const c = colors[color] || colors.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-5 relative overflow-hidden group"
    >
      {/* Background decoration */}
      <div className={`absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br ${c.bg} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className={`text-2xl font-bold ${c.text}`}>
            {typeof value === 'number' ? (
              <AnimatedNumber value={value} suffix={suffix} prefix={prefix} decimals={decimals} />
            ) : (
              <>{prefix}{value}{suffix}</>
            )}
          </p>
          {children}
        </div>
        {Icon && (
          <div className={`${c.light} p-2.5 rounded-xl`}>
            <Icon className={`w-5 h-5 ${c.icon}`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
