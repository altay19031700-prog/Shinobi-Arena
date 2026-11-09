
(()=>{'use strict';
const screen=document.getElementById('arenaScreen'),side=screen?.querySelector('.side'),nav=document.getElementById('ux55-nav');
if(!screen||!side||!nav)return;
const desktop=matchMedia('(min-width:1100px)'),sections={fight:'actions',items:'actions',jutsu:'jutsu',clones:'fighter',log:'log'};
function close(){side.querySelectorAll('.bottom-popup').forEach(p=>p.classList.remove('bottom-popup'));nav.querySelectorAll('[data-ux-tab]').forEach(b=>b.setAttribute('aria-expanded','false'));delete side.dataset.bottomTab;}
nav.addEventListener('click',e=>{
 const b=e.target.closest('[data-ux-tab]');if(!b||!desktop.matches)return;
 const key=b.dataset.uxTab,panel=side.querySelector('[data-ux55-section="'+sections[key]+'"]');
 const was=panel?.classList.contains('bottom-popup')&&side.dataset.bottomTab===key;close();
 if(!panel||was)return;
 panel.classList.add('bottom-popup');side.dataset.bottomTab=key;b.setAttribute('aria-expanded','true');
 if(!panel.querySelector('.desktop-popup-close')){const c=document.createElement('button');c.type='button';c.className='desktop-popup-close';c.textContent='Закрыть';c.setAttribute('aria-label','Закрыть панель действий');c.addEventListener('click',close);panel.prepend(c);}
 panel.scrollTop=0;
});
screen.querySelector('.boardwrap')?.addEventListener('pointerdown',()=>{if(desktop.matches)close()});
document.addEventListener('keydown',e=>{if(desktop.matches&&e.key==='Escape')close()});
document.addEventListener('click',e=>{if(!desktop.matches)return;const b=e.target.closest('#actionButtons button[data-action],#jutsuPanel button[data-tech],#arena58-summons .ability');if(b&&!b.disabled)requestAnimationFrame(close)},true);
desktop.addEventListener('change',close);document.getElementById('retreat')?.addEventListener('click',close);
window.__desktopPanels={close,get opened(){return side.dataset.bottomTab||null}};
})();

