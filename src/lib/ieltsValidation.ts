import type { IELTSTestBuilder } from "@/types";

export interface ValidationIssue {
  level: "error" | "warning";
  message: string;
  path: string;
}

export function validateBuilder(b: IELTSTestBuilder): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Reading
  b.reading.passages.forEach((p, pi) => {
    const path = `Reading › ${p.passageLabel || p.title}`;
    if (!p.title.trim())
      issues.push({ level: "error", message: "Passage title bo‘sh", path });
    if (!p.text.trim() || p.text.trim().length < 30)
      issues.push({
        level: "error",
        message: "Passage matni bo‘sh yoki juda qisqa (≥30 belgi)",
        path,
      });
    if (p.groups.length === 0)
      issues.push({ level: "warning", message: "Question group yo‘q", path });
    p.groups.forEach((g, gi) => {
      const gpath = `${path} › Group ${gi + 1} (${g.type})`;
      if (!g.instructions.trim())
        issues.push({
          level: "warning",
          message: "Instructions bo‘sh",
          path: gpath,
        });
      if (
        g.type === "matching-headings" &&
        (!g.headingList || g.headingList.length < 3)
      )
        issues.push({
          level: "error",
          message: "Heading list kamida 3 ta bo‘lishi kerak",
          path: gpath,
        });
      if (g.questions.length === 0)
        issues.push({
          level: "warning",
          message: "Savollar yo‘q",
          path: gpath,
        });
      // word limit for completion types
      const needsWordLimit = [
        "sentence-completion",
        "summary-completion",
        "note-completion",
        "table-completion",
        "flowchart-completion",
        "short-answer",
      ].includes(g.type);
      if (
        needsWordLimit &&
        !g.wordLimit &&
        !g.questions.some((q) => q.wordLimit)
      )
        issues.push({
          level: "warning",
          message: "Word limit ko‘rsatilmagan",
          path: gpath,
        });
      g.questions.forEach((q, qi) => {
        const qpath = `${gpath} › Q${qi + 1}`;
        if (!q.prompt.trim())
          issues.push({
            level: "error",
            message: "Question matni bo‘sh",
            path: qpath,
          });
        if (
          (q.type === "multiple-choice" || q.type === "multiple-answer") &&
          (!q.options || q.options.length < 2)
        )
          issues.push({
            level: "error",
            message: "Kamida 2 ta option kiriting",
            path: qpath,
          });
        if (
          q.type === "multiple-choice" &&
          q.correctIndex === undefined &&
          !q.correctAnswer
        )
          issues.push({
            level: "error",
            message: "Correct answer tanlanmagan (B)",
            path: qpath,
          });
        if (
          !q.correctAnswer &&
          q.correctIndex === undefined &&
          !q.alternativeAnswers?.length
        ) {
          // For completion / short answer, answer required
          if (
            [
              "sentence-completion",
              "summary-completion",
              "note-completion",
              "table-completion",
              "flowchart-completion",
              "short-answer",
              "fill-blank",
            ].includes(q.type)
          ) {
            issues.push({
              level: "error",
              message: "Answer bo‘sh qolgan",
              path: qpath,
            });
          }
        }
      });
      // duplicate check within group
      const prompts = g.questions.map((q) => q.prompt.trim().toLowerCase());
      const dup = prompts.find((p, i) => prompts.indexOf(p) !== i);
      if (dup)
        issues.push({
          level: "error",
          message: `Duplicate question: "${dup.slice(0, 40)}..."`,
          path: gpath,
        });
    });
  });

  // Listening
  b.listening.parts.forEach((s) => {
    const path = `Listening › ${s.title}`;
    if (!s.audioUrl)
      issues.push({ level: "warning", message: "Audio mavjud emas", path });
    if (s.groups.length === 0)
      issues.push({ level: "warning", message: "Question group yo‘q", path });
  });

  // Writing
  b.writing.tasks.forEach((t) => {
    const path = `Writing › Task ${t.taskNumber}`;
    if (!t.prompt.trim())
      issues.push({ level: "error", message: "Prompt mavjud emas", path });
    if (!t.minWords || t.minWords < 50)
      issues.push({
        level: "warning",
        message: "Minimum words juda kichik",
        path,
      });
  });

  // Speaking
  b.speaking.parts.forEach((p) => {
    const path = `Speaking › Part ${p.part}`;
    if (!p.topic.trim())
      issues.push({ level: "warning", message: "Topic bo‘sh", path });
    if (p.questions.length === 0 && !p.cueCard)
      issues.push({
        level: "warning",
        message: "Savollar/cue card yo‘q",
        path,
      });
  });

  // global numbering duplicates (auto, but check if manual override)
  return issues;
}
