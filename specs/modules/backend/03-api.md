# 03 — API del CLI

La API pública de `fwskills` **es su interfaz de línea de comandos**. No hay
endpoints HTTP, no hay URL, no hay verbos, no hay JSON de entrada ni de salida
como contrato estable. Cualquier documento que presente `POST /api/skills` para
este proyecto está describiendo algo que no existe.

Superficie pública:

| Elemento | Cantidad | Detalle |
|---|---|---|
| Comandos | **7** | `init`, `list`, `search`, `add`, `remove`, `update`, `info` |
| Variante documentada | 1 | `add --category <cat>` |
| Flags | **6** | `--dir`, `--global`, `--force`, `--dry-run`, `--yes`, `--category` |
| Códigos de salida | **7** | `0` a `7` |

## Reglas generales

| Regla | Detalle |
|---|---|
| `npx fwskills <comando>` | Todas las invocaciones del sitio web usan esta forma |
| Globales | `--help` / `-h` y `--version` / `-v` funcionan antes y después del comando |
| Salida de datos | **stdout** |
| Avisos, progreso y errores | **stderr** |
| Interactividad | Sin `--yes`, se pregunta antes de sobrescribir o desinstalar. Con `--yes`, no se pregunta nada |
| Referencia de skill | Siempre `<categoria>/<slug>`, en minúsculas y con guiones |
| Aquellos casos sin argumento | `add` (instala la categoría) y `update` (actualiza todo) |

---

## `init`

| | |
|---|---|
| **Sintaxis** | `npx fwskills init [--dir <ruta>] [--global] [--yes] [--dry-run]` |
| **Descripción** | Crea las carpetas de destino de las skills para los agentes detectados en el proyecto. Es el paso previo a `add`: sin destino, `add` termina con código 7. |
| **Opciones** | `--dir <ruta>` fija una raíz de destino concreta. `--global` prepara el destino global en vez del local. `--yes` no pregunta. `--dry-run` muestra qué carpetas crearía sin crear ninguna. |
| **Ejemplo** | `npx fwskills init` |

**Salida esperada**

```text
info: agentes detectados: opencode, pi
info: creando /home/usuario/proyecto/.opencode/skills
info: creando /home/usuario/proyecto/.pi/skills
init: 2 carpetas de destino preparadas
```

Con `--dry-run`:

```text
dry-run: se habrían creado 2 carpetas de destino
```

Con `--dir`:

```text
init: 1 carpeta de destino preparada en /home/usuario/skills
```

| Situación | Código |
|---|---|
| Al menos un agente detectado o `--dir` dado | 0 |
| No se detecta ningún agente y no hay `--dir` | **7** |
| La carpeta existe ya | 0 (no es un error; el mensaje lo indica) |

---

## `list`

| | |
|---|---|
| **Sintaxis** | `npx fwskills list [--category <categoría>]` |
| **Descripción** | Lista las skills disponibles en el catálogo, con su categoría y versión. Acepta `--category` en cualquier posición. |
| **Opciones** | `--category <categoría>` limita el resultado a una categoría del repositorio. |
| **Ejemplo** | `npx fwskills list --category security` |

**Salida esperada**

```text
specs/crear-specs                     1.0.0   specs
design/revision-visual                0.4.2   design
qa/junit-reportes                     1.2.0   qa
security/analisis-deps                0.9.1   security

list: 4 skills en 4 categorías
```

Con filtro:

```text
security/analisis-deps                0.9.1   security

list: 1 skill
```

`stdout` es limpio: las líneas de `info` van a stderr, de modo que
`npx fwskills list | awk '{print $1}'` devuelve solo referencias.

| Situación | Código |
|---|---|
| Listado correcto | 0 |
| Categoría inexistente | **3** |
| No se pudo obtener el catálogo | **6** |

---

## `search`

| | |
|---|---|
| **Sintaxis** | `npx fwskills search <consulta>` |
| **Descripción** | Busca skills por nombre, descripción y tags. La comparación ignora mayúsculas y acentos, y coincide por subcadena. |
| **Opciones** | Ninguna propia. Acepta los flags globales `--yes` y `--dry-run`, que no alteran el resultado. |
| **Ejemplo** | `npx fwskills search testing` |

**Salida esperada**

```text
qa/junit-reportes                     1.2.0  qa
security/revision-deps                1.1.0   security
qa/playwright-smoke                   0.6.0   qa

search: 3 resultados para "testing"
```

Sin coincidencias:

```text
search: 0 resultados para "blockchain"
```

| Situación | Código |
|---|---|
| Búsqueda ejecutada (con o sin resultados) | 0 |
| Consulta vacía | **2** (error de uso: falta el argumento) |

