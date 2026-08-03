const CACHE_NAME = 'runnerbpm-v1.0.0';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/custom.css',
  './js/app.js',
  './js/utils/timeUtils.js',
  './js/utils/tailwindHelper.js',
  './js/models/settingsModel.js',
  './js/models/historyModel.js',
  './js/services/storageService.js',
  './js/services/audioService.js',
  './js/services/metronomeService.js',
  './js/components/Header.js',
  './js/components/Summary.js',
  './js/components/Feet.js',
  './js/components/Actions.js',
  './js/components/SettingsModal.js',
  './js/components/HistoryModal.js',
  './js/components/Footer.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});