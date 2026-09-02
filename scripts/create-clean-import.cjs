const fs = require('fs');
const html = fs.readFileSync('C:/Users/ASUS/Downloads/IELTS Beta/Dolls (2).html', 'utf-8');

// Extract only passage paragraphs
const passageMatch = html.match(/<div id="passageContent">([\s\S]*?)<div class="divider"/);
const passageContent = passageMatch ? passageMatch[1] : '';
const paragraphs = [];
const regex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
let match;

while ((match = regex.exec(passageContent)) !== null) {
  const text = match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (text && text.length > 20 && !text.includes('font-awesome') && !text.includes('svg') && !text.includes('@SIROJ') && !text.includes('Complete the notes') && !text.includes('Do the following')) {
    paragraphs.push(text);
  }
}

const cleanPassage = paragraphs.join('\n\n');
console.log('Clean passage paragraphs:', paragraphs.length);
console.log('Passage length:', cleanPassage.length);

// Now create the questions with clean passage
const questions = [];
for (let i = 1; i <= 6; i++) {
  questions.push({
    id: 'dolls-q' + i,
    skill: 'reading',
    type: 'fill-blank',
    topic: 'IELTS Reading Test - Dolls Through the Ages',
    difficulty: 'medium',
    timeLimitSec: 120,
    passage: cleanPassage,
    passageLabel: 'Reading Passage 1',
    prompt: 'Questions ' + i + '-6. Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.',
    explanation: 'Answer: ' + ['clay', 'goddesses', 'limbs', 'wax', 'plaster', 'composition'][i-1],
    recommendLesson: 'IELTS Reading Test - Dolls Through the Ages',
    correctAnswer: ['clay', 'goddesses', 'limbs', 'wax', 'plaster', 'composition'][i-1]
  });
}

for (let i = 7; i <= 13; i++) {
  const answers = ['FALSE', 'TRUE', 'FALSE', 'TRUE', 'TRUE', 'FALSE', 'NOT GIVEN'];
  const options = ['TRUE', 'FALSE', 'NOT GIVEN'];
  const correctAnswer = answers[i-7];
  questions.push({
    id: 'dolls-q' + i,
    skill: 'reading',
    type: 'true-false',
    topic: 'IELTS Reading Test - Dolls Through the Ages',
    difficulty: 'medium',
    timeLimitSec: 120,
    passage: cleanPassage,
    passageLabel: 'Reading Passage 1',
    prompt: ['Bisque dolls appear less realistic than dolls made of China.', 'French dolls tended to cost more than German bisque dolls.', 'The first rag dolls were made in the 1850s.', 'Only dolls made of cotton or linen are classified as cloth dolls.', 'Dolls made of celluloid tended to lose their colour.', 'Composition dolls lasted longer than the plastic dolls that were made in the 1940s.', 'Doll collectors prefer a doll to be dressed in its original clothing.'][i-7],
    explanation: 'Answer: ' + correctAnswer,
    recommendLesson: 'IELTS Reading Test - Dolls Through the Ages',
    options: options,
    correctIndex: options.indexOf(correctAnswer)
  });
}

const output = {
  meta: {
    title: 'IELTS Reading Test - Dolls Through the Ages',
    passageLabel: 'Reading Passage 1',
    topic: 'Dolls Through the Ages',
    difficulty: 'medium',
    skill: 'reading'
  },
  questions: questions
};

fs.writeFileSync('scripts/ielts-clean-import.json', JSON.stringify(output, null, 2));
console.log('Created clean import file with', questions.length, 'questions');
console.log('Passage preview:', cleanPassage.substring(0, 150) + '...');
