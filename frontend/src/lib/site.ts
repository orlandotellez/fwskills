/**
 * Site-wide constants.
 *
 * This is the only place a URL, a name or a number that appears across many
 * pages is declared. Changing the project name or the repository location is
 * a one-line edit here, not a find-and-replace across the site.
 */

/** Canonical repository. Every GitHub URL below is derived from this. */
const REPO_URL = 'https://github.com/orlandotellez/fwskills';

export const SITE = {
  name: 'fwskills',
  tagline: 'Skills comunitarias para agentes de IA',
  description:
    'Catálogo, documentación y CLI para instalar skills comunitarias en tu agente de IA.',
  license: 'MIT',
  year: 2026,

  /** Must end without a trailing slash. Read from PUBLIC_SITE_URL. */
  url: (import.meta.env.PUBLIC_SITE_URL ?? '').replace(/\/$/, ''),

  repo: 'orlandotellez/fwskills',
  github: REPO_URL,
  npm: 'https://www.npmjs.com/package/fwskills',
  community: 'https://discord.gg/fwskills',

  issues: `${REPO_URL}/issues/new`,
  newIssue: `${REPO_URL}/issues/new?template=bug.yml`,
  security: `${REPO_URL}/security/advisories/new`,
  conduct: `${REPO_URL}/blob/main/CODE_OF_CONDUCT.md`,
  contributing: `${REPO_URL}/blob/main/CONTRIBUTING.md`,
  governance: `${REPO_URL}/blob/main/GOVERNANCE.md`,
  licenseFile: `${REPO_URL}/blob/main/LICENSE`,
} as const;

export const NAV = [
  { href: '/skills', label: 'Skills' },
  { href: '/instalacion', label: 'Instalación' },
  { href: '/docs/introduccion/', label: 'Docs' },
  { href: '/contribuir', label: 'Contribuir' },
] as const;

export const PACKAGE_MANAGERS = [
  { id: 'npm', label: 'npm', run: (cmd: string) => `npx ${cmd}` },
  { id: 'pnpm', label: 'pnpm', run: (cmd: string) => `pnpm dlx ${cmd}` },
  { id: 'yarn', label: 'yarn', run: (cmd: string) => `yarn dlx ${cmd}` },
  { id: 'bun', label: 'bun', run: (cmd: string) => `bunx ${cmd}` },
] as const;

export type PackageManagerId = (typeof PACKAGE_MANAGERS)[number]['id'];
export const PM_STORAGE_KEY = 'fwskills:pm';

/** Absolute URL for a root-relative path, when the site URL is configured. */
export function absolute(path: string): string {
  if (!SITE.url) return path;
  return new URL(path, SITE.url).href;
}

/** GitHub blob URL for a file in the repository. */
export function repoFile(path: string, line?: number): string {
  const clean = path.replace(/^\//, '');
  const base = `${REPO_URL}/blob/main/${clean}`;
  return line ? `${base}#L${line}` : base;
}

/** Direct GitHub edit URL for a file. */
export function repoEdit(path: string): string {
  return `${REPO_URL}/edit/main/${path.replace(/^\//, '')}`;
}
