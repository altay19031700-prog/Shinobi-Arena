
/* Shinobi Arena 5.12 - articulated animation pass.
   Render only: no changes to action validation, positions, damage, resources, AI or jutsu.
   Separate torso/shoulder/wrist/knee/ankle movement, planted stance feet,
   short blended key-pose transitions and physically timed recoil. */
(()=>{'use strict';
const portraits=window.__shinobi510Portraits||{};
const atlas=(window.__ARENA35_ASSETS?.actors||[]).map(uri=>{const im=new Image();im.src=uri;return im});
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const bell=x=>Math.sin(Math.PI*clamp(x));
const fade=(t,a,b,c,d)=>smooth((t-a)/(b-a))*(1-smooth((t-c)/(d-c)));
const PI=Math.PI,TWO=PI*2;
const Z={head:[.50,.17],neck:[.5,.275],shoulderL:[.29,.35],shoulderR:[.71,.35],handL:[.2,.58],handR:[.8,.58],chest:[.5,.44],hip:[.5,.67],kneeL:[.38,.8],kneeR:[.62,.8],footL:[.35,.94],footR:[.68,.94]};
const STATS={draws:0,meshCells:0,transitions:0,stepFrames:0,attackFrames:0,defenseFrames:0,sealFrames:0,stalledFrames:0,imagesMissing:0};
const states=new Map(),lastFrames=new Map();
const MESH_COLS=7,MESH_ROWS=12;
function category(kind){
 if(kind==='move')return 'move';
 if(['sword','melee','quick','heavy','counter','stunHit','trip'].includes(kind))return 'strike';
 if(['kunai','shuriken','senbon','poison','paper','flash','poisonBomb','smoke'].includes(kind))return 'throw';
 if(['seals','jutsu','illusion','barrier','summon','tech'].includes(kind))return 'seal';
 if(['hurt','dodge','block','guard'].includes(kind))return 'defense';
 return 'idle';
}
function battleState(u){
 const effect=(typeof activeFx==='undefined')?null:activeFx;
 if(effect&&effect.actor===u.id)return {kind:effect.action||'idle',p:clamp(effect.progress||0),steps:Math.max(1,effect.path?.length||1)};
 const react=u.reaction;
 if(react){const age=Date.now()-react.at;if(age>=0&&age<560)return {kind:react.kind==='block'?'block':react.kind==='dodge'?'dodge':'hurt',p:clamp(age/560),steps:1}}
 return {kind:u.guard?'guard':'idle',p:0,steps:1};
}
function poseFor(id,state){
 const {kind,p}=state,type=category(kind);
 let key=0;
 if(type==='move'){
   const z=(p*state.steps)%1;
   key=z<.13?1:z<.48?2:z<.72?3:1;
 } else if(type==='strike')key=p<.22?1:p<.57?2:p<.84?3:0;
 else if(type==='throw')key=p<.23?1:p<.7?2:0;
 else if(type==='seal')key=p<.2?1:p<.74?2:0;
 else if(type==='defense')key=kind==='hurt'||kind==='dodge'?3:1;
 // For original sprite atlases, preserve authored gait and impact frames.
 if(id<24){
   if(type==='move')return [1,2,3,4][Math.floor(p*state.steps*4)%4];
   if(type==='strike')return key===1?6:key===2?(kind==='sword'?12:5):key===3?10:0;
   if(type==='throw')return key===1?4:key===2?6:0;
   if(type==='seal')return key===0?0:key===1?9:11;
   if(type==='defense')return kind==='guard'||kind==='block'?7:8;
   return 0;
 }
 // Keep the same portrait throughout mesh deformation: no doubled silhouettes.
 return id===24&&kind==='sword'?(p<.08?0:key):0;
}
const walkAtlas=new Image();walkAtlas.src='assets/f37fc4c800ed6585a519744c.webp';
const walkAtlases={24:walkAtlas};for(const [id,url]of Object.entries({"25":"assets/9795f21726df8277ec4698a1.webp","26":"assets/7163bb906c08dc6bf9270e00.webp","27":"assets/a620e33c98dc45212bd1b3ff.webp","28":"assets/542a9e781b448ab6aeb6e994.webp"})){const im=new Image();im.src=url;walkAtlases[id]=im;}
const attackAtlases={};for(const [id,url]of Object.entries({"25":"assets/1348721859df9823731323e2.webp","26":"assets/c15bf08f4cc488d4b602cac0.webp","27":"assets/dad5a1c70e032d48f4b27abc.webp","28":"assets/56653c02ae494cd7bb252f1a.webp"})){const im=new Image();im.src=url;attackAtlases[id]=im;}
function spriteSource(u,frame){
 const id=Number(u.sprite)||0;
 if(id<24){const img=atlas[id];if(!img?.naturalWidth)return null;return {img,ox:196*frame,oy:0,w:196,h:320,key:id+':'+frame}}
 const clip=id===24&&frame>0?(frame===1?poses592.windup:frame===2?poses592.strike:images[id]):images[id];
 const img=clip?.complete&&clip.naturalWidth?clip:images[id];if(!img?.complete||!img.naturalWidth)return null;
 if(!img._rigRaster){const c=document.createElement('canvas');c.width=512;c.height=696;c.getContext('2d').drawImage(img,0,0,c.width,c.height);img._rigRaster=c;}
 return {img:img._rigRaster,ox:0,oy:0,w:512,h:696,key:id+':'+frame};
}
function pointsFor(u,state,time){
 const {kind,p,steps}=state,type=category(kind);
 const seed=String(u.id).split('').reduce((a,c)=>a+c.charCodeAt(0),0);
 const out=[];
 const push=(part,x,y,r=.19)=>{const [a,b]=Z[part];out.push({a,b,x,y,r})};
 const breath=Math.sin(time*.002+seed*.19);
 const gait=steps*p*2;
 const stepPhase=TWO*gait,step=Math.sin(stepPhase);
 // Stance travels backward against world motion; swing returns the lifted foot.
 const foot=(phase)=>{const q=((phase%1)+1)%1;return q<.6?{x:.19-.38*q/.6,y:0}:{x:-.19+.38*smooth((q-.6)/.4),y:-.075*Math.sin(PI*(q-.6)/.4)}};
 const lf=foot(gait),rf=foot(gait+.5);
 const leftLift=-lf.y,rightLift=-rf.y;
 if(type==='move'){
   const envelope=Math.min(1,p*8,(1-p)*8);
   const stride=envelope*(kind==='move'?1:0.8);
   // Asymmetric leg stride; stance feet do not slide during rest state.
   push('hip',step*.018*stride,-.009*(1-Math.cos(stepPhase*2))*stride,.26);
   push('chest',-step*.011*stride,-.011*stride,.20);
   push('head',-step*.007*stride,-.006*stride,.17);
   push('kneeL',lf.x*.55*stride,lf.y*.55*stride,.16);
   push('footL',lf.x*stride,lf.y*stride,.17);
   push('kneeR',rf.x*.55*stride,rf.y*.55*stride,.16);
   push('footR',rf.x*stride,rf.y*stride,.17);
   push('handL',-step*.088*stride,step*.014*stride,.19);
   push('handR',step*.079*stride,-step*.012*stride,.19);
   push('shoulderL',-step*.015*stride,0,.12);
   push('shoulderR',step*.015*stride,0,.12);
 }else if(type==='strike'){
   const wind=fade(p,.025,.20,.27,.43),thrust=fade(p,.19,.37,.64,.83),follow=fade(p,.54,.69,.88,1.05);
   const mass=kind==='heavy'?1.15:kind==='quick'?.72:1;
   push('hip',mass*(.045*thrust-.013*wind),-.018*thrust,.27);
   push('chest',mass*(.12*thrust-.075*wind-.015*follow),-.045*thrust,.22);
   push('neck',mass*(.043*thrust-.016*wind),-.023*thrust,.14);
   push('head',mass*(.049*thrust-.024*wind),-.036*thrust,.16);
   push('shoulderR',mass*(.11*thrust-.02*wind),-.04*wind,.14);
   push('handR',mass*(.32*thrust-.17*wind-.08*follow),-.145*wind+.025*follow,.18);
   push('handL',mass*(.07*thrust-.052*wind),.023*wind,.16);
   push('kneeR',.085*thrust,-.014*thrust,.17);
   push('footR',.11*thrust,-.017*thrust,.14);
   push('kneeL',-.027*thrust,.009*thrust,.15);
   // planted rear foot absorbs the sword lunge
   push('footL',-.015*thrust,0,.13);
 }else if(type==='throw'){
   const aim=fade(p,.06,.25,.42,.58),release=fade(p,.33,.5,.71,.9);
   push('chest',-.05*aim+.065*release,-.019*release,.2);
   push('handR',-.16*aim+.28*release,-.10*aim+.02*release,.18);
   push('handL',.06*aim,-.055*aim,.16);
   push('shoulderR',.03*release,-.015*aim,.13);
 }else if(type==='seal'){
   const prep=smooth(p/.21),finish=1-smooth((p-.78)/.21);
   const envelope=prep*finish;
   const freq=kind==='seals'?5:3;
   const variation=Math.sin(p*TWO*freq+seed*.02);
   push('handL',.16*envelope+variation*.024*envelope,-.175*envelope,.20);
   push('handR',-.16*envelope-variation*.024*envelope,-.175*envelope,.20);
   push('shoulderL',.025*envelope,-.015*envelope,.13);
   push('shoulderR',-.025*envelope,-.015*envelope,.13);
   push('chest',0,-.02*envelope,.22);
   push('head',0,-.009*envelope,.14);
 }else if(type==='defense'){
   const shield=kind==='guard'?1:bell(p);
   const reel=(kind==='hurt'||kind==='dodge')?bell(p):0;
   push('handL',.13*shield-.03*reel,-.13*shield,.2);
   push('handR',-.12*shield+.03*reel,-.135*shield+.05*reel,.2);
   push('chest',-.075*reel,.02*reel,.22);
   push('head',-.04*reel,-.017*reel,.16);
   push('kneeR',.02*reel,.017*reel,.15);
 }else{
   const sway=Math.sin(time*.001+seed*.13);
   push('chest',.0026*sway,-.0048*breath,.22);
   push('head',.0024*sway,-.0028*breath,.16);
   push('handL',.003*sway,.003*breath,.15);
   push('handR',-.003*sway,.003*breath,.15);
   // Ankles stay stationary during idle.
 }
 return out;
}
function sample(nx,ny,points){
 let dx=0,dy=0;
 for(const p of points){const rx=(nx-p.a)/p.r,ry=(ny-p.b)/(p.r*1.35);const w=Math.exp(-2.4*(rx*rx+ry*ry));dx+=p.x*w;dy+=p.y*w;}
 const edge=clamp(Math.min(nx*17,(1-nx)*17,ny*17,(1-ny)*17));
 return {x:(nx+dx*edge),y:(ny+dy*edge)};
}
function mesh(ctx,src,pw,ph,points){
 const {img,ox,oy,w:iw,h:ih}=src;
 // Authored full frames need no tile deformation: preserve alpha and avoid seams.
 if(!points.length){ctx.save();ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.drawImage(img,ox,oy,iw,ih,-pw/2,-ph,pw,ph);ctx.restore();return;}
 ctx.save();
 // Shadow on individual mesh pieces produced dark rectangular seams in 5.11.
 ctx.shadowBlur=0;ctx.shadowColor='transparent';ctx.shadowOffsetY=0;
 ctx.translate(-pw/2,-ph);ctx.scale(pw/iw,ph/ih);
 for(let r=0;r<MESH_ROWS;r++)for(let c=0;c<MESH_COLS;c++){
   const x=c*iw/MESH_COLS,y=r*ih/MESH_ROWS,sw=iw/MESH_COLS,sh=ih/MESH_ROWS;
   const a=sample(c/MESH_COLS,r/MESH_ROWS,points),b=sample((c+1)/MESH_COLS,r/MESH_ROWS,points),d=sample(c/MESH_COLS,(r+1)/MESH_ROWS,points);
   const ax=(b.x-a.x)*iw/sw,ay=(b.y-a.y)*ih/sw,bx=(d.x-a.x)*iw/sh,by=(d.y-a.y)*ih/sh;
   ctx.save();ctx.transform(ax,ay,bx,by,a.x*iw-ax*x-bx*y,a.y*ih-ay*x-by*y);
   // 0.25px bleed hides precision seams; opacity is isolated at layer level.
   ctx.drawImage(img,ox+x,oy+y,sw+.18,sh+.18,x,y,sw+.18,sh+.18);
   ctx.restore();STATS.meshCells++;
 }
 ctx.restore();
}
function blendInfo(u,src,kind,p,now){
 let s=states.get(u.id);
 if(!s){s={src,kind,p,from:null,at:now};states.set(u.id,s);return {from:null,k:1}}
 if(s.src?.key!==src.key){
   s.from=s.src;s.src=src;s.at=now;s.kind=kind;STATS.transitions++;
 }
 const age=now-s.at;
 const duration=category(kind)==='move'?92:category(kind)==='strike'?105:125;
 const k=smooth(age/duration);
 if(k>=1)s.from=null;
 s.p=p;
 return {from:s.from,k};
}
function draw(ctx,u,pw,ph){
 if(!u||u.isSummon||u.hp<=0)return false;
 const id=Number(u.sprite)||0,state=battleState(u),now=performance.now();
 const walkImage=walkAtlases[id];
 const walking=state.kind==='move'&&walkImage?.complete&&walkImage.naturalWidth;
 const attackImage=attackAtlases[id],attacking=['sword','melee','quick'].includes(state.kind)&&attackImage?.complete&&attackImage.naturalWidth;
 const frame=walking?Math.floor(state.p*state.steps*8)%8:attacking?(state.p<.1?0:state.p<.34?1:state.p<.68?2:3):poseFor(id,state);
 const src=walking?{img:walkImage,ox:(frame%4)*384,oy:Math.floor(frame/4)*512,w:384,h:512,key:'walk:'+frame}:attacking?{img:attackImage,ox:(frame%2)*attackImage.naturalWidth/2,oy:Math.floor(frame/2)*attackImage.naturalHeight/2,w:attackImage.naturalWidth/2,h:attackImage.naturalHeight/2,key:id+':attack:'+frame}:spriteSource(u,frame);
 if(!src){STATS.imagesMissing++;return false}
 const motion=walking||attacking?[]:pointsFor(u,state,now),cross=blendInfo(u,src,state.kind,state.p,now);
 if(id<24&&cross.from&&cross.k<1){
   ctx.save();ctx.globalAlpha*=1-cross.k;mesh(ctx,cross.from,pw,ph,motion);ctx.restore();
   ctx.save();ctx.globalAlpha*=cross.k;mesh(ctx,src,pw,ph,motion);ctx.restore();
 }else mesh(ctx,src,pw,ph,motion);
 lastFrames.set(u.id,{kind:state.kind,pose:frame,p:state.p,blending:!!cross.from,blend:+cross.k.toFixed(2),limbs:motion.length});
 STATS.draws++;
 switch(category(state.kind)){
  case 'move':STATS.stepFrames++;break;case 'strike':STATS.attackFrames++;break;
  case 'defense':STATS.defenseFrames++;break;case 'seal':STATS.sealFrames++;break;
 }
 return true;
}
let enabled=true,last=0,halt=false;
function tick(t){
 if(halt)return;
 requestAnimationFrame(tick);
 if(!enabled||typeof game==='undefined'||!game||game.over||!document.querySelector('#arenaScreen')?.classList.contains('active'))return;
 const busy=(typeof activeFx!=='undefined'&&activeFx)||game.units.some(x=>x.reaction&&Date.now()-x.reaction.at<600);
 // The local draw() renders one fighter; only window.draw() redraws the battle.
 // Active action frames are already driven by tickFx; don't draw them twice.
 if(typeof activeFx!=='undefined'&&activeFx)return;
 const cadence=busy?33:50;
 if(t-last<cadence)return;
 last=t;
 try{if(typeof window.draw==='function')window.draw()}catch(e){console.error('Shinobi animation loop',e);halt=true;enabled=false;STATS.stalledFrames++}
}
requestAnimationFrame(tick);
function drawBeast(context,u,img,w,h,state){
 const {moving,attacking,progress:p,pace,now}=state;
 const kind=u.summonType,points=[];
 const add=(a,b,x,y,r=.2)=>points.push({a,b,x,y,r});
 const e=Math.sin(Math.PI*p)**2,phase=p*pace*4*Math.PI;
 const reptile=['snake','tortoise','lizard'].includes(kind);
 if(moving){
  if(kind==='snake'){
   for(let i=0;i<4;i++)add(.25+i*.16,.3+i*.12,Math.sin(phase-i*.9)*.035*e,0,.19);
  }else if(kind==='toad'){
   add(.5,.5,0,-.055*e,.35);add(.22,.82,-.035*e,.025*e,.2);add(.78,.82,.035*e,.025*e,.2);
  }else{
   const legs=kind==='spider'?6:4;
   for(let i=0;i<legs;i++){
    const x=.18+i*(.64/(legs-1)),q=phase+(i%2)*Math.PI;
    add(x,.85,Math.sin(q)*(reptile?.028:.055)*e,-Math.max(0,Math.cos(q))*.045*e,.14);
   }
   add(.5,.5,Math.sin(phase)*.008*e,-.008*e,.25);
  }
 }
 if(attacking){
  const wind=Math.sin(Math.PI*Math.min(1,p/.3))**2*(p<.3?1:0);
  const hit=Math.sin(Math.PI*Math.max(0,Math.min(1,(p-.22)/.65)))**2;
  add(.7,.35,.10*hit-.035*wind,-.018*hit,.24);
  add(.5,.5,.025*hit,.025*wind,.3);
  if(kind==='monkey'){add(.7,.2,.12*hit,-.08*wind,.23)}
  if(kind==='bear'){add(.5,.22,0,-.05*hit,.28)}
 }
 if(!moving&&!attacking)add(.5,.47,0,-Math.sin(now*.0012)*.003,.23);
 const src={img,ox:0,oy:0,w:img.naturalWidth,h:img.naturalHeight};
 context.save();context.scale(u.faceSign??(u.team==='ally'?1:-1),1);mesh(context,src,w,h,points);context.restore();
 return true;
}
window.__shinobiRig512={version:'5.12.0',draw,drawBeast,get enabled(){return enabled},set enabled(v){enabled=!!v},get stats(){return {...STATS,uniqueFighters:lastFrames.size}},samples:()=>Object.fromEntries(lastFrames),features:['author key-pose crossfade','articulated asymmetric legs','planted idle feet','windup-strike-follow-through','handseal wrist animation','no tiled shadow seams']};
// Compatibility for unchanged battle rendering hook and existing save-independent scripts.
window.__shinobiRig511=window.__shinobiRig512;
})();

