/* 5.34: geometry follows technique kind; visual-only, bounded per-effect work. */
(()=>{'use strict';
const clamp=x=>Math.max(0,Math.min(1,x)),TAU=Math.PI*2;
const items=new Set(['_kunai','_shuriken','_senbon','_poison','_poisonBomb','_smoke','_paper','_flash']);
const tones=[['#ff642e','#fff1a5'],['#43b6ed','#dcffff'],['#9ad9c3','#eefff7'],['#a99aff','#f5f0ff'],['#ad8961','#ead4a5']];
function render(c,e,t,a,b){
 if(t<0||t>1||!Number.isFinite(t)||window.__arena520?.quality==='off')return false;
 if(e.type==='genjutsu'&&e.resisted){c.save();c.globalAlpha=clamp(t*8)*clamp((1-t)*5);c.strokeStyle='#a3a0c7';c.lineWidth=1.5;for(let i=0;i<8;i++){const q=i*TAU/8,r=12+t*42;c.beginPath();c.moveTo(b.x+Math.cos(q)*r,b.y-40+Math.sin(q)*r*.6);c.lineTo(b.x+Math.cos(q)*(r+8),b.y-40+Math.sin(q)*(r+8)*.6);c.stroke()}c.font='bold 11px system-ui';c.textAlign='center';c.fillStyle='#d4cbea';c.fillText('СОПРОТИВЛЕНИЕ',b.x,b.y-86);c.restore();return true;}
 const item=items.has(e.id),kind=e.kind,element=e.element==null?['fire','water','wind','light','earth'].indexOf(e.type):Number(e.element);
 const shape=!item&&element>=0&&element<5&&['line','blast','chain'].includes(kind);
 if(!item&&!shape)return false;
 const low=window.__arena520?.quality==='low',count=low?12:24,fade=clamp(t*12)*clamp((1-t)*5),flight=clamp(t/.58),impact=clamp((t-.58)/.42),dx=b.x-a.x,dy=b.y-a.y,angle=Math.atan2(dy,dx);
 const palette=item?(e.id==='_poisonBomb'||e.id==='_poison'?['#69b178','#d4e9a0']:['#aec3c9','#f0f1dc']):tones[element];
 const line=(points,color,width=2,opacity=1)=>{c.globalAlpha=fade*opacity;c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke()};
 const ellipse=(x,y,rx,ry,col,opacity=1,width=2)=>{c.globalAlpha=fade*opacity;c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.stroke()};
 c.save();c.lineCap='round';c.lineJoin='round';
 if(item){
  const thrown=t<.58,x=a.x+dx*flight,y=a.y-42+dy*flight-Math.sin(flight*Math.PI)*45;
  if(thrown){c.save();c.translate(x,y);c.rotate(angle+(e.id==='_shuriken'?t*TAU*5:0));
   c.fillStyle=palette[1];c.strokeStyle=palette[0];c.globalAlpha=fade;
   if(e.id==='_senbon'){for(let i=-1;i<=1;i++)line([[-17,i*4],[13,i*4]],palette[1],1.4)}
   else if(e.id==='_shuriken'){c.beginPath();for(let i=0;i<8;i++){const q=i*Math.PI/4,r=i%2?3:13;c.lineTo(Math.cos(q)*r,Math.sin(q)*r)}c.closePath();c.fill();c.fillStyle='#273b40';c.beginPath();c.arc(0,0,2,0,TAU);c.fill()}
   else if(e.id==='_kunai'||e.id==='_poison'){c.beginPath();c.moveTo(17,0);c.lineTo(-3,-5);c.lineTo(-1,5);c.closePath();c.fill();line([[-3,0],[-14,0]],palette[0],3);ellipse(-17,0,3,3,palette[0])}
   else{c.rotate(t*6);c.fillStyle=e.id==='_paper'?'#c9bfa3':'#53645e';c.fillRect(-6,-8,12,16);line([[-4,-5],[4,-5],[0,4]],e.id==='_paper'?'#843c30':palette[0],1.6)}c.restore();
  }else if(['_smoke','_poisonBomb'].includes(e.id)){
   // Small bounded puffs; no whole-screen haze and no unbounded particle array.
   for(let i=0;i<(low?7:13);i++){const q=i*2.399,r=impact*(22+i%4*14),x=b.x+Math.cos(q)*r,y=b.y-20+Math.sin(q)*r*.45-impact*30;c.globalAlpha=fade*(.18+.08*(i%3));c.fillStyle=e.id==='_poisonBomb'?(i%2?'#89b961':'#436e58'):(i%2?'#a6b4b7':'#53666d');c.beginPath();c.arc(x,y,12+impact*(12+i%3*4),0,TAU);c.fill()}
  }else if(e.id==='_paper'||e.id==='_flash'){
   const rad=12+impact*82;ellipse(b.x,b.y-8,rad,rad*.5,e.id==='_paper'?'#ed9c4b':'#e5ebcc',1-impact,4);
   for(let i=0;i<count;i++){const q=i*2.399,r=rad*(.4+i%5*.13);line([[b.x+Math.cos(q)*r*.65,b.y-25+Math.sin(q)*r*.5],[b.x+Math.cos(q)*r,b.y-25+Math.sin(q)*r*.65]],e.id==='_paper'?'#ffc568':'#f1f6dd',2,(1-impact)*.9)}
  }else{for(let i=0;i<6;i++){const q=i*2.399,r=impact*24;line([[b.x,b.y-35],[b.x+Math.cos(q)*r,b.y-35+Math.sin(q)*r]],palette[i%2],1.5,1-impact)}}
  c.restore();return true;
 }
 // Ninjutsu supplements existing authored sprite effects; all impact centers stay on the selected cell.
 if(kind==='line'){
  const reach=clamp((t-.08)/.42),width=Math.sin(clamp(t/.8)*Math.PI)*(element===0?16:element===1?10:7);
  for(let j=-1;j<=1;j++){const pts=[];for(let i=0;i<=20;i++){const u=i/20*reach,off=Math.sin(u*12-t*18+j)*width;pts.push([a.x+dx*u-Math.sin(angle)*off,a.y-40+dy*u+Math.cos(angle)*off])}line(pts,palette[j===0?1:0],j===0?3:2,.7*(1-impact))}
 }else if(kind==='blast'&&t>.4){const p=clamp((t-.4)/.6),r=15+p*92;ellipse(b.x,b.y,r,r*.48,palette[0],1-p,4);ellipse(b.x,b.y-12,r*.75,r*.45,palette[1],(1-p)*.6,2);for(let i=0;i<count;i++){const q=i*2.399,x=b.x+Math.cos(q)*r,y=b.y+Math.sin(q)*r*.45-p*(1-p)*55;line([[x,y],[x+Math.cos(q)*9,y-6]],palette[i%2],element===4?5:2,1-p)}}
 else if(kind==='chain'&&t>.46){for(let i=0;i<(low?3:5);i++){const q=i*TAU/5+t*.7,r=12+impact*28;line([[b.x,b.y-37],[b.x+Math.cos(q)*r*.5,b.y-37+Math.sin(q)*r],[b.x+Math.cos(q)*r,b.y-37+Math.sin(q)*r*.65]],palette[i%2],2,(1-impact)*.8)}}
 c.restore();return false;
}
window.__effects534={render,items:[...items]};
// Cache snapshots of resolved damage, without changing combat rolls or status timers.
const states=new WeakMap();const oldCue=window.cueFx;
window.cueFx=function(event){
 if(event&&typeof game!=='undefined'&&game){const actor=game.units.find(u=>u.id===event.actor);const clip=event.action==='move'?'walk':['seals','jutsu','genjutsu','illusion'].includes(event.action)?'jutsu':['sword','melee','quick','heavy','counter','stunHit','trip'].includes(event.action)?'punch':null;if(actor&&clip)window.__authoredAnimations?.prepare(actor.sprite,clip);}
 if(event&&typeof game!=='undefined'&&game&&event.action!=='seals'){
  const techniques=window.__arena18?.TECHS||[],tech=techniques.find(t=>t.name===event.spellName);
  const elemental=event.action==='jutsu'&&tech?.element!=null,delay=elemental?760:['kunai','shuriken','senbon','poison','paper','flash','smoke','poisonBomb'].includes(event.action)?380:200;
  const targets=(game.units||[]).filter(u=>event.affectedIds?.includes(u.id)||u.id===event.targetId||(u.c===event.target?.c&&u.r===event.target?.r));
  for(const u of targets){if(u.id===event.actor)continue;const rx=u.reaction;if(rx&&Date.now()-rx.at<180){states.set(u,{source:rx,kind:rx.kind,at:Date.now()+delay});window.__authoredAnimations?.prepare(u.sprite,rx.kind);}}
 }
 return oldCue.apply(this,arguments);
};
window.__presentation534={reaction(u,wall){const r=states.get(u);if(!r||r.source!==u.reaction)return null;return {kind:r.kind,at:r.at,pending:wall<r.at}}};
// Optional on-device diagnostic: keeps only counters, stops its RAF when hidden or disabled.
const btn=document.createElement('button');btn.type='button';btn.id='smoothness534';btn.textContent='Плавность';btn.title='Показать частоту кадров на этом устройстве';const anchor=document.getElementById('shinobi520-quality');anchor?.insertAdjacentElement('afterend',btn);
let enabled=false,frames=0,last=0,start=0,long=0,raf=0;const status=document.createElement('output');status.id='smoothness534-status';status.style.cssText='display:none;position:fixed;right:8px;top:145px;z-index:4000;background:#10282f;color:#d9eeea;padding:7px;border:1px solid #60887d;border-radius:7px;pointer-events:none;font:12px system-ui';document.body.append(status);
function frame(now){if(!enabled||document.hidden){raf=0;return}if(last&&now-last>50)long++;last=now;frames++;if(now-start>=1000){status.textContent=Math.round(frames*1000/(now-start))+' FPS · пауз >50 мс: '+long;start=now;frames=long=0}raf=requestAnimationFrame(frame)}
btn.onclick=()=>{enabled=!enabled;status.style.display=enabled?'block':'none';btn.setAttribute('aria-pressed',String(enabled));if(enabled){start=performance.now();frames=long=0;last=0;if(!raf)raf=requestAnimationFrame(frame)}else{cancelAnimationFrame(raf);raf=0}};
document.addEventListener('visibilitychange',()=>{last=0;start=performance.now();frames=long=0;if(!document.hidden&&enabled&&!raf)raf=requestAnimationFrame(frame)});
})();
