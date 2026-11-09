
/* SHINOBI ARENA 5.5 — Responsive combat interface. Does not replace combat callbacks. */
(()=>{
'use strict';
const screen=document.getElementById('arenaScreen');
const layout=screen?.querySelector('.arena-layout');
const side=layout?.querySelector('.side');
const boardPanel=layout?.querySelector('.boardpanel');
if(!screen||!side||!boardPanel)return;
const tabs=[['fight','⚔','Бой'],['jutsu','✦','Дзюцу'],['items','◈','Предметы'],['clones','♙','Отряд'],['log','☷','Журнал']];
const combatIds=new Set(['move','melee','sword','quick','heavy','stunHit','trip','guard','pet:attack','pet:special']);
const itemIds=new Set(['kunai','shuriken','senbon','smoke','poison','paper','poisonBomb','toxin','trap','bandage','flash','potion']);
// These older game versions insert mobile CSS AFTER the document head.
// Place viewport overrides last so the board keeps a consistent aspect ratio.
const lateStyle=document.createElement('style');lateStyle.id='ux55-late-mobile';
lateStyle.textContent='@media(max-width:740px){#arenaScreen .boardwrap canvas{width:680px!important;min-width:680px!important;max-width:none!important;height:auto!important;touch-action:pan-x pan-y!important}#arenaScreen .boardwrap{height:min(47dvh,400px)!important}}';
document.head.append(lateStyle);
const hud=document.createElement('section');hud.id='ux55-hud';hud.setAttribute('aria-label','Текущий боец и отряд');
hud.innerHTML='<div id="ux55-hudmain"><span id="ux55-turn">Раунд 1</span><strong id="ux55-name">Выбери шиноби</strong><span id="ux55-vitals">HP — · Ч — · ОД —</span></div><div id="ux55-party"></div><div id="ux55-feed" role="status" aria-live="polite"></div>';
const head=boardPanel.querySelector('.subhead');head?.insertAdjacentElement('afterend',hud);
const fighters=document.getElementById('battleTabs');if(fighters)hud.querySelector('#ux55-party').append(fighters);
const nav=document.createElement('nav');nav.id='ux55-nav';nav.setAttribute('aria-label','Боевые действия');
nav.innerHTML=tabs.map(([key,icon,label])=>`<button type="button" data-ux-tab="${key}" aria-pressed="false"><span aria-hidden="true">${icon}</span><small>${label}</small></button>`).join('')+'<button type="button" id="ux55-end" class="ux55-end">Ход ✓</button>';
side.insertBefore(nav,side.firstChild);
const detail=document.createElement('div');detail.id='ux55-logsearch';detail.innerHTML='<label for="ux55-filter">Поиск по журналу</label><input id="ux55-filter" type="search" placeholder="Урон, клон, дым, техника…" autocomplete="off"/><button id="ux55-clearfilter" type="button">Сброс</button>';
const log=document.getElementById('combatLog');log?.before(detail);
const logPanel=log?.closest('.panel');const fighterPanel=document.getElementById('unitInfo')?.closest('.panel');const actionPanel=document.getElementById('actionButtons')?.closest('.panel');const jutsuPanel=document.getElementById('jutsuPanel')?.closest('.panel');
for(const [el,name] of [[logPanel,'log'],[fighterPanel,'fighter'],[actionPanel,'actions'],[jutsuPanel,'jutsu']])if(el)el.dataset.ux55Section=name;
const aiDetails=document.createElement('details');aiDetails.className='ux55-ai-details';
aiDetails.innerHTML='<summary>Диагностика ИИ «Мусаси» · решения и память</summary>';
if(logPanel)logPanel.append(aiDetails);
// The original AI widgets keep their IDs and event handlers when relocated.
for(const id of ['musashi-hud','musashi42-panel','musashi47']){
 const el=document.getElementById(id);if(el)aiDetails.append(el);
}

// Lightweight feed is driven by existing combat log; full log remains untouched.
let mode='fight',lastMessage='',collapsed=window.matchMedia('(max-width:740px)').matches;
function logSummary(text){
 const v=(text||'').replace(/──/g,'').replace(/\s+/g,' ').trim();
 if(!v)return '';
 return v.length>125?v.slice(0,122)+'…':v;
}
function updateFeed(){
 if(!log)return;
 const events=[...log.children].filter(el=>!!el.textContent.trim());
 const messages=events.slice(0,2).map(el=>logSummary(el.textContent));
 const msg=messages.join('  •  ');
 if(msg!==lastMessage){lastMessage=msg;const feed=document.getElementById('ux55-feed'); if(feed)feed.textContent=msg||'Выбери действие и цель на карте';}
}
function filterLog(){
 if(!log)return;
 const q=document.getElementById('ux55-filter')?.value?.toLocaleLowerCase('ru')||'';
 for(const el of log.children)el.hidden=!!q&&!el.textContent.toLocaleLowerCase('ru').includes(q);
}
document.getElementById('ux55-filter')?.addEventListener('input',filterLog);
document.getElementById('ux55-clearfilter')?.addEventListener('click',()=>{document.getElementById('ux55-filter').value='';filterLog()});
const observer=new MutationObserver(()=>{updateFeed();filterLog()});if(log)observer.observe(log,{childList:true,characterData:true,subtree:true});
function categorize(){
 const actions=document.querySelectorAll('#actionButtons button');
 for(const b of actions){const a=b.dataset.action||'';b.dataset.ux55Category=itemIds.has(a)?'items':'fight';
  // Do not hide custom companion commands or actions that don't match older catalogs.
 }
}
function selectMode(key,focusInput=false,fromBoot=false){
 if(!tabs.some(x=>x[0]===key))key='fight';
 mode=key;side.dataset.ux55Mode=mode;
 if(!fromBoot)collapsed=false;side.dataset.ux55Collapsed=String(collapsed);
 for(const b of nav.querySelectorAll('[data-ux-tab]')){const on=b.dataset.uxTab===mode;b.setAttribute('aria-pressed',on?'true':'false');b.classList.toggle('active',on);}
 categorize();
 if(key==='log'&&focusInput)document.getElementById('ux55-filter')?.focus();
 try{sessionStorage.setItem('shinobi55_tab',mode)}catch(e){}
}
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.uxTab){
  if(window.matchMedia('(max-width:740px)').matches&&b.dataset.uxTab===mode&&!collapsed){collapsed=true;side.dataset.ux55Collapsed='true';}
  else selectMode(b.dataset.uxTab);return;
 }
 if(b.id==='ux55-end'){
  const source=document.getElementById('arena544-next');
  if(source&&!source.disabled)source.click();
  else if(!source&&document.getElementById('endTurn')&&!document.getElementById('endTurn').disabled)document.getElementById('endTurn').click();
 }
});
// Once the player selects an action, reveal the map for picking a target.
document.addEventListener('click',e=>{
 const b=e.target.closest('#arenaScreen #actionButtons button[data-action],#arenaScreen #jutsuPanel button[data-tech]');
 if(b&&!b.disabled&&window.matchMedia('(max-width:740px)').matches){
  requestAnimationFrame(()=>{collapsed=true;side.dataset.ux55Collapsed='true'});
 }
},true);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&screen.classList.contains('active')&&window.matchMedia('(max-width:740px)').matches){collapsed=true;side.dataset.ux55Collapsed='true';}
});
// In older versions game is a top-level let, so read it directly rather than via window.
function readState(){
 try{return {active:screen.classList.contains('active'),game:typeof game!=='undefined'?game:null,u:typeof me==='function'?me():null}}
 catch(e){return {active:false,game:null,u:null}}
}
function syncReal(){
 const st=readState();if(!st.active||!st.game)return;
 const g=st.game,u=st.u;
 const rd=document.getElementById('roundDisplay')?.textContent||'';
 document.getElementById('ux55-turn').textContent=rd;
 document.getElementById('ux55-name').textContent=u?.name||'Выбери бойца';
 document.getElementById('ux55-vitals').textContent=u?`HP ${u.hp}/${u.maxHp} · Ч ${u.chakra}/${u.maxChakra} · ОД ${u.ap}/${u.maxAp}`:'HP — · Ч — · ОД —';
 const btn=document.getElementById('ux55-end'),real=document.getElementById('arena544-next');
 btn.disabled=!!g.over||g.phase!=='ally'||(real?real.disabled:document.getElementById('endTurn')?.disabled);
 btn.textContent=g.phase==='ally'?(real?.textContent?.includes('Ждём')?'⌛ Печати…':'Ход ✓'):'Ход ИИ…';
 categorize();updateFeed();
}
const prev=window.renderGame;
window.renderGame=function(...args){const result=prev.apply(this,args);try{syncReal()}catch(e){console.error('Combat UI render 5.5:',e)}return result};
try{selectMode(sessionStorage.getItem('shinobi55_tab')||'fight',false,true)}catch(e){selectMode('fight',false,true)}
if(log){updateFeed();filterLog()}
syncReal();
window.__arena55={version:'5.5',selectMode,refresh:syncReal,get mode(){return mode},get categories(){return [...document.querySelectorAll('#actionButtons button')].map(b=>[b.dataset.action,b.dataset.ux55Category])}};
})();

