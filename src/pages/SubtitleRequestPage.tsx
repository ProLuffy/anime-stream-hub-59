import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Subtitles, Crown, Loader2, Check, Languages, ArrowLeft, 
  Sparkles, AlertCircle, Film, List
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SubtitleRequest {
  id: string;
  animeId: string;
  animeName: string;
  episodeId?: string;
  episodeNumber?: number;
  language: string;
  scope: 'single' | 'series';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: number;
  completedAt?: number;
}

const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
];

export default function SubtitleRequestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isPremium } = useAuth();
  
  const animeId = searchParams.get('animeId') || '';
  const animeName = searchParams.get('animeName') || 'Unknown Anime';
  const episodeId = searchParams.get('episodeId') || '';
  const episodeNumber = searchParams.get('episodeNumber') || '1';
  
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [scope, setScope] = useState<'single' | 'series'>('single');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Get existing requests from localStorage
  const [requests, setRequests] = useState<SubtitleRequest[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('subtitle-requests') || '[]');
    } catch {
      return [];
    }
  });
  
  const myRequests = requests.filter(r => r.animeId === animeId);

  if (!isPremium) {
    return (
      <div className="min-h-screen theme-transition">
        <Header />
        <main className="pt-24 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md px-4"
          >
            <Crown className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Premium Feature</h1>
            <p className="text-muted-foreground mb-6">
              Subtitle requests are available only for Premium users.
              Upgrade now to request AI-generated subtitles in any language!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/premium')}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </motion.button>
          </motion.div>
        </main>
      </div>
    );
  }

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call to backend which triggers Gemini
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newRequest: SubtitleRequest = {
      id: crypto.randomUUID(),
      animeId,
      animeName,
      episodeId: scope === 'single' ? episodeId : undefined,
      episodeNumber: scope === 'single' ? parseInt(episodeNumber) : undefined,
      language: selectedLanguage,
      scope,
      status: 'processing',
      requestedAt: Date.now(),
    };
    
    const updatedRequests = [newRequest, ...requests];
    setRequests(updatedRequests);
    localStorage.setItem('subtitle-requests', JSON.stringify(updatedRequests));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    toast.success('Subtitle request submitted! Gemini is generating your subtitles.');
    
    // Simulate completion after 5 seconds
    setTimeout(() => {
      const completed = updatedRequests.map(r => 
        r.id === newRequest.id ? { ...r, status: 'completed' as const, completedAt: Date.now() } : r
      );
      setRequests(completed);
      localStorage.setItem('subtitle-requests', JSON.stringify(completed));
      toast.success(`Subtitles for ${animeName} are ready!`);
    }, 5000);
  };

  const getLanguageName = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
  };

  const getLanguageFlag = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.flag || '🌍';
  };

  return (
    <div className="min-h-screen theme-transition">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Subtitles className="w-7 h-7 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Request Subtitles</h1>
            <p className="text-muted-foreground">
              AI-powered subtitle generation using Gemini
            </p>
          </motion.div>

          {/* Anime Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <Film className="w-10 h-10 text-primary" />
              <div>
                <h2 className="font-bold text-lg">{animeName}</h2>
                <p className="text-sm text-muted-foreground">
                  Episode {episodeNumber}
                </p>
              </div>
            </div>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Gemini is generating {getLanguageName(selectedLanguage)} subtitles for {scope === 'series' ? 'the entire series' : `Episode ${episodeNumber}`}.
                You'll be notified when ready.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate(-1)}
                  className="btn-ghost"
                >
                  Go Back
                </button>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-primary"
                >
                  Request Another
                </button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Language Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 mb-6"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5 text-primary" />
                  Select Language
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <motion.button
                      key={lang.code}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        selectedLanguage === lang.code
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'bg-secondary/50 hover:bg-secondary'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Scope Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 mb-6"
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <List className="w-5 h-5 text-primary" />
                  Subtitle Scope
                </h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setScope('single')}
                    className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${
                      scope === 'single'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <Film className="w-8 h-8" />
                    <div>
                      <p className="font-medium">Current Episode Only</p>
                      <p className={`text-sm ${scope === 'single' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        Generate subtitles for Episode {episodeNumber} only
                      </p>
                    </div>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setScope('series')}
                    className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${
                      scope === 'series'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <Sparkles className="w-8 h-8" />
                    <div>
                      <p className="font-medium">Entire Series</p>
                      <p className={`text-sm ${scope === 'series' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        Generate subtitles for all episodes (may take longer)
                      </p>
                    </div>
                  </motion.button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 
                             text-white font-bold text-lg flex items-center justify-center gap-3 
                             hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Generate with Gemini AI
                    </>
                  )}
                </button>
              </motion.div>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30"
              >
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">How it works</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-200/80">
                      <li>Your request is sent to Gemini AI for processing</li>
                      <li>AI analyzes the audio and generates accurate subtitles</li>
                      <li>Processing typically takes 2-5 minutes per episode</li>
                      <li>You'll be notified when subtitles are ready</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* My Requests */}
          {myRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <h3 className="font-semibold mb-4">Your Requests for this Anime</h3>
              <div className="space-y-3">
                {myRequests.map(req => (
                  <div key={req.id} className="glass-card p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getLanguageFlag(req.language)}</span>
                      <div>
                        <p className="font-medium">
                          {getLanguageName(req.language)} Subtitles
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {req.scope === 'series' ? 'Entire Series' : `Episode ${req.episodeNumber}`}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      req.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      req.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                      req.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {req.status === 'processing' && <Loader2 className="w-3 h-3 inline animate-spin mr-1" />}
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
