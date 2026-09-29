# 04 — Seguridad

## Modelo de amenaza

Antes de los controles, la pregunta correcta: **¿qué puede hacer un atacante
contra este CLI?**

| Superficie | ¿Hay datos que valgan? | ¿Hay algo que ejecutar? |
|---|---|---|
| El CLI lee un `SKILL.md` de un repositorio público | Sí: el contenido del frontmatter decide el nombre de la carpeta, la versión y qué archivos se escriben | La skill puede incluir `scripts/`, y esos scripts los ejecutará el agente de la persona, no el CLI |
| El CLI escribe en el disco | Sí: crea y borra archivos en la carpeta de configuración del agente | No ejecuta nada por su cuenta |
| El CLI habla con el registro de npm | Solo descarga | No ejecuta código recibido: **no** usa `eval`, ni `import()` dinámico del payload, ni hooks de instalación |
| El CLI acepta flags del usuario | No hay secretos que leer | No |

La conclusión que ordena todo el documento: **el CLI no tiene nada que
autenticar ni que autorizar, porque no hay identidades**. Su superficie de ataque
real es la entrada (una referencia `<categoría>/<slug>`), el contenido descargado y
el sistema de archivos.

---

## Autenticación

**No existe autenticación. Ninguna. Es una decisión, no una carencia.**

| Razón | Detalle |
|---|---|
| El CLI corre como el usuario local | Quien lo ejecuta **es** el usuario del sistema operativo. Ya está autenticado por el sistema |
| No hay cuentas | No hay registro, ni login, ni sesiones, ni usuarios de fwskills |
| No hay servidor | No hay nada remoto contra lo que autenticarse: `npx` descarga el paquete y el proceso termina |
| No hay datos de nadie | Ningún comando lee credenciales, tokens ni configuración sensible del usuario |

Consecuencias explícitas:

| Consecuencia | Detalle |
|---|---|
| El CLI **no** pide contraseña, token ni consentimiento de proveedor | No hay nada que pedir |
| El CLI **no** lee `GITHUB_TOKEN` | Ese token es del build del sitio. Si el CLI lo leyera, alguien que encuentra un `fwskills` malicioso podría usarlo |
| El CLI **no** accede a las variables `PUBLIC_*` de Astro | No tiene relación con el sitio |
| El CLI **no** tiene flags de token | No existe `--token`, `--api-key` ni nada equivalente |
| El paquete npm es público y no requiere autenticación para resolverse | Ver [`07-integraciones.md`](./07-integraciones.md) |

Lo que sí hay, y conviene no confundir: **el sistema operativo autentica**. Si
alguien ejecuta `npx fwskills` en una máquina ajena, tiene los permisos de esa
persona. El CLI no amplía esos permisos: escribe en la carpeta de configuración
del agente con los permisos de quien lo invocó, y si el destino no es escribible,
falla con el permiso del sistema, no con el suyo.

---

## Autorización

No existe autorización porque no hay identidades. El control real es de
**permisos de sistema de archivos**, y se delega deliberadamente en el sistema
operativo en vez de reimplementarlo.

| Situación | Comportamiento | Resultado |
|---|---|---|
| El destino es escribible por el usuario | El CLI escribe | Operación completada |
| El destino no es escribible | `node:fs` lanza `EACCES`/`EPERM` | Error con el mensaje del sistema, código **1** |
| El padre no existe | El CLI lo crea con `mkdir -p` y los permisos del proceso | Idioma del sistema |
| Un directorio padre es de solo lectura | Falla al crear | Error del sistema, código **1** |

Decisiones concretas:

| Decisión | Motivo |
|---|---|
| El CLI **no** intenta `sudo` ni pide elevación | Un instalador de skills no necesita privilegios de administrador. Pedirlos sería una señal de compromiso y una escalada innecesaria |
| El CLI **no** escribe fuera del destino resuelto | Aunque el sistema lo permita, la ruta se valida antes (§ Validación de entrada) |
| El CLI **no** cambia permisos de archivos existentes | Si un archivo tiene `600`, sigue con `600`. Reajustar permisos para que el CLI pase es un error de diseño |
| Los archivos nuevos heredan el `umask` del proceso | Comportamiento estándar, predecible y del usuario |
| El CLI no borra nada fuera de la carpeta de la skill | `remove` solo toca `<destino>/<categoría>/<slug>/` |

