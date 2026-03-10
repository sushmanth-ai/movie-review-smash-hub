import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, Star, Shield, Newspaper } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export const MobileNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path === '/' && location.pathname === '/') {
      e.preventDefault();
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home, id: 'home' },
    { name: 'News', path: '/news', icon: Newspaper, id: 'news' },
    { name: 'Search', path: '/#search', icon: Search, id: 'search' },
    { name: 'Reviews', path: '/#reviews', icon: Star, id: 'reviews' },
    { name: 'Admin', path: '/admin/dashboard', icon: Shield, id: 'admin' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-primary/20 shadow-[0_-4px_30px_rgba(255,215,0,0.15)] pb-safe-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          // Determine if icon is active
          let isActive = false;
          if (item.path === '/' && location.pathname === '/' && !location.hash) {
            isActive = true;
          } else if (item.path.startsWith('/#') && location.pathname === '/' && location.hash === item.path.substring(1)) {
            isActive = true;
          } else if (item.path !== '/' && !item.path.startsWith('/#') && location.pathname.startsWith(item.path)) {
            isActive = true;
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={(e) => handleNavigation(e, item.path)}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${
                isActive
                  ? 'text-primary drop-shadow-[0_0_8px_rgba(255,215,0,0.8)] scale-105'
                  : 'text-muted-foreground hover:text-primary/80'
              }`}
            >
              <Icon size={22} className={isActive ? "animate-pulse" : ""} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold tracking-wide uppercase">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
