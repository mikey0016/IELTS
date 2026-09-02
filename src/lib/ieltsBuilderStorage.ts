import { storage } from "@/lib/storage";
import type {
  IELTSTestBuilder,
  ReadingPassage,
  ListeningPart,
  WritingTask,
  SpeakingPart,
} from "@/types";
import { randomId } from "@/lib/format";

const KEY = "ielts_builder_v1";
const CUSTOM_TPL_KEY = "ielts_custom_templates_v1";

export function defaultPassage(idx: number): ReadingPassage {
  return {
    id: randomId("passage"),
    title: `Passage ${idx}`,
    passageLabel: `Reading Passage ${idx}`,
    text: "",
    groups: [],
  };
}

export function defaultListeningPart(idx: number): ListeningPart {
  return {
    id: randomId("lpart"),
    title: `Section ${idx}`,
    instructions: "You will hear a conversation. Answer questions 1–10.",
    groups: [],
  };
}

export function defaultWritingTask(num: 1 | 2): WritingTask {
  return {
    id: randomId("wtask"),
    taskNumber: num,
    title: num === 1 ? "Task 1" : "Task 2",
    instruction:
      num === 1
        ? "Summarise the information by selecting and reporting the main features."
        : "Write an essay in response to the question.",
    prompt: "",
    minWords: num === 1 ? 150 : 250,
    type: num === 1 ? "academic-task1" : "academic-task2",
    difficulty: "medium",
  };
}

export function defaultSpeakingPart(part: 1 | 2 | 3): SpeakingPart {
  const map: Record<number, { topic: string; prep: number; speak: number }> = {
    1: { topic: "Introduction & Interview", prep: 0, speak: 30 },
    2: { topic: "Cue Card", prep: 60, speak: 120 },
    3: { topic: "Discussion", prep: 0, speak: 45 },
  };
  const m = map[part];
  return {
    id: randomId("spart"),
    part,
    topic: m.topic,
    questions: part === 2 ? ["Describe..."] : ["Question 1", "Question 2"],
    cueCard:
      part === 2
        ? "Describe a ... You should say:\n- where\n- when\n- who with\n- and explain why"
        : undefined,
    prepTimeSec: m.prep,
    speakingTimeSec: m.speak,
  };
}

export function defaultBuilder(): IELTSTestBuilder {
  return {
    reading: {
      id: randomId("rtest"),
      title: "Reading Test 1",
      passages: [defaultPassage(1), defaultPassage(2), defaultPassage(3)],
    },
    listening: {
      id: randomId("ltest"),
      title: "Listening Test 1",
      parts: [
        defaultListeningPart(1),
        defaultListeningPart(2),
        defaultListeningPart(3),
        defaultListeningPart(4),
      ],
    },
    writing: {
      id: randomId("wtest"),
      title: "Writing Test 1",
      tasks: [defaultWritingTask(1), defaultWritingTask(2)],
    },
    speaking: {
      id: randomId("stest"),
      title: "Speaking Test 1",
      parts: [
        defaultSpeakingPart(1),
        defaultSpeakingPart(2),
        defaultSpeakingPart(3),
      ],
    },
  };
}

export function loadBuilder(): IELTSTestBuilder {
  const stored = storage.get<IELTSTestBuilder | null>(KEY, null);
  if (!stored) {
    const def = defaultBuilder();
    storage.set(KEY, def);
    return def;
  }
  // migrations: ensure arrays exist
  if (!stored.reading?.passages) stored.reading = defaultBuilder().reading;
  if (!stored.listening?.parts) stored.listening = defaultBuilder().listening;
  if (!stored.writing?.tasks) stored.writing = defaultBuilder().writing;
  if (!stored.speaking?.parts) stored.speaking = defaultBuilder().speaking;
  return stored;
}

export function saveBuilder(b: IELTSTestBuilder) {
  storage.set(KEY, b);
}

// custom templates
export interface CustomTemplate {
  id: string;
  label: string;
  type: string;
  instructions: string;
  wordLimit?: string;
  headingList?: string[];
  questions: Array<{
    prompt: string;
    options?: string[];
    correctAnswer?: string;
    alternativeAnswers?: string[];
  }>;
}

export function loadCustomTemplates(): CustomTemplate[] {
  return storage.get<CustomTemplate[]>(CUSTOM_TPL_KEY, []);
}
export function saveCustomTemplate(t: CustomTemplate) {
  const arr = loadCustomTemplates();
  arr.unshift(t);
  storage.set(CUSTOM_TPL_KEY, arr.slice(0, 30));
}
export function deleteCustomTemplate(id: string) {
  const arr = loadCustomTemplates().filter((x) => x.id !== id);
  storage.set(CUSTOM_TPL_KEY, arr);
}
