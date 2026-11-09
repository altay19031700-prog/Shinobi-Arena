
(()=>{
  'use strict';
  const original=window.checkEnd;
  const debrief=document.getElementById('arena572-outcome');
  const review=document.getElementById('arena572-review');
  const back=document.getElementById('arena572-return');
  let observedBattle=null,printed=0,reviewMode=false;
  function safe(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function real(team){return game?.units?.filter(u=>u.team===team&&!u.isClone&&!u.isSummon)||[];}
  function outcome(){
    if(!game)return;
    const allies=real('ally');
    const foes=real('enemy');
    const aliveAllies=allies.filter(u=>u.hp>0);
    const aliveFoes=foes.filter(u=>u.hp>0);
    const aliveCopies=game.units.filter(u=>u.team==='ally'&&u.isClone&&u.hp>0);
    const result=aliveAllies.length>0?'Победа':'Поражение';
    const reason=aliveAllies.length===0
      ?`Последний настоящий шиноби выведен из боя. Состояние: ${allies.map(u=>`${u.name}: ${u.hp}/${u.maxHp} HP`).join(', ')||'в составе нет настоящих бойцов'}.`
      :`Настоящих бойцов осталось ${aliveAllies.length}, противников осталось ${aliveFoes.length}.`;
    const liveCloneNote=aliveCopies.length
      ?`Осталось ${aliveCopies.length} живых клонов. Клоны не заменяют оригиналов: если все настоящие бойцы погибли, бой проигран.`
      :`Живых клонов не осталось. Исчезновение клона само по себе не считается поражением.`;
    const entries=[...document.querySelectorAll('#combatLog > div')].slice(0,7);
    const safeLog=entries.map(e=>`<li>${safe(e.textContent)}</li>`).join('') || '<li>Записей журнала нет.</li>';
    debrief.innerHTML=`<h3>Почему ${result.toLowerCase()}? · раунд ${Number(game.round)||1}</h3>`+
      `<p>${safe(reason)}</p><p class="arena572-explain">${safe(liveCloneNote)}</p>`+
      `<p class="arena572-explain">Последние видимые события перед завершением боя:</p><ul>${safeLog}</ul>`;
    printed++;
    observedBattle=game;
  }
  window.checkEnd=function(...args){
    const wasOver=!!game?.over;
    const value=original.apply(this,args);
    if(game?.over&&!wasOver)outcome();
    return value;
  };
  function setReview(open){
    if(!game?.over)return false;
    reviewMode=open;
    if(open){showScreen('arenaScreen');back.hidden=false;}
    else{showScreen('resultScreen');back.hidden=true;}
    return true;
  }
  review.addEventListener('click',()=>setReview(true));
  back.addEventListener('click',()=>setReview(false));
  document.getElementById('again').addEventListener('click',()=>{reviewMode=false;back.hidden=true;},true);
  document.getElementById('backToSetup').addEventListener('click',()=>{reviewMode=false;back.hidden=true;},true);
  // Keep review in a truly read-only state. Existing arena handlers also check game.over.
  const oldNew=window.newGame;
  window.newGame=function(...args){reviewMode=false;back.hidden=true;debrief.textContent='';return oldNew.apply(this,args)};
  window.__arena572={version:'5.7.2',get diagnostics(){return {printed,round:game?.round,over:!!game?.over,reviewMode,realAllies:real('ally').length,aliveAllies:real('ally').filter(u=>u.hp>0).length,clones:game?.units.filter(u=>u.team==='ally'&&u.isClone&&u.hp>0).length||0}},show:()=>setReview(true),back:()=>setReview(false)};
})();
