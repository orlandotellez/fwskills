# Detección de agentes y destinos

## Estado Actual

Proyecto nuevo en esta área: no existe `src/core/agents.ts` ni
`src/core/destination.ts`, y no hay ninguna función que resuelva dónde se instala
una skill. El repositorio sí contiene las tres carpetas de destino verificables —
`.opencode/skills/`, `.agents/skills/` y `.pi/skills/`, todas existentes en la raíz
del repositorio—, pero ningún código las consulta. La carpeta
`.claude/skills/` no existe y está registrada en
`specs/modules/backend/03-api.md` como **objetivo propuesto, no verificado** en el
repositorio. La precedencia de cuatro niveles y la tabla de agentes están
especificadas en `03-api.md`, pero no implementadas.

## Objetivo

Resolver de forma determinista y explicable la carpeta de destino de una
instalación, con cuatro niveles de precedencia que se aplican en orden, un orden de
preferencia entre agentes detectados y un error accionable cuando no hay ninguno.

## Alcance

- `src/core/agents.ts`: tabla de agentes soportados, sus carpetas por defecto y el
  orden de preferencia.
- Detección de un agente en el proyecto, comprobando la existencia de su carpeta de
  configuración.
- Detección de la configuración global de un agente, activada solo por `--global`.
- `src/core/destination.ts`: la precedencia de cuatro niveles.
- El mensaje de la salida **7**, accionable por diseño.
- Soporte de los cuatro agentes: `opencode`, `agents`, `pi` y `claude`, este último
  como destino propuesto.
- `--dir` con ruta relativa, resuelta contra el directorio actual.
- Verificación con `--dry-run` y desde `info`, que imprime la ruta resuelta.

## Fuera de alcance

- La escritura en la carpeta resuelta: viven en
  [`03-comando-add.md`](./03-comando-add.md). Aquí se decide **qué** carpeta es;
  no se escribe en ella, salvo en `init`, que solo crea carpetas vacías.
- La validación de rutas y la defensa de symlinks dentro del destino:
  [`05-validacion-de-skills.md`](./05-validacion-de-skills.md).
- La detección de la configuración global por agente en macOS y Linux, más allá de
  la ruta que cada agente declara: el repositorio no tiene una implementación
  multiplataforma fechada, y esta tarea fija el contrato, no las rutas
  definitivas de cada sistema operativo.
- Cualquier variable de entorno para forzar el agente. No existe `FWSKILLS_AGENT`:
  forzar la detección por entorno introduce un modo que casi nadie usaría y que
  nadie probaría. La detección es automática y visible en `--dry-run` e `info`.
- La instalación en una carpeta arbitraria sin `--dir`. `--dir` es la única vía, y
  es explícita.
- Cualquier lectura de configuración del agente más allá de la existencia de su
  carpeta: el CLI no lee archivos de configuración Private, ni tokens, ni
  credenciales.

## Tareas

- [ ] 1. Declarar la tabla de agentes soportados y su orden de preferencia
  - Detalle de implementación: en `src/core/agents.ts`, un
  `Record<string, AgentDefinition>` con `slug`, `label`, `projectDir` y
  `globalDir`, para `opencode` (`.opencode/skills/`), `agents` (`.agents/skills/`),
  `pi` (`.pi/skills/`) y `claude` (`.claude/skills/`, marcado como propuesto). El
  orden de preferencia es `opencode` → `pi` → `agents` → `claude`; cualquier otro
  agente se ignora salvo que se pase `--dir`. Cada definición lleva su estado —
  verificado o propuesto — para que la documentación de `/instalacion` pueda
  distinguir una carpeta comprobada de una propuesta.
- [ ] 2. Verificar las tres carpetas de destino existentes antes de fijar la tabla
  - Detalle de implementación: antes de escribir la tabla, comprobar en el
  repositorio que `.opencode/skills/`, `.agents/skills/` y `.pi/skills/` existen, y
  que `.claude/skills/` no existe. El resultado se registra en el propio archivo
  como el estado de cada entrada, y esa misma información se publica en la sección
  5 de `/instalacion`. Una tabla de agentes con una ruta inventada produce un CLI
  que instala donde el agente no lee.
- [ ] 3. Implementar `detectProjectAgents(cwd)` con la comprobación de existencia
  - Detalle de implementación: para cada agente de la tabla, comprueba con el
  `FileSystemPort` si existe `<cwd>/<projectDir>` y devuelve la lista ordenada por
  preferencia. Solo comprueba existencia de directorio: no lee su contenido, no
  sigue enlaces simbólicos hacia fuera y no inspecciona configuración. Con dos
  agentes detectados, gana el de mayor preferencia para las operaciones de un
  destino, y `--global` los incluye a todos.
- [ ] 4. Implementar `detectGlobalAgents()` con el ámbito de `--global`
  - Detalle de implementación: `--global` **no salta a una ruta global arbitraria**:
  cambia el ámbito de la detección. Se sigue buscando un agente, y si se encuentra,
  se usa su configuración global mediante `globalDir`. Con `--global` y dos
  agentes detectados, la instalación va en la configuración global de **todos** los
  detectados, no solo en el preferido. No hay carpeta global genérica: si el agente
  detectado no declara `globalDir`, se considera que no se puede resolver y se
  informa.
- [ ] 5. Implementar `destination.resolve()` con los cuatro niveles en orden
  - Detalle de implementación: gana la primera regla que aplica. Nivel 1,
  `--dir <ruta>` gana siempre, resuelta con `path.resolve()` contra el directorio
  actual y convertida a absoluta antes de usarse. Nivel 2, la carpeta por defecto
  del agente detectado **en el proyecto**. Nivel 3, la carpeta por defecto del
  agente en su **configuración global**, si se pasó `--global`. Nivel 4, sin
  agente detectable, error con código **7**. La función es pura: recibe un conjunto
  de agentes detectados y devuelve un destino o un error, sin tocar el disco.
