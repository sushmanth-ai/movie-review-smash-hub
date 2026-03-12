importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBgw0O4B_NbCvGfxOzSgEtNNYYYLoxFpic",
  authDomain: "clgsm-90aa8.firebaseapp.com",
  databaseURL: "https://clgsm-90aa8-default-rtdb.firebaseio.com",
  projectId: "clgsm-90aa8",
  storageBucket: "clgsm-90aa8.firebasestorage.app",
  messagingSenderId: "599942427925",
  appId: "1:599942427925:web:b65c4ca2b4537c0fa7e51c",
  measurementId: "G-CXB0LNYWFH"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Extract from the FCM syntax
  const notificationTitle = payload.notification?.title || "SM Reviews";
  const notificationOptions = {
    body: payload.notification?.body || "New Update",
    icon: payload.notification?.image || '/pwa-icon-192.png', // Main poster avatar
    badge: '/pwa-icon-192.png',
    image: payload.notification?.image, // Big Picture presentation preview
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40], // Custom priority vibration
    requireInteraction: true, // Forces "heads-up" banner dropdown
    tag: payload.data?.url || 'new-update',
    renotify: true,
    data: {
      url: payload.data?.url || '/',
    },
    actions: [
      { action: 'read-update', title: '📰 Read Update' },
      { action: 'share', title: '🔗 Share' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = new URL(event.notification.data?.url || '/', self.location.origin).href;

  if (event.action === 'share') {
    // If Web Share is not supported from service worker context, we just route to the update page where user can share
    // However, we can open the window to a dedicated share route if implemented, falling back to the url
    event.waitUntil(
      clients.openWindow(urlToOpen + "?share=true")
    );
    return;
  }

  // Default action or "Read Update" action
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
