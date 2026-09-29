# 01 — Stack

Estado: **todo este módulo es `[ESPECIFICADO]`.** `cli/` no existe hoy
en el repositorio. Lo que sí existe y condiciona esta elección es el
`engines.node` del sitio: `>=22.12.0`.

## Lenguaje y versión

| Aspecto | Valor | Motivo |
|---|---|---|
| Lenguaje | TypeScript, ESM | Comparte el lenguaje y el `tsconfig` estricto con `frontend/`; el esquema de `SKILL.md` es el mismo contrato en ambos lados |
| Runtime | Node.js `>=22.12.0` | Idéntico a `frontend/package.json`. Una sola versión de Node en el proyecto, y coincide con el suelo que exige Astro 7 |
| Módulos | ESM (`"type": "module"`) | Ya es el modo del paquete `frontend`; nada de CommonJS |
| Tipos | Modo estricto, `strict: true` | Un CLI escribe en el disco de otras personas. Los tipos son la primera barrera de seguridad |
| Compatibilidad | Node 22 y 24 | Sin dependencias nativas: solo `node:fs`, `node:path`, `node:child_process` y módulos estables de Node |

La exigencia de Node 22 como mínimo no es capricho: es la versión en la que
`node:fs` y el resto de la API de filesystem tienen ya el comportamiento usado
aquí, y la que fija `engines.node` del sitio. Subir el mínimo obligaría a subirlo
también en `frontend/package.json`.

## Framework

**Ninguno.** No hay framework de CLI (`commander`, `yargs`, `oclif`, `citty`).

Es una decisión deliberada, y estas son las razones concretas:

| Razón | Detalle |
|---|---|
| Superficie de la CLI | 7 comandos, 6 flags, cero subcomandos anidados, cero configuración. Un framework aporta una capa de indirección para un problema que son unos 80 líneas de parseo |
| Control de los códigos de salida | Los códigos de salida son **contrato público** (0–7). Con un framework hay que pelearse con su manejo de errores para que el proceso termine siempre con el código correcto |
| Dependencias de un instalador | El CLI se ejecuta en la máquina de otra persona, a menudo justo al instalar algo. Menos dependencias significa menos superficie de ataque y menos superficie de mantenimiento |
| `stdout` limpio | Muchos frameworks escriben banners, avisos o spinners que contaminan la salida. Aquí stdout es un contrato: cualquier framework obliga a silenciarlos |
| Arranque | Sin framework, el cold start es el de Node |

Lo que sí se usa, de la biblioteca estándar y sin dependencias:

| Módulo | Uso |
|---|---|
| `node:fs/promises` | Lectura, escritura, `mkdir -p`, comprobación de existencia |
| `node:path` | Resolución y comparación de rutas (siempre con `path.resolve` antes de validar) |
| `node:url` | Resolución del destino global con `fileURLToPath` |
| `node:process` | `argv`, `exitCode`, `stdout`, `stderr`, `env` |
| `node:readline/promises` | Las confirmaciones interactivas (se omiten enteramente con `--yes`) |

## Versiones clave

| Elemento | Versión | Estado |
|---|---|---|
| `engines.node` del CLI | `>=22.12.0` | `[ESPECIFICADO]` |
| `name` del paquete | `fwskills` | `[ESPECIFICADO]` |
| `bin` | `{ "fwskills": "./dist/index.js" }` | `[ESPECIFICADO]` |
| `"type"` | `module` | `[ESPECIFICADO]` |
| `license` | MIT | `[ESPECIFICADO]` |
| Dependencias de runtime | **0** | `[ESPECIFICADO]` |
| Dependencias de desarrollo | TypeScript, Vitest, un empaquetador | `[ESPECIFICADO]` |

## Por qué esta elección

### TypeScript, no JavaScript

El CLI recibe una referencia `<categoria>/<slug>` de una persona, la resuelve
contra un índice, decide una ruta de destino y escribe archivos. Cada uno de esos
pasos tiene un modo de fallo silencioso, y los tipos los hacen visibles en la
firma de la función en lugar de en un `undefined` a mitad de una escritura:

