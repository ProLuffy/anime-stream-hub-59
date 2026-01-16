import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Crown, BarChart3, Settings, Shield, Trash2, 
  Search, Filter, ChevronDown, Eye, Ban, Check, X,
  TrendingUp, Activity, Clock, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  isPremium: boolean;
  createdAt: number;
  watchHistory: any[];
  watchlist: string[];
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Check admin access
  if (!isAdmin) {
    return (
      <div className="min-h-screen theme-transition">
        <Header />
        <main className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
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
  }, []);

  // Filter users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      const matchesSearch = u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || 
                         (roleFilter === 'premium' && u.isPremium) ||
                         (roleFilter === 'admin' && (u.role === 'admin' || u.role === 'owner')) ||
                         (roleFilter === 'user' && !u.isPremium && u.role === 'user');
      return matchesSearch && matchesRole;
    });
  }, [allUsers, searchQuery, roleFilter]);

  // Stats
  const stats = {
    totalUsers: allUsers.length,
    premiumUsers: allUsers.filter(u => u.isPremium).length,
    activeToday: Math.floor(allUsers.length * 0.6), // Mock
    newThisWeek: Math.floor(allUsers.length * 0.3), // Mock
  };

  const updateUserRole = (userId: string, newRole: string, makePremium: boolean) => {
    const users = JSON.parse(localStorage.getItem('anicrew-users') || '[]');
    const idx = users.findIndex((u: any) => u.id === userId);
    if (idx >= 0) {
      users[idx].role = newRole;
      users[idx].isPremium = makePremium;
      localStorage.setItem('anicrew-users', JSON.stringify(users));
      toast.success(`User role updated to ${newRole}`);
    }
  };

  const deleteUser = (userId: string) => {
    if (userId === user?.id) {
      toast.error("You can't delete yourself!");
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('anicrew-users') || '[]');
    const filtered = users.filter((u: any) => u.id !== userId);
    localStorage.setItem('anicrew-users', JSON.stringify(filtered));
    toast.success('User deleted');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'content', label: 'Content', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen theme-transition">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-500" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Manage users, content, and settings</p>
            </div>
          </div>

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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400', change: '+12%' },
                  { label: 'Premium Users', value: stats.premiumUsers, icon: Crown, color: 'text-yellow-400', change: '+8%' },
                  { label: 'Active Today', value: stats.activeToday, icon: Activity, color: 'text-green-400', change: '+5%' },
                  { label: 'New This Week', value: stats.newThisWeek, icon: TrendingUp, color: 'text-purple-400', change: '+15%' },
                ].map((stat, idx) => (
                  <div key={idx} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                    </div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Charts Placeholder */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    User Growth
                  </h3>
                  <div className="h-48 flex items-center justify-center bg-secondary/30 rounded-xl">
                    <p className="text-muted-foreground">Chart visualization would go here</p>
                  </div>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Watch Activity
                  </h3>
                  <div className="h-48 flex items-center justify-center bg-secondary/30 rounded-xl">
                    <p className="text-muted-foreground">Activity chart would go here</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
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
                        <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
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
                              u.role === 'admin' || u.role === 'owner' 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-secondary text-muted-foreground'
                            }`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4">
                            {u.isPremium ? (
                              <span className="premium-badge text-xs py-0.5">Premium</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Free</span>
                            )}
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => updateUserRole(u.id, 'premium', true)}
                                className="p-2 rounded-lg hover:bg-yellow-500/20 transition-colors"
                                title="Make Premium"
                              >
                                <Crown className="w-4 h-4 text-yellow-500" />
                              </button>
                              <button
                                onClick={() => updateUserRole(u.id, 'admin', true)}
                                className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                                title="Make Admin"
                              >
                                <Shield className="w-4 h-4 text-red-500" />
                              </button>
                              <button
                                onClick={() => deleteUser(u.id)}
                                className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            </div>
                          </td>
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
              className="glass-card p-8 text-center"
            >
              <Activity className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Content Management</h3>
              <p className="text-muted-foreground mb-4">
                Content is fetched from external APIs. No direct content management needed.
              </p>
              <p className="text-sm text-muted-foreground">
                API Source: hianime-api-seven-teal.vercel.app
              </p>
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
                    <label className="text-sm text-muted-foreground">Cache Duration</label>
                    <select className="w-full mt-1 px-4 py-2 rounded-lg bg-secondary outline-none">
                      <option>5 minutes</option>
                      <option>15 minutes</option>
                      <option>1 hour</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Site Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Maintenance Mode</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full 
                                    peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 
                                    after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                                    after:transition-all"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Allow New Registrations</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full 
                                    peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 
                                    after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                                    after:transition-all"></div>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
