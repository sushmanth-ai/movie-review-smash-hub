import React, { useState } from 'react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const InstallBanner = () => {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || isInstalled || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-card/95 backdrop-blur-lg border-t border-primary/30 shadow-[0_-4px_20px_rgba(255,215,0,0.15)] animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground">Install SM Review</p>
          <p className="text-xs text-muted-foreground">Get the app for a better experience</p>
        </div>
        <Button
          onClick={promptInstall}
          size="sm"
          className="bg-primary text-primary-foreground font-bold rounded-full px-4 shrink-0"
        >
          Install
        </Button>
        <button onClick={() => setDismissed(true)} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
