/**
 * Accordion behaviour.
 *
 * `aria-expanded` on the trigger and `hidden` on the panel are the whole
 * contract: a screen reader announces the state from the first, and a
 * panel that stays in the accessibility tree while visually collapsed is
 * focusable-but-invisible, which is the worst kind of bug.
 *
 * Up/Down/Home/End move between triggers, so the group is reachable
 * without tabbing through every panel.
 */

let registered = false;

// Handlers are named and kept, so unregister() can actually detach them.
// An inline arrow passed to addEventListener cannot be removed later, and a
// test process that cannot detach a listener cannot isolate a case.
let onClick: ((event: Event) => void) | null = null;
let onKeydown: ((event: KeyboardEvent) => void) | null = null;

export function initAccordions(): void {
  if (registered) return;
  if (document.querySelector('.accordion__trigger') === null) return;
  registered = true;

  onClick = (event: Event) => {
    const trigger = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
      '.accordion__trigger',
    );
    if (!trigger) return;

    const group = trigger.closest<HTMLElement>('[data-accordion]');
    const panel = document.getElementById(trigger.getAttribute('aria-controls') ?? '');
    if (!panel) return;

    const isOpen = trigger.getAttribute('aria-expanded') === 'true';

    if (group?.dataset.exclusive === 'true' && !isOpen) {
      for (const other of group.querySelectorAll<HTMLButtonElement>('.accordion__trigger')) {
        if (other === trigger) continue;
        other.setAttribute('aria-expanded', 'false');
        const otherPanel = document.getElementById(other.getAttribute('aria-controls') ?? '');
        if (otherPanel) otherPanel.hidden = true;
      }
    }

    trigger.setAttribute('aria-expanded', String(!isOpen));
    panel.hidden = isOpen;
  };

  onKeydown = (event: KeyboardEvent) => {
    const trigger = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>(
      '.accordion__trigger',
    );
    if (!trigger) return;
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;

    const group = trigger.closest<HTMLElement>('[data-accordion]');
    const triggers = [
      ...(group?.querySelectorAll<HTMLButtonElement>('.accordion__trigger') ?? []),
    ];
    if (triggers.length === 0) return;

    const current = triggers.indexOf(trigger);
    let next = current;
    if (event.key === 'ArrowDown') next = (current + 1) % triggers.length;
    if (event.key === 'ArrowUp') next = (current - 1 + triggers.length) % triggers.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = triggers.length - 1;

    event.preventDefault();
    triggers[next]?.focus();
  };

  document.addEventListener('click', onClick);
  document.addEventListener('keydown', onKeydown as EventListener);
}

export function __resetAccordions(): void {
  if (onClick) document.removeEventListener('click', onClick);
  if (onKeydown) document.removeEventListener('keydown', onKeydown as EventListener);
  onClick = null;
  onKeydown = null;
  registered = false;
}
