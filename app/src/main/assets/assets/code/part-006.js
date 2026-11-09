
(function(){
'use strict';
const VERSION='3.0.1';
const stats={movement:0,attack:0,reactions:0,telegraph:0,input:0};
const prefs={reduceMotion:false,contrast:false};
const actions=['move','melee','quick','heavy','guard'];
const root=document.getElementById('arenaScreen'),field=document.querySelector('#arenaScreen .boardwrap');
const unitTabs=document.getElementById('battleTabs');
const ui=document.createElement('div');ui.id='arena29-controls';
ui.innerHTML='<button type="button" id="arena29-prev" title="Выбрать предыдущего шиноби (Q)">◀ Боец</button><button type="button" id="arena29-next" title="Выбрать следующего шиноби (E)">Боец ▶</button><button type="button" id="arena29-move" title="Перемещение (1)">Ходьба</button><button type="button" id="arena29-strike" title="Удар (2)">Удар</button><button type="button" id="arena29-jutsu" title="К дзюцу">Дзюцу</button><label><input type="checkbox" id="arena29-contrast"> Контраст</label><label><input type="checkbox" id="arena29-motion"> Меньше движения</label><span id="arena29-feed" aria-live="polite"></span>';
const panel=document.querySelector('#arenaScreen .boardpanel');
panel?.insertBefore(ui,panel.querySelector('.boardwrap'));
const tip=document.createElement('div');tip.id='arena29-target';tip.dataset.active='false';tip.setAttribute('aria-live','polite');field?.insertBefore(tip,field.firstChild);
const feed=document.getElementById('arena29-feed');
function announce(t){if(feed)feed.textContent=t;}
function allyFighters(){return (!game?[]:game.units.filter(u=>u.team==='ally'&&!u.isClone&&!u.isSummon&&u.hp>0));}
function choose(relative){if(!game||game.over||game.animating||game.phase!=='ally')return false;
 const allies=allyFighters();if(!allies.length)return false;const idx=allies.findIndex(u=>u.id===game.selected);
 const next=allies[(idx+relative+allies.length)%allies.length];game.selected=next.id;game.action='move';renderGame();announce(next.name);stats.input++;return true;
}
function chooseAction(a){if(!game||game.over||game.animating||game.phase!=='ally'||!me()||me().isSummon)return false;
 const act=ACTIONS.find(x=>x.id===a);if(!act||!actionAvailable(me(),a))return false;
 if(a==='guard'){execute(me(),'guard',{c:me().c,r:me().r});announce('Защитная стойка');stats.input++;return true;}
 game.action=a;renderGame();announce('Выбрано: '+act.name);stats.input++;return true;
}
ui.querySelector('#arena29-prev').onclick=()=>choose(-1);
ui.querySelector('#arena29-next').onclick=()=>choose(1);
ui.querySelector('#arena29-move').onclick=()=>chooseAction('move');
ui.querySelector('#arena29-strike').onclick=()=>chooseAction('melee');
ui.querySelector('#arena29-jutsu').onclick=()=>{document.querySelector('#jutsuPanel')?.scrollIntoView({behavior:'smooth',block:'nearest'});stats.input++};
ui.querySelector('#arena29-contrast').onchange=e=>{prefs.contrast=e.target.checked;root.classList.toggle('arena29-contrast',prefs.contrast);if(game)draw()};
ui.querySelector('#arena29-motion').onchange=e=>{prefs.reduceMotion=e.target.checked;};
document.addEventListener('keydown',e=>{if(!root.classList.contains('active')||e.altKey||e.ctrlKey||e.metaKey)return;
 const tag=e.target?.tagName||'';if(['INPUT','TEXTAREA','SELECT'].includes(tag)||e.target?.isContentEditable)return;
 if(game?.pendingCounter)return;
 let handled=true;
 switch(e.key.toLowerCase()){
  case 'q': choose(-1);break;
  case 'e':choose(1);break;
  case '1':chooseAction('move');break;
  case '2':chooseAction('melee');break;
  case '3':chooseAction('quick');break;
  case '4':chooseAction('heavy');break;
  case '5':chooseAction('guard');break;
  case 'escape':if(game&&game.phase==='ally'){game.action='move';renderGame();}break;
  default:handled=false;
 }
 if(handled){e.preventDefault();stats.input++;}
});
// Stage 2.6: weapon/projectile trails. The base renderer still owns hit detection.
function drawMotion(){if(!game)return;const fx=(typeof activeFx==='undefined'?null:activeFx);
 if(!fx||fx.world!==game)return;
 const t=fx.progress||0;if(!fx.from||!fx.target)return;
 const a=center(fx.from.c,fx.from.r),b=center(fx.target.c,fx.target.r);
 ctx.save();
 if(fx.action==='move'&&fx.path?.length){stats.movement++;
  const unit=game.units.find(u=>u.id===fx.actor);if(unit){const pos=spritePos(unit,center(unit.c,unit.r));
   ctx.globalAlpha=.28*(1-t);ctx.fillStyle='#c9c6a6';for(let i=0;i<3;i++){const angle=i*2.4+t*4;
     ctx.beginPath();ctx.arc(pos.x+Math.cos(angle)*18,pos.y+10+Math.sin(angle)*5,2.5+i*.8,0,Math.PI*2);ctx.fill()}
  }
 }
 if(MELEE_TYPES.has(fx.action)){stats.attack++;
   if(t>.16&&t<.82){const rr=fx.action==='heavy'?30:fx.action==='quick'?18:23;
    ctx.globalAlpha=Math.sin(Math.PI*(t-.16)/.66)*.8;ctx.lineWidth=fx.action==='heavy'?6:3;
    ctx.lineCap='round';ctx.strokeStyle=fx.action==='heavy'?'#ffa87e':'#e4eef4';
    ctx.beginPath();ctx.arc(b.x,b.y-33,rr,-1.65,1.05);ctx.stroke();
   }
 }
 if(['kunai','shuriken','senbon','poison','jutsu','illusion'].includes(fx.action)){stats.attack++;
  const progress=Math.max(0,Math.min(1,(t-.12)/.65));const xx=a.x+(b.x-a.x)*progress,yy=a.y-28+(b.y-a.y)*progress;
  ctx.lineWidth=fx.action==='jutsu'?3:2;ctx.globalAlpha=(1-progress)*.65;
  ctx.strokeStyle=fx.action==='jutsu'?'#9be4e8':'#e4f0fa';
  ctx.beginPath();ctx.moveTo(xx-(b.x-a.x)*.12,yy-(b.y-a.y)*.12);ctx.lineTo(xx,yy);ctx.stroke();
 }
 ctx.restore();}
// Stage 2.7: lasting readable hit/block/dodge signals and injury hints.
const recent=[];
const previousDamage=window.damage;
window.damage=function(a,b,...args){const hp=b.hp;const result=previousDamage(a,b,...args),lost=Math.max(0,hp-b.hp);
 if(lost>0){recent.push({c:b.c,r:b.r,at:Date.now(),label:'−'+lost,color:'#ffb49f'});}
 else if(b.reaction&&Date.now()-b.reaction.at<140){const kind=b.reaction.kind;
   recent.push({c:b.c,r:b.r,at:Date.now(),label:kind==='block'?'БЛОК':kind==='dodge'?'УКЛОН':'МИМО',color:kind==='block'?'#a1e9f4':'#def4c5'});
 }
 while(recent.length>20)recent.shift();stats.reactions++;return result;
};
function drawReactions(){if(!game)return;const now=Date.now();ctx.save();
 for(const item of recent){const age=now-item.at;if(age>=950)continue;
  const p=center(item.c,item.r);const opacity=1-age/950;
  ctx.globalAlpha=opacity;ctx.textAlign='center';ctx.font='bold 15px system-ui';ctx.lineWidth=3;
  ctx.strokeStyle='#081b20';ctx.fillStyle=item.color;
  const ypos=p.y-72-age*.035;ctx.strokeText(item.label,p.x,ypos);ctx.fillText(item.label,p.x,ypos);
 }
 ctx.restore();
}
// Stage 2.8: precise targeting feedback, legal target state, and friendly-fire preview.
function actionPreview(){if(!game||game.over||game.phase!=='ally'||game.animating||!game.hoverCell||!me())return null;
 const u=me(),cell=game.hoverCell,a=game.action,target=unitAt(cell.c,cell.r),d=dist(u,cell);
 const t=a?.startsWith('tech:')?window.__arena18?.TECHS?.find(t=>t.id===a.slice(5)):null;
 let radius=['smoke','paper','flash','poisonBomb'].includes(a)?2:t&&(t.kind==='blast'||t.kind==='weaponAttack')?1:0;
 let text='',ok=false;
 if(a==='move') {const path=pathTo(u,cell.c,cell.r);ok=!!path&&path.length>0&&path.length<=u.ap;text=ok?`Ход: ${path.length} гекс. ОД: ${path.length}`:'Переход недоступен';}
 else if(a?.startsWith('pet:')){ok=!!target&&target.team!==u.team&&d===1;text=ok?'Атака призванного существа':'Нужен соседний враг';}
 else if(t){ok=(u.learned||[]).includes(t.id)&&u.ap>=t.ap&&u.chakra>=t.ch&&d<=t.range;
  if(t.kind==='summon'||t.kind==='clone'||t.kind==='wall')ok=ok&&!target&&!obstacle(cell.c,cell.r)&&(!['clone','summon'].includes(t.kind)||d===1);
  else if(['hit','blast','line','chain','weaponAttack'].includes(t.kind))ok=ok&&!!target&&target.team!==u.team&&lineClear(u,cell);
  text=`${t.name}: ${t.ap} ОД, ${t.ch} чакры`;
 } else if(MELEE_TYPES.has(a)){ok=!!target&&target.team!==u.team&&d===1&&u.ap>=(ACTIONS.find(v=>v.id===a)?.ap||99);
  if(ok){const value=hitChance(u,target,a==='sword'?'sword':'melee');text=`Ближний бой · ~${value}% · d20`;}
  else text='Для удара нужен соседний враг';
 } else if(['kunai','shuriken','senbon','poison','jutsu','illusion'].includes(a)){const max=a==='senbon'?5:a==='illusion'?3:4;
  ok=!!target&&target.team!==u.team&&d>0&&d<=max&&lineClear(u,cell);
  text=ok?`Стрельба: ~${hitChance(u,target,a==='jutsu'?'jutsu':'throw')}%`:'Цель вне зоны стрельбы';
 } else if(['smoke','paper','flash','poisonBomb'].includes(a)){ok=d<=4&&inBoard(cell.c,cell.r)&&(u.gear?.[a]||0)>0;
  const affected=aoeUnits(cell,2);const friendly=affected.filter(x=>x.team===u.team).length,foes=affected.filter(x=>x.team!==u.team).length;
  text=`Радиус 2 · свои ${friendly}, враги ${foes}${a==='paper'?' · урон своим!':a==='poisonBomb'?' · яд действует на своих!':''}`;
 }else{text=a||'';}
 return {ok,text,radius,cell,action:a};
}
const oldDraw=window.draw;
window.draw=function(){oldDraw();if(!game)return;
 drawMotion();drawReactions();
 const tipData=actionPreview();if(!tipData){tip.dataset.active='false';return}
 const c=tipData.cell;
 const size=tipData.radius;
 if(size>0){ctx.save();for(let r=0;r<H;r++)for(let col=0;col<W;col++)if(dist({c:col,r},c)<=size){hexPath(col,r);ctx.fillStyle=tipData.ok?'rgba(242,190,99,.16)':'rgba(242,90,90,.12)';ctx.fill();ctx.strokeStyle='rgba(255,215,137,.36)';ctx.lineWidth=1.5;ctx.stroke();}ctx.restore()}
 tip.dataset.active='true';tip.textContent=(tipData.ok?'✓ ':'✕ ')+tipData.text;stats.telegraph++;
};
// Do not loop if the tab is invisible; update only during effects and short-lived reactions.
setInterval(()=>{if(!game||!root.classList.contains('active')||document.visibilityState==='hidden')return;
 const fx=(typeof activeFx==='undefined'?null:activeFx);if(fx||recent.some(x=>Date.now()-x.at<950))draw();},140);
const startBattle29=window.newGame;
window.newGame=function(){const value=startBattle29();document.getElementById('arenaScreen')?.scrollIntoView({block:'start',behavior:'instant'});return value;};
window.__arena29={VERSION,stats,prefs,choose,chooseAction,actionPreview,allyFighters,get tip(){return tip.textContent;}};
announce('Боевая панель: Q/E — бойцы; 1–5 — приёмы.');
})();
