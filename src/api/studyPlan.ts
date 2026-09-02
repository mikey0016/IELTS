import type { StudyPlan } from "@/types";
import { generatePlan } from "@/data/studyPlan";
import { mockRequest } from "./mockClient";

export interface GeneratePlanInput {
  currentBand: number;
  targetBand: number;
  examDate: string;
  dailyMinutes: number;
}

export function requestStudyPlan(input: GeneratePlanInput): Promise<StudyPlan> {
  return mockRequest(() => generatePlan(input), 1100);
}
