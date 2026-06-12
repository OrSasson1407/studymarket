'use client';
import React from 'react';
import { cn } from '../utils/cn';

interface ToastProps {
  message: string;
  className?: string;
}

export function Toast({ message, className }: ToastProps) {
  return (
    <div className={cn('bg-stone-900 text-stone-100 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-medium max-w-sm', className)}>
      {message}
    </div>
  );
}
