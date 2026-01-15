import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader2, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useQuery } from '@tanstack/react-query';
import { fetchSchedule } from '@/lib/api';
import { format, addDays, subDays, startOfWeek, isSameDay, isToday } from 'date-fns';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  
  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  const { data, isLoading } = useQuery({
    queryKey: ['schedule', formattedDate],
    queryFn: () => fetchSchedule(formattedDate),
  });

  const scheduleData = data?.data?.scheduledAnimes || [];

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedDate(d => direction === 'prev' ? subDays(d, 7) : addDays(d, 7));
  };

  return (
    <div className="min-h-screen theme-transition bg-background">
      <Header />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Hero Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8 p-8 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--accent) / 0.2) 0%, hsl(var(--primary) / 0.1) 100%)',
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-accent" />
                <h1 className="text-4xl font-bold">Anime Schedule</h1>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Stay updated with anime airing schedule. Never miss your favorite shows!
              </p>
            </div>

            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          </motion.div>

          {/* Week Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateWeek('prev')}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <h2 className="text-lg font-semibold">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </h2>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateWeek('next')}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Day Pills */}
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, idx) => {
                const isSelected = isSameDay(date, selectedDate);
                const today = isToday(date);

                return (
                  <motion.button
                    key={date.toString()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDate(date)}
                    className={`relative p-3 rounded-xl text-center transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground glow-primary'
                        : today
                          ? 'bg-accent/20 border border-accent/50'
                          : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <p className={`text-xs font-medium ${isSelected ? '' : 'text-muted-foreground'}`}>
                      {DAYS[idx].slice(0, 3).toUpperCase()}
                    </p>
                    <p className="text-lg font-bold mt-1">
                      {format(date, 'd')}
                    </p>
                    {today && !isSelected && (
                      <motion.div
                        layoutId="today-dot"
                        className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Schedule Content */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-24"
              >
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </motion.div>
            ) : scheduleData.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-24"
              >
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-xl text-muted-foreground">No anime scheduled for this day</p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Check back later or browse other days
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="text-xl font-semibold">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {scheduleData.length} anime airing
                  </span>
                </div>

                {/* Schedule Grid */}
                <div className="grid gap-4">
                  {scheduleData.map((anime: any, idx: number) => (
                    <motion.div
                      key={anime.id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link to={`/anime/${anime.id}`}>
                        <motion.div
                          whileHover={{ scale: 1.01, x: 8 }}
                          className="glass-card p-4 flex gap-4 group cursor-pointer hover:border-primary/50 transition-all"
                        >
                          {/* Time */}
                          <div className="flex-shrink-0 w-20 text-center">
                            <div className="bg-primary/20 rounded-lg p-2">
                              <p className="text-lg font-bold text-primary">
                                {anime.time || '--:--'}
                              </p>
                              <p className="text-xs text-muted-foreground">JST</p>
                            </div>
                          </div>

                          {/* Poster */}
                          <div className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden">
                            <img
                              src={anime.poster || '/placeholder.svg'}
                              alt={anime.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                              {anime.name}
                            </h4>
                            {anime.jname && (
                              <p className="text-sm text-muted-foreground truncate">
                                {anime.jname}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              {anime.episode && (
                                <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
                                  EP {anime.episode}
                                </span>
                              )}
                              {anime.rating && (
                                <span className="flex items-center gap-1 text-xs text-yellow-500">
                                  <Star className="w-3 h-3 fill-current" />
                                  {anime.rating}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Watch button */}
                          <div className="flex-shrink-0 flex items-center">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-10 h-10 rounded-full bg-primary/20 group-hover:bg-primary 
                                         flex items-center justify-center transition-colors"
                            >
                              <Play className="w-4 h-4 text-primary group-hover:text-primary-foreground ml-0.5" />
                            </motion.div>
                          </div>
                        </motion.div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
