/* SHINOBI ARENA 5.6 — Accurate jutsu descriptions, player knowledge log, cover stealth / ambush. */
(()=>{
'use strict';
const TECHS=window.__arena18?.TECHS||[];
const index=Object.fromEntries(TECHS.map(x=>[x.id,x]));
const $=id=>document.getElementById(id);
const kindText={hit:'Одна выбранная цель. Проверка попадания; действие может промахнуться.',blast:'Взрыв по центру и соседним гексам (радиус 1). Урон получают и союзники, и враги. Без отдельного броска попадания.',line:'Поражение всех бойцов на линии до цели, включая союзников. Без отдельного броска попадания.',chain:'Первая цель проверяет попадание, затем разряд задевает до двух ближайших к ней бойцов обеих команд.',wall:'Появляется непроходимая земляная стена на 2 раунда. Требуется свободный гекс.',self:'Срабатывает на самого шиноби, цель на карте выбирать не нужно.',clone:'Требуется пустой соседний гекс. Для появления клона необходимо закончить анимацию печатей.',arsenal:'Создаёт предметы в инвентаре. Цель на поле не требуется.',summon:'Призывает отдельного союзного зверя на свободный гекс.',weaponAttack:'Атака оружейным градом по области; задевает своих.'};
const mechanic={
 fire1:'Попадание накладывает горение на 2 раунда.',fire2:'Горение на всех задетых бойцах на 2 раунда.',fire3:'Горение на задетых бойцах на 2 раунда.',
 water1:'При попадании: замедление на 1 раунд и промокание на 2 раунда.',water2:'При попадании: замедление на 1 раунд и промокание на 2 раунда. Полного обездвиживания в этой версии нет.',water3:'Снимает горение с задетых бойцов, замедляет на 1 раунд. Задевает своих.',
 wind2:'При попадании отбрасывает цель в доступный соседний гекс дальше от атакующего.',
 light1:'При попадании 35% шанс электрического шока — потеря следующего действия.',light2:'При попадании 35% шанс шока первичной цели; вторичный разряд задевает до двух бойцов рядом.',
 earth2:'При попадании замедляет на 2 раунда и сбивает с ног на 1.',
 shield:'Поглощает 40% урона от следующего успешного попадания.',replace:'При следующем ударе от врага на расстоянии до 5 гексов уходит в свободный соседний гекс. Если рядом нет свободной клетки — подмена не сработает.',
 decoy:'Иллюзорная приманка: не ходит, не атакует, не тратит собственную чакру. Враг не знает, кто оригинал. Время жизни — 2 раунда.',
 shadow:'Физический клон: собственные ОД и выделенная часть чакры, те же изученные дзюцу. Урон его техник снижен до 80%. Живёт 3 раунда.',
 elementClone:'Физический стихийный клон: отдельная чакра, доступные техники и 55% урона своих ниндзюцу. Живёт 3 раунда.',
 earth3:'На клетке появляется преграда, которая мешает движению и линии огня.'
};
function detail(t){
 let effect=t.school==='genjutsu'?t.note+' Для враждебной техники проводится проверка сопротивления; затраты оплачиваются и при сопротивлении. Кай и Разрыв иллюзии снимают только эффекты школы гендзюцу.':mechanic[t.id]||'';
 if(!effect){
   if(t.kind==='hit'){
    effect=t.element===0?'Любое успешное попадание этой огненной стихии вызывает горение.':t.element===1?'Успешное попадание замедляет и делает цель мокрой.':t.element===3?'Наносит урон молнией. Шок с фиксированным шансом пока предусмотрен только для «Электроимпульса» и «Цепной молнии».':t.element===4?'Наносит урон землёй. Дополнительное падение работает у «Земляной хватки».':'Наносит урон ветром; отбрасывание реализовано у «Сильного порыва».';
   }else if(t.kind==='blast'&&t.element===0){effect='Урон по площади; специальное горение не добавлено для этой техники, если не указано отдельно.'}
   else if(t.kind==='arsenal')effect=`В инвентарь добавляется: ${t.qty||1} ед. предмета.`;
   else if(t.kind==='summon')effect='У призванного существа свои здоровье, ОД и особая атака. Оно занимает клетку на поле.';
   else if(t.kind==='line'||t.kind==='blast'||t.kind==='chain')effect='Урон от удара по площади рассчитывается непосредственно по каждому бойцу; не всякая техника накладывает статус.';
 }
 let combo=t.element===1&&t.kind==='hit'?'Мокрая цель сильнее страдает от последующей молнии; вода также готовит комбинацию с землёй.':t.element===3&&t.kind==='hit'?'Если цель мокрая, попадание вызывает дополнительный урон и шок.':t.element===4&&t.kind==='hit'?'Земля после воды создаёт эффект грязевой ловушки при попадании.':t.element===2&&t.kind==='hit'?'Ветер усиливает уже наложенное на цель горение.':'';
 const facts=[`Стоимость: ${t.ap} ОД · ${t.ch} чакры.`,`Дальность: ${t.range?`${t.range} гекс.`:'на себя'}.`,t.power!=null&&t.power>0?`Базовая сила: ${t.power} (фактический урон зависит от механики).`:null,`Обучение: ${t.learn||0} очков навыков.`,kindText[t.kind]||'Техника выполняется после складывания печатей.',effect,combo].filter(Boolean);
 // No false claims: some older short notes describe concepts not implemented in engine.
 return {title:t.name,kind:t.kind,range:t.range,ap:t.ap,ch:t.ch,note:t.note||'',facts};
}
const modal=document.createElement('section');modal.id='arena56-detail';modal.setAttribute('role','dialog');modal.setAttribute('aria-label','Описание боевого приёма');modal.hidden=true;
modal.innerHTML='<button type="button" id="arena56-close" aria-label="Закрыть описание">×</button><div class="arena56-detail-tag">ПРАВИЛА ДЗЮЦУ · 5.6</div><h3 id="arena56-title"></h3><div id="arena56-facts"></div>';
document.body.append(modal);
const selection=document.createElement('div');selection.id='arena56-selection';selection.hidden=true;
const hud=$('ux55-hud');if(hud)hud.append(selection);
let active=null,pinned=false;
function open(id,lock=false){const t=index[id];if(!t)return false;const d=detail(t);active=id;pinned=lock;modal.querySelector('#arena56-title').textContent=d.title;
 const list=modal.querySelector('#arena56-facts');list.replaceChildren();for(const s of d.facts){const p=document.createElement('p');p.textContent=s;list.append(p)}
 modal.hidden=false;return true;}
function close(force=false){if(!pinned||force){modal.hidden=true;active=null;pinned=false}}
$('arena56-close').onclick=()=>close(true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')close(true)});
// Hover on desktop, tap the '?' on touchscreens. Every tech has an independent accessible info control.
const learning=$('jutsuLearning'),battle=$('jutsuPanel');
function appendControls(root,selector){if(!root)return;for(const b of root.querySelectorAll(selector)){
 const id=b.dataset.tech||b.dataset.learn,t=index[id];if(!t)continue;
 const row=b.closest('.jutsu-learning-row');
 if(row){let label=row.querySelector('.detail');if(label){let info=label.querySelector('.arena56-info');if(!info){info=document.createElement('button');info.type='button';info.className='arena56-info';info.textContent='?';label.append(info)}info.dataset.techHelp=id;info.title=`${t.name}: подробное описание`;info.setAttribute('aria-label','Описание: '+t.name);}}
 else {let info=b.nextElementSibling;if(!info?.classList.contains('arena56-info')){info=document.createElement('button');info.type='button';info.className='arena56-info';info.textContent='?';b.after(info)}info.dataset.techHelp=id;info.title=`${t.name}: подробное описание`;info.setAttribute('aria-label','Описание: '+t.name);}
 b.title=detail(t).facts.join('\n');
 if(row){const sub=row.querySelector('.detail small');if(sub&&!sub.dataset.arena56){sub.dataset.arena56='1';sub.textContent+=` · Дальность ${t.range||'на себя'}`;}}
 }}
function adorn(){appendControls(learning,'[data-learn]');appendControls(battle,'button[data-tech]')}
const prevSetup=window.renderSetup;window.renderSetup=function(...a){const x=prevSetup.apply(this,a);adorn();return x};
const prevRender=window.renderGame;window.renderGame=function(...a){const x=prevRender.apply(this,a);adorn();updateStealthHUD();updateSelected();return x};
adorn();
document.addEventListener('click',e=>{const btn=e.target.closest('.arena56-info');if(btn){e.preventDefault();e.stopPropagation();open(btn.dataset.techHelp,true);return}
 const b=e.target.closest('#jutsuPanel button[data-tech]');if(b&&!b.disabled){const t=index[b.dataset.tech];if(t){selection.hidden=false;selection.textContent=`Выбрано: ${t.name} · ${t.ap} ОД · ${t.ch} Ч · Дальность ${t.range||'на себя'} · Нажми «?» для подробностей.`;}}
});
document.addEventListener('mouseover',e=>{if(e.target.closest('.arena56-info'))return;const b=e.target.closest('#jutsuPanel button[data-tech],#jutsuLearning button[data-learn]');if(b&&window.matchMedia('(hover: hover) and (pointer: fine)').matches&&!pinned)open(b.dataset.tech||b.dataset.learn,false)});
document.addEventListener('mouseout',e=>{const b=e.target.closest('#jutsuPanel button[data-tech],#jutsuLearning button[data-learn]');if(b&&!b.contains(e.relatedTarget))close()});
function updateSelected(){try{if(game?.action?.startsWith('tech:')){const t=index[game.action.slice(5)];if(t){selection.hidden=false;selection.textContent=`Выбрано: ${t.name} · ${t.ap} ОД · ${t.ch} Ч · Дальность ${t.range||'на себя'} · ? — описание`;return}}selection.hidden=true;}catch(e){} }
// Cover-based stealth: no instant invisibility on open ground. The same visibility rule applies to AI and player.
function covered(u){if(!game||!u)return false;const key=k(u.c,u.r);return game.smoke?.has(key)||neigh(u.c,u.r).some(c=>obstacle(c.c,c.r))||!game.units.some(v=>v.team!==u.team&&v.hp>0&&lineClear(v,u)&&!smokeBlocksAim(v,u));}
function hidden(u){return Boolean(game&&u&&u.hp>0&&u.__hideUntil!=null&&game.round<=u.__hideUntil&&covered(u));}
function detected(observer,u){
 if(!game||!u)return false;
 return game.units.some(v=>{
  if(v.team!==observer||v.hp<=0||!lineClear(v,u))return false;
  const d=dist(v,u);
  if(d<=1)return true;
  if(d>2||smokeBlocksAim(v,u))return false;
  // Cover and smoke use fixed concealment; no trainable concealment skill.
  const detector=(v.attrs?.per||4)*7;
  const concealer=30+(u.attrs?.agi||0)*2+(game.smoke.has(k(u.c,u.r))?25:5);
  return detector>=concealer;
 });
}
const oldVisible=window.visibleToSide;window.visibleToSide=function(side,u){return !!(oldVisible(side,u)&&!(u&&u.team!==side&&hidden(u)&&!detected(side,u)))};
const oldCanAim=window.canAim;window.canAim=function(a,b){return !!(oldCanAim(a,b)&&!(b&&a&&b.team!==a.team&&hidden(b)&&!detected(a.team,b)))};
let countHides=0,countAmbush=0;
function updateStealthHUD(){if(!game)return;const u=me();const btn=$('arena56-hide');if(!btn)return;btn.disabled=!u||u.hp<=0||u.ap<3||game.phase!=='ally'||!!game.animating||!!u.isSummon||!!u.isClone&&u.cloneKind==='illusion'||!covered(u)||hidden(u);
 btn.title=covered(u)?'3 ОД. Затаиться в дыму или рядом с препятствием. Бойцы на соседнем гексе всё ещё обнаруживают тебя.':'Нужно укрытие, дым или отсутствие прямой видимости врагов.';
 const status=$('arena56-hide-status');if(status)status.textContent=u&&hidden(u)?'Скрыт: до конца следующего раунда или до раскрытия.':covered(u)?'Есть укрытие: можно затаиться.':'Открытая местность: скрыться нельзя.';}
function installHide(){const actions=$('actionButtons');if(!actions||actions.querySelector('#arena56-hide'))return;const b=document.createElement('button');b.id='arena56-hide';b.dataset.ux55Category='fight';b.type='button';b.innerHTML='Скрыться <small>3 ОД · дым / укрытие</small>';const hint=document.createElement('div');hint.id='arena56-hide-status';hint.className='arena56-hide-status';const first=actions.querySelector('button[data-action="move"]');if(first)first.after(b);else actions.prepend(b);actions.append(hint);b.onclick=()=>{if(!game)return;const u=me();if(!u||u.ap<3||game.phase!=='ally'||!covered(u)){log('Чтобы затаиться, нужно укрытие, дым или отсутствие прямой видимости.');return}
 u.ap-=3;u.fatigue=Math.min(100,(u.fatigue||0)+2);u.__hideUntil=game.round+1;countHides++;log(`${u.name} скрывается в укрытии.`,'good');window.renderGame();};updateStealthHUD()}
// Legacy action bar re-renders its content. Reinstall the hide command after render.
const oldRender2=window.renderGame;window.renderGame=function(...a){const v=oldRender2.apply(this,a);installHide();updateStealthHUD();return v};
installHide();
const oldDamage=window.damage;window.damage=function(a,b,base,type,bonus=0,...rest){if(a&&b&&a.team!==b.team&&hidden(a)){const melee=['sword','melee','quick','heavy','stunHit','trip'].includes(type);if(melee){bonus+=12;countAmbush++;log(`${a.name}: внезапная атака из укрытия (+12 к меткости).`,'good')}a.__hideUntil=-1}
 return oldDamage(a,b,base,type,bonus,...rest);};
const oldMove=window.moveUnit;window.moveUnit=function(u,path,cap){const result=oldMove(u,path,cap);if(u&&u.__hideUntil!=null&&!covered(u))u.__hideUntil=-1;return result};
// Enemy turns and action messages must not reveal an unseen enemy's exact location.
const rawLog=window.log;let filteredLogs=0;
function isEnemyUnseenMessage(message){if(!game)return false;const enemy=game.units?.filter(u=>u.team==='enemy'&&u.hp>0)||[];
 // If the report has a visible participant, it is observable; avoid suppressing effects on allies.
 const named=enemy.filter(u=>message.includes(u.name)).sort((a,b)=>b.name.length-a.name.length);
 if(named.length&&!visibleToSide('ally',named[0]))return true;
 // General messages about enemy-only statuses can be withheld when no enemy is visible.
 return false;
}
window.log=function(message,cls=''){
 const text=String(message||'');
 if(isEnemyUnseenMessage(text)){
   filteredLogs++;
   // If an ally was affected, the event is known, but the unseen attacker's identity is not.
   const allyAffected=game?.units?.some(u=>u.team==='ally'&&text.includes(u.name));
   if(allyAffected){
    const obscured=text.replace(/Противник \d+(?: · клон \d+)?/g,'Неизвестный противник').replace(/(?:клетк[аеиу]\s*)\d+:\d+/gi,'неизвестном месте');
    return rawLog(obscured,cls);
   }
   return;
 }
 return rawLog(text,cls);
};
// Extra defensive permission: attacks and ninjutsu cannot target unseen opponents by directly feeding hex coordinates.
const preExecute=window.execute;window.execute=function(u,act,cell){if(game&&u&&cell&&u.team==='ally'&&act?.startsWith('tech:')){const t=index[act.slice(5)];if(t&&['hit','chain','line','blast'].includes(t.kind)){const target=unitAt(cell.c,cell.r);if(target&&target.team!==u.team&&!visibleToSide(u.team,target))return false;}}
 return preExecute(u,act,cell)};
window.__arena56={version:'5.6',techs:TECHS,detail,open,close,hidden,covered,get stats(){return {filteredLogs,countHides,countAmbush}},get selected(){return active}};
})();
