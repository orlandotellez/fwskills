---
title: Changelog
description: Historial de versiones publicadas del CLI fwskills, generado en el despliegue a partir de las releases del paquete npm.
sidebar:
  label: Changelog
---

Esta página **se genera en el despliegue** a partir de las releases publicadas del
paquete `fwskills` en npm, no se escribe a mano. Una release publicada sin entrada
en el changelog es una release que nadie puede entender, así que el proceso exige
que `fwskills --version`, la etiqueta de git y la entrada de este changelog
declaren el mismo número.

La numeración es SemVer, la misma que la del paquete:

| Parte | Significado |
|---|---|
| Mayor | Un comando desaparece, un flag cambia de significado o un código de salida se reasigna |
| Menor | Un comando nuevo o un flag nuevo |
| Parche | Un mensaje o una ruta corregidos |

## 0.1.0 — Primera versión del sitio

Primer despliegue del sitio y primera versión pública del CLI. La superficie
completa queda definida desde el principio, y las siete páginas de la referencia
en `/docs/cli` se escribieron contra ese contrato.

### Añadido

- **Landing** con la propuesta del proyecto, las skills destacadas y el catálogo
  navegable por categoría y por etiqueta.
- **Catálogo de skills** con búsqueda, filtros y una ficha por skill con su versión,
  su autor, su compatibilidad y su fecha de última actualización.
- **7 skills iniciales** en dos categorías: `specs` (`create-specs`,
  `create-specs-from-code`) y `design` (`dark-luxury`, `glassmorphism`,
  `minimal-dashboard`, `minimal-light`, `neo-brutalist`).
- **Documentación** con barra lateral agrupada, índice de contenidos, buscador y
  enlaces de edición en GitHub.
- **CLI `fwskills`** con 7 comandos: `init`, `list`, `search`, `add`, `remove`,
  `update` e `info`.
- **6 flags**: `--dir`, `--global`, `--force`, `--dry-run`, `--yes` y
  `--category`.
- **7 códigos de salida cerrados** (`0` a `7`), documentados como parte de la API
  pública del CLI.
- **4 categorías** declaradas: `specs`, `design`, `qa` y `security`. Las dos
  últimas están abiertas y todavía no tienen skills.
- **Agentes soportados**: opencode, agentes genéricos y pi verificados; Claude Code
  como objetivo propuesto.

## Ver también

- [Versionado](/docs/versionado/): qué significa cada número y qué hace `update`.
- [Referencia del CLI](/docs/cli/init/): la superficie pública que versiona esta
  página.
- [Página de contribución](/contribuir): cómo se propone un cambio.
