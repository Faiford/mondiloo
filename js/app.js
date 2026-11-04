const APP_VERSION="2.0.1";
/* ---------- state ---------- */
let pvIdx=0, hIdx=0, trIdx=0, gC=-1, gS=0, fromGlobe=false;
let lang=null, age=null, screen="lang", stars=0, wIdx=0, theme="mix", pIdx=0, pMode="learn", story=-1, sPage=0, q=null, locked=false, timers=[], game={};
try{lang=localStorage.getItem("tk-lang")||null; age=localStorage.getItem("tk-age")||null; stars=+localStorage.getItem("tk-stars")||0;}catch(e){}
if(lang&&age) screen="home"; else if(lang) screen="age";
let LV={}; try{LV=JSON.parse(localStorage.getItem("tk-lv")||"{}")||{};}catch(e){LV={};}
const LVGAMES=["mem","snake","balloon","puzzle","sort","paint","maze","dots","shadow","diff","cook","habits","order","pattern","odd","spell","simon","hidden","mole","feed","emo","opp","miss","ttt","size","talk"];
const lvKey=g=>`${age||"b"}-${g}`;
const lvl=g=>(LV[lvKey(g)]||{cur:1}).cur;
const lvMax=g=>(LV[lvKey(g)]||{max:1}).max||1;
function setLv(g,cur){const k=lvKey(g);const o=LV[k]||{cur:1,max:1};o.cur=Math.max(1,Math.min(cur,o.max||1));LV[k]=o;try{localStorage.setItem(K("lv"),JSON.stringify(LV));}catch(e){}}
function unlockNext(g){const k=lvKey(g);const o=LV[k]||{cur:1,max:1};o.max=Math.max(o.max||1,o.cur+1);LV[k]=o;try{localStorage.setItem(K("lv"),JSON.stringify(LV));}catch(e){}}
const save=()=>{try{localStorage.setItem("tk-lang",lang||"");localStorage.setItem(K("age"),age||"");localStorage.setItem(K("stars"),stars);}catch(e){}};
const t=k=>UI[lang||"ht"][k];
const A=()=>AGES[age||"b"];
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,r)=>p[0]-r[0]).map(x=>x[1]);
const word=w=>w[WI[lang]];
const nw=n=>numWord(n,lang);
const addStar=(k=1)=>{const before=Math.floor(stars/10),sb=Math.min(STICKERS.length,Math.floor(stars/5));stars+=k;save();if(Math.min(STICKERS.length,Math.floor(stars/5))>sb){setTimeout(()=>{sfx("star");cheer(t("newSticker")+" "+STICKERS[Math.floor(stars/5)-1]);},700);}if(Math.floor(stars/10)>before){setTimeout(()=>{confetti(140);cheer("🏆");},300);}const s=document.querySelector(".pill span");if(s)s.textContent=stars;};
function stopTimersOnly(){timers.forEach(x=>{clearInterval(x);clearTimeout(x);});timers=[];}
function stopAll(){micStop();document.querySelectorAll("audio").forEach(x=>{try{x.pause();}catch(e){}});timers.forEach(x=>{clearInterval(x);clearTimeout(x);});timers=[];game={};clearTimeout(sayT);try{if(window.speechSynthesis&&(speechSynthesis.speaking||speechSynthesis.pending))speechSynthesis.cancel();}catch(e){}}

