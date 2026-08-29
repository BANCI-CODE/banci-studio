const section=document.querySelector(".gallery-section");
const space=document.querySelector("#space");
let arts=[...document.querySelectorAll(".art")];
const count=document.querySelector("#gallery-count");
const switches=[...document.querySelectorAll("[data-view]")];
let grid=false;
let active=0;

function render(){
  if(grid||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const rect=section.getBoundingClientRect();
  const max=section.offsetHeight-innerHeight;
  const progress=Math.max(0,Math.min(1,-rect.top/max));
  const travel=progress*(arts.length-1);
  active=Math.max(0,Math.min(arts.length-1,Math.round(travel)));
  count.textContent=`${String(active+1).padStart(2,"0")} / ${arts.length}`;
  arts.forEach((art,index)=>{
    const d=index-travel;
    if(Math.abs(d)<10){
      const image=art.querySelector("img");
      if(!image.src&&image.dataset.src)image.src=image.dataset.src;
    }
    const row=Math.floor(index/2);
    const strand=index%2;
    const rowTravel=travel/2;
    const rowDistance=row-rowTravel;
    const angle=row*.98-rowTravel*.98+strand*Math.PI;
    const depth=(Math.cos(angle)+1)/2;
    const radius=Math.min(innerWidth*.29,430);
    const focus=Math.exp(-Math.pow(Math.abs(d)*.78,2));
    const x=Math.sin(angle)*radius*(1-focus*.82);
    const y=rowDistance*Math.min(innerHeight*.22,175);
    const z=-720+focus*980+depth*160-Math.abs(rowDistance)*32;
    const scale=.22+depth*.22+focus*.68;
    const rotate=Math.sin(angle)*11+(strand?3:-3);
    art.style.transform=`translate3d(calc(-50% + ${x}px),calc(-50% + ${y}px),${z}px) rotateZ(${rotate}deg) scale(${scale})`;
    art.style.opacity=String(.08+focus*.92);
    art.style.filter=`blur(${(1-focus)*11}px) saturate(${.35+focus*.65}) brightness(${.48+focus*.52})`;
    art.style.zIndex=String(Math.round(focus*1000+depth*100));
    art.style.pointerEvents=focus>.34?"auto":"none";
  });
}
addEventListener("scroll",render,{passive:true});
addEventListener("resize",render);
addEventListener("pointermove",event=>{
  const x=(event.clientX/innerWidth-.5)*30;
  const y=(event.clientY/innerHeight-.5)*30;
  document.documentElement.style.setProperty("--mx",x);
  document.documentElement.style.setProperty("--my",y);
});
switches.forEach(button=>button.addEventListener("click",()=>{
  grid=button.dataset.view==="grid";
  section.classList.toggle("grid-mode",grid);
  section.classList.toggle("spiral-mode",!grid);
  switches.forEach(item=>item.classList.toggle("active",item===button));
  if(grid)arts.forEach(art=>{
    const image=art.querySelector("img");
    if(!image.src&&image.dataset.src)image.src=image.dataset.src;
  });
  if(!grid)requestAnimationFrame(render);
}));
const lightbox=document.querySelector(".lightbox");
const lightImage=lightbox.querySelector("img");
const lightTitle=lightbox.querySelector("span");
const lightCount=lightbox.querySelector("b");
function bindSpiralArt(art,index){
  art.addEventListener("click",()=>{
  lightImage.src=art.querySelector("img").src;
  lightImage.alt=art.querySelector("img").alt;
  lightTitle.textContent=art.dataset.title;
  lightCount.textContent=`${String(index+1).padStart(3,"0")} / ${arts.length}`;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden","false");
  });
}
arts.forEach(bindSpiralArt);
function closeLightbox(){lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true")}
document.querySelector(".lightbox-close").addEventListener("click",closeLightbox);
lightbox.addEventListener("click",event=>{if(event.target===lightbox)closeLightbox()});
addEventListener("keydown",event=>{if(event.key==="Escape")closeLightbox()});
render();

fetch("/aku-spiral.json").then(response=>response.json()).then(data=>{
  space.innerHTML="";
  arts=data.items.map((item,index)=>{
    const button=document.createElement("button");
    button.className=`art dynamic ${item.ratio>.12&&item.ratio<.75?"portrait":item.ratio>1.2?"landscape":"square"}`;
    button.dataset.title=`${item.title} / ${item.category}`;
    button.style.aspectRatio=String(item.ratio);
    button.innerHTML=`<img data-src="${item.src}" alt="AKU ${item.title}" width="${item.width}" height="${item.height}" decoding="async">`;
    bindSpiralArt(button,index);
    space.append(button);
    return button;
  });
  section.style.height=`${Math.max(760,arts.length*34)}vh`;
  document.querySelector(".gallery-head span").textContent=`AKU COMPLETE SPIRAL / ${data.count} WORKS`;
  count.textContent=`001 / ${data.count}`;
  requestAnimationFrame(render);
});

const archiveGrid=document.querySelector("#archive-grid");
const archiveResult=document.querySelector("#archive-result");
const loadMore=document.querySelector("#load-more");
const daySearch=document.querySelector("#day-search");
const rangeButtons=[...document.querySelectorAll("[data-range]")];
let archiveItems=[];
let filteredItems=[];
let visibleCount=40;

function openArchiveItem(item,index){
  lightImage.src=item.src;
  lightImage.alt=`AKU Day ${item.day} ${item.title}`;
  lightTitle.textContent=`DAY ${String(item.day).padStart(3,"0")} / ${item.title}`;
  lightCount.textContent=`${String(index+1).padStart(3,"0")} / ${filteredItems.length}`;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden","false");
}

function renderArchive(){
  archiveGrid.innerHTML="";
  filteredItems.slice(0,visibleCount).forEach((item,index)=>{
    const figure=document.createElement("figure");
    figure.className="archive-item";
    const image=document.createElement("img");
    image.src=item.src;
    image.alt=`AKU Day ${item.day} ${item.title}`;
    image.loading="lazy";
    image.decoding="async";
    image.width=item.width;
    image.height=item.height;
    const caption=document.createElement("figcaption");
    caption.innerHTML=`<span>DAY ${String(item.day).padStart(3,"0")}</span><span>W${String(item.week).padStart(2,"0")}</span>`;
    figure.append(image,caption);
    figure.addEventListener("click",()=>openArchiveItem(item,index));
    archiveGrid.append(figure);
  });
  archiveResult.textContent=`${filteredItems.length} WORKS`;
  loadMore.hidden=visibleCount>=filteredItems.length;
}

function filterArchive(range="all"){
  const query=Number(daySearch.value);
  filteredItems=archiveItems.filter(item=>{
    if(query&&item.day!==query)return false;
    if(range==="all")return true;
    const [start,end]=range.split("-").map(Number);
    return item.week>=start&&item.week<=end;
  });
  visibleCount=40;
  renderArchive();
}

fetch("/aku-archive.json").then(response=>response.json()).then(data=>{
  archiveItems=data.items;
  filteredItems=archiveItems;
  renderArchive();
});
loadMore.addEventListener("click",()=>{visibleCount+=40;renderArchive()});
rangeButtons.forEach(button=>button.addEventListener("click",()=>{
  rangeButtons.forEach(item=>item.classList.toggle("active",item===button));
  filterArchive(button.dataset.range);
}));
daySearch.addEventListener("input",()=>{
  const activeRange=document.querySelector("[data-range].active").dataset.range;
  filterArchive(activeRange);
});

/* Extended AKU experiences */
fetch("/aku-experience.json").then(response=>response.json()).then(data=>{
  buildTypeLab(data.type);
  buildPinWall(data.pins);
  buildMonthBook(data.months);
  buildTearCalendar(data.tear);
});

function buildTypeLab(items){
  const track=document.querySelector("#type-track");
  const controls=document.createElement("div");
  controls.className="type-controls";
  controls.innerHTML=`<p class="type-position"><strong id="type-current">01</strong> <span>/ ${String(items.length).padStart(2,"0")}</span></p><div><button type="button" class="type-prev" aria-label="Previous typography poster">←</button><button type="button" class="type-next" aria-label="Next typography poster">→</button></div>`;
  track.after(controls);
  items.forEach((item,index)=>{
    const figure=document.createElement("figure");
    figure.className="type-card";
    figure.innerHTML=`<img loading="lazy" decoding="async" src="${item.src}" width="${item.width}" height="${item.height}" alt="AKU typography ${item.title}"><figcaption><span>${String(index+1).padStart(2,"0")}</span><span>${item.title}</span></figcaption>`;
    figure.addEventListener("click",()=>openExperienceLightbox(item,`${String(index+1).padStart(2,"0")} / ${items.length}`));
    track.append(figure);
  });
  const cards=[...track.querySelectorAll(".type-card")];
  const current=controls.querySelector("#type-current");
  let activeIndex=0;
  const updateFocus=()=>{
    const center=track.scrollLeft+track.clientWidth/2;
    let closest=Infinity;
    cards.forEach((card,index)=>{
      const distance=Math.abs(card.offsetLeft+card.offsetWidth/2-center);
      if(distance<closest){closest=distance;activeIndex=index}
    });
    cards.forEach((card,index)=>card.classList.toggle("is-focus",index===activeIndex));
    current.textContent=String(activeIndex+1).padStart(2,"0");
  };
  const goTo=index=>cards[(index+cards.length)%cards.length].scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
  controls.querySelector(".type-prev").addEventListener("click",()=>goTo(activeIndex-1));
  controls.querySelector(".type-next").addEventListener("click",()=>goTo(activeIndex+1));
  let raf=0;track.addEventListener("scroll",()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(updateFocus)},{passive:true});
  let down=false,startX=0,startScroll=0;
  track.addEventListener("pointerdown",event=>{down=true;startX=event.clientX;startScroll=track.scrollLeft;track.classList.add("dragging");track.setPointerCapture(event.pointerId)});
  track.addEventListener("pointermove",event=>{if(down)track.scrollLeft=startScroll-(event.clientX-startX)});
  track.addEventListener("pointerup",()=>{down=false;track.classList.remove("dragging");goTo(activeIndex)});
  track.addEventListener("pointercancel",()=>{down=false;track.classList.remove("dragging")});
  requestAnimationFrame(updateFocus);
}

function buildPinWall(items){
  const stage=document.querySelector("#pin-stage");
  items.forEach((item,index)=>{
    const button=document.createElement("button");
    button.className="pin";
    const column=index%7;
    const row=Math.floor(index/7);
    button.style.left=`${7+column*14.2+(row%2?4:-2)}%`;
    button.style.top=`${7+row*12.5+(column%3)*2.5}%`;
    button.style.setProperty("--r",`${((index*17)%25)-12}deg`);
    button.innerHTML=`<img loading="lazy" decoding="async" src="${item.src}" width="${item.width}" height="${item.height}" alt="AKU pin ${item.title}">`;
    button.addEventListener("click",()=>openExperienceLightbox(item,`${String(index+1).padStart(2,"0")} / ${items.length}`));
    stage.append(button);
  });
}

function openExperienceLightbox(item,position){
  lightImage.src=item.src;
  lightImage.alt=item.title;
  lightTitle.textContent=item.title;
  lightCount.textContent=position;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden","false");
}

function buildMonthBook(items){
  const stack=document.querySelector("#month-stack");
  const number=document.querySelector("#month-number");
  const title=document.querySelector("#month-title");
  let current=0;
  const pages=items.map((item,index)=>{
    const page=document.createElement("div");
    page.className="month-page";
    page.innerHTML=`<img loading="lazy" decoding="async" src="${item.src}" width="${item.width}" height="${item.height}" alt="AKU 2025 month ${item.month}">`;
    stack.append(page);
    page.style.setProperty("--page-depth",String(index));
    return page;
  });
  if(items[0])stack.style.setProperty("--month-ratio",String(items[0].width/items[0].height));
  function show(next){
    const target=(next+pages.length)%pages.length;
    if(target!==current&&pages[current]){
      const outgoing=pages[current];
      outgoing.classList.add("turning");
      setTimeout(()=>outgoing.classList.remove("turning"),520);
    }
    current=target;
    pages.forEach((page,index)=>{
      page.classList.toggle("active",index===current);
      page.classList.toggle("before",index<current);
      page.classList.toggle("after",index>current);
      page.style.zIndex=String(pages.length-index);
    });
    number.textContent=String(items[current].month).padStart(2,"0");
    title.textContent=`${new Date(2025,items[current].month-1).toLocaleString("en",{month:"long"}).toUpperCase()} / 2025`;
  }
  document.querySelector(".month-arrow.prev").addEventListener("click",()=>show(current-1));
  document.querySelector(".month-arrow.next").addEventListener("click",()=>show(current+1));
  stack.addEventListener("click",()=>show(current+1));
  show(0);
}

function buildTearCalendar(items){
  const pad=document.querySelector("#tear-pad");
  const progress=document.querySelector("#tear-progress");
  let current=0;
  let sheets=[];
  function updateProgress(){
    progress.textContent=`${String(Math.min(current+1,items.length)).padStart(3,"0")} / ${items.length}`;
  }
  function renderStack(){
    pad.innerHTML="";
    sheets=[];
    items.slice(current,current+7).reverse().forEach((item,reverseIndex)=>{
      const layer=6-reverseIndex;
      const sheet=document.createElement("button");
      sheet.className="tear-sheet";
      sheet.style.setProperty("--layer",String(layer));
      sheet.innerHTML=`<img draggable="false" src="${item.src}" width="${item.width}" height="${item.height}" alt="AKU tear-off day ${item.day}">`;
      pad.append(sheet);
      sheets.unshift(sheet);
    });
    if(sheets[0])enableTear(sheets[0]);
    updateProgress();
  }
  function enableTear(sheet){
    let startX=0,startY=0,dx=0,dy=0,dragging=false;
    sheet.addEventListener("pointerdown",event=>{
      dragging=true;startX=event.clientX;startY=event.clientY;
      sheet.setPointerCapture(event.pointerId);sheet.classList.add("dragging");
      const rect=sheet.getBoundingClientRect();
      sheet.style.setProperty("--grab-x",`${((event.clientX-rect.left)/rect.width)*100}%`);
      sheet.style.setProperty("--grab-y",`${((event.clientY-rect.top)/rect.height)*100}%`);
    });
    sheet.addEventListener("pointermove",event=>{
      if(!dragging)return;
      dx=event.clientX-startX;dy=event.clientY-startY;
      const distance=Math.hypot(dx,dy);
      const peel=Math.min(1,distance/150);
      const rotate=dx*.075;
      sheet.style.setProperty("--peel",String(peel));
      sheet.style.setProperty("--curl-angle",`${Math.atan2(dy,dx)*180/Math.PI}deg`);
      sheet.style.transform=`translate3d(${dx*.82}px,${dy*.82}px,${40+peel*130}px) rotateZ(${rotate}deg) rotateX(${-peel*26}deg) skewX(${dx*.008}deg)`;
    });
    function release(){
      if(!dragging)return;dragging=false;sheet.classList.remove("dragging");
      if(Math.hypot(dx,dy)>85){
        sheet.classList.add("fly");
        sheet.style.transform=`translate3d(${dx*4}px,${dy*4}px,220px) rotateZ(${dx*.18}deg) rotateX(28deg)`;
        setTimeout(()=>{current=(current+1)%items.length;renderStack()},560);
      }else{
        sheet.style.transform="";
        sheet.style.setProperty("--peel","0");
      }
      dx=dy=0;
    }
    sheet.addEventListener("pointerup",release);
    sheet.addEventListener("pointercancel",release);
  }
  document.querySelector("#tear-reset").addEventListener("click",()=>{current=0;renderStack()});
  renderStack();
}

/* Keep glass navigation legible over both light and dark sections. */
const glassBars=[document.querySelector(".aku-nav"),document.querySelector(".aku-dock")].filter(Boolean);
function updateGlassContrast(){
  const sample=document.elementFromPoint(Math.round(innerWidth*.5),Math.min(84,innerHeight-1));
  let node=sample;
  let color=null;
  while(node&&node!==document.documentElement){
    const value=getComputedStyle(node).backgroundColor;
    const match=value.match(/rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\)/);
    if(match&&Number(match[4]??1)>.45){color=match.slice(1,4).map(Number);break}
    node=node.parentElement;
  }
  const luminance=color?(.2126*color[0]+.7152*color[1]+.0722*color[2]):0;
  glassBars.forEach(bar=>bar.classList.toggle("on-light",luminance>145));
}
addEventListener("scroll",updateGlassContrast,{passive:true});
addEventListener("resize",updateGlassContrast);
updateGlassContrast();