---

## `add`

| | |
|---|---|
| **Sintaxis** | `npx fwskills add <categoría>/<slug> [opciones]`<br>`npx fwskills add --category <categoría> [opciones]` |
| **Descripción** | Instala una skill. Con referencia completa instala una; con `--category` instala **todas** las skills de esa categoría. |
| **Opciones** | `--category <categoría>` instala la categoría completa. `--dir <ruta>` fija la raíz de destino. `--global` instala en la configuración global del agente. `--force` sobrescribe sin preguntar. `--yes` responde sí a todo. `--dry-run` muestra el plan sin escribir. |
| **Ejemplo** | `npx fwskills add specs/crear-specs` |
| **Ejemplo (categoría)** | `npx fwskills add --category security` |

**Salida esperada**

```text
info: destino resuelto en /home/usuario/proyecto/.opencode/skills
add: 6 archivos instalados en /home/usuario/proyecto/.opencode/skills/specs/crear-specs
```

Con `--dry-run`:

```text
dry-run: destino /home/usuario/proyecto/.opencode/skills/specs/crear-specs
dry-run:   crear      SKILL.md
dry-run:   crear      references/checklist.md
dry-run:   omitir     assets/diagrama.png (sin cambios)
dry-run: se habrían escrito 2 archivos, 1 sin cambios
```

Cuando hay conflicto y no se pasa `--force`:

```text
warn: 1 archivo existente difiere; se necesita --force para sobrescribir
? Sobrescribir SKILL.md? (s/N) s
add: 1 archivo sobrescrito
```

| Situación | Código |
|---|---|
| Instalación completada | 0 |
| Skill o categoría inexistente | **3** |
| Archivos existentes sin `--force` ni `--yes`, y respuesta negativa | **4** |
| El `SKILL.md` no cumple el esquema de 8 campos | **5** |
| No se pudo descargar el payload | **6** |
| No se detectó agente y no hay `--dir` | **7** |

### Resolución de `add <categoría>/<slug>`

