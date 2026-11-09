
(()=>{'use strict';
function paint(){if(!document.getElementById('setupScreen')?.classList.contains('active'))return;
 const p=roster[focus],frame=document.querySelector('#fighterCard .portrait-frame');if(!p||!frame)return;const start=document.getElementById('start');if(start)start.disabled=roster.slice(0,Number(document.getElementById('teamSize').value)||1).some(x=>!x.appearanceChosen);
 let img=frame.querySelector('img.portrait');if(p.appearanceChosen){if(img){img.src=SPRITES[p.sprite];img.style.display='';}frame.querySelector('.unpicked-look')?.remove();}else{if(img)img.style.display='none';if(!frame.querySelector('.unpicked-look')){const box=document.createElement('div');box.className='unpicked-look';box.innerHTML='<span class="placeholder-icon" aria-hidden="true">◇</span><strong>Внешность не выбрана</strong><small>Выбери своего шиноби в галерее ниже</small>';frame.append(box);}}
}
const prev=window.renderSetup;window.renderSetup=function(...args){const result=prev.apply(this,args);paint();const start=document.getElementById('start');if(start)start.disabled=roster.slice(0,Number(document.getElementById('teamSize').value)||1).some(x=>!x.appearanceChosen);return result};paint();
})();
