import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Ticket, Menu, X, ExternalLink } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'SM Lucky Draw', href: 'https://smluckydraw.netlify.app/', icon: Ticket, external: true },
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-background/95 backdrop-blur-md border-b border-primary/30 shadow-[0_2px_10px_rgba(255,215,0,0.15)] z-[60] relative">
      <div className="container mx-auto px-4 flex items-center justify-between h-10">
        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = !link.external && location.pathname === link.path;

            if (link.external) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              );
            }

            return (
              <button
                key={link.label}
                onClick={() => navigate(link.path!)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden text-primary p-1"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <span className="sm:hidden text-xs font-bold text-primary tracking-wider">MENU</span>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-background border-b border-primary/30 shadow-lg z-[60] animate-fade-in">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;

            if (link.external) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-primary hover:bg-primary/10 border-b border-primary/10"
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              );
            }

            return (
              <button
                key={link.label}
                onClick={() => {
                  navigate(link.path!);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-5 py-3 w-full text-left text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 border-b border-primary/10"
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
