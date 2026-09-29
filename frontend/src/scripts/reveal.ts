/**
 * Scroll reveal.
 *
 * Purely additive: the [data-reveal] base rule in utilities.css keeps
 * content visible without JS, so a failed observer means a static page,
 * not a blank one. Elements reveal once and stop being observed, because
 * an element re-animating every time it re-enters the viewport reads as
 * jitter rather than polish.
 *
 * With reduced motion the elements are marked visible immediately, since
 * the animation is exactly what the user asked us not to do.
 */

let registered = false;

export function initReveal(): void {
  if (registered) return;
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (targets.length === 0) return;
  registered = true;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const el of targets) el.classList.add('is-visible');
    return;
  }

  if (typeof IntersectionObserver === 'undefined') {
    for (const el of targets) el.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
  );

  for (const el of targets) observer.observe(el);
}

export function __resetReveal(): void {
  registered = false;
}
