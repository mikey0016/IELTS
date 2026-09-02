import type { Question } from "@/types";

export const LISTENING_QUESTIONS: Question[] = [
  {
    id: "l1",
    skill: "listening",
    type: "multiple-choice",
    topic: "Section 1 — Booking a hotel",
    difficulty: "easy",
    timeLimitSec: 90,
    prompt: "The woman wants a room with…",
    options: ["a sea view", "a garden view", "a city view"],
    correctIndex: 0,
    transcript:
      'Woman: "I would really love to wake up and see the ocean, please." Man: "Of course, a sea view room it is."',
    audioDurationSec: 18,
    explanation:
      'The woman says "I would really love to wake up and see the ocean" — that is a room with a sea view.',
    recommendLesson: "Listening — Section 1 essentials",
  },
  {
    id: "l2",
    skill: "listening",
    type: "fill-blank",
    topic: "Section 1 — Joining a gym",
    difficulty: "easy",
    timeLimitSec: 75,
    prompt: "The membership fee is £____ per month.",
    correctAnswer: "35",
    transcript: 'Receptionist: "The monthly membership is thirty-five pounds."',
    audioDurationSec: 14,
    explanation:
      'The receptionist clearly states "thirty-five pounds". Listen for numbers carefully — they are often repeated.',
    recommendLesson: "Listening — Numbers and prices",
  },
  {
    id: "l3",
    skill: "listening",
    type: "true-false",
    topic: "Section 2 — Museum tour",
    difficulty: "medium",
    timeLimitSec: 100,
    prompt: "The museum opens at 10 a.m. on Sundays.",
    options: ["True", "False", "Not Given"],
    correctIndex: 1,
    transcript:
      'Guide: "We open at ten during the week, and at noon on weekends, including Sundays."',
    audioDurationSec: 22,
    explanation:
      'The guide says the museum opens at noon (12:00) on Sundays, so "10 a.m." is False.',
    recommendLesson: "Listening — True / False questions",
  },
  {
    id: "l4",
    skill: "listening",
    type: "multiple-choice",
    topic: "Section 3 — University project",
    difficulty: "medium",
    timeLimitSec: 110,
    prompt: "Why does the student want to change her project topic?",
    options: [
      "It is too difficult",
      "She cannot find enough sources",
      "It does not interest her anymore",
    ],
    correctIndex: 2,
    transcript:
      'Student: "To be honest, Professor, I have lost interest in urban planning. I would like to research renewable energy instead."',
    audioDurationSec: 26,
    explanation:
      'The student states she "lost interest" in the current topic. The answer is C.',
    recommendLesson: "Listening — Section 3 discussion skills",
  },
  {
    id: "l5",
    skill: "listening",
    type: "multiple-choice",
    topic: "Section 4 — Marine biology lecture",
    difficulty: "hard",
    timeLimitSec: 120,
    prompt: "What does the speaker say about coral bleaching?",
    options: [
      "It is caused mainly by pollution",
      "It can sometimes be reversed",
      "It only happens in the tropics",
    ],
    correctIndex: 1,
    transcript:
      'Lecturer: "While bleaching is often fatal, some coral colonies can recover if temperatures return to normal within a few weeks."',
    audioDurationSec: 30,
    explanation:
      "The lecturer says recovery is possible when temperatures normalise quickly — response B matches.",
    recommendLesson: "Listening — Academic lecture sections",
  },
  {
    id: "l6",
    skill: "listening",
    type: "fill-blank",
    topic: "Section 1 — Car rental",
    difficulty: "easy",
    timeLimitSec: 80,
    prompt: "The customer will pick up the car at ____ a.m.",
    correctAnswer: "9:30",
    transcript:
      'Agent: "We can have the car ready for nine thirty tomorrow morning."',
    audioDurationSec: 16,
    explanation:
      'The time "nine thirty" (9:30) is the pickup time. Pay attention to half-hours.',
    recommendLesson: "Listening — Times and dates",
  },
  {
    id: "l7",
    skill: "listening",
    type: "multiple-choice",
    topic: "Section 2 — Sports centre facilities",
    difficulty: "medium",
    timeLimitSec: 95,
    prompt: "Members can use the swimming pool for free…",
    options: ["only before 8 a.m.", "at any time", "on weekdays only"],
    correctIndex: 1,
    transcript:
      'Announcer: "Pool access is included in your membership, twenty-four hours a day, seven days a week."',
    audioDurationSec: 20,
    explanation:
      '"Included… twenty-four hours a day, seven days a week" means at any time — answer B.',
    recommendLesson: "Listening — Facility descriptions",
  },
  {
    id: "l8",
    skill: "listening",
    type: "true-false",
    topic: "Section 4 — History of coffee",
    difficulty: "hard",
    timeLimitSec: 115,
    prompt: "Coffee was first cultivated commercially in Brazil.",
    options: ["True", "False", "Not Given"],
    correctIndex: 1,
    transcript:
      'Lecturer: "Long before Brazil, commercial cultivation began in the Arabian Peninsula, from where it spread across the Ottoman Empire."',
    audioDurationSec: 28,
    explanation:
      "The lecture says commercial cultivation began in the Arabian Peninsula — Brazil came much later, so the statement is False.",
    recommendLesson: "Listening — Distractors and negations",
  },
];
export const READING_QUESTIONS: Question[] = [
  {
    id: "r1",
    skill: "reading",
    type: "multiple-choice",
    topic: "Academic — Ocean plastic",
    difficulty: "easy",
    timeLimitSec: 150,
    passage:
      "Researchers estimate that eight million tonnes of plastic enter the ocean each year. Most of it comes from rivers, with ten rivers responsible for almost 90% of the total.",
    prompt: "According to the passage, most ocean plastic comes from…",
    options: ["fishing boats", "rivers", "tourism"],
    correctIndex: 1,
    explanation:
      'The passage states most plastic "comes from rivers" — ten rivers account for most of it.',
    recommendLesson: "Reading — Skimming for main ideas",
  },
  {
    id: "r2",
    skill: "reading",
    type: "true-false",
    topic: "Academic — Ocean plastic",
    difficulty: "medium",
    timeLimitSec: 170,
    passage:
      "Once in the ocean, plastic fragments into microplastics. These particles are small enough to be ingested by plankton, the base of the marine food chain.",
    prompt: "Microplastics are small enough to enter the marine food chain.",
    options: ["True", "False", "Not Given"],
    correctIndex: 0,
    explanation:
      "The passage says plankton — the base of the food chain — ingest the particles, making the statement True.",
    recommendLesson: "Reading — True / False / Not Given",
  },
  {
    id: "r3",
    skill: "reading",
    type: "multiple-choice",
    topic: "Academic — Metacognition in education",
    difficulty: "medium",
    timeLimitSec: 180,
    passage:
      "Metacognition — thinking about one's own thinking — has been linked to better learning outcomes. Students who assess their understanding before, during and after a task tend to retain information more effectively.",
    prompt: "Students benefit from metacognition mainly because they…",
    options: [
      "memorise facts faster",
      "evaluate their own learning process",
      "study in groups more often",
    ],
    correctIndex: 1,
    explanation:
      "The key idea is monitoring understanding throughout a task, i.e. evaluating their own learning process.",
    recommendLesson: "Reading — Identifying the main argument",
  },
  {
    id: "r4",
    skill: "reading",
    type: "fill-blank",
    topic: "General Training — Job advertisement",
    difficulty: "easy",
    timeLimitSec: 140,
    passage:
      "The Riverside Café requires a weekend team member. Applicants must be over 18 and available on Saturday and Sunday mornings. Experience is preferred but not essential.",
    prompt: "Applicants must be available on weekend ____.",
    correctAnswer: "mornings",
    explanation:
      'The advert says applicants must be available "on Saturday and Sunday mornings".',
    recommendLesson: "Reading — Scanning for information",
  },
  {
    id: "r5",
    skill: "reading",
    type: "true-false",
    topic: "Academic — Sleep and memory",
    difficulty: "medium",
    timeLimitSec: 175,
    passage:
      "During deep sleep, the brain replays newly learned information, transferring it from short-term to long-term storage. Sleep deprivation interrupts this process and impairs recall.",
    prompt:
      "The passage claims that sleep deprivation can make it harder to remember information.",
    options: ["True", "False", "Not Given"],
    correctIndex: 0,
    explanation:
      'The passage states deprivation "impairs recall", so the statement is True.',
    recommendLesson: "Reading — Paraphrasing statements",
  },
  {
    id: "r6",
    skill: "reading",
    type: "multiple-choice",
    topic: "Academic — Urban farming",
    difficulty: "hard",
    timeLimitSec: 200,
    passage:
      "Sky gardens and rooftop hydroponics supply fresh produce while cooling buildings and absorbing stormwater. Yet critics note that yields per square metre remain far below traditional farms, and start-up costs are substantial.",
    prompt: "Which view do critics express about urban farming?",
    options: [
      "It is too expensive for typical yields",
      "It increases building temperatures",
      "It cannot reduce stormwater",
    ],
    correctIndex: 0,
    explanation:
      'Critics mention start-up costs are substantial while yields are comparatively low — "too expensive for typical yields".',
    recommendLesson: "Reading — Argument vs counterargument",
  },
  {
    id: "r7",
    skill: "reading",
    type: "fill-blank",
    topic: "Academic — Bee decline",
    difficulty: "hard",
    timeLimitSec: 190,
    passage:
      "The most frequently cited driver of bee decline is the widespread use of neonicotinoid pesticides, though habitat fragmentation and climate change are compounding factors.",
    prompt:
      "The main cause of bee decline mentioned is the use of ____ pesticides.",
    correctAnswer: "neonicotinoid",
    explanation:
      'The "most frequently cited driver" is neonicotinoid pesticides.',
    recommendLesson: "Reading — Academic vocabulary focus",
  },
  {
    id: "r8",
    skill: "reading",
    type: "true-false",
    topic: "General Training — Healthy diet",
    difficulty: "easy",
    timeLimitSec: 135,
    passage:
      "The NHS recommends eating at least five portions of fruit and vegetables daily. Fresh, frozen and canned varieties all count, provided canned options do not contain added sugar or salt.",
    prompt:
      "Canned vegetables only count towards the five-a-day target if they have no added sugar or salt.",
    options: ["True", "False", "Not Given"],
    correctIndex: 0,
    explanation:
      'Canned options count "provided [they] do not contain added sugar or salt" — exactly what the statement says.',
    recommendLesson: "Reading — Detail matching",
  },
];

export const QUESTION_BANK: Record<"listening" | "reading", Question[]> = {
  listening: LISTENING_QUESTIONS,
  reading: READING_QUESTIONS,
};
