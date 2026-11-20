/* Fictional Fashion MD simulation. All prices and demand are game rules. */
(() => {
  'use strict';
  const form = document.querySelector('#md-game');
  if (!form) return;
  const BUDGET = 1_000_000;
  const products = [
    { id: 'tee', name: '그래픽 티셔츠', description: '선택한 스타일의 컬러와 그래픽', cost: 18_000, price: 35_000 },
    { id: 'jacket', name: '라이트 재킷', description: '무대 분위기를 담은 아우터', cost: 42_000, price: 78_000 },
    { id: 'bag', name: '토트백', description: '일상에서도 쓰는 패브릭 굿즈', cost: 10_000, price: 22_000 },
  ];
  const concepts = {
    campus: { name: '캠퍼스 팝', demand: [30, 8, 24], fit: { fresh: 1, chrome: .55, vintage: .8 }, hint: '밝고 편한 일상복을 찾는 팬들이에요. 티셔츠와 가방을 눈여겨보세요.' },
    night: { name: '나이트 신스', demand: [16, 15, 14], fit: { fresh: .55, chrome: 1, vintage: .7 }, hint: '무대 룩의 존재감을 원하는 팬들이에요. 재킷의 수요가 가장 높아요.' },
    retro: { name: '레트로 클럽', demand: [22, 10, 30], fit: { fresh: .7, chrome: .75, vintage: 1 }, hint: '빈티지한 색감과 가볍게 드는 굿즈를 좋아해요. 가방의 수요가 높아요.' },
  };
  const styles = {
    fresh: '프레시 캐주얼',
    chrome: '크롬 스트리트',
    vintage: '빈티지 믹스',
  };
  const state = { step: 1, started: false, completed: false };
  const $ = (selector) => document.querySelector(selector);
  const money = (amount) => amount.toLocaleString('ko-KR') + '원';
  const selectedConcept = () => form.elements.concept.value;
  const selectedStyle = () => form.elements.style.value;
  const track = (name, props) => {
    try { window.SDLAnalytics?.track(name, props); } catch { /* Measurement never blocks play. */ }
  };
  function focusHeading(element) {
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: 'start', behavior: 'auto' });
  }
  function updateSummary() {
    const concept = concepts[selectedConcept()];
    $('[data-concept-summary]').textContent = concept.name + ' · ' + concept.hint;
    $('[data-order-summary]').textContent = concept.name + ' / ' + styles[selectedStyle()] + '. ' + concept.hint;
  }
  function showStep(number) {
    state.step = number;
    form.querySelectorAll('[data-step]').forEach((section) => { section.hidden = Number(section.dataset.step) !== number; });
    form.querySelectorAll('[data-progress]').forEach((item) => {
      if (Number(item.dataset.progress) === number) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    updateSummary();
    if (number === 3) updateOrder();
    focusHeading($('#md-step-' + number));
  }
  function startRound() {
    if (state.started) return;
    state.started = true;
    track('game_start', { game: 'md' });
  }
  function createProducts() {
    const container = $('#md-products');
    products.forEach((product, index) => {
      const row = document.createElement('div');
      row.className = 'md-product';
      row.innerHTML = '<div><h3>' + product.name + '</h3><p>' + product.description + '</p></div>' +
        '<div class="md-product-price">원가 <strong>' + money(product.cost) + '</strong> / 개<br>판매가 <strong>' + money(product.price) + '</strong> / 개</div>' +
        '<div class="md-quantity"><button type="button" data-change="-5" aria-label="' + product.name + ' 5개 줄이기">−5</button>' +
        '<label class="sr-only" for="md-qty-' + product.id + '">' + product.name + ' 발주 수량</label>' +
        '<input id="md-qty-' + product.id + '" name="qty-' + product.id + '" type="number" inputmode="numeric" min="0" max="' + Math.floor(BUDGET / product.cost) + '" step="1" value="0" aria-describedby="md-order-error">' +
        '<button type="button" data-change="5" aria-label="' + product.name + ' 5개 늘리기">+5</button></div>';
      container.append(row);
      const input = row.querySelector('input');
      input.addEventListener('input', updateOrder);
      row.querySelectorAll('[data-change]').forEach((button) => {
        button.addEventListener('click', () => {
          const current = /^\d+$/.test(input.value) ? Number(input.value) : 0;
          input.value = String(Math.min(Math.floor(BUDGET / product.cost), Math.max(0, current + Number(button.dataset.change))));
          updateOrder();
        });
      });
      input.dataset.productIndex = index;
    });
  }
  function readOrder() {
    const quantities = products.map((product) => {
      const input = form.elements['qty-' + product.id];
      const value = input.value;
      if (!/^\d+$/.test(value)) return NaN;
      const number = Number(value);
      return Number.isSafeInteger(number) && number >= 0 && number <= Math.floor(BUDGET / product.cost) ? number : NaN;
    });
    return quantities.every(Number.isFinite) ? quantities : null;
  }
  function updateOrder() {
    const quantities = readOrder();
    const cost = quantities ? quantities.reduce((sum, quantity, index) => sum + quantity * products[index].cost, 0) : null;
    const empty = quantities && quantities.every((quantity) => quantity === 0);
    $('#md-cost').textContent = cost === null ? '수량 확인' : money(cost);
    $('#md-budget-left').textContent = cost === null ? '—' : money(BUDGET - cost);
    $('.md-budget').classList.toggle('is-over', cost !== null && cost > BUDGET);
    const error = !quantities ? '수량은 각 칸의 최댓값 이하인 0 이상의 정수로 입력해 주세요.' :
      cost > BUDGET ? '예산을 ' + money(cost - BUDGET) + ' 넘었어요. 발주 수량을 줄여 주세요.' :
      empty ? '한 가지 상품을 1개 이상 골라 주세요.' : '';
    $('#md-order-error').textContent = error;
    $('#md-launch').disabled = Boolean(error) || state.completed;
    products.forEach((product, index) => {
      const row = form.elements['qty-' + product.id].closest('.md-product');
      const quantity = quantities?.[index] ?? 0;
      row.querySelector('[data-change="-5"]').disabled = quantity <= 0 || state.completed;
      row.querySelector('[data-change="5"]').disabled = quantity >= Math.floor(BUDGET / product.cost) || state.completed;
    });
    return { quantities, cost, valid: !error };
  }
  // Bounded exact search: 3 products, finite fictional demand, a fixed 1m budget.
  // It computes a comparable full-budget opportunity; a single profitable unit cannot score 100.
  function bestProfit(concept) {
    let best = 0;
    for (let tee = 0; tee <= concept.demand[0]; tee++) {
      for (let jacket = 0; jacket <= concept.demand[1]; jacket++) {
        const spent = tee * products[0].cost + jacket * products[1].cost;
        if (spent > BUDGET) continue;
        const bag = Math.min(concept.demand[2], Math.floor((BUDGET - spent) / products[2].cost));
        const profit = tee * (products[0].price - products[0].cost) + jacket * (products[1].price - products[1].cost) + bag * (products[2].price - products[2].cost);
        best = Math.max(best, profit);
      }
    }
    return best;
  }
  function simulate(quantities, concept, style) {
    const fit = concept.fit[style];
    const demand = concept.demand.map((base) => Math.floor(base * fit));
    const sold = quantities.map((quantity, index) => Math.min(quantity, demand[index]));
    const cost = quantities.reduce((sum, quantity, index) => sum + quantity * products[index].cost, 0);
    const revenue = sold.reduce((sum, quantity, index) => sum + quantity * products[index].price, 0);
    const profit = revenue - cost;
    const maximum = bestProfit(concept);
    const score = Math.max(0, Math.min(100, Math.round(100 * profit / maximum)));
    const units = quantities.reduce((sum, value) => sum + value, 0);
    const soldUnits = sold.reduce((sum, value) => sum + value, 0);
    return { fit, demand, sold, cost, revenue, profit, maximum, score, units, soldUnits };
  }
  function showResult(quantities, result) {
    const concept = concepts[selectedConcept()];
    $('#md-result-concept').textContent = concept.name + ' / ' + styles[selectedStyle()];
    $('#md-result-title').textContent = result.profit < 0 ? '재고부터 줄여볼까요?' :
      result.score >= 85 ? '좋은 구성을 찾았어요.' :
      result.score >= 55 ? '가능성이 보이는 구성이에요.' : '다른 조합도 시도해 보세요.';
    $('#md-result-summary').textContent = quantities.reduce((sum, value) => sum + value, 0) + '개를 발주해 ' + result.soldUnits + '개를 판매했습니다.';
    $('#md-score').textContent = result.score;
    $('#md-revenue').textContent = money(result.revenue);
    $('#md-result-cost').textContent = money(result.cost);
    $('#md-profit').textContent = (result.profit > 0 ? '+' : '') + money(result.profit);
    $('#md-profit').dataset.negative = result.profit < 0 ? 'true' : 'false';
    $('#md-sellthrough').textContent = Math.round(100 * result.soldUnits / result.units) + '%';
    const rows = $('#md-result-rows');
    rows.replaceChildren();
    products.forEach((product, index) => {
      const row = document.createElement('tr');
      [product.name, quantities[index], result.demand[index], result.sold[index], quantities[index] - result.sold[index]].forEach((value, cellIndex) => {
        const cell = document.createElement(cellIndex === 0 ? 'th' : 'td');
        if (cellIndex === 0) cell.scope = 'row';
        cell.textContent = String(value);
        row.append(cell);
      });
      rows.append(row);
    });
    const feedback = [];
    feedback.push('스타일 적합도 ' + Math.round(result.fit * 100) + '%. ' + (result.fit === 1 ? '선택한 스타일이 이번 콘셉트의 선호와 잘 맞았어요.' : '콘셉트의 수요 힌트와 스타일 설명을 다시 맞춰보세요. 적합도가 낮아 구매 수요가 줄었습니다.'));
    const leftovers = quantities.map((quantity, index) => quantity - result.sold[index]);
    const leftoverUnits = leftovers.reduce((sum, value) => sum + value, 0);
    if (leftoverUnits) {
      const index = leftovers.indexOf(Math.max(...leftovers));
      feedback.push(products[index].name + ' 재고가 ' + leftovers[index] + '개 남았어요. 팔리지 않은 상품에도 발주 원가는 들어갑니다.');
    } else {
      feedback.push(result.profit === result.maximum ? '발주한 상품은 모두 팔렸고, 예산 안에서 가장 높은 모의 손익을 냈어요.' : '발주한 상품은 모두 팔렸어요. 품절된 상품의 추가 수요도 확인해 보세요.');
    }
    const unmet = result.demand.map((demand, index) => demand - result.sold[index]);
    const index = unmet.indexOf(Math.max(...unmet));
    if (unmet[index] > 0) feedback.push(products[index].name + ': ' + unmet[index] + '개를 더 찾았어요. ' + (result.profit === result.maximum ? '한정된 예산으로 모든 수요를 채울 수는 없어요.' : '남은 예산과 다른 상품의 발주 수량을 함께 살펴보세요.'));
    if (BUDGET - result.cost >= 100_000) feedback.push('예산이 ' + money(BUDGET - result.cost) + ' 남았어요. 수요가 남은 상품을 더 발주할 여지가 있었는지 살펴보세요.');
    const feedbackList = $('#md-feedback'); feedbackList.replaceChildren();
    feedback.forEach((text) => { const li = document.createElement('li'); li.textContent = text; feedbackList.append(li); });
    $('#md-score-formula').textContent = '점수 = 모의 손익 ÷ 이 콘셉트에서 가능한 최대 모의 이익(' + money(result.maximum) + ') × 100, 반올림. 최적 스타일·발주 수량을 기준으로 비교하며, 손실이면 0점입니다.';
    form.hidden = true;
    $('#md-result').hidden = false;
    focusHeading($('#md-result-title'));
  }
  form.querySelectorAll('[data-next]').forEach((button) => button.addEventListener('click', () => {
    if (state.completed) return;
    startRound();
    showStep(Math.min(3, state.step + 1));
  }));
  form.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => showStep(Math.max(1, state.step - 1))));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (state.step !== 3 || state.completed) return;
    const order = updateOrder();
    if (!order.valid) { $('#md-order-error').focus?.(); return; }
    startRound();
    const result = simulate(order.quantities, concepts[selectedConcept()], selectedStyle());
    state.completed = true;
    const scoreBand = result.score < 40 ? '0-39' : result.score < 70 ? '40-69' : '70-100';
    track('game_complete', { game: 'md', score_band: scoreBand });
    showResult(order.quantities, result);
  });
  $('#md-restart').addEventListener('click', () => {
    state.started = false; state.completed = false;
    products.forEach((product) => { form.elements['qty-' + product.id].value = '0'; });
    $('#md-result').hidden = true; form.hidden = false;
    showStep(1);
  });
  createProducts();
  updateSummary();
  updateOrder();
  form.hidden = false;
})();
