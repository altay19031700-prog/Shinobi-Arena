/* SHINOBI ARENA 5.7 — non-blocking technique-specific particle visual engine.
   Overlay is purely visual: no changes to AP, chakra, damage or turn state. */
(()=>{
 'use strict';
 const TECHS=window.__arena18?.TECHS||[];
 const BY_ID=Object.fromEntries(TECHS.map(t=>[t.id,t]));
 const BY_NAME=Object.fromEntries(TECHS.map(t=>[t.name,t]));
 const scene=document.querySelector('#arenaScreen .boardwrap');
 const board=document.getElementById('board');
 if(!scene||!board||!TECHS.length)return;
 const overlay=document.createElement('canvas');overlay.id='vfx57-layer';overlay.width=board.width;overlay.height=board.height;
 overlay.setAttribute('aria-hidden','true');scene.append(overlay);
 const gx=overlay.getContext('2d');
 const css=document.createElement('style');css.id='vfx57-style';css.textContent=`
 #vfx57-layer{position:absolute;inset:0;width:100%;height:auto;pointer-events:none!important;z-index:9;mix-blend-mode:normal}
 #vfx57-open{padding:8px 11px;border:1px solid #71bed3;background:#174151;color:#ebf8f9;font-weight:750;border-radius:9px}
 #vfx57-modal{position:fixed;inset:0;z-index:24000;background:#061018ed;display:flex;align-items:center;justify-content:center;padding:12px;overflow:auto}
 #vfx57-modal[hidden]{display:none!important}
 #vfx57-shell{width:min(960px,100%);max-height:96vh;overflow:auto;background:#112530;border:1px solid #4f8b98;border-radius:15px;padding:14px;color:#ecf3eb;box-shadow:0 20px 80px #000b}
 #vfx57-shell h2{margin:2px 0 9px;font-size:19px}
 #vfx57-controls{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
 #vfx57-controls select,#vfx57-controls button{background:#193542;color:#f0f8ec;border:1px solid #608c96;border-radius:8px;padding:9px;min-height:42px;font-size:14px}
 #vfx57-tech{flex:1 1 210px;max-width:100%}
 #vfx57-demo{display:block;width:100%;height:auto;background:#101e29;border:1px solid #345863;border-radius:9px}
 #vfx57-copy{color:#bbd8d9;font-size:12px;line-height:1.45;min-height:40px;margin:7px 0}
 #vfx57-count{font-size:12px;color:#a7c9ca}
 @media(max-width:650px){#vfx57-modal{padding:4px}#vfx57-shell{padding:9px;border-radius:8px}#vfx57-shell h2{font-size:16px}#vfx57-controls{gap:5px}#vfx57-controls select,#vfx57-controls button{padding:9px 5px;font-size:12px}#vfx57-open{font-size:12px;min-height:42px}}
 `;document.head.append(css);
 const btn=document.createElement('button');btn.id='vfx57-open';btn.textContent='✨ Анимации дзюцу';btn.type='button';
 (document.getElementById('gridBtn')?.parentElement||document.querySelector('#arenaScreen .boardpanel')).append(btn);
 const startButton=document.getElementById('start');
 const menuPreview=document.createElement('button');menuPreview.type='button';menuPreview.id='vfx57-setup-open';menuPreview.textContent='✨ Посмотреть анимации дзюцу';
 if(startButton)startButton.parentElement.insertBefore(menuPreview,startButton);
 menuPreview.addEventListener('click',()=>{document.getElementById('vfx57-open').click()});
 const modal=document.createElement('div');modal.id='vfx57-modal';modal.hidden=true;
 modal.innerHTML=`<div id="vfx57-shell" role="dialog" aria-modal="true" aria-labelledby="vfx57-title"><h2 id="vfx57-title">Анимации дзюцу · версия 5.9.7</h2><div id="vfx57-count"></div><div id="vfx57-controls"><select id="vfx57-tech" aria-label="Выбрать технику"></select><button id="vfx57-play" type="button">▶ Показать</button><button id="vfx57-next" type="button">Следующая</button><button id="vfx57-auto" type="button">▶ Все техники</button><button id="vfx57-close" type="button">Закрыть</button></div><canvas width="900" height="490" id="vfx57-demo" aria-label="Анимация выбранной техники"></canvas><div id="vfx57-copy"></div></div>`;
 document.body.append(modal);
 const select=modal.querySelector('#vfx57-tech');
 select.innerHTML=TECHS.map((t,i)=>`<option value="${t.id}">${String(i+1).padStart(2,'0')}. ${t.name}</option>`).join('');
 modal.querySelector('#vfx57-count').textContent=`${TECHS.length} изучаемые техники · реальные игровые VFX + демонстрация без траты чакры`;
 const preview=modal.querySelector('#vfx57-demo');const pg=preview.getContext('2d');
 const sourceSprite=new Image(),targetSprite=new Image();
 sourceSprite.src='assets/c0400fcc043dbf3cb748f4d9.webp';targetSprite.src='assets/6fe999fe0c18c87151e4b399.webp';
 let demoId=TECHS[0].id,demoEpoch=0;
 const effects=[];const triggers=[];let ticker=false,lastTick=0;
 const palette={genjutsu:['#b28ae7','#e4ccff'],explosion:['#ff6926','#ffdd83'],flash:['#f8f4bc','#ffffff'],projectile:['#c7e1e6','#ffffff'],poison:['#73d38c','#e1ff99'],fire:['#ff5228','#ffc34e'],water:['#38b9ff','#dbf9ff'],wind:['#a0efd6','#effff4'],light:['#a588ff','#e6e0ff'],earth:['#bd9569','#f0d0a1'],chakra:['#3bd4e9','#f5fbff'],smoke:['#b3c6cc','#e5e6ed'],weapon:['#e2cf99','#ffffff'],illusion:['#78a6e6','#deceff']};
 function profile(t){
  const name=t.id;
  let type=t.school==='genjutsu'?'genjutsu':t.kind==='summon'?'summon':t.kind==='clone'?(name==='decoy'?'illusion':'clone'):
   t.kind==='wall'?'wall':t.kind==='self'?(name==='replace'?'replacement':'shield'):
   t.kind==='arsenal'?'arsenal':t.kind==='weaponAttack'?'weapon':
   t.element===0?'fire':t.element===1?'water':t.element===2?'wind':t.element===3?'light':t.element===4?'earth':'chakra';
  const idhash=Array.from(name).reduce((n,ch)=>n+ch.charCodeAt(0),0);
  const area=['blast','line','chain','weaponAttack'].includes(t.kind);
  const duration=type==='summon'?1320:type==='illusion'||type==='clone'?1150:t.kind==='blast'?1330:t.kind==='line'?1100:t.kind==='chain'?1250:area?1160:840+(idhash%4)*90;
  const size=t.kind==='blast'?88:t.kind==='line'?70:t.kind==='wall'?70:54;
  return {id:t.id,name:t.name,type,kind:t.kind,colors:palette[type]||palette.chakra,duration,size,area,variation:idhash%7,range:t.range||0,ap:t.ap,ch:t.ch,desc:t.note};
 }
 const PROFILES=Object.fromEntries(TECHS.map(t=>[t.id,profile(t)]));
 const EXTRAS={
  _smoke:{type:'smoke',name:'Дымовая бомба'},
  _paper:{type:'explosion',name:'Взрывная печать'},
  _flash:{type:'flash',name:'Светошумовая бомба'},
  _kunai:{type:'projectile',name:'Кунай'},
  _shuriken:{type:'projectile',name:'Сюрикен'},
  _senbon:{type:'projectile',name:'Сенбоны'},
  _poisonBomb:{type:'poison',name:'Ядовитая граната'},
  _poison:{type:'poison',name:'Ядовитое оружие'}
 };
 for(const [id,def] of Object.entries(EXTRAS))PROFILES[id]={id,kind:'item',duration:820,size:68,colors:palette[def.type]||palette.weapon,variation:id.length,range:4,ap:3,ch:0,desc:def.name,...def};
 function vfx(id,from,to,extra={}){
   if(window.__arena520?.quality==='off')return null;
   const p=PROFILES[id];if(!p)return null;
   const obj={...p,from:{...from},to:{...to},at:performance.now(),serial:effects.length+1,phase:'release',...extra};
   window.__shinobiAudio?.effectStart(obj);effects.push(obj);if(effects.length>20)effects.splice(0,effects.length-20);
   start();return obj;
 }
 function start(){if(!ticker){ticker=true;requestAnimationFrame(tick)}}
 function stopIfIdle(){if(effects.length===0){ticker=false;gx.clearRect(0,0,overlay.width,overlay.height)}}
 function seeded(i,e){const n=Math.sin(i*72.17+e.variation*17.31+e.serial*3.19)*43758.5453;return n-Math.floor(n)}
 function mix(a,b,t){return a+(b-a)*t}
 function point(c,r){if(typeof window.center==='function')return window.center(c,r);return {x:90+c*68+(r%2)*34,y:85+r*59}}
 function ring(ctx,x,y,r,color,a=1,width=3){ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);ctx.strokeStyle=color;ctx.globalAlpha=a;ctx.lineWidth=width;ctx.stroke();ctx.globalAlpha=1}
 function particle(ctx,x,y,r,color,a=1){ctx.globalAlpha=Math.max(0,Math.min(1,a));ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
 function segment(ctx,x,y,x2,y2,color,alpha=1,width=3){ctx.globalAlpha=Math.max(0,alpha);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();ctx.globalAlpha=1}
 function lightning(ctx,start,end,e,t){
  const steps=9,amp=(1-t)*18+6;ctx.beginPath();ctx.moveTo(start.x,start.y);
  for(let i=1;i<steps;i++){const p=i/steps,noise=(seeded(i+Math.floor(t*24)*11,e)-.5)*amp;
   const dx=end.x-start.x,dy=end.y-start.y,d=Math.hypot(dx,dy)||1;
   ctx.lineTo(mix(start.x,end.x,p)-dy/d*noise,mix(start.y,end.y,p)+dx/d*noise);
  }ctx.lineTo(end.x,end.y);ctx.strokeStyle=e.colors[1];ctx.lineWidth=7;ctx.globalAlpha=.26;ctx.stroke();ctx.strokeStyle=e.colors[0];ctx.lineWidth=2.6;ctx.globalAlpha=.95;ctx.stroke();ctx.globalAlpha=1;
 }
 const vfxAtlas594=new Image();vfxAtlas594.src="assets/1d099617fb3482efba8bd82f.webp";
 const vfxAtlas595=new Image();vfxAtlas595.src="assets/db023c49296c7b67a45708c1.webp";
 function drawArt595(ctx,e,t,a,b){
  if(!vfxAtlas595.complete||!vfxAtlas595.naturalWidth)return false;
  if(!['smoke','replacement','illusion','clone','wall','summon'].includes(e.type))return false;
  const draw=(slot,x,y,w,h,alpha)=>{ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,alpha));ctx.drawImage(vfxAtlas595,(slot%3)*512,Math.floor(slot/3)*512,512,512,x-w/2,y-h/2,w,h);ctx.restore()};
  const fade=Math.min(1,t/.14)*Math.min(1,(1-t)/.3);
  const grow=.62+.45*Math.min(1,t*3);
  const billow=(x,y,scale=1,opacity=1)=>{
   for(let i=0;i<4;i++){
    const q=Math.max(0,Math.min(1,(t-i*.06)/(1-i*.06)));
    const envelope=Math.min(1,q/.15)*Math.min(1,(1-q)/.35);
    const size=(70+q*60)*scale;
    draw(0,x+(i-1.5)*(9+q*11)*scale,y-q*(15+i*4)*scale,size,size*.83,envelope*opacity*(i===1?.55:.3));
   }
  };
  if(e.type==='smoke'){
    // Staggered billows expand and drift on independent paths.
    for(let i=0;i<5;i++){
      const delay=i*.055,q=Math.max(0,Math.min(1,(t-delay)/(1-delay)));
      const appear=Math.min(1,q/.15),dissolve=Math.min(1,(1-q)/.38);
      const size=70+q*87,dir=(i-2)*.48;
      draw(0,b.x+dir*(15+q*34),b.y-12-q*(25+i*4),size,size*.82,appear*dissolve*(i===2?.7:.34));
    }
  }
  else if(e.type==='replacement'){
    billow(a.x,a.y-12,1,1);
    const show=Math.min(1,Math.max(0,(t-.17)/.2))*Math.min(1,(1-t)/.3);
    draw(1,a.x,a.y-18,105,120,show);
  } else if(e.type==='clone'||e.type==='illusion'){
    billow(b.x,b.y-12,.95,1);
  } else if(e.type==='wall'){
    const rise=Math.min(1,t*4),op=Math.min(1,t/.14)*Math.min(1,(1-t)/.22);
    ctx.save();ctx.beginPath();ctx.rect(b.x-85,b.y-90,170,115);ctx.clip();
    draw(4,b.x,b.y-10+(1-rise)*90,150,130,op);ctx.restore();
  }else if(e.type==='summon'){
    billow(b.x,b.y-12,1.1,.7);
    draw(5,b.x,b.y-18,145*grow,135*grow,fade*.8);
  }
  return true;
 }
 // Five elemental ninjutsu: 60 true transparent frames (5 x 12), rendered by source rectangle.
 const jutsuSpriteAtlas521=new Image();
 jutsuSpriteAtlas521.src="assets/shinobi_ninjutsu_5elements_60frames.webp";
 const jutsuSpriteRows521={fire:0,water:1,wind:2,light:3,earth:4};
 window.__ninjutsuSprite521={version:'5.21',framesPerElement:12,elements:5,atlas:jutsuSpriteAtlas521};
 function drawNinjutsuSprites521(ctx,e,t,a,b){
   const row=jutsuSpriteRows521[e.type];
   if(row===undefined||!jutsuSpriteAtlas521.complete||!jutsuSpriteAtlas521.naturalWidth)return false;
   if((e.kind||'')==='wall')return false; // preserve spatial walls rather than using a projectile
   const kind=e.kind||'projectile', dx=b.x-a.x,dy=b.y-a.y;
   const spread=Math.max(1,Math.hypot(dx,dy));
   const rot=Math.atan2(dy,dx);
   const varScale=.94+((e.variation||0)%5)*.055;
   const draw=(frame,x,y,w,h,alpha=1,angle=0)=>{
     if(alpha<=0)return;
     const before=ctx.globalAlpha;ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,alpha));
     ctx.translate(x,y);ctx.rotate(angle);
     ctx.drawImage(jutsuSpriteAtlas521,256*frame,256*row,256,256,-w/2,-h/2,w,h);
     ctx.restore();ctx.globalAlpha=before;
   };
   const burst=(q,x=b.x,y=b.y,scale=1)=>{
     const f=8+Math.min(3,Math.floor(Math.max(0,Math.min(.9999,q))*4));
     const s=scale*varScale;
     draw(f,x,y-14,177*s*(.62+.48*q),155*s*(.62+.48*q),Math.min(1,q/.08)*Math.min(1,(1-q)/.17),0);
   };
   if(kind==='area'||kind==='blast'||e.type==='explosion'){
     if(t<.17){draw(Math.min(7,Math.floor(t*32)),b.x,b.y-15,100,92,1);}
     else burst((t-.17)/.83,b.x,b.y,kind==='blast'?1.4:1.25);
     return true;
   }
   if(kind==='line'){
     const p=Math.min(1,t/.73);
     const count=Math.max(1,Math.ceil(spread/78));
     for(let i=0;i<count;i++){
       const f=Math.min(7,Math.floor(Math.max(0,t*10+i*.9)));
       const u=Math.min(p,(i+.54)/count);
       if(u>p+.001)continue;
       const x=a.x+dx*u,y=a.y+dy*u;
       draw(f,x,y-17,126*varScale,118*varScale,.8,rot);
     }
     if(t>.7)burst((t-.7)/.3,b.x,b.y,1.1);
     return true;
   }
   const travelEnd=kind==='chain'?.57:.69;
   if(t<travelEnd){
     const p=Math.min(1,t/travelEnd);
     const x=a.x+dx*p,y=a.y+dy*p-14-Math.sin(p*Math.PI)*9;
     const f=Math.min(7,Math.floor(p*8));
     const sz=(e.type==='earth'?129:e.type==='light'?160:148)*varScale;
     draw(f,x,y,sz,126*varScale,Math.min(1,p/.07),rot*.10);
     if(kind==='chain'&&t>.39){
       for(let i=0;i<2;i++)draw(Math.min(7,f),b.x+(i-1)*36,b.y+(i%2)*26-14,76,75,(t-.39)*2,rot*.2);
     }
   } else burst((t-travelEnd)/(1-travelEnd),b.x,b.y,kind==='chain'?1.13:1);
   return true;
 }
 function drawArt594(ctx,e,t,a,b){
  if(drawNinjutsuSprites521(ctx,e,t,a,b))return true;
  if(!vfxAtlas594.complete||!vfxAtlas594.naturalWidth)return false;
  const slots={fire:0,water:2,wind:3,light:4,earth:5};
  if(!(e.type in slots)&&e.type!=='explosion')return false;
  const typ=e.type,slot=slots[typ]??1,kind=e.kind||'projectile';
  const variant=((e.variation||0)+Array.from(e.id||'').reduce((v,ch)=>v+ch.charCodeAt(0),0))%11;
  const dx=b.x-a.x,dy=b.y-a.y,dist=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx),nx=-dy/dist,ny=dx/dist;
  const rise=Math.min(1,t/.15),fade=Math.min(1,Math.max(0,(1-t)/.23)),env=rise*fade;
  const rng=n=>seeded(n,e);
  const art=(index,x,y,w,h,rotation,alpha)=>{
   if(alpha<=.01)return;
   ctx.save();ctx.globalAlpha=Math.min(1,Math.max(0,alpha));ctx.translate(x,y);ctx.rotate(rotation);
   if(index===5||index===1){ctx.drawImage(vfxAtlas594,(index%3)*512,Math.floor(index/3)*512,512,512,-w/2,-h/2,w,h);}
   else{for(let strip=0;strip<16;strip++){
    const u=strip/16,tail=1-u;
    const wave=Math.sin(t*32-u*11+variant)*tail*(index===4?2.3:3.2);
    ctx.drawImage(vfxAtlas594,(index%3)*512+strip*32,Math.floor(index/3)*512,32,512,-w/2+u*w,-h/2+wave,w/16+.12,h);
   }}ctx.restore();
  };
  const dust=(x,y,power)=>{
   ctx.save();for(let i=0;i<11;i++){
    const r=(7+36*rng(i+30))*Math.min(1,power),th=i*2.399+rng(i)*.35;
    ctx.fillStyle=i%3?'#857e6d':'#b4a28d';ctx.globalAlpha=(1-power)*(.13+.16*rng(i+7));
    ctx.beginPath();ctx.ellipse(x+Math.cos(th)*r,y+Math.sin(th)*r*.38,4+7*rng(i),2+4*rng(i+11),0,0,Math.PI*2);ctx.fill();
   }ctx.restore();
  };
  const ground=(x,y,r,alpha)=>{
   ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.ellipse(x,y,Math.max(1,r),Math.max(1,r*.33),0,0,Math.PI*2);
   ctx.strokeStyle=typ==='fire'||typ==='explosion'?'#ed9a56':typ==='water'?'#9edaf2':typ==='light'?'#cfafff':'#ced0b9';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();
  };
  const impact=(q,force=1)=>{
   if(q<0||q>1)return;
   const s=Math.sin(q*Math.PI),r=(17+86*q)*force;
   ground(b.x,b.y+6,r,(1-q)*.55*force);
   if(typ==='fire'||typ==='explosion')art(1,b.x,b.y-20,105+q*110*force,105+q*100*force,variant%3*.15,Math.min(1,(q/.18))*(1-q)*.92);
   else if(typ==='earth')art(5,b.x,b.y-14-(1-q)*14,105+q*100,92+q*70,angle,(1-q)*.87);
   else if(typ==='water')art(2,b.x,b.y-20,102+q*93,84+q*72,angle+q*.6,s*.70);
   else if(typ==='wind')art(3,b.x,b.y-19,105+q*95,85+q*64,angle+q*2,s*.66);
   else if(typ==='light')art(4,b.x,b.y-18,115+q*90,86+q*60,angle+q*.25,s*.8);
   if((typ==='fire'||typ==='explosion')&&q>.16&&vfxAtlas595.complete&&vfxAtlas595.naturalWidth){
    const smokeQ=Math.min(1,(q-.16)/.84),smokeA=Math.min(1,smokeQ/.25)*(1-smokeQ)*.30;
    for(let i=0;i<3;i++){const size=(65+smokeQ*85)*force;ctx.save();ctx.globalAlpha=smokeA;ctx.drawImage(vfxAtlas595,0,0,512,512,b.x+(i-1)*(20+smokeQ*15)*force-size/2,b.y-20-smokeQ*45-size/2,size,size);ctx.restore();}
   }
   if(q>.2)dust(b.x,b.y+11,Math.min(1,(q-.2)*1.4)*force);
   for(let i=0;i<16;i++){
    const th=i*2.4+rng(i+8),rad=(12+70*q)*(0.48+rng(i+25)*.64),px=b.x+Math.cos(th)*rad,py=b.y-12+Math.sin(th)*rad*.68;
    ctx.globalAlpha=(1-q)*(.3+.45*rng(i));ctx.fillStyle=e.colors[i%2];ctx.beginPath();ctx.arc(px,py,1.5+3*rng(i+12),0,Math.PI*2);ctx.fill();
   }ctx.globalAlpha=1;
  };
  if(typ==='explosion'||kind==='blast'||kind==='area'){
   const q=Math.max(0,(t-.12)/.88),scale=kind==='blast'?1.25:1;
   art(typ==='explosion'||typ==='fire'?1:slot,b.x,b.y-20-(1-q)*14,(128+q*100)*scale,(112+q*110)*scale,variant%3*.11,Math.min(1,q/.12)*(1-q)*.95);
   impact(q,scale);return true;
  }
  if(kind==='wall'){
   const q=Math.min(1,t*3),length=165+(variant%4)*22;
   for(let i=0;i<3;i++)art(slot,b.x+(i-1)*length/3,b.y-20-(1-q)*38,74+q*38,112+q*35,-.22+(variant%3)*.19,env*(.72+.1*(i%2)));
   ground(b.x,b.y+8,length/2,env*.32);return true;
  }
  if(kind==='line'){
   const p=Math.min(1,t/.63),len=dist*p,theta=angle;
   ctx.save();ctx.translate(a.x,a.y-14);ctx.rotate(theta);ctx.beginPath();ctx.rect(0,-62,len+2,125);ctx.clip();
   for(let j=0;j<Math.max(1,Math.ceil(dist/95));j++){
    let xx=42+j*88;
    art(slot,xx,0,120+(variant%3)*26,103+(variant%3)*12,0,env*(.65+.15*Math.sin(t*13+j)));
   }ctx.restore();
   if(t>.63)impact((t-.63)/.37,1.05);return true;
  }
  const travelEnd=kind==='chain'?.60:.68;
  const p=Math.min(1,t/travelEnd),curve=((variant%5)-2)*9;
  const shots=kind==='chain'?3:(variant%4===0?3:variant%3===0?2:1);
  if(t<travelEnd+.06){
   for(let i=0;i<shots;i++){
    const phase=Math.max(0,Math.min(1,(p-i*.075)/(1-i*.075)));
    if(p<i*.075)continue;
    const offset=(i-(shots-1)/2)*12+curve*Math.sin(phase*Math.PI),x=a.x+dx*phase+nx*offset,y=a.y+dy*phase+ny*offset-15-11*Math.sin(phase*Math.PI);
    const w=typ==='earth'?105:typ==='light'?138:155,h=typ==='earth'?95:125;
    art(slot,x,y,w*(.65+.3*Math.sin(phase*Math.PI)),h*(.7+.2*Math.sin(phase*Math.PI)),angle,Math.min(1,phase/.12)*Math.min(1,(1-phase)/.08)*(.91-i*.17));
    for(let j=0;j<7;j++){
      const q=j/7,px=x-dx/dist*q*(18+22*rng(j)),py=y-dy/dist*q*(18+22*rng(j));
      ctx.globalAlpha=(1-t)*(.13+.16*rng(j+4));ctx.fillStyle=e.colors[j%2];ctx.beginPath();ctx.arc(px+nx*(rng(j+3)-.5)*13,py+ny*(rng(j+3)-.5)*13,1.2+2.8*rng(j),0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
   }
  }
  if(kind==='chain'&&t>.48){
   for(let j=0;j<3;j++){
    let q=(t-.48-j*.075)/.34;if(q<0||q>1)continue;
    let tx=b.x+(j-1)*43,ty=b.y+(j%2?23:-16);
    art(slot,tx,ty-12,72+q*32,64+q*28,angle+j*.6,Math.sin(q*Math.PI)*.75);
   }
  }
  if(t>travelEnd)impact(Math.min(1,(t-travelEnd)/(1-travelEnd)),kind==='chain'?1.12:1);
  return true;
 }
 function drawEffect(ctx,e,now,previewMode=false){
  const total=e.duration,progress=(now-e.at)/total;if(progress<0||progress>1)return false;
  const t=Math.min(1,Math.max(0,progress));if(!previewMode)window.__shinobiAudio?.effectFrame(e,t);const a=point(e.from.c,e.from.r),b=point(e.to.c,e.to.r);
  if(window.__effects534?.render(ctx,e,t,a,b)||window.__jutsu529?.render(ctx,e,t,a,b)||window.__genjutsu?.drawEffect(ctx,e,t,a,b)||drawArt595(ctx,e,t,a,b)||drawArt594(ctx,e,t,a,b))return true;
  const c0=e.colors[0],c1=e.colors[1],peak=Math.sin(t*Math.PI),vx=b.x-a.x,vy=b.y-a.y;
  const projectile=t<.7?Math.min(1,t/.7):1;
  let x=mix(a.x,b.x,projectile),y=mix(a.y,b.y,projectile);
  if(['fire','water','earth','wind','light'].includes(e.type)){
   // Arrival effects only follow the genuine end point of the cast.
   if(e.type==='light'){if(t<.7)lightning(ctx,a,{x,y},e,t);else lightning(ctx,a,b,e,t);}
   else if(e.type==='wind'){
    for(let i=0;i<5;i++){const shift=(i-2)*8;
     segment(ctx,a.x+shift,a.y-8,x+shift,y-8,c1,(1-t)*.7,2);
     ctx.save();ctx.translate(x+shift,y+shift*.18);ctx.rotate(Math.atan2(vy,vx));ring(ctx,0,0,12+i*3,c0,.65*peak,2);ctx.restore();}
   }else if(e.type==='earth'){
    for(let i=0;i<9;i++){const q=i/9,p=seeded(i,e),phase=Math.min(1,(t-.07*q)*1.5);if(phase<0)continue;
     const xx=mix(a.x,b.x,Math.min(1,phase)),yy=mix(a.y,b.y,Math.min(1,phase));
     ctx.fillStyle=i%2?c0:c1;ctx.globalAlpha=.78*(1-t*.6);ctx.save();ctx.translate(xx+(p-.5)*30,yy-10-Math.sin(phase*Math.PI)*24);ctx.rotate((t*3+i)*.6);ctx.fillRect(-6-p*7,-6-p*7,12+p*14,12+p*14);ctx.restore();ctx.globalAlpha=1;}
   }else{
    for(let i=0;i<30;i++){const u=seeded(i,e),phase=(t*1.6-u*.7);if(phase<0)continue;
     const tail=Math.min(1,phase),bx=mix(a.x,x,tail),by=mix(a.y,y,tail),off=(seeded(i+31,e)-.5)*34;
     particle(ctx,bx+off,by+Math.sin(i*9.4+t*9)*13,2+u*7, i%3===0?c1:c0,(1-t)*(.3+.7*u));}
    const rr=9+e.size*.32*(.8+peak);ring(ctx,x,y,rr,c1,.75*(1-t*.5),5);
   }
   if(e.kind==='line'&&t>.2){
    for(let i=0;i<4;i++){const off=(i-1.5)*12;segment(ctx,a.x,a.y+off,mix(a.x,b.x,t),mix(a.y,b.y,t)+off,c0,(1-t)*.8,4)}
   }
   if(e.kind==='chain'&&t>.55){
    for(let i=0;i<3;i++){const other={x:b.x+(i-1)*63,y:b.y+(i%2?42:-34)};lightning(ctx,b,other,e,(t-.55)/.45);}
   }
   if(t>.61){const q=(t-.61)/.39;
    ring(ctx,b.x,b.y,5+e.size*q*(e.area?1.6:1),c1,(1-q)*.9,5*(1-q)+1);
    for(let i=0;i<22;i++){const ang=6.283*i/22,rad=6+e.size*q*(.3+seeded(i,e));
     particle(ctx,b.x+Math.cos(ang)*rad,b.y+Math.sin(ang)*rad,2+seeded(i+30,e)*4,i%2?c0:c1,1-q);}
   }
  }else if(['smoke','explosion','flash','projectile','poison'].includes(e.type)){
   if(e.type==='projectile'||e.type==='poison'){
    segment(ctx,a.x,a.y,x,y,e.colors[0],(1-t),3);
    for(let i=0;i<5;i++){const r=seeded(i,e)*10;particle(ctx,x+r,y-r,3,e.colors[1],1-t)}
   }else if(e.type==='smoke'){
    for(let i=0;i<35;i++){const ang=i*2.399,noise=seeded(i,e),r=(10+noise*85)*Math.min(1,t*3);
     particle(ctx,b.x+Math.cos(ang)*r,b.y+Math.sin(ang)*r*.65,8+noise*17,i%4===0?e.colors[1]:e.colors[0],Math.min(1,t*4)*(1-t*.8)*.48);}
   }else if(e.type==='explosion'){
    ring(ctx,b.x,b.y,13+100*t,e.colors[0],1-t,9*(1-t)+1);
    ring(ctx,b.x,b.y,4+55*t,e.colors[1],(1-t)*.85,16*(1-t)+1);
    for(let i=0;i<40;i++){const ang=i*2.4,p=seeded(i,e),r=(10+p*75)*t;
     particle(ctx,b.x+Math.cos(ang)*r,b.y+Math.sin(ang)*r,3+p*8,i%2?e.colors[0]:e.colors[1],1-t);}
   }else if(e.type==='flash'){
    ring(ctx,b.x,b.y,10+95*t,e.colors[1],1-t,20*(1-t)+1);
    for(let i=0;i<12;i++){const a2=i*Math.PI/6;
     segment(ctx,b.x,b.y,b.x+Math.cos(a2)*125*t,b.y+Math.sin(a2)*125*t,e.colors[0],1-t,4);}
   }
  }else if(e.type==='illusion'||e.type==='clone'){
   const explode=Math.min(1,t*3),fade=Math.max(0,1-t);
   for(let i=0;i<34;i++){const ang=i*2.399,p=seeded(i,e),r=12+(34+p*28)*explode;
    particle(ctx,b.x+Math.cos(ang)*r,b.y+Math.sin(ang)*r,2+p*8,i%3===0?c1:c0,fade*.75);}
   ring(ctx,b.x,b.y,12+65*explode,c1,fade*1.1,4);
   if(e.type==='illusion')for(let i=0;i<3;i++)ring(ctx,b.x,b.y,13+i*15,c0,fade*.35,2);
  }else if(e.type==='shield'){
   ring(ctx,a.x,a.y,14+48*peak,c0,1-t*.9,6);
   for(let i=0;i<16;i++){const ang=i*Math.PI/8+t*6;particle(ctx,a.x+Math.sin(ang)*30,a.y+Math.cos(ang)*43,3,c1,peak);}
  }else if(e.type==='replacement'){
   ring(ctx,a.x,a.y,3+60*t,c1,1-t,5);
   for(let i=0;i<24;i++){let q=seeded(i,e),ang=i*2.4;
    particle(ctx,a.x+Math.cos(ang)*60*t,a.y+Math.sin(ang)*38*t,3+q*7,i%2?c1:c0,(1-t)*.8);}
  }else if(e.type==='wall'){
   for(let i=0;i<9;i++){let p=i/8,px=b.x+(p-.5)*75, rise=Math.min(1,t*3);ctx.save();ctx.translate(px,b.y+20-(14+seeded(i,e)*42)*rise);ctx.rotate((seeded(i+10,e)-.5)*.5);ctx.fillStyle=i%2?c0:c1;ctx.globalAlpha=(1-t*.7);ctx.fillRect(-12,-15,24,37);ctx.restore();ctx.globalAlpha=1;}
   ring(ctx,b.x,b.y,23+50*t,c1,.6*(1-t),2);
  }else if(e.type==='summon'){
   for(let i=0;i<4;i++)ring(ctx,b.x,b.y,12+e.size*t+i*16,c0,(1-t)*(.65-i*.1),2.4);
   for(let i=0;i<24;i++){const th=i*2.4+t*3,r=20+64*seeded(i,e);particle(ctx,b.x+Math.cos(th)*r,b.y+Math.sin(th)*r,3+seeded(i+12,e)*5,i%3===0?c1:c0,peak);}
  }else if(e.type==='arsenal'){
   ring(ctx,a.x,a.y,18+58*peak,c0,(1-t)*.8,4);
   for(let i=0;i<11;i++){const ang=i*2*Math.PI/11+t*3,r=10+55*peak;segment(ctx,a.x+Math.cos(ang)*r,a.y+Math.sin(ang)*r,a.x+Math.cos(ang)*r-6,a.y+Math.sin(ang)*r-13,c1,peak,3)}
  }else if(e.type==='weapon'){
   for(let i=0;i<19;i++){const q=seeded(i,e),offset=(i-9)*6,top=b.y-95+q*30,drop=Math.min(1,Math.max(0,(t-q*.24)*2));
    segment(ctx,b.x+offset,top+drop*110,b.x+offset-6,top+drop*110+19,c1,drop*(1-t*.5),2.8);}
   if(t>.55)ring(ctx,b.x,b.y,10+90*(t-.55)/.45,c0,(1-t)*2,4);
  }
  return true;
 }
 function tick(now){if(document.hidden||window.__arena520?.quality==='off'||!document.querySelector('#arenaScreen.active')){effects.length=0;stopIfIdle();return}if(now-lastTick<(window.__arena520?.quality==='low'?1000/26:1000/50)){requestAnimationFrame(tick);return}lastTick=now;gx.clearRect(0,0,overlay.width,overlay.height);
  for(let i=effects.length-1;i>=0;i--){const e=effects[i];if(now-e.at>=e.duration){effects.splice(i,1);continue}drawEffect(gx,e,now)}
  if(effects.length){requestAnimationFrame(tick)}else stopIfIdle();
 }
 // Keep jutsu release synchronized with the successful cast: don't play on interrupted seals.
 const priorCue=window.cueFx;
 let observedSeals=0,completedEffects=0,interruptedEffects=0,throwEffects=0;
 if(typeof priorCue==='function'){
  window.cueFx=function(obj){
   const ret=priorCue.call(this,obj);
   if(!obj||!game)return ret;
   if(obj.action==='seals'){
    observedSeals++;
    const tech=BY_NAME[obj.spellName];if(!tech)return ret;
    const actor=game.units?.find(u=>u.id===obj.actor);
    // Do not reveal hidden enemy positions through visual effects.
    if(actor?.team==='enemy'&&typeof window.visibleToSide==='function'&&!window.visibleToSide('ally',actor))return ret;
    const previous=window.__lastSeal544;
    const startAt=performance.now();
    const from=obj.from||{c:actor?.c||0,r:actor?.r||0};const to=obj.target||from;
    const aura=profile(tech);
    triggers.push({kind:'seals',id:tech.id,actor:obj.actor,duration:obj.sealDuration,at:Date.now(),from,to});
    const interval=setInterval(()=>{
     if(performance.now()-startAt>Math.max(3600,Number(obj.sealDuration||0)+3000)){clearInterval(interval);interruptedEffects++;return}
     const last=window.__lastSeal544;
     if(last&&last!==previous&&last.id===tech.id&&last.actor===obj.actor){
      clearInterval(interval);if(last.result===false||last.result==='cast_failed'||last.result==='interrupted'){interruptedEffects++;return}
      completedEffects++;
      const meta=tech.id==='elementClone'&&actor?{colors:palette[['fire','water','wind','light','earth'][actor.element]||'chakra']}:{ };
      const result=window.__genCastVisual534;if(result?.world===game&&result.id===tech.id&&result.actor===obj.actor)meta.resisted=!result.success;
      if(!window.__shinobi522?.enabled||tech.element==null||!['hit','blast','chain','line','area','weaponAttack'].includes(tech.kind))vfx(tech.id,from,to,meta);
     }
    },55);
   }else if(['paper','smoke','flash','kunai','shuriken','senbon','poison','poisonBomb'].includes(obj.action)){
    throwEffects++;
    const special={paper:'_paper',smoke:'_smoke',flash:'_flash',kunai:'_kunai',shuriken:'_shuriken',senbon:'_senbon',poison:'_poison',poisonBomb:'_poisonBomb'};
    const p=special[obj.action];if(p) vfx(p,obj.from||obj.target||{c:0,r:0},obj.target||obj.from||{c:0,r:0},{duration:obj.action==='smoke'?1000:660});
   }
   return ret;
  };
 }
 function previewEffect(){
  demoId=select.value;demoEpoch=performance.now();const p=PROFILES[demoId];
  modal.querySelector('#vfx57-copy').textContent=`${p.name}: ${p.ap} ОД · ${p.ch} чакры · дальность ${p.range} · ${p.desc||p.kind}. Показана визуальная демонстрация, ресурсы в бою не тратятся.`;
  if(!tickerPreview){tickerPreview=true;requestAnimationFrame(tickPreview)}
 }
 let tickerPreview=false,autoTimer=null;
 function drawPreviewBase(){
   const w=preview.width,h=preview.height;
   const grd=pg.createLinearGradient(0,0,0,h);grd.addColorStop(0,'#101c30');grd.addColorStop(1,'#1b3230');pg.fillStyle=grd;pg.fillRect(0,0,w,h);
   for(let row=0;row<6;row++)for(let col=0;col<13;col++){
    const x=44+col*70+(row%2)*35,y=40+row*73;
    pg.strokeStyle='rgba(152,187,171,.17)';pg.lineWidth=1;pg.beginPath();for(let i=0;i<6;i++){
     let th=Math.PI/180*(60*i-30),a=x+38*Math.cos(th),b=y+38*Math.sin(th);if(i===0)pg.moveTo(a,b);else pg.lineTo(a,b); }pg.closePath();pg.stroke();
   }
   pg.fillStyle='#183d40';pg.beginPath();pg.ellipse(190,420,95,22,0,0,Math.PI*2);pg.fill();
   pg.fillStyle='#562f34';pg.beginPath();pg.ellipse(705,420,91,20,0,0,Math.PI*2);pg.fill();
   if(sourceSprite.complete&&sourceSprite.naturalWidth)pg.drawImage(sourceSprite,74,179,250,250);
   else{pg.fillStyle='#74c6d6';pg.fillRect(176,220,30,130);}
   if(targetSprite.complete&&targetSprite.naturalWidth)pg.drawImage(targetSprite,582,177,250,250);
   else{pg.fillStyle='#d89483';pg.fillRect(685,220,30,130)}
   pg.fillStyle='#e9f4f1';pg.font='bold 19px sans-serif';pg.fillText('ШИНОБИ',145,453);pg.fillStyle='#f0b9a5';pg.fillText('ЦЕЛЬ / ГЕКС',650,453);
 }
 const demoFrom={c:1,r:1},demoTo={c:8,r:1};
 // Override point function mapping only within demo context via a transformed canvas.
 function tickPreview(now){if(modal.hidden){tickerPreview=false;return}
  drawPreviewBase();const p=PROFILES[demoId],progress=(now-demoEpoch)%2400;
  if(progress>700&&progress<p.duration+700){
   pg.save();
   // Default game centers yield roughly x=157..630. Shift into preview stage.
   const from0=point(1,1),to0=point(8,1);
   const mx=(700-190)/(to0.x-from0.x||1),my=mx;
   pg.setTransform(mx,0,0,my,190-from0.x*mx,300-from0.y*my);
   drawEffect(pg,{...p,from:demoFrom,to:demoTo,at:now-(progress-700),serial:17},now,true);
   pg.restore();
  }
  pg.font='15px sans-serif';pg.fillStyle='#a7cbd0';pg.fillText(`${p.name} · ${p.kind}`,20,26);
  requestAnimationFrame(tickPreview);
 }
 btn.addEventListener('click',()=>{modal.hidden=false;previewEffect()});
 function stopAuto(){if(autoTimer!==null)clearInterval(autoTimer);autoTimer=null;modal.querySelector('#vfx57-auto').textContent='▶ Все техники'}
 modal.querySelector('#vfx57-auto').addEventListener('click',()=>{
  if(autoTimer!==null){stopAuto();return}
  modal.querySelector('#vfx57-auto').textContent='■ Стоп';
  select.selectedIndex=0;previewEffect();
  autoTimer=setInterval(()=>{
   if(modal.hidden){stopAuto();return}
   select.selectedIndex=(select.selectedIndex+1)%select.options.length;previewEffect();
  },2300);
 });
 modal.querySelector('#vfx57-close').addEventListener('click',()=>{stopAuto();modal.hidden=true});
 modal.addEventListener('click',e=>{if(e.target===modal){stopAuto();modal.hidden=true}});
 select.addEventListener('change',previewEffect);
 modal.querySelector('#vfx57-play').addEventListener('click',previewEffect);
 modal.querySelector('#vfx57-next').addEventListener('click',()=>{select.selectedIndex=(select.selectedIndex+1)%select.options.length;previewEffect()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden){stopAuto();modal.hidden=true}});
 window.__arena57={version:'5.7',profiles:PROFILES,play:vfx,show:()=>btn.click(),get stats(){return {profiles:TECHS.length,extraItems:Object.keys(EXTRAS).length,observedSeals,completedEffects,interruptedEffects,throwEffects,active:effects.length}},get previewId(){return demoId},get modalOpen(){return !modal.hidden}};
})();
