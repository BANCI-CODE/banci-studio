(()=>{'use strict';
const stage=document.querySelector('.film-stage'),canvas=stage.querySelector('canvas'),loading=stage.querySelector('.film-loading'),fallback=stage.querySelector('.film-fallback');
// Percentages represent completed loading stages, not estimated network bytes.
let loaderFrame=0,loaderClose=0,loaderValue=0,loaderGoal=0;
function loaderProgress(value){
 loaderGoal=value;
 if(loaderFrame)return;
 const step=()=>{loaderFrame=0;loaderValue=Math.min(loaderGoal,loaderValue+Math.max(1,(loaderGoal-loaderValue)*.18));
 const number=loading.querySelector('.film-loading-number');number.firstChild.nodeValue=Math.round(loaderValue);
 loading.querySelectorAll('.film-loading-ring path').forEach((tick,i)=>tick.classList.toggle('is-complete',i<24*loaderValue/100));
 if(loaderValue<loaderGoal)loaderFrame=requestAnimationFrame(step);
 };
 loaderFrame=requestAnimationFrame(step);
}
function setLoading(state,message=''){
 clearTimeout(loaderClose);
 const failed=state==='error',busy=state==='loading';
 stage.setAttribute('aria-busy',String(busy));
 loading.classList.toggle('is-error',failed);
 loading.setAttribute('aria-label',failed?message:(document.documentElement.lang.startsWith('en')?'Loading artwork':'正在载入作品'));
 const error=loading.querySelector('.film-loading-error');error.hidden=!failed;error.textContent=message;
 if(state==='ready'){
  if(loading.hidden)return;
  loaderProgress(100);
  loaderClose=setTimeout(()=>{loading.hidden=true;cancelAnimationFrame(loaderFrame);loaderFrame=0;},500);
 }else{
  if(loading.hidden||failed){cancelAnimationFrame(loaderFrame);loaderFrame=0;loaderValue=0;loaderGoal=0;}
  loading.hidden=false;
 }
}
setLoading('loading');
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),cache=new Map();let data=[],target=0,current=0,velocity=0,frame=0,last=0,width=1,height=1,drag=null,wheelSum=0,wheelStamp=0,suppressClick=0,paused=false,hovered=false,manualUntil=0,autoDirection=1,heroVisible=true,navigating=false;
let gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});let program,locations,buffer,count;let liquidPull=0,liquidSpeed=0;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function setup(){if(!gl)return;program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec2 a;uniform vec2 viewport;uniform vec4 rect;uniform float bend;uniform float tilt;varying vec2 uv;void main(){uv=a;vec2 p=rect.xy+(a-.5)*rect.zw;float pull=sin(a.y*3.14159265);p.x+=pull*bend*(.2+.8*a.x);p.y+=(a.y-.5)*sin(a.x*3.14159265)*abs(bend)*.94;
// Opposing lobes pull apart while a narrow middle remains connected.
p.x+=sin(a.y*6.2831853)*bend*.22;
p.y+=sin(a.x*6.2831853)*sin(a.y*3.14159265)*abs(bend)*.18;vec2 local=p-rect.xy;float ct=cos(tilt),st=sin(tilt);p=rect.xy+vec2(local.x*ct-local.y*st,local.x*st+local.y*ct);gl_Position=vec4(p.x/viewport.x*2.-1.,1.-p.y/viewport.y*2.,0.,1.);}`));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D image;uniform sampler2D rearImage;uniform float slide;uniform float strain;uniform float opacity;uniform vec2 planeSize;uniform vec2 uvScale;varying vec2 uv;
float liquidHole(vec2 p,vec2 center,vec2 radius,float wobble){
 vec2 q=(p-center)/max(radius,vec2(.0001));
 float angle=atan(q.y,q.x);
 float edge=length(q)+sin(angle*3.+wobble)*.075+cos(angle*2.-wobble)*.06;
 return smoothstep(.92,1.06,edge);
}
void main(){vec2 q=abs((uv-.5)*planeSize)-planeSize*.5+22.;float d=length(max(q,0.))+min(max(q.x,q.y),0.)-22.;float mask=1.-smoothstep(-.8,.8,d);vec2 frontUV=uv+vec2(0.,slide*.18);vec2 rearUV=uv-vec2(0.,slide);
vec4 front=texture2D(image,frontUV);vec4 rear=texture2D(rearImage,rearUV);
front.a*=step(0.,frontUV.y)*step(frontUV.y,1.);rear.a*=step(0.,rearUV.y)*step(rearUV.y,1.);
float alpha=front.a+rear.a*(1.-front.a);
vec3 color=(front.rgb*front.a+rear.rgb*rear.a*(1.-front.a))/max(alpha,.00001);
// A pair of organic openings grows out of the stretched neck, then seals.
float amount=smoothstep(.18,.68,abs(strain));
vec2 liquidUV=uv;if(strain<0.)liquidUV.x=1.-liquidUV.x;
float tear=1.;
if(amount>.001){
 tear*=liquidHole(liquidUV,vec2(.64,.35),vec2(.185,.115)*amount,amount*2.);
 tear*=liquidHole(liquidUV,vec2(.77,.60),vec2(.235,.145)*amount,1.+amount*2.);
 // At maximum pull an opening reaches the edge and separates the soft lobes.
 float split=smoothstep(.62,1.,amount);
 tear*=liquidHole(liquidUV,vec2(1.04,.48),vec2(.25,.12)*split,2.);
}
gl_FragColor=vec4(color,alpha*opacity*mask*tear);}`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Unable to create image renderer');gl.useProgram(program);locations={a:gl.getAttribLocation(program,'a')};for(const n of['viewport','rect','bend','opacity','planeSize','uvScale','tilt','image','rearImage','slide','strain'])locations[n]=gl.getUniformLocation(program,n);const mesh=[];for(let y=0;y<20;y++)for(let x=0;x<32;x++){const x0=x/32,x1=(x+1)/32,y0=y/20,y1=(y+1)/20;mesh.push(x0,y0,x1,y0,x0,y1,x0,y1,x1,y0,x1,y1);}buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(mesh),gl.STATIC_DRAW);count=mesh.length/2;gl.enableVertexAttribArray(locations.a);gl.vertexAttribPointer(locations.a,2,gl.FLOAT,false,0,0);gl.uniform1i(locations.image,0);gl.uniform1i(locations.rearImage,1);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}
function frameSize(){const w=Math.min(height*.86/1.48,width*.76,420);return{w,h:w*1.48,ratio:1/1.48,gap:width<600?38:64};}
// One shared card composition and proportion for every viewport.
function artworkColor(im){
 const sample=document.createElement('canvas');sample.width=sample.height=32;const ctx=sample.getContext('2d',{willReadFrequently:true});const side=Math.min(im.width,im.height);ctx.drawImage(im,(im.width-side)/2,(im.height-side)/2,side,side,0,0,32,32);const pixels=ctx.getImageData(0,0,32,32).data,bins=new Map();
 for(let i=0;i<pixels.length;i+=4){const rgb=[pixels[i],pixels[i+1],pixels[i+2]],hi=Math.max(...rgb),lo=Math.min(...rgb);if(pixels[i+3]<200||hi>240&&lo>220||hi<28)continue;const key=rgb.map(v=>v>>5).join(',');const bucket=bins.get(key)||{sum:[0,0,0],n:0,weight:0};bucket.n++;bucket.weight+=1+(hi-lo)/100;rgb.forEach((v,j)=>bucket.sum[j]+=v);bins.set(key,bucket);}
 const best=[...bins.values()].sort((a,b)=>b.weight-a.weight)[0];return best?best.sum.map(v=>Math.round(v/best.n)):[88,91,87];
}
function cardSurface(im, item, index, layer='combined') {
 const surface=document.createElement('canvas');
 surface.width=Math.round(Math.min(1600,Math.max(1024,frameSize().w*(devicePixelRatio||1))));surface.height=Math.round(surface.width*1.48);
 const c=surface.getContext('2d'),scale=surface.width/1000;c.scale(scale,scale);
 const box=(x,y,w,h,r)=>{c.beginPath();c.roundRect(x,y,w,h,r);};
 const rgb=artworkColor(im),tone=(factor,alpha=1)=>`rgba(${rgb.map(v=>Math.round(v*factor)).join(',')},${alpha})`;
 // Artwork-derived color, shared by the independent front and sliding rear layers.
 if(layer!=='front'){
 box(80,1130,840,310,66);const back=c.createLinearGradient(0,1130,0,1440);back.addColorStop(0,tone(.65));back.addColorStop(1,tone(.85));c.fillStyle=back;c.fill();
 c.strokeStyle='#ffffff55';c.lineWidth=3;c.stroke();
 }
 if(layer!=='back'){
 box(4,4,992,1288,98);c.fillStyle='#30312f';c.fill();
 c.save();c.clip();const glow=c.createRadialGradient(500,1270,20,500,1150,530);glow.addColorStop(0,tone(.8));glow.addColorStop(.6,tone(.7,.9));glow.addColorStop(1,tone(.7,0));c.fillStyle=glow;c.fillRect(0,630,1000,680);c.restore();
 box(4,4,992,1288,98);c.strokeStyle='#ffffff32';c.lineWidth=4;c.stroke();
 c.save();box(40,40,920,920,62);c.clip();c.fillStyle='#e4dfd1';c.fill();
 const ratio=im.width/im.height;const sw=ratio>1?im.height:im.width,sh=sw;c.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,40,40,920,920);c.restore();
 function lines(text,y,font,size,maxLines,color){c.font=font;c.fillStyle=color;c.textBaseline='top';let line='',row=0;const chars=text.match(/[A-Za-z0-9]+|\s+|[^\x00-\x7F]|./gu)||[];for(let n=0;n<chars.length;n++){const next=line+chars[n];if(c.measureText(next).width>896&&line){if(row===maxLines-1){c.fillText(line.slice(0,-1)+'…',48,y+row*size);return row+1;}c.fillText(line,48,y+row*size);row++;line=chars[n].trimStart();}else line=next;}c.fillText(line,48,y+row*size);return row+1;}
 const titleRows=lines(item.title,1004,'600 60px Arial,"Microsoft YaHei",sans-serif',65,2,'#fff');
 lines(item.description,1004+titleRows*65+20,'40px Arial,"Microsoft YaHei",sans-serif',44,3,'#f5f5f2');
 }
 if(layer!=='front'){
 c.fillStyle='#f5f5f2';c.font='600 34px Arial';c.textBaseline='middle';c.fillText(String(index+1).padStart(2,'0')+' / '+data.length,130,1368);
 c.font='30px Arial';c.textAlign='center';c.fillText('BANCI',500,1368);c.textAlign='left';
 c.strokeStyle='#fff2d7';c.lineWidth=5;c.beginPath();c.moveTo(818,1381);c.lineTo(852,1347);c.moveTo(818,1347);c.lineTo(852,1347);c.lineTo(852,1381);c.stroke();
 }
 return surface;
}
function request(){if(!frame)frame=requestAnimationFrame(draw);}
function load(i){if(i<0||i>=data.length||cache.has(i))return;const entry={ready:false,texture:null},im=new Image();cache.set(i,entry);im.decoding='async';im.fetchPriority=i===target?'high':'low';im.onload=()=>{if(cache.get(i)!==entry)return;if(i===target)loaderProgress(85);entry.surface=cardSurface(im,data[i],i);entry.entered=performance.now();if(gl){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,entry.surface);entry.texture=t;
 const makeLayer=layer=>{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cardSurface(im,data[i],i,layer));return texture;};
 gl.deleteTexture(t);entry.texture=makeLayer('front');entry.backTexture=makeLayer('back');}entry.ready=true;if(i===target){performance.mark("film-texture-ready");setLoading('ready');if(!gl){fallback.src=entry.surface.toDataURL();fallback.hidden=false;}}request();};im.onerror=()=>{entry.failed=true;if(i===target){setLoading('error',document.documentElement.lang.startsWith('en')?'Image unavailable. Try another artwork.':'图片暂未加载，请切换作品');}};im.src=data[i].src;}
