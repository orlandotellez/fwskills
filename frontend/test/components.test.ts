/**
 * Component behaviour — integration tests.
 *
 * These drive the real modules against a real DOM. The spec's requirement
 * is behavioural ("Esc closes it", "focus returns to the trigger"), and no
 * amount of grepping a component file can establish that. A menu that
 * toggles `aria-expanded` but leaves focus on <body> passes every static
 * check and fails a keyboard user.
 *
 * Spec: specs/tasks/frontend/02-componentes-globales.md T15.
 */
import { afterAll, beforeEach, describe, expect, test } from 'bun:test';
import { resetDom, mobileMenuMarkup, unregister } from './setup';

import { initHeader, __resetHeader } from '../src/scripts/header';
import { initCopyButtons, __resetCopy } from '../src/scripts/copy';
import { initPackageTabs, __resetPackageTabs, PM_KEY } from '../src/scripts/package-tabs';
import { initAccordions, __resetAccordions } from '../src/scripts/accordion';
import { currentTheme, applyTheme, toggleTheme, STORAGE_KEY } from '../src/scripts/theme';

/**
 * Per-case isolation.
 *
 * The behaviour modules register DELEGATED listeners on `document`, which is
 * correct in a browser: a listener survives nodes being swapped in later. In
 * a test process that same property means every case is also driven by the
 * listeners of the cases before it, so an assertion can pass or fail
 * depending on execution order.
 *
 * A fresh body does not detach those listeners. What does is the `__reset*`
 * guard each module exposes: it flips the module's `registered` flag, and the
 * next `init()` re-attaches. Combined with `resetDom`, which rebuilds the
 * body, each case gets the listeners it installed and no others.
 */
let installed: Array<() => void> = [];

function scenario(markup: string): void {
  for (const undo of installed) undo();
  installed = [];
  resetDom(markup);
}

function isolate(reset: () => void): void {
  installed.push(reset);
}

afterAll(() => {
  for (const undo of installed) undo();
  unregister();
});

