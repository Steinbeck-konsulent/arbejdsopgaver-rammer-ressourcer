(() => {
  'use strict';

  const STORAGE_KEY = 'micro3i1_p23_v1';
  const stepNames = ['Intro','Arbejdsopgaver','Rammer og ressourcer','Forberedelse','Opsamling'];
  const rankItems = [
    'Hjernen&Hjertet – Sprogvurdering 3-6 og SprogTrappen',
    'Fokuspunkter i Hjernen&Hjertet',
    'Forberedelse og planlægning af kommende aktiviteter med børnene',
    'Kommunikation og opfølgning med forældre',
    'Kommunikation og samarbejde med eksterne samarbejdspartnere',
    'Dokumentation og andet skriftligt arbejde',
    'Forberedelse til møder og samtaler',
    'Andet'
  ];

  let currentStep = 1;

  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];

  function radioValue(name){
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  }

  function fieldValue(id){ return ($(id.startsWith('#') ? id : `#${id}`)?.value || '').trim(); }

  function buildRanking(){
    const holder = $('#ranking');
    holder.innerHTML = '';
    rankItems.forEach((item, i) => {
      const row = document.createElement('div');
      row.className = 'rank-row';
      const left = document.createElement('div');
      const label = document.createElement('label');
      label.setAttribute('for', `rank_${i}`);
      label.textContent = item;
      left.appendChild(label);
      if(item === 'Andet'){
        const wrap = document.createElement('div');
        wrap.className = 'other-wrap';
        const input = document.createElement('input');
        input.type = 'text'; input.id = 'rankOtherText'; input.placeholder = 'Skriv andet område';
        wrap.appendChild(input); left.appendChild(wrap);
      }
      const sel = document.createElement('select');
      sel.id = `rank_${i}`;
      sel.innerHTML = '<option value="">–</option>' + [1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('');
      sel.addEventListener('change', validateRankingLive);
      row.append(left, sel);
      holder.appendChild(row);
    });
  }

  function validateRankingLive(){
    const vals = $$('[id^="rank_"]').map(s => s.value).filter(Boolean);
    const duplicate = vals.length !== new Set(vals).size;
    $('#error4').textContent = duplicate ? 'Brug hvert prioriteringstal højst én gang.' : '';
  }

  function toggleWorkFollowup(){
    const v = radioValue('canSolve');
    const success = v === 'Ja, i høj grad';
    $('#workSuccess').classList.toggle('hidden', !success);
    $('#workFollowup').classList.toggle('hidden', !v || success);
  }

  function togglePrepFollowup(){
    const v = radioValue('prepFit');
    $('#prepFollowup').classList.toggle('hidden', !v || v === 'Ja');
  }

  function data(){
    const ranking = rankItems.map((item,i) => ({
      item: item === 'Andet' && fieldValue('rankOtherText') ? `Andet: ${fieldValue('rankOtherText')}` : item,
      rank: fieldValue(`rank_${i}`)
    })).filter(x => x.rank).sort((a,b) => Number(a.rank)-Number(b.rank));
    return {
      canSolve: radioValue('canSolve'),
      difficultTasks: fieldValue('difficultTasks'),
      signs: fieldValue('signs'),
      whatWorks: fieldValue('whatWorks'),
      framesMeaning: fieldValue('framesMeaning'),
      framesHelp: fieldValue('framesHelp'),
      framesHard: fieldValue('framesHard'),
      resourcesMeaning: fieldValue('resourcesMeaning'),
      resourcesHelp: fieldValue('resourcesHelp'),
      resourcesNeed: fieldValue('resourcesNeed'),
      resourcesEnable: fieldValue('resourcesEnable'),
      ranking,
      prepFit: radioValue('prepFit'),
      prepMismatch: fieldValue('prepMismatch'),
      goodCoherence: fieldValue('goodCoherence'),
      oneChange: fieldValue('oneChange'),
      leaderTalk: fieldValue('leaderTalk'),
      employeeName: fieldValue('employeeName')
    };
  }

  function saveLocal(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data())); } catch(e) {}
  }

  function restore(){
    let d = null;
    try { d = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch(e) {}
    if(!d) return;
    const radios = {canSolve:d.canSolve, prepFit:d.prepFit};
    Object.entries(radios).forEach(([name,val]) => {
      if(!val) return;
      const el = [...document.querySelectorAll(`input[name="${name}"]`)].find(x => x.value === val);
      if(el) el.checked = true;
    });
    ['difficultTasks','signs','whatWorks','framesMeaning','framesHelp','framesHard','resourcesMeaning','resourcesHelp','resourcesNeed','resourcesEnable','prepMismatch','goodCoherence','oneChange','leaderTalk','employeeName'].forEach(id => {
      if(d[id] != null && $(`#${id}`)) $(`#${id}`).value = d[id];
    });
    (d.ranking || []).forEach(r => {
      const idx = rankItems.findIndex(item => r.item === item || (item === 'Andet' && r.item.startsWith('Andet:')));
      if(idx >= 0) $(`#rank_${idx}`).value = r.rank;
      if(idx === rankItems.length-1 && r.item.startsWith('Andet:')) $('#rankOtherText').value = r.item.slice(6).trim();
    });
    toggleWorkFollowup(); togglePrepFollowup();
  }

  function showStep(n){
    currentStep = Math.max(1, Math.min(5,n));
    $$('.step').forEach(s => s.classList.toggle('active', Number(s.dataset.step) === currentStep));
    $('#stepLabel').textContent = `Trin ${currentStep} af 5`;
    $('#stepName').textContent = stepNames[currentStep-1];
    $('#progressBar').style.width = `${currentStep*20}%`;
    if(currentStep === 5) renderSummary();
    saveLocal();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function validateStep(n){
    const setError = (id,msg) => { $(id).textContent = msg; return false; };
    if(n === 2){
      $('#error2').textContent = '';
      const v = radioValue('canSolve');
      if(!v) return setError('#error2','Vælg et svar på det første spørgsmål.');
      if(v === 'Ja, i høj grad' && !fieldValue('whatWorks')) return setError('#error2','Skriv kort, hvad der er med til at skabe sammenhæng.');
      if(v !== 'Ja, i høj grad' && (!fieldValue('difficultTasks') || !fieldValue('signs'))) return setError('#error2','Uddyb kort hvilke opgaver det gælder, og hvad du lægger mærke til.');
    }
    if(n === 3){
      $('#error3').textContent = '';
      const required = ['framesMeaning','framesHelp','framesHard','resourcesMeaning','resourcesHelp','resourcesNeed'];
      if(required.some(id => !fieldValue(id))) return setError('#error3','Udfyld de korte felter, før du går videre.');
    }
    if(n === 4){
      $('#error4').textContent = '';
      const vals = $$('[id^="rank_"]').map(s => s.value).filter(Boolean);
      if(vals.length && vals.length !== new Set(vals).size) return setError('#error4','Brug hvert prioriteringstal højst én gang.');
      if(!radioValue('prepFit')) return setError('#error4','Vælg et svar om tiden til forberedelse/andet arbejde.');
      if(!fieldValue('goodCoherence') || !fieldValue('oneChange') || !fieldValue('leaderTalk')) return setError('#error4','Udfyld de tre afsluttende refleksionsfelter.');
      if(radioValue('prepFit') !== 'Ja' && !fieldValue('prepMismatch')) return setError('#error4','Uddyb kort, hvad der ikke passer sammen.');
    }
    return true;
  }

  function esc(s){ return String(s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
  function answer(v){ return esc(v || 'Ikke udfyldt'); }

  function renderSummary(){
    const d = data();
    const taskDetail = d.canSolve === 'Ja, i høj grad'
      ? `<div class="summary-label">Det, der skaber sammenhæng</div><p>${answer(d.whatWorks)}</p>`
      : `<div class="summary-label">Arbejdsopgaver, der er vanskelige at nå</div><p>${answer(d.difficultTasks)}</p><div class="summary-label">Det, jeg lægger mærke til</div><p>${answer(d.signs)}</p>`;
    const ranks = d.ranking.length ? '<ol>' + d.ranking.map(r => `<li>${esc(r.item)}</li>`).join('') + '</ol>' : '<p>Ingen områder prioriteret.</p>';
    $('#summary').innerHTML = `
      <div class="summary-section"><h3>Mit samlede blik</h3><div class="summary-label">Kan arbejdsopgaverne løses inden for tid, rammer og ressourcer?</div><p>${answer(d.canSolve)}</p>${taskDetail}</div>
      <div class="summary-section"><h3>Rammer</h3><div class="summary-label">Hvad betyder rammer for mig?</div><p>${answer(d.framesMeaning)}</p><div class="summary-label">Det, der hjælper</div><p>${answer(d.framesHelp)}</p><div class="summary-label">Det, der gør det vanskeligere</div><p>${answer(d.framesHard)}</p></div>
      <div class="summary-section"><h3>Ressourcer</h3><div class="summary-label">Hvad betyder ressourcer for mig?</div><p>${answer(d.resourcesMeaning)}</p><div class="summary-label">Ressourcer, der hjælper</div><p>${answer(d.resourcesHelp)}</p><div class="summary-label">Ressourcer, jeg mangler eller har brug for anderledes</div><p>${answer(d.resourcesNeed)}</p>${d.resourcesEnable ? `<div class="summary-label">Det ville gøre muligt</div><p>${answer(d.resourcesEnable)}</p>` : ''}</div>
      <div class="summary-section"><h3>Forberedelse / andet arbejde</h3><div class="summary-label">Det, der fylder mest</div>${ranks}<div class="summary-label">Passer tiden til opgaverne?</div><p>${answer(d.prepFit)}</p>${d.prepMismatch ? `<div class="summary-label">Det, der ikke passer sammen</div><p>${answer(d.prepMismatch)}</p>` : ''}</div>
      <div class="summary-section"><h3>Sammenhæng og videre dialog</h3><div class="summary-label">Det, der allerede hænger godt sammen</div><p>${answer(d.goodCoherence)}</p><div class="summary-label">Én ting, der kunne skabe bedre sammenhæng</div><p>${answer(d.oneChange)}</p><div class="summary-label">Det, jeg vil tale videre med min leder om</div><p>${answer(d.leaderTalk)}</p></div>`;
  }

  // --- Minimal PDF generator: no network, no external library ---
  function winAnsiHex(text){
    const map = {'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159};
    let hex='';
    for(const ch of String(text)){
      let code = ch.charCodeAt(0);
      if(map[ch] != null) code = map[ch];
      if(code > 255) code = 63;
      hex += code.toString(16).padStart(2,'0');
    }
    return hex.toUpperCase();
  }

  function wrapText(text, maxChars=88){
    const paras = String(text || '').replace(/\r/g,'').split('\n');
    const out=[];
    paras.forEach((p,pi) => {
      const words=p.split(/\s+/).filter(Boolean); let line='';
      if(!words.length){ out.push(''); return; }
      words.forEach(w => {
        const candidate=line ? `${line} ${w}` : w;
        if(candidate.length > maxChars && line){ out.push(line); line=w; } else line=candidate;
      });
      if(line) out.push(line);
      if(pi < paras.length-1) out.push('');
    });
    return out;
  }

  function pdfSections(d){
    const secs=[];
    const push=(title,items) => secs.push({title,items:items.filter(x => x.value)});
    push('Mit samlede blik', [
      {label:'Kan arbejdsopgaverne løses inden for tid, rammer og ressourcer?', value:d.canSolve},
      d.canSolve === 'Ja, i høj grad' ? {label:'Det, der skaber sammenhæng',value:d.whatWorks} : {label:'Arbejdsopgaver, der er vanskelige at nå',value:d.difficultTasks},
      d.canSolve === 'Ja, i høj grad' ? {label:'',value:''} : {label:'Det, jeg lægger mærke til',value:d.signs}
    ]);
    push('Rammer', [
      {label:'Hvad betyder rammer for mig?',value:d.framesMeaning},{label:'Det, der hjælper',value:d.framesHelp},{label:'Det, der gør det vanskeligere',value:d.framesHard}
    ]);
    push('Ressourcer', [
      {label:'Hvad betyder ressourcer for mig?',value:d.resourcesMeaning},{label:'Ressourcer, der hjælper',value:d.resourcesHelp},{label:'Ressourcer, jeg mangler eller har brug for anderledes',value:d.resourcesNeed},{label:'Det ville gøre muligt',value:d.resourcesEnable}
    ]);
    const rankText=d.ranking.map(r => `${r.rank}. ${r.item}`).join('\n');
    push('Forberedelse / andet arbejde', [
      {label:'Det, der fylder mest',value:rankText || 'Ingen områder prioriteret'},{label:'Passer tiden til opgaverne?',value:d.prepFit},{label:'Det, der ikke passer sammen',value:d.prepMismatch}
    ]);
    push('Sammenhæng og videre dialog', [
      {label:'Det, der allerede hænger godt sammen',value:d.goodCoherence},{label:'Én ting, der kunne skabe bedre sammenhæng',value:d.oneChange},{label:'Det, jeg vil tale videre med min leder om',value:d.leaderTalk}
    ]);
    return secs;
  }

  function generatePdfBlob(d){
    const pageW=595.28, pageH=841.89, left=52, right=52, top=54, bottom=54;
    const contentW=pageW-left-right;
    const objects=[]; let nextId=1;
    const fontId=nextId++; const pagesId=nextId++; const pageIds=[]; const contentIds=[];
    const pageStreams=[]; let stream=[]; let y=top;
    const addText=(text,size=10,bold=false,leading=14) => {
      const maxChars=Math.max(25, Math.floor((contentW/(size*0.50))));
      const lines=wrapText(text,maxChars);
      const needed=Math.max(1,lines.length)*leading;
      if(y+needed > pageH-bottom) newPage();
      lines.forEach(line => {
        if(y+leading > pageH-bottom) newPage();
        stream.push(`BT /F1 ${size} Tf ${bold ? '0.2' : '0.05'} g 1 0 0 1 ${left} ${pageH-y} Tm <${winAnsiHex(line)}> Tj ET`);
        y+=leading;
      });
    };
    const gap=(n=7) => { y+=n; if(y > pageH-bottom) newPage(); };
    const newPage=() => { if(stream.length) pageStreams.push(stream.join('\n')); stream=[]; y=top; };

    addText('3i1 - punkt 23',18,true,22);
    addText('Arbejdsopgaver, rammer og ressourcer',13,true,17);
    gap(5);
    addText(`Navn: ${d.employeeName}`,10,false,14);
    addText(`Dato: ${new Date().toLocaleDateString('da-DK')}`,10,false,14);
    gap(12);
    pdfSections(d).forEach(sec => {
      addText(sec.title,13,true,18); gap(2);
      sec.items.forEach(it => {
        if(it.label){ addText(it.label,9,true,12); }
        addText(it.value || 'Ikke udfyldt',10,false,14); gap(5);
      });
      gap(6);
    });
    addText('Besvarelsen er genereret lokalt i browseren.',8,false,11);
    newPage();

    // Allocate page/content ids now
    pageStreams.forEach(() => { pageIds.push(nextId++); contentIds.push(nextId++); });
    objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objects[pagesId] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    pageStreams.forEach((s,i) => {
      objects[pageIds[i]] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`;
      objects[contentIds[i]] = `<< /Length ${new TextEncoder().encode(s).length} >>\nstream\n${s}\nendstream`;
    });
    const catalogId=nextId++;
    objects[catalogId]=`<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

    let pdf='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
    const offsets=[0];
    for(let id=1; id<nextId; id++){
      offsets[id]=new TextEncoder().encode(pdf).length;
      pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
    }
    const xrefPos=new TextEncoder().encode(pdf).length;
    pdf += `xref\n0 ${nextId}\n0000000000 65535 f \n`;
    for(let id=1;id<nextId;id++) pdf += `${String(offsets[id]).padStart(10,'0')} 00000 n \n`;
    pdf += `trailer\n<< /Size ${nextId} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
    const bytes=new Uint8Array(pdf.length);
    for(let i=0;i<pdf.length;i++) bytes[i]=pdf.charCodeAt(i)&0xFF;
    return new Blob([bytes],{type:'application/pdf'});
  }

  function downloadPdf(){
    $('#error5').textContent=''; $('#downloadStatus').textContent='';
    const d=data();
    if(!d.employeeName){ $('#error5').textContent='Skriv dit navn, før du henter PDF\'en.'; return; }
    saveLocal();
    try{
      const blob=generatePdfBlob(d);
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      const safe=d.employeeName.replace(/[^a-zA-Z0-9æøåÆØÅ_-]+/g,'_').replace(/^_+|_+$/g,'');
      a.href=url; a.download=`3i1-punkt-23-${safe || 'besvarelse'}.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      $('#downloadStatus').textContent='PDF hentet. Husk at sende den efter den aftale, der er lavet på din arbejdsplads.';
    }catch(e){
      console.error(e); $('#error5').textContent='PDF kunne ikke dannes på denne enhed. Prøv igen eller brug en anden browser.';
    }
  }

  function clearLocal(ask=true){
    if(ask && !confirm('Vil du slette alle svar, der er gemt lokalt på denne enhed?')) return;
    try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
    document.querySelectorAll('textarea,input[type="text"]').forEach(el => el.value='');
    document.querySelectorAll('input[type="radio"]').forEach(el => el.checked=false);
    document.querySelectorAll('select').forEach(el => el.value='');
    toggleWorkFollowup(); togglePrepFollowup(); renderSummary(); showStep(1);
  }

  document.addEventListener('input', e => { if(e.target.matches('textarea,input[type="text"]')) saveLocal(); });
  document.addEventListener('change', e => {
    if(e.target.name === 'canSolve') toggleWorkFollowup();
    if(e.target.name === 'prepFit') togglePrepFollowup();
    saveLocal();
  });
  $$('.next').forEach(btn => btn.addEventListener('click', () => { if(validateStep(currentStep)) showStep(currentStep+1); }));
  $$('.prev').forEach(btn => btn.addEventListener('click', () => showStep(currentStep-1)));
  $('#downloadPdf').addEventListener('click', downloadPdf);
  $('#clearAfter').addEventListener('click', () => clearLocal(true));
  $('#resetTop').addEventListener('click', () => clearLocal(true));

  buildRanking(); restore(); showStep(1);
})();
