import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AnimatedStatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  change?: string;
  isLive?: boolean;
}

export default function AnimatedStatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  change,
  isLive = false,
}: AnimatedStatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isGlowing, setIsGlowing] = useState(false);

  // Count-up animation
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepValue = value / steps;
    const stepDuration = duration / steps;
    
    let current = 0;
    const interval = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, [value]);

  // Glow effect on value change
  useEffect(() => {
    setIsGlowing(true);
    const timeout = setTimeout(() => setIsGlowing(false), 500);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`relative p-6 rounded-2xl border border-border/50 bg-card overflow-hidden transition-shadow duration-300 ${
        isGlowing ? 'shadow-lg' : ''
      }`}
      style={{
        boxShadow: isGlowing ? `0 0 30px ${color}40` : undefined,
      }}
    >
      {/* Background gradient */}
      <div 
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: color }}
      />

      {/* Live indicator */}
      {isLive && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute top-4 right-4 flex items-center gap-1.5"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-500 font-medium">LIVE</span>
        </motion.div>
      )}

      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>

      {/* Value with count-up */}
      <motion.p 
        className="text-4xl font-bold mb-1"
        key={displayValue}
      >
        {displayValue.toLocaleString()}
      </motion.p>

      {/* Label */}
      <p className="text-sm text-muted-foreground">{label}</p>

      {/* Change indicator */}
      {change && (
        <div className="absolute top-6 right-4 text-xs font-medium text-green-500">
          {change}
        </div>
      )}
    </motion.div>
  );
}
