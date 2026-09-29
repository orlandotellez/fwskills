# 07 — Integraciones

El proyecto tiene **dos** integraciones externas y ninguna más. No hay base de
datos, ni pasarela de pago, ni analítica, ni CRM, ni email, ni proveedor de
identidad, ni servicio de terceros en el navegador.

| # | Servicio | Consumido por | Momento |
|---|---|---|---|
| 1 | Registro de npm | El CLI | En runtime, en la máquina de quien instala |
| 2 | API REST de GitHub | El sitio | **Solo en build**, nunca en runtime del navegador ni del CLI |

La distinción del momento es la regla que gobierna este documento: **una
integración en build puede tener credenciales; una integración en runtime no**.
Por eso `GITHUB_TOKEN` existe y ningún token del CLI existe.

---

## 1 · Registro de npm

| | |
|---|---|
| **Servicio** | Registro público de npm (`registry.npmjs.org`) |
| **Propósito** | Resolver la referencia `<categoría>/<slug>` contra el catálogo publicado, descargar los archivos que componen la skill y obtener su versión |
| **Protocolo** | HTTPS con la API del registro. Descarga de un tarball por versión resuelta |
| **Autenticación** | **Ninguna.** Los paquetes públicos se resuelven y se descargan de forma anónima |
| **Fallback** | Un error explícito, nunca una instalación parcial silenciosa |

### Detalle

| Aspecto | Detalle |
|---|---|
| Quién lo usa | `add`, `update`, `remove`, `list`, `search`, `info`. A través de `SkillRegistryPort` |
| Qué descarga | Un **tarball por skill**, no el paquete entero. El payload es el contenido de `skills/<categoría>/<slug>/` publicado junto a la metadata |
| Formato del payload | Un archivo por skill con su `SKILL.md` y, si existen, `references/`, `scripts/` y `assets/` |
| Resolución | Nombre + versión, con el `version` del frontmatter como referencia de contenido y no como versión de npm: la versión de una skill es suya, y `1.3.0` de una skill no tiene por qué coincidir con la versión del paquete |
| Caché | El directorio de caché del usuario para evitar volver a descargar el mismo payload. `update` invalida la entrada cuando hay versión nueva |
| Sin instalación de código | El CLI **no** ejecuta nada de lo que descarga: ni `postinstall`, ni `eval`, ni `import()` dinámico del payload. Escribe archivos, nada más |

### Autenticación: ninguna, y por qué no debe añadirse

| Razón | Detalle |
|---|---|
| El paquete es público | Cualquiera puede resolverlo y descargarlo sin credenciales |
| Una skill es contenido público | Se instala desde un repositorio abierto; no hay nada privado que proteger |
| Un token sería una superficie de robo | Un flag `--token` en una herramienta que no lo necesita es un objetivo. Decisión explícita en [`04-security.md`](./04-security.md) |

### Fallback

La regla es una sola, y es la importante:

> **Un fallo de red produce el código de salida 6 y cero escrituras. Nunca una
> instalación parcial.**

| Situación | Comportamiento |
|---|---|
| No se puede resolver la referencia | Mensaje en stderr con la referencia y el código **3** si la skill no existe; **6** si el registro no respondió |
| No se puede descargar el tarball | Código **6**, mensaje con la referencia, la causa y qué reintentar. Cero archivos escritos |
| Se descarga un tarball corrupto o truncado | Se valida antes de extraer; código **6**, cero escrituras |
| El frontmatter del payload no valida | Código **5**, cero escrituras. Es un fallo de contenido, no de red, y se distingue a propósito |
| Se agota el tiempo de espera | Código **6**, mensaje explícito. Sin reintentos automáticos: reintentar a ciegas convierte un problema visible en uno invisible |

Por qué cero escrituras parciales: una skill a medias en la carpeta del agente es
peor que no tenerla. El agente puede leer un `SKILL.md` sin sus `references/` y
fallar de una forma difícil de diagnosticar. La instalación se construye en un
directorio temporal y se mueve al destino solo cuando está completa; si algo
falla, el temporal se descarta.

### Límite de peticiones

No aplica un límite propio. El CLI hace un número pequeño de peticiones por
ejecución (una resolución y una descarga por skill), muy por debajo de cualquier
límite. No hay reintentos automáticos ni control de concurrencia porque no hay
un problema que resolver.

---

## 2 · API REST de GitHub

| | |
|---|---|
| **Servicio** | API REST de GitHub |
| **Propósito** | Resolver en build las métricas que el sitio muestra: estrellas, contribuidores, releases y fechas de última actualización |
| **Protocolo** | HTTPS, JSON, con cabeceras `Accept: application/vnd.github+json` y `X-GitHub-Api-Version` fijada |
| **Autenticación** | **Opcional.** Sin token se funciona con el límite no autenticado, que es bajo. Con `GITHUB_TOKEN` el límite sube de inmediato |
| **Fallback** | Renderizar el último valor cacheado o **omitir la métrica**. Nunca romper el build |

### Para qué existe

El sitio es estático y no puede consultar la API desde el navegador sin
introducir dos problemas: una petición del visitante a un tercero y, sobre todo,
un dato que cambia en una página que ya se sirvió. La resolución en build
elimina ambos.