```ts
// Con strings sueltos, esto compila:
function resolveSkillPath(root: string, ref: string): string;

// Con tipos, el error aparece antes de compilar:
function resolveSkillPath(root: string, ref: SkillRef): ResolvedPath;
```

Además, `frontmatter.ts` valida un objeto de 8 campos que viene de un archivo
escrito por terceras personas. Que el validador reciba un tipo exacto es la
diferencia entre "el campo `featured` es un booleano" comprobado por el sistema
de tipos y "es un booleano porque lo comprobé yo".

### Empaquetado: preferencia por un bundler, con type-stripping nativo en desarrollo

Node 22 puede ejecutar TypeScript directamente mediante el *type stripping*: elimina
las anotaciones de tipo sin transpilar. Es sólido para código que usa únicamente
sintaxis borrable (sin `enum`, sin `namespace`, sin parámetros de tipo), pero tiene
un problema que aquí importa: **no empaqueta**. El paquete publicado tendría que
contener el TypeScript tal cual, y `npx` tendría que resolver esa ruta.

Preferencia, por este orden:

| Escenario | Mecanismo | Motivo |
|---|---|---|
| Desarrollo (`npm run dev`) | Type-stripping nativo de Node (`node --experimental-strip-types`) o el runner de TypeScript ya instalado | Ciclo de escritura inmediato, sin paso de build |
| `npm run build` (publicación) | Empaquetador que emite un único archivo `dist/index.js` con ESM y el `shebang` | `npx` descarga un archivo; sin toolchain en la máquina de quien lo ejecuta |
| Pruebas | El runner de tests resuelve los `.ts` directamente | Las pruebas no pasan por el paso de build |
| Instalación con `npx` | Un solo archivo JS | Sin `postinstall`, sin transpilación en la máquina del usuario |

Consecuencia sobre el código fuente: **el CLI se escribe solo con sintaxis
borrable**. Nada de `enum` (el enum de códigos de salida es un objeto `as const`),
nada de `namespace`, nada de decoradores, nada de parámetros de tipo en las
clases. Esa restricción no es un capricho de estilo: es lo que permite que el
mismo archivo funcione sin transformación en desarrollo, en pruebas y en el
paquete publicado.

El comando `build` debe además comprobar que existe `dist/index.js` y que empieza
por `#!/usr/bin/env node`, y marcar el archivo como ejecutable. Un paquete
publicado sin `bin` funcional se instala sin error y falla al invocarse: es el
fallo más caro de este módulo y el más fácil de no detectar.

### Parseo de argumentos: propio y explícito

Se implementa `src/cli/args.ts` a mano en lugar de usar una librería. La razón
no es el orgullo artesanal: es que esta CLI tiene un formato de argumentos
**peculiar** que las librerías manejan mal o con discrepancias:

