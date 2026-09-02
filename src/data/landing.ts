import {
  PenLine,
  Mic,
  FileText,
  BookOpen,
  Brain,
  Target,
  BarChart3,
  BellRing,
  Sparkles,
  Languages,
  Shuffle,
} from "lucide-react";

export const TRUST_STATS = [
  { value: "50K+", label: "Students" },
  { value: "10K+", label: "Practice Questions" },
  { value: "95%", label: "Student Satisfaction" },
];

export const PLATFORM_STATS = [
  { value: "50,000+", label: "Students enrolled", suffix: "worldwide" },
  {
    value: "10,200",
    label: "Practice questions",
    suffix: "in the question bank",
  },
  { value: "128K", label: "Mock tests completed", suffix: "across all exams" },
  {
    value: "+1.5",
    label: "Average band improvement",
    suffix: "within 3 months",
  },
];

export const FEATURES = [
  {
    id: "feature-writing",
    icon: PenLine,
    title: "AI-powered Writing feedback",
    description:
      "Submit essays and get instant, detailed feedback on coherence, vocabulary and accuracy.",
  },
  {
    id: "feature-speaking",
    icon: Mic,
    title: "Speaking practice rooms",
    description:
      "Practice all three parts with realistic cue cards, timers and recorded playback.",
  },
  {
    id: "feature-mock-tests",
    icon: FileText,
    title: "Full IELTS mock tests",
    description:
      "Academic and General Training exams with real timing and estimated band scoring.",
  },
  {
    id: "feature-vocabulary",
    icon: BookOpen,
    title: "Vocabulary builder",
    description:
      "Flashcards, collocation packs and spaced-repetition reviews that stick.",
  },
  {
    id: "feature-grammar",
    icon: Languages,
    title: "Grammar lessons",
    description:
      "One concept at a time — from articles to complex conditionals for Band 7+.",
  },
  {
    id: "feature-plans",
    icon: Target,
    title: "Personalized study plans",
    description:
      "A weekly roadmap generated from your current and target band and exam date.",
  },
  {
    id: "feature-analytics",
    icon: BarChart3,
    title: "Detailed analytics",
    description:
      "Band improvement, accuracy and activity trends for every skill you practise.",
  },
  {
    id: "feature-reminders",
    icon: BellRing,
    title: "Daily practice reminders",
    description:
      "Gentle nudges tuned to your schedule so study becomes a habit, not a chore.",
  },
];

export const SKILL_HIGHLIGHTS = [
  {
    id: "listening",
    icon: Brain,
    title: "Listening",
    description:
      "Master Section 1–4 with note-taking drills, map skills and real-speed audio.",
    lessons: 24,
    progress: 72,
    color: "from-violet-500 to-violet-600",
    ring: "group-hover:ring-violet-200 dark:group-hover:ring-violet-900",
  },
  {
    id: "reading",
    icon: Shuffle,
    title: "Reading",
    description:
      "Skimming, scanning and True/False/Not Given strategies from verified examiners.",
    lessons: 28,
    progress: 65,
    color: "from-cyan-500 to-cyan-600",
    ring: "group-hover:ring-cyan-200 dark:group-hover:ring-cyan-900",
  },
  {
    id: "writing",
    icon: PenLine,
    title: "Writing",
    description:
      "Task 1 & Task 2 frameworks plus AI feedback to lift coherence and range.",
    lessons: 32,
    progress: 58,
    color: "from-brand-500 to-brand-700",
    ring: "group-hover:ring-brand-200 dark:group-hover:ring-brand-900",
  },
  {
    id: "speaking",
    icon: Mic,
    title: "Speaking",
    description:
      "Part 1, 2 and 3 with cue-card practice and pronunciation feedback.",
    lessons: 20,
    progress: 71,
    color: "from-emerald-500 to-emerald-600",
    ring: "group-hover:ring-emerald-200 dark:group-hover:ring-emerald-900",
  },
];

export const STEPS = [
  {
    icon: Target,
    title: "Take a level test",
    description:
      "Answer 20 quick questions and find your current band across all four skills.",
    tag: "5 minutes",
  },
  {
    icon: BookOpen,
    title: "Get your personalized plan",
    description:
      "You receive a week-by-week roadmap built around your exam date and weak areas.",
    tag: "Automatic",
  },
  {
    icon: Sparkles,
    title: "Practice and track progress",
    description:
      "Complete exercises, review analytics and watch your estimated band climb.",
    tag: "Daily",
  },
];

