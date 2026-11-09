
(function(){
const WEATHER={
  clear:{id:'clear',name:'Ясно',desc:'Без модификаторов.'},
  rain:{id:'rain',name:'Дождь',desc:'Вода и молния: +15% урона; огонь: −20%, горение до 1 раунда. Дальняя меткость: оружие −10 п.п., дзюцу −12 п.п.'},
  fog:{id:'fog',name:'Туман',desc:'Сильный штраф к дальности и меткости на дистанции.'},
  wind:{id:'wind',name:'Ветер',desc:'Сильнее мешает кунаям и сюрикенам.'},
  heat:{id:'heat',name:'Жара',desc:'Усталость накапливается быстрее, ОД восстанавливаются хуже.'}
};
const extraStyle=document.createElement('style');
extraStyle.textContent=`
.portrait-frame{width:190px;height:250px;display:flex;align-items:flex-end;justify-content:center;background:linear-gradient(180deg,#132028,#0b151b);border:1px solid #3a525c;border-radius:12px;overflow:hidden;box-shadow:inset 0 0 0 1px #0008}
.setupFighter{align-items:flex-end;gap:14px}
.setup-portrait{width:132px!important;height:214px!important;object-fit:contain;object-position:center bottom;image-rendering:auto;filter:drop-shadow(0 10px 10px #000a)}
.ui-portrait{width:100px!important;height:158px!important;object-fit:contain;object-position:center bottom}
.weatherbox{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-top:10px}
.weatherbox select{min-width:170px}
.boardhud{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.canvas-fullscreen{position:fixed!important;inset:0!important;z-index:9999!important;background:#081117!important;padding:8px!important;max-width:none!important}
.canvas-fullscreen .boardwrap{height:calc(100vh - 120px)!important;display:flex;align-items:center;justify-content:center}
.canvas-fullscreen canvas{width:auto!important;height:100%!important;max-width:100%!important;max-height:100%!important}
.fatigueLabel{margin-top:6px}
.weatherpill{border-color:#6e8a93;color:#e8ece9}
.immersive-mode{position:fixed!important;inset:0!important;z-index:9998!important;overflow:auto!important;display:block!important;background:#0b131a!important;padding:8px!important;}
.immersive-mode .arena-layout{display:grid!important;grid-template-columns:minmax(540px,1fr) 310px!important;gap:9px!important;align-items:start;max-width:none!important}
.immersive-mode .boardpanel{min-width:0!important;}
.immersive-mode .boardwrap{display:flex;justify-content:center;align-items:center;max-height:calc(100vh - 135px)!important;}
.immersive-mode canvas{max-height:calc(100vh - 135px)!important;max-width:100%!important;width:auto!important;height:auto!important;aspect-ratio:1200/700!important;}
.immersive-mode .side{display:flex!important;flex-direction:column!important;}
@media(max-width:950px){.immersive-mode .arena-layout{grid-template-columns:minmax(0,1fr)!important}.immersive-mode .side{display:grid!important;grid-template-columns:1fr 1fr!important}.immersive-mode .boardwrap{max-height:initial!important}.immersive-mode canvas{width:100%!important;height:auto!important}}

 .setupMeta{display:flex;flex-direction:column;gap:8px;min-width:220px}
.setupFighter{display:grid;grid-template-columns:190px minmax(220px,1fr);align-items:end;gap:16px}
.setupCardCompact .divider{margin:12px 0}
@media(max-width:900px){.setupFighter{grid-template-columns:170px minmax(0,1fr)}.portrait-frame{width:176px;height:236px}.setup-portrait{width:126px!important;height:206px!important}}
@media(max-width:700px){.setupFighter{grid-template-columns:1fr;align-items:flex-start;gap:12px}.portrait-frame{width:150px;height:208px}.setup-portrait{width:108px!important;height:174px!important}.setupMeta{min-width:0}.statsgrid{grid-template-columns:1fr 1fr!important;gap:10px}.stat{padding:10px}.fighter .portrait{max-width:100%}.weatherbox{display:grid;grid-template-columns:1fr;gap:6px}.panel .subhead .row{flex-wrap:wrap}.equipgrid{grid-template-columns:1fr!important}.teamtabs{flex-wrap:wrap}.actions{grid-template-columns:1fr 1fr!important}.boardwrap{overflow:auto}.boardwrap canvas{max-width:none}}
@media(max-width:460px){.portrait-frame{width:136px;height:190px}.setup-portrait{width:98px!important;height:160px!important}.statsgrid{grid-template-columns:1fr!important}.actions{grid-template-columns:1fr!important}.tiny{width:40px;height:40px}}
`;
document.head.appendChild(extraStyle);

function ensureControls(){
  if(!document.getElementById('weatherSelect')){
    const readyPanel=document.querySelector('#setupScreen .panel.full .row.spread > div');
    const box=document.createElement('div');
    box.className='weatherbox';
    box.innerHTML=`<span class="muted">Погода:</span><select id="weatherSelect">${Object.values(WEATHER).map(w=>`<option value="${w.id}">${w.name}</option>`).join('')}</select><small id="weatherDesc" class="muted">${WEATHER.clear.desc}</small>`;
    readyPanel.appendChild(box);
    const sel=box.querySelector('#weatherSelect');
    sel.onchange=()=>{document.getElementById('weatherDesc').textContent=WEATHER[sel.value].desc};
  }
  const arenaBtns=document.querySelector('#arenaScreen .boardpanel .subhead .row');
  if(arenaBtns && !document.getElementById('fullscreenBtn')){
    const b=document.createElement('button');
    b.id='fullscreenBtn'; b.textContent='Полный экран';
    arenaBtns.appendChild(b);
    b.onclick=toggleFullscreen;
  }
}
function toggleFullscreen(){
 const screen=document.getElementById('arenaScreen');
 if(!screen) return;
 const goingFull=!screen.classList.contains('immersive-mode');
 screen.classList.toggle('immersive-mode',goingFull);
 const btn=document.getElementById('fullscreenBtn');
 if(btn)btn.textContent=goingFull?'Выйти из полного экрана':'Полный экран';
 if(goingFull&&screen.requestFullscreen){screen.requestFullscreen().catch(()=>{});}
 else if(!goingFull&&document.fullscreenElement&&document.exitFullscreen){document.exitFullscreen().catch(()=>{});}
 if(game)draw();
}
document.addEventListener('fullscreenchange',()=>{
 if(!document.fullscreenElement){document.getElementById('arenaScreen')?.classList.remove('immersive-mode');
 const b=document.getElementById('fullscreenBtn');if(b)b.textContent='Полный экран';}
});
function weatherId(){ return document.getElementById('weatherSelect')?.value||'clear'; }
function weather(){ return WEATHER[(game&&game.weather)||weatherId()]||WEATHER.clear; }
function fatigueState(u){ const f=u?.fatigue||0; return f>=70?'Тяжёлая':f>=40?'Средняя':'Низкая'; }
function apPenalty(u){ const f=u?.fatigue||0; let p=f>=70?2:f>=40?1:0; if(game?.weather==='heat' && f>=55)p++; return p; }
function calcAp(u){ return Math.max(4,(u.maxAp||6)-apPenalty(u)); }
function addFatigue(u,amount){ if(!u) return; let a=amount; if(game?.weather==='heat') a=Math.ceil(a*1.25); if(game?.weather==='rain' && amount<=5) a=Math.max(1,Math.floor(a*0.9)); u.fatigue=Math.min(100,(u.fatigue||0)+a); }
function recoverFatigue(team){ if(!game)return; const base=game.weather==='heat'?8:game.weather==='fog'?11:12; for(const u of game.units.filter(v=>v.team===team&&v.hp>0)){ u.fatigue=Math.max(0,(u.fatigue||0)-base); } }
if(new URLSearchParams(location.search).has('animationQA'))window.__animationRuleAccess={calcAp,recoverFatigue};
const oldMakeUnit=window.makeUnit; window.makeUnit=function(source,team,i,c,r){ const u=oldMakeUnit(source,team,i,c,r); u.fatigue=0; return u; };
const oldNewGame=window.newGame; window.newGame=function(){ oldNewGame(); if(game){ game.weather=weatherId(); for(const u of game.units){ if(u.fatigue==null)u.fatigue=0; u.ap=calcAp(u); } log('Погодные условия: '+weather().name+'. '+weather().desc,'good'); renderGame(); } };
const oldMoveUnit=window.moveUnit; window.moveUnit=function(u,path,cap){ const moved=oldMoveUnit(u,path,cap); if(moved) addFatigue(u,moved*4); return moved; };
const oldHitChance=window.hitChance; window.hitChance=function(a,b,type,bonus=0){ let v=oldHitChance(a,b,type,bonus); v-=Math.floor((a.fatigue||0)/15); v+=Math.floor((b.fatigue||0)/28); const dd=(typeof dist==='function')?dist(a,b):1; if(game){ if(game.weather==='rain' && type!=='melee' && type!=='sword') v-=(type==='jutsu'?12:10); if(game.weather==='fog' && type!=='melee' && type!=='sword') v-=(dd>=3?22:10); if(game.weather==='wind' && type==='throw') v-=14; else if(game.weather==='wind' && type==='jutsu') v-=6; } return clamp(Math.round(v),5,95); };
const oldExecute=window.execute; window.execute=function(u,action,cell){ const ok=oldExecute(u,action,cell); if(ok){ const map={guard:3,melee:10,sword:11,quick:7,heavy:16,stunHit:12,trip:11,kunai:8,shuriken:8,senbon:7,jutsu:12,illusion:10,smoke:6,poison:8,paper:10,toxin:4,trap:6,bandage:5,flash:8,potion:3}; if(action!=='move') addFatigue(u,map[action]||5); if(game?.weather==='rain'&&action==='jutsu'&&u.element===0){ const t=cell?unitAt(cell.c,cell.r):null; if(t&&t.burn)t.burn=Math.max(0,t.burn-1); } if(typeof renderGame==='function') renderGame(); } return ok; };
const oldTakeDamageOverTime=window.takeDamageOverTime; window.takeDamageOverTime=function(team){ oldTakeDamageOverTime(team); if(game&&game.weather==='heat'){ for(const u of game.units.filter(v=>v.team===team&&v.hp>0)){ u.fatigue=Math.min(100,(u.fatigue||0)+2); } } };
window.enemyTurn=async function(){ if(!game||game.over)return; game.phase='enemy'; $('endTurn').disabled=true; log('── ХОД ПРОТИВНИКА ──','hurt'); recoverFatigue('enemy'); takeDamageOverTime('enemy'); checkEnd(); if(game.over)return; if(window.__musashi?.state.mode==='musashi'){await window.__musashi.runEnemyPhase();}else{for(const u of game.units.filter(x=>x.team==='enemy'&&x.hp>0)){ u.ap=calcAp(u); if(u.stun){ log(`${u.name} оглушён и пропускает ход.`); u.stun=0; continue; } for(let j=0;j<7;j++){ const opponents=game.units.filter(x=>x.team==='ally'&&x.hp>0); if(!opponents.length||u.ap<3)break; opponents.sort((a,b)=>window.arenaAiScore(a,u)-window.arenaAiScore(b,u)); const target=opponents[0], dd=dist(u,target); if(dd===1&&u.ap>=2){ const mode=u.ap>=5&&rand(100)<22?'heavy':u.ap>=4&&rand(100)<22?'trip':u.ap>=4&&rand(100)<18?'stunHit':u.ap>=3&&rand(100)<35?'melee':'quick'; execute(u,mode,{c:target.c,r:target.r}); await waitFx(); await waitPendingCounter(); await waitFx(); continue; } if(dd<=4&&u.ap>=4&&u.chakra>=Math.max(4,9-Math.floor((u.skills.control||0)/35))&&lineClear(u,target)&&rand(100)<30){ execute(u,'jutsu',{c:target.c,r:target.r}); await waitFx(); continue; } if(dd<=4&&u.ap>=3&&u.gear.kunai&&lineClear(u,target)){ execute(u,'kunai',{c:target.c,r:target.r}); await waitFx(); continue; } const paths=neigh(target.c,target.r).filter(n=>!unitAt(n.c,n.r)&&!obstacle(n.c,n.r)).map(n=>pathTo(u,n.c,n.r)).filter(Boolean).sort((a,b)=>a.length-b.length); if(paths.length&&paths[0].length){ const cap=Math.min(paths[0].length,Math.max(0,u.ap-2)); if(cap<=0)break; moveUnit(u,paths[0],cap); await waitFx(); checkEnd(); if(game.over)break; } else break; } if(game.over)break; }
}  if(game.over)return; game.round++; game.phase='ally'; recoverFatigue('ally'); takeDamageOverTime('ally'); checkEnd(); if(game.over)return; for(const u of game.units.filter(x=>x.team==='ally'&&x.hp>0)){ u.ap=calcAp(u); if(u.stun){ u.ap=0; u.stun=0; log(`${u.name} пропускает ход из-за оглушения.`,'hurt'); } }
 for(const [cell,time] of game.smoke){ if(time<=1)game.smoke.delete(cell); else game.smoke.set(cell,time-1); }
 if(!me()||me().hp<=0) game.selected=game.units.find(x=>x.team==='ally'&&x.hp>0)?.id||null; $('endTurn').disabled=false; log(`── РАУНД ${game.round}: ТВОЙ ХОД ──`,'good'); renderGame(); };
const oldRenderSetup=window.renderSetup; window.renderSetup=function(){ oldRenderSetup(); ensureControls(); const fighter=document.querySelector('#fighterCard .fighter'); if(fighter){ fighter.classList.add('setupFighter'); const img=fighter.querySelector('img.portrait'); if(img&&!img.parentElement.classList.contains('portrait-frame')){ img.classList.add('setup-portrait'); const frame=document.createElement('div'); frame.className='portrait-frame'; fighter.insertBefore(frame,fighter.firstChild); frame.appendChild(img); } }
};
const oldRenderGame=window.renderGame; window.renderGame=function(){ oldRenderGame(); ensureControls(); if(!game) return; const u=me(); const w=weather(); $('roundDisplay').textContent=`Раунд ${game.round} • ${game.phase==='ally'?'твой ход':'ход противника'} • Погода: ${w.name}`; if(u){ $('unitInfo').innerHTML=`<div class="fighter"><img class="portrait ui-portrait" src="${SPRITES[u.sprite]}"><div><b>${u.name}</b><div class="pill" style="color:${ELEMENTS[u.element].color}">${ELEMENTS[u.element].name}</div><div class="pill weatherpill">Усталость: ${u.fatigue||0}/100</div><div class="muted">ОД ${u.ap}/${calcAp(u)} • состояние: ${fatigueState(u)}</div></div></div><div class="muted" style="margin-top:5px">Здоровье: ${u.hp}/${u.maxHp}</div><div class="meter"><span style="width:${100*u.hp/u.maxHp}%;background:#d67669"></span></div><div class="muted" style="margin-top:6px">Чакра: ${u.chakra}/${u.maxChakra}</div><div class="meter"><span style="width:${100*u.chakra/u.maxChakra}%;background:#56a7d2"></span></div><div class="muted fatigueLabel">Усталость</div><div class="meter"><span style="width:${u.fatigue||0}%;background:${(u.fatigue||0)>=70?'#d67669':(u.fatigue||0)>=40?'#d1b36f':'#7eb891'}"></span></div><div class="boardhud">${u.prone?'<span class="pill">Сбит с ног</span>':''}${['poison','burn','wound','stun','guard','coated','blur'].filter(k=>u[k]).map(k=>`<span class="pill">${{poison:'Яд',burn:'Горение',wound:'Кровотечение',stun:'Оглушение',guard:'Защита',coated:'Оружие с ядом',blur:'Ослепление'}[k]}</span>`).join('')}<span class="pill weatherpill">Погода: ${w.name}</span></div>`; }
};
const oldDraw=window.draw; window.draw=function(){ oldDraw(); if(!game) return; drawWeatherOverlay(); };
function drawWeatherOverlay(){ if(window.__shinobiEnvironment)return;const w=weather().id; ctx.save(); const t=(Date.now()/150)%1000; if(w==='rain'){ ctx.strokeStyle='rgba(170,210,255,.24)'; ctx.lineWidth=1.5; for(let i=0;i<90;i++){ const x=(i*37+t*7)%1040-20, y=(i*61+t*13)%700-40; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-7,y+18); ctx.stroke(); } }
 else if(w==='fog'){ ctx.fillStyle='rgba(210,220,230,.07)'; ctx.fillRect(0,0,1000,640); for(let i=0;i<18;i++){ const x=(i*67+t*3)%1050-60, y=(i*41+t*2)%700-40; const g=ctx.createRadialGradient(x,y,5,x,y,80); g.addColorStop(0,'rgba(225,235,240,.11)'); g.addColorStop(1,'rgba(225,235,240,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,80,0,Math.PI*2); ctx.fill(); } }
 else if(w==='wind'){ ctx.strokeStyle='rgba(220,235,240,.22)'; ctx.lineWidth=2; for(let i=0;i<16;i++){ const x=(i*73+t*9)%1100-80, y=70+(i*31)%500; ctx.beginPath(); ctx.moveTo(x,y); ctx.bezierCurveTo(x+30,y-10,x+55,y+7,x+84,y-2); ctx.stroke(); } }
 else if(w==='heat'){ ctx.strokeStyle='rgba(255,220,170,.16)'; ctx.lineWidth=2; for(let i=0;i<18;i++){ const x=25+i*54+Math.sin((t+i)*.15)*6; ctx.beginPath(); ctx.moveTo(x,18); for(let y=18;y<640;y+=20) ctx.lineTo(x+Math.sin((y+t*4+i)*.05)*4,y); ctx.stroke(); } }
 ctx.restore(); }
setInterval(()=>{ if(!window.__shinobiEnvironment && game && !game.over && document.getElementById('arenaScreen').classList.contains('active') && ['rain','fog','wind','heat'].includes(game.weather)) draw(); }, 350);
ensureControls(); renderSetup();
})();
