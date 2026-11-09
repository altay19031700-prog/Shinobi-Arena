
/* SHINOBI ARENA 3.6 — animation pass: 3.1 seals, 3.2 bodies, 3.3 reactions,
   3.4 elemental effects and summons, 3.5 UI synchronization and accessibility. */
(function(){
'use strict';
const allAssets=window.__ARENA35_ASSETS || {actors:[],beasts:{}};
const actors=allAssets.actors.map(src=>{const im=new Image();im.src=src;return im});
const beasts={};for(const [name,src] of Object.entries(allAssets.beasts)){const im=new Image();im.src=src;beasts[name]=im;}
const summary={version:'3.5',steps:['печати','тело','реакции','эффекты дзюцу','синхронизация'],renderFrames:0,handFrames:0,bodyFrames:0,beastFrames:0,jutsuFrames:0};
function clamp35(v,a,b){return Math.max(a,Math.min(b,v));}
function poseFor(u){
 if(u.prone)return 10;
 const fx=typeof activeFx!=='undefined'?activeFx:null;
 if(fx&&fx.actor===u.id){
   const p=fx.progress||0;
   if(fx.action==='seals')return 9;
   if(fx.action==='move')return 1+(Math.floor(p*Math.max(1,fx.path?.length||1)*7)%4);
   if(fx.action==='heavy')return p<.3?0:6;
   if(fx.action==='quick'||fx.action==='melee')return p<.2?0:5;
   if(fx.action==='sword'||fx.action==='counter')return p<.2?0:12;
   if(fx.action==='guard')return 7;
   if(['jutsu','illusion','kunai','shuriken','senbon','poison','paper','flash','poisonBomb'].includes(fx.action))return 11;
 }
 if(u.reaction&&Date.now()-u.reaction.at<480){
   if(u.reaction.kind==='block')return 7;
   if(u.reaction.kind==='hurt')return 8;
   if(u.reaction.kind==='dodge')return 1;
 }
 return u.guard?7:0;
}
window.__arena35DrawActor=function(context,u,x,y,w,h){
 const atlas=actors[u.sprite];if(!atlas||!atlas.complete||!atlas.naturalWidth)return false;
 const frame=poseFor(u);context.drawImage(atlas,196*frame,0,196,320,x,y,w,h);summary.bodyFrames++;return true;
};
window.__arena35DrawBeast=function(context,u,x,y,w,h){
 const atlas=beasts[u.summonType];if(!atlas||!atlas.complete||!atlas.naturalWidth)return false;
 const fx=typeof activeFx!=='undefined'?activeFx:null,acting=fx&&fx.actor===u.id;
 let frame=0;
 if(acting&&fx.action==='move')frame=1+(Math.floor((fx.progress||0)*9)%3);
 else if(acting&&['melee','quick','heavy','pet:attack','pet:special'].includes(fx.action))frame=4;
 else if(u.reaction&&Date.now()-u.reaction.at<440)frame=5;
 context.drawImage(atlas,atlas.naturalWidth/6*frame,0,atlas.naturalWidth/6,atlas.naturalHeight,x,y,w,h);summary.beastFrames++;return true;
};
// Interpolated keyframe table for twelve distinct sign forms (base offset, finger configurations).
const gestures=[
 [0,0,0],[4,-2,1],[1,-7,2],[-3,0,3],[6,2,4],[-2,-4,5],
 [3,3,6],[-6,1,7],[0,-8,8],[7,-2,9],[-5,-3,10],[2,5,11]
];
const palette=['#f8a36d','#7bd5ff','#c6eaf2','#b5b5ff','#e4c696'];
function renderHands(x,y,n,transition,seal,team,element){
 const g=gestures[seal%12],step=clamp35(transition,0,1),wide=1+Math.sin(step*Math.PI)*.18;
 const left=-13+g[0],right=13-g[0],heave=2*Math.sin(step*Math.PI*2);
 ctx.save();ctx.translate(x,y);ctx.scale(wide,1);
 // Forearms rise from shoulders in an alternating sequence; repeated arms are part of each frame.
 for(const side of [-1,1]){
   let ox=side*(21+(g[1]*.1)),oy=18;
   let hx=(side===-1?left:right)+side*(step-.5)*2,hy=-8+(g[1]*.25)+(side===1?-heave:heave);
   ctx.lineCap='round';ctx.strokeStyle='#10191b';ctx.lineWidth=13;
   ctx.beginPath();ctx.moveTo(ox,oy);ctx.quadraticCurveTo(side*20,3,hx,hy);ctx.stroke();
   ctx.strokeStyle=team==='enemy'?'#5f4944':'#344b50';ctx.lineWidth=10;
   ctx.beginPath();ctx.moveTo(ox,oy);ctx.quadraticCurveTo(side*20,3,hx,hy);ctx.stroke();
   ctx.strokeStyle='rgba(170,192,183,.7)';ctx.lineWidth=1.4;
   ctx.beginPath();ctx.moveTo(ox,oy);ctx.quadraticCurveTo(side*20,3,hx,hy);ctx.stroke();
   const rot=side*(.10+(g[2]%4)*.09)+Math.sin(step*Math.PI*2)*.12;
   ctx.save();ctx.translate(hx,hy);ctx.rotate(rot);
   ctx.fillStyle=team==='enemy'?'#342e2e':'#2d3b3e';ctx.strokeStyle='#c8b99b';ctx.lineWidth=1.15;
   ctx.beginPath();ctx.roundRect(-5,-8,10,14,3);ctx.fill();ctx.stroke();
   for(let finger=0;finger<4;finger++){
     const upward=((g[2]+finger)%5===0||finger===g[2]%4);
     const length=upward?11:5+(finger%2)*2;
     const offset=([0,2,1,-1][finger])+(g[2]%3-1)*1.3;
     ctx.strokeStyle='#191e20';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(-4+finger*2.5,-5);ctx.lineTo(-4+finger*2.5+offset,-5-length);ctx.stroke();
     ctx.strokeStyle='#c4b5a1';ctx.lineWidth=1.3;ctx.stroke();
   }
   // Thumb links palms at the center.
   ctx.strokeStyle='#c7baa7';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-2,-2);ctx.lineTo(-2-side*4,-7);ctx.stroke();
   ctx.restore();
 }
 ctx.globalAlpha=.12+.13*Math.sin(step*Math.PI);ctx.strokeStyle=palette[element%5];ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(0,-10,27+5*Math.sin(step*Math.PI),0,Math.PI*2);ctx.stroke();
 ctx.restore();summary.handFrames++;
}
function drawSeal35(){
 if(!game)return;
 const fx=typeof activeFx==='undefined'?null:activeFx;
 const hud=document.getElementById('arena30-status');
 if(!fx||fx.action!=='seals'||fx.world!==game){if(hud)hud.dataset.active='false';return;}
 const u=game.units.find(t=>t.id===fx.actor);if(!u)return;
 if(window.__arena50?.enabled && u.id===window.__arena50.prototypeId()){if(hud)hud.dataset.active='false';return;}
 const seq=fx.signs||[];if(!seq.length)return;
 const p=clamp35(fx.progress||0,0,1),phase=p*seq.length,idx=Math.min(seq.length-1,Math.floor(phase)),local=phase-idx;
 const pp=spritePos(u,center(u.c,u.r));
 renderHands(pp.x,pp.y-54,idx,local,seq[idx],u.team,u.element);
 // Individual sign is identifiable above fighter, but does not obscure HP.
 ctx.save();ctx.globalAlpha=.88;ctx.fillStyle='#132328';ctx.strokeStyle=palette[u.element%5];ctx.lineWidth=1;
 ctx.beginPath();ctx.roundRect(pp.x-35,pp.y-131,70,18,5);ctx.fill();ctx.stroke();
 ctx.fillStyle='#ffefd1';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText((window.arena30?.LABELS[seq[idx]]||'Печать')+' '+(idx+1)+'/'+seq.length,pp.x,pp.y-118);ctx.restore();
 if(hud){hud.dataset.active='true';
   const el=id=>document.getElementById(id);
   if(el('arena30-name'))el('arena30-name').textContent=fx.spellName;
   if(el('arena30-count'))el('arena30-count').textContent=`Печать ${idx+1}/${seq.length}`;
   if(el('arena30-label'))el('arena30-label').textContent=window.arena30?.LABELS[seq[idx]]||'Печать';
   if(el('arena30-progress'))el('arena30-progress').style.width=Math.round(p*100)+'%';}
}
function element35(){
 if(!game||document.querySelector('#arena29-motion')?.checked)return;
 const fx=typeof activeFx==='undefined'?null:activeFx;
 if(!fx||fx.world!==game)return;
 const p=clamp35(fx.progress||0,0,1),b=fx.target?center(fx.target.c,fx.target.r):null;
 if(!b)return;
 if(fx.action==='jutsu'){
  const el=fx.element??0;ctx.save();ctx.translate(b.x,b.y-29);
  if(el===0){ // Fire: staggered ember tongues.
   for(let i=0;i<9;i++){const a=i*2.399,rr=7+24*p+(i%3)*3;
    ctx.globalAlpha=(1-p)*.84;ctx.fillStyle=i%3?'#ffa04c':'#ffe3a2';ctx.beginPath();ctx.ellipse(Math.cos(a)*rr,Math.sin(a)*rr*.5-(1-p)*9,3+6*(1-p),8+7*(1-p),a,0,Math.PI*2);ctx.fill();}
  }else if(el===1){ // Water: outward elliptical ripples.
   ctx.lineWidth=3;for(let i=0;i<3;i++){const r=10+40*((p+i*.28)%1);ctx.strokeStyle=['#64d3ff','#a0e9fa','#438fad'][i];ctx.globalAlpha=(1-p)*.8;ctx.beginPath();ctx.ellipse(0,0,r,r*.32,0,0,Math.PI*2);ctx.stroke();}
  }else if(el===2){ // Air slashes.
   ctx.strokeStyle='#c7faf3';ctx.lineWidth=3;ctx.globalAlpha=1-p;
   for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(0,0,16+i*7+p*22,6+i*4,-.5+i*.5,-1,1.1);ctx.stroke();}
  }else if(el===3){ // Forked lightning.
   ctx.lineWidth=2.6;ctx.strokeStyle='#bce7ff';ctx.globalAlpha=1-p;
   for(let i=0;i<5;i++){const ang=(i/5)*Math.PI*2;ctx.save();ctx.rotate(ang);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(9,-6);ctx.lineTo(14,3);ctx.lineTo(22,-8);ctx.lineTo(36,4);ctx.stroke();ctx.restore()}
  }else{ // Earth spikes that originate below the target.
   ctx.globalAlpha=1-p;ctx.fillStyle='#c7b092';ctx.strokeStyle='#51493b';
   for(let i=0;i<5;i++){const ox=(i-2)*13;ctx.beginPath();ctx.moveTo(ox-7,16);ctx.lineTo(ox,-12-18*(1-p)*(i%2+1));ctx.lineTo(ox+8,16);ctx.closePath();ctx.fill();ctx.stroke();}
  }
  ctx.restore();summary.jutsuFrames++;
 }
 if(fx.action==='smoke'||fx.action==='paper'){
  ctx.save();ctx.globalAlpha=(1-p)*.38;ctx.fillStyle=fx.action==='smoke'?'#c9dce0':'#ffae60';ctx.beginPath();ctx.arc(b.x,b.y-18,20+38*p,0,Math.PI*2);ctx.fill();ctx.restore();
 }
}
// Stage 3.3: readable temporal body reactions without changing hit probabilities.
function fx35Reaction(){
 if(!game)return;
 const now=Date.now();for(const u of game.units){if(!u.reaction||u.hp<=0)continue;
 const dt=now-u.reaction.at;if(dt<0||dt>520)continue;
 const pp=spritePos(u,center(u.c,u.r));ctx.save();ctx.globalAlpha=(1-dt/520)*.8;
 if(u.reaction.kind==='block'){ctx.strokeStyle='#9edbe9';ctx.lineWidth=3;ctx.beginPath();ctx.arc(pp.x,pp.y-43,22+dt*.025,-1.35,1.05);ctx.stroke()}
 if(u.reaction.kind==='dodge'){ctx.strokeStyle='#c9f3e1';ctx.lineWidth=2;for(let i=1;i<=3;i++){ctx.beginPath();ctx.moveTo(pp.x-12-i*9,pp.y-30-i*5);ctx.lineTo(pp.x-3-i*9,pp.y-30-i*5);ctx.stroke()}}
 if(u.reaction.kind==='hurt'){ctx.strokeStyle='#ffaa99';ctx.lineWidth=2;ctx.beginPath();ctx.arc(pp.x,pp.y-48,18+dt*.055,0,Math.PI*2);ctx.stroke()}
 ctx.restore();}
}
const savedDraw=window.draw;
window.draw=function(){savedDraw();if(!game)return;drawSeal35();element35();fx35Reaction();summary.renderFrames++};
// Prevent issuing another command during the entire animation queue.
const arena=document.getElementById('arenaScreen');
if(arena)arena.addEventListener('click',e=>{
 if(!game?.animating)return;
 if(e.target.closest('#arena544-next,#ux55-end'))return;if(e.target.closest('button,#board,#jutsuPanel')){e.preventDefault();e.stopImmediatePropagation();}
},true);
const visualLabel=document.createElement('div');visualLabel.id='arena35-caption';visualLabel.textContent='Кадры: шаг · удар · блок · ранение · печати. Во время анимации повторные команды блокируются.';
const controls=document.getElementById('arena29-controls');controls?.insertAdjacentElement('afterend',visualLabel);
const style=document.createElement('style');style.textContent=`
#arena35-caption{font-size:11px;color:#a7c2bb;margin:4px 0 8px;line-height:1.4}
#arena30-status[data-active="true"]{border-color:#b8a887;box-shadow:0 0 0 1px rgba(219,182,121,.13)}
@media(max-width:740px){#arena35-caption{font-size:10px}#arena30-status{max-width:100%!important;box-sizing:border-box}}
`;document.head.appendChild(style);
window.__arena35={summary,poseFor,get active(){return typeof activeFx!=='undefined'?activeFx:null},actors,beasts};
})();

