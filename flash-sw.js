/* Flash Mer SW v4 — فلاش مير: أوفلاين + مزامنة خلفية + دورية + تنبيهات + دفع */
var C='flash-v4',META='flash-meta-v1';
var CORE=['./','./flash-admin.html','./flash-push.html','./flash-icon-192.png','./flash-icon-512.png','./flash-admin-manifest.json'];
var DB=['https://omar-28e22-default-rtdb.firebaseio.com','https://omar-28e22-default-rtdb.firebasedatabase.app'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(C).then(function(c){return Promise.all(CORE.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C&&x!==META}).map(function(x){return caches.delete(x)}))})
    .then(function(){return self.clients.claim()})
    .then(function(){if(self.registration.periodicSync){return self.registration.periodicSync.register('flash-periodic',{minInterval:6*3600*1000}).catch(function(){})}})
    .then(function(){if(self.registration.sync){return self.registration.sync.register('flash-sync').catch(function(){})}})
  );
});

/* ===== الدعم غير المتصل بالإنترنت ===== */
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

/* ===== مخزن الحالة (آخر فحص) ===== */
function getMeta(){return caches.open(META).then(function(c){return c.match('meta://last')}).then(function(r){return r?r.json():{lastTs:0}}).catch(function(){return{lastTs:0}})}
function setMeta(o){return caches.open(META).then(function(c){return c.put('meta://last',new Response(JSON.stringify(o),{headers:{'Content-Type':'application/json'}}))})}

/* ===== فحص الطلبات الجديدة من Firebase (مجاني) ===== */
function fetchOrders(base){return fetch(base+'/fm/orders.json?orderBy=%22ts%22&limitToLast=5').then(function(r){if(!r.ok)throw 0;return r.json()})}
function loadOrders(){return fetchOrders(DB[0]).catch(function(){return fetchOrders(DB[1])})}
function checkNew(){
  return getMeta().then(function(meta){
    return loadOrders().then(function(obj){
      var list=[];obj=obj||{};Object.keys(obj).forEach(function(k){var o=obj[k];o.id=k;list.push(o)});
      list.sort(function(a,b){return (a.ts||0)-(b.ts||0)});
      var maxTs=meta.lastTs||0;
      var news=list.filter(function(o){return (o.ts||0)>maxTs});
      var newMax=Math.max(maxTs,list.length?(list[list.length-1].ts||0):0);
      return setMeta({lastTs:newMax}).then(function(){
        if(news.length&&maxTs>0){
          var last=news[news.length-1];
          return self.registration.showNotification('🛵 فلاش مير — طلبات جديدة',{
            body:'لديك '+news.length+' طلب جديد'+(last&&last.name?' — آخرها: '+last.name:''),
            icon:'./flash-icon-512.png',badge:'./flash-icon-192.png',tag:'flash-new-orders',renotify:true
          });
        }
      });
    });
  }).catch(function(){});
}

/* ===== المزامنة الخلفية ===== */
self.addEventListener('sync',function(e){
  if(e.tag==='flash-sync'){e.waitUntil(checkNew())}
});

/* ===== المزامنة الدورية ===== */
self.addEventListener('periodicsync',function(e){
  if(e.tag==='flash-periodic'){e.waitUntil(checkNew())}
});

/* ===== تنبيهات الدفع (Push) ===== */
self.addEventListener('push',function(e){
  var d={};try{d=e.data?e.data.json():{}}catch(err){}
  var title=d.title||'🔔 فلاش مير';
  var body=d.body||'لديك إشعار جديد';
  e.waitUntil(self.registration.showNotification(title,{body:body,icon:'./flash-icon-512.png',badge:'./flash-icon-192.png',tag:d.tag||'flash-push',renotify:true}));
});

/* ===== عند النقر على التنبيه ===== */
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(function(l){
    for(var i=0;i<l.length;i++){if(l[i].url.indexOf('flash-admin')>=0){return l[i].focus()}}
    return clients.openWindow('./flash-admin.html');
  }));
});

/* ===== رسائل من الصفحة ===== */
self.addEventListener('message',function(e){
  var d=e.data||{};
  if(d.type==='SYNC_NOW'){checkNew()}
  if(d.type==='SKIP_WAITING'){self.skipWaiting()}
});
