
(()=>{'use strict';
  const setup=document.getElementById('setupScreen');
  const learning=document.getElementById('jutsuLearning');
  if(!setup||!learning||typeof window.renderSetup!=='function')return;
  // Insert after each refresh: learning rows are regenerated on school switch,
  // so event handlers attached to individual rows would otherwise disappear.
  function decorate(){
    if(!learning.querySelector('#jutsu-back-stats')){
      const btn=document.createElement('button');
      btn.id='jutsu-back-stats';btn.type='button';
      btn.textContent='↑ К характеристикам';
      btn.setAttribute('aria-label','Вернуться к характеристикам персонажа');
      const tabs=learning.querySelector('.school-tabs');
      if(tabs)tabs.before(btn);else learning.prepend(btn);
    }
  }
  const previous=window.renderSetup;
  window.renderSetup=function(...args){
    const result=previous.apply(this,args);
    decorate();return result;
  };
  learning.addEventListener('click',event=>{
    if(!event.target.closest('#jutsu-back-stats'))return;
    const target=setup.querySelector('#fighterCard .statsgrid')||setup.querySelector('#fighterCard');
    target?.scrollIntoView({behavior:'smooth',block:'start',inline:'nearest'});
  });
  decorate();
})();
