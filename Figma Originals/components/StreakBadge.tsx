import { Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface StreakBadgeProps {
  count: number;
  type: 'blue' | 'orange';
  label?: string;
  className?: string;
}

export function StreakBadge({ count, type, label, className = "" }: StreakBadgeProps) {
  const isBlue = type === 'blue';
  
  return (
    <motion.div 
      className={`inline-flex items-center px-4 py-3 rounded-2xl ${
        isBlue 
          ? 'bg-blue-50 border border-blue-100' 
          : 'bg-orange-50 border border-orange-100'
      } ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`w-8 h-8 rounded-xl mr-3 flex items-center justify-center ${
        isBlue ? 'gradient-blue' : 'gradient-orange'
      }`}>
        <Flame 
          className="w-4 h-4 text-white"
          fill="currentColor"
        />
      </div>
      <div className="flex flex-col">
        <motion.span 
          className={`text-2xl font-bold text-currency ${
            isBlue ? 'text-blue-600' : 'text-orange-600'
          }`}
          key={count}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {count}
        </motion.span>
        {label && (
          <span className={`text-xs font-medium ${
            isBlue ? 'text-blue-500' : 'text-orange-500'
          }`}>
            {label}
          </span>
        )}
      </div>
    </motion.div>
  );
}