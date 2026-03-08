import { useState, useEffect, useCallback } from 'react';
import { generateDeviceFingerprint } from '@/utils/deviceFingerprint';

const PUSH_SUBSCRIBED_KEY = 'sm_push_subscribed';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      const stored = localStorage.getItem(PUSH_SUBSCRIBED_KEY);
      setIsSubscribed(stored === 'true');
    }
  }, []);

  const getSupabaseUrl = () => {
    // Use VITE_SUPABASE_URL which is always available
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (url) return url;
    // Fallback: construct from project ID
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    if (projectId) return `https://${projectId}.supabase.co`;
    return null;
  };

  const getAnonKey = () => {
    return import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;
    setIsLoading(true);
    setLastError(null);

    try {
      // Step 1: Request permission
      console.log('[Push] Step 1: Requesting permission...');
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        console.log('[Push] Permission denied:', perm);
        setLastError(`Permission ${perm}`);
        setIsLoading(false);
        return false;
      }

      // Step 2: Get service worker
      console.log('[Push] Step 2: Getting service worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('[Push] Service worker ready:', registration.scope);

      // Step 3: Get VAPID key
      console.log('[Push] Step 3: Fetching VAPID key...');
      const supabaseUrl = getSupabaseUrl();
      const anonKey = getAnonKey();

      if (!supabaseUrl || !anonKey) {
        const err = `Missing config: url=${!!supabaseUrl}, key=${!!anonKey}`;
        console.error('[Push]', err);
        setLastError(err);
        setIsLoading(false);
        return false;
      }

      const vapidResponse = await fetch(
        `${supabaseUrl}/functions/v1/push-notifications?action=vapid-public-key`,
        { headers: { 'apikey': anonKey } }
      );

      if (!vapidResponse.ok) {
        const err = `VAPID fetch failed: ${vapidResponse.status}`;
        console.error('[Push]', err);
        setLastError(err);
        setIsLoading(false);
        return false;
      }

      const vapidData = await vapidResponse.json();
      const vapidPublicKey = vapidData.publicKey;
      console.log('[Push] VAPID key obtained:', vapidPublicKey?.substring(0, 10) + '...');

      // Step 4: Subscribe to push
      console.log('[Push] Step 4: Subscribing to push manager...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });
      console.log('[Push] Push subscription created:', subscription.endpoint?.substring(0, 50) + '...');

      // Step 5: Send to backend
      console.log('[Push] Step 5: Registering with backend...');
      const deviceHash = generateDeviceFingerprint();

      const response = await fetch(
        `${supabaseUrl}/functions/v1/push-notifications?action=subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
          },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
            deviceHash,
          }),
        }
      );

      const responseData = await response.json();
      console.log('[Push] Backend response:', response.status, responseData);

      if (response.ok) {
        setIsSubscribed(true);
        localStorage.setItem(PUSH_SUBSCRIBED_KEY, 'true');
        setIsLoading(false);
        return true;
      }

      setLastError(`Backend error: ${responseData.error || response.status}`);
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error('[Push] Subscribe error:', error);
      setLastError(error.message || 'Unknown error');
      setIsLoading(false);
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          const supabaseUrl = getSupabaseUrl();
          const anonKey = getAnonKey();
          if (supabaseUrl && anonKey) {
            await fetch(
              `${supabaseUrl}/functions/v1/push-notifications?action=unsubscribe`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': anonKey,
                },
                body: JSON.stringify({ endpoint: subscription.endpoint }),
              }
            );
          }
          await subscription.unsubscribe();
        }
      }
      setIsSubscribed(false);
      localStorage.removeItem(PUSH_SUBSCRIBED_KEY);
    } catch (error) {
      console.error('Unsubscribe error:', error);
    }
    setIsLoading(false);
  }, []);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    lastError,
    subscribe,
    unsubscribe,
  };
};

// Helper to send push notification from admin
export const sendPushNotification = async (
  title: string,
  message: string,
  url?: string,
  tag?: string
) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  // Fallback
  const baseUrl = supabaseUrl || `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`;
  
  const response = await fetch(
    `${baseUrl}/functions/v1/push-notifications?action=send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
      },
      body: JSON.stringify({ title, message, url, tag }),
    }
  );
  return response.json();
};
