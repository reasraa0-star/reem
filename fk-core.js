var firebaseConfig={apiKey:"AIzaSyAnO8p8p3xaPuBzEj239ncIhnV066zLhJQ",authDomain:"omar-28e22.firebaseapp.com",projectId:"omar-28e22",storageBucket:"omar-28e22.firebasestorage.app",messagingSenderId:"496194365995",appId:"1:496194365995:web:f4844a98b7e60710ccd86e",measurementId:"G-5L2R7Y2RQS"};
var FB=null;try{firebase.initializeApp(firebaseConfig);FB=firebase.database();}catch(e){FB=null}
var SET=LS('fr_set',{pass:'1234'}),CUST=LS('fr_cust',[]),TX=LS('fr_tx',[]);
var CURR={SYP:'ل.س',USD:'$'},curType='D',curCust=null,editingId=null;
function LS(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}}
function SV(k,v){localStorage.setItem(k,JSON.stringify(v))}
function $(s){return document.querySelector(s)}
function f2(n){return Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2})}
var _t;function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(_t);_t=setTimeout(function(){t.classList.remove('on')},2600)}
/* ☁️ حفظ بالسحابة */
var _cs=null;
function cloudSave(){clearTimeout(_cs);_cs=setTimeout(function(){if(FB)FB.ref('ledger').set({cust:CUST,tx:TX}).catch(function(){})},800)}
function loadCloud(){if(!FB){autoImport();renderAll();return}
 FB.ref('ledger').once('value').then(function(s){var v=s.val();
  if(v&&v.cust&&v.cust.length){CUST=v.cust;TX=v.tx||[];SV('fr_cust',CUST);SV('fr_tx',TX);SV('fr_old_done',1);renderAll();toast('☁️ تحمّل الدفتر من السحابة')}
  else{autoImport();if(CUST.length)cloudSave()}
 }).catch(function(){autoImport();renderAll()})}
function saveBlob(b,n,m){try{if(navigator.share){var f=new File([b],n,{type:m});if(!navigator.canShare||navigator.canShare({files:[f]})){navigator.share({files:[f],title:n}).catch(function(){});return}}}catch(e){}
 var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},500)}
function doLogin(){var v=$('#lp').value;
 if(v==='0000'){SET={pass:'1234'};SV('fr_set',SET);v='1234';toast('🔓 تم الدخول')}
 if(v===SET.pass){sessionStorage.setItem('fr_ok','1');enter()}else{$('#lerr').classList.add('on');setTimeout(function(){$('#lerr').classList.remove('on')},1800)}}
function logout(){sessionStorage.removeItem('fr_ok');location.reload()}
function enter(){$('#login').style.display='none';$('#app').classList.add('on');var t=new Date();$('#tDate').value=t.toISOString().slice(0,10);$('#rDay').value=t.toISOString().slice(0,10);$('#rMonth').value=t.toISOString().slice(0,7);renderAll();loadCloud()}
function autoImport(){if(typeof OLD==='undefined'||LS('fr_old_done',0))return;
 var base=Date.now();
 OLD.forEach(function(r,i){var c=findCust(r[0],'');if(!c){c={id:base+100000+i,name:r[0],phone:''};CUST.push(c)}
  TX.push({id:base+200000+i,cust:c.id,type:r[2],qty:0,price:0,total:r[3],cur:r[1]==='U'?'USD':'SYP',date:new Date().toISOString().slice(0,10),note:'رصيد مدوّر'})});
 SV('fr_cust',CUST);SV('fr_tx',TX);SV('fr_old_done',1);toast('📥 نزلت أرصدة الزبائن ('+OLD.length+')')}
