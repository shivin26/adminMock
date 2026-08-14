export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
}

export interface ThemeContextValue extends ThemeState {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}
