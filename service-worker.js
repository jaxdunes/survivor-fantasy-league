// Service Worker for Survivor 51 Fantasy League
const CACHE_NAME = 'survivor-51-v12';
const urlsToCache = [
    './',
    './index.html',
    './draft.html',
    './chat.html',
    './scoring.html',
    './notifications.html',
    './manifest.json',
    './css/tailwind.min.css',
    './js/config.js',
    './js/scoring-engine.js',
    './js/episode-filter.js',
    './js/api.js',
    './seasons/season-50.json',
    './seasons/season-51.json'
];

// Install event
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

// Fetch event: Stale-While-Revalidate for app assets, Cache-First for vendor CDNs
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Bypass Firebase Realtime Database and Auth network calls
    if (url.hostname.includes('firebaseio.com') || url.hostname.includes('identitytoolkit.googleapis.com')) {
        return;
    }

    // Cache-First for static third-party vendor assets (React, Firebase SDKs, Google Fonts)
    const isVendorAsset = url.hostname.includes('cdn.jsdelivr.net') ||
                          url.hostname.includes('gstatic.com') ||
                          url.hostname.includes('fonts.googleapis.com');

    if (isVendorAsset) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // Stale-While-Revalidate for local app assets
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
    console.log('Push notification received:', event);
    
    let notificationData = {
        title: 'Survivor 50',
        body: 'You have a new notification',
        icon: 'icons/icon-192x192.png',
        badge: 'icons/icon-72x72.png',
        data: {}
    };
    
    if (event.data) {
        try {
            const payload = event.data.json();
            notificationData = {
                title: payload.title || notificationData.title,
                body: payload.body || notificationData.body,
                icon: payload.icon || notificationData.icon,
                badge: payload.badge || notificationData.badge,
                data: payload.data || {}
            };
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }
    
    event.waitUntil(
        Promise.all([
            // Show notification
            self.registration.showNotification(notificationData.title, {
                body: notificationData.body,
                icon: notificationData.icon,
                badge: notificationData.badge,
                data: notificationData.data,
                vibrate: [200, 100, 200],
                tag: notificationData.data.type || 'general'
            }),
            // Update badge count
            updateBadgeCount()
        ])
    );
});

// Update badge count from Firebase
async function updateBadgeCount() {
    try {
        // Get all clients (open tabs/windows)
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        
        if (clients.length > 0) {
            // Ask the first client to update the badge
            clients[0].postMessage({ type: 'UPDATE_BADGE' });
        }
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const notificationData = event.notification.data || {};
    let targetUrl = './index.html';
    
    if (notificationData.type === 'episode-scored') {
        const leagueParam = notificationData.leagueId ? `league=${encodeURIComponent(notificationData.leagueId)}` : '';
        const seasonParam = notificationData.seasonId ? `season=${encodeURIComponent(notificationData.seasonId)}` : '';
        const queryParams = [leagueParam, seasonParam].filter(Boolean).join('&');
        targetUrl = `./index.html${queryParams ? '?' + queryParams : ''}`;
    } else if (notificationData.type === 'chat') {
        targetUrl = './chat.html';
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                const searchFilename = targetUrl.replace('./', '');
                for (let client of clientList) {
                    if ('focus' in client && client.url.includes(searchFilename)) {
                        return client.focus();
                    }
                }
                for (let client of clientList) {
                    if ('focus' in client) {
                        if ('navigate' in client) {
                            client.navigate(targetUrl);
                        }
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(targetUrl);
                }
            })
    );
});
