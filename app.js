/* FALCON BROTHERHOOD - Platform Logic (Vercel-ready, localStorage DB)
   العرض للكل — النشر والموافقات من لوحة الإدارة (admin.html) فقط */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const DB={
 get(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch{return f}},
 set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){try{toast('التخزين اتملى — صغّر الصورة وحاول تاني','err')}catch(_){}throw e}}
};
const RANKS=[
 {id:0,name:'زائر',en:'VISITOR',icon:'👤',xp:0,daily:0,spec:'تصفح الموقع فقط — بدون حساب'},
 {id:1,name:'مستجد',en:'RECRUIT',icon:'🩸',xp:0,daily:10,spec:'الانضمام للمنظمات (+20 XP)'},
 {id:2,name:'مقاتل',en:'FIGHTER',icon:'🤜',xp:50,daily:10,spec:'المكافأة اليومية + طلب ترقية'},
 {id:3,name:'جندي',en:'SOLDIER',icon:'🔫',xp:120,daily:10,spec:'مقاتل معتمد + شارة مميزة'},
 {id:4,name:'قناص',en:'SNIPER',icon:'🎯',xp:220,daily:15,spec:'مكافأة يومية مضاعفة (15 XP)'},
 {id:5,name:'ظل',en:'SHADOW',icon:'🗡️',xp:350,daily:15,spec:'عمليات سرية + أولوية الترقية'},
 {id:6,name:'تاجر',en:'DEALER',icon:'💰',xp:500,daily:20,spec:'مكافأة يومية 20 XP + وسيط السوق'},
 {id:7,name:'قائد',en:'COMMANDER',icon:'🎖️',xp:700,daily:25,spec:'دخول لوحة التحكم + النشر + قبول الترقيات'},
 {id:8,name:'حارس العش',en:'GUARDIAN',icon:'🛡️',xp:950,daily:25,spec:'+ تعيين الرتب وإدارة الأعضاء'},
 {id:9,name:'الجناح الأيمن',en:'RIGHT WING',icon:'⚔️',xp:1250,daily:30,spec:'+ إدارة المنظمات والإعدادات'},
 {id:10,name:'الصقر',en:'THE FALCON',icon:'🦅',xp:1600,daily:50,spec:'المؤسس — كل الصلاحيات + تصفير الداتا'},
];
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function sha(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return 'h'+Math.abs(h)}}
function toast(msg,type=''){const el=$('#toasts');if(!el)return;const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;el.appendChild(t);setTimeout(()=>t.remove(),3200)}
function addXP(user,amount){const users=DB.get('fb_users',[]);const u=users.find(x=>x.name===user.name);if(!u)return;u.xp=(u.xp||0)+amount;DB.set('fb_users',users);const s=DB.get('fb_session',null);if(s&&s.name===u.name){s.xp=u.xp;s.rank=u.rank;DB.set('fb_session',s)}}
function session(){return DB.get('fb_session',null)}
function me(){const s=session();if(!s)return null;return DB.get('fb_users',[]).find(u=>u.name===s.name)||null}
function isAdmin(){const m=me();return m&&m.rank>=7}
function migrateRanks(){
 if(DB.get('fb_rankver',0)>=2)return;
 const map={1:1,2:3,3:7,4:9,5:10}; // تحويل الرتب القديمة (6) → الجديدة (11)
 const users=DB.get('fb_users',[]);
 users.forEach(u=>{if(map[u.rank]!=null)u.rank=map[u.rank]});
 DB.set('fb_users',users);
 const s=DB.get('fb_session',null);
 if(s){const u=users.find(x=>x.name===s.name);if(u){s.rank=u.rank;s.xp=u.xp;DB.set('fb_session',s)}}
 DB.set('fb_rankver',2);
}
function updateAdminLink(){const a=isAdmin();['adminLink'].forEach(id=>{const e=document.getElementById(id);if(e)e.style.display=a?'':'none'})}
const NEWS_WH='https://discord.com/api/webhooks/1557726226922340412/E2xEDeyPAuCgs2QYNfUoS_3b3eb9nbTtoKIp_hTDbPzCDhru9U1Ozgln5mrdG-6hhTnt';
const SUPPORT_WH='https://discord.com/api/webhooks/1557726874803765338/XzgBjl1fTeOGqU_3CbJb5wmAEiu8zzIgHznG4wjr7Gfn8h_hO7V2WYaZwpKWygfx-nQ6';
const AUTH_WH='https://discord.com/api/webhooks/1558452488259109006/iMG4dOJ8X-8JuULprILmBWlcb2LDSAAU1Jkyd6lsafrvP5VgdD22R6ahaV47MSRzaafn';
function cfg(){const c=Object.assign({webhook:NEWS_WH,supportWebhook:SUPPORT_WH,authWebhook:AUTH_WH,invite:'https://discord.gg/YbHbuY2QBx',serverIP:'connect YOUR-SERVER-IP',goal:5000,bank:'FLCN-001',ping:true,donCooldownH:5,promoOpen:true},DB.get('fb_config',{}));if(String(c.invite||'').includes('YOUR-INVITE'))c.invite='https://discord.gg/YbHbuY2QBx';return c}
function moneyCfg(){const d={hud:true,startCash:0,startDirty:0};const s=(cfg().money||{});return Object.assign({},d,s)}
function xpCfg(){const d={reg:10,regVip:500,regFounder:1000,login:5,join:20,promo:50,support:20,cd:20,daily:{1:10,2:10,3:10,4:15,5:15,6:20,7:25,8:25,9:30,10:50}};const s=(cfg().xp||{});return Object.assign({},d,s,{daily:Object.assign({},d.daily,s.daily||{})})}

