# 04 — Buenas prácticas

## Convenciones de código

### TypeScript

- El proyecto extiende `astro/tsconfigs/strict` (`frontend/tsconfig.json`). El modo
  estricto no es una recomendación: es la configuración del repositorio. No se
  relaja con `strict: false` ni con `// @ts-ignore` para silenciar un error real.
- `tsconfig.json` incluye `.astro/types.d.ts` y `**/*`, y excluye `dist`. Cualquier
  archivo nuevo dentro de `frontend/` queda cubierto por la comprobación de tipos de
  forma automática.
- Los archivos de configuración JavaScript llevan `// @ts-check` en la cabecera, como
  ya hace `astro.config.mjs`, para que el editor y `astro check` los traten como
  tipados.
- No se usa `any`. Cuando un tipo de terceros sea inevitable, se acota en la frontera
  con una interface propia en lugar de propagar `any` hacia el resto del código.
- Los props de los componentes `.astro` se declaran con una `interface Props` y se
  desestructuran con valores por defecto en el `frontmatter` del componente. Así el
  contrato del componente queda visible en el propio archivo.

### Componentes `.astro` y JavaScript en el cliente

- **Una sección es un componente.** `src/sections/` contiene una unidad visual por
  archivo (`Header.astro`, `Hero.astro`, `Features.astro`, `DesignSkills.astro`,
  `HowItWorks.astro`, `CTA.astro`, `Footer.astro`), y `src/pages/index.astro` se
  limita a componer `Layout.astro` más esas secciones.
- **El sitio no envía JavaScript al navegador.** La landing y el catálogo no requieren
  ninguna directiva `client:*`. Cuando la documentación incorpore búsqueda y
  conmutación de tema (ADR-04), ese JavaScript queda confinado a la documentación y no
  se extiende a las páginas públicas.
- Si alguna vez hace falta interactividad en el navegador, se justifica de forma
  explícita en la pull request, midiendo el costo en KB antes de aprobarlo.

### CSS y design tokens

- **Ningún color, espaciado ni tamaño de fuente escrito a mano fuera del bloque de
  tokens.** Un valor literal como `#04092e` dentro de un componente es un error de
  revisión.
- **Los tokens se nombran por su rol, no por su apariencia** (ADR-07). Se usa
  `var(--accent)`, no `var(--primary)` seguido de un comentario sobre el color. La
  razón está documentada: los nombres actuales mienten —`--primary-dark` es *más
  claro* que `--primary`— y esa contradicción ya costó tiempo.
- Las clases globales compartidas viven en el `<style is:global>` de
  `src/layouts/Layout.astro` (`.container`, `.section`, `.section-eyebrow`,
  `.section-title`, `.btn-primary`, `.card`, `.tag`, `.grid-2`, `.grid-3`, `.grid-4`).
  El estilo específico de un componente se queda en su propio `<style>`.
- Los `breakpoints` son 1024px, 768px y 480px. Son valores fijos del sistema de diseño:
  no se introducen anchos intermedios sin una razón de diseño explícita.
- El modo claro y el oscuro se aplican con un atributo `data-theme` sobre `:root`, con
  `prefers-color-scheme` como valor inicial. Un componente nunca decide el tema.
- Toda animación respeta el bloque `prefers-reduced-motion` que ya existe en
  `Layout.astro`. Agregar una transición sin contemplarlo es un defecto.

### Contenido: `SKILL.md`

- El frontmatter tiene **exactamente ocho campos**: `name`, `description`,
  `category`, `version`, `author`, `tags`, `compatibility` y `featured`. Ni uno más, ni
  uno menos: el esquema Zod de la colección `skills` los valida (ADR-05).
- `name` es el identificador estable de la skill y coincide con el nombre de la
  carpeta. Cambiarlo es un cambio de URL.
- `category` debe corresponder a una subcarpeta existente bajo `skills/`, para que la
  ruta `/skills/[categoria]/[slug]` siga siendo derivable.