// Include the full viewport, tilted edges and the maximum elastic displacement.
function visibleRange(center,padding=0){
 const size=frameSize(),reach=(width/2+size.w*1.5)/(size.w+size.gap);
 return {first:Math.max(0,Math.floor(center-reach)-padding),last:Math.min(data.length-1,Math.ceil(center+reach)+padding)};
}
let preloadWindow='';
function preload(){
 if(!data.length)return;
 const now=visibleRange(current,1),destination=visibleRange(target,1);
 const key=[now.first,now.last,destination.first,destination.last].join(':');
 if(key===preloadWindow)return;
 preloadWindow=key;
 const needed=new Set();
 for(const range of [now,destination])for(let i=range.first;i<=range.last;i++)needed.add(i);
 load(target);
 [...needed].sort((a,b)=>Math.abs(a-target)-Math.abs(b-target)).forEach(load);
 for(const [i,e]of cache)if(!needed.has(i)){if(gl&&e.texture){gl.deleteTexture(e.texture);gl.deleteTexture(e.backTexture);}cache.delete(i);}
}
function update(){const d=data[target];document.querySelector('#film-number').textContent=String(target+1).padStart(2,'0');document.querySelector('#film-category').textContent=d.category;const link=document.querySelector('#film-link');link.firstChild.textContent=d.title+' ';link.href=d.url;document.querySelector('#film-description').textContent=d.description;stage.setAttribute('aria-label',`${target+1} / ${data.length}：${d.title}。左右滑动切换，回车查看项目`);document.querySelectorAll('.film-ticks button').forEach((b,i)=>b.setAttribute('aria-pressed',i===target));document.querySelector('[data-dir="-1"]').disabled=target===0;document.querySelector('[data-dir="1"]').disabled=target===data.length-1;setLoading(cache.get(target)?.ready?'ready':cache.get(target)?.failed?'error':'loading',cache.get(target)?.failed?'图片暂未加载，请切换作品':'');if(!gl){fallback.hidden=!cache.get(target)?.ready;if(cache.get(target)?.surface)fallback.src=cache.get(target).surface.toDataURL();}preload();}
function go(i,automatic=false){if(navigating)return;if(!automatic)manualUntil=performance.now()+8000;const next=Math.max(0,Math.min(data.length-1,i));if(next===target)return;target=next;if(cache.has(target))cache.get(target).entered=performance.now();if(reduce.matches){current=target;velocity=0;}update();request();}
function draw(time){frame=0;const dt=Math.min(2,(time-last)/16.667||1);last=time;if(reduce.matches){current=target;velocity=0;}else if(drag?.locked){velocity=0;}else{velocity+=(target-current)*.065*dt;velocity*=Math.pow(.84,dt);current+=velocity*dt;if(Math.abs(target-current)<.0005&&Math.abs(velocity)<.0005){current=target;velocity=0;}}
// A separate damped spring lets holes close gradually after finger release.
const wantedPull=reduce.matches?0:Math.max(-.72,Math.min(.72,drag?.locked?(drag.dx||0)*.95/frameSize().w:velocity*2.6));
if(reduce.matches){liquidPull=0;liquidSpeed=0;}else{liquidSpeed+=(wantedPull-liquidPull)*.14*dt;liquidSpeed*=Math.pow(.64,dt);liquidPull+=liquidSpeed*dt;if(Math.abs(wantedPull-liquidPull)<.0005&&Math.abs(liquidSpeed)<.0005){liquidPull=wantedPull;liquidSpeed=0;}}
preload();
if(gl){gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.uniform2f(locations.viewport,width,height+240);const range=visibleRange(current),indices=Array.from({length:Math.max(0,range.last-range.first+1)},(_,n)=>range.first+n).sort((a,b)=>Math.abs(b-current)-Math.abs(a-current));for(const i of indices){const e=cache.get(i);if(!e?.ready||!e.texture)continue;const distance=i-current,ratio=data[i].width/data[i].height;const size=frameSize(),depth=1-Math.min(1,Math.abs(distance))*.035,h=size.h*depth,w=size.w*depth;const cx=width/2+distance*(size.w+size.gap);const tilt=reduce.matches?0:Math.max(-1,Math.min(1,distance))*.0872665;const drop=(Math.abs(Math.sin(tilt))*w+(Math.cos(tilt)-1)*h)/2;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,e.texture);gl.uniform4f(locations.rect,cx,height/2+120+drop,w,h);gl.uniform2f(locations.planeSize,w,h);gl.uniform2f(locations.uvScale,1,1);gl.uniform1f(locations.bend,liquidPull*w);gl.uniform1f(locations.strain,liquidPull);gl.uniform1f(locations.tilt,tilt);gl.uniform1f(locations.opacity,1);const age=Math.max(0,time-e.entered),slide=reduce.matches||i!==target?0:-w*.16*Math.exp(-age/270)*Math.cos(age/130);
 // Keep original colors opaque; depth comes from scale and tilt, not a pale backdrop blend.
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,e.backTexture);
 gl.uniform1f(locations.slide,slide/h);gl.drawArrays(gl.TRIANGLES,0,count);
 gl.activeTexture(gl.TEXTURE0);}}
