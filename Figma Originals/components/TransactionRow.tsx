import { motion } from 'motion/react';
import { Badge } from './ui/badge';

interface Transaction {
  id: number;
  date: string;
  merchant: string;
  amount: number;
  tag: 'spend' | 'bill' | 'ignored';
}

interface TransactionRowProps {
  transaction: Transaction;
  isNew?: boolean;
}

export function TransactionRow({ transaction, isNew = false }: TransactionRowProps) {
  const { date, merchant, amount, tag } = transaction;
  const isNegative = amount < 0;
  const displayAmount = Math.abs(amount);
  
  const getTagVariant = (tag: string) => {
    switch (tag) {
      case 'bill': return 'secondary';
      case 'ignored': return 'outline';
      default: return 'default';
    }
  };

  const getTagLabel = (tag: string) => {
    switch (tag) {
      case 'bill': return 'Bill';
      case 'ignored': return 'Ignored';
      default: return null;
    }
  };

  const rowOpacity = tag === 'bill' || tag === 'ignored' ? 'opacity-60' : 'opacity-100';

  const component = (
    <div className={`flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 touch-target ${rowOpacity}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-base font-medium truncate">{merchant}</h4>
          {getTagLabel(tag) && (
            <Badge variant={getTagVariant(tag)} className="text-xs">
              {getTagLabel(tag)}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
      </div>
      <div className="text-right">
        <span className={`text-lg font-semibold text-currency ${
          isNegative ? 'text-danger' : 'text-success'
        }`}>
          {isNegative ? '-' : '+'}${displayAmount.toFixed(2)}
        </span>
      </div>
    </div>
  );

  if (isNew) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20, height: 0 }}
        animate={{ opacity: 1, x: 0, height: 'auto' }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {component}
      </motion.div>
    );
  }

  return component;
}