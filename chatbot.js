/* Small Data Lab · Mori. Add <script src="chatbot.js"></script> before </body>. */
(() => {
  'use strict';
  if (window.__smallDataLabDot) return;
  window.__smallDataLabDot = true;
  const script = document.currentScript;
  const base = new URL('.', script?.src || location.href);
  const resource = (name) => new URL(name, base).href;
  // Only fixed event names and categories reach analytics; never the question.
  const track = (name, props = {}) => { try { window.SDLAnalytics?.track(name, props); } catch (_) { /* Analytics cannot interrupt a conversation. */ } };
  const MAX_MESSAGE = 1200;
  const chips = ['주요 연구 분야가 궁금해요', '최근 칼럼 핵심 요약해 줘', '연구실 상담/수업 문의 방법'];
  // Keep the original thread drawing intact. The aligned vector eye layer covers
  // both baked pupils, so there are always exactly two visible, movable pupils.
  const avatar = `<svg class="sdl-dot-avatar" viewBox="0 220 1254 900" aria-hidden="true" focusable="false"><image class="sdl-dot-body" href="${resource('assets/momo-knot-teal.png')}" width="1254" height="1254"/><g class="sdl-dot-face"><path fill="#F5EEDB" d="M155 510Q162 485 188 474Q211 462 229 472Q245 480 247 499Q247 516 228 532Q208 546 187 549Q169 549 158 536Q149 524 155 510Z"/><path fill="#F5EEDB" d="M263 479Q269 461 291 452Q311 443 324 455Q336 466 333 483Q331 499 315 508Q295 518 278 511Q262 507 261 491Z"/><g class="sdl-dot-pupil" data-eye-x="202" data-eye-y="510" data-eye-rx="18" data-eye-ry="11" transform="translate(202 510)"><path fill="#252A27" d="M-11-2Q-12-11-4-13Q5-15 10-7Q15 3 9 10Q2 16-7 10Q-13 5-11-2Z"/></g><g class="sdl-dot-pupil" data-eye-x="298" data-eye-y="482" data-eye-rx="13" data-eye-ry="9" transform="translate(298 482)"><path fill="#252A27" d="M-10-1Q-12-10-3-12Q6-14 10-5Q13 4 6 10Q-3 15-10 7Q-13 3-10-1Z"/></g></g></svg>`;
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = resource('chatbot.css?v=20261120-mori-play');
  document.head.append(style);

  const boot = () => {
    const root = document.createElement('div');
    root.id = 'sdl-dot';
    root.innerHTML = `<button type="button" class="sdl-dot-launcher" aria-label="모리에게 연구실 질문하기" aria-haspopup="dialog" aria-controls="sdl-dot-dialog"><span class="sdl-dot-bubble">교수님 연구나 수업이 궁금한가요?</span>${avatar}<span class="sdl-dot-launcher-label">모리에게 질문</span></button>
      <dialog id="sdl-dot-dialog" class="sdl-dot-dialog" aria-labelledby="sdl-dot-title" aria-describedby="sdl-dot-description">
        <header class="sdl-dot-header"><div class="sdl-dot-heading">${avatar}<div><h2 id="sdl-dot-title">모리의 작은 상담실</h2><p class="sdl-dot-mode">연구실 안내를 불러오는 중</p></div></div><button type="button" class="sdl-dot-close" aria-label="채팅창 닫기">×</button></header>
        <p id="sdl-dot-description" class="sdl-dot-description">연구, 칼럼, 수업. 궁금한 것부터 물어보세요.</p>
        <div class="sdl-dot-chips" aria-label="추천 질문"></div>
        <div class="sdl-dot-notice" hidden></div>
        <div class="sdl-dot-log" role="log" aria-label="모리와의 대화" aria-live="polite" aria-relevant="additions" tabindex="0"></div>
        <p class="sdl-dot-status" role="status" aria-live="polite"></p>
        <form class="sdl-dot-form"><label for="sdl-dot-input" class="sdl-dot-sr">모리에게 질문</label><div class="sdl-dot-compose"><textarea id="sdl-dot-input" rows="2" maxlength="1200" placeholder="궁금한 점을 남겨 주세요" required></textarea><button type="submit" class="sdl-dot-send" aria-label="질문 보내기"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M6 11L12 5L18 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div class="sdl-dot-input-meta"><span class="sdl-dot-privacy">이름·학번·연락처 등 개인정보는 적지 마세요.</span><span class="sdl-dot-count">0 / 1200</span></div></form>
        <footer class="sdl-dot-footer">Small Data Lab <span>·</span> <a href="${resource('privacy.html')}">이용 통계 안내</a></footer>
      </dialog>`;
    document.body.append(root);
    // The labelled launcher remains usable if the optional illustration cannot load.
    root.querySelectorAll('.sdl-dot-body').forEach(avatarImage => {
      avatarImage.addEventListener('load', () => { avatarImage.closest('.sdl-dot-avatar').classList.add('sdl-dot-ready'); });
      avatarImage.addEventListener('error', () => { avatarImage.closest('.sdl-dot-avatar').setAttribute('hidden', ''); });
    });
    const $ = (selector) => root.querySelector(selector);
    const launcher = $('.sdl-dot-launcher');
    const dialog = $('.sdl-dot-dialog');
    const log = $('.sdl-dot-log');
    const input = $('.sdl-dot-compose textarea');
    const form = $('.sdl-dot-form');
    const send = $('.sdl-dot-send');
    const mode = $('.sdl-dot-mode');
    const notice = $('.sdl-dot-notice');
    const status = $('.sdl-dot-status');
    let knowledge = null;
    let endpoint = '';
    let configurationError = false;
    let ready = false;
    let busy = false;
    let history = [];
    let previousFocus = null;
    let previousOverflow = '';

    const avatars = [...root.querySelectorAll('.sdl-dot-avatar')];
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let eyeFrame = 0;
    let pointer = null;
    const centerEye = eye => eye.setAttribute('transform', `translate(${eye.dataset.eyeX} ${eye.dataset.eyeY})`);
    function resetEyes() {
      if (eyeFrame) cancelAnimationFrame(eyeFrame);
      eyeFrame = 0; pointer = null;
      avatars.forEach(avatarElement => avatarElement.querySelectorAll('.sdl-dot-pupil').forEach(centerEye));
    }
    function paintEyes() {
      eyeFrame = 0;
      if (!pointer || reduceMotion.matches || !finePointer.matches || document.hidden) { resetEyes(); return; }
      avatars.forEach(avatarElement => {
        const inDialog = Boolean(avatarElement.closest('dialog'));
        if (inDialog !== dialog.open || avatarElement.hasAttribute('hidden')) return;
        const pupils = avatarElement.querySelectorAll('.sdl-dot-pupil');
        const rect = avatarElement.getBoundingClientRect();
        if (!rect.width || rect.bottom <= 0 || rect.top >= innerHeight || rect.right <= 0 || rect.left >= innerWidth) { pupils.forEach(centerEye); return; }
        pupils.forEach(eye => {
          const x = Number(eye.dataset.eyeX), y = Number(eye.dataset.eyeY);
          const dx = pointer.x - (rect.left + x / 1254 * rect.width);
          const dy = pointer.y - (rect.top + (y - 220) / 900 * rect.height);
          const distance = Math.hypot(dx, dy);
          const reach = Math.min(1, distance / 180) / (distance || 1);
          eye.setAttribute('transform', `translate(${(x + dx * reach * Number(eye.dataset.eyeRx)).toFixed(2)} ${(y + dy * reach * Number(eye.dataset.eyeRy)).toFixed(2)})`);
        });
      });
    }
    function queueEyes() { if (pointer && !eyeFrame) eyeFrame = requestAnimationFrame(paintEyes); }
    window.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || reduceMotion.matches || !finePointer.matches || event.clientX < 0 || event.clientY < 0 || event.clientX > innerWidth || event.clientY > innerHeight) { resetEyes(); return; }
      pointer = { x:event.clientX, y:event.clientY }; queueEyes();
    }, { passive:true });
    document.addEventListener('pointerout', event => { if (!event.relatedTarget) resetEyes(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) resetEyes(); });
    window.addEventListener('blur', resetEyes);
    window.addEventListener('resize', resetEyes, { passive:true });
    window.addEventListener('scroll', queueEyes, { passive:true });
    reduceMotion.addEventListener('change', resetEyes);
    finePointer.addEventListener('change', resetEyes);

    function safeURL(value) {
      if (typeof value !== 'string' || !value.trim()) return null;
      try {
        const url = new URL(value, base);
        if (url.protocol === 'https:' || url.protocol === 'mailto:' || (url.origin === location.origin && url.protocol === 'http:')) return url;
      } catch (_) { /* Invalid source URLs are omitted. */ }
      return null;
    }
    function scrollLog() { log.scrollTop = log.scrollHeight; }
    function appendMessage(role, content, sources = []) {
      const article = document.createElement('article');
      article.className = `sdl-dot-message sdl-dot-message--${role}`;
      const label = document.createElement('span');
      label.className = 'sdl-dot-message-name';
      label.textContent = role === 'user' ? '나' : '모리';
      const text = document.createElement('p');
      text.textContent = String(content);
      article.append(label, text);
      if (Array.isArray(sources)) {
        const links = document.createElement('div');
        links.className = 'sdl-dot-sources';
        sources.slice(0, 4).forEach((source) => {
          if (!source || typeof source.title !== 'string') return;
          const url = safeURL(source.url);
          if (!url) return;
          const a = document.createElement('a');
          a.textContent = source.title.slice(0, 160);
          a.href = url.href;
          if (url.origin !== location.origin && url.protocol !== 'mailto:') { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
          links.append(a);
        });
        if (links.childElementCount) article.append(links);
      }
      log.append(article);
      scrollLog();
      return article;
    }
    function countInput() { $('.sdl-dot-count').textContent = `${input.value.length} / ${MAX_MESSAGE}`; }
    function controls() {
      send.disabled = busy || !ready;
      $('.sdl-dot-chips').querySelectorAll('button').forEach((button) => { button.disabled = busy || !ready; });
      input.readOnly = busy;
      log.setAttribute('aria-busy', String(busy));
    }
    function showNotice(message, retry) {
      notice.replaceChildren();
      notice.hidden = !message;
      if (!message) return;
      const span = document.createElement('span');
      span.textContent = message;
      notice.append(span);
      if (retry) {
        const button = document.createElement('button');
        button.type = 'button'; button.textContent = '다시 불러오기';
        button.addEventListener('click', loadResources);
        notice.append(button);
      }
    }
    async function fetchJSON(url) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(url, { signal: controller.signal, credentials: 'same-origin', cache: 'no-cache' });
        if (!response.ok) throw new Error('resource');
        return await response.json();
      } finally { clearTimeout(timer); }
    }
    function configureEndpoint(value) {
      if (value === '' || value === null || value === undefined) return '';
      if (typeof value !== 'string') throw new Error('configuration');
      const url = new URL(value);
      const development = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
      if (url.protocol !== 'https:' && !development) throw new Error('configuration');
      if (url.username || url.password || url.hash || url.search) throw new Error('configuration');
      return url.href;
    }
    async function loadResources() {
      if (busy) return;
      ready = false; controls();
      mode.textContent = '연구실 안내를 불러오는 중';
      showNotice('');
      const [kb, config] = await Promise.allSettled([fetchJSON(resource('lab_knowledge.json')), fetchJSON(resource('chatbot-config.json'))]);
      knowledge = kb.status === 'fulfilled' && kb.value && typeof kb.value === 'object' && !Array.isArray(kb.value) ? kb.value : null;
      configurationError = false;
      endpoint = '';
      try {
        if (config.status !== 'fulfilled' || !config.value || typeof config.value !== 'object') throw new Error('configuration');
        endpoint = configureEndpoint(config.value.endpoint);
      } catch (_) { configurationError = true; }
      mode.textContent = endpoint ? 'AI 조교 · 연구실 자료를 바탕으로 답해요' : '연구실 안내 · 저장된 자료로 답해요';
      $('.sdl-dot-privacy').textContent = endpoint ? '질문과 최근 대화가 Google AI로 전송돼요. 개인정보는 적지 마세요.' : '이 안내 모드에서는 질문을 외부 AI로 보내지 않아요.';
      if (configurationError) showNotice('AI 연결 설정을 확인할 수 없어 연구실 안내 모드로 열었어요.', true);
      else if (!knowledge) showNotice('연구실 자료를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', true);
      ready = true; controls();
    }
    function localAnswer(message) {
      const lower = message.toLowerCase();
      const topic = /칼럼|요약|매거진|시사저널/.test(lower) ? 'columns' : /상담|문의|연락|수업|강의|메일/.test(lower) ? 'contact' : /연구|분야|키워드|논문/.test(lower) ? 'research' : 'unknown';
      if (!knowledge) return { answer: '지금은 연구실 자료를 불러올 수 없어요. 아래 페이지에서 내용을 확인해 주세요.', sources: [{ title: '연구실 소개', url: 'lab.html' }, { title: '연구 살펴보기', url: 'research.html' }, { title: '칼럼 읽기', url: 'data.html' }] };
      const faqs = Array.isArray(knowledge.faq) ? knowledge.faq : [];
      const patterns = { columns: /column|칼럼|요약/, contact: /contact|상담|문의|연락/, research: /research|연구|분야/ };
      const faq = faqs.find((item) => item && typeof item.answer === 'string' && (item.question === message || (patterns[topic] && patterns[topic].test(`${item.id || ''} ${item.question || ''}`))));
      if (faq) return { answer: faq.answer, sources: faq.sources || [] };
      if (topic === 'research') {
        const lab = knowledge.lab || {};
        const keywords = Array.isArray(lab.research_keywords) ? lab.research_keywords.join(', ') : '';
        return { answer: [lab.description, keywords ? `주요 키워드: ${keywords}` : '', '연구 페이지에서 논문과 진행 중인 주제를 살펴볼 수 있어요.'].filter(Boolean).join('\n\n'), sources: [{ title: '연구 살펴보기', url: 'research.html' }] };
      }
      if (topic === 'columns') {
        const column = Array.isArray(knowledge.columns) ? knowledge.columns[0] : null;
        return { answer: column && column.summary ? `등록된 칼럼: ${column.title}\n\n${column.summary}\n\n전체 내용은 원문에서 확인해 주세요.` : '「김하빈의 스몰데이터」 칼럼은 데이터 페이지에서 읽을 수 있어요. 최신 글과 자세한 내용은 해당 페이지에서 확인해 주세요.', sources: column?.url ? [{ title: column.title || '칼럼 읽기', url: column.url }, { title: '모든 칼럼', url: 'data.html' }] : [{ title: '칼럼 읽기', url: 'data.html' }] };
      }
      if (topic === 'contact') {
        const contact = knowledge.lab?.contact || {};
        return { answer: `상담이나 수업 문의는 연구실 소개 페이지에 안내된 연락처를 이용해 주세요.${contact.email ? `\n\n이메일: ${contact.email}` : ''}\n\n관심 주제와 궁금한 점을 함께 적으면 상담에 도움이 돼요.`, sources: [{ title: '연구실 연락처', url: contact.url || 'lab.html' }, { title: '강의 안내', url: 'lecture.html' }] };
      }
      return { answer: '지금은 등록된 연구실 정보를 안내하는 모드예요. 연구 분야, 칼럼, 상담·수업 문의 중에서 물어보면 관련 내용을 찾아드릴게요.', sources: [{ title: '연구실 소개', url: 'lab.html' }] };
    }
    function boundedHistory() {
      const selected = history.slice(-8);
      while (selected.reduce((size, item) => size + item.content.length, 0) > 6000) selected.splice(0, 2);
      return selected;
    }
    async function remoteAnswer(message) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);
      try {
        const recent = boundedHistory();
        let body = JSON.stringify({ message, history: recent });
        // Korean text takes more than one UTF-8 byte per character. Leave room
        // under the proxy's body-size limit even for a long conversation.
        while (recent.length && new TextEncoder().encode(body).byteLength > 14000) {
          recent.splice(0, 2);
          body = JSON.stringify({ message, history: recent });
        }
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit', signal: controller.signal, body });
        if (!response.ok) {
          const error = new Error(response.status === 429 ? '잠깐 쉬어 갈까요? 요청이 많아 조금 뒤에 다시 질문해 주세요.' : response.status === 413 ? '질문이 너무 길어요. 핵심만 짧게 적어 주세요.' : '지금은 AI 답변에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.');
          throw error;
        }
        const data = await response.json();
        if (!data || typeof data.answer !== 'string' || !data.answer.trim()) throw new Error('답변을 받아오지 못했어요. 다시 시도해 주세요.');
        return { answer: data.answer.slice(0, 10000), sources: Array.isArray(data.sources) ? data.sources : [] };
      } catch (error) {
        if (error.name === 'AbortError') throw new Error('답변이 조금 늦어지고 있어요. 다시 시도해 주세요.');
        if (error instanceof TypeError || error instanceof SyntaxError) throw new Error('연결을 확인할 수 없어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.');
        throw error;
      } finally { clearTimeout(timer); }
    }
    async function submit(message, isRetry = false, source = 'typed') {
      message = message.trim();
      if (busy || !ready || !message) return;
      if (message.length > MAX_MESSAGE) { status.textContent = `질문은 ${MAX_MESSAGE}자 안으로 적어 주세요.`; return; }
      busy = true; controls();
      const answerMode = endpoint ? 'remote' : 'local';
      track('chat_question', { mode: answerMode, source: isRetry ? 'retry' : source });
      if (!isRetry) appendMessage('user', message);
      input.value = ''; countInput();
      status.textContent = endpoint ? '모리가 연구실 자료를 확인하고 있어요…' : '관련 안내를 찾고 있어요…';
      try {
        const result = endpoint ? await remoteAnswer(message) : localAnswer(message);
        appendMessage('assistant', result.answer, result.sources);
        track('chat_answer', { mode: answerMode });
        if (endpoint) { history.push({ role: 'user', content: message }, { role: 'assistant', content: result.answer.slice(0, 3000) }); history = boundedHistory(); }
        status.textContent = '';
      } catch (error) {
        track('chat_error', { mode: answerMode });
        const article = appendMessage('assistant', error.message || '답변을 받아오지 못했어요. 다시 시도해 주세요.');
        article.classList.add('sdl-dot-message--error');
        const retry = document.createElement('button');
        retry.type = 'button'; retry.className = 'sdl-dot-retry'; retry.textContent = '같은 질문 다시 보내기';
        retry.addEventListener('click', () => { if (!busy) { retry.disabled = true; submit(message, true); } });
        article.append(retry);
        input.value = message; countInput();
        status.textContent = '질문을 입력창에 남겨 두었어요.';
      } finally {
        busy = false; controls(); scrollLog();
        if (dialog.open) input.focus({ preventScroll: true });
      }
    }
    chips.forEach((question) => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = question;
      button.addEventListener('click', () => submit(question, false, 'chip'));
      $('.sdl-dot-chips').append(button);
    });
    launcher.addEventListener('click', () => {
      resetEyes();
      previousFocus = document.activeElement;
      previousOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal(); root.classList.add('sdl-dot-open');
      track('chat_open');
      input.focus({ preventScroll: true }); scrollLog();
    });
    $('.sdl-dot-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      resetEyes();
      root.classList.remove('sdl-dot-open');
      document.documentElement.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    });
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href], textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    input.addEventListener('input', countInput);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); submit(input.value); }
    });
    form.addEventListener('submit', (event) => { event.preventDefault(); submit(input.value); });
    appendMessage('assistant', '안녕하세요, 스몰데이터랩의 모리예요.\n연구와 칼럼, 수업에 관한 작은 질문을 기다리고 있어요.');
    controls();
    loadResources();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
