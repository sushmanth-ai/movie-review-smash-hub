import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface TodayViewsProps {
  viewCount: number;
}

export const TodayViews: React.FC<TodayViewsProps> = ({ viewCount }) => {
  return (
    <div className="max-w-md mx-auto mb-6">
      <Card className="bg-gradient-to-br from-emerald-500/95 via-teal-600/95 to-cyan-600/95 border-emerald-300/40 backdrop-blur-lg shadow-2xl hover:shadow-emerald-500/30 transition-all duration-500 hover:scale-110 hover:rotate-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <CardContent className="relative flex items-center justify-center gap-4 p-6">
          <div className="bg-white/25 p-4 rounded-full shadow-lg backdrop-blur-sm">
            <Eye className="h-7 w-7 text-white drop-shadow-lg" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-3xl drop-shadow-lg tracking-tight">{viewCount.toLocaleString()}</p>
            <p className="text-white/95 text-sm font-semibold tracking-widest uppercase">Today's Views</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};