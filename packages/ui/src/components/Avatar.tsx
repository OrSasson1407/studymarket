import React from 'react';
import { cn } from '../utils/cn';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' };

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const initials = name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={cn('rounded-full bg-[#1C6E8F]/10 text-[#1C6E8F] font-bold flex items-center justify-center shrink-0', sizeMap[size], className)}>
      {initials}
    </div>
  );
}
