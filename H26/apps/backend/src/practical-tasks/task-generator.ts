/**
 * Rule-based practical task generator.
 *
 * Given an evaluation's 8-dimension scores, it picks the weakest dimensions
 * and composes a dynamic coding task that targets exactly those areas, along
 * with the acceptance criteria the AI reviewer will grade against.
 */

export interface DimensionTemplate {
  label: string;
  focus: string;
  requirements: string[];
}

const DIMENSION_TEMPLATES: Record<string, DimensionTemplate> = {
  codingQuality: {
    label: 'Coding Quality',
    focus: 'clean, readable, well-structured code',
    requirements: [
      'Use clear, consistent naming and small single-responsibility functions',
      'Avoid duplication and dead code; keep cyclomatic complexity low',
      'Handle edge cases and errors explicitly',
    ],
  },
  deliverySpeed: {
    label: 'Delivery Speed',
    focus: 'shipping a working slice quickly with sensible scope',
    requirements: [
      'Deliver a runnable end-to-end slice, not scaffolding only',
      'Include clear run/build instructions in the README',
      'Commit history should show incremental, focused commits',
    ],
  },
  testingQuality: {
    label: 'Testing Quality',
    focus: 'automated tests and coverage',
    requirements: [
      'Add unit tests covering the core logic and edge cases',
      'Include at least one negative/failure-path test',
      'Tests must run with a single documented command',
    ],
  },
  architecture: {
    label: 'Architecture',
    focus: 'modular design and separation of concerns',
    requirements: [
      'Separate concerns into distinct layers/modules',
      'Depend on abstractions, not concrete implementations, at boundaries',
      'Document the high-level design decisions in the README',
    ],
  },
  problemSolving: {
    label: 'Problem Solving',
    focus: 'correct handling of a non-trivial algorithmic problem',
    requirements: [
      'Solve the stated problem correctly for all provided cases',
      'Explain the time/space complexity of your approach',
      'Consider and handle boundary conditions',
    ],
  },
  documentation: {
    label: 'Documentation',
    focus: 'clear documentation for users and maintainers',
    requirements: [
      'Provide a README with purpose, setup, usage, and examples',
      'Document public functions/APIs with parameters and return values',
      'Include inline comments only where they add real value',
    ],
  },
  ownership: {
    label: 'Ownership',
    focus: 'end-to-end responsibility and polish',
    requirements: [
      'Ship a complete feature including error states and validation',
      'Add basic logging and a graceful failure path',
      'Leave the repo in a clean, reviewable state',
    ],
  },
  aiUsage: {
    label: 'AI Usage',
    focus: 'effective, transparent use of AI tooling',
    requirements: [
      'Include an AI-USAGE.md describing prompts and how AI assisted you',
      'Show that AI-generated code was reviewed and adapted, not pasted blindly',
      'Verify AI output with tests or manual checks',
    ],
  },
};

// A concrete build brief per weakest dimension, so the task feels practical.
const PROJECT_BRIEFS: Record<string, string> = {
  codingQuality:
    'Build a small "URL shortener" service (create short code, resolve, list). Focus on clean structure over features.',
  deliverySpeed:
    'Build a minimal "to-do REST API" (create, list, complete, delete) and ship it end-to-end with run instructions.',
  testingQuality:
    'Build a "string/date utility library" with 5+ functions and a full unit-test suite covering edge cases.',
  architecture:
    'Build a "notifications module" that supports email/SMS channels behind a common interface, easily extensible to new channels.',
  problemSolving:
    'Implement a "rate limiter" (token-bucket or sliding-window) with tests proving correctness under bursts.',
  documentation:
    'Build a small "config loader" library and document it thoroughly (README + API docs + examples).',
  ownership:
    'Build a "file upload endpoint" with validation, size limits, error handling, and logging — production-minded.',
  aiUsage:
    'Build a "text summarizer CLI" and document how you used AI to design/implement it in AI-USAGE.md.',
};

export interface GeneratedTask {
  title: string;
  description: string;
  targetDimensions: string[];
  requirements: string[];
}

/**
 * Pick the weakest dimensions (default 3) and build a task around the single
 * weakest as the primary brief, reinforced by the others.
 */
export function generateTaskFromScores(
  scores: Record<string, number>,
  weakCount = 3,
): GeneratedTask {
  const ranked = Object.entries(scores)
    .filter(([key]) => key in DIMENSION_TEMPLATES)
    .sort((a, b) => a[1] - b[1]); // ascending — weakest first

  const weak = ranked.slice(0, weakCount);
  const targetDimensions = weak.map(([key]) => key);
  const primary = targetDimensions[0] ?? 'codingQuality';

  const brief = PROJECT_BRIEFS[primary];
  const focusList = targetDimensions
    .map((d) => DIMENSION_TEMPLATES[d])
    .filter(Boolean);

  const requirements = Array.from(
    new Set(focusList.flatMap((t) => t.requirements)),
  );

  const focusSentence = focusList
    .map((t) => `${t.label} (${t.focus})`)
    .join(', ');

  const title = `Practical Task: Strengthen ${DIMENSION_TEMPLATES[primary].label}`;

  const description = [
    `This task was generated from your latest evaluation and targets your areas with the most room to grow: ${focusSentence}.`,
    ``,
    `## Build`,
    brief,
    ``,
    `## What we're looking for`,
    ...requirements.map((r) => `- ${r}`),
    ``,
    `## Submitting`,
    `Push your solution to a **public GitHub repository** (or open a pull request) and submit the URL. An automated AI review will assess your code against the criteria above, and your supervisor will review the results with you.`,
  ].join('\n');

  return { title, description, targetDimensions, requirements };
}
