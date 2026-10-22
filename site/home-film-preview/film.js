(()=>{'use strict';
const stage=document.querySelector('.film-stage'),canvas=stage.querySelector('canvas'),loading=stage.querySelector('.film-loading'),fallback=stage.querySelector('.film-fallback');
// Three SVG rings animate in CSS only while their loading status is visible.
function setLoading(state,message=''){
 const failed=state==='error';
 loading.hidden=state==='ready';loading.classList.toggle('is-error',failed);
 stage.setAttribute('aria-busy',String(state==='loading'));
 loading.setAttribute('aria-label',failed?message:(document.documentElement.lang.startsWith('en')?'Loading artwork':'正在载入作品'));
 const error=loading.querySelector('.film-loading-error');error.hidden=!failed;error.textContent=message;
}
setLoading('loading');
// Build each text texture only after the same two families used by the DOM are ready.
const cardType='"Alibaba PuHuiTi","PingFang SC","Microsoft YaHei",sans-serif';
const cardWords=typeof Intl.Segmenter==='function'?new Intl.Segmenter('zh-CN',{granularity:'word'}):null;
const cardTitleType='"Bebas Neue","Alimama ShuHeiTi","Alibaba PuHuiTi",sans-serif';
const cardFonts=document.fonts?Promise.allSettled([
 document.fonts.load('400 24px "Bebas Neue"','BANCI'),
 document.fonts.load('700 24px "Alimama ShuHeiTi"','设计作品'),
 document.fonts.load('400 18px "Alibaba PuHuiTi"','设计作品'),
 document.fonts.load('500 18px "Alibaba PuHuiTi"','BANCI')
]):Promise.resolve();
let mistTimer=0;
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),cache=new Map();let data=[],target=0,previousTarget=0,current=0,velocity=0,frame=0,last=0,width=1,height=1,drag=null,wheelSum=0,wheelStamp=0,suppressClick=0,paused=false,hovered=false,manualUntil=0,autoDirection=1,heroVisible=true,navigating=false;
let gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true});let program,locations,buffer,count;let pixelPull=0,pixelSpeed=0,entryStarted=-Infinity,entryDirection=-1;
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function setup(){if(!gl)return;program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,`attribute vec2 a;uniform vec2 viewport;uniform vec4 rect;uniform float bend;uniform float tilt;varying vec2 uv;void main(){uv=a;vec2 p=rect.xy+(a-.5)*rect.zw;// Keep the two halves firm; the central pixel columns form the pulled bridge.
float t=clamp((a.x-.30)/.40,0.,1.);
float seam=t*t*t*(t*(t*6.-15.)+10.);
float leading=bend<0.?1.-seam:seam;
p.x+=bend*leading;
// A shallow arc follows the stretched pixel band without bending the rigid ends.
// One continuous arch with zero slope at the two rigid ends.
float arc=16.*a.x*a.x*(1.-a.x)*(1.-a.x);
p.y+=abs(bend)*.078*arc;
vec2 local=p-rect.xy;float ct=cos(tilt),st=sin(tilt);p=rect.xy+vec2(local.x*ct-local.y*st,local.x*st+local.y*ct);gl_Position=vec4(p.x/viewport.x*2.-1.,1.-p.y/viewport.y*2.,0.,1.);}`));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;uniform sampler2D image;uniform sampler2D rearImage;uniform float slide;uniform float strain;uniform float opacity;uniform float mistTime;uniform float mistStrength;uniform float mistPhase;uniform vec2 planeSize;uniform vec2 uvScale;varying vec2 uv;
void main(){vec2 q=abs((uv-.5)*planeSize)-planeSize*.5+22.;float d=length(max(q,0.))+min(max(q.x,q.y),0.)-22.;float mask=1.-smoothstep(-.8,.8,d);// Extend a narrow source column into a broad horizontal pixel band.
// Outside the band each half keeps the original image in its natural order.
float amount=smoothstep(.035,.40,abs(strain));
float left=.35,right=.65;
float sourceLeft=mix(left,.4985,amount),sourceRight=mix(right,.5015,amount);
vec2 sampleUV=uv;
if(uv.x<left)sampleUV.x=uv.x*sourceLeft/left;
else if(uv.x>right)sampleUV.x=sourceRight+(uv.x-right)*(1.-sourceRight)/(1.-right);
else sampleUV.x=mix(sourceLeft,sourceRight,(uv.x-left)/(right-left));
vec2 frontUV=sampleUV;vec2 rearUV=sampleUV-vec2(0.,slide);
vec4 front=texture2D(image,frontUV);vec4 rear=texture2D(rearImage,rearUV);
front*=step(0.,frontUV.y)*step(frontUV.y,1.);rear*=step(0.,rearUV.y)*step(rearUV.y,1.);
// Feather only the join over a few source pixels; keep both ticket cutouts crisp.
front*=1.-smoothstep(1284./1480.,1292./1480.,frontUV.y);
// Two broad, slowly moving fields soften only the material below the artwork.
// Bright ink is excluded, so headings and descriptions remain steady and crisp.
if(mistStrength>0. && sampleUV.y>960./1480.){
 float t=mistTime+mistPhase;
 float cloud=.65*sin(sampleUV.x*5.2+sin(sampleUV.y*8.-t*.24)+t*.35)
             +.35*sin(sampleUV.x*3.1-sampleUV.y*7.+t*.21);
 float region=smoothstep(960./1480.,1040./1480.,frontUV.y);
 float frontInk=1.-smoothstep(.30,.48,min(front.r,min(front.g,front.b))/max(front.a,.001));
 float rearInk=1.-smoothstep(.30,.48,min(rear.r,min(rear.g,rear.b))/max(rear.a,.001));
 front.rgb*=1.+cloud*.13*region*frontInk*mistStrength;
 rear.rgb*=1.+cloud*.055*rearInk*mistStrength;
}
float alpha=front.a+rear.a*(1.-front.a);
// Premultiplied sampling avoids dark fringes from transparent texture pixels.
vec3 color=front.rgb+rear.rgb*(1.-front.a);
gl_FragColor=vec4(color,alpha)*(opacity*mask);}`));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Unable to create image renderer');gl.useProgram(program);locations={a:gl.getAttribLocation(program,'a')};for(const n of['viewport','rect','bend','opacity','planeSize','uvScale','tilt','image','rearImage','slide','strain','mistTime','mistStrength','mistPhase'])locations[n]=gl.getUniformLocation(program,n);const mesh=[];for(let y=0;y<8;y++)for(let x=0;x<128;x++){const x0=x/128,x1=(x+1)/128,y0=y/8,y1=(y+1)/8;mesh.push(x0,y0,x1,y0,x0,y1,x0,y1,x1,y0,x1,y1);}buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(mesh),gl.STATIC_DRAW);count=mesh.length/2;gl.enableVertexAttribArray(locations.a);gl.vertexAttribPointer(locations.a,2,gl.FLOAT,false,0,0);gl.uniform1i(locations.image,0);gl.uniform1i(locations.rearImage,1);gl.enable(gl.BLEND);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);}
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
 const rgb=/^#[0-9a-f]{6}$/i.test(item.cardColor||'')?[1,3,5].map(offset=>parseInt(item.cardColor.slice(offset,offset+2),16)):artworkColor(im),tone=(factor,alpha=1)=>`rgba(${rgb.map(v=>Math.round(v*factor)).join(',')},${alpha})`;
 // Artwork-derived color, shared by the independent front and sliding rear layers.
 if(layer!=='front'){
 box(80,1200,840,240,18);const back=c.createLinearGradient(0,1130,0,1440);back.addColorStop(0,tone(.65));back.addColorStop(1,tone(.85));c.fillStyle=back;c.fill();
 }
 if(layer!=='back'){
 box(4,4,992,1288,98);c.fillStyle='#343531';c.fill();
 // A wide feathered rectangular light band; no circular spotlight or dark corners.
 c.save();c.clip();const glow=c.createLinearGradient(0,780,0,1320);
 glow.addColorStop(0,tone(.98,0));glow.addColorStop(.20,tone(.98,.45));
 glow.addColorStop(.34,tone(.98,.84));glow.addColorStop(.72,tone(.94,.80));glow.addColorStop(1,tone(.90,.68));
 c.fillStyle=glow;c.fillRect(0,780,1000,540);
 // Edge tint frames the wide light band without a shadow below the artwork.
 const edgeTint=c.createLinearGradient(0,0,1000,0);
 edgeTint.addColorStop(0,'#11140f66');edgeTint.addColorStop(.10,'#11140f2b');edgeTint.addColorStop(.28,'#11140f00');
 edgeTint.addColorStop(.72,'#11140f00');edgeTint.addColorStop(.90,'#11140f2b');edgeTint.addColorStop(1,'#11140f66');
 c.fillStyle=edgeTint;c.fillRect(0,0,1000,1292);
 c.restore();
 const edgePixel=c.getImageData(Math.round(500*scale),Math.round(960*scale),1,1).data;
 c.save();box(40,40,920,920,62);c.clip();c.fillStyle='#e4dfd1';c.fill();
 const ratio=im.width/im.height;const sw=ratio>1?im.height:im.width,sh=sw;c.drawImage(im,(im.width-sw)/2,(im.height-sh)/2,sw,sh,40,40,920,920);
 // Feather just the last 12 artwork pixels into the actual material color.
 const feather=c.createLinearGradient(0,948,0,960),edgeRGB=`${edgePixel[0]},${edgePixel[1]},${edgePixel[2]}`;
 feather.addColorStop(0,`rgba(${edgeRGB},0)`);feather.addColorStop(.4,`rgba(${edgeRGB},.12)`);feather.addColorStop(1,`rgba(${edgeRGB},1)`);
 c.fillStyle=feather;c.fillRect(40,948,920,12);c.restore();
 // Wrap whole Latin words and CJK characters; balance descriptions without orphan tails.
 function lines(text,y,font,leading,maxLines,color,balance=false){
  c.font=font;c.fillStyle=color;c.textBaseline='top';
  const tokens=cardWords?[...cardWords.segment(String(text))].map(part=>part.segment):String(text).match(/[A-Za-z0-9]+(?:[’'-][A-Za-z0-9]+)*|\s+|[^\x00-\x7F]|./gu)||[];
  const measure=t=>c.measureText(t).width,limit=896;
  let rows=[],line='';
  for(const token of tokens){
   if(line&&measure(line+token)>limit){rows.push(line.trim());line=token.trimStart();}else line+=token;
  }
  if(line.trim())rows.push(line.trim());
  if(balance&&rows.length===2){
   let best=Infinity,pair=rows;
   for(let split=1;split<tokens.length;split++){
    const left=tokens.slice(0,split).join('').trim(),right=tokens.slice(split).join('').trim();
    if(!left||!right||/^[，。！？、；：）》”’.,!?;:]/u.test(right))continue;
    const lw=measure(left),rw=measure(right),score=Math.abs(lw-rw)-(/[，。；！？：,;:]$/u.test(left)?limit*.12:0);
    if(lw<=limit&&rw<=limit&&score<best){best=score;pair=[left,right];}
   }rows=pair;
  }
  if(rows.length>maxLines){rows=rows.slice(0,maxLines);let tail=rows[maxLines-1];while(tail&&measure(tail+'…')>limit)tail=tail.slice(0,-1);rows[maxLines-1]=tail+'…';}
  rows.forEach((row,i)=>c.fillText(row,48,y+i*leading));return rows.length;
 }
 const titleRows=lines(item.title,996,'400 76px '+cardTitleType,82,2,'#fff',true);
 lines(item.description,996+titleRows*82+18,'400 38px '+cardType,50,2,'rgba(245,245,242,.75)',true);

 }
 if(layer!=='front'){
 c.fillStyle='#f5f5f2';c.font='500 32px '+cardType;c.textBaseline='middle';c.fillText(String(index+1).padStart(2,'0')+' / '+data.length,130,1368);
 c.font='500 32px '+cardType;c.textAlign='center';c.fillText('BANCI',500,1368);c.textAlign='left';
 c.strokeStyle='#fff2d7';c.lineWidth=5;c.beginPath();c.moveTo(818,1381);c.lineTo(852,1347);c.moveTo(818,1347);c.lineTo(852,1347);c.lineTo(852,1381);c.stroke();
 // Two genuinely transparent semicircular ticket notches, including fallback.
 c.save();c.globalCompositeOperation='destination-out';
 for(const x of [80,920]){c.beginPath();c.arc(x,1368,18,0,Math.PI*2);c.fill();}
 c.restore();
 }
 return surface;
}
function request(){if(!frame)frame=requestAnimationFrame(draw);}
function load(i){if(i<0||i>=data.length||cache.has(i))return;const entry={ready:false,texture:null},im=new Image();cache.set(i,entry);im.decoding='async';im.fetchPriority=i===target?'high':'low';im.onload=async()=>{await cardFonts;if(cache.get(i)!==entry)return;entry.surface=cardSurface(im,data[i],i);entry.entered=performance.now();if(gl){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,entry.surface);entry.texture=t;
 const makeLayer=layer=>{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cardSurface(im,data[i],i,layer));return texture;};
 gl.deleteTexture(t);entry.texture=makeLayer('front');entry.backTexture=makeLayer('back');}entry.ready=true;if(i===target){entryStarted=performance.now();performance.mark("film-texture-ready");setLoading('ready');if(!gl){fallback.src=entry.surface.toDataURL();fallback.hidden=false;}}request();};im.onerror=()=>{entry.failed=true;if(i===target){setLoading('error',document.documentElement.lang.startsWith('en')?'Image unavailable. Try another artwork.':'图片暂未加载，请切换作品');}};im.src=data[i].src;}
// Include the full viewport, tilted edges and the maximum elastic displacement.
function visibleRange(center,padding=0){
 const size=frameSize(),reach=(width/2+size.w*1.9)/(size.w+size.gap);
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
// Retract the ticket fully, then push it out with a small, bounded elastic return.
// The positive overshoot stays inside the texture's existing 40-pixel bottom margin.
function ticketOffset(age,w){
 const t=Math.max(0,Math.min(1,(age-180)/740));
 return -w*.25*Math.pow(1-t,3)+w*.022*Math.sin(Math.PI*t)*t;
}
function go(i,automatic=false){if(navigating)return;if(!automatic)manualUntil=performance.now()+8000;const next=Math.max(0,Math.min(data.length-1,i));if(next===target)return;entryDirection=-1;entryStarted=performance.now();previousTarget=target;target=next;if(cache.has(target))cache.get(target).entered=performance.now();if(reduce.matches){current=target;velocity=0;}update();request();}
function draw(time){frame=0;const dt=Math.min(2,(time-last)/16.667||1);last=time;if(reduce.matches){current=target;velocity=0;}else if(drag?.locked){velocity=0;}else{velocity+=(target-current)*.072*dt;velocity*=Math.pow(.72,dt);current+=velocity*dt;if(Math.abs(target-current)<.0005&&Math.abs(velocity)<.0005){current=target;velocity=0;}}
// A damped spring lets the trailing half catch up and restores normal pixel sampling.
const entryAge=time-entryStarted;
// Lead in, hold the full pixel extension, then let the trailing half catch up.
let entryEnvelope=entryAge<90?Math.max(0,entryAge/90):entryAge<190?1:entryAge<560?1-(entryAge-190)/370:0;
entryEnvelope=entryEnvelope*entryEnvelope*(3.-2.*entryEnvelope);
const wantedPull=reduce.matches?0:Math.max(-1.05,Math.min(1.05,drag?.locked?-Math.abs(drag.dx||0)*1.25/frameSize().w:entryAge<560?entryDirection*.98*entryEnvelope:-Math.abs(velocity)*4.2));
if(reduce.matches){pixelPull=0;pixelSpeed=0;}else{pixelSpeed+=(wantedPull-pixelPull)*.14*dt;pixelSpeed*=Math.pow(.64,dt);pixelPull=Math.max(-1.,Math.min(0,pixelPull+pixelSpeed*dt));if(pixelPull===0&&pixelSpeed>0)pixelSpeed=0;if(Math.abs(wantedPull-pixelPull)<.0005&&Math.abs(pixelSpeed)<.0005){pixelPull=wantedPull;pixelSpeed=0;}}
preload();
const enteringIndex=drag?.locked?Math.max(0,Math.min(data.length-1,Math.round(drag.start)+(drag.dx<0?1:-1))):target;
const departingIndex=drag?.locked?target:previousTarget;
// Hold the same stack throughout the transition: entering, departing, background.
const layerRank=i=>i===enteringIndex?2:i===departingIndex?1:0;
if(gl){gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.uniform1f(locations.mistTime,time*.001);gl.uniform2f(locations.viewport,width,height+240);const range=visibleRange(current),indices=Array.from({length:Math.max(0,range.last-range.first+1)},(_,n)=>range.first+n).sort((a,b)=>layerRank(a)-layerRank(b)||Math.abs(b-enteringIndex)-Math.abs(a-enteringIndex)||a-b);for(const i of indices){const e=cache.get(i);if(!e?.ready||!e.texture)continue;const distance=i-current,ratio=data[i].width/data[i].height;const size=frameSize(),depth=1-Math.min(1,Math.abs(distance))*.035,h=size.h*depth,w=size.w*depth;const cx=width/2+distance*(size.w+size.gap);const tilt=reduce.matches?0:Math.max(-1,Math.min(1,distance))*.0872665;const drop=((Math.sqrt(Math.sin(tilt)*Math.sin(tilt)+.0025)-.05)*w+(Math.cos(tilt)-1)*h)/2;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,e.texture);const cardPull=i===enteringIndex?pixelPull:0;gl.uniform4f(locations.rect,cx,height/2+120+drop,w,h);gl.uniform2f(locations.planeSize,w,h);gl.uniform2f(locations.uvScale,1,1);gl.uniform1f(locations.bend,cardPull*w);gl.uniform1f(locations.strain,cardPull);gl.uniform1f(locations.tilt,tilt);gl.uniform1f(locations.opacity,1);gl.uniform1f(locations.mistStrength,reduce.matches?0:i===target?1:.65);gl.uniform1f(locations.mistPhase,i*2.71);const age=Math.max(0,time-e.entered),slide=reduce.matches||i!==target?0:ticketOffset(age,w);
 // Keep original colors opaque; depth comes from scale and tilt, not a pale backdrop blend.
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,e.backTexture);
 gl.uniform1f(locations.slide,slide/h);gl.drawArrays(gl.TRIANGLES,0,count);
 gl.activeTexture(gl.TEXTURE0);}}
if(!reduce.matches&&cache.get(target)?.ready&&time-cache.get(target).entered<1500)request();
if(!reduce.matches&&entryAge<560||Math.abs(wantedPull-pixelPull)>.0005||Math.abs(pixelSpeed)>.0005||!drag?.locked&&(current!==target||Math.abs(velocity)>.0005))request();scheduleMist();}
// Ambient flow needs only 20 fps; direct manipulation keeps the existing RAF cadence.
function scheduleMist(){
 if(gl&&!mistTimer&&heroVisible&&!document.hidden&&!reduce.matches&&!navigating&&cache.get(target)?.ready){
  mistTimer=setTimeout(()=>{mistTimer=0;request();},50);
 }
}
document.addEventListener('visibilitychange',()=>{
 if(mistTimer){clearTimeout(mistTimer);mistTimer=0;}
 if(!document.hidden&&heroVisible)request();
});
let resizeFrame=0;
function resize(){
 if(resizeFrame)return;
 resizeFrame=requestAnimationFrame(time=>{
  resizeFrame=0;
  const nextWidth=Math.max(1,stage.clientWidth),nextHeight=Math.max(1,stage.clientHeight),dpr=Math.min(devicePixelRatio||1,2);
  const pixelWidth=Math.round(nextWidth*dpr),pixelHeight=Math.round((nextHeight+240)*dpr);
  if(nextWidth===width&&nextHeight===height&&canvas.width===pixelWidth&&canvas.height===pixelHeight)return;
  width=nextWidth;height=nextHeight;
  // Setting either attribute clears WebGL: change only when needed and redraw now.
  if(canvas.width!==pixelWidth)canvas.width=pixelWidth;
  if(canvas.height!==pixelHeight)canvas.height=pixelHeight;
  const frameWidth=frameSize().w+'px',main=stage.closest('.film-main');
  if(main.style.getPropertyValue('--film-frame-width')!==frameWidth)main.style.setProperty('--film-frame-width',frameWidth);
  if(frame){cancelAnimationFrame(frame);frame=0;}
  draw(time);
 });
}
try{setup();}catch(error){gl=null;canvas.hidden=true;setLoading('loading');console.warn(error);}
// Pair this small mutable manifest with its renderer; never reuse an old neutral palette.
const filmDataVersion=new URL(document.currentScript?.src||'/home-film-preview/film.js',location.href).searchParams.get('v')||'fog-palette-r2-20261022';
fetch('/home-film-preview/data.json?v='+encodeURIComponent(filmDataVersion),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('作品列表无法加载');return r.json();}).then(items=>{data=items;const ticks=document.querySelector('.film-ticks');items.forEach((d,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`${String(i+1).padStart(2,'0')} ${d.title}`);b.addEventListener('click',()=>go(i));ticks.append(b);});update();resize();}).catch(e=>{setLoading('error',document.documentElement.lang.startsWith('en')?'Unable to load artworks. Please refresh.':'作品暂时无法加载，请刷新重试');});

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
new IntersectionObserver(entries=>{heroVisible=entries[0].intersectionRatio>.55;if(heroVisible)request();else if(mistTimer){clearTimeout(mistTimer);mistTimer=0;}},{threshold:[0,.55,1]}).observe(stage.closest('.film-main'));
stage.addEventListener('wheel',e=>{if(!data.length||(!e.shiftKey&&Math.abs(e.deltaY)>=Math.abs(e.deltaX)))return;const delta=e.shiftKey?e.deltaY:e.deltaX;const now=performance.now();if((target===0&&delta<0)||(target===data.length-1&&delta>0))return;e.preventDefault();if(now-wheelStamp<550)return;wheelSum+=delta*(e.deltaMode===1?16:1);if(Math.abs(wheelSum)>45){go(target+Math.sign(wheelSum));wheelSum=0;wheelStamp=now;}},{passive:false});
stage.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag={x:e.clientX,y:e.clientY,start:current,dx:0,locked:false};stage.setPointerCapture(e.pointerId);});
stage.addEventListener('pointermove',e=>{if(!drag||!data.length)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(!drag.locked&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy))drag.locked=true;if(!drag.locked)return;drag.dx=dx;const size=frameSize();const next=drag.start-dx/(size.w+size.gap)*.85;current=Math.max(-.3,Math.min(data.length-1+.3,next));request();});
stage.addEventListener('pointerup',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag=null;request();if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*.8){go(target-Math.sign(dx));suppressClick=performance.now()+400;}else if(Math.max(Math.abs(dx),Math.abs(dy))<16&&performance.now()>suppressClick&&data[target]){const x=e.clientX-stage.getBoundingClientRect().left,size=frameSize();if(x<(width-size.w)/2-size.gap/2)go(target-1);else if(x>(width+size.w)/2+size.gap/2)go(target+1);else openProject();}});stage.addEventListener('pointercancel',()=>{drag=null;request();});
stage.addEventListener('keydown',e=>{if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','Home','End','Enter'].includes(e.key)){e.preventDefault();if(e.key==='Enter'){if(data[target])openProject();}else if(e.key==='Home')go(0);else if(e.key==='End')go(data.length-1);else go(target+(['ArrowDown','ArrowRight'].includes(e.key)?1:-1));}});
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>go(target+Number(b.dataset.dir))));reduce.addEventListener('change',()=>request());
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback.src=cache.get(target)?.surface?.toDataURL()||data[target]?.src||'';fallback.hidden=false;canvas.hidden=true;});
})();
