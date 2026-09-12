(() => {
  const dialog=document.createElement('dialog');
  dialog.className='air-image-dialog';
  dialog.setAttribute('aria-labelledby','air-image-title');
  dialog.innerHTML='<div class="air-image-toolbar"><p id="air-image-title"></p><button type="button" data-zoom aria-pressed="false">放大细节</button><button type="button" data-close>关闭 ×</button></div><div class="air-image-scroll" tabindex="0" aria-label="图片阅读区域"><img alt=""></div>';
  document.body.append(dialog);
  const image=dialog.querySelector('img'),area=dialog.querySelector('.air-image-scroll'),zoom=dialog.querySelector('[data-zoom]');
  let trigger=null,overflow='';
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[data-air-viewer]');
    if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||!dialog.showModal)return;
    event.preventDefault();trigger=link;
    const caption=link.closest('figure')?.querySelector('figcaption')?.textContent||link.querySelector('img')?.alt||'作品图片';
    dialog.querySelector('p').textContent=caption;image.alt=caption;image.src=link.href;
    area.classList.remove('is-zoomed');zoom.textContent='放大细节';zoom.setAttribute('aria-pressed','false');
    overflow=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';dialog.showModal();dialog.querySelector('[data-close]').focus();
  });
  zoom.addEventListener('click',()=>{const active=area.classList.toggle('is-zoomed');zoom.setAttribute('aria-pressed',String(active));zoom.textContent=active?'适应窗口':'放大细节';area.scrollTo(0,0)});
  dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{document.documentElement.style.overflow=overflow;image.removeAttribute('src');trigger?.focus({preventScroll:true})});
})();
