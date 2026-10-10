const APP_VERSION="1.1.3";
/* ---------- state ---------- */
let lang=null, age=null, screen="lang", stars=0, wIdx=0, theme="mix", pIdx=0, pMode="learn", story=-1, sPage=0, q=null, locked=false, timers=[], game={};
try{lang=localStorage.getItem("tk-lang")||null; age=localStorage.getItem("tk-age")||null; stars=+localStorage.getItem("tk-stars")||0;}catch(e){}
if(lang&&age) screen="home"; else if(lang) screen="age";
let LV={}; try{LV=JSON.parse(localStorage.getItem("tk-lv")||"{}")||{};}catch(e){LV={};}
const LVGAMES=["mem","snake","balloon","puzzle","sort"];
const lvKey=g=>`${age||"b"}-${g}`;
const lvl=g=>(LV[lvKey(g)]||{cur:1}).cur;
const lvMax=g=>(LV[lvKey(g)]||{max:1}).max||1;
function setLv(g,cur){const k=lvKey(g);const o=LV[k]||{cur:1,max:1};o.cur=Math.max(1,Math.min(cur,o.max||1));LV[k]=o;try{localStorage.setItem("tk-lv",JSON.stringify(LV));}catch(e){}}
function unlockNext(g){const k=lvKey(g);const o=LV[k]||{cur:1,max:1};o.max=Math.max(o.max||1,o.cur+1);LV[k]=o;try{localStorage.setItem("tk-lv",JSON.stringify(LV));}catch(e){}}
const save=()=>{try{localStorage.setItem("tk-lang",lang||"");localStorage.setItem("tk-age",age||"");localStorage.setItem("tk-stars",stars);}catch(e){}};
const t=k=>UI[lang||"ht"][k];
const A=()=>AGES[age||"b"];
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,r)=>p[0]-r[0]).map(x=>x[1]);
const word=w=>w[WI[lang]];
const nw=n=>numWord(n,lang);
const addStar=(k=1)=>{const before=Math.floor(stars/10);stars+=k;save();if(Math.floor(stars/10)>before){setTimeout(()=>{confetti(140);cheer("🏆");},300);}const s=document.querySelector(".pill span");if(s)s.textContent=stars;};
function stopTimersOnly(){timers.forEach(x=>{clearInterval(x);clearTimeout(x);});timers=[];}
function stopAll(){timers.forEach(x=>{clearInterval(x);clearTimeout(x);});timers=[];game={};try{speechSynthesis.cancel();}catch(e){}}

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
let actx=null;
function sfx(kind){
  if(!sound) return;
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const now=actx.currentTime;
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
function speak(text){
  try{
    const s=window.speechSynthesis; if(!s||!text||lang==="ht"||!sound) return; s.cancel();
    const u=new SpeechSynthesisUtterance(text); const pref=LANGS[lang].voice; const vs=s.getVoices(); let v=null;
    for(const p of pref){v=vs.find(x=>x.lang&&x.lang.toLowerCase().startsWith(p.toLowerCase())); if(v)break;}
    if(v){u.voice=v;u.lang=v.lang;} else u.lang=pref[0];
    u.rate=.85; s.speak(u);
  }catch(e){}
}

/* ---------- views ---------- */
const $app=document.getElementById("app");
const logo=`<div class="logo" aria-label="Mundiko">${"Mundiko".split("").map(c=>`<i>${c}</i>`).join("")}</div>`;
function bar(){
  return `<div class="bar">${logo}<div class="bar-r">
   ${lang?`<button class="chip" data-go="lang">${LANGS[lang].name}</button>`:""}
   ${age?`<button class="chip" data-go="age">${A().e} ${A().label} ${t("yrs")}</button>`:""}
   <button class="chip${sound?"":" off"}" data-snd="1" aria-label="${t("snd")}" aria-pressed="${sound}">${sound?"🔊":"🔇 "+t("snd")}</button>
   <div class="chip pill">⭐ <span>${stars}</span></div></div></div>`;
}
const flag=c=>`<span class="flagbar">${c.map(x=>`<i style="background:${x}"></i>`).join("")}</span>`;
let homeCat="all";
const CATS={all:["✨","catAll"],play:["🎮","catPlay"],lang:["📖","catLang"],math:["🔢","catMath"],world:["🌍","catWorld"]};
const PLAYS=["mem","snake","balloon","sort","puzzle","draw","music"];
const CATOF={phrases:"lang",stories:"lang",words:"lang",abc:"lang",find:"lang",count:"math",add:"math",sub:"math",mul:"math",cmp:"math",nums:"math",colors:"world",shapes:"world",body:"world",animals:"world",days:"world",clock:"world"};
const GAMEINFO={phrases:["💬","c-sky"],stories:["📚","c-grape"],abc:["🔠","c-amber"],animals:["🐮","c-leaf"],days:["📅","c-sky"],clock:["⏰","c-grape"],puzzle:["🧩","c-sky"],music:["🎹","c-rose"],words:["🔤","c-coral"],count:["🖐️","c-sky"],add:["➕","c-leaf"],sub:["➖","c-rose"],colors:["🎨","c-grape"],find:["👂","c-amber"],nums:["🔢","c-ink"],shapes:["🔷","c-teal"],body:["👃","c-coral"],cmp:["⚖️","c-sky"],mul:["✖️","c-rose"],draw:["🖍️","c-teal"],
  mem:["🃏","c-grape"],sort:["🧪","c-amber"],snake:["🐍","c-leaf"],balloon:["🎈","c-coral"]};
const tile=k=>`<button class="game ${GAMEINFO[k][1]}" data-go="${k}"><span class="e" aria-hidden="true">${GAMEINFO[k][0]}</span><b>${t(k)}</b><small>${t(k+"S").replace("{n}",A().nums)}</small></button>`;

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
      <div class="cats" role="group">${Object.keys(CATS).map(k=>`<button class="cat" data-cat="${k}" aria-pressed="${homeCat===k}">${CATS[k][0]} ${t(CATS[k][1])}</button>`).join("")}</div>
      ${["play","lang","math","world"].filter(k=>homeCat==="all"||homeCat===k).map(k=>{const items=k==="play"?PLAYS:A().learn.filter(g=>CATOF[g]===k);
        return items.length?`<h3>${CATS[k][0]} ${t(CATS[k][1])}</h3><div class="games">${items.map(tile).join("")}</div>`:"";}).join("")}</section>`;
  } else {
    h+=`<section class="card">${playTop()}${play()}</section>`;
  }
  h+=`<p class="foot">Mundiko · v${APP_VERSION} · <a href="privacy.html">Privacy</a></p>`;
  $app.innerHTML=h;
  if(screen==="snake") snakeInit();
  if(screen==="balloon") balloonInit();
  if(screen==="draw") drawInit();
  if(screen==="puzzle") puzzleInit();
  if(screen==="sort") sortInit();
}
function playTop(){
  const right=["puzzle","music"].includes(screen)?`<span class="score" id="score"></span>`:screen==="draw"?`<button class="say" data-clear="1">🧽 ${t("clear")}</button>`:["mem","snake","balloon","sort"].includes(screen)?`<span class="score" id="score"></span>`:lang==="ht"?`<span class="soon">🔈 Vwa kreyòl: byento</span>`:`<button class="say" data-say="1">🔊 ${t("listen")}</button>`;
  const lvBar=LVGAMES.includes(screen)?`<div class="lvbar"><button data-lv="-1" ${lvl(screen)<=1?"disabled":""} aria-label="-">◀</button><b>${t("level")} ${lvl(screen)}</b><button data-lv="1" ${lvl(screen)>=lvMax(screen)?"disabled":""} aria-label="+">▶</button></div>`:"";
  return `<div class="top"><button class="back" data-go="home">← ${t("back")}</button>${right}</div>${lvBar}`;
}

/* ---------- learning games ---------- */
function opts3(n,min,max){const s=new Set([n]);const spread=max>30?10:3;let g=0;while(s.size<3&&g<200){g++;const x=n+rnd(-spread,spread);if(x>=min&&x<=max)s.add(x);}return shuffle([...s]);}
function newQ(){
  locked=false; const a=A(); const e=ITEMS[rnd(0,ITEMS.length-1)];
  if(screen==="count"){const n=rnd(a.count[0],a.count[1]);q={n,e,ans:n,opts:opts3(n,a.count[0],a.count[1]),say:t("qCount")};}
  if(screen==="add"){let x,y; if(a.add<=10){x=rnd(1,a.add-1);y=rnd(1,a.add-x);} else {x=rnd(5,a.add-10);y=rnd(1,Math.min(20,a.add-x));}
    q={x,y,e,ans:x+y,opts:opts3(x+y,2,a.add),say:`${nw(x)} + ${nw(y)}. ${t("qAdd")}`};}
  if(screen==="sub"){const x=rnd(3,a.sub),y=rnd(1,Math.min(x-1,20));q={x,y,e,ans:x-y,opts:opts3(x-y,0,a.sub),say:`${nw(x)} − ${nw(y)}. ${t("qSub")}`};}
  if(screen==="colors"){const c=shuffle(COLORS).slice(0,4);const ans=rnd(0,3);q={c,ans,say:t("qColor").replace("{x}",c[ans][WI[lang]].toLowerCase())};}
  if(screen==="shapes"){const n=age==="a"?3:4;const sh=shuffle(SHAPES.slice(0,age==="a"?4:7)).slice(0,n);const ans=rnd(0,n-1);q={sh,ans,cols:shuffle(SHAPECOL),say:t("qShape").replace("{x}",sh[ans][WI[lang]].toLowerCase())};}
  if(screen==="body"){const n=age==="a"?3:4;const bd=shuffle(BODY).slice(0,n);const ans=rnd(0,n-1);q={bd,ans,say:t("qBody").replace("{x}",bd[ans][WI[lang]].toLowerCase())};}
  if(screen==="cmp"){const max=age==="c"?100:20;let x=rnd(1,max),y;do{y=rnd(1,max);}while(y===x);q={x,y,ans:Math.max(x,y),say:t("qCmp")};}
  if(screen==="mul"){const x=[2,3,5,10][rnd(0,3)],y=rnd(1,x===10?10:6);const p=x*y;const s2=new Set([p]);while(s2.size<3){const d=p+[-x,x,-1,1,2*x][rnd(0,4)];if(d>0)s2.add(d);}
    q={x,y,e:ITEMS[rnd(0,ITEMS.length-1)],ans:p,opts:shuffle([...s2]),say:`${nw(y)} × ${nw(x)}. ${t("qAdd")}`};}
  if(screen==="phrases"){const ph=shuffle(PHRASES).slice(0,3);const ans=rnd(0,2);q={ph,ans,say:t("qPhrase")};}
  if(screen==="animals"){const n=age==="a"?3:4;const an=shuffle(ANIMALS).slice(0,n);const ans=rnd(0,n-1);q={an,ans,say:t("qAnimal").replace("{x}",an[ans][SI[lang]])};}
  if(screen==="days"){const d=rnd(0,6);const ans=(d+1)%7;const o=new Set([ans]);while(o.size<3)o.add(rnd(0,6));o.delete(d);while(o.size<3){const x=rnd(0,6);if(x!==d)o.add(x);}
    q={d,ans,opts:shuffle([...o]),say:t("qDay").replace("{x}",["fr","es"].includes(lang)?DAYS[lang][d].toLowerCase():DAYS[lang][d])};}
  if(screen==="clock"){const mins=age==="c"?[0,15,30,45]:[0];const h=rnd(1,12),m=mins[rnd(0,mins.length-1)];const f=(H,M)=>`${H}:${String(M).padStart(2,"0")}`;
    const o=new Set([f(h,m)]);while(o.size<3){const H=rnd(1,12),M=mins[rnd(0,mins.length-1)];o.add(f(H,M));}
    q={h,m,ans:f(h,m),opts:shuffle([...o]),say:t("qClock")};}
  if(screen==="find"){const w=shuffle(themeList(theme)).slice(0,age==="a"?3:4);const ans=rnd(0,w.length-1);q={w,ans,say:t("qFind").replace("{x}",word(w[ans]))};}
}
function blocks(n){const tens=Math.floor(n/10),ones=n%10;
  return `<div class="blocks" aria-label="${n}">${Array.from({length:tens},()=>`<span class="ten">${"<i></i>".repeat(10)}</span>`).join("")}<span class="ones">${'<span class="one"></span>'.repeat(ones)}</span></div>`;}
const pics=(e,n,wide)=>n>20?blocks(n):`<div class="group${wide?" wide":""}">${e.repeat(n)}</div>`;
const numOpts=()=>`<div class="opts">${q.opts.map(n=>`<button class="opt" data-a="${n}"><span class="n">${n}</span><span class="w">${nw(n)}</span></button>`).join("")}</div>`;
const fb=`<p class="fb" id="fb" aria-live="polite"></p>`;

function play(){
  if(screen==="words"){
    const L=themeList(theme); if(wIdx>=L.length) wIdx=0; const w=L[wIdx], txt=word(w);
    const chips=`<div class="cats">${TORDER.map(k=>`<button class="cat" data-theme="${k}" aria-pressed="${k===theme}">${TEMOJI[k]} ${TNAME[k][LI[lang]]}</button>`).join("")}</div>`;
    const others=Object.keys(WI).filter(k=>k!==lang).map(k=>`<span>${LANGS[k].name}: ${w[WI[k]]}</span>`).join("");
    return `${chips}<button class="wcard" data-say="1" aria-label="${txt}"><span class="pic">${w[0]}</span><span class="word"><span>${txt[0]}</span>${txt.slice(1)}</span></button>
      <div class="others">${others}</div>
      <div class="nav"><button data-w="-1">← ${t("prev")}</button><output>${wIdx+1} / ${L.length}</output><button data-w="1">${t("next")} →</button></div>`;
  }
  if(screen==="nums"){const N=A().nums;
    return `<h2 id="numbig">1 · ${nw(1)}</h2><div class="board ${N>20?"b10":""}">${Array.from({length:N},(_,i)=>`<button data-n="${i+1}" class="${i===0?"on":""}${(i+1)%10===0&&N>20?" ten-row":""}">${i+1}</button>`).join("")}</div>`;}
  if(screen==="count") return `<h2>${q.say}</h2><div class="stage">${pics(q.e,q.n,true)}</div>${numOpts()}${fb}`;
  if(screen==="add") return `<h2>${t("qAdd")}</h2><div class="stage">${pics(q.e,q.x)}<span class="op">+</span>${pics(q.e,q.y)}</div><div class="stage"><span class="op">${q.x} + ${q.y} = ?</span></div>${numOpts()}${fb}`;
  if(screen==="sub"&&q.x>20) return `<h2>${t("qSub")}</h2><div class="stage">${blocks(q.x)}</div><div class="stage"><span class="op">${q.x} − ${q.y} = ?</span></div>${numOpts()}${fb}`;
  if(screen==="sub") return `<h2>${t("qSub")}</h2><div class="stage"><div class="group wide">${q.e.repeat(q.x-q.y)}<span style="opacity:.22">${q.e.repeat(q.y)}</span></div></div><div class="stage"><span class="op">${q.x} − ${q.y} = ?</span></div>${numOpts()}${fb}`;
  if(screen==="colors") return `<h2>${q.say}</h2><div class="opts four">${q.c.map((c,i)=>`<button class="opt" data-a="${i}" aria-label="${c[WI[lang]]}"><span class="swatch" style="background:${c[0]}"></span></button>`).join("")}</div>${fb}`;
  if(screen==="shapes") return `<h2>${q.say}</h2><div class="opts ${q.sh.length===4?"four":""}">${q.sh.map((x,i)=>`<button class="opt" data-a="${i}" aria-label="${x[WI[lang]]}">${shapeSVG(x[0],q.cols[i])}</button>`).join("")}</div>${fb}`;
  if(screen==="body") return `<h2>${q.say}</h2><div class="opts ${q.bd.length===4?"four":""}">${q.bd.map((x,i)=>`<button class="opt" data-a="${i}" aria-label="${x[WI[lang]]}"><span class="big">${x[0]}</span></button>`).join("")}</div>${fb}`;
  if(screen==="cmp") return `<h2>${q.say}</h2><div class="opts four">${[q.x,q.y].map(n=>`<button class="opt" data-a="${n}"><span class="n" style="font-size:56px">${n}</span><span class="w">${nw(n)}</span>${n<=20?`<span style="font-size:13px;line-height:1.1;max-width:100%;overflow-wrap:anywhere;color:var(--sky)">${"●".repeat(n)}</span>`:""}</button>`).join("")}</div>${fb}`;
  if(screen==="mul") return `<h2>${t("qAdd")}</h2><div class="stage">${Array.from({length:q.y},()=>`<div class="group" style="max-width:30%;font-size:${q.x>5?"16px":"22px"}">${q.e.repeat(q.x)}</div>`).join("")}</div><div class="stage"><span class="op">${q.y} × ${q.x} = ?</span></div>${numOpts()}${fb}`;
  if(screen==="draw") return `<div class="snakewrap"><canvas id="dcv" width="600" height="600" style="background:#fff;border:3px solid var(--line)"></canvas></div>
    <div class="pal">${COLORS.map((c,i)=>`<button class="dot${i===1?" on":""}" data-col="${i}" style="background:${c[0]}" aria-label="${c[WI[lang]]}"></button>`).join("")}</div>
    <div class="pal">${[6,14,26].map((w,i)=>`<button class="sz${i===1?" on":""}" data-sz="${w}" aria-label="${w}"><i style="width:${w}px;height:${w}px"></i></button>`).join("")}</div>`;
  if(screen==="abc"){const L=ALPHA[lang];const cur=game.letter||L[0];const w=alphaWord(cur);
    return `<button class="wcard" data-say="1"><span class="word" style="font-size:72px">${cur} ${cur.toLowerCase()}</span>${w?`<span class="pic" style="font-size:72px">${w[0]}</span><span class="word" style="font-size:34px"><span>${w[1].slice(0,cur.length)}</span>${w[1].slice(cur.length)}</span>`:""}</button>
      <div class="board" style="grid-template-columns:repeat(6,minmax(0,1fr))">${L.map(x=>`<button data-letter="${x}" class="${x===cur?"on":""}">${x}</button>`).join("")}</div>`;}
  if(screen==="phrases"){
    const tabs=`<div class="cats"><button class="cat" data-pmode="learn" aria-pressed="${pMode==="learn"}">📖 ${t("learn")}</button><button class="cat" data-pmode="test" aria-pressed="${pMode==="test"}">❓ ${t("testM")}</button></div>`;
    if(pMode==="learn"){const ph=PHRASES[pIdx];
      return `${tabs}<button class="wcard" data-say="1"><span class="pic">${ph[0]}</span><span class="word" style="font-size:clamp(28px,8vw,44px);text-align:center;text-wrap:balance">${ph[WI[lang]]}</span></button>
        <p class="hint" style="text-align:center;font-weight:800">${t("otherL")}</p><div class="others">${Object.keys(WI).filter(k=>k!==lang).map(k=>`<span>${LANGS[k].name}: ${ph[WI[k]]}</span>`).join("")}</div>
        <div class="nav"><button data-pi="-1">← ${t("prev")}</button><output>${pIdx+1} / ${PHRASES.length}</output><button data-pi="1">${t("next")} →</button></div>`;}
    return `${tabs}<div class="stage" style="font-size:80px">${q.ph[q.ans][0]}</div><h2>${t("qPhrase")}</h2>
      <div class="opts" style="grid-template-columns:1fr">${q.ph.map((x,i)=>`<button class="opt" data-a="${i}" style="min-height:58px"><span class="w" style="font-size:19px;color:var(--ink)">${x[WI[lang]]}</span></button>`).join("")}</div>${fb}`;}
  if(screen==="stories"){
    if(story<0) return `<div class="games">${STORIES.map((st,i)=>`<button class="game ${["c-coral","c-sky","c-leaf"][i%3]}" data-story="${i}"><span class="e">${st.e}</span><b>${st.t[LI[lang]]}</b><small>${st.p.length} ${t("pages")}</small></button>`).join("")}</div>`;
    const st=STORIES[story], last=sPage===st.p.length-1, pg=st.p[sPage];
    return `<h2>${st.t[LI[lang]]}</h2><div class="book"><div class="pic">${pg[0]}</div><p class="line">${pg[WI[lang]]}</p>
      <details><summary>${t("otherL")}</summary><div class="others" style="margin-top:8px">${Object.keys(WI).filter(k=>k!==lang).map(k=>`<span>${LANGS[k].name}: ${pg[WI[k]]}</span>`).join("")}</div></details></div>
      <div class="dots">${st.p.map((_,i)=>`<i class="${i===sPage?"on":""}"></i>`).join("")}</div>
      <div class="nav"><button data-sp="-1" ${sPage===0?"disabled":""}>← ${t("prev")}</button>${last?`<button data-story="-1" style="background:var(--leaf)">⭐ ${t("theEnd")}</button>`:`<button data-sp="1">${t("next")} →</button>`}</div>`;}
  if(screen==="animals") return `<h2>${q.say}</h2><div class="opts ${q.an.length===4?"four":""}">${q.an.map((x,i)=>`<button class="opt" data-a="${i}" aria-label="${x[WI[lang]]}"><span class="big">${x[0]}</span><span class="w">${x[WI[lang]]}</span></button>`).join("")}</div>${fb}`;
  if(screen==="days"){const today=(new Date().getDay()+6)%7;
    const DC=["#E53935","#FB8C00","#F2B705","#2E9E4F","#13A3A3","#1E63D6","#7E3FD0"];
    const row=`<div class="week">${DAYS[lang].map((d,i)=>`<button class="day${i===today?" today":""}" data-day="${i}" style="--dc:${DC[i]};color:${i===2?"#24305E":"#fff"}"><span class="num">${i+1}</span><b>${d}</b>${i===today?`<small>⭐ ${t("today")}</small>`:""}</button>`).join("")}</div>`;
    if(age==="a") return `<h2>${t("today")}${lang==="fr"?" :":":"} ${["fr","es"].includes(lang)?DAYS[lang][today].toLowerCase():DAYS[lang][today]}</h2>${row}`;
    return `<h2>${q.say}</h2><div class="opts">${q.opts.map(i=>`<button class="opt" data-a="${i}"><span class="w" style="font-size:18px;color:var(--ink)">${DAYS[lang][i]}</span></button>`).join("")}</div>${fb}${row}`;}
  if(screen==="clock"){const ha=((q.h%12)+q.m/60)*30, ma=q.m*6;
    const ticks=Array.from({length:12},(_,i)=>{const a=(i+1)*30*Math.PI/180;return `<text x="${100+72*Math.sin(a)}" y="${100-72*Math.cos(a)+7}" text-anchor="middle" font-size="20" font-weight="800" fill="#24305E" font-family="Baloo 2,sans-serif">${i+1}</text>`;}).join("");
    return `<h2>${q.say}</h2><div class="stage"><svg viewBox="0 0 200 200" width="210" height="210" role="img" aria-label="clock"><circle cx="100" cy="100" r="94" fill="#fff" stroke="#24305E" stroke-width="6"/>${ticks}
      <line x1="100" y1="100" x2="${100+46*Math.sin(ha*Math.PI/180)}" y2="${100-46*Math.cos(ha*Math.PI/180)}" stroke="#FF6B5B" stroke-width="9" stroke-linecap="round"/>
      <line x1="100" y1="100" x2="${100+70*Math.sin(ma*Math.PI/180)}" y2="${100-70*Math.cos(ma*Math.PI/180)}" stroke="#2F80ED" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="100" r="7" fill="#24305E"/></svg></div>
      <div class="opts">${q.opts.map(x=>`<button class="opt" data-a="${x}"><span class="n" style="font-size:34px">${x}</span></button>`).join("")}</div>${fb}`;}
  if(screen==="puzzle") return `<p class="hint" style="text-align:center">${t("tapTwo")}</p><div class="pz" id="pz"></div><img id="pzprev" alt="" style="width:90px;border-radius:12px;align-self:center;border:3px solid var(--line)">`;
  if(screen==="music"){const lab=lang==="en"?["C","D","E","F","G","A","B","C"]:["Do","Re","Mi","Fa",lang==="ht"?"Sòl":"Sol","La","Si","Do"];
    return `<div class="piano">${NOTES.map((f,i)=>`<button class="key" data-note="${i}" style="background:${NOTECOL[i]}"><span>${lab[i]}</span></button>`).join("")}</div>
      <div class="nav" style="justify-content:center"><button data-song="1">🎵 ${t("song")}</button></div>`;}
  if(screen==="find") return `<h2>${q.say}</h2><div class="opts ${q.w.length===4?"four":""}">${q.w.map((w,i)=>`<button class="opt" data-a="${i}" aria-label="${word(w)}"><span class="big">${w[0]}</span></button>`).join("")}</div>${fb}`;
  if(screen==="mem") return memView();
  if(screen==="sort") return `<p class="hint" style="text-align:center">${t("sortS")}</p><div class="sortbox" id="sortbox"></div>
    <div class="nav" style="justify-content:center;gap:10px"><button id="sundo" data-sundo="1">↩ ${t("undo")}</button><button data-again="sort" style="background:var(--coral)">🔄 ${t("restart")}</button></div>`;
  if(screen==="snake") return `<h2 id="shint" style="font-size:22px"></h2><div class="snakewrap" id="swrap"><canvas id="cv" width="480" height="480"></canvas><div class="over" id="sover"><b>🐍</b><button class="go big" data-sstart="1">▶ ${t("start")}</button><span>${t("swipeHint")}</span></div></div>
    <div class="pad"><button class="u" data-dir="0,-1" aria-label="Up">▲</button><button class="l" data-dir="-1,0" aria-label="Left">◀</button><button class="d" data-dir="0,1" aria-label="Down">▼</button><button class="r" data-dir="1,0" aria-label="Right">▶</button></div>`;
  if(screen==="balloon") return `<h2 id="bhint" style="font-size:22px"></h2><div class="sky" id="sky"></div>`;
  return "";
}
function answer(btn){
  if(locked) return;
  const v=screen==="clock"?btn.dataset.a:+btn.dataset.a, f=document.getElementById("fb");
  if(v===q.ans){
    locked=true; btn.classList.add("ok"); addStar(); sfx("ok"); confetti(); cheer(t("ok"));
    f.className="fb ok"; f.textContent="⭐ "+t("ok");
    const said=screen==="phrases"?q.ph[q.ans][WI[lang]]:screen==="animals"?q.an[q.ans][WI[lang]]+". "+q.an[q.ans][SI[lang]]:screen==="days"?DAYS[lang][q.ans]:screen==="clock"?q.ans:screen==="shapes"?q.sh[q.ans][WI[lang]]:screen==="body"?q.bd[q.ans][WI[lang]]:screen==="colors"?q.c[q.ans][WI[lang]]:screen==="find"?word(q.w[q.ans]):nw(q.ans);
    speak(said+". "+t("ok"));
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
  wrap.addEventListener("touchstart",e=>{lastTouch=Date.now();const p=e.touches[0];begin(p.clientX,p.clientY);if(e.cancelable)e.preventDefault();},{passive:false});
  wrap.addEventListener("touchmove",e=>{const p=e.touches[0];move(p.clientX,p.clientY);if(e.cancelable)e.preventDefault();},{passive:false});
  wrap.addEventListener("touchend",e=>{const p=e.changedTouches[0];end(p.clientX,p.clientY);if(e.cancelable)e.preventDefault();},{passive:false});
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
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const now=actx.currentTime;
    [1,2].forEach((mult,k)=>{const o=actx.createOscillator(),gn=actx.createGain();o.type=k?"sine":"triangle";o.frequency.value=NOTES[i]*mult;
      gn.gain.setValueAtTime(.0001,now);gn.gain.exponentialRampToValueAtTime(k?.05:.25,now+.02);gn.gain.exponentialRampToValueAtTime(.0001,now+dur);
      o.connect(gn).connect(actx.destination);o.start(now);o.stop(now+dur+.05);});
  }catch(e){}
  const k=document.querySelector(`[data-note="${i}"]`); if(k){k.classList.add("hit");setTimeout(()=>k.classList.remove("hit"),180);}
}
function playSong(){let t0=0;SONG.forEach(i=>{if(i>=0)timers.push(setTimeout(()=>note(i,.45),t0));t0+=i<0?250:420;});}
/* ---------- level win / fail ---------- */
function levelWin(g){
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
/* ---------- events ---------- */
document.addEventListener("click",e=>{
  const g=e.target.closest("[data-go]");
  if(g){stopAll(); screen=g.dataset.go;
    if((["count","add","sub","colors","find","shapes","body","cmp","mul","animals","clock"].includes(screen)||(screen==="days"&&age!=="a"))){newQ();render();speak(q.say);}
    else {if(screen==="phrases")pMode="learn"; if(screen==="stories")story=-1; render(); if(screen==="words")speak(word(themeList(theme)[wIdx])); if(screen==="age")speak(t("ageQ"));}
    return;}
  const l=e.target.closest("[data-lang]");
  if(l){lang=l.dataset.lang; save(); screen=age?"home":"age"; render(); speak(screen==="age"?t("ageQ"):""); return;}
  const ag=e.target.closest("[data-age]"); if(ag){age=ag.dataset.age; save(); screen="home"; render(); return;}
  const a=e.target.closest("[data-a]"); if(a){answer(a);return;}
  const mc=e.target.closest("[data-mc]"); if(mc){memFlip(+mc.dataset.mc);return;}
  const ag2=e.target.closest("[data-again]"); if(ag2){stopAll(); screen=ag2.dataset.again; render(); return;}
  const lvb=e.target.closest("[data-lv]"); if(lvb&&!lvb.disabled){stopAll();setLv(screen,lvl(screen)+ +lvb.dataset.lv);render();return;}
  const nx=e.target.closest("[data-nextlv]"); if(nx){const g=nx.dataset.nextlv;stopAll();setLv(g,lvl(g)+1);screen=g;render();return;}
  const tbb=e.target.closest("[data-tube]"); if(tbb){tubeTap(+tbb.dataset.tube);return;}
  if(e.target.closest("[data-sundo]")){const g=game;if(g.hist&&g.hist.length){g.tb=g.hist.pop();g.sel=-1;g.moves++;drawSort();}return;}
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
  if(sn){sound=!sound;try{localStorage.setItem("tk-snd",sound?"1":"0");}catch(err){}sn.textContent=sound?"🔊":"🔇 "+t("snd");sn.classList.toggle("off",!sound);sn.setAttribute("aria-pressed",sound);if(!sound)try{speechSynthesis.cancel();}catch(err){}sfx("pop");return;}
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
    else if(screen==="nums"){const on=document.querySelector(".board .on"); speak(nw(+on.dataset.n));}
    else if(q) speak(q.say);
  }
});
document.addEventListener("keydown",e=>{
  if(screen!=="snake") return;
  const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[e.key];
  if(m){e.preventDefault();turn(m);}
});
try{speechSynthesis.onvoiceschanged=()=>{};}catch(e){}
render();

/* ---------- offline + updates ---------- */
if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  navigator.serviceWorker.register("sw.js").then(reg=>{
    reg.addEventListener("updatefound",()=>{const w=reg.installing;w&&w.addEventListener("statechange",()=>{
      if(w.state==="installed"&&navigator.serviceWorker.controller){const b=document.createElement("button");b.className="update";b.textContent="🔄 "+({ht:"Nouvo vèsyon! Peze pou mete ajou",en:"New version! Tap to update",fr:"Nouvelle version ! Touche pour mettre à jour",es:"¡Nueva versión! Toca para actualizar"}[lang||"ht"]);b.onclick=()=>{w.postMessage("skip");};document.body.appendChild(b);}});});
  }).catch(()=>{});
  let reloaded=false;navigator.serviceWorker.addEventListener("controllerchange",()=>{if(!reloaded){reloaded=true;location.reload();}});
}
