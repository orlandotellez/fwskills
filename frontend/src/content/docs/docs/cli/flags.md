---
title: "CLI: flags"
description: Los 6 flags del CLI fwskills, la precedencia con la que resuelven el destino de instalación y la nota sobre --yes.
sidebar:
  label: flags
  order: 8
---

## Los 6 flags

| Flag | Descripción | Ejemplo |
|---|---|---|
| `--dir <ruta>` | Sobrescribe la raíz de destino. Tiene la máxima precedencia: gana sobre la detección de agente y sobre `--global` | `npx fwskills add specs/create-specs --dir ~/skills` |
| `--global` | Instala en la configuración global del agente en lugar de la del proyecto. Cambia el ámbito de la detección, no la destino de forma arbitraria | `npx fwskills add specs/create-specs --global` |
| `--force` | Sobrescribe los archivos existentes sin preguntar | `npx fwskills add specs/create-specs --force` |
| `--dry-run` | Muestra el plan completo y no cambia nada | `npx fwskills add specs/create-specs --dry-run` |
| `--yes` | Responde sí a todas las confirmaciones; deja el CLI completamente no interactivo | `npx fwskills add --category specs --yes` |
| `--category <categoría>` | Restringe `add` a una categoría completa, o `list` a una categoría | `npx fwskills add --category specs` |

## A qué comandos aplican

| Flag | `init` | `list` | `search` | `add` | `remove` | `update` | `info` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `--dir` | Sí | — | — | Sí | Sí | Sí | Sí |
| `--global` | Sí | — | — | Sí | Sí | Sí | Sí |
| `--force` | — | — | — | Sí | — | Sí | — |
| `--dry-run` | Sí | — | Sí* | Sí | Sí | Sí | — |
| `--yes` | Sí | — | Sí* | Sí | Sí | Sí | — |
| `--category` | — | Sí | — | Sí | — | — | — |

\* `search` acepta `--yes` y `--dry-run` por compatibilidad, pero no alteran el
resultado: la búsqueda no escribe nada, así que no tienen ningún efecto. `info` no
necesita ninguno de los dos, porque nunca escribe.

## Precedencia de destinos

`--dir`, `--global` y la detección de agente se combinan, así que el orden en el que
se evalúan importa. Gana la primera regla que aplica:

| Orden | Regla | Ejemplo |
|---|---|---|
| 1 | `--dir <ruta>` gana siempre | `--dir ~/skills` → `~/skills` |
| 2 | Carpeta por defecto del agente detectada **en el proyecto** | `.opencode/skills/`, `.agents/skills/`, `.pi/skills/` |
| 3 | Carpeta por defecto del agente en su **configuración global**, si se pasó `--global` | La ruta global del agente detectado |
| 4 | Si no hay agente detectable, error con código 7 | — |

Dos precisiones que evitan malentendidos:

- **`--global` no salta a una ruta global arbitraria.** Cambia el ámbito de la
  detección: se sigue buscando un agente, y si se encuentra se usa su configuración
  global. No existe una carpeta global genérica.
- **Con `--global` se instala en la configuración global de todos los agentes
  detectados**, no solo en el preferido. Con `--dir` la instalación va exactamente
  a la ruta indicada y a ninguna otra.

Para ver cómo se resuelve un destino sin escribir nada:

```bash
npx fwskills add specs/create-specs --dry-run
```

```text
dry-run: destino /home/usuario/proyecto/.opencode/skills/specs/create-specs
```

## Reglas de los flags

| Regla | Detalle |
|---|---|
| Forma corta | Ninguna. Un flag de un carácter en un comando con `add`, `info`, `list` y `update` es ilegible |
| Separador | `--flag valor` y `--flag=valor` son equivalentes |
| Combinación | `--dry-run --force` es válido: muestra el plan y, si se quita `--dry-run`, sobrescribe |
| Flag repetido | Gana el último. El anterior se descarta con un aviso en `stderr` |
| Flag desconocido | Error de uso con código 2, con el nombre del flag en el mensaje y una sugerencia de los válidos |
| Flag sin valor | `--dir` sin argumento es error de uso con código 2 |

## `--yes` en scripts

`--yes` existe para que el CLI pueda correr sin terminal. En un script, un prompt
esperando una respuesta no es una confirmación: es un proceso colgado, o peor, una
instalación que se completa a mitad cuando el flujo recibe una entrada que nadie
escribió.

```bash
npx fwskills add --category specs --yes
```

```bash
npx fwskills remove specs/create-specs --yes
```

Dos cuidados al usarlo:

- **Convierte un conflicto en una sobrescritura.** Con `--yes`, los archivos que
  difieren se sobrescriben sin preguntar, y el código de salida 4 deja de aparecer.
  Si el script corre en un entorno donde puede haber trabajo sin versionar, conviene
  `--dry-run` antes, y un `add --force` explícito cuando de verdad se quiere
  sobrescribir.
- **No sustituye a comprobar el resultado.** Los siete códigos de salida son la
  forma de que un script sepa qué pasó. Sin ellos, `add` que termina con 5 y `add`
  que termina con 0 son indistinguibles para quien encadena comandos.

## Ver también

- [CLI: fwskills add](/docs/cli/add/): `--category`, `--dry-run` y los conflictos de
  destino.
- [CLI: fwskills init](/docs/cli/init/): prepara las carpetas de destino.
- [Compatibilidad](/docs/compatibilidad/): las carpetas de cada agente.
