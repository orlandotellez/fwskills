---
title: "CLI: fwskills info"
description: "Muestra la metadata resuelta de una skill: versión, autor, compatibilidad, archivos que la componen y ruta de destino."
sidebar:
  label: info
  order: 7
---

## Sintaxis

```bash
npx fwskills info <categoría>/<slug> [--dir <ruta>] [--global]
```

## Descripción

Muestra la metadata resuelta de una skill: versión, categoría, autor,
compatibilidad, etiquetas, si está destacada, la lista de archivos que la componen y
la ruta de destino donde se instalaría.

**`info` nunca escribe en disco.** Es el comando seguro para comprobar a mano: se
puede ejecutar en cualquier momento, en cualquier carpeta, sin riesgo.

## Opciones

- `--dir <ruta>` y `--global` solo afectan al cálculo de la ruta de destino que se
  imprime. No instalan nada.

`info` no necesita `--yes` ni `--dry-run`: no hace nada que se pueda deshacer.

## Ejemplos

```bash
npx fwskills info specs/create-specs
```

```text
specs/create-specs
  version        2.0.0
  category       specs
  author         orlandotellez
  compatibility  opencode, agents, pi, claude
  tags           especificacion, arquitectura, requisitos
  featured       no

  files (6)
    SKILL.md
    references/checklist.md
    references/ejemplo.md
    scripts/validar.mjs
    assets/diagrama.png
    assets/logo.svg

  destino        /home/usuario/proyecto/.opencode/skills/specs/create-specs
  instalado      no
```

La sección `files` es la que resuelve una de las preguntas más frecuentes antes de
instalar: qué viene exactamente en el paquete. La lista sale de los archivos reales
de la skill, no de un campo declarado en el frontmatter.

La línea `instalado` dice si la skill ya está en el destino resuelto.

```bash
npx fwskills info design/dark-luxury
```

```text
design/dark-luxury
  version        1.0.0
  category       design
  author         orlandotellez
  compatibility  opencode, agents, pi, claude
  tags           oscuro, premium, editorial
  featured       yes

  files (1)
    SKILL.md

  destino        /home/usuario/proyecto/.opencode/skills/design/dark-luxury
  instalado      no
```

```bash
npx fwskills info specs/create-specs --dir ~/skills
```

```text
specs/create-specs
  version        2.0.0
  ...

  destino        /home/usuario/skills/specs/create-specs
  instalado      no
```

Solo cambia la ruta que se imprime: la metadata viene del catálogo y no depende del
destino.

## Errores

| Situación | Código | Qué significa |
|---|---|---|
| Metadata mostrada | 0 | No se escribió nada |
| Skill inexistente | 3 | La referencia tiene formato válido pero no existe en el catálogo |
| No se pudo obtener el catálogo | 6 | Fallo de red o del registro |
| Referencia mal formada | 2 | Error de uso: la referencia no cumple el formato `<categoría>/<slug>` |
| Error no previsto | 1 | Fallo no cubierto por ninguna otra clase, con la traza si `DEBUG` está activo |

## Ver también

- [CLI: fwskills add](/docs/cli/add/): instalar lo que `info` acaba de mostrar.
- [CLI: fwskills list](/docs/cli/list/): recorrer el catálogo completo.
- [Anatomía de una skill](/docs/anatomia-de-una-skill/): qué significa cada campo
  que `info` imprime.
