import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Film, Tv, Plus, Upload, Link, Languages, Music, 
  Subtitles, Loader2, Check, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface AddEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenThumbnailStudio: () => void;
}

interface EpisodeData {
  type: 'anime' | 'donghua';
  title: string;
  episodeNumber: number;
  language: string;
  streamUrl: string;
  downloadUrl: string;
  customAudio: {
    enabled: boolean;
    url: string;
    language: string;
  };
  customSubtitle: {
    enabled: boolean;
    url: string;
    language: string;
    autoGenerate: boolean;
  };
  thumbnail: string | null;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
];

export default function AddEpisodeModal({
  isOpen,
  onClose,
  onOpenThumbnailStudio,
}: AddEpisodeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<EpisodeData>({
    type: 'anime',
    title: '',
    episodeNumber: 1,
    language: 'ja',
    streamUrl: '',
    downloadUrl: '',
    customAudio: {
      enabled: false,
      url: '',
      language: 'hi',
    },
    customSubtitle: {
      enabled: false,
      url: '',
      language: 'hi',
      autoGenerate: false,
    },
    thumbnail: null,
  });

  const handleSubmit = async () => {
    if (!data.title || !data.streamUrl) {
      toast.error('Please fill in required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Save to localStorage for demo
    const episodes = JSON.parse(localStorage.getItem('custom-episodes') || '[]');
    episodes.push({
      id: crypto.randomUUID(),
      ...data,
      createdAt: Date.now(),
    });
    localStorage.setItem('custom-episodes', JSON.stringify(episodes));
    
    toast.success(`Episode ${data.episodeNumber} of ${data.title} added!`);
    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setData({
      type: 'anime',
      title: '',
      episodeNumber: 1,
      language: 'ja',
      streamUrl: '',
      downloadUrl: '',
      customAudio: { enabled: false, url: '', language: 'hi' },
      customSubtitle: { enabled: false, url: '', language: 'hi', autoGenerate: false },
      thumbnail: null,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl my-8"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Add Episode</h2>
                  <p className="text-sm text-muted-foreground">Add custom content with audio/subtitles</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Type Toggle */}
              <div>
                <label className="block text-sm font-medium mb-2">Content Type</label>
                <div className="flex bg-secondary/50 rounded-xl p-1">
                  <button
                    onClick={() => setData(d => ({ ...d, type: 'anime' }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      data.type === 'anime' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    Anime
                  </button>
                  <button
                    onClick={() => setData(d => ({ ...d, type: 'donghua' }))}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                      data.type === 'donghua' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    Donghua
                  </button>
                </div>
              </div>

              {/* Title & Episode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={data.title}
                    onChange={e => setData(d => ({ ...d, title: e.target.value }))}
                    placeholder="e.g., Solo Leveling"
                    className="w-full px-4 py-3 rounded-xl bg-secondary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Episode Number *</label>
                  <input
                    type="number"
                    min="1"
                    value={data.episodeNumber}
                    onChange={e => setData(d => ({ ...d, episodeNumber: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-3 rounded-xl bg-secondary outline-none"
                  />
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium mb-2">Primary Language</label>
                <select
                  value={data.language}
                  onChange={e => setData(d => ({ ...d, language: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-secondary outline-none"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              {/* Stream URL */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Stream Embed URL *
                </label>
                <input
                  type="url"
                  value={data.streamUrl}
                  onChange={e => setData(d => ({ ...d, streamUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl bg-secondary outline-none"
                />
              </div>

              {/* Download URL */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Download URL (Optional)
                </label>
                <input
                  type="url"
                  value={data.downloadUrl}
                  onChange={e => setData(d => ({ ...d, downloadUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl bg-secondary outline-none"
                />
              </div>

              {/* Custom Audio */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-green-500" />
                    <span className="font-medium">Custom Audio</span>
                  </div>
                  <button
                    onClick={() => setData(d => ({ ...d, customAudio: { ...d.customAudio, enabled: !d.customAudio.enabled } }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      data.customAudio.enabled ? 'bg-green-500' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      data.customAudio.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                {data.customAudio.enabled && (
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={data.customAudio.url}
                      onChange={e => setData(d => ({ ...d, customAudio: { ...d.customAudio, url: e.target.value } }))}
                      placeholder="Audio URL (MP3/Google Drive)"
                      className="w-full px-4 py-2 rounded-lg bg-secondary outline-none"
                    />
                    <select
                      value={data.customAudio.language}
                      onChange={e => setData(d => ({ ...d, customAudio: { ...d.customAudio, language: e.target.value } }))}
                      className="w-full px-4 py-2 rounded-lg bg-secondary outline-none"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Custom Subtitle */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Subtitles className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Custom Subtitle</span>
                  </div>
                  <button
                    onClick={() => setData(d => ({ ...d, customSubtitle: { ...d.customSubtitle, enabled: !d.customSubtitle.enabled } }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      data.customSubtitle.enabled ? 'bg-purple-500' : 'bg-muted'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      data.customSubtitle.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
                
                {data.customSubtitle.enabled && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
                      <input
                        type="checkbox"
                        checked={data.customSubtitle.autoGenerate}
                        onChange={e => setData(d => ({ ...d, customSubtitle: { ...d.customSubtitle, autoGenerate: e.target.checked, url: '' } }))}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Auto-generate with Gemini AI</span>
                    </div>
                    
                    {!data.customSubtitle.autoGenerate && (
                      <input
                        type="url"
                        value={data.customSubtitle.url}
                        onChange={e => setData(d => ({ ...d, customSubtitle: { ...d.customSubtitle, url: e.target.value } }))}
                        placeholder="Subtitle URL (.vtt, .srt, .ass)"
                        className="w-full px-4 py-2 rounded-lg bg-secondary outline-none"
                      />
                    )}
                    
                    <select
                      value={data.customSubtitle.language}
                      onChange={e => setData(d => ({ ...d, customSubtitle: { ...d.customSubtitle, language: e.target.value } }))}
                      className="w-full px-4 py-2 rounded-lg bg-secondary outline-none"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Episode Thumbnail</span>
                  </div>
                  <button
                    onClick={onOpenThumbnailStudio}
                    className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                  >
                    Open Thumbnail Studio
                  </button>
                </div>
                
                {data.thumbnail && (
                  <div className="mt-4">
                    <img 
                      src={data.thumbnail} 
                      alt="Thumbnail preview" 
                      className="w-full aspect-video rounded-lg object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-secondary hover:bg-secondary/80 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !data.title || !data.streamUrl}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Add Episode
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
