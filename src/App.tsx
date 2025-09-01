import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "./pages/Home";
import Config from "./pages/Config";
import Dashboard from "./pages/Dashboard";
import F1 from "./pages/F1";
import F2 from "./pages/F2";
import F3 from "./pages/F3";
import Resumo from "./pages/Resumo";
import Entrevistas from "./pages/Entrevistas";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 30000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

const App = () => {
  console.log("🚀 App.tsx está sendo renderizado!");
  
  // Capturar erros globais
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("❌ Erro global capturado:", event.error);
      console.error("❌ Stack trace:", event.error?.stack);
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("❌ Promise rejeitada não tratada:", event.reason);
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  // Log das rotas para debug
  console.log("🔍 App - Rotas configuradas:", [
    { path: "/", component: "Home" },
    { path: "/f1", component: "F1" },
    { path: "/f2", component: "F2" },
    { path: "/f3", component: "F3" },
    { path: "/config", component: "Config" },
    { path: "/dashboard", component: "Dashboard" },
    { path: "/resumo", component: "Resumo" },
    { path: "/entrevistas", component: "Entrevistas" }
  ]);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/config" element={<Config />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/f1" element={<F1 />} />
              <Route path="/f2" element={<F2 />} />
              <Route path="/f3" element={<F3 />} />
              <Route path="/resumo" element={<Resumo />} />
              <Route path="/entrevistas" element={<Entrevistas />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
