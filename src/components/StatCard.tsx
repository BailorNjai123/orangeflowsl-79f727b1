import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  onClick?: () => void;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, icon: Icon, color = 'text-primary', onClick }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl border bg-card p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl md:text-3xl font-extrabold">{value}</div>
      </motion.div>
    );
  }
);
StatCard.displayName = 'StatCard';

export default StatCard;
