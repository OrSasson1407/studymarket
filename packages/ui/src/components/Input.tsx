import React from 'react';
import { cn } from '../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">{leftIcon}</span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-800',
            'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1C6E8F]/30 focus:border-[#1C6E8F]',
            'disabled:opacity-50 transition-all duration-150',
            leftIcon && 'pl-9',
            error && 'border-red-400 focus:ring-red-300',
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';
