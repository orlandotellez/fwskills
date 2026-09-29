// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import { fwskillsTheme } from './src/lib/shiki-theme.ts';
import sitemap from '@astrojs/sitemap';
import starlight from '@astrojs/starlight';

const DOCS_EDIT_BASE = 'https://github.com/fwskills/fwskills/edit/main/frontend/src/content/docs/';

/**
 * .env is loaded here, not via process.env: astro.config.mjs is evaluated
 * BEFORE Vite populates process.env, so a perfectly good .env would be
 * invisible. `loadEnv` reads .env for every mode, so the mode guess only
 * affects mode-specific files.
 *
 * This must stay in the OBJECT form of defineConfig. Starlight mutates
 * `config.integrations` during astro:config:setup to inject its own
 * integrations; with a function form that mutation is discarded and every
 * /docs route silently disappears. The build command arrives through the
 * astro:config:done hook instead.
 */
const MODE = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const SITE_URL = (loadEnv(MODE, process.cwd(), '').PUBLIC_SITE_URL || '').replace(/\/$/, '');

/** @typedef {import('astro').AstroIntegration} AstroIntegration */

/**
 * A build without PUBLIC_SITE_URL must not succeed: it would publish a
 * canonical URL and a sitemap.xml pointing at a placeholder domain. Dev is
 * exempt so a missing variable never blocks local work. This is an inline
 * integration because a top-level `hooks` key is not part of Astro's user
 * config, and it must stay declared BEFORE starlight, which mutates
 * `config.integrations` in place.
 */
/** @returns {AstroIntegration} */
function requireSiteUrl() {
  return {
    name: 'fwskills:require-site-url',
    hooks: {
      'astro:config:setup': () => {
        // Astro's hook payloads do not carry the command, so detect the build
        // from argv. Dev and preview are exempt: a missing variable must never
        // block local work.
        const isBuild = process.argv.some((arg) => arg === 'build' || arg.endsWith('/build'));
        if (isBuild && !SITE_URL) {
          throw new Error(
            'PUBLIC_SITE_URL is not set.\n' +
              'Copy .env.example to .env and set it, or export it in CI.\n' +
              'Refusing to build: without it the canonical URL and sitemap.xml would point at a placeholder domain.',
          );
        }
      },
    },
  };
}

export default defineConfig({
  /**
   * The site URL is required to BUILD, optional to develop.
   *
   * `process.env.PUBLIC_SITE_URL` is empty here: astro.config.mjs runs BEFORE
   * Vite loads .env, so reading process.env directly misses a perfectly good
   * .env file. `loadEnv` reads it properly.
   *
   * The old `?? 'https://example.com'` meant a build without the variable did
   * not fail: it published a canonical URL and a sitemap.xml pointing at
   * somebody else's domain, silently. Failing loudly at build time is cheaper
   * than finding that out from a search engine. Dev falls back to localhost,
   * because a missing variable must never block local work.
   */
  site: SITE_URL || 'http://localhost:4321',

  integrations: [
    requireSiteUrl(),
    sitemap(),
      starlight({
        title: 'fwskills — Docs',
        // We ship our own 404 page; Starlight would inject a second one.
        disable404Route: true,
        // The docs are in Spanish; Starlight defaults to lang="en".
        defaultLocale: 'root',
        locales: {
          root: { label: 'Español', lang: 'es' },
        },
        description:
          'Documentación de fwskills: introducción, primeros pasos, referencia del CLI, anatomía de una skill y contribución.',
        favicon: '/favicon.svg',
        customCss: ['./src/styles/starlight.css'],
        // Client-side router + font preload: removes the full reload that
        // caused the layout shift between docs pages.
        components: { Head: './src/components/DocsHead.astro' },
        editLink: { baseUrl: DOCS_EDIT_BASE },
        social: [{ icon: 'github', href: 'https://github.com/fwskills/fwskills', label: 'GitHub' }],
        lastUpdated: true,
        sidebar: [
          {
            label: 'Introducción',
            items: [
              { label: 'Qué es una skill', link: '/docs/introduccion/' },
              { label: 'Primeros pasos', link: '/docs/primeros-pasos/' },
            ],
          },
          {
            label: 'Guías',
            items: [
              { label: 'Anatomía de una skill', link: '/docs/anatomia-de-una-skill/' },
              { label: 'Crear una skill', link: '/docs/crear-una-skill/' },
              {
                label: 'Categorías',
                items: [{ autogenerate: { directory: 'docs/categorias', collapsed: true } }],
              },
            ],
          },
          {
            label: 'Referencia del CLI',
            items: [
              {
                label: 'Comandos',
                items: [{ autogenerate: { directory: 'docs/cli', collapsed: true } }],
              },
              { label: 'Compatibilidad', link: '/docs/compatibilidad/' },
              { label: 'Versionado y releases', link: '/docs/versionado/' },
            ],
          },
          {
            label: 'Proyecto',
            items: [
              { label: 'FAQ', link: '/docs/faq/' },
              { label: 'Changelog', link: '/docs/changelog/' },
            ],
          },
        ],
      }),
    ],

    markdown: {
      shikiConfig: {
        theme: fwskillsTheme,
        defaultColor: false,
      },
    },

  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
