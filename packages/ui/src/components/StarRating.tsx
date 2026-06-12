import React from 'react';
import { cn } from '../utils/cn';

interface StarRatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  className?: string;
}

export function StarRating({ value, max = 5, onChange, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i + 1)}
            className={cn('text-base leading-none transition-colors', filled ? 'text-amber-400' : 'text-stone-200', onChange && 'cursor-pointer hover:text-amber-500', !onChange && 'cursor-default')}
          >
            ?
          </button>
        );
      })}
    </div>
  );
}
