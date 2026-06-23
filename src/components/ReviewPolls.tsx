import React, { useState } from 'react';
import { usePolls } from '@/hooks/usePolls';
import { useSound } from '@/hooks/useSound';
import { ChartBar as BarChart3, CircleCheck as CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ReviewPollsProps {
  movieId: string;
}

export const ReviewPolls: React.FC<ReviewPollsProps> = ({ movieId }) => {
  const { polls, votedPolls, vote, loading } = usePolls(movieId);
  const { playSound } = useSound();
  const { t } = useLanguage();
  const [animatingPoll, setAnimatingPoll] = useState<string | null>(null);

  if (loading || polls.length === 0) return null;

  const handleVote = async (pollId: string, optionId: string) => {
    if (votedPolls[pollId]) return;
    playSound('click');
    setAnimatingPoll(pollId);
    await vote(pollId, optionId);
    setTimeout(() => setAnimatingPoll(null), 600);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary font-bold text-lg">
        <BarChart3 className="w-5 h-5" />
        <span>{t('pollsAndVotes')}</span>
      </div>

      {polls.map((poll) => {
        const hasVoted = !!votedPolls[poll.id];
        const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
        const isAnimating = animatingPoll === poll.id;

        return (
          <div key={poll.id} className="bg-card/80 border-2 border-primary/30 rounded-xl p-4 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
            <h4 className="font-bold text-primary text-base mb-3">{poll.question}</h4>
            <div className="space-y-2">
              {poll.options.map((option) => {
                const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                const isSelected = votedPolls[poll.id] === option.id;
                const isWinning = hasVoted && option.votes === Math.max(...poll.options.map(o => o.votes));

                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(poll.id, option.id)}
                    disabled={hasVoted}
                    className={`relative w-full text-left rounded-lg overflow-hidden transition-all duration-300 ${
                      hasVoted ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                    } ${isSelected ? 'ring-2 ring-primary shadow-[0_0_10px_rgba(255,215,0,0.3)]' : ''}`}
                  >
                    <div className="absolute inset-0 bg-muted/50" />
                    {hasVoted && (
                      <div
                        className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                          isWinning ? 'bg-gradient-to-r from-primary/40 to-primary/20' : 'bg-muted-foreground/15'
                        } ${isAnimating ? 'animate-scale-in' : ''}`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}
                    <div className="relative flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        {hasVoted && isSelected && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                        <span className={`font-semibold text-sm ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {option.label}
                        </span>
                      </div>
                      {hasVoted && (
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isWinning ? 'text-primary' : 'text-muted-foreground'}`}>{percentage}%</span>
                          <span className="text-xs text-muted-foreground">({option.votes})</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {hasVoted && <p className="text-xs text-muted-foreground mt-2 text-center">{t('totalVotes')} {totalVotes}</p>}
            {!hasVoted && <p className="text-xs text-muted-foreground mt-2 text-center animate-pulse">{t('tapToVote')}</p>}
          </div>
        );
      })}
    </div>
  );
};
