import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AIPlanner from "./pages/AIPlanner";
import Explore from "./pages/Explore";
import Maps from "./pages/Maps";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Auth from "./pages/Auth";
import ChatBot from "./pages/ChatBot";
import NotFound from "./pages/NotFound";
import PackageDetails from "./pages/PackageDetails";
import BookingsPage from "./pages/BookingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ai-planner" element={<AIPlanner />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/package/:id" element={<PackageDetails />} />
          <Route path="/bookings" element={<BookingsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;