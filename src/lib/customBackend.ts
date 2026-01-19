// Custom Backend API for Hindi Audio/Subtitles Overlay
// Replace with your actual backend URL
const CUSTOM_BACKEND_URL = 'https://api.yourdomain.com';

export interface CustomStreamData {
  hasCustomAudio: boolean;
  audioUrl?: string; // Google Drive/MP3 URL for Hindi audio
  audioLang?: string;
  hasCustomSubtitle: boolean;
  subtitleUrl?: string; // .vtt URL for Hindi subtitles
  subtitleLang?: string;
}

export interface MuxingResponse {
  success: boolean;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  downloadUrl?: string;
  message?: string;
}

export interface AdminAudioData {
  animeId: string;
  animeName: string;
  season: number;
  episode: number;
  audioUrl: string;
  audioLang: string;
}

export interface AdminSubtitleData {
  animeId: string;
  animeName: string;
  season: number;
  episode: number;
  subtitleUrl?: string;
  generateWithAI: boolean;
  videoUrl?: string; // For AI subtitle generation
}

// Fetch custom stream data (audio/subtitle overlay)
export async function fetchCustomStreamData(episodeId: string, lang: string = 'hindi'): Promise<CustomStreamData> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/player/stream?episodeId=${encodeURIComponent(episodeId)}&lang=${lang}`);
    
    if (!response.ok) {
      return { hasCustomAudio: false, hasCustomSubtitle: false };
    }
    
    const data = await response.json();
    return {
      hasCustomAudio: !!data.audioUrl,
      audioUrl: data.audioUrl,
      audioLang: data.audioLang || 'Hindi',
      hasCustomSubtitle: !!data.subtitleUrl,
      subtitleUrl: data.subtitleUrl,
      subtitleLang: data.subtitleLang || 'Hindi',
    };
  } catch (error) {
    console.log('Custom backend not available, using default stream');
    return { hasCustomAudio: false, hasCustomSubtitle: false };
  }
}

// Request muxed download (combines video + audio + subtitles)
export async function requestMuxedDownload(
  hianimeUrl: string,
  audioUrl?: string,
  subtitleUrl?: string
): Promise<MuxingResponse> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/download/mux`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hianimeUrl,
        audioUrl,
        subtitleUrl,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Muxing request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Muxing error:', error);
    return {
      success: false,
      status: 'failed',
      message: 'Failed to initiate muxing. Please try again.',
    };
  }
}

// Poll for muxing status
export async function checkMuxingStatus(jobId: string): Promise<MuxingResponse> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/download/status/${jobId}`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      status: 'failed',
      message: 'Failed to check status',
    };
  }
}

// Admin: Add custom audio to an episode
export async function addCustomAudio(data: AdminAudioData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/admin/audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Failed to add audio' };
  }
}

// Admin: Add/Generate subtitles for an episode
export async function addCustomSubtitle(data: AdminSubtitleData): Promise<{ success: boolean; message: string; subtitleUrl?: string }> {
  try {
    const endpoint = data.generateWithAI 
      ? `${CUSTOM_BACKEND_URL}/api/admin/subtitle/generate`
      : `${CUSTOM_BACKEND_URL}/api/admin/subtitle`;
      
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Failed to add subtitle' };
  }
}

// Get backend base URL (for configuration)
export function getCustomBackendUrl(): string {
  return CUSTOM_BACKEND_URL;
}
