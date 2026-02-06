import { useQuery } from '@tanstack/react-query';
import { searchAnime, searchSuggestion } from '@/lib/api';

// Helper to normalize anime object fields for display
export function getDisplayName(anime: any): string {
  return anime.name || anime.title || 'Unknown';
}

export function getDisplayJName(anime: any): string {
  return anime.jname || anime.alternativeTitle || '';
}

// Hook for search suggestions (fast autocomplete)
export function useSearchSuggestion(query: string) {
  return useQuery({
    queryKey: ['search-suggestion', query],
    queryFn: () => searchSuggestion(query),
    enabled: query.length >= 1,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook for full search results with pagination
export function useFullSearch(query: string, page = 1) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: () => searchAnime(query, page),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}
