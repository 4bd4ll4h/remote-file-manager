"use client";
import { useTheme } from '@/app/hooks/useTheme';
import { Button } from './ui/Button';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';


export const ThemeToggle = ({ className }: { className?: string }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button 
      variant="glass"
      onClick={toggleTheme}
      className={cn("p-2", className)}
    >
      {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
};
