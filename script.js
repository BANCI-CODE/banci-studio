const root=document.documentElement;
addEventListener("pointermove",e=>{
  root.style.setProperty("--mx",`${e.clientX}px`);
  root.style.setProperty("--my",`${e.clientY}px`);
  root.style.setProperty("--px",`${(e.clientX/innerWidth-.5)*16}px`);
  root.style.setProperty("--py",`${(e.clientY/innerHeight-.5)*16}px`);
});
const menuButton=document.querySelector(".menu-button");
const menu=document.querySelector(".menu-panel");
menuButton.addEventListener("click",()=>{
  const open=menu.classList.toggle("is-open");
  menuButton.textContent=open?"CLOSE":"MENU";
});
menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
  menu.classList.remove("is-open"); menuButton.textContent="MENU";
}));
const dots=[...document.querySelectorAll(".project-rail a")];
const theme=document.querySelector("#rail-theme");
const count=document.querySelector("#rail-count");
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  const index=Number(entry.target.dataset.project);
  theme.textContent=entry.target.dataset.theme;
  count.textContent=`${String(index+1).padStart(2,"0")} / 05`;
  dots.forEach((dot,i)=>dot.classList.toggle("active",i===index));
}),{threshold:.55});
document.querySelectorAll("[data-project]").forEach(section=>observer.observe(section));
