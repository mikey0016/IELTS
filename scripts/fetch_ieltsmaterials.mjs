import fs from 'fs';
import { JSDOM } from 'jsdom';

const toolOutputPath = 'C:\\Users\\ASUS\\.local\\share\\opencode\\tool-output\\tool_04c806250001A907u61ssinpnH';
let content = '';
try { content = fs.readFileSync(toolOutputPath, 'utf-8'); } catch(e){ console.log('tool output not found', e.message); content = fs.readFileSync('C:\\Users\\ASUS\\PycharmProjects\\IELTS\\src\\data\\realIeltsImport.json','utf-8'); }

// Extract hrefs for full reading: look for "Reading/Reading%20full" and "Reading/CDI"
const hrefRegex = /href:\s*'([^']+\.html)'/g;
let m;
const hrefs = [];
while((m=hrefRegex.exec(content))){
  const href = m[1];
  if(href.includes('Reading/') && (href.includes('full') || href.includes('CDI') || href.includes('PASSAGE'))){
    hrefs.push(href);
  }
}
console.log(`Found ${hrefs.length} hrefs`);
const fullHrefs = hrefs.filter(h=> h.toLowerCase().includes('full') || h.toLowerCase().includes('cdi'));
console.log(`Full hrefs: ${fullHrefs.length}`);
console.log(fullHrefs.slice(0,5));

// Try to fetch first 5 full hrefs
import { setTimeout as sleep } from 'timers/promises';

async function fetchWithCurl(href){
  // Use curl via spawn
  const { execSync } = await import('child_process');
  const url = `https://ieltsmaterials.uz/${href}`;
  // Use curl with -L and -A
  try{
    const cmd = `"C:\\Program Files\\Git\\mingw64\\bin\\curl.exe" -L -s -A "Mozilla/5.0" "${url}" -o "C:\\Users\\ASUS\\AppData\\Local\\Temp\\opencode\\fetch_test.html"`;
    execSync(cmd, {timeout:10000});
    const data = fs.readFileSync('C:\\Users\\ASUS\\AppData\\Local\\Temp\\opencode\\fetch_test.html','utf-8');
    if(data.includes('Error response') || data.includes('404') || data.includes('403')){
      return {ok:false, len:data.length, snippet:data.slice(0,200)};
    }
    return {ok:true, len:data.length, snippet:data.slice(0,500)};
  }catch(e){
    return {ok:false, error:e.message};
  }
}

for(let i=0;i<Math.min(5, fullHrefs.length); i++){
  const href = fullHrefs[i];
  console.log(`\nFetching ${href}...`);
  const res = await fetchWithCurl(href);
  console.log(res);
  await sleep(500);
}
