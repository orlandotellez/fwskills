# Empaquetado y publicación

## Estado Actual

Proyecto nuevo en esta área: no existe `dist/`, ni paso de empaquetado, ni
publicación. `cli/package.json` se crea en
[`01-andamiaje-del-cli.md`](./01-andamiaje-del-cli.md) con el `bin` declarado, pero
ese `bin` apunta a `./dist/index.js`, un archivo que todavía no se genera. En el
repositorio no hay `.npmrc`, ni workflow de publicación, ni etiqueta de versión, ni
`CHANGELOG`. El paquete público `fwskills` no existe en el registro de npm.

## Objetivo

Un paquete `fwskills` publicable en npm que `npx fwskills` resuelve y ejecuta sin
toolchain en la máquina de quien lo instala, con un tarball mínimo, un `bin`
verificado y un proceso de publicación con su lista de comprobación.

## Alcance

- Paso de `build` que emite `dist/index.js` como archivo único ESM con su `shebang`.
- Los campos `files`, `exports`, `bin` y `engines` del `package.json`.
- `npm pack --dry-run` como verificación previa a cada publicación.
- Publicación en el registro público de npm, sin autenticación de lectura.
- Versionado del paquete y su relación con las versiones de las skills.
- Lista de comprobación de publicación y registro de la release.
- Etiquetas de git con la versión y su correspondencia con el changelog.
- Documentación de la experiencia de `npx`: qué ve quien lo ejecuta por primera
  vez.

## Fuera de alcance

- El código de los siete comandos, que debe existir antes de empaquetar: viven en
  [`02-comandos-de-consulta.md`](./02-comandos-de-consulta.md) y
  [`03-comando-add.md`](./03-comando-add.md).
- La validación del contenido instalado, en
  [`05-validacion-de-skills.md`](./05-validacion-de-skills.md).
- El transporte del payload desde el registro: la implementación por defecto de
  `SkillRegistryPort` vive en el paquete, y su comportamiento —incluida la
  ausencia de autenticación— está especificado en
  `specs/modules/backend/07-integraciones.md`.
- Cualquier registry alternativo. El catálogo sale del registro de npm por diseño;
  un registro alternativo sería un comando nuevo, no una variable de entorno.
- La versión del sitio, que es interna y no se publica.
- La documentación de `/docs/cli/<comando>`, que documenta la superficie ya
  publicada: vive en
  [`../frontend/08-docs-starlight.md`](../frontend/08-docs-starlight.md) y se
  actualiza con cada cambio incompatible.

## Tareas

- [ ] 1. Configurar el paso de `build` que emite un único `dist/index.js`
  - Detalle de implementación: un empaquetador con entrada `src/index.ts`,
  formato ESM y `banner` con `#!/usr/bin/env node`, que incluye todo el código
  del CLI en un archivo. El motivo está en `01-stack.md`: Node 22 puede ejecutar
  TypeScript con *type stripping*, pero no empaqueta, y `npx` descarga el tarball
  del paquete publicado, así que el paquete tiene que traer un `.js` ejecutable y
  no sus fuentes. El paso de build **comprueba** que `dist/index.js` existe,
  empieza por el `shebang` y queda marcado como ejecutable.
- [ ] 2. Declarar `files`, `exports` y `bin` con su contenido exacto
  - Detalle de implementación: `"files": ["dist", "README.md", "LICENSE"]` limita el
  tarball a lo que se necesita; `"exports": { ".": "./dist/index.js" }` declara el
  único punto de entrada importable; y `"bin": { "fwskills": "./dist/index.js" }`
  es lo que hace que `npx fwskills` resuelva el binario. El `.npmignore` excluye
  `src/`, `test/`, `tsconfig.json` y la configuración del runner. Un `.npmignore`
  mal hecho que incluya `src/` y `test/` aumenta el tarball sin aportar nada; uno
  que no incluya `dist/` publica un paquete que no se puede ejecutar.
