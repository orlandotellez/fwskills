# Andamiaje del CLI

## Estado Actual

`packages/` no existe en el repositorio, y la raíz tampoco tiene `package.json`.
El único paquete del repositorio es `frontend/package.json`, que declara
`"name": "fwskills"`, `"version": "1.0.0"`, `"type": "module"` y
`"engines": { "node": ">=22.12.0" }`, con cuatro scripts: `dev`, `build`,
`preview` y `astro`. No hay `bin`, ni `exports`, ni `.npmignore`, ni `tsconfig.json`
propio del CLI, ni runner de pruebas, ni código de TypeScript de Node en el árbol.

Existe un defecto verificado que bloquea la creación de este módulo:
`frontend/package.json` ya se llama `fwskills` y el paquete del CLI debe
publicarse también como `fwskills`, porque la invocación pública del proyecto es
`npx fwskills add <categoria>/<slug>` y `npx` resuelve por nombre de paquete. Con
dos workspaces con el mismo nombre, `npm install` aborta con:

```text
npm error code EDUPLICATEWORKSPACE
npm error must not have multiple workspaces with the same name
```

## Objetivo

El paquete `fwskills` instalable y ejecutable como `npx fwskills`, con su parser de
argumentos, su registro de comandos, su enum de códigos de salida y su logger
estructurado, y con el monorepo de npm workspaces funcionando sin colisión de
nombres.

## Alcance

- `packages/cli/` con su `package.json`, `tsconfig.json`, `.npmignore` y
  `README.md`.
- TypeScript estricto sobre Node `>=22.12.0`, ESM, sin dependencias de runtime.
- `bin` apuntando a `dist/index.js` con `#!/usr/bin/env node`.
- `src/index.ts` como entrada única: argv → comando → código de salida.
- `src/cli/args.ts`: parser genérico de argv que no conoce nombres de flags.
- `src/cli/registry.ts`: tabla nombre → comando.
- `src/cli/usage.ts`: ayuda global y por comando, con `--help` y `--version`.
- `src/cli/errors.ts`: `CliError` y su mapeo a los códigos de salida.
- `src/core/exit-codes.ts`: el enum cerrado de 8 valores.
- `src/core/logger.ts`: logging estructurado a stderr.
- `src/core/types.ts` y los puertos `FileSystemPort`, `SkillRegistryPort` y
  `ConfirmPort`.
- `package.json` raíz con `workspaces: ["frontend", "packages/cli"]`.
- Renombrar el workspace del sitio a `@fwskills/site` con `private: true`.

## Fuera de alcance

- Los siete comandos: `init`, `list`, `search` y `info` en
  [`02-comandos-de-consulta.md`](./02-comandos-de-consulta.md); `add`, `remove` y
  `update` en [`03-comando-add.md`](./03-comando-add.md).
- La detección de agentes y la precedencia de destinos, en
  [`04-deteccion-de-agentes.md`](./04-deteccion-de-agentes.md).
- La validación de `SKILL.md` y la contención de rutas, en
  [`05-validacion-de-skills.md`](./05-validacion-de-skills.md).
- El empaquetado a `dist/index.js`, la publicación en npm y el versionado, en
  [`06-empaquetado-y-publicacion.md`](./06-empaquetado-y-publicacion.md).
- Cualquier framework de CLI. No hay `commander`, `yargs`, `oclif` ni `citty`:
  siete comandos y seis flags no justifican una capa de indirección en una
  herramienta que se instala con `npx`.
- Base de datos y API. El módulo `backend/` de la especificación **es** el CLI, no
  un servidor (ADR-01): no expone endpoints HTTP, no escucha en ningún puerto y no
  tiene esquema de persistencia. El módulo `db/` no existe (ADR-02).
- Cualquier flag o variable de token. La lista de flags es cerrada y no incluye
  ninguna credencial, porque el CLI no se autentica contra nada.

## Tareas

- [ ] 1. Renombrar el workspace del sitio para eliminar la colisión de nombres
  - Detalle de implementación: en `frontend/package.json`, cambiar `"name":
  "fwskills"` por `"name": "@fwskills/site"` y añadir `"private": true`. El sitio
  nunca se publica en npm y no debe ocupar el nombre del paquete distribuible.
  `@fwskills/site` es el nombre recomendado en ADR-06 y en
  `specs/docs/03-ejecucion-local.md`. La versión `1.0.0` se conserva porque el
  versionado del sitio es interno; el que importa es el del CLI.
