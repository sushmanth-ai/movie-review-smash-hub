import React, { useState } from 'react';
import { Bell, BellRing, BellOff, X } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';

export const NotificationBell = () => {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();
  const { toast } = useToast();
  const { playSound } = useSound();
  const [showPrompt, setShowPrompt] = useState(false);

  if (!isSupported) return null;

  const handleClick = async () => {
    playSound('click');

    if (isSubscribed) {
      await unsubscribe();
      toast({
        title: '🔕 Notifications Off',
        description: 'You won\'t receive push notifications anymore.',
      });
      return;
    }

    if (permission === 'denied') {
      toast({
        title: '⚠️ Notifications Blocked',
        description: 'Please enable notifications in your browser settings.',
        variant: 'destructive',
      });
      return;
    }

    setShowPrompt(true);
  };

  const handleSubscribe = async () => {
    setShowPrompt(false);
    const success = await subscribe();
    if (success) {
      playSound('popup');
      toast({
        title: '🔔 Notifications On!',
        description: 'You\'ll get notified about new reviews, comments & updates!',
      });
    } else {
      toast({
        title: '❌ Failed',
        description: 'Could not enable notifications. Try again later.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`relative p-2 rounded-full transition-all duration-300 ${
          isSubscribed
            ? 'bg-primary/20 text-primary hover:bg-primary/30'
            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-primary'
        } ${isLoading ? 'animate-pulse' : ''}`}
        title={isSubscribed ? 'Notifications On - Click to turn off' : 'Enable Notifications'}
      >
        {isSubscribed ? (
          <BellRing className="w-5 h-5 animate-[ring_0.5s_ease-in-out]" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {isSubscribed && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
        )}
      </button>

      {/* Subscribe Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="bg-card border-2 border-primary rounded-xl shadow-[0_0_30px_rgba(255,215,0,0.6)] p-6 text-center space-y-4 max-w-sm w-full mx-4 animate-in zoom-in-95">
            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-5xl">🔔</div>
            <h3 className="text-xl font-bold text-primary">
              Stay Updated!
            </h3>
            <p className="text-muted-foreground text-sm">
              Get instant notifications when:
            </p>
            <ul className="text-left text-sm space-y-2 text-foreground">
              <li>🎬 New movie reviews are posted</li>
              <li>💬 Someone replies to your comment</li>
              <li>🔥 Trending reviews & updates</li>
            </ul>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-yellow-500 text-primary-foreground font-bold py-3 rounded-lg hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
              >
                {isLoading ? '⏳ Enabling...' : '🔔 Enable Notifications'}
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-muted-foreground text-sm hover:text-foreground transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
