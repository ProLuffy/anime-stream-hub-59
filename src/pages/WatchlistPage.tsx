import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Play, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { mockAnimeList } from '@/data/animeData';
import { useAuth } from '@/contexts/AuthContext';

export default function WatchlistPage() {
  const { isLoggedIn } = useAuth();

  // Mock watchlist - in real app, fetch from user data
  const watchlist = mockAnimeList.slice(0, 4);

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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-ghost flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share List
            </motion.button>
          </motion.div>

          {/* Watchlist Grid */}
          {watchlist.length > 0 ? (
            <div className="grid gap-4">
              {watchlist.map((anime, index) => (
                <motion.div
                  key={anime.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-4 flex items-center gap-4 group"
                >
                  <Link to={`/anime/${anime.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={anime.poster}
                      alt={anime.title}
                      className="w-20 h-28 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {anime.title}
                      </h3>
                      {anime.titleJp && (
                        <p className="text-sm text-muted-foreground truncate font-jp">
                          {anime.titleJp}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          anime.type === 'anime' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                        }`}>
                          {anime.type}
                        </span>
                        <span>•</span>
                        <span>★ {anime.rating}</span>
                        <span>•</span>
                        <span>{anime.episodes.length} eps</span>
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2.5 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Play className="w-4 h-4" fill="currentColor" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2.5 rounded-full bg-secondary hover:bg-destructive/20 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <Play className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your watchlist is empty</p>
              <Link to="/anime" className="btn-ghost mt-4 inline-flex">
                Browse Anime
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
