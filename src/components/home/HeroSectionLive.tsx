import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHomeData } from '@/hooks/useAnime';
import Particles from '@/components/effects/Particles';

export default function HeroSectionLive() {
  const { data, isLoading, error } = useHomeData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const spotlightAnimes = data?.data?.spotlightAnimes || [];
  const current = spotlightAnimes[currentIndex];

  useEffect(() => {
    if (spotlightAnimes.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % spotlightAnimes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [spotlightAnimes.length]);

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center hero-gradient">
        <Particles />
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading anime...</p>
        </div>
      </section>
    );
  }

  if (error || !current) {
    return (
      <section className="min-h-screen flex items-center justify-center hero-gradient">
        <Particles />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Welcome to AniCrew</h2>
          <p className="text-muted-foreground">Your anime discovery destination</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={current.poster}
            alt={current.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
          <div className="absolute inset-0 hero-gradient opacity-80" />
        </motion.div>
      </AnimatePresence>

      <Particles />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {/* Rank Badge */}
              {current.rank && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 bg-primary/20 text-primary border border-primary/30"
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  <span className="text-sm font-medium">#{current.rank} Spotlight</span>
                </motion.div>
              )}

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl font-bold mb-2 text-glow"
              >
                {current.name}
              </motion.h1>

              {/* Japanese Title */}
              {current.jname && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-muted-foreground font-jp mb-6"
                >
                  {current.jname}
                </motion.p>
              )}

              {/* Meta */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-3 mb-6"
              >
                {current.otherInfo?.map((info: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-secondary/50 text-sm"
                  >
                    {info}
                  </span>
                ))}
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-base md:text-lg text-muted-foreground line-clamp-3 mb-8"
              >
                {current.description}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/anime/${current.id}`)}
                  className="btn-hero flex items-center gap-2"
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  <span className="relative z-10">Watch Now</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/anime/${current.id}`)}
                  className="btn-ghost flex items-center gap-2"
                >
                  <Info className="w-5 h-5" />
                  More Info
                </motion.button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            onClick={() => setCurrentIndex(prev => (prev - 1 + spotlightAnimes.length) % spotlightAnimes.length)}
            className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {spotlightAnimes.slice(0, 5).map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex 
                  ? 'w-8 bg-primary glow-primary' 
                  : 'w-2 bg-muted-foreground/50 hover:bg-muted-foreground'
              }`}
            />
          ))}
          <button
            onClick={() => setCurrentIndex(prev => (prev + 1) % spotlightAnimes.length)}
            className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
