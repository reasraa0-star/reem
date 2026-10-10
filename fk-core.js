var firebaseConfig={apiKey:"AIzaSyAnO8p8p3xaPuBzEj239ncIhnV066zLhJQ",authDomain:"omar-28e22.firebaseapp.com",projectId:"omar-28e22",storageBucket:"omar-28e22.firebasestorage.app",messagingSenderId:"496194365995",appId:"1:496194365995:web:f4844a98b7e60710ccd86e",measurementId:"G-5L2R7Y2RQS"};
var FB=null;try{firebase.initializeApp(firebaseConfig);FB=firebase.database();}catch(e){FB=null}
var SET=LS('fr_set',{pass:'1234'}),CUST=LS('fr_cust',[]),TX=LS('fr_tx',[]),DRV=LS('fr_drv',[]),DTX=LS('fr_dtx',[]),FIN=LS('fr_fin',[]);
var CURR={SYP:'ل.س',USD:'$'},curType='D',curCust=null,curDrv=null,editingId=null,cloudSkip=false;
function LS(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function SV(k,v){localStorage.setItem(k,JSON.stringify(v))}
function $(s){return document.querySelector(s)}
function f2(n){return Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2})}
var _t;function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(_t);_t=setTimeout(function(){t.classList.remove('on')},2600)}
var _cs=null;
function cloudSave(){clearTimeout(_cs);_cs=setTimeout(function(){if(FB)FB.ref('ledger').set({cust:CUST,tx:TX,drv:DRV,dtx:DTX,fin:FIN}).catch(function(){})},800)}
function loadCloud(){if(!FB){renderAll();return}
 FB.ref('ledger').once('value').then(function(s){
  if(sessionStorage.getItem('fr_wipe_cloud')){FB.ref('ledger').remove();sessionStorage.removeItem('fr_wipe_cloud');renderAll();toast('🔥 نُظّفت السحابة');return}
  var v=s.val();
  if(v&&v.cust&&v.cust.length){CUST=v.cust;TX=v.tx||[];DRV=v.drv||[];DTX=v.dtx||[];FIN=v.fin||[];SV('fr_cust',CUST);SV('fr_tx',TX);SV('fr_drv',DRV);SV('fr_dtx',DTX);SV('fr_fin',FIN);renderAll();toast('☁️ تحمّل الدفتر')}
  else renderAll()
 }).catch(function(){renderAll()})}
function saveBlob(b,n,m){try{if(navigator.share){var f=new File([b],n,{type:m});if(!navigator.canShare||navigator.canShare({files:[f]})){navigator.share({files:[f],title:n}).catch(function(){});return}}}catch(e){}
 var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500)}
function doLogin(){var v=$('#lp').value;
 if(v==='0000'){SET={pass:'1234'};SV('fr_set',SET);v='1234';toast('🔓 تم الدخول')}
 if(v===SET.pass){sessionStorage.setItem('fr_ok','1');enter()}else{$('#lerr').classList.add('on');setTimeout(function(){$('#lerr').classList.remove('on')},1800)}}
