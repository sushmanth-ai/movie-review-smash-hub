import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ReviewDetail from "./pages/ReviewDetail";
import AuthPage from "./pages/AuthPage";
import PredictionsPage from "./pages/PredictionsPage";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import { 
  FestivalProvider, 
  FestivalBanner, 
  FestivalParticles, 
  FestivalOverlay
} from "./components/festival";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <FestivalProvider>
          <Toaster />
          <Sonner />
          
          {/* Festival Decorations */}
          <FestivalOverlay />
          <FestivalParticles />
          <FestivalBanner />
          
          <BrowserRouter>
            <div className="flex flex-col min-h-screen relative z-10">
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/review/:id" element={<ReviewDetail />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/predictions" element={<PredictionsPage />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </FestivalProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
