import { Link, useLocation } from "react-router-dom";
import { Settings, Home, BarChart3, Linkedin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

// Deloitte Logo Component
const DeloitteLogo = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 200 100"
    className={className}
    fill="currentColor"
    preserveAspectRatio="none"
    style={{ width: '36px', height: '24px' }}
  >
    <path
      d="M20 10 C20 10, 20 10, 20 10
         L20 90
         C20 90, 20 90, 20 90
         L80 90
         C120 90, 140 70, 140 50
         C140 30, 120 10, 80 10
         L20 10 Z
         M40 25
         L75 25
         C105 25, 120 35, 120 50
         C120 65, 105 75, 75 75
         L40 75
         L40 25 Z"
      fill="#000000"
    />
    <circle cx="160" cy="50" r="12" fill="#86BC25" />
  </svg>
);

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
              <DeloitteLogo className="" />
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
              {location.pathname !== "/entrevistas" && (
                <Link to="/entrevistas">
                  <Button variant="secondary" size="sm" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Entrevistas
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
          <div className="text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              Desenvolvido por{" "}
              <a
                href="https://www.linkedin.com/in/aderilsojunior/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                <Linkedin className="w-4 h-4" />
                Aderilso Junior
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}