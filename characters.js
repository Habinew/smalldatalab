/* Original 2D cast, with small reactions shared by the hideout and MD game. */
(() => {
  'use strict';
  if (window.SDLCharacters) return;
  const script = document.currentScript;
  const base = new URL('.', script?.src || location.href);
  const asset = path => new URL(path, base).href;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Map();
  const duration = 1350;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = asset('characters.css?v=20261122-motion');
  const styled = new Promise(resolve => {
    const timeout = setTimeout(() => resolve(false), 5000);
    const finish = value => { clearTimeout(timeout); resolve(value); };
    stylesheet.addEventListener('load', () => finish(true), { once: true });
    stylesheet.addEventListener('error', () => finish(false), { once: true });
  });
  document.head.append(stylesheet);

  // The eye whites cover the two baked pupils without changing the drawing.
  // Only the inline vector eyes use SVG; the original body remains an HTML image.
  const eyes = `<svg class="sdl-character-eyes" viewBox="0 220 1254 900" aria-hidden="true" focusable="false"><path fill="#F5EEDB" d="M155 510Q162 485 188 474Q211 462 229 472Q245 480 247 499Q247 516 228 532Q208 546 187 549Q169 549 158 536Q149 524 155 510Z"/><path fill="#F5EEDB" d="M263 479Q269 461 291 452Q311 443 324 455Q336 466 333 483Q331 499 315 508Q295 518 278 511Q262 507 261 491Z"/><g transform="translate(202 510)"><g class="sdl-character-gaze"><path fill="#252A27" d="M-11-2Q-12-11-4-13Q5-15 10-7Q15 3 9 10Q2 16-7 10Q-13 5-11-2Z"/></g></g><g transform="translate(298 482)"><g class="sdl-character-gaze"><path fill="#252A27" d="M-10-1Q-12-10-3-12Q6-14 10-5Q13 4 6 10Q-3 15-10 7Q-13 3-10-1Z"/></g></g></svg>`;
  function markup(id) {
    if (id === 'mori') return `<span class="sdl-character sdl-character--mori" data-character="mori" aria-hidden="true"><img class="sdl-character-mori-body" src="${asset('assets/momo-knot-teal.png')}" width="1254" height="1254" alt="" decoding="async">${eyes}</span>`;
    if (id === 'neuri') return `<span class="sdl-character sdl-character--neuri" data-character="neuri" aria-hidden="true"><img class="sdl-character-neuri-base" src="${asset('assets/neuri-doodle-2d-v2.png')}" width="724" height="2172" alt="" decoding="async"><img class="sdl-character-neuri-arm" src="${asset('assets/neuri-doodle-2d-v2.png')}" width="724" height="2172" alt="" decoding="async"></span>`;
    if (id === 'chu') return `<span class="sdl-character sdl-character--chu" data-character="chu" aria-hidden="true"><img class="sdl-character-chu-body" src="${asset('assets/chu-doodle-2d-v3.png')}" width="1278" height="1230" alt="" decoding="async"></span>`;
    return '';
  }
  function stop(element) {
    const run = active.get(element);
    if (run) {
      active.delete(element);
      clearTimeout(run.timeout);
      run.animations.forEach(animation => animation.cancel());
    }
    element.removeAttribute('data-motion');
  }
  function reset(root = document) {
    if (root?.matches?.('.sdl-character')) stop(root);
    root?.querySelectorAll?.('.sdl-character').forEach(stop);
  }
  function activate(element) {
    if (!element?.matches?.('.sdl-character')) return false;
    stop(element);
    if (motion.matches || document.hidden || typeof element.animate !== 'function') return false;
    const id = element.dataset.character;
    const animations = [];
    const options = { duration, easing: 'ease-in-out', fill: 'both' };
    if (id === 'mori') {
      element.querySelectorAll('.sdl-character-gaze').forEach((eye, index) => {
        const reach = index ? 13 : 18;
        animations.push(eye.animate([
          { transform: 'translate(0px, 0px)', offset: 0 },
          { transform: `translate(${-reach}px, 2px)`, offset: .2 },
          { transform: `translate(${reach}px, -5px)`, offset: .48 },
          { transform: 'translate(0px, -8px)', offset: .7 },
          { transform: 'translate(0px, 0px)', offset: 1 },
        ], options));
      });
    } else if (id === 'neuri') {
      const arm = element.querySelector('.sdl-character-neuri-arm');
      if (arm) animations.push(arm.animate([
        { transform: 'rotate(0deg)', offset: 0 },
        { transform: 'rotate(-72deg)', offset: .2 },
        { transform: 'rotate(-38deg)', offset: .38 },
        { transform: 'rotate(-76deg)', offset: .56 },
        { transform: 'rotate(-40deg)', offset: .73 },
        { transform: 'rotate(0deg)', offset: 1 },
      ], options));
    } else if (id === 'chu') {
      const body = element.querySelector('.sdl-character-chu-body');
      if (body) animations.push(body.animate([
        { transform: 'translateY(0) scale(1, 1)', offset: 0 },
        { transform: 'translateY(0) scale(1.09, .9)', offset: .1 },
        { transform: 'translateY(-34%) scale(.96, 1.04)', offset: .28 },
        { transform: 'translateY(0) scale(1.09, .9)', offset: .46 },
        { transform: 'translateY(-18%) scale(.98, 1.02)', offset: .65 },
        { transform: 'translateY(0) scale(1.04, .96)', offset: .82 },
        { transform: 'translateY(0) scale(1, 1)', offset: 1 },
      ], options));
    }
    if (!animations.length) return false;
    element.dataset.motion = { mori: 'look', neuri: 'wave', chu: 'bounce' }[id];
    const run = { animations, timeout: 0 };
    active.set(element, run);
    const finish = () => { if (active.get(element) === run) stop(element); };
    // Timeout also cleans up if a background renderer does not fire finish.
    run.timeout = setTimeout(finish, duration + 100);
    Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(finish);
    return true;
  }
  async function ready(root = document) {
    const images = [...(root?.querySelectorAll?.('.sdl-character img') || [])];
    if (root?.matches?.('.sdl-character')) images.push(...root.querySelectorAll('img'));
    let timeout;
    try {
      return await Promise.race([
        Promise.all([styled, ...[...new Set(images)].map(image => {
          if (typeof image.decode === 'function') return image.decode().then(() => true, () => false);
          if (image.complete) return image.naturalWidth > 0;
          return new Promise(resolve => {
            image.addEventListener('load', () => resolve(true), { once: true });
            image.addEventListener('error', () => resolve(false), { once: true });
          });
        })]).then(results => results.every(Boolean)),
        new Promise(resolve => { timeout = setTimeout(() => resolve(false), 5000); }),
      ]);
    } finally { clearTimeout(timeout); }
  }
  function stopAll() { [...active.keys()].forEach(stop); }
  motion.addEventListener?.('change', () => { if (motion.matches) stopAll(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopAll(); });
  window.SDLCharacters = Object.freeze({ markup, activate, reset, ready });
})();
