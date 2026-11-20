(() => {
  'use strict';
  const status=document.querySelector('[data-privacy-status]');
  const button=document.querySelector('[data-privacy-toggle]');
  function render(){
    const api=window.SDLAnalytics;
    if(!api){status.textContent='집계 설정을 불러오지 못했습니다. 이 화면에서는 집계 요청을 보내지 않습니다.';button.disabled=true;return;}
    const info=api.getStatus();
    button.disabled=!info.ready||info.browserOptOut;
    button.textContent=info.optedOut?'이 브라우저에서 집계 허용':'이 브라우저에서 집계 제외';
    if(!info.ready)status.textContent='집계 설정을 확인하고 있습니다.';
    else if(info.browserOptOut)status.textContent='브라우저의 추적 방지 요청에 따라 이용 통계에서 제외됩니다.';
    else if(info.optedOut)status.textContent='이 브라우저는 이용 통계에서 제외됩니다.';
    else if(!info.configured)status.textContent='현재 이용 통계 수집은 꺼져 있습니다. 수집 서버가 연결되어 있지 않습니다.';
    else status.textContent='현재 페이지 조회와 챗봇·게임 이용 횟수를 집계합니다. 아래에서 이 브라우저를 제외할 수 있습니다.';
  }
  button.addEventListener('click',()=>{const api=window.SDLAnalytics;if(api)api.setOptOut(!api.getStatus().optedOut);render();});
  window.addEventListener('sdl:analytics-status',render);render();
})();
