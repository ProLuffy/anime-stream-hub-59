// Stream Resolver with Auto-Retry functionality
// Automatically tries different server/category combinations when stream fails

const API_BASE = 'https://hianime-api-seven-teal.vercel.app';

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
  
  for (const server of SERVER_PRIORITY) {
    for (const category of CATEGORY_PRIORITY) {
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
    const url = `${API_BASE}/api/v1/stream?id=${episodeId}&server=${server}&type=${category}`;
    console.log(`[StreamResolver] Trying: ${server}/${category}`);
    
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(8000), // 8 second timeout per attempt
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data?.sources?.length) {
      throw new Error('No sources in response');
    }
    
    return {
      success: true,
      sources: data.data.sources,
      subtitles: data.data.tracks || data.data.subtitles || [],
      intro: data.data.intro,
      outro: data.data.outro,
      server,
      category,
    };
  } catch (error: any) {
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
      console.log(`[StreamResolver] Success with ${combo.server}/${combo.category}`);
      return result;
    }
    
    console.log(`[StreamResolver] Failed ${combo.server}/${combo.category}: ${result.error}`);
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
  // Try top 3 servers in parallel for the preferred category
  const topServers = SERVER_PRIORITY.slice(0, 3);
  
  const promises = topServers.map(server => 
    tryStreamSource(episodeId, server, preferredCategory)
  );
  
  const results = await Promise.all(promises);
  
  // Find first successful result
  const success = results.find(r => r.success);
  if (success) {
    return success;
  }
  
  // If all failed, try other categories
  console.log('[StreamResolver] Fast resolve failed, trying full resolver...');
  return resolveStream(episodeId, undefined, preferredCategory);
}

// Get available servers for an episode
export async function getAvailableServers(episodeId: string): Promise<{ server: string; category: string }[]> {
  const available: { server: string; category: string }[] = [];
  
  // Quick check of each server (just sub category)
  const checks = SERVER_PRIORITY.map(async server => {
    const result = await tryStreamSource(episodeId, server, 'sub');
    if (result.success) {
      available.push({ server, category: 'sub' });
    }
  });
  
  await Promise.all(checks);
  return available;
}

export { SERVER_PRIORITY, CATEGORY_PRIORITY };