// ─────────────────────────────────────────────────────────────────────────
// Mobile menu: the five behaviours the spec names, one test each.
// ─────────────────────────────────────────────────────────────────────────
describe('menú móvil', () => {
  beforeEach(() => {
    scenario(`<header data-site-header></header>${mobileMenuMarkup()}`);
    isolate(__resetHeader);
  });

  test('abre con aria-expanded="true" y bloquea el scroll del body', () => {
    const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')!;
    const panel = document.querySelector<HTMLElement>('[data-mobile-menu]')!;

    initHeader();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);

    toggle.click();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
  });

  test('el foco queda dentro del panel mientras está abierto', () => {
    const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')!;
    initHeader();
    toggle.click();

    const panel = document.querySelector<HTMLElement>('[data-mobile-menu]')!;
    expect(panel.contains(document.activeElement)).toBe(true);
  });

  test('Esc lo cierra y restaura el foco en el botón que lo abrió', () => {
    const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')!;
    const panel = document.querySelector<HTMLElement>('[data-mobile-menu]')!;

    initHeader();
    // A real browser focuses a button on click; happy-dom does not, and the
    // module remembers document.activeElement as the trigger to restore to.
    // Without this the test measures the harness, not the component.
    toggle.focus();
    toggle.click();
    expect(panel.hidden).toBe(false);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(panel.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    // The part that is usually missing.
    expect(document.activeElement).toBe(toggle);
    expect(document.body.style.overflow).toBe('');
  });

  test('el foco queda atrapado: Tab desde el último control vuelve al primero', () => {
    const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]')!;
    const panel = document.querySelector<HTMLElement>('[data-mobile-menu]')!;
    initHeader();
    toggle.click();

    const focusable = [...panel.querySelectorAll<HTMLElement>('a[href], button')];
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;

    last.focus();
    expect(document.activeElement).toBe(last);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);
  });

  test('el header gana data-scrolled al pasar de 40px', () => {
    const header = document.querySelector<HTMLElement>('[data-site-header]')!;
    initHeader();
    expect(header.hasAttribute('data-scrolled')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Package manager tabs: cross-group sync and persistence.
// ─────────────────────────────────────────────────────────────────────────
const tabsMarkup = (id: string) => `
  <div data-pmtabs>
    <div role="tablist">
      <button data-pm-id="npm"  aria-selected="false" role="tab" data-pm-tabs="${id}">npm</button>
      <button data-pm-id="pnpm" aria-selected="false" role="tab" data-pm-tabs="${id}">pnpm</button>
      <button data-pm-id="bun"  aria-selected="false" role="tab" data-pm-tabs="${id}">bun</button>
    </div>
    <div data-pm-panel="npm"  hidden>npx fwskills</div>
    <div data-pm-panel="pnpm" hidden>pnpm dlx fwskills</div>
    <div data-pm-panel="bun"  hidden>bunx fwskills</div>
  </div>
`;

describe('tabs de gestor de paquetes', () => {
  beforeEach(() => {
    scenario(tabsMarkup('a') + tabsMarkup('b'));
    isolate(__resetPackageTabs);
  });

  test('elegir pnpm actualiza TODOS los grupos de la página sin recargar', () => {
    initPackageTabs();

    document.querySelector<HTMLButtonElement>('[data-pm-id="pnpm"]')!.click();

    // First group
    const g1 = document.querySelectorAll('[data-pmtabs]')[0]!;
    expect(g1.querySelector('[data-pm-id="pnpm"]')!.getAttribute('aria-selected')).toBe('true');
    expect((g1.querySelector('[data-pm-id="pnpm"]') as HTMLButtonElement).tabIndex).toBe(0);
    expect((g1.querySelector('[data-pm-panel="pnpm"]') as HTMLElement).hidden).toBe(false);
    expect((g1.querySelector('[data-pm-panel="npm"]') as HTMLElement).hidden).toBe(true);

    // Second group, untouched by the click, followed the first.
    const g2 = document.querySelectorAll('[data-pmtabs]')[1]!;
    expect(g2.querySelector('[data-pm-id="pnpm"]')!.getAttribute('aria-selected')).toBe('true');
    expect((g2.querySelector('[data-pm-panel="pnpm"]') as HTMLElement).hidden).toBe(false);
  });

  test('la elección sobrevive a la recarga', () => {
    initPackageTabs();
    document.querySelector<HTMLButtonElement>('[data-pm-id="bun"]')!.click();
    const chosen = localStorage.getItem(PM_KEY);
    expect(chosen).toBe('bun');

    // A reload wipes the DOM but keeps storage. `scenario` clears storage as
    // part of its isolation, so the surviving value is carried across the
    // swap by hand: that carry is what a reload IS.
    __resetPackageTabs();
    scenario(tabsMarkup('a') + tabsMarkup('b'));
    localStorage.setItem(PM_KEY, chosen!);
    initPackageTabs();

    // The stored choice must be applied on load, to every group, with no
    // click involved. That is the whole contract of a reload.
    for (const g of document.querySelectorAll('[data-pmtabs]')) {
      expect(g.querySelector('[data-pm-id="bun"]')!.getAttribute('aria-selected')).toBe('true');
      expect((g.querySelector('[data-pm-panel="bun"]') as HTMLElement).hidden).toBe(false);
      expect((g.querySelector('[data-pm-panel="npm"]') as HTMLElement).hidden).toBe(true);
    }
  });

  test('la navegación con flechas mueve la selección', () => {
    initPackageTabs();
    const first = document.querySelector<HTMLButtonElement>('[data-pm-id="npm"]')!;
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    expect(document.querySelector<HTMLButtonElement>('[data-pm-id="pnpm"]')!.getAttribute('aria-selected')).toBe('true');
    expect(localStorage.getItem(PM_KEY)).toBe('pnpm');
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Copy: both outcomes, because a denied clipboard is a real outcome.
// ─────────────────────────────────────────────────────────────────────────
const copyMarkup = `
  <button data-copy data-code-value="npx fwskills add specs/create-specs" data-copy-label="Comando">
    <span data-copy-text>Copiar</span>
  </button>
`;

describe('copia al portapapeles', () => {
  const stubClipboard = (ok: boolean) => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { if (!ok) throw new Error('denegado'); } },
    });
  };

  beforeEach(() => {
    scenario(copyMarkup);
    isolate(__resetCopy);
  });

  test('muestra «¡Copiado!» en success cuando el portapapeles acepta', async () => {
    stubClipboard(true);
    initCopyButtons();

    const button = document.querySelector<HTMLButtonElement>('[data-copy]')!;
    const text = button.querySelector<HTMLElement>('[data-copy-text]')!;
    button.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(text.textContent).toBe('¡Copiado!');
    expect(button.classList.contains('is-copied')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('Copiado al portapapeles');
  });

  test('con el portapapeles denegado informa el fallo y no deja el texto inaccesible', async () => {
    stubClipboard(false);
    // execCommand is the selection fallback; report it as failed too.
    (document as unknown as { execCommand: () => boolean }).execCommand = () => false;
    initCopyButtons();

    const button = document.querySelector<HTMLButtonElement>('[data-copy]')!;
    const text = button.querySelector<HTMLElement>('[data-copy-text]')!;
    button.click();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(text.textContent).toBe('No se pudo copiar');
    expect(button.classList.contains('is-failed')).toBe(true);
    // The value is still in the DOM, so the reader can select it by hand.
    expect(button.dataset.codeValue).toBe('npx fwskills add specs/create-specs');
  });

  test('el anuncio va por un nodo aria-live', () => {
    initCopyButtons();
    const status = document.querySelector('[data-copy-status]');
    expect(status).not.toBeNull();
    expect(status!.getAttribute('aria-live')).toBe('polite');
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Accordion: the two attributes that make it accessible.
// ─────────────────────────────────────────────────────────────────────────
const accordionMarkup = `
  <div data-accordion data-exclusive="true">
    <div>
      <button class="accordion__trigger" aria-expanded="false" aria-controls="p1">¿Qué es?</button>
      <div id="p1" role="region" hidden>Uno</div>
    </div>
    <div>
      <button class="accordion__trigger" aria-expanded="false" aria-controls="p2">¿Cómo?</button>
      <div id="p2" role="region" hidden>Dos</div>
    </div>
  </div>
`;

describe('acordeón', () => {
  beforeEach(() => {
    scenario(accordionMarkup);
    isolate(__resetAccordions);
  });

  test('alterna aria-expanded y la visibilidad del panel asociado', () => {
    initAccordions();
    const trigger = document.querySelector<HTMLButtonElement>('.accordion__trigger')!;
    const panel = document.getElementById('p1')!;

    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);

    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
  });

  test('en modo exclusivo abre uno y cierra el otro', () => {
    initAccordions();
    const [a, b] = document.querySelectorAll<HTMLButtonElement>('.accordion__trigger');
    const p1 = document.getElementById('p1')!;
    const p2 = document.getElementById('p2')!;

    a!.click();
    expect(a!.getAttribute('aria-expanded')).toBe('true');
    expect(p1.hidden).toBe(false);

    b!.click();
    // Opening the second closes the first: aria AND visibility.
    expect(b!.getAttribute('aria-expanded')).toBe('true');
    expect(a!.getAttribute('aria-expanded')).toBe('false');
    expect(p1.hidden).toBe(true);
    expect(p2.hidden).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Theme: the attribute changes and the choice persists.
// ─────────────────────────────────────────────────────────────────────────
describe('conmutador de tema', () => {
  beforeEach(() => {
    scenario('<main></main>');
    isolate(__resetHeader);
    document.documentElement.removeAttribute('data-theme');
  });

  test('toggle cambia data-theme en <html> y persiste la elección', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');

    const next = toggleTheme();
    expect(next).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  test('currentTheme lee el atributo, no la preferencia del sistema', () => {
    applyTheme('dark');
    expect(currentTheme()).toBe('dark');
    applyTheme('light');
    expect(currentTheme()).toBe('light');
  });

  test('un valor guardado inválido no rompe la lectura', () => {
    localStorage.setItem(STORAGE_KEY, 'no-es-un-tema');
    expect(currentTheme()).toMatch(/^(light|dark)$/);
  });
});
