import React from 'react';
import { cn } from '../utils/cn';

type Color = 'blue' | 'green' | 'amber' | 'red' | 'stone';

interface BadgeProps {
  children: React.ReactNode;
  color?: Color;
  className?: string;
}

const colorMap: Record<Color, string> = {
  blue:  'bg-[#eef2ff] text-[#1c6e8f] border-[#d2d6f7]',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red:   'bg-red-50 text-red-600 border-red-200',
  stone: 'bg-stone-50 text-stone-600 border-stone-200',
};

export function Badge({ children, color = 'stone', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border', colorMap[color], className)}>
      {children}
    </span>
  );
}
