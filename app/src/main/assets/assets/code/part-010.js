/* MUSASHI 3.7 — team planning, finite resources, elemental combinations.
   Uses the actual arena's hitChance, pathTo, execute, arena30.cast.
   No machine-learning model: tactic priorities calibrated in independent tournament simulation. */
(function(){
'use strict';
const old = window.__musashi;
if(!old) return;
const st = old.state;
const T = window.__arena18?.TECHS || [];
const TECH=Object.fromEntries(T.map(x=>[x.id,x]));
const ACTION={quick:2,melee:3,heavy:5,trip:4,stunHit:4,sword:4,kunai:3,shuriken:3,senbon:3,poison:3,guard:2,smoke:3,flash:4,paper:5,poisonBomb:4,bandage:3,potion:3,trap:3,toxin:2};
const WEIGHTS={focus:13,combo:16,kill:16,position:4,cover:7,reserve:4,health:19,material:4};
const performance={attacks:0,spells:0,combos:0,summons:0,items:0,heals:0,moves:0,guard:0,fail:0};
const label={light:'Молния',water:'Вода',wind:'Ветер',fire:'Огонь',earth:'Земля'};
function clampX(n,a,b){return Math.min(b,Math.max(a,n));}
function enemies(u){return game.units.filter(x=>x.hp>0&&x.team!==u.team&&visibleToSide(u.team,x));}
function friends(u){return game.units.filter(x=>x.hp>0&&x.team===u.team);}
function coreTargets(u){return enemies(u).filter(x=>!x.isSummon&&!window.__arena541?.knownCopy(u.team,x));}
function actionOK(u,id){return u.ap>= (ACTION[id]||4);}
function cdist(a,b){return dist(a,b);}
function canHit(u,t,r=4){return cdist(u,t)<=r&&cdist(u,t)>0&&canAim(u,t);}
function area(x,r){return aoeCells({c:x.c,r:x.r},r);}
function areaScore(u,cell,damage,includeFriends){let s=0;for(const a of game.units){if(a.hp<=0||cdist(a,cell)>2)continue;const n=cdist(a,cell),expected=damage*(n===0?1:n===1?.65:.35);s+=(a.team!==u.team?1:-includeFriends)*Math.min(a.hp,expected); }return s;}
function statusScore(t,elem){if(elem===1)return (!t.wet?7:1)+(t.burn?5:0);if(elem===3)return (t.wet?WEIGHTS.combo:0)+(t.stun?0:4);if(elem===2)return t.burn?WEIGHTS.combo-2:1;if(elem===4)return t.wet?WEIGHTS.combo-4:2;if(elem===0)return t.burn?1:5;return 0;}
function teamFollowUp(u,t){const allies=friends(u).filter(v=>v.id!==u.id&&!v.isSummon&&!v.isClone&&v.ap>=4&&v.chakra>=7&&cdist(v,t)<=5);
 let n=0;for(const a of allies){if(u.element===1&&a.element===3)n=Math.max(n,WEIGHTS.combo);if(u.element===0&&a.element===2)n=Math.max(n,WEIGHTS.combo-2);if(u.element===1&&a.element===4)n=Math.max(n,WEIGHTS.combo-4);}return n;}
function scoreVictim(u,t){const visible=window.__arena541?.seenStats(u.team,t)||t;const ratio=visible.hp/Math.max(1,visible.maxHp);const d=cdist(u,t);const teamPressure=friends(u).filter(a=>a.id!==u.id&&a.ap>=3&&cdist(a,t)<=5).length;
 return 50+(1-ratio)*16+(t.stun?9:0)+(t.prone?6:0)+(t.wet?2:0)+(t.burn?4:0)+teamPressure*WEIGHTS.focus/3-(t.guard?7:0)-d*3-(window.__arena541?.knownCopy(u.team,t)?19:0)-(t.isSummon?10:0);}
function chooseFocus(u){const candidate=coreTargets(u).length?coreTargets(u):enemies(u);return candidate.sort((a,b)=>scoreVictim(u,b)-scoreVictim(u,a))[0]||null;}
function stage(u,focus){let opts=[];
 const add=(kind,id,cell,score,more={})=>{if(Number.isFinite(score))opts.push({kind,id,cell,score,...more});};
 const foe=enemies(u).sort((a,b)=>scoreVictim(u,b)-scoreVictim(u,a));
 const low=u.hp/Math.max(1,u.maxHp);const nextCore=focus||foe[0];
 const chalk=u.chakra/Math.max(1,u.maxChakra);
 if(!u.isSummon&&!u.isClone){
   if(actionOK(u,'potion')&&u.gear?.potion>0&&u.chakra<=u.maxChakra-12&&chalk<.52)add('item','potion',u,16+(1-chalk)*12);
   if(actionOK(u,'bandage')&&u.gear?.bandage>0){for(const t of friends(u).filter(v=>cdist(u,v)<=1&&v.hp<v.maxHp-14)){
    add('item','bandage',t,7+Math.min(18,t.maxHp-t.hp)*1.1+(t.hp/t.maxHp<.4?8:0));}}
   if(actionOK(u,'guard')&&low<.45)add('action','guard',u,7+(1-low)*10);
   if(actionOK(u,'toxin')&&u.gear?.toxin>0&&foe.some(t=>cdist(u,t)<=2))add('item','toxin',u,7);
   if(actionOK(u,'paper')&&u.gear?.paper>0){for(const t of foe.filter(t=>cdist(u,t)<=4&&lineClear(u,t))){let s=areaScore(u,t,20,2.2);if(s>11)add('item','paper',t,24+s*.8+(t.id===focus?.id?4:0));}}
   if(actionOK(u,'poisonBomb')&&u.gear?.poisonBomb>0){for(const t of foe.filter(t=>cdist(u,t)<=4)){const hostile=foe.filter(v=>cdist(v,t)<=2&&!v.poison).length, friendly=friends(u).filter(v=>cdist(v,t)<=2).length;if(hostile>0&&hostile*2>friendly*3)add('item','poisonBomb',t,28+hostile*12-friendly*16);}}
   if(actionOK(u,'flash')&&u.gear?.flash>0){for(const t of foe.filter(t=>cdist(u,t)<=4)){const s=areaScore(u,t,10,2);if(s>0&&!t.blur)add('item','flash',t,21+s*.65);}}
   if(actionOK(u,'smoke')&&u.gear?.smoke>0&&low<.5&&foe.some(x=>canHit(x,u,4)))add('item','smoke',u,21+(1-low)*10);
 }
 for(const t of foe){const d=cdist(u,t);const focusBonus=t.id===focus?.id?WEIGHTS.focus:0;const nearDead=t.hp<20?WEIGHTS.kill:0;
   if(d===1){for(const [id,base,modifier] of [['quick',9,9],['melee',12,0],['heavy',18,-15],['trip',9,3],['stunHit',10,1],['sword',16,0]]){
    if(!actionOK(u,id)||(id==='sword'&&!u.gear?.sword))continue;
    const chance=clampX(hitChance(u,t,id==='sword'?'sword':'melee',modifier)/100,.05,.95);
    const utility=(chance*(base+(id==='trip'&&!t.prone?6:0)+(id==='stunHit'&&!t.stun?7:0)))*2.8/(ACTION[id]+1);
    add('action',id,t,7+utility+focusBonus+nearDead*(t.hp<=base?1:0));
   }}
   for(const [id,range,damage] of [['kunai',4,11],['shuriken',4,8],['senbon',5,7],['poison',4,7]]){
    if(!actionOK(u,id)||!u.gear?.[id]||!canHit(u,t,range))continue;
    const chance=clampX(hitChance(u,t,'throw')/100,.05,.95);
    add('action',id,t,6+chance*(damage+(id==='poison'&&!t.poison?10:0))*2.3/(ACTION[id]+1)+focusBonus+nearDead*(t.hp<=damage?1:0)-(id!=='kunai'?WEIGHTS.material*.4:0));
   }
   if(!u.isSummon&&!u.isClone&&actionOK(u,'guard')&&u.chakra>=9&&canHit(u,t,4)){const cost=Math.max(4,9-Math.floor((u.skills.control||0)/35));if(u.chakra>=cost){
     const specialized=(u.learned||[]).some(id=>TECH[id]?.element===u.element&&['hit','blast','line','chain'].includes(TECH[id].kind));
     add('action','jutsu',t,12+15*hitChance(u,t,'jutsu')/100+focusBonus+statusScore(t,u.element)+teamFollowUp(u,t)-(u.chakra<cost+12?WEIGHTS.reserve:0)-(specialized?13:0));}}
   if(!u.isSummon&&!u.isClone&&u.learned&&u.chakra>0){for(const id of u.learned){const tech=TECH[id];if(!tech||tech.element!==null&&tech.element!==u.element||!['hit','blast','chain','line'].includes(tech.kind)||u.ap<tech.ap||u.chakra<tech.ch||!canHit(u,t,tech.range))continue;
      const cost=tech.ch/Math.max(1,u.chakra);
      const blast=tech.kind==='blast'?areaScore(u,t,tech.power,1.8)*.65:0;
      add('spell',id,t,15+tech.power*.53+focusBonus+statusScore(t,u.element)+teamFollowUp(u,t)+blast-cost*WEIGHTS.reserve-(tech.ap-4)*2+nearDead*(tech.power>=t.hp?1:0));
    }}
 }
 if(!u.isSummon&&!u.isClone&&u.learned){
  if(low<.70&&u.ap>=3&&u.chakra>=11&&u.learned.includes('shield')&&!u.barrier)add('spell','shield',u,13+(1-low)*19);
  if(low<.40&&u.ap>=3&&u.chakra>=13&&u.learned.includes('replace')&&!u.substitute)add('spell','replace',u,17+(1-low)*18);
  if(u.ap>=3&&u.chakra>=9&&u.learned.includes('decoy')&&low<.65&&!friends(u).some(v=>v.isClone&&v.cloneKind==='illusion')){
   const spot=neigh(u.c,u.r).filter(p=>!obstacle(p.c,p.r)&&!unitAt(p.c,p.r))[0];if(spot)add('spell','decoy',spot,13+(1-low)*10);
  }
  // Real summon, no arbitrary unit count; capacity comes from chakra and open cells.
  if(game.round<=4&&u.ap>=5&&chalk>.46&&friends(u).filter(x=>x.isSummon).length<2){
   const id=['summonHound','summonSnake','summonWolf'].find(id=>u.learned.includes(id)&&TECH[id]&&u.chakra>=TECH[id].ch&&u.ap>=TECH[id].ap);
   if(id){const free=neigh(u.c,u.r).filter(p=>!obstacle(p.c,p.r)&&!unitAt(p.c,p.r));if(free.length)add('spell',id,free[0],16+game.round*.25);}
  }
 }
 // If adjacent, attacking is better than walking. Search for reachable flanks and team support.
 const free=game.units.some(v=>v.hp>0&&v.team!==u.team);
 if(free&&u.ap>=2){let bestMove=null;const preferred=focus||foe[0];const base=preferred?cdist(u,preferred):7;
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){
  if(obstacle(c,r)||unitAt(c,r)||c===u.c&&r===u.r)continue;
  const p=pathTo(u,c,r);if(!p||p.length===0||p.length>Math.min(5,Math.floor(u.ap/(u.slow?2:1))))continue;
  let pos={c,r},dd=preferred?cdist(pos,preferred):8;
  let support=friends(u).filter(v=>v.id!==u.id&&cdist(v,pos)<=2).length;
  let threat=foe.filter(t=>cdist(t,pos)===1).length;
  let cost=p.length*(u.slow?2:1),reserve=u.ap-cost;
  let desirability=14+(base-dd)*WEIGHTS.position+Math.min(2,support)*2-(threat>1?5:0)-(cost*.75)+(reserve>=3?3:0);
  if(dd===1&&reserve>=2)desirability+=7;
  if(dd>=2&&dd<=4&&reserve>=3&&lineClear(pos,preferred))desirability+=5;
  if(dd>base)desirability-=12;
  if(!bestMove||desirability>bestMove.score)bestMove={kind:'move',id:'move',cell:pos,score:desirability};
 }
 if(bestMove&&bestMove.score>11)add('move','move',bestMove.cell,bestMove.score);
 }
 opts.push(...(window.__genjutsu?.options(u)||[]));
 return opts.filter(p=>!window.__genjutsu||window.__genjutsu.actionAllowed(u,p.kind==='move'?'move':p.kind==='spell'?'tech:'+p.id:p.id)).sort((a,b)=>b.score-a.score);
}
async function waitAnimations(){let loops=0;while((game?.animating||window.arena30?.isPreparing)&&loops++<65){await new Promise(r=>setTimeout(r,75));}await waitFx();}
async function act(u,p){if(!game||game.over||u.hp<=0||!p)return false;let beforeAp=u.ap,beforeCh=u.chakra;
 try{
  if(p.kind==='move'){const path=pathTo(u,p.cell.c,p.cell.r);if(!path?.length)return false;moveUnit(u,path,Math.min(path.length,Math.floor(u.ap/(u.slow?2:1))));if(u.ap<beforeAp){performance.moves++;await waitAnimations();return true;}return false;}
  if(p.kind==='spell'){if(!window.arena30?.cast)return false;const yes=window.arena30.cast(u,p.id,p.cell);if(!yes)return false;await waitAnimations();if(u.ap>=beforeAp&&u.chakra>=beforeCh)return false;performance.spells++;if(p.id.startsWith('summon'))performance.summons++;const target=enemies(u).find(t=>t.id===p.targetId);if(target?.wet&&u.element===3||target?.burn&&u.element===2)performance.combos++;return true;}
  const ok=execute(u,p.id,{c:p.cell.c,r:p.cell.r});if(ok){await waitAnimations();if(u.ap>=beforeAp)return false;if(['potion','bandage','paper','flash','smoke','poisonBomb','toxin','trap'].includes(p.id)){performance.items++;if(p.id==='bandage')performance.heals++;}else if(p.id==='guard')performance.guard++;else performance.attacks++;return true;}
 }catch(err){performance.fail++;console.warn('Musashi 3.7 action error',err);}
 return false;
}
let collectiveFocusId=null;
function chooseOrder(u){const focus=game.units.find(x=>x.hp>0&&x.id===collectiveFocusId)||chooseFocus(u);st.last=focus?`План отряда: концентрировать огонь по ${focus.name}, использовать статусы и ресурсы.`:'Поиск угроз.';old.refresh();return focus;}
async function runTeam(){st.runs++;collectiveFocusId=null;const units=game.units.filter(u=>u.hp>0&&u.team==='enemy');
 // Support units do not gain AP or chakra for free.
 for(const u of units){if(game.over)break;u.ap=Math.max(0,Math.max(4,(u.maxAp||6)-((u.fatigue||0)>=70?2:(u.fatigue||0)>=40?1:0))-(u.prepaidSummon||0));u.prepaidSummon=0;
   if(u.justSummoned){u.justSummoned=false;u.ap=0;continue;}if(u.stun){u.stun=0;u.ap=0;continue;}}
 // Shared focus target: identify one fragile core threat before the turn.
 const leaders=units.filter(u=>!u.isClone&&!u.isSummon);
 if(leaders.length){const targets=game.units.filter(u=>u.team==='ally'&&u.hp>0&&!u.isSummon&&!window.__arena541?.knownCopy('enemy',u));
   if(targets.length){const best=targets.map(t=>({t,score:leaders.reduce((s,u)=>s+scoreVictim(u,t)+(u.element===3&&t.wet?8:0)+(u.element===2&&t.burn?7:0),0)})).sort((a,b)=>b.score-a.score)[0];collectiveFocusId=best.t.id;}}
 // Water/fire setup first, lightning/wind/earth follow second: share status targets.
 const actors=units.filter(u=>u.hp>0).sort((a,b)=>{
  const first=e=>e===1?0:e===0?1:e===3?2:e===2?3:e===4?4:5;
  return first(a.element)-first(b.element);
 });
 let times=0;
 for(const u of actors){let turns=0;while(game&&!game.over&&u.hp>0&&u.ap>=2&&turns++<8&&times++<48){const p=stage(u,chooseOrder(u));let success=false;
   for(const q of p.slice(0,7)){if(await act(u,q)){success=true;st.decisions.push({round:game.round,actor:u.id,type:q.kind,action:q.id,score:Math.round(q.score)});break;}}
   if(!success)break;
  }}
 old.refresh();
}
const oldGame=window.newGame;
window.newGame=function(){oldGame();if(game){
 // 8 equipment slots per enemy; applies to both AI modes, no artificial ammunition.
 for(const u of game.units.filter(x=>x.team==='enemy'&&!x.isClone&&!x.isSummon)){
  u.gear={...u.gear,kunai:1,shuriken:1,senbon:0,smoke:1,paper:1,flash:1,poisonBomb:1,bandage:1,potion:1,poison:0,toxin:0,trap:0,sword:0};
 }
 }};
old.runEnemyPhase=runTeam;
old.enumerate=(u)=>stage(u,chooseFocus(u));
old.advanced={stage,chooseFocus,performance,weights:WEIGHTS};
const panel=document.getElementById('musashi-hud');if(panel){const extra=document.createElement('div');extra.id='musashi-plan-note';extra.style.marginTop='5px';extra.style.color='#b7d7c7';extra.textContent='Планирует работу отряда, расход чакры и инвентаря, элементальные комбинации.';panel.append(extra);}
window.__musashi37={performance,stage,weights:WEIGHTS,runTeam};
})();
