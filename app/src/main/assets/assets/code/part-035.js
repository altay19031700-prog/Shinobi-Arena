
/* Offline environmental sound and weather. No music, network requests or game RNG. */
(()=>{'use strict';
const KEY='shinobi-audio-v1',clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const defaults={muted:false,effects:.65,ambience:.25};let prefs={...defaults};
try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p){prefs={muted:!!p.muted,effects:clamp(Number(p.effects)||0),ambience:clamp(Number(p.ambience)||0)}}}catch{}
let audio=null,master,sfx,ambient,limiter,noise,ambientNodes=[],ambientWeather='',lastFx=null,lastGame=null,voices=0;
const transientNodes=new Set();
const pending=new Map(),stats={played:0,dropped:0,steps:0,contacts:0,weatherFrames:0};
const active=()=>!!game&&!game.over&&document.querySelector('#arenaScreen.active')&&!document.hidden;
const audible=u=>!u||u.team==='ally'||window.visibleToSide?.('ally',u);
function store(){try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}}
function apply(){if(!audio)return;const t=audio.currentTime;master.gain.setTargetAtTime(prefs.muted?0:.72,t,.025);sfx.gain.setTargetAtTime(prefs.effects,t,.025);ambient.gain.setTargetAtTime(prefs.ambience,t,.12)}
async function unlock(){
 try{
  if(!audio){const A=window.AudioContext||window.webkitAudioContext;if(!A)return false;audio=new A();master=audio.createGain();sfx=audio.createGain();ambient=audio.createGain();limiter=audio.createDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=10;limiter.ratio.value=5;limiter.attack.value=.003;limiter.release.value=.18;sfx.connect(master);ambient.connect(master);master.connect(limiter);limiter.connect(audio.destination);
   noise=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate);const d=noise.getChannelData(0);let seed=73519;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d[i]=(seed/4294967296*2-1)*.65;}apply();preloadSamples();
  }
  if(audio.state==='suspended'&&!document.hidden)await audio.resume();syncAmbient();return audio.state==='running';
 }catch{return false}
}
function stopAmbient(){for(const n of ambientNodes){try{n.stop()}catch{}try{n.disconnect()}catch{}}ambientNodes=[];ambientWeather=''}
function stopVoices(){for(const n of transientNodes){try{n.stop()}catch{}}}
function bed(type,cutoff,gain,rate=1){const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),level=audio.createGain();source.buffer=noise;source.loop=true;source.playbackRate.value=rate;filter.type=type;filter.frequency.value=cutoff;level.gain.value=gain;source.connect(filter);filter.connect(level);level.connect(ambient);source.onended=()=>{filter.disconnect();level.disconnect()};source.start();ambientNodes.push(source)}
function syncAmbient(){
 if(!audio)return;
 if(!active()||prefs.muted||prefs.ambience===0){if(ambientNodes.length)stopAmbient();return}
 const w=game.weather||'clear';if(w===ambientWeather)return;stopAmbient();ambientWeather=w;
 // Low broad wind plus a distant stream match the ruined sanctuary map.
 bed('lowpass',w==='wind'?850:320,w==='wind'?.16:.055,.62);bed('bandpass',1700,.035,.9);
 if(w==='rain'){bed('highpass',1500,.16,1);bed('lowpass',650,.1,.78)}
 if(w==='fog')bed('lowpass',190,.035,.45);
 if(w==='heat')bed('bandpass',3400,.016,.68);
}
// Short filtered noise layers and non-melodic transients. All source nodes disconnect.
function burst({duration=.15,gain=.2,frequency=1000,end=frequency,filter='lowpass',q=.7,rate=1,delay=0,tone=0,to=tone,pan=0}){
 if(!audio||audio.state!=='running'||prefs.muted||prefs.effects===0||!active())return false;
 if(voices>=16){stats.dropped++;return false}
 voices++;stats.played++;const t=audio.currentTime+delay,source=tone?audio.createOscillator():audio.createBufferSource(),f=audio.createBiquadFilter(),g=audio.createGain(),p=audio.createStereoPanner();
 if(tone){source.type='sine';source.frequency.setValueAtTime(tone,t);source.frequency.exponentialRampToValueAtTime(Math.max(25,to),t+duration)}else{source.buffer=noise;source.playbackRate.value=rate}
 f.type=filter;f.Q.value=q;f.frequency.setValueAtTime(frequency,t);f.frequency.exponentialRampToValueAtTime(Math.max(40,end),t+duration);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gain,t+Math.min(.012,duration*.12));g.gain.exponentialRampToValueAtTime(.0001,t+duration);p.pan.value=clamp(pan,-.65,.65);source.connect(f);f.connect(g);g.connect(p);p.connect(sfx);
 source.onended=()=>{transientNodes.delete(source);voices=Math.max(0,voices-1);source.disconnect();f.disconnect();g.disconnect();p.disconnect()};transientNodes.add(source);source.start(t,tone?undefined:((stats.played%19)/19));source.stop(t+duration+.02);return true;
}
function panAt(cell){return cell?((window.center?.(cell.c,cell.r)?.x||600)/1200-.5)*1.1:0}
function playSynth(kind,cell,variant=0){const pan=panAt(cell),b=o=>burst({pan,...o});
 switch(kind){
  case 'step':stats.steps++;b({duration:.09,gain:.15,frequency:620,end:200,rate:.85+variant*.03});b({duration:.045,gain:.08,frequency:3600,filter:'highpass',delay:.012});break;
  case 'wetstep':stats.steps++;b({duration:.13,gain:.17,frequency:2100,end:480,filter:'bandpass',q:.6});b({duration:.07,gain:.09,tone:115,to:55,frequency:400});break;
  case 'swing':b({duration:.18,gain:.15,frequency:650,end:4300,filter:'bandpass',q:.45});break;
  case 'hit':stats.contacts++;b({duration:.13,gain:.22,frequency:900,end:140});b({duration:.09,gain:.11,tone:115,to:45,frequency:400});break;
  case 'block':b({duration:.09,gain:.13,frequency:5500,end:2400,filter:'highpass'});b({duration:.16,gain:.07,tone:1700,to:850,frequency:3500});break;
  case 'seal':b({duration:.065,gain:.08,frequency:1200,end:450,filter:'bandpass'});break;
  case 'smoke':b({duration:.65,gain:.19,frequency:2400,end:180});b({duration:.12,gain:.09,tone:110,to:40,frequency:600});break;
  case 'explosion':b({duration:.8,gain:.31,frequency:2000,end:100});b({duration:.3,gain:.22,tone:100,to:28,frequency:400});break;
  case 'fire':b({duration:.48,gain:.22,frequency:650,end:2400,filter:'bandpass',q:.5});b({duration:.15,gain:.07,frequency:4000,filter:'highpass',delay:.1});break;
  case 'water':b({duration:.4,gain:.22,frequency:2400,end:350,filter:'bandpass',q:1});b({duration:.18,gain:.055,tone:240,to:70,frequency:900,delay:.03});break;
  case 'wind':b({duration:.43,gain:.18,frequency:450,end:3400,filter:'bandpass',q:.45});break;
  case 'light':for(let i=0;i<3;i++)b({duration:.045,gain:.13,frequency:5000,end:1500,filter:'highpass',delay:i*.045});b({duration:.22,gain:.12,frequency:800,end:100,delay:.12});break;
  case 'earth':b({duration:.32,gain:.25,frequency:650,end:110});b({duration:.12,gain:.12,frequency:2800,end:550,filter:'bandpass',delay:.07});break;
  case 'summon':b({duration:.65,gain:.21,frequency:1200,end:220});b({duration:.3,gain:.11,tone:90,to:35,frequency:500});break;
  case 'genjutsu':b({duration:.48,gain:.14,frequency:1800,end:420,filter:'bandpass',q:1.3});b({duration:.22,gain:.05,frequency:4200,filter:'highpass',delay:.12});break;
  case 'beast':b({duration:.25,gain:.19,frequency:900,end:180,filter:'bandpass',rate:.6});break;
 }
}
// Compact, original pre-rendered Foley samples. Decoded once after user interaction.
const sampleKinds=['step','wetstep','swing','hit','block','seal','smoke','explosion','fire','water','wind','light','earth','summon','genjutsu','beast','kunai','poison','flash'];
const samples=new Map(),sampleLoads=new Map(),lastSample=new Map();
const sampleCooldown={step:45,wetstep:65,swing:85,hit:65,block:90,seal:70,explosion:125,light:95};
let soundLoading=false;
function loadSample(kind){
 if(!audio||samples.has(kind)||sampleLoads.has(kind)||!sampleKinds.includes(kind))return;
 const req=fetch('assets/audio/'+kind+'.wav').then(r=>{if(!r.ok)throw Error('audio '+kind);return r.arrayBuffer()}).then(raw=>audio.decodeAudioData(raw)).then(buffer=>{samples.set(kind,buffer);return buffer}).catch(()=>null).finally(()=>sampleLoads.delete(kind));
 sampleLoads.set(kind,req);
}
function preloadSamples(){if(!audio||soundLoading)return;soundLoading=true;for(const key of sampleKinds)loadSample(key)}
function play(kind,cell,variant=0){
 if(!audio||audio.state!=='running'||prefs.muted||prefs.effects===0||!active())return;
 const b=samples.get(kind);
 if(!b){loadSample(kind);playSynth(kind,cell,variant);return}
 const now=performance.now(),cool=sampleCooldown[kind]||85;
 if(now-(lastSample.get(kind)||-1e9)<cool){stats.dropped++;return}
 if(voices>=12){stats.dropped++;return}
 lastSample.set(kind,now);
 const source=audio.createBufferSource(),gain=audio.createGain(),pan=audio.createStereoPanner();
 source.buffer=b;source.playbackRate.value=clamp(1+(variant%5-2)*.025,.9,1.1);
 gain.gain.value=(kind==='explosion'?.72:kind==='step'?.52:.66);
 pan.pan.value=clamp(panAt(cell),-.65,.65);
 source.connect(gain);gain.connect(pan);pan.connect(sfx);
 voices++;stats.played++;transientNodes.add(source);
 source.onended=()=>{transientNodes.delete(source);voices=Math.max(0,voices-1);source.disconnect();gain.disconnect();pan.disconnect()};
 source.start();
}
function record(a,b,lost,type){if(!a||!b)return;pending.set(a.id+':'+b.id,{actor:a.id,target:b.id,c:b.c,r:b.r,lost,reaction:Date.now()-(b.reaction?.at||0)<150?b.reaction.kind:null,type,at:performance.now(),heard:audible(a)||audible(b)});if(pending.size>40)pending.delete(pending.keys().next().value)}
function outcome(actor,target,cell){const now=performance.now();let found=null;for(const [key,v]of pending){if(now-v.at>3000){pending.delete(key);continue}if((actor?v.actor===actor:true)&&(target?v.target===target:cell&&v.c===cell.c&&v.r===cell.r))found=v}return found}
function fxFrame(fx){
 if(!fx||fx.world!==game||document.hidden)return;
 const actor=game.units.find(u=>u.id===fx.actor);if(!audible(actor))return;
 if(!lastFx||lastFx.serial!==fx.serial)lastFx={serial:fx.serial,events:new Set()};
 const p=fx.progress||0,once=(key,at,fn)=>{if(p>=at&&!lastFx.events.has(key)){lastFx.events.add(key);fn()}};
 if(fx.action==='move'){const count=Math.max(1,fx.path?.length||1)*2;for(let i=0;i<count;i++)once('step'+i,(i+.25)/count,()=>play(game.weather==='rain'?'wetstep':'step',fx.path?.[Math.floor(i/2)]||actor,i%3));}
 else if(fx.action==='seals'){const n=Math.max(1,fx.signs?.length||3);for(let i=0;i<n;i++)once('seal'+i,(i+.2)/n,()=>play('seal',fx.from));}
 else if(['sword','melee','quick','heavy','trip','stunHit'].includes(fx.action)){
  once('swing',.19,()=>play(actor?.isSummon?'beast':'swing',fx.from));
  once('contact',.52,()=>{const result=outcome(fx.actor,fx.targetId,fx.target);if(result?.lost>0)play('hit',fx.target);else if(result?.reaction==='block')play('block',fx.target)});
 }
}
function effectStart(e){const actor=game?.units.find(u=>u.c===e.from.c&&u.r===e.from.r),target=game?.units.find(u=>u.c===e.to.c&&u.r===e.to.r);if(actor&&!audible(actor)&&(!target||!audible(target)))return;e.__sound={release:false,impact:false,hiddenActor:actor&&!audible(actor),outcome:outcome(null,null,e.to)}}
function effectFrame(e,p){
 const s=e.__sound;if(!s||!active())return;const type=e.type;
 if(!s.release){s.release=true;const name={illusion:'smoke',clone:'smoke',replacement:'smoke',wall:'earth',shield:'summon',chakra:'summon',weapon:'swing',projectile:'kunai',poison:'poison',flash:'flash',explosion:'swing',smoke:'smoke',arsenal:'swing'}[type]||type;if(!s.hiddenActor)play(name,e.from);}
 const arrival=['explosion','flash','smoke'].includes(type)||e.kind==='blast'?.12:e.kind==='line'?.63:e.kind==='chain'?.60:.68;
 if(p>=arrival&&!s.impact){s.impact=true;if(['fire','water','wind','light','earth','explosion','smoke','flash','poison','projectile'].includes(type))play(type==='projectile'?'kunai':type==='fire'&&e.kind==='blast'?'explosion':type,e.to);else if(s.outcome?.lost>0)play('hit',e.to);else if(s.outcome?.reaction==='block')play('block',e.to)}
}
const oldDamage=window.damage;window.damage=function(a,b,...rest){const hp=b?.hp,result=oldDamage.call(this,a,b,...rest);if(b&&Number.isFinite(hp))record(a,b,Math.max(0,hp-b.hp),rest[1]);return result};

