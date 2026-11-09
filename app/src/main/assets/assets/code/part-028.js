
// SHINOBI ARENA 5.9.9: compact battle controls, reusing existing actions/events.
(()=>{
 'use strict';
 const screen=document.getElementById('arenaScreen'),side=screen?.querySelector('.side'),nav=document.getElementById('ux55-nav');
 if(!screen||!side||!nav||!window.__arena55)return;
 const compact=window.matchMedia('(max-width:1099px)');
 const scrim=document.createElement('button');scrim.id='hud599-scrim';scrim.type='button';scrim.setAttribute('aria-label','Закрыть панель и вернуться к полю');screen.appendChild(scrim);
 const closer=document.createElement('button');closer.id='hud599-close';closer.type='button';closer.textContent='×';closer.setAttribute('aria-label','Закрыть действия');side.prepend(closer);
 const heading=document.createElement('div');heading.id='hud599-title';heading.textContent='Боевые действия';side.prepend(heading);
 const preview=document.getElementById('vfx57-open'),previewHome=preview?.parentElement,techPanel=document.getElementById('jutsuPanel');
 const names={fight:'Бой',jutsu:'Дзюцу',items:'Предметы',clones:'Отряд',log:'Журнал'};
 let open=false;let previousMode=null;
 const close=()=>{open=false;screen.classList.remove('hud599-open');nav.querySelectorAll('[data-ux-tab]').forEach(b=>b.setAttribute('aria-expanded','false'));};
 const show=mode=>{
   if(!compact.matches)return;
   window.__arena55.selectMode(mode);
   heading.textContent=names[mode]||'Действия';
   open=true;screen.classList.add('hud599-open');
   nav.querySelectorAll('[data-ux-tab]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.uxTab===mode)));
   side.scrollTop=0;
 };
 function adapt(){
   if(compact.matches){
     if(nav.parentElement!==screen)screen.append(nav);
     if(preview&&techPanel&&preview.parentElement!==techPanel.parentElement)techPanel.before(preview);
   }else{
     close();if(nav.parentElement!==side)side.prepend(nav);
     if(preview&&previewHome&&preview.parentElement!==previewHome)previewHome.append(preview);
   }
 }
 // Preserve the original zoom buttons while filling the portrait board with real canvas.
 // The inherited zoom code writes 760px inline !important; CSS alone cannot override it.
 function resizeCanvas(){
   if(!screen.classList.contains('active')||!compact.matches)return;
   const canvas=document.getElementById('board');if(!canvas)return;
   const zoom=Math.max(.35,Math.min(2.5,(parseInt(document.getElementById('zoomValue')?.textContent||'100',10)||100)/100));
   const portrait=window.matchMedia('(max-width:550px) and (orientation:portrait)').matches;
   if(portrait){
     const base=Math.max(760,Math.min(1500,Math.round((window.innerHeight-48)*1.65)));
     canvas.style.setProperty('width',Math.round(base*zoom)+'px','important');
     canvas.style.setProperty('min-width',Math.round(base*zoom)+'px','important');
   } else if(window.matchMedia('(max-width:740px)').matches){
     canvas.style.setProperty('width',Math.round(760*zoom)+'px','important');
     canvas.style.setProperty('min-width',Math.round(760*zoom)+'px','important');
   } else {
     canvas.style.removeProperty('min-width');
     canvas.style.setProperty('width',(100*zoom)+'%','important');
   }
 }
 adapt();
 compact.addEventListener?.('change',()=>{adapt();requestAnimationFrame(resizeCanvas)});
 const watchScreen=new MutationObserver(()=>requestAnimationFrame(resizeCanvas));
 watchScreen.observe(screen,{attributes:true,attributeFilter:['class']});
 for(const id of ['zoomIn','zoomOut'])document.getElementById(id)?.addEventListener('click',()=>requestAnimationFrame(resizeCanvas));
 window.addEventListener('resize',()=>requestAnimationFrame(resizeCanvas));
 nav.addEventListener('click',e=>{
   const b=e.target.closest('button[data-ux-tab]');if(!b||!compact.matches)return;
   const key=b.dataset.uxTab;
   // The game's original navigation click handler has already selected the mode.
   if(open&&previousMode===key)close();else show(key);
   previousMode=key;
 });
 closer.addEventListener('click',close);scrim.addEventListener('click',close);
 screen.addEventListener('pointerdown',e=>{
   if(open&&e.target.closest('.boardwrap'))close();
 });
 document.addEventListener('click',e=>{
   if(!compact.matches||!open)return;
   const action=e.target.closest('#arenaScreen #actionButtons button[data-action], #arenaScreen #jutsuPanel button[data-tech], #arenaScreen #arena58-summons .ability');
   if(action&&!action.disabled)requestAnimationFrame(close);
 },true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&compact.matches)close();});
 screen.querySelector('#retreat')?.addEventListener('click',close);
 window.__hud599={show,close,get opened(){return open},get compact(){return compact.matches}};
})();
