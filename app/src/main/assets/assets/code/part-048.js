
/* 5.24: Ten distinct frame sequences curated from supplied atlas; eight are bound to
   matching existing abilities. Render-only: HP, AP, chakra and networking untouched.
   Unmapped rows (fire rain, electric dash) are not falsely advertised as abilities. */
(()=>{'use strict';
 const stage=document.querySelector('#arenaScreen .boardwrap');
 const board=document.querySelector('#arenaScreen #board');if(!stage||!board)return;
 const atlas=new Image();atlas.src='assets/shinobi_new_fx_10x8.webp';
 const layer=document.createElement('canvas');layer.id='shinobi524-layer';
 layer.width=board.width;layer.height=board.height;
 layer.setAttribute('aria-hidden','true');
 layer.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:19;pointer-events:none!important';
 stage.style.position='relative';stage.append(layer);
 const c=layer.getContext('2d',{alpha:true});
 // row, geometry; precisely the techs with matching visuals
 const mapped={
  fire10:[0,'wall'],fire6:[1,'travel'],fire4:[3,'travel'],
  water5:[4,'travel'],water4:[5,'travel'],water3:[6,'wave'],water10:[7,'area'],
  light9:[9,'travel'],light6:[9,'travel']
 };
 const effects=[],stats={started:0,completed:0,frames:0,errors:0,active:0};
 let running=false;const ready=()=>atlas.complete&&atlas.naturalWidth===2048&&atlas.naturalHeight===2560;
 const position=o=>typeof window.center==='function'?window.center(o.c,o.r):{x:board.width*.5,y:board.height*.5};
 const clamp=v=>Math.max(0,Math.min(1,v));
 const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
 const high=()=>window.__arena520?.quality==='high';
 const disabled=()=>window.__arena520?.quality==='off';
 function sprite(row,fr,x,y,w,h,opacity=1){
  if(!ready())return false;
  c.save();c.globalAlpha=clamp(opacity);
  c.drawImage(atlas,Math.min(7,Math.max(0,fr))*256,row*256,256,256,x-w/2,y-h/2,w,h);
  c.restore();return true;
 }
 function pulse(x,y,r,col,a){c.save();c.globalAlpha=clamp(a);c.strokeStyle=col;c.lineWidth=2.5;c.beginPath();c.ellipse(x,y,r,r*.35,0,0,Math.PI*2);c.stroke();c.restore()}
 function frame(e,t){
  if(!ready())return false;
  const [row,kind]=mapped[e.id];const a=position(e.from),b=position(e.to);
  const v=clamp(t),charge=.16,flight=.57;
  const cpos=(p)=>({x:a.x+(b.x-a.x)*p,y:a.y+(b.y-a.y)*p});
  if(v<charge){const u=v/charge;
   pulse(a.x,a.y,18+20*u,row<4?'#ffa35b':row<8?'#7cdbff':'#c3a6ff',.4+.25*u);
   sprite(row,0,a.x,a.y-34,60+25*u,53+19*u,.45+.35*u);return true;
  }
  if(v<flight){const u=(v-charge)/(flight-charge),p=ease(u),pos=cpos(p);
   const anchored=['wall','area'].includes(kind);const x=anchored?b.x:pos.x,y=anchored?b.y-40:pos.y-40;
   // Keep the projectile on one clear trajectory; no repeated enlarged duplicates.
   const f=Math.min(6,Math.floor(u*7));
   const scale=kind==='wall'?1.24:kind==='area'?1.15:1;
   sprite(row,f,x,y,(kind==='wall'?188:154)*scale,(kind==='wall'?128:108)*scale,1);
   return true;
  }
  const u=(v-flight)/(1-flight),f=u<.84?Math.min(7,Math.floor(u/.84*8)):7;
  const centre=position(e.to),pos={x:centre.x,y:centre.y-38};
  const w=kind==='wall'?240:kind==='area'?210:kind==='wave'?205:174;
  const h=kind==='wall'?155:kind==='area'?147:132;
  const fade=u<.83?1:clamp((1-u)/.17);
  sprite(row,f,pos.x,pos.y,w,h,fade);
  if(kind==='area'||kind==='wall')pulse(centre.x,centre.y,28+65*u,row<4?'#f5a65c':'#78d7f9',(1-u)*.3);
  return true;
 }
 let lastRender534=0;function tick(){running=false;
  if(document.hidden||disabled()||!document.querySelector('#arenaScreen.active')){c.clearRect(0,0,layer.width,layer.height);effects.length=0;return}
  if(layer.width!==board.width||layer.height!==board.height){layer.width=board.width;layer.height=board.height}
  const tm=performance.now();if(window.__arena520?.quality==='low'&&tm-lastRender534<1000/26){wake();return}lastRender534=tm;
  c.clearRect(0,0,layer.width,layer.height);
  for(let i=effects.length-1;i>=0;i--){const e=effects[i],t=(tm-e.at)/e.duration;
   if(t>1){effects.splice(i,1);stats.completed++;continue}
   try{frame(e,t);stats.frames++}catch(err){stats.errors++;effects.splice(i,1);console.warn('Shinobi 5.24 effect error',err)}
  }
  stats.active=effects.length;if(effects.length)wake();
 }
 function wake(){if(!running){running=true;requestAnimationFrame(tick)}}
 function play(e){if(!mapped[e.id]||disabled())return false;
  const a={id:e.id,from:e.from,to:e.to,at:performance.now(),duration:1250};
  effects.push(a);if(effects.length>8)effects.shift();stats.started++;wake();return true;
 }
 window.__shinobi524={version:'5.24',handles:id=>Object.hasOwn(mapped,id),onCast:play,
  previewAt(id,from,to,progress){if(!Object.hasOwn(mapped,id))return false;
   effects.length=0;c.clearRect(0,0,layer.width,layer.height);
   return frame({id,from,to},clamp(progress));},
  clear(){effects.length=0;c.clearRect(0,0,layer.width,layer.height)},
  get ready(){return ready()},get stats(){return {...stats}},get mappedIds(){return Object.keys(mapped)}
 };
})();
