"use client";
import { useTheme } from '@/app/hooks/useTheme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className=" px-4 py-2 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white">
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
};
