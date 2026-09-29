/**
 * Header behaviour: scroll state and the mobile menu.
 *
 * The mobile panel traps focus, blocks body scroll, and closes on ✕,
 * outside click and Escape. Restoring focus to the trigger on close is
 * the part that is usually missing, and it is the part keyboard users
 * notice: without it, closing the menu drops focus to <body> and the next
 * Tab starts from the top of the document.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let registered = false;
let teardown: Array<() => void> = [];

/**
 * addEventListener that records how to undo itself.
 *
 * Every listener this module attaches is registered through here, so
 * __resetHeader can detach all of them. A listener that cannot be removed
 * cannot be tested in isolation, and the browser does not care: it keeps
 * firing on whatever document happens to be current.
 */
function on(target: EventTarget, type: string, handler: EventListener, opts?: AddEventListenerOptions): void {
  target.addEventListener(type, handler, opts);
  teardown.push(() => target.removeEventListener(type, handler, opts));
}

function initScrollState(): void {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (!header) return;

  // The threshold is 40px. A passive listener plus rAF is enough; no scroll
  // library earns its weight for a single boolean.
  let ticking = false;
  const update = () => {
    header.toggleAttribute('data-scrolled', window.scrollY > 40);
    ticking = false;
  };

  on(
    window,
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

    panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  };

  const close = () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
    lastFocused?.focus();
  };

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  on(toggle, 'click', () => (isOpen() ? close() : open()));

  on(document, 'keydown', ((event: KeyboardEvent) => {
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
  }) as EventListener);

  // Outside click. The panel is full screen, so this means "click the
  // backdrop area", and the toggle itself is handled by its own listener.
  on(panel, 'click', (event: Event) => {
    if (event.target === panel) close();
  });

  // A resize past the breakpoint should not leave the panel stuck open.
  const desktop = window.matchMedia('(min-width: 769px)');
  on(desktop, 'change', ((event: MediaQueryListEvent) => {
    if (event.matches && isOpen()) close();
  }) as EventListener);
}

export function initHeader(): void {
  if (registered) return;
  if (!document.querySelector('[data-site-header]')) return;
  registered = true;
  initScrollState();
  initMobileMenu();
}

export function __resetHeader(): void {
  for (const undo of teardown) undo();
  teardown = [];
  registered = false;
}

export { FOCUSABLE };
