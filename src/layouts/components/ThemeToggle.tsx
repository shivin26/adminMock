import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      aria-label="Toggle theme"
      title={`Current theme: ${theme}. Click to change.`}
    >
      {theme === 'light' && <Sun className="h-4 w-4 text-amber-500" />}
      {theme === 'dark' && <Moon className="h-4 w-4 text-blue-400" />}
      {theme === 'system' && <Laptop className="h-4 w-4 text-slate-400" />}
    </Button>
  );
};
