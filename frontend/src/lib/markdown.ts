/**
 * Markdown → HTML for skill bodies.
 *
 * Astro's collection `.render()` is unavailable for the skills collection
 * because its source lives outside `src/` at the repository root (the glob
 * loader cannot attach the render pipeline to a file it does not own). Rather
 * than fight internals, rendering happens here with `markdown-it` plus the
 * same Shiki theme the markdown pipeline uses, so a SKILL.md fence and a
 * hand-written <CodeBlock> still look identical.
 *
 * The output is sanitized HTML produced from a controlled subset of
 * markdown-it rules (headings, lists, code, emphasis, links, tables).
 */

import MarkdownIt from 'markdown-it';
import GithubSlugger from 'github-slugger';
import { highlight } from './highlight';

export interface RenderedHeadings {
  depth: number;
  slug: string;
  text: string;
}

export interface RenderedMarkdown {
  html: string;
  headings: RenderedHeadings[];
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
});

// Rendered code goes through the token-based syntax palette. The `highlight`
// callback is synchronous in markdown-it, so fenced blocks are handled
// separately (see renderBody) and this rule never fires.
const CODE_PLACEHOLDER = /^\u0000CODE:(\d+)\u0000$/;

// Generate a heading id with the same slugger convention the rest of the site
// uses, and record it for the table of contents.
md.renderer.rules.heading_open = (tokens, index) => {
  const token = tokens[index]!;
  const inline = tokens[index + 1];
  const text = inline?.children?.map((c) => c.content).join('') ?? '';
  const slug = new GithubSlugger().slug(text);
  token.attrSet('id', slug);
  return token.tag === 'h1' || token.tag === 'h2' || token.tag === 'h3'
    ? `<${token.tag} id="${slug}">`
    : `<${token.tag}>`;
};

function collectHeadings(html: string): RenderedHeadings[] {
  const slugger = new GithubSlugger();
  const headings: RenderedHeadings[] = [];
  const re = /<h([1-6]) id="([^"]+)">([\s\S]*?)<\/h\1>/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const depth = Number(match[1]);
    const text = match[3]!.replace(/<[^>]+>/g, '').trim();
    const slug = slugger.slug(text);
    headings.push({ depth, slug, text });
  }
  return headings;
}

/**
 * Render a SKILL.md body. Fenced code blocks are highlighted with the shared
 * Shiki theme via placeholders; everything else goes through markdown-it.
 */
export async function renderSkillBody(body: string): Promise<RenderedMarkdown> {
  const fences: Array<{ lang: string; code: string }> = [];
  const chunks: string[] = [];

  // Split on fenced blocks so each one can be highlighted with the async
  // highlighter and re-inserted as a placeholder.
  const fenceRe = /(\u0060\u0060\u0060+|~~~+)([\w+-]*)[^\n]*\n([\s\S]*?)\n?\1/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let fenceCount = 0;
  const fenceParts: string[] = [];

  while ((match = fenceRe.exec(body))) {
    fenceParts.push(body.slice(last, match.index));
    fences.push({ lang: match[2] ?? 'text', code: match[3]! });
    fenceParts.push(`\u0000CODE:${fenceCount}\u0000`);
    fenceCount++;
    last = match.index + match[0].length;
  }
  fenceParts.push(body.slice(last));
  chunks.push(...fenceParts);

  const html = md.render(chunks.join('\n'));

  const highlighted = await Promise.all(
    fences.map((fence) => highlight(fence.code, fence.lang || 'text')),
  );

  let index = 0;
  let out = html.replace(CODE_PLACEHOLDER, () => highlighted[index++]!);

  const headings = collectHeadings(out);
  return { html: out, headings };
}

export { GithubSlugger };