- `description` es lo que un agente lee para decidir si aplica la skill: describe la
  tarea que resuelve, no la tecnología que usa.
- `compatibility` declara los agentes compatibles. Es información de primera clase,
  no un comentario opcional.

## Estructura de carpetas

Estado actual, verificado en el repositorio:

```
fwskills/
├── .gitignore              # .atl/ y odd
├── frontend/
│   ├── .env.example        # PUBLIC_SITE_URL, PUBLIC_SITE_DESCRIPTION
│   ├── .gitignore          # dist/, .astro/, node_modules/, .env
│   ├── astro.config.mjs    # defineConfig({ site: PUBLIC_SITE_URL ?? ... })
│   ├── package.json        # fwskills 1.0.0, type module, node >=22.12.0
│   ├── tsconfig.json       # extends astro/tsconfigs/strict
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── layouts/
│       │   └── Layout.astro        # head, SEO, tokens, utilidades CSS
│       ├── sections/
│       │   ├── Header.astro
│       │   ├── Hero.astro
│       │   ├── Features.astro
│       │   ├── DesignSkills.astro
│       │   ├── HowItWorks.astro
│       │   ├── CTA.astro
│       │   └── Footer.astro
│       └── pages/
│           └── index.astro
├── skills/                 # (pendiente) contenido del catálogo
│   ├── specs/**/SKILL.md
│   ├── design/**/SKILL.md
│   ├── qa/**/SKILL.md
│   └── security/**/SKILL.md
└── cli/                    # (pendiente) paquete npm del CLI
```

Reglas de colocación:

- **`skills/` es contenido, no código.** No lleva `package.json` y no es un workspace.
- **`cli/` es el único lugar con lógica de Node.** Si una regla de negocio
  aparece en un componente `.astro`, pertenece al CLI o al esquema de la colección, no
  a la vista.
- **Los archivos de configuración de Astro se mantienen pocos y en la raíz de
  `frontend/`.** La lógica de la documentación se encapsula en componentes
  reutilizables de Starlight, no se dispersa en las páginas.
- `specs/` no es un workspace: es la especificación y no se compila.

## Errores y logging

El proyecto no tiene servidor, así que **no existe logging de servidor**. El canal de
errores del sitio es el propio build:

- **Una `SKILL.md` inválida produce un error de compilación**, con la ruta del archivo
  y el campo que no cumple el esquema. Ese mensaje es la interfaz de validación del
  proyecto: debe nombrar el archivo y el campo, sin exigir que quien lo lee tenga
  abierto el código.
- **Los errores en plantillas `.astro` deben delatar su origen** (archivo y línea) y no
  apilarse en un bloque genérico.
- **Ningún `catch` vacío ni ningún error silencioso en el sitio.** Si algo falla, el
  build falla.

Para el CLI (`cli/`), en contraste, el contrato es explícito:

- **Código de salida distinto de cero** ante cualquier fallo. Un `npx fwskills add` que
  no instala nada y devuelve éxito es un error, no un caso tolerable.
- **Mensajes en español, identificadores en inglés.** El mensaje va al usuario; los
  nombres de funciones, variables y archivos van en inglés.
- **Nada de `console.log` para depurar.** Los mensajes con sentido van por streams
  estándar (`stdout` para el resultado, `stderr` para advertencias y errores), de modo
  que `npx fwskills add <skill> > log.txt` no mezcle diagnósticos con el resultado.
- **Los errores encontrados se propagan con contexto** (`cause`), nunca se convierten
  en un mensaje genérico que pierde la causa original.

## Commits y ramas

### Mensajes de commit

El proyecto usa **Conventional Commits**:

```
<tipo>(<ámbito>): <descripción en imperativo>
```

| Tipo | Uso |
| --- | --- |
| `feat` | Nueva funcionalidad visible: una sección, una ruta, un comando del CLI. |
| `fix` | Corrección de un comportamiento incorrecto. |
| `docs` | Documentación y especificación. |
| `refactor` | Cambio de estructura sin cambio de comportamiento. |
| `perf` | Mejora de rendimiento. |
| `style` | Formato sin cambio de comportamiento. |
| `chore` | Mantenimiento: dependencias, configuración, scripts. |
| `build` | Sistema de compilación o empaquetado. |
| `ci` | Integración continua. |