function defaultProducts(){const t=new Date().toISOString();return [
 {id:'p1',title:'مسدس Pistol',price:5000,cat:'أسلحة',icon:'🔫',desc:'تسليح خفيف أساسي لكل مقاتل — ممتاز للاشتباكات القريبة.',img:'',date:t},
 {id:'p2',title:'شوتجان Shotgun',price:12000,cat:'أسلحة',icon:'🔫',desc:'قوة تدميرية قريبة المدى — سلاح الاقتحامات الأول.',img:'',date:t},
 {id:'p3',title:'رشاش AK',price:25000,cat:'أسلحة',icon:'🎯',desc:'الرشاش المعتمد للعصابة — للمعارك الكبيرة والاستحواذات.',img:'',date:t},
 {id:'p4',title:'درع واقي',price:8000,cat:'دروع',icon:'🛡️',desc:'درع صدري يحميك في الاشتباكات — إجباري في الحروب.',img:'',date:t}
]}
function seed(){
 migrateRanks();
 if(!localStorage.getItem('fb_users')) DB.set('fb_users',[]);
 const _uu=DB.get('fb_users',[]);let _ch=false;_uu.forEach(u=>{if(u.cash===undefined){u.cash=0;_ch=true}if(u.dirty===undefined){u.dirty=0;_ch=true}});if(_ch)DB.set('fb_users',_uu);
 if(!localStorage.getItem('fb_orgs')) DB.set('fb_orgs',[{id:'main',name:'FALCON BROTHERHOOD',tag:'FLCN',desc:'المنظمة الأم — عصابة الصقر. الولاء أو الموت. South LS HQ.',boss:null,members:[],power:97,turf:'South LS — HQ',createdAt:new Date().toISOString()}]);
 if(!localStorage.getItem('fb_ads'))DB.set('fb_ads',[]);
 if(!localStorage.getItem('fb_news')) DB.set('fb_news',[
  {id:uid(),author:'الإدارة',title:'أهلاً بيكم في عصابة الصقر',body:'من دلوقتي كل الإعلانات والبيانات الرسمية بتنزل من لوحة التحكم الخاصة بالإدارة فقط. تابعوا قسم الأخبار أول بأول.',date:new Date().toISOString()},
 ]);
 if(!localStorage.getItem('fb_promos')) DB.set('fb_promos',[]);if(!localStorage.getItem('fb_products'))DB.set('fb_products',defaultProducts());if(!localStorage.getItem('fb_orders'))DB.set('fb_orders',[]);
 if(!DB.get('fb_cleanAds',0)){const bad=['مطلوب جنود جدد','Dubsta','مرافقة VIP'];DB.set('fb_ads',DB.get('fb_ads',[]).filter(a=>!bad.some(t=>String(a.title||'').includes(t))));DB.set('fb_cleanAds',1)}
 if(!localStorage.getItem('fb_config')) DB.set('fb_config',{webhook:'',invite:'https://discord.gg/YbHbuY2QBx',serverIP:'connect YOUR-SERVER-IP'});
}

