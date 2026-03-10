import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ExternalLink, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { NewsItem } from '@/hooks/useNewsFeed';

const DEFAULT_IMAGE = '/placeholder.svg';

const NewsDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const article = location.state?.article as NewsItem | undefined;
  const [imgError, setImgError] = useState(false);

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-lg text-muted-foreground">Article not found</p>
        <button onClick={() => navigate('/news')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
          Back to News
        </button>
      </div>
    );
  }

  const image = article.image && !imgError ? article.image : DEFAULT_IMAGE;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, text: article.description, url: window.location.href });
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-96">
        <img
          src={image}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
          <button
            onClick={() => navigate('/news')}
            className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 max-w-3xl mx-auto -mt-8 relative z-10 space-y-4">
        {/* Source badge */}
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-primary/90 text-primary-foreground uppercase tracking-wider">
          {article.source}
        </span>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(article.pubDate), 'MMMM dd, yyyy • hh:mm a')}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Article content */}
        <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed text-base whitespace-pre-line">
          {article.content || article.description}
        </div>

        {/* Source link */}
        <div className="pt-4 border-t border-border">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View original on {article.source}
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
