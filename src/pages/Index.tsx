import React from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import HeroSection from '@/components/home/HeroSection';
import { TrendingSection, NewReleasesSection, DonghuaSection } from '@/components/home/AnimeSection';

export default function Index() {
  return (
    <div className="min-h-screen theme-transition">
      <Header />
      
      <main>
        <HeroSection />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <TrendingSection />
          <NewReleasesSection />
          <DonghuaSection />
        </motion.div>

        {/* Footer */}
        <footer className="border-t border-border mt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  AniCrew
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your ultimate anime & donghua streaming destination
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">About</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              </div>
            </div>
            <div className="text-center text-xs text-muted-foreground mt-8">
              © 2024 AniCrew. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
