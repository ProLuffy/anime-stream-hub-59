// HiAnime API Service - Metadata Aggregator
// This service fetches publicly available anime metadata from third-party APIs
// No video hosting or streaming is performed by this application

// Multiple API endpoints for fallback
const API_ENDPOINTS = [
  'https://aniwatch-api-gamma.vercel.app',
  'https://aniwatch-api-eight.vercel.app', 
  'https://hianime-api.vercel.app',
  'https://api.consumet.org/anime/zoro',
];

let currentApiIndex = 0;
let currentApiBase = API_ENDPOINTS[0];

// Helper to try different API endpoints
async function fetchWithFallback(path: string, options?: RequestInit): Promise<Response> {
  let lastError: Error | null = null;
  
  // Try current API first
  const apis = [
    currentApiBase,
    ...API_ENDPOINTS.filter(api => api !== currentApiBase)
  ];
  
  for (const apiBase of apis) {
    try {
      const fullPath = path.startsWith('/api') ? path : `/api/v2/hianime${path}`;
      const res = await fetch(`${apiBase}${fullPath}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      
      if (res.ok) {
        // Update current working API
        currentApiBase = apiBase;
        return res;
      }
    } catch (err) {
      lastError = err as Error;
      console.warn(`API ${apiBase} failed, trying next...`);
    }
  }
  
  throw lastError || new Error('All API endpoints failed');
}

export interface AnimeResult {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  type?: string;
  episodes?: {
    sub?: number;
    dub?: number;
  };
  duration?: string;
  rating?: string;
  rank?: number;
  description?: string;
  otherInfo?: string[];
}

export interface SpotlightAnime extends AnimeResult {
  rank: number;
  description: string;
  otherInfo: string[];
}

export interface AnimeInfo {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  description?: string;
  stats?: {
    rating?: string;
    quality?: string;
    episodes?: {
      sub?: number;
      dub?: number;
    };
    type?: string;
    duration?: string;
  };
  moreInfo?: {
    aired?: string;
    genres?: string[];
    status?: string;
    studios?: string[];
    producers?: string[];
  };
}

export interface Episode {
  episodeId: string;
  number: number;
  title: string;
  isFiller?: boolean;
}

export interface EpisodeSource {
  server: string;
  category: 'sub' | 'dub' | 'raw';
  url?: string;
}

export interface StreamingSource {
  sources: {
    url: string;
    type: string;
    quality?: string;
  }[];
  subtitles?: {
    url: string;
    lang: string;
  }[];
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

export interface HomeData {
  success: boolean;
  data: {
    spotlightAnimes: SpotlightAnime[];
    trendingAnimes: AnimeResult[];
    latestEpisodeAnimes: AnimeResult[];
    topUpcomingAnimes: AnimeResult[];
    top10Animes: {
      today: AnimeResult[];
      week: AnimeResult[];
      month: AnimeResult[];
    };
    topAiringAnimes: AnimeResult[];
    mostPopularAnimes: AnimeResult[];
    mostFavoriteAnimes: AnimeResult[];
    latestCompletedAnimes: AnimeResult[];
    genres: string[];
    // Alternate API structure
    featuredAnimes?: {
      topAiringAnimes?: AnimeResult[];
      mostPopularAnimes?: AnimeResult[];
    };
    latestEpisodes?: AnimeResult[];
  };
  // Direct properties for alternate API
  trendingAnimes?: AnimeResult[];
  topAiringAnimes?: AnimeResult[];
  latestEpisodeAnimes?: AnimeResult[];
  topUpcomingAnimes?: AnimeResult[];
  mostPopularAnimes?: AnimeResult[];
}

// Fetch trending/home anime
export async function fetchHomeData(): Promise<HomeData> {
  const res = await fetchWithFallback('/home');
  if (!res.ok) throw new Error('Failed to fetch home data');
  return res.json();
}

// Search anime
export async function searchAnime(query: string, page = 1) {
  const res = await fetchWithFallback(`/search?q=${encodeURIComponent(query)}&page=${page}`);
  if (!res.ok) throw new Error('Failed to search anime');
  return res.json();
}

// Fetch anime details
export async function fetchAnimeInfo(animeId: string) {
  const res = await fetchWithFallback(`/anime/${animeId}`);
  if (!res.ok) throw new Error('Failed to fetch anime info');
  return res.json();
}

// Fetch episode list
export async function fetchEpisodes(animeId: string) {
  const res = await fetchWithFallback(`/anime/${animeId}/episodes`);
  if (!res.ok) throw new Error('Failed to fetch episodes');
  return res.json();
}

// Fetch episode streaming servers
export async function fetchEpisodeServers(episodeId: string) {
  const res = await fetchWithFallback(`/episode/servers?animeEpisodeId=${episodeId}`);
  if (!res.ok) throw new Error('Failed to fetch servers');
  return res.json();
}

// Fetch episode streaming sources
export async function fetchEpisodeSources(episodeId: string, server = 'hd-1', category = 'sub') {
  const res = await fetchWithFallback(`/episode/sources?animeEpisodeId=${episodeId}&server=${server}&category=${category}`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}

// Fetch category (e.g., top-airing, most-popular, etc.)
export async function fetchCategory(category: string, page = 1) {
  const res = await fetchWithFallback(`/${category}?page=${page}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category}`);
  return res.json();
}

// Fetch genre list
export async function fetchGenres() {
  const res = await fetchWithFallback('/genre');
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
}

// Fetch anime by genre
export async function fetchByGenre(genre: string, page = 1) {
  const res = await fetchWithFallback(`/genre/${genre}?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch genre anime');
  return res.json();
}

// Fetch schedule
export async function fetchSchedule(date: string) {
  const res = await fetchWithFallback(`/schedule?date=${date}`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

// Get current working API base
export function getCurrentApiBase() {
  return currentApiBase;
}
