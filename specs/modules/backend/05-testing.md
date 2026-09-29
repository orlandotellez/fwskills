# 05 — Testing

## Estado real

| Elemento | Estado |
|---|---|
| Runner de pruebas | **No existe** |
| Marco de pruebas | **No existe** |
| Fixtures | **No existen** |
| Cobertura | **No se mide** |
| Scripts de prueba en `package.json` | **No existen** |

`packages/cli/` no existe todavía, así que no hay nada que probar. Todo lo de este
documento es `[ESPECIFICADO]`.

## Framework

**Vitest**, con dos proyectos configurados en el mismo runner.

| Proyecto | Entorno | Qué cubre |
|---|---|---|
| `unit` | `node` | `src/core/**` y `src/cli/**`. Sin disco, sin red, sin terminal |
| `integration` | `node` | Comandos completos con `FileSystemPort` real sobre un directorio temporal del sistema |
| `e2e` | `node`, un solo archivo | Smoke test del binario construido, invocado como proceso hijo |

Por qué Vitest y no Jest, Node test runner o uvu:

| Motivo | Detalle |
|---|---|
| Compatible con ESM y TypeScript sin configuración extra | El paquete es ESM y solo usa sintaxis borrable |
| Escritura con `describe`/`it`, a la velocidad del runner nativo de Node | Con ESLint como linter, la familiaridad de la API reduce fricción |
| Projectos en un solo comando | `vitest run` cubre los tres niveles; no hay dosores de test que recordar |
| Integrate con `expect` y `vi.fn()` | Necesario para verificar que un puerto falso **no** fue invocado |
| Si un día el sitio adopta pruebas unitarias, es el mismo marco | Los dos módulos comparten raíz de workspace |

El e2e **no** es Playwright: esto es una CLI, no un navegador. Playwright aporta
valor en el módulo `frontend`; aquí sería sobrecosto.

---

## Unidad

### Objetivo: la lógica pura, al 100 %

Las pruebas unitarias apuntan a `src/core/**`, que no importa `node:fs` ni hace
`fetch`. Es la capa que hace que el módulo sea testeable, y por eso es la que
recibe la mayor exigencia.

| Archivo | Qué se prueba | Casos objetivo |
|---|---|---|
| `frontmatter.ts` | Parseo del frontmatter y validación de los 8 campos | ≥ 30 |
| `reference.ts` | Normalización y validación de `<categoría>/<slug>` | ≥ 25 |
| `paths.ts` | `assertInside`, contención de rutas | ≥ 20 |
| `destination.ts` | Precedencia de los 4 niveles de destino | ≥ 16 |
| `plan.ts` | Cálculo del plan de archivos, clasificación nuevo/idéntico/diferente | ≥ 15 |
| `catalog.ts` | Consultas sobre el índice de skills, filtrado por categoría, búsqueda | ≥ 20 |
| `args.ts` | Parser de argv: flags con y sin valor, `=`, repetidos, desconocidos, positionals | ≥ 30 |
| `exit-codes.ts` + `errors.ts` | Mapeo de cada tipo de error a su código | = 7, una por código |
| `agents.ts` | Detección y orden de preferencia de agentes | ≥ 10 |

### Casos que no pueden faltar

Estos son los que fallan en producción si no están cubiertos:

**`reference.ts` — normalización**

| Entrada | Salida esperada |
|---|---|
| `specs/crear-specs` | Igual, válida |
| `  specs/crear-specs  ` | Igual tras recortar |
| `specs\crear-specs` | Normalizada a `specs/crear-specs` |
| `SPECS/Crear-Specs` | **Rechazada**, no normalizada en silencio |
| `specs//crear` | Rechazada |
| `/specs/crear` | Rechazada |
| `specs/crear/extra` | Rechazada |
| `specs/../etc` | Rechazada |
| `specs/./crear` | Rechazada |
| `crear-specs` | Rechazada: falta la categoría |
| `specs/crear specs` | Rechazada: espacio interior |
| `specs/crear-specs` con segmento de 65 caracteres | Rechazada |

**`paths.ts` — contención**

| Entrada | Resultado |
|---|---|
| `root` = `/a/b`, destino `/a/b/specs/x` | Aceptado |
| `root` = `/a/b`, destino `/a/bc/x` | **Rechazado** (prefijo de texto compartido) |
| `root` = `/a/b`, destino `/a/b/../c` | Rechazado |
| `root` = `/a/b`, destino `/a/b` | Aceptado (la raíz en sí) |
| `root` = `/a/b`, destino `/a/b/` | Aceptado tras normalizar |

**`destination.ts` — precedencia** (los 4 niveles × 4 escenarios)

