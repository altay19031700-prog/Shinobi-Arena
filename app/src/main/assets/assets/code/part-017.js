
(()=>{
 'use strict';
 window.__arena543={version:'5.4.3',canAim,visibleToSide,smokeBlocksAim,
  concussion:(u)=>({turns:u.concussed||0,stunned:!!u.stun,prone:!!u.prone,slow:!!u.slow})};
 const prevRender=window.renderGame;
 window.renderGame=function(){prevRender();if(!game)return;
  const info=document.getElementById('unitInfo'),u=game.units.find(v=>v.id===game.selected);
  if(info&&u?.concussed){const el=document.createElement('div');el.className='arena543-concussion';
   el.textContent='⚠ КОНТУЗИЯ · −20% меткости · замедление · '+u.concussed+' ход(а)';info.append(el);}
 };
})();
