import { useEffect, useRef } from 'react';
import { usePushNotifications } from './usePushNotifications';

const AUTO_PROMPT_DELAY = 2000; // 2 seconds after load

/**
 * Auto-subscribes users to push notifications on every visit.
 * If permission is already granted, subscribes silently.
 * If not yet prompted, shows the browser permission dialog.
 */
export const useAutoSubscribe = () => {
  const { isSupported, isSubscribed, subscribe, permission } = usePushNotifications();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isSupported || attempted.current) return;
    if (permission === 'denied') return;

    const trySubscribe = async () => {
      attempted.current = true;

      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();

        // Always re-subscribe if permission is granted to ensure backend has the subscription
        // This handles cases where the edge function was down or subscription was lost
        if (Notification.permission === 'granted') {
          if (existingSub && isSubscribed) {
            // Re-register with backend to ensure it's stored (idempotent upsert)
            console.log('[Push] Re-registering subscription with backend...');
          } else {
            console.log('[Push] Permission granted, subscribing...');
          }
          const result = await subscribe();
          console.log('[Push] Subscribe result:', result);
          return;
        }

        // For new users, request permission
        if (Notification.permission === 'default') {
          console.log('[Push] Requesting permission...');
          const result = await subscribe();
          console.log('[Push] Subscribe result:', result);
        }
      } catch (error) {
        console.error('[Push] Auto-subscribe error:', error);
      }
    };

    const timer = setTimeout(trySubscribe, AUTO_PROMPT_DELAY);
    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission, subscribe]);
};
