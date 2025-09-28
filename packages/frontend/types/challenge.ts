// /types/challenge.ts
export interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  initialCode: string;
  files?: Record<string, string>; // for multiple files later (key = filename, value = code)
  difficulty?: "Easy" | "Medium" | "Hard";
}
