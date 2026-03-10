importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBgw0O4B_NbCvGfxOzSgEtNNYYYLoxFpic",
  authDomain: "clgsm-90aa8.firebaseapp.com",
  projectId: "clgsm-90aa8",
  storageBucket: "clgsm-90aa8.firebasestorage.app",
  messagingSenderId: "599942427925",
  appId: "1:599942427925:web:b65c4ca2b4537c0fa7e51c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/logo192.png',
    data: {
      url: payload.data?.url || '/'
    },
    image: payload.notification.image,
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'open_url',
        title: 'Read More'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
