/**
 * Bootstrap for DOM integration tests.
 *
 * Component behaviour (focus trap, aria-expanded, clipboard feedback,
 * theme persistence) is DOM behaviour: it cannot be verified by asserting
 * that a string exists in a component file. These tests drive the real
 * markup in a real DOM, because that is the only way to know the
 * accessible contract actually holds.
 *
 * happy-dom rather than a browser: the components use standard DOM APIs
 * and none of them depend on layout. Anything that genuinely needs layout
 * or a real paint is a Lighthouse or Playwright concern, not a unit test.
 */
import { GlobalRegistrator } from '@happy-dom/global-registrator';

// `register` is static: it installs window, document, localStorage and
// matchMedia as globals, which is what the component code under test
// expects to find.
GlobalRegistrator.register({
  url: 'http://localhost:4321/',
  width: 1280,
  height: 900,
});

export function unregister(): void {
  GlobalRegistrator.unregister();
}

/**
 * Reset everything a component test can leak between cases: DOM nodes,
 * localStorage and the theme attribute. Without this, a test that toggles
 * the theme makes the next one start in the wrong state.
 *
 * The module-level `registered` guards mean a fresh DOM alone is not
 * enough: an init() that already ran will not re-register, and the
 * listeners from the previous case keep acting on the NEW nodes. Every
 * test that calls an init() therefore also calls the matching __reset*().
 */
export function resetDom(html: string): void {
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('lang');
  document.body.innerHTML = html;
  document.body.style.overflow = '';

  try {
    localStorage.clear();
  } catch {
    // Nothing to clear.
  }
}

/** The inline theme script from Layout.astro, verbatim. */
export const THEME_BOOTSTRAP = `(() => {
  try {
    var t = localStorage.getItem('fwskills:theme');
    if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
  } catch (e) {}
})();`;

/** Build the mobile menu markup the header renders, for the focus trap test. */
export function mobileMenuMarkup(): string {
  return `
    <button data-menu-toggle aria-expanded="false" aria-controls="mobile-menu" aria-label="Abrir menú">M</button>
    <div id="mobile-menu" data-mobile-menu hidden>
      <a href="/skills">Skills</a>
      <a href="/instalacion">Instalación</a>
      <a href="/docs/introduccion/">Docs</a>
      <a href="/contribuir">Contribuir</a>
      <button data-close>✕</button>
    </div>
  `;
}
