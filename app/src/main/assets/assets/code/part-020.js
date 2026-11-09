
/* SHINOBI ARENA 5.5.1 — Stat explanations and illusion clone controls */
(()=>{
'use strict';
const ATTR_HELP={
 str:['Сила','Увеличивает базовый урон успешных атак: +1 при каждом втором пункте силы. Бонус учитывается при ударах, бросках и атакующих дзюцу.',p=>`Бонус к урону сейчас +${Math.floor(p.attrs.str/2)}; при +1 станет +${Math.floor((p.attrs.str+1)/2)}.`],
 per:['Восприятие','Каждый пункт даёт +3 процентных пункта к базовому шансу попадания и делает персонажа устойчивее к вражескому гендзюцу.',p=>`Базовая поправка к меткости +${p.attrs.per*3} п.п.; при +1 будет +${(p.attrs.per+1)*3} п.п.`],
 end:['Выносливость','Каждый пункт увеличивает максимальное здоровье на 7 HP.',p=>`Максимум HP: ${45+p.attrs.end*7} → ${45+(p.attrs.end+1)*7} при +1.`],
 int:['Интеллект','Каждый пункт даёт +5 к максимальному запасу чакры и +2 процентных пункта к базовому шансу наложить гендзюцу.',p=>`Чакра: ${22+p.attrs.int*5} → ${22+(p.attrs.int+1)*5}; бонус к гендзюцу +${p.attrs.int*2} → +${(p.attrs.int+1)*2} п.п.`],
 agi:['Ловкость','Увеличивает уклонение, затрудняет попадание по тебе (−2 п.п. врагу за пункт), а каждый третий пункт может добавить 1 очко действий за ход (максимум 10).',p=>`ОД за ход: ${Math.min(10,Math.max(6,6+Math.floor(p.attrs.agi/3)))} → ${Math.min(10,Math.max(6,6+Math.floor((p.attrs.agi+1)/3)))}; базовое уклонение +${(p.attrs.agi*1.5).toFixed(1)}%.`],
};
const SKILL_HELP={
 taijutsu:['Тайдзюцу','Точность обычных ударов, подсечек и других безоружных приёмов. +1 п.п. к базовому шансу попадания примерно за каждые 3 пункта навыка.',p=>`Бонус сейчас +${Math.floor(p.skills.taijutsu/3)} п.п.; после улучшения на 5 будет +${Math.floor((p.skills.taijutsu+5)/3)} п.п.`],
 kenjutsu:['Кендзюцу','Точность ударов мечом; также помогает блокировать атаки спереди, когда меч экипирован или поставлена защита.',p=>`Бонус меткости меча +${Math.floor(p.skills.kenjutsu/3)} → +${Math.floor((p.skills.kenjutsu+5)/3)} п.п.; блок +${Math.floor(p.skills.kenjutsu/8)} → +${Math.floor((p.skills.kenjutsu+5)/8)} п.п.`],
 throw:['Метательное оружие','Точность кунаев, сюрикенов, сенбонов и ядовитых метательных атак.',p=>`Бонус +${Math.floor(p.skills.throw/3)} → +${Math.floor((p.skills.throw+5)/3)} п.п. при улучшении на 5.`],
 ninjutsu:['Ниндзюцу','Точность атакующих техник стихий, использующих шанс попадания. Не заменяет изучение конкретного дзюцу.',p=>`Бонус +${Math.floor(p.skills.ninjutsu/3)} → +${Math.floor((p.skills.ninjutsu+5)/3)} п.п. при улучшении на 5.`],
 genjutsu:['Гендзюцу','Усиливает наступательные иллюзии и сопротивление чужим. Также для защиты важны восприятие и контроль чакры. Каждые 5 пунктов меняют шанс примерно на 2 п.п.',p=>`Навык ${p.skills.genjutsu}. Мираж и Кай доступны сразу; остальные техники изучаются отдельно во вкладке Гендзюцу.`],
 control:['Контроль чакры','Сокращает расход чакры базового гендзюцу и базового атакующего ниндзюцу (ступени каждые 35 очков), ускоряет складывание печатей и помогает удержать концентрацию.',p=>`Базовое ниндзюцу: ${Math.max(4,9-Math.floor(p.skills.control/35))} → ${Math.max(4,9-Math.floor((p.skills.control+5)/35))} чакры; время одного этапа печатей ≈ ${Math.round(320*(1-p.skills.control*.004))} мс.`],
 acrobat:['Акробатика','Помогает уклоняться от ближних атак и дополнительно уменьшает вероятность попадания противника.',p=>`Добавка к уклонению +${Math.floor(p.skills.acrobat/12)} → +${Math.floor((p.skills.acrobat+5)/12)} п.п.; штраф противнику ${Math.floor(p.skills.acrobat/11)} → ${Math.floor((p.skills.acrobat+5)/11)} п.п.`]
};
const card=document.getElementById('fighterCard');
if(!card)return;
let bubble=document.getElementById('arena551-tip');
if(!bubble){bubble=document.createElement('div');bubble.id='arena551-tip';bubble.setAttribute('role','dialog');bubble.setAttribute('aria-label','Объяснение характеристики');bubble.hidden=true;bubble.innerHTML='<button type="button" class="arena551-close" aria-label="Закрыть подсказку">×</button><strong class="arena551-title"></strong><p class="arena551-text"></p><div class="arena551-now"></div>';document.body.append(bubble)}
let chosen=null;
function getData(node){let row=node?.closest('.stat');if(!row||!card.contains(row))return null;const a=row.querySelector('[data-stat]'),s=row.querySelector('[data-skill]');if(a)return {key:a.dataset.stat,type:'attr',row};if(s)return {key:s.dataset.skill,type:'skill',row};return null}
function show(node){const info=getData(node);if(!info)return;const dict=info.type==='attr'?ATTR_HELP:SKILL_HELP;const item=dict[info.key];if(!item)return;let p=roster[focus];if(!p)return;
 chosen=info.type+':'+info.key;
 bubble.querySelector('.arena551-title').textContent=item[0];bubble.querySelector('.arena551-text').textContent=item[1];bubble.querySelector('.arena551-now').textContent=item[2](p);bubble.hidden=false;
 const r=info.row.getBoundingClientRect();const bw=Math.min(355,innerWidth-20),left=Math.min(innerWidth-bw-10,Math.max(10,r.left));
 if(innerWidth>740){bubble.style.left=left+'px';bubble.style.top=Math.max(10,Math.min(innerHeight-225,r.bottom+8))+'px'}else{bubble.style.left='10px';bubble.style.top='auto'}
}
function hide(){bubble.hidden=true;chosen=null}
bubble.querySelector('.arena551-close').addEventListener('click',hide);
// Explanations open only by tapping the question-mark button, not +/- or focus.

card.addEventListener('click',e=>{if(e.target.closest('.arena551-info')){e.preventDefault();show(e.target)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});
document.addEventListener('pointerdown',e=>{if(!bubble.hidden&&!bubble.contains(e.target)&&!e.target.closest('.arena551-info'))hide()});
const priorSetup=window.renderSetup;
window.renderSetup=function(...args){const r=priorSetup.apply(this,args);
 for(const row of card.querySelectorAll('.stat')){
  const info=getData(row);if(!info)continue;
  const item=(info.type==='attr'?ATTR_HELP:SKILL_HELP)[info.key];if(!item)continue;
  const label=row.querySelector('span');if(!label)continue;
  label.title=item[0]+' — '+item[1];
  let btn=document.createElement('button');btn.type='button';btn.className='arena551-info';btn.textContent='?';btn.setAttribute('aria-label','Что даёт '+item[0]);btn.title=item[1];label.append(btn);
  row.setAttribute('aria-label',item[0]+'. '+item[1]);
 }
 if(!bubble.hidden){const [type,key]=(chosen||'').split(':');const el=card.querySelector(`[data-${type==='attr'?'stat':'skill'}="${key}"]`);if(el)show(el);else hide()}
 return r;
};
window.renderSetup();
const app=document.getElementById('arenaScreen');
// The puppet-copy is not controllable; show its owner and avoid a selected unrepeatable clone action.
let lastIllusionCount=-1;
const oldRender=window.renderGame;
window.renderGame=function(...args){const r=oldRender.apply(this,args);if(!game||!app?.classList.contains('active'))return r;
 const count=game.units.filter(u=>u.isClone&&u.cloneKind==='illusion'&&u.team==='ally'&&u.hp>0).length;
 const hud=document.getElementById('ux55-hud');
 if(hud){let note=document.getElementById('arena551-illusion');if(!note){note=document.createElement('div');note.id='arena551-illusion';hud.append(note)}
  if(count>0){note.textContent='Иллюзорный клон — приманка, им не управляют. Техники, движение и завершение хода доступны оригиналу.';note.hidden=false}else note.hidden=true;
 }
 if(count!==lastIllusionCount)lastIllusionCount=count;
 return r;
};
window.__arena551={version:'5.5.1',stats:ATTR_HELP,skills:SKILL_HELP,get tooltipOpen(){return !bubble.hidden}};
})();

