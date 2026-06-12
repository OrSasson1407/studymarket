import React from 'react';
import { cn } from '../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className, onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white border border-stone-200 rounded-3xl p-5',
        hover && 'cursor-pointer transition-all duration-300 hover:shadow-md hover:border-stone-400',
        className,
      )}
    >
      {children}
    </div>
  );
}
