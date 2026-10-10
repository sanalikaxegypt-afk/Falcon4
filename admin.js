/* FALCON - Admin Control Panel (admin only publishing) */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const DB={get(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch{return f}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){try{toast('التخزين اتملى — صغّر الصورة وحاول تاني','err')}catch(_){}throw e}}};
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
/* مستويات الصلاحيات: قائد(7) نشر وترقيات — حارس(8) +أعضاء — جناح(9) +منظمات وإعدادات — صقر(10) كل شيء */
function isAdmin(){const m=me();return m&&m.rank>=7}
function canPublish(){const m=me();return m&&m.rank>=7}
function canMembers(){const m=me();return m&&m.rank>=8}
function canOrgs(){const m=me();return m&&m.rank>=9}
function canCfg(){const m=me();return m&&m.rank>=9}
function isFounder(){const m=me();return m&&m.rank>=10}
function migrateRanks(){
 if(DB.get('fb_rankver',0)>=2)return;
 const map={1:1,2:3,3:7,4:9,5:10};
 const users=DB.get('fb_users',[]);
 users.forEach(u=>{if(map[u.rank]!=null)u.rank=map[u.rank]});
 DB.set('fb_users',users);
 const s=DB.get('fb_session',null);
 if(s){const u=users.find(x=>x.name===s.name);if(u){s.rank=u.rank;s.xp=u.xp;DB.set('fb_session',s)}}
 DB.set('fb_rankver',2);
}
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function sha(s){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return 'h'+Math.abs(h)}}
function toast(m,t=''){const d=document.createElement('div');d.className='toast '+t;d.textContent=m;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),3000)}
function session(){return DB.get('fb_session',null)}
function me(){const s=session();if(!s)return null;return DB.get('fb_users',[]).find(u=>u.name===s.name)||null}
function defaultRules(){const t=new Date().toISOString();return [
 {id:'r1',title:'تسليم الأموال غير الشرعية',cat:'مالية',body:'يجب تسليم جميع الأرباح والأموال غير الشرعية الناتجة عن أي سرقة داخل مقاطعة ريدج إلى العصابة، مع الالتزام الكامل بنظام العصابة وتعليمات القيادة في إدارة هذه الأموال.',date:t},
 {id:'r2',title:'الخروج من القصر',cat:'عام',body:'يُمنع خروج أي عضو من القصر بمفرده — يجب أن يكون برفقته زميل واحد على الأقل (أو اثنان أو ثلاثة) لتوفير الحماية اللازمة من العصابات الأخرى.',date:t},
 {id:'r3',title:'التدريبات اليومية',cat:'تدريب',body:'على كل عضو (جديد أو قديم) الالتزام بالتدريب اليومي من نصف ساعة لساعة على سيرفرات تدريب خارجية، لتحسين سرعة الاستجابة ودقة التصويب (Aim).',date:t},
 {id:'r4',title:'الاستحواذات والتأهيل',cat:'قتال',body:'هدفنا المركز الأول. يُمنع الأعضاء الجدد أو ضعاف التصويب من المشاركة في الاستحواذات — المشاركة فقط لمن أتم التدريبات (مسدس، شوتجان، AK) وأثبت كفاءته حسب مستواه داخل ريدج.',date:t},
 {id:'r5',title:'توفير الأموال غير الشرعية للأعضاء',cat:'مالية',body:'يلتزم رئيس العصابة بتوفير مبلغ يومي بين 200,000 و300,000 من الأموال غير الشرعية لكل عضو: لشراء الأسلحة لمن لا يستطيع، ودعم الأعضاء الجدد، وضمان جاهزية العصابة للمنافسة.',date:t},
 {id:'r6',title:'الالتزام بتوفير أدوات التدريب',cat:'تدريب',body:'على جميع الأعضاء توفير أدوات التدريب المطلوبة في أقصر وقت ممكن، والالتزام بالتجهيزات واللوازم اللازمة لضمان استمرار التدريب وتحسين مستوى الأداء.',date:t},
 {id:'r7',title:'الاستعداد للبطولات',cat:'بطولات',body:'البطولات الدورية بين العصابات تحتاج: بدء الاستعداد قبلها بيومين على الأقل، تكثيف التدريبات ورفع الجاهزية، الالتزام بتعليمات القادة والتدرب الجماعي، وبذل أقصى جهد للفوز بالمركز الأول.',date:t},
 {id:'r8',title:'الاستقالة من العصابة',cat:'عام',body:'من يقدم استقالته تُفرض عليه غرامة 200,000 من الأموال الشرعية، وتُسحب الأسلحة التي وفّرها له رئيس العصابة — حتى لو تلفت — وفق نظام العصابة المعتمد.',date:t}
]}

