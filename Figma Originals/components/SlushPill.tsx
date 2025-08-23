import { DollarSign } from 'lucide-react';

interface SlushPillProps {
  amount: number;
  className?: string;
}

export function SlushPill({ amount, className = "" }: SlushPillProps) {
  const isPositive = amount >= 0;
  const isZero = amount === 0;

  return (
    <div className={`inline-flex items-center px-4 py-3 rounded-2xl ${
      isZero 
        ? 'bg-gray-50 border border-gray-100' 
        : isPositive 
          ? 'bg-green-50 border border-green-100' 
          : 'bg-red-50 border border-red-100'
    } ${className}`}>
      <div className={`w-8 h-8 rounded-xl mr-3 flex items-center justify-center ${
        isZero 
          ? 'bg-gray-100' 
          : isPositive 
            ? 'gradient-success' 
            : 'bg-red-100'
      }`}>
        <DollarSign className={`w-4 h-4 ${
          isZero 
            ? 'text-gray-500' 
            : isPositive 
              ? 'text-white' 
              : 'text-red-500'
        }`} />
      </div>
      <div className="flex flex-col">
        <span className={`text-lg font-semibold text-currency ${
          isZero 
            ? 'text-gray-500' 
            : isPositive 
              ? 'text-green-600' 
              : 'text-red-600'
        }`}>
          Period Slush
        </span>
        <span className={`text-sm font-medium ${
          isZero 
            ? 'text-gray-400' 
            : isPositive 
              ? 'text-green-500' 
              : 'text-red-500'
        }`}>
          {isPositive ? '+' : ''}${amount.toFixed(0)}
        </span>
      </div>
    </div>
  );
}