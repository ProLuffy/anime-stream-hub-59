import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Grid, List, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import AnimeCardLive from '@/components/anime/AnimeCardLive';
import { useCategory, useSearchAnime } from '@/hooks/useAnime';
import { FooterDisclaimer } from '@/components/ui/Disclaimer';

interface BrowsePageLiveProps {
  category?: string;
  title?: string;
}

export default function BrowsePageLive({ category = 'top-airing', title }: BrowsePageLiveProps) {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Use search if query present, otherwise use category
  const { data: categoryData, isLoading: categoryLoading } = useCategory(category, page);
  const { data: searchData, isLoading: searchLoading } = useSearchAnime(searchQuery, page);

  const isSearchMode = searchQuery.length > 0;
  const data = isSearchMode ? searchData : categoryData;
  const isLoading = isSearchMode ? searchLoading : categoryLoading;

  const animeList = data?.data?.animes || [];
  const totalPages = data?.data?.totalPages || 1;
  const hasNextPage = data?.data?.hasNextPage || false;

  const pageTitle = isSearchMode 
    ? `Search: "${searchQuery}"` 
    : title || category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="min-h-screen theme-transition">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{pageTitle}</h1>
            <p className="text-muted-foreground text-sm">
              {isLoading ? 'Loading...' : `${animeList.length} results`}
            </p>
          </motion.div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end mb-6">
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : animeList.length > 0 ? (
            <>
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5'
                  : 'space-y-4'
              }>
                {animeList.map((anime: any, index: number) => (
                  <AnimeCardLive key={anime.id} anime={anime} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!hasNextPage}
                    className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card p-16 text-center">
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-muted-foreground">Try a different search or category</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <FooterDisclaimer />
        </div>
      </footer>
    </div>
  );
}