function defaultProducts(){const t=new Date().toISOString();return [
 {id:'p1',title:'مسدس Pistol',price:5000,cat:'أسلحة',icon:'🔫',desc:'تسليح خفيف أساسي لكل مقاتل.',img:'',date:t},
 {id:'p2',title:'شوتجان Shotgun',price:12000,cat:'أسلحة',icon:'🔫',desc:'قوة تدميرية قريبة المدى.',img:'',date:t},
 {id:'p3',title:'رشاش AK',price:25000,cat:'أسلحة',icon:'🎯',desc:'الرشاش المعتمد للعصابة.',img:'',date:t},
 {id:'p4',title:'درع واقي',price:8000,cat:'دروع',icon:'🛡️',desc:'درع صدري للاشتباكات.',img:'',date:t}
]}
function seed(){migrateRanks();if(!localStorage.getItem('fb_users'))DB.set('fb_users',[]);if(!localStorage.getItem('fb_donations'))DB.set('fb_donations',[]);if(!localStorage.getItem('fb_orgs'))DB.set('fb_orgs',[]);if(!localStorage.getItem('fb_ads'))DB.set('fb_ads',[]);if(!localStorage.getItem('fb_promos'))DB.set('fb_promos',[]);if(!localStorage.getItem('fb_products'))DB.set('fb_products',defaultProducts());if(!localStorage.getItem('fb_orders'))DB.set('fb_orders',[]);if(!localStorage.getItem('fb_news'))DB.set('fb_news',[]);if(!DB.get('fb_rulesv2',0)){const cur=DB.get('fb_rules',[]);if(!cur.length||cur.every(x=>['r1','r2','r3','r4','r5'].includes(x.id)))DB.set('fb_rules',defaultRules());DB.set('fb_rulesv2',1)}if(!localStorage.getItem('fb_config'))DB.set('fb_config',{webhook:'',invite:'https://discord.gg/YbHbuY2QBx',serverIP:'connect YOUR-SERVER-IP'})}
const NEWS_WH='https://discord.com/api/webhooks/1557726226922340412/E2xEDeyPAuCgs2QYNfUoS_3b3eb9nbTtoKIp_hTDbPzCDhru9U1Ozgln5mrdG-6hhTnt';
const SUPPORT_WH='https://discord.com/api/webhooks/1557726874803765338/XzgBjl1fTeOGqU_3CbJb5wmAEiu8zzIgHznG4wjr7Gfn8h_hO7V2WYaZwpKWygfx-nQ6';
function cfg(){const c=Object.assign({webhook:NEWS_WH,supportWebhook:SUPPORT_WH,authWebhook:'',invite:'https://discord.gg/YbHbuY2QBx',serverIP:'connect YOUR-SERVER-IP',goal:5000,bank:'FLCN-001',ping:true,donCooldownH:5,promoOpen:true,discordStyle:'embed',discordColor:'#e80000'},DB.get('fb_config',{}));if(String(c.invite||'').includes('YOUR-INVITE'))c.invite='https://discord.gg/YbHbuY2QBx';return c}
function moneyCfg(){const d={hud:true,startCash:0,startDirty:0};const s=(cfg().money||{});return Object.assign({},d,s)}
function xpCfg(){const d={reg:10,regVip:500,regFounder:1000,login:5,join:20,promo:50,support:20,cd:20,daily:{1:10,2:10,3:10,4:15,5:15,6:20,7:25,8:25,9:30,10:50}};const s=(cfg().xp||{});return Object.assign({},d,s,{daily:Object.assign({},d.daily,s.daily||{})})}
let _dcFile=null,_dcTitle='',_dcDesc='';
function sendWebhook(msg,opt={}){
 const c=cfg();const w=c.webhook||NEWS_WH;if(!w)return;
 const tag=c.ping===false?'':'@everyone\n';
 const color=parseInt(String(c.discordColor||'#e80000').replace('#',''),16)||15138834;
 const T=opt.title||_dcTitle, D=opt.desc||_dcDesc, F=opt.file||_dcFile;
 _dcFile=null;_dcTitle='';_dcDesc='';
 if((c.discordStyle||'embed')==='embed'&&(T||D||F)){
  const fname=F?(F.name||'postimg.png'):'postimg.png';
  const embed={title:String(T||'اعلان جديد').slice(0,256),description:String(D||msg).slice(0,4000),color:color,footer:{text:'FALCON BROTHERHOOD'},timestamp:new Date().toISOString()};
  if(F)embed.image={url:'attachment://'+fname};
  const payload={content:tag,embeds:[embed],allowed_mentions:{parse:['everyone']}};
  if(F){const fd=new FormData();fd.append('payload_json',JSON.stringify(payload));fd.append('file',F,fname);fetch(w,{method:'POST',body:fd}).catch(()=>{})}
  else fetch(w,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(()=>{});
  return;
 }
 fetch(w,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:tag+msg,allowed_mentions:{parse:['everyone']}})}).catch(()=>{});
}
function sendSupport(msg){const w=cfg().supportWebhook||SUPPORT_WH;if(!w)return;const tag=cfg().ping===false?'':'@everyone\n';fetch(w,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:tag+msg,allowed_mentions:{parse:['everyone']}})}).catch(()=>{})}

function tab(id,btn){$$('.tab').forEach(t=>t.classList.remove('on'));document.getElementById(id).classList.add('on');$$('.sidebar button[data-t]').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on')}

async function loginA(e){e.preventDefault();
 const n=$('#al_user').value.trim(),p=$('#al_pass').value;
 const u=DB.get('fb_users',[]).find(x=>x.name.toLowerCase()===n.toLowerCase());
 if(!u){toast('مفيش حساب بالاسم ده — سجل الأول من الموقع','err');return}
 if(u.pass!==await sha('fb$'+p)){toast('الباسورد غلط','err');return}
 if(u.rank<7){toast('⛔ حسابك مش إدارة — محتاج رتبة قائد 🎖️ أو أعلى','err');return}
 DB.set('fb_session',{name:u.name,rank:u.rank,xp:u.xp});
 toast('أهلاً بيك يا قائد '+u.name,'ok');renderA();
}
function logoutA(){localStorage.removeItem('fb_session');renderA()}

/* نشر إعلان — إدارة فقط */
function publishA(e){e.preventDefault();
 if(!canPublish()){toast('⛔ النشر لرتبة قائد 🎖️ أو أعلى','err');return}
 const t=$('#p_title').value.trim(),c=$('#p_cat').value,pr=$('#p_price').value.trim(),d=$('#p_desc').value.trim(),pin=$('#p_pin').checked;
 if(t.length<4||d.length<4){toast('اكتب عنوان وتفاصيل واضحة','err');return}
 const m=me();const file=$('#p_img').files[0];_dcFile=file||null;
 const save=(img='')=>{const ads=DB.get('fb_ads',[]);
  const ad={id:uid(),author:m.name,title:t,cat:c,price:pr,desc:d,img,pin:!!pin,date:new Date().toISOString()};_dcTitle=t;_dcDesc=c+(pr?' | '+pr:'')+' | '+d+' | BY '+m.name;
  if(pin)ads.forEach(a=>a.pin=false);
  ads.push(ad);DB.set('fb_ads',ads);e.target.reset();
  toast('اتنشر الإعلان 🚀','ok');sendWebhook(`📢 إعلان جديد من الإدارة:\n📌 **${t}**\n🏷️ القسم: ${c}${pr?`\n💰 السعر: ${pr}`:''}\n📝 ${d}\n👤 بواسطة: ${m.name}`);renderA();tab('t_ads',document.querySelector('[data-t=t_ads]'))};
 if(file){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const cv=document.createElement('canvas');const w=800,h=Math.round(800*im.height/im.width);cv.width=w;cv.height=h;cv.getContext('2d').drawImage(im,0,0,w,h);save(cv.toDataURL('image/jpeg',.75))};im.src=r.result};r.readAsDataURL(file)}
 else save();
}
function delAdA(id){if(!canPublish())return;DB.set('fb_ads',DB.get('fb_ads',[]).filter(a=>a.id!==id));toast('اتمسح','ok');renderA()}
function pinAdA(id){if(!canPublish())return;const ads=DB.get('fb_ads',[]);ads.forEach(a=>a.pin=(a.id===id?!a.pin:false));DB.set('fb_ads',ads);renderA()}

