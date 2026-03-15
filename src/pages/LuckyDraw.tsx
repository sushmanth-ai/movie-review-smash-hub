import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Trophy, RotateCcw, Sparkles, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Entry {
  id: string;
  name: string;
  phone: string | null;
  created_at: string;
}

const COLORS = [
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-green-500',
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-violet-500',
  'from-red-500 to-pink-500',
  'from-yellow-500 to-amber-500',
  'from-teal-500 to-emerald-500',
];

const LuckyDraw = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Entry | null>(null);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const spinIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('lucky_draw_entries')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setEntries(data);
    if (error) console.error('Fetch error:', error);
    setLoading(false);
  };

  const addEntry = async () => {
    if (!newName.trim()) {
      toast({ title: 'Enter a name', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.from('lucky_draw_entries').insert({
      name: newName.trim(),
      phone: newPhone.trim() || null,
    });
    if (error) {
      toast({ title: 'Failed to add', description: error.message, variant: 'destructive' });
    } else {
      setNewName('');
      setNewPhone('');
      fetchEntries();
      toast({ title: '✅ Entry Added!' });
    }
  };

  const removeEntry = async (id: string) => {
    await supabase.from('lucky_draw_entries').delete().eq('id', id);
    fetchEntries();
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all entries?')) return;
    for (const entry of entries) {
      await supabase.from('lucky_draw_entries').delete().eq('id', entry.id);
    }
    setEntries([]);
    setWinner(null);
    toast({ title: '🗑️ All entries cleared' });
  };

  const spinDraw = () => {
    if (entries.length < 2) {
      toast({ title: 'Need at least 2 entries', variant: 'destructive' });
      return;
    }

    setSpinning(true);
    setWinner(null);

    let count = 0;
    const totalSpins = 20 + Math.floor(Math.random() * 15);
    let speed = 50;

    const spin = () => {
      setHighlightIndex(count % entries.length);
      count++;

      if (count >= totalSpins) {
        // Pick random winner
        const winnerIdx = Math.floor(Math.random() * entries.length);
        setHighlightIndex(winnerIdx);
        setWinner(entries[winnerIdx]);
        setSpinning(false);

        // Confetti!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
        });
        setTimeout(() => {
          confetti({ particleCount: 100, spread: 100, origin: { y: 0.4 } });
        }, 300);
        return;
      }

      // Slow down gradually
      speed = 50 + (count / totalSpins) * 250;
      spinIntervalRef.current = setTimeout(spin, speed);
    };

    spin();
  };

  const resetDraw = () => {
    setWinner(null);
    setHighlightIndex(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 pb-24 md:pb-8">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,215,0,0.15),transparent_60%)]" />
        <div className="container mx-auto px-4 py-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-yellow-500/30">
            <Sparkles className="w-4 h-4" />
            SM Lucky Draw
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            🎰 Lucky Draw
          </h1>
          <p className="text-white/60 text-lg">Add names & spin to pick a random winner!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl">
        {/* Add Entry */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/10">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add Participant
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name *"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addEntry()}
            />
            <Input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 sm:w-40"
              onKeyDown={(e) => e.key === 'Enter' && addEntry()}
            />
            <Button onClick={addEntry} className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        {/* Entries List */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <Users className="w-5 h-5" /> Participants ({entries.length})
            </h3>
            {entries.length > 0 && (
              <Button onClick={clearAll} variant="ghost" size="sm" className="text-red-300 hover:text-red-200 hover:bg-red-500/20">
                <Trash2 className="w-4 h-4 mr-1" /> Clear All
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-white/50">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-6xl mb-3">🎫</p>
              <p className="text-white/50">No participants yet. Add names above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
              {entries.map((entry, idx) => {
                const isHighlighted = highlightIndex === idx;
                const isWinner = winner?.id === entry.id;
                const colorClass = COLORS[idx % COLORS.length];
                return (
                  <div
                    key={entry.id}
                    className={`
                      relative group rounded-xl p-3 transition-all duration-150 border
                      ${isWinner
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 border-yellow-300 scale-105 shadow-lg shadow-yellow-500/30 ring-2 ring-yellow-300'
                        : isHighlighted
                          ? `bg-gradient-to-r ${colorClass} border-white/40 scale-[1.03]`
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }
                    `}
                  >
                    <p className={`font-bold text-sm truncate ${isWinner ? 'text-black' : 'text-white'}`}>
                      {isWinner && '🏆 '}{entry.name}
                    </p>
                    {entry.phone && (
                      <p className={`text-xs truncate ${isWinner ? 'text-black/60' : 'text-white/40'}`}>{entry.phone}</p>
                    )}
                    <button
                      onClick={() => removeEntry(entry.id)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500/80 text-white rounded-full p-0.5 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Spin Button */}
        <div className="text-center space-y-4">
          <Button
            onClick={spinDraw}
            disabled={spinning || entries.length < 2}
            className={`
              text-xl px-12 py-7 rounded-2xl font-black shadow-2xl transition-all
              ${spinning
                ? 'bg-gray-500 animate-pulse'
                : 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-300 hover:via-amber-400 hover:to-orange-400 text-black hover:scale-105 shadow-yellow-500/30'
              }
            `}
          >
            {spinning ? (
              <>🎰 Spinning...</>
            ) : (
              <><Trophy className="w-6 h-6 mr-2 inline" /> SPIN & PICK WINNER</>
            )}
          </Button>

          {winner && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-2xl p-6 max-w-sm mx-auto shadow-2xl shadow-yellow-500/30">
                <p className="text-6xl mb-2">🏆</p>
                <p className="text-black/60 text-sm font-medium uppercase tracking-wider">Winner</p>
                <p className="text-3xl font-black text-black">{winner.name}</p>
                {winner.phone && <p className="text-black/60 mt-1">{winner.phone}</p>}
                <Button onClick={resetDraw} variant="outline" className="mt-4 border-black/20 text-black hover:bg-black/10">
                  <RotateCcw className="w-4 h-4 mr-2" /> Draw Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LuckyDraw;