if(!reduce.matches&&cache.get(target)?.ready&&time-cache.get(target).entered<1500)request();
if(Math.abs(wantedPull-liquidPull)>.0005||Math.abs(liquidSpeed)>.0005||!drag?.locked&&(current!==target||Math.abs(velocity)>.0005))request();}
function resize(){width=stage.clientWidth;height=stage.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round((height+240)*dpr);stage.closest('.film-main').style.setProperty('--film-frame-width',frameSize().w+'px');request();}
try{setup();}catch(error){gl=null;canvas.hidden=true;setLoading('loading');console.warn(error);}
fetch('/home-film-preview/data.json').then(r=>{if(!r.ok)throw Error('作品列表无法加载');return r.json();}).then(items=>{data=items;loaderProgress(25);const ticks=document.querySelector('.film-ticks');items.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`${String(i+1).padStart(2,'0')} ${d.title}`);b.addEventListener('click',()=>go(i));ticks.append(b);});update();resize();}).catch(e=>{setLoading('error',document.documentElement.lang.startsWith('en')?'Unable to load artworks. Please refresh.':'作品暂时无法加载，请刷新重试');});

async function openProject(){
 if(navigating||!data[target])return;
 navigating=true;paused=true;const d=data[target];
 try{sessionStorage.setItem('banci-film-arrival',JSON.stringify({...d,time:Date.now()}));}catch{}
 window.BanciProjectTransition?.(d);
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 location.assign(d.url);
}
const autoButton=document.querySelector('.film-auto');
function syncAuto(){autoButton.setAttribute('aria-pressed',String(!paused));autoButton.setAttribute('aria-label',paused?'播放自动滚动':'暂停自动滚动');autoButton.querySelector('span').textContent=paused?'播放':'暂停';autoButton.querySelector('svg').innerHTML=paused?'<path fill="currentColor" stroke="none" d="M8 5.8a1 1 0 0 1 1.5-.86l10 6.2a1 1 0 0 1 0 1.72l-10 6.2A1 1 0 0 1 8 18.2Z"/>':'<g fill="currentColor" stroke="none"><rect x="7" y="5" width="3" height="14" rx="1"/><rect x="14" y="5" width="3" height="14" rx="1"/></g>';}
paused=reduce.matches;syncAuto();autoButton.addEventListener('click',()=>{paused=!paused;syncAuto();});
stage.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hovered=true;});stage.addEventListener('pointerleave',()=>hovered=false);
stage.addEventListener('pointerdown',()=>manualUntil=performance.now()+8000);
setInterval(()=>{if(paused||hovered||!heroVisible||reduce.matches||document.hidden||drag||navigating||performance.now()<manualUntil||!data.length||!cache.get(target)?.ready)return;if(target===data.length-1)autoDirection=-1;if(target===0)autoDirection=1;go(target+autoDirection,true);},3600);
document.querySelector('#film-link').addEventListener('click',e=>{if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();openProject();});
addEventListener('pageshow',e=>{if(e.persisted){document.querySelector('.film-departure')?.remove();document.querySelector('.project-handoff')?.remove();canvas.style.opacity='';navigating=false;paused=reduce.matches;syncAuto();request();}});

