import React from 'react';
import { motion } from 'framer-motion';
import { Play, X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAnimeInfo } from '@/hooks/useAnime';

interface WatchProgressCardProps {
  animeId: string;
  episodeId: string;
  progress: number;
  timestamp: number;
  onRemove: () => void;
}

function WatchProgressCard({ animeId, episodeId, progress, timestamp, onRemove }: WatchProgressCardProps) {
  const { data, isLoading } = useAnimeInfo(animeId);
  const anime = data?.data?.anime;
  
  if (isLoading || !anime) {
    return (
      <div className="aspect-video bg-card rounded-xl animate-pulse" />
    );
  }

  const episodeNum = episodeId.split('?ep=')[1]?.split('&')[0] || '1';
  const progressPercent = Math.min(progress, 100);
  const timeAgo = getTimeAgo(timestamp);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative"
    >
      <Link to={`/watch/${animeId}?ep=${episodeNum}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-card">
          {/* Poster */}
          <img
            src={anime.info?.poster || anime.poster}
            alt={anime.info?.name || anime.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          {/* Play Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center glow-primary">
              <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </motion.div>
          
          {/* Episode Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary/90 text-xs font-semibold text-primary-foreground">
            EP {episodeNum}
          </div>
          
          {/* Time Ago */}
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo}
          </div>
          
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-primary rounded-r"
            />
          </div>
          
          {/* Info */}
          <div className="absolute bottom-3 left-3 right-10">
            <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
              {anime.info?.name || anime.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {progressPercent}% completed
            </p>
          </div>
        </div>
      </Link>
      
      {/* Remove Button */}
      <motion.button
        initial={{ opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive/80 backdrop-blur-sm text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
}

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function ContinueWatchingSection() {
  const { user, isLoggedIn, updateProfile } = useAuth();
  
  if (!isLoggedIn || !user?.watchHistory?.length) {
    return null;
  }
  
  // Sort by most recent and get unique anime entries
  const uniqueWatchHistory = user.watchHistory
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((item, index, self) => 
      index === self.findIndex(t => t.animeId === item.animeId)
    )
    .slice(0, 8);
  
  const handleRemove = (animeId: string, episodeId: string) => {
    const newHistory = user.watchHistory.filter(
      h => !(h.animeId === animeId && h.episodeId === episodeId)
    );
    updateProfile({ watchHistory: newHistory });
  };
  
  if (uniqueWatchHistory.length === 0) return null;
  
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6"
        >
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <span className="text-2xl">▶️</span> Continue Watching
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Pick up where you left off
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {uniqueWatchHistory.map((item, index) => (
            <motion.div
              key={`${item.animeId}-${item.episodeId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <WatchProgressCard
                animeId={item.animeId}
                episodeId={item.episodeId}
                progress={item.progress}
                timestamp={item.timestamp}
                onRemove={() => handleRemove(item.animeId, item.episodeId)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
