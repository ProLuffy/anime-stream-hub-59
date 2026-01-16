import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import HeroSectionLive from '@/components/home/HeroSectionLive';
import ContinueWatchingSection from '@/components/home/ContinueWatchingSection';
import { 
  TrendingSectionLive, 
  TopAiringSectionLive, 
  LatestEpisodesSectionLive,
  MostPopularSectionLive
} from '@/components/home/AnimeSectionLive';
import { FooterDisclaimer } from '@/components/ui/Disclaimer';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { isLoggedIn } = useAuth();
  
  return (
    <div className="min-h-screen theme-transition">
      <Header />
      
      <main>
        <HeroSectionLive />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Continue Watching - only for logged in users */}
          {isLoggedIn && <ContinueWatchingSection />}
          
          <TrendingSectionLive />
          <TopAiringSectionLive />
          <LatestEpisodesSectionLive />
          <MostPopularSectionLive />
        </motion.div>

        {/* Footer */}
        <footer className="border-t border-border mt-12">
          <div className="container mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AniCrew
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Anime discovery & metadata index
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">About</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">DMCA</a>
              </div>
            </div>
            <FooterDisclaimer />
            <div className="text-center text-xs text-muted-foreground mt-6">
              © 2026 AniCrew. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
