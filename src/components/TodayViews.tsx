import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface TodayViewsProps {
  viewCount: number;
}

export const TodayViews: React.FC<TodayViewsProps> = ({ viewCount }) => {
  const { t } = useLanguage();
  
  return (
    <div className="max-w-sm mx-auto mb-4 mt-6">
      <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 border-purple-500/50 backdrop-blur-xl shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-pink-600/20 via-transparent to-indigo-900/40"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"></div>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-emerald-400 text-xs font-medium">{t('live')}</span>
        </div>
        
        <CardContent className="relative z-10 pt-6 pb-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Eye className="w-8 h-8 text-white/90" />
            <h3 className="text-sm font-medium text-white/70 uppercase tracking-wider">
              {t('todayViews')}
            </h3>
            <p className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              {viewCount.toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};