- [ ] 3. Verificar el tarball con `npm pack --dry-run` antes de cada publicación
  - Detalle de implementación: el comando lista exactamente los archivos que
  entrarían en el paquete. La revisión comprueba que aparecen `dist/index.js`,
  `package.json`, `README.md` y `LICENSE`, y que **no** aparecen `src/`, `test/`,
  `tsconfig.json`, `vitest.config.ts` ni ningún archivo de `.env`. El resultado se
  revisa a mano, no se automatiza con un umbral: el contenido del tarball es una
  decisión, no una métrica.
- [ ] 4. Comprobar que el binario funciona como proceso externo
  - Detalle de implementación: `npm run test:e2e` invoca `dist/index.js` como
  proceso hijo en un directorio temporal limpio, con un `HOME` temporal para que
  la detección de agente global no toque la máquina de quien ejecuta la prueba. Las
  diez aserciones del smoke test cubren `--help` con los 7 comandos, `--version`,
  `list`, `add --dry-run` con cero archivos creados, comando inexistente (**2**),
  skill inexistente (**3**), `search` sin argumento (**2**), categoría inexistente
  (**3**), `--help` y `--version` en cualquier posición, y flag desconocido (**2**).
  Si el build no existe, el E2E **falla** con un mensaje claro en lugar de
  saltarse: un E2E que se salta nunca ha protegido de nada.
- [ ] 5. Implementar `SkillRegistryPort` contra el registro público de npm
  - Detalle de implementación: `resolve(ref)` y `list(category)` consultan el
  registro público, y `fetchFiles(ref)` descarga **un tarball por skill**, no el
  paquete entero. La autenticación es **ninguna**: los paquetes públicos se
  resuelven y descargan de forma anónima. La versión de una skill es suya y no
  tiene por qué coincidir con la versión del paquete npm, así que se usa como
  referencia de contenido y no como versión de npm. La caché del usuario evita
  volver a descargar el mismo payload.
- [ ] 6. Garantizar que el CLI no ejecuta nada de lo que descarga
  - Detalle de implementación: el paquete no declara ningún `postinstall`, no usa
  `eval`, no usa `import()` dinámico del payload y no invoca scripts del sistema.
  Copia archivos y nada más. Una skill puede incluir `scripts/`, y esos scripts los
  ejecutará el agente de la persona cuando ella lo decida, no el instalador: el
  punto de control es el pull request que aprobó la skill, no la instalación.
- [ ] 7. Establecer la política de versionado del paquete
  - Detalle de implementación: semver. Un cambio incompatible de la superficie —un
  comando que desaparece, un flag que cambia de significado, un código de salida
  que se reasigna— es versión mayor, porque `fwskills --help` y los campos `bin` y
  `exports` son el contrato legible por máquinas del proyecto (ADR-03). Un comando
  nuevo o un flag nuevo es versión menor. Una corrección de mensaje o de una ruta
  es parche. El `CHANGELOG.md` del sitio, en `/docs/changelog`, sigue la misma
  numeración.
- [ ] 8. Vincular la versión del paquete con las versiones de las skills
  - Detalle de implementación: cada skill lleva su propia `version` en el
  frontmatter, y es la que se muestra en su ficha y la que `update` compara. La
  versión del paquete npm es la del CLI, y las dos se mueven de forma
  independiente: publicar un CLI nuevo no obliga a reversionar ninguna skill, y
  reversionar una skill no obliga a publicar un CLI. El paquete declara su versión
  en `package.json` y esa es la que imprime `fwskills --version`.
- [ ] 9. Escribir la lista de comprobación de publicación
  - Detalle de implementación: la lista es, en orden, `npm run check`,
  `npm run test`, `npm run test:e2e` (que construye primero), `npm run lint`,
  `npm run format:check`, `npm run smoke`, `npm pack --dry-run` revisado a mano, y
  `npm publish --access public`. Cada paso tiene su comando; una lista sin
  comandos es una intención. Se añade la comprobación de que la versión de
  `package.json` coincide con la etiqueta de git y con la entrada del changelog.
