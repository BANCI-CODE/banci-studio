(() => {
  const root=document.querySelector('.mv-motion-preview');
  if(!root)return;
  const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),device=root.querySelector('.mv-device');
  const play=root.querySelector('.mv-play'),status=root.querySelector('.mv-motion-status'),tabs=[...root.querySelectorAll('[data-sequence]')];
  let clips=[],clip=null,sheet=null,playing=false,frame=0,previous=0,raf=0,request=0;
  function draw(){if(!sheet)return;ctx.clearRect(0,0,240,240);ctx.drawImage(sheet,(frame%8)*240,Math.floor(frame/8)*240,240,240,0,0,240,240)}
  function stop(){playing=false;cancelAnimationFrame(raf);play.textContent='播放动画';play.setAttribute('aria-pressed','false')}
  function tick(time){if(!playing)return;if(time-previous>=1000/clip.fps){previous=time;frame=(frame+1)%clip.count;draw()}raf=requestAnimationFrame(tick)}
  async function select(index){
    const token=++request;stop();play.disabled=true;play.textContent='加载中…';
    tabs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
    try{
      const next=clips[index],im=new Image();im.src=next.src;await im.decode();if(token!==request)return;
      clip=next;sheet=im;frame=0;draw();device.classList.add('is-ready');play.disabled=false;play.textContent='播放动画';
      canvas.setAttribute('aria-label',`${clip.title}，原始序列帧动画`);status.textContent=`${clip.title} · ${clip.count} 帧 · 240 × 240 px · ${clip.fps} fps 预览`;
    }catch{if(token===request){play.textContent='重新加载';play.disabled=false;sheet=null;status.textContent='片段加载失败，请重试。'}}
  }
  play.addEventListener('click',()=>{if(!sheet){select(tabs.findIndex(b=>b.getAttribute('aria-pressed')==='true'));return}if(playing){stop();return}playing=true;previous=performance.now();play.textContent='暂停动画';play.setAttribute('aria-pressed','true');raf=requestAnimationFrame(tick)});
  tabs.forEach((b,i)=>b.addEventListener('click',()=>select(i)));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop()},{threshold:0}).observe(root);
  // Default is paused, including when reduced motion is requested.
  const observer=new IntersectionObserver(async entries=>{
    if(!entries[0].isIntersecting)return;observer.disconnect();
    try{const response=await fetch('/case-media/mova-hd/sequences.json');if(!response.ok)throw new Error('Load failed');clips=await response.json();await select(0)}catch{play.textContent='暂时无法加载';status.textContent='请刷新页面重试。'}
  },{rootMargin:'300px'});observer.observe(root);
})();
