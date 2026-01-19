import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'guest' | 'user' | 'premium' | 'admin' | 'owner';
export type UserStatus = 'active' | 'stopped';

const OWNER_EMAIL = 'landlassan5@gmail.com';

interface WatchHistoryItem {
  animeId: string;
  episodeId: string;
  progress: number;
  timestamp: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  isPremium: boolean;
  watchlist: string[];
  watchHistory: WatchHistoryItem[];
  createdAt: number;
  // Premium features
  customBadge?: string;
  emojiBadge?: string;
  premiumSince?: number;
  premiumPlan?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  addToWatchlist: (animeId: string) => void;
  removeFromWatchlist: (animeId: string) => void;
  isInWatchlist: (animeId: string) => boolean;
  updateWatchHistory: (animeId: string, episodeId: string, progress: number) => void;
  getWatchProgress: (animeId: string, episodeId: string) => number;
  // Admin functions
  getAllUsers: () => User[];
  addAdmin: (userId: string) => void;
  removeAdmin: (userId: string) => void;
  addPremium: (userId: string) => void;
  removePremium: (userId: string) => void;
  stopUser: (userId: string) => void;
  activateUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'anicrew-user';

// Generate random avatar
const generateAvatar = (seed: string) => 
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingUsers = JSON.parse(localStorage.getItem('anicrew-users') || '[]');
    const existingUser = existingUsers.find((u: User) => u.email === email);
    
    if (existingUser) {
      // Check if user is stopped
      if (existingUser.status === 'stopped') {
        throw new Error('Your account has been suspended. Contact support.');
      }
      setUser(existingUser);
    } else {
      // Create new user - check if owner email
      const isOwnerEmail = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
      const newUser: User = {
        id: crypto.randomUUID(),
        username: email.split('@')[0],
        email,
        avatar: generateAvatar(email),
        role: isOwnerEmail ? 'owner' : 'user',
        status: 'active',
        isPremium: isOwnerEmail,
        watchlist: [],
        watchHistory: [],
        createdAt: Date.now(),
      };
      setUser(newUser);
      
      existingUsers.push(newUser);
      localStorage.setItem('anicrew-users', JSON.stringify(existingUsers));
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingUsers = JSON.parse(localStorage.getItem('anicrew-users') || '[]');
    
    if (existingUsers.some((u: User) => u.email === email)) {
      throw new Error('Email already registered');
    }
    
    if (existingUsers.some((u: User) => u.username === username)) {
      throw new Error('Username already taken');
    }
    
    const isOwnerEmail = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      email,
      avatar: generateAvatar(username),
      role: isOwnerEmail ? 'owner' : 'user',
      status: 'active',
      isPremium: isOwnerEmail,
      watchlist: [],
      watchHistory: [],
      createdAt: Date.now(),
    };
    