- [ ] 2. Crear el `package.json` raíz con los workspaces declarados
  - Detalle de implementación: `package.json` en la raíz del repositorio con
  `"private": true`, `"workspaces": ["frontend", "packages/cli"]`, `"engines":
  { "node": ">=22.12.0" }` y los scripts de operación del monorepo. `skills/` **no**
  se declara como workspace: es contenido versionado, sin `package.json`, y no
  participa del `npm install`. A partir de aquí hay un único `package-lock.json` en
  la raíz y una sola instalación cubre sitio y CLI.
- [ ] 3. Crear `packages/cli/package.json` con la superficie pública del paquete
  - Detalle de implementación: `"name": "fwskills"`, `"type": "module"`,
  `"version": "0.1.0"`, `"license": "MIT"`, `"engines": { "node": ">=22.12.0" }`,
  `"bin": { "fwskills": "./dist/index.js" }`, `"files": ["dist", "README.md",
  "LICENSE"]`, `"exports": { ".": "./dist/index.js" }`, y **cero** dependencias de
  runtime. Los scripts de desarrollo son `dev` con
  `node --experimental-strip-types src/index.ts`, `build` con el empaquetador,
  `test` con `vitest run`, `check` con `tsc --noEmit`, `lint` con `eslint .` y
  `smoke` con `node dist/index.js list`.
- [ ] 4. Crear `packages/cli/tsconfig.json` con el modo estricto y ES2023
  - Detalle de implementación: `"strict": true`, `"target": "ES2023"`, `"module":
  "NodeNext"`, `"moduleResolution": "NodeNext"`, `"outDir": "dist"`, `"noEmit":
  true` para el chequeo y `"include": ["src", "test"]`. La restricción importante no
  está en el `tsconfig` sino en el código: solo sintaxis borrable, sin `enum`, sin
  `namespace`, sin decoradores y sin parámetros de tipo en las clases, para que el
  mismo archivo funcione sin transformación en desarrollo, en pruebas y en el
  paquete publicado.
- [ ] 5. Crear `packages/cli/.npmignore` que excluya `src/` y `test/` del tarball
  - Detalle de implementación: excluye `src/`, `test/`, `tsconfig.json`,
  `vitest.config.ts` y `node_modules/`, y conserva `dist/`, `README.md` y
  `LICENSE`. Un `.npmignore` mal hecho que incluya `src/` y `test/` aumenta el
  tarball sin aportar nada; uno que **no** incluya `dist/` publica un paquete que
  no se puede ejecutar. `npm pack --dry-run` lo verifica antes de cada
  publicación.
- [ ] 6. Implementar `src/core/exit-codes.ts` con el enum cerrado
  - Detalle de implementación: `export const ExitCode = { Success: 0,
  UnexpectedError: 1, UsageError: 2, NotFound: 3, DestinationConflict: 4,
  ValidationFailed: 5, NetworkError: 6, NoCompatibleAgent: 7 } as const;` con su
  tipo homónimo derivado. Es un objeto `as const` y no un `enum` por una razón
  concreta: la sintaxis borrable. Un `enum` de TypeScript no se puede eliminar sin
  transpilar, y el CLI tiene que poder ejecutarse desde sus fuentes sin paso de
  build. Un código de salida solo existe si cambia lo que la persona hace después;
  siete clases cubren el espacio real de fallos.
- [ ] 7. Implementar `src/core/logger.ts` con toda la salida de mensajes en stderr
  - Detalle de implementación: `info`, `warn`, `error` y `debug` escriben
  **siempre** en `process.stderr` con los prefijos `info:`, `warn:`, `error:` y
  `debug:`. `stdout` queda exclusivamente para el resultado del comando, de modo
  que `npx fwskills list | grep security` devuelva exactamente las skills de
  seguridad. El color se aplica solo a stderr y solo si `stderr.isTTY` y `NO_COLOR`
  no está definido. `debug` exige que `DEBUG` esté presente y no vacío, e incluye
  rutas resueltas y decisiones de destino, nunca el valor de una variable sensible.
  Los errores se escriben siempre por stderr, incluso con `--quiet`.
