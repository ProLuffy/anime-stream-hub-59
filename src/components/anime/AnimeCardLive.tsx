import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Tv, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AnimeResult } from '@/lib/api';

interface AnimeCardLiveProps {
  anime: AnimeResult;
  index?: number;
}

export default function AnimeCardLive({ anime, index = 0 }: AnimeCardLiveProps) {
  const subEps = anime.episodes?.sub ?? 0;
  const dubEps = anime.episodes?.dub ?? 0;

  const animeName = anime.name ?? anime.title ?? 'Unknown';
  const animeJName = anime.jname ?? anime.alternativeTitle ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative"
    >
      <Link to={`/anime/${anime.id}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card">

          {/* Poster */}
          <img
            src={anime.poster}
            alt={animeName}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-70" />

          {/* Type */}
          {anime.type && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/90 text-primary-foreground">
              {anime.type}
            </div>
          )}

          {/* Rating */}
          {anime.rating && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold bg-background/80 backdrop-blur-sm flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
              {anime.rating}
            </div>
          )}

          {/* Hover Play */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Episode Tags */}
          <div className="absolute bottom-20 left-3 flex gap-2">
            {subEps > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/80 text-xs flex items-center gap-1">
                <Tv className="w-3 h-3" />
                SUB {subEps}
              </span>
            )}
            {dubEps > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-green-500/80 text-xs flex items-center gap-1">
                <Mic className="w-3 h-3" />
                DUB {dubEps}
              </span>
            )}
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
              {animeName}
            </h3>

            {animeJName && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {animeJName}
              </p>
            )}

            {anime.duration && (
              <p className="text-xs text-muted-foreground mt-1">
                {anime.duration}
              </p>
            )}
          </div>

        </div>
      </Link>
    </motion.div>
  );
}