/* أخبار */
function publishNews(e){e.preventDefault();
 if(!canPublish()){toast('⛔ النشر لرتبة قائد 🎖️ أو أعلى','err');return}
 const t=$('#n_title').value.trim(),b=$('#n_body').value.trim();
 if(!t||!b){toast('اكتب العنوان والنص','err');return}
 const nfile=($('#n_img')&&$('#n_img').files[0])||null;_dcTitle=t;_dcDesc=b;_dcFile=nfile;
 const saveNewsImg=(img)=>{const nn=DB.get('fb_news',[]);nn.push({id:uid(),author:me().name,title:t,body:b,img:img||'',date:new Date().toISOString()});DB.set('fb_news',nn);const pv2=$('#n_preview');if(pv2){pv2.style.display='none';pv2.src=''}e.target.reset();toast('اتنشر البيان 📣','ok');sendWebhook('بيان رسمي جديد (مع صورة): '+t+' - بواسطة '+me().name);renderA()};
 if(nfile){if(nfile.size>100*1024*1024){toast('الصورة كبيرة - اختار صورة اقل من 100MB','err');return}const rr=new FileReader();rr.onload=()=>{const im=new Image();im.onload=()=>{const cv=document.createElement('canvas');const w=800,h=Math.max(1,Math.round(800*im.height/im.width));cv.width=w;cv.height=h;cv.getContext('2d').drawImage(im,0,0,w,h);saveNewsImg(cv.toDataURL('image/jpeg',.78))};im.src=rr.result};rr.readAsDataURL(nfile);return}
 if(!t||!b){toast('اكتب العنوان والنص','err');return}
 const n=DB.get('fb_news',[]);n.push({id:uid(),author:me().name,title:t,body:b,date:new Date().toISOString()});DB.set('fb_news',n);
 e.target.reset();toast('اتنشر البيان 📣','ok');sendWebhook(`📰 بيان رسمي جديد:\n📌 **${t}**\n${b}\n👤 بواسطة: ${me().name} (${RANKS[me().rank]?.name||''})`);renderA();
}
/* 💰 الدعم المادي */
/* القوانين — نشر وحذف من الإدارة */
function publishRule(e){e.preventDefault();
 if(!canPublish()){toast('النشر لرتبة قائد او اعلى','err');return}
 const t=$('#r_title').value.trim(),c=$('#r_cat').value,b=$('#r_body').value.trim();
 if(!t||!b){toast('اكتب عنوان القانون ونصه','err');return}
 const all=DB.get('fb_rules',[]);all.push({id:uid(),title:t,cat:c,body:b,date:new Date().toISOString()});DB.set('fb_rules',all);
 e.target.reset();toast('اتنشر القانون','ok');sendWebhook('قانون جديد: '+t+' - بواسطة '+me().name);renderA();
}
function delRule(id){if(!canPublish())return;DB.set('fb_rules',DB.get('fb_rules',[]).filter(x=>x.id!==id));toast('اتمسح القانون','ok');renderA()}
function publishProduct(e){e.preventDefault();
 if(!canPublish()){toast('النشر لرتبة قائد او اعلى','err');return}
 const t=$('#sp_title').value.trim(),pr=Math.floor(+$('#sp_price').value),c=$('#sp_cat').value,d=$('#sp_desc').value.trim();
 if(!t||!pr||pr<1){toast('اكتب اسم المنتج وسعر صحيح','err');return}
 const file=$('#sp_img').files[0];
 const save=(img)=>{const ps=DB.get('fb_products',[]);ps.push({id:uid(),title:t,price:pr,cat:c,desc:d,img:img||'',date:new Date().toISOString()});DB.set('fb_products',ps);e.target.reset();toast('اتنشر المنتج','ok');renderA()};
 if(file){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const cv=document.createElement('canvas');const w=800,h=Math.max(1,Math.round(800*im.height/im.width));cv.width=w;cv.height=h;cv.getContext('2d').drawImage(im,0,0,w,h);save(cv.toDataURL('image/jpeg',.78))};im.src=r.result};r.readAsDataURL(file);return}
 toast('ارفع صورة المنتج الاول — الصورة اجبارية','err');
}
function delProduct(id){if(!canPublish())return;DB.set('fb_products',DB.get('fb_products',[]).filter(x=>x.id!==id));toast('اتمسح المنتج','ok');renderA()}
function doneOrder(id){if(!canPublish())return;const oo=DB.get('fb_orders',[]);const x=oo.find(y=>y.id===id);if(x){x.status='done';DB.set('fb_orders',oo)}renderA()}
function delOrder(id){if(!canPublish())return;DB.set('fb_orders',DB.get('fb_orders',[]).filter(x=>x.id!==id));renderA()}
function decideDon(id,ok){
 if(!canPublish())return;
 const all=DB.get('fb_donations',[]);const d=all.find(x=>x.id===id);if(!d)return;
 d.status=ok?'ok':'no';DB.set('fb_donations',all);
 if(ok){
  const us=DB.get('fb_users',[]);const u=us.find(x=>x.name.toLowerCase()===d.name.toLowerCase());
  if(u){u.xp=(u.xp||0)+xpCfg().support;DB.set('fb_users',us)}
  sendSupport(`✅ تم تأكيد دعم لخزينة العصابة: **${d.name}** — **$${d.amount}** 👑 شكراً يا وحش!`);
 }
 toast(ok?'اتأكد الدعم ونزل في الحائط 👑':'اترفض الدعم',ok?'ok':'err');renderA();
}
function delDon(id){if(!canPublish())return;DB.set('fb_donations',DB.get('fb_donations',[]).filter(x=>x.id!==id));toast('اتمسح','ok');renderA()}
function delNews(id){if(!canPublish())return;DB.set('fb_news',DB.get('fb_news',[]).filter(n=>n.id!==id));renderA()}

