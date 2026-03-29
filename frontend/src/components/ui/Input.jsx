import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Input({
  label,
  error,
  icon: Icon,
  className = '',
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <motion.input
          animate={{
            borderColor: error ? '#ef4444' : focused ? '#10b981' : '#e5e7eb',
            boxShadow: focused
              ? '0 0 0 3px rgba(16, 185, 129, 0.1)'
              : '0 0 0 0px transparent',
          }}
          transition={{ duration: 0.2 }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full border rounded-xl px-4 py-2.5
            text-gray-800 placeholder-gray-400
            bg-white/80 backdrop-blur-sm
            outline-none transition-all duration-200
            ${Icon ? 'pl-10' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
