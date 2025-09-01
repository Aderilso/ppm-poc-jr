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

// Componente de teste simples
const TestComponent = () => {
  console.log("🧪 TestComponent renderizado!");
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue' }}>🧪 Teste do Sistema PPM</h1>
      <p>Se você está vendo esta mensagem, o React está funcionando!</p>
      <p>Backend: ✅ Rodando na porta 3001</p>
      <p>Frontend: ✅ Rodando na porta 8080</p>
      <button 
        onClick={() => alert('Sistema funcionando!')}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: 'green', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Testar Sistema
      </button>
    </div>
  );
};

const App = () => {
  console.log("🚀 App.tsx está sendo renderizado!");
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<TestComponent />} />
              <Route path="/home" element={<Home />} />
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
