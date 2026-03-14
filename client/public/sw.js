const CACHE_NAME = 'studyspot-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Handle messages from the client for persistent timer notifications
self.addEventListener('message', (event) => {
  const { type, data } = event.data || {};

  if (type === 'TIMER_UPDATE') {
    // Update persistent notification in-place with countdown + progress bar
    const { timeLeft, totalTime, mode, locationName, state: timerState } = data;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const modeLabel = mode === 'focus' ? 'Focusing' : mode === 'break' ? 'Break' : 'Long Break';
    const title = `${timeStr} — ${modeLabel}`;

    // Build text progress bar
    const total = totalTime || 1;
    const elapsed = total - timeLeft;
    const progress = Math.min(elapsed / total, 1);
    const barLength = 20;
    const filled = Math.round(progress * barLength);
    const progressBar = '\u2588'.repeat(filled) + '\u2591'.repeat(barLength - filled);
    const pct = Math.round(progress * 100);

    let bodyLine = timerState === 'paused' ? '\u23F8 Paused' : `${progressBar} ${pct}%`;
    if (locationName) bodyLine += `\n\uD83D\uDCCD ${locationName}`;

    // Close existing notification first, then show updated one
    // Using the same tag replaces the notification in-place
    self.registration.getNotifications({ tag: 'studyspot-timer-ongoing' }).then(existing => {
      existing.forEach(n => n.close());
      self.registration.showNotification(title, {
        body: bodyLine,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        tag: 'studyspot-timer-ongoing',
        renotify: false,
        silent: true,
        requireInteraction: true,
        data: { url: '/timer', ongoing: true },
      });
    });
  }

  if (type === 'TIMER_CLEAR') {
    // Dismiss the persistent notification when timer stops
    self.registration.getNotifications({ tag: 'studyspot-timer-ongoing' }).then(notifications => {
      notifications.forEach(n => n.close());
    });
  }
});

// Notification click: open the timer page when user taps the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/timer';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if open
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Fetch: network-first for API, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API/tRPC requests — always go to network
  if (url.pathname.startsWith('/api/')) return;

  // For navigation requests (HTML pages) — network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // For static assets (JS, CSS, images, fonts) — stale-while-revalidate
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ttf|eot)$/) ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const fetched = fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => cached);

          return cached || fetched;
        })
      )
    );
    return;
  }
});
