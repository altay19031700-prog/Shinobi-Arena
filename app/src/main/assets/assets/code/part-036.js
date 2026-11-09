
/* Genjutsu is resolved against mind resistance, never elemental damage or weather. */
(()=>{'use strict';
const TECHS=window.__arena18.TECHS,techs=TECHS.filter(t=>t.school==='genjutsu'),byId=Object.fromEntries(techs.map(t=>[t.id,t]));
const names={mirage:'Мираж',bind:'Иллюзорные путы',dread:'Ложная угроза',sleep:'Сон',mirror:'Ложный образ',ward:'Ясность разума'};
const effects=u=>u?.genEffects||{},has=(u,key)=>!!effects(u)[key],negative=u=>['mirage','bind','dread','sleep'].some(k=>has(u,k));
const watched=new Map();let world=null;const stats={casts:0,successes:0,resists:0,cleanses:0,awakenings:0,aiCasts:0};
function initialize(p){p.learned??=[];for(const id of ['genMirage','genKai'])if(!p.learned.includes(id))p.learned.push(id)}
const oldSetup=window.renderSetup;window.renderSetup=function(...a){roster.forEach(initialize);return oldSetup.apply(this,a)};
function syncDamage(){if(game!==world){world=game;watched.clear()}if(!game)return;for(const u of game.units){const hp=watched.get(u.id);if(hp!=null&&u.hp<hp){if(has(u,'sleep')){delete u.genEffects.sleep;stats.awakenings++;log(`${u.name}: урон разрушает сон.`,'good')}if(has(u,'mirror'))delete u.genEffects.mirror;}watched.set(u.id,u.hp)}}
function apply(u,key,turns){u.genEffects??={};u.genEffects[key]={turns,started:game.phase===u.team};watched.set(u.id,u.hp)}
function chance(a,b,t){return Math.max(15,Math.min(90,Math.round(60+((a.skills?.genjutsu||0)-(b.skills?.genjutsu||0))*.4+(a.attrs.int-b.attrs.per)*3-(b.skills?.control||0)/10-(t.difficulty||0)-(has(b,'ward')?15:0))))}
function actionAllowed(u,action){syncDamage();if(has(u,'sleep'))return action==='tech:genKai';const t=action?.startsWith('tech:')?TECHS.find(t=>t.id===action.slice(5)):null;if(has(u,'bind')&&(action==='move'||t?.kind==='dash'))return false;return true}
function valid(u,t,cell){
 if(!game||game.over||game.animating||!u||u.hp<=0||u.stun||!t||u.isSummon||u.cloneKind==='illusion'||!u.learned?.includes(t.id)||u.ap<t.ap||u.chakra<t.ch||!actionAllowed(u,'tech:'+t.id))return false;
 if(game.phase!==u.team)return false;
 const target=t.targetSide==='self'?u:game.units.find(v=>v.hp>0&&cell&&v.c===cell.c&&v.r===cell.r);
 if(!target||target.isSummon||dist(u,target)>t.range)return false;
 if(t.targetSide==='enemy'){
  if(target.team===u.team||!window.visibleToSide(u.team,target)||!window.canAim(u,target))return false;
  if(t.effect&&has(target,t.effect))return false;
  if(['bind','sleep'].includes(t.effect)&&((target.genControlUntil||0)>game.round||has(target,'bind')||has(target,'sleep')))return false;
 }else{
  if(target.team!==u.team||target!==u&&!lineClear(u,target))return false;
  if(['genKai','genDispel'].includes(t.id)&&!negative(target))return false;
  if(t.id==='genMirror'&&has(u,'mirror'))return false;
 }
 return true;
}
function clear(u){for(const key of ['mirage','bind','dread','sleep'])if(u.genEffects)delete u.genEffects[key];apply(u,'ward',1);u.genEffects.ward.started=false;stats.cleanses++}
function cast(u,t,cell){
 if(!valid(u,t,cell))return false;
 const target=t.targetSide==='self'?u:game.units.find(v=>v.hp>0&&v.c===cell.c&&v.r===cell.r),from={c:u.c,r:u.r};
 u.ap-=t.ap;u.chakra-=t.ch;u.fatigue=Math.min(100,(u.fatigue||0)+5);if(u.isClone)u.__actedThisRound=true;stats.casts++;if(u.team==='enemy')stats.aiCasts++;
 let success=true;if(t.targetSide==='enemy'){const p=chance(u,target,t);success=rand(100)<p;if(!success){stats.resists++;log(`${target.name} сопротивляется «${t.name}» (${p}% на успех).`)}else{stats.successes++;if(t.id==='genDrain'){const lost=Math.min(8,target.chakra);target.chakra-=lost;log(`${u.name} → ${target.name}: «${t.name}», −${lost} чакры (${p}%).`,'good')}else{apply(target,t.effect,t.turns);if(['bind','sleep'].includes(t.effect))target.genControlUntil=game.round+2;log(`${u.name} → ${target.name}: «${t.name}» на ${t.turns} ход(а) цели (${p}%).`,'good')}}}
 else if(t.id==='genMirror'){apply(u,'mirror',2);log(`${u.name}: ложный образ, −12 п.п. меткости атакующих; до 2 своих ходов или получения урона.`,'good')}
 else{clear(target);log(`${u.name}: «${t.name}» снимает гендзюцу с ${target.name}; +15 п.п. сопротивления до конца следующего своего хода.`,'good');if(t.id==='genKai')target.genEffects.ward.started=false;}
 window.__genCastVisual534={world:game,id:t.id,actor:u.id,success};
 cueFx({action:'genjutsu',actor:u.id,from,target:{c:target.c,r:target.r},targetId:target.id,spellName:t.name,element:null});
 // Existing seal completion owns the VFX launch; its profiles are registered at boot.
 renderGame();return true;
}
function beginTurn(team){if(!game)return;for(const u of game.units.filter(v=>v.team===team&&v.hp>0))for(const [key,e]of Object.entries(effects(u))){if(e.started){e.turns--;if(e.turns<=0){delete u.genEffects[key];log(`${u.name}: ${names[key]||key} рассеивается.`)}}else e.started=true}}
function options(u){
 if(!game||u.isClone||u.isSummon)return [];const result=[];
 for(const t of techs){if(!u.learned?.includes(t.id))continue;for(const target of t.targetSide==='self'?[u]:game.units){if(!valid(u,t,target))continue;let score=0;
  if(t.id==='genKai')score=has(u,'sleep')?100:has(u,'bind')?55:42;
  else if(t.id==='genDispel')score=has(target,'sleep')?60:has(target,'bind')?38:28;
  else if(t.id==='genMirror')score=game.units.some(v=>v.hp>0&&v.team!==u.team&&visibleToSide(u.team,v)&&dist(u,v)<=4)?18:0;
  else{const p=chance(u,target,t)/100,pressure=game.units.filter(v=>v.team===u.team&&v.hp>0&&v.id!==u.id&&dist(v,target)<=4).length;score=12+p*(t.effect==='sleep'?30:t.effect==='bind'?20:t.effect==='dread'?17:t.id==='genDrain'?Math.min(8,target.chakra)*1.4:20)+Math.min(6,pressure*2)-(u.chakra<t.ch+7?8:0);}
  if(score>0)result.push({kind:'spell',id:t.id,cell:{c:target.c,r:target.r},score,targetId:target.id});
 }}return result;
}
const oldDamage=window.damage;window.damage=function(...a){const r=oldDamage.apply(this,a);syncDamage();return r};
const oldExecute=window.execute;window.execute=function(u,action,cell){if(!actionAllowed(u,action))return false;return oldExecute.call(this,u,action,cell)};
const oldMove=window.moveUnit;window.moveUnit=function(u,...a){return actionAllowed(u,'move')?oldMove.call(this,u,...a):0};
const oldChance=window.hitChance;window.hitChance=function(a,b,...rest){return Math.max(5,Math.min(95,oldChance.call(this,a,b,...rest)-(has(a,'mirage')?15:0)-(has(b,'mirror')?12:0)))};
const oldAvailable=window.actionAvailable;window.actionAvailable=function(u,a){return actionAllowed(u,a)&&oldAvailable.call(this,u,a)};
const oldTurn=window.takeDamageOverTime;window.takeDamageOverTime=function(team){beginTurn(team);const r=oldTurn.call(this,team);syncDamage();return r};

function detail(u){return Object.entries(effects(u)).map(([key,e])=>`${names[key]||key}: ${e.turns} ход(а)`).join(' · ')}
function updateUI(){if(!game)return;syncDamage();const u=me();if(!u)return;
 const info=document.getElementById('unitInfo');if(info&&detail(u)){const d=document.createElement('div');d.className='genjutsu-status';d.textContent=detail(u);info.append(d)}
 const line=document.getElementById('ux55-hudmain');let tag=document.getElementById('genjutsu-hud');if(!tag&&line){tag=document.createElement('span');tag.id='genjutsu-hud';line.append(tag)}if(tag){tag.textContent=Object.keys(effects(u)).map(k=>names[k]).join(' · ');tag.title=detail(u);tag.hidden=!detail(u)}
 document.querySelectorAll('#actionButtons [data-action]').forEach(b=>{if(!actionAllowed(u,b.dataset.action))b.disabled=true});
 document.querySelectorAll('#jutsuPanel [data-tech]').forEach(b=>{if(!actionAllowed(u,'tech:'+b.dataset.tech))b.disabled=true});
}
function hint(){if(!game)return;const t=byId[game.action?.slice(5)];if(!t)return;const u=me(),target=game.hoverCell?unitAt(game.hoverCell.c,game.hoverCell.r):null,hud=document.getElementById('arena541-rangehud');if(!hud||!u)return;let text=t.name+' · '+t.ap+' ОД / '+t.ch+' Ч · '+(t.targetSide==='self'?'на себя':`дальность ${t.range}`);
 if(target&&t.targetSide==='enemy'&&visibleToSide(u.team,target))text+=valid(u,t,target)?` · успех ${chance(u,target,t)}%`:' · недоступная цель / защита от контроля';else text+=' · '+(t.targetSide==='ally'?'выбери союзника под гендзюцу':t.targetSide==='self'?'': 'выбери видимого врага');hud.textContent=text;
}
const oldRender=window.renderGame;window.renderGame=function(...a){const r=oldRender.apply(this,a);updateUI();hint();return r};
function drawStatuses(){if(!game)return;const now=performance.now();ctx.save();for(const u of game.units){if(u.hp<=0||!detail(u)||u.team!=='ally'&&!visibleToSide('ally',u))continue;const q=spritePos(u,center(u.c,u.r));ctx.strokeStyle=has(u,'ward')?'#9bded6':'#b3a2df';ctx.lineWidth=1.3;ctx.globalAlpha=.5+.12*Math.sin(now*.002);ctx.beginPath();ctx.ellipse(q.x,q.y+12,33,11,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.95;ctx.fillStyle='#e0d5ff';ctx.font='bold 11px system-ui';ctx.textAlign='center';const label=has(u,'sleep')?'СОН':has(u,'bind')?'ПУТЫ':has(u,'mirage')?'МИРАЖ':has(u,'dread')?'СТРАХ':has(u,'mirror')?'ОБРАЗ':'КАЙ';ctx.fillText(label,q.x,q.y-105);}ctx.restore()}
const oldDraw=window.draw;window.draw=function(...a){const r=oldDraw.apply(this,a);drawStatuses();hint();return r};
function drawEffect(c,e,p,a,b){
 if(e.type!=='genjutsu')return false;
 // Distinct hand-drawn Canvas effects for mind control, never elemental projectiles.
 const id=e.id||'',cleanse=id==='genKai'||id==='genDispel';
 const x=b.x,y=b.y-38,progress=Math.max(0,Math.min(1,p));
 const fade=Math.min(1,progress*6,(1-progress)*5),turn=progress*Math.PI*2;
 const aura=cleanse?'#80eee2':'#b6a0ff',shade=cleanse?'#d8fff6':'#7c60dc';
 c.save();c.lineCap='round';c.lineJoin='round';
 const stroke=(points,color,width=2,opacity=1,closed=false)=>{c.beginPath();points.forEach((pt,i)=>i?c.lineTo(pt[0],pt[1]):c.moveTo(pt[0],pt[1]));if(closed)c.closePath();c.lineWidth=width;c.strokeStyle=color;c.globalAlpha=fade*opacity;c.stroke()};
 const ellipse=(cx,cy,rx,ry,color,opacity=1,width=2)=>{c.beginPath();c.ellipse(cx,cy,Math.max(1,rx),Math.max(1,ry),0,0,Math.PI*2);c.strokeStyle=color;c.lineWidth=width;c.globalAlpha=fade*opacity;c.stroke()};
 const particle=(ang,r,size,color,opacity)=>{c.beginPath();c.arc(x+Math.cos(ang)*r,y+Math.sin(ang)*r*.6,size,0,Math.PI*2);c.fillStyle=color;c.globalAlpha=fade*opacity;c.fill()};
 // Dissolving rings for cleansing and resistance-oriented techniques.
 if(cleanse){
  for(let i=0;i<4;i++){const r=14+(1-progress)*5+progress*70+i*7;ellipse(x,y,r,r*.54,aura,(1-i*.18)*(1-progress*.55),2.3-i*.28)}
  for(let i=0;i<16;i++){const ang=i*Math.PI/8+turn*.7;const r=12+progress*(55+(i%4)*6);particle(ang,r,1.4+i%3,shade,.55)}
 }else if(id==='genBind'){
  // Five animated ribbon loops tighten around the occupied hex's fighter.
  for(let i=0;i<5;i++){
   const yy=b.y-11-i*15;
   const r=38-14*progress+2*Math.sin(turn*2+i);
   ellipse(x,yy,r,8-2*progress,aura,.92,3);
   const ang=turn*1.5+i*1.3;particle(ang,20,2.8,shade,.9);
  }
  stroke([[x-23,b.y-14],[x-16,b.y-79],[x+19,b.y-79],[x+23,b.y-14]],shade,1.6,.55);
 }else if(id==='genSleep'){
  // Dream veil with ascending drifting fragments and gently closing eye.
  ellipse(x,y,30,12,aura,.75,2.6);
  stroke([[x-24,y],[x-12,y+5],[x,y+7],[x+12,y+5],[x+24,y]],shade,2.8,.9);
  for(let i=0;i<14;i++){
   const q=i*2.399+turn*.6;const r=10+(i%5)*7;
   const px=x+Math.cos(q)*r,py=y+Math.sin(q)*r*.5-42*progress;
   c.beginPath();c.arc(px,py,1.5+i%3,0,Math.PI*2);c.fillStyle=i%2?aura:shade;c.globalAlpha=fade*(.35+(i%4)*.13);c.fill();
  }
 }else if(id==='genMirage'||id==='genMirror'){
  // Double image: two asynchronous offset outlines, not a projectile.
  for(const [j,dx] of [-1,1].entries()){
   const shift=(dx?1:-1)*(10+14*progress)*(1+.15*Math.sin(turn*3+j));
   stroke([[x+shift-12,y+20],[x+shift-14,y-16],[x+shift-7,y-28],[x+shift+7,y-28],[x+shift+14,y-16],[x+shift+12,y+20]],j?aura:shade,2.6,.76);
  }
  for(let i=0;i<3;i++)ellipse(x,y,12+progress*35+i*8,7+progress*16+i*3,aura,.5-i*.11,1.7);
 }else if(id==='genDread'){
  // Jagged psychological shock made from a contracting cage of angular arcs.
  for(let i=0;i<8;i++){
   const ang=i*Math.PI/4+turn*.22;
   const r=64-progress*33;
   stroke([[x+Math.cos(ang)*r,y+Math.sin(ang)*r*.58],[x+Math.cos(ang+.25)*(r-12),y+Math.sin(ang+.25)*(r-12)*.58],[x+Math.cos(ang+.48)*(r-20),y+Math.sin(ang+.48)*(r-20)*.58]],shade,2.8,.9);
  }
  ellipse(x,y,13+progress*12,7+progress*5,aura,.75,2.6);
 }else{
  // Shared neural interference, e.g. chakra drain: rotating non-elemental sigils.
  for(let i=0;i<3;i++){
   const r=18+i*13+progress*12;ellipse(x,y,r,r*.54,aura,.8-i*.18,2.5-i*.3);
   for(let k=0;k<6;k++)particle(k*Math.PI/3+turn*(i%2?1:-1),r,2,shade,.62);
  }
 }
 c.restore();return true;
}

const style=document.createElement('style');style.textContent='.genjutsu-status{padding:7px;margin-top:6px;border:1px solid #8c73b6;border-radius:7px;color:#dccbf6;background:#302941}.school-tabs{display:flex;flex-wrap:wrap;gap:5px;grid-column:1/-1;margin:7px 0}.school-tabs button{padding:6px 10px;min-height:34px;font-size:12px}.school-tabs button[aria-pressed=true]{border-color:#c6a6ef;background:#443653}.school-note{grid-column:1/-1;font-size:12px;color:#c9b9df;line-height:1.5}#genjutsu-hud{font-size:10px;color:#dbc6f3;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';document.head.append(style);
window.__genjutsu={techs,chance,canCast:valid,cast,actionAllowed,options,has,negative,drawEffect,damageMultiplier:u=>has(u,'dread')?.8:1,get stats(){return {...stats}},status:detail};
})();

