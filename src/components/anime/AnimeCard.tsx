import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Crown, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Anime } from '@/data/animeData';

interface AnimeCardProps {
  anime: Anime;
  index?: number;
}

export default function AnimeCard({ anime, index = 0 }: AnimeCardProps) {
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
    const rotateXVal = ((y - centerY) / centerY) * -10;
    const rotateYVal = ((x - centerX) / centerX) * 10;
    setRotateX(rotateXVal);
    setRotateY(rotateYVal);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
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
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

          {/* Premium Badge */}
          {anime.isPremium && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 premium-badge"
            >
              <Crown className="w-3 h-3" />
              <span>Premium</span>
            </motion.div>
          )}

          {/* Type Badge */}
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
            anime.type === 'anime' 
              ? 'bg-primary/90 text-primary-foreground' 
              : 'bg-accent/90 text-accent-foreground'
          }`}>
            {anime.type.toUpperCase()}
          </div>

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

            {/* Language Pills */}
            <motion.div
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-1.5 mb-2"
            >
              {anime.languages.slice(0, 3).map(lang => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded-full bg-secondary/80 backdrop-blur-sm text-xs font-medium"
                >
                  {lang}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Bottom Info (Always visible) */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {anime.title}
            </h3>
            {anime.titleJp && (
              <p className="text-sm text-muted-foreground line-clamp-1 font-jp">
                {anime.titleJp}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                <span className="text-sm font-semibold">{anime.rating}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{anime.year}</span>
              <span className="text-muted-foreground">•</span>
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

        {/* Card Glow Effect */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 0.5 : 0 }}
          className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary/30 to-accent/30 blur-xl -z-10"
        />
      </Link>

      {/* Quick Add to Watchlist */}
      <motion.button
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute top-3 right-3 p-2 rounded-full bg-secondary/80 backdrop-blur-sm hover:bg-primary transition-colors z-10"
        onClick={(e) => {
          e.preventDefault();
          // Add to watchlist logic
        }}
      >
        <Plus className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
