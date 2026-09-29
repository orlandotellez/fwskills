# frontend

El sitio de **fwskills**: landing, catálogo de skills, ficha por skill,
documentación y página de contribución. Astro 7, 100% estático.

El README del proyecto —qué es, cómo se contribute, cómo está
especificado— está en [`../README.md`](../README.md).

## Requisitos

- Node.js >= 22.12.0
- bun >= 1.4

## Arranque

```bash
bun install
cp .env.example .env    # y editá PUBLIC_SITE_URL
bun run dev             # http://localhost:4321
```

`bun run dev` arranca sin `.env`. La URL pública solo es obligatoria para
`bun run build`, que falla de forma ruidosa si falta: la configuración
anterior publicaba en silencio un `canonical` y un `sitemap.xml` apuntando
a `example.com`.

## Comandos

| Comando | Qué hace |
|---|---|
| `bun run dev` | servidor de desarrollo |
| `bun run build` | genera `dist/` |
| `bun run preview` | sirve el build localmente |
| `bun run check` | `astro check`, puerta de tipos |
| `bun run check:watch` | lo mismo en watch |
| `bun run validate` | valida el frontmatter de cada `SKILL.md` |
| `bun test` | tests de contrato |

## Estructura de `src/`

```
src/
├── components/       # 9 componentes + DocsHead (override de Starlight)
├── content/docs/     # 20 páginas de documentación
│   └── docs/         # carpeta con prefijo docs/ a propósito (ver abajo)
├── lib/
│   ├── skills.ts     # deriva categorías del filesystem
│   ├── markdown.ts   # markdown-it + Shiki para los cuerpos de las skills
│   ├── highlight.ts  # resaltador compartido con el pipeline de markdown
│   ├── github.ts     # datos de GitHub resueltos en build time
│   ├── site.ts       # URLs y nombre del proyecto
│   └── shiki-theme.ts# tema que emite var(--syn-*)
├── pages/            # rutas del sitio
├── scripts/          # theme.ts, header.ts
├── styles/           # tokens, base, utilities, starlight.css
├── content.config.ts # colección skills + la docs de Starlight
└── layouts/          # Layout.astro
```

## Por qué `content/docs/docs/`

Starlight deriva la URL del id de la entrada de la colección, y el id es
la ruta relativa a `src/content/docs/`. Sin el prefijo duplicado, las
páginas saldrían en `/` en lugar de `/docs/`. Es feo a propósito y
funciona.

## El catálogo se genera, no se escribe

`skills/` vive en la raíz del repo, fuera de `src/`, y se lee con un glob
loader. Agregar una skill o una categoría es agregar una carpeta: el
catálogo, las páginas de categoría, el buscador y el `sitemap.xml` se
actualizan solos.

Como el loader no puede enganchar su pipeline de render a un archivo fuera
de `src/`, el markdown de las skills lo renderiza `lib/markdown.ts` con
`markdown-it` y el mismo tema de Shiki que usa el pipeline del sitio. Un
bloque de código de un `SKILL.md` y un `<CodeBlock>` se ven idénticos.

## Al tocar `/docs/`, leé primero

`src/styles/starlight.css` tiene, en el encabezado, las cuatro trampas de
Starlight que ya nos costaron un bug cada una. En resumen: `defineConfig`
en forma de objeto, orden de `@layer` declarado antes de usarlo, `base.css`
fuera de docs, y un override de `Head` que re-renderiza
`Astro.locals.starlightRoute.head`.
