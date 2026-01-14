import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 
  | 'moonlight' 
  | 'sakura-night' 
  | 'midnight-ocean' 
  | 'dragon-ember' 
  | 'celestial-void' 
  | 'sunrise-bloom'
  | 'snowfall-white';

interface Theme {
  id: ThemeName;
  name: string;
  icon: string;
  type: 'dark' | 'light' | 'special';
}

export const themes: Theme[] = [
  { id: 'moonlight', name: 'Moonlight', icon: '🌙', type: 'dark' },
  { id: 'sakura-night', name: 'Sakura Night', icon: '🌸', type: 'dark' },
  { id: 'midnight-ocean', name: 'Midnight Ocean', icon: '🌊', type: 'dark' },
  { id: 'dragon-ember', name: 'Dragon Ember', icon: '🔥', type: 'dark' },
  { id: 'celestial-void', name: 'Celestial Void', icon: '✨', type: 'dark' },
  { id: 'sunrise-bloom', name: 'Sunrise Bloom', icon: '🌅', type: 'light' },
  { id: 'snowfall-white', name: 'Snowfall White', icon: '❄️', type: 'light' },
];

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: Theme[];
  currentTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('moonlight');

  useEffect(() => {
    const saved = localStorage.getItem('anicrew-theme') as ThemeName;
    if (saved && themes.find(t => t.id === saved)) {
      setThemeState(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('anicrew-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
  };

  const currentTheme = themes.find(t => t.id === theme) || themes[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
