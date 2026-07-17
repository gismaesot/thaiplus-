/* ==========================================================
   ThaiSave - Service Worker (Safe Network-First Strategy)
   ========================================================== */

// 📌 เปลี่ยนชื่อเวอร์ชันตรงนี้เพื่อบังคับเคลียร์เครื่องผู้ใช้อัตโนมัติ (ปัจจุบันขยับเป็น v1.6)
const CACHE_NAME = 'thaisave-v1.6-active';

const ASSETS = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'my-logo.png'
];

// 1. ติดตั้ง Service Worker และบันทึกไฟล์พื้นฐานลงแคช
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching initial assets...');
        // ใช้addAllแบบปลอดภัย ถ้ามีไฟล์ไหนโหลดไม่ได้จะไม่ทำให้ระบบล่ม
        return Promise.all(
          ASSETS.map(url => {
            return cache.add(url).catch(err => console.warn('Failed to cache:', url, err));
          })
        );
      })
      .then(() => self.skipWaiting()) // บังคับใช้งานทันทีไม่ต้องรอปิดแอปเก่า
  );
});

// 2. ลบ Cache เวอร์ชันเก่าทิ้งทั้งหมดทันทีเมื่อตัวใหม่ทำงาน
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // ควบคุมหน้าจอทั้งหมดทันที
  );
});

// 3. จัดการดึงข้อมูล (Fetch): เน้นเอาจากอินเทอร์เน็ตก่อน (Network First) เพื่อป้องกันอาการค้าง
self.addEventListener('fetch', (e) => {
  // ข้ามการตรวจจับหากไม่ใช่เมธอด GET (เช่น POST, PUT) เพื่อป้องกันเออร์เรอร์
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // ถ้าได้ข้อมูลจากอินเทอร์เน็ตกลับมาปกติ ให้บันทึกลงแคชเพื่ออัปเดตไฟล์ให้ใหม่เสมอ
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // หากเน็ตหลุด หรือเกิดเออร์เรอร์ ให้ดึงไฟล์จากแคชที่เคยบันทึกไว้มาใช้แก้ขัด
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // ถ้าไม่มีทั้งเน็ตและไม่มีไฟล์ในแคช ให้ส่งสถานะว่างเปล่ากลับไปแทนที่จะปล่อยให้แอปค้าง
          return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
  );
});