let sound=true; try{sound=localStorage.getItem("tk-snd")!=="0";}catch(e){}
function tiki(mood){
  const eyes=mood==="happy"?'<path d="M38 50q8-9 16 0M66 50q8-9 16 0" stroke="#24305E" stroke-width="5" fill="none" stroke-linecap="round"/>'
   :'<circle cx="46" cy="50" r="11" fill="#fff"/><circle cx="74" cy="50" r="11" fill="#fff"/><circle cx="48" cy="52" r="6" fill="#24305E"/><circle cx="76" cy="52" r="6" fill="#24305E"/><circle cx="50" cy="49" r="2" fill="#fff"/><circle cx="78" cy="49" r="2" fill="#fff"/>';
  return `<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="113" rx="28" ry="5" fill="rgba(36,48,94,.12)"/><g class="tk">
   <path d="M52 14q4-12 10 0q6-10 8 4" fill="#1C8A57"/>
   <ellipse cx="18" cy="68" rx="11" ry="20" fill="#1C8A57" transform="rotate(20 18 68)"/><ellipse cx="102" cy="68" rx="11" ry="20" fill="#1C8A57" transform="rotate(-20 102 68)"/>
   <circle cx="60" cy="60" r="44" fill="#2DBE7E"/><path d="M22 74q38 42 76 0q-6 32-38 32t-38-32z" fill="#FF6B5B"/>
   ${eyes}<circle cx="34" cy="64" r="6" fill="#FF9DB0" opacity=".7"/><circle cx="86" cy="64" r="6" fill="#FF9DB0" opacity=".7"/>
   <path d="M53 60h14l-7 10z" fill="#FFC83D"/>${mood==="happy"?'<path d="M54 72q6 6 12 0" stroke="#24305E" stroke-width="3" fill="none" stroke-linecap="round"/>':""}
   <path d="M48 104l-4 8M72 104l4 8" stroke="#F2A007" stroke-width="5" stroke-linecap="round"/></g></svg>`;
}
function pt(e,k){try{const l=e&&e[k];if(l&&l.length&&l[0]&&typeof l[0].clientX==="number")return l[0];}catch(err){}return null;}
let actx=null, audioOK=true;
function getCtx(){
  if(!audioOK) return null;
  if(actx) return actx;
  const t0=performance.now();
  try{const C=window.AudioContext||window.webkitAudioContext; if(!C){audioOK=false;return null;} actx=new C();}catch(e){audioOK=false;return null;}
  if(performance.now()-t0>250){audioOK=false;}
  return actx;
}
function sfx(kind){ setTimeout(()=>sfxNow(kind),0); }
function sfxNow(kind){
  if(!sound) return;
  const _c=getCtx(); if(!_c) return;
  try{if(_c.state==="suspended")_c.resume();const now=_c.currentTime;
    const seq={ok:[[660,0],[880,.09],[1175,.18]],no:[[220,0],[180,.12]],pop:[[520,0]],star:[[988,0],[1319,.08]]}[kind]||[[440,0]];
    seq.forEach(([f,t0])=>{const o=actx.createOscillator(),g=actx.createGain();o.type=kind==="no"?"triangle":"sine";o.frequency.setValueAtTime(f,now+t0);
      if(kind==="pop")o.frequency.exponentialRampToValueAtTime(140,now+t0+.12);
      g.gain.setValueAtTime(.0001,now+t0);g.gain.exponentialRampToValueAtTime(.18,now+t0+.02);g.gain.exponentialRampToValueAtTime(.0001,now+t0+.22);
      o.connect(g).connect(actx.destination);o.start(now+t0);o.stop(now+t0+.25);});
  }catch(e){}
}
function confetti(n=70){
  if(matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let cv=document.getElementById("fx"); if(!cv){cv=document.createElement("canvas");cv.id="fx";document.body.appendChild(cv);}
  const W=cv.width=innerWidth,H=cv.height=innerHeight,c=cv.getContext("2d");
  const cols=["#FF6B5B","#FFC83D","#2DBE7E","#2F80ED","#8E5CF5","#E0457B"];
  const ps=Array.from({length:n},()=>({x:W/2+rnd(-40,40),y:H*.45,vx:(Math.random()-.5)*14,vy:-Math.random()*13-4,s:rnd(6,11),r:Math.random()*6,vr:(Math.random()-.5)*.4,c:cols[rnd(0,5)]}));
  let f=0;(function tick(){c.clearRect(0,0,W,H);ps.forEach(p=>{p.vy+=.45;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;c.save();c.translate(p.x,p.y);c.rotate(p.r);c.fillStyle=p.c;c.fillRect(-p.s/2,-p.s/3,p.s,p.s*.66);c.restore();});
    if(++f<80)requestAnimationFrame(tick);else cv.remove();})();
}
let mpopT=null;
function cheer(text){
  document.querySelectorAll(".mpop").forEach(x=>x.remove()); clearTimeout(mpopT);
  const d=document.createElement("div");d.className="mpop";d.innerHTML=`<span>${text}</span>${tiki("happy")}`;document.body.appendChild(d);
  mpopT=setTimeout(()=>d.remove(),1400);
}
/* Speech never blocks the screen: it runs after the page has painted, only when the device
   reports real voices, and it switches itself off if a call ever stalls (some in-app browsers do). */
let ttsOK=null, sayT=null;
function ttsVoices(){try{const v=window.speechSynthesis&&speechSynthesis.getVoices&&speechSynthesis.getVoices();return (v&&typeof v.length==="number")?Array.from(v):[];}catch(e){return [];}}
try{if(window.speechSynthesis){speechSynthesis.onvoiceschanged=()=>{if(ttsOK===null&&ttsVoices().length)ttsOK=true;};if(ttsVoices().length)ttsOK=true;}}catch(e){}
function speak(text){
  if(!text||lang==="ht"||!sound||ttsOK===false) return;
  const s=window.speechSynthesis; if(!s||typeof SpeechSynthesisUtterance==="undefined") return;
  clearTimeout(sayT);
  sayT=setTimeout(()=>{
    const vs=ttsVoices(); if(!vs.length) return;
    const t0=performance.now();
    try{
      if(s.speaking||s.pending) s.cancel();
      const u=new SpeechSynthesisUtterance(text); const pref=LANGS[lang].voice; let v=null;
      for(const p of pref){v=vs.find(x=>x.lang&&x.lang.toLowerCase().startsWith(p.toLowerCase())); if(v)break;}
      if(v){u.voice=v;u.lang=v.lang;} else u.lang=pref[0];
      u.rate=.85; s.speak(u); ttsOK=true;
    }catch(e){ttsOK=false;}
    if(performance.now()-t0>250) ttsOK=false;
  },60);
}

/* ---------- views ---------- */
const $app=document.getElementById("app");
const logo=`<div class="logo" aria-label="Mondiloo">${"Mondiloo".split("").map(c=>`<i>${c}</i>`).join("")}</div>`;
function bar(){
  return `<div class="bar">${logo}<div class="bar-r">
   ${CURP&&PROFILES.length>1?`<button class="chip" data-go="who">${CURP.av} ${esc(CURP.name)}</button>`:""}
   ${lang?`<button class="chip" data-go="lang">${LANGS[lang].name}</button>`:""}
   ${age?`<button class="chip" data-go="age">${A().e} ${A().label} ${t("yrs")}</button>`:""}
   <button class="chip${sound?"":" off"}" data-snd="1" aria-label="${t("snd")}" aria-pressed="${sound}">${sound?"🔊":"🔇 "+t("snd")}</button>
   <div class="chip pill">⭐ <span>${stars}</span></div>
   ${lang&&age?`<button class="chip" data-parentgo="1" aria-label="${t("parent")}">👪</button>`:""}</div></div>`;
}
const flag=c=>`<span class="flagbar">${c.map(x=>`<i style="background:${x}"></i>`).join("")}</span>`;
let homeCat="all";
const CATS={all:["✨","catAll"],play:["🎮","catPlay"],lang:["📖","catLang"],math:["🔢","catMath"],world:["🌍","catWorld"]};
const PLAYS=["mem","snake","balloon","sort","puzzle","ttt","simon","mole","hidden","paint","maze","dots","shadow","diff","draw","music","songs","album"];
const CATOF={talk:"lang",globe:"world",feed:"world",emo:"world",opp:"lang",miss:"math",size:"math",pattern:"math",odd:"world",spell:"lang",cook:"world",habits:"world",order:"world",proverbs:"lang",trace:"lang",haiti:"world",phrases:"lang",stories:"lang",words:"lang",abc:"lang",find:"lang",count:"math",add:"math",sub:"math",mul:"math",cmp:"math",nums:"math",colors:"world",shapes:"world",body:"world",animals:"world",days:"world",clock:"world"};
const GAMEINFO={talk:["🎤","c-rose"],globe:["🌍","c-sky"],feed:["🥕","c-leaf"],emo:["😊","c-amber"],opp:["↔️","c-sky"],miss:["❓","c-grape"],ttt:["⭕","c-teal"],size:["📏","c-rose"],pattern:["🔁","c-grape"],odd:["🙃","c-coral"],spell:["🔡","c-leaf"],simon:["🚦","c-rose"],hidden:["🕵️","c-ink"],mole:["🦀","c-coral"],paint:["🖌️","c-rose"],maze:["🌀","c-sky"],dots:["✏️","c-amber"],shadow:["👤","c-ink"],diff:["🔍","c-teal"],cook:["🍳","c-amber"],habits:["🪥","c-sky"],order:["🐣","c-leaf"],songs:["🎤","c-coral"],proverbs:["🦉","c-teal"],trace:["✍️","c-rose"],haiti:["🇭🇹","c-sky"],album:["📒","c-grape"],daily:["🔥","c-amber"],phrases:["💬","c-sky"],stories:["📚","c-grape"],abc:["🔠","c-amber"],animals:["🐮","c-leaf"],days:["📅","c-sky"],clock:["⏰","c-grape"],puzzle:["🧩","c-sky"],music:["🎹","c-rose"],words:["🔤","c-coral"],count:["🖐️","c-sky"],add:["➕","c-leaf"],sub:["➖","c-rose"],colors:["🎨","c-grape"],find:["👂","c-amber"],nums:["🔢","c-ink"],shapes:["🔷","c-teal"],body:["👃","c-coral"],cmp:["⚖️","c-sky"],mul:["✖️","c-rose"],draw:["🖍️","c-teal"],
  mem:["🃏","c-grape"],sort:["🧪","c-amber"],snake:["🐍","c-leaf"],balloon:["🎈","c-coral"]};
const tile=k=>`<button class="game ${GAMEINFO[k][1]}${isLocked(k)?" locked":""}" data-go="${k}">${isLocked(k)?`<span class="lock" aria-label="Premium">🔒</span>`:""}<span class="e" aria-hidden="true">${GAMEINFO[k][0]}</span><b>${t(k)}</b><small>${t(k+"S").replace("{n}",A().nums)}</small></button>`;

const HT_FIRST=["proverbs"];
function homeOrder(list){return lang==="ht"?list:[...list.filter(g=>!HT_FIRST.includes(g)),...list.filter(g=>HT_FIRST.includes(g))];}
const storyOrder=()=>{const all=STORIES.map((_,i)=>i),nb=BOUKI_STORIES.length;return lang==="ht"?all:[...all.slice(nb),...all.slice(0,nb)];};
function globeSlides(c){return [[c.f,t("hiIn").replace("{c}",c.inP[LI[lang]]).replace("{h}",c.hi)],...c.s.map(x=>[x[0],x[1][LI[lang]]])];}
function render(){
  let h=bar();
  if(screen==="lang"){
    h+=`<section class="card"><h1>${lang?t("pick"):"Chwazi lang ou · Choose your language"}</h1>
      <div class="langs">${Object.entries(LANGS).map(([k,v])=>`<button class="lang" data-lang="${k}" aria-pressed="${k===lang}">${flag(v.flag)}<b>${v.name}</b><small>${v.sub}</small></button>`).join("")}</div></section>`;
  } else if(screen==="age"){
    h+=`<section class="card"><h1>${t("ageQ")}</h1><p class="hint">${t("ageH")}</p>
      <div class="ages">${Object.entries(AGES).map(([k,v])=>`<button class="age" data-age="${k}" aria-pressed="${k===age}"><span class="e">${v.e}</span><b>${v.label}</b><small>${t("yrs")}</small></button>`).join("")}</div></section>`;
  } else if(screen==="home"){
    const into=stars%10, tro=Math.floor(stars/10);
    h+=`<section class="card"><div class="hello">${tiki()}<div class="bubble"><b>${t("hiTiki")}</b>${t("hi")}
      <div class="prog"><span>⭐ ${into}/10</span><span class="track"><span class="fill" style="width:${into*10}%;display:block"></span></span><span>🏆</span></div>
      ${tro?`<div class="trophies" aria-label="${tro}">${"🏆".repeat(Math.min(tro,10))}${tro>10?" +"+(tro-10):""}</div>`:`<small style="color:var(--muted);font-weight:700">${t("nextT")}: ${10-into} ⭐</small>`}</div></div>
      <button class="dailyb${dailyDoneToday()?" done":""}" data-go="daily"><span class="fl">🔥</span><span class="dt"><b>${t("daily")}</b><small>${dailyDoneToday()?t("doneToday"):t("dailyS")}</small></span><span class="st">${streakNow()}<small>${t("streakL")}</small></span></button>
      <div class="cats" role="group">${Object.keys(CATS).map(k=>`<button class="cat" data-cat="${k}" aria-pressed="${homeCat===k}">${CATS[k][0]} ${t(CATS[k][1])}</button>`).join("")}</div>
      ${["play","lang","math","world"].filter(k=>homeCat==="all"||homeCat===k).map(k=>{const items=k==="play"?PLAYS:homeOrder(A().learn).filter(g=>CATOF[g]===k);
        return items.length?`<h3>${CATS[k][0]} ${t(CATS[k][1])}</h3><div class="games">${items.map(tile).join("")}</div>`:"";}).join("")}</section>`;
  } else if(screen==="who"){
    h+=`<section class="card"><h1>${t("who")}</h1><div class="kids">${PROFILES.map(p=>`<button class="kid" data-prof="${p.id}"><span>${p.av}</span><b>${esc(p.name)||"—"}</b><small>${AGES[p.age||"b"].label} ${t("yrs")}</small></button>`).join("")}</div></section>`;
  } else if(screen==="paywall"){
    h+=`<section class="card"><div class="top"><button class="back" data-go="home">← ${t("back")}</button></div>${paywallView()}</section>`;
  } else if(screen==="parent"){
    h+=`<section class="card"><div class="top"><button class="back" data-go="home">← ${t("back")}</button></div>${parentView()}</section>`;
  } else if(screen==="gate"){
    h+=`<section class="card"><div class="top"><button class="back" data-go="home">← ${t("back")}</button></div>${gateView()}</section>`;
  } else if(screen==="limit"){
    h+=`<section class="card">${limitView()}</section>`;
  } else {
    h+=`<section class="card">${playTop()}${play()}</section>`;
  }
  h+=`<p class="foot">Mondiloo · v${APP_VERSION} · <a href="privacy.html">Privacy</a></p>`;
  $app.innerHTML=h;
  if(screen==="snake") snakeInit();
  if(screen==="balloon") balloonInit();
  if(screen==="draw") drawInit();
  if(screen==="puzzle") puzzleInit();
  if(screen==="sort") sortInit();
  if(screen==="trace") traceInit();
  if(screen==="paint") paintInit();
  if(screen==="maze") mazeInit();
  if(screen==="dots") dotsInit();
  if(screen==="shadow") shadowInit();
  if(screen==="diff") diffInit();
  if(screen==="cook") cookInit();
  if(screen==="habits"||screen==="order") seqInit(screen);
  if(screen==="songs"){const au=[...document.querySelectorAll(".song audio")];au.forEach(x=>x.addEventListener("play",()=>au.forEach(y=>{if(y!==x)y.pause();})));}
  if(screen==="pattern") patternInit();
  if(screen==="odd") oddInit();
  if(screen==="spell") spellInit();
  if(screen==="simon") simonInit();
  if(screen==="hidden") hiddenInit();
  if(screen==="mole") moleInit();
  if(["feed","emo","opp","miss"].includes(screen)) rqInit(screen);
  if(screen==="size") sizeInit();
  if(screen==="ttt") tttInit();
  if(screen==="talk") talkInit();
}
function playTop(){
  const right=["puzzle","music","songs","album",...NEWG,...NEWG2,...NEWG3,"talk"].includes(screen)?`<span class="score" id="score"></span>`:screen==="draw"?`<button class="say" data-clear="1">🧽 ${t("clear")}</button>`:["mem","snake","balloon","sort"].includes(screen)?`<span class="score" id="score"></span>`:lang==="ht"?`<span class="soon">🔈 Vwa kreyòl: byento</span>`:`<button class="say" data-say="1">🔊 ${t("listen")}</button>`;
  const lvBar=LVGAMES.includes(screen)?`<div class="lvbar"><button data-lv="-1" ${lvl(screen)<=1?"disabled":""} aria-label="-">◀</button><b>${t("level")} ${lvl(screen)}</b><button data-lv="1" ${lvl(screen)>=lvMax(screen)?"disabled":""} aria-label="+">▶</button></div>`:"";
  const dHead=screen==="daily"?`<div class="dhead">🔥 ${t("daily")} · ${Math.min(daily.i+1,3)}/3</div>`:"";
  const backBtn=screen==="globe"&&gC>=0?`<button class="back" data-gback="1">← ${t("back")}</button>`:`<button class="back" data-go="${screen==="haiti"&&fromGlobe?"globe":"home"}">← ${t("back")}</button>`;
  return `<div class="top">${backBtn}${right}</div>${lvBar}${dHead}`;
}

/* ---------- learning games ---------- */
function opts3(n,min,max){const s=new Set([n]);const spread=max>30?10:3;let g=0;while(s.size<3&&g<200){g++;const x=n+rnd(-spread,spread);if(x>=min&&x<=max)s.add(x);}return shuffle([...s]);}
function newQ(){
  const scr=qScr();
  locked=false; const a=A(); const e=ITEMS[rnd(0,ITEMS.length-1)];
  if(scr==="count"){const n=rnd(a.count[0],a.count[1]);q={n,e,ans:n,opts:opts3(n,a.count[0],a.count[1]),say:t("qCount")};}
  if(scr==="add"){let x,y; if(a.add<=10){x=rnd(1,a.add-1);y=rnd(1,a.add-x);} else {x=rnd(5,a.add-10);y=rnd(1,Math.min(20,a.add-x));}
    q={x,y,e,ans:x+y,opts:opts3(x+y,2,a.add),say:`${nw(x)} + ${nw(y)}. ${t("qAdd")}`};}
  if(scr==="sub"){const x=rnd(3,a.sub),y=rnd(1,Math.min(x-1,20));q={x,y,e,ans:x-y,opts:opts3(x-y,0,a.sub),say:`${nw(x)} − ${nw(y)}. ${t("qSub")}`};}
  if(scr==="colors"){const c=shuffle(COLORS).slice(0,4);const ans=rnd(0,3);q={c,ans,say:t("qColor").replace("{x}",c[ans][WI[lang]].toLowerCase())};}
  if(scr==="shapes"){const n=age==="a"?3:4;const sh=shuffle(SHAPES.slice(0,age==="a"?4:7)).slice(0,n);const ans=rnd(0,n-1);q={sh,ans,cols:shuffle(SHAPECOL),say:t("qShape").replace("{x}",sh[ans][WI[lang]].toLowerCase())};}
  if(scr==="body"){const n=age==="a"?3:4;const bd=shuffle(BODY).slice(0,n);const ans=rnd(0,n-1);q={bd,ans,say:t("qBody").replace("{x}",bd[ans][WI[lang]].toLowerCase())};}
  if(scr==="cmp"){const max=age==="c"?100:20;let x=rnd(1,max),y;do{y=rnd(1,max);}while(y===x);q={x,y,ans:Math.max(x,y),say:t("qCmp")};}
  if(scr==="mul"){const x=[2,3,5,10][rnd(0,3)],y=rnd(1,x===10?10:6);const p=x*y;const s2=new Set([p]);while(s2.size<3){const d=p+[-x,x,-1,1,2*x][rnd(0,4)];if(d>0)s2.add(d);}
    q={x,y,e:ITEMS[rnd(0,ITEMS.length-1)],ans:p,opts:shuffle([...s2]),say:`${nw(y)} × ${nw(x)}. ${t("qAdd")}`};}
  if(scr==="phrases"){const ph=shuffle(PHRASES).slice(0,3);const ans=rnd(0,2);q={ph,ans,say:t("qPhrase")};}
  if(scr==="animals"){const n=age==="a"?3:4;const an=shuffle(ANIMALS).slice(0,n);const ans=rnd(0,n-1);q={an,ans,say:t("qAnimal").replace("{x}",an[ans][SI[lang]])};}
  if(scr==="days"){const d=rnd(0,6);const ans=(d+1)%7;const o=new Set([ans]);while(o.size<3)o.add(rnd(0,6));o.delete(d);while(o.size<3){const x=rnd(0,6);if(x!==d)o.add(x);}
    q={d,ans,opts:shuffle([...o]),say:t("qDay").replace("{x}",["fr","es"].includes(lang)?DAYS[lang][d].toLowerCase():DAYS[lang][d])};}
  if(scr==="clock"){const mins=age==="c"?[0,15,30,45]:[0];const h=rnd(1,12),m=mins[rnd(0,mins.length-1)];const f=(H,M)=>`${H}:${String(M).padStart(2,"0")}`;
    const o=new Set([f(h,m)]);while(o.size<3){const H=rnd(1,12),M=mins[rnd(0,mins.length-1)];o.add(f(H,M));}
    q={h,m,ans:f(h,m),opts:shuffle([...o]),say:t("qClock")};}
  if(scr==="find"){const w=shuffle(themeList(theme)).slice(0,age==="a"?3:4);const ans=rnd(0,w.length-1);q={w,ans,say:t("qFind").replace("{x}",word(w[ans]))};}
}
function blocks(n){const tens=Math.floor(n/10),ones=n%10;
  return `<div class="blocks" aria-label="${n}">${Array.from({length:tens},()=>`<span class="ten">${"<i></i>".repeat(10)}</span>`).join("")}<span class="ones">${'<span class="one"></span>'.repeat(ones)}</span></div>`;}
const pics=(e,n,wide)=>n>20?blocks(n):`<div class="group${wide?" wide":""}">${e.repeat(n)}</div>`;
const numOpts=()=>`<div class="opts">${q.opts.map(n=>`<button class="opt" data-a="${n}"><span class="n">${n}</span><span class="w">${nw(n)}</span></button>`).join("")}</div>`;
const fb=`<p class="fb" id="fb" aria-live="polite"></p>`;

function play(){
  const scr=qScr();
  if(scr==="words"){
    const L=themeList(theme); if(wIdx>=L.length) wIdx=0; const w=L[wIdx], txt=word(w);
    const chips=`<div class="cats">${TORDER.map(k=>`<button class="cat" data-theme="${k}" aria-pressed="${k===theme}">${TEMOJI[k]} ${TNAME[k][LI[lang]]}</button>`).join("")}</div>`;
    const others=Object.keys(WI).filter(k=>k!==lang).map(k=>`<span>${LANGS[k].name}: ${w[WI[k]]}</span>`).join("");
    return `${chips}<button class="wcard" data-say="1" aria-label="${txt}"><span class="pic">${w[0]}</span><span class="word"><span>${txt[0]}</span>${txt.slice(1)}</span></button>
      <div class="others">${others}</div>
      <div class="nav"><button data-w="-1">← ${t("prev")}</button><output>${wIdx+1} / ${L.length}</output><button data-w="1">${t("next")} →</button></div>`;
  }
  if(scr==="nums"){const N=A().nums;
    return `<h2 id="numbig">1 · ${nw(1)}</h2><div class="board ${N>20?"b10":""}">${Array.from({length:N},(_,i)=>`<button data-n="${i+1}" class="${i===0?"on":""}${(i+1)%10===0&&N>20?" ten-row":""}">${i+1}</button>`).join("")}</div>`;}
  if(scr==="count") return `<h2>${q.say}</h2><div class="stage">${pics(q.e,q.n,true)}</div>${numOpts()}${fb}`;
  if(scr==="add") return `<h2>${t("qAdd")}</h2><div class="stage">${pics(q.e,q.x)}<span class="op">+</span>${pics(q.e,q.y)}</div><div class="stage"><span class="op">${q.x} + ${q.y} = ?</span></div>${numOpts()}${fb}`;
  if(scr==="sub"&&q.x>20) return `<h2>${t("qSub")}</h2><div class="stage">${blocks(q.x)}</div><div class="stage"><span class="op">${q.x} − ${q.y} = ?</span></div>${numOpts()}${fb}`;
  if(scr==="sub") return `<h2>${t("qSub")}</h2><div class="stage"><div class="group wide">${q.e.repeat(q.x-q.y)}<span style="opacity:.22">${q.e.repeat(q.y)}</span></div></div><div class="stage"><span class="op">${q.x} − ${q.y} = ?</span></div>${numOpts()}${fb}`;
  if(scr==="colors") return `<h2>${q.say}</h2><div class="opts four">${q.c.map((c,i)=>`<button class="opt" data-a="${i}" aria-label="${c[WI[lang]]}"><span class="swatch" style="background:${c[0]}"></span></button>`).join("")}</div>${fb}`;
  if(scr==="shapes") return `<h2>${q.say}</h2><div class="opts ${q.sh.length===4?"four":""}">${q.sh.map((x,i)=>`<button class="opt" data-a="${i}" aria-label="${x[WI[lang]]}">${shapeSVG(x[0],q.cols[i])}</button>`).join("")}</div>${fb}`;
  if(scr==="body") return `<h2>${q.say}</h2><div class="opts ${q.bd.length===4?"four":""}">${q.bd.map((x,i)=>`<button class="opt" data-a="${i}" aria-label="${x[WI[lang]]}"><span class="big">${x[0]}</span></button>`).join("")}</div>${fb}`;
  if(scr==="cmp") return `<h2>${q.say}</h2><div class="opts four">${[q.x,q.y].map(n=>`<button class="opt" data-a="${n}"><span class="n" style="font-size:56px">${n}</span><span class="w">${nw(n)}</span>${n<=20?`<span style="font-size:13px;line-height:1.1;max-width:100%;overflow-wrap:anywhere;color:var(--sky)">${"●".repeat(n)}</span>`:""}</button>`).join("")}</div>${fb}`;
  if(scr==="mul") return `<h2>${t("qAdd")}</h2><div class="stage">${Array.from({length:q.y},()=>`<div class="group" style="max-width:30%;font-size:${q.x>5?"16px":"22px"}">${q.e.repeat(q.x)}</div>`).join("")}</div><div class="stage"><span class="op">${q.y} × ${q.x} = ?</span></div>${numOpts()}${fb}`;
  if(scr==="draw") return `<div class="snakewrap"><canvas id="dcv" width="600" height="600" style="background:#fff;border:3px solid var(--line)"></canvas></div>
    <div class="pal">${COLORS.map((c,i)=>`<button class="dot${i===1?" on":""}" data-col="${i}" style="background:${c[0]}" aria-label="${c[WI[lang]]}"></button>`).join("")}</div>
    <div class="pal">${[6,14,26].map((w,i)=>`<button class="sz${i===1?" on":""}" data-sz="${w}" aria-label="${w}"><i style="width:${w}px;height:${w}px"></i></button>`).join("")}</div>`;
  if(scr==="abc"){const L=ALPHA[lang];const cur=game.letter||L[0];const w=alphaWord(cur);
    return `<button class="wcard" data-say="1"><span class="word" style="font-size:72px">${cur} ${cur.toLowerCase()}</span>${w?`<span class="pic" style="font-size:72px">${w[0]}</span><span class="word" style="font-size:34px"><span>${w[1].slice(0,cur.length)}</span>${w[1].slice(cur.length)}</span>`:""}</button>
      <div class="board" style="grid-template-columns:repeat(6,minmax(0,1fr))">${L.map(x=>`<button data-letter="${x}" class="${x===cur?"on":""}">${x}</button>`).join("")}</div>`;}
  if(scr==="phrases"){
    const tabs=`<div class="cats"><button class="cat" data-pmode="learn" aria-pressed="${pMode==="learn"}">📖 ${t("learn")}</button><button class="cat" data-pmode="test" aria-pressed="${pMode==="test"}">❓ ${t("testM")}</button></div>`;
    if(pMode==="learn"){const ph=PHRASES[pIdx];
      return `${tabs}<button class="wcard" data-say="1"><span class="pic">${ph[0]}</span><span class="word" style="font-size:clamp(28px,8vw,44px);text-align:center;text-wrap:balance">${ph[WI[lang]]}</span></button>
        <p class="hint" style="text-align:center;font-weight:800">${t("otherL")}</p><div class="others">${Object.keys(WI).filter(k=>k!==lang).map(k=>`<span>${LANGS[k].name}: ${ph[WI[k]]}</span>`).join("")}</div>
        <div class="nav"><button data-pi="-1">← ${t("prev")}</button><output>${pIdx+1} / ${PHRASES.length}</output><button data-pi="1">${t("next")} →</button></div>`;}
    return `${tabs}<div class="stage" style="font-size:80px">${q.ph[q.ans][0]}</div><h2>${t("qPhrase")}</h2>
      <div class="opts" style="grid-template-columns:1fr">${q.ph.map((x,i)=>`<button class="opt" data-a="${i}" style="min-height:58px"><span class="w" style="font-size:19px;color:var(--ink)">${x[WI[lang]]}</span></button>`).join("")}</div>${fb}`;}
  if(scr==="stories"){
    if(story<0) return `<div class="games">${storyOrder().map(i=>[STORIES[i],i]).map(([st,i],j)=>`<button class="game ${["c-coral","c-sky","c-leaf"][j%3]}" data-story="${i}"><span class="e">${st.e}</span><b>${st.t[LI[lang]]}</b><small>${st.p.length} ${t("pages")}</small></button>`).join("")}</div>`;
    const st=STORIES[story], last=sPage===st.p.length-1, pg=st.p[sPage];
    return `<h2>${st.t[LI[lang]]}</h2><div class="book"><div class="pic">${pg[0]}</div><p class="line">${pg[WI[lang]]}</p>
      <details><summary>${t("otherL")}</summary><div class="others" style="margin-top:8px">${Object.keys(WI).filter(k=>k!==lang).map(k=>`<span>${LANGS[k].name}: ${pg[WI[k]]}</span>`).join("")}</div></details></div>
      <div class="dots">${st.p.map((_,i)=>`<i class="${i===sPage?"on":""}"></i>`).join("")}</div>
      <div class="nav"><button data-sp="-1" ${sPage===0?"disabled":""}>← ${t("prev")}</button>${last?`<button data-story="-1" style="background:var(--leaf)">⭐ ${t("theEnd")}</button>`:`<button data-sp="1">${t("next")} →</button>`}</div>`;}
  if(scr==="songs"){
    if(!SONGS.length) return `<div class="hello" style="flex-direction:column;text-align:center">${tiki("happy")}<h2>${t("songsSoon")}</h2></div>`;
    const sl=sg=>sg.lang||"ht", list=[...SONGS.filter(sg=>sl(sg)===lang),...SONGS.filter(sg=>sl(sg)!==lang)];
    return `<div class="songs">${list.map(sg=>`<div class="song"><span class="e">${sg.e||"🎵"}</span><b>${esc(Array.isArray(sg.t)?sg.t[LI[lang]]:sg.t)}${sl(sg)!==lang?` <small class="lbadge">${sl(sg)==="ht"?"🇭🇹 ":""}${LANGS[sl(sg)]?LANGS[sl(sg)].name:sl(sg)}</small>`:""}</b><audio controls preload="none" src="${sg.file}"></audio></div>`).join("")}</div>`;}
  if(scr==="proverbs"){const p=PROVERBS[pvIdx];
    return `<div class="book"><div class="pic">${p[5]}</div><p class="line">${p[0]}</p><p class="hint" style="font-weight:800;margin:0">${t("meaning")}</p><p style="margin:0;text-align:center;font-size:18px">${p[WI[lang]]}</p></div>
      <div class="nav"><button data-pv="-1">← ${t("prev")}</button><output>${pvIdx+1} / ${PROVERBS.length}</output><button data-pv="1">${t("next")} →</button></div>`;}
  if(scr==="globe"){
    if(gC<0) return `<div class="games">${COUNTRIES.map((c,i)=>`<button class="game ${["c-sky","c-coral","c-leaf","c-amber","c-grape","c-teal","c-rose"][i%7]}" data-gc="${i}"><span class="e">${c.f}</span><b>${c.n[LI[lang]]}</b><small>${c.haiti?t("haitiS"):esc(c.hi)}</small></button>`).join("")}</div>`;
    const c=COUNTRIES[gC],sl=globeSlides(c),last=gS===sl.length-1,cur=sl[gS];
    return `<div class="book"><h2>${c.f} ${c.n[LI[lang]]}</h2><div class="pic">${cur[0]}</div><p class="line">${cur[1]}</p></div>
      <div class="dots">${sl.map((_,i)=>`<i class="${i===gS?"on":""}"></i>`).join("")}</div>
      <div class="nav"><button data-gx="-1" ${gS===0?"disabled":""}>← ${t("prev")}</button>${last?`<button data-gdone="1" style="background:var(--leaf)">⭐ ${t("theEnd")}</button>`:`<button data-gx="1">${t("next")} →</button>`}</div>`;}
  if(scr==="haiti"){const h=HAITI[hIdx];
    const vis=h[0]==="flag"?`<svg viewBox="0 0 150 90" width="210" role="img" aria-label="flag"><rect width="150" height="45" fill="#00209F"/><rect y="45" width="150" height="45" fill="#D21034"/><rect x="55" y="30" width="40" height="30" fill="#fff"/><path d="M75 36v18M67 54h16" stroke="#016A16" stroke-width="3"/><circle cx="75" cy="38" r="4" fill="#016A16"/></svg>`
      :h[0]==="deps"?`<ol class="deps">${DEPS[lang].map(d=>`<li>${d}</li>`).join("")}</ol>`:`<div class="pic">${h[0]}</div>`;
    const last=hIdx===HAITI.length-1;
    return `<div class="book"><h2>${h[1][LI[lang]]}</h2>${vis}<p class="line">${h[2][LI[lang]]}</p></div>
      <div class="dots">${HAITI.map((_,i)=>`<i class="${i===hIdx?"on":""}"></i>`).join("")}</div>
      <div class="nav"><button data-hx="-1" ${hIdx===0?"disabled":""}>← ${t("prev")}</button>${last?`<button data-hdone="1" style="background:var(--leaf)">⭐ ${t("theEnd")}</button>`:`<button data-hx="1">${t("next")} →</button>`}</div>`;}
  if(scr==="album"){const n=Math.min(STICKERS.length,Math.floor(stars/5)), need=5-(stars%5);
    return `<h2>📒 ${n} / ${STICKERS.length}</h2><p class="hint" style="text-align:center">${n>=STICKERS.length?t("allStickers"):t("nextSticker").replace("{n}",need)}</p>
      <div class="album">${STICKERS.map((e,i)=>`<div class="stk${i<n?" got":""}">${i<n?e:"?"}</div>`).join("")}</div>`;}
  if(scr==="trace"){const L=ALPHA[lang], cur=L[trIdx%L.length];
    return `<h2>${t("traceHint")}</h2><div class="tracewrap" id="trwrap"><canvas id="trg" width="360" height="360"></canvas><canvas id="tri" width="360" height="360"></canvas></div>
      <p class="fb" id="trfb" aria-live="polite"></p>
      <div class="nav"><button data-tr="-1">← ${t("prev")}</button><button data-trclear="1" style="background:var(--coral)">🧽</button><button data-tr="1">${t("next")} →</button></div>`;}
  if(scr==="animals") return `<h2>${q.say}</h2><div class="opts ${q.an.length===4?"four":""}">${q.an.map((x,i)=>`<button class="opt" data-a="${i}" aria-label="${x[WI[lang]]}"><span class="big">${x[0]}</span><span class="w">${x[WI[lang]]}</span></button>`).join("")}</div>${fb}`;
  if(scr==="days"){const today=(new Date().getDay()+6)%7;
    const DC=["#E53935","#FB8C00","#F2B705","#2E9E4F","#13A3A3","#1E63D6","#7E3FD0"];
    const row=`<div class="week">${DAYS[lang].map((d,i)=>`<button class="day${i===today?" today":""}" data-day="${i}" style="--dc:${DC[i]};color:${i===2?"#24305E":"#fff"}"><span class="num">${i+1}</span><b>${d}</b>${i===today?`<small>⭐ ${t("today")}</small>`:""}</button>`).join("")}</div>`;
    if(age==="a") return `<h2>${t("today")}${lang==="fr"?" :":":"} ${["fr","es"].includes(lang)?DAYS[lang][today].toLowerCase():DAYS[lang][today]}</h2>${row}`;
    return `<h2>${q.say}</h2><div class="opts">${q.opts.map(i=>`<button class="opt" data-a="${i}"><span class="w" style="font-size:18px;color:var(--ink)">${DAYS[lang][i]}</span></button>`).join("")}</div>${fb}${row}`;}
  if(scr==="clock"){const ha=((q.h%12)+q.m/60)*30, ma=q.m*6;
    const ticks=Array.from({length:12},(_,i)=>{const a=(i+1)*30*Math.PI/180;return `<text x="${100+72*Math.sin(a)}" y="${100-72*Math.cos(a)+7}" text-anchor="middle" font-size="20" font-weight="800" fill="#24305E" font-family="Baloo 2,sans-serif">${i+1}</text>`;}).join("");
    return `<h2>${q.say}</h2><div class="stage"><svg viewBox="0 0 200 200" width="210" height="210" role="img" aria-label="clock"><circle cx="100" cy="100" r="94" fill="#fff" stroke="#24305E" stroke-width="6"/>${ticks}
      <line x1="100" y1="100" x2="${100+46*Math.sin(ha*Math.PI/180)}" y2="${100-46*Math.cos(ha*Math.PI/180)}" stroke="#FF6B5B" stroke-width="9" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="${100+70*Math.sin(ma*Math.PI/180)}" y2="${100-70*Math.cos(ma*Math.PI/180)}" stroke="#2F80ED" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="100" r="7" fill="#24305E"/></svg></div>
      <div class="opts">${q.opts.map(x=>`<button class="opt" data-a="${x}"><span class="n" style="font-size:34px">${x}</span></button>`).join("")}</div>${fb}`;}
  if(scr==="puzzle") return `<p class="hint" style="text-align:center">${t("tapTwo")}</p><div class="pz" id="pz"></div><img id="pzprev" alt="" style="width:90px;border-radius:12px;align-self:center;border:3px solid var(--line)">`;
  if(scr==="music"){const lab=lang==="en"?["C","D","E","F","G","A","B","C"]:["Do","Re","Mi","Fa",lang==="ht"?"Sòl":"Sol","La","Si","Do"];
    return `<div class="piano">${NOTES.map((f,i)=>`<button class="key" data-note="${i}" style="background:${NOTECOL[i]}"><span>${lab[i]}</span></button>`).join("")}</div>
      <div class="nav" style="justify-content:center"><button data-song="1">🎵 ${t("song")}</button></div>`;}
  if(scr==="find") return `<h2>${q.say}</h2><div class="opts ${q.w.length===4?"four":""}">${q.w.map((w,i)=>`<button class="opt" data-a="${i}" aria-label="${word(w)}"><span class="big">${w[0]}</span></button>`).join("")}</div>${fb}`;
  if(scr==="mem") return memView();
  if(scr==="sort") return `<p class="hint" style="text-align:center">${t("sortS")}</p><div class="sortbox" id="sortbox"></div>
    <div class="nav" style="justify-content:center;gap:10px"><button id="sundo" data-sundo="1">↩ ${t("undo")}</button><button data-again="sort" style="background:var(--coral)">🔄 ${t("restart")}</button></div>`;
  if(scr==="snake") return `<h2 id="shint" style="font-size:22px"></h2><div class="snakewrap" id="swrap"><canvas id="cv" width="480" height="480"></canvas><div class="over" id="sover"><b>🐍</b><button class="go big" data-sstart="1">▶ ${t("start")}</button><span>${t("swipeHint")}</span></div></div>
    <div class="pad"><button class="u" data-dir="0,-1" aria-label="Up">▲</button><button class="l" data-dir="-1,0" aria-label="Left">◀</button><button class="d" data-dir="0,1" aria-label="Down">▼</button><button class="r" data-dir="1,0" aria-label="Right">▶</button></div>`;
  if(scr==="balloon") return `<h2 id="bhint" style="font-size:22px"></h2><div class="sky" id="sky"></div>`;
  if(scr==="paint") return `<p class="hint" style="text-align:center">${t("paintHint")}</p><button class="paintbox" aria-label="${t("paint")}"><svg id="paintsvg" viewBox="0 0 200 200"></svg></button>
    <div class="pal">${PAINTCOL.map((c,i)=>`<button class="dot${i===0?" on":""}" data-pcol="${i}" style="background:${c}" aria-label="${(COLORS[i]||[c])[WI[lang]]||c}"></button>`).join("")}</div>`;
  if(scr==="maze") return `<p class="hint" style="text-align:center">${t("mazeHint")}</p><div class="maze" id="maze"></div>
    <div class="pad"><button class="u" data-mz="0,-1" aria-label="Up">▲</button><button class="l" data-mz="-1,0" aria-label="Left">◀</button><button class="d" data-mz="0,1" aria-label="Down">▼</button><button class="r" data-mz="1,0" aria-label="Right">▶</button></div>`;
  if(scr==="dots") return `<p class="hint" style="text-align:center">${t("dotsHint")}</p><div class="dotsbox" id="dotsbox"></div>`;
  if(scr==="shadow") return `<h2>${t("shadowQ")}</h2><div class="shbox" id="shbox"></div>`;
  if(scr==="diff") return `<div class="diffbox" id="diffbox"></div>`;
  if(scr==="cook") return `<div class="cookbox" id="cookbox"></div>`;
  if(scr==="talk") return `<div class="tkbox" id="tkbox"></div>`;
  if(["feed","emo","opp","miss"].includes(scr)) return `<div class="rqbox" id="rqbox"></div>`;
  if(scr==="size") return `<div class="szbox" id="szbox"></div>`;
  if(scr==="ttt") return `<div class="ttbox" id="ttbox"></div>`;
  if(scr==="pattern") return `<h2>${t("patternQ")}</h2><div class="pabox" id="pabox"></div>`;
  if(scr==="odd") return `<h2>${t("oddQ")}</h2><div id="odbox"></div>`;
  if(scr==="spell") return `<h2>${t("spellQ")}</h2><div class="spbox" id="spbox"></div>`;
  if(scr==="simon") return `<div class="sibox" id="sibox"></div>`;
  if(scr==="hidden") return `<div class="diffbox" id="hdbox"></div>`;
  if(scr==="mole") return `<p class="hint" style="text-align:center">${age==="a"?t("moleS"):t("moleQ")}</p><div class="moles" id="mlbox"></div>`;
  if(scr==="habits"||scr==="order") return `<p class="hint" style="text-align:center">${t("orderHint")}</p><div class="seqbox" id="seqbox"></div>`;
  return "";
}
function answer(btn){
  const scr=qScr();
  if(locked) return;
  const v=scr==="clock"?btn.dataset.a:+btn.dataset.a, f=document.getElementById("fb");
  if(v===q.ans){
    locked=true; btn.classList.add("ok"); addStar(); sfx("ok"); confetti(); cheer(t("ok"));
    f.className="fb ok"; f.textContent="⭐ "+t("ok");
    const said=scr==="phrases"?q.ph[q.ans][WI[lang]]:scr==="animals"?q.an[q.ans][WI[lang]]+". "+q.an[q.ans][SI[lang]]:scr==="days"?DAYS[lang][q.ans]:scr==="clock"?q.ans:scr==="shapes"?q.sh[q.ans][WI[lang]]:scr==="body"?q.bd[q.ans][WI[lang]]:scr==="colors"?q.c[q.ans][WI[lang]]:scr==="find"?word(q.w[q.ans]):nw(q.ans);
    speak(said+". "+t("ok"));
    statOk();
    if(screen==="daily"){timers.push(setTimeout(dailyNext,1300));return;}
    timers.push(setTimeout(()=>{newQ();render();speak(q.say);},1500));
  } else {
    btn.classList.remove("no"); void btn.offsetWidth; btn.classList.add("no"); sfx("no");
    f.className="fb no"; f.textContent=t("no"); speak(t("no"));
  }
}

/* ---------- memory ---------- */
function memInit(){
  const a={...A()}; a.pairs=Math.min({a:8,b:10,c:10}[age||"b"],{a:3,b:4,c:5}[age||"b"]+lvl("mem")-1); let cards=[];
  if(a.memMode==="numword"){const ns=shuffle(Array.from({length:99},(_,i)=>i+2)).slice(0,a.pairs);
    ns.forEach(n=>{cards.push({k:n,face:String(n),say:nw(n)});cards.push({k:n,face:nw(n),say:nw(n),word:true});});}
  else if(a.memMode==="picword"){const ws=shuffle(WORDS).slice(0,a.pairs); ws.forEach((w,i)=>{cards.push({k:i,face:w[0],say:word(w)});cards.push({k:i,face:word(w),say:word(w),word:true});});}
  else {const ws=shuffle(WORDS).slice(0,a.pairs); ws.forEach((w,i)=>{for(let j=0;j<2;j++)cards.push({k:i,face:w[0],say:word(w)});});}
  game={cards:shuffle(cards).map(c=>({...c,up:false,done:false})),open:[],moves:0,found:0,busy:false};
}
function memView(){
  if(!game.cards) memInit();
  const done=game.found===game.cards.length/2;
  return `<div class="mem">${game.cards.map((c,i)=>`<button class="mc ${c.up||c.done?"up":"back"}${c.done?" done":""}${(c.up||c.done)&&c.word?" word":""}" data-mc="${i}" aria-label="${c.up||c.done?c.say:"?"}">${c.up||c.done?c.face:""}</button>`).join("")}</div>
`;
}
function memFlip(i){
  const c=game.cards[i]; if(game.busy||c.up||c.done) return;
  c.up=true; game.open.push(i); speak(c.say); const _m=document.querySelector(".mem"); if(_m){_m.outerHTML=memView().split("`;")[0];} else render(); setScore(game.found);
  if(game.open.length===2){
    const [x,y]=game.open.map(j=>game.cards[j]);
    game.busy=true;
    timers.push(setTimeout(()=>{
      if(x.k===y.k){x.done=y.done=true;game.found++;addStar();sfx("star");speak(t("ok"));}
      x.up=y.up=false; game.open=[]; game.busy=false; const _m2=document.querySelector(".mem"); if(_m2) _m2.outerHTML=memView(); setScore(game.found);
      if(game.found===game.cards.length/2){levelWin("mem");}
    },x.k===y.k?500:1000));
  }
}
function setScore(n){const s=document.getElementById("score");if(!s)return;if(screen==="mem"&&game.cards)s.textContent=`${n}/${game.cards.length/2}`;else s.textContent=`${n} ${t("pts")}`;}

/* ---------- snake ---------- */
function snakeInit(){
  const N=A().grid, cv=document.getElementById("cv"), ctx=cv.getContext("2d"), cs=cv.width/N, m=Math.floor(N/2);
  const skip=age==="c"?[2,5,10][rnd(0,2)]:0;
  const L=lvl("snake"), goal={a:4,b:6,c:8}[age||"b"]+(L-1)*2, speed=Math.max(170,Math.round(A().speed*Math.pow(0.96,L-1)));
  const nRocks=age==="a"?Math.max(0,Math.min(L-3,4)):Math.max(0,Math.min(L-2,8));
  game={N,cv,ctx,cs,body:[[m,m],[m-1,m],[m-2,m]],dir:[1,0],next:[1,0],food:null,decoy:null,fruit:"🍎",score:0,running:false,loop:null,skip,val:skip,goal,speed,rocks:[]};
  for(let r=0;r<nRocks;r++){let p;do{p=[rnd(1,N-2),rnd(1,N-2)];}while(Math.abs(p[1]-m)<2||game.rocks.some(q=>q[0]===p[0]&&q[1]===p[1]));game.rocks.push(p);}
  const sc0=document.getElementById("score"); if(sc0) sc0.textContent=`🍎 0/${goal}`;
  const hint=document.getElementById("shint"); if(hint) hint.textContent=skip?t("skip").replaceAll("{x}",skip).replace("{y}",skip):"";
  placeFood(); drawSnake();
  const wrap=document.getElementById("swrap"); let sx=0,sy=0,down=false,swiped=false,lastTouch=0;
  const begin=(x,y)=>{down=true;swiped=false;sx=x;sy=y;};
  const move=(x,y)=>{if(!down||swiped)return;const dx=x-sx,dy=y-sy;
    if(Math.max(Math.abs(dx),Math.abs(dy))>=22){swiped=true;turn(Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)]);}};
  const end=(x,y)=>{if(!down)return;down=false;if(swiped)return;const g=game;if(!g.cv)return;
    if(!g.running){turn(g.dir);return;}
    const r=cv.getBoundingClientRect(),cell=r.width/g.N,hx=r.left+(g.body[0][0]+.5)*cell,hy=r.top+(g.body[0][1]+.5)*cell,dx=x-hx,dy=y-hy;
    if(Math.max(Math.abs(dx),Math.abs(dy))<cell*.6)return;
    let d=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];
    if(d[0]===-g.dir[0]&&d[1]===-g.dir[1]) d=Math.abs(dx)>Math.abs(dy)?[0,Math.sign(dy)||1]:[Math.sign(dx)||1,0];
    turn(d);};
  // touch first (works in app webviews), mouse/pen as fallback; never both for the same tap
  wrap.addEventListener("touchstart",e=>{lastTouch=Date.now();const p=pt(e,"touches");if(!p)return;begin(p.clientX,p.clientY);if(e.cancelable)e.preventDefault();},{passive:false});
  wrap.addEventListener("touchmove",e=>{const p=pt(e,"touches");if(!p)return;move(p.clientX,p.clientY);if(e.cancelable)e.preventDefault();},{passive:false});
  wrap.addEventListener("touchend",e=>{const p=pt(e,"changedTouches");if(!p){down=false;return;}end(p.clientX,p.clientY);if(e.cancelable)e.preventDefault();},{passive:false});
  wrap.addEventListener("touchcancel",()=>{down=false;});
  wrap.addEventListener("pointerdown",e=>{if(e.pointerType==="touch"||Date.now()-lastTouch<800)return;begin(e.clientX,e.clientY);});
  wrap.addEventListener("pointermove",e=>{if(e.pointerType==="touch"||Date.now()-lastTouch<800)return;move(e.clientX,e.clientY);});
  wrap.addEventListener("pointerup",e=>{if(e.pointerType==="touch"||Date.now()-lastTouch<800)return;end(e.clientX,e.clientY);});
}
function freeCell(){const g=game;let p;do{p=[rnd(0,g.N-1),rnd(0,g.N-1)];}while(g.body.some(b=>b[0]===p[0]&&b[1]===p[1])||(g.food&&p[0]===g.food[0]&&p[1]===g.food[1])||(g.rocks||[]).some(b=>b[0]===p[0]&&b[1]===p[1]));return p;}
function placeFood(){const g=game;g.food=null;g.food=freeCell();g.fruit=FRUITS[rnd(0,FRUITS.length-1)];
  if(g.skip){g.decoy=freeCell();let d;do{d=g.val+rnd(-2,2)*(rnd(0,1)?1:g.skip);}while(d===g.val||d<1);g.decoyVal=d;}}
