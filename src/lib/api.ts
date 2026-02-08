// HiAnime API Service
// API Base: https://hianimeapi-1vww.onrender.com/api/v1

const API_BASE = 'https://hianimeapi-1vww.onrender.com';

// CORS proxy configs - each has different URL encoding requirements
interface ProxyConfig {
  prefix: string;
  encode: boolean;
}

// Order matters: codetabs works best, direct as fast fallback
const CORS_PROXIES: ProxyConfig[] = [
  { prefix: 'https://api.codetabs.com/v1/proxy?quest=', encode: false },
  { prefix: '', encode: false }, // Direct - works when no CORS block
  { prefix: 'https://api.allorigins.win/raw?url=', encode: true },
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

// Re-export apiFetch for use by streamResolver
export { apiFetch };

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
    // Original API v2 keys
    spotlight?: SpotlightAnime[];
    trending?: AnimeResult[];
    topAiring?: AnimeResult[];
    latestEpisodes?: AnimeResult[];
    mostPopular?: AnimeResult[];
    mostFavorite?: AnimeResult[];
    latestCompleted?: AnimeResult[];
    topUpcoming?: AnimeResult[];
    // API v1 keys with "Animes" suffix
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
    // Actual API response keys (no suffix)
    latestEpisode?: AnimeResult[];
    newAdded?: AnimeResult[];
    genres?: string[];
    featuredAnimes?: {
      topAiringAnimes?: AnimeResult[];
      mostPopularAnimes?: AnimeResult[];
    };
  };
}

// Helper function to make API calls with CORS proxy fallback
async function apiFetch(endpoint: string, retries = 1): Promise<any> {
  const fullUrl = `${API_BASE}/api/v1${endpoint}`;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    for (const proxy of CORS_PROXIES) {
      try {
        const targetUrl = proxy.encode ? encodeURIComponent(fullUrl) : fullUrl;
        const url = proxy.prefix ? `${proxy.prefix}${targetUrl}` : fullUrl;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout - fast fail
        
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        
        // Detect HTML responses (Render cold start returns HTML loading page)
        const contentType = res.headers.get('content-type') || '';
        const text = await res.text();
        
        if (text.trimStart().startsWith('<!') || text.trimStart().startsWith('<html')) {
          throw new Error('Got HTML instead of JSON - backend cold starting');
        }
        
        const data = JSON.parse(text);
        console.log('✅ API Response from:', proxy.prefix || 'direct');
        return data;
      } catch (error: any) {
        lastError = error;
        continue;
      }
    }
    
    // Brief wait before retry
    if (attempt < retries) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  throw lastError || new Error('All API proxies failed');
}

// Fetch home data (trending, spotlight, top airing, latest episodes)
export async function fetchHomeData(): Promise<HomeData> {
  const data = await apiFetch('/home');
  console.log('Home API Response:', data);
  return data;
}

// Search anime
export async function searchAnime(query: string, page = 1) {
  // Expand abbreviations before searching
  const expandedQuery = expandAbbreviation(query);
  return apiFetch(`/search?keyword=${encodeURIComponent(expandedQuery)}&page=${page}`);
}

// Search suggestions (lightweight autocomplete)
export async function searchSuggestion(query: string) {
  const expandedQuery = expandAbbreviation(query);
  try {
    return await apiFetch(`/search/suggestion?keyword=${encodeURIComponent(expandedQuery)}`);
  } catch {
    // Fallback to full search if suggestion endpoint doesn't exist
    return searchAnime(expandedQuery, 1);
  }
}

// Common anime abbreviations map
const ANIME_ABBREVIATIONS: Record<string, string> = {
  'opm': 'One Punch Man',
  'op': 'One Piece',
  'aot': 'Attack on Titan',
  'snk': 'Shingeki no Kyojin',
  'mha': 'My Hero Academia',
  'bnha': 'Boku no Hero Academia',
  'jjk': 'Jujutsu Kaisen',
  'ds': 'Demon Slayer',
  'kny': 'Kimetsu no Yaiba',
  'sao': 'Sword Art Online',
  'fmab': 'Fullmetal Alchemist Brotherhood',
  'fma': 'Fullmetal Alchemist',
  'hxh': 'Hunter x Hunter',
  'dbz': 'Dragon Ball Z',
  'dbs': 'Dragon Ball Super',
  'db': 'Dragon Ball',
  'sl': 'Solo Leveling',
  'bc': 'Black Clover',
  'csm': 'Chainsaw Man',
  'spy': 'Spy x Family',
  'spyxfamily': 'Spy x Family',
  'ror': 'Record of Ragnarok',
  'tog': 'Tower of God',
  'tg': 'Tokyo Ghoul',
  're0': 'Re:Zero',
  'rezero': 'Re:Zero',
  'konosuba': 'Konosuba',
  'shield hero': 'The Rising of the Shield Hero',
  'overlord': 'Overlord',
  'mushoku': 'Mushoku Tensei',
  'mt': 'Mushoku Tensei',
  'isekai ojisan': 'Uncle from Another World',
  'ttigraas': 'That Time I Got Reincarnated as a Slime',
  'slime': 'That Time I Got Reincarnated as a Slime',
  'tensura': 'That Time I Got Reincarnated as a Slime',
  'nge': 'Neon Genesis Evangelion',
  'eva': 'Neon Genesis Evangelion',
  'bebop': 'Cowboy Bebop',
  'cb': 'Cowboy Bebop',
  'naruto': 'Naruto',
  'ns': 'Naruto Shippuden',
  'bleach': 'Bleach',
  'tybw': 'Bleach Thousand Year Blood War',
  'dandadan': 'Dandadan',
  'frieren': 'Frieren',
  'oshi no ko': 'Oshi no Ko',
  'onk': 'Oshi no Ko',
  'vinland': 'Vinland Saga',
  'dr stone': 'Dr. Stone',
  'mob': 'Mob Psycho 100',
  'mp100': 'Mob Psycho 100',
  'odd taxi': 'Odd Taxi',
  'blue lock': 'Blue Lock',
  'bl': 'Blue Lock',
  'ft': 'Fairy Tail',
  'yyh': 'Yu Yu Hakusho',
  'ygo': 'Yu-Gi-Oh',
  'zom100': 'Zom 100',
  'classroom': 'Assassination Classroom',
  'assclass': 'Assassination Classroom',
  'steins gate': 'Steins;Gate',
  'sg': 'Steins;Gate',
  'cote': 'Classroom of the Elite',
  'tbhk': 'Toilet-Bound Hanako-kun',
  'hell paradise': 'Hell\'s Paradise',
  'hp': 'Hell\'s Paradise',
  'wind breaker': 'Wind Breaker',
  'wb': 'Wind Breaker',
  'kaiju': 'Kaiju No. 8',
};

function expandAbbreviation(query: string): string {
  const lower = query.trim().toLowerCase();
  return ANIME_ABBREVIATIONS[lower] || query;
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
