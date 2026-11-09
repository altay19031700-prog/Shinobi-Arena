
(function(){
// Дзюцу существуют как боевые способности, а не визуальные заглушки.
// learn = стоимость обучения в очках навыков; никакого лимита на изученные техники.
const TECHS=[
// Оружейные свитки. Цена ограничена чакрой и ОД, а не слотами заклинаний.
{id:'scrollKunai',element:null,name:'Свиток: кунаи ×3',kind:'arsenal',item:'kunai',qty:3,ap:3,ch:7,learn:5,range:0,note:'Материализовать три куная'},
{id:'scrollShuriken',element:null,name:'Свиток: сюрикены ×4',kind:'arsenal',item:'shuriken',qty:4,ap:3,ch:8,learn:5,range:0,note:'Четыре сюрикена в инвентарь'},
{id:'scrollSenbon',element:null,name:'Свиток: сенбоны ×5',kind:'arsenal',item:'senbon',qty:5,ap:3,ch:8,learn:5,range:0,note:'Пять метательных игл'},
{id:'scrollSword',element:null,name:'Свиток: короткий меч',kind:'arsenal',item:'sword',qty:1,ap:4,ch:12,learn:8,range:0,note:'Призвать оружие ближнего боя'},
{id:'scrollPaper',element:null,name:'Свиток: взрывные печати ×2',kind:'arsenal',item:'paper',qty:2,ap:4,ch:13,learn:10,range:0,note:'Две взрывные печати'},
{id:'weaponRain',element:null,name:'Оружейный град',kind:'weaponAttack',ap:6,ch:28,learn:16,range:4,power:16,note:'Гекс и соседние клетки, задевает союзников'},
// Договоры призыва: каждый зверь — отдельная боевая единица, без лимита на число.
{id:'summonHound',element:null,name:'Призыв: боевой пёс',kind:'summon',beast:'hound',ap:5,ch:18,learn:10,range:1,note:'Быстрый зверь; укусы'},
{id:'summonSnake',element:null,name:'Призыв: змея',kind:'summon',beast:'snake',ap:5,ch:14,learn:10,range:1,note:'Ядовитый укус'},
{id:'summonToad',element:null,name:'Призыв: боевая жаба',kind:'summon',beast:'toad',ap:5,ch:20,learn:12,range:1,note:'Тяжёлый прыжковый удар'},
{id:'summonSpider',element:null,name:'Призыв: паук',kind:'summon',beast:'spider',ap:5,ch:17,learn:12,range:1,note:'Яд и замедление'},
{id:'summonWolf',element:null,name:'Призыв: волк',kind:'summon',beast:'wolf',ap:6,ch:29,learn:17,range:1,note:'Опытный хищник, силовые атаки'},
{id:'summonTortoise',element:null,name:'Призыв: панцирная черепаха',kind:'summon',beast:'tortoise',ap:6,ch:27,learn:16,range:1,note:'Живое укрытие, сильный блок'},

// 5.10: 18 additional learned and playable techniques, each with actual AP/chakra costs.
{id:'fire8',element:0,name:'Искры феникса',kind:'chain',ap:5,ch:18,learn:11,range:4,power:14,note:'Перескакивающее пламя; поджигает соседей'},
{id:'fire9',element:0,name:'Пепельная завеса',kind:'blast',ap:5,ch:19,learn:12,range:4,power:14,note:'Пепел по площади; ухудшает точность'},
{id:'fire10',element:0,name:'Багровый выдох',kind:'line',ap:6,ch:32,learn:17,range:5,power:23,note:'Огненная дорожка; длительный ожог'},
{id:'water8',element:1,name:'Ледяные иглы',kind:'hit',ap:4,ch:13,learn:9,range:5,power:14,note:'Охлаждает цель; замедляет на два раунда'},
{id:'water9',element:1,name:'Водяной купол',kind:'self',ap:4,ch:19,learn:11,range:0,note:'Щит поглощает удар и смывает горение'},
{id:'water10',element:1,name:'Водоворот',kind:'blast',ap:6,ch:28,learn:16,range:4,power:17,note:'Вода по области; всех замедляет и тушит огонь'},
{id:'wind8',element:2,name:'Ветряной шаг',kind:'dash',ap:3,ch:12,learn:10,range:3,note:'Быстрый рывок на свободный гекс; оставляет дым'},
{id:'wind9',element:2,name:'Лезвия циклона',kind:'chain',ap:5,ch:21,learn:12,range:5,power:16,note:'Режущие вихри цепью; замедление'},
{id:'wind10',element:2,name:'Штормовой фронт',kind:'blast',ap:6,ch:26,learn:15,range:4,power:15,note:'Шторм по площади; опрокидывает всех'},
{id:'light8',element:3,name:'Молниеносный рывок',kind:'dash',ap:4,ch:18,learn:12,range:3,note:'Перемещение и электрический импульс вокруг точки выхода'},
{id:'light9',element:3,name:'Грозовая сеть',kind:'chain',ap:6,ch:27,learn:15,range:5,power:17,note:'Разряд по нескольким целям; шанс оглушения'},
{id:'light10',element:3,name:'Громовой капкан',kind:'hit',ap:5,ch:19,learn:12,range:4,power:13,note:'Разряд обездвиживает цель'},
{id:'earth8',element:4,name:'Каменные латы',kind:'self',ap:4,ch:17,learn:11,range:0,note:'Укрепляет защиту и снимает опрокидывание'},
{id:'earth9',element:4,name:'Подземный удар',kind:'blast',ap:6,ch:24,learn:14,range:4,power:16,note:'Обвал по площади; сбивает с ног'},
{id:'earth10',element:4,name:'Раскол земли',kind:'line',ap:6,ch:29,learn:16,range:5,power:21,note:'Разлом по линии; накладывает замедление'},
{id:'medicHeal',element:null,name:'Медицинское ниндзюцу',kind:'heal',ap:5,ch:19,learn:13,range:1,power:24,note:'Восстанавливает HP себе или соседнему союзнику; снимает яд'},
{id:'chakraWave',element:null,name:'Чакровая волна',kind:'blast',ap:5,ch:21,learn:12,range:3,power:12,note:'Удар по площади; задевает и союзников'},
{id:'smokeShift',element:null,name:'Дымовая подмена',kind:'self',ap:4,ch:17,learn:11,range:0,note:'Замещение с защитным дымом на текущем гексе'},

// Новые атакующие дзюцу альфы 1.9 — по четыре на стихию.
{id:"fire4",element:0,name:"Жгучий залп",kind:"hit",ap:4,ch:12,learn:8,range:4,power:12,note:"Повторная атака поджигает"},
{id:"fire5",element:0,name:"Огненное кольцо",kind:"blast",ap:5,ch:20,learn:10,range:4,power:16,note:"Обжигает соседние клетки"},
{id:"fire6",element:0,name:"Пламенное копьё",kind:"line",ap:6,ch:30,learn:15,range:4,power:24,note:"Прожигает прямую линию"},
{id:"fire7",element:0,name:"Пепельный выстрел",kind:"hit",ap:5,ch:15,learn:11,range:4,power:13,note:"Глушит зрение противника"},
{id:"water4",element:1,name:"Струя высокого давления",kind:"hit",ap:4,ch:12,learn:8,range:4,power:16,note:"Дальнобойная водяная струя"},
{id:"water5",element:1,name:"Водяной таран",kind:"hit",ap:5,ch:20,learn:12,range:4,power:19,note:"Мощный толчок потоком"},
{id:"water6",element:1,name:"Ливень водяных игл",kind:"blast",ap:6,ch:29,learn:15,range:4,power:20,note:"Удары по площади"},
{id:"water7",element:1,name:"Обратное течение",kind:"hit",ap:5,ch:14,learn:9,range:4,power:8,note:"Замедляет врага"},
{id:"wind4",element:2,name:"Режущие перья",kind:"hit",ap:4,ch:11,learn:8,range:5,power:16,note:"Точный дальний разрез"},
{id:"wind5",element:2,name:"Ударный шквал",kind:"blast",ap:5,ch:18,learn:12,range:5,power:13,note:"Разбрасывает врагов"},
{id:"wind6",element:2,name:"Воздушная пила",kind:"line",ap:6,ch:27,learn:15,range:5,power:23,note:"Режущий удар по линии"},
{id:"wind7",element:2,name:"Вакуумный импульс",kind:"hit",ap:5,ch:14,learn:10,range:5,power:12,note:"Ослабляет точность цели"},
{id:"light4",element:3,name:"Грозовая игла",kind:"hit",ap:4,ch:12,learn:8,range:4,power:16,note:"Точное пробивание"},
{id:"light5",element:3,name:"Парализующая дуга",kind:"hit",ap:5,ch:20,learn:12,range:4,power:15,note:"Оглушение влажной цели"},
{id:"light6",element:3,name:"Разветвлённый разряд",kind:"chain",ap:6,ch:31,learn:16,range:4,power:19,note:"Поражает соседей"},
{id:"light7",element:3,name:"Громовой удар",kind:"hit",ap:5,ch:16,learn:12,range:4,power:17,note:"Высокий шанс шока"},
{id:"earth4",element:4,name:"Каменный град",kind:"blast",ap:5,ch:15,learn:9,range:4,power:15,note:"Камни по области"},
{id:"earth5",element:4,name:"Скальный кулак",kind:"hit",ap:5,ch:17,learn:11,range:4,power:17,note:"Тяжёлый удар по противнику"},
{id:"earth6",element:4,name:"Острые шипы",kind:"line",ap:6,ch:28,learn:15,range:4,power:23,note:"Шипы по линии"},
{id:"earth7",element:4,name:"Глиняные путы",kind:"hit",ap:4,ch:13,learn:9,range:4,power:8,note:"Противник вязнет в земле"},
{id:'fire1',element:0,name:'Огненная искра',kind:'hit',ap:4,ch:7,learn:0,range:4,power:12,note:'Ожог'},
{id:'fire2',element:0,name:'Взрыв пламени',kind:'blast',ap:5,ch:17,learn:8,range:4,power:18,note:'Радиус 1, задевает своих'},
{id:'fire3',element:0,name:'Огненная линия',kind:'line',ap:6,ch:27,learn:15,range:4,power:22,note:'Пламя по линии'},
{id:'water1',element:1,name:'Водяная пуля',kind:'hit',ap:4,ch:7,learn:0,range:4,power:14,note:'Замедляет'},
{id:'water2',element:1,name:'Водяные оковы',kind:'hit',ap:5,ch:15,learn:8,range:4,power:7,note:'Привязывает к месту'},
{id:'water3',element:1,name:'Накат волны',kind:'blast',ap:6,ch:23,learn:15,range:4,power:19,note:'Радиус 1, смывает горение'},
{id:'wind1',element:2,name:'Воздушный клинок',kind:'hit',ap:4,ch:7,learn:0,range:5,power:14,note:'Дальний урон'},
{id:'wind2',element:2,name:'Сильный порыв',kind:'hit',ap:5,ch:14,learn:8,range:4,power:9,note:'Отбрасывает'},
{id:'wind3',element:2,name:'Режущий коридор',kind:'line',ap:6,ch:24,learn:15,range:4,power:20,note:'Цели на линии'},
{id:'light1',element:3,name:'Электроимпульс',kind:'hit',ap:4,ch:9,learn:0,range:4,power:14,note:'Шанс шока'},
{id:'light2',element:3,name:'Цепная молния',kind:'chain',ap:5,ch:17,learn:8,range:4,power:12,note:'Перескакивает на соседей'},
{id:'light3',element:3,name:'Громовое копьё',kind:'hit',ap:6,ch:30,learn:15,range:5,power:25,note:'Сильный одиночный удар'},
{id:'earth1',element:4,name:'Каменный снаряд',kind:'hit',ap:4,ch:7,learn:0,range:4,power:14,note:'Пробивающий удар'},
{id:'earth2',element:4,name:'Земляная хватка',kind:'hit',ap:5,ch:14,learn:8,range:3,power:8,note:'Замедляет'},
{id:'earth3',element:4,name:'Земляная стена',kind:'wall',ap:5,ch:21,learn:15,range:2,power:0,note:'Преграда на 2 раунда'},
{id:'shield',element:null,name:'Чакровый барьер',kind:'self',ap:3,ch:11,learn:8,range:0,note:'Уменьшает следующий урон'},
{id:'replace',element:null,name:'Замещение',kind:'self',ap:3,ch:13,learn:8,range:0,note:'Избегает следующего удара при свободном гексе'},
{id:'decoy',element:null,name:'Иллюзорный клон',kind:'clone',ap:3,ch:9,learn:0,range:1,note:'Приманка без атаки, 2 раунда'},
{id:'shadow',element:null,name:'Теневой клон',kind:'clone',ap:5,ch:24,learn:12,range:1,note:'Участвует в бою, 3 раунда'},
{id:'elementClone',element:null,name:'Стихийный клон',kind:'clone',ap:5,ch:18,learn:10,range:1,note:'Атакует своей стихией, 3 раунда'}
];
TECHS.push(...[{"id": "genMirage", "name": "Мираж", "kind": "genjutsu", "targetSide": "enemy", "ap": 3, "ch": 6, "learn": 0, "minSkill": 0, "range": 3, "effect": "mirage", "turns": 2, "note": "Меткость цели −15 п.п. на 2 её хода. Не складывается с другим миражом.", "element": null, "school": "genjutsu", "power": 0}, {"id": "genBind", "name": "Иллюзорные путы", "kind": "genjutsu", "targetSide": "enemy", "ap": 4, "ch": 12, "learn": 8, "minSkill": 30, "range": 3, "effect": "bind", "turns": 1, "difficulty": 5, "note": "Запрещает передвижение на 1 ход цели. Атаки и Кай доступны. После жёсткого контроля — защита от повторного до раунда +2.", "element": null, "school": "genjutsu", "power": 0}, {"id": "genDread", "name": "Ложная угроза", "kind": "genjutsu", "targetSide": "enemy", "ap": 3, "ch": 9, "learn": 8, "minSkill": 25, "range": 4, "effect": "dread", "turns": 2, "note": "Прямой урон атак цели −20% на 2 её хода. Не вызывает бегство и не отнимает управление.", "element": null, "school": "genjutsu", "power": 0}, {"id": "genDrain", "name": "Фантомная боль", "kind": "genjutsu", "targetSide": "enemy", "ap": 4, "ch": 13, "learn": 10, "minSkill": 40, "range": 3, "note": "При успехе цель теряет до 8 чакры, но не HP. Чакра не передаётся заклинателю.", "element": null, "school": "genjutsu", "power": 0}, {"id": "genSleep", "name": "Сон", "kind": "genjutsu", "targetSide": "enemy", "ap": 5, "ch": 18, "learn": 14, "minSkill": 60, "range": 3, "effect": "sleep", "turns": 1, "difficulty": 12, "note": "На 1 ход цели блокирует действия, кроме Кай. Любой урон будит. Союзник может снять сон Разрывом иллюзии. После контроля — защита до раунда +2.", "element": null, "school": "genjutsu", "power": 0}, {"id": "genMirror", "name": "Ложный образ", "kind": "self", "targetSide": "self", "ap": 3, "ch": 10, "learn": 8, "minSkill": 30, "range": 0, "effect": "mirror", "turns": 2, "note": "Атакующие получают −12 п.п. меткости. Действует 2 своих хода, считая текущий, или до первого урона. Не создаёт клона.", "element": null, "school": "genjutsu", "power": 0}, {"id": "genKai", "name": "Кай", "kind": "self", "targetSide": "self", "ap": 2, "ch": 5, "learn": 0, "minSkill": 0, "range": 0, "note": "Снимает с себя мираж, путы, страх и сон. Можно применить во сне. После снятия даёт +15 п.п. сопротивления гендзюцу до конца следующего своего хода.", "element": null, "school": "genjutsu", "power": 0}, {"id": "genDispel", "name": "Разрыв иллюзии", "kind": "genjutsu", "targetSide": "ally", "ap": 3, "ch": 8, "learn": 10, "minSkill": 35, "range": 2, "note": "Снимает гендзюцу с видимого союзника в 2 гексах. Даёт +15 п.п. сопротивления до конца его следующего хода. Не лечит яд, ожоги или травмы.", "element": null, "school": "genjutsu", "power": 0}]);
const techById=Object.fromEntries(TECHS.map(t=>[t.id,t]));
const currentSkills=p=>TECHS.filter(t=>t.element==null||t.element===p.element);
const defaultSpells=p=>[TECHS.find(t=>t.element===p.element&&t.learn===0).id,'decoy','genMirage','genKai'];
const initializeSpells=p=>{if(!p.learned)p.learned=[...defaultSpells(p)];p.learned=p.learned.filter(id=>!!techById[id]&&(techById[id].element==null||techById[id].element===p.element));if(!p.learned.length)p.learned=defaultSpells(p);for(const id of ['genMirage','genKai'])if(!p.learned.includes(id))p.learned.push(id)};
roster.forEach(initializeSpells);
const priorGenerate=window.generate;
window.generate=function(...args){let p=priorGenerate(...args);initializeSpells(p);return p};
const priorChangeRank=window.changeRank;
window.changeRank=function(index){const remembered=[...roster[focus].learned];priorChangeRank(index);roster[focus].learned=remembered;initializeSpells(roster[focus]);renderSetup()};
let learningSchool='element',battleSchool='all';
function schoolOf(t){return t.school==='genjutsu'?'genjutsu':t.element!=null?'element':'common'}
function schoolTabs(current,battle=false){return '<div class="school-tabs">'+(battle?[['all','Все'],['element','Стихия'],['genjutsu','Гендзюцу'],['common','Общие']]:[['element','Стихия'],['genjutsu','Гендзюцу'],['common','Общие / призыв']]).map(([id,name])=>`<button type="button" data-${battle?'battle':'learn'}-school="${id}" aria-pressed="${current===id}">${name}</button>`).join('')+'</div>'}
function renderLearning(){
const panel=$('jutsuLearning');if(!panel)return;
const p=roster[focus];initializeSpells(p);
panel.innerHTML=`<div class="jutsu-heading"><h3>Изучение техник</h3><small>Очков навыков: <b>${p.skillPoints}</b></small></div><div class="muted" style="font-size:11px">Любая изученная техника доступна в бою. Новые дзюцу расходуют очки навыков, применение — чакру и ОД.</div>`+schoolTabs(learningSchool)+(learningSchool==='genjutsu'?'<p class="school-note">Школа разума доступна любой стихии. Мираж и Кай бесплатны. Сопротивление зависит от гендзюцу, восприятия и контроля чакры цели.</p>':'')+currentSkills(p).filter(t=>schoolOf(t)===learningSchool).map(t=>`<div class="jutsu-learning-row"><div class="detail"><b>${t.name}</b><small>${t.note} · ${t.ap} ОД / ${t.ch} чакры${t.minSkill?` · Для изучения: гендзюцу от ${t.minSkill}`:''}</small></div><button data-learn="${t.id}" ${p.learned.includes(t.id)||p.skillPoints<t.learn||(p.skills.genjutsu||0)<(t.minSkill||0)?'disabled':''}>${p.learned.includes(t.id)?'Изучено':t.learn+' оч.'}</button></div>`).join('');
panel.querySelectorAll('[data-learn-school]').forEach(b=>b.onclick=()=>{learningSchool=b.dataset.learnSchool;renderSetup()});
panel.querySelectorAll('[data-learn]').forEach(b=>b.onclick=()=>{const t=techById[b.dataset.learn];if(!t||p.learned.includes(t.id)||p.skillPoints<t.learn||(p.skills.genjutsu||0)<(t.minSkill||0))return;p.skillPoints-=t.learn;p.learned.push(t.id);renderSetup()});
}
const prevSetup=window.renderSetup;window.renderSetup=function(){prevSetup();renderLearning()};
const oldMakeUnit=window.makeUnit;window.makeUnit=function(source,team,i,c,r){initializeSpells(source);const u=oldMakeUnit(source,team,i,c,r);u.learned=[...source.learned];u.barrier=0;u.substitute=0;return u};
const prevNewGame=window.newGame;window.newGame=function(){prevNewGame();if(game){game.wallTurns=new Map;game.cloneSerial=0;renderGame()}};
const priorDamage=window.damage;
window.damage=function(attacker,defender,...rest){
if(defender.hp>0&&defender.substitute>0&&dist(attacker,defender)<=5){
 const choices=neigh(defender.c,defender.r).filter(c=>!obstacle(c.c,c.r)&&!unitAt(c.c,c.r));
 if(choices.length){const p={c:defender.c,r:defender.r};const q=choices[rand(choices.length)];defender.c=q.c;defender.r=q.r;defender.substitute=0;game.smoke.set(k(p.c,p.r),1);defender.reaction={kind:'dodge',at:Date.now()};log(`${defender.name} применяет замещение и уходит от удара!`,'good');return false}
}
const before=defender.hp;const result=priorDamage(attacker,defender,...rest);
if(defender.barrier>0&&defender.hp<before){let actual=before-defender.hp,absorbed=Math.ceil(actual*.4);defender.hp=Math.min(defender.maxHp,defender.hp+absorbed);defender.barrier=0;log(`${defender.name}: чакровый барьер поглощает ${absorbed} урона.`,'good')}
return result;
};
function techDamage(caster,target,value,id,hitOnly=false){
 const before=target.hp;const hit=damage(caster,target,value,'jutsu');
 if(hit && before>target.hp){
 if(target.hp>0)applyElementalWound(target,caster.element,id);
 if(caster.element===0){target.burn=Math.max(2,target.burn)}
 if(caster.element===1){target.slow=Math.max(1,target.slow);target.burn=0}
 if(caster.element===2 && id==='wind2'){const choices=neigh(target.c,target.r).filter(p=>!obstacle(p.c,p.r)&&!unitAt(p.c,p.r));if(choices.length){choices.sort((a,b)=>dist(b,caster)-dist(a,caster));target.c=choices[0].c;target.r=choices[0].r;log(`${target.name} отброшен ветром.`)}}
 if(caster.element===3&&(id==='light1'||id==='light2')&&rand(100)<17){target.stun=1;log(`${target.name}: электрический шок.`,'hurt')}
 if(caster.element===4 && id==='earth2'){target.slow=Math.max(target.slow,2);target.prone=Math.max(target.prone,1)}
 if(id==='water8'){target.slow=Math.max(target.slow||0,2);log(`${target.name} скован ледяными иглами на 2 раунда.`, 'good')}
 if(id==='light10'){target.stun=Math.max(target.stun||0,1);log(`${target.name}: громовой капкан оглушает.`, 'good')}
 if(id==='fire8'){target.burn=Math.max(target.burn||0,2)}
 if(id==='wind9'){target.slow=Math.max(target.slow||0,1)}
 }
 return hit;
}
function spellTargetsOnLine(caster,cell){const start=center(caster.c,caster.r),end=center(cell.c,cell.r);const passed=new Set,targets=[];for(let i=1;i<=24;i++){const t=i/24,pos=closestCell(start.x+(end.x-start.x)*t,start.y+(end.y-start.y)*t);if(!pos)continue;const who=unitAt(pos.c,pos.r);if(who&&who!==caster&&!passed.has(who.id)){passed.add(who.id);targets.push(who)}}return targets;}
function castSpell(caster,id,cell){
if(!game||game.over||caster.hp<=0)return false;
const t=techById[id];if(!t||!(caster.learned||[]).includes(id)||caster.ap<t.ap||caster.chakra<t.ch||(t.element!==null&&t.element!==caster.element))return false;
if(window.__genjutsu&&!window.__genjutsu.actionAllowed(caster,'tech:'+id))return false;
 if(caster.isClone){
  if(caster.cloneKind==='illusion')return false;
  // No summons from clones, and cap recursive cloning to two living copies per original.
  if(t.kind==='summon')return false;
  // Clones are limited by available chakra, action points and free space, not an arbitrary slot cap.
 }
 if(t.school==='genjutsu')return window.__genjutsu?.cast(caster,t,cell)??false;
 // Equal repertoire, unequal strength. Shadow 80%, elemental 55% damage.
 const clonePower=(value)=>caster.isClone?Math.max(1,Math.round(value*(caster.cloneKind==='shadow'?.8:.55))):value;
 const areaPower=(value)=>Math.max(1,Math.round(clonePower(value)*(window.__shinobiEnvironment?.multiplier(t.element)||1)*(window.__genjutsu?.damageMultiplier(caster)||1)));
 const soundBefore=game.units.map(u=>({id:u.id,hp:u.hp}));
if(caster.team==='ally'&&game.phase!=='ally')return false;
const isSelf=t.kind==='self';const loc=isSelf?{c:caster.c,r:caster.r}:cell;
if(!loc||!inBoard(loc.c,loc.r)||dist(caster,loc)>t.range)return false;
const target=unitAt(loc.c,loc.r);
if(t.kind==='clone'&&(dist(caster,loc)!==1||target||obstacle(loc.c,loc.r)))return false;
if(t.kind==='wall'&&(target||obstacle(loc.c,loc.r)))return false;
if(t.kind==='heal'&&(!target||target.team!==caster.team||target.hp<=0||(target.hp>=target.maxHp&&!target.wound&&!target.burn&&!target.poison)))return false;
if(t.kind==='dash'){
 if(dist(caster,loc)<1||target||obstacle(loc.c,loc.r))return false;
 const route=pathTo(caster,loc.c,loc.r);
 if(!route||route.length<1||route.length>t.range)return false;
}
if(['hit','chain'].includes(t.kind) && (!target||target.team===caster.team||!window.canAim(caster,target)))return false;
if(['blast','line'].includes(t.kind) && (obstacle(loc.c,loc.r)||!lineClear(caster,loc)||smokeBlocksAim(caster,loc)))return false;
const castFrom={c:caster.c,r:caster.r};
caster.ap-=t.ap;caster.chakra-=t.ch;if(caster.isClone)caster.__actedThisRound=true;caster.fatigue=Math.min(100,(caster.fatigue||0)+8);if(!isSelf)lookAt(caster,loc);
if(t.kind==='self'){
 if(id==='shield'){caster.barrier=1;log(`${caster.name}: чакровый барьер готов (поглотит часть следующего удара).`,'good')}
 if(id==='replace'){caster.substitute=1;log(`${caster.name} готовит технику замещения.`,'good')}
 if(id==='water9'){caster.barrier=1;caster.burn=0;caster.wet=Math.max(caster.wet||0,1);log(`${caster.name} защищён водяным куполом и потушен.`,'good')}
 if(id==='earth8'){caster.barrier=1;caster.guard=Math.max(caster.guard||0,1);caster.prone=0;log(`${caster.name} покрывается каменными латами.`,'good')}
 if(id==='smokeShift'){caster.substitute=1;game.smoke.set(k(caster.c,caster.r),2);log(`${caster.name} скрывается в дыму и готовит подмену.`,'good')}
}else if(t.kind==='heal'){
 const amount=Math.min(target.maxHp-target.hp,clonePower(t.power));
 target.hp+=amount;target.poison=0;target.wound=0;target.burn=0;
 log(`${caster.name} применяет медицинское ниндзюцу: ${target.name} +${amount} HP, яд снят.`, 'good');
}else if(t.kind==='dash'){
 const prev={c:caster.c,r:caster.r};
 caster.c=loc.c;caster.r=loc.r;game.smoke.set(k(prev.c,prev.r),1);
 if(id==='light8'){
  for(const victim of game.units.filter(v=>v.hp>0&&v.team!==caster.team&&dist(v,caster)===1)){
   const amount=elementalDamage(victim,clonePower(7),3,'jutsu');victim.hp=Math.max(0,victim.hp-amount);if(amount>0)victim.reaction={kind:'hurt',at:Date.now()};if(amount&&victim.hp>0)applyElementalWound(victim,3,id);
   if(rand(100)<35)victim.stun=Math.max(victim.stun||0,1);
   log(`Молниеносный рывок: ${victim.name} −${amount} HP.`, 'good');
  }
 }
 log(`${caster.name} выполняет «${t.name}» на (${loc.c+1}, ${loc.r+1}).`, 'good');
}else if(t.kind==='clone'){
 const serial=++game.cloneSerial;
 const isShadow=id==='shadow',isIllusion=id==='decoy';
 const clone={...caster,id:`clone${serial}`,name:`${caster.name} · клон ${serial}`,c:loc.c,r:loc.r,team:caster.team,hp:isIllusion?1:isShadow?22:17,maxHp:isIllusion?1:isShadow?22:17,chakra:0,maxChakra:0,ap:isIllusion?0:Math.max(3,Math.min(7,caster.maxAp||6)),maxAp:isIllusion?0:Math.max(3,Math.min(7,caster.maxAp||6)),learned:isIllusion?[]:[...(caster.learned||[])],isClone:true,genEffects:{},genControlUntil:0,cloneKind:isIllusion?'illusion':isShadow?'shadow':'element',cloneTurns:isIllusion?2:3,cloneOwner:caster.cloneOwner||caster.id,guard:0,substitute:0,barrier:0,stun:0,burn:0,poison:0,slow:0,prone:0,blur:0,gear:{},reaction:null};
 // Separate chakra reserves: the cost of creation was already paid above.
 // Shadow clones share the remaining chakra evenly. Elemental copies get a third.
 if(!isIllusion){
  const transferred=Math.floor(caster.chakra/(isShadow?2:3));
  clone.chakra=transferred;clone.maxChakra=transferred;
  caster.chakra-=transferred;
  clone.attrs={...caster.attrs,str:Math.max(1,Math.round(caster.attrs.str*(isShadow?.85:.65)))};
  clone.skills={...caster.skills};
  clone.cloneElement=caster.element;
 }
 clone.__actedThisRound=false;
 caster.__cloneRevealed=false;clone.__cloneRecognized=false;
  // Brief substitution: the two identical silhouettes may exchange hexes during the smoke.
  if(rand(2)===0){const previous={c:caster.c,r:caster.r};caster.c=clone.c;caster.r=clone.r;clone.c=previous.c;clone.r=previous.r;}
  game.units.push(clone);if(caster.team==='ally'){game.selected=isIllusion?caster.id:clone.id;game.action='move';}log(`${caster.name}: создан ${isIllusion?'иллюзорный':isShadow?'теневой':'стихийный'} клон на клетке ${loc.c+1}:${loc.r+1}.`,'good');
}else if(t.kind==='wall'){
 game.blocked.add(k(loc.c,loc.r));game.wallTurns.set(k(loc.c,loc.r),2);log(`${caster.name} воздвигает земляную стену на 2 раунда.`,'good');
}else if(t.kind==='hit'){
 techDamage(caster,target,clonePower(t.power),id);
}else if(t.kind==='chain'){
 techDamage(caster,target,clonePower(t.power),id);const others=game.units.filter(u=>u.hp>0&&u!==target&&u!==caster&&dist(u,target)<=1).slice(0,2);for(const v of others){let amount=elementalDamage(v,areaPower(8+rand(5)),t.element,'jutsu');v.hp=Math.max(0,v.hp-amount);if(amount>0)v.reaction={kind:'hurt',at:Date.now()};if(amount&&v.hp>0)applyElementalWound(v,t.element??caster.element,id);
 if(id==='fire8'&&amount>0&&v.hp>0)v.burn=Math.max(v.burn||0,2);
 if(id==='wind9')v.slow=Math.max(v.slow||0,1);
 if(id==='light9'&&rand(100)<20)v.stun=Math.max(v.stun||0,1);
 log(`${t.name}: ${v.name} −${amount} HP.`,v.team===caster.team?'hurt':'good')}
}else if(t.kind==='blast'){
 const victims=aoeUnits(loc,1);for(const v of victims){const actual=elementalDamage(v,areaPower(dist(v,loc)===0?t.power:Math.ceil(t.power*.72)),t.element,'jutsu');v.hp=Math.max(0,v.hp-actual);if(actual>0)v.reaction={kind:'hurt',at:Date.now()};if(actual&&v.hp>0)applyElementalWound(v,t.element??caster.element,id);if(id==='fire2'&&actual>0&&v.hp>0)v.burn=Math.max(v.burn||0,2);if(id==='water3'){v.burn=0;v.slow=Math.max(v.slow,1)}
 if(id==='water10'){v.burn=0;v.wet=Math.max(v.wet||0,2);v.slow=Math.max(v.slow||0,2)}
 if(id==='fire9'&&actual>0&&v.hp>0){v.blur=Math.max(v.blur||0,2);v.burn=Math.max(v.burn||0,1)}
 if(id==='wind10'||id==='earth9'){v.prone=Math.max(v.prone||0,1)}
 if(id==='chakraWave')v.slow=Math.max(v.slow||0,1);
 log(`${t.name}: ${v.name} −${actual} HP.`,v.team===caster.team?'hurt':'good')}
}else if(t.kind==='line'){
 for(const v of spellTargetsOnLine(caster,loc)){const actual=elementalDamage(v,areaPower(t.power),t.element,'jutsu');v.hp=Math.max(0,v.hp-actual);if(actual>0)v.reaction={kind:'hurt',at:Date.now()};if(actual&&v.hp>0)applyElementalWound(v,t.element??caster.element,id);if((id==='fire3'||id==='fire10')&&actual>0&&v.hp>0)v.burn=Math.max(v.burn||0,id==='fire10'?3:2);
 if(id==='earth10')v.slow=Math.max(v.slow||0,2);
 log(`${t.name}: ${v.name} −${actual} HP.`,v.team===caster.team?'hurt':'good')}
}
if((!['self','clone','wall'].includes(t.kind))||['water9','earth8','smokeShift'].includes(id)){cueFx({action:'jutsu',actor:caster.id,from:castFrom,target:loc,element:caster.element,targetId:target?.id,spellName:t.name,affectedIds:soundBefore.filter(s=>game.units.find(u=>u.id===s.id)?.hp<s.hp).map(s=>s.id)})}
if(game.weather==='rain')for(const u of game.units)u.burn=Math.min(u.burn||0,1);
 window.__shinobiAudio?.recordSpell(caster,soundBefore);
 checkEnd();renderGame();return true;
}
async function actClones(){
 if(!game||game.over)return;
 for(const clone of game.units.filter(u=>u.isClone&&u.team==='ally'&&u.hp>0)){
  if(clone.cloneKind==='illusion'||clone.__actedThisRound)continue;
  const foes=game.units.filter(u=>u.team==='enemy'&&u.hp>0&&visibleToSide('ally',u)).sort((a,b)=>dist(clone,a)-dist(clone,b));
  if(!foes.length)break;
  const target=foes[0],d=dist(clone,target);
  // Select an actually learned damaging technique, paid for out of the clone's chakra.
  const options=(clone.learned||[]).map(id=>techById[id]).filter(t=>t&&['hit','blast','line','chain'].includes(t.kind)&&t.ap<=clone.maxAp&&t.ch<=clone.chakra&&t.range>=d&&canAim(clone,target)&&(t.element===null||t.element===clone.element));
  options.sort((a,b)=>a.ch-b.ch||b.power-a.power);
  if(options.length){
   const chosen=options[0];clone.ap=Math.max(clone.ap,Math.min(clone.maxAp,chosen.ap));
   if(castSpell(clone,chosen.id,{c:target.c,r:target.r})){
    clone.__actedThisRound=true;log(`${clone.name} самостоятельно выполняет ${chosen.name}.`,'good');await waitFx();continue;
   }
  }
  if(d===1){techDamage(clone,target,clone.cloneKind==='shadow'?6:4,'clone');cueFx({action:'quick',actor:clone.id,from:{c:clone.c,r:clone.r},target:{c:target.c,r:target.r},targetId:target.id});clone.__actedThisRound=true;await waitFx();}
  else{
   const dest=neigh(target.c,target.r).filter(p=>!unitAt(p.c,p.r)&&!obstacle(p.c,p.r)).map(p=>({p,path:pathTo(clone,p.c,p.r)})).filter(x=>x.path).sort((a,b)=>a.path.length-b.path.length)[0];
   if(dest&&dest.path.length){moveUnit(clone,dest.path,Math.min(2,dest.path.length));clone.__actedThisRound=true;await waitFx()}
  }
 }
}
const prevEnemyTurn=window.enemyTurn;
window.enemyTurn=async function(){
 if(!game||game.over||game.phase!=='ally')return;
 const started=game;
 game.phase='clone';$('endTurn').disabled=true;
 try{
   try {await actClones()} catch(error) {console.error('Clone AI turn:',error);log('Клон пропустил действие; бой продолжается.','hurt')}
   try {await actFriendlySummons()} catch(error) {console.error('Summon AI turn:',error);log('Призыв пропустил действие; бой продолжается.','hurt')}
   try {await enemySummonTactics()} catch(error) {console.error('Enemy summon turn:',error);log('Призыв врага пропустил действие; бой продолжается.','hurt')}
   await prevEnemyTurn();
   if(!game||game!==started||game.over)return;
   for(const clone of game.units.filter(u=>u.isClone&&u.hp>0)){
      clone.__actedThisRound=false;clone.cloneTurns--;
      if(clone.cloneTurns<=0){clone.hp=0;log(`${clone.name} рассеивается.`)}
   }
   for(const [cell,rounds] of [...game.wallTurns]){
       if(rounds<=1){game.wallTurns.delete(cell);game.blocked.delete(cell);log('Земляная стена осыпалась.')}
       else game.wallTurns.set(cell,rounds-1)
   }
 }catch(error){
   console.error('Shinobi: turn-cycle recovered from failure',error);
   if(game===started&&!game.over){
      log('Ошибка хода ИИ: управление возвращено игроку.','hurt');
      game.phase='ally';game.animating=false;
      for(const u of game.units.filter(u=>u.team==='ally'&&u.hp>0)){u.ap=Math.max(1,u.ap||0)}
   }
 }finally{
   if(game===started&&!game.over){
      if(!game.units.some(u=>u.id===game.selected&&u.hp>0&&u.team==='ally'))
       game.selected=game.units.find(u=>u.team==='ally'&&u.hp>0&&!u.isClone)?.id || game.units.find(u=>u.team==='ally'&&u.hp>0)?.id || null;
      // Never leave controls locked in the interim clone phase after an exception.
      if(game.phase==='clone')game.phase='ally';
      $('endTurn').disabled=game.phase!=='ally'||!!game.animating;
      renderGame();
   }
 }
};
function renderBattleSpells(){const area=$('jutsuPanel');if(!area||!game)return;let u=me();if(!u)return;area.innerHTML=schoolTabs(battleSchool,true)+(u.learned||[]).map(id=>techById[id]).filter(Boolean).filter(t=>battleSchool==='all'||schoolOf(t)===battleSchool).map(t=>{
 const enabled=game.phase==='ally'&&u.hp>0&&!game.animating&&u.ap>=t.ap&&u.chakra>=t.ch&&(!window.__genjutsu||t.school!=='genjutsu'||t.targetSide!=='self'||window.__genjutsu.canCast(u,t,u));
 return `<button data-tech="${t.id}" ${enabled?'':'disabled'} class="${game.action==='tech:'+t.id?'chosen':''}">${t.name}<small>${t.ap} ОД · ${t.ch} чакры${t.school==='genjutsu'?'':` · срыв ${shinobi519NinFailChance(u,t)}%`}</small></button>`}).join('')+'<div class="jutsu-note" style="grid-column:1/-1">Выбери технику и цель на поле. Защита и замещение действуют сразу. Клону нужен свободный соседний гекс.</div>';
 area.querySelectorAll('[data-battle-school]').forEach(b=>b.onclick=()=>{battleSchool=b.dataset.battleSchool;renderGame()});
 area.querySelectorAll('[data-tech]').forEach(b=>b.onclick=()=>{const id=b.dataset.tech,t=techById[id];if(t.kind==='self'||t.kind==='arsenal'){castSpell(me(),id,{c:me().c,r:me().r})}else{game.action='tech:'+id;renderGame()}});
 const swordButton=document.querySelector('#actionButtons button[data-action="sword"]');
 if(swordButton){const risk=shinobi519KenFailChance(u);swordButton.title=`Кендзюцу: вероятность сорвать приём ${risk}% (не то же самое, что промах)`;const hint=swordButton.querySelector('small');if(hint&&!hint.textContent.includes('срыв'))hint.textContent+=` · срыв ${risk}%`;}
}
function mobileSelectTech591(e){
 const b=e.target.closest('#jutsuPanel button[data-tech]');if(!b||b.disabled)return;
 const id=b.dataset.tech,t=techById[id],u=me();if(!t||t.kind==='self'||t.kind==='arsenal')return;
 if(!game||game.over||game.phase!=='ally'||game.animating||!u||u.hp<=0||!u.learned?.includes(id)||u.ap<t.ap||u.chakra<t.ch)return;
 e.preventDefault();e.stopImmediatePropagation();game.action='tech:'+id;game.hoverCell=null;renderGame();
}
$('jutsuPanel').addEventListener('click',mobileSelectTech591,true);
const previousRenderGame=window.renderGame;window.renderGame=function(){previousRenderGame();renderBattleSpells()};
const previousActionAvailable=window.actionAvailable;
window.actionAvailable=function(u,a){if(a&&a.startsWith('tech:')){const t=techById[a.slice(5)];return !!(u&&t&&game&&game.phase==='ally'&&u.hp>0&&!game.animating&&u.learned?.includes(t.id)&&u.ap>=t.ap&&u.chakra>=t.ch)}return previousActionAvailable(u,a)};
const prevExecute=window.execute;window.execute=function(u,action,cell){if(action&&action.startsWith('tech:'))return castSpell(u,action.slice(5),cell);return prevExecute(u,action,cell)};
// UI hover подсвечивает клетку применения и область поражения.
const previewDraw=window.draw;window.draw=function(){previewDraw();if(!game||!game.hoverCell||!game.action?.startsWith('tech:'))return;const t=techById[game.action.slice(5)];if(!t)return;const dest=game.hoverCell;if(!me()||dist(me(),dest)>t.range)return;ctx.save();for(let r=0;r<H;r++)for(let c=0;c<W;c++){
  let radius=t.kind==='blast'?1:0;if(dist({c,r},dest)>radius)continue;
  hexPath(c,r);ctx.fillStyle=(t.kind==='clone'?'rgba(116,218,232,.28)':t.kind==='wall'?'rgba(197,165,116,.34)':'rgba(255,159,85,.22)');ctx.fill();ctx.strokeStyle='rgba(244,234,180,.62)';ctx.lineWidth=2;ctx.stroke();
 }ctx.restore()};
// АЛЬФА 1.9 — Двенадцать техник призыва, тактические взаимодействия стихий.
const BEASTS={
 hound:{name:'Боевой пёс',hp:28,ap:6,power:9,special:'Наскок',color:'#a78162',cost:18},
 snake:{name:'Змея',hp:19,ap:6,power:7,special:'Ядовитый укус',color:'#78945b',cost:14},
 toad:{name:'Боевая жаба',hp:35,ap:5,power:11,special:'Таран',color:'#698c5b',cost:20},
 spider:{name:'Паук',hp:22,ap:6,power:6,special:'Паутина',color:'#514e45',cost:17},
 wolf:{name:'Волк',hp:43,ap:7,power:13,special:'Рывок',color:'#abb2b5',cost:29},
 tortoise:{name:'Панцирная черепаха',hp:62,ap:4,power:7,special:'Панцирь',color:'#82926e',cost:27}
};
// Видимые статусы и взаимодействия стихии: вода + молния, ветер + огонь, земля + вода.
const priorTechDamage18=techDamage;
techDamage=function(caster,target,value,id,hitOnly=false){
 const wet=target.wet||0,burn=target.burn||0;
 const hit=priorTechDamage18(caster,target,value,id,hitOnly);
 if(!hit)return false;
 if(caster.element===1){target.wet=Math.max(target.wet||0,2);log(`${target.name}: промокание (2 раунда).`,'good')}
 if(caster.element===3&&wet>0){const bonus=Math.min(6,3+Math.floor(value*.08));target.hp=Math.max(0,target.hp-bonus);if(rand(100)<25)target.stun=Math.max(target.stun||0,1);target.wet=0;log(`КОМБИНАЦИЯ ВОДА + МОЛНИЯ: ${target.name} −${bonus} HP, заряд расходует промокание.`,'good')}
 if(caster.element===2&&burn>0){const bonus=4;target.hp=Math.max(0,target.hp-bonus);target.burn=Math.max(target.burn||0,3);log(`КОМБИНАЦИЯ ОГОНЬ + ВЕТЕР: пламя разгорается, −${bonus} HP!`,'good')}
 if(caster.element===4&&wet>0){target.slow=Math.max(target.slow||0,2);target.prone=Math.max(target.prone||0,1);log(`КОМБИНАЦИЯ ВОДА + ЗЕМЛЯ: грязевая ловушка!`,'good')}
 if(game.weather==='rain'&&caster.element===0){target.burn=Math.min(target.burn||0,1)}
 return true;
};
function beastAt(c,r){return game.units.find(u=>u.hp>0&&u.isSummon&&u.c===c&&u.r===r)}
function newBeast(caster,t,loc,fromAI=false){
 const spec=BEASTS[t.beast],num=++game.summonSerial;
 const unit={...caster,id:`beast-${num}`,name:`${spec.name} ${num}`,team:caster.team,c:loc.c,r:loc.r,
  hp:spec.hp,maxHp:spec.hp,ap:0,maxAp:spec.ap,chakra:0,maxChakra:0,learned:[],gear:{},
  attrs:{...caster.attrs,str:Math.max(4,caster.attrs.str),agi:Math.max(3,caster.attrs.agi)},
  skills:{...caster.skills},isClone:false,isSummon:true,summonType:t.beast,summonOwner:caster.id,
  genEffects:{},genControlUntil:0,summonOrder:'manual',justSummoned:fromAI,prepaidSummon:0,barrier:0,substitute:0,guard:0,wet:0,
  burn:0,poison:0,stun:0,prone:0,slow:0,blur:0,reaction:null,fatigue:0};
 game.units.push(unit);return unit;
}
// Замена только для новых типов, существующие 20 дзюцу оставлены как в 1.7.
const oldCastSpell18=castSpell;
castSpell=function(caster,id,cell){
 const t=techById[id];if(!t||!['summon','arsenal','weaponAttack'].includes(t.kind))return oldCastSpell18(caster,id,cell);
 if(!game||game.over||!caster||caster.hp<=0||!(caster.learned||[]).includes(id)||caster.ap<t.ap||caster.chakra<t.ch)return false;
 if(t.element!==null&&t.element!==caster.element)return false;
 if(caster.team==='ally'&&game.phase!=='ally')return false;
 const loc=t.kind==='arsenal'?{c:caster.c,r:caster.r}:cell;
 if(!loc||!inBoard(loc.c,loc.r)||dist(caster,loc)>t.range)return false;
 if(t.kind==='summon'&&(dist(caster,loc)!==1||unitAt(loc.c,loc.r)||obstacle(loc.c,loc.r)))return false;
 if(t.kind==='weaponAttack'&&(!unitAt(loc.c,loc.r)||!window.canAim(caster,unitAt(loc.c,loc.r))||dist(caster,loc)===0))return false;
 caster.ap-=t.ap;caster.chakra-=t.ch;caster.fatigue=Math.min(100,(caster.fatigue||0)+7);
 if(t.kind==='arsenal'){
   caster.gear[t.item]=(caster.gear[t.item]||0)+t.qty;
   log(`${caster.name} распечатывает свиток: ${t.name}. В инвентаре +${t.qty}.`,'good');
 }else if(t.kind==='summon'){
   lookAt(caster,loc);const u=newBeast(caster,t,loc,caster.team==='enemy'&&!window.__shinobiNetwork?.active);
   log(`${caster.name} призывает ${u.name} (${u.hp} HP, ${u.maxAp} ОД).`,'good');
   cueFx({action:'smoke',actor:caster.id,from:{c:caster.c,r:caster.r},target:loc});
 }else{
   lookAt(caster,loc);
   for(const v of aoeUnits(loc,1)){const actual=dist(v,loc)===0?t.power:Math.ceil(t.power*.55);
     v.hp=Math.max(0,v.hp-actual);if(actual>0)v.reaction={kind:'hurt',at:Date.now()};log(`Оружейный град: ${v.name} −${actual} HP.`,v.team===caster.team?'hurt':'good');}
   cueFx({action:'paper',actor:caster.id,from:{c:caster.c,r:caster.r},target:loc});
 }
 checkEnd();renderGame();return true;
};
const oldStartGame18=window.newGame;
window.newGame=function(){oldStartGame18();if(!game)return;
 game.summonSerial=0;
 // Нечестных ресурсов ИИ нет: оппонент тоже платит чакру и ОД.
 const enem=game.units.find(u=>u.team==='enemy'&&!u.isClone);
 if(enem&&!enem.learned.includes('summonHound'))enem.learned.push('summonHound');
 renderGame();
};
// Существа игрока выбираются через вкладку или кликом по фигурке. Приказы не требуют отдельных слотов.
const oldRenderGame18=window.renderGame;
window.renderGame=function(){oldRenderGame18();if(!game)return;
 const pets=game.units.filter(u=>u.isSummon&&u.team==='ally'&&u.hp>0);
 const tabs=$('battleTabs');
 if(tabs){const frag=document.createElement('span');frag.className='summonTabs';pets.forEach(p=>{
   const b=document.createElement('button');b.dataset.id=p.id;b.textContent=`${p.name} · ${p.ap} ОД`;
   if(game.selected===p.id)b.classList.add('selected');b.onclick=()=>{game.selected=p.id;game.action='move';renderGame()};frag.appendChild(b)
 });tabs.appendChild(frag)}
 const u=me();if(u?.isSummon){
   const bs=BEASTS[u.summonType];
   $('statusSelected').textContent='Призванное существо';
   $('unitInfo').innerHTML=`<div style="font-weight:700;font-size:15px">${u.name}</div><div class="muted">${bs.special} · ${u.summonType}</div><div class="muted" style="margin-top:8px">Здоровье ${u.hp}/${u.maxHp}</div><div class="meter"><span style="width:${100*u.hp/u.maxHp}%;background:#81b99f"></span></div><div class="muted" style="margin-top:7px">Очки действий ${u.ap}/${u.maxAp}</div><div class="muted">Приказ: ${u.summonOrder==='manual'?'Вручную':u.summonOrder==='guard'?'Защищать хозяина':'Атаковать врага'}</div>`;
   $('actionButtons').innerHTML=[['move','Перейти','1 ОД / гекс'],['pet:attack','Атаковать','3 ОД'],['pet:special',BEASTS[u.summonType].special,'4 ОД'],['guard','Защита','2 ОД']].map(([id,label,c])=>`<button class="action ${game.action===id?'selected':''}" data-action="${id}" ${u.ap<(id==='pet:special'?4:id==='pet:attack'?3:id==='guard'?2:1)||game.phase!=='ally'?'disabled':''}>${label}<small>${c}</small></button>`).join('');
   $('actionButtons').querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{const a=b.dataset.action;if(a==='guard')execute(u,a,{c:u.c,r:u.r});else {game.action=a;renderGame()}});
   const panel=$('jutsuPanel');if(panel)panel.innerHTML='<div class="jutsu-note">Призванные животные не используют человеческие дзюцу. Приказы ниже.</div>';
   const cmds=document.createElement('div');cmds.id='summonOrders';cmds.innerHTML='<button class="petCommand" data-order="manual">Вручную</button><button class="petCommand" data-order="attack">Атаковать рядом</button><button class="petCommand" data-order="guard">Защищать хозяина</button>';
   $('actionButtons').parentNode.appendChild(cmds);
   cmds.querySelectorAll('[data-order]').forEach(b=>{if(u.summonOrder===b.dataset.order)b.classList.add('selected');b.onclick=()=>{u.summonOrder=b.dataset.order;renderGame()}});
 }else {document.querySelectorAll('#summonOrders button[data-order]').forEach(e=>e.remove());}
 if(u?.wet){const pill=document.createElement('span');pill.className='pill';pill.textContent=`Мокрый: ${u.wet}`;$('unitInfo').appendChild(pill)}
};
// Не создавать второй набор приказов на каждом перерисовывании.
// Применяется после renderGame, чтобы предыдущий блок был заменён, а не накоплен.
const redraw18=window.renderGame;
window.renderGame=function(){document.querySelectorAll('#actionButtons ~ #summonOrders').forEach(el=>el.remove());redraw18()};
const oldAvailable18=window.actionAvailable;
window.actionAvailable=function(u,action){
 if(action?.startsWith('pet:'))return !!(u?.isSummon&&(window.__shinobiNetwork?.canSimulate(u)||(u.team==='ally'&&game.phase==='ally'))&&u.hp>0&&!game.animating&&u.ap>=(action==='pet:special'?4:3));
 return oldAvailable18(u,action);
};
const oldExecute18=window.execute;
window.execute=function(u,action,cell){
 if(!action?.startsWith('pet:'))return oldExecute18(u,action,cell);
 if(!actionAvailable(u,action)||!cell)return false;
 const enemy=unitAt(cell.c,cell.r);
 if(!enemy||enemy.team===u.team||dist(u,enemy)!==1)return false;
 const special=action==='pet:special';
 u.ap-=special?4:3;u.fatigue=Math.min(100,(u.fatigue||0)+(special?9:6));lookAt(u,cell);
 const hit=damage(u,enemy,BEASTS[u.summonType].power+(special?4:0),'melee',0,false);
 if(hit&&special){
   if(u.summonType==='snake'||u.summonType==='spider')enemy.poison=Math.max(enemy.poison||0,2);
   if(u.summonType==='spider')enemy.slow=Math.max(enemy.slow||0,2);
   if(u.summonType==='toad'||u.summonType==='wolf')enemy.prone=Math.max(enemy.prone||0,1);
   if(u.summonType==='tortoise'){u.guard=1;}
 }
 cueFx({action:'melee',actor:u.id,from:{c:u.c,r:u.r},target:cell,targetId:enemy.id});
 checkEnd();renderGame();return true;
};
async function actFriendlySummons(){
 if(!game||game.over)return;
 for(const pet of game.units.filter(u=>u.isSummon&&u.team==='ally'&&u.hp>0&&u.summonOrder!=='manual')){
   const own=game.units.find(u=>u.id===pet.summonOwner);
   const foes=game.units.filter(u=>u.team==='enemy'&&u.hp>0&&visibleToSide('ally',u)).sort((a,b)=>dist(a,pet)-dist(b,pet));
   if(!foes.length)continue;
   const target=pet.summonOrder==='guard'&&own?foes.sort((a,b)=>dist(a,own)-dist(b,own))[0]:foes[0];
   if(dist(pet,target)===1&&pet.ap>=3){pet.ap-=3;damage(pet,target,BEASTS[pet.summonType].power,'melee');await waitFx();}
   else if(pet.ap>=3){const cells=neigh(target.c,target.r).filter(p=>!unitAt(p.c,p.r)&&!obstacle(p.c,p.r)).map(p=>({p,path:pathTo(pet,p.c,p.r)})).filter(x=>x.path).sort((a,b)=>a.path.length-b.path.length);
      if(cells.length&&cells[0].path.length){moveUnit(pet,cells[0].path,Math.min(cells[0].path.length,2));await waitFx()}}
 }
}
async function enemySummonTactics(){
 if(!game||game.over)return;
 const summoner=game.units.find(u=>u.team==='enemy'&&!u.isSummon&&!u.isClone&&u.hp>0&&u.learned?.includes('summonHound'));
 if(!summoner||summoner.chakra<18||summoner.ap<5)return;
 const loc=neigh(summoner.c,summoner.r).find(c=>!obstacle(c.c,c.r)&&!unitAt(c.c,c.r));
 if(!loc)return;
 const t=techById.summonHound;
 if(castSpell(summoner,t.id,loc)){summoner.prepaidSummon=(summoner.prepaidSummon||0)+t.ap;log('ИИ вызывает союзника и тратит чакру.','hurt')}
}
const prevRound18=window.enemyTurn;
window.enemyTurn=async function(){if(!game||game.over||game.phase!=='ally')return;
 await prevRound18();if(!game||game.over)return;
 for(const u of game.units.filter(x=>x.hp>0)){if(u.wet)u.wet--}
 renderGame();
};
// Рисуем узнаваемые силуэты шести животных (пока векторные игровые фигуры).
window.drawSummons=function(){if(!game)return;
 for(const u of game.units.filter(x=>x.isSummon&&x.hp>0&&(x.team==='ally'||visibleToSide('ally',x))).sort((a,b)=>a.r-b.r)){
   const p=spritePos(u,center(u.c,u.r));const spec=BEASTS[u.summonType];if(!spec)continue;
   ctx.save();ctx.translate(p.x,p.y);const scale=u.summonType==='tortoise'?1.12:1;ctx.scale(scale,scale);
   ctx.fillStyle='rgba(1,12,7,.7)';ctx.beginPath();ctx.ellipse(0,13,30,11,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle=u.team==='ally'?'#72ddc5':'#ef938a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,13,29,10,0,0,Math.PI*2);ctx.stroke();
   ctx.fillStyle=spec.color;ctx.strokeStyle='#18241e';ctx.lineWidth=2.5;
   const ellipse=(x,y,rx,ry)=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.stroke()};
   const line=(x1,y1,x2,y2)=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
   if(u.summonType==='hound'||u.summonType==='wolf'){
     for(const x of [-17,-7,12,23]){ctx.lineWidth=6;line(x,-5,x-3,11)}ctx.lineWidth=2.5;
     ellipse(0,-13,u.summonType==='wolf'?29:25,13);ellipse(22,-20,13,11);
     ctx.beginPath();ctx.moveTo(14,-26);ctx.lineTo(17,-42);ctx.lineTo(25,-29);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(25,-26);ctx.lineTo(34,-40);ctx.lineTo(35,-22);ctx.fill();ctx.stroke();
     ctx.lineWidth=5;line(-24,-16,-36,-29);ctx.fillStyle='#fbe2ad';ctx.fillRect(28,-22,4,3);
   }else if(u.summonType==='snake'){
     ctx.lineWidth=15;ctx.strokeStyle='#466d3a';ctx.beginPath();ctx.moveTo(-28,9);ctx.bezierCurveTo(-12,-26,8,20,20,-22);ctx.bezierCurveTo(27,-37,27,-44,20,-48);ctx.stroke();ctx.lineWidth=6;ctx.strokeStyle='#a5ad6d';ctx.beginPath();ctx.moveTo(20,-48);ctx.lineTo(33,-49);ctx.stroke();ctx.fillStyle='#f5cc87';ctx.fillRect(28,-51,3,3);
   }else if(u.summonType==='toad'){
     ellipse(0,-8,28,20);ellipse(-20,2,12,10);ellipse(21,2,12,10);
     ellipse(-13,-28,9,10);ellipse(13,-28,9,10);ctx.fillStyle='#e2dc98';ctx.fillRect(-15,-30,4,4);ctx.fillRect(11,-30,4,4);
   }else if(u.summonType==='spider'){
     ctx.lineWidth=4;for(let i=0;i<4;i++){const y=-26+i*8;line(-8,y,-29,y-13);line(-29,y-13,-39,y+6);line(8,y,29,y-13);line(29,y-13,39,y+6)}ellipse(0,-13,20,16);ellipse(0,-30,13,11);ctx.fillStyle='#f4a66b';ctx.fillRect(-7,-32,3,4);ctx.fillRect(4,-32,3,4);
   }else if(u.summonType==='tortoise'){
     for(const x of [-23,23]){ellipse(x,6,10,8);ellipse(x,-11,10,7)}ellipse(0,-13,31,23);
     ctx.strokeStyle='#b2bc80';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-24,-12);ctx.lineTo(19,-29);ctx.moveTo(-14,-32);ctx.lineTo(21,-7);ctx.stroke();ellipse(31,-18,11,8);ctx.fillStyle='#fff0a7';ctx.fillRect(36,-21,3,3);
   }
   ctx.restore();const len=Math.max(28,Math.min(69,u.name.length*6));
   ctx.save();ctx.fillStyle='rgba(4,15,14,.82)';ctx.fillRect(p.x-len/2,p.y+24,len,17);ctx.textAlign='center';ctx.fillStyle='#f5f2e7';ctx.font='10px sans-serif';ctx.fillText(u.name,p.x,p.y+36);ctx.fillStyle='#24332c';ctx.fillRect(p.x-27,p.y-67,54,7);ctx.fillStyle=u.team==='ally'?'#8cdcc8':'#f29c9a';ctx.fillRect(p.x-26,p.y-66,52*u.hp/u.maxHp,5);ctx.restore();
 }
};

