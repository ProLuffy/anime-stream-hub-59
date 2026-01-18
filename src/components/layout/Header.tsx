import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, User, Settings, LogOut, Crown, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme, themes, darkThemes, specialThemes } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import SearchModalLive from '@/components/search/SearchModalLive';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function Header() {
  const { theme, setTheme, currentTheme } = useTheme();
  const { user, isLoggedIn, isPremium, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Show 3 dark + 3 special themes in quick picker
  const quickThemes = [...darkThemes.slice(0, 3), ...specialThemes.slice(0, 3)];

  return (
    <>
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 glass theme-transition"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <motion.div 
                className="text-2xl md:text-3xl font-bold text-glow"
                whileHover={{ scale: 1.05 }}
              >
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AniCrew
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/anime">Anime</NavLink>
              <NavLink to="/donghua">Donghua</NavLink>
              <NavLink to="/watchlist">Watchlist</NavLink>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <Search className="w-5 h-5" />
              </motion.button>

              {/* Theme Switcher */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="p-2.5 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-lg"
                >
                  {currentTheme.icon}
                </motion.button>
                
                <AnimatePresence>
                  {themeMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 glass-card p-2 min-w-[180px]"
                    >
                      {quickThemes.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => { setTheme(t.id); setThemeMenuOpen(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                            theme === t.id ? 'bg-primary/20 text-primary' : 'hover:bg-secondary'
                          }`}
                        >
                          <span className="text-lg">{t.icon}</span>
                          <span className="text-sm font-medium">{t.name}</span>
                        </button>
                      ))}
                      <div className="border-t border-border mt-2 pt-2">
                        <Link
                          to="/settings"
                          onClick={() => setThemeMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm font-medium">All Themes</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notifications */}
              {isLoggedIn && <NotificationBell />}

              {/* User Menu */}
              {isLoggedIn ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2"
                  >
                    <div className="relative">
                      <img
                        src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt="Avatar"
                        className="w-9 h-9 rounded-full border-2 border-primary/50"
                      />
                      {isPremium && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                          <Crown className="w-2.5 h-2.5 text-amber-900" />
                        </div>
                      )}
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 glass-card p-2 min-w-[200px]"
                      >
                        <div className="px-3 py-2 border-b border-border mb-2">
                          <p className="font-semibold">{user?.username}</p>
                          <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm">Profile</span>
                        </Link>
                        {isPremium && (
                          <Link
                            to="/downloads"
                            onClick={() => setProfileOpen(false)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            <span className="text-sm">Downloads</span>
                          </Link>
                        )}
                        <Link
                          to="/settings"
                          onClick={() => setProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="text-sm">Settings</span>
                        </Link>
                        <button
                          onClick={() => { logout(); setProfileOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span className="text-sm">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="btn-ghost hidden md:flex"
                >
                  Login
                </motion.button>
              )}

              {/* Mobile Menu Toggle */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-full bg-secondary/50"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
                <MobileNavLink to="/" onClick={() => setMobileMenuOpen(false)}>Home</MobileNavLink>
                <MobileNavLink to="/anime" onClick={() => setMobileMenuOpen(false)}>Anime</MobileNavLink>
                <MobileNavLink to="/donghua" onClick={() => setMobileMenuOpen(false)}>Donghua</MobileNavLink>
                <MobileNavLink to="/watchlist" onClick={() => setMobileMenuOpen(false)}>Watchlist</MobileNavLink>
                {!isLoggedIn && (
                  <MobileNavLink to="/login" onClick={() => setMobileMenuOpen(false)}>Login</MobileNavLink>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <SearchModalLive isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );
}
