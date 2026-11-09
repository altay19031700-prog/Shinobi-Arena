
/* SHINOBI ARENA 2.4 — five integrated steps based on 1.9 */
(function(){
'use strict';
const VERSION='2.4';
const INJURY_TYPES={arm:{label:'Повреждена рука',short:'РУКА',color:'#ffc4a7'},leg:{label:'Повреждена нога',short:'НОГА',color:'#e6d49d'},head:{label:'Контузия',short:'ГОЛОВА',color:'#eab9f8'}};
const STAGE_DEFS=['Анимации реакций','Управление на телефоне','Тактический ИИ','Ранения','Сохранение отряда'];
const css=document.createElement('style');css.id='arena24Style';css.textContent=`
#arena24-toolbar{display:flex;align-items:center;justify-content:flex-start;flex-wrap:wrap;gap:7px;margin:7px 0 10px}
#arena24-toolbar button{font-size:12px;padding:9px 11px;min-height:39px}
#arena24-setup{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
#arena24-setup button{min-height:40px;padding:8px 11px}
#arena24-feedback{font-size:12px;min-height:20px;margin-top:4px;color:#a9d7c2}
#arena24-status{padding:6px 8px;margin:8px 0;border:1px solid #52675f;border-radius:8px;background:#182b2b;font-size:12px;color:#e9d9bb;min-height:30px}
#arena24-status:empty{display:none}
.arena24-dot{display:inline-block;border-radius:5px;padding:2px 5px;margin:2px;border:1px solid #6f6d5d;background:#2c3331}
#jutsuPanel button,#actionButtons button{min-height:43px}
.arena24-focus{outline:2px solid #ddc687!important;outline-offset:2px}
@media(max-width:760px){
 .arena-layout{display:flex!important;flex-direction:column!important;gap:8px!important}
 .arena-layout>.boardpanel{width:100%!important;min-width:0!important}
 .arena-layout>.side{width:100%!important;display:flex!important;flex-direction:column!important;gap:9px!important}
 .boardpanel .subhead{align-items:flex-start!important;flex-wrap:wrap!important}
 .boardpanel .subhead .row{flex-wrap:wrap!important;gap:4px!important}
 #arena24-toolbar{position:sticky;top:0;z-index:20;background:rgba(13,26,29,.94);padding:5px;border:1px solid #405c59;border-radius:8px}
 #arena24-toolbar button{flex:1 1 75px;min-height:44px}
 #actionButtons button,#jutsuPanel button{min-height:48px}
 #battleTabs button{min-height:44px}
 #arenaScreen .boardwrap{overflow-x:auto!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch}
 #arenaScreen .boardwrap canvas{width:100%!important;height:auto!important;min-width:520px!important;max-width:none!important}
 .statsgrid{grid-template-columns:1fr!important}
 .stat{min-height:50px}
 .stat .tiny{min-width:40px;min-height:40px}
}
@media(min-width:761px){#arena24-toolbar .arena24-mobileonly{display:none}}
`;document.head.appendChild(css);

function info(text,color='#a9d7c2'){
 const el=document.getElementById('arena24-feedback');if(el){el.textContent=text;el.style.color=color;}
}
const setup=document.getElementById('setupScreen');
const setupLine=document.createElement('div');setupLine.id='arena24-setup';setupLine.innerHTML='<button id="arena24-save" type="button">Сохранить отряд</button><button id="arena24-load" type="button">Загрузить отряд</button><button id="arena24-reset" type="button">Новый отряд</button><span id="arena24-feedback" aria-live="polite"></span>';
setup?.querySelector('.setup-grid .panel')?.insertBefore(setupLine,document.getElementById('fighterCard'));
const KEY='shinobi_arena_team_v24';
function migrateRemovedStats(p){
 const next={...p,attrs:{...p.attrs},baseAttrs:{...p.baseAttrs},skills:{...p.skills},baseSkills:{...p.baseSkills}};
 for(const [group,base,points,key] of [['attrs','baseAttrs','attrPoints','luck'],['skills','baseSkills','skillPoints','stealth']]){
  const value=next[group][key],floor=next[base][key];
  if(Number.isInteger(value)&&Number.isInteger(floor)&&floor>=0&&value>=floor&&value<=100){next[points]+=value-floor;}
  delete next[group][key];delete next[base][key];
 }
 return next;
}
function getSerializableRoster(){return roster.slice(0,6).map(p=>({name:p.name,rank:p.rank,element:p.element,attrs:{...p.attrs},skills:{...p.skills},baseAttrs:{...p.baseAttrs},baseSkills:{...p.baseSkills},attrPoints:p.attrPoints,skillPoints:p.skillPoints,gear:{...p.gear},xp:p.xp,level:p.level,sprite:p.sprite,appearanceChosen:!!p.appearanceChosen,learned:[...(p.learned||[])]}));}
function validateRoster(array){const attrs=['str','per','end','int','agi'];const sk=['taijutsu','kenjutsu','throw','ninjutsu','genjutsu','control','acrobat'];
 if(!Array.isArray(array)||![3,6].includes(array.length))return false;
 return array.every(p=>p&&typeof p.name==='string'&&p.name.length<64&&Number.isInteger(p.rank)&&p.rank>=0&&p.rank<4&&Number.isInteger(p.element)&&p.element>=0&&p.element<=4&&SAFE_SPRITES.includes(p.sprite)&&Number.isInteger(p.attrPoints)&&p.attrPoints>=0&&p.attrPoints<=1000&&Number.isInteger(p.skillPoints)&&p.skillPoints>=0&&p.skillPoints<=10000&&Number.isInteger(p.level)&&p.level>=1&&p.level<=1000&&Array.isArray(p.learned)&&p.learned.length<100&&p.learned.every(x=>typeof x==='string'&&x.length<40)&&p.gear&&typeof p.gear==='object'&&attrs.every(x=>Number.isInteger(p.attrs?.[x])&&p.attrs[x]>=1&&p.attrs[x]<=100&&Number.isInteger(p.baseAttrs?.[x])&&p.baseAttrs[x]>=1&&p.baseAttrs[x]<=100)&&sk.every(x=>Number.isInteger(p.skills?.[x])&&p.skills[x]>=0&&p.skills[x]<=100&&Number.isInteger(p.baseSkills?.[x])&&p.baseSkills[x]>=0&&p.baseSkills[x]<=100));}
function saveTeam(){try{const data={version:VERSION,roster:getSerializableRoster(),teamSize:Number(document.getElementById('teamSize').value),enemySize:Number(document.getElementById('enemySize').value)};localStorage.setItem(KEY,JSON.stringify(data));info('Отряд сохранён на этом устройстве.');return true;}catch(e){info('Не удалось сохранить: хранилище браузера недоступно.','#ffb3a1');return false;}}
function loadTeam(){try{const text=localStorage.getItem(KEY);if(!text){info('Сохранённый отряд не найден.','#ffcc9b');return false;}
 const data=JSON.parse(text);if(Array.isArray(data.roster))data.roster=data.roster.map((p,i)=>p&&typeof p==='object'&&Number.isInteger(p.sprite)&&p.sprite>=0&&p.sprite<24?{...p,sprite:24+(i%5)}:p);if(!validateRoster(data.roster)){info('Данные сохранения повреждены или несовместимы.','#ffb3a1');return false;}
 roster=data.roster.map(migrateRemovedStats).map(p=>({...p,attrs:{...p.attrs},skills:{...p.skills},baseAttrs:{...p.baseAttrs},baseSkills:{...p.baseSkills},gear:{...p.gear},learned:[...p.learned]}));
 // The old version stored 3 players. Keep them, generate the missing profiles.
 while(roster.length<6)roster.push(generate(0));
 document.getElementById('teamSize').value=String(clamp(+data.teamSize||3,1,6));
 document.getElementById('enemySize').value=String(clamp(+data.enemySize||3,1,6));
 focus=0;spritePage=0;renderSetup();info('Отряд загружен.');return true;
 }catch(e){info('Ошибка загрузки: '+e.message,'#ffb3a1');return false;}}
setupLine.querySelector('#arena24-save').onclick=saveTeam;
setupLine.querySelector('#arena24-load').onclick=loadTeam;
setupLine.querySelector('#arena24-reset').onclick=()=>{fillRoster();info('Создан новый случайный отряд.');};

const battlePanel=document.querySelector('#arenaScreen .boardpanel');
const toolbar=document.createElement('div');toolbar.id='arena24-toolbar';
toolbar.innerHTML='<button id="arena24-map" class="arena24-mobileonly" type="button">К карте</button><button id="arena24-panleft" class="arena24-mobileonly" type="button">◀ Поле</button><button id="arena24-panright" class="arena24-mobileonly" type="button">Поле ▶</button><button id="arena24-actions" class="arena24-mobileonly" type="button">К действиям</button><button id="arena24-spells" class="arena24-mobileonly" type="button">К дзюцу</button><button id="arena24-focus" type="button">Выделить бойца</button>';
battlePanel?.insertBefore(toolbar,battlePanel.querySelector('.boardwrap'));
const scrollTo=(selector)=>{const target=document.querySelector(selector);if(target){target.scrollIntoView({behavior:'smooth',block:'start'});target.classList.add('arena24-focus');setTimeout(()=>target.classList.remove('arena24-focus'),950)}};
toolbar.querySelector('#arena24-map').onclick=()=>scrollTo('#arenaScreen .boardwrap');
toolbar.querySelector('#arena24-panleft').onclick=()=>{const el=document.querySelector('#arenaScreen .boardwrap');if(el)el.scrollLeft=Math.max(0,el.scrollLeft-250)};
toolbar.querySelector('#arena24-panright').onclick=()=>{const el=document.querySelector('#arenaScreen .boardwrap');if(el)el.scrollLeft+=250};

toolbar.querySelector('#arena24-actions').onclick=()=>scrollTo('#actionButtons');
toolbar.querySelector('#arena24-spells').onclick=()=>scrollTo('#jutsuPanel');
toolbar.querySelector('#arena24-focus').onclick=()=>{if(!game)return;game.action='move';renderGame();};
const status=document.createElement('div');status.id='arena24-status';status.setAttribute('aria-live','polite');document.getElementById('unitInfo')?.after(status);

// Stage 3: tactical, bounded target priority. Never targets dead or friendly units.
window.arenaAiScore=function(target,enemy){
 if(!target||target.hp<=0)return Infinity;
 const distance=dist(target,enemy);
 const hpRatio=target.hp/Math.max(1,target.maxHp);
 const exposed=target.guard?1.5:0;
 const decoy=window.__arena541?.knownCopy('enemy',target)?2.3:0;
 const summoned=target.isSummon?1.4:0;
 const obscured=typeof smokeOnLine==='function'&&smokeOnLine(enemy,target)?1.3:0;
 return distance*2.7 + hpRatio*2.4 + exposed + decoy + summoned + obscured;
};

// Stage 4: injury system is applied only to non-summoned fighters on direct weapon hits.
const prevDamage=window.damage;
window.damage=function(attacker,defender,...rest){
 const before=defender.hp;
 const result=prevDamage(attacker,defender,...rest);
 const lost=before-defender.hp;
 if(result&&lost>=8&&defender.hp>0&&!defender.isClone&&!defender.isSummon){
  const chance=lost>=20?38:23;
  if(rand(100)<chance){const types=['arm','leg','head'];const pick=types[rand(types.length)];
   defender.injuries=defender.injuries||{};
   defender.injuries[pick]=Math.max(defender.injuries[pick]||0,3);
   defender.reaction={kind:'hurt',at:Date.now()};
   log(`${defender.name}: ${INJURY_TYPES[pick].label} — штрафы на 3 раунда.`,'hurt');
  }
 }
 if(lost>0){defender.lastImpactAt=Date.now();defender.lastImpact=lost;}
 return result;
};
const prevChance=window.hitChance;
window.hitChance=function(a,b,type,bonus=0){
 const broken=a.injuries||{};
 let penalty=(broken.arm&&(type!=='melee')?14:broken.arm?7:0)+(broken.head?11:0);
 return clamp(prevChance(a,b,type,bonus)-penalty,5,95);
};
const prevMove=window.moveUnit;
window.moveUnit=function(u,path,cap){
 if(u?.injuries?.leg){u.fatigue=Math.min(100,(u.fatigue||0)+5);cap=Math.min(cap,Math.max(1,Math.floor((u.ap||1)/2)));}
 return prevMove(u,path,cap);
};
const prevExecute=window.execute;
window.execute=function(u,action,cell){
 const healer=action==='bandage'?unitAt(cell?.c,cell?.r):null;
 const oldHp=healer?.hp??null;
 const res=prevExecute(u,action,cell);
 if(res&&action==='bandage'&&healer&&healer.hp>oldHp&&healer.injuries){
  const first=Object.keys(healer.injuries)[0];if(first){delete healer.injuries[first];log(`${healer.name}: перевязка облегчила травму (${INJURY_TYPES[first]?.short||first}).`,'good');}
 }
 return res;
};
const priorTurn=window.enemyTurn;
window.enemyTurn=async function(){
 if(!game||game.over||game.phase!=='ally')return;
 const roundBefore=game.round;
 await priorTurn();
 if(!game||game.over)return;
 if(game.round>roundBefore){
  for(const u of game.units.filter(x=>x.hp>0)){
   if(u.injuries){for(const kind of Object.keys(u.injuries)){u.injuries[kind]--;if(u.injuries[kind]<=0)delete u.injuries[kind];}}
   if(u.injuries?.leg)u.ap=Math.max(0,u.ap-1);
  }
  renderGame();
 }
};

// Stage 1: clear hit-feedback ring and facing arrow without modifying combat outcomes.
const oldDraw=window.draw;
window.draw=function(){
 oldDraw();if(!game)return;
 ctx.save();
 const now=Date.now();
 for(const u of game.units.filter(x=>x.hp>0&&!x.isClone&&!x.isSummon)){
  const p=center(u.c,u.r); const age=now-(u.lastImpactAt||0);
  if(age<700){const t=age/700;
   ctx.strokeStyle=`rgba(255,185,140,${Math.max(0,.65*(1-t))})`;
   ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(p.x,p.y-25,22+t*24,10+t*14,0,0,Math.PI*2);ctx.stroke();
  }
  if(u.id===game.selected){ctx.fillStyle='rgba(244,217,131,.85)';ctx.font='17px sans-serif';ctx.textAlign='center';ctx.fillText('⌃',p.x,p.y-127);}
 }
 ctx.restore();
};
const oldRenderGame=window.renderGame;
window.renderGame=function(){
 oldRenderGame();if(!game)return;
 const u=me();
 if(!u){status.textContent='';return;}
 const tags=[];
 for(const [k,duration] of Object.entries(u.injuries||{}))if(duration>0){const t=INJURY_TYPES[k];if(t)tags.push(`<span class="arena24-dot" title="${t.label}">${t.short}: ${duration}</span>`);}
 if(u.wet)tags.push(`<span class="arena24-dot">МОКРЫЙ: ${u.wet}</span>`);
 if(u.prone)tags.push(`<span class="arena24-dot">СБИТ С НОГ: ${u.prone}</span>`);
 if(u.stun)tags.push('<span class="arena24-dot">ОГЛУШЁН</span>');
 status.innerHTML=tags.join('');
};
// Hooks exposed only for local manual/regression testing and diagnostics.
window.__arena24={VERSION,STAGE_DEFS,INJURY_TYPES,aiScore:window.arenaAiScore,saveTeam,loadTeam,validateRoster,getSerializableRoster};
})();

