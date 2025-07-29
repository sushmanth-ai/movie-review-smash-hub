import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface TodayViewsProps {
  viewCount: number;
}

export const TodayViews: React.FC<TodayViewsProps> = ({ viewCount }) => {
  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardContent className="flex items-center justify-center gap-3 p-4">
        <Eye className="h-5 w-5 text-white" />
        <div className="text-center">
          <p className="text-white font-semibold text-lg">{viewCount}</p>
          <p className="text-white/80 text-sm">Today's Views</p>
        </div>
      </CardContent>
    </Card>
  );
};