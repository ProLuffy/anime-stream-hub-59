import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'guest' | 'user' | 'premium' | 'admin' | 'owner';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  isPremium: boolean;
  watchlist: string[];
  watchHistory: { animeId: string; episodeId: string; progress: number }[];
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo
const mockUser: User = {
  id: '1',
  username: 'AnimeWatcher',
  email: 'user@anicrew.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anime',
  role: 'user',
  isPremium: false,
  watchlist: [],
  watchHistory: [],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // Simulated login
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ ...mockUser, email });
  };

  const loginWithGoogle = async () => {
    // Simulated Google login
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isPremium: user?.isPremium || user?.role === 'premium' || user?.role === 'admin' || user?.role === 'owner',
    isAdmin: user?.role === 'admin' || user?.role === 'owner',
    login,
    loginWithGoogle,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