function turn(d){
  const g=game; if(!g.cv) return;
  if(d[0]===-g.dir[0]&&d[1]===-g.dir[1]&&g.running) return;
  g.next=d;
  if(!g.running){g.running=true;document.getElementById("sover").hidden=true;g.loop=setInterval(step,g.speed||A().speed);timers.push(g.loop);}
}
function step(){
  const g=game; if(!g.cv) return; g.dir=g.next;
  let h=[g.body[0][0]+g.dir[0],g.body[0][1]+g.dir[1]];
  if(A().wrap){h=[(h[0]+g.N)%g.N,(h[1]+g.N)%g.N];}
  else if(h[0]<0||h[1]<0||h[0]>=g.N||h[1]>=g.N) return snakeOver();
  if(g.body.some(b=>b[0]===h[0]&&b[1]===h[1])||(g.rocks||[]).some(b=>b[0]===h[0]&&b[1]===h[1])) return snakeOver();
  g.body.unshift(h);
  if(h[0]===g.food[0]&&h[1]===g.food[1]){g.score++;const sc=document.getElementById("score");if(sc)sc.textContent=`🍎 ${g.score}/${g.goal}`;sfx("pop");
    if(g.skip){speak(g.val<=100?nw(g.val):String(g.val));g.val+=g.skip;const hint=document.getElementById("shint");if(hint)hint.textContent=t("skip").replaceAll("{x}",g.skip).replace("{y}",g.val);}
    else speak(nw(Math.min(g.score,100)));
    if(g.score>=g.goal){placeFood();drawSnake();clearInterval(g.loop);g.running=false;g.won=true;levelWin("snake");return;}
    placeFood();}
  else {g.body.pop();
    if(g.skip&&g.decoy&&h[0]===g.decoy[0]&&h[1]===g.decoy[1]){speak(t("notThat"));g.decoy=freeCell();}}
  drawSnake();
}
function snakeOver(){
  const g=game; clearInterval(g.loop); g.running=false;
  const o=document.getElementById("sover"); o.hidden=false;
  o.innerHTML=`<b>🍎 ${g.score}/${g.goal}</b><span>${t("over")}</span><button class="go" data-again="snake">🔄 ${t("tryLv")}</button>`;
  speak(t("over"));
}
function drawSnake(){
  const g=game,c=g.ctx,s=g.cs; c.clearRect(0,0,g.cv.width,g.cv.height);
  for(let y=0;y<g.N;y++)for(let x=0;x<g.N;x++){if((x+y)%2){c.fillStyle="#DDF1E1";c.fillRect(x*s,y*s,s,s);}}
  c.textAlign="center";c.textBaseline="middle";
  if(g.skip){const tag=(p,v,col)=>{c.fillStyle=col;c.beginPath();c.arc(p[0]*s+s/2,p[1]*s+s/2,s*.48,0,7);c.fill();c.fillStyle="#fff";c.font=`800 ${v>99?s*.38:s*.5}px "Baloo 2",sans-serif`;c.fillText(v,p[0]*s+s/2,p[1]*s+s/2+2);};
    tag(g.food,g.val,"#FF6B5B");tag(g.decoy,g.decoyVal,"#FF6B5B");}
  else {c.font=`${s*.85}px serif`;c.fillText(g.fruit,g.food[0]*s+s/2,g.food[1]*s+s/2+2);}
  (g.rocks||[]).forEach(b=>{c.fillStyle="#8A8FA3";c.beginPath();c.roundRect?c.roundRect(b[0]*s+2,b[1]*s+2,s-4,s-4,s*.25):c.rect(b[0]*s+2,b[1]*s+2,s-4,s-4);c.fill();c.fillStyle="#B9BDCB";c.beginPath();c.arc(b[0]*s+s*.38,b[1]*s+s*.38,s*.12,0,7);c.fill();});
  g.body.forEach((b,i)=>{c.fillStyle=i===0?"#1C8A57":"#2DBE7E";const r=s*.3,x=b[0]*s+1,y=b[1]*s+1,w=s-2;
    c.beginPath();c.roundRect?c.roundRect(x,y,w,w,r):c.rect(x,y,w,w);c.fill();});
  const hd=g.body[0];c.fillStyle="#fff";c.beginPath();c.arc(hd[0]*s+s*.35,hd[1]*s+s*.38,s*.12,0,7);c.arc(hd[0]*s+s*.65,hd[1]*s+s*.38,s*.12,0,7);c.fill();
}

