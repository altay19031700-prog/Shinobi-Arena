
/* SHINOBI 5.9.7 — visual combat choreography. No changes to damage, AP, AI, LOS or targeting. */
(()=>{'use strict';
 const stage=document.querySelector('#arenaScreen .boardwrap'),board=document.getElementById('board');
 if(!stage||!board||!window.__arena57)return;
 const layer=document.createElement('canvas');layer.width=board.width;layer.height=board.height;layer.id='shinobi597-action';
 layer.setAttribute('aria-hidden','true');layer.style.cssText='position:absolute;inset:0;width:100%;height:auto;z-index:11;pointer-events:none';stage.append(layer);
 const c=layer.getContext('2d');const clips=[];const counters={attacks:0,specials:0,movement:0,draws:0};
 const colors={ally:'#8dc8d7',enemy:'#dc8474'};
 const types={toad:'tongue',wolf:'claw',hound:'claw',snake:'venom',monkey:'staff',boar:'charge',bear:'roar',tiger:'claw',badger:'burrow',spider:'web',lizard:'spines',tortoise:'shell'};
 const now=()=>performance.now();
 function pos(pt){return typeof center==='function'?center(pt.c,pt.r):{x:90+pt.c*68+(pt.r%2)*34,y:85+pt.r*59}}
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const smooth=(x)=>{x=clamp(x);return x*x*(3-2*x)};
 function hue(u){return colors[u?.team]||'#e6d3b1'}
 function queue(kind,from,to,team='ally',extra={}){
   if(!from||!to)return;
   clips.push({kind,from:{...from},to:{...to},at:now(),duration:extra.duration||730,team,seed:clips.length+1,...extra});
   if(clips.length>32)clips.splice(0,clips.length-32);
   if(!running){running=true;requestAnimationFrame(frame)}
 }
 let running=false;
 function line(a,b,color,w,alpha){c.save();c.strokeStyle=color;c.lineWidth=w;c.globalAlpha=clamp(alpha);c.lineCap='round';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();c.restore()}
 function ellipse(x,y,rx,ry,color,alpha,w=2){c.save();c.globalAlpha=clamp(alpha);c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),0,0,Math.PI*2);c.stroke();c.restore()}
 function shard(x,y,r,ang,scale,color,alpha){c.save();c.globalAlpha=clamp(alpha);c.translate(x,y);c.rotate(ang);c.fillStyle=color;c.beginPath();c.moveTo(r*scale,0);c.lineTo(-r*.8*scale,r*.33);c.lineTo(-r*.8*scale,-r*.33);c.closePath();c.fill();c.restore()}
 function arc(x,y,rad,ang,size,color,alpha,width){c.save();c.globalAlpha=clamp(alpha);c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.arc(x,y,rad,ang-size/2,ang+size/2);c.stroke();c.restore()}
 function drawClip(o,t){
  const a=pos(o.from),b=pos(o.to),p=smooth(t),fade=Math.pow(1-t,1.18),dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,angle=Math.atan2(dy,dx),nx=-dy/len,ny=dx/len;
  const color=o.team==='enemy'?'#e8b3a4':'#d7eaf0';
  if(['sword','quick','melee','heavy','counter','staff','claw'].includes(o.kind)){
    const endx=b.x,endY=b.y-29;
    const radius=o.kind==='heavy'?60:o.kind==='sword'?65:o.kind==='staff'?59:47;
    const alpha=Math.sin(Math.PI*clamp(t*1.1))*fade*.95;
    const sweep=angle+(o.kind==='sword'?1.3:1.0)*(p-.5);
    const n=o.kind==='quick'||o.kind==='claw'?2:1;
    for(let i=0;i<n;i++){
      const base=sweep+i*.52;
      arc(endx,endY,radius-i*13,base,1.6,o.kind==='claw'?'#d9d0b6':color,alpha/(i+1),o.kind==='heavy'?8:4);
      arc(endx,endY,radius+5-i*13,base,1.75,o.team==='enemy'?'#cc6559':'#68aab4',alpha*.30/(i+1),10);
    }
    for(let i=0;i<13;i++){const r=13+i*3.4*p,ang=i*2.399+o.seed*.16;
      shard(endx+Math.cos(ang)*r,endY+Math.sin(ang)*r*.7,2.8,ang,1, i%2?'#f4e2bd':'#a99a80',fade*.6)}
    if(o.kind==='heavy'||o.kind==='staff')ellipse(b.x,b.y+9,20+55*p,8+16*p,'#d3b28d',fade*.52,3);
  }else if(o.kind==='tongue'){
    const tip={x:a.x+dx*p,y:a.y-45+dy*p-16*Math.sin(p*Math.PI)};
    c.save();c.strokeStyle='#b6616a';c.lineWidth=13;c.lineCap='round';c.globalAlpha=fade;c.beginPath();c.moveTo(a.x,a.y-38);c.quadraticCurveTo((a.x+tip.x)/2,(a.y+tip.y)/2-65,tip.x,tip.y);c.stroke();c.lineWidth=4;c.strokeStyle='#df9a96';c.stroke();c.restore();
    if(t>.42)arc(b.x,b.y-31,35,angle,1.8,'#d4a4a1',fade,4);
  }else if(o.kind==='venom'){
    for(let i=0;i<14;i++){const q=(p+i*.035)%1,x=a.x+dx*q+nx*Math.sin(q*14+i)*19,y=a.y-39+dy*q+ny*Math.cos(q*12+i)*14;
      shard(x,y,3+2*(i%3),q*8+i*.9,1,i%2?'#9bd970':'#568d60',fade*.78)}
    if(t>.45)ellipse(b.x,b.y-12,17+59*(t-.45),8+16*(t-.45),'#7fb574',fade*.72,3);
  }else if(o.kind==='charge'){
    for(let j=0;j<4;j++){const f=clamp(p-j*.11),xx=a.x+dx*f,yy=a.y+dy*f;
       shard(xx+nx*j*9,yy+ny*j*8-14,13-j*2,angle+Math.PI/2,1,'#c8b69b',fade*(1-j*.17));}
    ellipse(b.x,b.y+9,16+75*p,5+20*p,'#d7c3a0',fade*.62,4);
  }else if(o.kind==='roar'||o.kind==='shell'){
    for(let i=0;i<3;i++){const r=21+(p+i*.14)*78;
      ellipse(a.x,a.y-25,r,r*.58,o.kind==='roar'?'#e1b494':'#8bc6b6',fade*.7/(1+i*.5),3+i);
    }
  }else if(o.kind==='web'){
    c.save();c.translate(b.x,b.y-25);c.globalAlpha=fade*.86;c.strokeStyle='#d7d1c9';c.lineWidth=2;
    for(let i=0;i<8;i++){const ang=i*Math.PI/4;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(ang)*75*p,Math.sin(ang)*50*p);c.stroke();}
    for(let j=1;j<4;j++){c.beginPath();c.ellipse(0,0,19*j*p,13*j*p,0,0,Math.PI*2);c.stroke();}c.restore();
  }else if(o.kind==='burrow'){
    for(let i=0;i<21;i++){const ang=i*2.399,rx=11+68*p*((i%4+2)/5);
      shard(b.x+Math.cos(ang)*rx,b.y+Math.sin(ang)*rx*.35,3+i%6,ang,1,i%2?'#968878':'#c8b398',fade*.74)}
    ellipse(b.x,b.y,10+78*p,5+28*p,'#a99979',fade*.65,4);
  }else if(o.kind==='spines'){
    for(let i=0;i<15;i++){const ang=i*2.399,rad=12+92*p,xx=b.x+Math.cos(ang)*rad,yy=b.y-23+Math.sin(ang)*rad*.65;
      shard(xx,yy,7+3*(i%3),ang,1,'#b8ad88',fade*.8)}
  }else if(o.kind==='move'){
    for(let i=0;i<8;i++){const q=i/8,xx=a.x+dx*q,yy=a.y+dy*q+5;
      ellipse(xx,yy,3+15*clamp((p-q)*4),2+7*clamp((p-q)*4),'#beb09d',(p>q?fade*.12:0),1.5)}
  }
 }
 function frame(t){running=false;c.clearRect(0,0,layer.width,layer.height);
  for(let i=clips.length-1;i>=0;i--){const o=clips[i],p=(t-o.at)/o.duration;if(p>=1){clips.splice(i,1);continue}if(p>=0){drawClip(o,clamp(p));counters.draws++}}
  if(clips.length){running=true;requestAnimationFrame(frame)}
 }
 const previousCue=window.cueFx;
 if(typeof previousCue==='function')window.cueFx=function(v){
  const result=previousCue.call(this,v);
  if(!game||!v||!['melee','quick','heavy','sword','counter','move','stunHit','trip'].includes(v.action))return result;
  const unit=game.units?.find(u=>u.id===v.actor);if(!unit)return result;
  if(unit.team==='enemy'&&typeof visibleToSide==='function'&&!visibleToSide('ally',unit))return result;
  const start=v.from||{c:unit.c,r:unit.r},target=v.target||start;
  const action=v.action==='stunHit'||v.action==='trip'?'heavy':v.action;
  queue(action,start,target,unit.team,{duration:action==='heavy'?850:action==='move'?600:570});counters.attacks++;
  return result;
 };
 const previousExecute=window.execute;
 window.execute=function(unit,action,cell){
  const before=unit?{c:unit.c,r:unit.r}:null;
  const ok=previousExecute.apply(this,arguments);
  if(ok&&action==='pet:special'&&unit?.isSummon&&unit.team==='ally'){
   queue(types[unit.summonType]||'claw',before,cell||before,'ally',{duration:unit.summonType==='toad'?880:760});counters.specials++;
  }return ok;
 };
 // Stronger body-language for attacks: the drawn actor lunges, winds up and recoils,
 // while all game coordinates and hitboxes remain those of the underlying engine.
 const baseActor=window.__arena50DrawActor;
 if(typeof baseActor==='function')window.__arena50DrawActor=function(g,u,x,y,w,h){
  const fx=typeof activeFx==='undefined'?null:activeFx,acting=fx&&fx.actor===u?.id;
  const reaction=u?.reaction,age=reaction?Date.now()-reaction.at:10000;
  if(!acting&&age>460)return baseActor.apply(this,arguments);
  const p=clamp(acting?(fx.progress||0):age/460),kind=acting?fx.action:reaction.kind;
  const direction=u.faceSign||1,pulse=Math.sin(Math.PI*p),footX=x+w/2,footY=y+h;
  let lunge=0,tilt=0,sx=1,sy=1,lift=0;
  if(acting&&['sword','melee','quick','heavy','counter','stunHit','trip'].includes(kind)){
   lunge=direction*(kind==='heavy'?24:kind==='quick'?18:22)*pulse;
   tilt=direction*(kind==='heavy'?.13:.09)*pulse;sx=1+.095*pulse;sy=1-.065*pulse;lift=kind==='heavy'?9*pulse:3*pulse;
  }else if(kind==='block'||kind==='guard'){sx=1+.06*pulse;sy=1-.035*pulse;}
  else if(kind==='hurt'){lunge=-direction*12*pulse;tilt=-direction*.11*pulse;}
  else if(kind==='dodge'){lunge=-direction*22*pulse;lift=9*pulse;}
  if(Math.abs(lunge)+Math.abs(tilt)+Math.abs(lift)<.01)return baseActor.apply(this,arguments);
  g.save();g.translate(footX+lunge,footY-lift);g.rotate(tilt);g.scale(sx,sy);g.translate(-footX,-footY);
  try{return baseActor.call(this,g,u,x,y,w,h)}finally{g.restore()}
 };
 window.__arena597={version:'5.9.7',animationTypes:Object.keys(types),get stats(){return {...counters,active:clips.length}},play:(kind,from,to)=>queue(kind,from,to)};
})();
