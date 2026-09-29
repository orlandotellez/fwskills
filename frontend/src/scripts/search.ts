/**
 * Global search modal.
 *
 * Opens with Ctrl/⌘+K from anywhere and searches skills AND docs. The
 * index is fetched once from /search-index.json, which is generated at
 * build time from the content collections: no runtime backend, and the
 * 20 KB index is one fetch on first search instead of being inlined into
 * every HTML response.
 *
 * The dialog keeps focus inside while open and returns it to the trigger
 * on close, which is the part a keyboard user notices immediately.
 */

export interface SearchEntry {
  title: string;
  description: string;
  href: string;
  kind: 'skill' | 'doc';
  category?: string;
}

let registered = false;
let cursor = -1;

export function initSearch(): void {
  const dialogEl = document.querySelector<HTMLElement>('[data-search]');
  if (registered || !dialogEl) return;

  const inputEl = dialogEl.querySelector<HTMLInputElement>('[data-search-input]');
  const resultsEl = dialogEl.querySelector<HTMLUListElement>('[data-search-results]');
  const statusEl = dialogEl.querySelector<HTMLElement>('[data-search-status]');
  if (!inputEl || !resultsEl) return;

  // Narrowed once into non-null consts. The closures below run later, and
  // TypeScript does not carry a guard's narrowing into a closure.
  const dialog: HTMLElement = dialogEl;
  const input: HTMLInputElement = inputEl;
  const results: HTMLUListElement = resultsEl;
  const status: HTMLElement | null = statusEl;
  registered = true;

  let index: SearchEntry[] = [];
  let loading: Promise<SearchEntry[]> | null = null;
  let lastFocused: HTMLElement | null = null;

  function loadIndex(): Promise<SearchEntry[]> {
    loading ??= fetch('/search-index.json')
      .then((r) => (r.ok ? (r.json() as Promise<SearchEntry[]>) : []))
      .catch(() => []);
    return loading;
  }

  function score(entry: SearchEntry, query: string): number {
    const q = query.toLowerCase();
    const title = entry.title.toLowerCase();
    const desc = entry.description.toLowerCase();
    if (title === q) return 100;
    if (title.startsWith(q)) return 80;
    if (title.includes(q)) return 60;
    if (desc.includes(q)) return 30;
    return 0;
  }

  function search(query: string): SearchEntry[] {
    if (!query.trim()) return [];
    return index
      .map((entry) => ({ entry, s: score(entry, query) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || a.entry.title.localeCompare(b.entry.title))
      .slice(0, 12)
      .map((r) => r.entry);
  }

  function render(matches: SearchEntry[], query: string): void {
    if (!status) return;
    cursor = -1;

    if (!query.trim()) {
      status.textContent = index.length
        ? `${index.length} resultados indexados. Escribí para filtrar.`
        : 'Escribí para buscar.';
      results.replaceChildren();
      return;
    }

    if (matches.length === 0) {
      status.textContent = `Sin resultados para “${query}”.`;
      results.replaceChildren();
      return;
    }

    status.textContent = `${matches.length} resultado${matches.length === 1 ? '' : 's'}.`;

    const items = matches.map((entry) => {
      const li = document.createElement('li');
      li.className = 'search__item';

      const a = document.createElement('a');
      a.className = 'search__link';
      a.href = entry.href;

      const kind = document.createElement('span');
      kind.className = 'search__kind';
      kind.textContent = entry.kind === 'skill' ? 'Skill' : 'Doc';

      const title = document.createElement('span');
      title.className = 'search__title';
      title.textContent = entry.title;

      const desc = document.createElement('span');
      desc.className = 'search__desc';
      desc.textContent = entry.description;

      a.append(kind, title, desc);
      li.append(a);
      return li;
    });

    results.replaceChildren(...items);
  }

  function highlight(delta: number): void {
    const links = [...results.querySelectorAll<HTMLAnchorElement>('.search__link')];
    if (links.length === 0) return;
    links[cursor]?.classList.remove('is-active');
    cursor = (cursor + delta + links.length) % links.length;
    links[cursor]?.classList.add('is-active');
  }

  function openDialog(): void {
    lastFocused = document.activeElement as HTMLElement | null;
    dialog.hidden = false;
    document.body.style.overflow = 'hidden';
    input.focus();

    loadIndex().then((entries) => {
      index = entries;
      render([], input.value);
    });
  }

  function closeDialog(): void {
    dialog.hidden = true;
    document.body.style.overflow = '';
    input.value = '';
    lastFocused?.focus();
  }

  for (const opener of document.querySelectorAll<HTMLElement>('[data-search-open]')) {
    opener.addEventListener('click', openDialog);
  }
  for (const closer of dialog.querySelectorAll<HTMLElement>('[data-search-close]')) {
    closer.addEventListener('click', closeDialog);
  }

  document.addEventListener('keydown', (event) => {
    const isOpen = !dialog.hidden;

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (isOpen) closeDialog();
      else openDialog();
      return;
    }

    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      highlight(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      highlight(-1);
    } else if (event.key === 'Enter' && cursor >= 0) {
      event.preventDefault();
      results.querySelectorAll<HTMLAnchorElement>('.search__link')[cursor]?.click();
    } else if (event.key === 'Tab') {
      // Keep focus inside the dialog while it is open.
      event.preventDefault();
    }
  });

  input.addEventListener('input', () => render(search(input.value), input.value));
}

export function __resetSearch(): void {
  registered = false;
  cursor = -1;
}
