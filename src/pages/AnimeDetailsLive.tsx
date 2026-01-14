import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Share2, Star, Calendar, Tv, Mic, ChevronDown, ChevronUp, Loader2, ExternalLink, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAnimeInfo, useEpisodes } from '@/hooks/useAnime';
import Particles from '@/components/effects/Particles';
import Disclaimer from '@/components/ui/Disclaimer';

export default function AnimeDetailsLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  const { data: animeData, isLoading: infoLoading, error: infoError } = useAnimeInfo(id || '');
  const { data: episodesData, isLoading: episodesLoading } = useEpisodes(id || '');

  const anime = animeData?.data?.anime;
  const moreInfo = anime?.moreInfo;
  const episodes = episodesData?.data?.episodes || [];

  if (infoLoading) {
    return (
      <div className="min-h-screen theme-transition">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (infoError || !anime) {
    return (
      <div className="min-h-screen theme-transition">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl font-semibold mb-2">Anime not found</p>
            <button onClick={() => navigate('/')} className="btn-ghost">
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const visibleEpisodes = showAllEpisodes ? episodes : episodes.slice(0, 24);
  const info = anime.info;
  const stats = info?.stats || {};

  return (
    <div className="min-h-screen theme-transition">
      <Header />

      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          src={info?.poster}
          alt={info?.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        <Particles />

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden md:block w-44 lg:w-52 flex-shrink-0"
              >
                <img
                  src={info?.poster}
                  alt={info?.name}
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
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {stats.type && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                      {stats.type}
                    </span>
                  )}
                  {stats.quality && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent">
                      {stats.quality}
                    </span>
                  )}
                  {stats.episodes?.sub && (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 flex items-center gap-1">
                      <Tv className="w-3 h-3" /> SUB {stats.episodes.sub}
                    </span>
                  )}
                  {stats.episodes?.dub && (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 flex items-center gap-1">
                      <Mic className="w-3 h-3" /> DUB {stats.episodes.dub}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-glow">{info?.name}</h1>
                {info?.jname && (
                  <p className="text-lg text-muted-foreground font-jp mb-4">{info.jname}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {stats.rating && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                      <span className="font-semibold">{stats.rating}</span>
                    </div>
                  )}
                  {moreInfo?.aired && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{moreInfo.aired}</span>
                    </div>
                  )}
                  {stats.duration && (
                    <span className="text-sm text-muted-foreground">{stats.duration}</span>
                  )}
                </div>

                {moreInfo?.genres && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {moreInfo.genres.map((genre: string) => (
                      <span key={genre} className="px-3 py-1.5 rounded-full bg-secondary text-sm">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 max-w-2xl">
                  {info?.description}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {episodes.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/watch/${id}/${episodes[0]?.episodeId}`)}
                      className="btn-hero flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" fill="currentColor" />
                      <span className="relative z-10">Watch EP 1</span>
                    </motion.button>
                  )}
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
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Disclaimer />
          </div>

          <h2 className="text-xl font-bold mb-4">
            Episodes {episodes.length > 0 && `(${episodes.length})`}
          </h2>

          {episodesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : episodes.length > 0 ? (
            <>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
                <AnimatePresence>
                  {visibleEpisodes.map((episode: any, index: number) => (
                    <motion.button
                      key={episode.episodeId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/watch/${id}/${episode.episodeId}`)}
                      className={`p-3 rounded-lg text-center font-medium transition-colors ${
                        episode.isFiller 
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                          : 'bg-secondary hover:bg-primary/20 hover:text-primary'
                      }`}
                      title={episode.title}
                    >
                      {episode.number}
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>

              {episodes.length > 24 && (
                <button
                  onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                  className="w-full mt-4 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                >
                  {showAllEpisodes ? (
                    <>Show Less <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>Show All {episodes.length} Episodes <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <Info className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No episodes available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Additional Info */}
      {moreInfo && (
        <section className="py-8 border-t border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold mb-4">Information</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moreInfo.status && (
                <div className="glass-card p-4">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{moreInfo.status}</p>
                </div>
              )}
              {moreInfo.studios && (
                <div className="glass-card p-4">
                  <p className="text-sm text-muted-foreground">Studios</p>
                  <p className="font-medium">{moreInfo.studios.join(', ')}</p>
                </div>
              )}
              {moreInfo.producers && moreInfo.producers.length > 0 && (
                <div className="glass-card p-4">
                  <p className="text-sm text-muted-foreground">Producers</p>
                  <p className="font-medium">{moreInfo.producers.slice(0, 3).join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