/* ---------- AUTH ---------- */
let pendingAvatar='';
function openModal(tab='login'){ $('#authModal').classList.add('open'); switchTab(tab); }
function closeModal(){ $('#authModal').classList.remove('open'); }
function switchTab(t){
 $$('#authModal .tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===t));
 $('#loginForm').style.display=t==='login'?'flex':'none';
 $('#regForm').style.display=t==='register'?'flex':'none';
}
function bindAvatar(inputId,imgId){
 const inp=document.getElementById(inputId); if(!inp) return;
 inp.addEventListener('change',()=>{
  const f=inp.files[0]; if(!f) return;
  if(f.size>100*1024*1024){toast('الصورة كبيرة — اختار صورة أو GIF أقل من 100MB','err');return}
  if(f.type==='image/gif'){const gr=new FileReader();gr.onload=()=>{pendingAvatar=gr.result;document.getElementById(imgId).src=pendingAvatar;toast('اترفعت صورتك المتحركة ✓','ok')};gr.readAsDataURL(f);return}
  const r=new FileReader();
  r.onload=()=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');const S=256;c.width=S;c.height=S;const m=Math.min(img.width,img.height);c.getContext('2d').drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,S,S);pendingAvatar=c.toDataURL('image/jpeg',.82);document.getElementById(imgId).src=pendingAvatar;toast('تم تجهيز الصورة ✓','ok')};img.src=r.result};
  r.readAsDataURL(f);
 });
}
async function handleRegister(e){
 e.preventDefault();
 const name=$('#r_user').value.trim(), pass=$('#r_pass').value, dc=$('#r_dc').value.trim(), ic=$('#r_ic').value.trim();
 if(name.length<3){toast('اسم المستخدم 3 حروف على الأقل','err');return}
 if(pass.length<4){toast('الباسورد 4 حروف على الأقل','err');return}
 const users=DB.get('fb_users',[]);
 if(users.some(u=>u.name.toLowerCase()===name.toLowerCase())){toast('الاسم ده متسجل قبل كده','err');return}
 const hash=await sha('fb$'+pass);
 const order=users.length; // 0=الأول، 1=التاني، 2=التالت
 const rank=order===0?10:(order===1?9:(order===2?8:1)); // أول 3 حسابات = فريق الإدارة
 const u={name,pass:hash,dc,ic,avatar:pendingAvatar||'',rank,xp:rank===10?xpCfg().regFounder:(rank>=8?xpCfg().regVip:xpCfg().reg),org:'main',cash:moneyCfg().startCash,dirty:moneyCfg().startDirty,date:new Date().toISOString()};
 users.push(u);DB.set('fb_users',users);
 const orgs=DB.get('fb_orgs',[]);const m=orgs.find(o=>o.id==='main');
 if(m&&!m.members.some(x=>x.u===name)) {m.members.push({u:name,role:RANKS[rank].en});if(order===0)m.boss=name;DB.set('fb_orgs',orgs)}
 pendingAvatar='';
 DB.set('fb_session',{name,rank:u.rank,xp:u.xp});
 setTimeout(()=>{try{showWelcome(u)}catch(e){}},600);
 toast(order===0?'اتعمل حساب المؤسس — انت الصقر الكبير 🦅':(order<3?'انت من أول 3 — معاك صلاحيات إدارة 🛡️':'تم إنشاء حسابك بنجاح، أهلاً بيك في العش'),'ok');
 closeModal();renderAll();sendAuth(`🦅 عضو جديد: **${name}** (${ic||'بدون IC'} / ${dc||'بدون ديسكورد'})`);
}
async function handleLogin(e){
 e.preventDefault();
 const name=$('#l_user').value.trim(), pass=$('#l_pass').value;
 const users=DB.get('fb_users',[]);
 const u=users.find(x=>x.name.toLowerCase()===name.toLowerCase());
 if(!u){toast('مفيش حساب بالاسم ده','err');return}
 if(u.pass!==await sha('fb$'+pass)){toast('الباسورد غلط','err');return}
 u.xp=(u.xp||0)+xpCfg().login;DB.set('fb_users',users);
 DB.set('fb_session',{name:u.name,rank:u.rank,xp:u.xp});
 sendAuth('دخول العش: '+u.name+' ('+u.xp+' XP)');
 toast('نورت العش يا '+u.name,'ok');closeModal();renderAll();
}
function logout(){localStorage.removeItem('fb_session');renderAll();toast('تم تسجيل الخروج')}
function requireLogin(){if(!session()){openModal('login');toast('سجل دخول الأول عشان تكمل','err');return false}return true}

/* ---------- PROFILE ---------- */
function renderAuthArea(){
 const s=session(), box=$('#authArea');if(!box)return;
 if(!s){box.innerHTML=`<a href="javascript:void(0)" onclick="openModal('login')">دخول</a><a href="javascript:void(0)" onclick="openModal('register')" class="cta">انضم لنا</a>`;return}
 const u=me();
 const av=u?.avatar?`<img src="${u.avatar}">`:`<img src="logo.png" onerror="this.style.display='none'">`;
 box.innerHTML=`<div class="user-chip" onclick="document.getElementById('dashboard').scrollIntoView({behavior:'smooth'})">${av}<b>${esc(u.name)}</b><span class="badge gold">${esc(RANKS[u.rank]?.name||'')}</span></div><a href="javascript:void(0)" onclick="logout()" style="color:#ff9090">خروج</a>`;
}
function renderProfile(){
 const s=session(), el=$('#profileBox');if(!el)return;
 if(!s){el.innerHTML=`<div class="empty">🔒 سجل دخول أو اعمل حساب عشان تشوف ملفك، ترقياتك، ومنظمتك.<br><br><button class="btn btn-red btn-sm" onclick="openModal('register')">اعمل حساب دلوقتي</button></div>`;return}
 const u=me();if(!u){logout();return}
 const r=RANKS[u.rank]||RANKS[1];const next=RANKS[Math.min(10,u.rank+1)];
 const pct=next.xp>r.xp?Math.min(100,Math.round(((u.xp-r.xp)/(next.xp-r.xp))*100)):100;
 const orgs=DB.get('fb_orgs',[]);const org=orgs.find(o=>o.id===u.org);
 const daily=(xpCfg().daily||{})[u.rank]||RANKS[u.rank]?.daily||10;
 const tier=u.rank>=10?'gold':(u.rank>=7?'red':'bronze');
 const avImg=u.avatar?`<img src="${u.avatar}" alt="">`:`<span>${r.icon}</span>`;
 const road=RANKS.slice(1).map(x=>`<span class="pf-step${x.id<u.rank?' done':x.id===u.rank?' cur':''}" title="LVL ${x.id} — ${x.name}">${x.icon}</span>`).join('');
 const nextTxt=u.rank>=10?'أعلى رتبة — انت الأسطورة 🦅':`ناقصك <b>${next.xp-u.xp} XP</b> وتبقى <b>${next.icon} ${next.name}</b>`;
 el.innerHTML=`<div class="pf-wrap pf-${tier}">
  <div class="pf-rank"><div class="pf-glow"></div>
   <div class="pf-lvl">LVL ${r.id} • ${r.en}</div>
   <div class="pf-emblem">${avImg}</div>
   <h3 class="pf-name">${esc(u.name)}</h3>
   <div class="pf-rankname">${r.icon} ${r.name}</div>
   <div class="pf-xp"><b>${u.xp}</b><span>XP</span></div>
   <div class="pf-bar"><i style="width:${pct}%"></i></div>
   <div class="pf-next">${nextTxt} <em>(${pct}%)</em></div>
   <div class="pf-spec">✨ ${esc(r.spec)}<br>🎁 مكافأة يومية ${daily} XP</div>
   <div class="pf-actions">
    <button class="btn-ghost btn-sm" onclick="document.getElementById('avatarInput').click()">📷 غيّر صورتك</button>
    <input type="file" id="avatarInput" accept="image/*" hidden>
    <button class="btn btn-red btn-sm" onclick="claimDaily()">🎁 مكافأة +${daily}</button>
   </div></div>
  <div class="pf-info">
   <div class="pf-road"><div class="pf-road-t">🗺️ طريق الصقر — رتبتك منورة</div><div class="pf-steps">${road}</div></div>
   <div class="stat-row"><span>🏛️ المنظمة</span><b>${esc(org?.name||'بدون')}</b></div>
   <div class="stat-row"><span>👤 داخل اللعبة IC</span><b>${esc(u.ic||'—')}</b></div>
   <div class="stat-row"><span>💬 الديسكورد</span><b dir="ltr">${esc(u.dc||'—')}</b></div>
   <div class="stat-row"><span>📅 عضو من</span><b>${new Date(u.date).toLocaleDateString('ar-EG')}</b></div>
   <p class="pf-tip">💡 <b style="color:#fff">ازاي تجمع XP؟</b> المكافأة اليومية (${daily} XP) • الانضمام لمنظمة (+20) • ترقية مقبولة (+50).</p>
   <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
    <button class="btn btn-red btn-sm" onclick="document.getElementById('ranks').scrollIntoView({behavior:'smooth'})">اطلب ترقية ⬆️</button>
    <button class="btn btn-line btn-sm" onclick="document.getElementById('orgs').scrollIntoView({behavior:'smooth'})">منظمتي 🏛️</button>
   </div></div></div>`;
 const ai=$('#avatarInput');
 if(ai) ai.addEventListener('change',()=>{
  const f=ai.files[0];if(!f)return;
  if(f.size>100*1024*1024){toast('الصورة كبيرة — اختار صورة أو GIF أقل من 100MB','err');return}
  // GIF متحرك يتحفظ زي ما هو
  if(f.type==='image/gif'){const gr=new FileReader();gr.onload=()=>{const users2=DB.get('fb_users',[]);const mine=users2.find(x=>x.name===u.name);mine.avatar=gr.result;DB.set('fb_users',users2);toast('اتحدثت صورتك المتحركة ✓','ok');renderAll()};gr.readAsDataURL(f);return}
  const r=new FileReader();
  r.onload=()=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=256;c.height=256;const m=Math.min(img.width,img.height);c.getContext('2d').drawImage(img,(img.width-m)/2,(img.height-m)/2,m,m,0,0,256,256);const users2=DB.get('fb_users',[]);const mine=users2.find(x=>x.name===u.name);mine.avatar=c.toDataURL('image/jpeg',.82);DB.set('fb_users',users2);toast('اتحدثت صورتك ✓','ok');renderAll()};img.src=r.result};
  r.readAsDataURL(f);
 });
}
function claimDaily(){
 const u=me();if(!u)return;const last=DB.get('fb_daily_'+u.name,0);
 if(Date.now()-last<xpCfg().cd*1000){toast('اهدى يا وحش — المكافأة كل شوية، مش سبام 😅','err');return}
 const bonus=(xpCfg().daily||{})[u.rank]||RANKS[u.rank]?.daily||10; // المكافأة حسب الرتبة
 DB.set('fb_daily_'+u.name,Date.now());addXP(u,bonus);toast(`+${bonus} XP اتضافت لرصيدك 🎁`,'ok');renderAll();
}

