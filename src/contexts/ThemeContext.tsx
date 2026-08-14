import { createContext } from 'react';
import type { ThemeContextValue } from '../types/theme.types';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
