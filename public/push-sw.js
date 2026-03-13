// Push notification service worker handler - WA2/WhatsApp style
self.addEventListener('push', (event) => {
  let data = {
    title: 'SM Reviews',
    body: 'New update available!',
    icon: '/pwa-icon-192.png',
    url: '/updates',
    tag: 'sm-review-update',
    image: null,
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.error('Push data parse error:', e);
  }

  const options = {
    body: data.body,
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    image: data.image || undefined,
    tag: data.tag || 'sm-review-update',
    renotify: true,
    requireInteraction: true,
    vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40],
    data: {
      url: data.url || '/updates',
    },
    actions: [
      { action: 'open', title: '📰 Read Update' },
      { action: 'share', title: '🔗 Share' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = new URL(event.notification.data?.url || '/updates', self.location.origin).href;

  if (event.action === 'share') {
    event.waitUntil(clients.openWindow(urlToOpen + '?share=true'));
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
