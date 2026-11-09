
(function(){
let zoom=1;
const canvas=document.getElementById('board');
function updateZoom(){
 if(!canvas) return;
 if(window.matchMedia('(max-width: 740px)').matches){canvas.style.setProperty('width',(760*zoom)+'px','important');canvas.style.setProperty('min-width',(760*zoom)+'px','important');}else{canvas.style.removeProperty('min-width');canvas.style.width=(100*zoom)+'%';}
 canvas.style.height='auto';
 const label=document.getElementById('zoomValue');if(label)label.textContent=Math.round(zoom*100)+'%'; const wrap=canvas.closest('.boardwrap');if(wrap&&zoom===1){wrap.scrollLeft=0;wrap.scrollTop=0;}
}
const minus=document.getElementById('zoomOut'),plus=document.getElementById('zoomIn');
if(minus)minus.onclick=()=>{zoom=Math.max(window.matchMedia('(max-width: 740px)').matches?.5:1,Math.round((zoom-.25)*100)/100);updateZoom();};
if(plus)plus.onclick=()=>{zoom=Math.min(2,Math.round((zoom+.25)*100)/100);updateZoom();};
const grid=document.getElementById('gridBtn');
if(grid)grid.onclick=()=>{const on=grid.dataset.on!=='false';grid.dataset.on=on?'false':'true';grid.textContent=on?'Сетка: выкл':'Сетка: вкл';if(typeof draw==='function')draw();};
window.addEventListener('resize',updateZoom);
// Note: the grid toggle uses the same draw routine but the grid line changes are conditioned below.
updateZoom();
})();
