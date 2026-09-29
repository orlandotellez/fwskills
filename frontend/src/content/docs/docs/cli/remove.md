---
title: "CLI: fwskills remove"
description: Desinstala una skill instalada por el CLI. Solo borra lo que el CLI construyó y conserva los archivos ajenos.
sidebar:
  label: remove
  order: 5
---

## Sintaxis

```bash
npx fwskills remove <categoría>/<slug> [--dir <ruta>] [--global] [--yes]
```

## Descripción

Desinstala una skill previamente instalada por el CLI. La carpeta que se elimina es
`<destino>/<categoría>/<slug>/`.

La regla que sostiene el comando: **`remove` solo borra lo que el CLI construyó**. Si
dentro de la carpeta hay archivos que alguien añadió a mano, no los toca, los avisa
por `stderr` y termina con éxito. Una skill es una carpeta de texto, y una carpeta
de texto es un sitio donde la gente anota cosas.

## Opciones

- `--dir <ruta>` fija la raíz de destino. Repite la precedencia de destinos para
  apuntar al mismo sitio desde el que se instaló.
- `--global` apunta a la configuración global del agente, igual que en `add`.
- `--yes` no pregunta. Sin él, el CLI pide confirmación antes de borrar.
- `--dry-run` muestra qué se borraría, sin borrar nada.

## Ejemplos

```bash
npx fwskills remove specs/create-specs --yes
```

```text
info: destino resuelto en /home/usuario/proyecto/.opencode/skills
remove: 6 archivos eliminados de /home/usuario/proyecto/.opencode/skills/specs/create-specs
remove: skill eliminada: specs/create-specs
```

```bash
npx fwskills remove specs/create-specs --dry-run
```

```text
dry-run: destino /home/usuario/proyecto/.opencode/skills/specs/create-specs
dry-run: se eliminarían 6 archivos
```

```bash
npx fwskills remove specs/create-specs --global --yes
```

Repetir el mismo ámbito con el que se instaló es lo que hace que `remove` encuentre
la skill. Instalada en local, se quita en local.

### Archivos ajenos dentro de la carpeta

```text
warn: se conservan 2 archivos que no installó el CLI: notas.md, borrador.md
remove: skill eliminada: specs/create-specs
```

El comando termina con 0. Los archivos que el CLI no puso ahí se quedan, y el aviso
los nombra para que nadie los busque después.

## Errores

| Situación | Código | Qué significa |
|---|---|---|
| Eliminación completada | 0 | La carpeta se quitó, y los archivos ajenos se conservaron |
| La skill no está instalada en ese destino | 3 | No hay carpeta que quitar. Comprueba si el ámbito es el mismo con el que instalaste, o usa `--dir` |
| Quedan archivos ajenos y se pidió eliminar la carpeta entera | 4 | No se borra nada. Quita a mano los archivos que no installó el CLI, o deja la carpeta como está |
| No se detectó agente y no hay `--dir` | 7 | No hay destino donde buscar la skill. Se ejecuta `init` o se pasa `--dir` |
| Referencia mal formada, o `..` en un segmento | 2 | Error de uso: la referencia no cumple el formato `<categoría>/<slug>` |
| Error no previsto | 1 | Fallo no cubierto por ninguna otra clase, con la traza si `DEBUG` está activo |

## Ver también

- [CLI: fwskills add](/docs/cli/add/): instalar una skill y de dónde viene la
  estructura de la carpeta.
- [CLI: fwskills update](/docs/cli/update/): actualizar en vez de reinstalar.
- [Flags](/docs/cli/flags/): los 6 flags del CLI.
