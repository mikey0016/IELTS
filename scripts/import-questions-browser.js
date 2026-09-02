import fs from 'fs'
import path from 'path'

const IMPORT_FILE = path.join(process.cwd(), 'scripts', 'ielts-admin-import.json')
const QUESTIONS_KEY = 'ielts-master:admin_questions'

function main() {
  const raw = fs.readFileSync(IMPORT_FILE, 'utf-8')
  const data = JSON.parse(raw)
  
  const existing = JSON.parse(localStorage.getItem(QUESTIONS_KEY) || '[]')
  const existingIds = new Set(existing.map((q: any) => q.id))
  
  const imported: any[] = []
  for (const q of data.questions) {
    if (!existingIds.has(q.id)) {
      imported.push({
        ...q,
        id: q.id || 'q_' + Math.random().toString(36).slice(2, 10),
        timeLimitSec: q.timeLimitSec || 120,
      })
    }
  }
  
  const merged = [...existing, ...imported]
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(merged))
  
  console.log(`Imported ${imported.length} new questions`)
  console.log(`Total questions in storage: ${merged.length}`)
  console.log(`Questions with passage: ${merged.filter((q: any) => q.passage && q.passage.length > 0).length}`)
}

main()
