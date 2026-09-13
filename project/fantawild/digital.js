document.querySelectorAll('.fd-project').forEach(project=>{
 const viewport=project.querySelector('.fd-viewport'),image=viewport.querySelector('img'),link=project.querySelector('.fd-original');
 project.querySelectorAll('[data-digital-src]').forEach(button=>button.addEventListener('click',()=>{
  project.querySelectorAll('[data-digital-src]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  image.src=button.dataset.digitalSrc;image.width=Number(button.dataset.width);image.height=Number(button.dataset.height);image.alt=button.dataset.label;image.loading='eager';link.href=button.dataset.digitalSrc;link.setAttribute('aria-label','放大查看：'+button.dataset.label);viewport.scrollTo(0,0);
 }));
});
