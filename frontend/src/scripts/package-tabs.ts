/**
 * Package manager tabs.
 *
 * Two behaviours that must hold together:
 *
 * 1. Choosing a manager in one group updates every other group on the page.
 *    A page with two install blocks showing `npm` in one and `pnpm` in the
 *    other is a documentation bug, not a style choice.
 * 2. The choice survives a reload (localStorage), so a reader who is on
 *    bun does not get yanked back to npm by the next page.
 *
 * Storage access is wrapped everywhere: private mode throws, and a docs
 * site that crashes in Safari private mode is worse than one that forgets
 * the preference.
 */

export const PM_KEY = 'fwskills:pm';

let registered = false;
let onClick: ((event: Event) => void) | null = null;
let onKeydown: ((event: KeyboardEvent) => void) | null = null;

function read(): string | null {
  try {
    return localStorage.getItem(PM_KEY);
  } catch {
    return null;
  }
}

function write(id: string): void {
  try {
    localStorage.setItem(PM_KEY, id);
  } catch {
    // Storage blocked: the selection still applies for this page view.
  }
}

function select(group: HTMLElement, id: string): void {
  for (const tab of group.querySelectorAll<HTMLButtonElement>('[data-pm-id]')) {
    const active = tab.dataset.pmId === id;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  for (const panel of group.querySelectorAll<HTMLElement>('[data-pm-panel]')) {
    panel.hidden = panel.dataset.pmPanel !== id;
  }
}

function selectEverywhere(id: string): void {
  for (const group of document.querySelectorAll<HTMLElement>('[data-pmtabs]')) {
    select(group, id);
  }
}

export function initPackageTabs(): void {
  const groups = document.querySelectorAll<HTMLElement>('[data-pmtabs]');
  if (registered || groups.length === 0) return;
  registered = true;

  // The stored value wins on load; otherwise the server-rendered first tab
  // stands. Done before the listeners so the first paint is already right.
  const stored = read();
  if (stored) selectEverywhere(stored);

  onClick = (event: Event) => {
    const tab = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-pm-id]');
    if (!tab?.dataset.pmId) return;
    write(tab.dataset.pmId);
    selectEverywhere(tab.dataset.pmId);
  };
  document.addEventListener('click', onClick);

  // Arrow-key navigation inside a tablist, per the WAI-ARIA pattern.
  onKeydown = (event: KeyboardEvent) => {
    const tab = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-pm-id]');
    if (!tab) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    const list = tab.closest('[role="tablist"]');
    const tabs = [...(list?.querySelectorAll<HTMLButtonElement>('[data-pm-id]') ?? [])];
    if (tabs.length === 0) return;

    const current = tabs.indexOf(tab);
    let next = current;
    if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;

    const target = tabs[next];
    if (!target?.dataset.pmId) return;

    event.preventDefault();
    write(target.dataset.pmId);
    selectEverywhere(target.dataset.pmId);
    target.focus();
  };
  document.addEventListener('keydown', onKeydown as EventListener);
}

export function __resetPackageTabs(): void {
  if (onClick) document.removeEventListener('click', onClick);
  if (onKeydown) document.removeEventListener('keydown', onKeydown as EventListener);
  onClick = null;
  onKeydown = null;
  registered = false;
}
