
/* SHINOBI 5.10.0: 18 visually distinct jutsu choreographies, with no combat rule changes. */
(()=>{'use strict';
const stage=document.querySelector('#arenaScreen .boardwrap'),board=document.getElementById('board');
if(!stage||!board||!window.__arena18)return;
const layer=document.createElement('canvas');layer.id='shinobi510-vfx';layer.width=board.width;layer.height=board.height;
layer.style.cssText='position:absolute;inset:0;width:100%;height:auto;pointer-events:none;z-index:12;';layer.setAttribute('aria-hidden','true');stage.appendChild(layer);
const ctx=layer.getContext('2d'),list=[],stats={plays:0,draws:0};
const defs={
 fire8:['phoenix','#ffac62'],fire9:['ash','#c0a18d'],fire10:['flame','#f66a38'],
 water8:['needles','#94e8f3'],water9:['bubble','#61d4e9'],water10:['maelstrom','#77d9ed'],
 wind8:['windstep','#badde4'],wind9:['blades','#c5edf1'],wind10:['storm','#cbf3f2'],
 light8:['thunderstep','#acc5ff'],light9:['network','#b9c5ff'],light10:['thunder','#e1e2ff'],
 earth8:['armor','#d2b18a'],earth9:['quarry','#b9a48c'],earth10:['rift','#d9bfa0'],
 medicHeal:['heal','#8cf3aa'],chakraWave:['pulse','#80d0ff'],smokeShift:['smoke','#c4c5c7']
};
const byName=Object.fromEntries((window.__arena18.TECHS||[]).map(t=>[t.name,t.id]));
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
const pnt=v=>typeof center==='function'?center(v.c,v.r):{x:80+v.c*70+(v.r%2)*35,y:80+v.r*58};
const mix=(a,b,t)=>a+(b-a)*t;
const rand=(i,n=0)=>{const x=Math.sin((i+37.9)*73.482+n*19.37)*43758.55;return x-Math.floor(x)};
const pi=Math.PI;
function stroke(x,y,xx,yy,color,w=2,alpha=1){ctx.globalAlpha=Math.max(0,alpha);ctx.lineWidth=w;ctx.strokeStyle=color;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();ctx.globalAlpha=1}
function disc(x,y,r,color,alpha=1){ctx.globalAlpha=Math.max(0,alpha);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,2*pi);ctx.fill();ctx.globalAlpha=1}
function ring(x,y,rx,ry,color,w=2,alpha=1){ctx.globalAlpha=Math.max(0,alpha);ctx.lineWidth=w;ctx.strokeStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),0,0,2*pi);ctx.stroke();ctx.globalAlpha=1}
function streak(x,y,xx,yy,col,size=3,alpha=1){stroke(x,y,xx,yy,col,size,alpha);disc(xx,yy,size*.55,col,alpha)}
function arc(x,y,r,t1,t2,col,w=3,alpha=1){ctx.globalAlpha=alpha;ctx.lineWidth=w;ctx.strokeStyle=col;ctx.beginPath();ctx.ellipse(x,y,r,r*.45,0,t1,t2);ctx.stroke();ctx.globalAlpha=1}
function lightning(x,y,xx,yy,n,col,alpha=1){const dx=xx-x,dy=yy-y;let px=x,py=y;for(let k=1;k<=n;k++){let t=k/n,off=k===n?0:(rand(k,n+Math.floor(x))*2-1)*12;const qx=x+dx*t+(-dy/(Math.hypot(dx,dy)||1))*off,qy=y+dy*t+(dx/(Math.hypot(dx,dy)||1))*off;stroke(px,py,qx,qy,col,k%3===0?4:2,alpha);px=qx;py=qy}}
const durationFor={phoenix:1000,ash:1150,flame:1050,needles:900,bubble:1100,maelstrom:1200,windstep:850,blades:960,storm:1150,thunderstep:900,network:1050,thunder:950,armor:1050,quarry:1050,rift:1050,heal:1100,pulse:980,smoke:1000};
let animating=false;
function queue(id,from,to){const d=defs[id];if(!d)return false;const a=pnt(from),b=pnt(to);list.push({id,kind:d[0],color:d[1],a,b,at:performance.now(),duration:durationFor[d[0]]||1000});if(list.length>14)list.shift();stats.plays++;if(!animating){animating=true;requestAnimationFrame(frame)}return true}
function render(o,t){const {a,b,color,kind}=o,progress=ease(t),fade=Math.min(1,t*5,(1-t)*5),dx=b.x-a.x,dy=b.y-a.y;
const ax=a.x,ay=a.y-32,bx=b.x,by=b.y-34;
ctx.save();ctx.globalCompositeOperation='screen';
if(kind==='phoenix'){
 for(let i=0;i<9;i++){const v=(progress+i*.077)%1,f=(i-4)*.13,xx=ax+dx*v,yy=ay+dy*v+Math.sin(v*pi*2+i)*18*(1-v)-35*Math.sin(v*pi)*f;streak(xx-14,yy+9,xx,yy,color,3+i%3,fade*(1-v*.6));disc(xx,yy,3+i%3,'#fff1bd',fade*.7)}
 ring(bx,by,13+progress*32,8+progress*16,color,2,fade*.5);
}else if(kind==='ash'){
 for(let i=0;i<36;i++){const ang=rand(i)*pi*2,r=(12+rand(i,5)*60)*progress,xx=bx+Math.cos(ang)*r,yy=by+Math.sin(ang)*r*.5-24*progress;disc(xx,yy,2+rand(i,2)*9,i%5?'#9f8f83':'#ed9d74',fade*.42)}
 ring(bx,by,18+progress*70,10+progress*33,color,5,fade*.42);
}else if(kind==='flame'){
 for(let i=0;i<18;i++){let f=i/18,xx=mix(ax,bx,progress*f),yy=mix(ay,by,progress*f),j=Math.sin(i*3+progress*18)*11;streak(xx-12,yy+18+j,xx+12,yy-23-j,i%3?'#ee6333':'#ffe2a7',3+i%3,fade*.87)}
 for(let j=0;j<4;j++)arc(bx,by,21+progress*60+j*9,.15,2*pi-.2,'#f9a05a',2,fade*(1-j*.23));
}else if(kind==='needles'){
 for(let i=0;i<12;i++){let q=Math.max(0,Math.min(1,progress*1.6-i*.032)),side=(i-5.5)*10,xx=ax+dx*q+side*.4,yy=ay+dy*q+side*.55;streak(xx-dx*.055,yy-dy*.055,xx+dx*.04,yy+dy*.04,i%3?'#78d7e7':'#e8fcfc',2.5,fade)}
}else if(kind==='bubble'){
 for(let j=0;j<3;j++)ring(bx,by,19+52*Math.min(1,progress*1.4)-j*8,23+32*Math.min(1,progress*1.4)-j*5,j%2?'#81e4e7':'#bbf6ef',3,fade*(.8-j*.18));
 for(let i=0;i<11;i++){let ang=i*2*pi/11+progress*2;disc(bx+Math.cos(ang)*52,by+Math.sin(ang)*36,1.8+i%3,'#e9ffff',fade*.8)}
}else if(kind==='maelstrom'){
 for(let j=0;j<5;j++){let r=16+20*j+progress*14,rot=progress*pi*2+j*.67;arc(bx,by,r,rot,rot+pi*1.4,j%2?'#99f4ed':'#408fb3',3+j*.5,fade*.65)}
 for(let i=0;i<22;i++){let ang=i*.83+progress*8,r=(9+i*3)*progress;disc(bx+Math.cos(ang)*r,by+Math.sin(ang)*r*.47,2.5,'#d5faff',fade*.6)}
}else if(kind==='windstep'||kind==='thunderstep'){
 for(let i=0;i<10;i++){let v=(i+.5)/10,xx=mix(ax,bx,v),yy=mix(ay,by,v),width=(1-v)*22;
 streak(xx-10,yy+width,xx+16,yy+width*.2,kind==='windstep'?'#afdcd9':'#b9b8ff',2.4,fade*(1-v*.4));}
 for(let j=0;j<4;j++)ring(bx,by,14+progress*(28+j*13),6+progress*(9+j*4),color,2.5,fade*.6);
 if(kind==='thunderstep'){for(let i=0;i<6;i++){let ang=i*pi/3,r=20+70*progress;lightning(bx,by,bx+Math.cos(ang)*r,by+Math.sin(ang)*r*.7,5,'#b7cbff',fade*.7)}}
}else if(kind==='blades'){
 for(let i=0;i<6;i++){let ang=i*pi/3+progress*pi*2,r=(18+progress*73)*(i%2?.7:1),xx=bx+Math.cos(ang)*r,yy=by+Math.sin(ang)*r*.6;arc(xx,yy,14+progress*22,ang,ang+pi*1.35,i%2?'#74adb4':'#d7faf6',3.5,fade*.8)}
}else if(kind==='storm'){
 for(let i=0;i<5;i++){let ang=progress*6+i*2*pi/5,r=30+progress*72;arc(bx+Math.cos(ang)*r*.18,by+Math.sin(ang)*r*.13,r,ang,ang+pi*1.15,color,4,fade*.7)}
 for(let i=0;i<22;i++){let ang=i*2.4,rad=(i*4.8+progress*40)%100;streak(bx+Math.cos(ang)*rad,by+Math.sin(ang)*rad*.38,bx+Math.cos(ang)*rad+16,by+Math.sin(ang)*rad*.38-9,'#d7f6f4',2,fade*.6)}
}else if(kind==='network'){
 let px=ax,py=ay;for(let i=1;i<=6;i++){let q=i/6,xx=mix(ax,bx,q),yy=mix(ay,by,q);lightning(px,py,xx,yy,5,i%2?'#c3c7ff':'#f0f6ff',fade);px=xx;py=yy}
 for(let j=0;j<4;j++){let ang=j*pi/2+progress*.3;lightning(bx,by,bx+Math.cos(ang)*55,by+Math.sin(ang)*44,5,color,fade*.85)}
 ring(bx,by,30+progress*25,17+progress*14,'#b3c7ff',3,fade*.6);
}else if(kind==='thunder'){
 for(let j=0;j<3;j++){let off=(j-1)*14;lightning(bx+off-9,by-150+progress*42,bx+off,by+6,9,j%2?'#dddfff':'#99b9ff',fade*.9)}
 for(let j=0;j<4;j++)ring(bx,by,15+j*18+progress*34,6+j*9+progress*12,color,2.8,fade*(1-j*.18));
}else if(kind==='armor'){
 for(let i=0;i<9;i++){let ang=2*pi*i/9+progress*.6,rad=32+Math.sin(progress*pi)*14,xx=bx+Math.cos(ang)*rad,yy=by+Math.sin(ang)*25-30*(1-progress);disc(xx,yy,5+i%4,i%2?'#c1b7a2':'#998d7d',fade)}
 ring(bx,by,20+progress*33,24+progress*42,color,4,fade*.7);
}else if(kind==='quarry'){
 ring(bx,by,20+progress*78,10+progress*35,color,6,fade*.45);
 for(let i=0;i<27;i++){let ang=i*2.399,r=(6+rand(i,4)*80)*progress,xx=bx+Math.cos(ang)*r,yy=by+Math.sin(ang)*r*.43-31*Math.sin(pi*progress)*rand(i,5);disc(xx,yy,4+rand(i,2)*7,i%3?'#9c8c73':'#e1d0ab',fade*.87)}
}else if(kind==='rift'){
 for(let i=0;i<11;i++){let q=i/10,xx=mix(ax,bx,q*progress),yy=mix(ay,by,q*progress)+Math.sin(q*12+progress*2)*6;disc(xx,yy,4+i%4,'#544335',fade*.85);stroke(xx-7,yy,xx+14,yy-4,'#e1bea0',3,fade*.9)}
 for(let j=0;j<9;j++){let q=j/9,xx=mix(ax,bx,q*progress),yy=mix(ay,by,q*progress);streak(xx,yy,xx+Math.sin(j*2)*18,yy-18-Math.sin(j)*13,'#b8a285',2.4,fade*.7)}
}else if(kind==='heal'){
 for(let i=0;i<24;i++){let q=rand(i,1),ang=i*2.399+progress*.8,r=8+rand(i,4)*37,xx=bx+Math.cos(ang)*r,yy=by+Math.sin(ang)*r*.6+27-82*((q+progress*.62)%1);disc(xx,yy,2+rand(i,6)*3,i%3?'#7ce6b3':'#fff2b3',fade*(.3+.7*rand(i,2)))}
 for(let j=0;j<3;j++)ring(bx,by,15+progress*43+j*7,12+progress*24+j*7,color,2.8,fade*(.8-j*.21));
}else if(kind==='pulse'){
 for(let j=0;j<5;j++)ring(bx,by,15+progress*(38+j*20),9+progress*(18+j*9),j%2?'#c4ecff':'#6db5f4',4,fade*(1-j*.17));
 for(let i=0;i<18;i++){let ang=i*2*pi/18+progress*.4,r=progress*90;disc(bx+Math.cos(ang)*r,by+Math.sin(ang)*r*.58,2+i%2,'#d0eeff',fade*.55)}
}else if(kind==='smoke'){
 for(let i=0;i<30;i++){let ang=i*2.399,rad=(9+rand(i,3)*70)*progress,xx=bx+Math.cos(ang)*rad,yy=by+Math.sin(ang)*rad*.49-28*Math.sin(pi*progress);disc(xx,yy,5+rand(i,8)*12,i%3?'#7e888c':'#c1c6bd',fade*.3)}
 ring(bx,by,18+progress*61,9+progress*25,'#d8e1db',3,fade*.34);
}
ctx.restore();}
function frame(time){animating=false;ctx.clearRect(0,0,layer.width,layer.height);
for(let i=list.length-1;i>=0;i--){const o=list[i],t=(time-o.at)/o.duration;if(t>=1){list.splice(i,1);continue}if(t>=0){render(o,t);stats.draws++}}
if(list.length){animating=true;requestAnimationFrame(frame)}}
// Always listen for real successful releases. Using the game's normal cue event guarantees
// no effect is played if the seal sequence is interrupted or resources are insufficient.
const prevCue=window.cueFx;
if(typeof prevCue==='function')window.cueFx=function(evt){const result=prevCue.apply(this,arguments);
 if(evt?.action==='jutsu'&&evt.spellName&&game){let id=byName[evt.spellName];if(id&&defs[id])queue(id,evt.from||evt.target,evt.target)}
 return result};
// Smooth body language while the seals are being woven; normal attack locomotion stays untouched.
const priorDraw=window.__arena50DrawActor;
if(typeof priorDraw==='function')window.__arena50DrawActor=function(g,u,x,y,w,h){
 const fx=typeof activeFx==='undefined'?null:activeFx;
 if(!fx||fx.actor!==u?.id||fx.action!=='seals')return priorDraw.apply(this,arguments);
 const p=Math.max(0,Math.min(1,fx.progress||0)),l=Math.sin(pi*p),x0=x+w/2,y0=y+h;
 g.save();g.translate(x0,y0);g.rotate((u.faceSign||1)*.018*l);g.scale(1+.016*l,1-.023*l);g.translate(-x0,-y0);
 try{return priorDraw.call(this,g,u,x,y,w,h)}finally{g.restore()}
};
window.__arena510={version:'5.10.0',techniques:Object.keys(defs),get stats(){return {...stats,active:list.length}},preview:(id,from,to)=>queue(id,from,to)};
})();

