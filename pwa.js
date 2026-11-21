// ติดตั้งเป็นแอป (PWA): ลงทะเบียน service worker, ปุ่ม "ติดตั้งแอป", คำแนะนำตามอุปกรณ์, แถบแจ้งออฟไลน์
(function(){
  var root = document.documentElement;
  var deferred = null;
  var ua = navigator.userAgent || '';
  var isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /android/i.test(ua);
  var isSafari = /safari/i.test(ua) && !/chrome|crios|fxios|edg|android/i.test(ua);
  var isInApp = /line\/|fban|fbav|instagram/i.test(ua);

  function installed(){
    return (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: window-controls-overlay)').matches)) || navigator.standalone === true;
  }
  function sync(){
    var ins = installed();
    root.classList.toggle('pwa-can', !ins);
    root.classList.toggle('pwa-app', ins);
  }

  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener('load', function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
  }
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred = e; sync(); });
  window.addEventListener('appinstalled', function(){ deferred = null; closeHelp(); root.classList.remove('pwa-can'); note('ติดตั้งแอปเรียบร้อยแล้ว เปิดได้จากไอคอนบนหน้าจอ'); });
  if(window.matchMedia){ try { matchMedia('(display-mode: standalone)').addEventListener('change', sync); } catch(e){} }

  var css = document.createElement('style');
  css.textContent =
    'html:not(.pwa-can) .pwa-install{display:none!important}' +
    'html.pwa-can .pwa-install{display:flex!important}' +
    '.pwa-ov{position:fixed;inset:0;z-index:3000;background:rgba(40,30,20,.45);display:flex;align-items:flex-end;justify-content:center;padding:16px}' +
    '@media(min-width:640px){.pwa-ov{align-items:center}}' +
    '.pwa-box{background:#fff;color:#3B2F25;border-radius:20px;max-width:420px;width:100%;padding:22px 20px 18px;box-shadow:0 20px 60px rgba(0,0,0,.25);font:inherit;max-height:90vh;overflow:auto}' +
    '.pwa-box h4{margin:0 0 4px;font-size:18px;display:flex;align-items:center;gap:10px}' +
    '.pwa-box h4 img{width:40px;height:40px;border-radius:10px}' +
    '.pwa-box p{margin:6px 0 12px;color:#7A6A5B;font-size:14px}' +
    '.pwa-box ol{margin:0;padding:0;list-style:none;counter-reset:s}' +
    '.pwa-box li{counter-increment:s;display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-top:1px solid #EFE7DB;font-size:15px;line-height:1.5}' +
    '.pwa-box li:before{content:counter(s);flex:0 0 26px;height:26px;border-radius:50%;background:#F3EBDF;color:#8B6A4E;font-weight:600;display:flex;align-items:center;justify-content:center;font-size:13px}' +
    '.pwa-box b{color:#8B6A4E}' +
    '.pwa-box .pwa-ic{display:inline-block;vertical-align:-4px;width:20px;height:20px;stroke:#8B6A4E;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
    '.pwa-box .pwa-ok{margin-top:14px;width:100%;border:0;border-radius:12px;padding:12px;background:#8B6A4E;color:#fff;font:inherit;font-weight:600;cursor:pointer}' +
    '.pwa-net{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 10px);z-index:3001;background:#3B2F25;color:#fff;border-radius:999px;padding:8px 16px;font-size:14px;box-shadow:0 6px 20px rgba(0,0,0,.2);display:none}' +
    'html.pwa-offline .pwa-net{display:block}';
  (document.head || root).appendChild(css);

  var SHARE = '<svg class="pwa-ic" viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg>';
  var DOTS = '<svg class="pwa-ic" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></svg>';
  var PLUS = '<svg class="pwa-ic" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  var MON = '<svg class="pwa-ic" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M12 7v6M9 10l3 3 3-3M8 20h8"/></svg>';

  function steps(){
    if(isInApp) return {
      p: 'ตอนนี้เปิดอยู่ในแอป LINE/Facebook ซึ่งติดตั้งแอปไม่ได้ ให้เปิดในเบราว์เซอร์ก่อน',
      s: ['กดปุ่ม ' + DOTS + ' หรือไอคอนเข็มทิศ มุมขวา', 'เลือก <b>เปิดในเบราว์เซอร์</b> (Safari / Chrome)', 'แล้วกด <b>ติดตั้งแอป</b> อีกครั้ง']
    };
    if(isIOS) return {
      p: isSafari ? 'iPhone / iPad ติดตั้งผ่านปุ่มแชร์ของ Safari' : 'iPhone / iPad ติดตั้งผ่านปุ่มแชร์ (แนะนำเปิดด้วย Safari)',
      s: ['กดปุ่ม <b>แชร์</b> ' + SHARE + ' ' + (isSafari ? 'ด้านล่างจอ (iPad: มุมขวาบน)' : 'ข้างช่องที่อยู่เว็บ'), 'เลื่อนลงแล้วเลือก <b>เพิ่มไปยังหน้าจอโฮม</b> ' + PLUS, 'กด <b>เพิ่ม</b> มุมขวาบน จะได้ไอคอนแอปบนหน้าจอ']
    };
    if(isAndroid) return {
      p: 'Android ติดตั้งผ่านเมนูของ Chrome',
      s: ['กดปุ่ม ' + DOTS + ' มุมขวาบนของ Chrome', 'เลือก <b>ติดตั้งแอป</b> หรือ <b>เพิ่มลงในหน้าจอหลัก</b>', 'กด <b>ติดตั้ง</b> จะได้ไอคอนแอปบนหน้าจอ']
    };
    return {
      p: 'คอมพิวเตอร์ ติดตั้งได้ด้วย Chrome หรือ Microsoft Edge',
      s: ['ดูที่ช่องที่อยู่เว็บด้านบน กดไอคอน <b>ติดตั้ง</b> ' + MON + ' ทางขวา', 'หรือกดเมนู ' + DOTS + ' → <b>ติดตั้ง ระบบจัดการห้องเช่า</b> (Edge: แอป → ติดตั้งไซต์นี้เป็นแอป)', 'กด <b>ติดตั้ง</b> แอปจะเปิดเป็นหน้าต่างของตัวเองและมีไอคอนบนเดสก์ท็อป']
    };
  }
  function closeHelp(){ var o = document.getElementById('pwaHelp'); if(o) o.remove(); }
  function showHelp(){
    closeHelp();
    var h = steps();
    var o = document.createElement('div');
    o.className = 'pwa-ov'; o.id = 'pwaHelp';
    o.innerHTML = '<div class="pwa-box" role="dialog" aria-modal="true"><h4><img src="icons/icon-192.png" alt="">ติดตั้งแอปลงเครื่อง</h4><p>' + h.p + '</p><ol>' +
      h.s.map(function(x){ return '<li><span>' + x + '</span></li>'; }).join('') +
      '</ol><p style="margin:12px 0 0;font-size:13px">ติดตั้งฟรี ไม่ต้องผ่าน App Store / Play Store ข้อมูลเดิมยังอยู่ครบ เพราะเก็บบนระบบออนไลน์</p><button class="pwa-ok">เข้าใจแล้ว</button></div>';
    o.addEventListener('click', function(e){ if(e.target === o || e.target.className === 'pwa-ok') closeHelp(); });
    document.body.appendChild(o);
  }
  function note(msg){
    if(typeof window.toast === 'function') { try { window.toast(msg); return; } catch(e){} }
  }

  function install(){
    if(installed()) return note('แอปติดตั้งอยู่แล้ว');
    if(deferred){
      var d = deferred; deferred = null;
      try { var p = d.prompt(); if(p && p.catch) p.catch(showHelp); } catch(e){ showHelp(); }
      return;
    }
    showHelp();
  }

  var bar = document.createElement('div');
  bar.className = 'pwa-net'; bar.textContent = 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต';
  function net(){ root.classList.toggle('pwa-offline', navigator.onLine === false); }
  window.addEventListener('online', net); window.addEventListener('offline', net);
  document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(bar); net(); });

  sync();
  window.PWA = { install: install, installed: installed, canPrompt: function(){ return !!deferred; } };
})();
