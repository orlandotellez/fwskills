# 02 — Arquitectura

Estado: **todo este módulo es `[ESPECIFICADO]`.** No hay una línea de código del
CLI escrita todavía; este documento describe la estructura que se va a
construir.

## Capas

```
┌──────────────────────────────────────────────────────────────────┐
│ 5 · ENTRADA                    src/index.ts                      │
│     bin. Lee argv, resuelve el comando, fija process.exitCode.   │
│     No contiene lógica de negocio ni mensajes.                  │
├──────────────────────────────────────────────────────────────────┤
│ 4 · COMANDOS                   src/commands/*.ts                 │
│     Un archivo por comando. Orquesta: pide datos a las capas     │
│     inferiores y decide el código de salida.                   │
├──────────────────────────────────────────────────────────────────┤
│ 3 · NÚCLEO                    src/core/*.ts                      │
│     Lógica pura y determinista: frontmatter, catálogo,          │
│     resolución de destino, validación de rutas, códigos, log.   │
│     No toca el disco ni la red. Es la capa que se prueba.       │
├──────────────────────────────────────────────────────────────────┤
│ 2 · PUERTOS                   src/ports/*.ts                     │
│     Interfaces: FileSystemPort, SkillRegistryPort,               │
│     ConfirmPort. Sin implementación.                            │
├──────────────────────────────────────────────────────────────────┤
│ 1 · ADAPTADORES                node:fs/promises, fetch,           │
│                                 readline                         │
│     Las únicas piezas que conocen el mundo exterior.            │
└──────────────────────────────────────────────────────────────────┘
```

Las flechas bajan y **nunca suben**. Un comando no llama a `node:fs`
directamente: llama al puerto. El núcleo no importa nada de `node:fs`, lo que
lo hace comprobable sin disco y sin mocks.

## Responsabilidad por capa

| Capa | Responsabilidad | Prohibido |
|---|---|---|
| 5 · Entrada | Traducir `process.argv` en una invocación, delegar, propagar el código de salida | Imprimir mensajes de negocio, decidir nada |
| 4 · Comandos | Orquestar un caso de uso: qué se pide, en qué orden, qué se responde y con qué código se sale | Tocar `node:fs` o `fetch`; contener lógica que se pueda probar en aislamiento |
| 3 · Núcleo | Toda la lógica determinista: parseo de frontmatter, normalización de referencias, precedencia de destinos, validación de rutas, mapeo de errores a códigos de salida | Cualquier entrada/salida del sistema |
| 2 · Puertos | Declarar qué capacidades necesita el núcleo | Contener lógica |
| 1 · Adaptadores | Hablar con el disco, la red y la terminal | Decidir nada |

El valor de esta separación es concreto: `destination.ts` decide *qué* carpeta
destino corresponde según cuatro reglas de precedencia. Eso se puede probar con
20 casos de tabla en microsegundos. Si esa decisión viviera dentro de `add.ts`
mezclada con `mkdir` y `writeFile`, habría que crear un árbol de directorios
temporáneo por cada caso, y la mitad de las pruebas ni siquiera podrían
escribirse.

## Estructura de carpetas

Árbol objetivo:

```
cli/
├── package.json              # name: fwskills, bin, engines.node >=22.12.0, type: module, license MIT
├── tsconfig.json             # strict, target ES2023, module NodeNext
├── README.md                 # uso rápido; la referencia completa vive en el sitio /docs/cli
├── .npmignore                # excluye src/ y test/ del tarball, conserva dist/
├── src/
│   ├── index.ts              # entrada del binario: argv → comando → exit code
│   ├── cli/
│   │   ├── registry.ts       # tabla nombre → comando; ayuda y validación de flags
│   │   ├── args.ts           # parser genérico de argv (no conoce nombres de flags)
│   │   ├── usage.ts          # --help y --version, por comando y global
│   │   └── errors.ts         # CliError + mapeo a códigos de salida
│   ├── commands/
│   │   ├── add.ts            # instala una skill o una categoría completa
│   │   ├── remove.ts         # desinstala una skill instalada por el CLI
│   │   ├── update.ts         # actualiza las instaladas
│   │   ├── list.ts           # lista skills, filtrable por categoría
│   │   ├── search.ts         # busca por nombre, descripción y tags
│   │   ├── info.ts           # metadata y destino de una skill
│   │   └── init.ts           # crea las carpetas destino de los agentes detectados
│   ├── core/
│   │   ├── types.ts          # SkillRef, SkillMeta, ParsedArgs, interfaces
│   │   ├── frontmatter.ts    # parseo + validación de los 8 campos
│   │   ├── catalog.ts        # índice de skills disponible y consultas sobre él
│   │   ├── reference.ts      # normalización de "<categoria>/<slug>"
│   │   ├── destination.ts    # precedencia de destinos
│   │   ├── agents.ts         # detección de agentes y rutas por defecto
│   │   ├── paths.ts          # contención de rutas, traversal, symlinks
│   │   ├── plan.ts           # cálculo del plan de archivos a escribir
│   │   ├── exit-codes.ts     # ExitCode
│   │   └── logger.ts         # logging estructurado a stderr
│   └── ports/
│       ├── fs.ts             # FileSystemPort
│       ├── registry.ts       # SkillRegistryPort (resolución y descarga del payload)
│       └── confirm.ts        # ConfirmPort (preguntas al usuario)
└── test/
    ├── fixtures/             # SKILL.md de ejemplo, árboles temporales
    ├── unit/                 # lógica pura, sin disco
    ├── integration/          # con FileSystemPort real sobre directorio temporal
    └── e2e/                  # smoke test del binario construido
```

