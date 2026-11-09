
(function(){
 const buttons=[document.getElementById('mobile-full-setup'),document.getElementById('mobile-full-battle')].filter(Boolean);
 function refresh(){const on=!!document.fullscreenElement;for(const b of buttons){b.textContent=on?'⛶ Выйти из полного экрана':'⛶ Полный экран';b.setAttribute('aria-label',on?'Выйти из полного экрана':'Включить полный экран')}}
 async function toggle(){try{if(document.fullscreenElement){if(!document.exitFullscreen)throw Error('unsupported');await document.exitFullscreen()}else{const root=document.documentElement;if(!root.requestFullscreen)throw Error('unsupported');await root.requestFullscreen()}refresh()}catch(err){alert('Браузер не разрешил полноэкранный режим для этого файла. Попробуй открыть игру в другом браузере.')}}
 buttons.forEach(b=>b.addEventListener('click',toggle));document.addEventListener('fullscreenchange',refresh);refresh();
})();