new ResizeObserver(resize).observe(stage);
new IntersectionObserver(entries=>{heroVisible=entries[0].intersectionRatio>.55;},{threshold:[0,.55,1]}).observe(stage.closest('.film-main'));
stage.addEventListener('wheel',e=>{if(!data.length||(!e.shiftKey&&Math.abs(e.deltaY)>=Math.abs(e.deltaX)))return;const delta=e.shiftKey?e.deltaY:e.deltaX;const now=performance.now();if((target===0&&delta<0)||(target===data.length-1&&delta>0))return;e.preventDefault();if(now-wheelStamp<550)return;wheelSum+=delta*(e.deltaMode===1?16:1);if(Math.abs(wheelSum)>45){go(target+Math.sign(wheelSum));wheelSum=0;wheelStamp=now;}},{passive:false});
stage.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag={x:e.clientX,y:e.clientY,start:current,dx:0,locked:false};stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(!drag||!data.length)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.locked&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy))drag.locked=true;if(!drag.locked)return;drag.dx=dx;const size=frameSize();const next=drag.start-dx/(size.w+size.gap)*.85;current=Math.max(-.3,Math.min(data.length-1+.3,next));request();});
stage.addEventListener('pointerup',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;request();if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*.8){go(target-Math.sign(dx));suppressClick=performance.now()+400;}else if(Math.max(Math.abs(dx),Math.abs(dy))<16&&performance.now()>suppressClick&&data[target]){const x=e.clientX-stage.getBoundingClientRect().left,size=frameSize();if(x<(width-size.w)/2-size.gap/2)go(target-1);else if(x>(width+size.w)/2+size.gap/2)go(target+1);else openProject();}});stage.addEventListener('pointercancel',()=>{drag=null;request();});
stage.addEventListener('keydown',e=>{if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End','Enter'].includes(e.key)){e.preventDefault();if(e.key==='Enter'){if(data[target])openProject();}else if(e.key==='Home')go(0);else if(e.key==='End')go(data.length-1);else go(target+(['ArrowDown','ArrowRight'].includes(e.key)?1:-1));}});
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>go(target+Number(b.dataset.dir))));reduce.addEventListener('change',()=>request());
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback.src=cache.get(target)?.surface?.toDataURL()||data[target]?.src||'';fallback.hidden=false;canvas.hidden=true;});
})();
