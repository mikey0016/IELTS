import * as fs from "fs";
import * as path from "path";

// We need to import data from src/data
// Use relative paths with alias resolved manually
import { LISTENING_QUESTIONS, READING_QUESTIONS } from "../../src/data/questions";
import { VOCAB_DECK } from "../../src/data/vocabulary";
import { COURSES, GRAMMAR_TOPICS } from "../../src/data/content";
import { WRITING_PROMPTS } from "../../src/data/writing";
import { SPEAKING_PROMPTS } from "../../src/data/speaking";
import { MOCK_TESTS } from "../../src/data/mockTests";
import { ACHIEVEMENTS } from "../../src/data/achievements";
import realIelts from "../../src/data/realIeltsImport.json";

const outDir = path.join(__dirname, "../data");
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, "questions.json"), JSON.stringify([...LISTENING_QUESTIONS, ...READING_QUESTIONS], null, 2));
fs.writeFileSync(path.join(outDir, "vocab.json"), JSON.stringify(VOCAB_DECK, null, 2));
fs.writeFileSync(path.join(outDir, "courses.json"), JSON.stringify(COURSES.map(c => ({ ...c, icon: undefined })), null, 2));
fs.writeFileSync(path.join(outDir, "grammar.json"), JSON.stringify(GRAMMAR_TOPICS, null, 2));
fs.writeFileSync(path.join(outDir, "writing.json"), JSON.stringify(WRITING_PROMPTS, null, 2));
fs.writeFileSync(path.join(outDir, "speaking.json"), JSON.stringify(SPEAKING_PROMPTS, null, 2));
fs.writeFileSync(path.join(outDir, "mocks.json"), JSON.stringify(MOCK_TESTS, null, 2));
fs.writeFileSync(path.join(outDir, "achievements.json"), JSON.stringify(ACHIEVEMENTS, null, 2));
fs.writeFileSync(path.join(outDir, "realIelts.json"), JSON.stringify(realIelts, null, 2));

console.log("✅ Dumped all data to server/data");
console.log("Questions:", LISTENING_QUESTIONS.length + READING_QUESTIONS.length);
console.log("Vocab:", VOCAB_DECK.length);
console.log("Courses:", COURSES.length);
console.log("Grammar:", GRAMMAR_TOPICS.length);
console.log("Writing:", WRITING_PROMPTS.length);
console.log("Speaking:", SPEAKING_PROMPTS.length);
console.log("Mocks:", MOCK_TESTS.length);
console.log("Achievements:", ACHIEVEMENTS.length);
console.log("RealIelts:", (realIelts as any[]).length);