function go(id,btn){document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');document.querySelectorAll('.sec').forEach(s=>s.classList.remove('on'));$('#s-'+id).classList.add('on');renderAll()}
function bal(id){var r={SYP:0,USD:0};TX.forEach(t=>{if(t.cust===id)r[t.cur]+=(t.type==='D'?t.total:-t.total)});return r}
function jars(id){return TX.filter(t=>t.cust===id).reduce((a,x)=>a+(+x.qty||0),0)}
function fmtBal(b){var p=[];for(var k in b){if(Math.abs(b[k])>0.001)p.push(f2(Math.abs(b[k]))+' '+CURR[k]+' '+(b[k]>0?'عليه':'له'))}return p.length?p.join(' • '):'مسدّد ✔'}
function cname(id){var c=CUST.filter(x=>x.id===id)[0];return c?c.name:'؟'}
function findCust(n,p){var ph=(p||'').replace(/\D/g,'');for(var i=0;i<CUST.length;i++){var cp=(CUST[i].phone||'').replace(/\D/g,'');if(CUST[i].name===n||(ph&&cp&&cp===ph))return CUST[i]}return null}
function syncFromGas(){if(!FB){toast('⚠️ لا اتصال');return}
 var impU=LS('fr_imp_u',{}),impO=LS('fr_imp_o',{}),impD=LS('fr_imp_d',{}),ch=false;
 FB.ref('users').limitToLast(500).once('value').then(function(su){su.forEach(function(c){var u=c.val();if(impU[c.key])return false;impU[c.key]=1;ch=true;if(!findCust(u.name,u.phone))CUST.push({id:Date.now()+Math.floor(Math.random()*9999),name:u.name,phone:u.phone||''});return false});return FB.ref('orders').orderByChild('ts').limitToLast(500).once('value')}).then(function(so){so.forEach(function(c){var o=c.val();if(impO[c.key])return false;impO[c.key]=1;ch=true;var x=findCust(o.name,o.phone);if(!x){x={id:Date.now()+Math.floor(Math.random()*9999),name:o.name,phone:o.phone||''};CUST.push(x)}TX.push({id:Date.now()+Math.floor(Math.random()*9999),cust:x.id,type:'D',qty:o.jars,price:o.price||0,total:o.total||0,cur:'SYP',date:o.day||'',note:'طلب غاز'});return false});return FB.ref('deliveries').orderByChild('ts').limitToLast(500).once('value')}).then(function(sd){sd.forEach(function(c){var d=c.val();if(impD[c.key])return false;impD[c.key]=1;ch=true;var x=findCust(d.cust,'');if(!x){x={id:Date.now()+Math.floor(Math.random()*9999),name:d.cust,phone:''};CUST.push(x)}if(d.paid>0)TX.push({id:Date.now()+Math.floor(Math.random()*9999),cust:x.id,type:'C',qty:0,price:0,total:d.paid,cur:'SYP',date:d.day||'',note:'دفعة تسليم — سائق: '+d.driver});return false});
 if(ch){SV('fr_cust',CUST);SV('fr_tx',TX);SV('fr_imp_u',impU);SV('fr_imp_o',impO);SV('fr_imp_d',impD);renderAll();cloudSave();toast('🔄 نزلت بيانات الغاز')}else toast('✔ لا جديد')}).catch(function(){toast('⚠️ تعذّرت المزامنة')})}
function addCust(){var n=$('#cNew').value.trim();if(!n){toast('⚠️ اكتب الاسم');return}CUST.push({id:Date.now(),name:n,phone:''});SV('fr_cust',CUST);$('#cNew').value='';renderAll();cloudSave();toast('✅ أُضيف')}
function quickCust(){var n=prompt('اسم الزبون:');if(n&&n.trim()){var id=Date.now();CUST.push({id:id,name:n.trim(),phone:''});SV('fr_cust',CUST);renderSel();$('#tCust').value=id;cloudSave();toast('✅ أُضيف')}}
function editCust(){var c=CUST.filter(x=>x.id===curCust)[0];var n=prompt('الاسم:',c.name);if(n&&n.trim())c.name=n.trim();var p=prompt('الرقم:',c.phone||'');if(p!==null)c.phone=p.trim();SV('fr_cust',CUST);renderAll();openCust(curCust);cloudSave();toast('✏️ عُدّل')}
function delCust(){var c=CUST.filter(x=>x.id===curCust)[0];if(!c||!confirm('حذف '+c.name+' وكل حركاته؟'))return;CUST=CUST.filter(x=>x.id!==curCust);TX=TX.filter(x=>x.cust!==curCust);SV('fr_cust',CUST);SV('fr_tx',TX);renderAll();cloudSave();go('cust',document.querySelectorAll('.nav button')[1]);toast('🗑 حُذف')}
function setType(t){curType=t;$('#segD').className=t==='D'?'onD':'';$('#segC').className=t==='C'?'onC':''}
function calcT(){$('#tTotal').value=f2((+$('#tQty').value||0)*(+$('#tPrice').value||0))}
function startEdit(id){var x=TX.filter(t=>t.id===id)[0];if(!x)return;editingId=id;go('add',document.querySelectorAll('.nav button')[2]);$('#tCust').value=x.cust;setType(x.type);$('#tQty').value=x.qty;$('#tPrice').value=x.price;calcT();$('#tCur').value=x.cur;$('#tDate').value=x.date;$('#tNote').value=x.note||'';$('#addTitle').textContent='✏️ تعديل حركة';$('#cancelEdit').style.display='inline-flex'}
function cancelEdit(){editingId=null;$('#addTitle').textContent='➕ تسجيل حركة';$('#cancelEdit').style.display='none';$('#tQty').value=1;$('#tPrice').value='';$('#tNote').value='';calcT()}
function saveTx(){var cid=+$('#tCust').value;if(!cid){toast('⚠️ اختر زبوناً');return}var tot=(+$('#tQty').value||0)*(+$('#tPrice').value||0);if(tot<=0){toast('⚠️ كمية وسعر');return}
 var d={cust:cid,type:curType,qty:+$('#tQty').value||0,price:+$('#tPrice').value||0,total:tot,cur:$('#tCur').value,date:$('#tDate').value,note:$('#tNote').value};
 if(editingId){var x=TX.filter(t=>t.id===editingId)[0];if(x)for(var k in d)x[k]=d[k];toast('✏️ عُدّلت')}else{d.id=Date.now();TX.push(d);toast('💾 حُفظت')}
 SV('fr_tx',TX);cancelEdit();renderAll();cloudSave()}
function delTx(id){if(!confirm('حذف؟'))return;TX=TX.filter(x=>x.id!==id);SV('fr_tx',TX);renderAll();cloudSave();toast('🗑')}
function openCust(id){curCust=id;var c=CUST.filter(x=>x.id===id)[0];$('#vName').textContent=c.name;
 $('#vBal').innerHTML='<div class="kpi"><div class="l">الرصيد</div><div class="v">'+fmtBal(bal(id))+'</div></div><div class="kpi"><div class="l">جرات</div><div class="v">'+jars(id)+'</div></div>';
 var tx=TX.filter(x=>x.cust===id);
 $('#vTx').innerHTML='<table class="tbl"><thead><tr><th>التاريخ</th><th>البيان</th><th>عليه</th><th>له</th><th></th></tr></thead><tbody>'+tx.map(x=>'<tr><td class="num">'+x.date+'</td><td>'+(x.note||'—')+'</td><td class="num neg">'+(x.type==='D'?f2(x.total):'—')+'</td><td class="num pos">'+(x.type==='C'?f2(x.total):'—')+'</td><td><button class="ib e" onclick="startEdit('+x.id+')">✏️</button></td></tr>').join('')+'</tbody></table>';
 document.querySelectorAll('.sec').forEach(s=>s.classList.remove('on'));$('#s-view').classList.add('on')}
function sendWA(){var c=CUST.filter(x=>x.id===curCust)[0];if(!c.phone){toast('⚠️ أضف الرقم');return}
 var tx=TX.filter(x=>x.cust===curCust);
 var msg='📒 *دفتر فاروق الرفاعي*%0Aالزبون: '+c.name+'%0A━━━━━━%0A'+tx.map(x=>'• '+x.date+' '+(x.type==='D'?'عليه':'له')+': '+f2(x.total)+' '+CURR[x.cur]).join('%0A')+'%0A━━━━━━%0Aالرصيد: '+fmtBal(bal(curCust));
 var ph=c.phone.replace(/\D/g,'');if(ph.startsWith('0'))ph='963'+ph.slice(1);window.open('https://wa.me/'+ph+'?text='+msg,'_blank')}
function wipeAccounts(){if(!confirm('حذف كل الزبائن والحركات من الجهاز والسحابة؟'))return;CUST=[];TX=[];SV('fr_cust',CUST);SV('fr_tx',TX);localStorage.removeItem('fr_imp_u');localStorage.removeItem('fr_imp_o');localStorage.removeItem('fr_imp_d');cloudSave();renderAll();toast('🧹 صُفّر')}
function wipeAll(){if(!confirm('حذف كل شيء نهائياً (الجهاز + السحابة)؟'))return;if(FB)FB.ref('ledger').remove();localStorage.clear();location.reload()}
function restore(inp){var f=inp.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(d.cust)CUST=d.cust;if(d.tx)TX=d.tx;SV('fr_cust',CUST);SV('fr_tx',TX);renderAll();cloudSave();toast('✅')}catch(e){toast('❌')}};r.readAsText(f)}
function saveSet(){if($('#sPass').value){SET.pass=$('#sPass').value;SV('fr_set',SET);$('#sPass').value='';toast('🔐 تغيّرت')}}