- [ ] 8. Implementar `src/cli/args.ts` como parser genérico de argv
  - Detalle de implementación: recibe `string[]` y devuelve `{ command: string;
  positionals: string[]; flags: Record<string, string | boolean>; unknown:
  string[] }`. Acepta `--flag valor` y `--flag=valor` como equivalentes; un flag
  sin valor es `true`; un flag repetido gana el último y el anterior se descarta
  con un aviso en stderr; un flag desconocido va a `unknown` y decide el registro,
  no el parser. **No conoce ningún nombre de flag**: añadir un flag es tocar un
  archivo, no tres, y un flag mal escrito produce «flag desconocido: `--fuerce`»
  en lugar de un fallo raro más adelante.
- [ ] 9. Implementar `src/cli/registry.ts` con la tabla nombre → comando
  - Detalle de implementación: `export const registry: Record<string, Command> =
  { init, list, search, add, remove, update, info }`. Cada `Command` declara
  `name`, `summary`, `usage` y `flags`, según la interfaz de
  `modules/backend/02-architecture.md`. Añadir un comando es añadir un archivo y
  una línea: ningún otro archivo cambia, y `--help` itera el registro, de modo que
  un comando nuevo trae su ayuda sin trabajo adicional. La prueba «todo comando
  tiene `name`, `summary`, `usage` y al menos un flag» es una aserción sobre el
  registro.
- [ ] 10. Implementar `src/cli/usage.ts` con la ayuda global y la de cada comando
  - Detalle de implementación: `--help` y `-h` funcionan antes y después del
  comando; `--version` y `-v` imprimen la versión del paquete y salen con 0. La
  ayuda global enumera los 7 comandos con su línea de descripción; la de cada
  comando muestra su sintaxis, sus flags aplicables y sus códigos de salida
  relevantes. La ayuda sale por `stdout` porque es lo que la persona pidió al
  escribir `--help`.
- [ ] 11. Implementar `src/cli/errors.ts` con `CliError` y el mapeo a códigos
  - Detalle de implementación: `CliError` lleva su código consigo y su mensaje
  accionable, y compone el formateo desde la misma tabla que
  `src/core/exit-codes.ts`. El `catch` de `src/index.ts` es el único que existe en
  todo el CLI: `CliError` produce su código, cualquier otra excepción produce 1 con
  el mensaje y, si `DEBUG` está activo, la traza. Un `catch` genérico nunca se
  traduce a código 0 y nunca relanza.
- [ ] 12. Declarar los puertos `FileSystemPort`, `SkillRegistryPort` y `ConfirmPort`
  - Detalle de implementación: `src/ports/fs.ts` declara `readTextFile`,
  `writeTextFile`, `mkdirp`, `exists`, `readdir`, `remove`, `lstat` y `realpath`;
  `src/ports/registry.ts` declara `resolve`, `list` y `fetchFiles`; y
  `src/ports/confirm.ts` declara `ask` e `info`. Son interfaces sin
  implementación. `lstat` y `realpath` están porque son las dos operaciones
  necesarias para detectar symlinks. Que el puerto diga «dame los archivos de esta
  skill» y no «descarga del registro de npm» es lo que permite probar `add` entero
  sin red.
- [ ] 13. Escribir `src/index.ts` como entrada única del binario
  - Detalle de implementación: `process.argv.slice(2)` alimenta `args.parse()`; si
  viene vacío o es `--help`/`-h`/`--version`/`-v` se muestra la ayuda global y se
  sale con 0; se resuelve el comando del registro y, si no existe, `CliError` con
  código 2; se construye el `CommandContext` con los puertos reales; se ejecuta
  `await command.run(ctx)`; y el resultado se asigna a `process.exitCode` en lugar
  de llamar a `process.exit`, para que las escrituras a `stdout` se vacíen antes de
  terminar. `src/index.ts` no contiene lógica de negocio ni mensajes de negocio.
