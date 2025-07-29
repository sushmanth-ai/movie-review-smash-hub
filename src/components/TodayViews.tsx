import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface TodayViewsProps {
  viewCount: number;
}

export const TodayViews: React.FC<TodayViewsProps> = ({ viewCount }) => {
  return (
    <div className="max-w-md mx-auto mb-6">
      <Card className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 border-purple-300/30 backdrop-blur-md shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105">
        <CardContent className="flex items-center justify-center gap-4 p-6">
          <div className="bg-white/20 p-3 rounded-full">
            <Eye className="h-6 w-6 text-white drop-shadow-md" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-2xl drop-shadow-md">{viewCount.toLocaleString()}</p>
            <p className="text-white/90 text-sm font-medium tracking-wide">Today's Views</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};