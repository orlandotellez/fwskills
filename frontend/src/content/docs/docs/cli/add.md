---
title: "CLI: fwskills add"
description: Instala una skill por su referencia completa, o todas las skills de una categoría con --category. Incluye precedencia de destinos y conflictos.
sidebar:
  label: add
  order: 4
---

## Sintaxis

```bash
npx fwskills add <categoría>/<slug> [opciones]
npx fwskills add --category <categoría> [opciones]
```

## Descripción

Instala una skill en la carpeta de destino del agente detectado.

- Con **referencia completa** instala esa skill.
- Con **`--category`** instala **todas** las skills de esa categoría, en orden
  alfabético de slug.

Sin ninguna de las dos, `add` es un error de uso con código 2. No existe un `add`
sin argumento que instale todo: instalar de más por una palabra de más es
precisamente el fallo que este CLI evita.

La carpeta creada es `<destino>/<categoría>/<slug>/`, de modo que el destino
mantiene la misma estructura que el catálogo.

## Opciones

- `--category <categoría>` instala la categoría completa, en vez de una referencia.
- `--dir <ruta>` fija la raíz de destino. Gana sobre cualquier detección.
- `--global` instala en la configuración global del agente.
- `--force` sobrescribe los archivos existentes sin preguntar.
- `--yes` responde sí a todas las confirmaciones.
- `--dry-run` muestra el plan completo sin escribir nada.

## La referencia `<categoría>/<slug>`

| Regla | Detalle |
|---|---|
| Formato | Exactamente `<categoría>/<slug>`, un solo `/`, y ambos segmentos en minúsculas, con guiones y sin acentos |
| Separadores | Se aceptan `\` y se normalizan a `/`, porque en Windows la gente pega rutas |
| Espacios | Se recortan en los extremos. Un espacio interior hace fallar la validación |
| Recorrido | Un `..` en cualquier segmento se rechaza con código 2 |
| Existencia | La categoría debe existir en el catálogo, y el slug debe existir dentro de ella |
| Instalar la categoría | Falla completa si alguna skill no se puede instalar, sin dejar la categoría a medias |

## Ejemplos

```bash
npx fwskills add specs/create-specs
```

```text
info: destino resuelto en /home/usuario/proyecto/.opencode/skills
add: 6 archivos instalados en /home/usuario/proyecto/.opencode/skills/specs/create-specs
```

```bash
npx fwskills add specs/create-specs --dry-run
```

```text
dry-run: destino /home/usuario/proyecto/.opencode/skills/specs/create-specs
dry-run:   crear      SKILL.md
dry-run:   crear      references/checklist.md
dry-run:   omitir     assets/diagrama.png (sin cambios)
dry-run: se habrían escrito 2 archivos, 1 sin cambios
```

### Instalar una categoría completa

```bash
npx fwskills add --category specs
```

```text
info: destino resuelto en /home/usuario/proyecto/.opencode/skills
add: 4 archivos instalados en /home/usuario/proyecto/.opencode/skills/specs/create-specs
add: 3 archivos instalados en /home/usuario/proyecto/.opencode/skills/specs/create-specs-from-code
```

Si una skill de la categoría no se puede instalar, el comando no deja la categoría a
medias: falla y no escribe el resto. Es una decisión, no una limitación.

### Destino explícito

```bash
npx fwskills add design/dark-luxury --dir ~/skills
```

```text
info: destino resuelto en /home/usuario/skills
add: 1 archivo instalado en /home/usuario/skills/design/dark-luxury
```

## Precedencia de destinos

El destino se resuelve en el momento de instalar. Gana la primera regla que aplica:

| Orden | Regla | Ejemplo |
|---|---|---|
| 1 | `--dir <ruta>` gana siempre | `--dir ~/skills` → `~/skills` |
| 2 | Carpeta por defecto del agente detectada en el proyecto | `.opencode/skills/`, `.agents/skills/`, `.pi/skills/` |
| 3 | Carpeta por defecto del agente en su configuración global, si se pasó `--global` | La ruta global del agente detectado |
| 4 | No hay agente detectable | Error con código 7 |

El mensaje del cuarto caso es accionable:

```text
error: no se detectó ninguna configuración de agente en este proyecto
error: ejecuta `npx fwskills init` para preparar las carpetas, o pasa --dir <ruta>
```

Sobre la regla 3: `--global` no salta a una ruta global arbitraria, cambia el
ámbito de la detección. Se sigue buscando un agente y, si se encuentra, se usa su
configuración global. No hay carpeta global genérica.

Cuando se detectan varios agentes, el orden de preferencia es `opencode` → `pi` →
`agents` → `claude`, y el resto se ignora salvo que se indique `--dir`. Con
`--global` la instalación va a la configuración global de **todos** los agentes
detectados, no solo al preferido.

## Conflictos de destino

Si ya hay archivos y difieren de los que se van a instalar, `add` no sobrescribe
nada y lo dice. Sin `--force` ni `--yes`, pregunta:

```text
warn: 1 archivo existente difiere; se necesita --force para sobrescribir
? Sobrescribir SKILL.md? (s/N) s
add: 1 archivo sobrescrito
```

Con `--yes` la pregunta desaparece y la operación se completa. Con `--force`
sobrescribe sin preguntar.

Un archivo que ya es idéntico no es un conflicto: se omite y se cuenta aparte, que
es lo que muestra la línea `omitir` de `--dry-run`.

## Errores

| Situación | Código | Qué significa |
|---|---|---|
| Instalación completada | 0 | Los archivos están escritos en el destino resuelto |
| Skill o categoría inexistente | 3 | La referencia tiene formato válido pero no existe en el catálogo |
| Archivos existentes sin `--force` ni `--yes`, con respuesta negativa | 4 | Hay un conflicto de destino. El mensaje dice cuántos archivos difieren y que hace falta `--force` |
| El `SKILL.md` no cumple el esquema de 8 campos | 5 | El contenido descargado es inválido. El mensaje nombra el archivo y el campo, y no se escribió nada |
| No se pudo descargar el payload | 6 | Fallo de red o del registro. Nunca deja una instalación parcial silenciosa |
| No se detectó agente y no hay `--dir` | 7 | No hay carpeta de destino. Se ejecuta `init` o se pasa `--dir` |
| `add` sin referencia ni `--category` | 2 | Error de uso: falta el argumento obligatorio |
| Un `..` en la referencia | 2 | La referencia intenta recorrer directorios y se rechaza |
| Flag desconocido o flag sin valor | 2 | El mensaje nombra el flag y sugiere los válidos |

## Ver también

- [CLI: fwskills init](/docs/cli/init/): prepara las carpetas de destino.
- [CLI: fwskills remove](/docs/cli/remove/): desinstalar lo que instaló `add`.
- [CLI: fwskills info](/docs/cli/info/): ver la metadata y el destino sin instalar.
- [Flags](/docs/cli/flags/): los 6 flags y su precedencia.
- [Compatibilidad](/docs/compatibilidad/): las carpetas de cada agente.
