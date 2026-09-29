# fwskills

![TypeScript](https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Astro](https://img.shields.io/badge/astro-%23000000.svg?style=for-the-badge&logo=astro&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)

Catálogo, documentación y sitio web para un repositorio comunitario de
**skills para agentes de IA**. Cada skill es una carpeta con un `SKILL.md`
que le dice a tu agente cómo hacer una tarea concreta.

Sitio 100% estático: sin backend, sin base de datos, sin cuentas, sin
telemetría. Todo el contenido se genera en build time a partir de las
carpetas de `skills/`.

## Estado

| Pieza | Estado |
|---|---|
| Sitio (landing, catálogo, fichas, docs) | Implementado · 32 rutas |
| Sistema de diseño con contraste AA verificado | Implementado |
| `skills/` con 7 skills en 2 categorías | Implementado |
| CLI `npx fwskills add <skill>` | **Especificado, no implementado** |

El CLI está especificado en [`specs/modules/backend/`](specs/modules/backend/)
con 7 comandos, 6 flags y 7 códigos de salida, pero `packages/` todavía no
existe. La documentación ya lo describe, así que la diferencia es
intencional y visible, no un descuido.

## Estructura

```
.
├── skills/                  # La fuente de verdad del catálogo
│   ├── design/              # 5 skills de sistemas visuales
│   └── specs/               # 2 skills de especificación
├── frontend/                # El sitio (Astro 7)
│   ├── src/
│   │   ├── components/      # 9 componentes globales + override de Starlight
│   │   ├── content/docs/    # 20 páginas de documentación (Starlight)
│   │   ├── lib/             # skills, markdown, github, highlight
│   │   ├── pages/           # rutas del sitio
│   │   ├── scripts/         # theme, header
│   │   └── styles/          # tokens, base, utilities, puente de Starlight
│   ├── scripts/             # validador de skills
│   └── test/                # tests de contrato
└── specs/                   # Especificación (43 archivos)
    ├── docs/                # descripción, ADRs, requisitos
    ├── modules/             # frontend y backend
    └── tasks/               # 210 tareas de implementación
```

## Requisitos

- **Node.js >= 22.12.0**
- **[bun](https://bun.sh) >= 1.4** como gestor de paquetes

## Arranque

```bash
cd frontend
bun install

cp .env.example .env     # y editá PUBLIC_SITE_URL

bun run dev              # http://localhost:4321
```

`bun run dev` funciona sin `.env`: la URL pública solo es obligatoria para
el build.

## Comandos

```bash
bun run dev          # servidor de desarrollo
bun run build        # genera dist/ (estático)
bun run preview      # sirve el build localmente
bun run check        # astro check — puerta de tipos
bun run check:watch  # lo mismo, en modo watch
bun run validate     # valida el frontmatter de todas las SKILL.md
bun test             # tests de contrato
```

`bun run build` **falla si falta `PUBLIC_SITE_URL`**. Es intencional: la
configuración anterior publicaba en silencio un `canonical` y un
`sitemap.xml` apuntando a `example.com`.

## Agregar una skill

Agregar una skill es agregar una carpeta. Ningún archivo del sitio cambia.

```bash
mkdir -p skills/<categoria>/<mi-skill>
$EDITOR skills/<categoria>/<mi-skill>/SKILL.md
bun run validate     # valida los 8 campos obligatorios
bun run dev          # la skill aparece en el catálogo
```

El frontmatter tiene 8 campos, todos obligatorios:

```yaml
---
name: mi-skill                # kebab-case, igual al nombre de la carpeta
description: Una frase.       # 20-240 caracteres
category: specs               # kebab-case, igual a la carpeta padre
version: 1.0.0                # SemVer
author: "Tu nombre"
tags: [specs, documentación]
compatibility: [opencode, pi]
featured: false               # solo 6 skills pueden estar destacadas
---
```

Una categoría nueva es una carpeta nueva. Lo único que hay que tocar es
`CATEGORY_META` en `frontend/src/lib/skills.ts`, para el nombre, la
descripción y el ícono. No hay que editar ninguna página.

## Sistema de diseño

`frontend/src/styles/tokens.css` es la fuente de verdad: los colores se
asignan por **rol** (`--accent`, `--text-secondary`, `--border-input`), no
por apariencia. Existe en modo claro y oscuro, y todos los ratios de texto
están calculados con la fórmula WCAG 2.1, no estimados.

```bash
# el token del h1 sobre surface-elevated (el peor caso)
--text: 16.05:1
```

Dos reglas que no se negocian:

- **Ningún color literal fuera de `tokens.css`.** Una excepción es un
  defecto de revisión.
- **`border-input` es obligatorio en controles interactivos** (WCAG 1.4.11,
  ≥ 3:1). Los hairlines decorativos quedan por debajo a propósito.

## Especificación

[`specs/`](specs/) es el árbol de especificación: 43 archivos, 210 tareas
de implementación, 7 ADRs. Los ADRs explican las decisiones que no son
obvias — por qué no hay base de datos, por qué la documentación usa
Starlight con un puente de tokens, por qué `category` es un `string` y no
un `enum`.

El progreso de implementación se registra marcando las casillas en
`specs/tasks/`. Esos archivos no se borran ni se renombran.

## Documentación

- [`specs/docs/01-descripcion-proyecto.md`](specs/docs/01-descripcion-proyecto.md) — qué es y para quién
- [`specs/docs/07-decisiones.md`](specs/docs/07-decisiones.md) — las 7 decisiones arquitectónicas
- [`specs/docs/documentacion-cliente.md`](specs/documentacion-cliente.md) — descripción del negocio, sin jerga
- `/docs/` en el sitio — documentación de uso

## Notas para quien trabaje en `/docs/`

Starlight no es un plugin de "agregá config y anda". Cuatro cosas que
costaron un bug cada una, y que conviene no deshacer:

1. **`defineConfig` va en forma de objeto.** Starlight muta
   `config.integrations` en `astro:config:setup`; con la forma de función
   esa mutación se descarta y las 20 rutas de docs desaparecen sin error.
2. **El CSS del usuario se importa primero, a propósito.** El orden de
   `@layer` se declara antes de usarse; un bridge en una layer sin declarar
   pierde contra `starlight.base`.
3. **`base.css` no se importa en docs.** Sin capa le gana a *todas* las
   capas y sus selectores desnudos pisan cada componente de Starlight.
4. **Un override de `Head` reemplaza, no agrega.** Hay que re-renderizar
   `Astro.locals.starlightRoute.head` o se pierden `<title>`, `viewport` y
   `canonical`.

## Licencia

MIT.
