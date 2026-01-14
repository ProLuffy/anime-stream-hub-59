import React from 'react';
import { motion } from 'framer-motion';
import { Palette, User, Bell, Shield, CreditCard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useTheme, themes } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, isLoggedIn, isPremium, logout } = useAuth();

  const darkThemes = themes.filter(t => t.type === 'dark');
  const lightThemes = themes.filter(t => t.type === 'light');

  return (
    <div className="min-h-screen theme-transition">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-8"
          >
            Settings
          </motion.h1>

          <div className="space-y-6">
            {/* Theme Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Appearance</h2>
              </div>

              {/* Dark Themes */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Dark Themes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {darkThemes.map(t => (
                    <motion.button
                      key={t.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTheme(t.id)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        theme === t.id
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-secondary/50 border-2 border-transparent hover:border-primary/30'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{t.icon}</span>
                      <span className="text-sm font-medium">{t.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Light Themes */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Light Themes</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {lightThemes.map(t => (
                    <motion.button
                      key={t.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTheme(t.id)}
                      className={`p-4 rounded-xl text-center transition-all ${
                        theme === t.id
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-secondary/50 border-2 border-transparent hover:border-primary/30'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{t.icon}</span>
                      <span className="text-sm font-medium">{t.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Account Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Account</h2>
              </div>

              {isLoggedIn ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
                    <img
                      src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{user?.username}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                      {isPremium && (
                        <span className="premium-badge mt-2">Premium Member</span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <button className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left">
                      <Bell className="w-5 h-5" />
                      <span>Notifications</span>
                    </button>
                    <button className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left">
                      <Shield className="w-5 h-5" />
                      <span>Privacy & Security</span>
                    </button>
                    {!isPremium && (
                      <Link
                        to="/premium"
                        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20 hover:from-yellow-500/30 hover:to-amber-500/30 border border-yellow-500/30 transition-colors text-left"
                      >
                        <CreditCard className="w-5 h-5 text-yellow-500" />
                        <div>
                          <span className="font-medium">Upgrade to Premium</span>
                          <p className="text-sm text-muted-foreground">Unlock downloads & ad-free viewing</p>
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Login to manage your account</p>
                  <Link to="/login" className="btn-hero inline-flex">
                    <span className="relative z-10">Login</span>
                  </Link>
                </div>
              )}
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}
