import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from 'bun:test';

/**
 * The reduced-motion contract.
 *
 * `html { scroll-behavior: smooth }` is part of the design — but ONLY while
 * the user prefers motion. Anyone reintroducing smooth scrolling outside the
 * reduced-motion block breaks the contract, and this test exists so that stays
 * a deliberate decision instead of an accident.
 */

const BASE_CSS = join(import.meta.dir, '..', 'src', 'styles', 'base.css');
const css = readFileSync(BASE_CSS, 'utf8');

test('html uses smooth scrolling in the default (motion) mode', () => {
  expect(css).toMatch(/html\s*\{\s*scroll-behavior:\s*smooth\s*;/);
});

test('the reduced-motion block neutralises smooth scrolling', () => {
  const reduceBlock = css.slice(css.indexOf('prefers-reduced-motion: reduce'));
  expect(reduceBlock).not.toBe('');
  expect(reduceBlock).toMatch(/scroll-behavior:\s*auto/);
});

test('no smooth scrolling outside the reduced-motion block', () => {
  // Comments may legally quote the declarations, so strip them before
  // counting. Only declarations matter to the contract.
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');

  const motionBlockStart = stripped.indexOf('prefers-reduced-motion: reduce');
  expect(motionBlockStart).toBeGreaterThan(-1);

  const before = stripped.slice(0, motionBlockStart);
  expect(before.match(/scroll-behavior:\s*smooth/g)?.length ?? 0).toBe(1);

  const after = stripped.slice(motionBlockStart + 'prefers-reduced-motion: reduce'.length);
  // Anything smooth AFTER the motion block is a broken contract.
  expect(after.match(/scroll-behavior:\s*smooth/g) ?? []).toEqual([]);
});

test('the neutralising block also kills transitions and animations', () => {
  const reduceBlock = css.slice(css.indexOf('prefers-reduced-motion: reduce'));
  expect(reduceBlock).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  expect(reduceBlock).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
});