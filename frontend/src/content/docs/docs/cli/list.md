---
title: "CLI: fwskills list"
description: Lista las skills disponibles en el catálogo, con su categoría y versión. Admite filtrar por categoría.
sidebar:
  label: list
  order: 2
---

## Sintaxis

```bash
npx fwskills list [--category <categoría>]
```

## Descripción

Lista las skills disponibles en el catálogo, con su categoría y su versión. El
resultado viene ordenado: primero por categoría, y dentro de cada categoría por
nombre de skill en orden alfabético, que es el criterio con el que también se
resuelven las instalaciones.

Acepta `--category` en cualquier posición, antes o después del resto de la
invocación.

## Opciones

- `--category <categoría>` limita el resultado a una categoría del repositorio.
  Acepta `<categoría>` y `--category=<categoría>`.

Para filtrar por texto, con la búsqueda de nombre, descripción y etiquetas, está
[`search`](/docs/cli/search/).

## Ejemplos

```bash
npx fwskills list
```

```text
specs/create-specs                     2.0.0   specs
specs/create-specs-from-code           1.0.0   specs
design/dark-luxury                     1.0.0   design
design/glassmorphism                   1.1.0   design
design/minimal-dashboard               1.0.0   design
design/minimal-light                   1.1.0   design
design/neo-brutalist                   1.0.0   design

list: 7 skills en 2 categorías
```

```bash
npx fwskills list --category design
```

```text
design/dark-luxury                     1.0.0   design
design/glassmorphism                   1.1.0   design
design/minimal-dashboard               1.0.0   design
design/minimal-light                   1.1.0   design
design/neo-brutalist                   1.0.0   design

list: 5 skills
```

```bash
npx fwskills list --category security
```

```text
list: 0 skills
```

Las categorías `qa` y `security` están declaradas pero todavía no tienen skills, así
que el filtro devuelve un resultado vacío con código 0. No es un error: la
categoría existe.

### stdout limpio

Los datos van a `stdout` y los avisos a `stderr`. Eso permite componer el resultado
sin filtrar a mano:

```bash
npx fwskills list | awk '{print $1}'
```

```text
specs/create-specs
specs/create-specs-from-code
design/dark-luxury
design/glassmorphism
design/minimal-dashboard
design/minimal-light
design/neo-brutalist
```

## Errores

| Situación | Código | Qué significa |
|---|---|---|
| Listado correcto, con o sin resultados | 0 | El catálogo respondió |
| Categoría inexistente | 3 | La categoría no existe en el catálogo. Una categoría declarada pero vacía sí existe y devuelve 0 |
| No se pudo obtener el catálogo | 6 | Fallo de red o del registro. No se listó nada y no se escribió nada |

## Ver también

- [CLI: fwskills search](/docs/cli/search/): buscar por nombre, descripción y
  etiquetas.
- [CLI: fwskills info](/docs/cli/info/): la metadata completa de una skill.
- [Flags](/docs/cli/flags/): los 6 flags del CLI.