| Peculiaridad | Por qué importa |
|---|---|
| El argumento posicional es un valor **compuesto**: `<categoria>/<slug>` | Contiene `/`, y en Windows puede llegar con `\` |
| El valor por defecto de `add` es especial: sin argumento instala la **categoría** | El número de posicionales aceptados depende del comando, y sin argumento se comporta de otra forma |
| `--dry-run` y `--force` se combinan de forma habitual | `--dry-run --force` es una combinación legítima que en otro contexto sería contradictoria |
| Los códigos de salida son contrato público | Un framework puede absorber la excepción y terminar con 0 o con 1 |

El contrato de `args.ts`:

| Entrada | Salida |
|---|---|
| `string[]` de `process.argv.slice(2)` | Un objeto con `command: string`, `positionals: string[]`, `flags: Record<string, string \| boolean>` y `unknown: string[]` |
| Flag sin valor (`--force`) | `true` |
| Flag con valor (`--dir /ruta`) | El valor, o `--flag=valor` con `=` |
| Flag repeatable | La última gana, y el valor anterior se descarta con un aviso en stderr |
| Flag desconocido | Va a `unknown`; el registro de comandos decide si es error de uso (código 2) |
| `--help` / `-h` en cualquier posición | Se muestra la ayuda del comando y se sale con 0 |

Regla dura: **`args.ts` no conoce los nombres de los flags**. Es un parser
genérico. Cada comando declara sus flags, y el registro compara. Así, añadir un
flag es tocar un solo archivo y no tres, y un flag mal escrito produce
"flag desconocido: `--fuerce`" en vez de un fallo raro más adelante.

### Salida estructurada a stderr

El logger escribe en **stderr** con un prefijo por nivel, y stdout queda
reservado para datos. `npx fwskills list --json` (o el formato de tabla por
defecto) tiene que poder redirigirse a un archivo o a otro programa sin que se
cuele una línea de aviso.

| Nivel | Prefijo | Ejemplo |
|---|---|---|
| Info | `info` | `info: 6 skills en 4 categorías` |
| Aviso | `warn` | `warn: el destino ya contiene 2 archivos; se omite sin --force` |
| Error | `error` | `error: no se encontró la skill "specs/crea-specs"` |
| Depuración | `debug` | `debug: destino resuelto en /home/…/.opencode/skills` (solo con `DEBUG=1`) |

La escritura a stderr es **condicional** a que laTTY esté conectada: si alguien
redirige stderr a un archivo, los avisos siguen ahí; los mensajes de progreso que
son ruido visual se descartan.

---

## Comandos de desarrollo

| Comando | Script | Estado |
|---|---|---|
| `npm run dev` | `node --experimental-strip-types src/index.ts <args>` | `[ESPECIFICADO]` — ejecuta el CLI desde las fuentes |
| `npm run build` | Empaquetador → `dist/index.js` | `[ESPECIFICADO]` |
| `npm run test` | `vitest run` | `[ESPECIFICADO]` |
| `npm run test:watch` | `vitest` | `[ESPECIFICADO]` |
| `npm run test:e2e` | Smoke test sobre el binario construido | `[ESPECIFICADO]` |
| `npm run check` | `tsc --noEmit` | `[ESPECIFICADO]` |
| `npm run lint` | `eslint .` | `[ESPECIFICADO]` |
| `npm run format` | `prettier --write .` | `[ESPECIFICADO]` |
| `npm run smoke` | `node dist/index.js list` sobre el build | `[ESPECIFICADO]` |
| `npm publish --dry-run` | Verificación del paquete antes de publicar | `[POR AÑADIR]` a la guía de publicación |

Ejemplos de uso en desarrollo:

```bash
# Ejecutar el CLI desde las fuentes, sin build
npm run dev -- list
npm run dev -- add specs/crear-specs --dry-run

# Ver exactamente qué se escribiría, sin escribir nada
npx fwskills add qa/junit-reportes --dry-run

# Probar el binario realmente publicado
npm run build && npm pack --dry-run && ./dist/index.js info specs/crear-specs
```

`npm pack --dry-run` es parte del ritual de publicación: muestra exactamente qué
archivos entrarían en el paquete. Un `.npmignore` mal hecho que incluya `src/` y
`test/` aumenta el tarball sin aportar nada, y uno que **no** incluya `dist/`
publica un paquete que no se puede ejecutar.

## Variables de entorno

| Variable | Entorno | Efecto |
|---|---|---|
| `DEBUG` | CLI | Activa los mensajes de nivel `debug` en stderr |
| `NO_COLOR` / `FORCE_COLOR` | CLI | Desactiva o fuerza el color de la salida |
| `GITHUB_TOKEN` | Build del sitio | Sube el límite de peticiones de la API de GitHub. **El CLI no la usa nunca** |

Detalle completo en [`06-configuracion.md`](./06-configuracion.md) y en
[`07-integraciones.md`](./07-integraciones.md).
