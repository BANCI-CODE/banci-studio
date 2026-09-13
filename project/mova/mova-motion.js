(() => {
 const root=document.querySelector('.mv-motion-preview');if(!root)return;
 const canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),device=root.querySelector('.mv-device'),video=root.querySelector('video'),play=root.querySelector('.mv-play'),status=root.querySelector('.mv-motion-status'),tabs=[...root.querySelectorAll('[data-sequence]')],categories=[...root.querySelectorAll('[data-category]')];
 let clips=[],clip=null,sheet=null,playing=false,frame=0,raf=0,previous=0,request=0,selected=0;
 function stop(){playing=false;cancelAnimationFrame(raf);video.pause();play.textContent='播放动画';play.setAttribute('aria-pressed','false')}
 function draw(){ctx.clearRect(0,0,240,240);ctx.drawImage(sheet,(frame%8)*240,Math.floor(frame/8)*240,240,240,0,0,240,240)}
 function tick(t){if(!playing)return;if(t-previous>=1000/clip.fps){frame=(frame+1)%clip.count;previous=t;draw()}raf=requestAnimationFrame(tick)}
 async function select(index){
  selected=index;const token=++request;stop();play.disabled=true;play.textContent='加载中…';tabs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
  if(!clips.length)return;
  try{const next=clips[index];clip=null;sheet=null;device.classList.remove('is-video');video.removeAttribute('src');video.load();
   if(next.type==='video'){
    video.preload="auto";video.poster=next.poster;video.src=next.src;
    await new Promise((resolve,reject)=>{video.onloadeddata=resolve;video.onerror=()=>reject(new Error('Video failed'));video.load()});
    if(token!==request)return;device.classList.add('is-video');status.textContent=next.title+' · 原始视频';
   }else{const im=new Image();im.src=next.src;await im.decode();if(token!==request)return;sheet=im;frame=0;draw();device.classList.add('is-ready');status.textContent=`${next.title} · ${next.count} 帧 · 240 × 240 px · ${next.fps} fps 预览`;}
   clip=next;play.disabled=false;play.textContent='播放动画';
  }catch{if(token===request){play.disabled=false;play.textContent='重新加载';status.textContent='片段加载失败，请重试。'}}
 }
 play.addEventListener('click',async()=>{if(!clip){select(selected);return}if(playing){stop();return}try{if(clip.type==='video')await video.play();playing=true;play.textContent='暂停动画';play.setAttribute('aria-pressed','true');if(clip.type!=='video'){previous=performance.now();raf=requestAnimationFrame(tick)}}catch{status.textContent='播放失败，请重试。';stop()}});
 tabs.forEach((b,i)=>b.addEventListener('click',()=>select(i)));
 categories.forEach(b=>b.addEventListener('click',()=>{categories.forEach(c=>c.setAttribute('aria-pressed',String(c===b)));tabs.forEach(t=>t.hidden=t.dataset.group!==b.dataset.category);root.querySelector('.mv-motion-tabs').scrollTop=0;select(tabs.findIndex(t=>!t.hidden))}));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});new IntersectionObserver(e=>{if(!e[0].isIntersecting)stop()}).observe(root);
 const observer=new IntersectionObserver(async e=>{if(!e[0].isIntersecting)return;observer.disconnect();try{const r=await fetch('/case-media/mova-hd/sequences.json');if(!r.ok)throw new Error();clips=await r.json();select(selected)}catch{status.textContent='无法加载动画列表，请刷新重试。'}},{rootMargin:'300px'});observer.observe(root);
})();