Reglas adicionales:

- El alcance (`<ámbito>`) nombra el área afectada: `catalog`, `docs`, `cli`, `tokens`,
  `layout`.
- La descripción va en **imperativo y en minúscula**, sin punto final: `feat(cli):
  agregar el comando add`.
- El cuerpo explica el *porqué* cuando el cambio no es evidente. Un mensaje que exige
  contexto adicional para entenderse está incompleto.
- **Sin atribución de IA.** No se añaden trailers de co-autoría ni menciones de
  asistente en el mensaje del commit.
- Los commits son **unidades de trabajo revisables**: un commit que cambia el esquema
  de tokens y un commit que rehacen la landing no van juntos. Cuando el cambio excede
  un tamaño razonable para una sola revisión (~400 líneas), se divide en commits
  coherentes o en pull requests encadenadas, manteniendo en cada unidad las pruebas y
  la documentación que le corresponden.

### Ramas

| Prefijo | Uso |
| --- | --- |
| `feat/` | Funcionalidad nueva. |
| `fix/` | Corrección de un defecto. |
| `docs/` | Documentación y especificación. |
| `refactor/` | Reestructuración. |
| `chore/` | Mantenimiento. |

La rama base es `main`. Las ramas se nombran en la misma convención que los commits,
con un sufijo corto y descriptivo: `feat/cli-add-command`, `fix/canonical-url`.

## Revisión de código

Lista de verificación antes de aprobar una pull request:

### Corrección

- [ ] `npm run astro -- check` termina sin errores de tipos.
- [ ] `npm run build` termina de forma exitosa.
- [ ] `npm test` pasa, si el cambio toca `cli/`.
- [ ] Ningún `any`, ningún `@ts-ignore`, ninguna relajación del modo estricto.

### Arquitectura

- [ ] Si el cambio altera la estructura del proyecto, el cambio incluye su ADR en
      `docs/07-decisiones.md` con contexto, alternativas y consecuencias. Decidir sin
      registrar la decisión es la forma más rápida de volver a decidir dentro de seis
      meses.
- [ ] Si el cambio afecta al modelo de tokens, usa nombres de rol (ADR-07) y define
      los valores en ambos modos.
- [ ] Se respeta la invariante de ADR-05: agregar una skill o una categoría no exige
      tocar el frontend. Si una pull request de contenido toca código de `frontend/`,
      la pull request está mal planteada.
- [ ] Nada de lógica de negocio en un componente `.astro`.

### Contenido

- [ ] Toda `SKILL.md` nueva tiene los ocho campos de frontmatter.
- [ ] `name` coincide con el nombre de la carpeta y `category` con la subcarpeta.
- [ ] La categoría, si es nueva, tiene su entrada de icono y descripción en el mapa de
      metadatos (único punto donde una categoría nueva requiere un toque de código).
- [ ] La `SKILL.md` está dentro de la subcarpeta de su categoría.

### Rendimiento y accesibilidad

- [ ] No se introduce JavaScript en el navegador sin justificación explícita.
- [ ] Los valores de color y espaciado provienen de tokens, no están escritos a mano.
- [ ] El contraste de los textos nuevos cumple WCAG 2.1 AA. `text-muted` está
      verificado a 4.72:1 y puede usarse en texto de cuerpo, pero **no** por debajo de
      13px.
- [ ] Toda transición nueva respeta `prefers-reduced-motion`.
- [ ] La navegación sigue siendo completa por teclado y el orden de tabulación es
      lógico.

### Git

- [ ] El mensaje sigue Conventional Commits.
- [ ] No hay atribución de IA en el commit.
- [ ] El tamaño de la pull request permite revisarla con atención; si no, está
      dividida en unidades coherentes.
