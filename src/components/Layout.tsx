import { Link, useLocation } from "react-router-dom";
import { Linkedin } from "lucide-react";

// Deloitte Logo Component (carrega SVG oficial por URL)
const DeloitteLogo = ({ className }: { className?: string }) => (
  <img
    src="https://www.deloitte.com/content/dam/assets-shared/logos/svg/a-d/deloitte.svg"
    alt="Deloitte"
    className={className ? className : ''}
    style={{ height: '22px', width: 'auto' }}
    loading="lazy"
    crossOrigin="anonymous"
  />
);

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/entrevistas", label: "Entrevistas" },
    { to: "/resumo", label: "Relatórios" },
    { to: "/config", label: "Configurações" },
  ];

  const isActive = (to: string) => (location.pathname === to) || (to !== '/' && location.pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header style inspirado no exemplo: fundo preto + destaque verde */}
      <header className="sticky top-0 z-40 bg-black text-zinc-100 border-b border-zinc-800/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-3">
              <DeloitteLogo />
              <span className="sr-only">Ir para Home</span>
            </Link>
            <nav aria-label="Main" className="hidden md:block">
              <ul className="flex items-center gap-6">
                {links.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      aria-current={isActive(link.to) ? 'page' : undefined}
                      className={[
                        'relative group px-1 py-2 text-sm font-medium transition-colors',
                        'after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-lime-500 after:transition-all',
                        'hover:text-lime-400 group-hover:after:w-full',
                        isActive(link.to) ? 'text-lime-400 after:w-full' : 'text-zinc-300'
                      ].join(' ')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1 w-full">
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
