import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ReviewDetail from "./pages/ReviewDetail";
import NewsFeed from "./pages/NewsFeed";
import NewsDetail from "./pages/NewsDetail";
import MovieUpdates from "./pages/MovieUpdates";
import Footer from "./components/Footer";
import { MobileNavbar } from "./components/MobileNavbar";
import { GlobalNotificationListener } from "./components/GlobalNotificationListener";
import { 
  FestivalProvider, 
  FestivalBanner, 
  FestivalParticles, 
  FestivalOverlay
} from "./components/festival";
import { useAutoSubscribe } from "./hooks/useAutoSubscribe";

const queryClient = new QueryClient();

const App = () => {
  useAutoSubscribe();
  
  return (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
        <FestivalProvider>
          <Toaster />
          <Sonner />
          
          {/* Festival Decorations */}
          <FestivalOverlay />
          <FestivalParticles />
          <FestivalBanner />
          
          <BrowserRouter>
            <GlobalNotificationListener />
            <div className="flex flex-col min-h-screen relative z-10">
              <div className="flex-1 pb-20 md:pb-0">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/review/:id" element={<ReviewDetail />} />
                  <Route path="/updates" element={<MovieUpdates />} />
                  <Route path="/news" element={<NewsFeed />} />
                  <Route path="/news/:id" element={<NewsDetail />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <MobileNavbar />
            </div>
          </BrowserRouter>
        </FestivalProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
};

export default App;
