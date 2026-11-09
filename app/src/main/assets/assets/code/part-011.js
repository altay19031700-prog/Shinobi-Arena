
/* SHINOBI ARENA 4.2 - Musashi tactical memory, two-stage planning,
 * cooperative elemental sequencing, constrained adaptation and battle reports.
 * Offline deterministic planner, NOT a trained neural net; no stat cheating.
 */
(function(){
'use strict';
const mus=window.__musashi, prior=window.__musashi37;
if(!mus||!prior)return;
const KEY='shinobi-musashi-42-v1';
const LIMIT=400;
const ELEMENT=['Огонь','Вода','Ветер','Молния','Земля'];
const defaultData=()=>({version:1,games:0,wins:0,losses:0,draws:0,actions:{},elements:[0,0,0,0,0],statuses:{wet:0,burn:0},choices:{},learning:{caution:0,focus:0,combo:0},battles:[]});
let data=defaultData();
let matchRecorded=false;
let activeStats={planCount:0,observations:0,comboPlans:0,blockedPlans:0,errors:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&x.version===1&&Array.isArray(x.battles)&&x.elements?.length===5){data={...defaultData(),...x};}}catch(e){data=defaultData();}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch(e){return false}}
load();
function recordPlayer(id,element,action,cell){
 if(!game||game.over||!id||mus.state.mode!=='musashi')return;
 data.actions[action]=(data.actions[action]||0)+1;
 if(Number.isInteger(element)&&element>=0&&element<5)data.elements[element]++;
 if(cell&&Number.isFinite(cell.c)&&Number.isFinite(cell.r)){
   const allied=game.units.filter(x=>x.team==='ally'&&x.hp>0);
   if(allied.length>0){const distx=allied.reduce((v,u)=>v+Math.abs(u.c-cell.c)+Math.abs(u.r-cell.r),0)/allied.length;
     if(distx>5)data.actions.longRange=(data.actions.longRange||0)+1;}
 }
 activeStats.observations++;
 // Persist batched observations locally. No network calls.
 if(activeStats.observations%10===0)save();
}
const oldExecute=window.execute;
window.execute=function(u,action,cell){
 const ally=u?.team==='ally';const wasAp=u?.ap||0;
 const ok=oldExecute(u,action,cell);
 if(ally&&ok&&(u.ap<wasAp||action==='move'))recordPlayer(u.id,u.element,action,cell);
 return ok;
};
if(window.arena30?.cast){const oldCast=window.arena30.cast;
 window.arena30.cast=(u,id,cell)=>{const ally=u?.team==='ally';const ok=oldCast(u,id,cell);
 if(ok&&ally)recordPlayer(u.id,u.element,'tech:'+id,cell);return ok;};}
function playerStyle(){
 const x=data.actions;const sums=Object.values(x).reduce((s,n)=>s+(Number.isFinite(n)?n:0),0)||1;
 const spells=Object.keys(x).filter(k=>k.startsWith('tech:')).reduce((v,k)=>v+x[k],0);
 const close=(x.melee||0)+(x.quick||0)+(x.heavy||0)+(x.trip||0)+(x.stunHit||0);
 const retreat=(x.move||0)+(x.guard||0)+(x.smoke||0);
 const most=data.elements.indexOf(Math.max(...data.elements));
 const signature=(spells/sums>.35?'дзюцу':close/sums>.36?'ближний бой':retreat/sums>.35?'манёвр/защита':'смешанный бой');
 return {spells,close,retreat,most,signature,wet:!!x['tech:water1']||!!x['tech:water2'],light:!!x['tech:light1']||!!x['tech:light2']};
}
function assess(u,p,focus,team){
 // Two-stage heuristic: direct action + future team follow-up, with resource penalties.
 // Lookahead is approximate and never grants future AP, chakra or items.
 let score=p.score;
 const style=playerStyle();
 const target=game.units.find(x=>x.hp>0&&x.id===focus?.id)||focus;
 const cost=p.kind==='spell'?(window.__arena18?.TECHS||[]).find(x=>x.id===p.id)?.ch||9:0;
 if(p.kind==='spell'){
   score-=cost/(Math.max(1,u.chakra))*5;
   if(u.chakra-cost<8)score-=4;
 }
 if(p.kind==='move'){
   const neighbours=game.units.filter(t=>t.team==='ally'&&t.hp>0&&dist(p.cell,t)===1).length;
   score-=neighbours*(u.hp/u.maxHp<.5?10:4);
   if(target&&dist(p.cell,target)>dist(u,target))score-=4;
   const support=team.filter(t=>t.id!==u.id&&t.hp>0&&dist(p.cell,t)<=2).length;
   score+=Math.min(support,2)*2;
   if(style.spells>style.close)score-=Math.max(0,neighbours-1)*3;
 }
 if(p.kind==='spell'||p.id==='jutsu'){
   const water=u.element===1,fire=u.element===0;
   const follow=team.some(a=>a.hp>0&&a.id!==u.id&&a.chakra>=10&&a.ap>=4&&target&&dist(a,target)<=5&&((water&&(a.element===3||a.element===4))||(fire&&a.element===2)));
   if(follow&&target&&!target.wet&&water){score+=9;activeStats.comboPlans++;}
   if(follow&&target&&!target.burn&&fire){score+=8;activeStats.comboPlans++;}
   if(target?.wet&&(u.element===3||u.element===4))score+=11;
   if(target?.burn&&u.element===2)score+=9;
 }
 if(p.id==='bandage'&&u.hp/u.maxHp<.44)score+=8;
 if(p.id==='guard'||p.id==='shield')score+=(style.close>style.spells?5:3)+(data.learning.caution||0);
 if(p.id==='smoke'&&style.spells>style.close)score+=6;
 if(p.id==='potion'&&u.chakra<18)score+=5;
 if(p.id==='paper'&&game.units.filter(v=>v.hp>0&&v.team==='enemy'&&dist(v,p.cell)<=2).length>1)score-=20;
 const k=p.kind==='move'?'position':p.kind==='spell'?'combo':'focus';
 score+=(data.learning[k]||0);
 return score;
}
function focusTarget(units){
 const opponents=game.units.filter(x=>x.team==='ally'&&x.hp>0&&visibleToSide('enemy',x)&&!x.isSummon&&!window.__arena541?.knownCopy('enemy',x));
 if(!opponents.length)return null;
 const profile=playerStyle();
 return opponents.map(t=>{const urgency=units.reduce((v,u)=>v+(u.hp>0?50-3*dist(u,t):0),0);
   const seen=window.__arena541?.seenStats('enemy',t)||t;const low=1-seen.hp/Math.max(1,seen.maxHp);const exposure=units.filter(u=>u.hp>0&&dist(u,t)<=4).length;
   return {t,score:urgency+low*42+exposure*8+(t.wet?8:0)+(t.burn?5:0)+(profile.spells>profile.close&&seen.chakra>14?9:0)-(t.guard?8:0)};
 }).sort((a,b)=>b.score-a.score)[0].t;
}
async function settle(){let n=0;while(game&&(game.animating||window.arena30?.isPreparing)&&n++<110){await new Promise(r=>setTimeout(r,60));}
 await waitFx();}
