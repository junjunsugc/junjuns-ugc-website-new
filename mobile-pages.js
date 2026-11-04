
(() => {
  const ids = [
    'home', 'about', 'portfolio',
    'services', 'rates', 'contact'
  ];

  const names = [
    'Home', 'About', 'Portfolio',
    'Services', 'Rates', 'Contact'
  ];

  const pages = ids.map(id => document.getElementById(id));
  if (pages.some(page => !page)) return;

  const mq = window.matchMedia('(max-width: 767px)');

  // Preserve the original quote builder position.
  const quote = document.getElementById('quote-builder');
  const quoteParent = quote?.parentNode;
  const quoteMarker = quote
    ? document.createComment('quote-original-position')
    : null;

  if (quoteMarker) {
    quoteParent.insertBefore(quoteMarker, quote);
  }

  // Create top navigation tabs.
  const nav = document.createElement('nav');
  nav.className = 'mobile-page-nav';
  nav.setAttribute('aria-label', 'Mobile section navigation');

  ids.forEach((id, i) => {
    const link = document.createElement('a');
    link.href = '#' + id;
    link.textContent = names[i];
    link.className = 'mobile-page-tab';
    nav.appendChild(link);
  });

  // Place navigation after the existing site header.
  const header = document.querySelector('header.nav') ||
                 document.querySelector('header');

  if (header) {
    header.insertAdjacentElement('afterend', nav);
  } else {
    document.body.prepend(nav);
  }

  const tabs = [...nav.querySelectorAll('.mobile-page-tab')];
  let active = 0;

  function fromHash() {
    const id = window.location.hash.slice(1);
    const index = ids.indexOf(id);

    if (index !== -1) return index;

    // Support links to elements inside a page.
    const target = document.getElementById(id);
    if (target) {
      const containing = pages.findIndex(page =>
        page === target || page.contains(target)
      );
      if (containing !== -1) return containing;
    }

    return 0;
  }

  function go(index, updateUrl = true) {
    if (!mq.matches) return;

    active = Math.max(0, Math.min(ids.length - 1, index));

    // Show only the selected section.
    pages.forEach((page, i) => {
      const isActive = i === active;

      page.classList.toggle('mobile-page-active', isActive);
      page.setAttribute('aria-hidden', String(!isActive));
    });

    // Highlight the active navigation tab.
    tabs.forEach((tab, i) => {
      const isActive = i === active;

      tab.classList.toggle('active', isActive);

      if (isActive) {
        tab.setAttribute('aria-current', 'page');
      } else {
        tab.removeAttribute('aria-current');
      }
    });

    // Keep the active tab visible in the tab row.
    const tab = tabs[active];
    const left = tab.offsetLeft -
      (nav.clientWidth - tab.offsetWidth) / 2;

    nav.scrollTo({
      left: Math.max(0, left),
      behavior: 'smooth'
    });

    if (updateUrl && location.hash !== '#' + ids[active]) {
      history.pushState(null, '', '#' + ids[active]);
    }

    // Return to top of the selected page.
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Close hamburger menu if open.
    document.getElementById('links')?.classList.remove('open');
  }

  // Tab clicks.
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', event => {
      if (!mq.matches) return;

      event.preventDefault();
      go(i);
    });
  });

  // Existing header and internal anchor links.
  document.addEventListener('click', event => {
    if (!mq.matches) return;

    const link = event.target.closest('a[href^="#"]');
    if (!link || nav.contains(link)) return;

    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);

    if (!target) return;

    const index = pages.findIndex(page =>
      page === target || page.contains(target)
    );

    if (index === -1) return;

    event.preventDefault();

    const changedPage = index !== active;
    go(index);

    if (target !== pages[index]) {
      if (changedPage) {
        requestAnimationFrame(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        });
      } else {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });

  function updateMode() {
    if (mq.matches) {
      document.body.classList.add('mobile-pages');

      // Move quote builder inside Rates on mobile.
      if (quote && quote.parentNode !== pages[4]) {
        pages[4].appendChild(quote);
      }

      go(fromHash(), false);
    } else {
      document.body.classList.remove('mobile-pages');

      pages.forEach(page => {
        page.classList.remove('mobile-page-active');
        page.removeAttribute('aria-hidden');
      });

      // Restore quote builder on desktop.
      if (quote && quoteMarker &&
          quote.parentNode !== quoteParent) {
        quoteParent.insertBefore(
          quote,
          quoteMarker.nextSibling
        );
      }
    }
  }

  // Browser back/forward navigation.
  window.addEventListener('popstate', () => {
    if (mq.matches) go(fromHash(), false);
  });

  window.addEventListener('hashchange', () => {
    if (mq.matches) go(fromHash(), false);
  });

  mq.addEventListener('change', updateMode);

  // Swipe navigation.
  let start = null;

  document.addEventListener('touchstart', event => {
    if (!mq.matches || event.touches.length !== 1) {
      start = null;
      return;
    }

    // Do not interfere with interactive elements.
    if (event.target.closest(
      'button, a, input, textarea, select, video, iframe,' +
      '.mobile-page-nav, .sw-window, .portfolio-grid,' +
      '.project-grid, .carousel, .modal,' +
      '.wwm-window, .creative-studio-window,' +
      '[role="dialog"], [contenteditable]'
    )) {
      start = null;
      return;
    }

    start = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }, { passive: true });

  document.addEventListener('touchend', event => {
    if (!start || !mq.matches ||
        !event.changedTouches.length) return;

    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;

    start = null;

    // Only recognize intentional horizontal swipes.
    if (
      Math.abs(dx) > 85 &&
      Math.abs(dx) > Math.abs(dy) * 1.7
    ) {
      if (dx < 0) {
        go(active + 1);
      } else {
        go(active - 1);
      }
    }
  }, { passive: true });

  updateMode();
})();
