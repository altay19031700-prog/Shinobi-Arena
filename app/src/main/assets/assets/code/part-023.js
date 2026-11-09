
/* SHINOBI 5.7.2: unlock turn controls, recover stalled animations safely. */
(()=>{
 'use strict';
 const END_IDS=new Set(['ux55-end','arena544-next','endTurn']);
 let queuedFor=null,working=false,queuedAt=0,recoveryCount=0,completedTurnCount=0,failedTurnCount=0,manualCount=0;
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 function alive(g){return !!g&&game===g&&!g.over&&g.phase==='ally'}
 function status(){
   if(!game||!document.querySelector('#arenaScreen.active'))return;
   const active=game.phase==='ally'&&!game.over;
   const footer=document.getElementById('ux55-end'),bar=document.getElementById('arena544-next'),old=document.getElementById('endTurn');
   // There must always be an escape route while an animation is rendering.
   for(const b of [footer,bar,old])if(b)b.disabled=!active;
   const text=queuedFor===game?'⏳ Ход после анимации · нажми ещё раз для ускорения':
     game.phase==='ally'?'Ход ✓':'Ход ИИ…';
   if(footer)footer.textContent=text;
   if(bar)bar.textContent=queuedFor===game?'Завершение после анимации… (повторить для ускорения)':
     game.phase==='ally'?'Завершить ход':'Ход противника…';
 }
 function recover(reason){
   if(!game)return false;
   const f=window.__shinobiFXRecovery;
   const snapshot=f?.state;
   if(!snapshot?.busy&&!snapshot?.fx&&!snapshot?.queued){
      if(game.animating){game.animating=false;try{renderGame()}catch(e){console.error(e)}return true}
      return false;
   }
   const done=f.complete(reason);
   if(done){recoveryCount++;console.warn('Восстановлена застрявшая анимация:',reason,snapshot)}
   return !!done;
 }
 async function completeTurn(source){
   if(working)return;
   working=true;
   try{
    // Allow the pending hand-seal promise to finish casting, and the resulting effects to settle.
    for(let tries=0;tries<125&&alive(source)&&queuedFor===source;tries++){
      if(source.animating||window.__shinobiFXRecovery?.state?.fx||window.__shinobiFXRecovery?.state?.queued){
        // Normal seals 0.2-2.5 seconds; allow 4 seconds before force-settling a hung effect.
        if(Date.now()-queuedAt>4200&&tries%8===0)recover('тайм-аут ожидания завершения хода');
        await sleep(105);continue;
      }
      // Pending seal Promise.then can queue a second effect in this turn of the event loop.
      await sleep(135);
      if(source.animating)continue;
      if(!alive(source))break;
      queuedFor=null;
      try{
       await window.enemyTurn();completedTurnCount++;
      }catch(error){
       failedTurnCount++;console.error('Ошибка передачи хода:',error);
       if(game===source&&!source.over){source.phase='ally';source.animating=false;recover('ошибка хода противника');
        try{renderGame()}catch(e){console.error(e)}}
      }
      return;
    }
    if(queuedFor===source){
      queuedFor=null;
      if(alive(source)){
        recover('аварийная разблокировка');
        // The next click is still possible; nothing remains permanently disabled.
        console.warn('Не получилось завершить ход: игрок может повторить команду');
      }
    }
   }finally{working=false;queueMicrotask(status)}
 }
 function requestEnd(){
  if(!game||game.over||game.phase!=='ally')return false;
  if(queuedFor===game){manualCount++;recover('повторное нажатие завершения хода');status();return true;}
  queuedFor=game;queuedAt=Date.now();status();completeTurn(game);return true;
 }
 // Capture BEFORE previous UI versions. All three buttons should behave the same.
 document.addEventListener('click',event=>{
   const btn=event.target?.closest?.('button');if(!btn||!END_IDS.has(btn.id))return;
   event.preventDefault();event.stopImmediatePropagation();
   requestEnd();
 },true);
 const oldRender=window.renderGame;
 window.renderGame=function(...args){
   const result=oldRender.apply(this,args);
   status();return result;
 };
 // Recovery for temporarily suspended Firefox/background browser animation frames.
 let busySince=0;
 setInterval(()=>{
   if(!game||game.over)return;
   const f=window.__shinobiFXRecovery?.state;
   if(game.animating){
     if(!busySince)busySince=Date.now();
     if(Date.now()-busySince>6000){recover('длительная блокировка анимации');busySince=0;}
   }else busySince=0;
   if(queuedFor===game||game.phase==='ally')status();
 },350);
 window.__arena571={version:'5.7.2',requestEnd,recover,get state(){return {phase:game?.phase,busy:game?.animating,queued:queuedFor===game,working,recoveryCount,completedTurnCount,failedTurnCount,manualCount,fx:window.__shinobiFXRecovery?.state}}};
})();