El último punto tiene una excepción deliberada y visible: si dentro de la carpeta
de la skill hay archivos que el CLI **no** instaló, `remove` los deja y lo dice
en stderr. Borrar el trabajo manual de alguien porque pidió desinstalar una skill
es un fallo de confianza difícil de recuperar.

---

## Validación de entrada

Cuatro controles, todos en `src/core/`, ninguno en un comando.

### 1 · Esquema del frontmatter

El `SKILL.md` que llega del registro es **contenido de terceros** hasta que se
valida. `core/frontmatter.ts` exige los 8 campos con su tipo exacto:

| Campo | Tipo exigido | Rechazo |
|---|---|---|
| `name` | string no vacío | Vacío o ausente → código **5** |
| `description` | string no vacío | Ídem |
| `category` | string que sea un segmento de ruta válido | `specs/../otro` o `con espacio` → código **5** |
| `version` | string con formato semver | `1.0` → código **5** |
| `author` | string o lista de strings | Número o objeto → código **5** |
| `tags` | array de strings | String suelto → código **5** |
| `compatibility` | array de strings | Ídem |
| `featured` | booleano estricto | `"true"` o `1` → código **5** |

Regla general: **no hay valores por defecto**. Un campo ausente es un fallo, no
una invitación a inventar. La razón es que el mismo frontmatter alimenta la web
y el CLI, y un valor invento produce una ficha de skill que miente.

La validación ocurre **antes** de escribir cualquier archivo, y también durante
`update` sobre la versión recién descargada.

### 2 · Prevención de path traversal en `<categoría>/<slug>`

La referencia que escribe una persona es el vector de entrada principal.

| Regla | Detalle |
|---|---|
| Expresión regular estricta | `^[a-z0-9]+(?:-[a-z0-9]+)*$` por segmento |
| Un solo separador | Exactamente un `/`; se rechaza cualquier referencia con más |
| `..` rechazado | Como segmento completo o como parte de uno (`a..b` no pasa la expresión regular) |
| `.` rechazado | Un segmento `.` no cumple el patrón |
| Barras invertidas normalizadas | `\` se convierte a `/` antes de validar, porque en Windows se pega una ruta |
| Sin rutas absolutas | Una referencia que empiece por `/` no cumple el patrón |
| Sin segmentos vacíos | `specs//crear` y `/specs/crear` se rechazan |
| Recorte de espacios | Se recortan en los extremos; un espacio interior no pasa el patrón |
| Longitud máxima | Cada segmento hasta 64 caracteres, y la referencia completa hasta 200 |
| Normalización previa | Todo se normaliza a minúsculas antes de validar; se rechaza cualquier mayúscula en lugar de corregirla en silencio |

Ese último punto es deliberado: si el CLI normalizara `Specs/Crear-Specs` a
`specs/crear-specs` sin avisar, alguien creyendo tener una skill distinta
obtendría la misma. Es mejor un error que dice exactamente qué formato se espera.

### 3 · Prohibición de escritura fuera del destino

Aun con una referencia válida, la ruta final se comprueba:

| Paso | Comprobación |
|---|---|
| 1 | `const root = path.resolve(destRoot)` |
| 2 | `const target = path.resolve(root, categoria, slug)` |
| 3 | `assertInside(root, target)`: `target` debe empezar por `root + path.sep` |
| 4 | Lo mismo, **archivo por archivo**, con `references/`, `scripts/` y `assets/` |
| 5 | Cada ruta de archivo que llega del payload pasa por los mismos pasos |

`assertInside` es una función pura de `core/paths.ts`, sin `fs`, y por tanto
fácil de probar con una tabla de casos. Es el control de seguridad con más casos
de prueba del módulo.

Casos que debe cubrir la tabla:

