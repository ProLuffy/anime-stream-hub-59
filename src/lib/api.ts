// HiAnime API Service
// API Base: https://hianimeapi-1vww.onrender.com/api/v1

const API_BASE = 'https://hianimeapi-1vww.onrender.com';
const CORS_PROXIES = [
  '', // Try direct first
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

export interface AnimeResult {
  id: string;
  name?: string;
  title?: string;
  jname?: string;
  alternativeTitle?: string;
  poster: string;
  type?: string;
  quality?: string;
  episodes?: {
    sub?: number;
    dub?: number;
    eps?: number;
  };
  duration?: string;
  rating?: string;
  rank?: number;
  description?: string;
  synopsis?: string;
  otherInfo?: string[];
  aired?: string;
}

export interface SpotlightAnime extends AnimeResult {
  rank: number;
  synopsis: string;
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
    spotlight?: SpotlightAnime[];
    trending?: AnimeResult[];
    topAiring?: AnimeResult[];
    latestEpisodes?: AnimeResult[];
    mostPopular?: AnimeResult[];
    mostFavorite?: AnimeResult[];
    latestCompleted?: AnimeResult[];
    topUpcoming?: AnimeResult[];
    spotlightAnimes?: SpotlightAnime[];
    trendingAnimes?: AnimeResult[];
    latestEpisodeAnimes?: AnimeResult[];
    topUpcomingAnimes?: AnimeResult[];
    top10Animes?: {
      today: AnimeResult[];
      week: AnimeResult[];
      month: AnimeResult[];
    };
    topAiringAnimes?: AnimeResult[];
    mostPopularAnimes?: AnimeResult[];
    mostFavoriteAnimes?: AnimeResult[];
    latestCompletedAnimes?: AnimeResult[];
    genres?: string[];
    featuredAnimes?: {
      topAiringAnimes?: AnimeResult[];
      mostPopularAnimes?: AnimeResult[];
    };
  };
}

// Helper function to make API calls with CORS proxy fallback
async function apiFetch(endpoint: string) {
  const fullUrl = `${API_BASE}/api/v1${endpoint}`;
  
  for (const proxy of CORS_PROXIES) {
    try {
      const url = proxy ? `${proxy}${encodeURIComponent(fullUrl)}` : fullUrl;
      console.log('Fetching:', url);
      
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(15000), // 15s timeout
      });
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('API Response received');
      return data;
    } catch (error) {
      console.warn(`Fetch failed with ${proxy || 'direct'}, trying next...`, error);
      continue;
    }
  }
  
  throw new Error('All API proxies failed');
}

// Fetch home data (trending, spotlight, top airing, latest episodes)
export async function fetchHomeData(): Promise<HomeData> {
  const data = await apiFetch('/home');
  console.log('Home API Response:', data);
  return data;
}

// Search anime
export async function searchAnime(query: string, page = 1) {
  return apiFetch(`/search?keyword=${encodeURIComponent(query)}&page=${page}`);
}

// Fetch anime details
export async function fetchAnimeInfo(animeId: string) {
  return apiFetch(`/anime/${animeId}`);
}

// Fetch episode list
export async function fetchEpisodes(animeId: string) {
  return apiFetch(`/episodes/${animeId}`);
}

// Fetch episode streaming sources
// Note: The stream endpoint expects just the episode ID part (after the last ??)
// and server names should match what the API expects
export async function fetchEpisodeSources(episodeId: string, server = 'hd-1', category = 'sub') {
  // The API expects episode ID like: "one-piece-100$episode$23454$both"
  // Convert from "one-piece-100::ep=2168" or similar formats
  let formattedId = episodeId;
  
  // If episode ID contains "::" format, we need to extract just the ep number
  if (episodeId.includes('::')) {
    // Keep the full ID as is - the API might need it this way
    formattedId = episodeId;
  }
  
  // Try with hd-1, hd-2 servers first as they're more reliable
  return apiFetch(`/stream?id=${formattedId}&server=${server}&type=${category}`);
}

// Fetch category (e.g., top-airing, most-popular, etc.)
export async function fetchCategory(category: string, page = 1) {
  return apiFetch(`/${category}?page=${page}`);
}

// Fetch genre list
export async function fetchGenres() {
  return apiFetch('/genre');
}

// Fetch anime by genre
export async function fetchByGenre(genre: string, page = 1) {
  return apiFetch(`/genre/${genre}?page=${page}`);
}

// Fetch AZ list
export async function fetchAZList(letter: string, page = 1) {
  return apiFetch(`/az-list/${letter}?page=${page}`);
}

// Fetch schedule (not in v1 API but keeping for compatibility - will return empty)
export async function fetchSchedule(date: string) {
  // The v1 API doesn't have a schedule endpoint
  // Return empty data structure
  return { success: true, data: { scheduledAnimes: [] } };
}

// Get current API base
export function getCurrentApiBase() {
  return API_BASE;
}