/* ---------- NEWS (من الإدارة فقط — عبر admin.html) ---------- */
function renderNews(){
 const el=$('#newsList');if(!el)return;
 const users=DB.get('fb_users',[]);
 const news=DB.get('fb_news',[]).slice().reverse().slice(0,3);
 const nc=$('#newsCount');if(nc)nc.textContent=DB.get('fb_news',[]).length;
 el.innerHTML=news.map(n=>{
  const u=users.find(x=>x.name===n.author);const r=RANKS[u?u.rank:3]||RANKS[3];
  const av=u&&u.avatar?`<img src="${u.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid var(--bronze)">`:`<div style="width:44px;height:44px;border-radius:50%;background:#000;border:2px solid var(--red);display:flex;align-items:center;justify-content:center;font-size:22px">🦅</div>`;
  return `<div class="card" style="cursor:pointer;border:1px solid var(--bronze);border-top:4px solid var(--red)" onclick="location.href='news.html?id=${n.id}'">
  <div style="display:flex;justify-content:space-between;align-items:center"><span class="badge red">📜 مرسوم رسمي</span><span class="hint">${new Date(n.date).toLocaleDateString('ar-EG')}</span></div>
  <h3 style="margin-top:8px">${esc(n.title)}</h3>
   ${n.img?`<img src="${n.img}" alt="" loading="lazy" style="width:100%;max-height:220px;object-fit:cover;border:1px solid #2c2c32;margin-top:10px">`:''}
  <p>${esc(String(n.body).slice(0,110))}${String(n.body).length>110?'...':''}</p>
  <div style="display:flex;align-items:center;gap:10px;margin-top:10px;background:rgba(0,0,0,.5);border:1px solid #2a2a30;padding:8px 12px">${av}<div><div style="font-size:14px">👤 <b>${esc(n.author)}</b> <span class="badge ${u&&u.rank>=7?'red':'gold'}">${r.icon} ${r.name}</span></div></div></div>
  <div class="meta"><span style="color:var(--red)">افتح المرسوم كامل ⬅</span></div></div>`}).join('')||'<div class="empty">مفيش أخبار لسه</div>';
}

