import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Anime } from '@/types/anime';

interface AnimeCardProps {
  anime: Anime;
  index?: number;
}

export default function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative"
    >
      <Link to={`/anime/${anime.id}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card">
          
          {/* Poster */}
          <img
            src={anime.poster}
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-70" />

          {/* Type Badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
            anime.type === 'anime' 
              ? 'bg-primary/90 text-primary-foreground' 
              : 'bg-accent/90 text-accent-foreground'
          }`}>
            {anime.type.toUpperCase()}
          </div>

          {/* Hover Play Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </motion.div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {anime.title}
            </h3>

            {anime.titleJp && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {anime.titleJp}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 text-sm">
              
              {/* Rating */}
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                <span className="font-semibold">{anime.rating}</span>
              </div>

              <span className="text-muted-foreground">•</span>

              {/* Year */}
              <span className="text-muted-foreground">{anime.year}</span>

              <span className="text-muted-foreground">•</span>

              {/* Status */}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                anime.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                anime.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {anime.status}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
