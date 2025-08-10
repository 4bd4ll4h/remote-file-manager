"use client";

import { forwardRef, InputHTMLAttributes } from 'react';
import { useTheme } from '@/app/hooks/useTheme';
import { componentVariants, designTokens, getThemeClasses } from '@/app/lib/design-system';
import { cn } from '@/app/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'glass' | 'default';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, variant = 'glass', className, ...props }, ref) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const inputClasses = variant === 'glass' 
      ? getThemeClasses(
          isDark,
          `${designTokens.effects.transitions.fast} w-full ${designTokens.spacing.input} ${designTokens.borderRadius.sm} focus:outline-none focus:ring-2 focus:ring-purple-500/50`,
          componentVariants.input.glass.light,
          componentVariants.input.glass.dark
        )
      : 'w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(inputClasses, error && 'border-red-500 focus:ring-red-500/50', className)}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input'; 