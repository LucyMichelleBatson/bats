// IMPORTANT! Cache invalidation: when you update assets, bump CACHE = 'bats-v1' to 'bats-v2' 
// (or any new string) in sw.js. The browser detects the changed file, installs the new 
// worker, and the activate handler deletes the old cache automatically.
const CACHE = 'bats-v1';

const ASSETS = [
    '/',
    '/assets/css/styles.css',
    '/assets/images/street.webp',
    '/assets/images/river.webp',
    '/assets/images/bridge.webp',
    '/assets/images/batsLogo-pure-250w.webp',
    '/assets/images/banner35-300x94.webp',
    '/assets/images/bats-larger-transparent.png',
    '/assets/images/batty2.png',
    '/BATS_public_policies.pdf',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin GET requests
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        // Network-first for HTML so content updates are picked up promptly
        event.respondWith(
            fetch(request).catch(() => caches.match('/'))
        );
    } else {
        // Cache-first for all other assets (CSS, images, PDF)
        event.respondWith(
            caches.match(request).then(cached => cached || fetch(request).then(response => {
                const clone = response.clone();
                caches.open(CACHE).then(cache => cache.put(request, clone));
                return response;
            }))
        );
    }
});
