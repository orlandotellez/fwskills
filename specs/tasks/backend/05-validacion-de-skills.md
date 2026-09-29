# Validación de skills

## Estado Actual

Proyecto nuevo en esta área: no existe `src/core/frontmatter.ts`, ni
`src/core/paths.ts`, ni script de validación. El repositorio tampoco tiene
`skills/`, así que todavía no hay ningún `SKILL.md` que validar. El sitio ya tiene
la regla de los 8 campos en su especificación —el esquema Zod de la colección
`skills` en `specs/modules/frontend/03-architecture.md`—, pero esa regla todavía
no está implementada en ningún lado, y `npm run validate` no existe como comando.
`frontend/package.json` declara únicamente `dev`, `build`, `preview` y `astro`.

## Objetivo

Dos capas independientes de validación del mismo contrato de 8 campos: una que
protege a quien instala —el CLI valida antes de escribir y no escribe nada
inválido ni fuera de su destino— y otra que permite a quien contribuye validar en
local, antes de abrir el pull request.

## Alcance

- `src/core/frontmatter.ts`: parseo y validación estricta de los 8 campos.
- `src/core/paths.ts`: `assertInside()` y las reglas de contención de rutas.
- Defensa de symlinks con `lstat` y `realpath`.
- La salida **5** con un mensaje que nombre el campo que falla.
- `npm run validate` en la raíz del monorepo, ejecutable sobre `skills/**/SKILL.md`.
- Las reglas adicionales de la validación local: coincidencia entre `category` y
  carpeta, semver en `version`, slug en minúsculas sin acentos, ausencia de
  secretos y formato de `author`.
- Casos maliciosos de prueba: traversal, ruta absoluta y symlink que escapa.

## Fuera de alcance

- La invocación de la validación desde `add` y `update`, que ya se describe en
  [`03-comando-add.md`](./03-comando-add.md). Aquí se implementa la función que
  esos comandos llaman.
- El esquema Zod de la colección de contenido del sitio, que valida la misma
  regla de forma independiente: vive en
  [`../frontend/03-colecciones-de-contenido.md`](../frontend/03-colecciones-de-contenido.md).
  La duplicación es deliberada: el CLI se ejecuta en la máquina de otra persona,
  lejos de este repositorio y sin posibilidad de que el build de Astro haya actuado.
- La política de scripts ejecutables dentro de una skill, que es una regla de
  revisión del proyecto y no una validación de esquema: se declara en
  `/contribuir`.
- Cualquier escritura en disco durante la validación. `npm run validate` es de
  solo lectura.
- La generación del índice de búsqueda, que es un artefacto de build y no una
  validación.
- El módulo `db/`, que no existe (ADR-02). La validación de frontmatter sustituye
  a las restricciones de base de datos: no hay esquema que se pueda dejar
  desincronizado, porque el único lugar donde puede existir una skill inválida es
  el sistema de archivos, y ese lugar se comprueba.

## Tareas

- [ ] 1. Implementar `src/core/frontmatter.ts` con los 8 campos y sin valores por defecto
  - Detalle de implementación: `parse(raw, source)` separa el bloque delimitado por
  `---` del cuerpo y valida `name` como string no vacío, `description` como string
  no vacío, `category` como string que sea un segmento de ruta válido, `version`
  como string con formato semver, `author` como string o lista de strings, `tags` y
  `compatibility` como listas de strings, y `featured` como **booleano estricto**.
  No hay valores por defecto: un campo ausente es un fallo, no una invitación a
  inventar. La razón es que el mismo frontmatter alimenta el sitio y el CLI, y un
  valor inventado produce una ficha de skill que miente.
- [ ] 2. Rechazar los tipos permisivos con un mensaje que nombre el campo
  - Detalle de implementación: `featured: "true"`, `featured: 1` y `featured: "sí"`
  se rechazan; `tags: "uno, dos"` se rechaza; `author: 42` se rechaza; y
  `version: "1.0"` se rechaza por no ser semver. Cada fallo produce código **5** y
  un mensaje con la forma
  `error: skills/qa/junit-reportes/SKILL.md: campo "featured" debe ser un booleano
  estricto, recibido "sí"`, que nombre el archivo, el campo, lo esperado y lo
  recibido. Quien lee el mensaje no necesita abrir el código para entender qué
  corregir.