| Entrada | Resultado |
|---|---|
| `<root>/specs/crear-specs` | Aceptado |
| `<root>/../otro` | Rechazado |
| `<root>/specs/../../etc` | Rechazado |
| `<root2>/otro` con `<root2>` hermano de `<root>` que comparte prefijo de texto | **Rechazado** (de ahí el `+ path.sep`: `"/a/b".startsWith("/a/bc")` es `true` y sería un fallo) |
| `<root>/specs/crear-specs/` con barra final | Aceptado tras normalizar |
| Ruta absoluta como nombre de archivo del payload | Rechazado |

### 4 · Symlinks

Un payload que contiene un symlink puede intentar que una escritura escape del
destino.

| Comprobación | Comportamiento |
|---|---|
| El destino existe y es un symlink | `lstat` lo detecta; el CLI no escribe a través y falla con código **4** |
| El padre del destino es un symlink | Se resuelve con `realpath` y se vuelve a aplicar `assertInside` contra la raíz ya resuelta |
| El payload trae entradas que son symlinks | No se instalan: se omiten con aviso en stderr, y se registra en la salida de `add` |
| Cualquier ruta resuelta que caiga fuera de la raíz | Rechazada antes de escribir |

La combinación de `lstat` + `realpath` + `assertInside` es lo que cierra el
hueco. `assertInside` sobre la ruta **sin resolver** no basta, porque un symlink
en el camino hace que la ruta escrita termine en otro sitio.

---

## Secretos

| Entidad | Política |
|---|---|
| **El CLI** | No necesita **ninguna** variable de entorno. No lee tokens, ni claves de API, ni archivos `.env` |
| **El build del sitio** | Lee `GITHUB_TOKEN` (opcional) para la API de GitHub, y `PUBLIC_SITE_URL` y `PUBLIC_SITE_DESCRIPTION` |

Reglas que aplican a todo el proyecto:

| Regla | Detalle |
|---|---|
| Solo nombres, nunca valores | En documentación, logs, mensajes de error y commits se escribe **el nombre** de la variable, jamás su valor |
| Los `.env` no se versionan | Solo `.env.example`, que contiene únicamente los nombres y un valor de ejemplo |
| Los secretos no llegan al navegador | Solo las variables con prefijo `PUBLIC_` se exponen al cliente. `GITHUB_TOKEN` no lo tiene, y por eso no se incrusta en el bundle |
| El CLI no hereda secretos del sitio | Aunque se ejecute en la misma máquina, no lee el `.env` de `frontend/` |
| Nada de secretos en una skill | El checklist de `/contribuir` incluye "sin secretos ni datos personales", y la validación local busca patrones de token o clave privada en `SKILL.md` |
| `DEBUG` no imprime secretos | Los mensajes de depuración muestran rutas y decisiones de destino, nunca el contenido de una variable sensible |

El punto que más se subestima: **el CLI no debe aceptar un token como flag**.
Añadir un `--token` "por si acaso" crea una superficie de robo de credenciales
en una herramienta que no necesita ninguna credencial. La lista de flags de
[`03-api.md`](./03-api.md) es cerrada por esta razón.

---

## Rate limiting

**No aplica al CLI.** No hay servidor, y por tanto no hay peticiones por usuario
que limitar.

Lo que sí tiene rate limit, y su comportamiento:

| Consumidor | Servicio | Límite | Comportamiento |
|---|---|---|---|
| CLI en runtime | Registro de npm | Sin límite práctico para un volumen humano | Si falla, es un error de red y se traduce a código **6** con un mensaje accionable. No hay reintentos agresivos ni cola |
| Build del sitio | API REST de GitHub | **Bajo sin autenticar**: el límite no autenticado es el que hace necesario el token | Se lee `GITHUB_TOKEN` cuando está presente; el resultado se cachea y una caída usa el valor cacheado |

Decisiones:

| Decisión | Motivo |
|---|---|
| El CLI no reintenta automáticamente | Una descarga fallida se reporta. Reintentar a ciegas convierte un problema visible en uno invisible y lento |
| El CLI no implementa backoff exponencial | Un instalador se ejecuta una vez; esperar 30s sin explicar por qué es peor que fallar ya |
| El build cachea las respuestas de GitHub | Un sitio estático se reconstruye muchas veces; la API se consulta una vez por métrica y por ventana de tiempo |
| El build nunca falla por GitHub | Una métrica no disponible se omite o se sustituye por el valor cacheado. Romper el build por un contador de estrellas sería absurdo |

