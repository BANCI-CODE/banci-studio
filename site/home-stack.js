(() => {
 'use strict';
 const body=document.body;
 if(!body.classList.contains('film-page')||!CSS.supports('position','sticky'))return;
 const main=body.querySelector('main');
 const panels=[...main.children].filter(node=>node.tagName==='SECTION');
 if(panels.length<2)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const probe=document.createElement('div');
 probe.setAttribute('aria-hidden','true');
 probe.style.cssText='position:fixed;inset:0 auto auto 0;width:0;height:100svh;visibility:hidden;pointer-events:none;';
 body.append(probe);
 const shades=panels.map((panel,i)=>{
  panel.classList.add('home-stack-layer');
  panel.style.setProperty('--home-stack-order',String(i+1));
  const shade=document.createElement('div');
  shade.className='home-stack-shade';shade.setAttribute('aria-hidden','true');
  panel.append(shade);
  return shade;
 });
 body.classList.add('home-stack-enabled');
 let frame=0,measurePending=true,viewport=1,heroVisible=null;
 const values=new Array(panels.length).fill(-1);
 function update(){
  frame=0;
  if(measurePending){
   viewport=probe.getBoundingClientRect().height||innerHeight;
   // Read every height before writing offsets; avoid forced layout per chapter.
   const heights=panels.map(panel=>panel.offsetHeight);
   panels.forEach((panel,i)=>panel.style.setProperty('--home-stack-top',`${Math.min(0,viewport-heights[i])}px`));
   measurePending=false;
  }
  const nextTops=panels.slice(1).map(panel=>panel.getBoundingClientRect().top);
  panels.forEach((panel,i)=>{
   const cover=reduce.matches||i===panels.length-1?0:Math.max(0,Math.min(1,(viewport-nextTops[i])/viewport));
   // Quiet depth cue as the next sheet enters, without dimming an uncovered sheet.
   const shade=Math.round(cover*cover*.16*1000)/1000;
   if(shade!==values[i]){shades[i].style.opacity=String(shade);values[i]=shade;}
  });
  const visible=reduce.matches||nextTops[0]>viewport*.55;
  if(visible!==heroVisible){heroVisible=visible;dispatchEvent(new CustomEvent('banci:home-stack-visibility',{detail:{visible}}));}
 }
 function request(){if(!frame)frame=requestAnimationFrame(update);}
 function measure(){measurePending=true;request();}
 addEventListener('scroll',request,{passive:true});
 addEventListener('resize',measure,{passive:true});
 addEventListener('pageshow',measure);
 addEventListener('visibilitychange',()=>{if(!document.hidden)measure();});
 reduce.addEventListener('change',measure);
 const observer=new ResizeObserver(measure);
 panels.forEach(panel=>observer.observe(panel));
 document.fonts?.ready.then(measure);
 request();
})();
