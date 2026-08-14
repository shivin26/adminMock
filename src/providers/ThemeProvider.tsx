import React, { useState, useEffect, useCallback } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import type { ThemeMode } from '../types/theme.types';
import { storage } from '../utils/storage.utils';

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'dark',
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(
    () => (storage.getTheme() as ThemeMode) || defaultTheme
  );

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  const updateDOMTheme = useCallback((mode: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    let activeMode: 'light' | 'dark' = 'dark';
    if (theme === 'system') {
      activeMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      activeMode = theme;
    }

    setResolvedTheme(activeMode);
    updateDOMTheme(activeMode);
    storage.setTheme(activeMode);
  }, [theme, updateDOMTheme]);


  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