/* ---------- balloons ---------- */
function balloonInit(){
  const sky=document.getElementById("sky"); const L=lvl("balloon");
  const goal={a:8,b:10,c:10}[age||"b"]+(L-1)*2, secs={a:45,b:35,c:30}[age||"b"];
  game={sky,score:0,mode:A().bal,goal,left:secs,L}; newBalTarget();
  const tick=()=>{const g=game;if(!g.sky||g.done)return;const sc=document.getElementById("score");if(sc)sc.textContent=`⏱ ${g.left} · 🎈 ${g.score}/${g.goal}`;
    if(g.left<=0){g.done=true;stopTimersOnly();levelFail("balloon",t("timeUp"));return;}g.left--;};
  tick(); timers.push(setInterval(tick,1000));
  const spawn=()=>{
    if(!document.body.contains(sky)) return;
    const c=COLORS[rnd(0,COLORS.length-1)], b=document.createElement("button");
    b.className="bal"; b.style.background=c[0]; b.style.left=rnd(2,80)+"%";
    const g=game; let n=0, ci=COLORS.indexOf(c);
    if(g.mode==="free"){n=rnd(0,1)?rnd(1,10):0;}
    if(g.mode==="color"&&rnd(0,2)===0){const tc=COLORS[g.target];b.style.background=tc[0];ci=g.target;}
    if(g.mode==="bigger"){n=rnd(1,100);}
    b.textContent=n||""; b.dataset.say=n?nw(n):COLORS[ci][WI[lang]];
    b.dataset.good=g.mode==="free"?"1":g.mode==="color"?(ci===g.target?"1":"0"):(n>g.target?"1":"0");
    b.setAttribute("aria-label",b.dataset.say);
    if(game.done) return;
    const sp=Math.pow(0.93,game.L-1), dur=Math.max(2600,rnd(age==="a"?7000:5000,age==="a"?10000:8000)*sp);
    b.animate([{transform:"translateY(0)"},{transform:`translateY(-${sky.clientHeight+220}px)`}],{duration:dur,easing:"linear"}).onfinish=()=>b.remove();
    b.addEventListener("pointerdown",ev=>{ev.preventDefault();pop(b);});
    sky.appendChild(b);
  };
  spawn(); timers.push(setInterval(spawn,Math.max(380,(age==="a"?1100:800)*Math.pow(0.92,L-1))));
}
function newBalTarget(){
  const g=game,h=document.getElementById("bhint");
  if(g.mode==="color"){g.target=rnd(0,COLORS.length-1);h.textContent=t("balC").replace("{x}",COLORS[g.target][WI[lang]].toLowerCase());}
  else if(g.mode==="bigger"){g.target=rnd(3,7)*10;h.textContent=t("balB").replace("{x}",g.target);}
  else h.textContent=t("balloonS");
  speak(h.textContent);
}
function pop(b){
  const g=game, r=b.getBoundingClientRect(), sr=g.sky.getBoundingClientRect();
  const p=document.createElement("span"); p.className="puff"; p.textContent="✨"; p.style.left=(r.left-sr.left+18)+"px"; p.style.top=(r.top-sr.top+20)+"px";
  g.sky.appendChild(p); setTimeout(()=>p.remove(),500);
  if(b.dataset.good!=="1"){speak(t("notThat"));b.style.opacity=".35";b.disabled=true;p.textContent="✖️";return;}
  if(g.done) return;
  sfx("pop"); speak(b.dataset.say); b.remove(); g.score++;
  const sc=document.getElementById("score"); if(sc) sc.textContent=`⏱ ${g.left} · 🎈 ${g.score}/${g.goal}`;
  if(g.score>=g.goal){g.done=true;stopTimersOnly();document.querySelectorAll(".bal").forEach(x=>x.remove());levelWin("balloon");return;}
  if(g.mode!=="free"&&g.score%8===0) newBalTarget();
}

/* ---------- drawing ---------- */
function drawInit(){
  const cv=document.getElementById("dcv"),c=cv.getContext("2d");
  game={cv,c,col:COLORS[1][0],w:14,down:false,last:null};
  c.lineCap="round";c.lineJoin="round";
  const pos=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)*cv.width/r.width,(e.clientY-r.top)*cv.height/r.height];};
  cv.addEventListener("pointerdown",e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);game.down=true;game.last=pos(e);dot(game.last);});
  cv.addEventListener("pointermove",e=>{if(!game.down)return;const p=pos(e);c.strokeStyle=game.col;c.lineWidth=game.w;c.beginPath();c.moveTo(...game.last);c.lineTo(...p);c.stroke();game.last=p;});
  const up=()=>{game.down=false;};cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  function dot(p){c.fillStyle=game.col;c.beginPath();c.arc(p[0],p[1],game.w/2,0,7);c.fill();}
}
/* ---------- puzzle ---------- */
const SCENES=[["#BDE3FF","#7BD389",["☀️",.78,.2,70],["🏠",.5,.6,120],["🌳",.18,.6,100],["🌺",.82,.82,50]],
 ["#9AD7F5","#4AA3DF",["🐟",.3,.4,80],["🐠",.7,.65,80],["🐙",.5,.8,70],["⭐",.8,.2,50]],
 ["#1F2B5B","#2E3E7A",["🌙",.75,.2,80],["⭐",.2,.2,40],["🚀",.45,.55,110],["🪐",.2,.8,70]],
 ["#FFE3B3","#F2C14E",["🦁",.5,.55,120],["🌴",.15,.45,100],["☀️",.8,.18,60],["🦒",.85,.6,90]]];
function puzzleInit(){
  const L=lvl("puzzle"), n={a:L<3?2:L<6?3:4,b:L<4?3:L<8?4:5,c:L<4?4:5}[age||"b"], S=360, cv=document.createElement("canvas"); cv.width=cv.height=S; const c=cv.getContext("2d");
  const sc=SCENES[rnd(0,SCENES.length-1)];
  const g=c.createLinearGradient(0,0,0,S);g.addColorStop(0,sc[0]);g.addColorStop(1,sc[1]);c.fillStyle=g;c.fillRect(0,0,S,S);
  c.textAlign="center";c.textBaseline="middle";
  sc.slice(2).forEach(([e,x,y,z])=>{c.font=`${z}px serif`;c.fillText(e,x*S,y*S);});
  c.strokeStyle="rgba(255,255,255,.6)";c.lineWidth=6;c.strokeRect(3,3,S-6,S-6);
  const url=cv.toDataURL();
  let order; do{order=shuffle([...Array(n*n).keys()]);}while(order.every((v,i)=>v===i));
  game={n,url,order,sel:-1,moves:0};
  document.getElementById("pzprev").src=url; drawPuzzle();
}
function drawPuzzle(){
  const g=game,el=document.getElementById("pz"); if(!el) return;
  el.style.gridTemplateColumns=`repeat(${g.n},minmax(0,1fr))`;
  const solved=g.order.every((v,i)=>v===i);
  el.innerHTML=g.order.map((v,i)=>{const x=v%g.n,y=Math.floor(v/g.n);
    return `<button class="pc${g.sel===i?" sel":""}" data-pc="${i}" style="background-image:url(${g.url});background-size:${g.n*100}% ${g.n*100}%;background-position:${g.n>1?x*100/(g.n-1):0}% ${g.n>1?y*100/(g.n-1):0}%" aria-label="${i+1}"></button>`;}).join("");
  el.classList.toggle("done",solved);
  setScore2(`${g.moves} ${t("moves")}`);
  if(solved&&!g.won){g.won=true;timers.push(setTimeout(()=>levelWin("puzzle"),300));}
}
function setScore2(x){const s=document.getElementById("score");if(s)s.textContent=x;}
function pcTap(i){const g=game;if(g.won)return;
  if(g.sel<0){g.sel=i;sfx("pop");}
  else if(g.sel===i){g.sel=-1;}
  else{[g.order[g.sel],g.order[i]]=[g.order[i],g.order[g.sel]];g.sel=-1;g.moves++;sfx("pop");}
  drawPuzzle();}
/* ---------- music ---------- */
function note(i,dur=.5){
  const _c=getCtx(); if(!_c) return;
  try{if(_c.state==="suspended")_c.resume();const now=_c.currentTime;
    [1,2].forEach((mult,k)=>{const o=actx.createOscillator(),gn=actx.createGain();o.type=k?"sine":"triangle";o.frequency.value=NOTES[i]*mult;
      gn.gain.setValueAtTime(.0001,now);gn.gain.exponentialRampToValueAtTime(k?.05:.25,now+.02);gn.gain.exponentialRampToValueAtTime(.0001,now+dur);
      o.connect(gn).connect(actx.destination);o.start(now);o.stop(now+dur+.05);});
  }catch(e){}
  const k=document.querySelector(`[data-note="${i}"]`); if(k){k.classList.add("hit");setTimeout(()=>k.classList.remove("hit"),180);}
}
function playSong(){let t0=0;SONG.forEach(i=>{if(i>=0)timers.push(setTimeout(()=>note(i,.45),t0));t0+=i<0?250:420;});}

/* ---------- daily challenge ---------- */
const todayKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
let DAILY={}; try{DAILY=JSON.parse(localStorage.getItem("tk-daily")||"{}")||{};}catch(e){DAILY={};}
let daily={types:[],i:0};
const qScr=()=>screen==="daily"?(daily.types[daily.i]||"count"):screen;
const DAILYPOOL={a:["count","add","colors","shapes","animals","find","body"],b:["count","add","sub","cmp","colors","shapes","animals","find","days","clock"],c:["add","sub","mul","cmp","clock","days","animals","find","count"]};
const dailyDoneToday=()=>DAILY.last===todayKey();
function streakNow(){if(!DAILY.last)return 0;const y=new Date();y.setDate(y.getDate()-1);return (DAILY.last===todayKey()||DAILY.last===todayKey(y))?(DAILY.streak||0):0;}
function dailyStart(){daily={types:shuffle(DAILYPOOL[age||"b"]).slice(0,3),i:0};newQ();}
function dailyNext(){
  daily.i++;
  if(daily.i<3){newQ();render();speak(q.say);return;}
  const y=new Date();y.setDate(y.getDate()-1);
  if(!dailyDoneToday()){DAILY.streak=(DAILY.last===todayKey(y))?(DAILY.streak||0)+1:1;DAILY.last=todayKey();try{localStorage.setItem(K("daily"),JSON.stringify(DAILY));}catch(e){}}
  addStar(3);sfx("ok");confetti(180);cheer(t("dailyDone"));speak(t("dailyDone"));
  showLvBox(`<b>🔥 ${t("dailyDone")}</b><span>⭐ +3 · 🔥 ${DAILY.streak} ${t("streakL")}</span><p class="hint" style="margin:0">${t("comeBack")}</p><button class="go alt" data-go="home">← ${t("back")}</button>`);
}
/* ---------- usage stats (kept only on this device) ---------- */
let STATS={}; try{STATS=JSON.parse(localStorage.getItem("tk-stats")||"{}")||{};}catch(e){STATS={};}
STATS.d=STATS.d||{}; STATS.limit=STATS.limit||0;
function day(k=todayKey()){return STATS.d[k]=STATS.d[k]||{m:0,a:{},ok:0};}
function saveStats(){try{const keys=Object.keys(STATS.d).sort();while(keys.length>60)delete STATS.d[keys.shift()];localStorage.setItem(K("stats"),JSON.stringify(STATS));}catch(e){}}
function statAct(k){const d=day();d.a[k]=(d.a[k]||0)+1;saveStats();}
function statOk(){day().ok++;saveStats();}
const NOTIME=["lang","age","parent","gate","limit","who","paywall"];
setInterval(()=>{if(document.visibilityState==="hidden"||NOTIME.includes(screen))return;const d=day();d.m=Math.round((d.m+0.5)*10)/10;saveStats();
  if(STATS.limit&&d.m>=STATS.limit&&screen!=="home"){stopAll();screen="limit";render();}},30000);
const overLimit=()=>STATS.limit&&day().m>=STATS.limit;
function last7(){const out=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const k=todayKey(d);out.push([d,STATS.d[k]||{m:0,a:{},ok:0}]);}return out;}
/* ---------- parent gate + parent area ---------- */
let gate={a:0,b:0,err:false,next:"parent"};
function gateNew(next){gate={a:rnd(21,59),b:rnd(12,39),err:false,next:next||"parent"};}
function parentView(){
  const w=last7(), wm=w.reduce((s,[,d])=>s+d.m,0), ok=w.reduce((s,[,d])=>s+(d.ok||0),0), mx=Math.max(10,...w.map(([,d])=>d.m));
  const acts={};w.forEach(([,d])=>Object.entries(d.a||{}).forEach(([k,v])=>acts[k]=(acts[k]||0)+v));
  const top=Object.entries(acts).sort((x,y)=>y[1]-x[1]).slice(0,5);
  const lims=[0,15,30,45,60];
  return `<h1>👪 ${t("parent")}</h1>
    <div class="pstats">
      <div><small>${t("todayMin")}</small><b>${Math.round(day().m)} ${t("minU")}</b></div>
      <div><small>${t("weekMin")}</small><b>${Math.round(wm)} ${t("minU")}</b></div>
      <div><small>${t("goodAns")}</small><b>${ok}</b></div>
      <div><small>🔥 ${t("streakL")}</small><b>${streakNow()}</b></div>
    </div>
    <h3>${t("timeChart")}</h3>
    <div class="pchart">${w.map(([d,v])=>`<div class="pcol"><span class="pv">${Math.round(v.m)}</span><i style="height:${Math.max(3,v.m/mx*100)}%"></i><small>${DAYS[lang][(d.getDay()+6)%7].slice(0,3)}</small></div>`).join("")}</div>
    <h3>${t("topAct")}</h3>
    ${top.length?`<ol class="ptop">${top.map(([k,v])=>`<li><span>${(GAMEINFO[k]||["•"])[0]} ${t(k)||k}</span><b>${v}×</b></li>`).join("")}</ol>`:`<p class="hint">${t("nothingYet")}</p>`}
    <h3>${t("limitL")}</h3>
    <div class="cats">${lims.map(m=>`<button class="cat" data-limit="${m}" aria-pressed="${STATS.limit===m}">${m?m+" "+t("minU"):t("noLimit")}</button>`).join("")}</div>
    <h3>⭐ ${t("planL")}: ${planLine()}</h3>
    ${SHOP.enabled&&!codeOk(PREM.code)?`<button class="go alt" data-go="paywall">⭐ ${t("unlockAll")}</button>`:""}
    <h3>🖨️ ${t("worksheetsL")}</h3>
    <div class="cats">${Object.keys(LANGS).map(k=>`<a class="cat" href="${WORKSHEETS[k]}" target="_blank" rel="noopener">📄 ${LANGS[k].name}</a>`).join("")}</div>
    ${kidsView()}`;
}
function gateView(){return `<h2>🔒 ${t("gateQ").replace("{a}",gate.a).replace("{b}",gate.b)}</h2>
  <div class="gaterow"><input id="pgate" type="number" inputmode="numeric" autocomplete="off" aria-label="answer"><button class="go" data-pgate="1">${t("enter")}</button></div>
  ${gate.err?`<p class="fb no">${t("wrongGate")}</p>`:""}`;}
function limitView(){return `<div class="hello" style="flex-direction:column;text-align:center">${tiki("happy")}<h2>${t("limitHit")}</h2><p class="hint">${t("seeTomorrow")}</p></div>
  <button class="go alt" data-go="home">← ${t("back")}</button><button class="go alt" data-parentgo="1">👪 ${t("parent")}</button>`;}
