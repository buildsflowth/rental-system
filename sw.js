// Service worker: ทำให้ติดตั้งเป็นแอปได้ และเปิดหน้าแอปได้เร็วขึ้น
// ข้อมูลจริง (Supabase) ไม่ถูกเก็บในแคชเด็ดขาด
const VERSION = 'rental-20261126231518';
const SHELL = [
  './',
  'index.html',
  'config.js',
  'pwa.js',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function put(req, res){
  if(res && res.ok && (res.type === 'basic' || res.type === 'cors')){ const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(/supabase\.(co|in)$/.test(url.hostname)) return;   // ข้อมูลจริง: ไปที่เซิร์ฟเวอร์เสมอ
  if(url.origin === location.origin){
    // ไฟล์ของแอป: เอาเวอร์ชันล่าสุดจากเน็ตก่อน (ถามเซิร์ฟเวอร์ทุกครั้ง ไม่ใช้แคชเบราว์เซอร์ 10 นาที) ถ้าออฟไลน์ใช้ที่เก็บไว้
    const fresh = req.mode === 'navigate' ? new Request(req.url, {cache: 'no-cache', credentials: 'same-origin'}) : new Request(req, {cache: 'no-cache'});
    e.respondWith(fetch(fresh).then(r => put(req, r)).catch(() =>
      caches.match(req, {ignoreSearch: true}).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
    return;
  }
  if(/(^|\.)(jsdelivr\.net|googleapis\.com|gstatic\.com)$/.test(url.hostname)){
    // ไลบรารีและฟอนต์: ใช้ที่เก็บไว้ทันที แล้วอัปเดตเบื้องหลัง
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(r => put(req, r)).catch(() => hit);
      return hit || net;
    }));
  }
});