function logout(){sessionStorage.removeItem('fr_ok');location.reload()}
function enter(){$('#login').style.display='none';$('#app').classList.add('on');var t=new Date();$('#tDate').value=t.toISOString().slice(0,10);$('#rDay').value=t.toISOString().slice(0,10);$('#rMonth').value=t.toISOString().slice(0,7);buildExtra();addMic();renderAll();if(!cloudSkip)loadCloud()}
function go(id,btn){document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');document.querySelectorAll('.sec').forEach(s=>s.classList.remove('on'));var s=$('#s-'+id);if(s)s.classList.add('on');renderAll()}
function bal(id){var r={SYP:0,USD:0};TX.forEach(t=>{if(t.cust===id)r[t.cur]+=(t.type==='D'?t.total:-t.total)});return r}
function jars(id){return TX.filter(t=>t.cust===id).reduce((a,x)=>a+(+x.qty||0),0)}
function fmtBal(b){var p=[];for(var k in b){if(Math.abs(b[k])>0.001)p.push(f2(Math.abs(b[k]))+' '+CURR[k]+' '+(b[k]>0?'عليه':'له'))}return p.length?p.join(' • '):'مسدّد ✔'}
function cname(id){var c=CUST.filter(x=>x.id===id)[0];return c?c.name:'؟'}
function dname(id){var d=DRV.filter(x=>x.id===id)[0];return d?d.name:'—'}
function findCust(n,p){var ph=(p||'').replace(/\D/g,'');for(var i=0;i<CUST.length;i++){var cp=(CUST[i].phone||'').replace(/\D/g,'');if(CUST[i].name===n||(ph&&cp&&cp===ph))return CUST[i]}return null}
/* 🔄 غاز — بعد التصفير بيستورد الجديد فقط */
function syncFromGas(){if(!FB){toast('⚠️ لا اتصال');return}
 var base=LS('fr_gas_base',0),impU=LS('fr_imp_u',{}),impO=LS('fr_imp_o',{}),impD=LS('fr_imp_d',{}),ch=false;
 var p=Promise.resolve();
 if(base===0)p=FB.ref('users').limitToLast(500).once('value').then(function(su){su.forEach(function(c){var u=c.val();if(impU[c.key])return false;impU[c.key]=1;ch=true;if(!findCust(u.name,u.phone))CUST.push({id:Date.now()+Math.floor(Math.random()*9999),name:u.name,phone:u.phone||''});return false})});
 p.then(function(){return FB.ref('orders').orderByChild('ts').limitToLast(500).once('value')}).then(function(so){so.forEach(function(c){var o=c.val();if(impO[c.key])return false;if(base&&!(o.ts>base))return false;impO[c.key]=1;ch=true;var x=findCust(o.name,o.phone);if(!x){x={id:Date.now()+Math.floor(Math.random()*9999),name:o.name,phone:o.phone||''};CUST.push(x)}TX.push({id:Date.now()+Math.floor(Math.random()*9999),cust:x.id,type:'D',qty:o.jars,price:o.price||0,total:o.total||0,cur:'SYP',date:o.day||'',note:'طلب غاز'});return false});return FB.ref('deliveries').orderByChild('ts').limitToLast(500).once('value')}).then(function(sd){sd.forEach(function(c){var d=c.val();if(impD[c.key])return false;if(base&&!(d.ts>base))return false;impD[c.key]=1;ch=true;var x=findCust(d.cust,'');if(!x){x={id:Date.now()+Math.floor(Math.random()*9999),name:d.cust,phone:''};CUST.push(x)}if(d.paid>0)TX.push({id:Date.now()+Math.floor(Math.random()*9999),cust:x.id,type:'C',qty:0,price:0,total:d.paid,cur:'SYP',date:d.day||'',note:'دفعة تسليم — سائق: '+d.driver});return false});
 if(ch){SV('fr_cust',CUST);SV('fr_tx',TX);SV('fr_imp_u',impU);SV('fr_imp_o',impO);SV('fr_imp_d',impD);renderAll();cloudSave();toast('🔄 نزلت بيانات الغاز')}else toast('✔ لا جديد')}).catch(function(){toast('⚠️ تعذّرت المزامنة')})}
/* 👥 زبائن + واتساب */
function addCust(){var n=$('#cNew').value.trim();if(!n){toast('⚠️ اكتب الاسم');return}var ph=$('#cPhone')?$('#cPhone').value.trim():'';CUST.push({id:Date.now(),name:n,phone:ph});SV('fr_cust',CUST);$('#cNew').value='';if($('#cPhone'))$('#cPhone').value='';renderAll();cloudSave();speak('تم إضافة الزبون '+n);toast('✅ أُضيف')}
function quickCust(){var n=prompt('اسم الزبون:');if(n&&n.trim()){var id=Date.now();CUST.push({id:id,name:n.trim(),phone:''});SV('fr_cust',CUST);renderSel();$('#tCust').value=id;cloudSave();speak('تم إضافة الزبون '+n.trim());toast('✅ أُضيف')}}
function editCust(){var c=CUST.filter(x=>x.id===curCust)[0];var n=prompt('الاسم:',c.name);if(n&&n.trim())c.name=n.trim();var p=prompt('رقم واتساب:',c.phone||'');if(p!==null)c.phone=p.trim();SV('fr_cust',CUST);renderAll();openCust(curCust);cloudSave();toast('✏️ عُدّل')}
function delCust(){var c=CUST.filter(x=>x.id===curCust)[0];if(!c||!confirm('حذف '+c.name+' وكل حركاته؟'))return;CUST=CUST.filter(x=>x.id!==curCust);TX=TX.filter(x=>x.cust!==curCust);SV('fr_cust',CUST);SV('fr_tx',TX);renderAll();cloudSave();go('cust',document.querySelectorAll('.nav button')[1]);toast('🗑 حُذف')}
function waNum(p){var ph=(p||'').replace(/\D/g,'');if(ph.startsWith('0'))ph='963'+ph.slice(1);return ph}
function waCust(id){var c=CUST.filter(x=>x.id===id)[0];if(!c||!c.phone){toast('⚠️ ما في رقم — عدّل الزبون وضيف رقم');return}
 var msg='📒 *دفتر فاروق الرفاعي*%0Aالزبون: '+c.name+'%0Aالرصيد: '+fmtBal(bal(id));window.open('https://wa.me/'+waNum(c.phone)+'?text='+msg,'_blank')}
function sendWA(){var c=CUST.filter(x=>x.id===curCust)[0];if(!c.phone){toast('⚠️ أضف الرقم');return}
 var tx=TX.filter(x=>x.cust===curCust);
 var msg='📒 *دفتر فاروق الرفاعي*%0Aالزبون: '+c.name+'%0A━━━━━━%0A'+tx.map(x=>'• '+x.date+' '+(x.type==='D'?'عليه':'له')+': '+f2(x.total)+' '+CURR[x.cur]).join('%0A')+'%0A━━━━━━%0Aالرصيد: '+fmtBal(bal(curCust));
 window.open('https://wa.me/'+waNum(c.phone)+'?text='+msg,'_blank')}
/* ➕ حركة + سائق + دفعة */
function setType(t){curType=t;$('#segD').className=t==='D'?'onD':'';$('#segC').className=t==='C'?'onC':''}
function calcT(){$('#tTotal').value=f2((+$('#tQty').value||0)*(+$('#tPrice').value||0))}
function startEdit(id){var x=TX.filter(t=>t.id===id)[0];if(!x)return;editingId=id;go('add',document.querySelectorAll('.nav button')[2]);$('#tCust').value=x.cust;setType(x.type);$('#tQty').value=x.qty;$('#tPrice').value=x.price;calcT();$('#tCur').value=x.cur;$('#tDate').value=x.date;if($('#tDrv'))$('#tDrv').value=x.driver||0;$('#tPayment').value=x.payment||'';$('#tNote').value=x.note||'';$('#addTitle').textContent='✏️ تعديل حركة';$('#cancelEdit').style.display='inline-flex'}
function cancelEdit(){editingId=null;$('#addTitle').textContent='➕ تسجيل حركة';$('#cancelEdit').style.display='none';$('#tQty').value=1;$('#tPrice').value='';$('#tPayment').value='';$('#tNote').value='';if($('#tDrv'))$('#tDrv').value=0;calcT()}
function saveTx(){var cid=+$('#tCust').value;if(!cid){toast('⚠️ اختر زبوناً');return}var tot=(+$('#tQty').value||0)*(+$('#tPrice').value||0);if(tot<=0){toast('⚠️ كمية وسعر');return}
 var pay=+$('#tPayment').value||0,drv=$('#tDrv')?+$('#tDrv').value:0;
 var d={cust:cid,type:curType,qty:+$('#tQty').value||0,price:+$('#tPrice').value||0,total:tot,cur:$('#tCur').value,date:$('#tDate').value,driver:drv,payment:pay,note:$('#tNote').value};
 if(editingId){var x=TX.filter(t=>t.id===editingId)[0];if(x)for(var k in d)x[k]=d[k];toast('✏️ عُدّلت')}else{d.id=Date.now();TX.push(d);toast('💾 حُفظت')}
 if(pay>0){TX.push({id:Date.now()+1,cust:cid,type:'C',qty:0,price:0,total:pay,cur:d.cur,date:d.date,note:'دفعة مستلمة'});
  if(drv)DTX.push({id:Date.now()+2,drv:drv,type:'D',amt:pay,date:d.date,note:'دفعة مقدمة مع السائق — '+cname(cid)})}
 SV('fr_tx',TX);SV('fr_dtx',DTX);
 var msg='تم حفظ حركة للزبون '+cname(cid)+' عدد '+d.qty+' جرة';
 if(drv)msg+=' مع السائق '+dname(drv);
 if(pay>0)msg+=' ودفعة '+f2(pay);
 speak(msg);cancelEdit();renderAll();cloudSave()}
function delTx(id){if(!confirm('حذف؟'))return;TX=TX.filter(x=>x.id!==id);SV('fr_tx',TX);renderAll();cloudSave();toast('🗑')}
function openCust(id){curCust=id;renderCustView();document.querySelectorAll('.sec').forEach(s=>s.classList.remove('on'));$('#s-view').classList.add('on')}
/* 🚚 سائقين */
function addDrv(){var n=prompt('اسم السائق:');if(!n||!n.trim())return;var p=prompt('رقم واتساب (اختياري):')||'';DRV.push({id:Date.now(),name:n.trim(),phone:p.trim()});SV('fr_drv',DRV);renderAll();cloudSave();toast('🚚 أُضيف السائق')}
function drvBal(id){var r={d:0,c:0};DTX.forEach(t=>{if(t.drv===id)r[t.type]+=+t.amt});return r}
function drvJars(id){return TX.filter(t=>t.driver===id).reduce((a,x)=>a+(+x.qty||0),0)}
function addDTX(id,tp){var a=prompt(tp==='D'?'المبلغ عليه:':'المبلغ له:');if(!a||!+a)return;DTX.push({id:Date.now(),drv:id,type:tp,amt:+a,date:new Date().toISOString().slice(0,10),note:''});SV('fr_dtx',DTX);renderAll();cloudSave();speak(tp==='D'?'سجلت عليه '+a:'سجلت له '+a);toast('💾')}
function openDrv(id){curDrv=id;renderDrvView();document.querySelectorAll('.sec').forEach(s=>s.classList.remove('on'));$('#s-drvview').classList.add('on')}
function waDrv(id){var d=DRV.filter(x=>x.id===id)[0];if(!d||!d.phone){toast('⚠️ ما في رقم');return}var b=drvBal(id);window.open('https://wa.me/'+waNum(d.phone)+'?text=🚚 *حساب السائق '+d.name+'*%0Aعليه: '+f2(b.d)+' — له: '+f2(b.c),'_blank')}
/* 💰 مالية */
function addFin(tp){var a=prompt(tp==='cap'?'مبلغ رأس المال:':'مبلغ المصروف:');if(!a||!+a)return;var n=prompt('البيان (اختياري):')||'';FIN.push({id:Date.now(),type:tp,amt:+a,note:n,date:new Date().toISOString().slice(0,10)});SV('fr_fin',FIN);renderAll();cloudSave();speak(tp==='cap'?'أضفت رأس مال '+a:'أضفت مصروف '+a);toast('💾 سُجّل')}
function delFin(id){if(!confirm('حذف البند؟'))return;FIN=FIN.filter(f=>f.id!==id);SV('fr_fin',FIN);renderAll();cloudSave();toast('🗑')}
function finSums(){var cap=0,exp=0;FIN.forEach(f=>{if(f.type==='cap')cap+=f.amt;else exp+=f.amt});var rev=0;TX.forEach(x=>{if(x.type==='C')rev+=x.total});return{cap:cap,exp:exp,rev:rev,prof:rev-exp,net:cap+rev-exp}}
/* 🧹 تصفير شامل — ما بيرجع شي */
function wipeAccounts(){if(!confirm('حذف كل الزبائن والحركات والسائقين والمالية من الجهاز والسحابة؟'))return;
 CUST=[];TX=[];DRV=[];DTX=[];FIN=[];SV('fr_cust',CUST);SV('fr_tx',TX);SV('fr_drv',DRV);SV('fr_dtx',DTX);SV('fr_fin',FIN);SV('fr_gas_base',Date.now());
 if(FB)FB.ref('ledger').set({cust:[],tx:[],drv:[],dtx:[],fin:[]}).catch(function(){});
 renderAll();speak('تم تصفير كل شيء');toast('🧹 صُفّر الجهاز والسحابة')}
function wipeAll(){if(!confirm('حذف كل شيء نهائياً (الجهاز + السحابة)؟'))return;
 sessionStorage.setItem('fr_wipe_cloud','1');localStorage.clear();SV('fr_gas_base',Date.now());
 if(FB){FB.ref('ledger').remove().then(function(){location.reload()}).catch(function(){location.reload()})}else location.reload()}
function restore(inp){var f=inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(d.cust)CUST=d.cust;if(d.tx)TX=d.tx;if(d.drv)DRV=d.drv;if(d.dtx)DTX=d.dtx;if(d.fin)FIN=d.fin;SV('fr_cust',CUST);SV('fr_tx',TX);SV('fr_drv',DRV);SV('fr_dtx',DTX);SV('fr_fin',FIN);renderAll();cloudSave();toast('✅')}catch(e){toast('❌')}};r.readAsText(f)}
function saveSet(){if($('#sPass').value){SET.pass=$('#sPass').value;SV('fr_set',SET);$('#sPass').value='';toast('🔐 تغيّرت')}}
function backup(){saveBlob(new Blob([JSON.stringify({cust:CUST,tx:TX,drv:DRV,dtx:DTX,fin:FIN,set:SET})],{type:'application/json'}),'farouk-backup.json','application/json');toast('⬇ جاهز')}
/* 🔊 صوت + 🎤 إدخال صوتي */
function speak(text){if(!('speechSynthesis' in window))return;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.lang='ar-SA';u.rate=0.9;speechSynthesis.speak(u)}
var REC=null;
function vNorm(s){return (s||'').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)})}
var VWORDS={'واحد':1,'واحدة':1,'اثنتين':2,'ثنين':2,'ثلاث':3,'ثلاثة':3,'اربع':4,'أربع':4,'خمس':5,'خمسة':5,'ست':6,'ستة':6,'سبع':7,'سبعة':7,'ثمان':8,'ثمانية':8,'تسع':9,'تسعة':9,'عشر':10,'عشرة':10};
function vWords(t){for(var w in VWORDS)t=t.replace(new RegExp(w,'g'),VWORDS[w]);return t}
function lastPrice(cid){var l=TX.filter(function(x){return x.cust===cid&&x.price>0});return l.length?l[l.length-1].price:0}
function parseVoice(t){t=vWords(vNorm(t));var cust=null;CUST.forEach(function(c){if(t.indexOf(c.name)>=0)cust=c});
 var q=t.match(/(\d+)\s*(جرة|جرات|جره)/),pr=t.match(/(سعر|بسعر)\s*(\d+)/),pay=t.match(/(دفعة|مدفوع|قبض|دفع)\s*(\d+)/);
 var today=new Date().toISOString().slice(0,10);
 if(cust&&q){var price=pr?+pr[2]:lastPrice(cust.id);if(!price){toast('⚠️ ما عندي سعر — قل السعر');speak('ما عندي سعر، قل السعر');return}
  var qty=+q[1],tot=qty*price;TX.push({id:Date.now(),cust:cust.id,type:'D',qty:qty,price:price,total:tot,cur:'SYP',date:today,note:'إدخال صوتي 🎤'});
  var msg='سجّلت على '+cust.name+' '+qty+' جرة بمجموع '+f2(tot);
  if(pay){TX.push({id:Date.now()+1,cust:cust.id,type:'C',qty:0,price:0,total:+pay[2],cur:'SYP',date:today,note:'دفعة صوتية 🎤'});msg+=' ودفعة '+f2(+pay[2])}
  SV('fr_tx',TX);renderAll();cloudSave();toast('🎤 '+msg);speak(msg);return}
 if(cust&&pay){TX.push({id:Date.now(),cust:cust.id,type:'C',qty:0,price:0,total:+pay[2],cur:'SYP',date:today,note:'دفعة صوتية 🎤'});SV('fr_tx',TX);renderAll();cloudSave();var m2='سجّلت دفعة '+f2(+pay[2])+' على '+cust.name;toast('🎤 '+m2);speak(m2);return}
 toast('🎤 سمعت: '+t);speak('ما فهمت، كرر بوضوح')}
function voice(){var SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){toast('⚠️ استخدم متصفح كروم');return}
 if(!REC){REC=new SR();REC.lang='ar-SA';REC.interimResults=false;REC.onresult=function(e){parseVoice(e.results[0][0].transcript)};REC.onerror=function(){toast('❌ ما سمعتك')}}
 try{REC.start()}catch(e){}toast('🎤 عم اسمعك...')}
function addMic(){if($('#micBtn'))return;var b=document.createElement('button');b.id='micBtn';b.textContent='🎤';b.style.cssText='position:fixed;bottom:76px;left:14px;z-index:80;width:58px;height:58px;border-radius:50%;border:none;background:#0d2b21;color:#fff;font-size:26px;box-shadow:0 4px 14px rgba(0,0,0,.45);cursor:pointer';b.onclick=voice;document.body.appendChild(b)}
