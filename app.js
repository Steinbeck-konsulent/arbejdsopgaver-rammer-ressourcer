(() => {
  'use strict';
  const STORAGE_KEY = 'micro3i1_p23_v4';
  const form = document.getElementById('microForm');
  const steps = [...document.querySelectorAll('.step')];
  let currentStep = 1;

  const $ = (id) => document.getElementById(id);
  const radioValue = (name) => document.querySelector(`input[name="${name}"]:checked`)?.value || '';
  const setHidden = (el, hidden) => el.classList.toggle('hidden', hidden);

  function stateFromForm() {
    const data = {};
    document.querySelectorAll('[data-save]').forEach(el => data[el.id] = el.value);
    ['overallFit','hardTasks','resourcesMissing','prepFit','talkLeader'].forEach(name => data[name] = radioValue(name));
    document.querySelectorAll('.rank-select').forEach(el => data[el.id] = el.value);
    return data;
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateFromForm()));
  }
  function restore() {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) {}
    Object.entries(data).forEach(([key,val]) => {
      const el = document.getElementById(key);
      if (el) el.value = val;
      else if (['overallFit','hardTasks','resourcesMissing','prepFit','talkLeader'].includes(key)) {
        const r = document.querySelector(`input[name="${key}"][value="${CSS.escape(val)}"]`);
        if (r) r.checked = true;
      }
    });
    refreshBranches();
  }
  function clearStored() { localStorage.removeItem(STORAGE_KEY); }
  function resetAll() {
    if (!confirm('Vil du slette dine svar og starte forfra?')) return;
    form.reset(); clearStored(); currentStep = 1; refreshBranches(); showStep(1);
  }

  function refreshBranches() {
    const fit = radioValue('overallFit');
    setHidden($('highFitBranch'), fit !== 'Ja, i høj grad');
    setHidden($('otherFitBranch'), !fit || fit === 'Ja, i høj grad');
    setHidden($('hardTasksBranch'), radioValue('hardTasks') !== 'Ja');
    setHidden($('resourceBranch'), radioValue('resourcesMissing') !== 'Ja');
    setHidden($('prepFitBranch'), !['For det meste','Kun delvist','Nej'].includes(radioValue('prepFit')));
    setHidden($('talkBranch'), radioValue('talkLeader') !== 'Ja');
  }

  function showStep(n) {
    currentStep = Math.max(1, Math.min(5, n));
    steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === currentStep));
    $('progressLabel').textContent = `Trin ${currentStep} af 5`;
    $('progressPercent').textContent = `${currentStep * 20} %`;
    $('progressBar').style.width = `${currentStep * 20}%`;
    if (currentStep === 5) renderSummary();
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function validateStep2() {
    $('error2').textContent = '';
    if (!radioValue('overallFit')) { $('error2').textContent = 'Vælg først det svar, der passer bedst.'; return false; }
    return true;
  }
  function validateRanking() {
    const vals = [...document.querySelectorAll('.rank-select')].map(s => s.value).filter(Boolean);
    const dup = vals.some((v,i) => vals.indexOf(v) !== i);
    $('rankError').textContent = dup ? 'Hver placering fra 1 til 5 kan kun bruges én gang.' : '';
    return !dup;
  }

  document.querySelectorAll('[data-next]').forEach(btn => btn.addEventListener('click', () => {
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 4 && !validateRanking()) return;
    save(); showStep(currentStep + 1);
  }));
  document.querySelectorAll('[data-prev]').forEach(btn => btn.addEventListener('click', () => { save(); showStep(currentStep - 1); }));
  document.addEventListener('change', (e) => {
    if (e.target.matches('input[type=radio], .rank-select')) { refreshBranches(); save(); if (e.target.classList.contains('rank-select')) validateRanking(); }
  });
  document.addEventListener('input', (e) => { if (e.target.matches('[data-save]')) save(); });
  $('resetTop').addEventListener('click', resetAll);
  $('clearAll').addEventListener('click', resetAll);

  const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  function rankingData() {
    return [...document.querySelectorAll('.rank-select')]
      .filter(s => s.value)
      .map(s => ({rank:Number(s.value), label:s.dataset.label === 'Andet' && $('otherPrep').value.trim() ? `Andet – ${$('otherPrep').value.trim()}` : s.dataset.label}))
      .sort((a,b) => a.rank-b.rank);
  }
  function section(title, rows) {
    const body = rows.filter(r => r[1]).map(([k,v]) => `<p><span class="summary-label">${esc(k)}:</span> ${esc(v)}</p>`).join('');
    return `<div class="summary-section"><h3>${esc(title)}</h3>${body || '<p>Ingen uddybning.</p>'}</div>`;
  }
  function renderSummary() {
    const fit = radioValue('overallFit');
    const ranks = rankingData();
    const rankText = ranks.length ? ranks.map(x => `${x.rank}. ${x.label}`).join('\n') : 'Ingen prioritering angivet';
    const html = [
      section('Mit samlede blik på punkt 23', [['Samlet vurdering',fit],['Det, jeg især tænker på', fit === 'Ja, i høj grad' ? $('fitHelps').value : $('fitThoughts').value]]),
      section('Mine arbejdsopgaver', [['Opgaver vanskelige at nå',radioValue('hardTasks')],['Hvilke opgaver',$('hardTasksWhich').value],['Det, jeg lægger mærke til',$('hardTasksSigns').value]]),
      section('Mine rammer', [['Rammer betyder for mig',$('framesMeaning').value],['Det hjælper',$('framesHelp').value],['Det gør det vanskeligere',$('framesHard').value]]),
      section('Mine ressourcer', [['Ressourcer betyder for mig',$('resourcesMeaning').value],['Særligt hjælpsomme ressourcer',$('resourcesHelp').value],['Mangler/brug for anderledes',radioValue('resourcesMissing')],['Hvilke ressourcer',$('resourcesWhat').value],['Det ville gøre muligt',$('resourcesEnable').value]]),
      section('Min tid til forberedelse eller andet arbejde', [['Det fylder mest',rankText],['Passer tiden til opgaverne',radioValue('prepFit')],['Det, der ikke passer sammen',$('prepMismatch').value]]),
      section('Sammenhæng og videre dialog', [['Det hænger allerede godt sammen',$('worksWell').value],['Én ting, der kunne skabe bedre sammenhæng',$('oneChange').value],['Vigtigt at tale videre med leder om',radioValue('talkLeader')],['Hvad der er vigtigt at tale om',$('talkWhat').value]])
    ].join('');
    $('summary').innerHTML = html;
  }

  // Minimal PDF writer. Uses the PDF standard Helvetica font with WinAnsi encoding.
  function winAnsiBytes(str) {
    const map = {'€':128,'‚':130,'ƒ':131,'„':132,'…':133,'†':134,'‡':135,'ˆ':136,'‰':137,'Š':138,'‹':139,'Œ':140,'Ž':142,'‘':145,'’':146,'“':147,'”':148,'•':149,'–':150,'—':151,'˜':152,'™':153,'š':154,'›':155,'œ':156,'ž':158,'Ÿ':159};
    const out=[];
    for (const ch of String(str)) {
      const cp=ch.codePointAt(0);
      if (cp <= 255) out.push(cp); else if (map[ch] != null) out.push(map[ch]); else out.push(63);
    }
    return out;
  }
  function pdfEscapeBytes(bytes) {
    let s='';
    for (const b of bytes) {
      if (b===40||b===41||b===92) s+='\\'+String.fromCharCode(b);
      else if (b<32 || b>126) s+='\\'+b.toString(8).padStart(3,'0');
      else s+=String.fromCharCode(b);
    }
    return s;
  }
  function wrapText(text, max=88) {
    const paras=String(text||'').split(/\n+/); const lines=[];
    for (const p of paras) {
      const words=p.trim().split(/\s+/).filter(Boolean); let line='';
      if (!words.length) { lines.push(''); continue; }
      for (const w of words) {
        const test=line ? line+' '+w : w;
        if (test.length>max && line) { lines.push(line); line=w; } else line=test;
      }
      if (line) lines.push(line);
    }
    return lines;
  }
  function buildPdfText() {
    const name=$('employeeName').value.trim();
    const fit=radioValue('overallFit');
    const ranks=rankingData();
    const blocks=[
      ['3i1 – punkt 23: Arbejdsopgaver, rammer og ressourcer', []],
      ['Navn', [name]], ['Dato', [new Date().toLocaleDateString('da-DK')]],
      ['Samlet blik på punkt 23',[`Samlet vurdering: ${fit||'Ikke besvaret'}`, `Uddybning: ${fit==='Ja, i høj grad' ? $('fitHelps').value : $('fitThoughts').value}`]],
      ['Arbejdsopgaver',[`Opgaver vanskelige at nå: ${radioValue('hardTasks')||'Ikke relevant/ikke besvaret'}`,`Hvilke opgaver: ${$('hardTasksWhich').value}`,`Det jeg lægger mærke til: ${$('hardTasksSigns').value}`]],
      ['Rammer',[`Rammer betyder for mig: ${$('framesMeaning').value}`,`Det hjælper: ${$('framesHelp').value}`,`Det gør det vanskeligere: ${$('framesHard').value}`]],
      ['Ressourcer',[`Ressourcer betyder for mig: ${$('resourcesMeaning').value}`,`Særligt hjælpsomme: ${$('resourcesHelp').value}`,`Mangler/brug for anderledes: ${radioValue('resourcesMissing')||'Ikke besvaret'}`,`Hvilke: ${$('resourcesWhat').value}`,`Det ville gøre muligt: ${$('resourcesEnable').value}`]],
      ['Forberedelse eller andet arbejde',[...(ranks.length?ranks.map(r=>`${r.rank}. ${r.label}`):['Ingen prioritering angivet']),`Passer tiden til opgaverne: ${radioValue('prepFit')||'Ikke besvaret'}`,`Det der ikke passer sammen: ${$('prepMismatch').value}`]],
      ['Sammenhæng og videre dialog',[`Det hænger allerede godt sammen: ${$('worksWell').value}`,`Én ting der kunne skabe bedre sammenhæng: ${$('oneChange').value}`,`Vigtigt at tale videre med leder om: ${radioValue('talkLeader')||'Ikke besvaret'}`,`Hvad: ${$('talkWhat').value}`]]
    ];
    return blocks;
  }
  function makePdfBlob() {
    const blocks=buildPdfText();
    const pages=[]; let commands=[]; let y=790;
    const newPage=()=>{ if(commands.length) pages.push(commands.join('\n')); commands=[]; y=790; };
    const line=(txt,size=10,bold=false,indent=0)=>{
      if(y<55) newPage();
      const font=bold?'F2':'F1';
      commands.push(`BT /${font} ${size} Tf ${50+indent} ${y} Td (${pdfEscapeBytes(winAnsiBytes(txt))}) Tj ET`); y-=size+5;
    };
    blocks.forEach(([title,items],idx)=>{
      if(idx===0){ line(title,16,true); y-=5; return; }
      line(title,12,true); items.filter(Boolean).forEach(item=>wrapText(item,90).forEach(l=>line(l,10,false,8))); y-=6;
    });
    newPage();
    const objects=[];
    const add=o=>{objects.push(o);return objects.length;};
    const font1=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const font2=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const pageIds=[];
    const contentIds=[];
    for(const p of pages){ const bytes=winAnsiBytes(p); const content=String.fromCharCode(...bytes); contentIds.push(add(`<< /Length ${bytes.length} >>\nstream\n${content}\nendstream`)); pageIds.push(add('PENDING')); }
    const pagesId=add('PAGES_PENDING');
    pageIds.forEach((pid,i)=>objects[pid-1]=`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`);
    objects[pagesId-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    const catalogId=add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    let pdf='%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'; const offsets=[0];
    objects.forEach((obj,i)=>{ offsets.push(pdf.length); pdf+=`${i+1} 0 obj\n${obj}\nendobj\n`; });
    const xref=pdf.length; pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
    for(let i=1;i<offsets.length;i++) pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf+=`trailer\n<< /Size ${objects.length+1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return new Blob([Uint8Array.from([...pdf].map(ch=>ch.charCodeAt(0)&255))],{type:'application/pdf'});
  }
  $('makePdf').addEventListener('click',()=>{
    $('pdfError').textContent='';
    const name=$('employeeName').value.trim();
    if(!name){ $('pdfError').textContent='Skriv dit navn, før du laver PDF\'en.'; $('employeeName').focus(); return; }
    try{
      const blob=makePdfBlob(); const url=URL.createObjectURL(blob); const a=document.createElement('a');
      const safe=name.replace(/[^a-zA-Z0-9æøåÆØÅ_-]+/g,'_');
      a.href=url; a.download=`3i1-punkt-23-${safe}.pdf`; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      clearStored();
      document.querySelectorAll('[data-save], .rank-select').forEach(el=>el.value='');
      document.querySelectorAll('input[type=radio]').forEach(el=>el.checked=false);
      refreshBranches();
      $('pdfError').style.color='var(--green)'; $('pdfError').textContent='PDF\'en er oprettet. De lokalt gemte svar er nu slettet fra browseren.';
    }catch(err){ console.error(err); $('pdfError').style.color=''; $('pdfError').textContent='PDF\'en kunne ikke oprettes på denne enhed. Prøv igen eller brug en anden browser.'; }
  });

  restore(); showStep(1);
})();
