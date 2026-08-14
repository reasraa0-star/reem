/* ===== OneSignal Manager — Flash Mer Driver (Web SDK v16) v2 ===== */
(function(){
  var APP_ID='7a6d7064-aa0c-4a23-b169-32e85248832f';
  window.OneSignalDeferred=window.OneSignalDeferred||[];
  var OS=null,dialogShown=false;
  var s=document.createElement('script');
  s.src='https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.js';
  s.defer=true;document.head.appendChild(s);

  var M={
    init:function(){OneSignalDeferred.push(function(OneSignal){OS=OneSignal;OneSignal.init({appId:APP_ID});M._observe()})},
    login:function(id,name){OneSignalDeferred.push(function(OneSignal){OneSignal.login(id).catch(function(){});OneSignal.User.addTag('role','driver');if(name)OneSignal.User.addTag('name',name);M.ensureSub()})},
    logout:function(){OneSignalDeferred.push(function(OneSignal){OneSignal.logout().catch(function(){})})},
    /* الاشتراك الصريح — هاد السطر اللي كان ناقص */
    ensureSub:function(){OneSignalDeferred.push(function(OneSignal){
      try{
        if(Notification.permission==='granted'){OneSignal.registerForPushNotifications().catch(function(){})}
      }catch(e){}
    })},
    requestPermission:function(){OneSignalDeferred.push(function(OneSignal){OneSignal.Notifications.requestPermission().then(function(g){
      if(g){M.toast('✅ تم تفعيل الإشعارات');M.ensureSub()}else{M.toast('⚠️ لم يُمنح الإذن')}
    })})},
    _observe:function(){
      try{
        var ob={onDidChange:function(sub){if(sub&&sub.id)M.toast('✅ الجهاز مسجّل بالاستقبال')}};
        OS.User.pushSubscription.addObserver(ob);
        if(OS.User.pushSubscription.id){M.toast('✅ الجهاز مسجّل بالاستقبال')}
        else{M.ensureSub()}
      }catch(e){}
      M.maybeDialog();
    },
    maybeDialog:function(){
      if(dialogShown)return;
      if(!('Notification' in window))return;
      if(Notification.permission!=='default')return;
      dialogShown=true;
      var d=document.createElement('div');
      d.style.cssText='position:fixed;bottom:16px;right:16px;left:16px;z-index:9999;background:#0c1526;border:1px solid #22d3ee;border-radius:16px;padding:16px;max-width:420px;margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,.6);font-family:Tajawal,sans-serif;color:#eef4fb;text-align:center';
      d.innerHTML='<b style="color:#fbbf24;font-size:15px">🔔 تفعيل إشعارات المهام</b><p style="font-size:12px;color:#8fa3bf;margin:8px 0 12px">ليصلك إشعار بصوت عند إسناد مهمة جديدة، حتى والتطبيق مقفول</p><button id="osYes" style="background:linear-gradient(135deg,#fbbf24,#22d3ee);color:#06202b;border:none;border-radius:10px;padding:11px 22px;font-weight:800;cursor:pointer;margin:0 4px">تفعيل</button><button id="osNo" style="background:rgba(255,255,255,.08);color:#8fa3bf;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:11px 18px;font-weight:700;cursor:pointer;margin:0 4px">لاحقاً</button>';
      document.body.appendChild(d);
      d.querySelector('#osYes').onclick=function(){d.remove();M.requestPermission()};
      d.querySelector('#osNo').onclick=function(){d.remove()};
    },
    toast:function(m){var t=document.createElement('div');t.textContent=m;t.style.cssText='position:fixed;top:60px;left:50%;transform:translateX(-50%);background:#0c1526;border:1px solid #22d3ee;color:#22d3ee;padding:10px 24px;border-radius:40px;font-weight:700;z-index:9999;font-family:Tajawal,sans-serif';document.body.appendChild(t);setTimeout(function(){t.remove()},3000)}
  };
  M.init();

  function bind(){
    if(window.ME&&ME.u){
      M.login(ME.u,ME.name);
      var old=window.logout;
      if(old&&!window.__osHook){window.__osHook=1;window.logout=function(){M.logout();old()}}
      return;
    }
    setTimeout(bind,1000);
  }
  bind();
  if(document.readyState==='complete'){setTimeout(M.maybeDialog,1500)}else{window.addEventListener('load',function(){setTimeout(M.maybeDialog,1500)})}
  window.FMOS=M;
})();
