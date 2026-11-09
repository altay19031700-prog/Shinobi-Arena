(()=>{'use strict';if(!new URLSearchParams(location.search).has('animationQA'))return;
const panel=document.createElement('section');panel.id='animation-qa';panel.style='position:fixed;right:8px;top:8px;z-index:99999;background:#112d36;color:white;border:1px solid #78b8b3;padding:10px;max-width:370px;border-radius:8px';panel.innerHTML='<b>Проверка анимаций 5.28</b><div><button id="qa-atlases">20 моделей / все кадры</button><button id="qa-battles">500 боёв</button><button id="qa-hide">Скрыть тесты</button></div><pre id="qa-result" style="white-space:pre-wrap;max-height:180px;overflow:auto">Готов к проверке</pre>';document.body.append(panel);document.getElementById('qa-hide').onclick=()=>panel.hidden=true;const result=document.getElementById('qa-result');
const report={};window.__animationTestReport=report;
document.getElementById('qa-atlases').onclick=async()=>{result.textContent='Проверка кадров…';try{report.atlases=await window.__authoredAnimations.audit();result.textContent=JSON.stringify(report,null,2)}catch(e){result.textContent='ERROR '+e.stack}};
document.getElementById('qa-battles').onclick=async()=>{if(!game){result.textContent='Сначала запустите бой';return}if(window.__shinobiNetwork?.active){result.textContent='Для автотестов нужен локальный бой без подключённого соперника';return}result.textContent='500 боёв: выполняются правила execute и урон, без ожидания графики…';await new Promise(r=>setTimeout(r,20));const saved={game,roster,focus,draw:window.draw,renderGame:window.renderGame,log:window.log,cueFx:window.cueFx,random:Math.random};let seed=5282026;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};const out={matches:0,wins:0,losses:0,draws:0,actions:0,reactions:{},violations:[]};
try{Math.random=rng;window.draw=()=>{};window.renderGame=()=>{};window.log=()=>{};window.cueFx=()=>{};
 for(let match=0;match<500;match++){
  const src=generate(3);src.name='Тест';src.level=100;src.sprite=SAFE_SPRITES[match%SAFE_SPRITES.length];Object.assign(src.attrs,{str:12,per:7,end:4,int:7,agi:6});for(const k of Object.keys(src.skills))src.skills[k]=75;src.gear.sword=1;roster=[src];const a=makeUnit(src,'ally',0,0,0),b=makeUnit({...src,sprite:SAFE_SPRITES[(match+7)%SAFE_SPRITES.length]},'enemy',0,1,0);a.fatigue=b.fatigue=0;
  game={...saved.game,units:[a,b],blocked:new Set(),smoke:new Map(),trap:new Map(),round:1,phase:'ally',selected:a.id,over:false,animating:false,pendingCounter:null,areaFx:null,hoverCell:null,action:'move',weather:'clear'};
  for(let turn=0;turn<200&&!game.over&&a.hp>0&&b.hp>0;turn++){
   const u=turn%2?b:a,t=turn%2?a:b;game.round=1+Math.floor(turn/2);game.phase=u.team;game.selected=u.id;window.__animationRuleAccess.recoverFatigue(u.team);takeDamageOverTime(u.team);if(game.over||u.hp<=0||t.hp<=0)break;u.ap=window.__animationRuleAccess.calcAp(u);if(u.stun){u.ap=0;u.stun=0;continue}
   for(let j=0;j<6&&u.ap>=2&&u.hp>0&&t.hp>0&&!game.over;j++){
    const choices=['melee','quick','heavy','sword','trip','stunHit'];let action=choices[Math.floor(rng()*choices.length)];if(!actionAvailable(u,action))action='quick';const before=u.ap;execute(u,action,{c:t.c,r:t.r});if(game.pendingCounter)resolveCounter(false);if(u.ap===before)break;out.actions++;if(t.reaction?.kind)out.reactions[t.reaction.kind]=(out.reactions[t.reaction.kind]||0)+1;
    if(!Number.isFinite(u.hp)||!Number.isFinite(t.hp)||u.hp<0||t.hp<0||u.ap<0)throw Error('Invalid HP/AP in match '+match);
   }
  }
  out.matches++;if(a.hp<=0)out.losses++;else if(b.hp<=0)out.wins++;else out.draws++;
 }
 out.passed=out.matches===500&&out.violations.length===0;report.battles=out;
}catch(e){out.violations.push(e.stack);out.passed=false;report.battles=out}
finally{game=saved.game;roster=saved.roster;focus=saved.focus;window.draw=saved.draw;window.renderGame=saved.renderGame;window.log=saved.log;window.cueFx=saved.cueFx;Math.random=saved.random;renderGame();result.textContent=JSON.stringify(report,null,2)}
};})();
