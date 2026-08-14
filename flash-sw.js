/* Flash Mer SW v7 — OneSignal + أوفلاين */
try{importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js')}catch(e){}
var C='flash-v7',META='flash-meta-v1';
var CORE=['./','./flash-admin.html','./flash-driver.html','./flash-push.html','./flash-icon-192.png','./flash-icon-512.png','./flash-admin-manifest.json','./flash-driver-manifest.json'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(C).then(function(c){return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C&&x!==META}).map(function(x){return caches.delete(x)}))})
    .then(function(){return self.clients.claim()})
  );
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;
  e.respondWith(
    fetch(e.request).then(function(r){
      if(r&&r.ok){var cp=r.clone();caches.open(C).then(function(c){c.put(e.request,cp)})}
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(m){
        if(m)return m;
        if(e.request.mode==='navigate')return caches.match('./flash-admin.html');
        return Response.error();
      });
    })
  );
});
self.addEventListener('message',function(e){
  var d=e.data||{};
  if(d.type==='SKIP_WAITING')self.skipWaiting();
});
self.addEventListener('push',function(e){
  var d={};try{d=e.data?e.data.json():{}}catch(err){}
  e.waitUntil(self.registration.showNotification(d.title||'🔔 فلاش مير',{
    body:d.body||'إشعار جديد',icon:'./flash-icon-512.png',badge:'./flash-icon-192.png',tag:d.tag||'flash-push',renotify:true
  }));
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(l){
    for(var i=0;i<l.length;i++){if(l[i].url.indexOf('flash-driver')>=0||l[i].url.indexOf('flash-admin')>=0)return l[i].focus()}
    return clients.openWindow('./flash-driver.html');
  }));
});