### Interfaces de los puertos

```ts
// src/ports/fs.ts
export interface FileSystemPort {
  readTextFile(path: string): Promise<string>;
  writeTextFile(path: string, content: string): Promise<void>;
  mkdirp(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  readdir(path: string): Promise<string[]>;
  remove(path: string): Promise<void>;
  lstat(path: string): Promise<{ isSymbolicLink(): boolean; isDirectory(): boolean }>;
  realpath(path: string): Promise<string>;
}
```

```ts
// src/ports/registry.ts
export interface SkillRegistryPort {
  /** Resuelve una referencia a la metadata publicada de esa skill. */
  resolve(ref: SkillRef): Promise<SkillMeta | null>;
  /** Lista las skills publicadas, opcionalmente filtradas por categoría. */
  list(category?: string): Promise<SkillMeta[]>;
  /** Devuelve el contenido de los archivos que componen la skill. */
  fetchFiles(ref: SkillRef): Promise<SkillFile[]>;
}
```

```ts
// src/ports/confirm.ts
export interface ConfirmPort {
  /** Pregunta por TTY. Con `--yes` devuelve true sin preguntar. */
  ask(question: string): Promise<boolean>;
  info(message: string): void;
}
```

El punto clave es que `registry.fetchFiles` **no dice** "descarga del registro de
npm". Dice "dame los archivos de esta skill". La implementación por defecto usa
el registro de npm; una implementación de prueba devuelve fixtures. El comando
`add` no sabe cuál de las dos tiene delante, y por eso se puede probar entero sin
red.

## Flujo de una request

`request` aquí es **una invocación del CLI**, no una petición HTTP. El ejemplo es
completo: `npx fwskills add specs/crear-specs --dir /tmp/demo`.

### 1 · Entrada

```text
src/index.ts
```

| Paso | Qué ocurre |
|---|---|
| 1.1 | `process.argv.slice(2)` → array de strings |
| 1.2 | Si viene vacío o es `--help`/`-h`/`--version`/`-v`, se muestra la ayuda global y se sale con 0 |
| 1.3 | `args.parse()` produce `ParsedArgs`; los flags desconocidos van a `unknown` |
| 1.4 | Se resuelve `command = parsed.command`; si no está en el registro, `CliError` con código **2** |
| 1.5 | El registro valida los flags reconocidos y los positionals esperados; un flag desconocido o un posicional de más también es código **2** |
| 1.6 | Se construye el `CommandContext` con los puertos reales (`node:fs`, registro, `readline`) |
| 1.7 | `const code = await command.run(ctx)` |
| 1.8 | `process.exitCode = code` y el proceso termina de forma natural, para que las escrituras a stdout se vacíen |

### 2 · `add` — preparación

