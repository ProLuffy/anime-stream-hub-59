import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [phase, setPhase] = useState<'particles' | 'logo' | 'transition'>('particles');

  useEffect(() => {
    // Phase timing
    const particleTimer = setTimeout(() => setPhase('logo'), 500);
    const logoTimer = setTimeout(() => setPhase('transition'), 3000);
    const completeTimer = setTimeout(() => {
      setShowIntro(false);
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(particleTimer);
      clearTimeout(logoTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setShowIntro(false);
    onComplete();
  };

  // Floating particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 2,
  }));

  // Logo text letters
  const logoText = "Anime Crew";
  const letters = logoText.split('');

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[100] overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, hsl(260 40% 12%) 0%, hsl(222 47% 4%) 70%, hsl(0 0% 0%) 100%)',
          }}
        >
          {/* Ambient particles */}
          <div className="absolute inset-0">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: p.size,
                  height: p.size,
                  background: `hsl(${217 + Math.random() * 30} 80% ${60 + Math.random() * 20}%)`,
                  boxShadow: `0 0 ${p.size * 3}px hsl(217 80% 60% / 0.5)`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Moon element */}
          <motion.div
            className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full"
            style={{
              top: '15%',
              right: '20%',
              background: 'radial-gradient(circle at 30% 30%, hsl(220 30% 95%) 0%, hsl(220 30% 75%) 100%)',
              boxShadow: '0 0 80px hsl(220 30% 80% / 0.5), 0 0 120px hsl(220 30% 80% / 0.3)',
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: phase !== 'transition' ? 0.6 : 0, 
              scale: phase !== 'transition' ? 1 : 0.8,
              rotate: 360,
            }}
            transition={{ 
              opacity: { duration: 1 },
              scale: { duration: 0.8 },
              rotate: { duration: 60, repeat: Infinity, ease: 'linear' }
            }}
          >
            {/* Moon craters */}
            <div className="absolute w-8 h-8 rounded-full bg-gray-300/30 top-8 left-6" />
            <div className="absolute w-6 h-6 rounded-full bg-gray-300/20 bottom-12 right-8" />
            <div className="absolute w-4 h-4 rounded-full bg-gray-300/25 top-16 right-10" />
          </motion.div>

          {/* Katana silhouette */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
            animate={{ 
              opacity: phase === 'logo' ? 0.15 : 0, 
              rotate: phase === 'logo' ? -30 : -45,
              scale: phase === 'logo' ? 1.5 : 0.5,
            }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <svg width="400" height="60" viewBox="0 0 400 60" fill="none" className="opacity-50">
              <path
                d="M20 30 L350 30 L380 25 L385 30 L380 35 L350 30"
                stroke="hsl(217 91% 60%)"
                strokeWidth="2"
                fill="none"
              />
              <rect x="10" y="25" width="15" height="10" rx="2" fill="hsl(217 91% 60%)" />
            </svg>
          </motion.div>

          {/* Main logo container */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative"
              animate={{
                scale: phase === 'transition' ? 0.3 : 1,
                y: phase === 'transition' ? '-40vh' : 0,
                x: phase === 'transition' ? '-35vw' : 0,
              }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1] 
              }}
            >
              {/* Logo glow background */}
              <motion.div
                className="absolute inset-0 blur-3xl"
                style={{
                  background: 'radial-gradient(ellipse, hsl(217 91% 60% / 0.4) 0%, transparent 70%)',
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: phase === 'logo' ? 1 : 0, 
                  scale: phase === 'logo' ? 1.5 : 0.5 
                }}
                transition={{ duration: 1 }}
              />

              {/* Logo text - letter by letter */}
              <motion.h1
                className="relative text-5xl md:text-8xl font-bold tracking-tight"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {letters.map((letter, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    style={{
                      background: 'linear-gradient(135deg, hsl(217 91% 70%) 0%, hsl(330 80% 65%) 50%, hsl(217 91% 60%) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '0 0 40px hsl(217 91% 60% / 0.5)',
                    }}
                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                    animate={{ 
                      opacity: phase !== 'particles' ? 1 : 0, 
                      y: phase !== 'particles' ? 0 : 50,
                      scale: phase !== 'particles' ? 1 : 0.5,
                    }}
                    transition={{ 
                      duration: 0.6,
                      delay: i * 0.08,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-center mt-4 text-muted-foreground text-lg md:text-xl tracking-widest uppercase"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: phase === 'logo' ? 0.8 : 0, 
                  y: phase === 'logo' ? 0 : 20 
                }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Your Anime Universe
              </motion.p>

              {/* Animated underline */}
              <motion.div
                className="h-0.5 mx-auto mt-6 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsl(217 91% 60%), hsl(330 80% 65%), hsl(217 91% 60%), transparent)',
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ 
                  width: phase === 'logo' ? '100%' : 0, 
                  opacity: phase === 'logo' ? 1 : 0 
                }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
            </motion.div>
          </div>

          {/* Skip button */}
          <motion.button
            onClick={handleSkip}
            className="absolute bottom-8 right-8 px-6 py-2 rounded-full text-sm font-medium
                       bg-white/10 hover:bg-white/20 border border-white/20 
                       transition-all duration-300 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            whileHover={{ opacity: 1, scale: 1.05 }}
            transition={{ delay: 0.5 }}
          >
            Skip Intro
          </motion.button>

          {/* Loading bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1"
            style={{
              background: 'linear-gradient(90deg, hsl(217 91% 60%), hsl(330 80% 65%))',
            }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3.5, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
