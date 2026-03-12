import { useState, useEffect, useCallback } from 'react';
import { generateDeviceFingerprint } from '@/utils/deviceFingerprint';

const PUSH_SUBSCRIBED_KEY = 'sm_push_subscribed';

// Use supabase client URL directly - always available
const SUPABASE_URL = 'https://mhrbffdkssemqijcipni.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocmJmZmRrc3NlbXFpamNpcG5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNTM1NzIsImV4cCI6MjA3NzcyOTU3Mn0.GIOdnlm0Gm7MD4bMz33w5ij65pfsuTg6lfTisQUulog';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function callPushFunction(action: string, method: string = 'GET', body?: any) {
  const url = `${SUPABASE_URL}/functions/v1/push-notifications?action=${action}`;
  const headers: Record<string, string> = {
    'apikey': SUPABASE_ANON_KEY,
  };
  
  const options: RequestInit = { method, headers };
  
  if (body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  
  return data;
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      setIsSubscribed(localStorage.getItem(PUSH_SUBSCRIBED_KEY) === 'true');
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;
    setIsLoading(true);

    try {
      // 1. Permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setIsLoading(false);
        return false;
      }

      // 2. Service Worker
      const registration = await navigator.serviceWorker.ready;

      // 3. VAPID Key
      const { publicKey } = await callPushFunction('vapid-public-key');

      // 4. Push Manager Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      // 5. Register with backend
      const deviceHash = generateDeviceFingerprint();
      const subJson = subscription.toJSON();
      
      await callPushFunction('subscribe', 'POST', {
        subscription: {
          endpoint: subJson.endpoint,
          keys: {
            p256dh: subJson.keys?.p256dh,
            auth: subJson.keys?.auth,
          }
        },
        deviceHash,
      });

      setIsSubscribed(true);
      localStorage.setItem(PUSH_SUBSCRIBED_KEY, 'true');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('[Push] Subscribe failed:', error);
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
          await callPushFunction('unsubscribe', 'POST', { endpoint: subscription.endpoint });
          await subscription.unsubscribe();
        }
      }
      setIsSubscribed(false);
      localStorage.removeItem(PUSH_SUBSCRIBED_KEY);
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error);
    }
    setIsLoading(false);
  }, []);

  return { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe };
};

// Send push notification (called from admin)
export const sendPushNotification = async (
  title: string,
  message: string,
  url?: string,
  tag?: string,
  image?: string,
  movieName?: string
) => {
  return callPushFunction('send', 'POST', { title, message, url, tag, image, movieName });
};
