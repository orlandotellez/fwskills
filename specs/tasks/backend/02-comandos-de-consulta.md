# Comandos de consulta

## Estado Actual

Proyecto nuevo en esta área: no hay una línea de código del CLI escrita. Los
comandos `init`, `list`, `search` e `info` están especificados en
`specs/modules/backend/03-api.md` con su sintaxis, sus opciones, su salida
esperada y sus códigos de salida, pero no existe implementación. El andamiaje que
necesitan —paquete, parser de argv, registro de comandos, códigos de salida y
logger— sí está resuelto en
[`01-andamiaje-del-cli.md`](./01-andamiaje-del-cli.md) y es su prerrequisito.

## Objetivo

Los cuatro comandos de solo lectura que permiten saber qué hay disponible, dónde
se instalaría cada skill y qué falta por instalar, con stdout limpio y códigos de
salida que significan algo.

## Alcance

- `src/commands/init.ts`: crea las carpetas de destino de los agentes detectados.
- `src/commands/list.ts`: lista el catálogo, con filtro por `--category`.
- `src/commands/search.ts`: busca por nombre, descripción y tags.
- `src/commands/info.ts`: muestra la metadata resuelta y la ruta de destino.
- `src/core/catalog.ts` con las consultas sobre el índice de skills.
- `src/core/agents.ts` y `src/core/destination.ts`, en la parte que estos comandos
  necesitan para resolver e imprimir un destino.
- Salida por `stdout` y mensajes por `stderr`, con los prefijos del logger.
- Códigos de salida 0, 2, 3, 6 y 7 en las situaciones de estos cuatro comandos.

## Fuera de alcance

- `add`, `remove` y `update`, que escriben en disco:
  [`03-comando-add.md`](./03-comando-add.md).
- La precedencia completa de destinos y la tabla de agentes:
  [`04-deteccion-de-agentes.md`](./04-deteccion-de-agentes.md). Aquí se usa la
  resolución para **imprimirla**, no para escribir.
- La validación del frontmatter del `SKILL.md` descargado, que solo importa a los
  comandos que instalan: [`05-validacion-de-skills.md`](./05-validacion-de-skills.md).
- El empaquetado, la publicación y el `npx`: vive en
  [`06-empaquetado-y-publicacion.md`](./06-empaquetado-y-publicacion.md).
- Cualquier modo JSON de salida. La superficie pública son texto plano y códigos
  de salida; un contrato de datos estruturados sería una octava superficie que
  mantener y no está en la especificación.
- La caché en disco de los payloads descargados, que solo importa a `add` y
  `update`.

## Tareas

- [ ] 1. Implementar `src/core/catalog.ts` sobre el puerto de registro
  - Detalle de implementación: funciones puras que consultan un `SkillMeta[]` ya
  resuelto: `listAll()`, `listByCategory(categoria)` y
  `search(query, skills)`. La búsqueda normaliza la consulta y los campos con
  minúsculas y sin acentos, y coincide por subcadena sobre `name`,
  `description` y `tags`. La fuente de datos es el puerto
  `SkillRegistryPort.list()`, de modo que con un puerto de fixtures estas funciones
  se prueban sin red.
- [ ] 2. Implementar `init` con los cuatro códigos de salida que le tocan
  - Detalle de implementación: `npx fwskills init [--dir <ruta>] [--global] [--yes]
  [--dry-run]` resuelve los agentes detectados en el proyecto, imprime
  `info: agentes detectados: opencode, pi`, una línea `info: creando <ruta>` por
  carpeta, y termina con `init: 2 carpetas de destino preparadas` por stdout. Con
  `--dry-run` imprime solo `dry-run: se habrían creado 2 carpetas de destino` y no
  crea nada. Con `--dir` informa `init: 1 carpeta de destino preparada en
  <ruta>`. Una carpeta que ya existe no es un error: sale con 0 y el mensaje lo
  indica. Sin agente detectable y sin `--dir`, sale con **7** y el mensaje que
  remite a `--dir`.
- [ ] 3. Implementar `list` con su salida tabular y su filtro por categoría
  - Detalle de implementación: `npx fwskills list [--category <categoría>]` imprime
  una línea por skill con la referencia `<categoria>/<slug>` alineada, su versión
  y su categoría, y cierra con `list: 4 skills en 4 categorías` —o `list: 1
  skill` cuando el filtro reduce el resultado a una sola entrada, con el plural
  correcto. Con `--category` inexistente sale con **3**; si el puerto de registro
  falla, sale con **6**. `stdout` contiene solo las filas y la línea de resumen;
  los `info` van a `stderr`, de modo que `npx fwskills list | awk '{print $1}'`
  devuelve solo referencias.
- [ ] 4. Implementar `search` con normalización y su error de uso
  - Detalle de implementación: `npx fwskills search <consulta>` imprime las
  coincidencias con el mismo formato de `list` y cierra con `search: 3 resultados
  para "testing"`. Sin coincidencias imprime `search: 0 resultados para
  "blockchain"` y **sale con 0**: cero resultados es una respuesta válida, no un
  fallo. Sin argumento es un error de uso y sale con **2**. Los flags globales
  `--yes` y `--dry-run` se aceptan y no alteran el resultado.
