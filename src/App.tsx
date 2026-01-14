import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import AnimeDetails from "./pages/AnimeDetails";
import WatchPage from "./pages/WatchPage";
import LoginPage from "./pages/LoginPage";
import BrowsePage from "./pages/BrowsePage";
import WatchlistPage from "./pages/WatchlistPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/anime" element={<BrowsePage type="anime" />} />
              <Route path="/donghua" element={<BrowsePage type="donghua" />} />
              <Route path="/anime/:id" element={<AnimeDetails />} />
              <Route path="/watch/:id/:episode" element={<WatchPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
