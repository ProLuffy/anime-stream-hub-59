import { useState, useEffect } from 'react';

const INTRO_STORAGE_KEY = 'anicrew-intro-shown';

export function useIntro() {
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem(INTRO_STORAGE_KEY);
    setHasSeenIntro(seen === 'true');
  }, []);

  const markIntroAsSeen = () => {
    localStorage.setItem(INTRO_STORAGE_KEY, 'true');
    setHasSeenIntro(true);
  };

  const resetIntro = () => {
    localStorage.removeItem(INTRO_STORAGE_KEY);
    setHasSeenIntro(false);
  };

  return {
    hasSeenIntro,
    isLoading: hasSeenIntro === null,
    markIntroAsSeen,
    resetIntro,
  };
}
