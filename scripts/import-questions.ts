import { storage } from '@/lib/storage'
import { randomId } from '@/lib/format'
import type { Question } from '@/types'
import fs from 'fs'
import path from 'path'

const IMPORT_FILE = path.join(process.cwd(), 'scripts', 'ielts-admin-import.json')
const QUESTIONS_KEY = 'ielts-master:admin_questions'

function main() {
  const raw = fs.readFileSync(IMPORT_FILE, 'utf-8')
  const data = JSON.parse(raw)
  
  const existing = storage.get<Question[]>(QUESTIONS_KEY, [])
  const existingIds = new Set(existing.map((q) => q.id))
  
  const imported: Question[] = []
  for (const q of data.questions) {
    if (!existingIds.has(q.id)) {
      imported.push({
        ...q,
        id: q.id || randomId('q'),
        timeLimitSec: q.timeLimitSec || 120,
      })
    }
  }
  
  const merged = [...existing, ...imported]
  storage.set(QUESTIONS_KEY, merged)
  
  console.log(`Imported ${imported.length} new questions`)
  console.log(`Total questions in storage: ${merged.length}`)
  console.log(`Questions with passage: ${merged.filter((q) => q.passage && q.passage.length > 0).length}`)
  console.log(`Passage preview: ${merged.find((q) => q.passage && q.passage.includes('Dolls'))?.passage?.substring(0, 100) || 'Not found'}`)
}

main()
