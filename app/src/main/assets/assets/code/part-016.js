
(()=>{
 'use strict';
 const beforeRender=window.renderGame;
 window.renderGame=function(){
  beforeRender();
  if(!game||!document.querySelector('#arenaScreen.active'))return;
  const tabs=document.querySelector('#battleTabs');
  if(!tabs)return;
  const copies=game.units.filter(u=>u.team==='ally'&&u.isClone&&u.hp>0&&u.cloneKind!=='illusion');
  for(const c of copies){
   const b=document.createElement('button');b.dataset.id=c.id;
   b.className='arena542-clone-tab'+(game.selected===c.id?' selected':'');
   b.textContent=`${c.cloneKind==='shadow'?'Теневой':'Стихийный'} · ${c.ap} ОД / ${c.chakra} Ч`;
   b.title='Управление физическим клоном: доступные изученные дзюцу оригинала';
   b.onclick=()=>{game.selected=c.id;game.action='move';window.renderGame()};
   tabs.appendChild(b);
  }
  const u=me();if(u?.isClone&&u.cloneKind!=='illusion'){
    const info=document.querySelector('#unitInfo');if(info){
     const note=document.createElement('div');note.className='arena542-note';
     note.textContent='Физический клон · применяет изученные техники за собственную чакру. Можно управлять вручную.';
     info.append(note);
    }
  }
 };
 const beforeExecute=window.execute;
 window.execute=function(u,action,cell){
  const ap=u?.ap,chakra=u?.chakra;
  const result=beforeExecute(u,action,cell);
  if(u?.isClone&&u.cloneKind!=='illusion'&&result!==false&&(u.ap<ap||u.chakra<chakra))u.__actedThisRound=true;
  return result;
 };
 window.__arena542={version:'5.4.2',get cloneCount(){return game?.units?.filter(u=>u.isClone&&u.hp>0).length||0},
   isPhysicalClone:u=>!!u?.isClone&&u.cloneKind!=='illusion',canUseNinjutsu:u=>!!u?.isClone&&u.cloneKind!=='illusion'&&u.chakra>0&&(u.learned?.length||0)>0};
})();
