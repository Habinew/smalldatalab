/* A quiet corner for Mori, Neuri and Chu. No dependencies or visitor tracking. */
(() => {
  'use strict';
  const script = document.currentScript;
  if (!script || /\/stats\.html$/.test(location.pathname)) return;
  const base = new URL('.', script.src);
  const asset = path => new URL(path, base).href;

  function init() {
    const footer = document.querySelector('.site-foot');
    if (!footer || document.getElementById('sdl-friends-dialog')) return;
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = asset('friends.css?v=20261121-friends2');
    const stylesheetReady = new Promise(resolve => {
      stylesheet.addEventListener('load', () => resolve(true), { once: true });
      stylesheet.addEventListener('error', () => resolve(false), { once: true });
    });
    document.head.append(stylesheet);

    const profiles = {
      mori: { name: '모리', copy: '궁금한 건 일단 모아보는 편. 작은 단서를 잇다 보면 어느새 이야기가 길어져요.' },
      neuri: { name: '느리', copy: '말수는 적지만, 남들이 지나친 걸 오래 봐요. 급한 모리 옆에서 한 번 더 살펴보는 친구예요.' },
      chu: { name: '츄', copy: '몸은 작아도 눈썰미는 좋아요. 동그란 안경 너머로 작은 차이를 콕 집어내요.' },
    };
    // A regular image paints reliably when a dialog opens from an initial URL
    // fragment. Its frame preserves the original SVG's 0 220 1254 900 view.
    const moriArt = `<span class="sdl-friends-mori-frame" aria-hidden="true"><img src="${asset('assets/momo-knot-teal.png')}" width="1254" height="1254" alt="" decoding="async"></span>`;
    const corner = document.createElement('div');
    corner.className = 'sdl-friends-hideout';
    corner.id = 'friends';
    corner.hidden = true;
    corner.innerHTML = `<button class="sdl-friends-peek" type="button" aria-label="모리와 친구들 만나기" aria-haspopup="dialog" aria-controls="sdl-friends-dialog">${moriArt.replace('width="1254" height="1254"', 'width="38" height="38"')}<span class="sdl-friends-whisper" aria-hidden="true">쉿, 우리 여기 있어요.</span></button>`;
    const footerStart = footer.querySelector('.footer-grid > div') || footer;
    footerStart.append(corner);
    stylesheetReady.then(styled => { corner.hidden = !styled; });

    const dialog = document.createElement('dialog');
    dialog.id = 'sdl-friends-dialog';
    dialog.className = 'sdl-friends-dialog';
    dialog.setAttribute('aria-labelledby', 'sdl-friends-title');
    dialog.setAttribute('aria-describedby', 'sdl-friends-intro');
    dialog.innerHTML = `<div class="sdl-friends-inner">
      <button class="sdl-friends-close" type="button" aria-label="친구들 소개 닫기"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button>
      <h2 id="sdl-friends-title" class="sdl-friends-title">찾았다, 우리 셋.</h2>
      <p id="sdl-friends-intro" class="sdl-friends-intro">스몰데이터랩 구석에 사는 친구들.</p>
      <div class="sdl-friends-stage" role="tablist" aria-label="소개할 친구 고르기">
        <button id="sdl-friends-tab-neuri" class="sdl-friends-character sdl-friends-character--neuri" type="button" role="tab" aria-selected="false" aria-controls="sdl-friends-profile" tabindex="-1" data-friend="neuri"><span class="sdl-friends-art"><img src="${asset('assets/neuri-doodle-2d-v2.png')}" width="724" height="2172" alt="" decoding="async"></span><span class="sdl-friends-name">느리</span></button>
        <button id="sdl-friends-tab-mori" class="sdl-friends-character sdl-friends-character--mori" type="button" role="tab" aria-selected="true" aria-controls="sdl-friends-profile" tabindex="0" data-friend="mori"><span class="sdl-friends-art">${moriArt}</span><span class="sdl-friends-name">모리</span></button>
        <button id="sdl-friends-tab-chu" class="sdl-friends-character sdl-friends-character--chu" type="button" role="tab" aria-selected="false" aria-controls="sdl-friends-profile" tabindex="-1" data-friend="chu"><span class="sdl-friends-art"><img src="${asset('assets/chu-doodle-2d-v3.png')}" width="1278" height="1230" alt="" decoding="async"></span><span class="sdl-friends-name">츄</span></button>
      </div>
      <div id="sdl-friends-profile" class="sdl-friends-profile" role="tabpanel" aria-labelledby="sdl-friends-tab-mori" tabindex="0" data-friend="mori"><p class="sdl-friends-copy" aria-live="polite" aria-atomic="true">${profiles.mori.copy}</p></div>
      <p class="sdl-friends-hint">친구를 톡 눌러보세요.</p>
    </div>`;
    document.body.append(dialog);
    const trigger = corner.querySelector('button');
    const tabs = [...dialog.querySelectorAll('[role="tab"]')];
    const panel = dialog.querySelector('.sdl-friends-profile');
    const copy = dialog.querySelector('.sdl-friends-copy');
    const artworkReady = Promise.all([...dialog.querySelectorAll('img')].map(image => image.decode().catch(() => {})));
    let returnFocus = trigger;
    let previousOverflow = '';

    function select(tab, focus = false) {
      const profile = profiles[tab.dataset.friend];
      if (!profile) return;
      tabs.forEach(item => {
        const selected = item === tab;
        item.setAttribute('aria-selected', String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', tab.id);
      panel.dataset.friend = tab.dataset.friend;
      copy.textContent = profile.copy;
      if (focus) tab.focus({ preventScroll: true });
    }
    async function open() {
      const [styled] = await Promise.all([stylesheetReady, artworkReady]);
      if (!styled || dialog.open) return;
      returnFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : trigger;
      previousOverflow = document.body.style.overflow;
      select(tabs.find(tab => tab.dataset.friend === 'mori'));
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      dialog.querySelector('.sdl-friends-close').focus({ preventScroll: true });
    }
    function requestOpen() {
      const chat = document.querySelector('#sdl-dot-dialog[open]');
      if (chat) {
        chat.addEventListener('close', () => requestAnimationFrame(open), { once: true });
        chat.close();
      } else requestAnimationFrame(open);
    }
    trigger.addEventListener('click', requestOpen);
    dialog.querySelector('.sdl-friends-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      if (location.hash === '#friends') history.replaceState(history.state, '', location.pathname + location.search);
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    tabs.forEach(tab => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', event => {
        const index = tabs.indexOf(tab);
        const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
        if (next === null) return;
        event.preventDefault(); select(tabs[next], true);
      });
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('button:not([disabled]),[tabindex="0"]')].filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    // A chatbot source can point at the current page's already-active hash.
    // Handle that click too: hashchange alone would not fire in that case.
    document.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.hash !== '#friends') return;
      event.preventDefault();
      if (location.hash !== '#friends') history.pushState(history.state, '', url.pathname + url.search + url.hash);
      requestOpen();
    });
    const openFromHash = () => { if (location.hash === '#friends') requestOpen(); };
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