export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Sarvar Rahimov",
    program: "Academic · Band 8.0",
    score: "8.0",
    body: "I went from 6.0 to 8.0 in four months. The writing feedback was the closest thing to a real examiner I have found online.",
    avatarColor: "#305c8d",
  },
  {
    id: "t2",
    name: "Madina Yusupova",
    program: "Academic · Band 7.5",
    score: "7.5",
    body: "The mock tests felt exactly like the real exam. By the third one I had zero nerves on test day.",
    avatarColor: "#7c3aed",
  },
  {
    id: "t3",
    name: "Jasur Toshpulatov",
    program: "General Training · Band 7.0",
    score: "7.0",
    body: "Study plan kept me accountable. The daily 30-minute sessions fit perfectly into my work schedule.",
    avatarColor: "#0e7490",
  },
  {
    id: "t4",
    name: "Nilufar Azimova",
    program: "Academic · Band 8.5",
    score: "8.5",
    body: "Speaking part 3 practice with timers trained my structure. I finally stopped rambling in the exam.",
    avatarColor: "#059669",
  },
  {
    id: "t5",
    name: "Otabek Karimov",
    program: "Academic · Band 6.5",
    score: "6.5",
    body: "The vocabulary flashcards with spaced repetition are genius. I remembered 300 collocations before my test.",
    avatarColor: "#d97706",
  },
  {
    id: "t6",
    name: "Dilnoza Sattorova",
    program: "General Training · Band 7.5",
    score: "7.5",
    body: "Progress analytics showed exactly where I was losing marks. I fixed my TFNG strategy and gained a full band.",
    avatarColor: "#be185d",
  },
];

export const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Start building your foundation",
    features: [
      "1 mock test",
      "50 practice questions / month",
      "Daily vocabulary deck",
      "Basic progress tracking",
      "Grammar lessons (starter set)",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$12",
    period: "/ month",
    tagline: "The complete prep experience",
    features: [
      "Unlimited practice questions",
      "Full Academic + GT mock tests",
      "AI-powered writing feedback",
      "Speaking part 1–3 practice",
      "Personalized study plans",
      "Detailed analytics & insights",
      "All grammar lessons",
      "Spaced-repetition vocabulary",
    ],
    cta: "Go Premium",
    highlighted: true,
    badge: "Most popular",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/ month",
    tagline: "For serious test-takers",
    features: [
      "Everything in Premium",
      "Unlimited AI writing feedback",
      "1-on-1 speaking sessions",
      "Priority mock test marking",
      "Band-guarantee review",
      "Advanced vocabulary packs",
    ],
    cta: "Go Pro",
    highlighted: false,
  },
];

export const FAQS = [
  {
    q: "Academic vs General Training — which one do I need?",
    a: "Choose Academic if you are applying to university or for professional registration. Choose General Training if you are migrating, working abroad or applying to secondary education. IELTS Master offers full practice for both, and you can switch modes any time.",
  },
  {
    q: "How do the mock tests work?",
    a: "Each mock test mirrors the real exam: timed Listening, Reading, Writing and Speaking sections, with question navigation and a countdown timer. When you submit, you instantly get an estimated band, section-by-section scores, strengths, weaknesses and recommended next steps.",
  },
  {
    q: "How is my band score calculated?",
    a: "For Listening and Reading we use the official raw-score conversion tables. Writing and Speaking estimates are produced by our AI-style scoring model based on the official 4-criterion rubric: Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.",
  },
  {
    q: "What is included in the Free plan versus Premium?",
    a: "The Free plan includes one mock test, 50 practice questions a month, the daily vocabulary deck and starter grammar lessons. Premium unlocks unlimited practice, full mock tests, AI writing feedback, speaking practice, study plans and detailed analytics.",
  },
  {
    q: "How long do I need to study to improve my band?",
    a: "On average, students who practise 30–60 minutes daily see a 0.5 band improvement in 4–6 weeks and a full band in 3–4 months. Your study plan personalizes this based on your current band, target band and exam date.",
  },
];

export const FOOTER_LINKS = {
  quick: [
    { label: "Courses", href: "/login" },
    { label: "Practice", href: "/login" },
    { label: "Mock Tests", href: "/login" },
    { label: "Vocabulary", href: "/login" },
    { label: "Pricing", href: "#pricing" },
  ],
  resources: [
    { label: "IELTS Academic vs General", href: "#faq" },
    { label: "Band score calculator", href: "#faq" },
    { label: "Study plan guide", href: "#how-it-works" },
    { label: "Grammar lessons", href: "/login" },
    { label: "Writing Task 2 tips", href: "/login" },
  ],
  contact: [
    {
      label: "support@ieltsmaster.com",
      href: "mailto:support@ieltsmaster.com",
    },
    { label: "Help center", href: "#" },
    { label: "Community", href: "#" },
  ],
};