/* ---------- ORGS (العرض والانضمام للكل — مفيش تأسيس) ---------- */
function renderOrgs(){
 const orgs=DB.get('fb_orgs',[]), users=DB.get('fb_users',[]), s=session();
 const box=$('#orgList');if(!box)return;
 const myOrg=s?users.find(u=>u.name===s.name)?.org:null;
 box.innerHTML=orgs.map(o=>{
  const boss=o.boss||'—';const cnt=o.members.length;
  const inOrg=myOrg===o.id;
  return `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h3>🏛️ ${esc(o.name)}</h3><span class="badge gold">${esc(o.tag||'')}</span></div>
  <p>${esc(o.desc||'')}</p>
  <div class="meta">👑 القائد: <b style="color:#fff">${esc(boss)}</b> • 👥 الأعضاء: <b style="color:#fff">${cnt}</b> • 📍 ${esc(o.turf||'Los Santos')} • ⚡ القوة: <b style="color:var(--bronze)">${o.power||50}%</b></div>
  <div class="rank-bar"><i style="width:${o.power||50}%"></i></div>
  <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
   ${s&&!inOrg?`<button class="btn-ghost btn-sm" onclick="joinOrg('${o.id}')">انضم للمنظمة</button>`:''}
   ${inOrg?`<span class="badge green">✓ انت عضو هنا</span>`:''}
   <button class="btn-ghost btn-sm" onclick="viewMembers('${o.id}')">عرض الأعضاء</button>
  </div><div id="mem-${o.id}" style="margin-top:10px"></div></div>`
 }).join('')||'<div class="empty">مفيش منظمات لسه</div>';
 const oc=$('#orgCount');if(oc)oc.textContent=orgs.length;
 const mc=$('#memberCount');if(mc)mc.textContent=users.length;
}
function joinOrg(id){
 if(!requireLogin())return;const s=session();
 const users=DB.get('fb_users',[]);const u=users.find(x=>x.name===s.name);
 const orgs=DB.get('fb_orgs',[]);const o=orgs.find(x=>x.id===id);if(!o)return;
 u.org=id;DB.set('fb_users',users);
 if(!o.members.some(m=>m.u===u.name))o.members.push({u:u.name,role:'RECRUIT'});
 o.power=Math.min(99,(o.power||50)+1);DB.set('fb_orgs',orgs);
 addXP(s,xpCfg().join);toast('انضميت لـ '+o.name,'ok');renderAll();
}
function viewMembers(id){
 const orgs=DB.get('fb_orgs',[]);const o=orgs.find(x=>x.id===id);if(!o)return;
 const el=document.getElementById('mem-'+id);if(!el)return;
 el.innerHTML=`<div style="background:#0b0b0d;border:1px solid #222228;padding:12px;margin-top:6px">`+
 (o.members.map(m=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1b1b1f;font-size:14px"><span>👤 ${esc(m.u)} <span class="hint">${esc(m.role)}</span></span></div>`).join('')||'مفيش أعضاء')+`</div>`;
}

/* ---------- ADS (العرض للكل — النشر من لوحة الإدارة فقط) ---------- */
let adFilter='الكل';
function setFilter(c,btn){adFilter=c;$$('.filters button').forEach(b=>b.classList.remove('on'));btn.classList.add('on');renderAds()}
function renderAds(){
 const box=$('#adsList');if(!box)return;
 const all=DB.get('fb_ads',[]);
 const ordered=[...all.filter(a=>!a.pin),...all.filter(a=>a.pin).reverse()].reverse();
 const users=DB.get('fb_users',[]);
 const list=ordered.filter(a=>adFilter==='الكل'||a.cat===adFilter);
 const ac=$('#adCount');if(ac)ac.textContent=all.length;
 box.innerHTML=list.map(a=>{
  const u=users.find(x=>x.name===a.author);
  const av=u?.avatar?`<img src="${u.avatar}" style="width:30px;height:30px;border-radius:50%;object-fit:cover">`:'👤';
  return `<div class="card"${a.pin?' style="border-color:var(--bronze)"':''}>${a.pin?'<span class="badge gold">📌 مثبت من الإدارة</span>':''}${a.img?`<div class="ad-img" style="background-image:url('${a.img}');margin-top:8px"></div>`:''}
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><span class="badge ${a.cat==='تجنيد'?'red':a.cat==='سيارات'?'gold':'green'}">${esc(a.cat)}</span><span class="hint">${new Date(a.date).toLocaleDateString('ar-EG')}</span></div>
  <h3 style="margin-top:8px">${esc(a.title)}</h3>
  ${a.price?`<div class="price">${esc(a.price)}</div>`:''}
  <p>${esc(a.desc)}</p>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><span style="font-size:13px;display:flex;gap:6px;align-items:center">${av} <b>${esc(a.author)}</b> <span class="badge red" style="font-size:10px">إدارة</span></span></div></div>`
 }).join('')||'<div class="empty">مفيش إعلانات لسه — الإدارة هتنشر قريب 📢</div>';
}

/* ---------- PROMOTIONS (الطلب للكل — الموافقة من لوحة الإدارة فقط) ---------- */
function renderRanks(){
 const grid=$('#ranksGrid');if(!grid)return;
 const u=me();const myRank=u?u.rank:1;
 grid.innerHTML=RANKS.slice(1).map(r=>`
  <div class="rank ${r.id===myRank?'cur':''}"><div class="lvl">LVL ${r.id}</div><div class="big">${r.icon}</div>
  <h3>${r.name}</h3><div class="hint en">${r.en}</div>
  <div class="meta">يحتاج ${r.xp} XP</div>
  <div class="spec">${r.spec}</div>
  ${r.id===myRank?'<div style="margin-top:8px"><span class="badge gold">رتبتك الحالية</span></div>':''}</div>`).join('');
 renderPromoRequests();
}
function requestPromo(e){
 e.preventDefault();if(!requireLogin())return;
 if(cfg().promoOpen===false){toast('🔒 طلبات الترقية مقفولة حالياً من الإدارة','err');return}
 const u=me();
 if(u.rank>=10){toast('انت الصقر — مفيش أعلى من كده 🦅','err');return}
 const next=u.rank+1, need=RANKS[next].xp;
 if(u.xp<need){toast(`محتاج ${need-u.xp} XP زيادة عشان تطلب ${RANKS[next].name}`,'err');return}
 const pr=DB.get('fb_promos',[]);
 if(pr.some(p=>p.user===u.name&&p.status==='pending')){toast('عندك طلب متعلق مستني موافقة الإدارة','err');return}
 pr.push({id:uid(),user:u.name,fromRank:u.rank,toRank:next,reason:$('#p_reason').value.trim(),status:'pending',date:new Date().toISOString()});
 DB.set('fb_promos',pr);e.target.reset();toast('طلبك اتبعت للإدارة — بالتوفيق يا وحش','ok');renderAll();
 sendAuth(`⬆️ طلب ترقية: **${u.name}** من ${RANKS[u.rank].name} إلى ${RANKS[next].name}`);
}
function renderPromoRequests(){
 const pl=$('#promoList');if(!pl)return;
 const pr=DB.get('fb_promos',[]).slice().reverse();
 const pend=pr.filter(p=>p.status==='pending');
 pl.innerHTML=(pr.slice(0,8).map(p=>`<div class="stat-row"><span>👤 ${esc(p.user)}: ${RANKS[p.fromRank].name} → <b>${RANKS[p.toRank].name}</b> — <span class="hint">${esc(p.reason||'بدون سبب')}</span></span><span class="badge ${p.status==='pending'?'gold':p.status==='ok'?'green':'red'}">${p.status==='pending'?'مستني':p.status==='ok'?'اتقبل ✅':'اترفض ❌'}</span></div>`).join('')||'<div class="empty">مفيش طلبات ترقية — كن أول واحد يطلب 💪</div>');
 const box=$('#approveBox');
 if(box) box.innerHTML=pend.length?`<div class="hint" style="margin-top:10px">⏳ فيه ${pend.length} طلب مستني موافقة الإدارة من لوحة التحكم.</div>`:'';
 // قفل/فتح فورم طلب الترقية حسب تحكم الإدارة
 const open=cfg().promoOpen!==false;
 const pf=$('#promoForm');
 if(pf){
  pf.style.display=open?'':'none';
  let lk=$('#promoLock');
  if(!open){
   if(!lk){lk=document.createElement('div');lk.id='promoLock';lk.className='box';pf.parentNode.insertBefore(lk,pf)}
   lk.style.display='';lk.innerHTML=`<h3>🔒 طلبات الترقية مقفولة حالياً</h3><p class="hint">الإدارة قافلة باب الترقيات مؤقتاً — تابع صفحة البيانات الرسمية عشان تعرف لما يتفتح.</p><a href="news.html" class="btn-ghost btn-sm" style="display:inline-block;margin-top:8px">📰 صفحة البيانات</a>`;
  }else if(lk)lk.style.display='none';
 }
}

/* ---------- MEMBERS + LEADERBOARD ---------- */
function renderMembers(){
 const users=DB.get('fb_users',[]);
 const bl=$('#boardList');if(!bl)return;
 const sorted=[...users].sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,8);
 bl.innerHTML=sorted.map((u,i)=>`<div class="stat-row"><span>${i===0?'🥇':i===1?'🥈':i===2?'🥉':'👤'} <b>${esc(u.name)}</b> <span class="badge ${u.rank>=7?'red':'gold'}">${RANKS[u.rank]?.icon} ${RANKS[u.rank]?.name}</span></span><b style="color:var(--bronze)">${u.xp} XP</b></div>`).join('')||'<div class="empty">مفيش أعضاء لسه — سجل وكن الأول 🦅</div>';
 const ab=$('#adminBox');
 if(ab){
  if(isAdmin()){
   const pend=DB.get('fb_promos',[]).filter(p=>p.status==='pending').length;
   ab.innerHTML=`<h3>🛡️ انت من الإدارة</h3>
   <p class="sub" style="margin:6px auto">عندك ${pend} طلب ترقية معلق — ادخل لوحة التحكم للنشر والإدارة الكاملة.</p>
   <a href="admin.html" class="btn btn-red btn-sm" style="margin-top:10px">فتح لوحة التحكم 🛡️</a>`;
  } else ab.innerHTML='';
 }
 const c=cfg();
 $$('.invite-link').forEach(a=>a.href=c.invite);
 const si=$('#serverIpTxt');if(si){si.textContent=c.serverIP;const cc=si.closest('.card');if(cc)cc.style.display='none'}
}
function sendAuth(msg){const w=cfg().authWebhook||AUTH_WH;if(!w)return;fetch(w,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:String(msg).slice(0,1900)})}).catch(()=>{})}
function sendWebhook(msg){const w=cfg().webhook||NEWS_WH;if(!w)return;const tag=cfg().ping===false?'':'@everyone\n';fetch(w,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:tag+msg,allowed_mentions:{parse:['everyone']}})}).catch(()=>{})}