- [ ] 3. Validar que `category` sea un segmento de ruta válido
  - Detalle de implementación: `category: specs/../otro` y
  `category: con espacio` se rechazan con **5**, antes de que la ruta se use. La
  comprobación comparte la misma expresión regular de segmento que
  `reference.parse()`: `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Reutilizar la función en lugar
  de duplicar el patrón evita que las dos validaciones se separen con el tiempo.
- [ ] 4. Validar antes de escribir y también en `update`
  - Detalle de implementación: el `SKILL.md` descargado se valida **antes** de
  escribir el primer archivo, y también durante `update` sobre la versión recién
  descargada, para que una versión publicada que rompe el contrato no corrompa una
  instalación existente. Un fallo de validación en cualquiera de los dos casos
  produce **5** y cero escrituras: es un fallo de contenido, no de red, y se
  distingue de **6** a propósito.
- [ ] 5. Implementar `src/core/paths.ts` con `assertInside()` como función pura
  - Detalle de implementación: `assertInside(root, candidate)` resuelve ambas rutas
  con `path.resolve()` y exige que `candidate` empiece por `root + path.sep`. El
  `+ path.sep` no es un detalle: `"/a/b".startsWith("/a/bc")` es `true`, y sin el
  separador un hermano del destino con prefijo de texto compartido pasaría la
  comprobación. La función no importa `node:fs` y por eso se prueba con una tabla
  de casos sin disco: es el control de seguridad con más casos de prueba del
  módulo.
- [ ] 6. Aplicar `assertInside` sobre cada ruta, no solo sobre la carpeta
  - Detalle de implementación: la comprobación se aplica a `<root>/<categoria>`,
  a `<root>/<categoria>/<slug>` y a **cada archivo** del payload —`SKILL.md` y
  todo lo que haya en `references/`, `scripts/` y `assets/`—, con las rutas ya
  resueltas. Un payload con un nombre de archivo absoluto se rechaza antes de
  escribir. Todas las escrituras del CLI pasan por
  `FileSystemPort.writeTextFile`, así que revisar que ninguna ruta escapa del destino
  es revisar un único punto.
- [ ] 7. Cubrir la contención con los seis casos de la tabla
  - Detalle de implementación: `<root>/specs/crear-specs` se acepta;
  `<root>/../otro` se rechaza; `<root>/specs/../../etc` se rechaza; `<root2>/otro`
  con `<root2>` hermano que comparte prefijo de texto se rechaza; `<root>/specs/x/`
  con barra final se acepta tras normalizar; y una ruta absoluta como nombre de
  archivo del payload se rechaza. Cada caso es una aserción independiente, para
  que un fallo indique cuál de las reglas se rompió.
- [ ] 8. Cerrar el hueco de los enlaces simbólicos con `lstat` y `realpath`
  - Detalle de implementación: si el destino existe y es un symlink, `lstat` lo
  detecta, el CLI no escribe a través y falla con **4**. Si el padre del destino es
  un symlink, se resuelve con `realpath` y se vuelve a aplicar `assertInside`
  contra la raíz ya resuelta. Si el payload trae entradas que son symlinks, no se
  instalan: se omiten con aviso en `stderr` y se registran en la salida de `add`.
  `assertInside` sobre la ruta sin resolver no basta, porque un symlink en el
  camino hace que la ruta escrita termine en otro sitio.
- [ ] 9. Crear `npm run validate` en la raíz del monorepo
  - Detalle de implementación: el script del `package.json` raíz recorre
  `skills/**/SKILL.md` y aplica la **misma** regla de 8 campos que usa la colección
  del sitio, importando la implementación del CLI para que no haya dos reglas que
  se separen. Imprime una línea por skill válida, una línea `error:` por archivo
  inválido con su ruta y su campo, y termina con 0 si todas valen o con 1 en
  caso contrario. Es el paso 4 de la línea de tiempo de `/contribuir`.
- [ ] 10. Añadir a `npm run validate` las reglas que solo aplican en local
  - Detalle de implementación: `category` debe coincidir con la subcarpeta que
  contiene el archivo —una skill que dice `qa` y vive en `design/` se rechaza—;
  `version` debe ser semver; el nombre de la carpeta debe estar en minúsculas, con
  guiones y sin acentos; `author` debe tener formato de usuario o URL de perfil,
  para que el perfil de GitHub sea resoluble; y se buscan patrones de token o
  clave privada en el archivo. La detección de secretos usa una lista de
  excepciones versionada, porque un ejemplo de documentación que contiene una
  cadena con forma de clave no debe bloquear una contribución legítima.
- [ ] 11. Excluir los `SKILL.md` del formateo automático
  - Detalle de implementación: `.prettierignore` excluye `skills/**/*.md` y el
  `package.json` del CLI declara `proseWrap: preserve`. El frontmatter se valida,
  pero el cuerpo no se reformatea: el texto de una skill es documentación para
  agentes y para personas, y un formateo que reescribe el texto de otra persona
  genera ruido en el diff de la revisión.
- [ ] 12. Crear los fixtures maliciosos de la suite de pruebas
  - Detalle de implementación: `test/fixtures/` incluye `invalid-frontmatter/`
  con un campo ausente y otro con `featured: "sí"`; y
  `escaping-frontmatter/` con un `category: ../../etc`. Un tercer fixture,
  `payload-with-symlink/`, contiene un árbol con un enlace que apunta fuera del
  destino. Los tres existen para que la defensa tenga un caso que la ejercite.
- [ ] 13. Cubrir `frontmatter.ts` y `paths.ts` con pruebas de unidad y de integración
  - Detalle de implementación: al menos 30 casos para `frontmatter.ts` y 20 para
  `paths.ts`, todos sin disco ni red. En integración, `add` con frontmatter
  inválido termina con **5** y cero escrituras; `add` con una categoría que intenta
  escapar termina con **2** o **5** según la fase, con cero escrituras; y `add`
  con un payload que trae un symlink no lo instala, avisa por `stderr` y sale con
  **0**.

## Criterios de Done

- [ ] `npm run validate` recorre `skills/**/SKILL.md`, imprime una línea por skill válida y sale con 0; con un archivo inválido, imprime `error:` con la ruta y el campo, y sale con 1.
- [ ] Una `SKILL.md` a la que le falta cualquiera de los 8 campos es rechazada, y el mensaje nombra el campo ausente.
- [ ] `featured: "true"`, `featured: 1` y `featured: "sí"` son rechazados; `tags` como string suelto es rechazado; `version: "1.0"` es rechazado.
- [ ] `category: ../../etc` y `category: con espacio` son rechazados antes de usarse como parte de una ruta.
- [ ] `npm run validate` rechaza una skill cuyo campo `category` no coincide con la subcarpeta que la contiene.
- [ ] `add` con un `SKILL.md` descargado que no valida sale con **5** y no escribe ningún archivo; `update` sobre una versión inválida también.
- [ ] `assertInside` rechaza `<root>/../otro`, `<root>/specs/../../etc` y un directorio hermano con prefijo de texto compartido como `/a/bc` para una raíz `/a/b`.
- [ ] Un payload con un nombre de archivo absoluto se rechaza antes de escribir.
- [ ] Un symlink en el destino produce **4** y ninguna escritura; un symlink en el payload no se instala y se nombra en el aviso de `stderr`.
- [ ] Ninguna escritura del CLI cae fuera de `<destino>/<categoria>/<slug>/`, verificado con los fixtures maliciosos.
- [ ] El validador no deja ningún campo sin comprobar: una rama de validación sin caso de prueba asociado se considera sin terminar.
- [ ] `npm run verify` en la raíz encadena `check`, `validate`, `lint`, `format:check` y `test`, y termina con 0 sobre un árbol válido.
- [ ] La validación del sitio y la del CLI aplican la misma regla de 8 campos: una diferencia entre ellas es un defecto, no una decisión de implementación.
