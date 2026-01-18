import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 
  // Light Themes (12)
  | 'moonlight' 
  | 'sakura-snow'
  | 'cloud-white'
  | 'ivory-sky'
  | 'soft-pastel'
  | 'vanilla-cream'
  | 'morning-bloom'
  | 'paper-white'
  | 'sunrise-tokyo'
  | 'light-otaku'
  | 'peach-blossom'
  | 'cotton-candy'
  // Dark Themes (16)
  | 'midnight-sakura'
  | 'obsidian-night'
  | 'phantom-black'
  | 'neon-tokyo'
  | 'crimson-void'
  | 'dark-otaku'
  | 'cyber-shinobi'
  | 'shadow-realm'
  | 'eclipse-blue'
  | 'oni-darkness'
  | 'void-purple'
  | 'noir-anime'
  | 'akatsuki-night'
  | 'zen-black'
  | 'misty-midnight'
  | 'nebula-nights'
  // Special Animated Themes (8)
  | 'solar-flare'
  | 'vaporwave-neon'
  | 'retro-anime'
  | 'glassmorphism'
  | 'studio-ghibli'
  | 'monochrome-pro'
  | 'space-odyssey'
  | 'lunar-eclipse';

interface Theme {
  id: ThemeName;
  name: string;
  icon: string;
  type: 'light' | 'dark' | 'special';
}

// Light Themes (12)
const lightThemes: Theme[] = [
  { id: 'moonlight', name: 'Moonlight', icon: '🌙', type: 'light' },
  { id: 'sakura-snow', name: 'Sakura Snow', icon: '🌸', type: 'light' },
  { id: 'cloud-white', name: 'Cloud White', icon: '☁️', type: 'light' },
  { id: 'ivory-sky', name: 'Ivory Sky', icon: '🕊️', type: 'light' },
  { id: 'soft-pastel', name: 'Soft Pastel', icon: '🎨', type: 'light' },
  { id: 'vanilla-cream', name: 'Vanilla Cream', icon: '🍦', type: 'light' },
  { id: 'morning-bloom', name: 'Morning Bloom', icon: '🌷', type: 'light' },
  { id: 'paper-white', name: 'Paper White', icon: '📄', type: 'light' },
  { id: 'sunrise-tokyo', name: 'Sunrise Tokyo', icon: '🌅', type: 'light' },
  { id: 'light-otaku', name: 'Light Otaku', icon: '📺', type: 'light' },
  { id: 'peach-blossom', name: 'Peach Blossom', icon: '🍑', type: 'light' },
  { id: 'cotton-candy', name: 'Cotton Candy', icon: '🍭', type: 'light' },
];

// Dark Themes (16)
const darkThemes: Theme[] = [
  { id: 'midnight-sakura', name: 'Midnight Sakura', icon: '🌸', type: 'dark' },
  { id: 'obsidian-night', name: 'Obsidian Night', icon: '🖤', type: 'dark' },
  { id: 'phantom-black', name: 'Phantom Black', icon: '👻', type: 'dark' },
  { id: 'neon-tokyo', name: 'Neon Tokyo', icon: '🌃', type: 'dark' },
  { id: 'crimson-void', name: 'Crimson Void', icon: '🩸', type: 'dark' },
  { id: 'dark-otaku', name: 'Dark Otaku', icon: '🎮', type: 'dark' },
  { id: 'cyber-shinobi', name: 'Cyber Shinobi', icon: '🥷', type: 'dark' },
  { id: 'shadow-realm', name: 'Shadow Realm', icon: '⚫', type: 'dark' },
  { id: 'eclipse-blue', name: 'Eclipse Blue', icon: '🌑', type: 'dark' },
  { id: 'oni-darkness', name: 'Oni Darkness', icon: '👹', type: 'dark' },
  { id: 'void-purple', name: 'Void Purple', icon: '💜', type: 'dark' },
  { id: 'noir-anime', name: 'Noir Anime', icon: '🎬', type: 'dark' },
  { id: 'akatsuki-night', name: 'Akatsuki Night', icon: '☁️', type: 'dark' },
  { id: 'zen-black', name: 'Zen Black', icon: '🧘', type: 'dark' },
  { id: 'misty-midnight', name: 'Misty Midnight', icon: '🌫️', type: 'dark' },
  { id: 'nebula-nights', name: 'Nebula Nights', icon: '🌌', type: 'dark' },
];

// Special Animated Themes (8)
const specialThemes: Theme[] = [
  { id: 'solar-flare', name: 'Solar Flare', icon: '☀️', type: 'special' },
  { id: 'vaporwave-neon', name: 'Vaporwave Neon', icon: '🌈', type: 'special' },
  { id: 'retro-anime', name: 'Retro Anime', icon: '📼', type: 'special' },
  { id: 'glassmorphism', name: 'Glassmorphism', icon: '🔮', type: 'special' },
  { id: 'studio-ghibli', name: 'Studio Ghibli', icon: '🌿', type: 'special' },
  { id: 'monochrome-pro', name: 'Monochrome Pro', icon: '⬛', type: 'special' },
  { id: 'space-odyssey', name: 'Space Odyssey', icon: '🚀', type: 'special' },
  { id: 'lunar-eclipse', name: 'Lunar Eclipse', icon: '🌒', type: 'special' },
];

export const themes: Theme[] = [...lightThemes, ...darkThemes, ...specialThemes];
export { lightThemes, darkThemes, specialThemes };

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: Theme[];
  lightThemes: Theme[];
  darkThemes: Theme[];
  specialThemes: Theme[];
  currentTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('midnight-sakura');

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
    <ThemeContext.Provider value={{ theme, setTheme, themes, lightThemes, darkThemes, specialThemes, currentTheme }}>
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
