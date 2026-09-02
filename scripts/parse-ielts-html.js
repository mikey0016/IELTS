import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const htmlPath = path.join(__dirname, '..', '..', '..', 'Downloads', 'IELTS Beta', 'Dolls (2).html')
const outputPath = path.join(__dirname, 'ielts-parsed.json')

const html = fs.readFileSync(htmlPath, 'utf8')

function match(regex, flags = '') {
  const m = html.match(new RegExp(regex, flags))
  return m ? m[1] : null
}

const title = match(/<title>([^<]+)<\/title>/i) || ''

const passageLabel = match(/<div class="sectionRubric"[^>]*>[\s\S]*?<h2>([^<]+)<\/h2>/i) || ''

const passageContentIdx = html.indexOf('id="passageContent"')
const passageStart = html.indexOf('>', passageContentIdx) + 1
const passageEnd = html.indexOf('</div>', passageStart)
const passageInner = html.slice(passageStart, passageEnd)
const passage = passageInner
  .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, ' ')
  .replace(/<p[^>]*>([\s\S]*?)<\/p>/g, (_, p) => p.replace(/<[^>]+>/g, '').trim())
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim()

const correctAnswersMatch = html.match(/const correctAnswers = \{([\s\S]*?)\};/)
const correctAnswers = {}
if (correctAnswersMatch) {
  const pairs = correctAnswersMatch[1].match(/\d+\s*:\s*"[^"]*"/g) || []
  for (const pair of pairs) {
    const m = pair.match(/(\d+)\s*:\s*"([^"]*)"/)
    if (m) {
      correctAnswers[parseInt(m[1])] = m[2]
    }
  }
}

const questionsContainerIdx = html.indexOf('id="questions-container"')
const questionsStart = html.indexOf('>', questionsContainerIdx) + 1
const questionsEnd = html.indexOf('<footer')
const questionsHTML = html.slice(questionsStart, questionsEnd)

const questions = []

const fillBlankRegex = /<input type="text" name="(q\d+)"[^>]*>/gi
let fbm
while ((fbm = fillBlankRegex.exec(questionsHTML)) !== null) {
  const inputName = fbm[1]
  const num = parseInt(inputName.replace('q', ''), 10)
  const prevQuestionStart = Math.max(
    questionsHTML.lastIndexOf('<div class="true-false-option"', fbm.index),
    questionsHTML.lastIndexOf('<div class="question">', fbm.index)
  )
  const segment = questionsHTML.slice(Math.max(0, prevQuestionStart), fbm.index)
  const promptTexts = []
  const textRegex = /<p>([\s\S]*?)<\/p>/g
  let tm
  while ((tm = textRegex.exec(segment)) !== null) {
    const text = tm[1].replace(/<[^>]+>/g, '').trim()
    if (text) promptTexts.push(text)
  }
  const prompt = promptTexts.join(' ')
  questions.push({
    number: num,
    type: 'fill-blank',
    prompt: prompt || `Question ${num}`,
    correctAnswer: correctAnswers[num] || '',
    inputName
  })
}

const trueFalseRegex = /<div class="true-false-option">([\s\S]*?)<\/div>/gi
let tfm
while ((tfm = trueFalseRegex.exec(questionsHTML)) !== null) {
  const content = tfm[1]
  const numMatch = content.match(/<span class="question-number">(\d+)<\/span>/)
  if (!numMatch) continue
  const num = parseInt(numMatch[1], 10)
  const rawText = content
    .replace(/<span class="question-number">\d+<\/span>/, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  const selectMatch = content.match(/name="(q\d+)"/)
  const inputName = selectMatch ? selectMatch[1] : `q${num}`
  questions.push({
    number: num,
    type: 'true-false',
    prompt: rawText,
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    correctAnswer: correctAnswers[num] || '',
    inputName
  })
}

questions.sort((a, b) => a.number - b.number)

const rubricMatch = html.match(/<div class="sectionRubric" id="sectionRubric">([\s\S]*?)<\/div>/)
const rubricText = rubricMatch
  ? rubricMatch[1]
      .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, (_, h) => h.replace(/<[^>]+>/g, '').trim())
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/g, (_, p) => p.replace(/<[^>]+>/g, '').trim())
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  : ''

const result = {
  title,
  passageLabel,
  passage,
  rubric: rubricText,
  questions
}

fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
console.log('Parsed', questions.length, 'questions. Output:', outputPath)
