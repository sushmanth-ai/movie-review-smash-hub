import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Temporary debug panel to diagnose push notification issues on mobile.
 * Shows step-by-step status of the push subscription flow.
 * Remove after debugging is complete.
 */
export const PushDebugPanel = () => {
  const { isSupported, isSubscribed, permission } = usePushNotifications();
  const [swStatus, setSwStatus] = useState('checking...');
  const [pushSubStatus, setPushSubStatus] = useState('checking...');
  const [show, setShow] = useState(true);

  useEffect(() => {
    const check = async () => {
      // Check service worker
      if (!('serviceWorker' in navigator)) {
        setSwStatus('❌ Not supported');
        return;
      }

      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          setSwStatus(`✅ Active (scope: ${reg.scope})`);
          
          // Check existing push subscription
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setPushSubStatus(`✅ Subscribed: ${sub.endpoint.substring(0, 40)}...`);
          } else {
            setPushSubStatus('❌ No subscription');
          }
        } else {
          setSwStatus('❌ Not registered');
          setPushSubStatus('❌ No SW = no push');
        }
      } catch (e: any) {
        setSwStatus(`❌ Error: ${e.message}`);
      }
    };

    check();
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] bg-black/90 text-white text-xs p-3 rounded-lg border border-primary/50 space-y-1 max-w-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-primary">🔧 Push Debug</span>
        <button onClick={() => setShow(false)} className="text-muted-foreground">✕</button>
      </div>
      <div>Push API: {isSupported ? '✅ Supported' : '❌ Not supported'}</div>
      <div>Permission: {permission === 'granted' ? '✅' : permission === 'denied' ? '❌' : '⏳'} {permission}</div>
      <div>SW: {swStatus}</div>
      <div>Push Sub: {pushSubStatus}</div>
      <div>App Subscribed: {isSubscribed ? '✅ Yes' : '❌ No'}</div>
      <div className="text-muted-foreground pt-1">localStorage: {localStorage.getItem('sm_push_subscribed') || 'null'}</div>
    </div>
  );
};