| Dato | Dónde aparece | Momento |
|---|---|---|
| Estrellas | Contador del header de todas las páginas | `[BUILD]` |
| Número de contribuidores | Hero de Inicio y sección Comunidad | `[BUILD]` |
| Avatares de contribuidores | Sección Comunidad de Inicio, como imágenes locales | `[BUILD]` |
| Releases (conteo y última) | Sección Comunidad de Inicio | `[BUILD]` |
| Fecha de última actualización por skill | Ficha de skill | `[BUILD]` |

### Autenticación

| Aspecto | Detalle |
|---|---|
| Variable | `GITHUB_TOKEN`, **solo en build**, nunca en el navegador y nunca en el CLI |
| Alcance del token | Mínimo: solo lectura de repositorios públicos |
| Sin token | Funciona. El límite no autenticado es el que hace conveniente tener token para un sitio que se reconstruye a menudo |
| Con token inválido | Aviso en stderr y se continúa sin él. El build **no** falla por un token caducado |
| Exposición | Sin prefijo `PUBLIC_`, así que Astro no la incrusta en el bundle. Nunca llega al cliente |
| Cache | Obligatoria: una respuesta por endpoint y por ventana de tiempo |

### Endpoints usados

Solo lectura, y solo los necesarios:

| Propósito | Recurso |
|---|---|
| Estrellas, watchers y descripción | Ficha del repositorio |
| Releases | Listado de releases, limitado a las últimas |
| Contribuidores | Listado de colaboradores y de contribuidores |
| Fecha de última actualización de una skill | Commits del path de la skill, limitado a 1 |

Cada respuesta se reduce a **los campos que el sitio necesita** y se serializa en
la página. El JSON crudo de la API no se publica nunca.

### Cache

| Aspecto | Detalle |
|---|---|
| Dónde | En disco, dentro del directorio de trabajo del build |
| Clave | Endpoint + parámetros + hash de la respuesta previa |
| Ventana | Horas, no minutos: una estrella no cambia de forma relevante en ese intervalo |
| Invalidación | Al cambiar de `PUBLIC_SITE_URL` o de repositorio, y con un comando explícito de limpieza |
| Efecto de un build en frío | Una petición por métrica; el resto, desde caché |

### Fallback

La regla que gobierna todo el comportamiento ante un fallo de GitHub:

> **Una métrica que no se puede resolver no puede romper el build. Se usa el
> último valor cacheado y, si no hay, se omite la métrica.**

| Situación | Comportamiento | Motivo |
|---|---|---|
| GitHub no responde | Se usa el valor cacheado; sin caché, la métrica se omite | El sitio es contenido, no un panel de métricas |
| Límite de peticiones agotado (403) | Igual que el caso anterior, con un aviso en stderr que nombre la variable | La causa probable es `GITHUB_TOKEN` ausente o caducado |
| Repositorio inexistente o renombrado | Todas las métricas se omiten; el build continúa | Un fallo de configuración no debe impedir publicar el catálogo |
| Token inválido | Aviso en stderr y se continúa sin él | Un secreto caducado se reporta, pero no bloquea una publicación |
| Respuesta con un campo inesperado | Se usa el valor por defecto del campo y se avisa | Robustez ante cambios de la API |

Cómo se manifiesta "omitir" en la interfaz, que es la parte que hay que diseñar
bien:

| Métrica | Sin dato |
|---|---|
| Estrellas | El contador del header no se renderiza. El enlace a GitHub **sí**, porque siempre funciona |
| Contribuidores | La sección Comunidad se renderiza con el número de skills —dato local— y sin las cifras remotas |
| Avatares | El bloque de avatares no se renderiza; no aparece un hueco vacío |
| Releases | La cifra se omite; el resto de las tres métricas sigue |

**Nunca** se muestra `0`. Un `0` de estrellas afirma algo falso: afirma que se
consultó GitHub y no hay ninguna. "No lo sé" y "vale cero" son datos distintos,
y la interfaz tiene que distinguirlos.

---

## Lo que no existe, y por qué

| Servicio que uno esperaría | Por qué no está |
|---|---|
| Base de datos | El contenido está en `skills/` y se deriva en build. No hay estado de usuario que persistir |
| Autenticación / OAuth | No hay cuentas, ni sesiones, ni área privada |
| Analítica | Sin telemetría. Ninguna página envía eventos a ningún servicio |
| CDN de fuentes | Inter y JetBrains Mono se autoalojan. Cero peticiones a terceros |
| Registros alternativos | El catálogo sale del registro de npm por diseño. Añadir otro es un comando nuevo, no una configuración |
| Proveedor de imágenes | Los avatares y las `og:image` se generan o se descargan **en build** y se sirven como archivos estáticos del propio despliegue |
| Bus de eventos / webhooks | No hay servidor que pueda recibir nada |

La consecuencia operativa de toda esta tabla es una sola: **en runtime, el
navegador solo habla con el origen del sitio, y el CLI solo habla con el registro
de npm**. Ninguna otra dependencia de red existe en ninguna de las dos rutas.