/* ---------- child profiles (each child keeps its own stars, levels, challenge and stats) ---------- */
let PROFILES=[], CURP=null;
const esc=x=>String(x||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function K(name){return (!CURP||CURP.id==="p0")?"tk-"+name:"tk-"+CURP.id+"-"+name;}
function ls(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsj(k){try{return JSON.parse(localStorage.getItem(k)||"{}")||{};}catch(e){return {};}}
function saveProfiles(){try{localStorage.setItem("tk-profiles",JSON.stringify(PROFILES));localStorage.setItem("tk-cur",CURP?CURP.id:"p0");}catch(e){}}
function loadProfile(){
  age=ls(K("age"))||(CURP&&CURP.age)||null; stars=+ls(K("stars"))||0;
  LV=lsj(K("lv")); DAILY=lsj(K("daily")); STATS=lsj(K("stats")); STATS.d=STATS.d||{}; STATS.limit=STATS.limit||0;
}
function initProfiles(){
  try{PROFILES=JSON.parse(localStorage.getItem("tk-profiles")||"[]")||[];}catch(e){PROFILES=[];}
  if(!PROFILES.length) PROFILES=[{id:"p0",name:"",av:AVATARS[0],age:age||null}];
  const cid=ls("tk-cur"); CURP=PROFILES.find(p=>p.id===cid)||PROFILES[0];
  loadProfile();
  if(lang&&PROFILES.length>1) screen="who"; else if(lang&&age) screen="home"; else if(lang) screen="age";
}
function switchProfile(id){const p=PROFILES.find(x=>x.id===id);if(!p)return;CURP=p;saveProfiles();loadProfile();screen=age?"home":"age";}
let newKid={name:"",av:AVATARS[1],age:"b"};
function kidsView(){
  return `<h3>👧🏾 ${t("children")}</h3><div class="kidlist">${PROFILES.map(p=>`<div class="kidrow"><span class="av">${p.av}</span><b>${esc(p.name)||"—"}</b><small>${AGES[(p.id===CURP.id?age:p.age)||"b"].label}</small>${PROFILES.length>1?`<button class="mini" data-delprof="${p.id}">${t("removeP")}</button>`:""}</div>`).join("")}</div>
    <h3>＋ ${t("addChild")}</h3>
    <input id="kidname" class="txt" maxlength="20" placeholder="${t("childName")}" value="${esc(newKid.name)}">
    <p class="hint" style="margin:0">${t("pickAv")}</p><div class="avs">${AVATARS.map(a=>`<button class="avb" data-av="${a}" aria-pressed="${newKid.av===a}">${a}</button>`).join("")}</div>
    <p class="hint" style="margin:0">${t("ageGroup")}</p><div class="cats">${Object.entries(AGES).map(([k,v])=>`<button class="cat" data-kage="${k}" aria-pressed="${newKid.age===k}">${v.e} ${v.label}</button>`).join("")}</div>
    <button class="go" data-addprof="1">${t("saveP")}</button>`;
}
/* ---------- letter tracing ---------- */
function traceInit(){
  const g=document.getElementById("trg"), ink=document.getElementById("tri"); if(!g||!ink) return;
  const L=ALPHA[lang], letter=L[trIdx%L.length], S=360, gc=g.getContext("2d"), ic=ink.getContext("2d");
  const fs=letter.length>1?190:270;
  const drawLetter=(ctx,fill,stroke)=>{ctx.font=`800 ${fs}px "Baloo 2","Arial Rounded MT Bold",Arial,sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";
    if(fill){ctx.fillStyle=fill;ctx.fillText(letter,S/2,S/2+12);} if(stroke){ctx.setLineDash([10,10]);ctx.lineWidth=4;ctx.strokeStyle=stroke;ctx.strokeText(letter,S/2,S/2+12);ctx.setLineDash([]);}};
  gc.clearRect(0,0,S,S); drawLetter(gc,"#EFE6D3","#C9B99A");
  const m=document.createElement("canvas"); m.width=m.height=S; const mc=m.getContext("2d"); drawLetter(mc,"#000");
  const md=mc.getImageData(0,0,S,S).data; const target=[]; for(let y=0;y<S;y+=6)for(let x=0;x<S;x+=6){if(md[(y*S+x)*4+3]>100)target.push([x,y]);}
  ic.clearRect(0,0,S,S); ic.lineCap="round"; ic.lineJoin="round"; ic.lineWidth=30; ic.strokeStyle="#2F80ED";
  game={tr:true,letter,target,ic,S,done:false,last:null};
  speak(letter);
  const pos=(x,y)=>{const r=ink.getBoundingClientRect();return [(x-r.left)*S/r.width,(y-r.top)*S/r.height];};
  let down=false,lastTouch=0;
  const start=(x,y)=>{if(game.done)return;down=true;game.last=pos(x,y);ic.beginPath();ic.arc(game.last[0],game.last[1],15,0,7);ic.fillStyle="#2F80ED";ic.fill();};
  const mv=(x,y)=>{if(!down)return;const p=pos(x,y);ic.beginPath();ic.moveTo(...game.last);ic.lineTo(...p);ic.stroke();game.last=p;};
  const end=()=>{if(!down)return;down=false;traceCheck();};
  const w=document.getElementById("trwrap");
  w.addEventListener("touchstart",e=>{lastTouch=Date.now();const p=pt(e,"touches");if(!p)return;start(p.clientX,p.clientY);if(e.cancelable)e.preventDefault();},{passive:false});
  w.addEventListener("touchmove",e=>{const p=pt(e,"touches");if(!p)return;mv(p.clientX,p.clientY);if(e.cancelable)e.preventDefault();},{passive:false});
  w.addEventListener("touchend",e=>{end();if(e.cancelable)e.preventDefault();},{passive:false});
  w.addEventListener("pointerdown",e=>{if(e.pointerType==="touch"||Date.now()-lastTouch<800)return;start(e.clientX,e.clientY);});
  w.addEventListener("pointermove",e=>{if(e.pointerType==="touch"||Date.now()-lastTouch<800)return;mv(e.clientX,e.clientY);});
  w.addEventListener("pointerup",e=>{if(e.pointerType==="touch"||Date.now()-lastTouch<800)return;end();});
}
function traceCheck(){
  const g=game; if(!g.tr||g.done) return; const d=g.ic.getImageData(0,0,g.S,g.S).data;
  let hit=0; g.target.forEach(([x,y])=>{if(d[(y*g.S+x)*4+3]>100)hit++;});
  let inkAll=0,inkOut=0; const mset=new Set(g.target.map(([x,y])=>x+","+y));
  for(let y=0;y<g.S;y+=6)for(let x=0;x<g.S;x+=6){if(d[(y*g.S+x)*4+3]>100){inkAll++;if(!mset.has(x+","+y))inkOut++;}}
  const cov=hit/Math.max(1,g.target.length), out=inkOut/Math.max(1,inkAll);
  const fbx=document.getElementById("trfb");
  if(cov>=0.6&&out<=0.55){g.done=true;fbx.className="fb ok";fbx.textContent="⭐ "+t("ok");addStar();statOk();sfx("ok");confetti();cheer(t("ok"));speak(g.letter+". "+t("ok"));
    timers.push(setTimeout(()=>{trIdx++;render();},1600));}
  else if(cov>=0.25){fbx.className="fb";fbx.textContent=t("traceMore");}
}
/* ---------- Free + Premium ---------- */
let PREM={}; try{PREM=JSON.parse(localStorage.getItem("tk-prem")||"{}")||{};}catch(e){PREM={};}
const savePrem=()=>{try{localStorage.setItem("tk-prem",JSON.stringify(PREM));}catch(e){}};
const DAYMS=86400000;
function codeOk(code){const m=/^MDL-([A-Z0-9]{4})-([A-Z0-9]{4})$/.exec(String(code||"").trim().toUpperCase());if(!m)return false;
  let h=2166136261;for(const ch of "mondiloo509:"+m[1]){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}
  const A="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let x=h,out="";for(let i=0;i<4;i++){out+=A[x%32];x=Math.floor(x/32);}return out===m[2];}
const trialDaysLeft=()=>PREM.trial?Math.max(0,Math.ceil((PREM.trial+SHOP.trialDays*DAYMS-Date.now())/DAYMS)):0;
const isPremium=()=>!SHOP.enabled||codeOk(PREM.code)||trialDaysLeft()>0;
const isLocked=k=>!!(SHOP.enabled&&GAMEINFO[k]&&!FREE.includes(k)&&!isPremium());
let payErr=false, wantedK=null;
function paywallView(){
  return `<div class="hello" style="flex-direction:column;text-align:center">${tiki("happy")}<h1>⭐ ${t("unlockAll")}</h1><p class="hint">${t("premBenefits")}</p></div>
   <div class="prices"><div><b>${SHOP.priceMonth}</b><small>${t("perMonth")}</small></div><div class="best"><b>${SHOP.priceYear}</b><small>${t("perYear")}</small></div></div>
   ${PREM.trialUsed?`<p class="hint" style="text-align:center">${t("trialUsed")}</p>`:`<button class="go" data-trial="1">🎁 ${t("tryFree")}</button>`}
   ${SHOP.payUrl?`<a class="go linkbtn" href="${SHOP.payUrl}" target="_blank" rel="noopener">💳 ${t("buy")}</a>`:`<p class="hint" style="text-align:center">${t("payLater")}${SHOP.contact?" "+esc(SHOP.contact):""}</p>`}
   <h3>🔑 ${t("haveCode")}</h3>
   <div class="gaterow"><input id="pcode" class="txt" autocomplete="off" autocapitalize="characters" placeholder="MDL-XXXX-XXXX"><button class="go" data-code="1">${t("activate")}</button></div>
   ${payErr?`<p class="fb no">${t("badCode")}</p>`:""}`;
}
function planLine(){return codeOk(PREM.code)?t("premOn"):trialDaysLeft()>0?t("trialLeft").replace("{n}",trialDaysLeft()):t("freePlan");}
/* ---------- level win / fail ---------- */
function levelWin(g){ statOk();
  const n=lvl(g); unlockNext(g); addStar(2); sfx("ok"); confetti(160); cheer(t("levelDone").replace("{n}",n)); speak(t("levelDone").replace("{n}",n));
  showLvBox(`<b>🏆 ${t("levelDone").replace("{n}",n)}</b><span>⭐ +2</span><button class="go" data-nextlv="${g}">${t("nextLevel")} ▶</button><button class="go alt" data-again="${g}">${t("again")}</button><button class="go alt" data-go="home">← ${t("back")}</button>`);
}
function levelFail(g,msg){ sfx("no"); speak(msg);
  showLvBox(`<b>${msg}</b><button class="go" data-again="${g}">🔄 ${t("tryLv")}</button><button class="go alt" data-go="home">← ${t("back")}</button>`);}
function showLvBox(html){document.querySelectorAll(".lvbox").forEach(x=>x.remove());const d=document.createElement("div");d.className="lvbox";d.innerHTML=`<div class="lvin">${html}</div>`;(document.querySelector(".card")||document.body).appendChild(d);}
/* ---------- color sort ---------- */
const SORTCOL=["#E53935","#1E63D6","#FDD835","#2E9E4F","#FB8C00","#7E3FD0","#F06AA8","#5D4037"];
function sortParams(){const L=lvl("sort"),b={a:2,b:3,c:4}[age||"b"],mx={a:5,b:7,c:8}[age||"b"];return {k:Math.min(mx,b+Math.floor((L-1)/2)),cap:4};}
const sortDone=tb=>tb.every(x=>x.length===0||(x.length===4&&x.every(v=>v===x[0])));
function canPour(tb,i,j,cap){if(i===j)return false;const a=tb[i],b=tb[j];if(!a.length||b.length>=cap)return false;const top=a[a.length-1];return !b.length||b[b.length-1]===top;}
function pour(tb,i,j,cap){const a=tb[i],b=tb[j],top=a[a.length-1];let n=0;while(a.length&&a[a.length-1]===top&&b.length<cap){b.push(a.pop());n++;}return n;}
function solvable(tb0,cap){const seen=new Set();let nodes=0;
  const key=tb=>tb.map(x=>x.join(",")).sort().join("|");
  const dfs=tb=>{if(sortDone(tb))return true;if(++nodes>40000)return false;const k=key(tb);if(seen.has(k))return false;seen.add(k);
    for(let i=0;i<tb.length;i++)for(let j=0;j<tb.length;j++){if(!canPour(tb,i,j,cap))continue;const a=tb[i];
      if(a.every(v=>v===a[0])&&(tb[j].length===0||a.length===cap))continue;
      const nt=tb.map(x=>x.slice());pour(nt,i,j,cap);if(dfs(nt))return true;}return false;};
  return dfs(tb0.map(x=>x.slice()));}
function sortInit(){
  const {k,cap}=sortParams(); let tb,tries=0;
  do{const seg=shuffle([].concat(...Array.from({length:k},(_,c)=>Array(cap).fill(c))));tb=Array.from({length:k},(_,i)=>seg.slice(i*cap,i*cap+cap));tb.push([],[]);tries++;}
  while((sortDone(tb)||tb.some(x=>x.length===cap&&x.every(v=>v===x[0]))||!solvable(tb,cap))&&tries<40);
  game={tb,start:tb.map(x=>x.slice()),cap,sel:-1,hist:[],moves:0,won:false}; drawSort();
}
function drawSort(){
  const g=game,el=document.getElementById("sortbox"); if(!el)return;
  const per=g.tb.length>5?Math.ceil(g.tb.length/2):g.tb.length;
  el.style.gridTemplateColumns=`repeat(${per},minmax(0,1fr))`;
  el.innerHTML=g.tb.map((x,i)=>`<button class="tube${g.sel===i?" sel":""}${x.length===g.cap&&x.every(v=>v===x[0])?" full":""}" data-tube="${i}" aria-label="${i+1}">${x.map(v=>`<i style="background:${SORTCOL[v]}"></i>`).join("")}</button>`).join("");
  setScore2(`${g.moves} ${t("moves")}`);
  const u=document.getElementById("sundo"); if(u) u.disabled=!g.hist.length;
}
function tubeTap(i){const g=game;if(g.won)return;
  if(g.sel<0){if(!g.tb[i].length)return;g.sel=i;sfx("pop");const v=g.tb[i][g.tb[i].length-1];speak(COLORS[v][WI[lang]]);drawSort();return;}
  if(g.sel===i){g.sel=-1;drawSort();return;}
  if(canPour(g.tb,g.sel,i,g.cap)){g.hist.push(g.tb.map(x=>x.slice()));pour(g.tb,g.sel,i,g.cap);g.moves++;g.sel=-1;sfx("pop");drawSort();
    if(sortDone(g.tb)){g.won=true;timers.push(setTimeout(()=>levelWin("sort"),400));}}
  else{const b=document.querySelector(`[data-tube="${i}"]`);sfx("no");if(b){b.classList.remove("no");void b.offsetWidth;b.classList.add("no");}g.sel=-1;timers.push(setTimeout(drawSort,350));}
}
/* ---------- 1.5.0 games: shared helpers ---------- */
const LW=x=>x[WI[lang]];                       // label of a [emoji,en,ht,fr,es] row
const shakeEl=el=>{if(!el)return;el.classList.remove("no");void el.offsetWidth;el.classList.add("no");};
const NEWG=["paint","maze","dots","shadow","diff","cook","habits","order"];
/* ---------- coloring pages (SVG, viewBox 200x200). Regions are filled by tapping; deco is just lines ---------- */
const S_=(t,a)=>`<${t} ${a}/>`;
const PAINT=[
 {e:"🏠",r:[S_("rect",'x="0" y="0" width="200" height="150"'),S_("rect",'x="0" y="150" width="200" height="50"'),S_("circle",'cx="165" cy="35" r="18"'),S_("rect",'x="45" y="85" width="110" height="70"'),S_("polygon",'points="35,88 100,40 165,88"'),S_("rect",'x="88" y="115" width="26" height="40"'),S_("rect",'x="57" y="100" width="22" height="22"'),S_("rect",'x="121" y="100" width="22" height="22"')],d:""},
 {e:"🐟",r:[S_("rect",'x="0" y="0" width="200" height="200"'),S_("rect",'x="0" y="175" width="200" height="25"'),S_("polygon",'points="45,100 12,68 12,132"'),S_("ellipse",'cx="95" cy="100" rx="58" ry="38"'),S_("polygon",'points="80,66 102,38 122,68"'),S_("ellipse",'cx="108" cy="100" rx="9" ry="34"'),S_("circle",'cx="132" cy="92" r="8"'),S_("circle",'cx="168" cy="55" r="9"'),S_("circle",'cx="182" cy="30" r="6"')],d:'<circle cx="134" cy="92" r="3" fill="#24305E"/>'},
 {e:"🌺",r:[S_("rect",'x="0" y="0" width="200" height="200"'),S_("rect",'x="96" y="95" width="8" height="75"'),S_("ellipse",'cx="78" cy="140" rx="20" ry="8" transform="rotate(-30 78 140)"'),S_("ellipse",'cx="122" cy="128" rx="20" ry="8" transform="rotate(30 122 128)"'),
   ...[0,72,144,216,288].map(a=>S_("ellipse",`cx="100" cy="50" rx="15" ry="24" transform="rotate(${a} 100 75)"`)),S_("circle",'cx="100" cy="75" r="14"'),S_("polygon",'points="68,165 132,165 123,196 77,196"')],d:""},
 {e:"🚌",r:[S_("rect",'x="0" y="0" width="200" height="150"'),S_("rect",'x="0" y="150" width="200" height="50"'),S_("rect",'x="30" y="52" width="140" height="18" rx="6"'),S_("rect",'x="18" y="68" width="166" height="72" rx="12"'),S_("rect",'x="18" y="114" width="166" height="9"'),
   S_("rect",'x="32" y="80" width="32" height="26" rx="4"'),S_("rect",'x="72" y="80" width="32" height="26" rx="4"'),S_("rect",'x="112" y="80" width="32" height="26" rx="4"'),S_("circle",'cx="172" cy="96" r="7"'),S_("circle",'cx="55" cy="142" r="17"'),S_("circle",'cx="147" cy="142" r="17"'),S_("circle",'cx="55" cy="142" r="6"'),S_("circle",'cx="147" cy="142" r="6"')],d:""},
 {e:"🦋",r:[S_("rect",'x="0" y="0" width="200" height="200"'),S_("ellipse",'cx="66" cy="72" rx="42" ry="32" transform="rotate(-25 66 72)"'),S_("ellipse",'cx="134" cy="72" rx="42" ry="32" transform="rotate(25 134 72)"'),S_("ellipse",'cx="72" cy="132" rx="30" ry="24" transform="rotate(20 72 132)"'),S_("ellipse",'cx="128" cy="132" rx="30" ry="24" transform="rotate(-20 128 132)"'),
   S_("circle",'cx="62" cy="70" r="11"'),S_("circle",'cx="138" cy="70" r="11"'),S_("ellipse",'cx="100" cy="105" rx="8" ry="46"'),S_("circle",'cx="100" cy="55" r="11"')],d:'<path d="M96 46 Q86 22 74 18 M104 46 Q114 22 126 18" stroke="#24305E" stroke-width="3" fill="none" stroke-linecap="round"/>'},
 {e:"🇭🇹",r:[S_("rect",'x="0" y="0" width="200" height="200"'),S_("rect",'x="0" y="182" width="200" height="18"'),S_("rect",'x="18" y="18" width="9" height="168"'),S_("rect",'x="27" y="30" width="152" height="50"'),S_("rect",'x="27" y="80" width="152" height="50"'),S_("rect",'x="82" y="62" width="42" height="36"'),S_("circle",'cx="22" cy="14" r="7"')],d:'<path d="M103 90v-18M95 90h16" stroke="#24305E" stroke-width="3" stroke-linecap="round"/>'},
 {e:"🌈",r:[S_("rect",'x="0" y="0" width="200" height="200"'),...[0,1,2,3,4].map(i=>{const R=92-13*i,r=R-13;return S_("path",`d="M${100-R} 160 A${R} ${R} 0 0 1 ${100+R} 160 L${100+r} 160 A${r} ${r} 0 0 0 ${100-r} 160 Z"`);}),S_("ellipse",'cx="30" cy="160" rx="30" ry="16"'),S_("ellipse",'cx="170" cy="160" rx="30" ry="16"'),S_("circle",'cx="170" cy="32" r="17"')],d:""},
 {e:"🥭",r:[S_("rect",'x="0" y="0" width="200" height="160"'),S_("rect",'x="0" y="160" width="200" height="40"'),S_("rect",'x="90" y="105" width="20" height="62"'),S_("ellipse",'cx="100" cy="82" rx="68" ry="50"'),S_("ellipse",'cx="72" cy="92" rx="9" ry="12"'),S_("ellipse",'cx="122" cy="74" rx="9" ry="12"'),S_("ellipse",'cx="108" cy="108" rx="9" ry="12"'),S_("circle",'cx="28" cy="28" r="15"')],d:""}];
/* 1.8.0: flag page last, two more pages from everywhere */
PAINT.push(...PAINT.splice(5,1));
PAINT.splice(2,0,{e:"🚀",r:[S_("rect",'x="0" y="0" width="200" height="200"'),S_("circle",'cx="160" cy="160" r="22"'),S_("circle",'cx="35" cy="40" r="7"'),S_("circle",'cx="165" cy="55" r="6"'),S_("circle",'cx="38" cy="160" r="6"'),
  S_("polygon",'points="88,150 112,150 100,188"'),S_("polygon",'points="80,112 55,156 80,150"'),S_("polygon",'points="120,112 145,156 120,150"'),S_("rect",'x="80" y="50" width="40" height="102" rx="12"'),S_("polygon",'points="80,58 100,14 120,58"'),S_("circle",'cx="100" cy="88" r="12"')],d:""});
PAINT.splice(5,0,{e:"🐳",r:[S_("rect",'x="0" y="0" width="200" height="95"'),S_("rect",'x="0" y="95" width="200" height="105"'),S_("circle",'cx="166" cy="30" r="16"'),S_("ellipse",'cx="82" cy="70" rx="9" ry="18"'),
  S_("polygon",'points="155,120 194,94 190,142"'),S_("ellipse",'cx="95" cy="128" rx="66" ry="38"'),S_("ellipse",'cx="90" cy="150" rx="46" ry="13"'),S_("circle",'cx="60" cy="120" r="7"')],d:'<path d="M50 136 q12 8 26 2" stroke="#24305E" stroke-width="3" fill="none" stroke-linecap="round"/>'});
const PAINTCOL=[...COLORS.map(c=>c[0]),"#8D5524","#7CC8F8","#FFFFFF"];
function paintInit(){const L=lvl("paint"),pg=PAINT[(L-1)%PAINT.length];game={pt:true,pg,fill:pg.r.map(()=>"#FFFFFF"),col:PAINTCOL[0],won:false};drawPaint();}
function drawPaint(){const g=game,el=document.getElementById("paintsvg");if(!el)return;
  el.innerHTML=g.pg.r.map((s,i)=>s.replace("/>",` data-rg="${i}" fill="${g.fill[i]}" stroke="#24305E" stroke-width="3" stroke-linejoin="round"/>`)).join("")+`<g pointer-events="none">${g.pg.d}</g>`;
  const n=g.fill.filter(f=>f!=="#FFFFFF").length;setScore2(`${n}/${g.fill.length}`);
  if(n===g.fill.length&&!g.won){g.won=true;timers.push(setTimeout(()=>levelWin("paint"),500));}}
function paintTap(i){const g=game;if(!g.pt||g.won)return;g.fill[i]=g.col;sfx("pop");drawPaint();}
/* ---------- maze ---------- */
function mazeInit(){
  const L=lvl("maze"),n=Math.min({a:7,b:9,c:11}[age||"b"],{a:4,b:5,c:6}[age||"b"]+L-1),w=Array.from({length:n*n},()=>[1,1,1,1]);
  const seen=new Set([0]),st=[0],D=[[0,-1,0,2],[1,0,1,3],[0,1,2,0],[-1,0,3,1]];
  while(st.length){const c=st[st.length-1],x=c%n,y=Math.floor(c/n);
    const nb=shuffle(D).filter(([dx,dy])=>{const X=x+dx,Y=y+dy;return X>=0&&Y>=0&&X<n&&Y<n&&!seen.has(Y*n+X);});
    if(!nb.length){st.pop();continue;}const [dx,dy,a,b]=nb[0],m=(y+dy)*n+x+dx;w[c][a]=0;w[m][b]=0;seen.add(m);st.push(m);}
  game={mz:true,n,w,p:0,moves:0,won:false,seen:new Set([0])};drawMaze();}
function drawMaze(){const g=game,el=document.getElementById("maze");if(!el)return;
  el.style.gridTemplateColumns=`repeat(${g.n},minmax(0,1fr))`;el.style.fontSize=`${Math.max(14,Math.round(200/g.n))}px`;
  el.innerHTML=g.w.map((w,i)=>`<button class="mzc${g.seen.has(i)?" seen":""}" data-mzc="${i}" style="border-width:${w.map(v=>v?"3px":"0").join(" ")}" aria-label="${i+1}">${i===g.p?"🐥":i===g.n*g.n-1?"🏠":""}</button>`).join("");
  setScore2(`${g.moves} ${t("moves")}`);}
function mazeStep(dx,dy){const g=game;if(!g.mz||g.won)return false;const x=g.p%g.n,y=Math.floor(g.p/g.n),d=dy<0?0:dx>0?1:dy>0?2:3;
  if(g.w[g.p][d])return false;g.p=(y+dy)*g.n+x+dx;g.seen.add(g.p);return true;}
function mazeMove(dx,dy,many){const g=game;if(!g.mz||g.won)return;let k=0;while(mazeStep(dx,dy)){k++;if(!many||g.p===g.n*g.n-1)break;}
  if(!k){sfx("no");return;}g.moves++;sfx("pop");drawMaze();
  if(g.p===g.n*g.n-1){g.won=true;timers.push(setTimeout(()=>levelWin("maze"),350));}}
function mazeTap(i){const g=game;if(!g.mz)return;const x=g.p%g.n,y=Math.floor(g.p/g.n),X=i%g.n,Y=Math.floor(i/g.n);
  if(i===g.p)return;if(X!==x&&Y!==y){sfx("no");return;}
  const dx=Math.sign(X-x),dy=Math.sign(Y-y);let k=0;while(g.p!==i&&mazeStep(dx,dy))k++;
  if(!k){sfx("no");return;}g.moves++;sfx("pop");drawMaze();if(g.p===g.n*g.n-1){g.won=true;timers.push(setTimeout(()=>levelWin("maze"),350));}}
/* ---------- connect the dots (points in 0..100) ---------- */
const DOTS=[
 {e:"🪁",p:[[50,6],[86,44],[50,94],[14,44]]},
 {e:"🏠",p:[[20,90],[20,45],[50,14],[80,45],[80,90]]},
 {e:"⛰️",p:[[6,88],[34,30],[50,56],[66,34],[94,88]]},
 {e:"🐟",p:[[10,50],[30,30],[58,24],[80,38],[95,22],[95,78],[80,62],[58,76],[30,70]]},
 {e:"⛵",p:[[10,68],[47,68],[47,10],[84,60],[53,60],[53,68],[92,68],[76,88],[24,88]]},
 {e:"🚀",p:[[50,5],[66,26],[66,64],[82,88],[60,80],[40,80],[18,88],[34,64],[34,26]]},
 {e:"⭐",p:Array.from({length:10},(_,i)=>{const a=(i*36-90)*Math.PI/180,r=i%2?19:44;return [Math.round(50+r*Math.cos(a)),Math.round(53+r*Math.sin(a))];})},
 {e:"❤️",p:[[50,90],[16,56],[9,36],[19,18],[35,14],[50,28],[65,14],[81,18],[91,36],[84,56]]},
 {e:"🌲",p:[[50,5],[70,35],[61,35],[80,60],[58,60],[58,92],[42,92],[42,60],[20,60],[39,35],[30,35]]}];
function dotsInit(){const L=lvl("dots"),list=age==="a"?DOTS.slice(0,6):DOTS,sh=list[(L-1)%list.length],step=age==="c"&&L>2?(L>5?5:2):1;
  game={dt:true,sh,step,i:0,won:false};drawDots();}
function drawDots(){const g=game,el=document.getElementById("dotsbox");if(!el)return;const P=g.sh.p,done=g.i>=P.length;
  const line=P.slice(0,g.i).map(p=>p.join(",")).join(" ")+(done?" "+P[0].join(","):"");
  el.innerHTML=`<svg viewBox="0 0 100 100" preserveAspectRatio="none">${done?`<polygon points="${line}" fill="#FFE08A" stroke="#2F80ED" stroke-width="1.6" stroke-linejoin="round"/>`:`<polyline points="${line}" fill="none" stroke="#2F80ED" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`}</svg>
    ${done?`<span class="dreveal">${g.sh.e}</span>`:""}
    ${P.map((p,i)=>`<button class="dot2${i<g.i?" on":""}${i===g.i?" next":""}" data-dt="${i}" style="left:${(6+p[0]*.88).toFixed(1)}%;top:${(6+p[1]*.88).toFixed(1)}%">${(i+1)*g.step}</button>`).join("")}`;
  setScore2(`${g.i}/${P.length}`);}
function dotTap(i,btn){const g=game;if(!g.dt||g.won)return;
  if(i!==g.i){if(i>g.i){sfx("no");shakeEl(btn);}return;}
  g.i++;sfx("pop");speak(String((i+1)*g.step));drawDots();
  if(g.i>=g.sh.p.length){g.won=true;timers.push(setTimeout(()=>levelWin("dots"),600));}}
/* ---------- shadows ---------- */
function shadowInit(){const L=lvl("shadow");game={sh:true,L,round:0,rounds:5,n:Math.min(6,{a:3,b:4,c:4}[age||"b"]+Math.floor((L-1)/2))};shadowRound();}
function shadowRound(){const g=game;let pool=WORDS;
  if(g.L>=3){const ks=TORDER.filter(k=>k!=="mix"&&(themeList(k)||[]).length>=g.n+2);if(ks.length)pool=themeList(ks[rnd(0,ks.length-1)]);}
  const seen=new Set(),pick=[];for(const w of shuffle(pool)){if(!seen.has(w[0])){seen.add(w[0]);pick.push(w);}if(pick.length===g.n)break;}
  g.items=pick;g.ans=rnd(0,pick.length-1);g.busy=false;drawShadow();}
function drawShadow(){const g=game,el=document.getElementById("shbox");if(!el)return;
  el.innerHTML=`<div class="shbig" aria-label="?">${g.items[g.ans][0]}</div><div class="opts ${g.items.length===4?"four":""}">${g.items.map((w,i)=>`<button class="opt" data-shi="${i}" aria-label="${word(w)}"><span class="big">${w[0]}</span></button>`).join("")}</div>`;
  setScore2(`${g.round}/${g.rounds}`);}
function shadowTap(i,btn){const g=game;if(!g.sh||g.busy)return;
  if(i!==g.ans){sfx("no");shakeEl(btn);speak(t("notThat"));return;}
  g.busy=true;btn.classList.add("ok");const big=document.querySelector(".shbig");if(big)big.classList.add("lit");sfx("ok");speak(word(g.items[i]));g.round++;setScore2(`${g.round}/${g.rounds}`);
  timers.push(setTimeout(()=>{if(g.round>=g.rounds)levelWin("shadow");else shadowRound();},900));}
/* ---------- spot the difference ---------- */
function diffInit(){const L=lvl("diff"),gs=Math.min(5,{a:3,b:3,c:4}[age||"b"]+Math.floor((L-1)/3)),k=Math.min(6,gs*gs-3,{a:2,b:3,c:3}[age||"b"]+Math.floor((L-1)/2));
  const em=[...new Set(shuffle(WORDS).map(w=>w[0]))];const left=em.slice(0,gs*gs);const spare=em.slice(gs*gs);
  const right=left.slice(),diffs=new Set(shuffle([...left.keys()]).slice(0,k));let j=0;diffs.forEach(i=>{right[i]=rnd(0,3)===0?"":spare[j++];});
  game={df:true,gs,left,right,diffs,found:new Set(),won:false};drawDiff();}
function drawDiff(){const g=game,el=document.getElementById("diffbox");if(!el)return;
  const board=(arr,side)=>`<div class="dfb" style="grid-template-columns:repeat(${g.gs},minmax(0,1fr))">${arr.map((e,i)=>`<button class="dfc${g.found.has(i)?" found":""}" data-df="${i}" data-side="${side}" aria-label="${i+1}">${e}</button>`).join("")}</div>`;
  el.innerHTML=`<h2>${t("diffHint").replace("{n}",g.diffs.size)}</h2>`+board(g.left,"l")+board(g.right,"r");setScore2(`🔍 ${g.found.size}/${g.diffs.size}`);}
function diffTap(i,btn){const g=game;if(!g.df||g.won||g.found.has(i))return;
  if(!g.diffs.has(i)){sfx("no");shakeEl(btn);return;}
  g.found.add(i);sfx("ok");drawDiff();if(g.found.size===g.diffs.size){g.won=true;timers.push(setTimeout(()=>levelWin("diff"),500));}}
/* ---------- kitchen ---------- */
function cookInit(){const L=lvl("cook"),r=RECIPES[(L-1)%RECIPES.length];game={ck:true,r,i:0,won:false};cookOpts();drawCook();speak(cookSay());}
function cookOpts(){const g=game;if(g.i>=g.r.s.length){g.opts=[];return;}const want=g.r.s[g.i],n={a:3,b:4,c:5}[age||"b"];
  g.opts=shuffle([want,...shuffle(Object.keys(FOOD).filter(k=>k!==want&&!g.r.s.slice(0,g.i).includes(k))).slice(0,n-1)]);}
function cookSay(){const g=game,k=g.r.s[g.i];if(!k)return t("cookDone");const f=FOOD[k];return FOODACT.includes(k)?LW(f)+"!":t("cookPut").replace("{x}",LW(f));}
function drawCook(){const g=game,el=document.getElementById("cookbox");if(!el)return;const done=g.i>=g.r.s.length,k=g.r.s[g.i];
  el.innerHTML=`<h3 style="margin:0;text-align:center">${g.r.e} ${g.r.t[LI[lang]]}</h3>
    <div class="pot${done?" done":""}"><div class="potin">${done?`<span class="dish">${g.r.e}</span>`:g.r.s.slice(0,g.i).map(x=>`<span>${FOOD[x][0]}</span>`).join("")}</div><span class="potp">🍲</span></div>
    <h2 id="ckq">${done?"⭐ "+t("cookDone"):cookSay()+(age==="a"?" "+FOOD[k][0]:"")}</h2>
    ${done?"":`<div class="opts ${g.opts.length===4?"four":""}">${g.opts.map(x=>`<button class="opt" data-ck="${x}" aria-label="${LW(FOOD[x])}"><span class="big">${FOOD[x][0]}</span><span class="w">${LW(FOOD[x])}</span></button>`).join("")}</div>`}`;
  setScore2(`${g.i}/${g.r.s.length}`);}
function cookTap(k,btn){const g=game;if(!g.ck||g.won||g.busy)return;
  if(k!==g.r.s[g.i]){sfx("no");shakeEl(btn);speak(t("notThat"));return;}
  g.busy=true;btn.classList.add("ok");sfx("pop");speak(LW(FOOD[k]));
  timers.push(setTimeout(()=>{g.busy=false;g.i++;cookOpts();drawCook();
    if(g.i>=g.r.s.length){g.won=true;speak(t("cookDone"));timers.push(setTimeout(()=>levelWin("cook"),700));}else speak(cookSay());},450));}
/* ---------- good habits / in order (same engine) ---------- */
function seqInit(kind){const L=lvl(kind),list=kind==="habits"?HABITS:ORDERS,it=list[(L-1)%list.length];
  game={sq:true,kind,it,i:0,cards:shuffle([...it.s.keys()]),won:false};drawSeq();speak(it.t[LI[lang]]);}
function drawSeq(){const g=game,el=document.getElementById("seqbox");if(!el)return;const S=g.it.s;
  el.innerHTML=`<h3 style="margin:0;text-align:center">${g.it.e} ${g.it.t[LI[lang]]}</h3>
    <div class="slots" style="grid-template-columns:repeat(${S.length},minmax(0,1fr))">${S.map((s,i)=>`<div class="slot${i<g.i?" on":""}"><small>${i+1}</small>${i<g.i?`<span class="e">${s[0]}</span><span class="w">${LW(s)}</span>`:""}</div>`).join("")}</div>
    <div class="opts ${S.length-g.i===4?"four":""}">${g.cards.filter(c=>c>=g.i).map(c=>`<button class="opt" data-sq="${c}" aria-label="${LW(S[c])}"><span class="big">${S[c][0]}</span><span class="w">${LW(S[c])}</span></button>`).join("")}</div>`;
  setScore2(`${g.i}/${S.length}`);}
function seqTap(c,btn){const g=game;if(!g.sq||g.won)return;
  if(c!==g.i){sfx("no");shakeEl(btn);speak(t("notThat"));return;}
  g.i++;sfx("pop");speak(LW(g.it.s[c]));drawSeq();
  if(g.i>=g.it.s.length){g.won=true;timers.push(setTimeout(()=>levelWin(g.kind),600));}}
/* ---------- 1.6.0 games ---------- */
const NEWG2=["pattern","odd","spell","simon","hidden","mole"];
const allWords=()=>[...WORDS,...TORDER.filter(k=>k!=="mix").flatMap(k=>themeList(k)||[])];
const uniqEmoji=list=>{const s=new Set(),o=[];list.forEach(w=>{if(!s.has(w[0])){s.add(w[0]);o.push(w);}});return o;};
/* patterns: AB, ABB, AAB, ABC, AABB */
function patternInit(){game={pa:true,L:lvl("pattern"),round:0,rounds:5};patternRound();}
function patternRound(){const g=game,L=g.L;
  const types=age==="a"?(L<3?["AB"]:["AB","ABB","AAB"]):age==="b"?(L<2?["AB"]:L<4?["AB","ABB","AAB"]:["ABB","AAB","ABC"]):(L<2?["AB","ABB"]:L<4?["ABC","AAB","ABB"]:["ABC","AABB","ABCB"]);
  const ty=types[rnd(0,types.length-1)],letters=[...new Set(ty)],em=shuffle([...FRUITS,...ITEMS,"🐶","🐱","🐟","🦋","🚗","🎈"].filter((x,i,a)=>a.indexOf(x)===i));
  const map={};letters.forEach((c,i)=>map[c]=em[i]);
  const full=ty.length<=2?3:2, seq=[];for(let r=0;r<full;r++)ty.split("").forEach(c=>seq.push(map[c]));
  const cut=rnd(0,ty.length-1);for(let i=0;i<cut;i++)seq.push(map[ty[i]]);
  const ans=map[ty[cut]];const opts=new Set([ans]);letters.forEach(c=>opts.add(map[c]));let j=letters.length;while(opts.size<3)opts.add(em[j++]);
  g.seq=seq;g.ans=ans;g.opts=shuffle([...opts]).slice(0,4);if(!g.opts.includes(ans))g.opts[0]=ans;g.busy=false;drawPattern();}
function drawPattern(){const g=game,el=document.getElementById("pabox");if(!el)return;
  el.innerHTML=`<div class="patrow">${g.seq.map(e=>`<span>${e}</span>`).join("")}<span class="pq">${g.done?g.ans:"?"}</span></div>
   <div class="opts ${g.opts.length===4?"four":""}">${g.opts.map((e,i)=>`<button class="opt" data-pat="${i}"><span class="big">${e}</span></button>`).join("")}</div>`;
  setScore2(`${g.round}/${g.rounds}`);}
function patternTap(i,btn){const g=game;if(!g.pa||g.busy)return;
  if(g.opts[i]!==g.ans){sfx("no");shakeEl(btn);speak(t("no"));return;}
  g.busy=true;g.done=true;g.round++;sfx("ok");drawPattern();g.done=false;
  timers.push(setTimeout(()=>{if(g.round>=g.rounds)levelWin("pattern");else patternRound();},900));}
/* odd one out */
function oddInit(){game={od:true,L:lvl("odd"),round:0,rounds:5};oddRound();}
function oddRound(){const g=game,ks=shuffle(TORDER.filter(k=>k!=="mix"&&(themeList(k)||[]).length>=4)),n=age==="a"?3:4;
  const same=shuffle(uniqEmoji(themeList(ks[0]))).slice(0,n-1),other=shuffle(uniqEmoji(themeList(ks[1])).filter(w=>!same.some(x=>x[0]===w[0])))[0];
  g.items=shuffle([...same,other]);g.ans=g.items.indexOf(other);g.busy=false;drawOdd();}
function drawOdd(){const g=game,el=document.getElementById("odbox");if(!el)return;
  el.innerHTML=`<div class="opts ${g.items.length===4?"four":""}">${g.items.map((w,i)=>`<button class="opt" data-odd="${i}" aria-label="${word(w)}"><span class="big">${w[0]}</span><span class="w">${g.show?word(w):""}</span></button>`).join("")}</div>`;
  setScore2(`${g.round}/${g.rounds}`);}
function oddTap(i,btn){const g=game;if(!g.od||g.busy)return;
  if(i!==g.ans){sfx("no");shakeEl(btn);speak(t("notThat"));return;}
  g.busy=true;g.round++;btn.classList.add("ok");sfx("ok");speak(word(g.items[i]));setScore2(`${g.round}/${g.rounds}`);
  timers.push(setTimeout(()=>{if(g.round>=g.rounds)levelWin("odd");else oddRound();},900));}
/* spell it */
const letters=s=>Array.from(s.toLocaleLowerCase());
function spellInit(){game={sp:true,L:lvl("spell"),round:0,rounds:3};spellRound();}
function spellRound(){const g=game,lo={a:2,b:3,c:4}[age||"b"]+Math.floor((g.L-1)/3),hi=lo+1;
  let pool=uniqEmoji(allWords()).filter(w=>{const x=word(w);return /^[\p{L}]+$/u.test(x)&&letters(x).length>=lo&&letters(x).length<=hi;});
  if(!pool.length)pool=uniqEmoji(allWords()).filter(w=>/^[\p{L}]+$/u.test(word(w))&&letters(word(w)).length<=6);
  const w=pool[rnd(0,pool.length-1)],L=letters(word(w));
  g.w=w;g.L2=L;g.i=0;g.tiles=shuffle(L.map((c,k)=>({c,k,used:false})));g.busy=false;drawSpell();speak(word(w));}
function drawSpell(){const g=game,el=document.getElementById("spbox");if(!el)return;
  el.innerHTML=`<div class="stage" style="font-size:90px;line-height:1">${g.w[0]}</div>
   <div class="spslots">${g.L2.map((c,i)=>`<span class="${i<g.i?"on":""}">${i<g.i?c.toLocaleUpperCase():""}</span>`).join("")}</div>
   <div class="sptiles">${g.tiles.map((t2,i)=>`<button class="sptile${t2.used?" used":""}" data-spl="${i}" ${t2.used?"disabled":""}>${t2.c.toLocaleUpperCase()}</button>`).join("")}</div>`;
  setScore2(`${g.round}/${g.rounds}`);}
function spellTap(i,btn){const g=game;if(!g.sp||g.busy)return;const tl=g.tiles[i];if(!tl||tl.used)return;
  if(tl.c!==g.L2[g.i]){sfx("no");shakeEl(btn);return;}
  tl.used=true;g.i++;sfx("pop");speak(tl.c);
  if(g.i>=g.L2.length){g.busy=true;g.round++;drawSpell();sfx("ok");speak(word(g.w));timers.push(setTimeout(()=>{if(g.round>=g.rounds)levelWin("spell");else spellRound();},1200));}
  else drawSpell();}
/* follow me (Simon) */
const SIMCOL=["#E53935","#1E63D6","#FDD835","#2E9E4F"],SIMNOTE=[0,2,4,7];
function simonInit(){const L=lvl("simon");game={si:true,goal:{a:3,b:4,c:5}[age||"b"]+L-1,seq:[rnd(0,3)],pos:0,busy:true};drawSimon();timers.push(setTimeout(simonShow,700));}
function drawSimon(msg){const g=game,el=document.getElementById("sibox");if(!el)return;
  el.innerHTML=`<h2 id="simsg">${msg||t("simonWatch")}</h2><div class="simon">${SIMCOL.map((c,i)=>`<button class="simpad" data-sim="${i}" style="background:${c}" aria-label="${COLORS[[0,1,2,3][i]][WI[lang]]}"></button>`).join("")}</div>`;
  setScore2(`${g.seq.length-1}/${g.goal}`);}
function simLight(i,ms=420){const b=document.querySelector(`[data-sim="${i}"]`);if(b){b.classList.add("lit");timers.push(setTimeout(()=>b.classList.remove("lit"),ms));}if(sound)note(SIMNOTE[i],ms/1000);}
function simonShow(){const g=game;if(!g.si)return;g.busy=true;g.pos=0;const m=document.getElementById("simsg");if(m)m.textContent=t("simonWatch");
  const gap=Math.max(380,700-g.seq.length*30);
  g.seq.forEach((c,k)=>timers.push(setTimeout(()=>simLight(c,gap*.7),k*gap)));
  timers.push(setTimeout(()=>{if(game!==g)return;g.busy=false;const m2=document.getElementById("simsg");if(m2)m2.textContent=t("simonGo");},g.seq.length*gap));}
function simonTap(i){const g=game;if(!g.si||g.busy)return;simLight(i,250);
  if(i!==g.seq[g.pos]){g.busy=true;levelFail("simon",t("no"));return;}
  g.pos++;if(g.pos<g.seq.length)return;
  g.busy=true;if(g.seq.length>=g.goal){timers.push(setTimeout(()=>levelWin("simon"),400));return;}
  g.seq.push(rnd(0,3));setScore2(`${g.seq.length-1}/${g.goal}`);timers.push(setTimeout(simonShow,900));}
/* hide and seek */
function hiddenInit(){const L=lvl("hidden"),gs=Math.min(7,{a:4,b:5,c:6}[age||"b"]+Math.floor((L-1)/3)),k=Math.min(5,{a:2,b:3,c:3}[age||"b"]+Math.floor((L-1)/2));
  const em=shuffle([...new Set(allWords().map(w=>w[0]))]);const targets=em.slice(0,k),rest=em.slice(k);
  const cells=Array.from({length:gs*gs},(_,i)=>rest[i%rest.length]);const pos=shuffle([...cells.keys()]).slice(0,k);pos.forEach((p,j)=>cells[p]=targets[j]);
  game={hd:true,gs,cells,targets,pos,found:new Set(),won:false};drawHidden();}
function drawHidden(){const g=game,el=document.getElementById("hdbox");if(!el)return;
  el.innerHTML=`<div class="hdlist"><b>${t("hiddenQ")}</b>${g.targets.map(e=>`<span class="${g.found.has(e)?"got":""}">${e}</span>`).join("")}</div>
   <div class="dfb hdb" style="grid-template-columns:repeat(${g.gs},minmax(0,1fr));max-width:400px">${g.cells.map((e,i)=>`<button class="dfc${g.found.has(e)&&g.targets.includes(e)?" found":""}" data-hd="${i}">${e}</button>`).join("")}</div>`;
  setScore2(`🔍 ${g.found.size}/${g.targets.length}`);}
function hiddenTap(i,btn){const g=game;if(!g.hd||g.won)return;const e=g.cells[i];
  if(!g.targets.includes(e)||g.found.has(e)){if(!g.found.has(e)){sfx("no");shakeEl(btn);}return;}
  g.found.add(e);sfx("ok");drawHidden();if(g.found.size===g.targets.length){g.won=true;timers.push(setTimeout(()=>levelWin("hidden"),500));}}
/* crab tap */
function moleInit(){const L=lvl("mole"),goal={a:6,b:8,c:10}[age||"b"]+(L-1)*2,secs=30,up=Math.max(650,{a:1500,b:1200,c:1000}[age||"b"]*Math.pow(.93,L-1));
  game={ml:true,goal,left:secs,up,hits:0,holes:Array(9).fill(""),done:false,turtle:age!=="a"&&L>=2};drawMole();
  const tick=()=>{const g=game;if(!g.ml||g.done)return;if(g.left<=0){g.done=true;stopTimersOnly();levelFail("mole",t("timeUp"));return;}g.left--;moleScore();};
  timers.push(setInterval(tick,1000));
  const pop=()=>{const g=game;if(!g.ml||g.done)return;const free=g.holes.map((h,i)=>h?-1:i).filter(i=>i>=0);if(!free.length)return;
    const i=free[rnd(0,free.length-1)];g.holes[i]=g.turtle&&rnd(0,3)===0?"🐢":"🦀";drawMole();
    timers.push(setTimeout(()=>{if(game!==g||g.done)return;if(g.holes[i]&&g.holes[i]!=="✨"){g.holes[i]="";drawMole();}},g.up));};
  pop();timers.push(setInterval(pop,Math.round(g0up(game.up))));}
const g0up=u=>u*.62;
function moleScore(){const g=game;setScore2(`⏱ ${g.left} · 🦀 ${g.hits}/${g.goal}`);}
function drawMole(){const g=game,el=document.getElementById("mlbox");if(!el)return;
  el.innerHTML=g.holes.map((h,i)=>`<button class="hole" data-ml="${i}"><span class="${h?"up":""}">${h||""}</span></button>`).join("");moleScore();}
function moleTap(i,btn){const g=game;if(!g.ml||g.done)return;const h=g.holes[i];if(!h||h==="✨")return;
  if(h==="🐢"){sfx("no");shakeEl(btn);speak(t("notThat"));g.holes[i]="";g.hits=Math.max(0,g.hits-1);drawMole();return;}
  g.hits++;sfx("pop");g.holes[i]="✨";drawMole();timers.push(setTimeout(()=>{if(game===g&&g.holes[i]==="✨"){g.holes[i]="";drawMole();}},250));
  if(g.hits>=g.goal){g.done=true;stopTimersOnly();timers.push(setTimeout(()=>levelWin("mole"),300));}}
/* ---------- 1.7.0 games ---------- */
const NEWG3=["feed","emo","opp","miss","ttt","size"];
/* round quizzes: each RQ maker returns {say, center, opts:[emoji/number], labels, ans, okSay} */
const RQ={
 feed:g=>{const n=age==="a"?3:4,pick=shuffle(FEED).slice(0,n),ans=rnd(0,n-1),A=pick[ans];
   return {say:t("feedQ").replace("{x}",A[2+LI[lang]]),center:`<div class="stage rqbig">${A[0]}</div>`,opts:pick.map(f=>f[1]),labels:null,ans,okSay:A[1]};},
 emo:g=>{const n=age==="a"?3:Math.min(EMOS.length,4+Math.floor((g.L-1)/3)),pick=shuffle(EMOS).slice(0,n),ans=rnd(0,n-1);
   return {say:t("emoQ").replace("{x}",LW(pick[ans])),center:"",opts:pick.map(e=>e[0]),labels:null,ans,okSay:LW(pick[ans])};},
 opp:g=>{const n=age==="a"?3:4,ps=shuffle(OPPS).slice(0,n),side=rnd(0,1),P=ps[0],qw=(side?P[3]:P[2])[LI[lang]];
   const items=ps.map((p,i)=>{const s=i===0?1-side:rnd(0,1);return [p[s],(s?p[3]:p[2])[LI[lang]]];}),order=shuffle([...items.keys()]);
   return {say:t("oppQ").replace("{x}",qw),center:`<div class="stage rqbig" style="flex-direction:column;gap:0">${P[side]}<span class="rqw">${qw}</span></div>`,opts:order.map(i=>items[i][0]),labels:order.map(i=>items[i][1]),ans:order.indexOf(0),okSay:items[0][1]};},
 miss:g=>{const mx=age==="a"?10:age==="b"?(g.L<4?20:50):100,steps=age==="a"?[1]:age==="b"?(g.L<3?[1]:[1,2]):(g.L<3?[1,2,5]:[2,5,10,3]);
   const st=steps[rnd(0,steps.length-1)],down=age==="c"&&rnd(0,2)===0,len=age==="a"?4:5;let a0=rnd(down?st*(len-1):0,Math.max(down?st*(len-1):0,mx-(down?0:st*(len-1))));
   if(age==="a")a0=Math.max(1,a0);const seq=Array.from({length:len},(_,i)=>down?a0-i*st:a0+i*st),hole=rnd(1,len-1),ansN=seq[hole];
   const o=new Set([ansN]);let k=0;while(o.size<3&&k<50){k++;const d=ansN+[-st,st,-1,1,2*st][rnd(0,4)];if(d>=0&&d<=mx+2*st)o.add(d);}
   const opts=shuffle([...o]);
   return {say:t("missQ"),center:`<div class="misrow">${seq.map((x,i)=>`<span class="${i===hole?"pq":""}">${i===hole?"?":x}</span>`).join("")}</div>`,opts,labels:opts.map(x=>nw(x)),ans:opts.indexOf(ansN),okSay:nw(ansN),num:true};}};
function rqInit(k){game={rq:k,L:lvl(k),round:0,rounds:5};rqRound();}
function rqRound(){const g=game;Object.assign(g,RQ[g.rq](g));g.busy=false;drawRQ();speak(g.say);}
function drawRQ(){const g=game,el=document.getElementById("rqbox");if(!el)return;
  el.innerHTML=`<h2>${g.say}</h2>${g.center}<div class="opts ${g.opts.length===4?"four":""}">${g.opts.map((o,i)=>`<button class="opt" data-rq="${i}">${g.num?`<span class="n">${o}</span>`:`<span class="big">${o}</span>`}${g.labels?`<span class="w">${g.labels[i]}</span>`:""}</button>`).join("")}</div>`;
  setScore2(`${g.round}/${g.rounds}`);}
function rqTap(i,btn){const g=game;if(!g.rq||g.busy)return;
  if(i!==g.ans){sfx("no");shakeEl(btn);speak(t("no"));return;}
  g.busy=true;btn.classList.add("ok");sfx("ok");speak(g.okSay);g.round++;setScore2(`${g.round}/${g.rounds}`);
  const q2=document.querySelector("#rqbox .pq");if(q2){q2.textContent=g.opts[i];q2.classList.add("got");}
  timers.push(setTimeout(()=>{if(g.round>=g.rounds)levelWin(g.rq);else rqRound();},1000));}
/* big and small */
const SIZEEM=["🍎","⭐","🎈","🐟","🌳","🏠","⚽","🐢","🌻","🚗"];
function sizeInit(){game={sz:true,L:lvl("size"),round:0,rounds:3};sizeRound();}
function sizeRound(){const g=game,n=Math.min(6,{a:3,b:4,c:5}[age||"b"]+Math.floor((g.L-1)/3));
  g.e=SIZEEM[rnd(0,SIZEEM.length-1)];const mx={3:92,4:80,5:66,6:56}[n]||60;g.sizes=Array.from({length:n},(_,i)=>Math.round(26+i*((mx-26)/(n-1))));g.pos=shuffle([...g.sizes.keys()]);
  g.up=age==="a"||rnd(0,1)===0;g.i=0;g.busy=false;drawSize();speak(g.up?t("sizeUp"):t("sizeDown"));}
function drawSize(){const g=game,el=document.getElementById("szbox");if(!el)return;const n=g.sizes.length,want=k=>g.up?k:n-1-k;
  el.innerHTML=`<h2>${g.up?t("sizeUp"):t("sizeDown")}</h2><div class="szrow">${g.pos.map(k=>{const r=g.up?k:n-1-k,done=r<g.i;
    return `<button class="szb${done?" done":""}" data-szi="${k}" ${done?"disabled":""}><span style="font-size:${g.sizes[k]}px">${g.e}</span>${done?`<i>${r+1}</i>`:""}</button>`;}).join("")}</div>`;
  setScore2(`${g.round}/${g.rounds}`);}
function sizeTap(k,btn){const g=game;if(!g.sz||g.busy)return;const n=g.sizes.length,r=g.up?k:n-1-k;
  if(r!==g.i){sfx("no");shakeEl(btn);return;}
  g.i++;sfx("pop");speak(nw(g.i));drawSize();
  if(g.i>=n){g.busy=true;g.round++;sfx("ok");setScore2(`${g.round}/${g.rounds}`);timers.push(setTimeout(()=>{if(g.round>=g.rounds)levelWin("size");else sizeRound();},900));}}
/* tic-tac-toe against Tiki */
const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const tttWin=(b,m)=>LINES.find(l=>l.every(i=>b[i]===m));
function tttInit(){const L=lvl("ttt");game={tt:true,L,b:Array(9).fill(""),me:(CURP&&CURP.av)||"🦁",ai:"🐦",busy:false,over:false,
  slip:Math.max(.12,{a:.7,b:.55,c:.45}[age||"b"]-(L-1)*.08)};drawTTT(t("tttYou"));}
function drawTTT(msg){const g=game,el=document.getElementById("ttbox");if(!el)return;const w=g.line||[];
  el.innerHTML=`<h2 id="ttmsg">${msg}</h2><div class="ttt">${g.b.map((v,i)=>`<button class="ttc${w.includes(i)?" win":""}" data-tt="${i}" ${v||g.over?"disabled":""}>${v}</button>`).join("")}</div>
   <p class="hint" style="text-align:center;font-size:20px">${g.me}${CURP&&CURP.name?" "+esc(CURP.name):""} 🆚 ${g.ai} Tiki</p>`;}
function tttAiMove(){const g=game,b=g.b,free=b.map((v,i)=>v?-1:i).filter(i=>i>=0);if(!free.length)return -1;
  if(Math.random()<g.slip)return free[rnd(0,free.length-1)];
  for(const m of [g.ai,g.me])for(const i of free){const c=b.slice();c[i]=m;if(tttWin(c,m))return i;}
  if(!b[4])return 4;const cs=[0,2,6,8].filter(i=>!b[i]);if(cs.length)return cs[rnd(0,cs.length-1)];return free[rnd(0,free.length-1)];}
function tttEnd(){const g=game;
  let l=tttWin(g.b,g.me);if(l){g.over=true;g.line=l;drawTTT("⭐ "+t("ok"));sfx("ok");timers.push(setTimeout(()=>levelWin("ttt"),700));return true;}
  l=tttWin(g.b,g.ai);if(l){g.over=true;g.line=l;drawTTT(t("tttLose"));timers.push(setTimeout(()=>levelFail("ttt",t("tttLose")),800));return true;}
  if(g.b.every(v=>v)){g.over=true;drawTTT(t("tttDraw"));timers.push(setTimeout(()=>levelFail("ttt",t("tttDraw")),800));return true;}
  return false;}
function tttTap(i){const g=game;if(!g.tt||g.busy||g.over||g.b[i])return;
  g.b[i]=g.me;sfx("pop");if(tttEnd())return;g.busy=true;drawTTT(t("tttTiki"));
  timers.push(setTimeout(()=>{if(game!==g)return;const m=tttAiMove();if(m>=0)g.b[m]=g.ai;sfx("pop");g.busy=false;if(!tttEnd())drawTTT(t("tttYou"));},650));}
/* ---------- say it with me (microphone). The recording lives only in memory and is dropped on leaving. ---------- */
let MIC=null;
function micStop(){try{if(MIC){if(MIC.rec&&MIC.rec.state==="recording")MIC.rec.stop();if(MIC.stream)MIC.stream.getTracks().forEach(x=>x.stop());if(MIC.au)MIC.au.pause();if(MIC.url)URL.revokeObjectURL(MIC.url);cancelAnimationFrame(MIC.raf);if(MIC.src)MIC.src.disconnect();}}catch(e){}MIC=null;}
function talkInit(){game={tk:true,L:lvl("talk"),round:0,rounds:5};talkRound();}
function talkRound(){const g=game,useP=age!=="a"&&g.L>=3;
  const pool=useP?PHRASES.filter(p=>word(p).split(" ").length<=4):uniqEmoji(allWords()).filter(w=>!/\s/.test(word(w)));
  g.item=pool[rnd(0,pool.length-1)];g.state="idle";g.has=false;g.starred=false;g.err=false;
  if(MIC&&MIC.url){URL.revokeObjectURL(MIC.url);MIC.url=null;}
  drawTalk();speak(word(g.item));}
function drawTalk(){const g=game,el=document.getElementById("tkbox");if(!el)return;const w=word(g.item);
  el.innerHTML=`<div class="wcard tkcard"><span class="pic">${g.item[0]}</span><span class="word" style="font-size:clamp(28px,9vw,48px);text-align:center">${w}</span></div>
   ${lang==="ht"?`<p class="hint" style="text-align:center">${t("micParent")}</p>`:`<button class="say" data-tlisten="1" style="align-self:center">🔊 ${t("listen")}</button>`}
   <button class="mic${g.state==="rec"?" rec":""}" data-mic="1" aria-label="🎤">${g.state==="rec"?"⏹️":"🎤"}</button>
   <p class="fb${g.err?" no":""}" id="micfb" aria-live="polite">${g.err?t("micNo"):g.state==="rec"?t("micRec"):t("micTap")}</p>
   ${g.has?`<div class="nav" style="justify-content:center;gap:10px"><button data-micplay="1">▶️ ${t("micPlay")}</button><button data-micnext="1" style="background:var(--leaf)">⭐ ${t("next")} →</button></div>`:""}`;
  setScore2(`${g.round}/${g.rounds}`);}
async function micStart(){const g=game;if(!g.tk||g.state==="rec")return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||typeof MediaRecorder==="undefined"){g.err=true;drawTalk();return;}
  try{if(!MIC||!MIC.stream||MIC.stream.getTracks().every(x=>x.readyState==="ended")){const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      if(game!==g){stream.getTracks().forEach(x=>x.stop());return;}MIC={stream};}}
  catch(e){g.err=true;drawTalk();return;}
  if(MIC.au)MIC.au.pause();if(MIC.url){URL.revokeObjectURL(MIC.url);MIC.url=null;}
  let rec;try{rec=new MediaRecorder(MIC.stream);}catch(e){g.err=true;drawTalk();return;}
  const chunks=[];MIC.rec=rec;
  rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
  rec.onstop=()=>{cancelAnimationFrame(MIC&&MIC.raf);if(game!==g||!MIC)return;
    if(chunks.length){MIC.url=URL.createObjectURL(new Blob(chunks,{type:rec.mimeType||"audio/webm"}));g.has=true;if(!g.starred){g.starred=true;addStar();statOk();}}
    g.state="idle";drawTalk();micPlay();};
  rec.start();g.state="rec";g.err=false;drawTalk();
  try{const c=getCtx();if(c){if(!MIC.src){MIC.src=c.createMediaStreamSource(MIC.stream);MIC.an=c.createAnalyser();MIC.an.fftSize=256;MIC.src.connect(MIC.an);}
    const buf=new Uint8Array(MIC.an.fftSize);const loop=()=>{if(!MIC||g.state!=="rec")return;MIC.an.getByteTimeDomainData(buf);let m=0;for(const v of buf)m=Math.max(m,Math.abs(v-128));
      const b=document.querySelector(".mic.rec");if(b)b.style.transform=`scale(${1+Math.min(.35,m/90)})`;MIC.raf=requestAnimationFrame(loop);};loop();}}catch(e){}
  timers.push(setTimeout(()=>{if(game===g&&g.state==="rec")micEnd();},4000));}
function micEnd(){if(MIC&&MIC.rec&&MIC.rec.state==="recording")MIC.rec.stop();}
function micPlay(){if(!MIC||!MIC.url)return;try{if(MIC.au)MIC.au.pause();MIC.au=new Audio(MIC.url);const p=MIC.au.play();if(p&&p.catch)p.catch(()=>{});}catch(e){}}
function talkNext(){const g=game;if(!g.tk)return;if(MIC&&MIC.au)MIC.au.pause();g.round++;sfx("ok");if(g.round>=g.rounds){setScore2(`${g.round}/${g.rounds}`);levelWin("talk");}else talkRound();}
/* ---------- events ---------- */
function showErr(msg){try{let b=document.getElementById("errbox");if(!b){b=document.createElement("div");b.id="errbox";document.body.appendChild(b);}
  b.textContent="⚠️ "+String(msg).slice(0,160)+" (v"+APP_VERSION+")";b.hidden=false;clearTimeout(b._t);b._t=setTimeout(()=>{b.hidden=true;},9000);}catch(e){}}
window.addEventListener("error",e=>{const f=String(e.filename||"");const ours=!f||f===location.href||f.indexOf(location.host)>=0||f.startsWith("blob:")||f.startsWith("about:");if(!ours)return;showErr((e.message||"error")+(e.lineno?" @"+e.lineno+":"+e.colno:""));});
window.addEventListener("unhandledrejection",e=>showErr((e.reason&&e.reason.message)||e.reason||"promise"));
let tStart=null, lastTouchTap=0;
/* Phones: act on the finger lifting (touchend) so taps work even where an in-app browser drops clicks. */
document.addEventListener("touchstart",e=>{const t=pt(e,"touches");tStart=t?{x:t.clientX,y:t.clientY,el:e.target}:null;},{passive:true});
document.addEventListener("touchend",e=>{
  if(!tStart)return; const t=pt(e,"changedTouches"), st=tStart; tStart=null; if(!t)return;
  if(Math.hypot(t.clientX-st.x,t.clientY-st.y)>12)return;
  const el=st.el; if(!el||!el.closest||el.closest("#swrap")||el.closest(".bal"))return;
  const btn=el.closest("button"); if(!btn||btn.disabled)return;
  lastTouchTap=Date.now(); if(e.cancelable)e.preventDefault();
  try{onTap({target:el});}catch(err){showErr(err&&err.message||err);}
},{passive:false});
document.addEventListener("click",e=>{if(Date.now()-lastTouchTap<700)return;try{onTap(e);}catch(err){showErr(err&&err.message||err);}});
function onTap(e){
  const g=e.target.closest("[data-go]");
  if(g){stopAll(); const dest=g.dataset.go; if(dest==="globe"&&screen!=="haiti"){gC=-1;gS=0;} if(dest!=="haiti"&&dest!=="globe")fromGlobe=false;
    if(!["home","lang","age"].includes(dest)&&overLimit()){screen="limit";render();return;}
    if(isLocked(dest)){wantedK=dest;payErr=false;screen="paywall";render();return;}
    screen=dest; if(!["home","lang","age"].includes(dest)) statAct(dest);
    if(screen==="daily"){dailyStart();render();speak(q.say);return;}
    if((["count","add","sub","colors","find","shapes","body","cmp","mul","animals","clock"].includes(screen)||(screen==="days"&&age!=="a"))){newQ();render();speak(q.say);}
    else {if(screen==="phrases")pMode="learn"; if(screen==="stories")story=-1; render(); if(screen==="words")speak(word(themeList(theme)[wIdx])); if(screen==="age")speak(t("ageQ"));}
    return;}
  const l=e.target.closest("[data-lang]");
  if(l){lang=l.dataset.lang; save(); screen=age?"home":"age"; render(); speak(screen==="age"?t("ageQ"):""); return;}
  const ag=e.target.closest("[data-age]"); if(ag){age=ag.dataset.age; if(CURP){CURP.age=age;saveProfiles();} save(); screen="home"; render(); return;}
  const a=e.target.closest("[data-a]"); if(a){answer(a);return;}
  const mc=e.target.closest("[data-mc]"); if(mc){memFlip(+mc.dataset.mc);return;}
  const ag2=e.target.closest("[data-again]"); if(ag2){stopAll(); screen=ag2.dataset.again; render(); return;}
  const lvb=e.target.closest("[data-lv]"); if(lvb&&!lvb.disabled){stopAll();setLv(screen,lvl(screen)+ +lvb.dataset.lv);render();return;}
  const nx=e.target.closest("[data-nextlv]"); if(nx){const g=nx.dataset.nextlv;stopAll();setLv(g,lvl(g)+1);screen=g;render();return;}
  const rg=e.target.closest("[data-rg]"); if(rg){paintTap(+rg.dataset.rg);return;}
  const pcol=e.target.closest("[data-pcol]"); if(pcol&&game.pt){game.col=PAINTCOL[+pcol.dataset.pcol];document.querySelectorAll("[data-pcol]").forEach(b=>b.classList.toggle("on",b===pcol));const c=COLORS[+pcol.dataset.pcol];if(c)speak(c[WI[lang]]);sfx("pop");return;}
  const mz=e.target.closest("[data-mz]"); if(mz){const [dx,dy]=mz.dataset.mz.split(",").map(Number);mazeMove(dx,dy,false);return;}
  const mzc=e.target.closest("[data-mzc]"); if(mzc){mazeTap(+mzc.dataset.mzc);return;}
  const dtb=e.target.closest("[data-dt]"); if(dtb){dotTap(+dtb.dataset.dt,dtb);return;}
  const shi=e.target.closest("[data-shi]"); if(shi){shadowTap(+shi.dataset.shi,shi);return;}
  const dfb=e.target.closest("[data-df]"); if(dfb){diffTap(+dfb.dataset.df,dfb);return;}
  const ckb=e.target.closest("[data-ck]"); if(ckb){cookTap(ckb.dataset.ck,ckb);return;}
  if(e.target.closest("[data-mic]")){if(game.state==="rec")micEnd();else micStart();return;}
  if(e.target.closest("[data-micplay]")){micPlay();return;}
  if(e.target.closest("[data-micnext]")){talkNext();return;}
  if(e.target.closest("[data-tlisten]")){if(game.item)speak(word(game.item));return;}
  const gcb=e.target.closest("[data-gc]"); if(gcb){const i=+gcb.dataset.gc;stopAll();sfx("pop");if(COUNTRIES[i].haiti){fromGlobe=true;hIdx=0;screen="haiti";render();return;}gC=i;gS=0;render();speak(globeSlides(COUNTRIES[i])[0][1]);return;}
  const gxb=e.target.closest("[data-gx]"); if(gxb&&!gxb.disabled&&gC>=0){const sl=globeSlides(COUNTRIES[gC]);gS=Math.max(0,Math.min(sl.length-1,gS+ +gxb.dataset.gx));sfx("pop");render();speak(sl[gS][1]);return;}
  if(e.target.closest("[data-gdone]")){addStar();statOk();sfx("ok");confetti();cheer(t("theEnd")+"!");gC=-1;gS=0;render();return;}
  if(e.target.closest("[data-gback]")){stopAll();gC=-1;gS=0;render();return;}
  const rqb=e.target.closest("[data-rq]"); if(rqb){rqTap(+rqb.dataset.rq,rqb);return;}
  const szb=e.target.closest("[data-szi]"); if(szb){sizeTap(+szb.dataset.szi,szb);return;}
  const ttb=e.target.closest("[data-tt]"); if(ttb){tttTap(+ttb.dataset.tt);return;}
  const pat=e.target.closest("[data-pat]"); if(pat){patternTap(+pat.dataset.pat,pat);return;}
  const odb=e.target.closest("[data-odd]"); if(odb){oddTap(+odb.dataset.odd,odb);return;}
  const spl=e.target.closest("[data-spl]"); if(spl){spellTap(+spl.dataset.spl,spl);return;}
  const sim=e.target.closest("[data-sim]"); if(sim){simonTap(+sim.dataset.sim);return;}
  const hdb=e.target.closest("[data-hd]"); if(hdb){hiddenTap(+hdb.dataset.hd,hdb);return;}
  const mlb=e.target.closest("[data-ml]"); if(mlb){moleTap(+mlb.dataset.ml,mlb);return;}
  const sqb=e.target.closest("[data-sq]"); if(sqb){seqTap(+sqb.dataset.sq,sqb);return;}
  const tbb=e.target.closest("[data-tube]"); if(tbb){tubeTap(+tbb.dataset.tube);return;}
  if(e.target.closest("[data-sundo]")){const g=game;if(g.hist&&g.hist.length){g.tb=g.hist.pop();g.sel=-1;g.moves++;drawSort();}return;}
  const pg=e.target.closest("[data-parentgo]"); if(pg){stopAll();gateNew("parent");screen="gate";render();return;}
  if(e.target.closest("[data-pgate]")){const v=+(document.getElementById("pgate")||{}).value;if(v===gate.a+gate.b){if(gate.next==="trial"){if(!PREM.trialUsed){PREM.trial=Date.now();PREM.trialUsed=true;savePrem();confetti(120);cheer(t("tryFree")+" ✓");}screen=wantedK&&!isLocked(wantedK)?wantedK:"home";wantedK=null;}else screen=gate.next;render();}else{gate.err=true;render();}return;}
  if(e.target.closest("[data-trial]")){gateNew("trial");screen="gate";render();return;}
  if(e.target.closest("[data-code]")){const v=(document.getElementById("pcode")||{}).value||"";if(codeOk(v)){PREM.code=v.trim().toUpperCase();savePrem();sfx("ok");confetti(160);cheer(t("premOn"));screen=wantedK||"home";wantedK=null;render();}else{payErr=true;render();}return;}
  const lm=e.target.closest("[data-limit]"); if(lm){STATS.limit=+lm.dataset.limit;saveStats();render();return;}
  const pv=e.target.closest("[data-pv]"); if(pv){pvIdx=(pvIdx+ +pv.dataset.pv+PROVERBS.length)%PROVERBS.length;render();return;}
  const hx=e.target.closest("[data-hx]"); if(hx&&!hx.disabled){hIdx=Math.max(0,Math.min(HAITI.length-1,hIdx+ +hx.dataset.hx));render();sfx("pop");return;}
  if(e.target.closest("[data-hdone]")){addStar();statOk();sfx("ok");confetti();cheer(t("theEnd")+"!");hIdx=0;screen=fromGlobe?"globe":"home";render();return;}
  const tr=e.target.closest("[data-tr]"); if(tr){stopAll();trIdx=(trIdx+ +tr.dataset.tr+ALPHA[lang].length)%ALPHA[lang].length;render();return;}
  if(e.target.closest("[data-trclear]")){if(game.ic){game.ic.clearRect(0,0,game.S,game.S);game.done=false;const f=document.getElementById("trfb");if(f){f.textContent="";f.className="fb";}}return;}
  const pf=e.target.closest("[data-prof]"); if(pf){switchProfile(pf.dataset.prof);render();return;}
  const avb=e.target.closest("[data-av]"); if(avb){newKid.name=(document.getElementById("kidname")||{}).value||newKid.name;newKid.av=avb.dataset.av;render();return;}
  const kag=e.target.closest("[data-kage]"); if(kag){newKid.name=(document.getElementById("kidname")||{}).value||newKid.name;newKid.age=kag.dataset.kage;render();return;}
  if(e.target.closest("[data-addprof]")){const nm=((document.getElementById("kidname")||{}).value||"").trim().slice(0,20);if(!nm){const i=document.getElementById("kidname");if(i)i.focus();return;}
    const id="p"+Date.now().toString(36);PROFILES.push({id,name:nm,av:newKid.av,age:newKid.age});
    try{localStorage.setItem("tk-"+id+"-age",newKid.age);}catch(err){}
    newKid={name:"",av:AVATARS[(PROFILES.length)%AVATARS.length],age:"b"};saveProfiles();sfx("star");render();return;}
  const dp=e.target.closest("[data-delprof]"); if(dp){const id=dp.dataset.delprof;if(PROFILES.length<2)return;PROFILES=PROFILES.filter(p=>p.id!==id);
    ["age","stars","lv","daily","stats"].forEach(n=>{try{localStorage.removeItem(id==="p0"?"tk-"+n:"tk-"+id+"-"+n);}catch(err){}});
    if(CURP.id===id){CURP=PROFILES[0];loadProfile();} saveProfiles();render();return;}
  const ct=e.target.closest("[data-cat]"); if(ct){homeCat=ct.dataset.cat;render();return;}
  const th=e.target.closest("[data-theme]"); if(th){theme=th.dataset.theme;wIdx=0;render();speak(word(themeList(theme)[0]));return;}
  const pm=e.target.closest("[data-pmode]"); if(pm){pMode=pm.dataset.pmode;if(pMode==="test"){newQ();render();speak(q.say);}else render();return;}
  const pi=e.target.closest("[data-pi]"); if(pi){pIdx=(pIdx+ +pi.dataset.pi+PHRASES.length)%PHRASES.length;render();speak(PHRASES[pIdx][WI[lang]]);return;}
  const sto=e.target.closest("[data-story]"); if(sto){const v=+sto.dataset.story;
    if(v<0){addStar();sfx("ok");confetti();cheer(t("theEnd")+"!");story=-1;}else{story=v;sPage=0;}
    render(); if(story>=0)speak(STORIES[story].p[0][WI[lang]]); return;}
  const sp=e.target.closest("[data-sp]"); if(sp){sPage=Math.max(0,sPage+ +sp.dataset.sp);render();sfx("pop");speak(STORIES[story].p[sPage][WI[lang]]);return;}
  const lt=e.target.closest("[data-letter]");
  if(lt){game.letter=lt.dataset.letter;render();const w=alphaWord(game.letter);speak(game.letter+(w?". "+w[1]:""));return;}
  const dy=e.target.closest("[data-day]"); if(dy){speak(DAYS[lang][+dy.dataset.day]);sfx("pop");return;}
  const pc=e.target.closest("[data-pc]"); if(pc){pcTap(+pc.dataset.pc);return;}
  const nt=e.target.closest("[data-note]"); if(nt){note(+nt.dataset.note);return;}
  if(e.target.closest("[data-song]")){playSong();return;}
  const sn=e.target.closest("[data-snd]");
  if(sn){sound=!sound;try{localStorage.setItem("tk-snd",sound?"1":"0");}catch(err){}sn.textContent=sound?"🔊":"🔇 "+t("snd");sn.classList.toggle("off",!sound);sn.setAttribute("aria-pressed",sound);if(!sound)try{clearTimeout(sayT);if(speechSynthesis.speaking)speechSynthesis.cancel();}catch(err){}sfx("pop");return;}
  const col=e.target.closest("[data-col]");
  if(col&&game.cv){const c=COLORS[+col.dataset.col];game.col=c[0];document.querySelectorAll(".dot").forEach(b=>b.classList.toggle("on",b===col));speak(c[WI[lang]]);return;}
  const sz=e.target.closest("[data-sz]");
  if(sz&&game.cv){game.w=+sz.dataset.sz;document.querySelectorAll(".sz").forEach(b=>b.classList.toggle("on",b===sz));return;}
  if(e.target.closest("[data-clear]")&&game.cv){game.c.clearRect(0,0,game.cv.width,game.cv.height);speak(t("clear"));return;}
  if(e.target.closest("[data-sstart]")){if(game.cv&&!game.running)turn(game.dir);return;}
  const d=e.target.closest("[data-dir]"); if(d){turn(d.dataset.dir.split(",").map(Number));return;}
  const w=e.target.closest("[data-w]");
  if(w){const L=themeList(theme);wIdx=(wIdx+ +w.dataset.w+L.length)%L.length; render(); speak(word(L[wIdx])); return;}
  const n=e.target.closest("[data-n]");
  if(n){const k=+n.dataset.n; document.querySelectorAll(".board button").forEach(b=>b.classList.toggle("on",b===n));
    document.getElementById("numbig").textContent=`${k} · ${nw(k)}`; speak(nw(k)); return;}
  if(e.target.closest("[data-say]")){
    if(screen==="words") speak(word(themeList(theme)[wIdx]));
    else if(screen==="phrases"&&pMode==="learn") speak(PHRASES[pIdx][WI[lang]]);
    else if(screen==="stories"&&story>=0) speak(STORIES[story].p[sPage][WI[lang]]);
    else if(screen==="abc"){const L=game.letter||ALPHA[lang][0];const w=alphaWord(L);speak(L+(w?". "+w[1]:""));}
    else if(screen==="globe"){if(gC>=0)speak(globeSlides(COUNTRIES[gC])[gS][1]);else speak(t("globe"));}
    else if(screen==="nums"){const on=document.querySelector(".board .on"); speak(nw(+on.dataset.n));}
    else if(q) speak(q.say);
  }
}
document.addEventListener("keydown",e=>{
  if(screen!=="snake"&&screen!=="maze") return;
  const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];
  if(m){e.preventDefault();if(screen==="maze")mazeMove(m[0],m[1],false);else turn(m);}
});

initProfiles();
render();

/* ---------- offline + updates ---------- */
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  navigator.serviceWorker.register("sw.js").then(reg=>{
    reg.addEventListener("updatefound",()=>{const w=reg.installing;w&&w.addEventListener("statechange",()=>{
      if(w.state==="installed"&&navigator.serviceWorker.controller){const b=document.createElement("button");b.className="update";b.textContent="🔄 "+({ht:"Nouvo vèsyon! Peze pou mete ajou",en:"New version! Tap to update",fr:"Nouvelle version ! Touche pour mettre à jour",es:"¡Nueva versión! Toca para actualizar"}[lang||"ht"]);b.onclick=()=>{w.postMessage("skip");};document.body.appendChild(b);}});});
  }).catch(()=>{});
  let reloaded=false;navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!reloaded){reloaded=true;location.reload();}});
}
