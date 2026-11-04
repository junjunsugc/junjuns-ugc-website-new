(() => {
  const ids = ['home','about','portfolio','services','rates','contact'];
  const names = ['Home','About','Portfolio','Services','Rates','Contact'];
  const pages = ids.map(id => document.getElementById(id));
  if (pages.some(p => !p)) return;
  const mq = window.matchMedia('(max-width: 767px)');
  const quote = document.getElementById('quote-builder');
  const quoteParent = quote?.parentNode;
  const quoteMarker = quote ? document.createComment('quote-builder-original-position') : null;
  if (quoteMarker) quoteParent.insertBefore(quoteMarker, quote);
  const nav = document.createElement('nav');
  nav.className = 'mobile-page-nav';
  nav.setAttribute('aria-label', 'Mobile section navigation');
  nav.innerHTML = '<button type="button" class="mobile-page-prev" aria-label="Previous section">← Back</button><div class="mobile-page-status"><div class="mobile-page-name" aria-live="polite"></div><div class="mobile-page-count"></div><div class="mobile-page-dots"></div></div><button type="button" class="mobile-page-next" aria-label="Next section">Next →</button>';
  document.body.appendChild(nav);
  const prev = nav.querySelector('.mobile-page-prev');
  const next = nav.querySelector('.mobile-page-next');
  const label = nav.querySelector('.mobile-page-name');
  const count = nav.querySelector('.mobile-page-count');
  const dots = nav.querySelector('.mobile-page-dots');
  ids.forEach((id,i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'Go to '+names[i]);
    b.addEventListener('click', () => go(i)); dots.appendChild(b);
  });
  let active = 0;
  function fromHash() { const id = location.hash.slice(1); return Math.max(0, ids.indexOf(id)); }
  function go(index, updateUrl = true) {
    active = Math.max(0, Math.min(ids.length - 1, index));
    if (!mq.matches) return;
    pages.forEach((p,i) => { p.classList.toggle('mobile-page-active',i === active); p.setAttribute('aria-hidden',String(i !== active)); });
    label.textContent = names[active]; count.textContent = (active+1)+' / '+ids.length;
    [...dots.children].forEach((b,i) => { if (i === active) b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current'); });
    prev.disabled = active === 0; next.disabled = active === ids.length - 1;
    next.textContent = active === ids.length-1 ? 'End ✓' : 'Next →';
    if (updateUrl && location.hash !== '#'+ids[active]) history.pushState(null,'','#'+ids[active]);
    window.scrollTo({top:0,behavior:'instant'});
    // Close existing hamburger menu when navigating.
    document.getElementById('links')?.classList.remove('open');
  }
  function updateMode() {
    if (mq.matches) {
      document.body.classList.add('mobile-pages');
      if (quote && quote.parentNode !== pages[4]) pages[4].appendChild(quote);
      go(fromHash(), false);
    } else {
      document.body.classList.remove('mobile-pages');
      pages.forEach(p => {p.classList.remove('mobile-page-active');p.removeAttribute('aria-hidden');});
      if (quote && quoteMarker && quote.parentNode !== quoteParent) quoteParent.insertBefore(quote,quoteMarker.nextSibling);
    }
  }
  prev.addEventListener('click',()=>go(active-1)); next.addEventListener('click',()=>go(active+1));
  document.addEventListener('click',e => {
    if (!mq.matches) return;
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = a.getAttribute('href').slice(1);
    const idx = ids.indexOf(target);
    if (idx !== -1) {e.preventDefault();go(idx);}
    else if (target && document.getElementById(target)) {
      const containing = pages.findIndex(p=>p.contains(document.getElementById(target)));
      if (containing !== -1 && containing !== active) { e.preventDefault(); go(containing); requestAnimationFrame(()=>document.getElementById(target).scrollIntoView()); }
    }
  });
  window.addEventListener('popstate',()=>{if(mq.matches)go(fromHash(),false);});
  window.addEventListener('hashchange',()=>{if(mq.matches)go(fromHash(),false);});
  mq.addEventListener('change',updateMode);
  // Horizontal swipes only in non-interactive blank areas; normal vertical scrolling remains available.
  let start = null;
  document.addEventListener('touchstart',e=>{
    if (!mq.matches || e.touches.length!==1 || e.target.closest('button,a,input,textarea,select,video,iframe,.sw-window,.portfolio-grid,.project-grid,.carousel,.modal,.wwm-window,.creative-studio-window,[role="dialog"]')) {start=null;return;}
    start={x:e.touches[0].clientX,y:e.touches[0].clientY};
  },{passive:true});
  document.addEventListener('touchend',e=>{
    if (!start || !mq.matches || !e.changedTouches.length) return;
    const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;start=null;
    if(Math.abs(dx)>85 && Math.abs(dx)>Math.abs(dy)*1.7)go(active+(dx<0?1:-1));
  },{passive:true});
  updateMode();
})();
