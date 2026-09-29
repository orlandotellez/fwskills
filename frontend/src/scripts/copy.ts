/**
 * Copy-to-clipboard behaviour.
 *
 * The contract has two states, not one: a successful copy confirms, and a
 * denied clipboard must ALSO confirm, in error colour, with the text left
 * selectable. Silently doing nothing on a denied clipboard is the failure
 * mode here: the user pressed the button, saw no feedback, and assumed the
 * command was wrong.
 */

const COPY_MS = 2000;
const STORAGE_KEY = 'fwskills:pm';

let registered = false;
let onClick: ((event: Event) => void) | null = null;

function copyViaSelection(value: string): boolean {
  const area = document.createElement('textarea');
  area.value = value;
  area.setAttribute('aria-hidden', 'true');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  return ok;
}

export function initCopyButtons(): void {
  if (registered) return;
  if (!document.querySelector('[data-copy]')) return;
  registered = true;

  onClick = async (event: Event) => {
    const button = (event.target as HTMLElement | null)?.closest<HTMLButtonElement>('[data-copy]');
    if (!button) return;

    const value = button.dataset.codeValue ?? '';
    const text = button.querySelector<HTMLElement>('[data-copy-text]');
    if (!text) return;

    let copied = false;
    try {
      await navigator.clipboard.writeText(value);
      copied = true;
    } catch {
      // Clipboard API needs a secure context, or the user denied it.
      copied = copyViaSelection(value);
    }

    const previous = text.textContent ?? 'Copiar';
    const restore = () => {
      text.textContent = previous;
      button.classList.remove('is-copied', 'is-failed');
      button.setAttribute('aria-label', `${button.dataset.copyLabel ?? 'Comando'}: copiar`);
    };

    if (copied) {
      text.textContent = '¡Copiado!';
      button.classList.add('is-copied');
      button.setAttribute('aria-label', 'Copiado al portapapeles');
    } else {
      // Still tell the user what happened, and leave the value selectable.
      text.textContent = 'No se pudo copiar';
      button.classList.add('is-failed');
      button.setAttribute('aria-label', 'No se pudo copiar: seleccioná el texto a mano');
    }

    window.setTimeout(restore, COPY_MS);
  };

  document.addEventListener('click', onClick);

  // The status text is announced by a live region. The button's own label
  // change is not reliably announced, so the message also goes here.
  if (!document.querySelector('[data-copy-status]')) {
    const status = document.createElement('p');
    status.dataset.copyStatus = '';
    status.setAttribute('aria-live', 'polite');
    status.className = 'visually-hidden';
    status.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)';
    document.body.append(status);
  }
}

export function __resetCopy(): void {
  if (onClick) document.removeEventListener('click', onClick);
  onClick = null;
  registered = false;
}

export { STORAGE_KEY };
