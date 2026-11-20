(() => {
  'use strict';
  const $=selector=>document.querySelector(selector);
  const status=$('[data-stats-status]'), form=$('[data-stats-form]'), input=$('[data-stats-token]');
  const result=$('[data-stats-results]'), buttons=[...document.querySelectorAll('[data-stats-days]')];
  const labels={'index.html':'홈','lab.html':'연구실','research.html':'연구·논문','data.html':'칼럼·데이터','lecture.html':'강의','papers.html':'논문 대시보드','play.html':'패션 MD 게임','privacy.html':'이용 통계 안내','smalldata/index.html':'칼럼 아카이브','smalldata/resell.html':'리셀 데이터','smalldata/hive.html':'포토카드 데이터','smalldata/heat.html':'기온·패션 데이터','smalldata/kfashion.html':'K패션 데이터','smalldata/ambassador.html':'앰버서더 데이터'};
  let endpoint='', token='', days=7, busy=false, revision=0;
  const controllers=new Set();
  const count=value=>Number.isFinite(Number(value))&&Number(value)>=0?Math.floor(Number(value)):0;
  const format=value=>count(value).toLocaleString('ko-KR');
  function message(text,error=false){status.textContent=text;status.dataset.error=String(error);}
  function controls(){
    input.disabled=!endpoint||busy;
    $('[data-stats-login]').disabled=!endpoint||busy;
    $('[data-stats-logout]').disabled=!token&&!busy;
    $('[data-stats-refresh]').disabled=!token||busy;
    $('[data-stats-reports]').disabled=!token||busy;
    buttons.forEach(button=>{button.disabled=!token||busy;button.setAttribute('aria-pressed',String(Number(button.dataset.statsDays)===days));});
  }
  function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)?value:'—';}
  function periodText(period){
    const start=validDate(period?.start),end=validDate(period?.end_exclusive);
    if(start==='—'||end==='—')return '기간 확인 필요';
    const endDate=new Date(end+'T00:00:00Z');endDate.setUTCDate(endDate.getUTCDate()-1);
    return start+' ~ '+endDate.toISOString().slice(0,10)+' · 한국 시간';
  }
  function dateTime(value){
    if(!value)return '아직 없음';
    const date=new Date(value);
    return Number.isNaN(date.getTime())?'확인되지 않음':new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'medium',timeStyle:'short'}).format(date);
  }
  function cell(row,value,tag='td'){const element=document.createElement(tag);element.textContent=value;row.append(element);return element;}
  function change(current,previous){
    const a=count(current),b=count(previous),delta=a-b;
    if(!b)return a?'이전 기간 0회 → '+format(a)+'회':'이전 기간과 동일';
    const pct=Math.round(Math.abs(delta/b)*100);
    return delta===0?'이전 기간과 동일':'이전 기간보다 '+format(Math.abs(delta))+' '+(delta>0?'증가':'감소')+' ('+(delta>0?'+':'−')+pct+'%)';
  }
  function render(data){
    if(data?.schema_version!==1||!data.totals||!Array.isArray(data.top_pages)||!Array.isArray(data.daily))throw Error('INVALID_REPORT');
    const totals=data.totals,previous=data.previous?.totals||{};
    const metrics=[['page_views','페이지 조회'],['sessions','방문 세션'],['chat_opens','챗봇 열기'],['chat_questions','챗봇 질문'],['game_starts','게임 시작'],['game_completes','게임 완료']];
    const cards=$('[data-stats-metrics]');cards.replaceChildren();
    for(const [key,label] of metrics){
      const article=document.createElement('article');article.className='metric';
      const title=document.createElement('h2');title.textContent=label;
      const number=document.createElement('strong');number.textContent=format(totals[key]);
      const comparison=document.createElement('small');comparison.textContent=change(totals[key],previous[key]);
      article.append(title,number,comparison);cards.append(article);
    }
    $('[data-stats-period]').textContent=periodText(data.period);
    $('[data-stats-last]').textContent='마지막 기록: '+dateTime(data.last_event_at)+' · 조회 시각: '+dateTime(data.generated_at);
    $('[data-stats-empty]').hidden=Boolean(data.last_event_at)&&Object.values(totals).some(value=>count(value)>0);
    const pages=$('[data-stats-pages]');pages.replaceChildren();
    for(const item of data.top_pages.slice(0,30)){
      const row=document.createElement('tr');const name=cell(row,labels[item.page]||'기타 페이지');
      if(Object.prototype.hasOwnProperty.call(labels,item.page)){
        const link=document.createElement('a');link.href=item.page;link.textContent=labels[item.page];name.replaceChildren(link);
      }
      cell(row,format(item.views));cell(row,format(item.sessions));pages.append(row);
    }
    if(!pages.children.length){const row=document.createElement('tr');const text=cell(row,'조회 기록이 없습니다.');text.colSpan=3;pages.append(row);}
    const chat=$('[data-stats-chat]');chat.replaceChildren();
    for(const [mode,label] of [['local','기본 안내'],['remote','AI 연결']]){
      const item=data.chat?.[mode]||{};const row=document.createElement('tr');cell(row,label);cell(row,format(item.questions));cell(row,format(item.answers));cell(row,format(item.errors));chat.append(row);
    }
    const sources=data.chat?.sources||{};
    $('[data-stats-sources]').textContent='추천 질문 '+format(sources.chip)+'회 · 직접 입력 '+format(sources.typed)+'회 · 재시도 '+format(sources.retry)+'회';
    const game=data.games?.md||{};const starts=count(game.starts),completes=count(game.completes);
    $('[data-stats-games]').textContent='패션 MD 게임 시작 '+format(starts)+'회 / 완료 '+format(completes)+'회';
    const bands=game.score_bands||{};
    $('[data-stats-bands]').textContent='완료 점수: 0–39점 '+format(bands['0-39'])+'회 · 40–69점 '+format(bands['40-69'])+'회 · 70–100점 '+format(bands['70-100'])+'회';
    const daily=$('[data-stats-daily]');daily.replaceChildren();
    for(const item of data.daily.slice(0,31)){
      const row=document.createElement('tr');cell(row,validDate(item.day));
      for(const key of ['page_views','sessions','chat_opens','chat_questions','game_starts','game_completes'])cell(row,format(item[key]));
      daily.append(row);
    }
    result.hidden=false;
  }
  async function request(route){
    const controller=new AbortController();controllers.add(controller);const timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetch(endpoint+route,{headers:{Authorization:'Bearer '+token},credentials:'omit',cache:'no-store',signal:controller.signal});
      if(response.status===401||response.status===403)throw Error('AUTH');
      if(response.status===503)throw Error('NOT_READY');
      if(!response.ok)throw Error('NETWORK');
      return await response.json();
    }finally{clearTimeout(timeout);controllers.delete(controller);}
  }
  async function load(){
    if(!endpoint||!token||busy)return;
    const current=++revision;busy=true;controls();message('이용 통계를 불러오고 있습니다.');
    try{const data=await request('/report?days='+days);if(current!==revision)return;render(data);message('최근 '+days+'일의 이용 통계를 불러왔습니다.');}
    catch(error){if(current!==revision)return;result.hidden=true;message(error.message==='AUTH'?'관리자 토큰을 확인해 주세요.':error.message==='NOT_READY'?'통계 서버 설정이나 데이터베이스 연결이 준비되지 않았습니다.':'통계를 불러오지 못했습니다. 연결 상태를 확인하고 다시 시도해 주세요.',true);if(error.message==='AUTH'){token='';input.focus();}}
    finally{if(current===revision){busy=false;controls();}}
  }
  form.addEventListener('submit',event=>{event.preventDefault();const value=input.value.trim();if(!value||value.length>512)return;token=value;input.value='';load();});
  $('[data-stats-refresh]').addEventListener('click',load);
  buttons.forEach(button=>button.addEventListener('click',()=>{days=Number(button.dataset.statsDays);load();}));
  function logout(){
    revision++;controllers.forEach(controller=>controller.abort());token='';input.value='';busy=false;result.hidden=true;
    $('[data-reports-list]').replaceChildren();message('연결을 종료했습니다. 관리자 토큰은 이 화면에 남아 있지 않습니다.');controls();
  }
  $('[data-stats-logout]').addEventListener('click',logout);
  window.addEventListener('pagehide',()=>{token='';input.value='';controllers.forEach(controller=>controller.abort());});
  $('[data-stats-reports]').addEventListener('click',async()=>{
    if(!token||busy)return;const current=revision;busy=true;controls();
    const output=$('[data-reports-status]');output.textContent='주간 요약을 불러오고 있습니다.';
    try{
      const data=await request('/reports');if(current!==revision)return;
      if(!Array.isArray(data.reports))throw Error();
      const list=$('[data-reports-list]');list.replaceChildren();
      for(const report of data.reports.slice(0,53)){
        const row=document.createElement('li'),title=document.createElement('strong');
        title.textContent=periodText({start:report.period_start,end_exclusive:report.period_end});
        const text=document.createElement('span'),totals=report.summary?.totals||{};
        const delivery={sent:'메일 서비스 접수 완료',disabled:'이메일 발송 꺼짐',pending:'발송 대기',sending:'발송 요청 중',failed:'발송 오류',uncertain:'수신 여부 직접 확인 필요'}[report.email_status]||'발송 상태 확인 필요';
        text.textContent='조회 '+format(totals.page_views)+' · 세션 '+format(totals.sessions)+' · 챗봇 질문 '+format(totals.chat_questions)+' · 게임 완료 '+format(totals.game_completes)+' / '+delivery;
        row.append(title,text);list.append(row);
      }
      output.textContent=list.children.length?'저장된 주간 요약 '+list.children.length+'개':'아직 저장된 주간 요약이 없습니다.';
    }catch{if(current===revision)output.textContent='주간 요약을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';}
    finally{if(current===revision){busy=false;controls();}}
  });
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),5000);
  fetch('analytics-config.json',{credentials:'same-origin',cache:'no-cache',signal:controller.signal})
    .then(response=>{if(!response.ok)throw Error();return response.json();})
    .then(config=>{
      if(typeof config.endpoint!=='string'||!config.endpoint.trim()){message('통계 서버가 아직 연결되지 않았습니다. 실제 방문 수집과 정기 보고는 시작되지 않았습니다.');return;}
      const url=new URL(config.endpoint.trim());
      if(url.username||url.password||url.search||url.hash||!['','/'].includes(url.pathname)|| (url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname))))throw Error();
      endpoint=url.origin;$('[data-stats-endpoint]').textContent=endpoint;
      message(config.enabled===true?'관리자 토큰을 입력하면 통계를 확인할 수 있습니다.':'현재 새 기록 수집은 꺼져 있습니다. 관리자 토큰으로 저장된 기록을 조회할 수 있습니다.');
    }).catch(()=>message('통계 서버 설정을 불러오지 못했습니다. 설정 파일을 확인해 주세요.',true))
    .finally(()=>{clearTimeout(timeout);controls();});
})();
