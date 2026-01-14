import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, List, Settings, Download, Lock, Share2, Maximize, Volume2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { mockAnimeList } from '@/data/animeData';
import { useAuth } from '@/contexts/AuthContext';

export default function WatchPage() {
  const { id, episode } = useParams();
  const navigate = useNavigate();
  const { isPremium } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('Japanese');
  const [selectedSubtitle, setSelectedSubtitle] = useState('English');
  const [showEpisodes, setShowEpisodes] = useState(false);

  const anime = mockAnimeList.find(a => a.id === id);
  const currentEpisode = parseInt(episode || '1');

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Anime not found</p>
      </div>
    );
  }

  const episodeData = anime.episodes.find(e => e.number === currentEpisode);
  const hasNext = currentEpisode < anime.episodes.length;
  const hasPrev = currentEpisode > 1;

  return (
    <div className="min-h-screen theme-transition bg-background">
      <Header />

      <main className="pt-20">
        {/* Video Player */}
        <section className="relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl"
              style={{
                boxShadow: '0 0 100px hsl(var(--primary) / 0.2)',
              }}
            >
              {/* Vignette Effect */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)',
              }} />

              {/* StreamTape/DoodStream Embed Placeholder */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-background">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <div className="w-0 h-0 border-l-[20px] border-l-primary border-y-[12px] border-y-transparent ml-1" />
                  </div>
                  <p className="text-muted-foreground">
                    Episode {currentEpisode}: {episodeData?.title || 'Loading...'}
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-2">
                    StreamTape / DoodStream player will load here
                  </p>
                </div>
              </div>

              {/* Custom Controls Overlay (Bottom) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Volume */}
                    <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                      <Volume2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Subtitle Selector */}
                    <select
                      value={selectedSubtitle}
                      onChange={(e) => setSelectedSubtitle(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm outline-none backdrop-blur-sm"
                    >
                      <option value="English">English Sub</option>
                      <option value="Hindi">Hindi Sub</option>
                      <option value="off">Off</option>
                    </select>
                    {/* Settings */}
                    <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                      <Settings className="w-5 h-5 text-white" />
                    </button>
                    {/* Fullscreen */}
                    <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                      <Maximize className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                border: '2px solid transparent',
                background: 'linear-gradient(var(--background), var(--background)) padding-box, linear-gradient(135deg, hsl(var(--primary) / 0.5), hsl(var(--accent) / 0.5)) border-box',
              }} />
            </motion.div>
          </div>
        </section>

        {/* Episode Navigation */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* Episode Info */}
              <div>
                <h1 className="text-2xl font-bold">{anime.title}</h1>
                <p className="text-muted-foreground">
                  Episode {currentEpisode}: {episodeData?.title}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Audio Language */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-secondary text-sm outline-none"
                >
                  {anime.languages.map(lang => (
                    <option key={lang} value={lang}>{lang} Dub</option>
                  ))}
                </select>

                {/* Episode List Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEpisodes(!showEpisodes)}
                  className={`p-2.5 rounded-xl transition-colors ${
                    showEpisodes ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>

                {/* Download */}
                {anime.isPremium && !isPremium ? (
                  <div className="relative group">
                    <button className="p-2.5 rounded-xl bg-secondary opacity-50 cursor-not-allowed">
                      <Lock className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-popover text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      Premium only
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-xl bg-secondary hover:bg-primary/20 hover:text-primary transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                )}

                {/* Share */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Prev/Next Navigation */}
            <div className="flex items-center justify-between mt-6 gap-4">
              <motion.button
                whileHover={{ scale: hasPrev ? 1.02 : 1 }}
                whileTap={{ scale: hasPrev ? 0.98 : 1 }}
                onClick={() => hasPrev && navigate(`/watch/${id}/${currentEpisode - 1}`)}
                disabled={!hasPrev}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all ${
                  hasPrev 
                    ? 'glass-card hover:border-primary/50 cursor-pointer' 
                    : 'bg-secondary/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous Episode</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: hasNext ? 1.02 : 1 }}
                whileTap={{ scale: hasNext ? 0.98 : 1 }}
                onClick={() => hasNext && navigate(`/watch/${id}/${currentEpisode + 1}`)}
                disabled={!hasNext}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all ${
                  hasNext 
                    ? 'glass-card hover:border-primary/50 cursor-pointer' 
                    : 'bg-secondary/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <span>Next Episode</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Episode List */}
            {showEpisodes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 glass-card p-4 max-h-80 overflow-y-auto"
              >
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {anime.episodes.map(ep => (
                    <motion.button
                      key={ep.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/watch/${id}/${ep.number}`)}
                      className={`p-3 rounded-lg text-center font-medium transition-colors ${
                        ep.number === currentEpisode
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {ep.number}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