    setUser(newUser);
    existingUsers.push(newUser);
    localStorage.setItem('anicrew-users', JSON.stringify(existingUsers));
  };

  const loginWithGoogle = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const googleUser: User = {
      id: crypto.randomUUID(),
      username: 'GoogleUser_' + Math.random().toString(36).slice(2, 8),
      email: 'user@gmail.com',
      avatar: generateAvatar('google-user'),
      role: 'user',
      status: 'active',
      isPremium: false,
      watchlist: [],
      watchHistory: [],
      createdAt: Date.now(),
    };
    
    setUser(googleUser);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      const existingUsers = JSON.parse(localStorage.getItem('anicrew-users') || '[]');
      const index = existingUsers.findIndex((u: User) => u.id === user.id);
      if (index >= 0) {
        existingUsers[index] = updatedUser;
        localStorage.setItem('anicrew-users', JSON.stringify(existingUsers));
      }
    }
  };

  const addToWatchlist = (animeId: string) => {
    if (user && !user.watchlist.includes(animeId)) {
      updateProfile({ watchlist: [...user.watchlist, animeId] });
    }
  };

  const removeFromWatchlist = (animeId: string) => {
    if (user) {
      updateProfile({ watchlist: user.watchlist.filter(id => id !== animeId) });
    }
  };

  const isInWatchlist = (animeId: string) => {
    return user?.watchlist.includes(animeId) || false;
  };

  const updateWatchHistory = (animeId: string, episodeId: string, progress: number) => {
    if (user) {
      const existing = user.watchHistory.find(
        h => h.animeId === animeId && h.episodeId === episodeId
      );
      
      let newHistory: WatchHistoryItem[];
      if (existing) {
        newHistory = user.watchHistory.map(h =>
          h.animeId === animeId && h.episodeId === episodeId
            ? { ...h, progress, timestamp: Date.now() }
            : h
        );
      } else {
        newHistory = [
          ...user.watchHistory,
          { animeId, episodeId, progress, timestamp: Date.now() }
        ];
      }
      
      updateProfile({ watchHistory: newHistory });
    }
  };

  const getWatchProgress = (animeId: string, episodeId: string) => {
    const item = user?.watchHistory.find(
      h => h.animeId === animeId && h.episodeId === episodeId
    );
    return item?.progress || 0;
  };

  // Admin functions
  const getAllUsers = (): User[] => {
    try {
      return JSON.parse(localStorage.getItem('anicrew-users') || '[]');
    } catch {
      return [];
    }
  };

  const updateUserInStorage = (userId: string, updates: Partial<User>) => {
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index >= 0) {
      users[index] = { ...users[index], ...updates };
      localStorage.setItem('anicrew-users', JSON.stringify(users));
      // Update current user if it's the same
      if (user?.id === userId) {
        setUser(users[index]);
      }
    }
  };

  const addAdmin = (userId: string) => {
    if (user?.role !== 'owner') return;
    updateUserInStorage(userId, { role: 'admin' });
  };

  const removeAdmin = (userId: string) => {
    if (user?.role !== 'owner') return;
    updateUserInStorage(userId, { role: 'user' });
  };

  const addPremium = (userId: string) => {
    if (user?.role !== 'owner' && user?.role !== 'admin') return;
    updateUserInStorage(userId, { isPremium: true, premiumSince: Date.now() });
  };

  const removePremium = (userId: string) => {
    if (user?.role !== 'owner' && user?.role !== 'admin') return;
    updateUserInStorage(userId, { isPremium: false, premiumSince: undefined });
  };

  const stopUser = (userId: string) => {
    if (user?.role !== 'owner') return;
    if (userId === user?.id) return; // Can't stop yourself
    updateUserInStorage(userId, { status: 'stopped' });
  };

  const activateUser = (userId: string) => {
    if (user?.role !== 'owner') return;
    updateUserInStorage(userId, { status: 'active' });
  };

  const deleteUser = (userId: string) => {
    if (user?.role !== 'owner' && user?.role !== 'admin') return;
    if (userId === user?.id) return; // Can't delete yourself
    
    const users = getAllUsers().filter(u => u.id !== userId);
    localStorage.setItem('anicrew-users', JSON.stringify(users));
  };

  // Calculate effective permissions (stopped users lose all special perms)
  const effectiveRole = user?.status === 'stopped' ? 'user' : user?.role;
  const effectivePremium = user?.status === 'stopped' ? false : (user?.isPremium || effectiveRole === 'premium' || effectiveRole === 'admin' || effectiveRole === 'owner');

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isPremium: effectivePremium,
    isAdmin: effectiveRole === 'admin' || effectiveRole === 'owner',
    isOwner: effectiveRole === 'owner',
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    updateWatchHistory,
    getWatchProgress,
    getAllUsers,
    addAdmin,
    removeAdmin,
    addPremium,
    removePremium,
    stopUser,
    activateUser,
    deleteUser,
  };

  if (isLoading) {
    return null;
  }

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
