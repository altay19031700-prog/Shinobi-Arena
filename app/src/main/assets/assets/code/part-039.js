
(()=>{
 const prior=window.renderGame;
 window.renderGame=function(...args){const out=prior.apply(this,args);if(!game)return out;
  const u=me(),panel=document.getElementById('unitInfo');
  if(u&&panel){const stats=document.createElement('div');stats.className='shinobi515-status';stats.textContent=`Выносливость ${u.attrs?.end||0} · Рана ${u.wound||0} · Ожог ${u.burn||0} · Яд ${u.poison||0} · Чакра ${u.chakra}/${u.maxChakra}`;panel.append(stats);}
  const hud=document.getElementById('arena541-rangehud'),t=window.__arena541?.tech(game.action),cell=game.hoverCell;
  if(hud&&u&&t&&cell){if(t.kind==='blast')hud.textContent+=` · Взрыв: радиус 1, задевает своих`;if(t.kind==='line')hud.textContent+=' · Все на линии, включая своих';}
  return out;
 };
 const css=document.createElement('style');css.textContent='.shinobi515-status{color:#e9c58d;font-size:12px;border:1px solid #735c3b;background:#2b261d;padding:5px;margin-top:5px;border-radius:4px}';document.head.append(css);
 const board=document.getElementById('board');
 if(board)board.addEventListener('click',e=>{
  if(!game||game.over||!window.matchMedia('(pointer:coarse)').matches)return;
  const t=window.__arena541?.tech(game.action),needsConfirm=['paper','flash','smoke','poisonBomb'].includes(game.action)||['blast','line','chain'].includes(t?.kind);
  if(!needsConfirm){game.__shinobi515Confirm=null;return;}
  const rc=board.getBoundingClientRect(),cx=(e.clientX-rc.left)*board.width/rc.width,cy=(e.clientY-rc.top)*board.height/rc.height;
  const tile=closestCell(cx,cy);if(!tile)return;
  const signature=game.action+':'+game.selected+':'+tile.c+':'+tile.r;
  if(game.__shinobi515Confirm!==signature){e.preventDefault();e.stopImmediatePropagation();game.__shinobi515Confirm=signature;game.hoverCell=tile;draw();log('Зона воздействия показана. Нажми тот же гекс ещё раз для применения.','good');}
  else game.__shinobi515Confirm=null;
 },true);
 window.__shinobi515={version:'5.16',mitigate:enduranceMitigation,wound:applyElementalWound,elemental:elementalDamage};
})();