| Escenario | Resultado esperado |
|---|---|
| `--dir X` + agente detectado | `X`, siempre |
| `--dir X` + `--global` + agente | `X`: `--dir` gana |
| Sin `--dir`, agente en el proyecto | Carpeta del proyecto |
| Sin `--dir`, `--global`, agente detectado | Carpeta global del agente |
| Sin `--dir`, sin `--global`, sin agente | Error con código **7** |
| Sin `--dir`, sin `--global`, dos agentes | El de mayor preferencia |
| `--global`, dos agentes | **Global de todos** los detectados |
| `--dir` con ruta relativa | Resuelta contra el `cwd` y absoluta antes de usarla |

**`exit-codes.ts`**

| Tipo de error | Código |
|---|---|
| Comando desconocido | 2 |
| Skill inexistente | 3 |
| Archivos existentes sin permiso | 4 |
| Frontmatter inválido | 5 |
| Fallo de red | 6 |
| Sin agente | 7 |
| Error no clasificado | 1 |
| Sin error | 0 |

---

## Integración

### Objetivo: los comandos completos, con disco real y sin red

La estrategia es la que hace que el puerto de filesystem valga la pena:

| Tipo de prueba | Puerto de filesystem | Puerto de registro | Puertos reales |
|---|---|---|---|
| **Unitaria de comando** (rápida) | Falso en memoria | Fixtures | Ninguno |
| **Integración** (más lenta) | **Real**, sobre `mkdtemp` | Fixtures | `node:fs`, `readline` |

`FileSystemPort` real significa que las pruebas ejercitan `mkdir -p`, las
escrituras reales, los permisos del sistema y los casos de conflicto de archivos.
Un puerto falso no puede detectar un bug de permisos, y los bugs de permisos son
de los que solo aparecen en la máquina de otra persona.

`ConfirmPort` se sustituye por una implementación que responde con lo que la
prueba necesita, de modo que ninguna prueba espera entrada por terminal.

### Fixture base

`test/fixtures/` contiene lo mínimo para que la lógica tenga algo real que leer:

| Fixture | Contenido |
|---|---|
| `catalog.json` | 6 skills repartidas en 4 categorías: 2 `specs`, 1 `design`, 2 `qa`, 1 `security`. Una con `featured: true`, una con `tags` compartidos para probar las relacionadas |
| `skill-tree/` | Árbol de una skill real: `SKILL.md`, `references/`, `assets/`, y un `scripts/validar.mjs` declarado |
| `invalid-frontmatter/` | Un `SKILL.md` con un campo ausente y otro con `featured: "sí"` |
| `escaping-frontmatter/` | Un `SKILL.md` con `category: ../../etc`, para probar la defensa |
| `payload-with-symlink/` | Un árbol con un symlink que apunta fuera, para probar la contención |

### Recorridos de integración

| # | Recorrido | Aserciones |
|---|---|---|
| 1 | `add` de una skill a un directorio vacío | Archivos creados, ruta correcta, código 0, salida a stdout |
| 2 | `add` repetido sin cambios | Todos los archivos se clasifican como idénticos, se omiten, código 0 |
| 3 | `add` con un archivo modificado | Conflicto: sin `--force` pregunta; con `--force` sobrescribe; con `--yes` acepta |
| 4 | `add --dry-run` | **Cero escrituras**: el directorio queda vacío y el plan se imprime completo |
| 5 | `add --category security` | Instala todas las de la categoría en orden alfabético |
| 6 | `add` con frontmatter inválido | Código **5**, cero escrituras |
| 7 | `add` con categoría que intenta escapar | Código **2** o **5** según la fase, cero escrituras |
| 8 | `add` con payload que trae symlink | El symlink no se instala, aviso en stderr, código 0 |
| 9 | `add` con script no declarado | El archivo se omite, se nombra en el aviso |
| 10 | `add --dir` | El destino es exactamente el indicado, con precedencia sobre el agente |
| 11 | `add` sin agente ni `--dir` | Código **7**, mensaje que menciona `init` y `--dir` |
| 12 | `remove` de una skill instalada | Carpeta eliminada, código 0 |
| 13 | `remove` con archivos ajenos | Los conserva, lo dice en stderr, código 0 |
| 14 | `remove` de algo no instalado | Código **3** |
| 15 | `update` con versión nueva | Actualiza solo las necesarias, manifiesto actualizado |
| 16 | `update` sin argumento | Actualiza todas las instaladas |
| 17 | `update` sin cambios | Código 0 y mensaje explícito |
| 18 | `list` y `list --category` | Filtrado correcto, salida por stdout |
| 19 | `search` por nombre, descripción y tags | Los tres campos matchean, acentos y mayúsculas ignorados |
| 20 | `search` sin consulta | Código **2** |
| 21 | `info` | Metadata completa, destino correcto, indica si está instalada |
| 22 | `init` con agentes presentes | Crea las carpetas de cada agente detectado |
| 23 | Fallo de red simulado en el puerto de registro | Código **6**, cero escrituras parciales |

