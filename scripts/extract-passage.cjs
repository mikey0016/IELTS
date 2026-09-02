const fs = require('fs');
const html = fs.readFileSync('C:/Users/ASUS/Downloads/IELTS Beta/Dolls (2).html', 'utf-8');

// Extract passage paragraphs only - find the passageContent div
const passageMatch = html.match(/<div id="passageContent">([\s\S]*?)<div class="divider"/);
if (!passageMatch) {
  console.log('Passage content not found');
  process.exit(1);
}

const passageContent = passageMatch[1];
const paragraphs = [];
const regex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
let match;
while ((match = regex.exec(passageContent)) !== null) {
  const text = match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (text && text.length > 10 && !text.includes('font-awesome') && !text.includes('svg') && !text.includes('@SIROJ')) {
    paragraphs.push(text);
  }
}

console.log('Found ' + paragraphs.length + ' paragraphs');
const passage = paragraphs.join('\n\n');
console.log('Passage length: ' + passage.length + ' chars');
console.log('First 200 chars: ' + passage.substring(0, 200));
fs.writeFileSync('scripts/clean-passage.txt', passage);
console.log('Saved to scripts/clean-passage.txt');
