(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...document.querySelectorAll('.om-motion')];
  const states = new Map(cards.map(card => [card, {visible:false,manual:null}]));
  function update(card) {
    const state=states.get(card),img=card.querySelector('img'),button=card.querySelector('button');
    const playing=state.visible && (state.manual ?? !reduced.matches);
    const next=playing ? img.dataset.animation : img.dataset.poster;
    delete img.dataset.src;
    if(img.getAttribute('src')!==next) img.src=next;
    button.textContent=playing?'暂停 GIF':'播放 GIF';button.setAttribute('aria-pressed',String(playing));
  }
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{states.get(entry.target).visible=entry.isIntersecting;update(entry.target)}),{threshold:.15});
  cards.forEach(card=>{observer.observe(card);card.querySelector('button').addEventListener('click',()=>{const state=states.get(card);state.manual=card.querySelector('button').getAttribute('aria-pressed')!=='true';update(card)})});
  reduced.addEventListener('change',()=>cards.forEach(card=>{states.get(card).manual=null;update(card)}));
})();