const weatherRules={
 clear:'Ясно: погодных штрафов нет.',
 rain:'Дождь: вода +15% урона; молния +15%; огонь −20%, горение до 1 раунда. Дальняя меткость: оружие −10 п.п., дзюцу −12 п.п. Сам дождь не даёт гарантированного оглушения. Обе стороны подчиняются одним правилам.',
 fog:'Туман: дальняя меткость −10 п.п., с 3 гексов −22 п.п. Ближний бой без погодного штрафа. Туман не равен дымовой завесе.',
 wind:'Ветер: метательное оружие −14 п.п. меткости, дальние дзюцу −6 п.п. Ближний бой без погодного штрафа.',
 heat:'Жара: усталость от действий растёт на 25% быстрее. Между ходами восстанавливается 8 вместо 12 усталости; при усталости от 55 появляется дополнительный штраф к ОД.'
};
function multiplier(element){return game?.weather==='rain'?(element===0?.8:element===1||element===3?1.15:1):1}
function weatherDraw(){
 if(!game)return;const w=game.weather||'clear';if(w==='clear')return;const t=performance.now()/1000,W=canvas.width,H=canvas.height;stats.weatherFrames++;ctx.save();
 if(w==='rain'){
  ctx.fillStyle='rgba(31,61,89,.07)';ctx.fillRect(0,0,W,H);
  for(let layer=0;layer<2;layer++){ctx.strokeStyle=layer?'rgba(192,221,239,.24)':'rgba(132,183,215,.13)';ctx.lineWidth=layer?1.2:.7;ctx.beginPath();for(let i=0;i<65;i++){const x=((i*137.3+t*(layer?74:42))%(W+90))-40,y=(i*89.7+t*(layer?520:360))%(H+50)-25;ctx.moveTo(x,y);ctx.lineTo(x-5-layer*3,y+11+layer*8)}ctx.stroke();}
  for(let i=0;i<24;i++){const phase=(t*1.9+i*.381)%1,x=(i*173.3+37)%W,y=100+(i*83.9)%(H-120);ctx.strokeStyle=`rgba(194,223,229,${.19*(1-phase)})`;ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(x,y,2+phase*8,1+phase*2.7,0,0,Math.PI*2);ctx.stroke();}
 }else if(w==='fog'){
  for(let i=0;i<8;i++){const x=(i*191+t*(10+i%3*4))%(W+360)-180,y=H*.25+(i*107)%(H*.65),r=160+(i%3)*35,g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,'rgba(198,215,216,.11)');g.addColorStop(1,'rgba(198,215,216,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
 }else if(w==='wind'){
  for(let i=0;i<32;i++){const x=(i*137+t*(90+i%4*16))%(W+60)-30,y=50+(i*79+t*15+Math.sin(t*2+i)*13)%(H-80);ctx.save();ctx.translate(x,y);ctx.rotate(t*2+i);ctx.fillStyle=i%2?'rgba(167,146,92,.5)':'rgba(131,157,106,.45)';ctx.beginPath();ctx.ellipse(0,0,3.4,1.2,0,0,Math.PI*2);ctx.fill();ctx.restore()}
 }else if(w==='heat'){ctx.fillStyle='rgba(224,151,48,.045)';ctx.fillRect(0,0,W,H);for(let i=0;i<12;i++){const x=i*113+Math.sin(t*.8+i)*15,y=H-(t*14+i*47)%H;ctx.fillStyle='rgba(240,209,148,.14)';ctx.beginPath();ctx.arc(x,y,1.1,0,Math.PI*2);ctx.fill()}}
 ctx.restore();
}
const oldDraw=window.draw;window.draw=function(...args){const r=oldDraw.apply(this,args);weatherDraw();if(lastGame!==game){lastGame=game;lastFx=null;pending.clear();stopAmbient()}syncAmbient();if(activeFx)fxFrame(activeFx);return r};

const dialog=document.createElement('dialog');dialog.id='shinobi-audio-dialog';dialog.innerHTML='<form method="dialog"><div class="sound-head"><strong>Звук и погода</strong><button aria-label="Закрыть">Закрыть</button></div><label><input id="sound-mute" type="checkbox"> Выключить весь звук</label><label for="sound-effects">Эффекты боя <output id="sound-effects-value"></output></label><input id="sound-effects" type="range" min="0" max="100" step="1"><label for="sound-ambience">Окружение <output id="sound-ambience-value"></output></label><input id="sound-ambience" type="range" min="0" max="100" step="1"><p id="sound-weather-rules"></p><small>Музыки нет. На телефоне звук включается после нажатия. В свёрнутой вкладке звук останавливается.</small></form>';document.body.append(dialog);
const style=document.createElement('style');style.textContent='#shinobi-audio-dialog{width:min(440px,calc(100vw - 24px));max-height:85dvh;overflow:auto;border:1px solid #89a4a3;border-radius:12px;background:#14262d;color:#e4ede8;padding:18px;z-index:20000}#shinobi-audio-dialog::backdrop{background:#0009}#shinobi-audio-dialog .sound-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}#shinobi-audio-dialog label{display:block;margin:14px 0 7px}#shinobi-audio-dialog input[type=range]{width:100%;min-height:34px;accent-color:#8bc7c2}#shinobi-audio-dialog input[type=checkbox]{width:20px;height:20px;vertical-align:middle}#shinobi-audio-dialog output{float:right}#sound-weather-rules{font-size:13px;line-height:1.55;padding:10px;background:#0e1d24;border-radius:7px}#shinobi-audio-dialog small{font-size:12px;color:#adbfbd}.shinobi-sound-open{min-height:36px!important;font-size:12px!important}';document.head.append(style);
style.textContent+='@media(max-width:1099px){#arenaScreen.active .boardpanel>.subhead #desktop-panel-toggle{display:none!important}#arenaScreen.active .boardpanel>.subhead #mobile-full-battle{width:60px!important;min-width:60px!important;flex:0 0 60px!important}#arenaScreen.active .boardpanel>.subhead .shinobi-sound-open{min-width:50px!important;min-height:40px!important}}';
function updateControls(){dialog.querySelector('#sound-mute').checked=prefs.muted;for(const key of ['effects','ambience']){dialog.querySelector('#sound-'+key).value=Math.round(prefs[key]*100);dialog.querySelector('#sound-'+key+'-value').value=Math.round(prefs[key]*100)+'%'}dialog.querySelector('#sound-weather-rules').textContent=weatherRules[game?.weather||document.getElementById('weatherSelect')?.value||'clear']}
function open(){updateControls();if(!dialog.open)dialog.showModal();unlock()}
for(const host of [document.querySelector('#arenaScreen .boardpanel>.subhead .row'),document.querySelector('.weatherbox')])if(host){const b=document.createElement('button');b.type='button';b.className='shinobi-sound-open';b.textContent='Звук';b.title='Звук и правила погоды';b.addEventListener('click',open);host.append(b)}
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
dialog.querySelector('#sound-mute').addEventListener('change',e=>{prefs.muted=e.target.checked;store();apply();syncAmbient();unlock()});
for(const key of ['effects','ambience'])dialog.querySelector('#sound-'+key).addEventListener('input',e=>{prefs[key]=Number(e.target.value)/100;store();apply();syncAmbient();updateControls()});
document.addEventListener('pointerdown',()=>{if(!audio||audio.state==='suspended')unlock()},{passive:true});
document.addEventListener('keydown',()=>{if(!audio||audio.state==='suspended')unlock()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopAmbient();stopVoices();if(audio?.state==='running')audio.suspend().catch(()=>{})}else if(audio){audio.resume().then(syncAmbient).catch(()=>{})}});
const arena=document.getElementById('arenaScreen');if(arena)new MutationObserver(()=>{syncAmbient();if(!active())stopVoices()}).observe(arena,{attributes:true,attributeFilter:['class']});
window.__shinobiEnvironment={weatherRules,multiplier,draw:weatherDraw};
window.__shinobiAudio={unlock,play,effectStart,effectFrame,recordOutcome:record,recordSpell:(caster,before)=>{for(const old of before){const target=game?.units.find(u=>u.id===old.id);if(target&&old.hp>target.hp)record(caster,target,old.hp-target.hp,'jutsu')}},get stats(){return {...stats,samplesLoaded:samples.size,voices,ambientSources:ambientNodes.length,state:audio?.state||'locked',preferences:{...prefs}}}};
})();

