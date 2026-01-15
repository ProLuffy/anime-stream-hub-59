import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Tag, Grid3X3 } from 'lucide-react';
import Header from '@/components/layout/Header';
import AnimeCardLive from '@/components/anime/AnimeCardLive';
import { useQuery } from '@tanstack/react-query';
import { fetchGenres, fetchByGenre } from '@/lib/api';

const GENRES = [
  'action', 'adventure', 'cars', 'comedy', 'drama', 'fantasy', 'horror', 
  'mahou-shoujo', 'mecha', 'music', 'mystery', 'psychological', 'romance', 
  'sci-fi', 'slice-of-life', 'sports', 'supernatural', 'thriller'
];

export default function GenrePage() {
  const { genre } = useParams();
  const [page, setPage] = useState(1);
  const selectedGenre = genre || 'action';

  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: fetchGenres,
    staleTime: Infinity,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['genre', selectedGenre, page],
    queryFn: () => fetchByGenre(selectedGenre, page),
  });

  const animeList = data?.data?.animes || [];
  const hasNextPage = data?.data?.hasNextPage;
  const totalPages = data?.data?.totalPages || 1;

  const formatGenreName = (g: string) => {
    return g.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, hsl(var(--accent) / 0.1) 100%)',
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-bold">Browse by Genre</h1>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Explore anime by your favorite genres. From action-packed adventures to heartwarming romance.
              </p>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          </motion.div>

          {/* Genre Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {GENRES.map((g) => (
              <Link
                key={g}
                to={`/genre/${g}`}
                onClick={() => setPage(1)}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedGenre === g
                      ? 'bg-primary text-primary-foreground glow-primary'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {formatGenreName(g)}
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {/* Current Genre Title */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Grid3X3 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">{formatGenreName(selectedGenre)}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : animeList.length === 0 ? (
            <div className="text-center py-24">
              <Tag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-xl text-muted-foreground">No anime found in this genre</p>
            </div>
          ) : (
            <>
              {/* Anime Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              >
                {animeList.map((anime: any, idx: number) => (
                  <motion.div
                    key={anime.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <AnimeCardLive anime={anime} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-4 mt-12"
              >
                <motion.button
                  whileHover={{ scale: page > 1 ? 1.05 : 1 }}
                  whileTap={{ scale: page > 1 ? 0.95 : 1 }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    page > 1 
                      ? 'glass-card hover:border-primary/50 cursor-pointer'
                      : 'bg-secondary/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </motion.button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          page === pageNum 
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: hasNextPage ? 1.05 : 1 }}
                  whileTap={{ scale: hasNextPage ? 0.95 : 1 }}
                  onClick={() => setPage(p => p + 1)}
                  disabled={!hasNextPage}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                    hasNextPage 
                      ? 'glass-card hover:border-primary/50 cursor-pointer'
                      : 'bg-secondary/30 opacity-50 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
