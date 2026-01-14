import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Share2, Download, Lock, Star, Calendar, Clock, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { mockAnimeList } from '@/data/animeData';
import { useAuth } from '@/contexts/AuthContext';
import Particles from '@/components/effects/Particles';

export default function AnimeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isPremium } = useAuth();
  const [selectedEpisode, setSelectedEpisode] = useState(0);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Japanese');

  const anime = mockAnimeList.find(a => a.id === id);

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Anime not found</p>
      </div>
    );
  }

  const visibleEpisodes = showAllEpisodes ? anime.episodes : anime.episodes.slice(0, 6);

  return (
    <div className="min-h-screen theme-transition">
      <Header />

      {/* Hero Banner */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          src={anime.banner || anime.poster}
          alt={anime.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        <Particles />

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden md:block w-48 lg:w-56 flex-shrink-0"
              >
                <img
                  src={anime.poster}
                  alt={anime.title}
                  className="w-full aspect-[2/3] object-cover rounded-xl shadow-2xl"
                />
              </motion.div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    anime.type === 'anime' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                  }`}>
                    {anime.type.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    anime.status === 'ongoing' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {anime.status}
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-2 text-glow">{anime.title}</h1>
                {anime.titleJp && (
                  <p className="text-xl text-muted-foreground font-jp mb-4">{anime.titleJp}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                    <span className="font-semibold">{anime.rating}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{anime.year}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{anime.episodes.length} Episodes</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {anime.genres.map(genre => (
                    <span key={genre} className="px-3 py-1.5 rounded-full bg-secondary text-sm">
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="text-muted-foreground line-clamp-3 mb-6 max-w-2xl">
                  {anime.description}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/watch/${anime.id}/1`)}
                    className="btn-hero flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" fill="currentColor" />
                    <span className="relative z-10">Watch Now</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-ghost flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add to List
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Episodes</h2>
            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 rounded-lg bg-secondary outline-none text-sm"
              >
                {anime.languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {anime.episodes.length > 0 ? (
            <>
              <div className="grid gap-4">
                <AnimatePresence>
                  {visibleEpisodes.map((episode, index) => (
                    <motion.div
                      key={episode.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`glass-card p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors ${
                        selectedEpisode === index ? 'border-primary' : ''
                      }`}
                      onClick={() => navigate(`/watch/${anime.id}/${episode.number}`)}
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {episode.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{episode.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{episode.duration}</span>
                          <span>•</span>
                          <span>{episode.releaseDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Download Button */}
                        {anime.isPremium && !isPremium ? (
                          <div className="relative group">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              className="p-2.5 rounded-full bg-secondary/50 opacity-50 cursor-not-allowed"
                            >
                              <Lock className="w-4 h-4" />
                            </motion.button>
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-popover text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                              Premium only
                            </div>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2.5 rounded-full bg-secondary/50 hover:bg-primary/20 hover:text-primary transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2.5 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <Play className="w-4 h-4" fill="currentColor" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {anime.episodes.length > 6 && (
                <button
                  onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                  className="w-full mt-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  {showAllEpisodes ? (
                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show All {anime.episodes.length} Episodes <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <p className="text-muted-foreground">No episodes available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Comments
          </h2>
          <div className="glass-card p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Login to join the discussion</p>
            <button className="btn-ghost mt-4">Login to Comment</button>
          </div>
        </div>
      </section>
    </div>
  );
}