/* ترقيات */
function decideA(id,ok){if(!canPublish())return;
 const pr=DB.get('fb_promos',[]);const p=pr.find(x=>x.id===id);if(!p)return;
 p.status=ok?'ok':'no';DB.set('fb_promos',pr);
 if(ok){const us=DB.get('fb_users',[]);const u=us.find(x=>x.name===p.user);if(u){u.rank=p.toRank;u.xp=(u.xp||0)+xpCfg().promo;DB.set('fb_users',us)}}
 toast(ok?'اتقبلت الترقية 🎖️':'اترفضت','ok');renderA();
}
/* تعيين الرتب — من حارس العش (8) وطالع، ومحدش يعدل على اللي زيه أو أعلى منه */
function addMoney(n,type){
 if(!canMembers()){toast('الاموال لرتبة حارس العش او اعلى','err');return}
 const us=DB.get('fb_users',[]);const u=us.find(x=>x.name===n);if(!u)return;
 const v=prompt('المبلغ (موجب للاضافة / سالب للخصم) — '+(type==='cash'?'فلوس شرعية 💵':'فلوس غير شرعية 💸')+' لـ '+n+':','1000');
 if(v===null)return;
 const a=Math.floor(+v);if(isNaN(a)||!a){toast('اكتب مبلغ صحيح','err');return}
 u[type]=(+u[type]||0)+a;if(u[type]<0)u[type]=0;DB.set('fb_users',us);
 const s=DB.get('fb_session',null);if(s&&s.name===u.name){renderA();toast('رصيد '+n+' بقى '+(type==='cash'?'💵 ':'💸 ')+u[type],'ok');return}
 toast('رصيد '+n+' بقى '+(type==='cash'?'💵 ':'💸 ')+u[type],'ok');renderA();
}
function stripRank(n){
 const m=me();
 if(!m||m.rank<8){toast('سحب الرتب لرتبة حارس العش او اعلى','err');renderA();return}
 const us=DB.get('fb_users',[]);const u=us.find(x=>x.name===n);if(!u)return;
 if(us[0].name===n){toast('ماينفعش تسحب رتبة المؤسس','err');return}
 if(m.rank<10&&u.rank>=m.rank){toast('ماتقدرش تسحب رتبة اللي زيك او اعلى منك','err');renderA();return}
 if(u.rank<=1){toast('هو اصلا عضو عادي','err');return}
 if(!confirm('تسحب رتب '+n+' وترجعه عضو عادي؟ (الرتبة والـ XP هيتصفروا)'))return;
 u.rank=1;u.xp=0;DB.set('fb_users',us);
 const orgs=DB.get('fb_orgs',[]);const o=orgs.find(o=>o.id===u.org);
 if(o){const mm=o.members.find(x=>x.u===u.name);if(mm)mm.role=RANKS[1].en;DB.set('fb_orgs',orgs)}
 const s=DB.get('fb_session',null);if(s&&s.name===u.name){s.rank=1;DB.set('fb_session',s)}
 toast('اتسحبت رتب '+n+' وبقى عضو عادي','ok');
 sendWebhook('سحب رتبة: '+n+' رجع عضو عادي (بواسطة '+m.name+')');renderA();
}
function setRank(n,v){
 const m=me();
 if(!m||m.rank<8){toast('⛔ تعيين الرتب لرتبة حارس العش 🛡️ أو أعلى','err');renderA();return}
 v=+v;if(isNaN(v))return;
 const us=DB.get('fb_users',[]);const u=us.find(x=>x.name===n);if(!u)return;
 if(m.rank<10&&(v>=m.rank||u.rank>=m.rank)){toast('⛔ ماتقدرش تعيّن رتبة زيك أو أعلى منك','err');renderA();return}
 u.rank=Math.max(1,Math.min(10,v));DB.set('fb_users',us);
 const orgs=DB.get('fb_orgs',[]);const o=orgs.find(o=>o.id===u.org);
 if(o){const mm=o.members.find(x=>x.u===u.name);if(mm)mm.role=RANKS[u.rank].en;DB.set('fb_orgs',orgs)}
 const s=DB.get('fb_session',null);if(s&&s.name===u.name){s.rank=u.rank;DB.set('fb_session',s)}
 toast(`اتعيّنت رتبة ${n} → ${RANKS[u.rank].icon} ${RANKS[u.rank].name}`,'ok');
 sendWebhook(`🎖️ تعيين جديد: **${n}** بقى **${RANKS[u.rank].name}** (بواسطة ${m.name})`);renderA();
}
function delUser(n){
 const m=me();
 if(!m||m.rank<8){toast('⛔ الحذف لرتبة حارس العش 🛡️ أو أعلى','err');return}
 const us=DB.get('fb_users',[]);const u=us.find(x=>x.name===n);if(!u)return;
 if(us.length<=1){toast('ماينفعش تحذف آخر عضو','err');return}
 if(us[0].name===n){toast('ماينفعش تحذف المؤسس 🦅','err');return}
 if(m.rank<10&&u.rank>=m.rank){toast('⛔ ماتقدرش تحذف اللي زيك أو أعلى منك','err');return}
 if(!confirm('تحذف '+n+'؟'))return;DB.set('fb_users',us.filter(x=>x.name!==n));renderA();
}
/* منظمات — عرض وحذف فقط (مفيش تأسيس) */
function delOrgA(id){if(!canOrgs())return;if(id==='main'){toast('منظمة الصقر الأم ماتتمسحش 🦅','err');return}if(!confirm('تمسح المنظمة؟'))return;DB.set('fb_orgs',DB.get('fb_orgs',[]).filter(o=>o.id!==id));renderA()}
/* إعدادات */
function saveMoneyA(e){e.preventDefault();if(!canMembers()){toast('الاموال لرتبة حارس العش او اعلى','err');return}
 const v=id=>Math.max(0,+($('#'+id)?$('#'+id).value:0)||0);
 DB.set('fb_config',Object.assign({},cfg(),{money:{hud:$('#m_hud')?$('#m_hud').checked:true,startCash:v('m_startCash'),startDirty:v('m_startDirty')}}));
 toast('اتحفظت اعدادات الاموال','ok');renderA();
}
function addMoneyQuick(e){e.preventDefault();if(!canMembers())return;
 const n=$('#mq_user')?$('#mq_user').value:'';const t=$('#mq_type')?$('#mq_type').value:'cash';
 const a=Math.floor(+($('#mq_amount')?$('#mq_amount').value:0));
 if(!n||isNaN(a)||!a){toast('اختار العضو واكتب مبلغ صحيح','err');return}
 const us=DB.get('fb_users',[]);const u=us.find(x=>x.name===n);if(!u)return;
 u[t]=(+u[t]||0)+a;if(u[t]<0)u[t]=0;DB.set('fb_users',us);
 toast('رصيد '+n+' بقى '+(t==='cash'?'💵 ':'💸 ')+u[t],'ok');renderA();
}
function resetAllMoney(){if(!canMembers())return;if(!confirm('تصفر فلوس كل الاعضاء (شرعي + غير شرعي)؟'))return;const us=DB.get('fb_users',[]);us.forEach(u=>{u.cash=0;u.dirty=0});DB.set('fb_users',us);toast('اتصفرت كل الاموال','ok');renderA()}
function saveXpA(e){e.preventDefault();if(!canCfg()){toast('الاعدادات لرتبة الجناح الايمن او اعلى','err');return}
 const v=id=>Math.max(0,+($('#'+id)?$('#'+id).value:0)||0);
 const daily={};for(let i=1;i<=10;i++)daily[i]=v('d_'+i);
 DB.set('fb_config',Object.assign({},cfg(),{xp:{reg:v('x_reg'),regVip:v('x_regVip'),regFounder:v('x_regFounder'),login:v('x_login'),join:v('x_join'),promo:v('x_promo'),support:v('x_support'),cd:Math.max(5,v('x_cd')),daily}}));
 toast('اتحفظ نظام XP','ok');renderA();
}
function saveCfgA(e){e.preventDefault();if(!canCfg()){toast('⛔ الإعدادات لرتبة الجناح الأيمن ⚔️ أو أعلى','err');return};
 DB.set('fb_config',{webhook:$('#c_webhook').value.trim(),supportWebhook:$('#c_support').value.trim(),authWebhook:($('#c_auth')?$('#c_auth').value.trim():''),invite:$('#c_invite').value.trim()||'https://discord.gg/YbHbuY2QBx',serverIP:$('#c_ip').value.trim()||'connect YOUR-SERVER-IP',goal:+$('#c_goal').value||5000,bank:$('#c_bank').value.trim()||'FLCN-001',ping:$('#c_ping')?$('#c_ping').checked:true,donCooldownH:+($('#c_cd')?$('#c_cd').value:5)||5,promoOpen:$('#c_promo')?$('#c_promo').checked:true,discordStyle:($('#c_style')?$('#c_style').value:'embed'),discordColor:($('#c_color')?$('#c_color').value:'#e80000')});
 toast('اتحفظت ✓','ok');renderA();
}
/* 🧪 تجربة الويب هوك — للتأكد إن @everyone شغال */
function testWH(which){
 if(!canCfg()){toast('⛔ الإعدادات لرتبة الجناح الأيمن ⚔️ أو أعلى','err');return}
 const c=cfg();const url=which==='support'?c.supportWebhook:c.webhook;
 if(!url){toast('مفيش رابط ويب هوك محفوظ','err');return}
 const tag=c.ping===false?'':'@everyone\n';
 fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:tag+'🧪 رسالة تجربة من لوحة تحكم الصقر — لو المنشن ظهر ووصلك إشعار يبقى الـ @everyone شغال ✓',allowed_mentions:{parse:['everyone']}})})
 .then(r=>{if(r.ok)toast('اتبعتت التجربة — بص على شانل الديسكورد دلوقتي','ok');else toast('الديسكورد رفض الرسالة ('+r.status+') — الرابط غلط أو الويب هوك اتمسح','err')})
 .catch(()=>toast('فشل الاتصال — اتأكد من النت والرابط','err'));
}
function backupData(){
 if(!canCfg()){toast('النسخ لرتبة الجناح الايمن او اعلى','err');return}
 const data={};Object.keys(localStorage).filter(k=>k.indexOf('fb_')===0).forEach(k=>{try{data[k]=JSON.parse(localStorage.getItem(k))}catch(e){data[k]=localStorage.getItem(k)}});
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));a.download='falcon-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();
 toast('اتحملت النسخة','ok');
}
function restoreData(f){
 if(!confirm('الاستعادة هتستبدل كل الداتا الحالية بالنسخة — متأكد؟'))return
 if(!f)return;
 const r=new FileReader();
 r.onload=()=>{try{const data=JSON.parse(r.result);Object.keys(data).forEach(k=>{if(k.indexOf('fb_')===0)localStorage.setItem(k,JSON.stringify(data[k]))});toast('اترجعت النسخة — اعمل ريلود','ok');setTimeout(()=>location.reload(),900)}catch(e){toast('ملف النسخة مش سليم','err')}};
 r.readAsText(f);
}
function resetData(){
 const m=me();
 if(!m||m.rank<10){toast('⛔ التصفير للمؤسس (رتبة الصقر 🦅) فقط','err');return}
 if(!confirm('⚠️ تحذير أخير: هتمسح كل الداتا نهائياً (حسابات + إعلانات + منظمات + أخبار + ترقيات). متأكد؟'))return;
 const word=prompt('للتأكيد النهائي اكتب كلمة: RESET');
 if(word!=='RESET'){toast('اتلغى التصفير ✓','ok');return}
 Object.keys(localStorage).filter(k=>k.indexOf('fb_')===0).forEach(k=>localStorage.removeItem(k));
 toast('اتصفرت الداتا ☢️ — الموقع رجع زي أول يوم','ok');
 setTimeout(()=>location.reload(),800);
}

