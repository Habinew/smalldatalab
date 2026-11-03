/* 스몰데이터랩 용어 풀이: 본문에서 어려운 용어를 찾아 점선 밑줄을 긋고, 마우스를 올리거나(모바일은 탭) 포커스하면 짧은 설명을 띄운다.
   - 같은 구역(section/카드) 안에서는 용어마다 첫 등장 한 번만 표시한다.
   - 링크·제목·코드·SVG·태그·버튼 안은 건드리지 않는다.
   - 스타일은 이 파일이 직접 넣으므로 대시보드(인라인 CSS 페이지)에서도 그대로 쓸 수 있다. 색은 --key 가 있으면 그것, 없으면 --pos.
   사용: script 태그로 assets/glossary.js 를 defer 로드 (smalldata/ 안에서는 ../assets/glossary.js). 인라인으로 넣을 때를 대비해 이 주석에 닫는 script 태그를 쓰지 않는다. */
(function(){
  const TERMS = {
    /* 통계·모형 */
    "PLS-SEM": "부분최소제곱 구조방정식. 설문으로 잰 여러 개념 사이의 인과 경로를 한꺼번에 추정하는 방법으로, 표본이 작거나 모형이 복잡할 때 많이 씁니다.",
    "구조방정식": "직접 잴 수 없는 개념(잠재 변수)들 사이의 관계를 경로 모형으로 한꺼번에 검증하는 통계 기법입니다. SEM이라고도 합니다.",
    "SEM": "구조방정식(Structural Equation Modeling). 여러 개념 사이의 인과 경로를 한꺼번에 추정하는 통계 기법입니다.",
    "조절된 매개": "매개 경로(A → 매개 → B)의 세기가 어떤 조건(조절변수)에 따라 달라지는 모형입니다.",
    "매개변수": "A가 B에 영향을 줄 때 그 사이에서 다리 역할을 하는 변수입니다. A → 매개 → B.",
    "매개분석": "A가 B에 미치는 영향이 어떤 중간 변수(매개)를 거쳐 전달되는지 검증하는 분석입니다.",
    "조절변수": "A가 B에 미치는 영향의 크기나 방향을 바꾸는 조건 변수입니다. 예: 효과가 고관여층에서만 나타납니다.",
    "조절효과": "어떤 효과가 조건(조절변수)에 따라 커지거나 작아지거나 사라지는 현상입니다.",
    "간접효과": "매개변수를 거쳐 전달되는 효과입니다. 부트스트랩 신뢰구간이 0을 포함하지 않으면 유의하다고 봅니다.",
    "직접효과": "매개변수를 거치지 않고 A가 B에 바로 미치는 효과입니다.",
    "총효과": "직접효과와 간접효과를 합친 전체 영향입니다.",
    "부트스트랩": "표본에서 수천 번 다시 뽑아 통계량의 신뢰구간을 구하는 방법입니다. '5,000회 재추출' 같은 식으로 씁니다.",
    "표준화 계수": "변수들을 같은 단위로 맞춘 뒤의 영향력 크기(β)입니다. 절댓값이 클수록 영향이 큽니다.",
    "경로계수": "구조 모형에서 한 변수가 다른 변수에 미치는 영향의 크기(β)입니다.",
    "유의": "통계적으로 유의하다 = 그 결과가 우연히 나올 확률(p값)이 보통 5%보다 작다는 뜻입니다.",
    "n.s.": "not significant. 통계적으로 유의하지 않다는 표시입니다.",
    "R²": "모형이 결과 변수의 변동을 몇 %나 설명하는지 나타내는 값입니다. .279면 27.9%를 설명합니다.",
    "AUC-ROC": "분류 모델이 양성과 음성을 얼마나 잘 가르는지 나타내는 점수입니다. 0.5는 무작위, 1은 완벽입니다.",
    "AP": "평균 정밀도(Average Precision). 양성이 드문 데이터에서 모델이 양성을 얼마나 정확히 골라내는지 보는 점수입니다.",
    "평균 정밀도": "정밀도-재현율 곡선 아래 면적(AP)입니다. 양성이 드문 데이터에서 모델 성능을 볼 때 씁니다.",
    "F1": "정밀도(맞다고 한 것 중 실제로 맞은 비율)와 재현율(실제 양성 중 찾아낸 비율)의 조화평균입니다.",
    "다중회귀분석": "여러 독립변수가 하나의 결과에 미치는 영향을 동시에 추정하는 분석입니다.",
    "로지스틱 회귀": "예/아니오 같은 이분형 결과가 나올 확률을 추정하는 회귀 모형입니다.",
    "위계적 회귀": "변수를 단계적으로 추가하며 설명력이 얼마나 늘어나는지(ΔR²) 보는 회귀 분석입니다.",
    "GEE": "일반화 추정방정식. 같은 사람이 반복해서 고른 선택처럼 서로 묶인 자료를 다루는 회귀 방법입니다.",
    "PROCESS": "매개·조절 효과를 검증하는 SPSS 매크로(Hayes)입니다. Model 번호가 모형 형태를 가리킵니다.",
    "확인적 요인분석": "미리 정한 문항 묶음이 실제로 한 개념을 재고 있는지 확인하는 분석(CFA)입니다.",
    "탐색적 요인분석": "여러 문항이 몇 개의 요인으로 묶이는지 데이터에서 찾아내는 분석(EFA)입니다.",
    "CFA": "확인적 요인분석. 문항 묶음이 의도한 개념을 제대로 재는지 확인합니다.",
    "EFA": "탐색적 요인분석. 문항들이 몇 개의 요인으로 묶이는지 찾아냅니다.",
    "2차 요인": "여러 하위 요인을 다시 하나의 상위 개념으로 묶는 구조입니다.",
    "모형 적합도": "모형이 데이터와 얼마나 잘 맞는지 나타내는 지표들입니다. CFI .90 이상, RMSEA .08 이하면 양호하다고 봅니다.",
    "CFI": "비교적합지수. 1에 가까울수록 모형이 데이터와 잘 맞습니다(.90 이상 양호).",
    "RMSEA": "근사오차평균제곱근. 작을수록 좋고 .08 이하면 양호, .05 이하면 좋음으로 봅니다.",
    "다집단 분석": "집단(예: 업력·매출 규모)을 나눠 같은 모형이 똑같이 작동하는지 비교하는 분석입니다.",
    "성향점수매칭": "비교 집단을 비슷한 조건끼리 짝지어 공정하게 비교하는 방법입니다.",
    "고정효과": "브랜드별·지역별 고유한 차이를 모형 안에서 통제하는 방법입니다.",
    "생태학적 분석": "개인이 아니라 지역·국가 같은 집단 단위 데이터를 비교하는 분석입니다.",
    "t검정": "두 집단의 평균이 통계적으로 다른지 검정하는 방법입니다.",
    "분산분석": "세 집단 이상의 평균 차이를 검정하는 방법(ANOVA)입니다.",
    "ANOVA": "분산분석. 세 집단 이상의 평균 차이를 검정합니다.",
    "상관분석": "두 변수가 함께 움직이는 정도(r, −1~1)를 보는 분석입니다.",
    "교차검증": "데이터를 여러 조각으로 나눠 번갈아 학습·검증하면서 모델 성능을 안정적으로 재는 방법입니다.",
    "신뢰구간": "참값이 들어 있을 것으로 보는 범위입니다. 95% 신뢰구간이 0을 포함하지 않으면 효과가 유의하다고 봅니다.",
    /* 머신러닝·텍스트 */
    "SHAP": "머신러닝 모델의 예측에 각 변수가 얼마나 기여했는지를 게임이론(섀플리 값)으로 나눠 보여 주는 해석 기법입니다.",
    "CatBoost": "의사결정나무를 수천 개 쌓아 예측하는 그래디언트 부스팅 계열 머신러닝 모델입니다. 범주형 변수 처리에 강합니다.",
    "LightGBM": "속도가 빠른 그래디언트 부스팅 머신러닝 모델입니다.",
    "XGBoost": "널리 쓰이는 그래디언트 부스팅 머신러닝 모델입니다.",
    "Random Forest": "많은 의사결정나무의 다수결로 예측하는 앙상블 모델입니다.",
    "앙상블": "여러 모델의 예측을 합쳐 하나의 더 나은 예측을 만드는 방식입니다.",
    "SMOTE": "적은 쪽 클래스의 표본을 합성해 데이터 불균형을 줄이는 기법입니다.",
    "DistilBERT": "BERT 언어모델을 작고 빠르게 압축한 모델입니다. 문장의 의미를 숫자로 바꿔 분류·회귀에 씁니다.",
    "RoBERTa": "BERT를 더 많은 데이터로 다시 학습한 언어모델입니다. 여기서는 리뷰의 감정 점수를 매기는 데 썼습니다.",
    "BERT": "문장의 앞뒤 맥락을 함께 읽는 언어모델입니다. 텍스트 분류·감정 분석의 기본 도구로 쓰입니다.",
    "LLM": "대규모 언어모델. 방대한 글로 학습해 문장을 이해하고 생성하는 AI입니다.",
    "Word2Vec": "단어를 의미가 비슷하면 서로 가까워지는 숫자 벡터로 바꾸는 기법입니다.",
    "TF-IDF": "한 문서에 자주 나오지만 다른 문서에는 드문 단어에 높은 점수를 주는 키워드 가중치입니다.",
    "LDA": "토픽모델링 기법. 많은 글에서 함께 자주 등장하는 단어 묶음(토픽)을 자동으로 찾아냅니다.",
    "토픽모델링": "많은 글에서 함께 자주 등장하는 단어 묶음(토픽)을 자동으로 찾아내는 텍스트 분석입니다.",
    "의미연결망": "단어들이 같은 글에 함께 나오는 관계를 그물망으로 그려 중심 단어와 군집을 찾는 분석입니다.",
    "연어 분석": "'lipstick color'처럼 유독 자주 붙어 쓰이는 단어 짝(연어)을 찾는 분석입니다.",
    "LIWC": "글의 단어를 '긍정 정서', '관계', '인지' 같은 심리 범주로 분류해 비율을 세는 텍스트 분석 프로그램입니다.",
    "텍스트마이닝": "대량의 글에서 패턴·주제·감정을 통계적으로 뽑아내는 분석입니다.",
    "텍스트 마이닝": "대량의 글에서 패턴·주제·감정을 통계적으로 뽑아내는 분석입니다.",
    "감성분석": "글이 긍정적인지 부정적인지 점수로 매기는 분석입니다.",
    "2-core 필터링": "리뷰를 2건 이상 남긴 사용자와 리뷰를 2건 이상 받은 상품만 남기는 데이터 정제 방법입니다.",
    "콜드스타트": "리뷰·이력이 없는 신규 상품이나 사용자에게는 추천이 어려운 문제입니다.",
    "추천 시스템": "사용자 행동과 상품 정보를 바탕으로 살 만한 상품을 골라 보여 주는 알고리즘입니다.",
    "공정 추천": "인기 상품이나 큰 브랜드에 노출이 쏠리지 않도록 설계한 추천 방식입니다.",
    "뉴로-심볼릭": "신경망(패턴 학습)과 기호 논리(규칙·지식)를 결합한 AI 방식입니다.",
    "멀티모달": "이미지·텍스트·거래 기록처럼 종류가 다른 데이터를 함께 다루는 것입니다.",
    "하이퍼그래프": "하나의 연결선이 셋 이상의 노드를 동시에 묶을 수 있는 그래프입니다.",
    "GNN": "그래프 신경망. 노드와 연결 구조 데이터를 학습하는 신경망입니다.",
    "RLHF": "사람의 피드백으로 AI 출력을 다듬어 추가 학습시키는 방법입니다.",
    "XAI": "설명 가능한 AI. 모델이 왜 그런 판단을 했는지 사람이 이해할 수 있게 보여 주는 기술입니다.",
    "TBL": "트리플 보텀 라인. 경제·사회·환경 세 가지 성과를 함께 보는 기준입니다.",
    "A/B 테스트": "두 가지 안을 무작위로 나눠 보여 주고 어느 쪽이 더 나은지 실제 반응으로 비교하는 실험입니다.",
    "Google Trends": "구글 검색량을 기간·지역별로 0~100 상대 지수로 보여 주는 서비스입니다.",
    "구글 트렌드": "구글 검색량을 기간·지역별로 0~100 상대 지수로 보여 주는 서비스입니다.",
    /* 소비자·마케팅 이론 */
    "죽음 현저성": "죽음을 의식하게 된 심리 상태입니다. 실험에서는 죽음에 대해 글을 쓰게 해서 유도합니다.",
    "공포관리이론": "사람은 죽음의 공포를 다스리기 위해 자존감과 자기 문화의 가치에 더 매달린다는 심리학 이론입니다.",
    "조용한 럭셔리": "큰 로고 없이 소재·재단·장인정신으로 가치를 드러내는 절제된 명품 스타일입니다.",
    "미니멀리즘": "적게 소유하되 좋은 것을 고르려는 소비 성향입니다.",
    "자존감 추구": "흔들린 자존감을 회복하려고 성공한 집단에 자신을 동일시하거나 지위를 드러내려는 심리입니다.",
    "해석수준이론": "심리적 거리가 멀면 추상적으로, 가까우면 구체적으로 생각한다는 이론입니다. 메시지 프레이밍 연구의 근거입니다.",
    "메시지 프레이밍": "같은 내용을 어떤 틀(구체적 vs 추상적, 이득 vs 손실)로 표현하느냐입니다.",
    "소비자 효능감": "내 행동이 환경 문제 해결에 실제로 도움이 된다고 믿는 정도(PCE)입니다.",
    "PCE": "소비자 효능감. 내 행동이 환경 문제 해결에 실제로 도움이 된다고 믿는 정도입니다.",
    "공유 책임": "환경 문제를 기업과 소비자가 함께 책임진다는 인식입니다.",
    "인게이지먼트": "브랜드 활동에 소비자가 인지·감정·행동으로 참여하는 정도입니다.",
    "지불의사": "소비자가 지불할 용의가 있는 최대 금액(WTP)입니다.",
    "WTP": "지불의사(Willingness to Pay). 소비자가 지불할 용의가 있는 최대 금액입니다.",
    "버티컬 플랫폼": "패션처럼 한 분야에 특화한 전문 온라인 플랫폼입니다. 종합몰과 대비됩니다.",
    "공진화": "플랫폼과 입점 브랜드처럼 서로 영향을 주고받으며 함께 성장·변화하는 과정입니다.",
    "플랫폼 평판": "판매자와 소비자가 플랫폼을 얼마나 신뢰할 만하고 매력적이라고 평가하는지입니다.",
    "브랜드 자산": "브랜드 이름이 만들어 내는 장기적 가치(인지도·이미지·충성도)입니다.",
    "패션 리더십": "플랫폼이 미학·독점 상품·개인화로 패션 흐름을 이끄는 역량입니다.",
    "에이전틱 커머스": "AI 에이전트가 소비자를 대신해 상품을 고르고 결제까지 수행하는 쇼핑 방식입니다.",
    "AI 쇼핑 에이전트": "소비자를 대신해 추천·가격 감시·자율 구매까지 수행하는 AI 시스템입니다.",
    "알고리즘 신뢰": "AI 추천·판단의 능력과 공정성을 믿는 정도입니다.",
    "가격 공정성": "제시된 가격이 합리적이고 정당하다고 느끼는 정도입니다.",
    "패션 관여도": "패션에 대해 갖는 관심과 중요도의 수준입니다.",
    "S-O-R": "자극(Stimulus)이 소비자 내면 상태(Organism)를 거쳐 반응(Response)으로 이어진다는 소비자행동 틀입니다.",
    "정교화 가능성 모델": "사람이 메시지를 깊이 따져 보는 중심 경로와 겉단서로 판단하는 주변 경로로 설득된다는 이론(ELM)입니다.",
    "ELM": "정교화 가능성 모델. 메시지를 깊이 따져 보는 중심 경로와 겉단서로 판단하는 주변 경로로 설득된다는 이론입니다.",
    "경험재": "써 보기 전에는 품질을 알기 어려운 상품입니다. 화장품과 옷이 대표적입니다.",
    "크라우딩아웃": "한 신호(예: 높은 별점)가 다른 신호(개별 리뷰)의 가치를 밀어내는 현상입니다.",
    "구체성": "글이 얼마나 손에 잡히는 대상을 가리키는지의 정도입니다. Brysbaert 척도는 단어별 1~5점 사전 점수입니다.",
    "리뷰 유용성": "다른 소비자들이 '도움이 됐다'고 투표한 정도입니다.",
    "정보 비대칭": "파는 쪽은 알고 사는 쪽은 모르는 정보 격차입니다. 리뷰가 이를 줄여 줍니다.",
    "실천이론": "문화는 사람들이 일상에서 반복하는 '실천'(재료·역량·의미의 결합)으로 만들어진다는 사회학 이론입니다.",
    "소비가치": "소비자가 상품을 고를 때 중시하는 가치 차원(기능·감성·사회·윤리 등)입니다.",
    "글로벌 시민의식": "자신을 특정 국가를 넘어 세계 공동체의 일원으로 여기는 태도입니다.",
    "문화 개방성": "다른 나라 문화를 받아들이고 즐기려는 성향입니다.",
    "MZ세대": "1980년대 초~2000년대 초 출생의 밀레니얼 세대와 그 이후의 Z세대를 함께 부르는 말입니다.",
    "리셀": "한정판 등을 산 뒤 되파는 거래입니다. 발매가 대비 웃돈을 '프리미엄'이라고 합니다.",
    "프리미엄": "리셀가가 발매가보다 높은 정도(%)입니다. 음수면 발매가 아래에서 거래된다는 뜻입니다.",
    "중앙값": "값을 크기순으로 세웠을 때 한가운데 값입니다. 극단값의 영향을 덜 받습니다.",
    "세종과학펠로우십": "한국연구재단이 박사후연구자에게 5년간 지원하는 개인 기초연구 과제입니다.",
    "산학": "기업과 대학이 함께 수행하는 연구 과제입니다.",
    "SSCI": "사회과학 분야 국제 학술지 색인(Social Sciences Citation Index)입니다.",
    "SCIE": "과학기술 분야 국제 학술지 색인(Science Citation Index Expanded)입니다.",
    "Scopus": "엘스비어가 운영하는 국제 학술 문헌 색인입니다.",
    "KCI": "한국연구재단의 한국학술지인용색인. 국내 등재 학술지 목록입니다.",
    "교신저자": "논문의 책임 연락을 맡는 저자입니다. 보통 연구를 총괄한 사람입니다.",
    "1저자": "연구를 주도하고 논문을 주로 쓴 저자입니다."
  };

  const SKIP = "a,h1,h2,h3,code,pre,svg,button,input,textarea,select,script,style,.tag,.tags,.kw,.tools,.chip,.chips,.term,.gtip,nav,.brand,.eyebrow,.site-foot,footer,.mo,.k,.fd b,.source,.steps,.meta,.stats";
  const keys = Object.keys(TERMS).sort((a,b)=>b.length-a.length);
  const esc = k => k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  // 한글 용어는 뒤에 조사가 붙으므로 경계를 두지 않고, 영문·숫자 용어만 단어 경계를 본다(예: "AP" 가 "APJML" 에 걸리지 않게).
  const ko = keys.filter(k=>/[가-힣]/.test(k)).map(esc), la = keys.filter(k=>!/[가-힣]/.test(k)).map(esc);
  const re = new RegExp("(" + ko.join("|") + "|(?<![A-Za-z0-9])(?:" + la.join("|") + ")(?![A-Za-z0-9²]))", "g");

  const css = `
  .term{border-bottom:1px dotted var(--key,var(--pos,#2a78d6));cursor:help;text-decoration:none;color:inherit;transition:background .15s}
  .term:hover,.term:focus-visible,.term.on{background:var(--key-wash,var(--wash,rgba(42,120,214,.1)))}
  .gtip{position:fixed;z-index:60;max-width:300px;background:var(--ink,#0b0b0b);color:var(--bg,#f6f7f8);padding:9px 12px;border-radius:8px;font-size:12.5px;line-height:1.55;box-shadow:0 6px 22px rgba(0,0,0,.2);opacity:0;pointer-events:none;transform:translateY(4px);transition:opacity .12s,transform .12s;font-family:inherit}
  .gtip.on{opacity:1;transform:none}
  .gtip b{display:block;font-size:11px;letter-spacing:.06em;opacity:.65;margin-bottom:2px;font-weight:500}
  @media (prefers-reduced-motion:reduce){.gtip,.term{transition:none}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function wrap(root){
    const scopes = root.querySelectorAll("section, article, .card, header") ;
    const list = scopes.length ? scopes : [root];
    list.forEach(scope=>{
      if (scope.closest(SKIP)) return;
      const seen = new Set();
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {acceptNode(n){
        if(!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement; if(!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        // 중첩 scope(섹션 안의 카드)는 안쪽 scope 에서 처리
        const inner = p.closest("section, article, .card, header"); if(inner && inner!==scope) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT; }});
      const nodes = []; while(walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(n=>{
        const text = n.nodeValue; re.lastIndex = 0; let m, last = 0, frag = null;
        while((m = re.exec(text))){
          const term = m[1]; if(seen.has(term)) continue;
          seen.add(term);
          frag = frag || document.createDocumentFragment();
          frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          const s = document.createElement("span"); s.className = "term"; s.tabIndex = 0; s.setAttribute("role","button"); s.setAttribute("aria-label", term + " 뜻 보기");
          s.dataset.term = term; s.dataset.def = TERMS[term]; s.textContent = term; frag.appendChild(s);
          last = m.index + term.length;
        }
        if(frag){ frag.appendChild(document.createTextNode(text.slice(last))); n.parentNode.replaceChild(frag, n); }
      });
    });
  }

  const tip = document.createElement("div"); tip.className = "gtip"; tip.setAttribute("role","tooltip"); document.body.appendChild(tip);
  let cur = null;
  function show(el){
    cur = el; document.querySelectorAll(".term.on").forEach(t=>t.classList.remove("on")); el.classList.add("on");
    tip.innerHTML = "<b>" + el.dataset.term + "</b>" + el.dataset.def;
    tip.classList.add("on");
    const r = el.getBoundingClientRect(); const w = Math.min(300, innerWidth - 24); tip.style.maxWidth = w + "px";
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = Math.max(12, Math.min(innerWidth - tw - 12, r.left)); let y = r.bottom + 8;
    if (y + th > innerHeight - 8) y = r.top - th - 8;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hide(){ cur = null; tip.classList.remove("on"); document.querySelectorAll(".term.on").forEach(t=>t.classList.remove("on")); }
  document.addEventListener("mouseover", e=>{ const t = e.target.closest && e.target.closest(".term"); if(t && t!==cur) show(t); });
  document.addEventListener("mouseout", e=>{ const t = e.target.closest && e.target.closest(".term"); if(t && !t.contains(e.relatedTarget)) hide(); });
  document.addEventListener("focusin", e=>{ const t = e.target.closest && e.target.closest(".term"); if(t) show(t); });
  document.addEventListener("focusout", e=>{ if(e.target.closest && e.target.closest(".term")) hide(); });
  document.addEventListener("click", e=>{ const t = e.target.closest && e.target.closest(".term"); if(t){ e.preventDefault(); (cur===t && tip.classList.contains("on")) ? hide() : show(t); } else hide(); });
  document.addEventListener("keydown", e=>{ if(e.key==="Escape") hide(); });
  addEventListener("scroll", ()=>{ if(cur) hide(); }, {passive:true});

  function run(){ wrap(document.querySelector("main") || document.body); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
  window.SDL_GLOSSARY = { terms: TERMS, rescan: run };
})();