- [ ] 10. Publicar en el registro público de npm
  - Detalle de implementación: `npm publish --access public` desde `cli/`,
  con un token de publicación de alcance mínimo y dos factores activos en la
  cuenta. El paquete es público y se resuelve sin credenciales para quien lo
  instala. El token de publicación **no** se versiona ni aparece en
  `cli/.env`; vive en la configuración de npm del entorno de
  publicación, y ningún archivo del repositorio lo referencia por su valor.
- [ ] 11. Verificar la experiencia de `npx` desde una cuenta limpia
  - Detalle de implementación: en un directorio temporal, con una caché de npm
  vacía, `npx fwskills --help` descarga el paquete, imprime los 7 comandos y sale
  con 0 sin instalar nada en el proyecto. `npx fwskills add specs/crear-specs
  --dry-run` resuelve la referencia y muestra el plan sin escribir. La
  verificación se hace con la caché vacía porque es la única forma de detectar un
  paquete publicado sin `dist/index.js`: se instala sin error y falla al invocarse,
  que es el fallo más caro del módulo y el más fácil de no detectar.
- [ ] 12. Etiquetar la release y publicar el changelog
  - Detalle de implementación: la etiqueta de git es `v<major>.<minor>.<patch>` y
  apunta al commit con el changelog actualizado. La entrada de `/docs/changelog`
  describe los comandos nuevos, los flags nuevos, los códigos de salida nuevos y
  cualquier cambio incompatible, en el mismo idioma que el resto de la
  documentación. Una tag sin entrada de changelog es una release que nadie puede
  entender.
- [ ] 13. Actualizar la documentación de `/docs/cli` cuando cambie la superficie
  - Detalle de implementación: cada cambio incompatible actualiza a la vez
  `specs/modules/backend/03-api.md`, las siete páginas `/docs/cli/<comando>`, la
  sección 4 y la sección 6 de `/instalacion`, y el `README.md` del paquete. Las
  cuatro superficies enumeran la misma lista, y una discrepancia entre ellas es un
  defecto: la ayuda del CLI, la referencia del sitio y el manual del paquete son la
  misma tabla en tres sitios.

## Criterios de Done

- [ ] `npm run build -w fwskills` produce `dist/index.js`, el archivo empieza por `#!/usr/bin/env node` y está marcado como ejecutable.
- [ ] `npm pack --dry-run` en `cli/` muestra `dist/index.js`, `package.json`, `README.md` y `LICENSE`, y no muestra `src/`, `test/`, `tsconfig.json` ni ningún `.env`.
- [ ] `node dist/index.js --help` funciona desde el tarball extraído, con una instalación limpia y sin toolchain en la máquina.
- [ ] `npx fwskills --help` con la caché de npm vacía descarga el paquete, imprime los 7 comandos y sale con 0.
- [ ] El paquete publicado no declara ningún `postinstall` y el código no contiene `eval` ni `import()` dinámico del payload.
- [ ] `npm run test:e2e -w fwskills` pasa las diez aserciones del smoke test y falla —no se salta— si el build no existe.
- [ ] `SkillRegistryPort` resuelve y descarga contra el registro público de npm sin ninguna credencial, y descarga un tarball por skill.
- [ ] Un fallo de resolución devuelve **3** y un fallo de descarga devuelve **6**, y en ninguno de los dos casos se escribe ningún archivo.
- [ ] La versión de una skill en el frontmatter es independiente de la versión del paquete npm, y `update` compara contra la versión de la skill.
- [ ] `fwskills --version`, la etiqueta de git y la entrada del changelog declaran la misma versión.
- [ ] La lista de comprobación de publicación contiene un comando por paso y se ejecuta completa antes de cada `npm publish`.
- [ ] El token de publicación no aparece en ningún archivo versionado: `grep -rn 'npm_[A-Za-z0-9]\{30\}' .` no devuelve coincidencias.
- [ ] `fwskills --help`, `/docs/cli/*`, la sección 4 y la sección 6 de `/instalacion` y el `README.md` del paquete enumeran los mismos 7 comandos y los mismos 6 flags.
- [ ] `npm run verify -w fwskills` termina con 0 y `npm run check -w @fwskills/site` también, de modo que sitio y CLI se verifican juntos desde la raíz.
