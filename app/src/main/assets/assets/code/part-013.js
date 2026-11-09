
(() => {
'use strict';
const INDEX = {"idlewalk_00":0,"idlewalk_01":1,"idlewalk_02":2,"idlewalk_03":3,"idlewalk_04":4,"idlewalk_05":5,"idlewalk_06":6,"idlewalk_08":7,"idlewalk_09":8,"idlewalk_10":9,"combat_00":10,"combat_01":11,"combat_02":12,"combat_03":13,"combat_04":14,"combat_05":15,"combat_06":16,"combat_07":17,"combat_08":18,"combat_09":19,"combat_10":20,"combat_11":21,"seals_00":22,"seals_01":23,"seals_02":24,"seals_03":25,"seals_04":26,"seals_05":27,"seals_06":28,"seals_07":29,"seals_08":30,"seals_09":31,"seals_10":32,"seals_11":33,"special_00":34,"special_01":35,"special_02":36,"special_03":37,"special_04":38,"special_05":39,"special_06":40,"special_07":41,"special_08":42,"special_09":43,"special_10":44,"special_11":45};
const FRAME_W=270, FRAME_H=270, COLS=8;
const atlas = new Image();
atlas.src='assets/a5c90111de42ab3609d23008.webp';
const previewSrc='assets/c0400fcc043dbf3cb748f4d9.webp';
const VARIANT_NAMES=["Универсал", "Мечник", "Разведчик", "Штурмовик", "Защитник", "Техник"];
const VARIANT_URLS=["assets/b273f36ade21ac8d901b70cf.webp", "assets/f0d187cd9d3456a8c7ad910b.webp", "assets/ec8303019558df9fb698ed67.webp", "assets/73f4e85ea47e3da12854d53d.webp", "assets/d79c34a816837834e88cb466.webp", "assets/ca982908484f115dc690fd4f.webp"];
const variantAtlases=VARIANT_URLS.map(url=>{const im=new Image();im.src=url;return im});
const groups={
 'Стойка':['idlewalk_00','idlewalk_01'],
 'Ходьба':['idlewalk_03','idlewalk_04','idlewalk_05','idlewalk_06'],
 'Бег':['idlewalk_08','idlewalk_09','idlewalk_10','special_01'],
 'Удар рукой':['combat_00','combat_04','combat_07'],
 'Удар ногой':['combat_00','combat_05','combat_07'],
 'Меч':['combat_00','combat_01','combat_02','combat_03'],
 'Блок':['combat_07','combat_07'],
 'Уклонение':['special_00','special_02','special_03','special_00'],
 'Попадание':['combat_08','combat_09','combat_10'],
 'Падение':['combat_10','special_10','special_11'],
 'Печати':['seals_01','seals_02','seals_03','seals_04','seals_05','seals_06','seals_07','seals_08','seals_09','seals_10'],
 'Все 12 печатей':['seals_01','seals_02','seals_03','seals_04','seals_05','seals_06','seals_07','seals_08','seals_09','seals_10','seals_02','seals_06'],
 'Цепочка дзюцу':['seals_03','seals_06','seals_02','seals_08','seals_10'],
 'Выпуск дзюцу':['seals_08','seals_09','seals_10'],
 'Бросок куная':['special_07','special_08'],
 'Призыв':['seals_02','seals_07','special_09'],
 'Ранение':['combat_08','combat_09'],
 'Лёжа':['special_11']
};
for(const [name,fs] of Object.entries(groups)) for(const frame of fs) if(!(frame in INDEX)) throw new Error('Missing animation frame '+name+': '+frame);
let enabled=true,previewAction='Стойка',previewStarted=performance.now(),looping=false;
const firstHero=()=>typeof game==='object'&&game?.units?.find(u=>u.team==='ally'&&!u.isClone&&!u.isSummon);
const prototypeId=()=>firstHero()?.id??null;
function visual51Variant(u){
 if(!u||typeof game!=='object'||!game?.units)return 0;
  if(u.isClone&&u.cloneOwner){const original=game.units.find(t=>t.id===u.cloneOwner);if(original)return visual51Variant(original);}
 const fighters=game.units.filter(v=>!v.isClone&&!v.isSummon&&(v.team==='ally'||v.team==='enemy'));
 let idx=fighters.indexOf(u);
 if(idx<0)return 0;
 const team=fighters.filter(v=>v.team===u.team);
 const n=team.indexOf(u);
 return u.team==='enemy'?3+(n%3):n%3;
}

// 5.3 / 5.4: coherent animation timeline, with easing and one named pose per seal.
const SIGNS54=['Крыса','Бык','Тигр','Кролик','Дракон','Змея','Лошадь','Овца','Обезьяна','Птица','Собака','Кабан'];
const POSE54=[1,2,3,4,5,6,7,8,9,10,2,6];
const clamp54=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease54=(x)=>{x=clamp54(x);return x*x*(3-2*x)};
const transition54=(x,begin=.79)=>ease54((x-begin)/(1-begin));
function sealFrame54(sign){return 'seals_'+String(POSE54[(Number(sign)||0)%POSE54.length]).padStart(2,'0')}
function drawTile54(ctx,frame,x,y,w,h,variant,alpha=1){
 const a=variantAtlases[variant]||variantAtlases[0];
 const atlasImage=a?.complete&&a?.naturalWidth?a:atlas;
 const i=INDEX[frame];if(i===undefined||!atlasImage?.naturalWidth)return false;
 if(alpha!==1){ctx.save();ctx.globalAlpha*=clamp54(alpha);}
 ctx.drawImage(atlasImage,(i%COLS)*FRAME_W,Math.floor(i/COLS)*FRAME_H,FRAME_W,FRAME_H,x,y,w,h);
 if(alpha!==1)ctx.restore();
 return true;
}
function atlasFrame(ctx,frame,x,y,w,h,variant=0){return drawTile54(ctx,frame,x,y,w,h,variant)}
function motion54(u){
 if(u.prone)return {frame:'special_11',next:null,mix:0,kind:'prone'};
 const reaction=u.reaction,age=reaction?Date.now()-reaction.at:Infinity;
 if(age<500){
  if(reaction.kind==='dodge')return {frame:'special_00',next:'special_02',mix:ease54(age/290),kind:'dodge'};
  if(reaction.kind==='block')return {frame:'combat_07',next:null,mix:0,kind:'block'};
  if(reaction.kind==='hurt')return {frame:age<220?'combat_08':'combat_09',next:null,mix:0,kind:'hurt'};
 }
 const fx=(typeof activeFx!=='undefined'?activeFx:null);
 if(fx&&fx.actor===u.id){
  const p=clamp54(fx.progress||0,0,.999999);
  if(fx.action==='seals'){
   const n=Math.max(1,fx.signs?.length||1),q=p*n,ind=Math.min(n-1,Math.floor(q)),local=q-ind;
   const frame=sealFrame54(fx.signs?.[ind]||0);
   const next=ind<n-1?sealFrame54(fx.signs[ind+1]):'seals_10';
   return {frame,next,mix:ind<n-1?transition54(local,.77):transition54(local,.90),kind:'seals',seal:fx.signs[ind],signIndex:ind,n};
  }
  let frames;
  if(fx.action==='move')frames=(fx.path?.length||0)>2?groups['Бег']:groups['Ходьба'];
  else if(['melee','quick','stunHit','counter'].includes(fx.action))frames=groups['Удар рукой'];
  else if(['heavy','trip'].includes(fx.action))frames=groups['Удар ногой'];
  else if(fx.action==='sword')frames=groups['Меч'];
  else if(fx.action==='guard')frames=groups['Блок'];
  else if(['jutsu','illusion','barrier'].includes(fx.action))frames=groups['Выпуск дзюцу'];
  else if(fx.action==='summon')frames=groups['Призыв'];
  else if(['kunai','shuriken','senbon','poison','paper','flash','poisonBomb','smoke'].includes(fx.action))frames=groups['Бросок куная'];
  else frames=groups['Стойка'];
  let q=p*frames.length,i=Math.min(frames.length-1,Math.floor(q)),local=q-i;
  return {frame:frames[i],next:i+1<frames.length?frames[i+1]:null,mix:i+1<frames.length?transition54(local):0,kind:fx.action};
 }
 return {frame:u.guard?'combat_07':'idlewalk_00',next:u.guard?null:'idlewalk_01',mix:u.guard?0:(Math.sin(performance.now()/930+u.id.length)+1)*.065,kind:'idle'};
}
function drawMotion54(ctx,motion,x,y,w,h,variant){
 const {frame,next,mix=0}=motion;
 if(!next||mix<.012||!Object.hasOwn(INDEX,next))return drawTile54(ctx,frame,x,y,w,h,variant);
 // Cross-fade only over the end of each key pose; no 100%-transparent middle frames.
 const a=drawTile54(ctx,frame,x,y,w,h,variant,1-mix);
 drawTile54(ctx,next,x,y,w,h,variant,mix);
 return a;
}
function selectFrame(u){return motion54(u).frame}
window.__arena50DrawActor=(ctx,u,x,y,w,h)=>{
 if(!enabled||!u||!u.hp||u.hp<=0||u.isSummon)return false;
 if(u.team!=='ally'&&u.team!=='enemy')return false;
 // The existing renderer owns orientation, depth, and health-bar placement.
 // Uniform scale: source atlas tiles are square. Keep foot contact fixed.
 const side=Math.round(h*1.13);
 return drawMotion54(ctx,motion54(u),-side/2,-side*261/270,side,side,visual51Variant(u));
};
const overlay=document.createElement('div');overlay.id='arena50-overlay';overlay.hidden=true;
overlay.innerHTML=`<div id="arena50-dialog" role="dialog" aria-modal="true" aria-label="Просмотр анимаций шиноби">
<div id="arena50-head"><h2>Шиноби 5.4 · живые движения и печати</h2><button id="arena50-close">Закрыть</button></div>
<p style="margin:5px 0 0;color:#b6cbc8">Проверка 46 исходных поз: плавные переходы, отдельные знаки печатей, остановка и покадровый просмотр. Шесть обликов всё ещё являются вариантами одной базовой модели.</p>
<div id="arena50-view"><div><div id="arena50-stage"><canvas width="340" height="355" id="arena50-canvas"></canvas></div><div id="arena50-stats"></div></div><div><div id="arena50-keys"></div><label style="display:flex;align-items:center;gap:8px;margin-top:12px"><input type="checkbox" id="arena50-toggle" checked>Использовать анимированные спрайты для обеих команд</label><p class="arena50-tag">Один эталон · 6 цветовых вариантов · печати по именам · 46 поз</p></div></div></div>`;
document.body.appendChild(overlay);
const stage=overlay.querySelector('#arena50-canvas'), c=stage.getContext('2d');
let previewVariant=0;
const keys=overlay.querySelector('#arena50-keys');
const selectWrap=document.createElement('label');selectWrap.style.cssText='display:block;margin:0 0 12px;color:#c1d4d5';
selectWrap.textContent='Облик: ';
const sel=document.createElement('select');sel.id='arena51-variant';sel.setAttribute('aria-label','Вариант шиноби');
VARIANT_NAMES.forEach((name,i)=>{const o=new Option(name,String(i));sel.add(o)});
sel.onchange=()=>{previewVariant=Number(sel.value);previewStarted=performance.now();};
selectWrap.appendChild(sel);keys.parentNode.insertBefore(selectWrap,keys);

keys.innerHTML=Object.keys(groups).map(name=>`<button type="button" data-clip="${name}">${name}</button>`).join('');
function setAction(name){previewAction=name;previewStarted=performance.now();keys.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b.dataset.clip===name));}
keys.querySelectorAll('button').forEach(b=>b.onclick=()=>setAction(b.dataset.clip));
setAction('Ходьба');
const openBtn=document.createElement('button');openBtn.id='arena50-open';openBtn.textContent='Анимации 5.4';
const header=document.querySelector('header');if(header)header.appendChild(openBtn);
const close=()=>{overlay.hidden=true;looping=false;};
function open(){overlay.hidden=false;previewStarted=performance.now();if(!looping){looping=true;requestAnimationFrame(drawPreview);}}
openBtn.onclick=open;overlay.querySelector('#arena50-close').onclick=close;
overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close();});
overlay.querySelector('#arena50-toggle').onchange=(e)=>{enabled=!!e.target.checked; if(typeof game==='object'&&game&&typeof draw==='function')draw();};
// Player-facing preview: play, pause, frame step, selectable speed, named hand signs.
let speed54=1,playing54=true,holdIndex54=0,lastPaint54=0;
const playback54=document.createElement('div');playback54.id='arena54-controls';
playback54.innerHTML='<button type="button" id="arena54-play">⏸ Пауза</button><button type="button" id="arena54-prev">◀ Кадр</button><button type="button" id="arena54-next">Кадр ▶</button><label>Скорость <select id="arena54-speed"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="1.5">1,5×</option><option value="2">2×</option></select></label>';
stage.parentElement.after(playback54);
const play54=overlay.querySelector('#arena54-play');
play54.onclick=()=>{playing54=!playing54;play54.textContent=playing54?'⏸ Пауза':'▶ Пуск';if(playing54)previewStarted=performance.now()-holdIndex54*duration54(previewAction)/speed54;};
overlay.querySelector('#arena54-prev').onclick=()=>{playing54=false;play54.textContent='▶ Пуск';holdIndex54=(holdIndex54-1+groups[previewAction].length)%groups[previewAction].length;};
overlay.querySelector('#arena54-next').onclick=()=>{playing54=false;play54.textContent='▶ Пуск';holdIndex54=(holdIndex54+1)%groups[previewAction].length;};
overlay.querySelector('#arena54-speed').onchange=e=>{speed54=Number(e.target.value)||1;previewStarted=performance.now();holdIndex54=0;};
function duration54(name){return name.includes('печат')||name==='Печати'||name.includes('дзюцу')?390:name==='Стойка'?1150:name==='Лёжа'?1200:name==='Призыв'?480:330;}
const originalSetAction54=setAction;
setAction=function(name){originalSetAction54(name);holdIndex54=0;};
// Original buttons already reference lexical setAction; new binding above updates their callback.
function drawPreview(time){
 if(!looping||overlay.hidden){looping=false;return;}
 const w=stage.width,h=stage.height,arr=groups[previewAction];
 const dur=duration54(previewAction),cycle=arr.length;
 const q=playing54?Math.max(0,(time-previewStarted)*speed54/dur):holdIndex54;
 const i=playing54?(Math.floor(q)%cycle):holdIndex54;
 const local=playing54?q-Math.floor(q):0;
 if(playing54)holdIndex54=i;
 c.clearRect(0,0,w,h);
 c.fillStyle='rgba(63,82,72,.44)';c.beginPath();c.ellipse(w/2,h-34,85,19,0,0,Math.PI*2);c.fill();
 drawMotion54(c,{frame:arr[i],next:arr[(i+1)%cycle],mix:playing54?transition54(local,.72):0},0,7,340,340,previewVariant);
 c.font='bold 14px system-ui';c.textAlign='center';c.fillStyle='#f8eed4';c.fillText(previewAction,w/2,25);
 const label=previewAction==='Все 12 печатей'?` • ${SIGNS54[i]}`:previewAction==='Цепочка дзюцу'?` • ${['Тигр','Лошадь','Бык','Обезьяна','Собака'][i]}`:'';
 overlay.querySelector('#arena50-stats').textContent=`Кадр ${i+1}/${cycle}${label} • ${arr[i]} • 46 иллюстрированных поз`;
 lastPaint54=time;requestAnimationFrame(drawPreview);
}
const originalSetup=window.renderSetup;
if(typeof originalSetup==='function')window.renderSetup=function(){const result=originalSetup.apply(this,arguments);if(typeof focus!=='undefined'&&focus<3){const img=document.querySelector('#fighterCard .fighter img.portrait');if(img){img.src=previewSrc;img.alt='Анимированный шиноби 5.1 — базовый облик';}}return result;};
if(typeof window.renderSetup==='function'&&document.querySelector('#setupScreen')?.classList.contains('active'))window.renderSetup();
window.__arena50={version:'5.4',SIGNS54,POSE54,sealFrame54,motion54,drawMotion54,get preview(){return {action:previewAction,index:holdIndex54,playing:playing54,speed:speed54}},get enabled(){return enabled;},set enabled(v){enabled=!!v;overlay.querySelector('#arena50-toggle').checked=enabled;},atlas,frames:INDEX,groups,prototypeId,selectFrame,atlasFrame,open,close,setAction,previewSrc,variantAtlases,VARIANT_NAMES,visual51Variant};
})();
