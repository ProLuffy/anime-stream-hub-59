import React, { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// Lightweight CSS-only particles - no framer-motion overhead
export default function Particles() {
  const { theme } = useTheme();

  const particles = useMemo(() => {
    // Only 12 particles for minimal visual effect without DOM bloat
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      duration: Math.random() * 12 + 18,
      delay: Math.random() * 12,
    }));
  }, []);

  const getColor = () => {
    switch (theme) {
      case 'midnight-sakura':
      case 'sakura-snow':
      case 'peach-blossom':
        return 'rgba(249, 168, 212, 0.4)';
      case 'solar-flare':
      case 'crimson-void':
        return 'rgba(251, 146, 60, 0.4)';
      case 'void-purple':
      case 'nebula-nights':
        return 'rgba(196, 181, 253, 0.4)';
      default:
        return 'rgba(255, 255, 255, 0.15)';
    }
  };

  const color = getColor();

  return (
    <div className="particles-container pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-up"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
