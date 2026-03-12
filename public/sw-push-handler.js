// Premium Push Notification Handler
self.addEventListener('push', (event) => {
  let data = {
    title: 'SM Review 3.0',
    body: 'New update available!',
    url: '/',
    image: null,
  };

  try {
    if (event.data) {
      data = JSON.parse(event.data.text());
    }
  } catch (e) {
    console.error('Push Parse Error:', e);
  }

  const options = {
    body: data.body,
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    image: data.image,
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40], // Complex premium vibration
    timestamp: Date.now(),
    renotify: true,
    tag: 'sm-news-' + (data.movieName || 'update'),
    requireInteraction: false, // Auto-dismiss after system default (usually 5-10s)
    silent: false,
    priority: 2, // Max priority
    data: {
      url: data.url,
    },
    actions: [
      { action: 'open', title: '🎬 Open Now' },
      { action: 'dismiss', title: '✖️ Close' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
