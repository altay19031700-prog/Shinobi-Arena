/* MATCH 5.2: player selects army size for both sides independently */
(()=>{
const a=document.getElementById('teamSize'),b=document.getElementById('enemySize'),out=document.getElementById('match52-format');
const update=()=>{
 const own=Number(a.value),foe=Number(b.value);
 out.textContent=`Бой: ${own} на ${foe}`;
 document.querySelectorAll('[data-match52]').forEach(x=>{
  const active=x.dataset.match52===`${own},${foe}`;
  x.classList.toggle('active',active);
  x.setAttribute('aria-pressed',String(active));
 });
};
window.match52Refresh=update;
b.addEventListener('change',update);
a.addEventListener('change',update);
document.querySelectorAll('[data-match52]').forEach(btn=>btn.addEventListener('click',()=>{
 const [own,foe]=btn.dataset.match52.split(',');a.value=own;b.value=foe;
 a.dispatchEvent(new Event('change',{bubbles:true}));update();
}));
// Previous saved teams can modify the selectors programmatically.
const loadBtn=document.getElementById('arena24-load');
if(loadBtn)loadBtn.addEventListener('click',()=>queueMicrotask(update));
update();
window.__match52={version:'5.2',sizes:()=>({ally:Number(a.value),enemy:Number(b.value)}),refresh:update};
})();
