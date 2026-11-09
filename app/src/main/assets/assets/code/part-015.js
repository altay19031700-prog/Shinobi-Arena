
(()=>{
 'use strict';
 const ranged={move:0,melee:1,sword:1,quick:1,heavy:1,stunHit:1,trip:1,kunai:4,shuriken:4,senbon:5,poison:4,jutsu:4,illusion:3,smoke:4,paper:4,flash:4,poisonBomb:4,trap:1,bandage:1,guard:0,toxin:0,potion:0};
 const explosive={smoke:2,paper:2,flash:2,poisonBomb:2};
 const techList=()=>window.__arena18?.TECHS||[];
 function tech(action){return typeof action==='string'&&action.startsWith('tech:')?techList().find(t=>t.id===action.slice(5)):null;}
 function range(action){if(action==='move')return -1;const t=tech(action);if(t)return t.range;return Number(ranged[action]??0);}
 function area(action){const t=tech(action);return t?.kind==='blast'||t?.kind==='weaponAttack'||t?.kind==='chain'?1:Number(explosive[action]??0);}
 function owner(u){return u?.isClone?game?.units.find(v=>v.id===u.cloneOwner):u;}
 function groupExists(u){const origin=owner(u);return Boolean(game?.units?.some(v=>v.isClone&&v.cloneOwner===origin?.id&&v.hp>0));}
 function knownCopy(observer,u){if(!u?.isClone)return false;if(observer===u.team)return true;
  const original=owner(u);return !!(u.__cloneRecognized||original?.__cloneRevealed);}
 function seenStats(observer,u){if(!u)return null;const hidden=u.isClone&&observer!==u.team&&!knownCopy(observer,u)&&groupExists(u),v=hidden?owner(u):u;
  return {hp:v?.hp??u.hp,maxHp:v?.maxHp??u.maxHp,chakra:v?.chakra??u.chakra,guard:v?.guard??u.guard,stun:v?.stun??u.stun};}
 function label(u){if(!u?.isClone)return u?.name?.replace('Шиноби ','№')||'';if(u.team==='enemy'&&!knownCopy('ally',u))return owner(u)?.name?.replace('Шиноби ','№')||'Противник';
  return u.cloneKind==='illusion'?'Иллюзия':u.cloneKind==='shadow'?'Теневой клон':'Стих. клон';}
 // A clone's owner remains hidden while it has copies. Only overt attacks/spells reveal them.
 function expose(u,action){if(!u||u.isClone||!groupExists(u))return;
   // Offensive techniques are NOT proof of identity when any physical clone is active.
   if(game.units.some(x=>x.isClone&&x.hp>0&&x.cloneOwner===u.id&&x.cloneKind!=='illusion'))return;
   if(['move','guard','toxin','potion','bandage','smoke','flash','paper','poisonBomb','trap'].includes(action)||action.startsWith('tech:decoy')||action.startsWith('tech:shadow')||action.startsWith('tech:elementClone')||action.startsWith('tech:shield')||action.startsWith('tech:replace'))return;
   u.__cloneRevealed=true;
 }
 const prevExecute=window.execute;
 window.execute=function(u,action,cell){const ap=u?.ap,r=prevExecute(u,action,cell);if(r&&u?.ap<ap)expose(u,action||'');return r;};
 if(window.arena30?.cast){const prevCast=window.arena30.cast;window.arena30.cast=(u,id,cell)=>{const r=prevCast(u,id,cell);
   // The animation may defer the actual cast, so reveal on its successful start only for offensive spells.
   if(r)expose(u,'tech:'+id);return r;};}
 const hud=document.createElement('div');hud.id='arena541-rangehud';hud.setAttribute('role','status');hud.setAttribute('aria-live','polite');
 const board=document.querySelector('#arenaScreen .boardpanel');const slot=board?.querySelector('.boardwrap');if(slot)slot.before(hud);else board?.append(hud);
 function summary(action){const t=tech(action);if(action==='move')return 'Ходьба: доступные гексы подсвечены по ОД';
   const r=range(action),radius=area(action);const title=t?.name||ACTIONS.find(a=>a.id===action)?.name||action;
   return `${title} · ${r===0?'на себе / без броска':`дальность ${r} ${r===1?'гекс':'гексов'}`}${radius?' · радиус '+radius:''}`;}
 function updateHud(){if(!game||!hud)return;const u=me();if(!u)return;
  const action=game.action,hover=game.hoverCell,d=hover?dist(u,hover):null,r=range(action),t=tech(action);
  const aimed=['kunai','shuriken','senbon','poison','jutsu','illusion'].includes(action)||['hit','blast','chain','line','weaponAttack'].includes(t?.kind);
  const target=hover?unitAt(hover.c,hover.r):null;
  const obscured=!!(hover&&aimed&&smokeBlocksAim(u,hover));
  const valid=!hover||action==='move'?null:d<=r&& (r===0||d>0)&&!obscured;
  let extra=d===null?' · Наведи на гекс':` · до клетки ${d} ${obscured?'✕ дым закрывает прицел':valid?'✓':'✕ вне дальности'}`;
  if(d!==null&&valid&&d>0&&['kunai','shuriken','senbon','poison','jutsu','illusion'].includes(action)){
   const opponent=unitAt(hover.c,hover.r);
   if(opponent&&opponent.team!==u.team){extra+=canAim(u,opponent)?' · линия открыта':' · цель не видна';if(canAim(u,opponent))try{extra+=' · шанс '+hitChance(u,opponent,['jutsu','illusion'].includes(action)?'jutsu':'throw')+'%';}catch(e){}}
  }
  hud.textContent=summary(action)+extra;
  hud.dataset.valid=String(valid!==false);
 }
 const prevDraw=window.draw;window.draw=function(){prevDraw();updateHud();};
 const prevRender=window.renderGame;window.renderGame=function(){prevRender();
  if(!game)return;
  document.querySelectorAll('#actionButtons button[data-action]').forEach(b=>{const a=b.dataset.action;const sm=b.querySelector('small');if(sm&&a!=='move'){sm.textContent+=(range(a)>0?` · Д ${range(a)}`:'')+(area(a)?` · зона ${area(a)}`:'');}b.title=summary(a)});
  document.querySelectorAll('#jutsuPanel [data-tech]').forEach(b=>{const a='tech:'+b.dataset.tech,sm=b.querySelector('small');if(sm){sm.textContent+=` · Д ${range(a)}`+(area(a)?` · зона ${area(a)}`:'');}b.title=summary(a)});
  updateHud();};
 window.__arena541={version:'5.4.1',range,area,tech,owner,groupExists,knownCopy,seenStats,label,expose,updateHud,summary,
  get enabled(){return !!game}, get opponentCanIdentifyOriginal(){return false}};
})();
