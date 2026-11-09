
/* Shinobi Arena 5.20: visual-only hand seals, elemental impacts, kenjutsu and failed casts.
   Isolated canvas. Never changes combat rolls, AP, HP, pathing or networking commands. */
(()=>{'use strict';
 const board=document.getElementById('board'),wrap=document.querySelector('#arenaScreen .boardwrap');
 if(!board||!wrap)return;
 const layer=document.createElement('canvas');layer.id='shinobi520-layer';layer.setAttribute('aria-hidden','true');
 layer.width=board.width;layer.height=board.height;wrap.appendChild(layer);
 const css=document.createElement('style');css.id='shinobi520-style';css.textContent=`
 #shinobi520-layer{position:absolute;inset:0;width:100%;height:100%;pointer-events:none!important;z-index:12;mix-blend-mode:screen}
 #shinobi520-quality{border:1px solid #73948b;background:#162d32;color:#e9f3ed;border-radius:8px;padding:7px 10px;min-height:38px;font:700 12px system-ui;cursor:pointer}
 #shinobi520-quality:focus-visible{outline:3px solid #e9d085;outline-offset:2px}
 @media(max-width:650px){body:not(:has(#arenaScreen.active)) #shinobi520-quality{display:none}body:has(#arenaScreen.active) #shinobi520-quality{position:fixed!important;top:96px;right:7px;z-index:4000!important;max-width:180px;min-height:40px;padding:7px 8px;font-size:11px;box-shadow:0 3px 12px #000a}}
 `;document.head.appendChild(css);
 // The board and the overlay must share their exact draw origin (including canvas CSS size).
 wrap.style.position='relative';
 const g=layer.getContext('2d',{alpha:true});
 const priorFX=window.cueFx;
 const techs=window.__arena18?.TECHS||[];
 const byId=Object.fromEntries(techs.map(t=>[t.id,t]));
 const byName=Object.fromEntries(techs.map(t=>[t.name,t]));
 const colors=[['#ff4f25','#ffd77e'],['#38bafd','#dcf5ff'],['#9de4c8','#ebfff3'],['#8ea8ff','#ecf2ff'],['#bea37c','#efdec0']];
 const quality=(v)=>['high','low','off'].includes(v)?v:'low';
 let setting='low';try{setting=quality(localStorage.getItem('shinobi520-vfx')||((matchMedia('(pointer:coarse)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)?'low':'high'))}catch{}
 const qbutton=document.createElement('button');qbutton.type='button';qbutton.id='shinobi520-quality';
 const labels={high:'✨ Эффекты: высокие',low:'✨ Эффекты: эконом',off:'✨ Эффекты: выкл'};
 function updateQuality(){qbutton.textContent=labels[setting];qbutton.title='Нажми для смены качества эффектов';if(setting==='off'){effects.length=0;g.clearRect(0,0,layer.width,layer.height)}}
 const anchor=document.getElementById('vfx57-open')||document.getElementById('gridBtn');
 if(matchMedia('(max-width:650px)').matches)document.body.append(qbutton);else if(anchor)anchor.insertAdjacentElement('afterend',qbutton);else wrap.parentElement?.append(qbutton);
 qbutton.addEventListener('click',()=>{setting=setting==='high'?'low':setting==='low'?'off':'high';try{localStorage.setItem('shinobi520-vfx',setting)}catch{}updateQuality();wake()});updateQuality();
 const effects=[],stats={seals:0,casts:0,failCasts:0,kenHits:0,kenFails:0,networkEvents:0};
 let running=false,lastFrame=0,lastSeal=null,lastSealsSerial=null,lastStage=-1;
 const now=()=>performance.now();
 function pos(cell){if(cell&&typeof window.center==='function')return window.center(cell.c,cell.r);return {x:board.width/2,y:board.height/2}}
 function put(type,from,to,opt={}){
   if(setting==='off'||(type==='element'&&window.__shinobi522?.enabled))return;
   effects.push({type,from:from||to,to:to||from,at:now(),duration:opt.duration||950,element:opt.element??0,kind:opt.kind||'hit',size:opt.size||1,tag:opt.tag||'',seed:((effects.length*43+Math.floor(now()))%100000),id:opt.id||''});
   if(effects.length>24)effects.splice(0,effects.length-24);wake();
 }
 function broadcast(type,actor,from,to,opt){try{window.__shinobiNetVfxPublish?.({id:type,actor:actor?.id,from,to,...opt})}catch(e){console.warn('VFX network event ignored',e)}}
 function castFail(actor,t,cell){const from={c:actor.c,r:actor.r};put('castFail',from,cell||from,{element:actor.element,tag:'СБОЙ ПЕЧАТЕЙ',duration:1000});stats.failCasts++;broadcast('__castFail',actor,from,cell||from,{element:actor.element})}
 function kenFail(actor,target){actor.__lastKen520=now();const from={c:actor.c,r:actor.r},to=target?{c:target.c,r:target.r}:from;put('kenFail',from,to,{tag:'СОРВАН ПРИЁМ',duration:790});stats.kenFails++;broadcast('__kenFail',actor,from,to,{})}
 function networkEffect(event){if(!event)return;const typ=event.id==='__castFail'?'castFail':event.id==='__kenFail'?'kenFail':null;if(!typ)return;stats.networkEvents++;put(typ,event.from,event.to,{element:event.element||0,tag:typ==='kenFail'?'СОРВАН ПРИЁМ':'СБОЙ ПЕЧАТЕЙ',duration:870})}
 function offscreen(){return !document.querySelector('#arenaScreen.active')}
 function rand(k,seed){const n=Math.sin((k+1)*93.817+seed*17.53)*43758.545;return n-Math.floor(n)}
 function point(x,y,r,color,a){g.globalAlpha=Math.max(0,Math.min(1,a));g.fillStyle=color;g.beginPath();g.arc(x,y,Math.max(0.1,r),0,Math.PI*2);g.fill();g.globalAlpha=1}
 function arc(x,y,r,from,to,color,width,a){g.globalAlpha=Math.max(0,Math.min(1,a));g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.arc(x,y,Math.max(0.1,r),from,to);g.stroke();g.globalAlpha=1}
 function line(x,y,x2,y2,color,width,a){g.globalAlpha=Math.max(0,Math.min(1,a));g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.lineTo(x2,y2);g.stroke();g.globalAlpha=1}
 function label(x,y,text,color,alpha){g.save();g.globalAlpha=Math.max(0,alpha);g.font='bold 17px system-ui';g.textAlign='center';g.lineWidth=4;g.strokeStyle='#07121a';g.strokeText(text,x,y);g.fillStyle=color;g.fillText(text,x,y);g.restore()}
 function shake(x,y,r,t,c){for(let i=0;i<(setting==='high'?17:8);i++){let theta=rand(i,t*3)*Math.PI*2,rad=r*(.15+rand(i+21,t*4));point(x+Math.cos(theta)*rad,y+Math.sin(theta)*rad*.55,1.5+(i%3),c,(1-t)*.7)}}
 function sealFrame(effect,t){const a=pos(effect.from),base=colors[effect.element]||colors[0],stage=Math.min(effect.count-1,Math.floor(t*effect.count));const x=a.x,y=a.y-39,env=Math.min(1,t*9)*Math.min(1,(1-t)*9);
  arc(x,y,22+Math.sin(t*32)*4,t*5,t*5+Math.PI*1.6,base[0],3,env*.65);
  arc(x,y,30,-t*6,-t*6+Math.PI*1.3,base[1],1.7,env*.7);
  for(let i=0;i<(setting==='high'?24:10);i++){const theta=t*(i%2?9:-7)+i*2.399,rr=20+rand(i,effect.seed)*24;
   point(x+Math.cos(theta)*rr,y+Math.sin(theta)*rr*.72,1.2+(i%3),base[i%2],env*.5);
  }
  label(x,y-49,`ПЕЧАТЬ ${stage+1}/${effect.count}`,base[1],env*.95);
  if(stage!==lastStage){lastStage=stage;stats.seals++;}
 }
 function elementalFrame(e,t){const a=pos(e.from),b=pos(e.to);let el=Math.max(0,Math.min(4,e.element));const c=colors[el],kind=e.kind;
  const travel=kind==='blast'?0.12:.56,impact=Math.max(0,(t-travel)/(1-travel));const fly=Math.min(1,t/Math.max(.01,travel));const sx=a.x+(b.x-a.x)*fly,sy=a.y+(b.y-a.y)*fly-22*Math.sin(Math.PI*fly);const peak=Math.max(0,1-impact);
  // Chakra charge at the caster creates a clear pre-release moment.
  if(t<.24)for(let i=0;i<2;i++)arc(a.x,a.y-25,14+i*13,t*11-i,t*11-i+Math.PI*1.35,c[i],2,.6*(1-t/.24));
  if(kind!=='blast'&&t<travel){
   if(el===0){for(let i=0;i<(setting==='high'?27:11);i++){let p=rand(i,e.seed),lx=sx-(b.x-a.x)*p*.16+(rand(i+13,e.seed)-.5)*17,ly=sy-(b.y-a.y)*p*.12+Math.sin(i+t*24)*9;point(lx,ly,2+5*p,i%3?c[0]:c[1],(.25+.5*p)*Math.min(1,(travel-t)*6));}}
   if(el===1){for(let i=0;i<(setting==='high'?20:9);i++){const u=rand(i+5,e.seed);point(sx+(u-.5)*40,sy-8-Math.sin(t*19+i)*15,2+u*3,i%3?c[0]:c[1],.45);}}
   if(el===2){for(let i=0;i<5;i++){let dx=b.x-a.x,dy=b.y-a.y;line(a.x,a.y+i*6-9,sx,sy+i*6-9,c[i%2],1.5,.18+Math.sin(t*9+i)*.12);arc(sx,sy,12+i*5,t*10+i,t*10+i+2,c[0],2,.56);}}
   if(el===3){for(let branch=0;branch<3;branch++){let x0=a.x,y0=a.y-20,pts=8;for(let i=1;i<=pts;i++){let f=fly*i/pts,n=rand(i+branch*20+Math.floor(t*35)*7,e.seed)-.5,x1=a.x+(b.x-a.x)*f+(branch-1)*7+n*18,y1=a.y+(b.y-a.y)*f-16+n*15;line(x0,y0,x1,y1,branch===0?c[1]:c[0],branch===0?3:1.2,.7);x0=x1;y0=y1;}}}
   if(el===4){for(let i=0;i<(setting==='high'?16:7);i++){const f=fly*(.45+rand(i,e.seed)*.55),xx=a.x+(b.x-a.x)*f,yy=a.y+(b.y-a.y)*f-10-Math.sin(f*Math.PI)*28;g.save();g.translate(xx+(rand(i+5,e.seed)-.5)*30,yy);g.rotate(f*7+i);g.globalAlpha=.55;g.fillStyle=i%2?c[0]:c[1];g.fillRect(-3,-4,7+i%4,7+i%4);g.restore();}}
  }
  if(t>=travel){const r=(kind==='blast'?92:57)*e.size,rad=r*Math.pow(impact,.7),opacity=(1-impact)*.83;
   arc(b.x,b.y,rad,0,Math.PI*2,c[0],el===3?4:6,opacity*.8);arc(b.x,b.y,rad*.68,0,Math.PI*2,c[1],2,opacity);
   const n=setting==='high'?42:16;
   for(let i=0;i<n;i++){const an=i*2.399+rand(i,e.seed),p=rand(i+35,e.seed),rr=rad*(.45+.8*p);let yy=b.y+Math.sin(an)*rr*.62;
    if(el===0)yy-=impact*(25+40*p);if(el===1)yy-=Math.sin(impact*Math.PI)*30*p;if(el===4)yy-=impact*18;
    point(b.x+Math.cos(an)*rr,yy,1.5+(el===4?5:3)*p,i%3?c[0]:c[1],opacity*(.35+.4*p));
   }
   if(el===2)for(let i=0;i<3;i++)arc(b.x,b.y-9,rad*.7+i*15,impact*9+i,impact*9+Math.PI*1.2+i,c[i%2],2,opacity*.65);
   if(el===3)for(let i=0;i<5;i++)line(b.x,b.y-12,b.x+(rand(i,e.seed)-.5)*rad*2,b.y+(rand(i+8,e.seed)-.5)*rad,c[i%2],2,opacity);
   if(el===1)arc(b.x,b.y+7,rad*1.1,0,Math.PI*2,c[1],2.2,opacity*.8);
   if(el===4)shake(b.x,b.y,rad,impact,c[0]);
  }
 }
 function swordFrame(e,t){const a=pos(e.from),b=pos(e.to),dx=b.x-a.x,dy=b.y-a.y,angle=Math.atan2(dy,dx),x=b.x,y=b.y-19;
  const strength=e.kind==='heavy'?1.3:1,alpha=Math.sin(Math.PI*t);
  g.save();g.translate(x,y);g.rotate(angle);
  g.beginPath();g.arc(0,0,51*strength,-Math.PI*.85+t*1.25,-Math.PI*.1+t*1.25);g.strokeStyle='#d8fcff';g.lineWidth=7;g.globalAlpha=alpha*.25;g.stroke();g.lineWidth=2;g.globalAlpha=alpha*.95;g.stroke();g.restore();g.globalAlpha=1;
  for(let i=0;i<(setting==='high'?15:6);i++){const theta=i*2.399,rr=(12+rand(i,e.seed)*51)*t;point(x+Math.cos(theta)*rr,y+Math.sin(theta)*rr,1.5+rand(i+3,e.seed)*3,i%3===0?'#ffeab2':'#b4dcfb',alpha*.6)}
 }
 function failedFrame(e,t){const a=pos(e.from),b=pos(e.to),c=e.type==='kenFail'?'#ffd29a':'#97dcff';const x=a.x,y=a.y-35,env=1-t;
  if(e.type==='kenFail'){const delta=(b.x-a.x)*Math.sin(t*Math.PI)*.28;line(x,y,x+delta-15,y+9,'#ffd6a0',6,env*.65);arc(x,y,20+t*55,0,Math.PI*2,c,2,env*.4)}
  else{arc(x,y,18+t*58,-1+t*10,Math.PI*1.1+t*10,c,4,env*.8);arc(x,y,10+t*32,t*13,t*13+Math.PI,c,2,env*.6)}
  for(let i=0;i<(setting==='high'?32:12);i++){const theta=i*2.399+e.seed*.01,p=rand(i,e.seed),rr=(10+70*t)*(.5+p*.5);point(x+Math.cos(theta)*rr,y+Math.sin(theta)*rr*.7,2+3*p,i%2===0?c:'#d9d4d3',env*.8)}
  label(x,y-65,e.tag||'СБОЙ',c,Math.min(1,t*9)*env);
 }
 function render(nowTime){running=false;if(offscreen()||setting==='off'){g.clearRect(0,0,layer.width,layer.height);return}
  if(layer.width!==board.width||layer.height!==board.height){layer.width=board.width;layer.height=board.height}
  const fps=setting==='high'?60:26;if(nowTime-lastFrame<1000/fps){wake();return}lastFrame=nowTime;
  g.clearRect(0,0,layer.width,layer.height);let live=false;
  const f=typeof activeFx==='undefined'?null:activeFx;
  if(f?.action==='seals'&&f.actor&&f.from&&f.world===game){const uniq=f.serial??f.actor+'-'+f.beg;
   if(uniq!==lastSealsSerial){lastSealsSerial=uniq;stats.seals++;}
   sealFrame({from:f.from,element:f.element||0,count:Math.max(1,f.signs?.length||3),seed:3},Math.max(0,Math.min(.999,f.progress||0)));live=true;
  }
  for(let i=effects.length-1;i>=0;i--){const e=effects[i],t=(nowTime-e.at)/e.duration;if(t>=1){effects.splice(i,1);continue}if(t<0)continue;live=true;
   if(e.type==='element')elementalFrame(e,t);else if(e.type==='sword')swordFrame(e,t);else failedFrame(e,t);
  }
  if(live)wake();
 }
 function wake(){if(!running&&setting!=='off'){running=true;requestAnimationFrame(render)}}
 // Remote clients receive a network activeFx; local clients receive cueFx.
 if(typeof priorFX==='function')window.cueFx=function(event){const result=priorFX.apply(this,arguments);if(!event||!game)return result;
   if(event.action==='seals'){stats.seals++;wake()}
   else if(['sword','heavy','quick','melee','stunHit','trip','counter'].includes(event.action)){
    const actor=game.units?.find(u=>u.id===event.actor);if(actor?.team==='enemy'&&typeof visibleToSide==='function'&&!visibleToSide('ally',actor))return result;
    if(!(event.action==='sword'&&actor&&now()-(actor.__lastKen520||0)<1100)){put('sword',event.from,event.target,{kind:event.action,duration:event.action==='heavy'?750:510});stats.kenHits++;}
   }else if(event.action==='jutsu'&&event.element!==undefined){
    put('element',event.from,event.target,{element:event.element,kind:'hit',duration:980});stats.casts++;
   }return result;
 };
 // The base engine marks successful and failed sealing operations here. Unlike 5.19,
 // cast_failed is never treated as a successful release.
 function observe(){if(!game||offscreen())return;
  const last=window.__lastSeal544;
  if(last&&last!==lastSeal){lastSeal=last;
   if(last.result!==false&&last.result!=='cast_failed'&&last.result!=='interrupted'){
    const t=byId[last.id],actor=game.units?.find(u=>u.id===last.actor);
    if(t&&actor&&(actor.team==='ally'||typeof visibleToSide!=='function'||visibleToSide('ally',actor))){
      const el=(t.element!==undefined&&t.element!==null)?t.element:actor.element;
      if(['hit','blast','chain','line','weaponAttack','wall'].includes(t.kind)){
       put('element',{c:actor.c,r:actor.r},last.cell||actor,{element:el,kind:t.kind,duration:t.kind==='blast'?1230:1050,size:t.kind==='blast'?1.55:1});stats.casts++;
      }
    }
   }
  }
  const f=typeof activeFx==='undefined'?null:activeFx;if(f?.action==='seals'&&f.world===game)wake();
 }
 setInterval(observe,85);
 // Network guest effects come from server state.events. Never change authoritative combat state.
 const oldNetworkPlay=window.__arena57?.play;
 if(typeof oldNetworkPlay==='function')window.__arena57.play=function(id,from,to,other={}){
  const output=oldNetworkPlay.apply(this,arguments);
  const tech=byId[id];if(tech&&['hit','blast','chain','line','weaponAttack','wall'].includes(tech.kind)){
   put('element',from,to,{element:tech.element||0,kind:tech.kind,size:tech.kind==='blast'?1.55:1,duration:1120});stats.networkEvents++;
  }
  return output;
 };
 window.__arena520={version:'5.20',castFail,kenFail,play:(type,from,to,opt)=>put(type,from,to,opt),networkEffect,get quality(){return setting},get stats(){return {...stats,active:effects.length}}};
})();

