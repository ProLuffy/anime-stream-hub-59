// Stream Resolver with Auto-Retry functionality
// Automatically tries different server/category combinations when stream fails

// CORRECT HiAnime API endpoint
const API_BASE = 'https://hianimeapi-1vww.onrender.com/api/v1';

// Server priority order - most reliable first
const SERVER_PRIORITY = ['hd-1', 'hd-2', 'megacloud', 'streamsb', 'vidstreaming', 'vidcloud'];
const CATEGORY_PRIORITY = ['sub', 'dub', 'raw'];

interface StreamSource {
  url: string;
  quality?: string;
  type?: string;
}

interface StreamResult {
  success: boolean;
  sources: StreamSource[];
  subtitles: any[];
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
  server: string;
  category: string;
  error?: string;
}

// Generate all server/category combinations
function generateCombinations(): { server: string; category: string }[] {
  const combinations: { server: string; category: string }[] = [];
  
  for (const category of CATEGORY_PRIORITY) {
    for (const server of SERVER_PRIORITY) {
      combinations.push({ server, category });
    }
  }
  
  return combinations;
}

// Attempt to fetch stream from a specific server/category
async function tryStreamSource(
  episodeId: string,
  server: string,
  category: string
): Promise<StreamResult> {
  try {
    // HiAnime API format: /stream?id=EP_ID&server=SERVER&type=sub/dub
    const url = `${API_BASE}/stream?id=${encodeURIComponent(episodeId)}&server=${server}&type=${category}`;
    console.log(`[StreamResolver] Trying: ${server}/${category} - ${url}`);
    
    const response = await fetch(url, {
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout per attempt
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // HiAnime API returns { success: true, data: { sources: [...], tracks: [...] } }
    if (!data.success) {
      throw new Error(data.message || 'API returned error');
    }
    
    const sources = data.data?.sources || [];
    const tracks = data.data?.tracks || data.data?.subtitles || [];
    
    if (!sources.length) {
      throw new Error('No sources in response');
    }
    
    return {
      success: true,
      sources: sources.map((s: any) => ({
        url: s.url,
        quality: s.quality || 'auto',
        type: s.type || 'hls',
      })),
      subtitles: tracks.map((t: any) => ({
        url: t.file || t.url,
        lang: t.label || t.lang || 'English',
        label: t.label || t.lang,
        kind: t.kind || 'subtitles',
        default: t.default || false,
      })),
      intro: data.data?.intro,
      outro: data.data?.outro,
      server,
      category,
    };
  } catch (error: any) {
    console.log(`[StreamResolver] Failed ${server}/${category}: ${error.message}`);
    return {
      success: false,
      sources: [],
      subtitles: [],
      server,
      category,
      error: error.message,
    };
  }
}

// Main resolver function - tries all combinations until one works
export async function resolveStream(
  episodeId: string,
  preferredServer?: string,
  preferredCategory?: string
): Promise<StreamResult> {
  const combinations = generateCombinations();
  
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
  
  // Try each combination
  for (const combo of combinations) {
    const result = await tryStreamSource(episodeId, combo.server, combo.category);
    
    if (result.success) {
      console.log(`[StreamResolver] ✓ Success with ${combo.server}/${combo.category}`);
      return result;
    }
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

// Parallel resolver - try multiple servers at once, return first success
export async function resolveStreamFast(
  episodeId: string,
  preferredCategory: string = 'sub'
): Promise<StreamResult> {
  console.log(`[StreamResolver] Fast resolving: ${episodeId} with category: ${preferredCategory}`);
  
  // Try all servers in parallel for the preferred category
  const promises = SERVER_PRIORITY.map(server => 
    tryStreamSource(episodeId, server, preferredCategory)
  );
  
  // Race to get the first successful result
  const results = await Promise.all(promises);
  
  // Find first successful result
  const success = results.find(r => r.success);
  if (success) {
    console.log(`[StreamResolver] ✓ Fast resolve success: ${success.server}/${success.category}`);
    return success;
  }
  
  // If preferred category failed, try other categories
  console.log('[StreamResolver] Fast resolve failed for preferred category, trying others...');
  
  const otherCategories = CATEGORY_PRIORITY.filter(c => c !== preferredCategory);
  
  for (const category of otherCategories) {
    const categoryPromises = SERVER_PRIORITY.slice(0, 3).map(server => 
      tryStreamSource(episodeId, server, category)
    );
    
    const categoryResults = await Promise.all(categoryPromises);
    const categorySuccess = categoryResults.find(r => r.success);
    
    if (categorySuccess) {
      console.log(`[StreamResolver] ✓ Fallback success: ${categorySuccess.server}/${categorySuccess.category}`);
      return categorySuccess;
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
    error: 'All stream sources failed. The episode may not be available yet.',
  };
}

// Fetch episodes for an anime
export async function fetchEpisodes(animeId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/episodes/${animeId}`);
    const data = await response.json();
    
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
  const checks = SERVER_PRIORITY.slice(0, 3).map(async server => {
    const result = await tryStreamSource(episodeId, server, 'sub');
    if (result.success) {
      available.push({ server, category: 'sub' });
    }
  });
  
  await Promise.all(checks);
  return available;
}

// Get API base URL
export function getApiBaseUrl(): string {
  return API_BASE;
}

export { SERVER_PRIORITY, CATEGORY_PRIORITY };
