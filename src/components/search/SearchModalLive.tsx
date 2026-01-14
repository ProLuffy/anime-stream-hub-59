import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Sparkles, Tv, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearchAnime } from '@/hooks/useAnime';

interface SearchModalLiveProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModalLive({ isOpen, onClose }: SearchModalLiveProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigate = useNavigate();

  const { data, isLoading } = useSearchAnime(debouncedQuery);
  const results = data?.data?.animes || [];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSelect = (animeId: string) => {
    navigate(`/anime/${animeId}`);
    onClose();
    setQuery('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="container mx-auto px-4 pt-24 max-w-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="search-glass flex items-center gap-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search anime..."
              className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
              autoFocus
            />
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </form>

          {/* Results */}
          <motion.div 
            layout
            className="glass-card mt-4 divide-y divide-border overflow-hidden max-h-[60vh] overflow-y-auto"
          >
            {results.length > 0 ? (
              results.slice(0, 10).map((anime: any, i: number) => (
                <motion.button
                  key={anime.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleSelect(anime.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left"
                >
                  <img
                    src={anime.poster}
                    alt={anime.name}
                    className="w-12 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{anime.name}</h4>
                    {anime.jname && (
                      <p className="text-sm text-muted-foreground truncate font-jp">{anime.jname}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {anime.type && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          {anime.type}
                        </span>
                      )}
                      {anime.episodes?.sub && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-0.5">
                          <Tv className="w-3 h-3" /> {anime.episodes.sub}
                        </span>
                      )}
                      {anime.episodes?.dub && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 flex items-center gap-0.5">
                          <Mic className="w-3 h-3" /> {anime.episodes.dub}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))
            ) : debouncedQuery.trim() && !isLoading ? (
              <div className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No results found for "{debouncedQuery}"</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try different keywords</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Start typing to search...</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Find your favorite anime</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
