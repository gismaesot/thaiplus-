const CACHE_NAME = 'thaisave-v1';
const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'https://cdn-icons-png.flaticon.com/512/4064/4064213.png'
];

// บันทึกไฟล์ลงแคชเมื่อทำการติดตั้งแอปครั้งแรก
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// เรียกดึงไฟล์จากแคชเมื่อไม่มีอินเทอร์เน็ต
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});