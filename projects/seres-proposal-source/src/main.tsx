import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import research from './research.json';
import allReferences from './all-references.json';

const chapters = [ ['cover','Cover','项目封面'], ['understanding','Project Understanding','产品与传播策略'], ['pillars','Three Creative Pillars','三大视觉方向'], ['language','Visual Language','视觉语言规范'], ['application','Campaign Application','传播应用'], ['conclusion','Creative Conclusion','创意总结'] ];
const assets = {
  cover: ['research/all/01-01.webp','用户提供的人形机器人视觉参考，非赛力斯机器狗产品'],
  fashion: ['research/02-06.jpg','人物与金属机器人同框的时尚影像参考，非赛力斯产品'],
  avant: ['research/03-01.webp','白色概念装置的陌生化形态与空间关系参考，非赛力斯产品'],
  quality: ['research/04-08.jpg','金属部件拆解与细节光影参考，非赛力斯产品结构'],
  life: ['living-space.svg','生活空间光影构图意向'],
} as const;
function Visual({asset, className='', label=true}: {asset:keyof typeof assets;className?:string;label?:boolean}) {
 const [failed,setFailed] = useState(false);
 return <figure className={`visual ${asset !== 'life' ? 'research-visual' : ''} ${className}`}>
  {!failed ? <img src={`${import.meta.env.BASE_URL}references/${assets[asset][0]}`} alt={assets[asset][1]} loading={asset==='cover'?'eager':'lazy'} onError={()=>setFailed(true)}/> : <div className="image-fallback"><span>IMAGE STUDY</span><p>视觉资料待补充</p></div>}
  {(label || asset !== 'life') && <figcaption><span>VISUAL STUDY / {asset.toUpperCase()}</span><span>{asset === 'life' ? '空间意向 · 非产品实拍' : '第三方视觉参考 · 非赛力斯产品'}</span></figcaption>}
 </figure>;
}
function ReferenceBoard({group,title}: {group:string;title:string}) {
 return <div className="reference-board reveal"><div className="reference-board-heading"><h4>{title}</h4><span className="eyebrow">CURATED REFERENCES / 参考研究</span></div><div className="reference-grid">{research.filter(item=>item.group===group).map(item=><figure key={item.id}><a href={`${import.meta.env.BASE_URL}references/research/${item.file}`} target="_blank" rel="noreferrer" aria-label={`查看原图：${item.title}`}><img src={`${import.meta.env.BASE_URL}references/research/${item.file}`} alt={item.title+'，第三方参考，非赛力斯产品'} loading="lazy" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=`${import.meta.env.BASE_URL}references/cover-space.svg`}}/><span className="reference-open">查看原图 ↗</span></a><figcaption><span>{item.id} / {item.title}</span><p>{item.note}</p></figcaption></figure>)}</div><p className="footnote">用户提供的第三方参考素材，仅用于讨论视觉方向；图中品牌、人物、设计及产品不属于本提案的原创资产，不代表赛力斯产品。</p></div>
}
function FullImageArchive(){return <div className="full-image-archive reveal"><div className="reference-board-heading"><h4>Complete Visual Research / 全部 70 张素材</h4><span className="eyebrow">06 GROUPS / 原始素材完整陈列</span></div><p className="archive-intro">以下按原始目录陈列全部图片，包含一张重复文件。主视觉仍为经过策划的方向示意；这些图像只用于内部创意研究，不代表赛力斯产品或本提案原创作品。</p>{['封面','时尚感','先锋感','品质感','机器狗品类研究','视觉系统'].map((group,index)=><section className="archive-group" key={group}><h5>{group}<span>{allReferences.filter(x=>x.id.startsWith(String(index+1).padStart(2,'0')+'-')).length} IMAGES</span></h5><div className="archive-image-grid">{allReferences.filter(x=>x.id.startsWith(String(index+1).padStart(2,'0')+'-')).map(item=><a href={`${import.meta.env.BASE_URL}references/research/all/${item.file}`} target="_blank" rel="noreferrer" key={item.id} aria-label={`查看${group}原图 ${item.id}`}><img src={`${import.meta.env.BASE_URL}references/research/all/${item.file}`} alt={`${group}视觉研究 ${item.id}，第三方参考，非赛力斯产品`} loading="lazy"/><span>{item.id} / {item.source}</span></a>)}</div></section>)}</div>}
function SectionHead({n,en,cn}: {n:string;en:string;cn:string}) { return <div className="section-head"><span className="eyebrow">CHAPTER {n} / 06</span><div><h2>{en}</h2><p>{cn}</p></div><span className="head-mark" aria-hidden="true">↗</span></div>; }
function App(){
 const [active,setActive]=useState('cover'); const [menu,setMenu]=useState(false);
 useEffect(()=>{
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)setActive(entry.target.id)}),{rootMargin:'-15% 0px -60% 0px'});
  document.querySelectorAll('main > section').forEach(el=>observer.observe(el));
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target)}}),{threshold:0.08});
  document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('will-reveal');reveal.observe(el)});
  const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setMenu(false);document.querySelector<HTMLButtonElement>('.menu-toggle')?.focus()}};
  window.addEventListener('keydown',close);
  return()=>{observer.disconnect();reveal.disconnect();window.removeEventListener('keydown',close)};
 },[]);
 return <>
  <a className="skip-link" href="#main">跳至提案内容</a>
  <header className="topbar"><a className="wordmark" href="#cover" aria-label="赛力斯提案首页">SERES<span>赛力斯 / 视觉创意提案</span></a><span className="top-edition">CONSUMER ROBOTICS — LAUNCH DIRECTION</span><button onClick={()=>window.print()} className="print-button">打印提案 <span aria-hidden="true">↗</span></button><button className="menu-toggle" aria-expanded={menu} aria-controls="chapter-nav" onClick={()=>setMenu(!menu)}>{menu?'关闭目录 −':'章节目录 +'}</button></header>
  <nav id="chapter-nav" aria-label="章节导航" className={`chapter-nav ${menu?'is-open':''}`}>{chapters.map(([id,en,cn],i)=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined} onClick={()=>setMenu(false)}><span>0{i+1}</span><span className="nav-cn">{cn}</span><span className="nav-en">{en}</span></a>)}</nav>
  <main id="main">
   <section id="cover" className="cover">
    {import.meta.env.BASE_URL !== '/' && <a className="archive-return" href="/">← BANCI / 返回私人作品档案</a>}
    <div className="cover-kicker"><span>NEW PERSPECTIVES ON EVERYDAY LIFE</span><span>CREATIVE PROPOSAL / 2026</span></div>
    <h1>BEYOND<br/><span className="second-line">THE MACHINE<span className="period">.</span></span></h1>
    <div className="cover-bottom grid"><div className="cover-intro"><span className="eyebrow">赛力斯消费级机器狗 / 新品上市</span><h2>超越机器的<br/>生活表达</h2><p>让科技进入生活的审美，<br/>让未来成为可以感知的日常。</p><a className="text-link" href="#understanding">探索视觉方向 <span aria-hidden="true">↓</span></a></div><div className="cover-art"><Visual asset="cover"/><span className="image-note">第三方封面参考 · 非赛力斯机器狗产品</span></div></div>
    <div className="cover-footer"><span>EDITORIAL FASHION × PREMIUM CONSUMER ELECTRONICS × INDUSTRIAL PRECISION</span><span>01 — 06</span></div>
   </section>
   <section id="understanding" className="section">
    <SectionHead n="02" en="A new place in life." cn="产品与传播策略理解 / Project Understanding"/>
    <div className="grid strategy-intro reveal"><span className="eyebrow side-label">THE STRATEGIC SHIFT</span><div className="strategy-main"><h3>从「它能做什么」，<br/>走向「它与我的生活<br/><em>有什么关系」。</em></h3><p>消费级机器狗的上市传播，需要建立一种新的观看方式：在理解技术之前，先看见它进入生活的可能。我们建议以审美吸引目光，以场景建立关联，再以可验证的产品事实支撑信任，让技术价值拥有更清晰的生活语境。</p></div></div>
    <div className="strategy-rows reveal">{[
     ['01','Audience','面向审美与科技意识并存的人群','将设计爱好者、科技尝鲜者与关注生活品质的用户作为创意沟通假设。通过简洁的空间、自然的人物状态和清晰的产品信息，让不同兴趣的人都能找到进入点；具体人群优先级需结合品牌调研确认。'],
     ['02','Positioning','一种面向未来的生活表达','建议将产品放入生活方式语境，而非只停留在技术展示语境。以克制、可信、有存在感的视觉，建立高端消费电子的感知；不以拟人化承诺或未经验证的能力替代产品价值。'],
     ['03','Communication','先产生向往，再建立理解','首发主视觉建立独特印象；生活方式内容解释人与空间的关系；细节内容承接真实设计与工艺。传播从感知走向证据，所有功能、性能及使用场景均以品牌确认资料为准。'],
    ].map(([n,en,title,body])=><article className="strategy-row" key={n}><span className="eyebrow">{n} / {en}</span><h4>{title}</h4><p>{body}</p></article>)}</div>
    <ReferenceBoard group="category" title="Category Context / 品类与生活关系参考"/>
    <p className="footnote">提案边界 / 本页为创意策略建议，并非已获确认的品牌定位、用户研究结论或产品能力声明。</p>
   </section>
   <section id="pillars" className="section pillars">
    <SectionHead n="03" en="Three ways to go beyond." cn="三大视觉方向 / Three Creative Pillars"/>
    <div className="pillars-lead reveal"><p>一种统一的品牌气质，<br/>三种相互补充的视觉表达。</p><span>用生活方式建立向往。<br/>用先锋建立辨识度。<br/>用品质建立信任感。</span></div>
    <article className="pillar fashion reveal"><div className="pillar-title"><span className="eyebrow">DIRECTION 01 / 时尚</span><h3>LIFESTYLE<span>让科技，进入有风格的日常。</span></h3></div><Visual asset="fashion"/><div className="pillar-copy"><span className="eyebrow">LIFE, WITH CHARACTER.</span><h4>先看见一种生活，<br/>再看见科技的角色。</h4><p>潮流生活，是有自己的审美选择，有持续参与的兴趣，也愿意把新科技带入日常。以人的生活为叙事起点：他在哪里停留，与谁交流，为什么选择这些物件。时装编辑式的画面服务于生活表达，让机器人作为生活中的一个角色自然出现。</p><dl><dt>画面关键词</dt><dd>个人兴趣 / 城市日常 / 自然关系 / 审美选择</dd><dt>执行方式</dt><dd>先确定人物、兴趣与生活场景，再安排产品的位置。以自然动作、真实空间和有个性的造型建立时尚感；现有机器人造型图仅作为人物关系与服装参考，主视觉仍需生活方式摄影。</dd><dt>适用触点</dt><dd>品牌主视觉、生活方式社媒、线下形象海报。</dd></dl></div></article>
    <div className="lifestyle-scenes reveal"><div className="lifestyle-heading"><span className="eyebrow">WHAT DOES A CONTEMPORARY LIFE LOOK LIKE?</span><h4>潮流，是把生活过成自己的样子。</h4><p>四个生活切面，从人的选择出发。以下为拍摄场景建议，产品行为与场地适用性需经确认。</p></div>{[
      ['01','CITY EXPLORATION','城市漫游','街区、建筑入口与步道。人物在城市中自然停留，画面呈现探索欲与个人节奏。','画面重点 / 环境、穿搭、自然姿态'],
      ['02','CREATIVE ROUTINES','创意日常','摄影、音乐、设计与工作室。以正在发生的兴趣活动建立人物身份，让科技进入有内容的日常。','画面重点 / 兴趣线索、使用痕迹、个人物件'],
      ['03','CURATED LIVING','设计型居住','家具、织物、灯光与真实产品共同构成空间。关注尺度与搭配，让科技和居住审美相处。','画面重点 / 空间比例、材质关系、自然光'],
      ['04','SHARED INTERESTS','兴趣社交','朋友围绕共同兴趣交流。通过目光、距离与姿态呈现好奇和分享，不预设机器狗的交互能力。','画面重点 / 人际关系、交流状态、轻松氛围']
    ].map(([n,en,title,body,note])=><article key={n}><span className="eyebrow">{n} / {en}</span><h4>{title}</h4><p>{body}</p><small>{note}</small></article>)}<div className="lifestyle-image-brief"><span className="eyebrow">NEXT IMAGE BRIEF / 待补生活方式素材</span><p>下一轮选图优先寻找真实人物、真实空间和真实兴趣。现有机械人物与时装造型图作为辅助研究，不直接替代生活主视觉；未获样机资料前，保持产品留位。</p></div></div>
    <ReferenceBoard group="fashion" title="Fashion Studies / 造型与人物关系"/>
    <article className="pillar avant reveal"><div className="pillar-title"><span className="eyebrow">DIRECTION 02 / 先锋</span><h3>AVANT-GARDE<span>未来，进入当下。</span></h3></div><Visual asset="avant"/><div className="pillar-copy"><span className="eyebrow">A DIFFERENT PERSPECTIVE</span><h4>通过观看方式，<br/>建立未来感。</h4><p>先锋感来自陌生化的空间关系，而非对产品外观的想象改造。通过尺度对比、几何秩序与大胆裁切，让熟悉的日常产生新的张力，把好奇心引向真实产品。</p><dl><dt>画面关键词</dt><dd>几何空间 / 比例张力 / 单一视觉焦点</dd><dt>执行方式</dt><dd>抽象场景可作为视觉背景；产品只能使用经确认的实拍或官方模型。动效围绕画面揭示，不暗示未经验证的运动能力。</dd><dt>适用触点</dt><dd>上市预热、发布会视觉、动态海报与短片片头。</dd></dl></div></article>
    <ReferenceBoard group="avant" title="Avant-garde Studies / 形态与观看方式"/>
    <article className="pillar quality reveal"><div className="pillar-title"><span className="eyebrow">DIRECTION 03 / 品质</span><h3>PRECISION<span>细节，让信任发生。</span></h3></div><Visual asset="quality"/><div className="pillar-copy"><span className="eyebrow">CONFIDENCE IN EVERY DETAIL</span><h4>让真实的细节，<br/>承担说服力。</h4><p>以消费产品的完整体验建立品质感：整体比例是否协调，表面与接合是否清晰，产品在生活空间中是否得体，信息表达是否准确。微距与结构图只是其中一层；所有材质、工艺和结构判断都由真实样机与官方资料支撑。</p><dl><dt>画面关键词</dt><dd>整体比例 / 真实表面 / 居家适配 / 准确信息</dd><dt>执行方式</dt><dd>基于真实样机拍摄，保留表面特征与结构关系。不添加虚构接口、关节、传感器、材料或参数。</dd><dt>适用触点</dt><dd>官网详情、产品手册、零售展示与细节内容。</dd></dl></div></article>
    <ReferenceBoard group="quality" title="Precision Studies / 光影与表面观察"/>
   </section>
   <section id="language" className="section">
    <SectionHead n="04" en="A language of restraint." cn="视觉语言规范 / Visual Language"/>
    <div className="language-top grid reveal"><h3>少一些修饰。<br/>多一些<em>准确。</em></h3><p>统一的视觉秩序，让三大方向保持同一个品牌声音。以中性基底承载产品，以排版建立力度，以光影呈现真实；每个元素都服务于观看与理解。</p></div>
    <div className="swatches reveal">{[['Paper white','#F7F7F5','纸白 / 主留白'],['Gallery grey','#EEEEEC','展厅灰 / 页面底色'],['Concrete','#D4D4D0','混凝土灰 / 图像辅助'],['Graphite','#646460','石墨灰 / 次级文字'],['Ink black','#171715','墨黑 / 标题正文']].map(([name,hex,use])=><div className="swatch" key={hex}><div style={{background:hex}}/><span>{name}<b>{hex}</b></span><small>{use}</small></div>)}</div>
    <div className="language-rules reveal"><article><span className="eyebrow">01 / TYPOGRAPHY</span><h4>字体即态度。</h4><div className="type-sample">Aa<span>超越机器</span></div><p>英文标题使用紧凑的无衬线大写，中文采用清晰的无衬线字体。标题通过尺度与断行形成视觉张力，正文保持舒适行距，说明文字承担层级而非装饰。网页优先使用系统字体，正式发布字体另行确认授权。</p></article><article><span className="eyebrow">02 / COMPOSITION</span><h4>有秩序的自由。</h4><div className="grid-sample" aria-label="12列布局示意">{Array.from({length:12},(_,i)=><i key={i}/>)}</div><p>桌面以12列栅格为基础，图像采用7:5或8:4的非对称分配。保留连续的空白，让标题与图像相互呼应。移动端回归单列叙事，优先保证中文阅读与图片完整性。</p></article><article><span className="eyebrow">03 / PHOTOGRAPHY & LIGHT</span><h4>用光，接近真实。</h4><div className="light-sample"><span>SOFT LIGHT / TRUE FORM</span></div><p>人物使用自然状态与环境光，产品采用大面积柔光建立体积、局部侧光揭示细节。保持真实比例与色彩，不用过度反射掩盖结构，不以渲染光效替代材料事实。</p></article></div>
    <ReferenceBoard group="system" title="Visual System Studies / 排版与光影参考"/>
    <div className="motion-rule"><span className="eyebrow">04 / MOTION</span><h4>动效只在需要时发生。</h4><p>以轻微位移与渐显引导章节阅读；不自动轮播，不制造视觉追逐。尊重系统“减少动态效果”设置，打印时呈现全部静态内容。</p></div>
   </section>
   <section id="application" className="section application">
    <SectionHead n="05" en="One idea. Every encounter." cn="传播应用 / Campaign Application"/>
    <p className="section-description">从第一眼的吸引，到近距离的理解。让同一套视觉语言在不同触点自然展开，而不是简单复制一张主视觉。</p>
    <div className="application-grid reveal"><article className="web-application"><div className="browser-mock"><div className="mock-bar"><span>● ● ●</span><span>SERES / CONCEPT WEBSITE</span><span>↗</span></div><div className="mock-hero"><h4>BEYOND<br/>THE MACHINE.</h4><Visual asset="life" label={false}/><span>超越机器的生活表达</span></div></div><div className="application-caption"><span>01 / WEBSITE</span><h4>官网 · 从情绪到信息</h4><p>首屏建立生活方式印象，向下进入场景与真实产品细节。功能信息采用独立、清晰的模块，避免被视觉语言掩盖。</p></div></article><article className="poster-application"><div className="poster-mock"><span>SERES / VISUAL CONCEPT</span><Visual asset="avant" label={false}/><h4>FUTURE,<br/>IN THE<br/>EVERYDAY.</h4><small>未来，进入当下。 / 创意版式示意</small></div><div className="application-caption"><span>02 / POSTER</span><h4>海报 · 一个鲜明的记忆点</h4><p>以一个标题、一个焦点和足够留白建立识别。户外版本优先考虑远距离可读性，产品形象待官方资产确认后置入。</p></div></article><article className="social-application"><div className="social-set"><div><Visual asset="fashion" label={false}/><span>STYLE<br/>IN MOTION.</span></div><div><span>生活，<br/>自有风格。</span><small>BEYOND THE MACHINE.<br/>SOCIAL / EDITORIAL 01</small></div></div><div className="application-caption"><span>03 / SOCIAL</span><h4>社媒 · 可以持续展开的内容</h4><p>以「生活切片 / 空间实验 / 细节观察」形成内容系列。封面保持标题位置与编号规则，正文围绕单一主题展开，建立连续而不重复的视觉节奏。</p></div></article><article className="detail-application"><Visual asset="quality"/><div className="application-caption"><span>04 / PRODUCT DETAIL</span><h4>产品细节 · 让事实进入画面</h4><p>经确认的微距实拍与简明说明一一对应，必要时标注真实部位和工艺信息。当前展示第三方金属部件参考，仅用于研究光影与细节层次，不代表赛力斯产品的结构、材料或制造精度。</p></div></article></div>
    <p className="footnote">以上均为创意版式研究，嵌入图片为第三方参考或抽象占位，不可直接作为赛力斯正式广告发布。</p>
    <FullImageArchive/>
   </section>
   <section id="conclusion" className="section conclusion"><SectionHead n="06" en="Beyond is a way of living." cn="视觉创意总结 / Creative Conclusion"/><div className="conclusion-statement reveal"><span className="eyebrow">THE CREATIVE BELIEF</span><h3>让科技被看见，<br/>让生活<em>被感知。</em></h3><p>我们希望为赛力斯消费级机器狗建立一种清晰的视觉立场：以有风格的生活建立向往，以先锋的观看方式留下记忆，以真实、完整的品质表达赢得理解。超越机器，不是回避技术，而是让技术在生活中找到意义。</p></div><div className="closing-triad"><div><span>LIFESTYLE</span><p>它进入谁的生活？</p></div><div><span>AVANT-GARDE</span><p>它带来怎样的新感受？</p></div><div><span>PRECISION</span><p>为什么值得信任？</p></div></div><div className="next-step"><span className="eyebrow">FROM DIRECTION TO EXECUTION</span><p>下一步：确认创意主方向 → 收集官方产品与品牌资产 → 完成样机实拍与视觉测试 → 延展各触点并进行事实、版权与发布审核。</p></div><div className="closing-line">BEYOND THE MACHINE.</div><footer><span>SERES / 赛力斯消费级机器狗新品上市视觉方向提案</span><span>CREATIVE DIRECTION · 2026</span><a href="#cover">回到封面 ↑</a></footer></section>
  </main>
 </>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
