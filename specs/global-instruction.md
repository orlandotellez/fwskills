# Instrucciones globales — fwskills

Este documento es el índice de la especificación: indica qué módulos existen, qué
archivos contiene cada uno y en qué orden leerlos. Los módulos `db/` y `api/` **no
existen por decisión de diseño**, no por omisión; el motivo se registra en ADR-02 y
ADR-03 respectivamente (`docs/07-decisiones.md`).

## Índice de módulos

| Módulo | Archivos principales | Propósito |
| --- | --- | --- |
| `frontend/` | `package.json`, `astro.config.mjs`, `tsconfig.json`, `.env.example`, `src/layouts/Layout.astro`, `src/sections/*.astro`, `src/pages/*.astro`, `public/` | Sitio Astro 7: landing, catálogo de skills y documentación. Genera la salida estática en `dist/`. No envía JavaScript al navegador salvo lo estrictamente necesario. |
| `backend/` → `packages/cli/` | `package.json`, `bin/`, `src/`, `README.md` | Paquete npm con el CLI en Node/TypeScript. Es el código no-navegador del proyecto: sistema de archivos, resolución del registro de skills y operaciones de git. Se invoca como `npx fwskills add <skill>`. **No expone endpoints HTTP** (ADR-01). |
| `skills/` | `**/SKILL.md` | Contenido del catálogo. Una carpeta por skill, agrupada en subcarpetas por área (`specs`, `design`, `qa`, `security`, y las que se agreguen). No es un workspace de npm: es contenido versionado. |
| `db/` | — | **No existe.** El proyecto no tiene persistencia. Ver ADR-02. |
| `api/` | — | **No existe.** El proyecto no expone una API pública. Ver ADR-03. |

## Módulos ausentes y su motivo

- **`db/` (ADR-02).** El sitio es 100 % estático y no hay base de datos, ni esquema,
  ni migraciones, ni ORM. El «modelo de datos» del catálogo es el sistema de
  archivos: `skills/**/SKILL.md`. Añadir un módulo de persistencia obligaría a
  inventar un esquema para datos que ya están versionados en Git.
- **`api/` (ADR-03).** No hay servidor, ni cliente móvil, ni integraciones de
  terceros. El único contrato legible por máquinas es la salida de ayuda del CLI
  (`fwskills --help`) y los campos `exports`/`bin` del paquete npm. El documento
  `03-api.md` del módulo `backend/` documenta esa superficie de comandos en lugar de
  endpoints.

## Orden de lectura recomendado

1. `descripcion-proyecto.md` — resumen del proyecto en un párrafo.
2. `docs/01-descripcion-proyecto.md` — qué es, para quién, qué resuelve y qué queda
   fuera de alcance.
3. `docs/02-global-instruction.md` — visión general, índice de módulos y stack.
4. `docs/03-ejecucion-local.md` — cómo instalar, ejecutar, verificar y compilar.
5. `docs/04-buenas-practicas.md` — convenciones de código, estructura, commits y
   revisión.
6. `docs/05-requisitos-no-funcionales.md` — rendimiento, seguridad, escalabilidad,
   disponibilidad y mantenibilidad.
7. `docs/06-glosario.md` — vocabulario común.
8. `docs/07-decisiones.md` — ADR-01 a ADR-07 con contexto, alternativas y
   consecuencias.

## Convenciones de este árbol

- Los documentos viven en `specs/docs/` y siguen el patrón `NN-nombre.md`.
- Las decisiones arquitectónicas se registran como ADR numerados en
  `docs/07-decisiones.md` y se referencian desde el resto de la especificación con su
  identificador (por ejemplo, «ver ADR-05»).
- Los documentos de módulo se describen por separado en `specs/modules/`; este índice
  no los duplica, solo señala su existencia y su propósito.
