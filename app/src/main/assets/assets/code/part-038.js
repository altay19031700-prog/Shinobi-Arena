
/* SHINOBI 5.13 - single upward flyout and real control-point victory */
(()=>{'use strict';
const arena=document.getElementById('arenaScreen');
const nav=document.getElementById('ux55-nav');
const board=arena?.querySelector('.boardpanel');
if(!arena||!nav||!board)return;
const POINT={c:5,r:3};const getMode=()=>game?.modeId||'capture';const getScoreGoal=()=>getMode()==='domination'?15:10;const getPoints=()=>{const c=Math.floor(W/2),r=Math.floor(H/2);return getMode()==='domination'?[{c,r:Math.max(1,r-3)},{c,r},{c,r:Math.min(H-2,r+3)}]:[{c,r}]};
const TABS={fight:'Бой',jutsu:'Дзюцу',items:'Предметы',clones:'Отряд',log:'Журнал'};
const itemIds=new Set(['kunai','shuriken','senbon','smoke','poison','paper','poisonBomb','toxin','trap','bandage','flash','potion']);
let opened=null,forward=[],lastGame=null,paintScheduled=false;
const score=document.createElement('aside');score.id='shinobi613-score';score.setAttribute('aria-label','Захват центральной точки, победа при десяти очках');
score.innerHTML='<span class="sh613-blue">Шиноби <b id="sh613-ally">0 / 10</b></span><span class="sh613-rule">◈ Центральная точка <small>+1 за ход · враг рядом оспаривает · первым до 10</small></span><span class="sh613-red">Противник <b id="sh613-enemy">0 / 10</b></span>';
board.append(score);
const popup=document.createElement('div');popup.id='shinobi613-popup';popup.hidden=true;popup.setAttribute('role','dialog');popup.setAttribute('aria-label','Панель действий');
popup.innerHTML='<div class="sh613-head"><strong id="sh613-title">Бой</strong><button id="sh613-close" type="button" aria-label="Закрыть панель">✕</button></div><div id="sh613-body"></div>';
document.body.append(popup);
const body=popup.querySelector('#sh613-body');
const css=document.createElement('style');css.id='shinobi613-css';css.textContent=`
#shinobi613-popup[hidden]{display:none!important}
#shinobi613-popup{position:fixed!important;z-index:30000!important;box-sizing:border-box!important;width:min(425px,calc(100vw - 16px))!important;max-height:calc(100dvh - 86px)!important;overflow:hidden!important;display:flex!important;flex-direction:column!important;padding:0!important;color:#e8e9e3!important;background:linear-gradient(135deg,#14272bec,#071015f9)!important;border:1px solid #aa9065!important;border-radius:8px!important;box-shadow:0 8px 40px #000e!important;font:13px/1.35 system-ui,sans-serif!important;overscroll-behavior:contain!important;}
#shinobi613-popup .sh613-head{display:flex!important;justify-content:space-between!important;align-items:center!important;gap:10px!important;padding:10px 12px!important;border-bottom:1px solid #776546!important;flex:none!important}
#shinobi613-popup .sh613-head strong{font-size:15px!important;color:#f7e9cb!important}
#shinobi613-popup #sh613-close{border:0!important;color:#e9c48b!important;background:transparent!important;min-height:30px!important;min-width:32px!important;cursor:pointer!important;font-size:17px!important}
#shinobi613-popup #sh613-body{overflow:auto!important;padding:9px!important;min-height:0!important;scrollbar-width:thin!important;overscroll-behavior:contain!important}
#shinobi613-popup .sh613-buttons{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:6px!important}
#shinobi613-popup .sh613-buttons button,#shinobi613-popup .sh613-choice{box-sizing:border-box!important;min-height:43px!important;width:100%!important;padding:8px!important;border:1px solid #4d6466!important;border-radius:5px!important;text-align:left!important;background:#172d33!important;color:#e7ede5!important;cursor:pointer!important;white-space:normal!important;font-size:12px!important}
#shinobi613-popup .sh613-buttons button.selected,#shinobi613-popup button.selected{border-color:#d9b77a!important;background:#44382a!important}
#shinobi613-popup button:disabled{opacity:.46!important;cursor:not-allowed!important}
#shinobi613-popup button small{display:block!important;font-size:11px!important;color:#b8c9ca!important;margin-top:3px!important}
#shinobi613-popup .sh613-message{font-size:12px!important;padding:10px!important;color:#a6b8b7!important}
#shinobi613-popup .sh613-unit{margin-bottom:10px!important}
#shinobi613-popup .sh613-unit .fighter{display:flex!important;gap:8px!important;align-items:center!important}
#shinobi613-popup .sh613-unit img{width:48px!important;max-height:58px!important;object-fit:contain!important}
#shinobi613-popup #sh613-body .teamtabs{display:flex!important;gap:5px!important;flex-wrap:wrap!important;margin-bottom:8px!important}
#shinobi613-popup #sh613-body .teamtabs button{padding:6px!important;background:#20333b!important;color:#eee!important;min-height:36px!important}
#shinobi613-popup #sh613-body .log{max-height:45dvh!important;overflow:auto!important;font-size:12px!important}
#shinobi613-popup #sh613-search{width:100%!important;box-sizing:border-box!important;padding:8px!important;margin-bottom:8px!important;background:#0a161d!important;color:#fff!important;border:1px solid #576b71!important}
#arenaScreen.active #shinobi613-score{display:flex!important;position:absolute!important;top:5px!important;left:50%!important;transform:translateX(-50%)!important;z-index:250!important;justify-content:center!important;align-items:center!important;gap:7px!important;margin:0!important;padding:5px 12px!important;border:1px solid #756849!important;border-radius:6px!important;background:#071014ed!important;box-shadow:0 3px 16px #000b!important;color:#eee8d9!important;pointer-events:none!important;font:600 12px/1.2 system-ui,sans-serif!important;min-width:290px!important;text-align:center!important}
#shinobi613-score span{display:flex!important;flex-direction:column!important;gap:2px!important;white-space:nowrap!important}
#shinobi613-score .sh613-blue{color:#80c5ff!important}#shinobi613-score .sh613-red{color:#ff9b95!important}
#shinobi613-score b{font-size:18px!important;font-variant-numeric:tabular-nums!important}
#shinobi613-score .sh613-rule{color:#f1dbac!important;font-size:12px!important}
#shinobi613-score .sh613-rule small{color:#b9c5c2!important;font-size:10px!important;white-space:normal!important}
#arenaScreen.active #ux55-nav button[aria-expanded="true"]{background:#51432e!important;border-color:#e1bc76!important;box-shadow:inset 0 0 0 1px #ac915c!important}
@media(max-width:740px){#arenaScreen.active #shinobi613-score{top:35px!important;min-width:0!important;width:min(94vw,340px)!important;padding:3px 5px!important;font-size:10px!important;gap:5px!important}#shinobi613-score b{font-size:14px!important}#shinobi613-score .sh613-rule{font-size:10px!important}#shinobi613-score .sh613-rule small{font-size:8px!important}#shinobi613-popup{width:calc(100vw - 16px)!important;max-height:min(58dvh,490px)!important}#shinobi613-popup .sh613-buttons button{min-height:48px!important}}
`;
document.head.append(css);
function inGame(){return !!game&&arena.classList.contains('active')}
function objective(){if(!game)return null;let v=game.__shinobi613;if(!v){v=game.__shinobi613={ally:0,enemy:0,lastPhase:game.phase,lastRound:game.round,awarded:[],winner:null};}return v}
function holder526(pt){const u=game.units.find(x=>x.hp>0&&x.c===pt.c&&x.r===pt.r&&!x.isSummon&&!(x.isClone&&x.cloneKind==='illusion'));if(!u)return null;const contested=game.units.some(v=>v.hp>0&&v.team!==u.team&&dist(v,pt)<=1&&!v.isSummon&&!(v.isClone&&v.cloneKind==='illusion'));return contested?null:u.team;}function controlling(){if(!game||getMode()==='skirmish'||getMode()==='survival')return null;return holder526(getPoints()[0]);}
function refreshScore(){const v=objective();if(!v)return;score.querySelector('#sh613-ally').textContent=v.ally+' / '+getScoreGoal();score.querySelector('#sh613-enemy').textContent=v.enemy+' / '+getScoreGoal();score.dataset.holder=controlling()||'none';score.querySelector('.sh613-rule').innerHTML=(getMode()==='domination'?'◈ Три святилища <small>+1 за точку · первым до 15</small>':getMode()==='capture'?'◈ Центральная точка <small>+1 за ход · первым до 10</small>':getMode()==='survival'?'◈ Выживание <small>Продержись 12 раундов</small>':'⚔ Уничтожение <small>Выведи противников из боя</small>');score.style.opacity=getMode()==='skirmish'?'.7':'1';}
function tick(){if(!inGame())return null;const v=objective();if(v.winner)return v.winner;
 const oldRound=v.lastRound,oldPhase=v.lastPhase;
 if(game.phase!==oldPhase||game.round!==oldRound){
   // The round number can advance when the enemy ends. Credit the turn that actually ended.
   const ended=oldPhase,token=`${oldRound}:${ended}`;
   if((ended==='ally'||ended==='enemy')&&!v.awarded.includes(token)){
     v.awarded.push(token);
     if(v.awarded.length>80)v.awarded.shift();
     if(getMode()==='capture'||getMode()==='domination'){const gained=getPoints().filter(pt=>holder526(pt)===ended).length;if(gained){v[ended]+=gained;log(`Контроль точек: ${ended==='ally'?'Шиноби':'Противник'} +${gained} (${v[ended]}/${getScoreGoal()}).`,ended==='ally'?'good':'hurt')}}
   }
   v.lastPhase=game.phase;v.lastRound=game.round;
 }
 if((getMode()==='capture'||getMode()==='domination')&&(v.ally>=getScoreGoal()||v.enemy>=getScoreGoal())){v.winner=v.ally>=getScoreGoal()?'ally':'enemy';game.__objectiveWinner=v.winner;}if(getMode()==='survival'&&game.round>12){v.winner='ally';game.__objectiveWinner='ally';}
 refreshScore();return v.winner;
}
function offlineVictory(winner){if(!game||game.over||window.__shinobiNetwork?.active)return;
 game.over=true;
 const victory=winner==='ally';
 document.getElementById('resultTitle').textContent=victory?'ПОБЕДА!':'ПОРАЖЕНИЕ';
 document.getElementById('resultText').textContent=victory?'Твои шиноби выполнили задачу карты.':'Противник выполнил задачу карты.';
 log(`Бой завершён по очкам: Шиноби ${game.__shinobi613.ally} — ${game.__shinobi613.enemy} Противник.`,victory?'good':'hurt');
 close();const finished=game;setTimeout(()=>{if(game===finished&&game.over)showScreen('resultScreen')},850);
}
function reconcile(){const result=tick();if(result&&!game.over&&!window.__shinobiNetwork?.active)offlineVictory(result);return result;}
const prevCheckEnd=window.checkEnd;
window.checkEnd=function(...args){reconcile();if(game?.over)return;return prevCheckEnd.apply(this,args)};
const prevRender=window.renderGame;
window.renderGame=function(...args){const r=prevRender.apply(this,args);if(inGame()){reconcile();refreshScore();if(opened)requestPaint()}else close();return r;};
const previousNewGame=window.newGame;
window.newGame=function(...args){const r=previousNewGame.apply(this,args);if(game){delete game.__shinobi613;objective();refreshScore()}close();return r;};
// The default rule is still elimination. Scoring is an additional way to win.
const previousDraw=window.draw;
window.draw=function(...args){const r=previousDraw.apply(this,args);if(!inGame())return r;
 const v=objective(),holder=controlling(),now=performance.now()/1000;for(const pt of ((getMode()==='capture'||getMode()==='domination')?getPoints():[])){const p=center(pt.c,pt.r);
 ctx.save();ctx.translate(p.x,p.y);
 ctx.shadowColor=holder==='ally'?'#59c8ff':holder==='enemy'?'#ff7668':'#efc47b';ctx.shadowBlur=16+Math.sin(now*2)*4;
 ctx.strokeStyle=holder==='ally'?'#70cfff':holder==='enemy'?'#ff8a79':'#f7ce77';ctx.lineWidth=3.5;ctx.beginPath();ctx.ellipse(0,11,35,15,0,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle='rgba(7,15,18,.86)';ctx.strokeStyle='#d3aa66';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-15,-12);ctx.lineTo(-15,-41);ctx.lineTo(0,-51);ctx.lineTo(15,-41);ctx.lineTo(15,-12);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.shadowBlur=12;ctx.fillStyle=holder==='ally'?'#87d5ff':holder==='enemy'?'#ff9690':'#ffdf9a';ctx.font='bold 22px serif';ctx.textAlign='center';ctx.fillText('◈',0,-22);ctx.shadowBlur=0;
 ctx.fillStyle='#091518ed';ctx.fillRect(-58,22,116,24);ctx.strokeStyle='#bda172';ctx.lineWidth=1;ctx.strokeRect(-58,22,116,24);ctx.fillStyle='#f0d59c';ctx.font='bold 13px system-ui';ctx.fillText(getMode()==='domination'?'СВЯТИЛИЩЕ +1':'ТОЧКА +1 / ХОД',0,38);
 ctx.restore();}return r;
};
function close(){opened=null;popup.hidden=true;for(const b of nav.querySelectorAll('[data-ux-tab]')){b.setAttribute('aria-expanded','false');b.classList.remove('sh613-open');}}
function placement(){if(!opened)return;const b=nav.querySelector(`[data-ux-tab="${opened}"]`);if(!b)return;const pos=b.getBoundingClientRect();const w=Math.min(innerWidth-16,innerWidth<=740?innerWidth-16:425),h=Math.min(innerHeight-90,innerWidth<=740?Math.min(innerHeight*.58,490):innerHeight*.62);
 const left=Math.max(8,Math.min(innerWidth-w-8,pos.left +pos.width/2-w/2));
 popup.style.width=w+'px';popup.style.left=left+'px';popup.style.bottom=Math.max(8,innerHeight-pos.top+7)+'px';popup.style.maxHeight=Math.max(95,Math.min(h,pos.top-12))+'px';
}
function makeButton(original){const clone=original.cloneNode(true);const idx=forward.push(original)-1;clone.dataset.sh613Target=String(idx);clone.removeAttribute('id');clone.removeAttribute('onclick');clone.setAttribute('type','button');clone.disabled=original.disabled;return clone}
function content(){forward=[];body.replaceChildren();const key=opened;popup.querySelector('#sh613-title').textContent=TABS[key]||'Действия';
 if(key==='fight'||key==='items'){
  const src=[...document.querySelectorAll('#actionButtons button')].filter(b=>{const a=b.dataset.action;return a&&((key==='items')===itemIds.has(a))});
  if(key==='fight'){const extra=document.getElementById('arena56-hide');if(extra&&!src.includes(extra))src.push(extra);}
  const container=document.createElement('div');container.className='sh613-buttons';for(const b of src)container.append(makeButton(b));body.append(container);if(!src.length)body.innerHTML='<p class="sh613-message">Нет доступных действий.</p>';
 }else if(key==='jutsu'){
  const source=document.getElementById('jutsuPanel');if(!source){body.innerHTML='<p class="sh613-message">Список техник недоступен.</p>';return}
  // Reuse real learned abilities from the current character, with click forwarding.
  const nodes=[...source.querySelectorAll('button')];const container=document.createElement('div');container.className='sh613-buttons';for(const b of nodes)container.append(makeButton(b));body.append(container);
  if(!nodes.length)body.innerHTML='<p class="sh613-message">У выбранного шиноби нет изученных техник.</p>';
 }else if(key==='clones'){
  for(const selector of ['#battleTabs','#unitInfo','#arena58-summons']){
    const source=document.querySelector(selector);if(!source)continue;const section=source.cloneNode(true);section.classList.add('sh613-unit');section.removeAttribute('id');section.querySelectorAll('[id]').forEach(e=>e.removeAttribute('id'));
    const originals=[...source.querySelectorAll('button')], buttons=[...section.querySelectorAll('button')];buttons.forEach((b,i)=>{b.dataset.sh613Target=String(forward.push(originals[i])-1);b.removeAttribute('onclick')});body.append(section);
  }
 }else if(key==='log'){
  const search=document.createElement('input');search.type='search';search.id='sh613-search';search.placeholder='Поиск в журнале боя';body.append(search);
  const feed=document.getElementById('combatLog');const clone=feed?.cloneNode(true);if(clone){clone.removeAttribute('id');body.append(clone);search.oninput=()=>{for(const row of clone.children)row.hidden=!row.textContent.toLocaleLowerCase('ru').includes(search.value.toLocaleLowerCase('ru'))}};
 }
}
function requestPaint(){if(paintScheduled)return;paintScheduled=true;requestAnimationFrame(()=>{paintScheduled=false;if(opened){content();placement()}})}
nav.addEventListener('click',e=>{const btn=e.target.closest('[data-ux-tab]');if(!btn||!inGame())return;
 e.preventDefault();e.stopImmediatePropagation();const key=btn.dataset.uxTab;if(opened===key){close();return}
 close();opened=key;popup.hidden=false;
 try{window.__arena55?.selectMode?.(key)}catch(e){console.warn('Switch mode:',e)}
 for(const b of nav.querySelectorAll('[data-ux-tab]'))b.setAttribute('aria-expanded',String(b.dataset.uxTab===opened));
 content();placement();
},true);
popup.querySelector('#sh613-close').addEventListener('click',close);
body.addEventListener('click',e=>{const b=e.target.closest('button[data-sh613-target]');if(!b)return;
 const original=forward[Number(b.dataset.sh613Target)];if(!original||original.disabled)return;
 original.click();if(opened!=='log'&&opened!=='clones')close();else requestPaint();
});
document.addEventListener('pointerdown',e=>{if(opened&&e.target.closest('#arenaScreen .boardwrap canvas'))close()},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened){e.stopImmediatePropagation();close()}},true);
window.addEventListener('resize',placement,{passive:true});
const originals=[document.getElementById('actionButtons'),document.getElementById('jutsuPanel'),document.getElementById('battleTabs'),document.getElementById('combatLog')];
for(const source of originals)if(source)new MutationObserver(()=>{if(opened)requestPaint()}).observe(source,{childList:true,subtree:false});
window.__shinobiObjective={version:'5.13',get point(){return getPoints()[0]},get maxScore(){return getScoreGoal()},get state(){return game?.__shinobi613||null},get holder(){return controlling()},tick,reconcileGame:reconcile,refresh:refreshScore,open:(key)=>{const b=nav.querySelector(`[data-ux-tab="${key}"]`);if(b)b.click();},get opened(){return opened},close};
})();

