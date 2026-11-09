
(()=>{
 'use strict';
 const ASSETS={"toad":["assets/49611dd2c0c09ac0f9f0c716.webp","assets/49611dd2c0c09ac0f9f0c716.webp","assets/49611dd2c0c09ac0f9f0c716.webp"],"wolf":["assets/07f52e52999ccecdceaa92ca.webp","assets/07f52e52999ccecdceaa92ca.webp","assets/07f52e52999ccecdceaa92ca.webp"],"hound":["assets/29106fe69e0ce949d1a1d1e3.webp","assets/29106fe69e0ce949d1a1d1e3.webp","assets/29106fe69e0ce949d1a1d1e3.webp"],"snake":["assets/6c5599190f62fef0e4fba036.webp","assets/6c5599190f62fef0e4fba036.webp","assets/6c5599190f62fef0e4fba036.webp"],"monkey":["assets/e1a468c564d1ced62810a074.webp","assets/e1a468c564d1ced62810a074.webp","assets/e1a468c564d1ced62810a074.webp"],"boar":["assets/5219e34926feca517887b893.webp","assets/5219e34926feca517887b893.webp","assets/5219e34926feca517887b893.webp"],"bear":["assets/c412316efc4d78d34a46ad6f.webp","assets/c412316efc4d78d34a46ad6f.webp","assets/c412316efc4d78d34a46ad6f.webp"],"tiger":["assets/685c72ccbe0d8f4c7feb630f.webp","assets/685c72ccbe0d8f4c7feb630f.webp","assets/685c72ccbe0d8f4c7feb630f.webp"],"badger":["assets/3fec299282f34c40838290fe.webp","assets/3fec299282f34c40838290fe.webp","assets/3fec299282f34c40838290fe.webp"],"spider":["assets/c6dbbbc68374e92b2fec4356.webp","assets/c6dbbbc68374e92b2fec4356.webp","assets/c6dbbbc68374e92b2fec4356.webp"],"lizard":["assets/5138fc669eac42bfefaa7811.webp","assets/5138fc669eac42bfefaa7811.webp","assets/5138fc669eac42bfefaa7811.webp"],"tortoise":["assets/27c4ba0471c823e6de3fde2b.webp","assets/27c4ba0471c823e6de3fde2b.webp","assets/27c4ba0471c823e6de3fde2b.webp"],"ninja0":["assets/0e23be30bf882e67535de42d.webp","assets/1c302c25f11f2762eb2a5a04.webp","assets/337c5c70cfdbc040d9bd70e9.webp","assets/adde5a878408f0e855bb054d.webp"],"ninja1":["assets/0d592ab9630223ade5277a96.webp","assets/c06faa8e20489810f9307861.webp","assets/0b1b327b478408b214b93578.webp","assets/62ba92f2594bb0ce3bc72cd6.webp"],"ninja2":["assets/58d7590c3bedc63841fec2ac.webp","assets/45e7f39dc29aa127a1c5f0bc.webp","assets/84b79d045f18e5217cc057e9.webp","assets/933ec49acf4f539e5a7b26fc.webp"],"ninja3":["assets/b6b59d6f4f1c0a30ed26c94e.webp","assets/2932b6c15f5a69b29f6a6d7c.webp","assets/0b59eece39a18ba484d968a3.webp","assets/45696e6030205e2d8150b767.webp"],"ninja4":["assets/aa2f231a884b09a8cc5a477c.webp","assets/31dfe820994b3fc784813f99.webp","assets/020b8ecd75d4d5338c02e8af.webp","assets/c93b760872929c34525ef788.webp"],"ninja5":["assets/2537068b1b19f4e0500c0320.webp","assets/ffe38538bc59297d05ea76e9.webp","assets/5141c03281a380f3fb308c2f.webp","assets/e4ffaf6b0c8c2d203b14efa6.webp"],"ninja6":["assets/67b528a212d4bd3724ec3805.webp","assets/51754c8010828119f78c2886.webp","assets/1da0356ab0cd03fd1bd2539b.webp","assets/98f0ffbcae28b582acdc9cf6.webp"],"ninja7":["assets/d5a9d4866038192bc8eb991a.webp","assets/a8332ba17716353c1d53321f.webp","assets/fdd6792e97f0c1e6bb2fd39a.webp","assets/e0476a750749c34ebfde5cb2.webp"],"ninja8":["assets/42ae19d0fa2f22bba789dc4e.webp","assets/a08adffd9677c7a07f0c7069.webp","assets/2d6d6d43e61d326bde90c0e3.webp","assets/7506cd0ba4e62d7e0df82646.webp"],"ninja9":["assets/b4f6f24de48cd559c50b2ff1.webp","assets/fb26abcd0e673393e27dc6aa.webp","assets/6d81d43a80efa2b4c36989d5.webp","assets/85b12d56262a88c12ce956c2.webp"],"ninja10":["assets/37a27f635cbe45474d366e0e.webp","assets/a57ec54340300271af973257.webp","assets/5d6b3a81afa9ad9af74dc237.webp","assets/6dd662ce09f0b166676e6899.webp"],"ninja11":["assets/69211488b6c7f4edb87fbfbd.webp","assets/c9a776884c8fed453dda79db.webp","assets/678c3a76dc0f5a08987a917e.webp","assets/18dbf34681894be73091beef.webp"],"floor":"assets/9b1e5b9b46928de5ae045f15.jpg"};
 const LEGACY=window.__arena58Legacy;if(!LEGACY){console.error('Missing original summon module');return;}
 const beastTypes=['toad','wolf','hound','snake','monkey','boar','bear','tiger','badger','spider','lizard','tortoise'];
 const beastLabels={toad:'Боевая жаба',wolf:'Теневой волк',hound:'Боевой пёс',snake:'Гигантская змея',monkey:'Воин-обезьяна',boar:'Боевой кабан',bear:'Горный медведь',tiger:'Полосатый тигр',badger:'Каменный барсук',spider:'Паук-тенетник',lizard:'Рогатый ящер',tortoise:'Бронированная черепаха'};
 const abilities={toad:'Захват языком',wolf:'Прыжок и сбивание',hound:'Кусачая свора',snake:'Сдавливание и яд',monkey:'Удар посохом',boar:'Таран',bear:'Оглушающий рёв',tiger:'Укус и кровотечение',badger:'Подкоп',spider:'Паутина',lizard:'Шипы',tortoise:'Защита панцирем'};
 const shots=Object.fromEntries(Object.entries(ASSETS).filter(([k])=>k!=='floor').map(([k,arr])=>[k,arr.map(src=>{const im=new Image();im.src=src;return im})]));
 window.__shinobi510Portraits=shots;
 // Existing game supports six summons; extend actual contracts and combat data, not visual-only cards.
 const additions={
   monkey:{name:'Воин-обезьяна',hp:39,ap:7,power:10,special:'Удар посохом',color:'#a89479',cost:26},
   boar:{name:'Боевой кабан',hp:56,ap:6,power:13,special:'Таран',color:'#927463',cost:25},
   bear:{name:'Горный медведь',hp:69,ap:5,power:15,special:'Оглушающий рёв',color:'#967e69',cost:33},
   tiger:{name:'Полосатый тигр',hp:45,ap:8,power:15,special:'Рывок',color:'#bd7c4a',cost:31},
   badger:{name:'Каменный барсук',hp:34,ap:6,power:10,special:'Подкоп',color:'#aaa69a',cost:23},
   lizard:{name:'Рогатый ящер',hp:50,ap:5,power:12,special:'Шипы',color:'#8c8161',cost:29}
 };
 Object.assign(LEGACY.BEASTS,additions);
 for(const id of Object.keys(additions)){
   const t={id:'summon'+id[0].toUpperCase()+id.slice(1),element:null,name:'Призыв: '+beastLabels[id],kind:'summon',beast:id,ap:5,ch:additions[id].cost,learn:13,range:1,note:abilities[id]};
   if(!LEGACY.techById[t.id]){LEGACY.TECHS.push(t);LEGACY.techById[t.id]=t;}
 }
 // Real special actions: each contract has an effect beyond a cosmetic particle.
 const prevExecute=window.execute;
 window.execute=function(actor,action,cell){
   if(action!=='pet:special'||!actor?.isSummon)return prevExecute(actor,action,cell);
   if(!game||game.over||(!window.__shinobiNetwork?.canSimulate(actor)&&(game.phase!=='ally'||actor.team!=='ally'))||actor.ap<4||game.animating)return false;
   const type=actor.summonType;
   const at=cell||{c:actor.c,r:actor.r},range=dist(actor,at);
   const foe=unitAt(at.c,at.r);
   const visible=foe&&foe.team!==actor.team&&foe.hp>0&&visibleToSide(actor.team,foe);
   const selfCast=type==='tortoise'||type==='bear';
   if(selfCast){
     actor.ap-=4;
     if(type==='tortoise'){
       actor.guard=Math.max(actor.guard||0,2);actor.barrier=(actor.barrier||0)+12;
       log(actor.name+': защита панцирем (+12 барьер, усиленная защита).','good');
     }else{
       let n=0;for(const u of game.units.filter(x=>x.team!==actor.team&&x.hp>0&&dist(actor,x)<=2&&visibleToSide(actor.team,x))){u.stun=Math.max(u.stun||0,1);n++}
       log(actor.name+': оглушающий рёв, целей '+n+'.','good');
     }
     cueFx({action:'flash',actor:actor.id,from:{c:actor.c,r:actor.r},target:{c:actor.c,r:actor.r}});
     renderGame();return true;
   }
   if(type==='badger'){
     if(range<1||range>3||obstacle(at.c,at.r)||unitAt(at.c,at.r))return false;
     actor.ap-=4;actor.c=at.c;actor.r=at.r;
     log(actor.name+': подземный рывок в гекс '+at.c+':'+at.r+'.','good');
     cueFx({action:'earth',actor:actor.id,from:{c:actor.c,r:actor.r},target:at});renderGame();return true;
   }
   if(type==='spider'){
     if(range<1||range>3)return false;
     actor.ap-=4;let affected=0;
     for(const u of game.units.filter(x=>x.team!==actor.team&&x.hp>0&&dist(x,at)<=1&&visibleToSide(actor.team,x))){u.slow=Math.max(u.slow||0,2);affected++}
     log(actor.name+': паутина, обездвижено/замедлено '+affected+' целей.','good');
     cueFx({action:'smoke',actor:actor.id,from:{c:actor.c,r:actor.r},target:at});renderGame();return true;
   }
   const ranges={toad:2,wolf:2,snake:1,hound:2,monkey:2,boar:2,tiger:2,lizard:3};
   const maxRange=ranges[type]||1;
   if(!visible||range<1||range>maxRange)return false;
   actor.ap-=4;lookAt(actor,at);
   const hit=damage(actor,foe,(LEGACY.BEASTS[type]?.power||9)+4,'melee',0,false);
   if(hit){
     if(type==='toad'){foe.prone=Math.max(foe.prone||0,1);foe.slow=Math.max(foe.slow||0,1)}
     else if(type==='wolf'||type==='boar'){foe.prone=Math.max(foe.prone||0,1)}
     else if(type==='snake'){foe.poison=Math.max(foe.poison||0,2);foe.slow=Math.max(foe.slow||0,2)}
     else if(type==='monkey'){foe.stun=Math.max(foe.stun||0,1)}
     else if(type==='hound'||type==='tiger'){foe.slow=Math.max(foe.slow||0,2)}
     else if(type==='lizard'){foe.poison=Math.max(foe.poison||0,2)}
   }
   cueFx({action:'melee',actor:actor.id,from:{c:actor.c,r:actor.r},target:at,targetId:foe.id});
   checkEnd();renderGame();return true;
 };
 // Replace placeholder animal shapes with cut-out frames from the commissioned bestiary.
 // 5.9.8: coherent creature animation. Never switch between unrelated cropped poses on a timer.
 // One anchored illustration per creature; motion is continuous and always returns to resting pose.
 const beastMotion598={
  toad:    {width:146,height:146,breath:.006,rate:1.15,moveY:8,moveX:1,lean:.035,attack:6},
  wolf:    {width:151,height:148,breath:.007,rate:1.27,moveY:3,moveX:3,lean:.048,attack:10},
  hound:   {width:148,height:143,breath:.007,rate:1.24,moveY:3,moveX:3,lean:.048,attack:10},
  snake:   {width:154,height:149,breath:.004,rate:.83,moveY:1,moveX:3,lean:.039,attack:6},
  monkey:  {width:143,height:143,breath:.006,rate:1.36,moveY:4,moveX:2,lean:.039,attack:8},
  boar:    {width:153,height:146,breath:.007,rate:1.02,moveY:2.5,moveX:2,lean:.031,attack:9},
  bear:    {width:152,height:148,breath:.009,rate:.78,moveY:1.8,moveX:1.5,lean:.018,attack:5},
  tiger:   {width:154,height:146,breath:.007,rate:1.25,moveY:3,moveX:3,lean:.050,attack:11},
  badger:  {width:143,height:137,breath:.004,rate:1.10,moveY:2,moveX:2,lean:.023,attack:5},
  spider:  {width:151,height:149,breath:.002,rate:1.54,moveY:1.2,moveX:1,lean:.016,attack:5},
  lizard:  {width:151,height:149,breath:.005,rate:.97,moveY:1.5,moveX:2,lean:.033,attack:7},
  tortoise:{width:150,height:149,breath:.003,rate:.72,moveY:1,moveX:.8,lean:.010,attack:3}
 };
 const beastEase598=n=>{n=Math.max(0,Math.min(1,n));return n*n*(3-2*n)};
 const beastSoftPulse598=n=>Math.sin(Math.PI*beastEase598(n))**2;
 const beastFrames598=new Map();
 window.drawSummons=function(){
  if(!game)return;
  const now=performance.now();
  for(const u of game.units.filter(x=>x.isSummon&&x.hp>0&&(x.team==='ally'||visibleToSide('ally',x))).sort((a,b)=>a.r-b.r)){
   const p=spritePos(u,center(u.c,u.r)),ally=u.team==='ally';
   const images=shots[u.summonType],cfg=beastMotion598[u.summonType];
   if(!images||!cfg)continue;
   const im=images[0];if(!im?.complete||!im.naturalWidth)continue;
   const id=u.id,fx=typeof activeFx==='undefined'?null:activeFx;
   const acting=!!(fx&&fx.actor===id),moving=acting&&fx.action==='move';
   const attacking=acting&&!moving&&fx.action!=='summon';
   const progress=acting?Math.max(0,Math.min(1,fx.progress||0)):0;
   const env=beastSoftPulse598(progress);
   const pace=Math.max(1,fx?.path?.length||1);
   const rhythm=Math.sin(progress*Math.PI*2*Math.min(pace,4)*cfg.rate);
   // Ground-anchored displacement; zero motion at beginning/end of every action.
   let bodyX=moving?cfg.moveX*rhythm*env:0;
   let lift=moving?cfg.moveY*Math.max(0,Math.sin(progress*Math.PI*2*Math.min(pace,4)*cfg.rate))*env:0;
   let tilt=moving?cfg.lean*rhythm*env:0;
   let squat=moving&&u.summonType==='toad'?.04*env:0;
   if(attacking){
    const sign=u.team==='ally'?1:-1;
    bodyX+=sign*cfg.attack*env;
    tilt+=sign*cfg.lean*.65*env;
    lift+=(u.summonType==='wolf'||u.summonType==='tiger'||u.summonType==='hound'?5:1)*env;
    squat+=u.summonType==='toad'?.045*env:0;
   }
   const hitAge=u.reaction?Date.now()-u.reaction.at:99999;
   const hitProgress=hitAge>=0&&hitAge<420?hitAge/420:1;
   const recoil=hitProgress<1?beastSoftPulse598(hitProgress):0;
   bodyX+=(u.team==='ally'?-1:1)*recoil*4.5;
   tilt+=(u.team==='ally'?-1:1)*recoil*.022;
   // Slow, tiny breathing, not alternating illustration frames or shaking the silhouette.
   const seed=String(id).split('').reduce((x,ch)=>x+ch.charCodeAt(0),0);
   const phase=now*.001*cfg.rate+seed*.031;
   const breathing=(!moving&&!attacking)?Math.sin(phase)*cfg.breath:0;
   const heightScale=1+breathing-squat;
   const widthScale=1-breathing*.4+squat*.12;
   const aspect=im.naturalWidth/Math.max(1,im.naturalHeight);
   let dw=Math.min(105,105*aspect),dh=dw/aspect;
   if(dh>cfg.height){dh=cfg.height;dw=dh*aspect;}
   const selected=game.selected===id,health=Math.max(0,Math.min(1,u.hp/Math.max(1,u.maxHp)));
   ctx.save();ctx.translate(p.x,p.y+12);
   // Shadow and selection ring are ALWAYS locked to the logical hex centre.
   ctx.fillStyle='rgba(3,8,10,.79)';ctx.beginPath();ctx.ellipse(0,10,41,14,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=selected?'#edd3a0':ally?'#74b5d6':'#d36d68';ctx.lineWidth=selected?4:2.5;
   ctx.beginPath();ctx.ellipse(0,10,42,15,0,0,Math.PI*2);ctx.stroke();
   // Rotate and breathe ABOUT THE SAME FOOT CONTACT POINT; no discontinuous pose swaps.
   ctx.save();ctx.translate(bodyX,-lift+8);ctx.rotate(tilt);ctx.scale(widthScale,heightScale);
   ctx.shadowColor='rgba(0,0,0,.72)';ctx.shadowBlur=9;ctx.shadowOffsetY=3;
   if(!window.__shinobiRig512?.drawBeast?.(ctx,u,im,dw,dh,{moving,attacking,progress,pace,now}))ctx.drawImage(im,-dw/2,-dh,dw,dh);
   ctx.restore();
   // Health and label remain stationary to prevent distracting HUD jitter.
   ctx.fillStyle='rgba(7,10,13,.9)';ctx.fillRect(-36,-dh+5,72,10);
   ctx.fillStyle=ally?'#76ba9a':'#c86c67';ctx.fillRect(-34,-dh+7,68*health,6);
   ctx.strokeStyle='#8c8b7b';ctx.lineWidth=1;ctx.strokeRect(-36,-dh+5,72,10);
   ctx.fillStyle='rgba(20,26,29,.92)';const label=(LEGACY.BEASTS[u.summonType]?.name||u.name).replace('Боевая ','').replace('Боевой ','').replace('Гигантская ','').replace('Горный ','').replace('Полосатый ','').slice(0,12);
   ctx.font='bold 11px system-ui';const tw=ctx.measureText(label).width+12;
   ctx.fillRect(-tw/2,30,tw,19);ctx.fillStyle='#ece8df';ctx.textAlign='center';ctx.fillText(label,0,43);
   ctx.restore();
   beastFrames598.set(id,{spriteFrame:0,bodyX:Math.round(bodyX*100)/100,lift:Math.round(lift*100)/100,tilt,progress,moving,attacking});
  }
 };
 window.__beastMotion598={version:'5.9.8',types:Object.keys(beastMotion598),
  samples:()=>Object.fromEntries(beastFrames598),
  spriteSwaps:0,readable:true};
 // New combatant appearances, same hitboxes/AP and same transparent sprite silhouettes as before.
 const prevActor=window.__arena50DrawActor;
 window.__arena50DrawActor=function(context,u,x,y,w,h){
   if(!u||u.isSummon)return prevActor?prevActor(context,u,x,y,w,h):false;
   const nm=String(u.isClone?(u.cloneOwner||u.sprite||u.id):(u.id||u.sprite||'1'));let hash=0;
   for(let i=0;i<nm.length;i++)hash=(hash*31+nm.charCodeAt(i))|0;
   const n=Math.abs(hash)%12;
   const arr=shots['ninja'+n];if(!arr)return prevActor?prevActor(context,u,x,y,w,h):false;
   const t=(typeof activeFx!=='undefined'?activeFx:null),attack=t&&t.actor===u.id;
   const frame=attack?2:Math.floor(Date.now()/800)%2;
   const img=arr[frame];if(img?.complete&&img.naturalWidth){
     const ratio=img.naturalWidth/img.naturalHeight, hh=h,ww=Math.min(w,hh*ratio);
     context.drawImage(img,x+(w-ww)/2,y+h-hh,ww,hh);return true;
   }
   return prevActor?prevActor(context,u,x,y,w,h):false;
 };
 const screen=document.getElementById('arenaScreen'),boardPanel=screen?.querySelector('.boardpanel'),side=screen?.querySelector('.side');
 const roster=document.createElement('div');roster.id='arena58-roster';boardPanel.appendChild(roster);
 const summonPanel=document.createElement('section');summonPanel.id='arena58-summons';summonPanel.setAttribute('aria-label','Призванные звери и способности');side.insertBefore(summonPanel,side.querySelector('[data-ux55-section="actions"]')||side.firstChild);
 // Keep the summon panel visible independently of action tabs.
 const iconFor=u=>u.isSummon?shots[u.summonType]?.[0]?.src:SPRITES[u.sprite];
 const rangeNote=t=>({toad:'дальность 2',wolf:'дальность 2',hound:'дальность 2',snake:'соседняя цель',monkey:'дальность 2',boar:'дальность 2',bear:'радиус 2 вокруг зверя',tiger:'дальность 2',badger:'подкоп до 3 гексов',spider:'паутина до 3 гексов',lizard:'дальность 3',tortoise:'на себя'})[t]||'соседняя цель';
 const escapeHTML=t=>String(t).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 function card(u){let typ=u.isSummon?(LEGACY.BEASTS[u.summonType]?.name||u.name):u.name;
  let face=iconFor(u);let life=Math.round(100*u.hp/Math.max(u.maxHp,1));
  return `<button class="${u.team==='enemy'?'enemy':''} ${u.id===game.selected?'selected':''}" type="button" data-id="${escapeHTML(u.id)}" title="${escapeHTML(typ)} — HP ${u.hp}/${u.maxHp}, ОД ${u.ap}"><div class="face"><img src="${face||''}" alt=""></div><div class="pname">${escapeHTML(typ)}</div><div class="hp"><i style="width:${life}%"></i></div><div class="ap"><i style="width:${Math.max(0,100*u.ap/Math.max(1,u.maxAp))}%"></i></div></button>`;
 }
 let lastKey='';
 function redrawHUD(){
  if(!game||!screen.classList.contains('active'))return;
  const allies=game.units.filter(u=>u.team==='ally'&&u.hp>0),enemies=game.units.filter(u=>u.team==='enemy'&&u.hp>0&&visibleToSide('ally',u));
  roster.innerHTML=`<div class="squad">${allies.slice(0,7).map(card).join('')}</div><span class="versus">⚔</span><div class="squad">${enemies.slice(0,5).map(card).join('')}</div>`;
  roster.querySelectorAll('button[data-id]').forEach(b=>b.onclick=()=>{const u=game.units.find(x=>x.id===b.dataset.id);if(u?.team==='ally'){game.selected=u.id;game.action='move';renderGame()}else if(u){game.hoverCell={c:u.c,r:u.r};draw()}});
  const pets=allies.filter(u=>u.isSummon);
  summonPanel.innerHTML=`<h3>ПРИЗВАННЫЕ ЗВЕРИ <small style="float:right;font:11px system-ui;color:#a2a6a1">${pets.length} активны</small></h3>`+
    (pets.length?pets.map(p=>`<button class="beastcard ${p.id===game.selected?'selected':''}" data-pet="${escapeHTML(p.id)}"><img src="${shots[p.summonType]?.[0].src||''}" alt=""><div style="flex:1"><b>${escapeHTML(LEGACY.BEASTS[p.summonType]?.name||p.name)}</b><small>HP ${p.hp}/${p.maxHp} · ОД ${p.ap}/${p.maxAp}</small><div class="healthbar"><i style="width:${Math.round(p.hp/p.maxHp*100)}%"></i></div></div></button>`).join(''):`<div class="empty">Пока нет призванных существ. Изучи призыв или начни демонстрационный бой.<button id="arena58-demo-inbattle" type="button">⚔ Демобой с призывами</button></div>`);
  summonPanel.querySelectorAll('[data-pet]').forEach(b=>b.onclick=()=>{game.selected=b.dataset.pet;game.action='move';renderGame()});
  summonPanel.querySelector('#arena58-demo-inbattle')?.addEventListener('click',demo);
  const sel=game.units.find(u=>u.id===game.selected);
  if(sel?.isSummon&&game.action==='pet:special'){const r=document.getElementById('arena541-rangehud');if(r)r.textContent='Спецприём: '+(LEGACY.BEASTS[sel.summonType]?.special||'')+' · 4 ОД · '+rangeNote(sel.summonType);}
  // In the reference layout, specials are always shown for summoned allies.
  if(pets.length){
   summonPanel.insertAdjacentHTML('beforeend',`<h3 style="margin-top:10px">СПЕЦСПОСОБНОСТИ</h3>`+
    pets.map(p=>`<button class="ability" data-special-pet="${escapeHTML(p.id)}" ${p.ap<4||game.phase!=='ally'?'disabled':''}><img src="${shots[p.summonType]?.[2]?.src||''}" alt=""><div><b>${escapeHTML(LEGACY.BEASTS[p.summonType]?.special||abilities[p.summonType])}</b><small>${escapeHTML(LEGACY.BEASTS[p.summonType]?.name||p.name)} · 4 ОД · ${rangeNote(p.summonType)}</small></div><b>4 ОД</b></button>`).join(''));
   summonPanel.querySelectorAll('[data-special-pet]').forEach(b=>b.onclick=()=>{game.selected=b.dataset.specialPet;const pet=game.units.find(x=>x.id===game.selected);if(['tortoise','bear'].includes(pet?.summonType)){window.execute(pet,'pet:special',{c:pet.c,r:pet.r});return}game.action='pet:special';renderGame()});
   if(sel?.isSummon){
    summonPanel.insertAdjacentHTML('beforeend',`<button class="ability" id="arena58-basic" ${sel.ap<3||game.phase!=='ally'?'disabled':''}><span style="font-size:22px">⚔</span><div><b>Обычная атака</b><small>3 ОД · соседняя цель на карте</small></div></button>`);
    summonPanel.querySelector('#arena58-basic')?.addEventListener('click',()=>{game.action='pet:attack';renderGame()});
   }
  } else summonPanel.insertAdjacentHTML('beforeend','<div id="arena58-help">Когда появятся призванные звери, их спецприёмы будут здесь.</div>');
 }
 const renderPrior=window.renderGame;
 window.renderGame=function(){const result=renderPrior.apply(this,arguments);try{redrawHUD()}catch(err){console.error('tactical HUD',err)}return result};
 const priorStart=window.newGame;
 function demo(){
  // Start a real playable battle. Demo units obey hitpoints, AP and abilities.
  const select=document.getElementById('teamSize'),opp=document.getElementById('enemySize');
  if(select)select.value='3';if(opp)opp.value='4';
  if(typeof window.newGame==='function')window.newGame();else return;
  if(!game||!game.units)return;
  const leaders=game.units.filter(u=>u.team==='ally'&&!u.isClone&&!u.isSummon);
  const summonDefs=['toad','wolf','snake'];
  for(let i=0;i<summonDefs.length;i++){
   const owner=leaders[i%leaders.length];if(!owner)continue;
   const preferred=[{c:3,r:1},{c:3,r:3},{c:4,r:5}][i];
   const places=[];for(let r=1;r<H;r++)for(let c=2;c<W-1;c++){
     if(!obstacle(c,r)&&!unitAt(c,r))places.push({c,r,d:dist(preferred,{c,r})})
   }
   places.sort((a,b)=>a.d-b.d||a.r-b.r);
   const site=places[0];if(!site)continue;
   const pet=LEGACY.newBeast(owner,{beast:summonDefs[i]},site,false);
   pet.ap=pet.maxAp;pet.justSummoned=false;
  }
  game.selected=leaders[0]?.id||game.selected;
  log('Показательный бой: у отряда 3 настоящих призванных зверя. Управление стандартное.','good');
  renderGame();
 }
 document.getElementById('arena58-demo')?.addEventListener('click',demo);
 // Real background image replaces the old plain grass texture. No mock combat screenshot pasted onto the map.
 try{renderSetup()}catch(e){console.warn('Обновление списка договоров:',e)}
 BATTLE_FLOOR.src='assets/677fd94f9e1174544ecb1fb9.jpg';
 window.__arena58={demo,update:redrawHUD,beasts:beastTypes,stats:()=>({playable:!!game,summons:game?.units.filter(u=>u.isSummon&&u.hp>0).length||0,skills:LEGACY.TECHS.length,roster:game?.units.length||0})};
})();
