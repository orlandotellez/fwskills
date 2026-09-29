---
title: Compatibilidad
description: Qué agentes son, en qué carpeta instala el CLI cada uno, qué significa el campo compatibility y cómo interactúa --global.
sidebar:
  label: Compatibilidad
---

Un **agente** es el programa que lee tus skills y las usa. Cada agente tiene su
propia carpeta de skills dentro del proyecto, y el CLI no la inventa: la detecta en
el repositorio en el que se ejecuta.

## Las carpetas por defecto

| Agente | Carpeta en el proyecto | Estado |
|---|---|---|
| opencode | `.opencode/skills/` | Verificada: existe en el repositorio |
| Agentes genéricos | `.agents/skills/` | Verificada: existe en el repositorio |
| pi | `.pi/skills/` | Verificada: existe en el repositorio |
| Claude Code | `.claude/skills/` | Objetivo propuesto, no verificado |

Cuando se detectan varios agentes a la vez, el orden de preferencia es `opencode` →
`pi` → `agents` → `claude`, y el resto se ignora salvo que se indique `--dir`.

## Detección y precedencia

`add` no tiene un destino fijo: lo resuelve en el momento de instalar. Gana la
primera regla que aplica:

| Orden | Regla | Ejemplo |
|---|---|---|
| 1 | `--dir <ruta>` gana siempre | `--dir ~/skills` → `~/skills` |
| 2 | Carpeta por defecto del agente detectada en el proyecto | `.opencode/skills/`, `.agents/skills/`, `.pi/skills/` |
| 3 | Carpeta por defecto del agente en su configuración global, si se pasó `--global` | La ruta global del agente detectado |
| 4 | No hay agente detectable | Error con código de salida 7 |

El mensaje del cuarto caso es accionable por diseño:

```text
error: no se detectó ninguna configuración de agente en este proyecto
error: ejecuta `npx fwskills init` para preparar las carpetas, o pasa --dir <ruta>
```

Y para ver la resolución antes de instalar nada:

```bash
npx fwskills add specs/create-specs --dry-run
```

```text
dry-run: destino /home/usuario/proyecto/.opencode/skills/specs/create-specs
dry-run:   crear      SKILL.md
dry-run:   crear      references/checklist.md
dry-run: se habrían escrito 2 archivos
```

## Qué significa el campo `compatibility`

El campo `compatibility` del frontmatter declara **en qué agentes se ha probado
una skill**, no dónde se puede copiar el archivo. Es una lista de cadenas con
identificadores de agente:

```yaml
compatibility: ["opencode", "agents", "pi", "claude"]
```

Los identificadores que hoy usan las skills del catálogo son `opencode`, `agents`,
`pi` y `claude`. Son los mismos nombres que las carpetas que detecta el CLI
(`.opencode/`, `.agents/`, `.pi/`, `.claude/`), escritos como identificador y no
como ruta.

Declara la lista de verdad: una skill probada solo en opencode declara
`["opencode"]`. Declarar más agentes de los que has probado hace que alguien la
instale en un entorno sin verificar y se entere al usarla, que es la forma más
cara de enterarse.

## Cómo interactúa `--global`

`--global` no salta a una carpeta global genérica: cambia el ámbito de la
detección. Se sigue buscando un agente y, si se encuentra, se usa su configuración
global. No existe una carpeta global compartida.

```bash
npx fwskills add specs/create-specs --global
```

Hay un detalle que conviene conocer: con `--global` la skill se instala en la
configuración global de **todos** los agentes detectados, no solo en el preferido.
Con `--dir` en cambio, la instalación va exactamente a la ruta que indicaste y a
ninguna otra.

Para desinstalar desde donde se instaló, hay que repetir el mismo ámbito:

```bash
npx fwskills remove specs/create-specs --global --yes
```

## Comprobar tu entorno

```bash
npx fwskills init --dry-run
```

```text
dry-run: se habrían creado 2 carpetas de destino
```

Este comando no crea nada y dice qué carpetas de destino se prepararían. Es la
forma más rápida de saber qué agentes ve el CLI en un directorio concreto.

## Ver también

- [CLI: fwskills init](/docs/cli/init/): crea las carpetas de destino de los agentes
  detectados.
- [Flags](/docs/cli/flags/): los 6 flags y la precedencia de destinos.
- [Anatomía de una skill](/docs/anatomia-de-una-skill/): el resto de los campos del
  frontmatter.
