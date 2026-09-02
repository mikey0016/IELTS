export interface ParsedHtmlTask {
  passageLabel?: string;
  passageText: string;
  passageParagraphs?: string[];
  questions: {
    prompt: string;
    type: "multiple-choice" | "true-false" | "fill-blank";
    options?: string[];
    correctIndex?: number;
    correctAnswer?: string;
    explanation?: string;
    difficulty: "easy" | "medium" | "hard";
    timeLimitSec: number;
  }[];
  defaultSkill: "listening" | "reading";
  defaultTopic: string;
}

function cleanText(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTextFromElement(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  const scripts = clone.querySelectorAll(
    "script, style, nav, header, footer, .settings-modal, .header, .footer, .test-wrapper > header, .divider, .highlight-toolbar",
  );
  scripts.forEach((s) => s.remove());
  return cleanText(clone.textContent || "");
}

function sanitizePassageText(text: string): string {
  // Remove header/settings garbage that leaked from old imports
  let t = text;
  // Find first real passage start — "Dolls through the ages" or "Dolls have been"
  const markers = [
    "Dolls through the ages",
    "Dolls have been a part",
    "What is today a simple",
  ];
  for (const m of markers) {
    const idx = t.indexOf(m);
    if (idx > 0 && idx < 500) {
      t = t.slice(idx);
      break;
    }
  }
  // Strip leading rubric if duplicated
  t = t.replace(/^Options.*?Text size\s*/i, "").trim();
  t = t
    .replace(
      /^Reading Passage \d+\s*You should spend about 20 minutes.*?Reading Passage \d+\s*/i,
      "",
    )
    .trim();
  return t;
}

function detectDifficulty(text: string): "easy" | "medium" | "hard" {
  const lower = text.toLowerCase();
  if (/\b(?:easy|simple|basic|beginner)\b/.test(lower)) return "easy";
  if (/\b(?:hard|difficult|advanced|complex|challenging)\b/.test(lower))
    return "hard";
  return "medium";
}

function extractCorrectAnswersFromHtml(
  rawHtml: string,
): Record<string, string> {
  const map: Record<string, string> = {};
  // handles: const correctAnswers = { 1: "clay", 2: "goddesses", ... } or "1": "clay"
  const objMatch = rawHtml.match(/correctAnswers\s*=\s*\{([\s\S]*?)\}/);
  if (!objMatch) return map;
  const body = objMatch[1];
  // match key: "value" or 'value' or plain
  const re = /["']?(\d+)["']?\s*:\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    map[m[1]] = m[2].trim();
  }
  return map;
}

function parseDollsStyle(
  doc: Document,
  rawHtml: string,
): ParsedHtmlTask | null {
  const passageContent =
    doc.getElementById("passageContent") ||
    doc.querySelector("#passage-container #passageContent") ||
    doc.querySelector(".passage-container #passageContent") ||
    doc.querySelector("#passage-container");
  if (!passageContent) return null;
  // Support both dolls (name="q1") and gender gap (id="q14", class summary-input / matching-select)
  const hasInputs = doc.querySelector(
    'input.summary-input, input[name^="q"], input[id^="q"]',
  );
  const hasSelects = doc.querySelector(
    'select[name^="q"], select[id^="q"], select.matching-select',
  );
  if (!hasInputs && !hasSelects) return null;

  // Passage label & title
  const sectionRubric = doc.getElementById("sectionRubric");
  const rubricLabel = sectionRubric
    ? extractTextFromElement(sectionRubric.querySelector("h2") || sectionRubric)
    : "";
  const passageTitleEl = passageContent.querySelector("h2");
  const passageTitle = passageTitleEl
    ? cleanText(passageTitleEl.textContent || "")
    : "";
  const passageLabel = rubricLabel || passageTitle || "Reading Passage 1";
  const defaultTopic =
    passageTitle ||
    rubricLabel ||
    doc.querySelector("title")?.textContent?.trim() ||
    "Imported Reading";

  // Collect paragraphs — include h2/h3 (titles) and p, in document order
  const allEls = Array.from(passageContent.querySelectorAll("h2, h3, p"));
  const paragraphs: string[] = [];
  allEls.forEach((el) => {
    // Fix paragraph-marker without space: <span>A</span>The -> "A The"
    const clone = el.cloneNode(true) as Element;
    clone.querySelectorAll(".paragraph-marker").forEach((m) => {
      // ensure space after marker
      m.textContent = (m.textContent || "") + " ";
    });
    const t = cleanText(clone.textContent || "");
    if (!t) return;
    if (t === passageTitle) {
      return;
    }
    paragraphs.push(t);
  });
  // Fallback: if still empty, grab all text nodes
  let passageText = paragraphs.join("\n\n");
  if (!passageText) {
    passageText = extractTextFromElement(passageContent);
  }
  passageText = sanitizePassageText(passageText);

  const correctMap = extractCorrectAnswersFromHtml(rawHtml);

  const questions: ParsedHtmlTask["questions"] = [];

  // Gather all summary/fill-blank inputs (supports both name and id)
  const inputs = Array.from(
    doc.querySelectorAll(
      'input.summary-input, input[id^="q"], input[name^="q"]',
    ),
  ) as HTMLInputElement[];
  // de-duplicate by element
  const uniqueInputs = Array.from(new Set(inputs));

  uniqueInputs.forEach((inp) => {
    const name =
      inp.getAttribute("name") ||
      inp.getAttribute("id") ||
      inp.getAttribute("placeholder") ||
      "";
    const num = name.replace(/\D/g, "") || String(questions.length + 1);
    // Try to find the most specific container that holds this input
    // For gender gap, inputs are inside .summary-container — we want the sentence around this input
    const summaryContainer = inp.closest(".summary-container");
    const bulletP = inp.closest("p");
    const matchingItem = inp.closest(".question-item");
    let prompt = "";
    if (summaryContainer) {
      // For summary completion, use the summary paragraph with blank for this input
      const clone = summaryContainer.cloneNode(true) as Element;
      // Replace the target input with ___ and other inputs with their placeholder numbers for context
      const allInputs = clone.querySelectorAll("input");
      allInputs.forEach((el) => {
        const elName = el.getAttribute("id") || el.getAttribute("name") || "";
        const elNum = elName.replace(/\D/g, "");
        const isTarget =
          el === clone.querySelector(`#${CSS.escape(name)}`) ||
          el.getAttribute("name") === name ||
          el.getAttribute("id") === name;
        const blank = doc.createElement("span");
        blank.textContent = isTarget ? " ___ " : ` [${elNum || "?"}] `;
        el.replaceWith(blank);
      });
      prompt = cleanText(clone.textContent || "");
      // Trim to around the blank to keep prompt concise (max 220 chars)
      const blankIdx = prompt.indexOf("___");
      if (prompt.length > 260 && blankIdx !== -1) {
        const start = Math.max(0, blankIdx - 120);
        const end = Math.min(prompt.length, blankIdx + 140);
        prompt =
          (start > 0 ? "… " : "") +
          prompt.slice(start, end).trim() +
          (end < prompt.length ? " …" : "");
      }
      if (!prompt.includes("___"))
        prompt = `Complete the summary — Question ${num}: ` + prompt;
    } else if (bulletP) {
      const bClone = bulletP.cloneNode(true) as Element;
      const bInp = bClone.querySelector("input");
      if (bInp) {
        const blank2 = doc.createElement("span");
        blank2.textContent = "___";
        bInp.replaceWith(blank2);
      }
      prompt = cleanText(bClone.textContent || "");
      prompt = prompt.replace(/^[•\-]\s*/, "").trim();
    } else if (matchingItem) {
      const clone = matchingItem.cloneNode(true) as Element;
      const inpEl = clone.querySelector("input");
      if (inpEl) inpEl.replaceWith(doc.createTextNode(" ___ "));
      prompt = cleanText(clone.textContent || "");
    } else {
      let container: Element | null = inp.parentElement;
      while (container && container !== doc.body) {
        if (
          container.tagName === "P" ||
          container.classList.contains("question-rubric") ||
          container.classList.contains("question") ||
          container.classList.contains("summary-container")
        )
          break;
        container = container.parentElement;
      }
      const parent = container || inp.parentElement!;
      const clone = parent.cloneNode(true) as Element;
      const selector = name
        ? `input[name="${CSS.escape(name)}"], input[id="${CSS.escape(name)}"]`
        : "input";
      const cloneInput =
        clone.querySelector(selector) || clone.querySelector("input");
      if (cloneInput) {
        const blank = doc.createElement("span");
        blank.textContent = " ___ ";
        cloneInput.replaceWith(blank);
      }
      prompt = cleanText(clone.textContent || "")
        .replace(/^[•\-]\s*/, "")
        .trim();
    }
    if (!prompt) prompt = `Complete the sentence (Q${num})`;
    // Ensure fill-blank prompt contains blank marker
    if (!prompt.includes("___") && !prompt.includes("__"))
      prompt = prompt + " ___";

    const correct = correctMap[num] || "";
    questions.push({
      prompt,
      type: "fill-blank",
      correctAnswer: correct || undefined,
      correctIndex: undefined,
      options: undefined,
      explanation: `Answer is "${correct}" from the passage.`,
      difficulty: "medium",
      timeLimitSec: 90,
    });
  });

  // Selects: true/false, matching (A-H), etc. — supports id and name
  const selects = Array.from(
    doc.querySelectorAll(
      'select[name^="q"], select[id^="q"], select.matching-select',
    ),
  ) as HTMLSelectElement[];
  // de-duplicate
  const uniqueSelects = Array.from(new Set(selects));
  uniqueSelects.forEach((sel) => {
    const name = sel.getAttribute("name") || sel.getAttribute("id") || "";
    const num = name.replace(/\D/g, "") || String(questions.length + 1);
    // Find wrapper that holds the question text
    const wrapper =
      sel.closest(".question-item") ||
      sel.closest(".true-false-option") ||
      sel.closest(".matching") ||
      sel.parentElement!;
    // Try to find prompt element
    let promptEl: Element | null =
      wrapper.querySelector(".matching-text") ||
      wrapper.querySelector("p") ||
      wrapper.querySelector(".q-text") ||
      wrapper;
    // For matching, the text is in .matching-text
    let prompt = "";
    if (promptEl && promptEl !== wrapper) {
      const clone = promptEl.cloneNode(true) as Element;
      const numSpan = clone.querySelector(".question-number, .q-num");
      if (numSpan) numSpan.remove();
      prompt = cleanText(clone.textContent || "");
    } else {
      // Fallback: text of wrapper without select
      const clone = wrapper.cloneNode(true) as Element;
      const selClone = clone.querySelector("select");
      if (selClone) selClone.remove();
      prompt = cleanText(clone.textContent || "")
        .replace(/TRUE|FALSE|NOT GIVEN/gi, "")
        .replace(/^[A-H]\s*[-–]?\s*/i, "")
        .trim();
    }
    if (!prompt)
      prompt = cleanText(wrapper.textContent || "")
        .replace(/TRUE|FALSE|NOT GIVEN/gi, "")
        .trim();
    if (!prompt) prompt = `Statement ${num}`;

    // Determine options from select's option values
    const optionEls = Array.from(sel.querySelectorAll("option"))
      .map((o) => (o.textContent || "").trim())
      .filter((t) => t && t !== "--" && t !== "");
    let options: string[] | undefined;
    let correctIndex: number | undefined;
    let correctAnswer: string | undefined;
    const correctVal = correctMap[num] || "";
    if (optionEls.length > 0) {
      // Detect type by option content
      const isLetterRange = optionEls.every((o) => /^[A-H]$/.test(o));
      const isTFNG = optionEls.some((o) => /TRUE|FALSE|NOT GIVEN/i.test(o));
      if (isLetterRange) {
        options = optionEls; // e.g., A-H for paragraph matching
        const upper = correctVal.toUpperCase().trim();
        if (upper) {
          const idx = options.findIndex((o) => o.toUpperCase() === upper);
          if (idx !== -1) correctIndex = idx;
          else correctAnswer = correctVal;
        }
        questions.push({
          prompt,
          type: "multiple-choice",
          options,
          correctIndex,
          correctAnswer: correctIndex === undefined ? correctVal : undefined,
          explanation: `Correct answer: ${correctVal}`,
          difficulty: "medium",
          timeLimitSec: 90,
        });
        return;
      } else if (isTFNG) {
        options =
          optionEls.length >= 3 ? optionEls : ["TRUE", "FALSE", "NOT GIVEN"];
        const upper = correctVal.toUpperCase();
        if (upper === "TRUE")
          correctIndex = options.findIndex((o) => o.toUpperCase() === "TRUE");
        else if (upper === "FALSE")
          correctIndex = options.findIndex((o) => o.toUpperCase() === "FALSE");
        else if (upper.includes("NOT"))
          correctIndex = options.findIndex((o) =>
            o.toUpperCase().includes("NOT"),
          );
        questions.push({
          prompt,
          type: "true-false",
          options,
          correctIndex: correctIndex !== -1 ? correctIndex : undefined,
          correctAnswer: undefined,
          explanation: `Correct answer: ${correctVal}`,
          difficulty: "medium",
          timeLimitSec: 90,
        });
        return;
      } else {
        options = optionEls;
      }
    }
    // Fallback generic true/false
    const upper = correctVal.toUpperCase();
    if (upper === "TRUE") correctIndex = 0;
    else if (upper === "FALSE") correctIndex = 1;
    else if (
      upper === "NOT GIVEN" ||
      upper === "NOTGIVEN" ||
      upper === "NOT GIVEN"
    )
      correctIndex = 2;
    // If we have options, use them, otherwise default TFNG
    if (!options) options = ["TRUE", "FALSE", "NOT GIVEN"];
    // For matching with A-H but optionEls was empty (should not happen), keep as multiple-choice
    const isMatching = correctVal.length === 1 && /^[A-H]$/i.test(correctVal);
    questions.push({
      prompt,
      type: isMatching ? "multiple-choice" : "true-false",
      options,
      correctIndex,
      correctAnswer:
        isMatching && correctIndex === undefined ? correctVal : undefined,
      explanation: `Correct answer: ${correctVal}`,
      difficulty: "medium",
      timeLimitSec: 90,
    });
  });

  // Also handle multiple-choice radios if any (Q with radio)
  const radios = Array.from(
    doc.querySelectorAll('input[type="radio"]'),
  ) as HTMLInputElement[];
  if (radios.length > 0) {
    // Group by name
    const groups = new Map<string, HTMLInputElement[]>();
    radios.forEach((r) => {
      const g = r.getAttribute("name") || "group";
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(r);
    });
    groups.forEach((group, gName) => {
      if (group.length < 2) return;
      // Find question wrapper
      const wrapper =
        group[0].closest(".question, li, .question-content") ||
        group[0].parentElement!;
      const promptEl = wrapper.querySelector("p, h3, h4");
      const prompt = promptEl
        ? cleanText(promptEl.textContent || "")
        : `Question ${gName}`;
      const options = group
        .map((r) => {
          const label = r.closest("li") || r.parentElement!;
          const clone = label.cloneNode(true) as Element;
          const inp = clone.querySelector('input[type="radio"]');
          if (inp) inp.remove();
          return cleanText(clone.textContent || "");
        })
        .filter(Boolean);
      const num = gName.replace(/\D/g, "");
      const correct = correctMap[num] || "";
      let correctIndex: number | undefined;
      if (correct) {
        // tries to match by letter or text
        const asNum = parseInt(correct, 10);
        if (!isNaN(asNum) && asNum >= 1 && asNum <= options.length)
          correctIndex = asNum - 1;
        else {
          const idx = options.findIndex((o) =>
            o.toLowerCase().includes(correct.toLowerCase().substring(0, 10)),
          );
          if (idx >= 0) correctIndex = idx;
        }
      }
      if (options.length >= 2) {
        questions.push({
          prompt,
          type: "multiple-choice",
          options,
          correctIndex,
          difficulty: "medium",
          timeLimitSec: 120,
        });
      }
    });
  }

  if (questions.length === 0) return null;

  // Deduplicate: bitta savol bir necha bor tushmasligi uchun (masalan bir xil input ikki selector bilan topilsa)
  const seen = new Set<string>();
  const deduped = questions.filter((q) => {
    const key = `${q.prompt}::${q.type}::${q.correctAnswer || ""}::${q.correctIndex ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    passageLabel,
    passageText,
    passageParagraphs: paragraphs,
    questions: deduped,
    defaultSkill: "reading",
    defaultTopic,
  };
}

function genericParse(doc: Document, rawHtml: string): ParsedHtmlTask | null {
  const body = doc.body;
  if (!body) return null;
  const titleEl = doc.querySelector("title, h1, .title, .task-title");
  const defaultTopic = titleEl
    ? extractTextFromElement(titleEl)
    : "Imported Task";
  const passageEl = doc.querySelector(
    "div.passage, article.passage, .reading-text, .text-passage, #passage, #passageContent, #passage-container, .passage-container, div.reading, article, main, .content",
  );
  let passageText = passageEl
    ? extractTextFromElement(passageEl)
    : extractTextFromElement(body).substring(0, 5000);
  passageText = sanitizePassageText(passageText);
  const passageLabelEl = doc.querySelector(
    ".passage-label, .passage-title, h2, .subtitle",
  );
  const passageLabel = passageLabelEl
    ? extractTextFromElement(passageLabelEl)
    : undefined;
  // try extract questions generic
  const questionContainer =
    doc.querySelector(
      "div.questions, section.questions, .quiz, .question-section, #questions, div.quiz-container, .exam, .test",
    ) || body;

  // reuse dolls correctMap for generic too
  const correctMap = extractCorrectAnswersFromHtml(rawHtml);
  const questions: ParsedHtmlTask["questions"] = [];

  // try select/inputs in generic container
  const inputs = Array.from(
    questionContainer.querySelectorAll('input[name^="q"], input.summary-input'),
  );
  const selects = Array.from(
    questionContainer.querySelectorAll('select[name^="q"]'),
  );

  if (inputs.length > 0 || selects.length > 0) {
    // already could be handled by dolls? fallback simple
    inputs.forEach((inp) => {
      const el = inp as HTMLInputElement;
      const name = el.getAttribute("name") || "";
      const num = name.replace(/\D/g, "") || String(questions.length + 1);
      const correct = correctMap[num];
      questions.push({
        prompt: `Question ${num} — Fill in the blank`,
        type: "fill-blank",
        correctAnswer: correct,
        difficulty: "medium",
        timeLimitSec: 90,
      });
    });
    selects.forEach((sel) => {
      const el = sel as HTMLSelectElement;
      const name = el.getAttribute("name") || "";
      const num = name.replace(/\D/g, "") || String(questions.length + 1);
      const correct = correctMap[num];
      let correctIndex: number | undefined;
      if (correct) {
        const up = correct.toUpperCase();
        if (up === "TRUE") correctIndex = 0;
        else if (up === "FALSE") correctIndex = 1;
        else if (up.includes("NOT")) correctIndex = 2;
      }
      questions.push({
        prompt: `Question ${num} — TRUE/FALSE/NOT GIVEN`,
        type: "true-false",
        options: ["TRUE", "FALSE", "NOT GIVEN"],
        correctIndex,
        difficulty: "medium",
        timeLimitSec: 90,
      });
    });
    if (questions.length > 0) {
      const seen2 = new Set<string>();
      const deduped2 = questions.filter((q) => {
        const key = `${q.prompt}::${q.type}`;
        if (seen2.has(key)) return false;
        seen2.add(key);
        return true;
      });
      return {
        passageLabel,
        passageText: passageText.substring(0, 15000),
        questions: deduped2,
        defaultSkill: "reading",
        defaultTopic: defaultTopic.substring(0, 150),
      };
    }
  }

  // fallback: split by question markers
  const allText = extractTextFromElement(questionContainer);
  const parts = allText
    .split(/(?=Question\s+\d+|Q\s*\d+|\d+[\.\)]\s*[A-Z])/i)
    .filter(Boolean);
  parts.forEach((part) => {
    const prompt = part.trim().substring(0, 500);
    if (prompt.length > 10) {
      questions.push({
        prompt,
        type: "multiple-choice",
        difficulty: "medium",
        timeLimitSec: 120,
      });
    }
  });

  if (questions.length === 0) return null;

  const seen3 = new Set<string>();
  const deduped3 = questions.filter((q) => {
    const key = `${q.prompt}::${q.type}`;
    if (seen3.has(key)) return false;
    seen3.add(key);
    return true;
  });

  const skillIndicator = (
    passageText + extractTextFromElement(body)
  ).toLowerCase();
  const defaultSkill =
    skillIndicator.includes("listening") ||
    skillIndicator.includes("audio") ||
    skillIndicator.includes("transcript")
      ? "listening"
      : "reading";

  return {
    passageLabel,
    passageText: passageText.substring(0, 15000),
    questions: deduped3.map((q) => ({ ...q, timeLimitSec: q.timeLimitSec })),
    defaultSkill,
    defaultTopic: defaultTopic.substring(0, 150),
  };
}

export function parseHtmlTask(html: string): ParsedHtmlTask | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  if (!doc.body) return null;

  // Try dolls-style first (most accurate for IELTS reading html)
  const dolls = parseDollsStyle(doc, html);
  if (dolls) return dolls;

  return genericParse(doc, html);
}
