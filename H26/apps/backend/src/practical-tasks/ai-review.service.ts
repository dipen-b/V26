import { Injectable, Logger } from '@nestjs/common';

export interface AiReviewResult {
  overallScore: number;
  summary: string;
  dimensionScores: Record<string, number>;
  strengths: string[];
  issues: string[];
  recommendation: string;
  engine: string;
}

interface RepoFile {
  path: string;
  content: string;
}

const MAX_FILES = 12;
const MAX_TOTAL_BYTES = 60_000;
const SOURCE_EXT = /\.(ts|tsx|js|jsx|py|java|go|rb|rs|c|cpp|cs|php|md)$/i;
const SKIP_DIR = /(node_modules|dist|build|\.next|vendor|\.git|coverage)\//i;

@Injectable()
export class AiReviewService {
  private readonly logger = new Logger('AiReviewService');

  /** Orchestrates: fetch code from GitHub -> Gemini review -> heuristic fallback. */
  async reviewSubmission(
    githubUrl: string,
    targetDimensions: string[],
    requirements: string[],
  ): Promise<AiReviewResult> {
    const parsed = this.parseGitHubUrl(githubUrl);
    if (!parsed) {
      throw new Error('Invalid GitHub URL. Expected https://github.com/<owner>/<repo>[...]');
    }

    const { files, description } = await this.fetchRepoFiles(parsed.owner, parsed.repo);
    if (files.length === 0) {
      throw new Error('No readable source files were found in the repository.');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        return await this.reviewWithGemini(apiKey, description, files, targetDimensions, requirements);
      } catch (err: any) {
        this.logger.warn(`Gemini review failed, falling back to heuristic: ${err.message}`);
      }
    }
    return this.reviewHeuristic(files, targetDimensions, requirements);
  }

  parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
      const u = new URL(url.trim());
      if (!u.hostname.includes('github.com')) return null;
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length < 2) return null;
      const owner = parts[0];
      const repo = parts[1].replace(/\.git$/, '');
      return { owner, repo };
    } catch {
      return null;
    }
  }

  private ghHeaders() {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'SkillProof-AI',
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }
    return headers;
  }

  private async fetchRepoFiles(
    owner: string,
    repo: string,
  ): Promise<{ files: RepoFile[]; description: string }> {
    // 1. Repo metadata -> default branch + description
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: this.ghHeaders(),
    });
    if (!metaRes.ok) {
      throw new Error(
        metaRes.status === 404
          ? 'Repository not found or is private. Please use a public repo URL.'
          : `GitHub API error (${metaRes.status}).`,
      );
    }
    const meta: any = await metaRes.json();
    const branch = meta.default_branch || 'main';

    // 2. Full file tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers: this.ghHeaders() },
    );
    if (!treeRes.ok) throw new Error(`Could not read repository tree (${treeRes.status}).`);
    const tree: any = await treeRes.json();

    const candidates: string[] = (tree.tree || [])
      .filter((n: any) => n.type === 'blob')
      .map((n: any) => n.path as string)
      .filter((p: string) => SOURCE_EXT.test(p) && !SKIP_DIR.test(p) && !/package-lock|yarn\.lock/.test(p));

    // Prioritise README + tests, then the rest
    candidates.sort((a, b) => this.filePriority(b) - this.filePriority(a));

    const files: RepoFile[] = [];
    let total = 0;
    for (const path of candidates.slice(0, MAX_FILES * 2)) {
      if (files.length >= MAX_FILES || total >= MAX_TOTAL_BYTES) break;
      try {
        const rawRes = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
          { headers: { 'User-Agent': 'SkillProof-AI' } },
        );
        if (!rawRes.ok) continue;
        let content = await rawRes.text();
        if (content.length > 8000) content = content.slice(0, 8000) + '\n… (truncated)';
        total += content.length;
        files.push({ path, content });
      } catch {
        /* skip unreadable file */
      }
    }

    return { files, description: meta.description || '' };
  }

  private filePriority(path: string): number {
    const p = path.toLowerCase();
    if (/readme/.test(p)) return 100;
    if (/ai-usage/.test(p)) return 90;
    if (/(test|spec|__tests__)/.test(p)) return 80;
    if (/(src|lib|app)\//.test(p)) return 50;
    return 10;
  }

  // ----------------------------------------------------------------
  // Gemini (free tier) review
  // ----------------------------------------------------------------
  private async reviewWithGemini(
    apiKey: string,
    repoDescription: string,
    files: RepoFile[],
    targetDimensions: string[],
    requirements: string[],
  ): Promise<AiReviewResult> {
    const codeBlob = files
      .map((f) => `--- FILE: ${f.path} ---\n${f.content}`)
      .join('\n\n')
      .slice(0, 55_000);

    const prompt = [
      'You are a senior engineer reviewing a candidate\'s practical coding task.',
      `Repository description: ${repoDescription || '(none)'}`,
      '',
      `The task specifically targets these skill dimensions: ${targetDimensions.join(', ')}.`,
      'Acceptance criteria:',
      ...requirements.map((r) => `- ${r}`),
      '',
      'Review the code below and respond with ONLY a JSON object (no markdown fences) of shape:',
      '{',
      '  "overallScore": <0-100 integer>,',
      `  "dimensionScores": { ${targetDimensions.map((d) => `"${d}": <0-100>`).join(', ')} },`,
      '  "summary": "<2-3 sentence overall assessment>",',
      '  "strengths": ["<short bullet>", ...],',
      '  "issues": ["<short bullet>", ...],',
      '  "recommendation": "<one actionable next step for the supervisor>"',
      '}',
      '',
      'CODE:',
      codeBlob,
    ].join('\n');

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gemini API ${res.status}: ${body.slice(0, 200)}`);
    }

    const data: any = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsed = this.safeParseJson(text);
    if (!parsed) throw new Error('Gemini returned unparseable output.');

    return {
      overallScore: this.clampScore(parsed.overallScore),
      dimensionScores: this.normaliseDimensionScores(parsed.dimensionScores, targetDimensions),
      summary: String(parsed.summary || 'Review completed.'),
      strengths: this.toStringArray(parsed.strengths),
      issues: this.toStringArray(parsed.issues),
      recommendation: String(parsed.recommendation || 'Discuss the results with the employee.'),
      engine: 'gemini',
    };
  }

  private safeParseJson(text: string): any | null {
    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  // ----------------------------------------------------------------
  // Heuristic fallback (no API key / offline)
  // ----------------------------------------------------------------
  private reviewHeuristic(
    files: RepoFile[],
    targetDimensions: string[],
    requirements: string[],
  ): AiReviewResult {
    const paths = files.map((f) => f.path.toLowerCase());
    const allCode = files.map((f) => f.content).join('\n');

    const hasReadme = paths.some((p) => /readme/.test(p));
    const hasTests = paths.some((p) => /(test|spec|__tests__)/.test(p));
    const hasAiUsage = paths.some((p) => /ai-usage/.test(p));
    const hasErrorHandling = /(try\s*\{|catch\s*\(|throw\s+|\.catch\()/.test(allCode);
    const hasLogging = /(console\.(log|error|warn)|logger\.|logging\.)/.test(allCode);
    const dirCount = new Set(files.map((f) => f.path.split('/').slice(0, -1).join('/')).filter(Boolean)).size;
    const commentLines = (allCode.match(/(^|\s)(\/\/|#|\/\*|\*)/gm) || []).length;
    const totalLines = allCode.split('\n').length || 1;
    const commentRatio = commentLines / totalLines;
    const avgFileLen = totalLines / files.length;

    const signals: Record<string, number> = {
      codingQuality: this.score([avgFileLen < 200, files.length >= 2, commentRatio > 0.03]),
      deliverySpeed: this.score([files.length >= 2, hasReadme]),
      testingQuality: this.score([hasTests, hasTests && files.filter((f) => /(test|spec)/i.test(f.path)).length > 1]),
      architecture: this.score([dirCount >= 2, dirCount >= 3, files.length >= 3]),
      problemSolving: this.score([allCode.length > 500, hasErrorHandling]),
      documentation: this.score([hasReadme, commentRatio > 0.05, allCode.includes('##')]),
      ownership: this.score([hasErrorHandling, hasLogging, hasReadme]),
      aiUsage: this.score([hasAiUsage, hasAiUsage && allCode.length > 300]),
    };

    const dimensionScores: Record<string, number> = {};
    for (const d of targetDimensions) dimensionScores[d] = signals[d] ?? 60;

    const values = Object.values(dimensionScores);
    const overallScore = Math.round(values.reduce((a, b) => a + b, 0) / (values.length || 1));

    const strengths: string[] = [];
    const issues: string[] = [];
    if (hasReadme) strengths.push('Includes a README');
    else issues.push('No README found — add setup and usage docs');
    if (hasTests) strengths.push('Contains automated tests');
    else issues.push('No test files detected — add unit tests');
    if (dirCount >= 2) strengths.push('Code is organised across multiple modules/folders');
    else issues.push('Flat structure — consider separating concerns into modules');
    if (hasErrorHandling) strengths.push('Handles errors explicitly');
    else issues.push('Little/no explicit error handling detected');
    if (targetDimensions.includes('aiUsage') && !hasAiUsage) {
      issues.push('No AI-USAGE.md documenting how AI was used');
    }

    return {
      overallScore,
      dimensionScores,
      summary: `Automated structural review of ${files.length} file(s). ${
        overallScore >= 75 ? 'Solid submission overall.' : overallScore >= 55 ? 'Reasonable, with clear gaps.' : 'Significant gaps against the criteria.'
      }`,
      strengths: strengths.length ? strengths : ['Code was submitted and is readable'],
      issues: issues.length ? issues : ['No major structural issues detected'],
      recommendation:
        overallScore >= 75
          ? 'Review the details, then approve or set a follow-up stretch task.'
          : 'Share the gaps with the employee and consider a focused re-submission.',
      engine: 'heuristic',
    };
  }

  private score(conditions: boolean[]): number {
    const met = conditions.filter(Boolean).length;
    return Math.round(40 + (met / conditions.length) * 55); // 40..95
  }

  private clampScore(n: any): number {
    const v = Number(n);
    if (Number.isNaN(v)) return 60;
    return Math.max(0, Math.min(100, Math.round(v)));
  }

  private normaliseDimensionScores(
    raw: any,
    dims: string[],
  ): Record<string, number> {
    const out: Record<string, number> = {};
    for (const d of dims) out[d] = this.clampScore(raw?.[d]);
    return out;
  }

  private toStringArray(v: any): string[] {
    if (Array.isArray(v)) return v.map((x) => String(x)).slice(0, 8);
    if (typeof v === 'string' && v.trim()) return [v];
    return [];
  }
}
