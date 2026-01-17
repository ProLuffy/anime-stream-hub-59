import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Star, Tv, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimeResult } from '@/lib/api';

interface AnimeCardLiveProps {
  anime: AnimeResult;
  index?: number;
}

// Helper functions for API field compatibility
function getAnimeName(anime: AnimeResult): string {
  return anime.name || anime.title || 'Unknown';
}

function getAnimeJName(anime: AnimeResult): string {
  return anime.jname || anime.alternativeTitle || '';
}

export default function AnimeCardLive({ anime, index = 0 }: AnimeCardLiveProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateXVal = ((y - centerY) / centerY) * -8;
    const rotateYVal = ((x - centerX) / centerX) * 8;
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  // Extract episode counts
  const subEps = anime.episodes?.sub || 0;
  const dubEps = anime.episodes?.dub || 0;
  
  // Get display values
  const animeName = getAnimeName(anime);
  const animeJName = getAnimeJName(anime);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }}
      className="group relative"
    >
      <Link to={`/anime/${anime.id}`}>
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-card">
          {/* Poster */}
          <img
            src={anime.poster}
            alt={animeName}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Type Badge */}
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

          {/* Hover Content */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col justify-end p-4"
          >
            {/* Play Button */}
            <motion.div
              initial={false}
              animate={{ scale: isHovered ? 1 : 0.5, opacity: isHovered ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center glow-primary">
                <Play className="w-7 h-7 text-primary-foreground ml-1" fill="currentColor" />
              </div>
            </motion.div>

            {/* Episode Pills */}
            <motion.div
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-1.5 mb-2"
            >
              {subEps > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/80 backdrop-blur-sm text-xs font-medium flex items-center gap-1">
                  <Tv className="w-3 h-3" />
                  SUB {subEps}
                </span>
              )}
              {dubEps > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-green-500/80 backdrop-blur-sm text-xs font-medium flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  DUB {dubEps}
                </span>
              )}
            </motion.div>
          </motion.div>

          {/* Bottom Info (Always visible) */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
              {animeName}
            </h3>
            {animeJName && (
              <p className="text-xs text-muted-foreground line-clamp-1 font-jp mt-0.5">
                {animeJName}
              </p>
            )}
            {anime.duration && (
              <p className="text-xs text-muted-foreground mt-1">{anime.duration}</p>
            )}
          </div>
        </div>

        {/* Card Glow Effect */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 0.4 : 0 }}
          className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary/30 to-accent/30 blur-xl -z-10"
        />
      </Link>

      {/* Quick Add to Watchlist */}
      <motion.button
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-3 right-12 p-2 rounded-full bg-secondary/80 backdrop-blur-sm hover:bg-primary transition-colors z-10"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Add to watchlist logic
        }}
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
