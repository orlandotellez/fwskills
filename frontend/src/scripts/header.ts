/**
 * Header behaviour: scroll state and the mobile menu.
 *
 * The mobile panel traps focus, blocks body scroll, and closes on ✕, outside
 * click and Escape. Restoring focus to the trigger on close is the part that
 * is usually missing, and it is the part keyboard users notice.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function initScrollState(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;

  // The spec threshold is 40px. A passive listener plus rAF is enough; no
  // scroll library earns its weight for a single boolean.
  let ticking = false;
  const update = () => {
    header.toggleAttribute('data-scrolled', window.scrollY > 40);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

function initMobileMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-mobile-menu]');
  if (!toggle || !panel) return;

  let lastFocused: HTMLElement | null = null;

  const open = () => {
    lastFocused = document.activeElement as HTMLElement | null;
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    document.body.style.overflow = 'hidden';

    const first = panel.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
  };

  const close = () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
    lastFocused?.focus();
  };

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => (isOpen() ? close() : open()));

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    // Focus trap: wrap from the last focusable back to the first.
    if (event.key === 'Tab') {
      const focusable = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) return;

      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // Outside click. The panel is full screen, so this means "click the
  // backdrop area", and the toggle itself is handled by its own listener.
  panel.addEventListener('click', (event) => {
    if (event.target === panel) close();
  });

  // A resize past the breakpoint should not leave the panel stuck open.
  window.matchMedia('(min-width: 769px)').addEventListener('change', (event) => {
    if (event.matches && isOpen()) close();
  });
}

export function initHeader(): void {
  initScrollState();
  initMobileMenu();
}