| Paso | Qué ocurre | Capa |
|---|---|---|
| 2.1 | `reference.parse(rawRef)` normaliza `<categoria>/<slug>`: recorta, convierte `\` en `/`, pasa a minúsculas y valida el formato con una expresión regular estricta | 3 · núcleo |
| 2.2 | Si el posicional falta y no hay `--category`, se usa el modo categoría: todas las skills de esa categoría | 3 · núcleo |
| 2.3 | `registry.resolve(ref)`; si no existe, `CliError` → código **3** | 2 · puerto |
| 2.4 | `frontmatter.parse()` sobre el `SKILL.md` recibido; si un campo falla, `CliError` → código **5** | 3 · núcleo |
| 2.5 | `destination.resolve()` aplica la precedencia completa (§ Precedencia de destinos) | 3 · núcleo |
| 2.6 | Si no hay agente y no hay `--dir`, `CliError` → código **7** con el mensaje que indica ejecutar `init` o pasar `--dir` | 3 · núcleo |
| 2.7 | `paths.assertInside(destRoot, candidate)` para **cada** ruta destino, ya resuelta con `path.resolve`: rechaza `..`, separadores absolutos embebidos y rutas que escapen del destino | 3 · núcleo |

### 3 · `add` — cálculo del plan

| Paso | Qué ocurre |
|---|---|
| 3.1 | `registry.fetchFiles(ref)` devuelve la lista de archivos de la skill (`SKILL.md` y, si existen, `references/`, `scripts/`, `assets/`) |
| 3.2 | `plan.build()` calcula el destino final de cada archivo y lo contrasta con lo que ya existe en el destino |
| 3.3 | Se clasifica cada archivo: **nuevo**, **idéntico** (mismo contenido, se omite) o **diferente** (requiere confirmación) |
| 3.4 | Si hay archivos conflictivos y no se pasa `--force` ni `--yes`, `confirm.ask()` pregunta. Con `--yes`, se acepta sin preguntar |
| 3.5 | Se imprime el plan completo: rutas, acciones y destino resuelto, **también sin `--dry-run`** |

### 4 · `add` — ejecución

| Paso | Si `--dry-run` | Si no |
|---|---|---|
| 4.1 Resumen en stdout | Imprime el plan y termina con 0 | Imprime el plan y continúa |
| 4.2 Crear directorios | No hace nada | `fs.mkdirp()` por cada carpeta necesaria |
| 4.3 Escribir archivos | No hace nada | `fs.writeTextFile()` por archivo |
| 4.4 Resultado | `dry-run: se habrían escrito N archivos en <destino>` (código 0) | `add: 6 archivos instalados en <destino>` (código 0) |

El punto de diseño: **los pasos 4.2 y 4.3 son el mismo código**. `--dry-run` no
añade una rama dentro del bucle de escritura; se interrumpe antes. Si hubiera dos
caminos, `--dry-run` acabaría divergiendo de la instalación real, que es
exactamente cuando un usuario pierde la confianza en la herramienta.

### 5 · Errores

En cualquier punto, un fallo lanza `CliError` con un código ya asignado. El
`catch` de `index.ts` es el único que existe:

```text
try   → command.run(ctx)
catch → CliError   → logger.error(mensaje) → exitCode = err.code
catch → otro       → logger.error(mensaje + DEBUG) → exitCode = 1
```

Un `catch` genérico nunca se traduce a código 0, y nunca re-lanza. La tabla
completa de códigos está en [`03-api.md`](./03-api.md) y la justificación de que
sean un enum cerrado está en [`04-security.md`](./04-security.md).

## Patrones usados

### 1 · Registro de comandos

Una tabla que mapea nombre a implementación, en lugar de un `switch` que crece:

```ts
// src/cli/registry.ts
export const registry: Record<string, Command> = {
  init, list, search, add, remove, update, info,
};
```

Qué compra:

| Compra | Detalle |
|---|---|
| Ayuda automática | `--help` itera el registro: comando nuevo, ayuda nueva |
| Validación uniforme | Nombre desconocido y ayuda se resuelven en el mismo sitio |
| Un solo punto de verdad | `fwskills --help`, la ayuda de cada comando y `docs/cli/<comando>` enumeran la misma lista |
| Pruebas triviales | "Todo comando tiene `name`, `summary`, `usage` y al menos un flag" es una aserción sobre el registro |

Consecuencia de diseño: **añadir un comando es añadir un archivo y una línea**.
Ningún otro archivo cambia.

### 2 · Interfaz de handler por comando

```ts
// src/core/types.ts
export interface CommandContext {
  args: ParsedArgs;
  flags: Record<string, string | boolean>;
  fs: FileSystemPort;
  registry: SkillRegistryPort;
  confirm: ConfirmPort;
  log: Logger;
}

