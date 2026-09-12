(() => {
  const image = document.querySelector('#mova-view');
  const caption = document.querySelector('#mova-view-caption');
  const announcement = document.querySelector('.mova-announcement');
  const views = {
    screen: ['02', 'MOVA 充电器屏幕显示端口信息的产品渲染', '端口与连接信息直接呈现在设备上，让用户的视线停留在正在使用的物件上。'],
    body: ['03', 'MOVA 白色机身、挂绳与双 USB-C 端口的产品渲染', '紧凑机身、双端口与随身挂绳，让桌面使用和携带场景连在一起。'],
    detail: ['01', 'MOVA 充电器浅蓝色半透明外壳与金属挂环的细节渲染', '半透明表面、金属挂环与编织挂绳形成不同的材质层次，建立产品的视觉识别。']
  };
  let requestId = 0;
  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', () => {
      const currentRequest = ++requestId;
      const [number, alt, text] = views[button.dataset.view];
      const next = new Image();
      image.setAttribute('aria-busy', 'true');
      next.onload = () => {
        if (currentRequest !== requestId) return;
        image.src = next.src;
        image.alt = alt;
        image.width = next.naturalWidth;
        image.height = next.naturalHeight;
        image.removeAttribute('aria-busy');
        caption.textContent = text;
        document.querySelectorAll('[data-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        announcement.textContent = `已切换至${button.textContent}。`;
      };
      next.onerror = () => {
        if (currentRequest !== requestId) return;
        image.removeAttribute('aria-busy');
        announcement.textContent = '图片暂时无法加载，请重新选择视图。';
      };
      next.src = `/case-media/mova/mova-${number}.webp`;
    });
  });
  if (!('IntersectionObserver' in window)) return;
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      reveals.unobserve(entry.target);
    }), { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(element => {
      element.classList.add('is-observed');
      reveals.observe(element);
    });
  }
  const links = [...document.querySelectorAll('.mova-chapters a')];
  const chapters = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    links.forEach(link => {
      if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }), { rootMargin: '-160px 0px -45% 0px', threshold: 0 });
  links.forEach(link => chapters.observe(document.querySelector(link.hash)));
})();
