import fs from 'fs';
import { JSDOM } from 'jsdom';
import { execSync } from 'child_process';

function cleanText(text){ return text.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim() }
function extractTextFromElement(el){ const clone=el.cloneNode(true); clone.querySelectorAll('script, style').forEach(s=>s.remove()); return cleanText(clone.textContent||'') }
function extractCorrectAnswers(html){
  const map={};
  const m = html.match(/correctAnswers\s*:\s*\{([\s\S]*?)\n\s*\},/);
  if(!m) {
    const m2 = html.match(/correctAnswers\s*=\s*\{([\s\S]*?)\}/);
    if(m2){
      const body=m2[1];
      const re=/["']?q?(\d+)["']?\s*:\s*["']([^"']+)["']/g;
      let x; while((x=re.exec(body))){ map[x[1]]=x[2].trim() }
    }
    return map;
  }
  const body=m[1];
  // handle both simple and partial
  const reSimple = /q(\d+)\s*:\s*"([^"]+)"/g;
  let x;
  while((x=reSimple.exec(body))){
    map[x[1]]=x[2].trim();
  }
  // handle partial: q23: { type: "partial", options: ["B", "C"] }
  const rePartial = /q(\d+)\s*:\s*\{\s*type:\s*"partial",\s*options:\s*\[([^\]]+)\]/g;
  while((x=rePartial.exec(body))){
    const opts = x[2].split(',').map(s=>s.replace(/["'\s]/g,'').trim()).filter(Boolean);
    map[x[1]] = opts.join(',');
  }
  // handle null
  const reNull = /q(\d+)\s*:\s*null/g;
  while((x=reNull.exec(body))){
    map[x[1]] = '';
  }
  return map;
}

const toolPath = 'C:\\Users\\ASUS\\.local\\share\\opencode\\tool-output\\tool_04c806250001A907u61ssinpnH';
let toolContent = fs.readFileSync(toolPath, 'utf-8');
const hrefRegex = /href:\s*'([^']+\.html)'/g;
let hrefs=[];
let m;
while((m=hrefRegex.exec(toolContent))){
  const h=m[1];
  if(h.toLowerCase().includes('reading/') && (h.toLowerCase().includes('full') || h.toLowerCase().includes('cdi'))){
    hrefs.push(h);
  }
}
console.log(`Found ${hrefs.length} full reading hrefs`);
const fullHrefs = hrefs.slice(0, 20); // first 20 for test
console.log(`Testing first ${fullHrefs.length}`);

let allQuestions = JSON.parse(fs.readFileSync('C:\\Users\\ASUS\\PycharmProjects\\IELTS\\src\\data\\realIeltsImport.json','utf-8'));
console.log(`Existing questions: ${allQuestions.length}`);

for(let idx=0; idx<fullHrefs.length; idx++){
  const href = fullHrefs[idx];
  const url = `https://ieltsmaterials.uz/${href}`;
  const outPath = `C:\\Users\\ASUS\\AppData\\Local\\Temp\\opencode\\full_${idx}.html`;
  try{
    execSync(`"C:\\Program Files\\Git\\mingw64\\bin\\curl.exe" -L -s -A "Mozilla/5.0" "${url}" -o "${outPath}"`, {timeout:15000});
    const html = fs.readFileSync(outPath, 'utf-8');
    if(html.includes('Error response') || html.length < 1000){
      console.log(`Skip ${href} - not found or small`);
      continue;
    }
    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const correctMap = extractCorrectAnswers(html);
    // Find all passage containers
    const passageContainers = doc.querySelectorAll('div.passage-container, div[id*="passagePanel"]');
    console.log(`File ${href}: found ${passageContainers.length} passages, correctMap ${Object.keys(correctMap).length} entries`);
    // For each passage, find its questions
    // The questions are in div.questions-container or div[id*="questionsPanel"]
    const questionPanels = doc.querySelectorAll('div.questions-container, div[id*="questionsPanel"]');
    console.log(`  question panels ${questionPanels.length}`);
    // For simplicity, collect all questions in file
    const allInputs = doc.querySelectorAll('input[name^="q"], input[id^="q"]');
    const allSelects = doc.querySelectorAll('select[name^="q"], select[id^="q"]');
    const allRadios = doc.querySelectorAll('input[type="radio"][name^="q"]');
    console.log(`  inputs ${allInputs.length}, selects ${allSelects.length}, radios ${allRadios.length}`);
    // For now just log, not yet parsing all
  }catch(e){
    console.log(`Error ${href}: ${e.message}`);
  }
}