export interface Command {
  name: string;
  summary: string;
  usage: string;
  flags: FlagSpec[];
  run(ctx: CommandContext): Promise<number>;
}
```

Reglas que se derivan de la interfaz:

| Regla | Motivo |
|---|---|
| `run` devuelve un código, no llama a `process.exit` | Un comando que termina el proceso no se puede probar ni componer; el código se propaga hasta `index.ts` |
| El contexto se construye una vez | Ningún comando crea su propio puerto; así todos los comandos comparten el mismo sistema de archivos y el mismo logger |
| `flags` se pasan ya validados | Un comando nunca vuelve a parsear argv |

### 3 · Puerto de filesystem

El patrón más importante del módulo. `core/` no importa `node:fs`; recibe un
`FileSystemPort`.

| Consecuencia | Detalle |
|---|---|
| Pruebas sin disco | Un objeto en memoria con la misma interfaz: `add` se prueba entero sin tocar el sistema de archivos |
| Pruebas de integración reales | El mismo comando, con el puerto real, sobre un directorio temporal |
| Modo simulación trivial | `--dry-run` se puede probar con un puerto que registra escrituras y falla si se escribe |
| Un solo sitio que auditar | Todas las escrituras del CLI pasan por `FileSystemPort.writeTextFile`. Revisar que ninguna ruta escapa del destino es revisar ese punto |

Además, el puerto expone `lstat` y `realpath`, que son precisamente las dos
operaciones necesarias para detectar symlinks (ver [`04-security.md`](./04-security.md)).

### 4 · Enum de códigos de salida

```ts
// src/core/exit-codes.ts
export const ExitCode = {
  Success: 0,
  UnexpectedError: 1,
  UsageError: 2,
  NotFound: 3,
  DestinationConflict: 4,
  ValidationFailed: 5,
  NetworkError: 6,
  NoCompatibleAgent: 7,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];
```

Es un objeto `as const` y no un `enum` por una razón concreta: la sintaxis
borrable. Un `enum` de TypeScript no se puede eliminar sin transpilar, y el CLI
tiene que poder ejecutarse desde sus fuentes sin paso de build.

Lo que compra el enum:

| Compra | Detalle |
|---|---|
| Un tipo, no un número suelto | `run()` declara `Promise<number>`, pero en la práctica devuelve `ExitCode.*`; un código inventado es un error de tipos |
| Mensaje coherente con el código | `CliError` lleva el código consigo, y el formateo del mensaje sale de la misma tabla |
| Scriptable | `fwskills add …; if [ $? -eq 7 ]; then …; fi` es un contrato verificable |
| Documentable | La tabla de [`03-api.md`](./03-api.md) no es prosa: es la definición del enum |

### 5 · Logging estructurado a stderr

El logger escribe **siempre a stderr**, con nivel y prefijo, y `stdout` queda
exclusivamente para el resultado del comando.

| Pieza | Regla |
|---|---|
| Destino | stderr para `info`, `warn`, `error`, `debug`; stdout solo para datos |
| Prefijo | `info:` / `warn:` / `error:` / `debug:` antes del mensaje |
| Progreso | Solo si `process.stderr.isTTY`; se pierde al redirigir, y eso es intencionado |
| Color | Solo si `NO_COLOR` no está definido y `stderr.isTTY` |
| `debug` | Solo con `DEBUG` activado; incluye rutas resueltas y decisiones de destino |
| Errores | Siempre por stderr, incluso en `--quiet` |

Por qué esto importa más de lo que parece: `npx fwskills list | grep seguridad`
debe devolver exactamente las skills de seguridad. Si un aviso "descargando
índice…" saliera por stdout, el resultado del `grep` sería ruido. Y al revés, si
el resultado fuera a stderr, `>` no redirigiría nada. La separación no es
estética: es la diferencia entre un CLI componible y uno que no lo es.

### 6 · Cálculo del plan antes de la ejecución

`plan.build()` produce una lista de acciones declarativas —`crear`, `escribir`,
`omitir`, `sobrescribir`— y `apply()` la ejecuta. Los comandos muestran el plan
antes de aplicarlo, y `--dry-run` se detiene entre las dos fases.

| Ganancia | Detalle |
|---|---|
| El plan es comparable | Una prueba puede afirmar el plan completo de una instalación con una sola línea de aserción |
| `--dry-run` y ejecución comparten la lógica | No hay dos rutas de código |
| El mensaje de salida es el plan | Lo que se lee antes de escribir es exactamente lo que va a pasar |
