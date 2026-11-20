/* Usage counts without direct identifiers. Never pass message text or free-form visitor input.
   API: SDLAnalytics.track(name, props), getStatus(), setOptOut(boolean).
   Session IDs expire after 30 minutes without a tracked action; no cross-tab ID. */
(() => {
  'use strict';
  if (window.SDLAnalytics) return;
  const script = document.currentScript;
  if (!script?.src) return;
  const base = new URL('.', script.src);
  const OPT_OUT = 'sdl-analytics-optout';
  const SESSION = 'sdl-analytics-session';
  const TTL = 30 * 60 * 1000;
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const LIMIT = 20;
  const pages = new Set(['index.html','lab.html','research.html','data.html','lecture.html','papers.html','play.html','privacy.html','smalldata/index.html','smalldata/resell.html','smalldata/hive.html','smalldata/heat.html','smalldata/kfashion.html','smalldata/ambassador.html']);
  const rules = {
    page_view: { referrer:['direct','search','social','other'], device:['mobile','desktop'] },
    chat_open: {},
    chat_question: { mode:['local','remote'], source:['chip','typed','retry'] },
    chat_answer: { mode:['local','remote'] },
    chat_error: { mode:['local','remote'] },
    game_start: { game:['md'] },
    game_complete: { game:['md'], score_band:['0-39','40-69','70-100'] }
  };
  const page = location.pathname.startsWith(base.pathname) ? (location.pathname.slice(base.pathname.length) || 'index.html') : '';
  const canonical = page === 'smalldata/' ? 'smalldata/index.html' : page;
  const eligible = pages.has(canonical);
  let ready = false, configured = false, endpoint = '', configError = false;
  let optOut = false, memorySession = null, sent = 0, pageViewSent = false;
  const queue = [], pending = new Set();
  try { optOut = localStorage.getItem(OPT_OUT) === '1'; } catch {}
  const preference = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const permitted = () => eligible && configured && !optOut && !preference();
  const notify = () => window.dispatchEvent(new CustomEvent('sdl:analytics-status', {detail:getStatus()}));
  function getStatus() {
    return { ready, configured, enabled:permitted(), optedOut:optOut, browserOptOut:preference(), pageEligible:eligible, configError };
  }
  function uuid() {
    if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    const value = [...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');
    return value.slice(0,8)+'-'+value.slice(8,12)+'-'+value.slice(12,16)+'-'+value.slice(16,20)+'-'+value.slice(20);
  }
  function sessionId() {
    const now = Date.now();
    let value = memorySession;
    try { value = JSON.parse(sessionStorage.getItem(SESSION)) || value; } catch {}
    if (!value || typeof value.id !== 'string' || !UUID.test(value.id) || !Number.isFinite(value.last) || now - value.last > TTL || value.last > now) value = { id:uuid(), last:now };
    value.last = now; memorySession = value;
    try { sessionStorage.setItem(SESSION,JSON.stringify(value)); } catch {}
    return value.id;
  }
  function sanitize(name, props) {
    if (!Object.prototype.hasOwnProperty.call(rules,name) || !props || typeof props !== 'object' || Array.isArray(props)) return null;
    const rule = rules[name], keys = Object.keys(rule);
    if (Object.keys(props).length !== keys.length || Object.keys(props).some(key=>!Object.prototype.hasOwnProperty.call(rule,key))) return null;
    const clean = {};
    for (const key of keys) { if (!rule[key].includes(props[key])) return null; clean[key] = props[key]; }
    return clean;
  }
  function track(name, props = {}) {
    const clean = sanitize(name,props);
    if (!eligible || !clean || optOut || preference() || sent + queue.length >= 100) return false;
    if (ready && !configured) return false;
    if (queue.length >= LIMIT) return false;
    queue.push({name,props:clean});
    drain(); return true;
  }
  function drain() {
    if (!ready) return;
    if (!permitted()) { queue.length = 0; return; }
    while (queue.length && pending.size < 4) {
      const item = queue.shift();
      let body;
      try { body = JSON.stringify({v:1,id:uuid(),sid:sessionId(),name:item.name,page:canonical,props:item.props}); } catch { continue; }
      const controller = new AbortController(); pending.add(controller); sent++;
      const timeout = setTimeout(()=>controller.abort(),4000);
      fetch(endpoint+'/events',{method:'POST',headers:{'Content-Type':'application/json'},body,credentials:'omit',cache:'no-store',keepalive:true,signal:controller.signal})
        .catch(()=>{}).finally(()=>{clearTimeout(timeout);pending.delete(controller);drain();});
    }
  }
  function referrerGroup() {
    if (!document.referrer) return 'direct';
    try {
      const host = new URL(document.referrer).hostname.toLowerCase();
      if (host === location.hostname) return 'direct';
      if (/(^|\.)(google\.[a-z.]+|bing\.com|search\.naver\.com|search\.daum\.net|duckduckgo\.com)$/.test(host)) return 'search';
      if (/(^|\.)(instagram\.com|facebook\.com|t\.co|x\.com|twitter\.com|youtube\.com|youtu\.be|threads\.net|threads\.com|kakao\.com)$/.test(host)) return 'social';
    } catch {}
    return 'other';
  }
  function pageView() {
    if (!pageViewSent && permitted()) {
      pageViewSent = track('page_view',{referrer:referrerGroup(),device:matchMedia('(max-width: 760px)').matches?'mobile':'desktop'});
    }
  }
  function setOptOut(value) {
    optOut = Boolean(value);
    try { localStorage.setItem(OPT_OUT,optOut?'1':'0'); } catch {}
    if (optOut || preference()) {
      queue.length=0;pending.forEach(c=>c.abort());memorySession=null;
      try { sessionStorage.removeItem(SESSION); } catch {}
    } else pageView();
    notify(); return getStatus();
  }
  window.SDLAnalytics = Object.freeze({track,getStatus,setOptOut});
  window.addEventListener('storage',event=>{if(event.key===OPT_OUT){optOut=event.newValue==='1';if(optOut){queue.length=0;pending.forEach(c=>c.abort());memorySession=null;try{sessionStorage.removeItem(SESSION);}catch{}}else pageView();notify();}});
  if (!eligible) { ready=true;notify();return; }
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(),4000);
  fetch(new URL('analytics-config.json',base),{credentials:'same-origin',cache:'no-cache',signal:controller.signal})
    .then(response=>{if(!response.ok)throw Error();return response.json();})
    .then(config=>{
      if(config?.enabled!==true || typeof config.endpoint!=='string' || !config.endpoint.trim())return;
      const url=new URL(config.endpoint.trim());
      if(url.username||url.password||url.search||url.hash||!['','/'].includes(url.pathname))throw Error();
      if(url.protocol!=='https:' && !(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))throw Error();
      endpoint=url.origin;configured=true;
    })
    .catch(()=>{configError=true;})
    .finally(()=>{clearTimeout(timeout);ready=true;pageView();drain();notify();});
})();
