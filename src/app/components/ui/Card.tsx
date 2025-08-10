"use client";

import { ReactNode } from 'react';
import { useTheme } from '@/app/hooks/useTheme';
import { componentVariants, designTokens, getThemeClasses } from '@/app/lib/design-system';
import { cn } from '@/app/lib/utils';

interface CardProps {
  children: ReactNode;
  variant?: 'glass' | 'default';
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export function Card({ 
  children, 
  variant = 'glass', 
  className,
  padding = 'md',
  style
}: CardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardClasses = variant === 'glass'
    ? getThemeClasses(
        isDark,
        `${designTokens.effects.transitions.default} ${designTokens.borderRadius.lg} ${paddingClasses[padding]}`,
        componentVariants.card.glass.light,
        componentVariants.card.glass.dark
      )
    : `bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 ${designTokens.borderRadius.lg} ${paddingClasses[padding]}`;

  return (
    <div className={cn(cardClasses, className)} style={style}>
      {children}
    </div>
  );
} 