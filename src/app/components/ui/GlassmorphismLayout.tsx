"use client";

import { ReactNode } from 'react';
import { useTheme } from '@/app/hooks/useTheme';
import { cn } from '@/app/lib/utils';

interface GlassmorphismLayoutProps {
  children: ReactNode;
  className?: string;
  variant?: 'nav' | 'content' | 'full';
}

export function GlassmorphismLayout({ 
  children, 
  className,
  variant = 'content' 
}: GlassmorphismLayoutProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const layoutClasses = {
    nav: isDark 
      ? 'bg-dark-radial' 
      : 'bg-custom-radial',
    content: isDark
      ? 'bg-grand-dark'
      : 'bg-grand',
    full: isDark
      ? 'bg-dark-radial min-h-screen'
      : 'bg-custom-radial min-h-screen',
  };

  const containerClasses = {
    nav: 'max-w-full   relative',
    content: 'max-w-7xl mx-auto p-4',
    full: 'max-w-7xl mx-auto',
  };

  return (
    <div className={cn(layoutClasses[variant], className)}>
      <div className={cn(containerClasses[variant])}>
        {children}
      </div>
    </div>
  );
} 