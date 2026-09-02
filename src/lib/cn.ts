import type { ClassValue } from "clsx";
import { clsx } from "clsx";

/** Join class names safely. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