/* ---------- WELCOME / رسالة الترحيب بالموسيقى المميزة ---------- */
let welcomeCtx=null, welcomeNodes=[], welcomeMuted=false;
function showWelcome(user){
  const ov=document.getElementById('welcomeOverlay'); if(!ov) return;
  const r=RANKS[user.rank]||RANKS[1];
  const title=document.getElementById('wTitle');
  if(title) title.innerHTML='نورت العش يا <b>'+esc(user.name)+'</b> 🔥';
  const rk=document.getElementById('wRank');
  if(rk) rk.innerHTML='<span class="badge red" style="font-size:14px;padding:6px 18px">'+r.icon+' '+r.name+'</span> <span class="badge gold" style="font-size:14px">'+user.xp+' XP</span>';
  const msg=document.getElementById('wMsg');
  if(msg){
    if(user.rank>=10) msg.innerHTML='🦅 <b style="color:#fff">انت الصقر الكبير — المؤسس!</b><br>العش كله تحت جناحك. افتح لوحة التحكم وابدأ تنشر بياناتك الأولى.';
    else if(user.rank>=8) msg.innerHTML='🛡️ <b style="color:#fff">انت من أول 3 — معاك صلاحيات إدارة!</b><br>الولاء أو الموت. ساعد الصقر في قيادة العش من لوحة التحكم.';
    else msg.innerHTML='احنا مش عصابة عادية — احنا <b style="color:#fff">إخوة بالدم.</b><br>خد مكافأتك اليومية 🎁 وانضم لمنظمة 🏛️ واطلب ترقية ⬆️ عشان تطلع من مستجد لصقر.';
  }
  const em=document.getElementById('wEmblem');
  if(em) em.innerHTML=user.avatar?'<img src="'+user.avatar+'">':'🦅';
  ov.classList.add('show');
  const eq=document.getElementById('wEq'); if(eq) eq.classList.remove('paused');
  const mb=document.getElementById('wMuteBtn'); if(mb) mb.textContent='🔇 كتم الموسيقى';
  welcomeMuted=false;
  document.body.style.overflow='hidden';
  playWelcomeAnthem();
  welcomeConfetti();
}
function closeWelcome(){
  const ov=document.getElementById('welcomeOverlay'); if(ov) ov.classList.remove('show');
  document.body.style.overflow='';
  stopWelcomeMusic();
}
function toggleWelcomeMusic(){
  const eq=document.getElementById('wEq'), mb=document.getElementById('wMuteBtn');
  if(welcomeMuted){ welcomeMuted=false; if(eq)eq.classList.remove('paused'); if(mb)mb.textContent='🔇 كتم الموسيقى'; playWelcomeAnthem(); }
  else { welcomeMuted=true; stopWelcomeMusic(); if(eq)eq.classList.add('paused'); if(mb)mb.textContent='🎵 تشغيل الموسيقى'; }
}
function stopWelcomeMusic(){
  try{ welcomeNodes.forEach(n=>{try{n.stop?n.stop():n.disconnect()}catch(e){}}); }catch(e){}
  welcomeNodes=[];
  if(welcomeCtx){ try{welcomeCtx.close()}catch(e){} welcomeCtx=null; }
}
function playWelcomeAnthem(){
  stopWelcomeMusic();
  if(welcomeMuted) return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
    welcomeCtx=new AC();
    const ctx=welcomeCtx, t0=ctx.currentTime+0.05;
    const master=ctx.createGain(); master.gain.value=0.28; master.connect(ctx.destination);
    welcomeNodes.push(master);
    const tone=(freq,start,dur,type,vol,slideTo)=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type=type||'sawtooth'; o.frequency.setValueAtTime(freq,start);
      if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo,start+dur);
      g.gain.setValueAtTime(0.0001,start);
      g.gain.exponentialRampToValueAtTime(vol||0.5,start+0.03);
      g.gain.exponentialRampToValueAtTime(0.0001,start+dur);
      o.connect(g); g.connect(master); o.start(start); o.stop(start+dur+0.05);
      welcomeNodes.push(o);
    };
    const kick=(start)=>{
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.type='sine'; o.frequency.setValueAtTime(150,start); o.frequency.exponentialRampToValueAtTime(40,start+0.25);
      g.gain.setValueAtTime(0.9,start); g.gain.exponentialRampToValueAtTime(0.0001,start+0.3);
      o.connect(g); g.connect(master); o.start(start); o.stop(start+0.35);
      welcomeNodes.push(o);
    };
    const noise=(start,dur,vol,hp)=>{
      const len=Math.floor(ctx.sampleRate*dur), buf=ctx.createBuffer(1,len,ctx.sampleRate), d=buf.getChannelData(0);
      for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
      const s=ctx.createBufferSource(); s.buffer=buf;
      const f=ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value=hp||1500;
      const g=ctx.createGain(); g.gain.value=vol||0.25;
      s.connect(f); f.connect(g); g.connect(master); s.start(start);
      welcomeNodes.push(s);
    };
    // 🎺 نشيد الصقر الملحمي — D minor fanfare
    const D4=293.66,F4=349.23,G4=392.00,A4=440.00,C5=523.25,D5=587.33,E5=659.25,F5=698.46,G5=783.99,A5=880.00,D6=1174.66;
    const seq=[
      [D4,0.0,0.28],[D4,0.3,0.28],[F4,0.6,0.28],[G4,0.9,0.55],
      [A4,1.5,0.3],[G4,1.8,0.3],[A4,2.1,0.3],[C5,2.4,0.6],
      [D5,3.1,0.35],[E5,3.45,0.35],[F5,3.8,0.35],[G5,4.15,0.7],
      [A5,4.9,0.35],[G5,5.25,0.35],[F5,5.6,0.35],[E5,5.95,0.35],[D5,6.3,1.1]
    ];
    seq.forEach(([f,dt,du])=>{
      tone(f,t0+dt,du,'sawtooth',0.32);
      tone(f/2,t0+dt,du,'triangle',0.4);
      tone(f*2,t0+dt,du*0.9,'square',0.06);
    });
    // نهاية مجيدة — D octave blast
    tone(D5,t0+7.5,1.4,'sawtooth',0.35); tone(D6,t0+7.5,1.4,'sawtooth',0.22); tone(D4,t0+7.5,1.4,'triangle',0.45);
    // 🥁 إيقاع حربي
    [0,0.3,0.6,0.9,1.5,1.8,2.1,2.4,3.1,3.45,3.8,4.15,4.9,5.25,5.6,5.95,6.3,7.5].forEach(kick);
    [0.9,2.4,4.15,6.3,7.5].forEach(t=>noise(t0+t,0.4,0.3,1200));
    // وتر خلفية عميق
    tone(73.42,t0,7.5,'sawtooth',0.12); tone(110,t0,7.5,'triangle',0.2);
  }catch(e){}
}
function welcomeConfetti(){
  const card=document.querySelector('.welcome-card'); if(!card) return;
  const icons=['🦅','🔥','⭐','🎉','👑','⚔️'];
  for(let i=0;i<50;i++){
    const s=document.createElement('span');
    s.className='w-confetti'; s.textContent=icons[Math.floor(Math.random()*icons.length)];
    s.style.left=Math.random()*100+'%';
    s.style.fontSize=(14+Math.random()*22)+'px';
    s.style.animationDuration=(2.2+Math.random()*2.5)+'s';
    s.style.animationDelay=(Math.random()*0.8)+'s';
    document.getElementById('welcomeOverlay').appendChild(s);
    setTimeout(()=>s.remove(),5500);
  }
}

