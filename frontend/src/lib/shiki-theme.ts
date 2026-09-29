/**
 * The Shiki theme used by BOTH the markdown pipeline and <CodeBlock>.
 *
 * Colours are CSS custom properties, which Shiki inlines verbatim. That makes
 * the highlighted markup read the design tokens directly, so a code block
 * re-colours on theme toggle with no second highlight pass and no parallel
 * GitHub theme that could drift away from specs/modules/frontend/02-design.md.
 *
 * Values and their measured WCAG ratios live in src/styles/tokens.css.
 */
import type { ThemeRegistrationRaw } from 'shiki';

export const fwskillsTheme = {
  name: 'fwskills',
  type: 'dark',
  colors: {
    'editor.background': 'var(--code-bg)',
    'editor.foreground': 'var(--text)',
  },
  settings: [
    // Defaults. Everything that has no specific scope below inherits these.
    {
      settings: {
        background: 'var(--code-bg)',
        foreground: 'var(--text)',
      },
    },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: 'var(--syn-comment)', fontStyle: 'italic' } },
    { scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: 'var(--syn-string)' } },
    { scope: ['keyword', 'keyword.control', 'storage', 'storage.type', 'keyword.operator.word'], settings: { foreground: 'var(--syn-keyword)' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character', 'constant.other'], settings: { foreground: 'var(--syn-number)' } },
    { scope: ['entity.name.function', 'support.function', 'entity.name.method'], settings: { foreground: 'var(--syn-function)' } },
    { scope: ['entity.name.type', 'support.type', 'entity.name.class', 'entity.name.namespace', 'entity.other.inherited-class'], settings: { foreground: 'var(--syn-type)' } },
    { scope: ['variable', 'variable.parameter', 'variable.other', 'meta.definition.variable'], settings: { foreground: 'var(--syn-variable)' } },
    { scope: ['tag', 'entity.name.tag', 'punctuation.definition.tag'], settings: { foreground: 'var(--syn-tag)' } },
    { scope: ['entity.other.attribute-name', 'attribute_name', 'support.constant.attribute'], settings: { foreground: 'var(--syn-attr-name)' } },
    { scope: ['keyword.operator', 'punctuation.accessor'], settings: { foreground: 'var(--syn-operator)' } },
    { scope: ['punctuation', 'punctuation.separator', 'punctuation.definition', 'delimiter', 'meta.brace'], settings: { foreground: 'var(--syn-punctuation)' } },
    { scope: ['keyword.operator.logical', 'keyword.operator.arithmetic', 'keyword.operator.comparison', 'keyword.operator.assignment'], settings: { foreground: 'var(--syn-operator)' } },
    { scope: ['variable.language', 'keyword.operator.new', 'keyword.operator.type'], settings: { foreground: 'var(--syn-keyword)' } },
    { scope: ['constant.other.color', 'constant.other.rgb-value'], settings: { foreground: 'var(--syn-number)' } },
    { scope: ['invalid', 'invalid.illegal'], settings: { foreground: 'var(--syn-tag)' } },
  ],
} satisfies ThemeRegistrationRaw;