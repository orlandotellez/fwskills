---
title: "CLI: fwskills update"
description: Actualiza las skills instaladas por el CLI a la versión publicada. Sin argumento actualiza todas.
sidebar:
  label: update
  order: 6
---

## Sintaxis

```bash
npx fwskills update [<categoría>/<slug>] [opciones]
```

## Descripción

Actualiza a la versión publicada las skills instaladas por el CLI. **Sin argumento
actualiza todas.**

Solo actúa sobre skills que el CLI instaló. Cada instalación escribe un archivo de
manifiesto en `<destino>/<categoría>/<slug>/.fwskills.json` con la versión instalada
y la fecha. No es un archivo de la skill: lo genera el CLI, nunca se sobrescribe al
actualizar y solo se compara. Por eso una skill que copiaste a mano en tu carpeta no
se actualiza, y tampoco se rompe.

## Opciones

- `--dir <ruta>` fija la raíz de destino.
- `--global` apunta a la configuración global del agente.
- `--force` sobrescribe los archivos existentes sin preguntar.
- `--yes` responde sí a todas las confirmaciones.
- `--dry-run` lista qué skills tienen versión nueva, sin escribir nada.

## Ejemplos

```bash
npx fwskills update
```

```text
info: 3 skills instaladas
info: 2 actualizaciones disponibles
update: specs/create-specs 2.0.0 -> 2.1.0
update: design/glassmorphism 1.1.0 -> 1.2.0
update: design/dark-luxury sin cambios
update: 2 skills actualizadas, 1 sin cambios
```

```bash
npx fwskills update design/glassmorphism
```

```text
info: 1 skill instalada
update: design/glassmorphism 1.1.0 -> 1.2.0
update: 1 skill actualizada
```

```bash
npx fwskills update --dry-run
```

```text
dry-run: 2 actualizaciones disponibles: specs/create-specs (2.0.0 -> 2.1.0), design/glassmorphism (1.1.0 -> 1.2.0)
```

```bash
npx fwskills update --global --yes
```

Con `--global`, `update` recorre la configuración global de los agentes detectados, y
`--yes` deja el comando completamente no interactivo.

### Validación antes de escribir

La versión recién descargada se valida contra el esquema de 8 campos **antes** de
escribir el primer archivo. Si una versión publicada rompe el contrato, `update` no
toca la instalación existente. Un fallo de contenido y un fallo de red no son lo
mismo, y por eso tienen códigos distintos.

## Errores

| Situación | Código | Qué significa |
|---|---|---|
| Actualización completada, o no había nada que actualizar | 0 | Las skills instaladas están en la versión publicada. Que no haya nada nuevo también es 0 |
| La skill indicada no está instalada | 3 | No hay instalación que actualizar en ese destino |
| Alguna skill falló su validación tras descargar | 5 | La versión publicada no cumple el esquema. No se escribió nada y la instalación anterior queda intacta |
| No se pudo consultar el catálogo | 6 | Fallo de red o del registro. No se actualizó ninguna skill |
| Archivos existentes que difieren, sin `--force` ni `--yes`, con respuesta negativa | 4 | Conflicto de destino. El mensaje dice cuántos archivos difieren |
| Referencia mal formada | 2 | Error de uso: la referencia no cumple el formato `<categoría>/<slug>` |
| Error no previsto | 1 | Fallo no cubierto por ninguna otra clase, con la traza si `DEBUG` está activo |

## Ver también

- [CLI: fwskills add](/docs/cli/add/): instalar una skill por primera vez.
- [CLI: fwskills info](/docs/cli/info/): ver la versión instalada y la publicada.
- [Versionado](/docs/versionado/): qué significa cada número de versión.
- [Flags](/docs/cli/flags/): los 6 flags del CLI.
