import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <motion.div
      className={cn(
        'bg-white rounded-2xl shadow-lg shadow-automotive-navy-900/10 p-6 border border-automotive-slate-100',
        hover && 'transition-all duration-300 hover:shadow-xl hover:shadow-automotive-navy-900/15 hover:-translate-y-1',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

export function GlassCard({ children, className }: CardProps) {
  return (
    <motion.div
      className={cn(
        'bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl shadow-automotive-navy-900/20 p-8 border border-white/20',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
