# Gobernanza de fwskills

fwskills no tiene comité, ni registro, ni lista de acceso. Los roles se
reconocen **por lo que la persona ha hecho**, no por quién la nominate.

Este documento explica los tres roles, cómo se decide y quién mantiene qué.
El detalle operativo de cómo se aporta una skill está en
[CONTRIBUTING.md](CONTRIBUTING.md).

---

## Tres roles

Sin jerarquía oculta entre ellos.

### Contribuyente

**Cualquiera.** Propone skills, propone categorías, escribe documentación y
reporta problemas.

| | |
|---|---|
| **Puede** | Abrir issues y pull requests desde un fork. |
| **No puede** | Fusionar sus propios cambios: siempre alguien más los revisa. |

### Revisor

Alguien que ya ha aportado varias skills y conoce el criterio del proyecto.

| | |
|---|---|
| **Puede** | Revisar pull requests, comentar, aprobar o pedir cambios. |
| **No puede** | Fusionar su propio pull request, ni aprobar uno en el que sea el único autor. |

Se reconoce por haber publicado revisiones de calidad, no por antigüedad
ni por número de contribuciones.

### Mantenedor

Alguien con acceso de escritura al repositorio.

| | |
|---|---|
| **Puede** | Fusionar pull requests aprobados, publicar releases, gestionar etiquetas y revisar los avisos de seguridad. |
| **No puede** | Cerrar la discusión de un issue de gobernanza sin explicar por qué. |

---

## Cómo se decide

**Todo cambio entra por pull request y necesita al menos una aprobación
antes de fusionarse.**

Las decisiones que afectan a todo el catálogo —una categoría nueva, un
cambio de criterio, una skill de la categoría `security`— **se discuten en
una issue antes** de escribir el pull request, para no gastar la revisión de
nadie con una decisión ya tomada.

| Tipo de decisión | Dónde se decide | Qué hace falta |
|---|---|---|
| Corregir un typo, mejorar una descripción | Pull request | Una aprobación |
| Añadir una skill a una categoría existente | Pull request | Una aprobación |
| Añadir scripts a una skill | Pull request | Revisión obligatoria del script, sin excepción |
| Skill de la categoría `security` | Issue primero, luego pull request | Una aprobación + lectura del contenido |
| Categoría nueva | Issue primero, luego pull request | Tres skills reutilizables + descripción clara |
| Cambiar el criterio de calidad | Issue primero | Consenso de quienes han revisado |
| Cambiar la licencia | Issue primero | Consenso de mantenedores |

Una decisión que alguien no quiere y se decide igual se escribe en
[07-decisiones.md](specs/docs/07-decisiones.md) con su contexto, sus
alternativas y sus consecuencias. Queda registrada aunque la decisión haya
sido discutida.

---

## Cómo se acredita

Tu nombre va en el campo `author` del frontmatter. Tu trabajo queda en el
historial del repositorio, y la lista de contribuyentes del sitio sale de
ese historial.

**No hay perfil que mantener ni créditos que reclamar.** Si algo no está en
el historial, no pasó.

Los tres roles se reconocen por el historial, no por un documento que
alguien actualiza a mano.

---

## Mantenimiento

Quién mantiene qué, y con qué criterio.

| Superficie | Responsable | Nota |
|---|---|---|
| `skills/**` | Contribuyentes | Una carpeta y un pull request. |
| Sistema de diseño | Mantenedores | Cambios que tocan `tokens.css` requieren una aprobación extra. |
| Catálogo y generación | Mantenedores | Una skill rota rompe el build a propósito. |
| Documentación | Contribuyentes | Mismo flujo que una skill. |
| CLI (`packages/cli`) | Mantenedores | Release y versionado SemVer. |
| Avisos de seguridad | Mantenedores | Ver más abajo. |

Un mantenedor que lleva meses sin contribuir sigue siendo mantenedor. El rol
es una responsabilidad, no un premio.

---

## Seguridad

### Reportar una skill maliciosa o vulnerable

Si una skill instalada hace algo que no debería —envía datos a un tercero,
ejecuta un script que no declara, copia rutas fuera del proyecto—, **no
abras un issue público**.

Repórtalo por el canal privado: [avisos de seguridad][advisory].

Incluye la referencia de la skill, qué hace y cómo se reproduce. Recibirás
acuse de recibo. La discusión ocurre en privado hasta que haya una
corrección, y el aviso aparece en las notas de la versión que lo corrige.

**La skill se retira del catálogo si el problema es del contenido y no de
una versión concreta.** Un error de configuración se corrige en una versión;
una skill que manda datos a un tercero se retira.

[advisory]: https://github.com/orlandotellez/fwskills/security/advisories/new

### Scripts ejecutables dentro de una skill

Una skill puede incluir una carpeta `scripts/`. Es legítimo. La política tiene
**cuatro reglas, y no son negociables**:

1. **Todo script se declara en el frontmatter.** Un script sin declarar **no
   se instala**.
2. **Todo script exige revisión obligatoria antes de fusionar.** No es una
   revisión más: es un punto de bloqueo. Quien lo revise tiene que leerlo.
3. **Una skill de `security` no incluye scripts.** Una skill que audita no
   ejecuta nada por su cuenta.
4. **El aviso es visible al instalar.** `add` y `update` muestran qué
   scripts se instalan, siempre, incluso con `--dry-run`.

`npx fwskills add` **copia** los scripts al disco: no los ejecuta. El punto
de control es el pull request, no la instalación. Por eso un script sin
declarar es un defecto, no un detalle de estilo.

---

## Cambiar esta guía

`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` y `GOVERNANCE.md` se cambian como
cualquier otro contenido: issue, discusión, pull request, una aprobación. No
hay un proceso aparte ni más requisitos para modificarlas.

Si una parte de la gobernanza no se sostiene en la práctica, cambiar la guía
es la forma correcta de resolverlo. Una guía que describe un proyecto que ya
no existe es peor que no tenerla.

---

## Compatibilidad con el código de conducta

Las consecuencias por conducta van en [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md),
con su propia escala y su propio proceso de apelación. Este documento no las
repite a propósito: mezclarlas haría más difícil saber cuál aplica.
