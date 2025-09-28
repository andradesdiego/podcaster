// public/sw.js - Service Worker for PWA
const CACHE_NAME = "podcaster-v1.0.0";
const STATIC_CACHE = "podcaster-static-v1.0.0";

// Files to cache immediately
const STATIC_FILES = ["/", "/index.html", "/manifest.json", "/itunes.png"];

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static files");
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log("[SW] Static files cached successfully");
        return self.skipWaiting(); // Force activate new SW
      })
      .catch((error) => {
        console.error("[SW] Error caching static files:", error);
      }),
  );
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("[SW] Service worker activated");
        return self.clients.claim(); // Take control immediately
      }),
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip external domains (iTunes API, etc.)
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log("[SW] Serving from cache:", request.url);
        return cachedResponse;
      }

      // Not in cache, fetch from network
      console.log("[SW] Fetching from network:", request.url);
      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Cache successful responses
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            console.log("[SW] Caching new resource:", request.url);
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch((error) => {
          console.error("[SW] Network fetch failed:", error);

          // Offline fallback for HTML pages
          if (request.headers.get("accept").includes("text/html")) {
            return caches.match("/index.html");
          }

          throw error;
        });
    }),
  );
});