/* ---------- FX ---------- */
function fx(){
 /* ===== Cinematic loader: مراحل + نصائح + حد أدنى للعرض + تخطي بالضغط ===== */
 (function loader(){
  const box=$('#loader');if(!box)return;
  const pct=$('#pct'),fill=$('#loadfill'),step=$('#loadStep'),tip=$('#loadTip');
  const steps=[[0,'تشفير الاتصال...'],[22,'فتح بوابة الجنوب...'],[45,'تحميل الترسانة...'],[68,'جمع الجنود...'],[88,'الصقر بيفرد جناحه...']];
  const tips=['الولاء أو الموت — الصقر مابيرحمش.','ممنوع الوشاية — اللي يتكلم بيختفي.','النشر من لوحة الإدارة فقط.','اجمع XP بالمكافأة اليومية واطلب ترقية.','الإعلان المثبت 📌 بيظهر في أول السوق.','90% بيترفضوا — خليك من الـ 10%.'];
  let p=0,ti=0,done=false;
  const t0=Date.now();
  const tipTimer=setInterval(()=>{if(!tip)return;ti=(ti+1)%tips.length;tip.style.opacity=0;setTimeout(()=>{tip.textContent=tips[ti];tip.style.opacity=1},350)},2200);
  function finish(){if(done)return;done=true;clearInterval(tipTimer);clearInterval(iv);
   if(pct)pct.textContent='100%';if(fill)fill.style.width='100%';if(step)step.textContent='الصقر وصل 🦅';
   setTimeout(()=>box.classList.add('hide'),450);setTimeout(()=>box.remove(),1400);}
  box.addEventListener('click',finish);
  const iv=setInterval(()=>{
   p+=Math.floor(Math.random()*13)+5;
   const elapsed=Date.now()-t0;
   if(p>=100&&elapsed<2400){p=96} // حد أدنى ~2.4 ثانية عشان اللقطة تبان
   if(p>=100){p=100;finish();return}
   if(pct)pct.textContent=p+'%';if(fill)fill.style.width=p+'%';
   if(step){for(let i=steps.length-1;i>=0;i--){if(p>=steps[i][0]){step.textContent=steps[i][1];break}}}
  },160);
 })();
 const cv=$('#embers');if(cv){const ctx=cv.getContext('2d');let W,H;const rs=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight};rs();addEventListener('resize',rs);
 const ps=Array.from({length:80},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,s:Math.random()*2.5+.5,v:Math.random()*.9+.2,o:Math.random()*.8+.2,red:Math.random()>.55}));
 (function loop(){ctx.clearRect(0,0,W,H);ps.forEach(a=>{a.y-=a.v;a.x+=Math.sin(a.y/60)*.4;if(a.y<0){a.y=H;a.x=Math.random()*W}ctx.beginPath();ctx.arc(a.x,a.y,a.s,0,7);ctx.fillStyle=a.red?`rgba(232,0,0,${a.o*.7})`:`rgba(201,168,106,${a.o*.55})`;ctx.fill()});requestAnimationFrame(loop)})();}
 /* online counter removed */
 const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');ro.unobserve(e.target)}}),{threshold:.1});
 $$('.reveal').forEach(x=>ro.observe(x));
}