- [ ] 6. Comprobar que `--dir` gana sobre `--global` y sobre la detección
  - Detalle de implementación: `--dir X` con un agente detectado devuelve `X`; y
  `--dir X --global` con un agente devuelve `X` también. Es la primera regla y no
  tiene excepción. La prueba afirma los dos casos, porque es exactamente donde un
  orden mal implementado produce un destino inesperado.
- [ ] 7. Escribir el mensaje de la salida 7 y hacerlo accionable
  - Detalle de implementación: cuando no se detecta ningún agente y no hay `--dir`,
  el CLI escribe en `stderr` exactamente dos líneas:
  `error: no se detectó ninguna configuración de agente en este proyecto` y
  `error: ejecuta \`npx fwskills init\` para preparar las carpetas, o pasa --dir
  <ruta>`, y sale con **7**. El mensaje dice qué hacer, no solo qué pasó: quien ve
  el código 7 debe saber si corregirlo escribiendo el comando o ejecutando otro.
- [ ] 8. Exponer la resolución en `--dry-run` e `info` para que sea visible
  - Detalle de implementación: `info` imprime la ruta de destino que se usaría
  **sin instalar nada**, y `--dry-run` muestra la carpeta resuelta en la primera
  línea del plan. Con `DEBUG=1` se imprime además la regla de precedencia que se
  aplicó y qué agentes se detectaron. Un usuario que no entiende por qué el CLI
  eligió una carpeta no puede corregirlo.
- [ ] 9. Exigir que el destino sea escribible antes de escribir nada
  - Detalle de implementación: la comprobación ocurre antes de la fase de
  escritura del plan, y si la carpeta existe y no es escribible, el CLI falla con
  el mensaje del sistema y código **1**. No intenta `sudo`, no pide elevación y no
  cambia permisos de archivos existentes. Un instalador de skills que pide
  privilegios de administrador es una señal de compromiso, y un instalador que
  reajusta permisos para poder pasar es un error de diseño.
- [ ] 10. Cubrir la precedencia con la tabla de 8 escenarios
  - Detalle de implementación: `--dir X` con agente detectado devuelve `X`; `--dir
  X` con `--global` y agente devuelve `X`; sin `--dir` con agente en el proyecto
  devuelve la carpeta del proyecto; sin `--dir` con `--global` y agente devuelve la
  carpeta global; sin `--dir`, sin `--global` y sin agente devuelve el error **7**;
  sin `--dir`, sin `--global` y con dos agentes devuelve el de mayor preferencia;
  con `--global` y dos agentes devuelve la global de los dos; y `--dir` con ruta
  relativa devuelve la ruta absoluta resuelta contra el directorio actual.
- [ ] 11. Cubrir la detección con los casos de agente presente y ausente
  - Detalle de implementación: pruebas para cada agente por separado, para los
  cuatro juntos, para ninguno, y para un directorio donde existe un archivo con el
  nombre de la carpeta de skills en lugar de un directorio. Con `FileSystemPort`
  falso, estas pruebas corren en milisegundos, sin disco y sin depender de la
  máquina de quien las ejecuta.

## Criterios de Done

- [ ] `src/core/agents.ts` declara los cuatro agentes con su carpeta de proyecto, su carpeta global y su estado de verificado o propuesto, en el orden `opencode` → `pi` → `agents` → `claude`.
- [ ] Las tres carpetas verificadas —`.opencode/skills/`, `.agents/skills/` y `.pi/skills/`— existen en el repositorio y coinciden con lo que declara la tabla; `.claude/skills/` está marcada como propuesta no verificada.
- [ ] `npx fwskills add specs/crear-specs` en un proyecto con `.opencode/skills/` y `.pi/skills/` resuelve `.opencode/skills` por preferencia e informa la ruta resuelta.
- [ ] `npx fwskills add specs/crear-specs --dir ~/skills` resuelve exactamente `~/skills`, aunque haya un agente detectable.
- [ ] `npx fwskills add specs/crear-specs --dir ~/skills --global` sigue resolviendo `~/skills`: `--dir` gana sobre `--global`.
- [ ] `npx fwskills add specs/crear-specs --global` con dos agentes detectados instala en la configuración global de los dos, no solo en el preferido.
- [ ] En un proyecto sin ninguna carpeta de agente y sin `--dir`, el comando sale con **7** y el mensaje contiene las dos líneas que remiten a `npx fwskills init` y a `--dir`.
- [ ] `npx fwskills info <categoria>/<slug>` imprime la ruta de destino resuelta sin crear ni escribir ningún archivo.
- [ ] `npx fwskills add <ref> --dry-run` muestra la carpeta resuelta en la primera línea del plan.
- [ ] `DEBUG=1 npx fwskills add <ref> --dry-run` muestra los agentes detectados y la regla de precedencia aplicada, sin el valor de ninguna variable sensible.
- [ ] Con el destino no escribible, el comando falla con el mensaje del sistema y código **1**, y no intenta elevar privilegios ni cambiar permisos.
- [ ] La tabla de precedencia de 8 escenarios pasa como prueba unitaria, y los casos de detección de agentes pasan con `FileSystemPort` falso.
- [ ] `grep -rn "FWSKILLS_AGENT\|FWSKILLS_HOME" cli` no devuelve coincidencias: ninguna variable de entorno fuerza el destino.
