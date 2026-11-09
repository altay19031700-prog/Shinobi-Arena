
/* Shinobi Arena 5.22: presentation-only synchronized jutsu sequence.
   Mechanics, damage rolls, AP, chakra and network authority are unchanged. */
(()=>{'use strict';
const board=document.getElementById('board'),root=document.querySelector('#arenaScreen .boardwrap');
if(!board||!root)return;
const atlas=new Image();atlas.src="assets/shinobi_ninjutsu_5elements_60frames.webp";
const layer=document.createElement('canvas');layer.id='shinobi522-layer';
layer.width=board.width;layer.height=board.height;
layer.setAttribute('aria-hidden','true');
layer.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:15;pointer-events:none!important;mix-blend-mode:screen';
root.style.position='relative';root.append(layer);
const ctx=layer.getContext('2d',{alpha:true});
const techs=window.__arena18?.TECHS||[];
const byId=Object.fromEntries(techs.map(t=>[t.id,t]));
const byName=Object.fromEntries(techs.map(t=>[t.name,t]));
const typeToRow={0:0,1:1,2:2,3:3,4:4};
const palettes=[['#ff6b27','#ffcb5b'],['#48bfff','#d1f5ff'],['#d7ffcc','#a3f1ba'],['#a691ff','#f0e2ff'],['#d6b99b','#fff0c9']];
const stages={charge:160,flight:600,impact:350,settle:270};
const duration=stages.charge+stages.flight+stages.impact+stages.settle;
const animations=[],pending=new Map(),history=[];
const stats={started:0,completed:0,failed:0,affected:0,rendered:0,errors:0};
let lastSeal=null,playing=false,lastTime=0;
const now=()=>performance.now();
const getCell=(c)=>c&&Number.isFinite(c.c)&&Number.isFinite(c.r)?{c:c.c,r:c.r}:null;
const where=c=>{if(c&&typeof window.center==='function')return window.center(c.c,c.r);return{x:board.width/2,y:board.height/2}};
const clip=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clip(v);return v*v*(3-2*v)};
function drawFrame(row,frame,p,w,h,angle=0,alpha=1){
 if(!atlas.complete||atlas.naturalWidth!==3072)return false;
 ctx.save();ctx.globalAlpha=clip(alpha);ctx.translate(p.x,p.y);ctx.rotate(angle);
 ctx.drawImage(atlas,Math.max(0,Math.min(11,frame))*256,row*256,256,256,-w/2,-h/2,w,h);
 ctx.restore();return true;
}
function ring(x,y,r,color,width,alpha){ctx.save();ctx.globalAlpha=clip(alpha);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.ellipse(x,y,r,r*.46,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
function spark(x,y,t,row,seed=0){const colors=palettes[row]||palettes[0];for(let i=0;i<(lowQuality()?6:12);i++){const a=i*2.399+seed,rad=(i%4+1)*4+15*t,x1=x+Math.cos(a)*rad,y1=y+Math.sin(a)*rad*.7-15*t;ctx.save();ctx.globalAlpha=clip((1-t)*(.25+i%3*.15));ctx.fillStyle=colors[i%2];ctx.beginPath();ctx.arc(x1,y1,1.3+(i%3),0,Math.PI*2);ctx.fill();ctx.restore()}}
function lowQuality(){return window.__arena520?.quality==='low'}
function qualityOff(){return window.__arena520?.quality==='off'}
function hitIds(tech,to,source){
 if(!game||!to)return[];
 const r=['blast','area','line'].includes(tech?.kind)?Math.max(1,Number(tech.radius||tech.aoe||tech.area||2)):0;
 const units=game.units||[];
 return units.filter(u=>u.hp>0&&(!u.isClone||u.hp>0)&&
    (u.team==='ally'||typeof visibleToSide!=='function'||visibleToSide('ally',u)) &&
    (r? (typeof dist==='function'?dist(u,to)<=r:Math.abs(u.c-to.c)+Math.abs(u.r-to.r)<=r):u.c===to.c&&u.r===to.r)).map(u=>u.id);
}
function start(data){
 if(qualityOff())return false;
 const row=typeToRow[Number(data.element)];if(row===undefined||!data.from||!data.to)return false;
 const ev={...data,element:Number(data.element),at:now(),duration,stage:'charge',hitIds:data.hitIds||[]};
 animations.push(ev);if(animations.length>12)animations.shift();stats.started++;
 if(window.__shinobi524?.handles(data.id))window.__shinobi524.onCast(ev);
 else if(window.__shinobi523?.handles(data.id))window.__shinobi523.onCast(ev);
 history.push({id:data.id,element:data.element,from:data.from,to:data.to,source:data.source||'local',at:Date.now(),targets:ev.hitIds.slice()});
 if(history.length>40)history.shift();wake();return true;
}
function draw(ev,t){
 if(window.__effects534?.render(ctx,{...ev,kind:byId[ev.id]?.kind},t,where(ev.from),where(ev.to)))return;
 if(window.__jutsu529?.render(ctx,{...ev,kind:byId[ev.id]?.kind},t,where(ev.from),where(ev.to)))return;
 if(window.__shinobi524?.handles(ev.id)||window.__shinobi523?.handles(ev.id))return;
 const row=ev.element,from=where(ev.from),to=where(ev.to),colors=palettes[row];
 const x0=from.x,y0=from.y-39,x1=to.x,y1=to.y-36,dx=x1-x0,dy=y1-y0;
 const d=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx);
 const q=clip(t),age=q*duration;
 let phase='charge';
 if(age<stages.charge){
  const u=age/stages.charge;phase='charge';
  ring(x0,y0,16+24*u,colors[0],2.5,1-u*.4);ring(x0,y0,26-6*u,colors[1],2.5,.5);
  spark(x0,y0,.3*u,row,ev.element);
  drawFrame(row,Math.min(2,Math.floor(u*3)),{x:x0,y:y0},65+35*u,65+35*u,0,.65+u*.35);
 }else if(age<stages.charge+stages.flight){
  phase='flight';const u=(age-stages.charge)/stages.flight,p=ease(u);
  const a={x:x0+dx*p,y:y0+dy*p-Math.sin(Math.PI*p)*9};
  ring(x0,y0,20+9*u,colors[0],2,(1-u)*.45);
  for(let j=3;j>=1;j--){const f=Math.max(0,p-j*.04),pt={x:x0+dx*f,y:y0+dy*f-Math.sin(Math.PI*f)*9};
   drawFrame(row,Math.min(7,Math.floor(u*8)),pt,90-j*14,80-j*10,angle*.15,(4-j)*.13)}
  drawFrame(row,Math.min(7,Math.floor(u*8)),a,row===3?141:124,108,angle*.15,1);
  if(!lowQuality())spark(a.x,a.y,u*.25,row,ev.element);
 }else if(age<stages.charge+stages.flight+stages.impact){
  phase='impact';const u=(age-stages.charge-stages.flight)/stages.impact;
  drawFrame(row,8+Math.min(3,Math.floor(u*4)),{x:x1,y:y1+7},176+55*u,140+25*u,0,Math.min(1,u/.10)*Math.min(1,(1-u)/.16));
  ring(to.x,to.y,12+78*u,colors[0],4,(1-u)*.55);
  for(const id of ev.hitIds){const unit=game?.units?.find(x=>x.id===id);if(!unit)continue;
   const p=where(unit);ring(p.x,p.y,21+25*u,colors[1],2,(1-u)*.65);
   spark(p.x,p.y-25,u,row,String(id).length*.3);
  }
 }else{
  phase='settle';const u=(age-stages.charge-stages.flight-stages.impact)/stages.settle;
  drawFrame(row,11,{x:x1,y:y1+7},142*(1+.22*u),136*(1+.2*u),0,(1-u)*.38);
  if(!lowQuality())spark(x1,y1,u,row,ev.element);
 }
 if(phase!==ev.stage){ev.stage=phase;if(phase==='impact')stats.affected+=ev.hitIds.length}
 ev.progress=q;
}
function reactionShift(unit){
 if(!unit||qualityOff()||window.__authoredAnimations?.hasSprite(unit.sprite))return 0;
 for(let i=animations.length-1;i>=0;i--){const e=animations[i];if(!e.hitIds.includes(unit.id))continue;
  const t=now()-e.at,base=stages.charge+stages.flight;
  if(t>=base&&t<base+240){return Math.sin((t-base)/240*Math.PI*4)*7*(1-(t-base)/240)*(unit.team==='ally'?-1:1)}
 }return 0;
}
function wake(){if(playing||qualityOff())return;playing=true;requestAnimationFrame(tick)}
function tick(time){playing=false;
 if(!document.getElementById('arenaScreen')?.classList.contains('active')||qualityOff()){ctx.clearRect(0,0,layer.width,layer.height);return}
 if(time-lastTime<(lowQuality()?1000/26:1000/50)){wake();return}lastTime=time;
 if(layer.width!==board.width||layer.height!==board.height){layer.width=board.width;layer.height=board.height}
 ctx.clearRect(0,0,layer.width,layer.height);
 for(let i=animations.length-1;i>=0;i--){const ev=animations[i],age=now()-ev.at;
  if(age>ev.duration){animations.splice(i,1);stats.completed++;continue}
  try{draw(ev,age/ev.duration);stats.rendered++}catch(err){stats.errors++;console.warn('Shinobi 5.22 visual error',err);animations.splice(i,1)}
 }
 if(animations.length){if(typeof window.draw==='function')try{window.draw()}catch(_){}wake()}
}
const oldPos=typeof spritePos==='function'?spritePos:null;
if(oldPos)spritePos=function(unit,p){const r=oldPos(unit,p),shift=reactionShift(unit);return shift?{...r,x:r.x+shift}:r};
const oldCue=window.cueFx;
if(typeof oldCue==='function')window.cueFx=function(data){const result=oldCue.apply(this,arguments);
 if(data?.action==='seals'){
  const t=byName[data.spellName];if(t){pending.set(data.actor,{id:t.id,element:data.element,from:getCell(data.from),to:getCell(data.target),tech:t,gameRef:game});}
 }
 return result;
};
function handleSeal(){const last=window.__lastSeal544;if(!last||last===lastSeal)return;lastSeal=last;
 const item=pending.get(last.actor);if(item)pending.delete(last.actor);
 if(last.result===false||last.result==='cast_failed'||last.result==='interrupted'){stats.failed++;return}
 const t=byId[last.id];const actor=game?.units?.find(u=>u.id===last.actor);
 if(!t||!actor)return;
 if(actor.team==='enemy'&&typeof visibleToSide==='function'&&!visibleToSide('ally',actor))return;
 const row=t.element===undefined||t.element===null?actor.element:t.element;
 const from=item?.from||{c:actor.c,r:actor.r},to=getCell(last.cell)||item?.to||from;
 const included=['hit','blast','chain','line','weaponAttack','area'];
 if(!included.includes(t.kind)||t.element==null)return;
 start({id:last.id,element:row,from,to,hitIds:hitIds(t,to,from)});
}
setInterval(()=>{try{if(game&&document.getElementById('arenaScreen')?.classList.contains('active'))handleSeal()}catch(err){stats.errors++;console.warn(err)}},55);
// Online guests already receive authoritative visual events, not local damage state.
const oldOnline=window.__arena57?.play;
if(typeof oldOnline==='function')window.__arena57.play=function(id,from,to,opt={}){
 const res=oldOnline.apply(this,arguments),t=byId[id];
 if(t&&t.element!=null&&['hit','blast','chain','line','area','weaponAttack'].includes(t.kind))start({id,element:t.element??0,from,to,hitIds:hitIds(t,to,from),source:'network'});
 return res;
};
window.__shinobi522={version:'5.22',enabled:true,stageDurations:{...stages},previewAt:(element,from,to,progress,hitIds=[])=>{animations.length=0;ctx.clearRect(0,0,layer.width,layer.height);draw({element,from,to,hitIds,stage:'preview',seed:1},clip(progress));return true},play:(element,from,to,opt={})=>start({id:opt.id||'preview',element,from,to,hitIds:opt.hitIds||[],source:'test'}),reactionShift,get stats(){return{...stats,active:animations.length,pending:pending.size}},get history(){return history.slice()},get framesReady(){return atlas.complete&&atlas.naturalWidth===3072}};
})();
