
(()=>{
 'use strict';
 const previousRender=window.renderGame;
 let endQueued=false;
 async function endAfterAnimations(){
   const current=game;
   const until=Date.now()+20000;
   while(game===current&&current&&!current.over&&current.phase==='ally'&&Date.now()<until){
      try{if(current.animating)await Promise.race([waitFx(),new Promise(resolve=>setTimeout(resolve,800))]);}
      catch(err){console.error('Waiting for animation before ending:',err)}
      // A ninjutsu release can queue a SECOND animation on the very same tick.
      await new Promise(resolve=>setTimeout(resolve,110));
      if(current.animating)continue;
      endQueued=false;
      const old=document.getElementById('endTurn');
      if(old&&!old.disabled)old.click();
      window.renderGame();
      return;
   }
   endQueued=false;
   if(game===current&&!current.over){log('Анимация не завершилась; повтори завершение хода.','hurt');window.renderGame();}
 }
 window.renderGame=function(){
   previousRender();
   if(!game||!document.querySelector('#arenaScreen.active'))return;
   const tabs=document.getElementById('battleTabs');
   if(!tabs)return;
   let bar=document.getElementById('arena544-bar');
   if(!bar){
      bar=document.createElement('div');bar.id='arena544-bar';
      tabs.insertAdjacentElement('afterend',bar);
   }
   const u=me();
   bar.innerHTML=`<span class="arena544-state">${u?.isClone?(u.cloneKind==='illusion'?'Иллюзорный клон: приманка':`${u.cloneKind==='shadow'?'Теневой':'Стихийный'} клон · ${u.ap} ОД · ${u.chakra} чакры`):'Выбери бойца или клона'}</span><button id="arena544-next" type="button">${game.phase==='ally'?'Завершить ход':'Ход противника…'}</button>`;
   const btn=bar.querySelector('button');
   btn.disabled=game.phase!=='ally'||game.over||endQueued;
   if(endQueued)btn.textContent='Ждём окончания анимации…';
   btn.onclick=()=>{
     if(!game||game.over||game.phase!=='ally'||endQueued)return;
     // The preparation seals and released ninjutsu are separate queued effects.
     // Never silently ignore end-turn input during either animation.
     if(game.animating){
       endQueued=true;window.renderGame();
       endAfterAnimations().catch(err=>{console.error('Queued end turn:',err);endQueued=false;window.renderGame()});
     }else document.getElementById('endTurn').click();
   };
 };
 // Render once for already running battles and keep independent of game sprites.
 if(game)window.renderGame();
 window.__arena544={version:'5.4.4',get phase(){return game?.phase},get selected(){return game?.selected},get clones(){return game?.units?.filter(u=>u.isClone&&u.hp>0).length||0}};
})();
