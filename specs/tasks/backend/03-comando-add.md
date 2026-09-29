# Comando `add`, `remove` y `update`

## Estado Actual

Proyecto nuevo en esta área: no hay implementación de `add`, `remove` ni `update`,
ni de `plan.build()`, ni del puerto `FileSystemPort`. Los tres comandos están
especificados en `specs/modules/backend/03-api.md` con su sintaxis, sus opciones,
su salida esperada y sus códigos de salida, y su flujo paso a paso está en
`specs/modules/backend/02-architecture.md`. El andamiaje —paquete, parser, registro,
códigos de salida, logger y puertos— está resuelto en
[`01-andamiaje-del-cli.md`](./01-andamiaje-del-cli.md). La precedencia de destinos
que estos comandos necesitan está en
[`04-deteccion-de-agentes.md`](./04-deteccion-de-agentes.md), y la validación del
`SKILL.md` descargado, en
[`05-validacion-de-skills.md`](./05-validacion-de-skills.md).

## Objetivo

Instalar, desinstalar y actualizar skills en la carpeta del agente, con un plan
calculado antes de escribir, `--dry-run` como la misma ruta de código detenida, y
cero instalaciones parciales.

## Alcance

- `src/commands/add.ts`, `src/commands/remove.ts` y `src/commands/update.ts`.
- `add <categoria>/<slug>` y la variante `add --category <categoría>`.
- `remove <categoria>/<slug>` y `update [categoria>/<slug]`.
- `src/core/plan.ts`: cálculo del plan de archivos y su aplicación.
- `src/core/reference.ts`: normalización y validación de la referencia.
- Manifiesto `<destino>/<categoria>/<slug>/.fwskills.json` con la versión instalada.
- Confirmación interactiva y su omisión con `--yes` y `--force`.
- `--dry-run` sobre los tres comandos.
- Códigos de salida 0, 2, 3, 4, 5, 6 y 7 en las situaciones que les tocan.

## Fuera de alcance

- La resolución del destino y la detección de agentes:
  [`04-deteccion-de-agentes.md`](./04-deteccion-de-agentes.md).
- La validación del frontmatter, la contención de rutas y la defensa de symlinks:
  [`05-validacion-de-skills.md`](./05-validacion-de-skills.md). Aquí se invocan,
  no se implementan.
- El transporte del payload desde el registro de npm y su caché: la interfaz
  `SkillRegistryPort.fetchFiles()` es la frontera, y su implementación por defecto
  vive con el empaquetado, en
  [`06-empaquetado-y-publicacion.md`](./06-empaquetado-y-publicacion.md).
- La caché en disco de payloads y su invalidación en `update`.
- Cualquier ejecución de los archivos que se instalan. El CLI copia y no ejecuta:
  los scripts de una skill se escriben, no se corren, y su política de revisión se
  declara en `/contribuir`.
- `sudo`, elevación de privilegios o cambio de permisos de archivos existentes.

## Tareas