async function perform(u,p){
 if(!game||game.over||!u||u.hp<=0||u.ap<2)return false;
 const before={ap:u.ap,ch:u.chakra,c:u.c,r:u.r};
 try{
  if(p.kind==='move'){
   const path=pathTo(u,p.cell.c,p.cell.r);
   if(!path?.length)return false;
   moveUnit(u,path,Math.min(path.length,Math.floor(u.ap/(u.slow?2:1))));
   await settle();return u.ap<before.ap;
  }
  if(p.kind==='spell'){
   if(!window.arena30?.cast)return false;
   const ok=window.arena30.cast(u,p.id,p.cell);if(!ok)return false;
   await settle();return u.ap<before.ap||u.chakra<before.ch;
  }
  const ok=execute(u,p.id,{c:p.cell.c,r:p.cell.r});if(!ok)return false;
  await settle();return u.ap<before.ap||u.chakra<before.ch;
 }catch(e){activeStats.errors++;console.error('Мусаси 4.2: ошибка решения',e);return false;}
}
const metrics={rounds:0,actions:0,combos:0,steps:0,casts:0,guards:0,failures:0};
async function executeTeam(){
 metrics.rounds++;
 const units=game.units.filter(u=>u.hp>0&&u.team==='enemy');
 for(const u of units){u.ap=Math.max(0,Math.max(4,(u.maxAp||6)-(u.fatigue>=70?2:u.fatigue>=40?1:0))-(u.prepaidSummon||0));u.prepaidSummon=0;
  if(u.justSummoned){u.justSummoned=false;u.ap=0;}if(u.stun){u.stun=0;u.ap=0;}}
 const actors=units.filter(u=>u.hp>0).sort((a,b)=>{
  const rank=e=>e===1?0:e===0?1:e===3?2:e===2?3:e===4?4:5;
  return rank(a.element)-rank(b.element);
 });
 let count=0;
 for(const u of actors){let tries=0;
  while(game&&!game.over&&u.hp>0&&u.ap>=2&&tries++<6&&count++<34){
   const target=focusTarget(units);
   let candidate=prior.stage(u,target);
   if(!candidate.length)break;
   candidate=candidate.map(p=>({...p,projected:assess(u,p,target,units)})).sort((a,b)=>b.projected-a.projected);
   let done=false;
   for(const p of candidate.slice(0,6)){
    if(await perform(u,p)){
     metrics.actions++;
     if(p.kind==='move')metrics.steps++;
     if(p.kind==='spell')metrics.casts++;
     if(p.id==='guard'||p.id==='shield')metrics.guards++;
     const usedStatus=target&&(target.wet&&(u.element===3||u.element===4)||target.burn&&u.element===2);
     if(usedStatus&&(p.kind==='spell'||p.id==='jutsu'))metrics.combos++;
     mus.state.decisions.push({round:game.round,actor:u.id,type:p.kind,action:p.id,score:Math.round(p.projected),target:target?.id});
     if(mus.state.decisions.length>LIMIT)mus.state.decisions.splice(0,mus.state.decisions.length-LIMIT);
     mus.state.last=`Отряд: ${target?.name||'поиск угроз'} · ${u.name}: ${p.id}, оценка ${Math.round(p.projected)}`;
     mus.refresh?.();showInfo();done=true;break;
    }else metrics.failures++;
   }
   if(!done)break;
  }
 }
 mus.refresh?.();showInfo();
}
// Tactical memory is battle-to-battle, not arbitrary recalibration on the same fight.
function finalize(){
 if(matchRecorded||!game?.over||mus.state.mode!=='musashi')return;
 matchRecorded=true;
 const enemy=game.units.filter(u=>u.team==='enemy'&&!u.isClone&&!u.isSummon&&u.hp>0).length;
 const ally=game.units.filter(u=>u.team==='ally'&&!u.isClone&&!u.isSummon&&u.hp>0).length;
 const result=enemy>0&&ally===0?'win':ally>0&&enemy===0?'loss':'draw';
 data.games++;
 if(result==='win')data.wins++;if(result==='loss')data.losses++;if(result==='draw')data.draws++;
 const phase=playerStyle();
 const steps={focus:result==='loss'?.5:-.1,combo:result==='loss'?.5:-.1,caution:result==='loss'?.35:-.1};
 for(const k of Object.keys(steps))data.learning[k]=Math.round(clamp((data.learning[k]||0)+steps[k],-3,3)*100)/100;
 const summary={game:data.games,result,round:game.round,style:phase.signature,actions:metrics.actions,combos:metrics.combos,chakraLeft:game.units.filter(u=>u.team==='enemy'&&u.hp>0).reduce((s,u)=>s+(u.chakra||0),0),weights:{...data.learning}};
 data.battles.unshift(summary);data.battles=data.battles.slice(0,40);save();showInfo();
}
const prevNewGame=window.newGame;
window.newGame=function(){matchRecorded=false;activeStats={planCount:0,observations:0,comboPlans:0,blockedPlans:0,errors:0};
 for(const k of Object.keys(metrics))metrics[k]=0;
 prevNewGame();showInfo();};