| Paso | Regla |
|---|---|
| Formato | Exactamente `<categoría>/<slug>`, un solo `/`, ambos segmentos en minúsculas con guiones y sin acentos |
| Separadores | Se aceptan `\` y se normalizan a `/`, porque en Windows la gente pega rutas |
| Espacios | Se recortan en los extremos; un espacio interior hace fallar la validación |
| Recorrido | `..` en cualquier segmento se rechaza con código **2** |
| Existencia | `<categoría>` debe existir en el catálogo; `<slug>` debe existir dentro de ella |
| Sin argumento | Sin `--category`, un `add` sin argumento es error de uso (código **2**): instalar "todo" por accidente es exactamente el tipo de error que este CLI evita |
| Con `--category` | Instala todas las skills de la categoría en orden alfabético de slug, y **falla completa** si alguna no se puede instalar, sin dejar la categoría a medias |
| Resultado | La carpeta creada es `<destino>/<categoría>/<slug>/`, de modo que el destino mantiene la misma estructura que `skills/` |

### Precedencia de destinos

Se evalúa en orden y gana la primera regla que aplica:

| Orden | Regla | Ejemplo |
|---|---|---|
| 1 | `--dir <ruta>` gana siempre | `--dir ~/skills` → `~/skills` |
| 2 | Carpeta por defecto del agente detectada **en el proyecto** | `.opencode/skills/`, `.agents/skills/`, `.pi/skills/` |
| 3 | Carpeta por defecto del agente en la **configuración global**, si se pasó `--global` | La ruta global del agente detectado |
| 4 | Si no hay agente detectable, **error con código 7** | — |

Sobre la regla 3: `--global` **no** salta a una ruta global arbitraria, cambia
el ámbito de la detección. Se sigue buscando un agente, y si se encuentra, se usa
su configuración global. No hay carpeta global genérica.

Mensaje del error de la regla 4, que es accionable por diseño:

```text
error: no se detectó ninguna configuración de agente en este proyecto
error: ejecuta `npx fwskills init` para preparar las carpetas, o pasa --dir <ruta>
```

Agentes y carpetas por defecto:

| Agente | Carpeta por defecto en el proyecto | Estado en el repositorio |
|---|---|---|
| opencode | `.opencode/skills/` | Verificada: existe |
| agentes genéricos | `.agents/skills/` | Verificada: existe |
| pi | `.pi/skills/` | Verificada: existe |
| Claude Code | `.claude/skills/` | **Objetivo propuesto**, no verificado en el repositorio |

Orden de preferencia cuando se detectan varios: `opencode` → `pi` → `agents`
→ `claude`, y el resto se ignora salvo que se indique `--dir`. Con `--global` se
instala en la configuración global de **todos** los agentes detectados, no
solo en el preferido.

---

## `remove`

| | |
|---|---|
| **Sintaxis** | `npx fwskills remove <categoría>/<slug> [--dir <ruta>] [--global] [--yes]` |
| **Descripción** | Desinstala una skill previamente instalada por el CLI. Solo borra lo que el CLI construyó: no toca archivos que la persona haya añadido a mano. |
| **Opciones** | `--dir <ruta>` y `--global` replican la precedencia de destinos, para apuntar al mismo sitio desde el que se instaló. `--yes` no pregunta. `--dry-run` muestra qué se borraría. |
| **Ejemplo** | `npx fwskills remove specs/crear-specs --yes` |

**Salida esperada**

```text
info: destino resuelto en /home/usuario/proyecto/.opencode/skills
remove: 6 archivos eliminados de /home/usuario/proyecto/.opencode/skills/specs/crear-specs
remove: skill eliminada: specs/crear-specs
```

Si hay archivos ajenos dentro de la carpeta:

```text
warn: se conservan 2 archivos que no installó el CLI: notas.md, borrador.md
remove: skill eliminada: specs/crear-specs
```

| Situación | Código |
|---|---|
| Eliminación completada | 0 |
| La skill no está instalada en ese destino | **3** |
| Quedan archivos ajenos y se pidió eliminar la carpeta entera | **4** |
| No se detectó agente y no hay `--dir` | **7** |

---

## `update`

| | |
|---|---|
| **Sintaxis** | `npx fwskills update [categoría>/<slug] [opciones]` |
| **Descripción** | Actualiza las skills instaladas a la versión publicada. **Sin argumento actualiza todas.** |
| **Opciones** | `--dir <ruta>` y `--global` para elegir el destino. `--force` sobrescribe sin preguntar. `--yes` responde sí a todo. `--dry-run` lista qué skills tienen versión nueva. |
| **Ejemplo** | `npx fwskills update` |
| **Ejemplo (una skill)** | `npx fwskills update qa/junit-reportes` |

**Salida esperada**

```text
info: 3 skills instaladas
info: 2 actualizaciones disponibles
update: qa/junit-reportes 1.2.0 -> 1.3.0
update: security/analisis-deps 0.9.1 -> 1.0.0
update: qa/playwright-smoke sin cambios
update: 2 skills actualizadas, 1 sin cambios
```

Con `--dry-run`:

```text
dry-run: 2 actualizaciones disponibles: qa/junit-reportes (1.2.0 -> 1.3.0), security/analisis-deps (0.9.1 -> 1.0.0)
```

| Situación | Código |
|---|---|
| Actualización completada (o nada que actualizar) | 0 |
| La skill indicada no está instalada | **3** |
| Alguna skill falló su validación tras descargar | **5** |
| No se pudo consultar el catálogo | **6** |

Detalle importante: `update` solo actúa sobre skills **instaladas por el CLI**.
Para saber cuáles son, cada instalación escribe un archivo de manifiesto
`<destino>/<categoría>/<slug>/.fwskills.json` con la versión instalada y la fecha.
No es un archivo de la skill: lo genera el CLI y nunca se sobrescribe al
actualizar, solo se compara.

---

## `info`

| | |
|---|---|
| **Sintaxis** | `npx fwskills info <categoría>/<slug> [--dir <ruta>] [--global]` |
| **Descripción** | Muestra la metadata resuelta de una skill: versión, autor, compatibilidad, archivos que la componen y ruta de destino donde se instalaría. |
| **Opciones** | `--dir <ruta>` y `--global` solo afectan al cálculo de la ruta de destino que se imprime. No instalan nada. |
| **Ejemplo** | `npx fwskills info specs/crear-specs` |

**Salida esperada**

```text
specs/crear-specs
  version        1.0.0
  category       specs
  author         orlandotellez
  compatibility  opencode, pi, claude-code
  tags           especificacion, arquitectura, requisitos
  featured       no

  files (6)
    SKILL.md
    references/checklist.md
    references/ejemplo.md
    scripts/validar.mjs
    assets/diagrama.png
    assets/logo.svg

  destino        /home/usuario/proyecto/.opencode/skills/specs/crear-specs
  instalado      no
