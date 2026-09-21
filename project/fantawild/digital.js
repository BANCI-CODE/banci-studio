document.querySelectorAll('#taizhou-website').forEach(project=>{
 const viewport=project.querySelector('.fd-viewport'),image=viewport.querySelector('img'),buttons=[...project.querySelectorAll('[data-taizhou-y]')];
 const update=()=>{const y=viewport.scrollTop*1920/Math.max(1,image.clientWidth);let active=0;buttons.forEach((button,i)=>{if(y+4>=Number(button.dataset.taizhouY))active=i});if(viewport.scrollTop>0&&viewport.scrollTop+viewport.clientHeight>=viewport.scrollHeight-2)active=buttons.length-1;buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===active)))};
 buttons.forEach(button=>button.addEventListener('click',()=>{viewport.scrollTo({top:Number(button.dataset.taizhouY)*image.clientWidth/1920,behavior:'instant'});update()}));
 viewport.addEventListener('scroll',update,{passive:true});image.addEventListener('load',update);new ResizeObserver(update).observe(viewport);update();
});
document.querySelectorAll('.fd-project').forEach(project=>{
 const viewport=project.querySelector('.fd-viewport'),image=viewport.querySelector('img'),link=project.querySelector('.fd-original');
 project.querySelectorAll('[data-digital-src]').forEach(button=>button.addEventListener('click',()=>{
  project.querySelectorAll('[data-digital-src]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  image.src=button.dataset.digitalSrc;image.width=Number(button.dataset.width);image.height=Number(button.dataset.height);image.alt=button.dataset.label;image.loading='eager';link.href=button.dataset.digitalSrc;link.setAttribute('aria-label','放大查看：'+button.dataset.label);viewport.scrollTo(0,0);
 }));
});
