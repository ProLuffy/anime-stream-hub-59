import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { mockAnimeList, genres, languages, Anime } from '@/data/animeData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'anime' | 'donghua'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Fuzzy search setup
  const fuse = useMemo(() => new Fuse(mockAnimeList, {
    keys: ['title', 'titleJp', 'description', 'genres'],
    threshold: 0.4,
    includeScore: true,
  }), []);

  const results = useMemo(() => {
    let filtered = mockAnimeList;

    // Apply fuzzy search
    if (query.trim()) {
      const fuseResults = fuse.search(query);
      filtered = fuseResults.map(r => r.item);
    }

    // Apply filters
    if (selectedType !== 'all') {
      filtered = filtered.filter(a => a.type === selectedType);
    }
    if (selectedGenre) {
      filtered = filtered.filter(a => a.genres.includes(selectedGenre));
    }

    return filtered.slice(0, 8);
  }, [query, selectedType, selectedGenre, fuse]);

  const handleSelect = (anime: Anime) => {
    navigate(`/anime/${anime.id}`);
    onClose();
    setQuery('');
  };

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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
          <div className="search-glass flex items-center gap-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search anime, donghua, genres..."
              className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
              >
                <Filter className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card mt-4 p-4"
              >
                <div className="flex flex-wrap gap-3">
                  {/* Type Filter */}
                  <div className="flex gap-2">
                    {(['all', 'anime', 'donghua'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          selectedType === type 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  {/* Genre Filter */}
                  <select
                    value={selectedGenre}
                    onChange={e => setSelectedGenre(e.target.value)}
                    className="px-4 py-2 rounded-full bg-secondary text-sm outline-none"
                  >
                    <option value="">All Genres</option>
                    {genres.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <motion.div 
            layout
            className="glass-card mt-4 divide-y divide-border overflow-hidden"
          >
            {results.length > 0 ? (
              results.map((anime, i) => (
                <motion.button
                  key={anime.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSelect(anime)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors text-left"
                >
                  <img
                    src={anime.poster}
                    alt={anime.title}
                    className="w-14 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{anime.title}</h4>
                    {anime.titleJp && (
                      <p className="text-sm text-muted-foreground truncate">{anime.titleJp}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        anime.type === 'anime' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                      }`}>
                        {anime.type}
                      </span>
                      <span className="text-xs text-muted-foreground">{anime.year}</span>
                      <span className="text-xs text-muted-foreground">★ {anime.rating}</span>
                    </div>
                  </div>
                </motion.button>
              ))
            ) : query.trim() ? (
              <div className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No results found for "{query}"</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Try different keywords</p>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Start typing to search...</p>
                <p className="text-sm text-muted-foreground/70 mt-1">AI-powered fuzzy search</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
