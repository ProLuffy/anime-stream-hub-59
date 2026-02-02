import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Crown, BarChart3, Settings, Shield, Trash2, 
  Search, Filter, ChevronDown, Eye, Ban, Check, X,
  TrendingUp, Activity, Clock, AlertTriangle, Plus,
  Power, Film, Tv, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AnimatedStatCard from '@/components/admin/AnimatedStatCard';
import UserManagementModal from '@/components/admin/UserManagementModal';
import AddEpisodeModal from '@/components/admin/AddEpisodeModal';
import ThumbnailStudio from '@/components/admin/ThumbnailStudio';

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  status?: string;
  isPremium: boolean;
  createdAt: number;
  watchHistory: any[];
  watchlist: string[];
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isOwner, getAllUsers, stopUser, activateUser, deleteUser: deleteUserAction } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Modal states
  const [userManagementAction, setUserManagementAction] = useState<'addAdmin' | 'addPremium' | 'removeAdmin' | 'removePremium' | 'stopUser' | 'deleteUser' | null>(null);
  const [showAddEpisode, setShowAddEpisode] = useState(false);
  const [showThumbnailStudio, setShowThumbnailStudio] = useState(false);
  
  // Live stats
  const [liveViews, setLiveViews] = useState(0);

  // Check admin access
  if (!isAdmin) {
    return (
      <div className="min-h-screen theme-transition">
        <Header />
        <main className="pt-24 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </motion.div>
        </main>
      </div>
    );
  }

  // Get all users from localStorage
  const allUsers: UserData[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('anicrew-users') || '[]');
    } catch {
      return [];
    }
  }, [userManagementAction]); // Refresh when modal closes

  // Simulate live views
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViews(Math.floor(Math.random() * 500) + 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || 
                         (roleFilter === 'premium' && u.isPremium) ||
                         (roleFilter === 'admin' && (u.role === 'admin' || u.role === 'owner')) ||
                         (roleFilter === 'stopped' && u.status === 'stopped') ||
                         (roleFilter === 'user' && !u.isPremium && u.role === 'user');
      return matchesSearch && matchesRole;
    });
  }, [allUsers, searchQuery, roleFilter]);

  // Stats
  const stats = {
    totalUsers: allUsers.length,
    loggedInUsers: allUsers.filter(u => u.status !== 'stopped').length,
    guestUsers: Math.floor(Math.random() * 200) + 50,
    liveViews,
    totalAnime: 15000,
    totalDonghua: 2500,
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'content', label: 'Content', icon: Film },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen theme-transition bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-500" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                {isOwner ? 'Owner Access - Full Control' : 'Admin Access'}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddEpisode(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Episode
              </button>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 hover:bg-secondary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <AnimatedStatCard
                  label="Total Users"
                  value={stats.totalUsers}
                  icon={Users}
                  color="text-blue-500"
                  bgColor="bg-blue-500/20"
                  change="+12%"
                />
                <AnimatedStatCard
                  label="Logged In"
                  value={stats.loggedInUsers}
                  icon={Check}
                  color="text-green-500"
                  bgColor="bg-green-500/20"
                  change="+8%"
                />
                <AnimatedStatCard
                  label="Guests"
                  value={stats.guestUsers}
                  icon={Eye}
                  color="text-purple-500"
                  bgColor="bg-purple-500/20"
                />
                <AnimatedStatCard
                  label="Live Views"
                  value={stats.liveViews}
                  icon={Activity}
                  color="text-red-500"
                  bgColor="bg-red-500/20"
                  isLive
                />
                <AnimatedStatCard
                  label="Total Anime"
                  value={stats.totalAnime}
                  icon={Tv}
                  color="text-orange-500"
                  bgColor="bg-orange-500/20"
                />
                <AnimatedStatCard
                  label="Total Donghua"
                  value={stats.totalDonghua}
                  icon={Film}
                  color="text-pink-500"
                  bgColor="bg-pink-500/20"
                />
              </div>

              {/* Owner-Only Controls */}
              {isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card p-6"
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-500" />
                    Owner Controls
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <button
                      onClick={() => setUserManagementAction('addAdmin')}
                      className="p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors text-center"
                    >
                      <Shield className="w-6 h-6 mx-auto mb-2 text-red-500" />
                      <p className="text-sm font-medium">Add Admin</p>
                    </button>
                    <button
                      onClick={() => setUserManagementAction('addPremium')}
                      className="p-4 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors text-center"
                    >
                      <Crown className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                      <p className="text-sm font-medium">Add Premium</p>
                    </button>
                    <button
                      onClick={() => setUserManagementAction('removeAdmin')}
                      className="p-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors text-center"
                    >
                      <Shield className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                      <p className="text-sm font-medium">Remove Admin</p>
                    </button>
                    <button
                      onClick={() => setUserManagementAction('removePremium')}
                      className="p-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-colors text-center"
                    >
                      <Crown className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                      <p className="text-sm font-medium">Remove Premium</p>
                    </button>
                    <button
                      onClick={() => setUserManagementAction('stopUser')}
                      className="p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors text-center"
                    >
                      <Power className="w-6 h-6 mx-auto mb-2 text-red-500" />
                      <p className="text-sm font-medium">Stop User</p>
                    </button>
                    <button
                      onClick={() => setUserManagementAction('deleteUser')}
                      className="p-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors text-center"
                    >
                      <Trash2 className="w-6 h-6 mx-auto mb-2 text-destructive" />
                      <p className="text-sm font-medium">Delete User</p>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Recent Users */}
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Signups
                </h3>
                <div className="space-y-3">
                  {allUsers.slice(0, 5).map((u, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30">
                      <img src={u.avatar} alt="" className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <p className="font-medium">{u.username}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {u.role === 'admin' && (
                          <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">Admin</span>
                        )}
                        {u.role === 'owner' && (
                          <span className="px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">Owner</span>
                        )}
                        {u.isPremium && (
                          <span className="premium-badge text-xs py-0.5">Premium</span>
                        )}
                        {u.status === 'stopped' && (
                          <span className="px-2 py-0.5 text-xs rounded bg-gray-500/20 text-gray-400">Stopped</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary outline-none"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-3 rounded-xl bg-secondary outline-none"
                >
                  <option value="all">All Users</option>
                  <option value="admin">Admins</option>
                  <option value="premium">Premium</option>
                  <option value="user">Regular Users</option>
                  <option value="stopped">Stopped</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-muted-foreground">Joined</th>
                        {isOwner && <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={u.avatar} alt="" className="w-10 h-10 rounded-full" />
                              <div>
                                <p className="font-medium">{u.username}</p>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              u.role === 'owner'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : u.role === 'admin' 
                                  ? 'bg-red-500/20 text-red-400' 
                                  : 'bg-secondary text-muted-foreground'
                            }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {u.isPremium && (
                                <span className="premium-badge text-xs py-0.5">Premium</span>
                              )}
                              {u.status === 'stopped' ? (
                                <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">Stopped</span>
                              ) : (
                                <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400">Active</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          {isOwner && (
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                {u.status === 'stopped' ? (
                                  <button
                                    onClick={() => {
                                      activateUser(u.id);
                                      toast.success(`${u.username} activated`);
                                    }}
                                    className="p-2 rounded-lg hover:bg-green-500/20 transition-colors"
                                    title="Activate User"
                                  >
                                    <Check className="w-4 h-4 text-green-500" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      stopUser(u.id);
                                      toast.success(`${u.username} stopped`);
                                    }}
                                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                    title="Stop User"
                                  >
                                    <Power className="w-4 h-4 text-red-500" />
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete ${u.username}?`)) {
                                      deleteUserAction(u.id);
                                      toast.success('User deleted');
                                    }
                                  }}
                                  className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Film className="w-5 h-5 text-primary" />
                  Content Management
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowAddEpisode(true)}
                    className="p-6 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
                  >
                    <Plus className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-bold text-lg">Add Episode</h4>
                    <p className="text-sm text-muted-foreground">
                      Add custom episodes with audio and subtitles
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setShowThumbnailStudio(true)}
                    className="p-6 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
                  >
                    <ImageIcon className="w-8 h-8 text-blue-500 mb-3" />
                    <h4 className="font-bold text-lg">Thumbnail Studio</h4>
                    <p className="text-sm text-muted-foreground">
                      Create custom thumbnails with layers and effects
                    </p>
                  </button>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">API Source</h3>
                <p className="text-muted-foreground">
                  Content is fetched from: <code className="px-2 py-1 bg-secondary rounded">hianime-api-seven-teal.vercel.app</code>
                </p>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl space-y-6"
            >
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">API Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">API Base URL</label>
                    <input
                      type="text"
                      value="https://hianime-api-seven-teal.vercel.app"
                      disabled
                      className="w-full mt-1 px-4 py-2 rounded-lg bg-secondary/50 text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Custom Backend URL</label>
                    <input
                      type="text"
                      value="https://api.yourdomain.com"
                      disabled
                      className="w-full mt-1 px-4 py-2 rounded-lg bg-secondary/50 text-muted-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Site Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Maintenance Mode</span>
                    <button className="w-12 h-6 rounded-full bg-muted transition-colors">
                      <div className="w-5 h-5 rounded-full bg-white translate-x-0.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Allow New Registrations</span>
                    <button className="w-12 h-6 rounded-full bg-primary transition-colors">
                      <div className="w-5 h-5 rounded-full bg-white translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Modals */}
      <UserManagementModal
        isOpen={!!userManagementAction}
        onClose={() => setUserManagementAction(null)}
        action={userManagementAction}
      />
      
      <AddEpisodeModal
        isOpen={showAddEpisode}
        onClose={() => setShowAddEpisode(false)}
        onOpenThumbnailStudio={() => {
          setShowAddEpisode(false);
          setShowThumbnailStudio(true);
        }}
      />
      
      <ThumbnailStudio
        isOpen={showThumbnailStudio}
        onClose={() => setShowThumbnailStudio(false)}
        onSave={(data) => {
          console.log('Thumbnail saved:', data);
          setShowThumbnailStudio(false);
        }}
      />
    </div>
  );
}
