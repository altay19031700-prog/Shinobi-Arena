/* MUSASHI 3.6: Tactical enemy decision module. No remote services, no neural-network claims. */
(function(){
'use strict';
const root=document.getElementById('setupScreen');
const panel=root?.querySelector('.panel.full .row.spread')||root?.querySelector('.panel.full');
const holder=document.createElement('div');holder.className='musashi-picker';
holder.innerHTML='<label for="musashi-select">Противник</label><select id="musashi-select"><option value="musashi">Мусаси — тактический ИИ</option><option value="classic">Прежний ИИ</option></select><span class="musashi-help">Ищет уязвимости, оценивает чакру, фланги и укрытия</span>';
panel?.parentElement?.appendChild(holder);
const theme=document.createElement('style');
theme.textContent=`.musashi-picker{display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin:9px 0 0;padding:10px;border:1px solid #507267;border-radius:9px;background:#152823}.musashi-picker label{font-weight:700;color:#e4d4a5}.musashi-picker select{max-width:100%;min-height:40px}.musashi-help{color:#aac7b9;font-size:12px}#musashi-hud{margin:7px 0 8px;padding:9px 12px;border:1px solid #4e766a;border-radius:8px;background:linear-gradient(100deg,#183b32,#15262a);color:#d8e8de;font-size:12px}#musashi-hud b{color:#e5cf9b}#musashi-hud .decision{display:block;color:#b9d1c5;margin-top:3px}#musashi-toggle{font-size:12px}@media(max-width:600px){.musashi-picker{align-items:stretch}.musashi-picker label{width:100%}.musashi-picker select{width:100%}}`;
document.head.appendChild(theme);
const hud=document.createElement('div');hud.id='musashi-hud';hud.innerHTML='<b>Мусаси</b> · тактический ИИ<span class="decision">Оценивает угрозы и выбирает действие</span>';
const board=document.querySelector('#arenaScreen .boardpanel');
board?.querySelector('.boardwrap')?.before(hud);
const state={mode:'musashi',decisions:[],runs:0,attacks:0,moves:0,guards:0,casts:0,invalid:0,last:null};
const select=document.getElementById('musashi-select');
select?.addEventListener('change',()=>{state.mode=select.value;refresh();});
function refresh(){
 if(!game)return;const mode=state.mode==='musashi'?'Мусаси':'Прежний ИИ';
 hud.querySelector('b').textContent=mode;
 const line=hud.querySelector('.decision');
 line.textContent=state.mode==='musashi'?(state.last||'Поиск слабых мест и безопасного пути'):'Обычные правила выбора ближайших целей';
}
const prevGame=window.newGame;
window.newGame=function(){state.mode=select?.value==='classic'?'classic':'musashi';state.last=null;state.runs=0;state.decisions.length=0;state.attacks=state.moves=state.guards=state.casts=state.invalid=0;prevGame();refresh();};
const lim=(a,b,x)=>Math.max(a,Math.min(b,x));
function legalVictim(u){return !!u&&u.hp>0&&u.team==='ally'&&visibleToSide('enemy',u);}
function scoreTarget(attacker,target){
 if(!legalVictim(target))return -100000;
 const d=dist(attacker,target),seen=window.__arena541?.seenStats(attacker.team,target)||target,ratio=seen.hp/Math.max(1,seen.maxHp);
 const threat=(seen.chakra||0)>13?6:0;
 const weakened=(1-ratio)*18;
 const vulnerable=(target.stun?12:0)+(target.prone?5:0)+(target.injuries?.arm?3:0);
 const cover=(target.guard?7:0)+(smokeOnLine(attacker,target)?9:0);
 const decoy=window.__arena541?.knownCopy('enemy',target)?16:0,pet=target.isSummon?7:0;
 return 45+weakened+threat+vulnerable-d*2.9-cover-decoy-pet;
}
function targets(u){return game.units.filter(legalVictim).sort((a,b)=>scoreTarget(u,b)-scoreTarget(u,a));}
function assessDamage(u,target,kind){
 const melee=kind==='quick'||kind==='melee'||kind==='heavy'||kind==='trip'||kind==='stunHit'||kind==='sword';
 const base={quick:8,melee:12,heavy:20,trip:8,stunHit:9,sword:16,kunai:12,jutsu:16}[kind]||10;
 const type=melee?(kind==='sword'?'sword':'melee'):(kind==='jutsu'?'jutsu':'throw');
 const prob=lim(0.05,0.95,(hitChance(u,target,type,kind==='heavy'?-15:kind==='quick'?15:0)||45)/100);
 const position=melee?exposure(u,target):'front';
 const positional=position==='rear'?7:position==='flank'?3:0;
 const status=kind==='trip'&&target.prone===0?9:kind==='stunHit'&&target.stun===0?8:0;
 const seen=window.__arena541?.seenStats(u.team,target)||target;const kill=seen.hp<=base?18:seen.hp<=base*1.5?7:0;
 const cost={quick:2,melee:3,heavy:5,trip:4,stunHit:4,sword:4,kunai:3,jutsu:4}[kind]||4;
 return (base+positional+status+kill)*prob/(cost*.40+1)+Math.min(6,scoreTarget(u,target)*.07);
}
function estimateRisk(unit,c,r){
 const foes=game.units.filter(x=>x.hp>0&&x.team==='ally'&&!window.__arena541?.knownCopy('enemy',x));
 let exposureRisk=0;
 for(const v of foes){
  const d=dist({c,r},v);
  if(d===1)exposureRisk+=v.ap>=3?9:4;
  else if(d<=4&&lineClear({c,r},v))exposureRisk+=2.5;
 }
 return exposureRisk+(unit.hp/unit.maxHp<.4?5:0);
}
function movementPlan(u){
 const enemies=targets(u);if(!enemies.length)return null;
 const maxStep=Math.min(5,Math.floor(Math.max(0,u.ap-2)/(u.slow?2:1)));
 if(maxStep<1)return null;
 const currentMin=Math.min(...enemies.map(x=>dist(u,x)));
 const startScore=-currentMin*6-estimateRisk(u,u.c,u.r);
 let best=null;
 for(let r=0;r<H;r++)for(let c=0;c<W;c++){
  if(c===u.c&&r===u.r||obstacle(c,r)||unitAt(c,r))continue;
  const path=pathTo(u,c,r);if(!path||path.length>maxStep||path.length===0)continue;
  const post={c,r};let nearest=1000;
  let opportunity=0;
  for(const v of enemies){
    const d=dist(post,v);nearest=Math.min(nearest,d);
    if(d===1)opportunity=Math.max(opportunity,13+Math.max(0,1-v.hp/v.maxHp)*5);
    if(d>=2&&d<=4&&lineClear(post,v))opportunity=Math.max(opportunity,9);
  }
  const risk=estimateRisk(u,c,r);
  const remaining=u.ap-path.length*(u.slow?2:1);
  const score=-nearest*6+opportunity-risk*(u.hp/u.maxHp<.4?1.7:.8)-path.length*.75 + (remaining>=3?3:0);
  if(score>startScore+1.1&&(!best||score>best.score))best={kind:'move',c,r,path,score};
 }
 return best;
}
function enumerate(u){
 if(!u||u.hp<=0)return [];
 const choices=[];const foes=targets(u);
 const add=(type,action,t,score,cost)=>{if(u.ap>=cost&&score>-1000)choices.push({kind:type,action,target:t?.id??null,c:t?.c??u.c,r:t?.r??u.r,score,cost});};
 for(const t of foes){const d=dist(u,t);if(d===1){
   for(const [action,cost] of [['quick',2],['melee',3],['heavy',5],['trip',4],['stunHit',4],['sword',4]]){
    if(action==='sword'&&!u.gear?.sword)continue;
    add('attack',action,t,assessDamage(u,t,action)+(scoreTarget(u,t)*.08),cost);
   }
  }
  if(d>=1&&d<=4&&lineClear(u,t)){
   if(u.gear?.kunai && u.ap>=3)add('attack','kunai',t,assessDamage(u,t,'kunai')+scoreTarget(u,t)*.07,3);
   const chakraCost=Math.max(4,9-Math.floor((u.skills.control||0)/35));
   if(u.ap>=4&&u.chakra>=chakraCost)add('attack','jutsu',t,assessDamage(u,t,'jutsu')+scoreTarget(u,t)*.075 - (u.chakra<chakraCost+10?4:0),4);
  }
 }
 if(u.ap>=3&&u.hp/u.maxHp<.63&&!u.barrier&&u.learned?.includes('shield')&&u.chakra>=11)add('spell','shield',u,19+(1-u.hp/u.maxHp)*12,3);
 if(u.ap>=3&&u.hp/u.maxHp<.4&&!u.substitute&&u.learned?.includes('replace')&&u.chakra>=13)add('spell','replace',u,19+(1-u.hp/u.maxHp)*11,3);
 // Chakra remains the only cap on defensive clones (plus action points and open cells).
 if(u.ap>=3&&u.chakra>=9&&u.learned?.includes('decoy')&&u.hp/u.maxHp<.66){
  const open=neigh(u.c,u.r).filter(p=>!obstacle(p.c,p.r)&&!unitAt(p.c,p.r));
  if(open.length){const enemies=targets(u);open.sort((a,b)=>Math.min(...enemies.map(t=>dist(a,t)))-Math.min(...enemies.map(t=>dist(b,t))));
   choices.push({kind:'spell',action:'decoy',c:open[0].c,r:open[0].r,score:19+(1-u.hp/u.maxHp)*12,cost:3});}
 }
 // One advanced elemental attack for each nature; no extra spell slots.
 const advanced=['fire4','water4','wind4','light4','earth4'][u.element];
 const learned=window.__arena18?.TECHS?.find(t=>t.id===advanced);
 if(learned && u.learned?.includes(advanced)&&u.chakra>=learned.ch&&u.ap>=learned.ap){
  for(const t of foes){if(dist(u,t)>learned.range||!lineClear(u,t))continue;
   const pressure=u.hp/u.maxHp<.35?5:0;
   add('spell',advanced,t,assessDamage(u,t,'jutsu')+learned.power*.40+scoreTarget(u,t)*.06-pressure,learned.ap);
  }
 }
 if(u.ap>=2){const risk=estimateRisk(u,u.c,u.r);add('guard','guard',u,1+Math.min(14,risk)*(u.hp/u.maxHp<.5?1.4:.8),2)}
 const mov=movementPlan(u);if(mov)choices.push({...mov,score:mov.score+20});
 return choices.sort((a,b)=>b.score-a.score);
}
function record(u,p,label){const obj={round:game.round,actor:u.id,type:p.kind,action:p.action||p.kind,target:p.target||null,score:Math.round(p.score*10)/10};state.decisions.push(obj);if(state.decisions.length>300)state.decisions.shift();state.last=`${u.name}: ${label}`;refresh();}
async function oneAction(u,plan){
 if(!plan||u.hp<=0)return false;
 const before=u.ap,opponents=targets(u);
 try{
  if(plan.kind==='move'){
   const actual=pathTo(u,plan.c,plan.r);if(!actual?.length)return false;
   const cap=Math.min(actual.length,Math.floor(u.ap/(u.slow?2:1)));
   if(cap<=0)return false; const n=moveUnit(u,actual,cap);
   if(n!==false&&u.ap<before){record(u,plan,`манёвр на (${u.c+1}, ${u.r+1})`);state.moves++;await waitFx();return true;}
  }
  if(plan.kind==='spell'){
   if(!window.arena30?.cast)return false;
   const started=window.arena30.cast(u,plan.action,{c:plan.c,r:plan.r});
   if(started){record(u,plan,plan.action==='shield'?'чакровый барьер':plan.action==='replace'?'замещение':plan.action==='decoy'?'иллюзорный клон':'стихийная техника');state.casts++;await waitFx();await waitFx();return true;}
  }
  if(plan.kind==='attack'){
   const t=game.units.find(x=>x.id===plan.target&&legalVictim(x));if(!t)return false;
   if(u.ap<plan.cost||!lineClear(u,t)&&dist(u,t)>1)return false;
   const res=execute(u,plan.action,{c:t.c,r:t.r});
   if(res){record(u,plan,`атакует ${t.name} (${plan.action})`);state.attacks++;await waitFx();await waitPendingCounter();await waitFx();return true;}
  }
  if(plan.kind==='guard'&&u.ap>=2){const res=execute(u,'guard',{c:u.c,r:u.r});if(res){record(u,plan,'защищается');state.guards++;return true;}}
 }catch(err){console.error('Мусаси: действие не выполнено',err);state.invalid++;return false;}
 return false;
}
async function runUnit(u){
 if(!u||u.hp<=0)return;
 if(u.justSummoned){u.justSummoned=false;u.ap=0;return;}
 if(u.stun){log(`${u.name} оглушён и пропускает ход.`,'hurt');u.ap=0;u.stun=0;return;}
 let visited=0,stalled=0;
 while(game&&!game.over&&u.hp>0&&u.ap>=2&&visited++<8){
  const plans=enumerate(u);
  if(!plans.length)break;
  let completed=false;
  for(const plan of plans.slice(0,5)){
   if(plan.kind==='guard'&&plans[0].kind==='move'&&plan.score<plans[0].score)continue;
   if(await oneAction(u,plan)){completed=true;break;}
  }
  if(!completed||++stalled>7)break;
 }
}
async function runEnemyPhase(){
 state.runs++;
 const actors=game.units.filter(u=>u.team==='enemy'&&u.hp>0);
 for(const u of actors){
  if(!game||game.over)break;
  const prepaid=u.prepaidSummon||0;
  const tired=u.fatigue||0;const penalty=(tired>=70?2:tired>=40?1:0)+((game.weather==='heat'&&tired>=55)?1:0);u.ap=Math.max(0,Math.max(4,(u.maxAp||6)-penalty)-prepaid);u.prepaidSummon=0;
  // No extra chakra or action points. A normal enemy may know a basic defense and one elemental technique.
  if(!u.isSummon&&!u.isClone){u.learned=u.learned||[];
   for(const id of ['shield',['fire4','water4','wind4','light4','earth4'][u.element]]){
    if(id&&!u.learned.includes(id))u.learned.push(id);
   }
  }
  // Summoned beasts obey the same board and action-point rules.
  if(u.isSummon){if(u.justSummoned){u.justSummoned=false;u.ap=0;continue;}
   let t=targets(u).sort((a,b)=>dist(u,a)-dist(u,b))[0];if(!t)continue;
   if(dist(u,t)===1&&u.ap>=3)await oneAction(u,{kind:'attack',action:'melee',target:t.id,score:9,cost:3});
   else {const move=movementPlan(u);if(move)await oneAction(u,move)}continue;
  }
  if(u.isClone){if(u.cloneKind==='illusion')continue;const move=movementPlan(u);if(move)await oneAction(u,move);continue;}
  await runUnit(u);
 }
}
window.__musashi={state,scoreTarget,enumerate,movementPlan,oneAction,runUnit,runEnemyPhase,setMode:(mode)=>{select.value=mode==='classic'?'classic':'musashi';state.mode=select.value;refresh()},refresh};
})();