Detalle completo en [`07-integraciones.md`](./07-integraciones.md).

---

## CORS

**No aplica.** No hay servidor, ni endpoints, ni respuestas HTTP propias, ni
peticiones desde el navegador a un backend. El único recurso externo que el
navegador carga es el índice de búsqueda estático, servido por el mismo origen.

La ausencia de CORS es una consecuencia, no una omisión: este proyecto no tiene
un único byte de API en ejecución. Lo que sí aplica, en el lado del sitio, es la
política de seguridad estática:

| Encabezado | Valor | Motivo |
|---|---|---|
| `Content-Security-Policy` | Restrictiva, sin `unsafe-inline` para scripts | El único script inline es el anti-parpadeo del tema, que debe ser inline; se resuelve con un hash o con una directiva específica |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Evita filtrar la URL de las páginas de skill a terceros |
| `X-Content-Type-Options` | `nosniff` | Estándar |
| Sin `Access-Control-*` | — | No hay a quién concedérselo |

---

## Scripts ejecutables dentro de skills

Esta es la sección de seguridad más específica del proyecto, porque es el punto
donde el riesgo no está en el CLI: está en lo que la persona ejecuta después,
creyendo que una skill revisada es segura.

### El riesgo

Una skill no es solo texto: es la instrucción que un agente sigue. Si incluye
`scripts/`, esos scripts se ejecutan con los permisos de la persona que usa el
agente, fuera de cualquier sandbox del CLI. `npx fwskills add` los copia; no los
ejecuta. Eso significa que **la instalación no es el punto de control**: el punto
de control es el PR que los aprobó.

### Política

| Regla | Detalle |
|---|---|
| Una skill **puede** incluir scripts | Es una capacidad legítima: `scripts/validar.mjs` es el caso de uso obvio |
| Los scripts **deben** declararse en el frontmatter | Un campo de declaración lista los scripts ejecutables y su propósito. El CLI los muestra en la salida de `add` y `info` |
| Un script **no** declarado no se instala | Filtro en `add` y en `update`: los archivos ejecutables no declarados se omiten con aviso en stderr y quedan listados en la salida |
| Todo script requiere **revisión obligatoria** antes de fusionar | No es una revisión "si parece sospechoso", es un punto bloqueante del checklist de PR |
| La revisión cubre comportamiento observable | Qué lee, qué escribe, qué red toca, qué ejecuta. No "el código se ve bien" |
| Los secretos del entorno no se imprimen | Prohibido explícito: un script que haga `env` a stdout, o que lea `~/.aws`, `~/.npmrc` o claves de API, se rechaza |
| Nada de instalación remota | Un script que ejecute una tubería de descarga directa a un intérprete se rechaza en revisión |
| Sin scripts en las skills de la categoría `security` | Una skill que audita no ejecuta nada por su cuenta |

### Cómo se materializa

| Pieza | Dónde |
|---|---|
| Declaración en el frontmatter | `SKILL.md` de la skill, en el campo de scripts |
| Aviso en la instalación | `add` y `update` muestran los scripts que se instalan, siempre, incluso sin `--dry-run` |
| Bloqueo de los no declarados | `add` y `update` omiten el archivo y lo dicen |
| Revisión obligatoria | Checklist de calidad de `/contribuir` y plantilla de PR |
| Reporte de una skill maliciosa | Bloque de Seguridad de `/contribuir`: cómo reportarla y qué esperar |

### El mensaje de instalación

Que los scripts aparezcan **en la salida normal** de `add` es deliberado. Una
persona que lee `add: 6 archivos instalados` no sabe que uno de ellos se ejecuta.
El mensaje tiene que decirlo:

```text
add: 6 archivos instalados en /home/usuario/proyecto/.opencode/skills/specs/crear-specs
warn: la skill incluye 1 script ejecutable: scripts/validar.mjs
warn: revisa su contenido antes de usarlo con tu agente
```

Un instalador que no dice "esto incluye algo ejecutable" está ocultando
información relevante de seguridad detrás de un mensaje de éxito.