```

| Situación | Código |
|---|---|
| Metadata mostrada | 0 |
| Skill inexistente | **3** |
| No se pudo obtener el catálogo | **6** |

`info` nunca escribe en disco. Es el comando seguro para comprobar a mano, y el
que aparece en la sección 7 de `/instalacion`.

---

## Flags

Los **6** flags, y a qué comandos aplican:

| Flag | Descripción | Ejemplo | Aplica a |
|---|---|---|---|
| `--dir <ruta>` | Sobrescribe la raíz de destino. Tiene la máxima precedencia: gana sobre la detección de agente y sobre `--global`. | `npx fwskills add specs/crear-specs --dir ~/skills` | todos |
| `--global` | Instala en la configuración global del agente en lugar de la del proyecto. Cambia el ámbito de la detección, no la destino de forma arbitraria. | `npx fwskills add qa/junit-reportes --global` | `init`, `add`, `remove`, `update`, `info` |
| `--force` | Sobrescribe los archivos existentes sin preguntar. | `npx fwskills add specs/crear-specs --force` | `add`, `update` |
| `--dry-run` | Muestra el plan completo y no cambia nada. | `npx fwskills add specs/crear-specs --dry-run` | `init`, `add`, `remove`, `update` |
| `--yes` | Responde sí a todas las confirmaciones; deja el CLI completamente no interactivo. | `npx fwskills add --category security --yes` | todos |
| `--category <categoría>` | Restringe `add` a una categoría completa. | `npx fwskills add --category security` | `add`, `list` |

Reglas de los flags:

| Regla | Detalle |
|---|---|
| Forma corta | Ninguna. Un flag de un carácter en un comando con `add`, `info`, `list` y `update` es ilegible |
| Separador | `--flag valor` y `--flag=valor` son equivalentes |
| Combinación | `--dry-run --force` es válido: muestra el plan y, si se quita `--dry-run`, sobrescribe |
| Flag repetido | Gana el último; el anterior se descarta con un aviso en stderr |
| Flag desconocido | Error de uso, código **2**, con el nombre del flag en el mensaje y una sugerencia de los válidos |
| Flag sin valor | `--dir` sin argumento es error de uso, código **2** |

---

## Códigos de salida

Siete códigos, cerrados y estables. Un código de salida es parte de la API: la
gente escribe scripts alrededor del CLI, y `add` con código 4 significa algo
concreto.

| Código | Nombre | Significado | Cuándo ocurre |
|---|---|---|---|
| **0** | `Success` | La operación se completó. | Instalación, listado, búsqueda, actualización o eliminación terminados. También cuando `--dry-run` termina y también cuando no había nada que actualizar |
| **1** | `UnexpectedError` | Error no previsto. Siempre acompañado de un mensaje en stderr y, con `DEBUG`, de la traza | Fallo no cubierto por ninguna otra categoría: un permiso denegado inesperado, un error de E/S sin clasificar |
| **2** | `UsageError` | La invocación es incorrecta | Comando desconocido, flag desconocido, flag sin valor, argumento que falta, más positionals de los esperados, `search` sin consulta, `add` sin referencia ni `--category` |
| **3** | `NotFound` | La skill o la categoría no existe | Referencia con formato válido pero inexistente, categoría inexistente en `list --category`, skill no instalada en `remove` o `update` |
| **4** | `DestinationConflict` | Hay archivos y no se autorizó sobrescribir ni borrar | Archivos existentes que difieren sin `--force` ni `--yes`, y la respuesta es no; intento de borrar una carpeta con archivos que el CLI no instaló |
| **5** | `ValidationFailed` | La skill no cumple el esquema | El `SKILL.md` descargado no valida los 8 campos de frontmatter, o su versión no es semver, o `category` no coincide con la carpeta |
| **6** | `NetworkError` | Fallo del registro | No se pudo resolver o descargar el payload, o el registro no respondió. **Nunca** produce una instalación parcial silenciosa |
| **7** | `NoCompatibleAgent` | No se detectó ningún agente | No se encontró ninguna carpeta de configuración de agente y no se pasó `--dir`, en la ruta de precedencia 4 |

### Decisión de diseño: por qué un enum cerrado y no códigos libres

Es una decisión, no un accidente, y por eso se registra aquí además de en el ADR
correspondiente:

| Opción | Problema |
|---|---|
| Códigos libres por comando | Cada autor elige el suyo; aparece el 42, luego el 9, luego el 1 para tres cosas distintas. Un script de Shell no puede reaccionar de forma fiable |
| Siempre 1 ante cualquier fallo | Se pierde la distinción entre "te equiocaste al escribir el comando" y "no hay agente en esta máquina". La diferencia importa: uno se corrige escribiendo y el otro ejecutando `init` |
| Un código por clase de error, cerrado | Siete clases cubren el espacio real de fallos. Cada una es accionable por una persona, y dos personas distintas que ven el mismo código toman la misma decisión |

El criterio que sostiene la tabla: **un código de salida solo existe si cambia lo
que la persona hace después**. Si dos fallos se resuelven igual, serían un solo
código. Y si un fallo no se puede distinguir de otro, no merece el suyo.
