/* Mori and friends run a pop-up. SVG scenery stays separate from the original character art. */
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
  const crew = [
    { id:'neuri', name:'느리', role:'맞이 담당', action:'손 흔들기', response:'느리가 손을 흔들어요. 어서 와요!' },
    { id:'mori', name:'모리', role:'관찰 담당', action:'눈동자 움직이기', response:'모리가 두리번두리번. 오늘은 어떤 상품이 잘 나갈까?' },
    { id:'chu', name:'츄', role:'응원 담당', action:'통통 뛰기', response:'츄가 통통! 우리 팝업, 잘해보자!' },
  ];
  const characters = window.SDLCharacters;
  let snapshot = { concept:'campus', style:'fresh', step:1, quantities:[0,0,0], result:null };
  let raf = 0, completeSale = null, serial = 0, renderSerial = 0;
  const svg = (body,box='0 0 600 440',extra='') => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+box+'" aria-hidden="true" focusable="false" '+extra+'>'+body+'</svg>';
  const shirt = (p,x=0,y=0,scale=1) => '<g transform="translate('+x+' '+y+') scale('+scale+')" stroke="'+p.ink+'" stroke-width="3" stroke-linejoin="round"><path d="M25 11 8 22 16 43 28 38 25 85 75 83 73 38 86 43 94 22 75 10 63 17 38 17Z" fill="'+p.top+'"/><path d="M38 16Q49 33 64 16" fill="none"/><path d="M35 45 65 43 64 60 36 62Z" fill="'+p.detail+'" stroke="none"/><path d="m42 47 6 9 11-11" fill="none" stroke="'+p.light+'" stroke-width="3"/></g>';
  const jacket = (p,x=0,y=0,scale=1) => '<g transform="translate('+x+' '+y+') scale('+scale+')" stroke="'+p.ink+'" stroke-width="3" stroke-linejoin="round"><path d="M34 9 17 17 7 73 22 78 31 39 27 89 75 87 71 39 81 77 94 71 83 17 65 8 50 18Z" fill="'+p.pants+'"/><path d="m34 9 16 18 15-19-4 23-11-6-11 9Z" fill="'+p.top+'"/><path d="M50 26V87M33 54h11m12 0h12" stroke="'+p.light+'"/><path d="M28 76h46M10 68l13 4M79 70l12-4" stroke="'+p.detail+'" stroke-width="6"/></g>';
  const bag = (p,x=0,y=0,scale=1) => '<g transform="translate('+x+' '+y+') scale('+scale+')" stroke="'+p.ink+'" stroke-width="3" stroke-linejoin="round"><path d="M33 38V21q1-17 18-17 17 0 17 17v17" fill="none" stroke-width="7"/><path d="m20 31 62-2 7 60-74 1Z" fill="'+p.light+'"/><path d="M32 45h36v27H32Z" fill="'+p.detail+'" stroke="none"/><path d="m41 51 16 0-8 14Z" fill="'+p.top+'" stroke="none"/></g>';
  const drawings = [shirt,jacket,bag];
  function product(index,style) { return svg(drawings[index](palettes[style]||palettes.fresh),'0 0 100 100','class="md-product-drawing"'); }
  function backdrop(concept,shop=false) {
    let art='';
    if(concept==='campus') art='<rect width="600" height="440" fill="#B6D9DB"/><circle cx="491" cy="83" r="39" fill="#EBF1B1"/><path d="M-10 285V163q54-68 110 0v122M467 285V161q64-76 139 0v124" fill="#7DAB9A" stroke="#4B7B6F" stroke-width="3"/><path d="M97 285V92h301v193" fill="#D8E6CE" stroke="#5E8176" stroke-width="3"/><path d="M126 264V113h244v151" fill="#A8CBD0"/><path d="M126 162h244M126 211h244M187 113v151M308 113v151" stroke="#DAE8D2" stroke-width="8"/><path d="M0 310h600v130H0Z" fill="#527C78"/><path d="M0 405 600 349M95 440l92-130M505 440 412 310" stroke="#B1D2BB" stroke-width="2"/>';
    if(concept==='night') art='<rect width="600" height="440" fill="#202B58"/><path d="M35 0 150 338 285 338 124 0M466 0 320 338 492 338 560 0" fill="#6079D5" opacity=".33"/><path d="M0 312V177h57v-58h67v73h39v-91h67v173h58v-63h54v-85h54v94h56v-67h69v79h79v80Z" fill="#151D35"/><circle cx="467" cy="80" r="29" fill="#CCDDC9"/><circle cx="480" cy="68" r="29" fill="#202B58"/><path d="M69 64h12m-6-6v12M352 49h14m-7-7v14M535 181h12m-6-6v12" stroke="#CADCA5" stroke-width="3"/><path d="M0 312h600v128H0Z" fill="#384772"/><path d="M0 339h600M0 383h600M0 437h600M80 440l80-128M300 312v128M520 440 440 312" stroke="#7087BF" stroke-width="2"/>';
    if(concept==='retro') art='<rect width="600" height="440" fill="#D59B65"/><path d="M0 0h100v90H0m200-90h100v90H200m200-90h100v90H400M100 90h100v90H100m200-90h100v90H300m200-90h100v90H500M0 180h100v90H0m200-90h100v90H200m200-90h100v90H400" fill="#EACD99"/><path d="M160 310V142q0-105 140-105t140 105v168" fill="#7E9270" stroke="#445748" stroke-width="4"/><path d="M194 295V150q0-77 106-77t106 77v145" fill="#D7C291"/><circle cx="300" cy="132" r="38" fill="#E9DBC1" stroke="#6C7560" stroke-width="3"/><path d="M263 132h74M300 94v76M275 105l52 54M274 158l52-54" stroke="#9BA38D" stroke-width="2"/><path d="M0 310h600v130H0Z" fill="#7A7563"/><path d="M0 356h600M0 402h600M80 440l70-130M290 310v130M520 440 450 310" stroke="#D1C49C" stroke-width="2"/>';
    if(!shop)art+='<ellipse cx="300" cy="382" rx="244" ry="34" fill="#111B2224"/><path d="M38 300h51v85H38Zm475 0h51v85h-51Z" fill="#263735" stroke="#152322" stroke-width="3"/><circle cx="64" cy="355" r="15" fill="#4C665B"/><circle cx="538" cy="355" r="15" fill="#4C665B"/><circle cx="64" cy="319" r="7" fill="#A9C2A5"/><circle cx="538" cy="319" r="7" fill="#A9C2A5"/>';
    return art;
  }
  function cast() {
    return '<div class="md-cast" role="group" aria-label="모리와 친구들. 각 친구를 눌러 인사해 보세요.">'+crew.map(friend=>
      '<button class="md-cast-member md-cast-'+friend.id+'" type="button" data-character-action="'+friend.id+'" aria-label="'+friend.name+' '+friend.action+'"><span class="md-cast-art">'+(characters?.markup(friend.id)||'')+'</span><span class="md-cast-caption"><strong>'+friend.name+'</strong><small>'+friend.role+'</small></span></button>'
    ).join('')+'</div>';
  }
  function stage() {
    const s=snapshot,p=palettes[s.style];
    const samples='<g class="md-style-samples"><rect x="330" y="18" width="242" height="112" rx="8" fill="#EEF0DC" stroke="'+p.ink+'" stroke-width="2"/><text x="346" y="40" fill="'+p.ink+'" font-size="13" font-weight="700" font-family="sans-serif">GOODS / '+styleNames[s.style]+'</text>'+drawings.map((draw,index)=>draw(p,346+index*73,49,.63)).join('')+'</g>';
    const light=s.concept==='night'?'<path d="M93 100Q160 63 217 104L231 382H77Z" fill="#DFE5CD" opacity=".8"/>':'';
    return svg(backdrop(s.concept)+light+samples)+cast();
  }
  function shop() {
    const s=snapshot,p=palettes[s.style];
    let stock='';
    s.quantities.forEach((ordered,index)=>{
      const quantity=s.result?ordered-s.result.sold[index]:ordered;
      const left=115+index*139;
      stock+='<g data-shop-product="'+index+'" opacity="'+(quantity>0?1:.13)+'">'+drawings[index](p,left,127,.72)+'</g><path d="M'+(left-7)+' 204h91" stroke="#2A3C36" stroke-width="6" stroke-linecap="round"/>';
      for(let i=0;i<Math.min(5,Math.ceil(quantity/10));i++)stock+='<path data-shop-box="'+index+'" data-box-position="'+i+'" d="m'+(left+i*10)+' 222 15-4 15 4v19h-30Z" fill="'+p.light+'" stroke="'+p.ink+'" stroke-width="2"/>';
    });
    const storefront='<path d="M70 88h460v205H70Z" fill="#E3DCC0" stroke="#263B35" stroke-width="4"/><path d="M61 65h478l-20 53H80Z" fill="'+p.detail+'" stroke="#263B35" stroke-width="4"/><path d="m106 66-8 51m90-51-3 51m93-51 1 51m89-51 4 51m88-51 9 51" stroke="'+p.light+'" stroke-width="27"/>'+stock+'<path d="M60 253h480v40H60Z" fill="#647D69" stroke="#263B35" stroke-width="4"/><path d="M77 268h446" stroke="#ABC39A" stroke-width="3"/><rect x="180" y="17" width="240" height="48" rx="3" fill="#263B35"/><text x="300" y="48" text-anchor="middle" fill="#E7EBCF" font-size="20" font-weight="800" font-family="sans-serif">MORI &amp; FRIENDS</text>';
    const floor='<path d="M0 293h600v147H0Z" fill="#CBD3BA"/><path d="M35 400h530" stroke="#7F9579" stroke-width="2"/>';
    return svg(backdrop(s.concept,true)+storefront+floor)+cast();
  }
  function render(celebrate=false) {
    const s=snapshot,shopMode=s.step===3||s.result;
    const currentRender=++renderSerial;
    characters?.reset(board);
    board.dataset.concept=s.concept;board.dataset.style=s.style;board.dataset.mode=shopMode?'shop':'stage';
    board.querySelector('[data-scene-name]').textContent=shopMode?'모리와 친구들 팝업':names[s.concept];
    board.querySelector('[data-scene-stage]').innerHTML=shopMode?shop():stage();
    board.querySelector('[data-scene-style]').textContent=names[s.concept]+' / '+styleNames[s.style];
    board.querySelector('[data-scene-hint]').textContent=shopMode?'진열 수량과 남은 재고를 확인해요. 친구들을 누르면 인사해요.':'모리는 두리번, 느리는 손 흔들기, 츄는 통통. 한 번 눌러봐요.';
    board.querySelector('.md-rack').hidden=!shopMode;
    board.querySelector('[data-scene-phase]').textContent=s.result?'영업 종료':shopMode?'오픈 준비':s.step===1?'콘셉트 선택':'굿즈 스타일';
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
    Promise.resolve(characters?.ready(board)).then(()=>{
      if(currentRender!==renderSerial||!celebrate||motion.matches)return;
      board.querySelectorAll('.md-cast .sdl-character').forEach(character=>characters?.activate(character));
    });
  }
  function update(value) {
    const celebrate=!snapshot.result&&value.result?.score>=85;
    snapshot={...snapshot,...value};render(celebrate);
  }
  function cancel() { serial++;cancelAnimationFrame(raf);raf=0;completeSale=null;board.classList.remove('is-selling');characters?.reset(board); }
  function runSale(quantities,result,done) {
    cancel();
    if(motion.matches){done();return;}
    const token=serial;
    const panel=document.querySelector('#md-selling');
    panel.hidden=false;board.classList.add('is-selling');
    board.querySelector('[data-scene-phase]').textContent='팝업 영업 중';
    board.querySelector('[data-scene-hint]').textContent='느리는 손님맞이, 모리는 관찰 중. 츄의 응원도 받아보세요!';
    board.querySelectorAll('.md-cast .sdl-character').forEach(character=>characters?.activate(character));
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
  board.addEventListener('click',event=>{
    const button=event.target.closest('[data-character-action]');
    if(!button||!board.contains(button))return;
    const friend=crew.find(member=>member.id===button.dataset.characterAction);
    if(!friend)return;
    characters?.activate(button.querySelector('.sdl-character'));
    board.querySelector('[data-scene-hint]').textContent=friend.response;
    board.querySelector('[data-scene-announcement]').textContent=friend.response;
  });
  document.querySelector('[data-skip-sale]').addEventListener('click',()=>completeSale?.());
  motion.addEventListener?.('change',()=>{if(motion.matches)completeSale?.();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)completeSale?.();});
  window.SDLMDVisual=Object.freeze({update,runSale,cancel,product});
  render();
})();