- [ ] 1. Implementar `src/core/reference.ts` con las 25 reglas de normalización
  - Detalle de implementación: `parse(rawRef)` recorta los espacios de los
  extremos, convierte `\` en `/`, exige exactamente un `/`, y valida cada segmento
  con `^[a-z0-9]+(?:-[a-z0-9]+)*$`, longitud máxima de 64 caracteres por segmento y
  200 para la referencia completa. Rechaza —sin normalizar en silencio—
  mayúsculas, espacios interiores, segmentos vacíos, `.`, `..` y rutas absolutas.
  Devuelve `{ categoria, slug }` tipado, no dos strings sueltos: el error aparece en
  la firma antes de aparecer en una escritura.
- [ ] 2. Implementar `src/core/plan.ts` con el plan declarativo y su aplicación
  - Detalle de implementación: `build(ref, files, destino)` produce una lista de
  acciones —`crear`, `escribir`, `omitir`, `sobrescribir`— clasificando cada
  archivo como nuevo, idéntico o diferente respecto de lo que ya existe.
  `apply(plan, ctx)` ejecuta el plan. Los comandos **muestran** el plan antes de
  aplicarlo, incluso sin `--dry-run`, y `--dry-run` se detiene entre las dos fases.
  Lo que se lee antes de escribir es exactamente lo que va a pasar.
- [ ] 3. Implementar `add` con su flujo completo de ocho pasos
  - Detalle de implementación: `reference.parse()`, `registry.resolve()` (**3**
  si no existe), `frontmatter.parse()` (**5** si no valida), `destination.resolve()`
  (**7** si no hay agente y no hay `--dir`), `paths.assertInside()` sobre cada ruta
  destino, `plan.build()`, `confirm.ask()` si hay conflictos y no hay `--force` ni
  `--yes`, impresión del plan y, salvo con `--dry-run`, `mkdirp` y `writeTextFile`
  por archivo. Termina con `add: 6 archivos instalados en <destino>`.
- [ ] 4. Implementar la variante `add --category <categoría>` con fallo completo
  - Detalle de implementación: instala todas las skills de la categoría en orden
  alfabético de slug y **falla completa** si alguna no se puede instalar, sin dejar
  la categoría a medias. Todas las referencias se resuelven y validan **antes** de
  escribir el primer archivo, y el conjunto se construye en un directorio temporal
  que se mueve al destino solo cuando está completo. Si algo falla, el temporal se
  descarta.
- [ ] 5. Hacer que `--dry-run` sea la misma ruta de código, no una rama
  - Detalle de implementación: `--dry-run` interrumpe el flujo antes de la fase de
  escritura; no hay dos caminos de código. La salida es
  `dry-run: destino <ruta>`, una línea por archivo con su acción —`crear`,
  `omitir   assets/diagrama.png (sin cambios)`— y el cierre
  `dry-run: se habrían escrito 2 archivos, 1 sin cambios`, con código 0. La prueba
  de integración afirma sobre el árbol de archivos, no sobre la salida: tras un
  `--dry-run`, el directorio queda exactamente como estaba.
- [ ] 6. Implementar la ruta de conflicto que sale con 4
  - Detalle de implementación: si hay archivos que difieren y no se pasa `--force`
  ni `--yes`, `ConfirmPort.ask()` pregunta con la opción por defecto **no**. Con
  respuesta negativa, el CLI emite
  `warn: 1 archivo existente difiere; se necesita --force para sobrescribir`, no
  escribe nada y sale con **4**. Con `--force` sobrescribe sin preguntar; con
  `--yes` acepta sin preguntar. Con `--dry-run --force` se muestra el plan completo
  y no se escribe nada, porque es una combinación legítima.
- [ ] 7. Implementar `remove` conservando el trabajo ajeno
  - Detalle de implementación: `npx fwskills remove <categoria>/<slug> [--dir
  <ruta>] [--global] [--yes]` borra solo `<destino>/<categoria>/<slug>/`. Si
  dentro hay archivos que el CLI no instaló, los conserva y lo dice:
  `warn: se conservan 2 archivos que no installó el CLI: notas.md, borrador.md`, y
  sale con **0**. Borrar el trabajo manual de alguien porque pidió desinstalar una
  skill es un fallo de confianza difícil de recuperar. Si la carpeta contiene
  archivos ajenos y se pidió eliminarla entera, sale con **4**. Si la skill no está
  instalada en ese destino, sale con **3**.
- [ ] 8. Implementar `update` sobre las skills instaladas por el CLI
  - Detalle de implementación: `npx fwskills update [categoria>/<slug]` compara la
  versión del manifiesto `<destino>/<categoria>/<slug>/.fwskills.json` con la
  publicada, e imprime una línea por skill:
  `update: qa/junit-reportes 1.2.0 -> 1.3.0` o
  `update: qa/playwright-smoke sin cambios`, y cierra con el recuento. Sin
  argumento actualiza todas. Solo actúa sobre skills que el CLI instaló: el
  manifiesto es lo que permite saberlo, y no es un archivo de la skill —el CLI lo
  genera y nunca lo sobrescribe al instalar, solo lo compara al actualizar. Con
  `--dry-run` lista qué versiones hay disponibles sin escribir. Si una skill
  indicada no está instalada, sale con **3**.
- [ ] 9. Escribir el manifiesto `.fwskills.json` y su actualización
  - Detalle de implementación: al instalar se escribe
  `{ version, installedAt, ref }`; al actualizar se reescribe con la versión nueva
  y la fecha nueva. El manifiesto no forma parte de los archivos de la skill, no
  aparece en el listado de `info` como si fuera contenido de la skill, y nunca se
  borra al desinstalar antes que el resto.
- [ ] 10. Garantizar que un fallo de red deja cero escrituras
  - Detalle de implementación: si `registry.fetchFiles()` falla, o el tarball llega
  corrupto o truncado, el CLI sale con **6** y **no ha escrito nada**. La descarga
  se valida antes de extraer y la instalación se arma en un directorio temporal.
  Una skill a medias en la carpeta del agente es peor que no tenerla: el agente
  puede leer un `SKILL.md` sin sus `references/` y fallar de una forma difícil de
  diagnosticar.
- [ ] 11. Mostrar los scripts ejecutables en la salida normal
  - Detalle de implementación: cuando la skill incluye `scripts/`, la salida de
  `add` y de `update` lo dice siempre, incluso sin `--dry-run`:
  `warn: la skill incluye 1 script ejecutable: scripts/validar.mjs` y
  `warn: revisa su contenido antes de usarlo con tu agente`. Los scripts no
  declarados en el frontmatter no se instalan: se omiten y se nombran en el aviso.
  Una persona que lee `add: 6 archivos instalados` no sabe que uno de ellos se
  ejecuta, y un instalador que no lo dice está ocultando información de seguridad
  detrás de un mensaje de éxito.
- [ ] 12. Compartir la precedencia de destinos con `info` y `init`
  - Detalle de implementación: los tres comandos llaman a `destination.resolve()`
  con los mismos cuatro niveles que `info` e `init`, incluido el **7** cuando no
  hay agente detectable y no se pasó `--dir`. La resolución vive en `core/` y no
  se reimplementa por comando: cuatro reglas con veinte casos de tabla se prueban
  en microsegundos, mientras que la misma decisión metida dentro de `add.ts` con
  `mkdir` y `writeFile` obligaría a crear un árbol temporal por cada caso.
- [ ] 13. Cubrir los tres comandos con los 23 recorridos de integración
  - Detalle de implementación: instalación en directorio vacío, `add` repetido
  sin cambios, archivo modificado con y sin `--force` y con `--yes`, `--dry-run`
  con cero escrituras, `add --category`, frontmatter inválido (**5**), categoría
  que intenta escapar (**2** o **5**), payload con symlink (omitido, aviso, **0**),
  script no declarado (omitido y nombrado), `--dir` con precedencia, `add` sin
  agente (**7**), `remove` de una skill instalada, `remove` con archivos ajenos,
  `remove` de algo no instalado (**3**), `update` con versión nueva, `update` sin
  argumento, `update` sin cambios, `list` y `list --category`, `search` por los
  tres campos, `search` sin consulta (**2**), `info`, `init` con agentes y
  fallo de red simulado (**6** con cero escrituras parciales).

## Criterios de Done

- [ ] `npx fwskills add specs/crear-specs --dir <tmp>` instala todos los archivos y termina con `add: N archivos instalados en <destino>` y código 0.
- [ ] `npx fwskills add specs/crear-specs --dry-run` imprime el plan completo con una línea por archivo y **no crea ningún archivo**: el directorio queda idéntico.
- [ ] `npx fwskills add specs/crear-specs` sobre un destino con un archivo modificado y sin `--force` pregunta, y con respuesta negativa sale con **4** sin escribir nada.
- [ ] Con `--force` sobrescribe sin preguntar; con `--yes` acepta sin preguntar; con `--dry-run --force` muestra el plan y no escribe.
- [ ] `npx fwskills add --category security` instala todas las skills de la categoría en orden alfabético de slug, y si una falla no deja ninguna instalada a medias.
- [ ] `npx fwskills add` sin argumento y sin `--category` sale con **2**: instalar "todo" por accidente es exactamente el error que este CLI evita.
- [ ] Una referencia con `..`, mayúsculas, espacios interiores o más de un `/` sale con **2** y el mensaje indica el formato esperado.
- [ ] Un `SKILL.md` descargado que no valida los 8 campos sale con **5**, y el mensaje nombra el campo que falla.
- [ ] Un fallo de red o un tarball corrupto sale con **6** y deja cero archivos escritos en el destino.
- [ ] `npx fwskills remove specs/crear-specs --yes` borra la carpeta y sale con **0**; con archivos ajenos dentro, los conserva, lo dice en `stderr` y sale con **0**.
- [ ] `npx fwskills update` actualiza solo las skills que tienen versión nueva, escribe `update: <ref> <vieja> -> <nueva>` por línea y deja `.fwskills.json` al día.
- [ ] `npx fwskills update` sobre una skill no instalada por el CLI no hace nada con ella y lo dice.
- [ ] Cuando la skill incluye scripts, la salida normal de `add` y `update` los nombra, y los scripts no declarados en el frontmatter no se instalan.
- [ ] Ninguna escritura ocurre fuera de `<destino>/<categoria>/<slug>/`, verificado con la prueba de contención de rutas y con la de symlink que apunta fuera.
- [ ] `grep -rn "process.exit" packages/cli/src/commands` no devuelve coincidencias, y `npm run verify -w fwskills` termina con 0.
