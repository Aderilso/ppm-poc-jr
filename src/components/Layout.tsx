import { Link, useLocation } from "react-router-dom";
import { Settings, Home, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="w-6 h-6" />
              <h1 className="text-xl font-bold">Pesquisa PPM</h1>
            </Link>
            
            <div className="flex items-center gap-2">
              {location.pathname !== "/" && (
                <Link to="/">
                  <Button variant="secondary" size="sm" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Home
                  </Button>
                </Link>
              )}
              {location.pathname !== "/dashboard" && (
                <Link to="/dashboard">
                  <Button variant="secondary" size="sm" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              )}
              {location.pathname !== "/config" && (
                <Link to="/config">
                  <Button variant="secondary" size="sm" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted mt-16">
        <div className="container mx-auto px-4 py-6">

        </div>
      </footer>
    </div>
  );
}