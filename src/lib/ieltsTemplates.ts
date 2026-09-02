import type { IELTSTemplate, IELTSQuestionType } from "@/types";

export const IELTS_QUESTION_TYPES: {
  value: IELTSQuestionType;
  label: string;
  short: string;
}[] = [
  { value: "multiple-choice", label: "Multiple Choice", short: "MC" },
  { value: "multiple-answer", label: "Multiple Answer", short: "MA" },
  {
    value: "true-false-not-given",
    label: "True / False / Not Given",
    short: "TFNG",
  },
  { value: "yes-no-not-given", label: "Yes / No / Not Given", short: "YNNG" },
  { value: "matching-headings", label: "Matching Headings", short: "MH" },
  { value: "matching-information", label: "Matching Information", short: "MI" },
  { value: "matching-features", label: "Matching Features", short: "MF" },
  { value: "sentence-completion", label: "Sentence Completion", short: "SC" },
  { value: "summary-completion", label: "Summary Completion", short: "Sum" },
  { value: "note-completion", label: "Note Completion", short: "Note" },
  { value: "table-completion", label: "Table Completion", short: "Table" },
  {
    value: "flowchart-completion",
    label: "Flow-chart Completion",
    short: "Flow",
  },
  { value: "diagram-label", label: "Diagram Label Completion", short: "Diag" },
  { value: "short-answer", label: "Short Answer", short: "SA" },
];

export const IELTS_TEMPLATES: IELTSTemplate[] = [
  {
    id: "tpl-mh-6",
    label: "Matching Headings — 6 questions",
    type: "matching-headings",
    description: "List of headings + paragraph mapping",
    defaultInstructions:
      "Choose the correct heading for each paragraph from the list of headings.",
    defaultHeadingList: [
      "i. Early origins",
      "ii. Industrial production",
      "iii. Modern materials",
      "iv. Cultural significance",
      "v. Economic impact",
      "vi. Future developments",
      "vii. Technical innovations",
      "viii. Historical trade",
    ],
    defaultQuestions: 6,
    icon: "MH",
  },
  {
    id: "tpl-mc-5",
    label: "Multiple Choice — 5 questions",
    type: "multiple-choice",
    description: "Question + 4 options (A-D)",
    defaultInstructions: "Choose the correct letter, A, B, C or D.",
    defaultQuestions: 5,
    icon: "MC",
  },
  {
    id: "tpl-tfng-7",
    label: "True / False / Not Given — 7 questions",
    type: "true-false-not-given",
    description: "Statements with TFNG",
    defaultInstructions:
      "Do the following statements agree with the information given in the passage?",
    defaultQuestions: 7,
    icon: "TF",
  },
  {
    id: "tpl-sc-5",
    label: "Sentence Completion — 5 questions",
    type: "sentence-completion",
    description: "Sentence + blank + word limit",
    defaultInstructions:
      "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
    defaultWordLimit: "NO MORE THAN TWO WORDS",
    defaultQuestions: 5,
    icon: "SC",
  },
  {
    id: "tpl-sum-4",
    label: "Summary Completion — 4 questions",
    type: "summary-completion",
    description: "Summary paragraph with blanks",
    defaultInstructions:
      "Complete the summary below. Choose NO MORE THAN THREE WORDS from the passage for each answer.",
    defaultWordLimit: "NO MORE THAN THREE WORDS",
    defaultQuestions: 4,
    icon: "Sum",
  },
  {
    id: "tpl-note-5",
    label: "Note Completion — 5 questions",
    type: "note-completion",
    description: "Notes with bullet blanks",
    defaultInstructions:
      "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
    defaultWordLimit: "ONE WORD ONLY",
    defaultQuestions: 5,
    icon: "Note",
  },
  {
    id: "tpl-table-6",
    label: "Table Completion — 6 questions",
    type: "table-completion",
    description: "Table rows with blanks",
    defaultInstructions:
      "Complete the table below. Choose ONE WORD ONLY from the passage for each answer.",
    defaultWordLimit: "ONE WORD ONLY",
    defaultQuestions: 6,
    icon: "Tab",
  },
  {
    id: "tpl-matching-info-5",
    label: "Matching Information — 5 questions",
    type: "matching-information",
    description: "Match statements to paragraphs",
    defaultInstructions: "Which paragraph contains the following information?",
    defaultQuestions: 5,
    icon: "MI",
  },
  {
    id: "tpl-short-4",
    label: "Short Answer — 4 questions",
    type: "short-answer",
    description: "Question + short answer + word limit",
    defaultInstructions:
      "Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage for each answer.",
    defaultWordLimit: "NO MORE THAN THREE WORDS",
    defaultQuestions: 4,
    icon: "SA",
  },
];

export function getTemplateForType(
  type: IELTSQuestionType,
): IELTSTemplate | undefined {
  return IELTS_TEMPLATES.find((t) => t.type === type);
}

export function getQuestionTypeLabel(type: IELTSQuestionType): string {
  return IELTS_QUESTION_TYPES.find((t) => t.value === type)?.label ?? type;
}
