// Gemini AI Subtitle Generation Service
// This service handles AI-powered subtitle generation using Google's Gemini API

// Note: GEMINI_API_KEY should be stored as a secret in your backend
// This frontend code sends requests to your custom backend which handles the Gemini API

const CUSTOM_BACKEND_URL = 'https://api.yourdomain.com'; // Replace with your backend

export interface SubtitleRequest {
  animeId: string;
  animeName: string;
  episodeId?: string;
  episodeNumber?: number;
  language: string;
  generateForSeries: boolean;
  episodeRange?: { start: number; end: number };
  videoUrl?: string;
}

export interface SubtitleResponse {
  success: boolean;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  subtitleUrl?: string;
  message?: string;
  progress?: number;
  estimatedTime?: number;
}

export interface SubtitleTrack {
  id: string;
  language: string;
  languageCode: string;
  url: string;
  format: 'vtt' | 'srt' | 'ass';
  isAIGenerated: boolean;
  isAdminAdded: boolean;
  createdAt: number;
}

// Request AI subtitle generation
export async function requestSubtitleGeneration(request: SubtitleRequest): Promise<SubtitleResponse> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/subtitle/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit subtitle request');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Subtitle generation error:', error);
    return {
      success: false,
      status: 'failed',
      message: 'Failed to submit subtitle request. Please try again.',
    };
  }
}

// Check subtitle generation status
export async function checkSubtitleStatus(jobId: string): Promise<SubtitleResponse> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/subtitle/status/${jobId}`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      status: 'failed',
      message: 'Failed to check status',
    };
  }
}

// Get available subtitles for an episode
export async function getAvailableSubtitles(episodeId: string): Promise<SubtitleTrack[]> {
  try {
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/subtitle/list/${encodeURIComponent(episodeId)}`);
    const data = await response.json();
    return data.success ? data.subtitles : [];
  } catch (error) {
    console.error('Failed to fetch subtitles:', error);
    return [];
  }
}

// Admin: Upload custom subtitle file
export async function uploadSubtitle(
  episodeId: string,
  file: File,
  language: string
): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('episodeId', episodeId);
    formData.append('language', language);
    
    const response = await fetch(`${CUSTOM_BACKEND_URL}/api/admin/subtitle/upload`, {
      method: 'POST',
      body: formData,
    });
    
    return await response.json();
  } catch (error) {
    return { success: false, message: 'Upload failed' };
  }
}

// Languages supported for AI subtitle generation
export const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
];

// Simulate local subtitle request for demo (when backend is unavailable)
export function createLocalSubtitleRequest(request: SubtitleRequest): SubtitleResponse {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store in localStorage for demo
  const jobs = JSON.parse(localStorage.getItem('subtitle-jobs') || '[]');
  jobs.push({
    ...request,
    jobId,
    status: 'queued',
    createdAt: Date.now(),
    estimatedTime: request.generateForSeries ? 300 : 60, // 5 min for series, 1 min for episode
  });
  localStorage.setItem('subtitle-jobs', JSON.stringify(jobs));
  
  return {
    success: true,
    status: 'queued',
    jobId,
    message: `Subtitle generation queued. Job ID: ${jobId}`,
    estimatedTime: request.generateForSeries ? 300 : 60,
  };
}

// Get local subtitle jobs (for demo)
export function getLocalSubtitleJobs(): any[] {
  return JSON.parse(localStorage.getItem('subtitle-jobs') || '[]');
}