function renderA(){
 seed();
 let m=me();
 if(!m||m.rank<7){
  const us0=DB.get('fb_users',[]);
  let boss=us0.find(x=>x.name==='القائد العام');
  if(!boss){boss={name:'القائد العام',pass:'',dc:'',ic:'',avatar:'',rank:10,xp:9999,org:'main',date:new Date().toISOString()};us0.push(boss);DB.set('fb_users',us0)}
  DB.set('fb_session',{name:boss.name,rank:boss.rank,xp:boss.xp});
  m=me();
 }
 const admin=true;
 $('#lockScreen').style.display='none';
 const li=$('#lockInfo');
 if(li){if(!admin&&m){li.innerHTML='<div class="box" style="max-width:400px;margin:0 auto 12px;border-color:var(--bronze)">👤 انت مسجل دخول حالياً بحساب <b>'+esc(m.name)+'</b> (رتبة '+esc((RANKS[m.rank]||{}).name||'')+') — الحساب ده مش إدارة.<br><a href="javascript:void(0)" onclick="logoutA()" style="color:#ff9090">خروج وتسجيل بحساب قائد</a></div>';const alu=$('#al_user');if(alu&&!alu.value)alu.value=m.name}else if(!admin){li.innerHTML='<div class="hint" style="max-width:400px;margin:0 auto 12px">💡 الحسابات بتتحفظ على نفس المتصفح والجهاز فقط — لو سجلت من متصفح تاني افتح اللوحة من نفس المتصفح.</div>'}else li.innerHTML='';}
 $('#panel').style.display='block';
 $('#adminAuth').innerHTML=m?`<span class="badge ${admin?'red':'gold'}">${admin?'🛡️ '+esc(m.name):esc(m.name)+' (مش إدارة)'}</span> <a href="javascript:void(0)" onclick="logoutA()" style="color:#ff9090">خروج</a>`:`<a href="index.html">دخول من الموقع</a>`;
 if(!m)return;
 // إظهار تبويبات اللوحة حسب رتبة اللي داخل
 $$('.sidebar button[data-t]').forEach(b=>{b.style.display=(m.rank>=(+b.dataset.min||7))?'':'none'});
 const vis=$$('.sidebar button[data-t]').filter(b=>b.style.display!=='none');
 if(vis.length&&!vis.some(b=>b.classList.contains('on')))tab(vis[0].dataset.t,vis[0]);
 const users=DB.get('fb_users',[]),orgs=DB.get('fb_orgs',[]),ads=DB.get('fb_ads',[]),pr=DB.get('fb_promos',[]),news=DB.get('fb_news',[]);
 $('#s_users').textContent=users.length;$('#s_orgs').textContent=orgs.length;$('#s_ads').textContent=ads.length;
 const pend=pr.filter(p=>p.status==='pending');
 $('#s_pend').textContent=pend.length;$('#c_pend').textContent=pend.length;
 // ads
 $('#adsN').textContent=ads.length;
 const sorted=[...ads].reverse();
 $('#adsListA').innerHTML=sorted.map(a=>`<div class="stat-row"><span>${a.pin?'📌':''}<b>${esc(a.title)}</b> <span class="badge">${esc(a.cat)}</span><br><span class="hint">${esc(a.author)} • ${new Date(a.date).toLocaleDateString('ar-EG')}</span></span><span style="display:flex;gap:6px"><button class="btn-ghost btn-sm" onclick="pinAdA('${a.id}')">📌</button><button class="btn-ghost btn-sm" onclick="delAdA('${a.id}')">🗑️</button></span></div>`).join('')||'<div class="empty">مفيش إعلانات</div>';
 // news
 $('#newsListA').innerHTML=[...news].reverse().map(n=>{const au=DB.get('fb_users',[]).find(x=>x.name===n.author);const rr=RANKS[Math.min(10,au?au.rank:7)]||RANKS[7];return `<div class="stat-row"><span><b>${esc(n.title)}</b> <span class="badge ${au&&au.rank>=7?'red':'gold'}">${rr.icon} ${esc(au?au.name:n.author)} • ${rr.name}</span><br><span class="hint">${esc(n.body).slice(0,80)}</span>${n.img?' <span class="badge gold">📷 مع صورة</span>':''}</span><button class="btn-ghost btn-sm" onclick="delNews('${n.id}')">🗑️</button></div>`}).join('')||'';
 // promos
 const rl=$('#ruleListA');if(rl){const rules=DB.get('fb_rules',[]);const rn=$('#rulesN');if(rn)rn.textContent=rules.length;rl.innerHTML=[...rules].reverse().map(x=>`<div class="stat-row"><span>📜 <b>${esc(x.title)}</b> <span class="badge gold">${esc(x.cat||'عام')}</span><br><span class="hint">${esc(String(x.body||'')).slice(0,90)}</span></span><button class="btn-ghost btn-sm" onclick="delRule('${x.id}')">🗑️</button></div>`).join('')||'<div class="empty">مفيش قوانين — ضيف اول قانون من الفورم فوق</div>'}
 const pl=$('#prodListA');if(pl){const ps=DB.get('fb_products',[]);const pn=$('#prodN');if(pn)pn.textContent=ps.length;pl.innerHTML=[...ps].reverse().map(x=>`<div class="stat-row"><span>${x.img?`<img src="${x.img}" style="width:44px;height:44px;object-fit:cover;border:1px solid var(--bronze);vertical-align:middle">`:`<span>${esc(x.icon||'🔫')}</span>`} <b>${esc(x.title)}</b> <span class="badge gold">${esc(x.cat||'')}</span> — <b style="color:var(--bronze)">$${x.price}</b></span><button class="btn-ghost btn-sm" onclick="delProduct('${x.id}')">🗑️</button></div>`).join('')||'<div class="empty">مفيش منتجات</div>'}
 const ol=$('#ordListA');if(ol){const oo=DB.get('fb_orders',[]);const onn=$('#ordN');if(onn)onn.textContent=oo.length;const ot=$('#ordTotal');if(ot)ot.textContent=oo.reduce((s,o)=>s+(+o.price||0),0);ol.innerHTML=[...oo].reverse().slice(0,30).map(o=>`<div class="stat-row"><span>${esc(o.icon||'🔫')} <b>${esc(o.user)}</b> اشترى <b>${esc(o.product)}</b> — <b style="color:var(--bronze)">$${o.price}</b></span>${o.status==='done'?'<span class="badge green">اتسلم ✅</span>':`<span style="display:flex;gap:6px"><button class="btn-ghost btn-sm" onclick="doneOrder('${o.id}')">✅ تسليم</button><button class="btn-ghost btn-sm" onclick="delOrder('${o.id}')">🗑️</button></span>`}</div>`).join('')||'<div class="empty">مفيش مبيعات لسه</div>'}
 $('#promoListA').innerHTML=[...pr].reverse().map(p=>`<div class="stat-row"><span>👤 <b>${esc(p.user)}</b>: ${RANKS[p.fromRank]?.name} → <b>${RANKS[p.toRank]?.name}</b><br><span class="hint">${esc(p.reason||'')}</span></span>${p.status==='pending'?`<span style="display:flex;gap:6px"><button class="btn-ghost btn-sm" onclick="decideA('${p.id}',true)">✅ قبول</button><button class="btn-ghost btn-sm" onclick="decideA('${p.id}',false)">❌ رفض</button></span>`:`<span class="badge ${p.status==='ok'?'green':'red'}">${p.status==='ok'?'مقبول':'مرفوض'}</span>`}</div>`).join('')||'<div class="empty">مفيش طلبات</div>';
 // الأعضاء — تعيين الرتب بقايمة منسدلة
 $('#memTable').innerHTML=users.map(u=>{
  const canEdit=m.rank===10||(m.rank>=8&&u.rank<m.rank);
  const opts=RANKS.map((r,i)=>`<option value="${i}"${i===u.rank?' selected':''}${(i>=m.rank&&m.rank<10)?' disabled':''}>${r.icon} ${r.name}</option>`).join('');
  return `<tr><td><b>${esc(u.name)}</b><br><span class="hint">${esc(u.ic||'—')} / ${esc(u.dc||'—')}</span></td><td>${canEdit?`<select onchange="setRank('${esc(u.name)}',this.value)" style="padding:6px;min-width:140px">${opts}</select>`:`${RANKS[u.rank]?.icon} ${RANKS[u.rank]?.name}`}</td><td><span class="hint">${esc(RANKS[u.rank]?.spec||'')}</span></td><td>${u.xp||0}</td><td style="white-space:nowrap">💵 <b>${u.cash||0}</b><br>💸 <b>${u.dirty||0}</b></td><td style="white-space:nowrap">${canEdit?`<button class="btn-ghost btn-sm" title="اضافة فلوس شرعية" onclick="addMoney('${esc(u.name)}','cash')">💵+</button> <button class="btn-ghost btn-sm" title="اضافة فلوس غير شرعية" onclick="addMoney('${esc(u.name)}','dirty')">💸+</button> <button class="btn-ghost btn-sm" title="سحب الرتبة وارجاعه عضو عادي" onclick="stripRank('${esc(u.name)}')">⬇️ سحب</button> <button class="btn-ghost btn-sm" onclick="delUser('${esc(u.name)}')">🗑️</button>`:'🔒'}</td></tr>`
 }).join('');
 // جدول الرتب المرجعي
 const rt=$('#ranksTable');
 if(rt)rt.innerHTML=RANKS.slice(1).map(r=>`<tr><td><b>LVL ${r.id}</b></td><td>${r.icon} <b>${r.name}</b><br><span class="hint en">${r.en}</span></td><td>${r.xp} XP / يومي ${r.daily}</td><td>${esc(r.spec)}</td></tr>`).join('');
 // orgs
 $('#orgListA').innerHTML=orgs.map(o=>`<div class="stat-row"><span>🏛️ <b>${esc(o.name)}</b> <span class="badge gold">${esc(o.tag||'')}</span> — ${o.members.length} عضو<br><span class="hint">القائد: ${esc(o.boss||'—')}</span></span><button class="btn-ghost btn-sm" onclick="delOrgA('${o.id}')">🗑️</button></div>`).join('')||'<div class="empty">مفيش منظمات</div>';
 // 💰 الدعم المادي
 const dons=DB.get('fb_donations',[]);
 const dok=dons.filter(d=>d.status==='ok').reduce((s,d)=>s+(+d.amount||0),0);
 const dpend=dons.filter(d=>d.status==='pending');
 const dd=$('#donListA');
 if(dd)dd.innerHTML=`<div class="grid3" style="margin:0 0 12px"><div class="stat-row"><span>💰 المؤكد</span><b style="color:var(--bronze)">$${dok}</b></div><div class="stat-row"><span>⏳ مستني</span><b>${dpend.length}</b></div><div class="stat-row"><span>🎯 الهدف</span><b>$${cfg().goal}</b></div></div>`+
  ([...dons].reverse().map(d=>`<div class="stat-row"><span>💰 <b>${esc(d.name)}</b> — <b style="color:var(--bronze)">$${d.amount}</b>${d.msg?`<br><span class="hint">${esc(d.msg)}</span>`:''}</span>${d.status==='pending'?`<span style="display:flex;gap:6px"><button class="btn-ghost btn-sm" onclick="decideDon('${d.id}',true)">✅ تأكيد</button><button class="btn-ghost btn-sm" onclick="decideDon('${d.id}',false)">❌</button></span>`:`<span style="display:flex;gap:6px;align-items:center"><span class="badge ${d.status==='ok'?'green':'red'}">${d.status==='ok'?'مؤكد':'مرفوض'}</span><button class="btn-ghost btn-sm" onclick="delDon('${d.id}')">🗑️</button></span>`}</div>`).join('')||'<div class="empty">مفيش دعومات لسه</div>');
 // cfg
 const c=cfg();$('#c_webhook').value=c.webhook||'';const X=xpCfg();$('#x_reg').value=X.reg;$('#x_regVip').value=X.regVip;$('#x_regFounder').value=X.regFounder;$('#x_login').value=X.login;$('#x_join').value=X.join;$('#x_promo').value=X.promo;$('#x_support').value=X.support;$('#x_cd').value=X.cd;const M=moneyCfg();const mh=$('#m_hud');if(mh)mh.checked=M.hud!==false;$('#m_startCash').value=M.startCash;$('#m_startDirty').value=M.startDirty;const mq=$('#mq_user');if(mq){const cur=mq.value;mq.innerHTML=DB.get('fb_users',[]).map(u=>'<option value="'+esc(u.name)+'">'+esc(u.name)+'</option>').join('');if(cur)mq.value=cur}for(let i=1;i<=10;i++){const ddx=$('#d_'+i);if(ddx)ddx.value=(X.daily||{})[i]}$('#c_support').value=c.supportWebhook||'';const ca=$('#c_auth');if(ca)ca.value=c.authWebhook||'';$('#c_invite').value=c.invite||'';$('#c_ip').value=c.serverIP||'';const cg=$('#c_goal');if(cg)cg.value=c.goal||5000;const cb=$('#c_bank');if(cb)cb.value=c.bank||'FLCN-001';const cp=$('#c_ping');if(cp)cp.checked=c.ping!==false;const cd=$('#c_cd');if(cd)cd.value=c.donCooldownH||5;const cm=$('#c_promo');if(cm)cm.checked=c.promoOpen!==false;const cs=$('#c_style');if(cs)cs.value=c.discordStyle||'embed';const cc=$('#c_color');if(cc)cc.value=c.discordColor||'#e80000';
}
document.addEventListener('DOMContentLoaded',()=>{
 renderA();
 $('#adminLogin').addEventListener('submit',loginA);
 $('#pubForm').addEventListener('submit',publishA);
 $('#newsForm').addEventListener('submit',publishNews);
 const rf2=$('#ruleForm');if(rf2)rf2.addEventListener('submit',publishRule);
 const ni=$('#n_img');if(ni)ni.addEventListener('change',()=>{const f=ni.files[0],pv=$('#n_preview');if(!pv)return;if(!f){pv.style.display='none';return}const r=new FileReader();r.onload=()=>{pv.src=r.result;pv.style.display='block'};r.readAsDataURL(f)});
 $('#cfgForm').addEventListener('submit',saveCfgA);
 const xf=$('#xpForm');if(xf)xf.addEventListener('submit',saveXpA);
 const mf=$('#moneyForm');if(mf)mf.addEventListener('submit',saveMoneyA);
 const mqf=$('#moneyQuick');if(mqf)mqf.addEventListener('submit',addMoneyQuick);
 const spf=$('#shopForm');if(spf)spf.addEventListener('submit',publishProduct);
 const spi=$('#sp_img');if(spi)spi.addEventListener('change',()=>{const f=spi.files[0],pv=$('#sp_preview');if(!pv)return;if(!f){pv.style.display='none';return}const r=new FileReader();r.onload=()=>{pv.src=r.result;pv.style.display='block'};r.readAsDataURL(f)});
 const rsf=$('#restoreFile');if(rsf)rsf.addEventListener('change',()=>restoreData(rsf.files[0]));
});
