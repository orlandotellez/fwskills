/**
 * Single entry point for every client-side behaviour on the site.
 *
 * Why this file exists:
 *
 * Each component used to carry its own <script> and register its own
 * delegated listener on `document`. That works until it doesn't: Astro
 * re-evaluates a page's scripts after a client-side navigation, and a
 * delegated listener registered twice fires twice. A copy button that
 * fires two timeouts, or a toggle that runs its body-guard twice, is a
 * silent bug with no error to trace.
 *
 * So the rule is: behaviour is registered HERE, once, and every registration
 * is guarded. A module that finds no matching node exits without
 * registering anything, so the same island is safe on pages where it does
 * not apply.
 *
 * Listeners are delegated from `document`, never bound to a specific node,
 * so content that is swapped in later (a page transition, a filtered grid)
 * keeps working without re-registration.
 *
 * Idempotency is structural, not a flag: `init()` bails out if already
 * running, and every listener attaches at most once per page.
 */

import { init as initTheme } from './theme';
import { initHeader } from './header';
import { initCopyButtons } from './copy';
import { initPackageTabs } from './package-tabs';
import { initAccordions } from './accordion';
import { initSearch } from './search';
import { initReveal } from './reveal';

let started = false;

/**
 * Register every behaviour. Safe to call more than once: the second call
 * is a no-op, which is what makes it safe for a client-side navigation to
 * re-evaluate the module.
 */
export function init(): void {
  if (started) return;
  started = true;

  // Each of these checks for its own nodes first and returns if absent.
  initTheme();
  initHeader();
  initCopyButtons();
  initPackageTabs();
  initAccordions();
  initSearch();
  initReveal();
}

/** Exposed for tests, which need a clean slate between cases. */
export function __reset(): void {
  started = false;
}
