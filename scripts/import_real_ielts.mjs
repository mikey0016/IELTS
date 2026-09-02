import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// copy of parser logic (simplified, uses same as htmlTaskParser)
function cleanText(text){ return text.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim() }
function extractTextFromElement(el){ const clone=el.cloneNode(true); clone.querySelectorAll('script, style, nav, header, footer, .settings-modal, .header, .footer').forEach(s=>s.remove()); return cleanText(clone.textContent||'') }
function extractCorrectAnswersFromHtml(rawHtml){ const map={}; const objMatch=rawHtml.match(/correctAnswers\s*=\s*\{([\s\S]*?)\}/); if(!objMatch) return map; const body=objMatch[1]; const re=/["']?(\d+)["']?\s*:\s*["']([^"']+)["']/g; let m; while((m=re.exec(body))){ map[m[1]]=m[2].trim() } return map }

function parseFile(filePath){
  const html = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  global.document = doc;
  global.CSS = dom.window.CSS;
  let passageContent = doc.getElementById('passageContent') || doc.querySelector('#passage-container');
  const isListeningFile = filePath.toLowerCase().includes('listening') || (doc.querySelector('title')?.textContent||'').toLowerCase().includes('listening');
  if(!passageContent && !isListeningFile) return null;
  if(!passageContent && isListeningFile){
    // for listening, use body or a dummy passage (transcript may be hidden)
    passageContent = doc.body;
  }
  const hasInputs = doc.querySelector('input.summary-input, input[name^="q"], input[id^="q"], input[type="text"]');
  const hasSelects = doc.querySelector('select[name^="q"], select[id^="q"], select.matching-select');
  if(!hasInputs && !hasSelects) return null;
  const sectionRubric = doc.getElementById('sectionRubric');
  const rubricLabel = sectionRubric ? extractTextFromElement(sectionRubric.querySelector('h2')||sectionRubric) : (isListeningFile ? 'Listening Test' : 'Reading Passage');
  const titleEl = passageContent.querySelector('h2') || doc.querySelector('h2');
  const passageTitle = titleEl ? cleanText(titleEl.textContent) : '';
  const passageLabel = rubricLabel || passageTitle || (isListeningFile ? 'Listening' : 'Reading Passage');
  const defaultTopic = passageTitle || rubricLabel || doc.querySelector('title')?.textContent?.trim() || path.basename(filePath);
  let paragraphs=[];
  let passageText='';
  if(isListeningFile){
    // For listening, passage is not needed; use rubric + title as passage
    passageText = `${passageTitle ? passageTitle + '\n\n' : ''}${rubricLabel ? rubricLabel + '\n\n' : ''}Audio will be played once. Answer while listening.`;
    paragraphs = [passageText];
  } else {
    const allEls = Array.from(passageContent.querySelectorAll('h2, h3, p'));
    allEls.forEach(el=>{
      const clone=el.cloneNode(true);
      clone.querySelectorAll('.paragraph-marker').forEach(m=> m.textContent=(m.textContent||'')+' ');
      const t=cleanText(clone.textContent||'');
      if(!t) return;
      if(t===passageTitle) return;
      paragraphs.push(t);
    });
    passageText = paragraphs.join('\n\n');
    if(!passageText) passageText=extractTextFromElement(passageContent);
  }
  const correctMap=extractCorrectAnswersFromHtml(html);
  const questions=[];
  const inputs = Array.from(new Set(Array.from(doc.querySelectorAll('input.summary-input, input[id^="q"], input[name^="q"]'))));
  inputs.forEach(inp=>{
    const name = inp.getAttribute('name')||inp.getAttribute('id')||'';
    const num = name.replace(/\D/g,'')||String(questions.length+1);
    const summaryContainer = inp.closest('.summary-container');
    let prompt='';
    if(summaryContainer){
      const clone=summaryContainer.cloneNode(true);
      const allInputs=clone.querySelectorAll('input');
      allInputs.forEach(el=>{
        const elName=el.getAttribute('id')||el.getAttribute('name')||'';
        const isTarget = elName===name;
        const blank=doc.createElement('span');
        blank.textContent=isTarget?' ___ ':` [${elName.replace(/\D/g,'')||'?'}] `;
        el.replaceWith(blank);
      });
      prompt=cleanText(clone.textContent||'');
      const blankIdx=prompt.indexOf('___');
      if(prompt.length>260 && blankIdx!==-1){ const start=Math.max(0,blankIdx-120); const end=Math.min(prompt.length,blankIdx+140); prompt=(start>0?'… ':'')+prompt.slice(start,end).trim()+(end<prompt.length?' …':'') }
      if(!prompt.includes('___')) prompt=`Complete the summary — Question ${num}: `+prompt;
    } else {
      const bulletP=inp.closest('p');
      if(bulletP){
        const bClone=bulletP.cloneNode(true);
        const bInp=bClone.querySelector('input');
        if(bInp){ const blank=doc.createElement('span'); blank.textContent='___'; bInp.replaceWith(blank); }
        prompt=cleanText(bClone.textContent||'').replace(/^[•\-]\s*/,'').trim();
      } else {
        let container=inp.parentElement;
        while(container && container!==doc.body){ if(container.tagName==='P' || container.classList.contains('question-rubric') || container.classList.contains('question')) break; container=container.parentElement; }
        const parent=container||inp.parentElement;
        const clone=parent.cloneNode(true);
        const sel = name?`input[name="${name}"], input[id="${name}"]`:'input';
        const cloneInput=clone.querySelector(sel)||clone.querySelector('input');
        if(cloneInput){ const blank=doc.createElement('span'); blank.textContent=' ___ '; cloneInput.replaceWith(blank); }
        prompt=cleanText(clone.textContent||'').replace(/^[•\-]\s*/,'').trim();
      }
    }
    if(!prompt) prompt=`Complete the sentence (Q${num})`;
    if(!prompt.includes('___') && !prompt.includes('__')) prompt=prompt+' ___';
    const correct=correctMap[num]||'';
    questions.push({prompt, type:'fill-blank', correctAnswer:correct||undefined, difficulty:'medium', timeLimitSec:90});
  });
  const selects = Array.from(new Set(Array.from(doc.querySelectorAll('select[name^="q"], select[id^="q"], select.matching-select'))));
  selects.forEach(sel=>{
    const name=sel.getAttribute('name')||sel.getAttribute('id')||'';
    const num=name.replace(/\D/g,'')||String(questions.length+1);
    const wrapper=sel.closest('.question-item')||sel.closest('.true-false-option')||sel.parentElement;
    let promptEl=wrapper.querySelector('.matching-text')||wrapper.querySelector('p');
    let prompt='';
    if(promptEl && promptEl!==wrapper){ const clone=promptEl.cloneNode(true); const numSpan=clone.querySelector('.question-number, .q-num'); if(numSpan) numSpan.remove(); prompt=cleanText(clone.textContent||''); } else { const clone=wrapper.cloneNode(true); const selClone=clone.querySelector('select'); if(selClone) selClone.remove(); prompt=cleanText(clone.textContent||'').replace(/TRUE|FALSE|NOT GIVEN/gi,'').trim(); }
    if(!prompt) prompt=`Statement ${num}`;
    const optionEls=Array.from(sel.querySelectorAll('option')).map(o=>(o.textContent||'').trim()).filter(t=>t && t!=='--');
    let options, correctIndex;
    const correctVal=correctMap[num]||'';
    if(optionEls.length>0){
      const isLetterRange=optionEls.every(o=>/^[A-H]$/.test(o));
      if(isLetterRange){ options=optionEls; const upper=correctVal.toUpperCase().trim(); const idx=options.findIndex(o=>o.toUpperCase()===upper); if(idx!==-1) correctIndex=idx; questions.push({prompt, type:'multiple-choice', options, correctIndex, correctAnswer:correctIndex===undefined?correctVal:undefined, difficulty:'medium', timeLimitSec:90}); return; }
      const isTFNG=optionEls.some(o=>/TRUE|FALSE|NOT GIVEN/i.test(o));
      if(isTFNG){ options=optionEls.length>=3?optionEls:['TRUE','FALSE','NOT GIVEN']; const upper=correctVal.toUpperCase(); if(upper==='TRUE') correctIndex=options.findIndex(o=>o.toUpperCase()==='TRUE'); else if(upper==='FALSE') correctIndex=options.findIndex(o=>o.toUpperCase()==='FALSE'); else if(upper.includes('NOT')) correctIndex=options.findIndex(o=>o.toUpperCase().includes('NOT')); questions.push({prompt, type:'true-false', options, correctIndex:correctIndex!==-1?correctIndex:undefined, difficulty:'medium', timeLimitSec:90}); return; }
      options=optionEls;
    }
    const upper=correctVal.toUpperCase();
    if(upper==='TRUE') correctIndex=0; else if(upper==='FALSE') correctIndex=1; else if(upper.includes('NOT')) correctIndex=2;
    if(!options) options=['TRUE','FALSE','NOT GIVEN'];
    const isMatching=correctVal.length===1 && /^[A-H]$/i.test(correctVal);
    questions.push({prompt, type:isMatching?'multiple-choice':'true-false', options, correctIndex, correctAnswer:isMatching && correctIndex===undefined?correctVal:undefined, difficulty:'medium', timeLimitSec:90});
  });
  const radios=Array.from(doc.querySelectorAll('input[type="radio"]'));
  if(radios.length>0){
    const groups=new Map();
    radios.forEach(r=>{ const g=r.getAttribute('name')||'group'; if(!groups.has(g)) groups.set(g,[]); groups.get(g).push(r); });
    groups.forEach((group,gName)=>{ if(group.length<2) return; const wrapper=group[0].closest('.question, li, .question-content')||group[0].parentElement; const promptEl=wrapper.querySelector('p, h3, h4'); const prompt=promptEl?cleanText(promptEl.textContent||''):`Question ${gName}`; const options=group.map(r=>{ const label=r.closest('li')||r.parentElement; const clone=label.cloneNode(true); const inp=clone.querySelector('input[type="radio"]'); if(inp) inp.remove(); return cleanText(clone.textContent||''); }).filter(Boolean); const num=gName.replace(/\D/g,''); const correct=correctMap[num]||''; let correctIndex; if(correct){ const asNum=parseInt(correct,10); if(!isNaN(asNum) && asNum>=1 && asNum<=options.length) correctIndex=asNum-1; else { const idx=options.findIndex(o=>o.toLowerCase().includes(correct.toLowerCase().substring(0,10))); if(idx>=0) correctIndex=idx; } } if(options.length>=2) questions.push({prompt, type:'multiple-choice', options, correctIndex, difficulty:'medium', timeLimitSec:120}); });
  }
  if(questions.length===0) return null;
  return {passageLabel, passageText, paragraphs, questions, defaultTopic, defaultSkill: isListeningFile ? 'listening' : 'reading'};
}

const files = [
  'C:\\Users\\ASUS\\Downloads\\IELTS Beta\\Dolls (2).html',
  'C:\\Users\\ASUS\\Downloads\\IELTS Beta\\gender gap (2).html',
  'C:\\Users\\ASUS\\Downloads\\IELTS Beta\\Art museums (2).html',
  'C:\\Users\\ASUS\\Downloads\\Telegram Desktop\\FULL listening test 6.html',
  'C:\\Users\\ASUS\\Downloads\\Telegram Desktop\\Listening.html',
  'C:\\Users\\ASUS\\Downloads\\Telegram Desktop\\Reading.html',
];

let all = [];
for(const f of files){
  try{
    const res = parseFile(f);
    if(res){
      console.log(`Parsed ${path.basename(f)}: ${res.questions.length} Q, topic=${res.defaultTopic}, label=${res.passageLabel}, paras=${res.paragraphs.length}`);
      // convert to our Question shape
      res.questions.forEach((q, idx)=>{
        all.push({
          id: `${path.basename(f, '.html').replace(/\s+/g,'_').toLowerCase()}_q${idx+1}`,
          skill: res.defaultTopic.toLowerCase().includes('listening') || f.toLowerCase().includes('listening') ? 'listening' : 'reading',
          type: q.type,
          topic: res.defaultTopic,
          difficulty: q.difficulty,
          timeLimitSec: q.timeLimitSec,
          passage: res.passageText,
          passageLabel: res.passageLabel,
          prompt: q.prompt,
          options: q.options,
          correctIndex: q.correctIndex,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || `Correct: ${q.correctAnswer||q.correctIndex}`,
          recommendLesson: res.defaultTopic,
        });
      });
    } else {
      console.log(`Failed ${f}`);
    }
  } catch(e){ console.log(`Error ${f}:`, e.message) }
}
console.log(`Total questions collected: ${all.length}`);
fs.writeFileSync('C:\\Users\\ASUS\\PycharmProjects\\IELTS\\src\\data\\realIeltsImport.json', JSON.stringify(all, null, 2), 'utf-8');
console.log('Written to realIeltsImport.json');