- [ ] 14. Crear `packages/cli/README.md` con el uso rápido
  - Detalle de implementación: la instalación con `npx fwskills --help`, la lista
  de los 7 comandos y los 6 flags, y un enlace explícito a la referencia completa
  en `/docs/cli` del sitio. El README no duplica la referencia: la duplicaría y
  acabaría desincronizándose, que es el mismo motivo por el que `03-api.md` es la
  definición del enum de códigos.
- [ ] 15. Configurar el runner de pruebas y el linter del workspace
  - Detalle de implementación: `vitest.config.ts` con los proyectos `unit`,
  `integration` y `e2e`; `eslint.config.js` en flat config con
  `@typescript-eslint`; y `.prettierrc` con `printWidth: 100`, `semi: true`,
  `singleQuote: true` y `proseWrap: preserve`, excluyendo `skills/**/*.md` del
  formateo automático. La puerta única `npm run verify` encadena `check`, `test`,
  `lint` y `format:check`.
- [ ] 16. Verificar que el monorepo instala y que los dos workspaces conviven
  - Detalle de implementación: `npm install` en la raíz termina sin
  `EDUPLICATEWORKSPACE` y genera un único `package-lock.json`. `npm run build -w
  @fwskills/site` construye el sitio y `npm run dev -w fwskills -- list` ejecuta el
  CLI desde sus fuentes. `npx --no-install fwskills` dentro del repositorio
  resuelve al binario local. La comprobación se repite en un clon limpio, porque
  un lockfile generado en una máquina con estado previo puede ocultar el
  conflicto.
- [ ] 17. Corregir los documentos que ejecutan comandos desde `frontend/`
  - Detalle de implementación: `frontend/README.md` y
  `specs/docs/03-ejecucion-local.md` pasan a indicar que los comandos se ejecutan
  desde la raíz del repositorio con el selector `-w`, y que el sitio se llama
  `@fwskills/site`. Un documento de ejecución local que apunte a rutas que ya no
  existen es peor que uno que no existe.

## Criterios de Done

- [ ] `npm install` en la raíz termina sin `EDUPLICATEWORKSPACE` y produce un único `package-lock.json`.
- [ ] `frontend/package.json` declara `"name": "@fwskills/site"` y `"private": true`, y `packages/cli/package.json` declara `"name": "fwskills"`.
- [ ] `packages/cli/package.json` tiene `"bin": { "fwskills": "./dist/index.js" }`, `"engines": { "node": ">=22.12.0" }`, `"type": "module"`, `"license": "MIT"` y cero dependencias de runtime.
- [ ] `npm run build -w fwskills && node dist/index.js --help` imprime los 7 comandos y sale con 0.
- [ ] `node dist/index.js --version` imprime la versión del paquete y sale con 0; `--help` y `--version` funcionan antes y después del nombre del comando.
- [ ] `node dist/index.js comando-inexistente` sale con **2** y nombra el comando en el mensaje de stderr.
- [ ] `node dist/index.js --flag-desconocido` sale con **2** y sugiere los flags válidos.
- [ ] `node dist/index.js list 2>/dev/null` no muestra ni una línea de prefijo: stdout contiene únicamente el resultado, y `1>/dev/null` no muestra ningún resultado.
- [ ] `DEBUG=1 node dist/index.js list 2>&1 >/dev/null` muestra líneas `debug:` con las decisiones tomadas, y ninguna contiene el valor de una variable sensible.
- [ ] `NO_COLOR=1 node dist/index.js list > salida.txt` no deja ninguna secuencia de escape ANSI en el archivo.
- [ ] `npm run check -w fwskills` termina con 0 errores y el código no contiene `enum`, `namespace` ni decoradores.
- [ ] `npm pack --dry-run` en `packages/cli/` muestra `dist/index.js` y no muestra `src/` ni `test/`.
- [ ] Un test afirma que todo comando del registro tiene `name`, `summary`, `usage` y al menos un flag, y pasa.
- [ ] `npm run verify -w fwskills` termina con 0 y encadena `check`, `test`, `lint` y `format:check`.
- [ ] `frontend/README.md` y `specs/docs/03-ejecucion-local.md` indican que los comandos se ejecutan desde la raíz y nombran el workspace del sitio correctamente.
