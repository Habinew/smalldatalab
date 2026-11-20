/* Original paper-doll stage and pop-up shop. Every drawing is local SVG. */
(() => {
  'use strict';
  const board = document.querySelector('#md-board');
  if (!board) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const palettes = {
    fresh: { top:'#91CBE4', light:'#E7EBCF', pants:'#47779D', detail:'#2454C8', ink:'#202D38' },
    chrome: { top:'#BECBD6', light:'#DBEBE9', pants:'#3B4362', detail:'#CDF56B', ink:'#171B2B' },
    vintage: { top:'#A7BE70', light:'#E8D2A5', pants:'#895E41', detail:'#E78445', ink:'#30352A' },
  };
  const names = { campus:'캠퍼스 팝', night:'나이트 신스', retro:'레트로 클럽' };
  const styleNames = { fresh:'프레시 캐주얼', chrome:'크롬 스트리트', vintage:'빈티지 믹스' };
  const productNames = ['티셔츠','재킷','가방'];
  let snapshot = { concept:'campus', style:'fresh', step:1, quantities:[0,0,0], result:null };
  let raf = 0, completeSale = null, serial = 0;
  const svg = (body,box='0 0 600 440',extra='') => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+box+'" aria-hidden="true" focusable="false" '+extra+'>'+body+'</svg>';
  const shirt = (p,x=0,y=0,scale=1) => '<g transform="translate('+x+' '+y+') scale('+scale+')" stroke="'+p.ink+'" stroke-width="3" stroke-linejoin="round"><path d="M25 11 8 22 16 43 28 38 25 85 75 83 73 38 86 43 94 22 75 10 63 17 38 17Z" fill="'+p.top+'"/><path d="M38 16Q49 33 64 16" fill="none"/><path d="M35 45 65 43 64 60 36 62Z" fill="'+p.detail+'" stroke="none"/><path d="m42 47 6 9 11-11" fill="none" stroke="'+p.light+'" stroke-width="3"/></g>';
  const jacket = (p,x=0,y=0,scale=1) => '<g transform="translate('+x+' '+y+') scale('+scale+')" stroke="'+p.ink+'" stroke-width="3" stroke-linejoin="round"><path d="M34 9 17 17 7 73 22 78 31 39 27 89 75 87 71 39 81 77 94 71 83 17 65 8 50 18Z" fill="'+p.pants+'"/><path d="m34 9 16 18 15-19-4 23-11-6-11 9Z" fill="'+p.top+'"/><path d="M50 26V87M33 54h11m12 0h12" stroke="'+p.light+'"/><path d="M28 76h46M10 68l13 4M79 70l12-4" stroke="'+p.detail+'" stroke-width="6"/></g>';
  const bag = (p,x=0,y=0,scale=1) => '<g transform="translate('+x+' '+y+') scale('+scale+')" stroke="'+p.ink+'" stroke-width="3" stroke-linejoin="round"><path d="M33 38V21q1-17 18-17 17 0 17 17v17" fill="none" stroke-width="7"/><path d="m20 31 62-2 7 60-74 1Z" fill="'+p.light+'"/><path d="M32 45h36v27H32Z" fill="'+p.detail+'" stroke="none"/><path d="m41 51 16 0-8 14Z" fill="'+p.top+'" stroke="none"/></g>';
  const drawings = [shirt,jacket,bag];
  function product(index,style) { return svg(drawings[index](palettes[style]||palettes.fresh),'0 0 100 100','class="md-product-drawing"'); }
  function doll(index,style,x,y,scale=1,cheer=false) {
    const p=palettes[style],skin=['#D8A47F','#EFD2A5','#B7805F'][index],hair=['#293737','#2B2C3B','#344031'][index];
    const lift=cheer?-28:0;
    let outfit='';
    if(style==='fresh') outfit='<path d="m-30-35-24 15 13 29 15-8 2 70 51-1-1-71 18 10 13-27-31-20-17 8Z" fill="'+(index===1?p.light:p.top)+'"/><path d="m-17-35 16 13 15-13" fill="none"/><path d="m-11-5 22-1 1 20-23 1Z" fill="'+p.detail+'" stroke="none"/><path d="m-5 1 7 9 5-12" fill="none" stroke="'+p.light+'" stroke-width="3"/>';
    else if(style==='chrome') outfit='<path d="m-26-36-22 10-12 68 17 4 14-51 4 60 51-1 1-60 14 49 17-4-15-68-31-14Z" fill="'+(index===1?p.top:p.pants)+'"/><path d="m-26-36 25 17 25-18-9 31-16-6-16 6Z" fill="'+p.top+'"/><path d="M-1-19v74M-20 28h12M7 28h13" stroke="'+p.light+'"/><path d="M-26 48h53" stroke="'+p.detail+'" stroke-width="6"/><rect x="-5" y="43" width="10" height="10" fill="'+p.light+'" stroke-width="2"/>';
    else outfit='<path d="m-28-35-27 13 13 34 16-9-2 61 55-1-1-61 16 11 14-33-32-15-15 9Z" fill="'+(index===2?p.light:p.top)+'"/><path d="M-28-34-15-28-26 3-42 12-55-22Z M23-35 55-22 42 11 26 2 13-28Z" fill="'+p.detail+'" stroke="none"/><path d="M-25 20h51M-25 31h51" stroke="'+p.light+'" stroke-width="6"/><path d="m-12-34 13 12 13-12" fill="none"/>';
    const leftLeg=index===0?'m-23 59-5 70 24 0 8-69':'m-23 59 3 72 21 0 3-71';
    const rightLeg=index===2?'m2 60 15 67 23-6-18-63':'m2 60 3 72 23-1-6-73';
    const hairPath=index===0?'<path d="M-28-67q-9-45 31-41 31-3 29 37L19-77l-4-15-14 13-19-9-4 22Z" fill="'+hair+'"/>':index===1?'<path d="M-30-71q-12-41 12-43 7-12 17-3 17-14 25 3 19-3 16 21 8 15-9 25l-9-19-12 10-11-10-16 17Z" fill="'+hair+'"/>':'<path d="M-28-66q-8-47 27-48 39 0 33 54l8 28-24-7 5-37-20-14-24 16 9 35-25 5Z" fill="'+hair+'"/>';
    return '<g class="md-doll" transform="translate('+x+' '+y+') scale('+scale+')" stroke="'+p.ink+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="0" cy="145" rx="44" ry="8" fill="#11111125" stroke="none"/>'+hairPath+'<path d="M-35-3Q-56 '+(38+lift)+' -68 '+(25+lift)+' M39-1Q57 '+(28+lift)+' 65 '+(16+lift)+'" fill="none" stroke="'+skin+'" stroke-width="14"/><path d="M-7-43v14h16v-14" fill="'+skin+'"/>'+ '<path d="'+leftLeg+'" fill="'+p.pants+'"/><path d="'+rightLeg+'" fill="'+p.pants+'"/>'+outfit+'<path d="m-29 129-10 10q-3 9 36 7l2-17Z" fill="'+p.light+'"/><path d="m7 130-1 15 35 0q5-7-14-16Z" fill="'+p.light+'"/><path d="M-32 140h24m21 0h20" stroke-width="2"/>'+'<ellipse cx="1" cy="-72" rx="27" ry="30" fill="'+skin+'"/>'+hairPath+'<ellipse cx="-8" cy="-73" rx="3.2" ry="4" fill="'+p.ink+'" stroke="none"/><ellipse cx="11" cy="-74" rx="3.2" ry="4" fill="'+p.ink+'" stroke="none"/>'+(cheer?'<path d="M-7-60q9 13 18-1" fill="'+p.light+'"/>':'<path d="M-5-59q7 6 15-2" fill="none" stroke-width="2.5"/>')+'<path d="m-27-59-5 4m60-5 5 4" stroke="'+p.detail+'" stroke-width="3"/></g>';
  }
  function backdrop(concept,shop=false) {
    let art='';
    if(concept==='campus') art='<rect width="600" height="440" fill="#B6D9DB"/><circle cx="491" cy="83" r="39" fill="#EBF1B1"/><path d="M-10 285V163q54-68 110 0v122M467 285V161q64-76 139 0v124" fill="#7DAB9A" stroke="#4B7B6F" stroke-width="3"/><path d="M97 285V92h301v193" fill="#D8E6CE" stroke="#5E8176" stroke-width="3"/><path d="M126 264V113h244v151" fill="#A8CBD0"/><path d="M126 162h244M126 211h244M187 113v151M308 113v151" stroke="#DAE8D2" stroke-width="8"/><path d="M0 310h600v130H0Z" fill="#527C78"/><path d="M0 405 600 349M95 440l92-130M505 440 412 310" stroke="#B1D2BB" stroke-width="2"/>';
    if(concept==='night') art='<rect width="600" height="440" fill="#202B58"/><path d="M35 0 150 338 285 338 124 0M466 0 320 338 492 338 560 0" fill="#6079D5" opacity=".33"/><path d="M0 312V177h57v-58h67v73h39v-91h67v173h58v-63h54v-85h54v94h56v-67h69v79h79v80Z" fill="#151D35"/><circle cx="467" cy="80" r="29" fill="#CCDDC9"/><circle cx="480" cy="68" r="29" fill="#202B58"/><path d="M69 64h12m-6-6v12M352 49h14m-7-7v14M535 181h12m-6-6v12" stroke="#CADCA5" stroke-width="3"/><path d="M0 312h600v128H0Z" fill="#384772"/><path d="M0 339h600M0 383h600M0 437h600M80 440l80-128M300 312v128M520 440 440 312" stroke="#7087BF" stroke-width="2"/>';
    if(concept==='retro') art='<rect width="600" height="440" fill="#D59B65"/><path d="M0 0h100v90H0m200-90h100v90H200m200-90h100v90H400M100 90h100v90H100m200-90h100v90H300m200-90h100v90H500M0 180h100v90H0m200-90h100v90H200m200-90h100v90H400" fill="#EACD99"/><path d="M160 310V142q0-105 140-105t140 105v168" fill="#7E9270" stroke="#445748" stroke-width="4"/><path d="M194 295V150q0-77 106-77t106 77v145" fill="#D7C291"/><circle cx="300" cy="132" r="38" fill="#E9DBC1" stroke="#6C7560" stroke-width="3"/><path d="M263 132h74M300 94v76M275 105l52 54M274 158l52-54" stroke="#9BA38D" stroke-width="2"/><path d="M0 310h600v130H0Z" fill="#7A7563"/><path d="M0 356h600M0 402h600M80 440l70-130M290 310v130M520 440 450 310" stroke="#D1C49C" stroke-width="2"/>';
    if(!shop)art+='<ellipse cx="300" cy="382" rx="244" ry="34" fill="#111B2224"/><path d="M38 300h51v85H38Zm475 0h51v85h-51Z" fill="#263735" stroke="#152322" stroke-width="3"/><circle cx="64" cy="355" r="15" fill="#4C665B"/><circle cx="538" cy="355" r="15" fill="#4C665B"/><circle cx="64" cy="319" r="7" fill="#A9C2A5"/><circle cx="538" cy="319" r="7" fill="#A9C2A5"/>';
    return art;
  }
  function stage() {
    const s=snapshot;
    return svg(backdrop(s.concept)+doll(0,s.style,152,250,.83)+doll(1,s.style,300,242,.98)+doll(2,s.style,453,255,.81));
  }
  function shop() {
    const s=snapshot,p=palettes[s.style];
    let stock='';
    s.quantities.forEach((ordered,index)=>{
      const quantity=s.result?ordered-s.result.sold[index]:ordered;
      const left=106+index*139;
      stock+='<g data-shop-product="'+index+'" opacity="'+(quantity>0?1:.13)+'">'+drawings[index](p,left,185,.92)+'</g><path d="M'+(left-5)+' 280h101" stroke="#2A3C36" stroke-width="7" stroke-linecap="round"/>';
      for(let i=0;i<Math.min(5,Math.ceil(quantity/10));i++)stock+='<path data-shop-box="'+index+'" data-box-position="'+i+'" d="m'+(left+4+i*10)+' 310 19-5 18 5v24h-37Z" fill="'+p.light+'" stroke="'+p.ink+'" stroke-width="2"/>';
    });
    return svg(backdrop(s.concept,true)+'<path d="M70 127h460v260H70Z" fill="#E3DCC0" stroke="#263B35" stroke-width="4"/><path d="M61 104h478l-20 59H80Z" fill="'+p.detail+'" stroke="#263B35" stroke-width="4"/><path d="m106 105-8 57m90-57-3 57m93-57 1 57m89-57 4 57m88-57 9 57" stroke="'+p.light+'" stroke-width="27"/><path d="M74 163q26 22 52 0 26 22 52 0 26 22 52 0 26 22 52 0 26 22 52 0 26 22 52 0 26 22 52 0 26 22 52 0 26 22 45 0" fill="none" stroke="#263B35" stroke-width="3"/>'+stock+'<path d="M60 343h480v53H60Z" fill="#647D69" stroke="#263B35" stroke-width="4"/><path d="M77 360h446" stroke="#ABC39A" stroke-width="3"/><rect x="209" y="60" width="183" height="44" rx="3" fill="#263B35"/><text x="300" y="90" text-anchor="middle" fill="#E7EBCF" font-size="22" font-weight="800" font-family="sans-serif">Small shop</text><g class="md-shopper md-shopper-a">'+doll(0,s.style,170,300,.56,true)+'</g><g class="md-shopper md-shopper-b">'+doll(2,s.style,420,310,.52,true)+'</g>');
  }
  function render() {
    const s=snapshot,shopMode=s.step===3||s.result;
    board.dataset.concept=s.concept;board.dataset.style=s.style;board.dataset.mode=shopMode?'shop':'stage';
    board.querySelector('[data-scene-name]').textContent=shopMode?'우리 팀의 팝업 스토어':names[s.concept];
    board.querySelector('[data-scene-stage]').innerHTML=shopMode?shop():stage();
    board.querySelector('[data-scene-style]').textContent=names[s.concept]+' / '+styleNames[s.style];
    board.querySelector('[data-scene-hint]').textContent=shopMode?'발주한 만큼 진열하고, 남은 재고까지 확인해요.':'멤버를 눌러 다른 스타일을 입혀보세요.';
    board.querySelector('.md-doll-controls').hidden=Boolean(shopMode);
    board.querySelector('.md-rack').hidden=!shopMode;
    board.querySelector('[data-scene-phase]').textContent=s.result?'영업 종료':shopMode?'오픈 준비':s.step===1?'콘셉트 선택':'스타일 피팅';
    board.querySelector('[data-preview-return]').firstChild.nodeValue=s.result?'결과로 돌아가기 ':'선택으로 돌아가기 ';
    board.querySelectorAll('[data-stock-count]').forEach((element,index)=>{
      const left=s.result?s.quantities[index]-s.result.sold[index]:s.quantities[index];
      element.textContent=left+'개';element.closest('.md-rack-item').dataset.empty=String(left===0);
      board.querySelectorAll('[data-stock-label]')[index].textContent=s.result?'남은 재고':'진열 수량';
      board.querySelectorAll('[data-stock-fill]')[index].style.width=(s.quantities[index]?(left/s.quantities[index]*100):0)+'%';
      board.querySelectorAll('[data-stock-product]')[index].innerHTML=product(index,s.style);
    });
    board.querySelector('[data-scene-outcome]').hidden=!s.result;
    if(s.result){
      const message=s.result.score>=85?'오늘의 팝업, 성공!':s.result.profit<0?'다음 팝업에서는 가볍게 시작해봐요.':'다음 팝업의 힌트를 찾았어요.';
      board.querySelector('[data-scene-outcome]').textContent=message;
    }
  }
  function update(value) { snapshot={...snapshot,...value};render(); }
  function cancel() { serial++;cancelAnimationFrame(raf);raf=0;completeSale=null;board.classList.remove('is-selling'); }
  function runSale(quantities,result,done) {
    cancel();
    if(motion.matches){done();return;}
    const token=serial;
    const panel=document.querySelector('#md-selling');
    panel.hidden=false;board.classList.add('is-selling');
    board.querySelector('[data-scene-phase]').textContent='팝업 영업 중';
    const progress=panel.querySelector('progress'),revenue=panel.querySelector('[data-sale-revenue]'),sold=panel.querySelector('[data-sale-sold]');
    progress.value=0;revenue.textContent='0원';sold.textContent='0개';
    const duration=2200,start=performance.now();
    completeSale=()=>{
      if(token!==serial)return;
      cancel();panel.hidden=true;done();
    };
    function frame(now) {
      if(token!==serial)return;
      const fraction=Math.min(1,(now-start)/duration);
      const counts=result.sold.map(value=>Math.floor(value*fraction));
      const sum=counts.reduce((value,count)=>value+count,0);
      const earned=counts.reduce((value,count,index)=>value+count*[35000,78000,22000][index],0);
      progress.value=Math.round(fraction*100);sold.textContent=sum+'개';revenue.textContent=earned.toLocaleString('ko-KR')+'원';
      board.querySelectorAll('[data-stock-count]').forEach((element,index)=>{
        const left=quantities[index]-counts[index];element.textContent=left+'개';
        element.closest('.md-rack-item').dataset.empty=String(left===0);
        board.querySelectorAll('[data-stock-fill]')[index].style.width=(quantities[index]?left/quantities[index]*100:0)+'%';
        board.querySelector('[data-shop-product="'+index+'"]').setAttribute('opacity',left>0?'1':'.13');
        board.querySelectorAll('[data-shop-box="'+index+'"]').forEach(box=>box.setAttribute('opacity',Number(box.dataset.boxPosition)<Math.ceil(left/10)?'1':'0'));
      });
      if(fraction===1){completeSale?.();return;}
      raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
    board.scrollIntoView({block:'start',behavior:'auto'});
    panel.querySelector('button').focus({preventScroll:true});
  }
  board.querySelectorAll('[data-look-swap]').forEach(button=>button.addEventListener('click',()=>{
    if(snapshot.step===3||snapshot.result)return;
    const choices=['fresh','chrome','vintage'];
    const next=choices[(choices.indexOf(snapshot.style)+1)%choices.length];
    const input=document.querySelector('input[name="style"][value="'+next+'"]');
    input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));
    board.querySelector('[data-scene-announcement]').textContent=styleNames[next]+'로 갈아입었어요.';
  }));
  document.querySelector('[data-skip-sale]').addEventListener('click',()=>completeSale?.());
  motion.addEventListener?.('change',()=>{if(motion.matches)completeSale?.();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)completeSale?.();});
  window.SDLMDVisual=Object.freeze({update,runSale,cancel,product});
  render();
})();
