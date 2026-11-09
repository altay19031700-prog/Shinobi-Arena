
/* SHINOBI ARENA 4.7. Five milestones:
 * 4.3 observed-threat model; 4.4 traps / feints; 4.5 team tactical sequencing;
 * 4.6 loss-driven bounded adaptation; 4.7 replay and diagnostic harness.
 * AI does not read unobserved player inventory/learned abilities.
 * Deterministic heuristics, not a trained neural network.
 */
(function(){
'use strict';
const mus=window.__musashi, m37=window.__musashi37, m42=window.__musashi42;
if(!mus||!m37||!m42||!window.arena30)return;
const KEY='shinobi-musashi-47-v1';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const fresh=()=>({version:1,matches:0,wins:0,losses:0,draws:0,observations:{},effects:{},adapt:{risk:0,combo:0,feint:0,focus:0},lastBattles:[]});
let memory=fresh(),recorded=false,battleNumber=0;
try {const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s?.version===1&&Array.isArray(s.lastBattles))memory={...fresh(),...s,adapt:{...fresh().adapt,...s.adapt}};}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(memory));return true;}catch(e){return false;}};
const journal=[];
const stats={rounds:0,decisions:0,moves:0,spells:0,items:0,melee:0,feints:0,teamCombos:0,teamFocus:0,failedActions:0,planningErrors:0,simulatedThreats:0};
let targetId=null,lastSeenAction=null;
const all=(team)=>game?.units.filter(x=>x.hp>0&&x.team===team&&(team!=='ally'||visibleToSide('enemy',x)))||[];
const heroes=(team)=>all(team).filter(x=>!x.isSummon&&(team==='enemy'?!x.isClone:!window.__arena541?.knownCopy('enemy',x)));
const tidy=(u)=>({id:u.id,c:u.c,r:u.r,hp:u.hp,chakra:u.chakra,ap:u.ap,element:u.element,wet:!!u.wet,burn:!!u.burn,stun:!!u.stun,prone:!!u.prone});
const copyHistory=(event,details={})=>{journal.push({step:journal.length+1,round:game?.round??0,event,...details});if(journal.length>500)journal.shift();};
const schema=(u)=>({ap:u.ap,ch:u.chakra,gear:{...u.gear},hp:u.hp,pos:{c:u.c,r:u.r}});
function register(action,element){
 if(mus.state.mode!=='musashi'||!game||game.over)return;
 const k=String(action),x=memory.observations; x[k]=(x[k]||0)+1;
 if(Number.isInteger(element))memory.effects['element-'+element]=(memory.effects['element-'+element]||0)+1;
 lastSeenAction=k;
}
const oldExecute=window.execute;
window.execute=function(u,action,cell){
 const before=u?.ap,done=oldExecute(u,action,cell);
 if(done&&u?.team==='ally'&&u.ap<before){register(action,u.element);copyHistory('player-action',{actor:u.id,action,target:cell?{c:cell.c,r:cell.r}:null});}
 return done;
};
// Movement is not routed through execute() in the old engine; observe it separately.
const priorMove=window.moveUnit;
window.moveUnit=function(u,path,cap){
 const own=u?.team==='ally',old=u?{c:u.c,r:u.r}:null;
 const beforeNearest=own?Math.min(...all('enemy').map(e=>dist(u,e))):Infinity;
 const moved=priorMove(u,path,cap);
 if(own&&u&&(old.c!==u.c||old.r!==u.r)){
  register('move',u.element);
  const afterNearest=Math.min(...all('enemy').map(e=>dist(u,e)));
  if(afterNearest>beforeNearest)memory.observations.retreat=(memory.observations.retreat||0)+1;
  copyHistory('player-move',{actor:u.id,from:old,to:{c:u.c,r:u.r}});
 }
 return moved;
};
const priorCast=window.arena30.cast;
window.arena30.cast=function(u,id,cell){
 const done=priorCast(u,id,cell);
 if(done&&u?.team==='ally'){register('tech:'+id,u.element);copyHistory('player-cast',{actor:u.id,tech:id,target:cell?{c:cell.c,r:cell.r}:null});}
 return done;
};
function observed(){
 const o=memory.observations,total=Object.values(o).reduce((s,v)=>s+(+v||0),0);
 const counts=(prefixes)=>Object.entries(o).reduce((n,[k,v])=>n+(prefixes.some(p=>k.startsWith(p))?v:0),0);
 const ranged=counts(['kunai','shuriken','senbon','tech:']);
 const melee=counts(['melee','quick','heavy','trip','stunHit','sword']);
 const defensive=counts(['guard','bandage','smoke','flash','poisonBomb','move']);
 return {total,ranged,melee,defensive,rangedRatio:ranged/Math.max(1,total),meleeRatio:melee/Math.max(1,total),defensiveRatio:defensive/Math.max(1,total),suspected:(ranged>melee*1.5?'дальний бой':melee>ranged*1.5?'ближний бой':'смешанная тактика')};
}
// 4.3: threat uses only visible combat information, not concealed backpack.
function threat(t){
 const friends=heroes('enemy'); const status=(t.wet?5:0)+(t.burn?4:0)+(t.stun?3:0);
 const proximity=friends.reduce((v,a)=>v+Math.max(0,6-dist(a,t)),0);
 const exposure=friends.filter(a=>dist(a,t)<=4).length;
 const seen=window.__arena541?.seenStats('enemy',t)||t;const lethal=(1-seen.hp/Math.max(1,seen.maxHp))*23;
 const profile=observed();
 // Only observed player behavior: do not peek into hidden chakra/inventory.
 const spellPotential=profile.total>=3&&profile.rangedRatio>.5?6:0;
 return proximity*2+exposure*7+lethal+status+spellPotential-(t.guard?6:0)-(window.__arena541?.knownCopy('enemy',t)?22:0)-(t.isSummon?13:0);
}
function focus(){
 const core=heroes('ally'), candidates=core.length?core:all('ally');
 return [...candidates].sort((a,b)=>threat(b)-threat(a))[0]||null;
}
function teamHasFollowUp(u,t){
 return heroes('enemy').some(a=>a.id!==u.id&&a.ap>=4&&a.chakra>=8&&dist(a,t)<=5&&(
  (u.element===1&&(a.element===3||a.element===4))||(u.element===0&&a.element===2)));
}
function aoeFriendlyRisk(p,u){
 if(!p.cell||!['paper','flash','smoke','poisonBomb'].includes(p.id))return 0;
 return all('enemy').filter(a=>a.id!==u.id&&dist(a,p.cell)<=2).length;
}
const stamina=(u)=>Math.max(0,(u.fatigue||0));
const techById=Object.fromEntries((window.__arena18?.TECHS||[]).map(t=>[t.id,t]));
const costAP={quick:2,melee:3,heavy:5,trip:4,stunHit:4,sword:4,kunai:3,shuriken:3,senbon:3,poison:3,guard:2,smoke:3,flash:4,paper:5,poisonBomb:4,bandage:3,potion:3,trap:3,toxin:2,jutsu:4,meditate:2};
function legal(u,p){
 if(!p?.cell||u.hp<=0||u.ap<2)return false;
 if(p.id==='meditate')return !u.isClone&&!u.isSummon&&u.ap>=2&&u.chakra<u.maxChakra;
 if(p.kind==='move'){
   if(!inBoard(p.cell.c,p.cell.r)||obstacle(p.cell.c,p.cell.r)||unitAt(p.cell.c,p.cell.r))return false;
   const path=pathTo(u,p.cell.c,p.cell.r);return !!(path?.length&&path.length<=Math.floor(u.ap/(u.slow?2:1)));
 }
 if(p.kind==='spell'){
   const t=techById[p.id];if(!t||u.ap<t.ap||u.chakra<t.ch)return false;
   if(!u.learned?.includes(p.id))return false; if(['hit','blast','line','chain','weaponAttack'].includes(t.kind)&&!canAim(u,p.cell))return false;
   if(['summon','clone','wall','decoy'].includes(t.kind)&&unitAt(p.cell.c,p.cell.r))return false;
   return true;
 }
 if(p.id==='jutsu')return canAim(u,p.cell)&&u.chakra>=Math.max(4,9-Math.floor((u.skills?.control||0)/35))&&u.ap>=4;
 if(u.ap<(costAP[p.id]||3))return false;
 if(['kunai','shuriken','senbon','poison'].includes(p.id)&&!canAim(u,p.cell))return false;if(['paper','flash','smoke','poisonBomb'].includes(p.id)&&dist(u,p.cell)>4)return false; if(['kunai','shuriken','senbon','poison','smoke','flash','paper','poisonBomb','trap','toxin','potion','bandage','sword'].includes(p.id))return (u.gear?.[p.id]||0)>0;
 return true;
}
// 4.4: score decoys, defensive repositions and genuine inventory trap placement.
function tacticalScore(u,p,t,actors){
 if(p.id==='meditate')return p.score;
 let score=m42.assess(u,p,t,actors);const profile=observed();
 const low=u.hp/Math.max(1,u.maxHp),d=t?dist(u,t):6;
 const risk=memory.adapt.risk||0,combo=memory.adapt.combo||0,feint=memory.adapt.feint||0;
 if(p.kind==='spell'){
   const tech=techById[p.id];const after=u.chakra-(tech?.ch||0);
   if(after<8&&u.hp/u.maxHp<.65)score-=4+risk;
   if(t&&['hit','blast','chain','line'].includes(tech?.kind)&&teamHasFollowUp(u,t))score+=6+combo;
   if(p.id==='decoy')score+=((low<.7&&d<=4)?10:0)+feint;
   if(['shield','replace'].includes(p.id))score+=low<.45?10+risk:1;
 }
 if(p.kind==='move'){
   const oldDistance=dist(u,t||p.cell),newDistance=t?dist(p.cell,t):8;
   const hostile=all('ally').filter(x=>dist(p.cell,x)<=2).length;
   if(low<.45&&newDistance>oldDistance&&hostile>0)score+=7+risk+feint;
   if(profile.rangedRatio>.55&&newDistance===1&&low<.65)score-=7+risk;
   if(newDistance>4&&u.chakra>12)score-=4;
 }
 if(p.id==='trap')score+=d<=3?7+feint:0;
 if(p.id==='smoke')score+=profile.rangedRatio>.5?7+feint:1;
 if(p.id==='flash')score+=profile.meleeRatio>.55?5:1;
 if(p.id==='bandage'&&low<.4)score+=14+risk;
 if(p.id==='potion'&&u.chakra<12&&u.gear?.potion>0)score+=10;
 if(['paper','poisonBomb'].includes(p.id)&&aoeFriendlyRisk(p,u))score-=38*aoeFriendlyRisk(p,u);
 if(t?.id&&p.cell&&p.cell.id===t.id)score+=memory.adapt.focus||0;
 if(stamina(u)>60&&p.kind==='move')score-=4;
 return Number.isFinite(score)?score:-999;
}
function planTrap(u,t,opts){
 if(!t||u.ap<3||!u.gear?.trap||u.isClone||u.isSummon)return;
 const around=neigh(u.c,u.r).filter(p=>!obstacle(p.c,p.r)&&!unitAt(p.c,p.r))
   .sort((a,b)=>dist(a,t)-dist(b,t));
 if(around[0]&&dist(around[0],t)<=3){opts.push({kind:'action',id:'trap',cell:around[0],score:20+(memory.adapt.feint||0)});}
}
const sleep=(n)=>new Promise(resolve=>setTimeout(resolve,n));
async function settle(){let i=0;while(game&&(game.animating||window.arena30?.isPreparing)&&i++<180)await sleep(45);await waitFx();}
async function action(u,p){
 const before=schema(u);let ok=false;
 try {
  if(p.kind==='move'){
    const path=pathTo(u,p.cell.c,p.cell.r);if(!path?.length)return false;
    moveUnit(u,path,Math.min(path.length,Math.floor(u.ap/(u.slow?2:1))));ok=u.ap<before.ap;
  }else if(p.kind==='spell')ok=!!window.arena30.cast(u,p.id,p.cell);
  else ok=!!execute(u,p.id,p.cell);
  if(!ok)return false;
  await settle();
  if(u.ap>=before.ap&&u.chakra>=before.ch)return false;
  stats.decisions++;
  if(p.kind==='move')stats.moves++;
  else if(p.kind==='spell')stats.spells++;
  else if(['smoke','flash','trap','potion','bandage','paper','poisonBomb','meditate'].includes(p.id))stats.items++;
  else stats.melee++;
  if(['decoy','trap','smoke'].includes(p.id))stats.feints++;
  const target=targetId?game.units.find(a=>a.id===targetId):null;
  if(target&&(target.wet||target.burn)&&(u.element===3||u.element===2||u.element===4))stats.teamCombos++;
  mus.state.decisions.push({round:game.round,actor:u.id,action:p.id,type:p.kind,score:Math.round(p.score),target:targetId});
  if(mus.state.decisions.length>400)mus.state.decisions.shift();
  copyHistory('musashi-action',{actor:u.id,action:p.id,kind:p.kind,score:+p.score.toFixed(2),target:targetId,before,after:schema(u)});
  return true;
 }catch(e){stats.planningErrors++;copyHistory('error',{message:String(e).slice(0,200)});return false;}
}
// 4.5: coordinated role ordering and a shared focus.
async function executeTeam(){
 if(!game||game.over)return;
 stats.rounds++;
 const team=all('enemy');const target=focus();targetId=target?.id||null;if(target)stats.teamFocus++;
 copyHistory('round-start',{target:targetId,enemy:team.map(tidy),observed:observed()});
 for(const u of team){
  u.ap=Math.max(0,Math.max(4,(u.maxAp||6)-(stamina(u)>=70?2:stamina(u)>=40?1:0))-(u.prepaidSummon||0));u.prepaidSummon=0;
  if(u.justSummoned){u.justSummoned=false;u.ap=0;}if(u.stun){u.stun=0;u.ap=0;}
 }
 const rank=(x)=>x===1?0:x===0?1:x===3?2:x===4?3:x===2?4:5;
 const actors=[...team].sort((a,b)=>rank(a.element)-rank(b.element));
 const chakraRestores=new Map();
 let total=0;
 for(const u of actors){
  let attempts=0;
  while(game&&!game.over&&u.hp>0&&u.ap>=2&&attempts++<7&&total++<42){
   let opts=[];
   try{opts=m37.stage(u,game.units.find(a=>a.id===targetId&&a.hp>0)||focus());
     if(u.isClone||u.isSummon){}else planTrap(u,target,opts);
     // Chakra recovery only when no available offense; at most twice per round (4 Chakra for 2 AP each).
     const closeTarget=all('ally').some(x=>dist(x,u)<=1);
     const affordableOffense=opts.some(p=>p.kind==='spell'&&['hit','line','blast','chain'].includes(techById[p.id]?.kind)||['quick','melee','heavy','jutsu','kunai','shuriken','senbon','poison','paper'].includes(p.id));
     if(!u.isClone&&!u.isSummon&&u.chakra<u.maxChakra-4&&u.chakra<Math.min(22,u.maxChakra*.33)&&u.ap>=2&&!affordableOffense&&!closeTarget&&(chakraRestores.get(u.id)||0)<2){
       opts.push({kind:'action',id:'meditate',cell:{c:u.c,r:u.r},score:u.chakra<10?29:22});
     }
     opts=opts.filter(p=>legal(u,p)).map(p=>({...p,score:tacticalScore(u,p,target,team)})).sort((a,b)=>b.score-a.score);
   }catch(e){stats.planningErrors++;copyHistory('planner-error',{message:String(e).slice(0,200)});break;}
   let moved=false;
   for(const p of opts.slice(0,8)){
     if(await action(u,p)){if(p.id==='meditate')chakraRestores.set(u.id,(chakraRestores.get(u.id)||0)+1);moved=true;break;}stats.failedActions++;
   }
   if(!moved)break;
  }
 }
 mus.state.last=`Мусаси 4.7: общая цель ${target?.name||'не выбрана'}, решений ${stats.decisions}, связок ${stats.teamCombos}`;
 copyHistory('round-end',{enemy:all('enemy').map(tidy),player:all('ally').map(tidy)});
 mus.refresh?.();drawReport();
}
// 4.6: bounded adaptation after battle, separated from current live decisions.
function finish(){
 if(!game?.over||recorded||mus.state.mode!=='musashi')return;
 recorded=true;
 const enemy=all('enemy').filter(x=>!x.isClone&&!x.isSummon).length,ally=all('ally').filter(x=>!x.isClone&&!x.isSummon).length;
 const result=enemy>0&&ally===0?'win':ally>0&&enemy===0?'loss':'draw';
 memory.matches++;if(result==='win')memory.wins++;if(result==='loss')memory.losses++;if(result==='draw')memory.draws++;
 const observedStyle=observed(),step=result==='loss'?.4:-.12;
 const adj={risk:observedStyle.rangedRatio>.5?step:.2*step,combo:step,feint:observedStyle.defensiveRatio>.3?step:step*.2,focus:step};
 for(const k of Object.keys(adj))memory.adapt[k]=Math.round(clamp(memory.adapt[k]+adj[k],-3,3)*100)/100;
 const entry={match:++battleNumber,result,round:game.round,style:observedStyle.suspected,decisions:stats.decisions,combos:stats.teamCombos,adapt:{...memory.adapt},trace:journal.slice(-120)};
 memory.lastBattles.unshift(entry);memory.lastBattles=memory.lastBattles.slice(0,12);save();
 copyHistory('match-final',{result,adapt:memory.adapt});drawReport();
}
const oldGame=window.newGame;
window.newGame=function(){recorded=false;targetId=null;journal.length=0;lastSeenAction=null;for(const k of Object.keys(stats))stats[k]=0;oldGame();drawReport();};
const oldCheck=window.checkEnd;
window.checkEnd=function(...args){const a=oldCheck(...args);if(game?.over)finish();return a;};
const oldRender=window.renderGame;
window.renderGame=function(){oldRender();if(game?.over)finish();};
// 4.7: public, honest turn trace (not deterministic movie playback).
document.querySelector('#musashi42-panel')?.setAttribute('hidden','');
const wrap=document.createElement('section');wrap.id='musashi47';wrap.style.cssText='background:#122720;color:#e4f0e6;padding:10px;border:1px solid #567760;border-radius:10px;margin-top:10px;font:12px system-ui';
wrap.innerHTML='<b>Мусаси 4.7 — наблюдения и журнал решений</b><div id="musashi47-current" style="padding:5px 0"></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button id="musashi47-copy" type="button">Выгрузить ход</button><button id="musashi47-history" type="button">Показать решения</button><button id="musashi47-reset" type="button">Очистить опыт</button></div><div id="musashi47-list" style="max-height:180px;overflow:auto;display:none;margin-top:8px"></div>';
(document.querySelector('#musashi42-panel')||document.querySelector('#musashi-hud'))?.after(wrap);
const oldPanel=document.querySelector('#musashi42-panel');if(oldPanel)oldPanel.style.display='none';
function drawReport(){
 const node=wrap.querySelector('#musashi47-current');if(!node)return;
 const o=observed(); node.textContent=`Боев в памяти: ${memory.matches}. Наблюдений: ${o.total}. Тактика: ${o.suspected}. Ходов ИИ: ${stats.rounds}, решений: ${stats.decisions}, подготовленных комбинаций: ${stats.teamCombos}.`;
 if(wrap.querySelector('#musashi47-list').style.display!=='none'){
  wrap.querySelector('#musashi47-list').textContent=journal.slice(-30).map(x=>`Ход ${x.round}: ${x.event} ${x.actor||''} ${x.action||''}`).join('\n');
  wrap.querySelector('#musashi47-list').style.whiteSpace='pre-line';
 }
}
wrap.querySelector('#musashi47-copy').onclick=()=>{
 const payload=JSON.stringify({schema:'musashi47-incident-log',exportedAt:new Date().toISOString(),stats,observations:observed(),adaptation:memory.adapt,currentTrace:journal,lastBattles:memory.lastBattles.map(x=>({...x,trace:x.trace.slice(-30)}))},null,2);
 const blob=new Blob([payload],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Мусаси_4.7_журнал.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
wrap.querySelector('#musashi47-history').onclick=()=>{const el=wrap.querySelector('#musashi47-list');el.style.display=el.style.display==='none'?'block':'none';drawReport();};
wrap.querySelector('#musashi47-reset').onclick=()=>{memory=fresh();save();drawReport();};
const oldDispatcher=mus.runEnemyPhase;
mus.runEnemyPhase=async function(){if(mus.state.mode==='musashi')await executeTeam();else await m37.runTeam();};
window.__musashi47={runTeam:executeTeam,legal,threat,focus,tacticalScore,observed,finish,reset:()=>{memory=fresh();save();drawReport();},get memory(){return memory;},get journal(){return [...journal];},get stats(){return {...stats};},get lastSeenAction(){return lastSeenAction;},get previousDispatch(){return oldDispatcher;}};
drawReport();
})();

