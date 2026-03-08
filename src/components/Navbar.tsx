import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Ticket, ExternalLink } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'SM Lucky Draw', href: 'https://smluckydraw.netlify.app/', icon: Ticket, external: true },
];

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="w-full bg-background/95 backdrop-blur-md border-b border-primary/30 shadow-[0_2px_10px_rgba(255,215,0,0.15)] z-[60] relative">
      <div className="flex items-center justify-center gap-2 px-3 h-10 overflow-x-auto scrollbar-hide">
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors whitespace-nowrap border border-primary/30"
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {link.label}
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            );
          }

          return (
            <button
              key={link.label}
              onClick={() => navigate(link.path!)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-colors whitespace-nowrap border ${
                isActive
                  ? 'bg-primary/20 text-primary border-primary/50'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10 border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {link.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
