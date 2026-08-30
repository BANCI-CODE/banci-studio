"use client";

import { useEffect, useState } from "react";

const projects = [
  { no:"01", name:"AIRSEEKERS", theme:"TRUST", role:"Brand System · Smart Robotics", title:"Building trust for a new intelligent hardware brand.", zh:"从零建立智能硬件品牌与产品表达体系，并推动其进入真实市场。", image:"/work/airseekers.png", href:"/projects/airseekers.html" },
  { no:"02", name:"MOVA", theme:"INTELLIGENCE", role:"Product Experience · AI Interaction", title:"Making a small screen a natural service entrance.", zh:"从用户场景、PRD与交互逻辑出发，探索下一代智能硬件体验。", image:"/work/mova.png", href:"/projects/mova.html" },
  { no:"03", name:"FANTAWILD", theme:"SYSTEM", role:"Content Strategy · Workflow", title:"Turning visual storytelling into a repeatable system.", zh:"从内容创作走向设计系统，建立可持续生产的数字叙事方法。", image:"/work/fantawild.png", href:"/projects/fantawild.html" },
  { no:"04", name:"AI WORKFLOW", theme:"POSSIBILITY", role:"Human × AI · Creative Process", title:"AI expands possibility. Designers decide what matters.", zh:"探索人工智能如何改变设计流程，以及设计师如何建立新的创造系统。", image:"/work/ai-workflow.png", href:"/projects/interface.html" },
  { no:"05", name:"AKU DAYS 365", theme:"PERSISTENCE", role:"Personal Project · Visual Research", title:"A long-term experiment in visual thinking.", zh:"通过持续观察与创作，把抽象思考转化为简单、真实的视觉体验。", image:"/work/aku.png", href:"/projects/aku.html" },
];

export default function Home() {
  const [active, setActive] = useState(0);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-project]")];
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.project));
    }), { threshold:.55 });
    sections.forEach(section => observer.observe(section));
    const onMove = (event:PointerEvent) => {
      document.documentElement.style.setProperty("--mx",`${event.clientX}px`);
      document.documentElement.style.setProperty("--my",`${event.clientY}px`);
      document.documentElement.style.setProperty("--px",`${(event.clientX/innerWidth-.5)*16}px`);
      document.documentElement.style.setProperty("--py",`${(event.clientY/innerHeight-.5)*16}px`);
    };
    addEventListener("pointermove",onMove);
    return () => { observer.disconnect(); removeEventListener("pointermove",onMove); };
  },[]);

  return <main>
    <header className="topbar">
      <a className="brand" href="#intro" aria-label="BANCI 首页"><img src="/banci.svg" alt=""/><b>BANCI!</b></a>
      <nav aria-label="主导航"><a href="#work">WORK</a><a href="#about">ABOUT</a><a href="https://qizhuayu.typlog.io/" target="_blank" rel="noreferrer">JOURNAL</a></nav>
      <button className="menu-button" onClick={()=>setMenu(!menu)}>{menu?"CLOSE":"MENU"}</button>
    </header>
    <div className={`menu-panel ${menu?"is-open":""}`}>
      {projects.map(project=><a key={project.name} href={project.href}><span>{project.no}</span>{project.name}</a>)}
      <a href="#about" onClick={()=>setMenu(false)}><span>06</span>ABOUT / CONTACT</a>
    </div>

    <section className="intro" id="intro">
      <div className="intro-image"><img src="/banci-glass.png" alt="BANCI 透明玻璃个人标志"/></div>
      <div className="intro-copy"><p>ZHANG SHIWEI · SHENZHEN</p><h1>BRAND<br/>PRODUCT<br/><em>&amp; AI</em></h1></div>
      <p className="statement">I design systems connecting brand,<br/>product and intelligent experience.</p>
      <a className="scroll-cue" href="#work">SCROLL TO EXPLORE <i>↓</i></a>
      <div className="glass-orbit" aria-hidden="true"/>
    </section>

    <section className="chapter-intro" id="work">
      <span>SELECTED WORKS / 2026</span>
      <h2>Five projects.<br/>Five clear decisions.</h2>
      <p>商业案例证明解决问题的能力，<br/>个人研究呈现持续创造的方式。</p>
    </section>

    <aside className="project-rail" aria-label="项目进度">
      <span>{projects[active].theme}</span>
      <div>{projects.map((project,index)=><a className={active===index?"active":""} key={project.no} href={`#project-${project.no}`} aria-label={project.name}>{project.no}</a>)}</div>
      <b>{String(active+1).padStart(2,"0")} / 05</b>
    </aside>

    <div className="projects">{projects.map((project,index)=>
      <section className="project" id={`project-${project.no}`} data-project={index} key={project.name}>
        <div className="project-media"><img src={project.image} alt={`${project.name} 项目主视觉`}/><div className="shade"/></div>
        <div className="project-meta"><span>{project.no} / 05</span><span>{project.role}</span></div>
        <div className="project-copy"><p>{project.theme}</p><h2>{project.name}</h2><h3>{project.title}</h3>
          <div className="project-bottom"><p>{project.zh}</p><a href={project.href}>VIEW PROJECT <i>↗</i></a></div>
        </div>
      </section>)}
    </div>

    <section className="about" id="about">
      <div className="about-label">ABOUT / 06</div>
      <h2>From visual execution<br/>to product definition.</h2>
      <div className="about-grid">
        <p>我的设计经历从内容视觉开始，逐渐扩展到品牌体系、产品体验和智能硬件。我擅长把复杂的信息、技术和商业目标，转化为用户能够理解的体验。</p>
        <p>I build design systems from zero to one and connect product, technology, marketing and design teams to deliver meaningful outcomes.</p>
      </div>
      <div className="capabilities"><span>BRAND STRATEGY</span><span>PRODUCT EXPERIENCE</span><span>AI INTERACTION</span><span>DESIGN LEADERSHIP</span></div>
    </section>
    <section className="contact">
      <p>HAVE A PROJECT THAT DESERVES CARE?</p>
      <h2>Let&apos;s make<br/>what comes next.</h2>
      <div><a href="/BANCI-Portfolio.pdf" target="_blank">PORTFOLIO PDF ↗</a><a href="https://qizhuayu.typlog.io/" target="_blank" rel="noreferrer">JOURNAL ↗</a></div>
    </section>
    <footer><span>BANCI! · FROM IDEA TO IMPACT.</span><span>BRAND × PRODUCT × AI</span><span>SHENZHEN · 2026</span></footer>
  </main>;
}
