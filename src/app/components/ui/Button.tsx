"use client";

import { ReactNode } from 'react';
import { useTheme } from '@/app/hooks/useTheme';
import { componentVariants, designTokens, getThemeClasses } from '@/app/lib/design-system';
import { cn } from '@/app/lib/utils';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className,
  icon,
}: ButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const variantClasses = getThemeClasses(
    isDark,
    `${designTokens.effects.transitions.default} ${designTokens.effects.animations.scale.button} ${designTokens.borderRadius.md} font-medium`,
    componentVariants.button[variant].light,
    componentVariants.button[variant].dark
  );

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center justify-center gap-2',
        sizeClasses[size],
        variantClasses,
        disabledClasses,
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
} 