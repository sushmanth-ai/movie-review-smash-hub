import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ChartBar as BarChart3, X } from 'lucide-react';
import { createPoll, deletePoll, usePolls } from '@/hooks/usePolls';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface PollManagerProps {
  reviews: { id: string; title: string }[];
}

interface PollData {
  id: string;
  movieId: string;
  question: string;
  options: { id: string; label: string; votes: number }[];
}

const PRESET_POLLS = [
  { question: '🎬 Hit or Flop?', options: ['Blockbuster 🔥', 'Hit ✅', 'Average 😐', 'Flop ❌'] },
  { question: '🏆 Best Actor Performance?', options: ['Hero 🌟', 'Heroine 💃', 'Villain 😈', 'Supporting Cast 🎭'] },
  { question: '🎵 Best Aspect?', options: ['Story 📖', 'Music 🎵', 'Action 💥', 'Comedy 😂'] },
  { question: '⭐ Would you recommend?', options: ['Must Watch! 🔥', 'Worth a Watch 👍', 'Wait for OTT 📺', 'Skip It 👎'] },
];

export const PollManager: React.FC<PollManagerProps> = ({ reviews }) => {
  const { toast } = useToast();
  const [selectedMovie, setSelectedMovie] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [allPolls, setAllPolls] = useState<PollData[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Load all polls
  useEffect(() => {
    if (!db) return;
    const unsubscribe = onSnapshot(collection(db, 'polls'), (snapshot) => {
      const polls: PollData[] = [];
      snapshot.forEach((doc) => {
        polls.push({ id: doc.id, ...doc.data() } as PollData);
      });
      setAllPolls(polls);
    });
    return () => unsubscribe();
  }, []);

  const handleAddOption = () => {
    if (options.length < 6) setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const handlePreset = (preset: typeof PRESET_POLLS[0]) => {
    setQuestion(preset.question);
    setOptions(preset.options);
  };

  const handleCreate = async () => {
    if (!selectedMovie || !question.trim() || options.filter(o => o.trim()).length < 2) {
      toast({ title: 'Error', description: 'Fill all fields with at least 2 options', variant: 'destructive' });
      return;
    }
    try {
      await createPoll(selectedMovie, question.trim(), options.filter(o => o.trim()));
      toast({ title: '✅ Poll Created!', description: 'Users can now vote on this poll.' });
      setQuestion('');
      setOptions(['', '']);
      setShowForm(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create poll', variant: 'destructive' });
    }
  };

  const handleDelete = async (pollId: string) => {
    if (!window.confirm('Delete this poll?')) return;
    try {
      await deletePoll(pollId);
      toast({ title: 'Poll Deleted' });
    } catch {
      toast({ title: 'Error deleting poll', variant: 'destructive' });
    }
  };

  const getMovieTitle = (movieId: string) => {
    return reviews.find(r => r.id === movieId)?.title || movieId;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Poll Manager
        </h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-white text-primary hover:bg-white/90">
          <Plus className="w-4 h-4 mr-2" />
          Create Poll
        </Button>
      </div>

      {showForm && (
        <Card className="bg-white/95">
          <CardHeader>
            <h3 className="text-lg font-bold">Create New Poll</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Movie</Label>
              <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              >
                <option value="">-- Choose Movie --</option>
                {reviews.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>

            {/* Preset buttons */}
            <div>
              <Label>Quick Presets</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {PRESET_POLLS.map((preset, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreset(preset)}
                    className="text-xs"
                  >
                    {preset.question}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Question</Label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Hit or Flop?"
              />
            </div>

            <div className="space-y-2">
              <Label>Options (min 2, max 6)</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i] = e.target.value;
                      setOptions(newOpts);
                    }}
                    placeholder={`Option ${i + 1}`}
                  />
                  {options.length > 2 && (
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(i)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))
              }
              {options.length < 6 && (
                <Button variant="outline" size="sm" onClick={handleAddOption}>
                  <Plus className="w-3 h-3 mr-1" /> Add Option
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} className="flex-1">Create Poll</Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Polls */}
      <div className="grid gap-3">
        {allPolls.length === 0 && (
          <p className="text-white/70 text-center py-4">No polls yet. Create one above!</p>
        )}
        {allPolls.map((poll) => {
          const totalVotes = poll.options.reduce((s, o) => s + (o.votes || 0), 0);
          return (
            <Card key={poll.id} className="bg-white/95">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{getMovieTitle(poll.movieId)}</p>
                    <h4 className="font-bold">{poll.question}</h4>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(poll.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {poll.options.map((opt) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    return (
                      <div key={opt.id} className="flex items-center gap-2 text-sm">
                        <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                          <div
                            className="h-full bg-primary/60 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs w-20 truncate">{opt.label}</span>
                        <span className="text-xs font-bold w-12 text-right">{pct}% ({opt.votes})</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total: {totalVotes} votes</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