window.__arena18={castSpell,BEASTS,TECHS,techDamage,newBeast,actFriendlySummons,enemySummonTactics};

const BEAST_SPRITE_SOURCES={"hound":"assets/fdbb8e85c959a8dd5d8f72f2.webp","wolf":"assets/53ad16d05a2386667a849e6f.webp","snake":"assets/f5553bdcbebae5a0e82536a2.webp","toad":"assets/f6adea7857f049baf664748f.webp","spider":"assets/a5e8baf6488a8720087783cf.webp","tortoise":"assets/ab5612e2f94ad4c987ff0d8a.webp"};

const toadFrames588=new Image();toadFrames588.src="assets/2ab06a85e6bdc3aeb2d2c826.webp";toadFrames588.onload=()=>{if(game)draw()};
const REFERENCE_BEASTS={};
for(const [kind,src] of Object.entries({"toad": "assets/de813ee43c7cdf27d46792b2.webp", "wolf": "assets/228436dabb96afccd792ce2e.webp", "snake": "assets/d4808f7d84a3aa95fae2444d.webp"})){const img=new Image();img.src=src;img.onload=()=>{if(game)draw()};REFERENCE_BEASTS[kind]=img;}
const BEAST_IMAGES={};
for(const [kind,uri] of Object.entries(BEAST_SPRITE_SOURCES)){
 const img=new Image(); img.onload=()=>{if(game)draw()};img.src=uri;BEAST_IMAGES[kind]=img;
}
// Статусы дополнительных техник. Не меняем стоимость, уровни или меню свободного обучения.
const previousTechDamage19=techDamage;
techDamage=function(caster,target,amount,id,...rest){
 const ok=previousTechDamage19(caster,target,amount,id,...rest);
 if(!ok) return false;
 if(['fire4','fire5','fire6'].includes(id))target.burn=Math.max(target.burn||0,2);
 if(id==='fire7')target.blur=Math.max(target.blur||0,2);
 if(id==='water5'){target.slow=Math.max(target.slow||0,1);}
 if(id==='water7')target.slow=Math.max(target.slow||0,2);
 if(id==='wind7')target.blur=Math.max(target.blur||0,1);
 if(['light5','light7'].includes(id)&&rand(100)<20)target.stun=Math.max(target.stun||0,1);
 if(id==='earth5')target.prone=Math.max(target.prone||0,1);
 if(id==='earth7')target.slow=Math.max(target.slow||0,2);
 return true;
};
const prevNewBeast19=newBeast;
newBeast=function(...args){const u=prevNewBeast19(...args);u.spawnAnimationStart=performance.now();return u;};
// Прозрачные животные на отдельном слое canvas. Сохраняется логическое положение в клетке.
window.drawSummons=function(){if(!game)return;
 const now=performance.now();
 for(const u of game.units.filter(v=>v.isSummon&&v.hp>0&&(v.team==='ally'||visibleToSide('ally',v))).sort((a,b)=>a.r-b.r)){
  const base=spritePos(u,center(u.c,u.r)),im=BEAST_IMAGES[u.summonType],spec=BEASTS[u.summonType];if(!spec)continue;
  const turn=u.team==='enemy'?-1:1;
  const move=activeFx?.actor===u.id && activeFx?.action==='move',
        attack=activeFx?.actor===u.id && ['melee','quick','heavy','sword'].includes(activeFx?.action),
        t=activeFx?.progress||0;
  const moveSwing=0;
  const breath=move||attack?0:Math.sin(now/1600+u.c*0.7+u.r*0.4)*0.003;
  const bob=0;
  const thrust=attack?Math.sin(Math.PI*Math.min(1,t))*15:0;
  const hitAge=u.reaction?Date.now()-u.reaction.at:9999;
  const hitShift=hitAge<350?Math.sin(hitAge/350*Math.PI*3)*5:0;
  const fade=Math.min(1,(now-(u.spawnAnimationStart||0))/380);
  const ref=REFERENCE_BEASTS[u.summonType],useRef=ref?.complete&&ref.naturalWidth;
  const w=useRef?138:((u.summonType==='wolf'||u.summonType==='snake')?100:88);
  const h=useRef?100:((u.summonType==='wolf')?82:76);
  const dx=base.x+turn*thrust+hitShift;
  const dy=base.y-12-bob;
  ctx.save();ctx.globalAlpha=fade;
  ctx.fillStyle='rgba(0,12,9,.62)';ctx.beginPath();ctx.ellipse(base.x,base.y+14,31,10,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=u.team==='ally'?'rgba(104,218,199,.9)':'rgba(239,147,138,.9)';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.ellipse(base.x,base.y+14,29,10,0,0,Math.PI*2);ctx.stroke();
  if(useRef||(im?.complete&&im.naturalWidth)){
   ctx.translate(dx,dy);ctx.scale(turn,1);
   // Keep paws at the ground contact point while the body expands gently.
   ctx.translate(0,18);ctx.scale(1+breath*0.35,1-breath);ctx.translate(0,-18);
   ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=4;ctx.shadowOffsetY=2;
   if(useRef){
    const ratio=Math.min(w/ref.naturalWidth,h/ref.naturalHeight),rw=ref.naturalWidth*ratio,rh=ref.naturalHeight*ratio;
    if(u.summonType==='toad'&&(move||attack)){
      const step=move?t*Math.max(1,activeFx?.path?.length||1):t,phase=step%1;
      const crouch=poses592.crouch?.complete&&poses592.crouch.naturalWidth?poses592.crouch:ref;
      const leap=poses592.leap?.complete&&poses592.leap.naturalWidth?poses592.leap:ref;
      let from,to,mix;
      if(phase<0.25){from=ref;to=crouch;mix=phase/0.25;}
      else if(phase<0.55){from=crouch;to=leap;mix=(phase-0.25)/0.30;}
      else{from=leap;to=ref;mix=(phase-0.55)/0.45;}
      mix=mix*mix*(3-2*mix);
      drawPose592(ctx,from,to,mix,-rw/2,18-rh,rw,rh);
    }else ctx.drawImage(ref,-rw/2,18-rh,rw,rh);
   }else if(!window.__arena35DrawBeast?.(ctx,u,-w/2,-h*.77,w,h))ctx.drawImage(im,-w/2,-h*.77,w,h);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  }else{
   ctx.fillStyle=spec.color;ctx.beginPath();ctx.arc(base.x,base.y-14,14,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
  const life=Math.max(0,u.hp/u.maxHp),barw=54;
  ctx.save();ctx.fillStyle='rgba(5,16,15,.9)';ctx.fillRect(base.x-barw/2-1,base.y-(useRef?110:77),barw+2,9);
  ctx.fillStyle=u.team==='ally'?'#92e6cc':'#f2a4a1';ctx.fillRect(base.x-barw/2,base.y-(useRef?109:76),barw*life,6);
  ctx.font='bold 10px system-ui';ctx.textAlign='center';const label=spec.name;
  const bw=Math.max(54,Math.ceil(ctx.measureText(label).width)+10);
  ctx.fillStyle='rgba(6,20,19,.86)';ctx.beginPath();ctx.roundRect(base.x-bw/2,base.y+23,bw,17,4);ctx.fill();
  ctx.fillStyle='#f4eee3';ctx.fillText(label,base.x,base.y+35);
  ctx.restore();
 }
};
// Существа двигаются и слегка дышат даже при ясной погоде.
let lastPetRedraw19=0;
function petAnimation19(now){
 if(now-lastPetRedraw19>100){lastPetRedraw19=now;
   if(game&&!game.over&&document.visibilityState!=='hidden'&&document.getElementById('arenaScreen').classList.contains('active')&&game.units.some(u=>u.isSummon&&u.hp>0)&&!game.animating){draw()}
 }
 requestAnimationFrame(petAnimation19);
}
requestAnimationFrame(petAnimation19);
// Объёмный каталог новых техник требует прокрутки, особенно на телефоне.
const smallStyle19=document.createElement('style');
smallStyle19.textContent=`
#jutsuPanel{max-height:310px;overflow-y:auto;overscroll-behavior:contain;padding:4px;scrollbar-width:thin}
#jutsuLearning{max-height:620px;overflow-y:auto;overscroll-behavior:contain;padding-right:4px;scrollbar-width:thin}
@media(max-width:650px){#jutsuPanel{max-height:255px}#jutsuLearning{max-height:470px}}
`;
document.head.appendChild(smallStyle19);
window.__arena19={BEAST_IMAGES,techs:TECHS.filter(t=>['fire4','water4','wind4','light4','earth4'].includes(t.id)),beastSpritesReady:()=>Object.values(BEAST_IMAGES).every(img=>img.complete&&img.naturalWidth>0)};

// VERSION 3.0 — CHAINED HAND SEALS
'use strict';
const LABELS=['Крыса','Бык','Тигр','Кролик','Дракон','Змея','Лошадь','Овца','Обезьяна','Птица','Собака','Кабан'];
const PATTERNS={0:[2,5,6,2,4,8],1:[3,10,1,5,9,4],2:[7,9,4,2,10,3],3:[5,11,2,8,6,4],4:[1,2,5,10,8,11]};
const STATE={started:0,completed:0,interrupted:0,seqs:[],last:null};
const bar=document.createElement('div');bar.id='arena30-status';bar.dataset.active='false';bar.innerHTML='<span id="arena30-name">Печати</span><span id="arena30-count">0/0</span><div id="arena30-bar"><div id="arena30-progress"></div></div><span id="arena30-label"></span>';
const panel=document.querySelector('#arenaScreen .boardpanel');
const tools=document.getElementById('arena29-controls');if(panel)panel.insertBefore(bar,tools?.nextSibling||panel.firstChild);
const $id=id=>document.getElementById(id);
const bound=(x,a,b)=>Math.max(a,Math.min(b,x));
function signCount(t){if(t.kind==='arsenal')return 1;if(t.kind==='summon'||t.kind==='clone')return t.ch>=30?5:3;if(t.kind==='self')return 2;return bound(Math.round(t.ch/11)+1,1,5)}
function sealsFor(u,id,t){let seed=[...id].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7),pool=PATTERNS[u.element]||PATTERNS[0],count=signCount(t);return Array.from({length:count},(_,i)=>pool[(seed+i*2)%pool.length]);}
function severity(u){const injuries=u.injuries;return (u.armInjury||0)+(injuries?.arm?.severity||0)+(injuries?.arm?.level||0)+(typeof injuries?.arm==='number'?injuries.arm:0);}
function sealDuration(u,n){let skill=Number(u.skills?.control||25),fat=Number(u.fatigue||0),arm=severity(u),step=320*(1-bound(skill,0,100)*.004)+fat*1.2+arm*48;return Math.round(bound(n*step,180,2500));}
function canAim(u,t,cell){if(t?.school==='genjutsu')return window.__genjutsu?.canCast(u,t,cell)??false;if(window.__genjutsu&&u&&!window.__genjutsu.actionAllowed(u,'tech:'+t?.id))return false;if(!game||game.over||game.animating||!u||u.hp<=0||u.stun||u.ap<t.ap||u.chakra<t.ch||!(u.learned||[]).includes(t.id)||(t.element!==null&&t.element!==u.element))return false;if(u.team==='ally'&&game.phase!=='ally')return false;
 const loc=(t.kind==='self'||t.kind==='arsenal')?{c:u.c,r:u.r}:cell;
 if(!loc||!inBoard(loc.c,loc.r)||dist(u,loc)>t.range)return false;
 const target=unitAt(loc.c,loc.r);
 if(['clone','summon'].includes(t.kind)&&(dist(u,loc)!==1||target||obstacle(loc.c,loc.r)))return false;
 if(t.kind==='wall'&&(target||obstacle(loc.c,loc.r)))return false;
 if(t.kind==='heal'&&(!target||target.team!==u.team||target.hp<=0||(target.hp>=target.maxHp&&!target.wound&&!target.burn&&!target.poison)))return false;
 if(t.kind==='dash'){
  if(dist(u,loc)<1||target||obstacle(loc.c,loc.r))return false;
  const path=pathTo(u,loc.c,loc.r);
  if(!path||path.length<1||path.length>t.range)return false;
 }
 if(['hit','chain','weaponAttack'].includes(t.kind)&&(!target||target.team===u.team||!window.canAim(u,target)))return false;
 if(['blast','line'].includes(t.kind)&&(obstacle(loc.c,loc.r)||!lineClear(u,loc)||smokeBlocksAim(u,loc)))return false;
 return true;
}
function concentrationFails(u){if(u.hp<=0||u.stun||u.prone)return true;const arm=severity(u),fat=u.fatigue||0;if(arm<1&&fat<70)return false;const chance=bound(Math.round((fat-60)*.25+arm*10-(u.skills?.control||0)*.12),0,32);return rand(100)<chance}
function start(u, id, t, cell, finish){
 if(!game||game.animating||!u||u.hp<=0)return false;
 const source=game, hp=u.hp, phase=game.phase;
 const signs=sealsFor(u,id,t),duration=document.querySelector('#arena29-motion')?.checked?Math.max(100,signs.length*80):sealDuration(u,signs.length);
 const fx={action:'seals',actor:u.id,from:{c:u.c,r:u.r},target:{c:cell?.c??u.c,r:cell?.r??u.r},sealDuration:duration,signs,spellName:t.name||'Дзюцу',element:u.element};
 STATE.started++;STATE.last={id,n:signs.length,duration,actor:u.id};STATE.seqs.push(STATE.last);
 cueFx(fx);renderGame();log(`${u.name} складывает печати для «${fx.spellName}» (${signs.length}).`);
 // Effects and costs are deliberately deferred until after the seals animation completes.
 waitFx().then(()=>{
  if(game!==source||!game||game.over||u.hp<hp||u.hp<=0||u.stun||u.prone||game.phase!==phase||concentrationFails(u)){
    STATE.interrupted++;if(game===source&&!game.over&&u.hp>0){u.ap=Math.max(0,u.ap-Math.max(1,Math.ceil(t.ap/2)));u.chakra=Math.max(0,u.chakra-Math.ceil(t.ch/3));log(`${u.name}: подготовка сорвана, часть чакры потеряна.`,'hurt');renderGame();}
    return;
  }
  // Failure is rolled only after a legal technique completes its hand-seal animation.
  // Keep Genjutsu's existing opposed resistance roll; it is not Ninjutsu.
  const failChance=shinobi519NinFailChance(u,t);
  if(failChance&&rand(100)<failChance){
   const apCost=t.ap,chakraCost=Math.max(1,Math.ceil(t.ch/2));
   u.ap=Math.max(0,u.ap-apCost);u.chakra=Math.max(0,u.chakra-chakraCost);
   u.fatigue=Math.min(100,(u.fatigue||0)+5);
   if(u.isClone)u.__actedThisRound=true;
   shinobi519Stats.ninFails++;STATE.interrupted++;
   window.__arena520?.castFail(u,t,cell);
   log(`${u.name} сорвал печати «${t.name}»! ${failChance}% риск · −${apCost} ОД · −${chakraCost} чакры.`, 'hurt');
   window.__lastSeal544={id,actor:u.id,result:'cast_failed',ap:u.ap,chakra:u.chakra,animating:false,phase:game.phase,cell};
   renderGame();return;
  }
  try {
   const result=finish();window.__lastSeal544={id,actor:u.id,result,ap:u.ap,chakra:u.chakra,animating:game.animating,phase:game.phase,cell};if(result!==false)STATE.completed++;else log(`Не удалось выполнить «${t.name}» после печатей: проверь цель.`, 'hurt');
  } catch(err) {
   STATE.interrupted++;
   console.error('Ошибка завершения дзюцу:', err);
   if(game===source&&!game.over){log('Техника не выполнена из-за ошибки. Повтори действие.','hurt');renderGame();}
  }
 }).catch(err=>{
  STATE.interrupted++;
  console.error('Ошибка анимации печатей:',err);
  if(game===source&&!game.over){game.animating=false;log('Анимация печатей прервана.','hurt');renderGame();}
 });
 return true;
}
const oldSpell=castSpell;
castSpell=function(caster,id,cell){if(window.__shinobiNetwork?.shouldRoute())return window.__shinobiNetwork.cast(caster,id,cell);const t=techById[id];if(!t||!canAim(caster,t,cell))return false;const loc=t.kind==='self'||t.kind==='arsenal'?{c:caster.c,r:caster.r}:cell;return start(caster,id,t,loc,()=>oldSpell(caster,id,loc))};
const oldExecute=window.execute;
window.execute=function(u,action,cell){if(action!=='jutsu'&&action!=='illusion')return oldExecute(u,action,cell);
 if(!u||!game||game.animating||!cell)return false;
 const cost=action==='jutsu'?Math.max(4,9-Math.floor((u.skills.control||0)/35)):Math.max(4,8-Math.floor((u.skills.control||0)/35));
 const target=unitAt(cell.c,cell.r),a=ACTIONS.find(v=>v.id===action);
 if(!target||target.team===u.team||dist(u,cell)>4||dist(u,cell)<1||!window.canAim(u,target)||u.ap<a.ap||u.chakra<cost||u.hp<=0)return false;
 const fake={id:action,kind:'hit',name:action==='illusion'?'Гендзюцу':ELEMENTS[u.element].spell,ap:a.ap,ch:cost};
 return start(u,action,fake,cell,()=>oldExecute(u,action,cell));
};
// Procedural glove/hands keyframes drawn over the character sprite: 12 visually distinct positions.
function drawGlove(x,y,angle,side,pose){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(side,1);
 ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#cbd3ca';ctx.lineWidth=1.1;
 ctx.fillStyle='#26343a';ctx.beginPath();ctx.moveTo(-8,10);ctx.lineTo(-7,-3);ctx.lineTo(5,-6);ctx.lineTo(9,9);ctx.closePath();ctx.fill();ctx.stroke();
 const fingers=[[-5,-7],[-1,-9],[3,-7],[6,-5]];
 fingers.forEach(([a,b],i)=>{const mode=pose%6,dy= mode===0?(-6+i*1.3):mode===1?(i===1?-15:-4):mode===2?(i===0||i===3?-11:-4):mode===3?(i===1||i===2?-14:-5):mode===4?(-9+i):-3;
  ctx.strokeStyle='#c0b9a3';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(a,b+4);ctx.lineTo(a+(i-1.5)*1.3,dy);ctx.stroke();ctx.strokeStyle='#e6e2d3';ctx.lineWidth=.8;ctx.stroke();});
 ctx.restore();
}
function drawSealAnimation(){
 const fx=activeFx, bar=$id('arena30-status');
 if(!game||!fx||fx.action!=='seals'||!fx.signs?.length){bar.dataset.active='false';return;}
 const caster=game.units.find(u=>u.id===fx.actor);if(!caster||caster.hp<=0){bar.dataset.active='false';return;}
 const n=fx.signs.length,p=bound(fx.progress||0,0,.999999),i=Math.min(n-1,Math.floor(p*n)),seal=fx.signs[i];
 const pos=spritePos(caster,center(caster.c,caster.r));
 const wave=Math.sin(Math.PI*((p*n)%1));
 // No additional cartoon limbs: hands are part of the illustrated sprite itself.
 ctx.save();
 const colors=['#f7aa72','#8bc9f8','#d0e9f7','#cfbbff','#e3d5a2'];
 const color=colors[caster.element%5];
 ctx.strokeStyle=color;ctx.lineWidth=1.8;ctx.globalAlpha=.18+.2*wave;
 ctx.beginPath();ctx.ellipse(pos.x,pos.y-50,29+wave*8,32+wave*7,0,0,Math.PI*2);ctx.stroke();
 ctx.globalAlpha=1;ctx.textAlign='center';ctx.font='bold 12px system-ui';
 const caption=`${LABELS[seal]}  ${i+1}/${n}`;
 const wid=Math.max(100,ctx.measureText(caption).width+20),tx=pos.x,ty=pos.y-113;
 ctx.fillStyle='rgba(10,23,27,.85)';ctx.strokeStyle='rgba(177,222,230,.52)';ctx.lineWidth=1;
 ctx.beginPath();ctx.roundRect(tx-wid/2,ty-16,wid,23,7);ctx.fill();ctx.stroke();
 ctx.fillStyle='#fbf4de';ctx.fillText(caption,tx,ty);ctx.restore();
 bar.dataset.active='true';$id('arena30-name').textContent=fx.spellName;
 $id('arena30-count').textContent=`Печать ${i+1}/${n}`;
 $id('arena30-label').textContent=LABELS[seal];
 $id('arena30-progress').style.width=`${Math.round(p*100)}%`;
}
const previousDraw=window.draw;window.draw=function(){previousDraw();drawSealAnimation()};
window.arena30={signCount,sealsFor,sealDuration,canAim,cast:(...args)=>castSpell(...args),get stats(){return {...STATE}},LABELS};
renderSetup();
window.__arena58Legacy={BEASTS,TECHS,techById,newBeast};
})();