- [ ] 5. Implementar `info` como el comando seguro de comprobación
  - Detalle de implementación: `npx fwskills info <categoria>/<slug> [--dir <ruta>]
  [--global]` imprime la referencia, las líneas de `version`, `category`,
  `author`, `compatibility`, `tags` y `featured`, la lista de `files` que componen
  la skill, la ruta de `destino` que se usaría y si está `instalado`. No escribe
  nada en disco en ninguna circunstancia: `--dir` y `--global` solo afectan al
  cálculo de la ruta que se imprime. Con una skill inexistente sale con **3**;
  si el registro no responde, con **6**. Es el comando que aparece en la sección 7
  de `/instalacion`, y por eso debe ser legible sin instalar nada.
- [ ] 6. Comprobar que `--help` y `--version` funcionan antes y después del comando
  - Detalle de implementación: `fwskills --help list`, `fwskills list --help` y
  `fwskills list -v` se comportan igual y salen con 0. La ayuda de un comando lista
  solo los flags que le aplican: `list` no muestra `--force`, y `add` sí.
- [ ] 7. Aplicar la normalización de la referencia antes de resolver
  - Detalle de implementación: los cuatro comandos pasan su argumento por
  `reference.parse()` antes de llamar al puerto, con la misma regla de las 25
  tablas de casos de `05-testing.md`: recorte de espacios, `\` normalizado a `/`,
  y rechazo —sin corregir en silencio— de mayúsculas, espacios interiores,
  segmentos vacíos, más de un `/` y cualquier `..`. Una referencia inválida es un
  error de uso con código **2**, y el mensaje dice qué formato se espera.
- [ ] 8. Asegurar que ningún comando de consulta pide confirmación
  - Detalle de implementación: `init` es el único de los cuatro que puede escribir,
  y solo crea carpetas vacías de destino, nunca sobrescribe un archivo. Ninguno
  llama a `ConfirmPort.ask()`. `init` acepta `--yes` por simetría con el resto de
  la superficie, pero no lo usa: no hay nada que confirmar cuando la carpeta está
  vacía. Declarar un flag que no hace nada es peor que no declararlo, así que
  `--yes` en `init` queda documentado como aceptado y sin efecto, o se elimina
  de su lista de flags; en cualquier caso, la ayuda y
  `specs/modules/backend/03-api.md` coinciden.
- [ ] 9. Cubrir los cuatro comandos con pruebas de integración
  - Detalle de implementación: casos para `list` sin filtro y con filtro, `list
  --category` de una categoría existente y de una inexistente (**3**), `search`
  por nombre, por descripción y por tag, con acentos y mayúsculas, `search` sin
  argumento (**2**), `search` sin resultados (**0**), `info` de una skill
  existente y de una inexistente (**3**), `info` con `--dir` que imprime la ruta
  sin escribir, e `init` con agentes presentes, con `--dir`, con `--dry-run` y sin
  agentes (**7**). El puerto de registro se reemplaza por fixtures: ninguna
  prueba hace red.
- [ ] 10. Verificar la limpieza de stdout con redirecciones reales
  - Detalle de implementación: comprobación con `1>/dev/null` y `2>/dev/null` de
  que `list` y `search` escriban su resultado solo a stdout, y de que `info` y `init`
  hacen lo mismo. La prueba usa procesos hijos, no llamadas a funciones, porque
  la propiedad que importa es el comportamiento del proceso completo.

## Criterios de Done

- [ ] `npx fwskills list` imprime una fila por skill con `<categoria>/<slug>`, versión y categoría, y cierra con el resumen de total.
- [ ] `npx fwskills list | awk '{print $1}'` devuelve únicamente referencias `<categoria>/<slug>`, sin líneas de aviso ni de progreso.
- [ ] `npx fwskills list --category security` filtra por categoría y sale con **3** si la categoría no existe.
- [ ] `npx fwskills search testing` encuentra por nombre, por descripción y por tag, ignorando mayúsculas y acentos.
- [ ] `npx fwskills search` sin argumento sale con **2**; `npx fwskills search blockchain` sin coincidencias sale con **0** y lo dice en el mensaje.
- [ ] `npx fwskills info <categoria>/<slug>` muestra versión, categoría, autor, compatibilidad, tags, featured, la lista de archivos, la ruta de destino y si está instalada, y **no escribe ningún archivo**.
- [ ] `npx fwskills init` crea las carpetas de destino de los agentes detectados y sale con **0**; con `--dry-run` no crea ninguna y lo dice.
- [ ] `npx fwskills init` sin agentes detectables y sin `--dir` sale con **7** y el mensaje remite a `init` y a `--dir`.
- [ ] Una referencia con formato inválido —mayúsculas, `..`, espacios interiores, cero o dos `/`— sale con **2** y el mensaje indica el formato esperado, sin normalizarla en silencio.
- [ ] `--help` y `--version` funcionan antes y después del nombre del comando, y la ayuda de cada comando lista solo los flags que le aplican.
- [ ] Un fallo del puerto de registro sale con **6** y un error no clasificado sale con **1**, nunca con **0**.
- [ ] `grep -rn "process.exit" cli/src` no devuelve ninguna coincidencia: el código se propaga a `process.exitCode` para que stdout se vacíe.
- [ ] Ninguno de los cuatro comandos llama a `ConfirmPort.ask()`, y `npm run verify -w fwskills` termina con 0.
