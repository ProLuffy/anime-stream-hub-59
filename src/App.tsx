import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { useIntro } from "@/hooks/useIntro";
import CinematicIntro from "@/components/intro/CinematicIntro";
import Index from "./pages/Index";
import AnimeDetailsLive from "./pages/AnimeDetailsLive";
import WatchPageLive from "./pages/WatchPageLive";
import LoginPage from "./pages/LoginPage";
import BrowsePageLive from "./pages/BrowsePageLive";
import WatchlistPage from "./pages/WatchlistPage";
import SettingsPage from "./pages/SettingsPage";
import GenrePage from "./pages/GenrePage";
import SchedulePage from "./pages/SchedulePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { hasSeenIntro, isLoading, markIntroAsSeen } = useIntro();
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = () => {
    markIntroAsSeen();
    setIntroComplete(true);
  };

  // Show intro only on first visit
  const showIntro = !isLoading && !hasSeenIntro && !introComplete;

  return (
    <>
      {showIntro && <CinematicIntro onComplete={handleIntroComplete} />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/anime/:id" element={<AnimeDetailsLive />} />
        <Route path="/watch/:id/:episodeId" element={<WatchPageLive />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/genre/:genre" element={<GenrePage />} />
        <Route path="/genre" element={<GenrePage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        
        {/* Category Pages */}
        <Route path="/category/top-airing" element={<BrowsePageLive category="top-airing" title="Top Airing" />} />
        <Route path="/category/most-popular" element={<BrowsePageLive category="most-popular" title="Most Popular" />} />
        <Route path="/category/recently-updated" element={<BrowsePageLive category="recently-updated" title="Recently Updated" />} />
        <Route path="/category/top-upcoming" element={<BrowsePageLive category="top-upcoming" title="Top Upcoming" />} />
        <Route path="/category/trending" element={<BrowsePageLive category="top-airing" title="Trending" />} />
        
        <Route path="/search" element={<BrowsePageLive category="top-airing" title="Search Results" />} />
        <Route path="/anime" element={<BrowsePageLive category="top-airing" title="Anime" />} />
        <Route path="/donghua" element={<BrowsePageLive category="top-airing" title="Donghua" />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
