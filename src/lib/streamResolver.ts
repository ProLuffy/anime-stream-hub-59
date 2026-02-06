// Stream Resolver with Auto-Retry functionality
// Automatically tries different server/category combinations when stream fails

// CORS proxies - codetabs works best for this API
const CORS_PROXIES = [
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://api.allorigins.win/raw?url=',
  '', // Direct as last resort
];

// CORRECT HiAnime API endpoint
const API_BASE = 'https://hianimeapi-1vww.onrender.com/api/v1';

// Server priority order - CORRECT servers from API
export const SERVER_PRIORITY = ['hd-1', 'hd-2', 'megaplay', 'vidwish'];
export const CATEGORY_PRIORITY = ['sub', 'dub', 'raw'];

interface StreamSource {
  url: string;
  quality?: string;
  type?: string;
}

interface SubtitleTrack {
  url: string;
  lang: string;
  label: string;
  kind?: string;
  default?: boolean;
}

interface StreamResult {
  success: boolean;
  sources: StreamSource[];
  subtitles: SubtitleTrack[];
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
  server: string;
  category: string;
  error?: string;
}

// Small delay to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Attempt to fetch stream from a specific server/category
async function tryStreamSource(
  episodeId: string,
  server: string,
  category: string
): Promise<StreamResult> {
  const fullUrl = `${API_BASE}/stream?id=${encodeURIComponent(episodeId)}&server=${server}&type=${category}`;
  
  for (const proxy of CORS_PROXIES) {
    try {
      const url = proxy ? `${proxy}${encodeURIComponent(fullUrl)}` : fullUrl;
      console.log(`[StreamResolver] Trying: ${server}/${category} via ${proxy || 'direct'}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const response = await fetch(url, {
        headers: { 
          'Accept': 'application/json'
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 429) {
        throw new Error('Rate limited');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API returned error');
      }
      
      const sources = data.data?.sources || [];
      const tracks = data.data?.tracks || data.data?.subtitles || [];
      
      if (!sources.length) {
        throw new Error('No sources in response');
      }
      
      const validSources = sources.filter((s: any) => s.url && (s.url.startsWith('http') || s.url.startsWith('//')));
      if (validSources.length === 0) {
        throw new Error('No valid source URLs');
      }
      
      console.log(`[StreamResolver] ✓ Got ${validSources.length} sources from ${server}/${category}`);
      
      return {
        success: true,
        sources: validSources.map((s: any) => ({
          url: s.url.startsWith('//') ? `https:${s.url}` : s.url,
          quality: s.quality || 'auto',
          type: s.type || 'hls',
        })),
        subtitles: tracks.map((t: any) => ({
          url: t.file || t.url,
          lang: t.label || t.lang || 'English',
          label: t.label || t.lang || 'English',
          kind: t.kind || 'subtitles',
          default: t.default || false,
        })),
        intro: data.data?.intro,
        outro: data.data?.outro,
        server,
        category,
      };
    } catch (error: any) {
      const errorMsg = error.name === 'AbortError' ? 'Timeout' : error.message;
      console.log(`[StreamResolver] ✗ ${server}/${category} via ${proxy || 'direct'}: ${errorMsg}`);
      continue;
    }
  }
  
  return {
    success: false,
    sources: [],
    subtitles: [],
    server,
    category,
    error: 'All proxies failed for this server',
  };
}

// Fast resolver - try 2 servers at once to avoid rate limiting, with delays
export async function resolveStreamFast(
  episodeId: string,
  preferredCategory: string = 'sub'
): Promise<StreamResult> {
  console.log(`[StreamResolver] Fast resolving: ${episodeId} with category: ${preferredCategory}`);
  
  // Try servers sequentially with small delays to avoid rate limiting
  for (const server of SERVER_PRIORITY) {
    const result = await tryStreamSource(episodeId, server, preferredCategory);
    
    if (result.success) {
      console.log(`[StreamResolver] ✓ Success: ${result.server}/${result.category}`);
      return result;
    }
    
    // If rate limited, wait longer
    if (result.error === 'Rate limited') {
      await delay(2000);
    } else {
      await delay(300); // Small delay between requests
    }
  }
  
  // If preferred category failed, try other categories
  console.log('[StreamResolver] Trying other categories...');
  const otherCategories = CATEGORY_PRIORITY.filter(c => c !== preferredCategory);
  
  for (const category of otherCategories) {
    for (const server of SERVER_PRIORITY.slice(0, 2)) { // Only try first 2 servers
      const result = await tryStreamSource(episodeId, server, category);
      
      if (result.success) {
        console.log(`[StreamResolver] ✓ Fallback success: ${result.server}/${result.category}`);
        return result;
      }
      
      // Delay between requests
      await delay(result.error === 'Rate limited' ? 2000 : 300);
    }
  }
  
  // All failed
  console.log('[StreamResolver] ✗ All sources failed');
  return {
    success: false,
    sources: [],
    subtitles: [],
    server: 'hd-1',
    category: preferredCategory,
    error: 'Stream not available. Try a different episode or check back later.',
  };
}

// Sequential resolver - tries all combinations one by one (slower but thorough)
export async function resolveStream(
  episodeId: string,
  preferredServer?: string,
  preferredCategory?: string
): Promise<StreamResult> {
  const combinations: { server: string; category: string }[] = [];
  
  // Generate all combinations
  for (const category of CATEGORY_PRIORITY) {
    for (const server of SERVER_PRIORITY) {
      combinations.push({ server, category });
    }
  }
  
  // Move preferred combination to front if specified
  if (preferredServer && preferredCategory) {
    const preferredIndex = combinations.findIndex(
      c => c.server === preferredServer && c.category === preferredCategory
    );
    if (preferredIndex > 0) {
      const [preferred] = combinations.splice(preferredIndex, 1);
      combinations.unshift(preferred);
    }
  }
  
  // Try each combination with delays
  for (const combo of combinations) {
    const result = await tryStreamSource(episodeId, combo.server, combo.category);
    
    if (result.success) {
      return result;
    }
    
    await delay(300);
  }
  
  // All failed
  return {
    success: false,
    sources: [],
    subtitles: [],
    server: preferredServer || 'hd-1',
    category: preferredCategory || 'sub',
    error: 'All stream sources failed. Please try again later.',
  };
}

// Helper: fetch with CORS proxy fallback
async function fetchWithProxy(fullUrl: string): Promise<any> {
  for (const proxy of CORS_PROXIES) {
    try {
      const url = proxy ? `${proxy}${encodeURIComponent(fullUrl)}` : fullUrl;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch {
      continue;
    }
  }
  throw new Error('All proxies failed');
}

// Get episode servers info
export async function getEpisodeServers(episodeId: string): Promise<{
  sub: string[];
  dub: string[];
  raw: string[];
}> {
  try {
    const data = await fetchWithProxy(`${API_BASE}/servers?id=${encodeURIComponent(episodeId)}`);
    
    if (data.success && data.data) {
      return {
        sub: data.data.sub?.map((s: any) => s.serverName) || [],
        dub: data.data.dub?.map((s: any) => s.serverName) || [],
        raw: data.data.raw?.map((s: any) => s.serverName) || [],
      };
    }
  } catch (error) {
    console.error('[StreamResolver] Failed to get servers:', error);
  }
  
  return { sub: [], dub: [], raw: [] };
}

// Fetch episodes for an anime
export async function fetchEpisodes(animeId: string): Promise<any[]> {
  try {
    const data = await fetchWithProxy(`${API_BASE}/episodes/${animeId}`);
    
    if (data.success && Array.isArray(data.data)) {
      return data.data.map((ep: any) => ({
        episodeId: ep.id,
        number: ep.episodeNumber || ep.number,
        title: ep.title,
        isFiller: ep.isFiller,
      }));
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch episodes:', error);
    return [];
  }
}

// Get available servers for an episode
export async function getAvailableServers(episodeId: string): Promise<{ server: string; category: string }[]> {
  const available: { server: string; category: string }[] = [];
  
  // Quick check of each server (just sub category)
  for (const server of SERVER_PRIORITY.slice(0, 2)) {
    const result = await tryStreamSource(episodeId, server, 'sub');
    if (result.success) {
      available.push({ server, category: 'sub' });
    }
    await delay(200);
  }
  
  return available;
}

// Get API base URL
export function getApiBaseUrl(): string {
  return API_BASE;
}
