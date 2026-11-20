/* Small Data Lab — navigation, a daily quiz, and dataset filters. No dependencies. */
(() => {
  'use strict';
  document.documentElement.classList.add('js-ready');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? '닫기' : '메뉴';
      nav.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false');
        menu.textContent = '메뉴'; menu.focus();
      }
    });
  }
  const quiz = document.querySelector('[data-quiz]');
  if (quiz) {
    const questions = [
      { id:'photocard', question:'멤버가 5명이고 카드가 같은 확률로 나온다면, 앨범 5장을 사고도 최애 카드를 못 뽑을 확률은?', options:['약 3%','약 13%','약 33%'], correct:2, explanation:'한 장에서 최애가 나오지 않을 확률은 4/5. 매번 독립적으로 뽑는다고 가정하면 다섯 번 모두 못 뽑을 확률은 (4/5)⁵ ≈ 32.8%입니다. 구매 횟수가 늘어도 당첨이 보장되지는 않아요.', source:'같은 확률·독립 추첨을 가정한 계산 · 2026년 10월 칼럼', href:'data.html#column-hive' },
      { id:'resell', question:'2026년 8월 KREAM 인기 상품 1,342개 분석에서, 발매가보다 50% 이상 오른 상품은 전체 거래량의 몇 %였을까요?', options:['약 3%','약 30%','약 60%'], correct:0, explanation:'발매가보다 50% 이상 오른 상품은 상품 수로는 9%, 거래량으로는 3%였습니다. 수수료와 배송비를 빼기 전 가격이며, 거래가 확인된 인기 상품 표본이므로 시장 전체로 일반화할 수는 없습니다.', source:'KREAM 공개 시세, 2026년 8월 말 기준 · 2026년 9월 칼럼', href:'data.html#column-resell' },
      { id:'asking-price', question:'포토카드 매물의 ‘호가’를 모았습니다. 이 데이터만으로 바로 알 수 있는 것은 무엇일까요?', options:['실제로 거래가 끝난 가격','판매자가 제시한 가격','팬 한 명의 월평균 지출'], correct:1, explanation:'호가는 판매자가 부르는 가격입니다. 체결 가격이나 실제 지출과는 달라요. 어떤 방식으로 모은 데이터인지 확인하는 것이 해석의 출발점입니다.', source:'번개장터 매물 분석의 해석 범위 · 2026년 10월 칼럼', href:'data.html#column-hive' }
    ];
    const day = new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Seoul'});
    const seed = [...day].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const q = questions[seed % questions.length];
    const question = quiz.querySelector('[data-question]');
    const choices = quiz.querySelector('[data-choices]');
    const result = quiz.querySelector('[data-result]');
    const source = quiz.querySelector('[data-source]');
    const reset = quiz.querySelector('[data-reset]');
    question.textContent = q.question; source.textContent = q.source;
    const render = () => {
      choices.replaceChildren(); result.replaceChildren(); result.hidden = true; reset.hidden = true;
      q.options.forEach((label, index) => {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'quiz-option';
        const letter = document.createElement('span'); letter.textContent = String.fromCharCode(65 + index); letter.setAttribute('aria-hidden','true');
        button.append(letter, document.createTextNode(label));
        button.addEventListener('click', () => {
          [...choices.children].forEach((option, i) => {
            option.disabled = true;
            if (i === q.correct) option.classList.add('correct');
            if (i === index && i !== q.correct) option.classList.add('wrong');
          });
          const title = document.createElement('strong'); title.textContent = index === q.correct ? '맞혔어요. 데이터 감각 +1!' : `정답은 ${q.options[q.correct]}예요. 이유를 살펴볼까요?`;
          const explanation = document.createElement('p'); explanation.textContent = q.explanation;
          const link = document.createElement('a'); link.href = q.href; link.textContent = '관련 칼럼과 데이터 읽기';
          result.append(title, explanation, link); result.hidden = false; reset.hidden = false;
          try { sessionStorage.setItem(`sdl-quiz-${day}`, String(index)); } catch (_) { /* Storage is optional. */ }
        });
        choices.append(button);
      });
    };
    render();
    try { const saved = sessionStorage.getItem(`sdl-quiz-${day}`); if (saved !== null && /^[0-2]$/.test(saved)) choices.children[Number(saved)].click(); } catch (_) {}
    reset.addEventListener('click', () => { try {sessionStorage.removeItem(`sdl-quiz-${day}`);} catch (_) {} render(); choices.firstElementChild.focus(); });
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const value = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    document.querySelectorAll('[data-dataset]').forEach(row => { row.hidden = value !== 'all' && row.dataset.dataset !== value; if (!row.hidden) count++; });
    const status = document.querySelector('[data-filter-status]'); if (status) status.textContent = `${count}개 항목 표시`;
  }));
})();