function renderHUD(){
 const h=$('#hud');if(!h)return;
 const u=me();
 if(!u){h.classList.remove('show');return}
 if(moneyCfg().hud===false){h.classList.remove('show');return}
 h.classList.add('show');
 const c=$('#hudCash'),d=$('#hudDirty');
 if(c)c.textContent=(+u.cash||0).toLocaleString('en');
 if(d)d.textContent=(+u.dirty||0).toLocaleString('en');
}
function renderShop(){
 const box=$('#shopList');if(!box)return;
 const prods=DB.get('fb_products',[]);
 const sc=$('#shopCount');if(sc)sc.textContent=prods.length;
 box.innerHTML=prods.map(p=>`<div class="card">${p.img?`<div class="ad-img" style="background-image:url('${p.img}');height:200px"></div>`:`<div style="font-size:48px;text-align:center;padding:20px;background:#000;border:1px solid #222228">${esc(p.icon||'🔫')}</div>`}<div style="margin-top:8px"><span class="badge gold">${esc(p.cat||'أسلحة')}</span></div><h3 style="margin-top:8px">${esc(p.title)}</h3><p>${esc(p.desc||'')}</p><div class="price">💸 $${p.price}</div><button class="btn-ghost btn-sm" style="margin-top:10px;width:100%" onclick="buyProduct('${p.id}')">اشتري دلوقتي 🔫</button></div>`).join('')||'<div class="empty">المتجر فاضي — الإدارة هتنزل بضاعة قريب 🔫</div>';
 const my=$('#myOrders');if(my){const s=session();const mine=DB.get('fb_orders',[]).filter(o=>s&&o.user===s.name).reverse().slice(0,6);my.innerHTML=mine.map(o=>`<div class="stat-row"><span>${esc(o.icon||'🔫')} <b>${esc(o.product)}</b> — <b style="color:var(--bronze)">$${o.price}</b></span><span class="badge ${o.status==='done'?'green':'gold'}">${o.status==='done'?'اتسلم ✅':'مستني التسليم ⏳'}</span></div>`).join('')||'<div class="empty">مفيش مشتريات لسه</div>'}
}
function buyProduct(id){
 if(!requireLogin())return;
 const p=DB.get('fb_products',[]).find(x=>x.id===id);if(!p)return;
 const users=DB.get('fb_users',[]);const s=session();const u=users.find(x=>x.name===s.name);if(!u)return;
 if((+u.dirty||0)<+p.price){toast('فلوسك الغير شرعية مش مكفية — محتاج $'+p.price,'err');return}
 if(!confirm('تشتري '+p.title+' بـ $'+p.price+' فلوس غير شرعية؟'))return;
 u.dirty=(+u.dirty||0)-(+p.price);DB.set('fb_users',users);
 const ord=DB.get('fb_orders',[]);ord.push({id:uid(),user:u.name,product:p.title,price:p.price,icon:p.icon||'🔫',status:'pending',date:new Date().toISOString()});DB.set('fb_orders',ord);
 toast('اتسجل طلبك — استلم سلاحك من HQ 🔫','ok');renderAll();
}
/* ---------- BOOT ---------- */
function renderAll(){renderAuthArea();renderProfile();renderNews();renderOrgs();renderAds();renderRanks();renderMembers();renderShop();renderHUD();updateAdminLink()}
document.addEventListener('DOMContentLoaded',()=>{
 seed();fx();renderAll();
 bindAvatar('r_avatar','r_preview');
 const lf=$('#loginForm');if(lf)lf.addEventListener('submit',handleLogin);
 const rf=$('#regForm');if(rf)rf.addEventListener('submit',handleRegister);
 const pf=$('#promoForm');if(pf)pf.addEventListener('submit',requestPromo);
 $$('#navLinks a').forEach(a=>a.addEventListener('click',()=>{const n=$('#navLinks');if(n)n.classList.remove('mobile')}));
 const am=$('#authModal');if(am)am.addEventListener('click',e=>{if(e.target.id==='authModal')closeModal()});
  const wo=$('#welcomeOverlay');if(wo)wo.addEventListener('click',e=>{if(e.target.id==='welcomeOverlay')closeWelcome()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeWelcome()});
});
