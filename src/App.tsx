import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useOnlineSync } from "@/hooks/useOnlineSync";
import InstallPrompt from "@/components/InstallPrompt";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import PlanningDashboard from "./pages/PlanningDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchInterval: 30_000, // Auto-refresh every 30s
      staleTime: 10_000,
      retry: 3,
    },
  },
});

function SyncManager() {
  useOnlineSync();
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SyncManager />
        <InstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/planning" element={<PlanningDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/procurement" element={<ProcurementDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
