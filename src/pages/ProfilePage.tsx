import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Edit3, Crown, Star, Shield, Bell, Check, X, 
  Upload, Sparkles, Trophy, Download, Bookmark, Clock, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isPremium, updateProfile } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const badgeInputRef = useRef<HTMLInputElement>(null);

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        updateProfile({ avatar: event.target?.result as string });
        toast.success('Profile picture updated!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBadgeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPremium) {
      toast.error('Premium membership required for custom badges');
      return;
    }
    
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Badge must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        updateProfile({ customBadge: event.target?.result as string });
        toast.success('Custom badge added! 🎉');
        setShowBadgeModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsernameSubmit = () => {
    if (newUsername.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (newUsername.length > 20) {
      toast.error('Username must be 20 characters or less');
      return;
    }
    
    updateProfile({ username: newUsername });
    setIsEditingName(false);
    toast.success('Username updated!');
  };

  const presetBadges = [
    { emoji: '👑', name: 'Crown' },
    { emoji: '⭐', name: 'Star' },
    { emoji: '🔥', name: 'Fire' },
    { emoji: '💎', name: 'Diamond' },
    { emoji: '🌸', name: 'Sakura' },
    { emoji: '⚡', name: 'Lightning' },
    { emoji: '🎌', name: 'Flag' },
    { emoji: '🌙', name: 'Moon' },
    { emoji: '🦊', name: 'Fox' },
    { emoji: '🐉', name: 'Dragon' },
  ];

  const stats = [
    { icon: Bookmark, label: 'Watchlist', value: user?.watchlist?.length || 0, color: 'text-blue-400' },
    { icon: Clock, label: 'Watch History', value: user?.watchHistory?.length || 0, color: 'text-purple-400' },
    { icon: Download, label: 'Downloads', value: isPremium ? 'Unlimited' : '0', color: 'text-green-400' },
    { icon: Trophy, label: 'Episodes Watched', value: user?.watchHistory?.length || 0, color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen theme-transition">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar with edit */}
              <div className="relative group">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
                  isPremium 
                    ? 'border-yellow-500 shadow-[0_0_20px_hsl(45_100%_50%/0.4)]' 
                    : 'border-primary'
                }`}>
                  <img
                    src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-primary text-primary-foreground 
                           hover:scale-110 transition-transform shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                
                {/* Premium Glow Ring */}
                {isPremium && (
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 opacity-30 blur-md animate-pulse-glow -z-10" />
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  {/* Username with edit */}
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-secondary text-lg font-bold outline-none border-2 border-primary"
                        autoFocus
                      />
                      <button onClick={handleUsernameSubmit} className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setIsEditingName(false)} className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">{user?.username}</h1>
                      
                      {/* Custom Badge (Premium only) */}
                      {isPremium && user?.customBadge && (
                        <img 
                          src={user.customBadge} 
                          alt="badge" 
                          className="w-6 h-6 rounded object-cover"
                        />
                      )}
                      
                      {/* Emoji Badge (Premium only) */}
                      {isPremium && user?.emojiBadge && !user?.customBadge && (
                        <span className="text-xl">{user.emojiBadge}</span>
                      )}
                      
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </>
                  )}
                </div>

                <p className="text-muted-foreground mb-3">{user?.email}</p>

                <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                  {/* Premium Badge */}
                  {isPremium ? (
                    <span className="premium-badge">
                      <Crown className="w-3.5 h-3.5" />
                      Premium Member
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate('/premium')}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold 
                               bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30
                               hover:from-yellow-500/30 hover:to-amber-500/30 transition-all"
                    >
                      <Crown className="w-3.5 h-3.5 text-yellow-500" />
                      Upgrade to Premium
                    </button>
                  )}

                  {/* Role Badge */}
                  {user?.role === 'admin' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                      <Shield className="w-3.5 h-3.5" />
                      Admin
                    </span>
                  )}
                </div>

                {/* Add Custom Badge Button (Premium only) */}
                {isPremium && (
                  <button
                    onClick={() => setShowBadgeModal(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                             border border-purple-500/30 text-sm font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Add Badge Like Telegram
                  </button>
                )}
              </div>
            </div>
          </motion.section>

          {/* Stats Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="glass-card p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.section>

          {/* Premium Benefits */}
          {!isPremium && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 mb-8 border border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-amber-500/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold">Unlock Premium</h2>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  Download anime for offline viewing
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  Add custom badge/logo next to your name (like Telegram)
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  Ad-free streaming experience
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  Priority support & early access
                </li>
              </ul>
              <button
                onClick={() => navigate('/premium')}
                className="btn-hero w-full"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Get Premium Now
                </span>
              </button>
            </motion.section>
          )}

          {/* Notification Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <div className="space-y-4">
              {[
                { label: 'New Episode Releases', desc: 'Get notified when new episodes are available' },
                { label: 'Watchlist Updates', desc: 'Updates about anime in your watchlist' },
                { label: 'Weekly Recommendations', desc: 'Personalized anime suggestions' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full 
                                  peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 
                                  after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                                  after:transition-all"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      {/* Badge Selection Modal */}
      <AnimatePresence>
        {showBadgeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowBadgeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Choose Your Badge
              </h3>

              {/* Preset Emoji Badges */}
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-3">Select an emoji badge</p>
                <div className="grid grid-cols-5 gap-2">
                  {presetBadges.map((badge) => (
                    <button
                      key={badge.name}
                      onClick={() => {
                        updateProfile({ emojiBadge: badge.emoji, customBadge: undefined });
                        toast.success(`${badge.name} badge added!`);
                        setShowBadgeModal(false);
                      }}
                      className="p-3 text-2xl rounded-xl bg-secondary hover:bg-primary/20 hover:scale-110 transition-all"
                    >
                      {badge.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Upload */}
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-3">Or upload your own logo</p>
                <button
                  onClick={() => badgeInputRef.current?.click()}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-muted-foreground/30 
                           hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload Custom Logo
                </button>
                <input
                  ref={badgeInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBadgeUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Max 2MB • PNG, JPG, GIF
                </p>
              </div>

              {/* Remove Badge */}
              {(user?.customBadge || user?.emojiBadge) && (
                <button
                  onClick={() => {
                    updateProfile({ customBadge: undefined, emojiBadge: undefined });
                    toast.success('Badge removed');
                    setShowBadgeModal(false);
                  }}
                  className="w-full mt-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Remove Current Badge
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
