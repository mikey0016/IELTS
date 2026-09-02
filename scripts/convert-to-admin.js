import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const inputPath = path.join(__dirname, 'ielts-parsed.json')
const outputPath = path.join(__dirname, 'ielts-admin-import.json')

const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

const tfOptionIndex = { TRUE: 0, FALSE: 1, 'NOT GIVEN': 2 }

const questions = data.questions.map((q) => {
  const base = {
    id: `dolls-q${q.number}`,
    skill: 'reading',
    type: q.type,
    topic: data.title.replace(/IELTS Reading Test - /i, '').trim() || 'Reading',
    difficulty: 'medium',
    timeLimitSec: 60,
    passage: data.passage,
    passageLabel: data.passageLabel,
    prompt: q.prompt,
    explanation: '',
    recommendLesson: ''
  }

  if (q.type === 'true-false') {
    return {
      ...base,
      options: q.options || ['TRUE', 'FALSE', 'NOT GIVEN'],
      correctIndex: tfOptionIndex[q.correctAnswer] != null ? tfOptionIndex[q.correctAnswer] : 0
    }
  }

  return {
    ...base,
    correctAnswer: q.correctAnswer || ''
  }
})

const result = {
  meta: {
    title: data.title,
    passageLabel: data.passageLabel,
    topic: data.title.replace(/IELTS Reading Test - /i, '').trim() || 'Reading',
    difficulty: 'medium',
    skill: 'reading'
  },
  questions
}

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
console.log('Converted', questions.length, 'questions. Output:', outputPath)
