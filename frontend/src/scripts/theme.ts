/**
 * Theme control.
 *
 * Two rules, and the second one matters:
 *
 * 1. There is exactly ONE writer of `data-theme` per trigger. The inline
 *    script in <head> sets the *initial* value before first paint; this
 *    module only handles *changes*. Two writers at startup would race.
 * 2. Never write the attribute on load. If the user has made no choice, the
 *    system preference wins via `@media (prefers-color-scheme: light)` in
 *    tokens.css, so there is nothing to write.
 */

export const STORAGE_KEY = 'fwskills:theme';

export type Theme = 'light' | 'dark';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

function readStored(): Theme | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    // Private mode or blocked storage: fall back to the system preference.
    return null;
  }
}

/** The theme currently in effect, including the "follow the system" case. */
export function currentTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (isTheme(attr)) return attr;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Write the theme to the document and persist it. The only place we do so. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage unavailable: the theme still applies for this page view.
  }
}

export function toggleTheme(): Theme {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  syncToggleState(next);
  return next;
}

/** Reflect the active theme onto every toggle control in the document. */
export function syncToggleState(theme: Theme = currentTheme()): void {
  for (const el of document.querySelectorAll<HTMLElement>('[data-theme-toggle]')) {
    el.setAttribute('aria-pressed', String(theme === 'light'));
    el.setAttribute(
      'aria-label',
      theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro',
    );
  }
}

export function init(): void {
  syncToggleState();

  for (const el of document.querySelectorAll<HTMLElement>('[data-theme-toggle]')) {
    el.addEventListener('click', () => toggleTheme());
  }

  // A user who has never chosen should follow the system live, without a
  // reload. An explicit choice is authoritative and is not overridden.
  const media = window.matchMedia('(prefers-color-scheme: light)');
  media.addEventListener('change', () => {
    if (readStored() === null) syncToggleState();
  });
}
