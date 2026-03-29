import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  hover = true,
  delay = 0,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={`
        bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg
        border border-white/50
        transition-shadow duration-300
        hover:shadow-xl
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