El recorrido 4 merece emphasis: **`--dry-run` debe dejar el directorio
exactamente como estaba**. Es una aserción sobre el árbol de archivos completo, no
sobre la salida.

El recorrido 23 verifica una garantía que importa: una instalación interrumpida
no deja una skill a medias. O se instala entera, o no se instala.

---

## E2E

Un solo archivo: `test/e2e/smoke.test.ts`. Su trabajo es verificar que **el
paquete publicado funciona**, que es donde fallan los errores que ninguna prueba
unitaria detecta.

| # | Prueba | Aserciones |
|---|---|---|
| 1 | `fwskills --help` sale con 0 y lista los 7 comandos | Las 7 aparecen en stdout |
| 2 | `fwskills --version` sale con 0 | Formato de versión |
| 3 | `fwskills list` sale con 0 y lista skills | stdout es parseable |
| 4 | `fwskills add --dry-run` | Sale con 0 y **no crea ningún archivo** |
| 5 | `fwskills comando-inexistente` | Sale con **2** |
| 6 | `fwskills add no-existe/xyz` | Sale con **3** |
| 7 | `fwskills search` sin argumento | Sale con **2** |
| 8 | `fwskills add --category inexistente` | Sale con **3** |
| 9 | Filtros `--help` y `--version` en cualquier posición | Igual comportamiento |
| 10 | Flag desconocido | Sale con **2** y nombra el flag en el mensaje |

Cómo se ejecuta: se invoca el binario **construido** (`dist/index.js`) como
proceso hijo, en un directorio temporal limpio, con un `HOME` temporal para que
la detección de agente global no toque la máquina de quien ejecuta las pruebas.

Si el build no existe, el E2E **falla con un mensaje claro** en lugar de saltarse.
Un E2E que se salta porque alguien no ejecutó `build` antes es una prueba que
nunca ha protegido de nada.

---

## Cobertura objetivo

| Ámbito | Objetivo | Razón |
|---|---|---|
| `src/core/**` | **100 %** de líneas y de ramas | Es lógica pura, sin entradas externas, y todo su comportamiento son decisiones de seguridad |
| `src/cli/args.ts`, `registry.ts`, `errors.ts` | **100 %** | El parser y el mapeo de códigos son contrato público |
| `src/commands/**` | ≥ 85 % | Ramas Covered por los 23 recorridos de integración; el resto son rutas de error poco probables |
| `src/ports/**` | 100 % | Son solo interfaces; lo que se mide es el contrato, verificado por el falso |
| Total del paquete | **≥ 90 %** | Por debajo de eso, la cobertura deja de describir la realidad |

Qué se mide **y qué no**:

| No se mide | Por qué |
|---|---|
| Ramas inalcanzables | El `catch` genérico y el fallback de `DEBUG` existen para ser seguros, no para ejecutarse en pruebas. Se marcan con un comentario explícito en el código en lugar de excluirse a mano en el informe |
| Ramas dependientes de permisos del sistema operativo | Un `EACCES` real requiere cambiar el propietario del directorio. Se prueba inyectando el error en el puerto, no pidiendo privilegios |
| El contenido de `node:fs` | Se prueba el puerto, no la biblioteca estándar |

El informe de cobertura se publica junto al resultado de las pruebas, con
líneas sin cubrir enumeradas. Motivo: un número agregado esconde que las 12
líneas sin cubrir son exactamente la validación de symlinks.

---

## Comandos

| Comando | Script | Qué ejecuta |
|---|---|---|
| `npm run test` | `vitest run` | Unitarias + integración + E2E |
| `npm run test:unit` | `vitest run --project unit` | Solo lógica pura. Es el ciclo rápido |
| `npm run test:integration` | `vitest run --project integration` | Comandos con disco real |
| `npm run test:e2e` | `npm run build && vitest run --project e2e` | Smoke test del binario. Construye primero |
| `npm run test:watch` | `vitest` | Modo interactivo |
| `npm run coverage` | `vitest run --coverage` | Informe de cobertura |
| `npm run check` | `tsc --noEmit` | Tipos |

`test:unit` es el comando del ciclo de escritura: sin disco, sin red, sin build,
por lo que se ejecuta en milisegundos y se puede lanzar en cada guardado.
`test:e2e` es el que se ejecuta antes de publicar, y construye primero a propósito:
si el empaquetado rompe el binario, esa es precisamente la clase de fallo que no
puede llegar a `main`.

Los directorios temporales se crean con `mkdtemp` en el `tmpdir` del sistema y se
eliminan en `afterEach`. Ninguna prueba escribe nunca fuera de su directorio, y
ninguna depende del estado de otra: el orden de ejecución no puede cambiar el
resultado.
