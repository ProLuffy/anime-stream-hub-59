import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Particles() {
  const { theme } = useTheme();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const count = 30;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 15,
      });
    }
    setParticles(newParticles);
  }, []);

  const getParticleColor = () => {
    switch (theme) {
      case 'sakura-night':
        return 'bg-pink-300';
      case 'dragon-ember':
        return 'bg-orange-400';
      case 'celestial-void':
        return 'bg-purple-300';
      case 'midnight-ocean':
        return 'bg-cyan-300';
      case 'sunrise-bloom':
        return 'bg-amber-300';
      case 'snowfall-white':
        return 'bg-blue-200';
      default:
        return 'bg-primary/30';
    }
  };

  const getParticleShape = () => {
    switch (theme) {
      case 'sakura-night':
        return 'sakura';
      case 'snowfall-white':
        return 'snowflake';
      case 'dragon-ember':
        return 'ember';
      default:
        return 'circle';
    }
  };

  return (
    <div className="particles-container">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            y: '110vh', 
            x: `${particle.x}vw`, 
            opacity: 0,
            rotate: 0 
          }}
          animate={{ 
            y: '-10vh', 
            opacity: [0, 0.7, 0.7, 0],
            rotate: theme === 'sakura-night' ? 720 : 0 
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            width: particle.size,
            height: particle.size,
          }}
          className={`absolute rounded-full ${getParticleColor()} ${
            getParticleShape() === 'sakura' ? 'rounded-[50%_50%_0%_50%]' : ''
          }`}
        />
      ))}
    </div>
  );
}
