import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Play, Share2, BookmarkX } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useAnimeInfo } from '@/hooks/useAnime';
import { toast } from 'sonner';

// Individual watchlist item component
function WatchlistItem({ animeId, index, onRemove }: { animeId: string; index: number; onRemove: () => void }) {
  const { data: anime, isLoading } = useAnimeInfo(animeId);

  if (isLoading) {
    return (
      <div className="glass-card p-4 flex items-center gap-4 animate-pulse">
        <div className="w-20 h-28 bg-secondary rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-secondary rounded w-3/4" />
          <div className="h-4 bg-secondary rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!anime?.anime?.info) return null;

  const info = anime.anime.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card p-4 flex items-center gap-4 group"
    >
      <Link to={`/anime/${animeId}`} className="flex items-center gap-4 flex-1 min-w-0">
        <img
          src={info.poster}
          alt={info.name}
          className="w-20 h-28 object-cover rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
            {info.name}
          </h3>
          {info.jname && (
            <p className="text-sm text-muted-foreground truncate font-jp">
              {info.jname}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">
              {info.stats?.type || 'TV'}
            </span>
            <span>•</span>
            <span>★ {info.stats?.rating || 'N/A'}</span>
            <span>•</span>
            <span>{info.stats?.episodes?.sub || '?'} eps</span>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <Link to={`/anime/${animeId}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2.5 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Play className="w-4 h-4" fill="currentColor" />
          </motion.button>
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          className="p-2.5 rounded-full bg-secondary hover:bg-destructive/20 hover:text-destructive transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function WatchlistPage() {
  const { isLoggedIn, user, removeFromWatchlist } = useAuth();

  const handleShare = async () => {
    if (navigator.share && user) {
      try {
        await navigator.share({
          title: `${user.username}'s Watchlist`,
          text: `Check out my anime watchlist on AniCrew!`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleRemove = (animeId: string) => {
    removeFromWatchlist(animeId);
    toast.success('Removed from watchlist');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen theme-transition">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="glass-card p-12 text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Please login to view your watchlist
              </p>
              <Link to="/login" className="btn-hero inline-flex">
                <span className="relative z-10">Login Now</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const watchlist = user?.watchlist || [];

  return (
    <div className="min-h-screen theme-transition">
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
              <h1 className="text-3xl font-bold">My Watchlist</h1>
              <p className="text-muted-foreground mt-1">
                {watchlist.length} titles saved
              </p>
            </div>
            {watchlist.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="btn-ghost flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share List
              </motion.button>
            )}
          </motion.div>

          {/* Watchlist Grid */}
          {watchlist.length > 0 ? (
            <div className="grid gap-4">
              {watchlist.map((animeId, index) => (
                <WatchlistItem
                  key={animeId}
                  animeId={animeId}
                  index={index}
                  onRemove={() => handleRemove(animeId)}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <BookmarkX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Your watchlist is empty</p>
              <p className="text-sm text-muted-foreground mb-6">
                Start adding anime to your watchlist by clicking the bookmark icon on any anime
              </p>
              <Link to="/category/top-airing" className="btn-ghost inline-flex">
                Browse Anime
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
