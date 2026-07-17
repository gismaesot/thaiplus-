// 📌 ทุกครั้งที่มีการแก้ไขโค้ดแอป (เช่น แก้ CSS หรือเพิ่มข้อความ) 
// ให้เปลี่ยนตัวเลขเวอร์ชันตรงนี้เพิ่มขึ้นทีละ 1 (เช่น v1.1, v1.2, v1.3) เพื่อบังคับเคลียร์เครื่องผู้ใช้ชัวร์ๆ 100%
const CACHE_NAME = 'thaisave-v1.2-updated';

const ASSETS = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'https://cdn-icons-png.flaticon.com/512/4064/4064213.png'
];

// 1. ติดตั้งและบังคับให้ Service Worker ตัวใหม่ทำงานทันที ไม่ต้องรอยกเลิกแอปเก่า
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching new assets...');
      return cache.addAll(ASSETS);
    }).then(() => {
      return self.skipWaiting(); // 🔥 สั่งเปิดใช้งานตัวใหม่ทันทีห้ามยืนรอ
    })
  );
});

// 2. เคลียร์และลบ Cache เวอร์ชันเก่าทิ้งทั้งหมดทันทีที่มีการเปิดใช้งานเวอร์ชันใหม่
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
    }).then(() => {
      return self.clients.claim(); // 🔥 ควบคุมทุกแท็บหน้าจอทันที
    })
  );
});

// 3. ปรับกลยุทธ์ใหม่: เอาเวอร์ชันล่าสุดจากเน็ตก่อน (Network First) ถ้าไม่มีเน็ตค่อยดึงจากแคช (Cache fallback)
self.addEventListener('fetch', (e) => {
  // ดักจับเฉพาะไฟล์ที่เป็นของเว็บไซต์เราหรือไอคอนภายนอกที่จำเป็น
  if (e.request.url.startsWith(self.location.origin) || e.request.url.includes('flaticon.com')) {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          // ถ้าดึงไฟล์จากเน็ตสำเร็จ ให้เอาไฟล์ใหม่นี้ไปอัปเดตทับลงในแคชด้วย
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // ถ้าเน็ตหลุด/ไม่มีเน็ต (Offline) ให้ไปดึงไฟล์จากแคชที่บันทึกไว้มาแสดงแทน
          return caches.match(e.request);
        })
    );
  }
});