import { createHighlighter, type Highlighter } from 'shiki';
import { fwskillsTheme } from './shiki-theme';

/**
 * Build-time syntax highlighting for hand-authored code blocks.
 *
 * Markdown goes through Astro's own Shiki pipeline, which uses the same theme
 * object. Sharing it is the point: both paths emit `var(--syn-*)`, so a
 * markdown fence and a <CodeBlock> are guaranteed to look identical and both
 * re-colour on theme toggle.
 *
 * The highlighter is created once per build. Creating one per block would
 * re-parse the grammar for every command on every page.
 */
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [fwskillsTheme as never],
    langs: ['bash', 'sh', 'shell', 'json', 'yaml', 'markdown', 'ts', 'js', 'astro', 'diff', 'text'],
  });
  return highlighterPromise;
}

const BUNDLED = new Set([
  'bash',
  'sh',
  'shell',
  'json',
  'yaml',
  'markdown',
  'ts',
  'js',
  'astro',
  'diff',
  'text',
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Highlight `code` and return HTML, or plain escaped HTML when the language
 * is unknown. Never throws: a bad language must not fail the build.
 */
export async function highlight(code: string, lang = 'text'): Promise<string> {
  try {
    const highlighter = await getHighlighter();
    const language = BUNDLED.has(lang) ? lang : 'text';
    return highlighter.codeToHtml(code, {
      lang: language,
      theme: 'fwskills',
      defaultColor: false,
    });
  } catch {
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
  }
}

/** Strip the <pre> wrapper so a block can sit inside our own chrome. */
export async function highlightInline(code: string, lang = 'text'): Promise<string> {
  const html = await highlight(code, lang);
  return html.replace(/^<pre[^>]*>/, '').replace(/<\/pre>$/, '');
}