const prevRender=window.renderGame;
window.renderGame=function(){prevRender();if(game?.over)finalize();};
const prevCheckEnd=window.checkEnd;
window.checkEnd=function(...args){const result=prevCheckEnd(...args);if(game?.over)finalize();return result;};
mus.runEnemyPhase=async function(){if(mus.state.mode==='musashi')await executeTeam();else await prior.runTeam();};
// Compact user-facing journal with explicit stored-game count and no unsupported learning claims.
const panel=document.createElement('section');panel.id='musashi42-panel';
panel.style.cssText='border:1px solid #557769;border-radius:9px;padding:10px;margin:7px 0;background:#162b27;color:#e1eae2;font-size:12px';
panel.innerHTML='<b>Мусаси 4.2 · память и командная тактика</b><div id="musashi42-observed"></div><div id="musashi42-plan"></div><div id="musashi42-log" style="max-height:112px;overflow:auto"></div><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"><button type="button" id="musashi42-export">Журнал боя</button><button type="button" id="musashi42-reset">Очистить память</button></div>';
document.querySelector('#arenaScreen .boardpanel')?.querySelector('#musashi-hud')?.after(panel);
function showInfo(){
 const a=panel.querySelector('#musashi42-observed'),b=panel.querySelector('#musashi42-plan'),c=panel.querySelector('#musashi42-log');if(!a)return;
 const profile=playerStyle();a.textContent=`Изучено боёв: ${data.games}; побед/поражений: ${data.wins}/${data.losses}; стиль игрока: ${profile.signature}`;
 b.textContent=`Решений: ${metrics.actions}, подготовленных связок: ${activeStats.comboPlans}, атак по подготовленным целям: ${metrics.combos}`;
 c.textContent=data.battles.slice(0,3).map(x=>`№${x.game} · ${x.result==='win'?'победа':x.result==='loss'?'поражение':'ничья'} · ${x.round} раундов · ${x.style}`).join(' | ');
}
panel.querySelector('#musashi42-export').onclick=()=>{
 const text=['МУСАСИ 4.2 — ЛОКАЛЬНЫЙ ЖУРНАЛ',JSON.stringify({summary:{games:data.games,wins:data.wins,losses:data.losses,draws:data.draws},playerProfile:playerStyle(),currentMetrics:metrics,battles:data.battles,decisions:mus.state.decisions.slice(-60)},null,2)].join('\n');
 const blob=new Blob([text],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='Мусаси_журнал_боёв.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
panel.querySelector('#musashi42-reset').onclick=()=>{data=defaultData();save();showInfo();};
showInfo();
window.__musashi42={get memory(){return data},get metrics(){return {...metrics}},get diagnostics(){return {...activeStats}},get playerStyle(){return playerStyle()},focusTarget,assess,runTeam:executeTeam,finalize,reset:()=>{data=defaultData();save();showInfo()}};
})();

