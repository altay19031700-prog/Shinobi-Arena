
/* Version 5.23: 80 NEW transparent sprite cells for ten named jutsu. Visual only.
   Local and remote actions still obey the unmodified 5.22 combat network code. */
(()=>{'use strict';
const stage=document.querySelector('#arenaScreen .boardwrap'),board=document.querySelector('#arenaScreen #board');if(!stage||!board)return;
const ids=['fire2','fire3','water2','water3','wind2','wind3','light2','light3','earth2','earth3'];
const idx=Object.fromEntries(ids.map((x,i)=>[x,i]));
const colors={fire2:'#ff772a',fire3:'#ff762a',water2:'#45c8ff',water3:'#45c8ff',wind2:'#a5f5ce',wind3:'#a5f5ce',light2:'#ac93ff',light3:'#ac93ff',earth2:'#d5ac74',earth3:'#d5ac74'};
const atlas=new Image();atlas.src='assets/shinobi_unique_jutsu_10x8.webp';
const layer=document.createElement('canvas');layer.id='shinobi523-layer';layer.width=board.width;layer.height=board.height;layer.setAttribute('aria-hidden','true');
layer.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:18;pointer-events:none!important';
stage.style.position='relative';stage.append(layer);const ctx=layer.getContext('2d');
const animations=[],stats={started:0,finished:0,frames:0,errors:0};let running=false;
const clamp=v=>Math.max(0,Math.min(1,v));const point=p=>typeof window.center==='function'?window.center(p.c,p.r):{x:board.width/2,y:board.height/2};
function image(id,frame,x,y,w,h,angle=0,opacity=1){
 if(!atlas.complete||atlas.naturalWidth!==2048)return;
 ctx.save();ctx.globalAlpha=clamp(opacity);ctx.translate(x,y);ctx.rotate(angle);
 ctx.drawImage(atlas,frame*256,idx[id]*256,256,256,-w/2,-h/2,w,h);ctx.restore();
}
function ring(x,y,r,color,alpha=1){ctx.save();ctx.globalAlpha=clamp(alpha);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.shadowColor=color;ctx.shadowBlur=12;ctx.beginPath();ctx.ellipse(x,y,r,r*.48,0,0,Math.PI*2);ctx.stroke();ctx.restore()}
function render(a,t){
 const id=a.id,p=point(a.from),z=point(a.to),color=colors[id],travel=t<.15?0:t<.6?(t-.15)/.45:1;
 const prog=clamp(travel),ease=prog*prog*(3-2*prog),x=p.x+(z.x-p.x)*ease,y=p.y+(z.y-p.y)*ease;
 if(t<.15){const v=t/.15;ring(p.x,p.y,12+24*v,color,1-v*.55);image(id,Math.floor(v*2),p.x,p.y-40,90,95,0,.5+v*.4)}
 else if(t<.6){
  const f=Math.min(5,Math.floor(prog*6));const anchored=['water2','earth2','earth3','fire2'].includes(id);
  const px=anchored?z.x:x,py=anchored?z.y-40:y-38;
  ring(p.x,p.y,26,color,(1-prog)*.26);
  if(!anchored)for(let j=2;j>0;j--){const u=Math.max(0,ease-j*.045),xx=p.x+(z.x-p.x)*u,yy=p.y+(z.y-p.y)*u;image(id,f,xx,yy-38,94,88,0,.12)}
  image(id,f,px,py,id==='fire3'||id==='water3'||id==='earth3'?186:139,136,0,.88);
 }else{
  const v=clamp((t-.6)/.4),f=Math.min(7,Math.floor(v*8));
  image(id,f,z.x,z.y-39,['fire3','water3','earth3','wind2'].includes(id)?206:166,182,0,Math.min(1,v/.09)*Math.min(1,(1-v)/.17));
  ring(z.x,z.y,16+70*v,color,(1-v)*.55);
  if(a.hitIds?.length)for(const hitId of a.hitIds){const u=window.game?.units?.find(x=>x.id===hitId);if(u){const h=point(u);ring(h.x,h.y,10+25*v,color,(1-v)*.5)}}
 }
 stats.frames++;
}
let lastRender534=0;function draw(){running=false;if(document.hidden||window.__arena520?.quality==='off'||!document.querySelector('#arenaScreen.active')){ctx.clearRect(0,0,layer.width,layer.height);animations.length=0;return}
 if(layer.width!==board.width||layer.height!==board.height){layer.width=board.width;layer.height=board.height}
 const now534=performance.now();if(window.__arena520?.quality==='low'&&now534-lastRender534<1000/26){wake();return}lastRender534=now534;
 ctx.clearRect(0,0,layer.width,layer.height);
 for(let i=animations.length-1;i>=0;i--){const a=animations[i],v=(performance.now()-a.at)/a.duration;
  if(v>1){animations.splice(i,1);stats.finished++;continue}
  try{render(a,clamp(v))}catch(e){stats.errors++;console.warn('5.23 FX',e);animations.splice(i,1)}
 }if(animations.length)wake();
}
function wake(){if(!running){running=true;requestAnimationFrame(draw)}}
window.__shinobi523={version:'5.23',handles:id=>Object.hasOwn(idx,id),onCast(ev){if(window.__arena520?.quality==='off'||!Object.hasOwn(idx,ev.id)||window.__shinobi524?.handles(ev.id))return false;animations.push(ev);if(animations.length>12)animations.shift();stats.started++;wake();return true},get ready(){return atlas.complete&&atlas.naturalWidth===2048},get stats(){return {...stats,active:animations.length}},get ids(){return ids.slice()},previewAt(id,from,to,t){if(!Object.hasOwn(idx,id))return false;ctx.clearRect(0,0,layer.width,layer.height);render({id,from,to,hitIds:[],duration:1380},clamp(t));return true}};
})();
