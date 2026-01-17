import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Trash2, Play, Pause, CheckCircle, XCircle, 
  Clock, HardDrive, Crown, ArrowLeft, Folder, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';

interface DownloadItem {
  id: string;
  animeId: string;
  animeName: string;
  episodeNumber: number;
  episodeTitle: string;
  poster: string;
  quality: string;
  size: string;
  progress: number;
  status: 'downloading' | 'paused' | 'completed' | 'error';
  downloadedAt: number;
  speed?: string;
}

export default function DownloadsPage() {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'downloading' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load downloads from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('anicrew-downloads');
    if (saved) {
      setDownloads(JSON.parse(saved));
    } else {
      // Demo data for showcase
      setDownloads([
        {
          id: '1',
          animeId: 'one-piece-100',
          animeName: 'One Piece',
          episodeNumber: 1100,
          episodeTitle: 'The Straw Hats Meet Again',
          poster: 'https://cdn.myanimelist.net/images/anime/1244/138851.jpg',
          quality: '1080p',
          size: '850 MB',
          progress: 100,
          status: 'completed',
          downloadedAt: Date.now() - 86400000,
        },
        {
          id: '2',
          animeId: 'jujutsu-kaisen-2nd-season-18413',
          animeName: 'Jujutsu Kaisen Season 2',
          episodeNumber: 23,
          episodeTitle: 'Shibuya Incident Gate',
          poster: 'https://cdn.myanimelist.net/images/anime/1792/138022.jpg',
          quality: '1080p',
          size: '420 MB',
          progress: 65,
          status: 'downloading',
          downloadedAt: Date.now(),
          speed: '2.5 MB/s',
        },
        {
          id: '3',
          animeId: 'solo-leveling-18718',
          animeName: 'Solo Leveling',
          episodeNumber: 12,
          episodeTitle: 'Arise',
          poster: 'https://cdn.myanimelist.net/images/anime/1391/142806.jpg',
          quality: '720p',
          size: '280 MB',
          progress: 30,
          status: 'paused',
          downloadedAt: Date.now() - 3600000,
        },
      ]);
    }
  }, []);

  // Simulate download progress
  useEffect(() => {
    const interval = setInterval(() => {
      setDownloads(prev => prev.map(d => {
        if (d.status === 'downloading' && d.progress < 100) {
          const newProgress = Math.min(d.progress + Math.random() * 5, 100);
          return {
            ...d,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'downloading',
          };
        }
        return d;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Check premium access
  if (!isPremium) {
    return (
      <div className="min-h-screen theme-transition">
        <Header />
        <main className="pt-24 flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-8 max-w-md"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Crown className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Premium Feature</h1>
            <p className="text-muted-foreground mb-6">
              Downloads are available exclusively for premium members. 
              Upgrade now to download and watch offline!
            </p>
            <button
              onClick={() => navigate('/premium')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all"
            >
              Upgrade to Premium
            </button>
          </motion.div>
        </main>
      </div>
    );
  }

  const toggleDownload = (id: string) => {
    setDownloads(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: d.status === 'downloading' ? 'paused' : 'downloading',
        };
      }
      return d;
    }));
  };

  const deleteDownload = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
  };

  const clearCompleted = () => {
    setDownloads(prev => prev.filter(d => d.status !== 'completed'));
  };

  const filteredDownloads = downloads.filter(d => {
    const matchesFilter = filter === 'all' || 
                          (filter === 'downloading' && (d.status === 'downloading' || d.status === 'paused')) ||
                          (filter === 'completed' && d.status === 'completed');
    const matchesSearch = d.animeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.episodeTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalSize = downloads
    .filter(d => d.status === 'completed')
    .reduce((acc, d) => acc + parseFloat(d.size), 0)
    .toFixed(1);

  const activeDownloads = downloads.filter(d => d.status === 'downloading').length;

  return (
    <div className="min-h-screen theme-transition">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-secondary/80 hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Download className="w-8 h-8 text-primary" />
                Downloads
              </h1>
              <p className="text-muted-foreground mt-1">Manage your offline content</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4 text-center">
              <Download className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold">{activeDownloads}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="glass-card p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold">{downloads.filter(d => d.status === 'completed').length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="glass-card p-4 text-center">
              <HardDrive className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold">{totalSize} GB</p>
              <p className="text-sm text-muted-foreground">Storage</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search downloads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary outline-none"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'downloading', 'completed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {downloads.some(d => d.status === 'completed') && (
              <button
                onClick={clearCompleted}
                className="px-4 py-2 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
              >
                Clear Completed
              </button>
            )}
          </div>

          {/* Downloads List */}
          <div className="space-y-4">
            <AnimatePresence>
              {filteredDownloads.map((download) => (
                <motion.div
                  key={download.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="glass-card p-4 flex gap-4"
                >
                  {/* Poster */}
                  <div className="relative w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={download.poster}
                      alt={download.animeName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-1 left-1 text-xs font-bold">
                      EP {download.episodeNumber}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{download.animeName}</h3>
                    <p className="text-sm text-muted-foreground truncate">{download.episodeTitle}</p>
                    
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className="px-2 py-0.5 rounded bg-primary/20 text-primary">
                        {download.quality}
                      </span>
                      <span className="text-muted-foreground">{download.size}</span>
                      {download.speed && download.status === 'downloading' && (
                        <span className="text-green-400">{download.speed}</span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {download.status !== 'completed' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={download.status === 'paused' ? 'text-yellow-500' : 'text-primary'}>
                            {download.status === 'paused' ? 'Paused' : 'Downloading...'}
                          </span>
                          <span>{Math.round(download.progress)}%</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              download.status === 'paused' 
                                ? 'bg-yellow-500' 
                                : 'bg-gradient-to-r from-primary to-primary/60'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${download.progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}

                    {download.status === 'completed' && (
                      <div className="mt-2 flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>Downloaded</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {download.status !== 'completed' ? (
                      <button
                        onClick={() => toggleDownload(download.id)}
                        className={`p-3 rounded-xl transition-colors ${
                          download.status === 'downloading'
                            ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                            : 'bg-primary/20 text-primary hover:bg-primary/30'
                        }`}
                      >
                        {download.status === 'downloading' ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/watch/${download.animeId}?ep=${download.episodeNumber}`)}
                        className="p-3 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteDownload(download.id)}
                      className="p-3 rounded-xl bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredDownloads.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Folder className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Downloads</h3>
                <p className="text-muted-foreground">
                  {filter === 'all' 
                    ? 'Start downloading episodes to watch offline!'
                    : `No ${filter} downloads`
                  }
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
