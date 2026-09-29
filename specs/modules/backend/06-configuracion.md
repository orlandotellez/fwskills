# 06 — Configuración

## Resumen

**El CLI no necesita ninguna variable de entorno.** No lee `.env`, ni tokens,
ni claves. Su comportamiento depende exclusivamente de los argumentos que
reciba, del sistema de archivos y del contenido del catálogo.

Las variables que existen en el proyecto tienen dos dueños distintos:

| Dueño | Variables |
|---|---|
| Build del sitio (`frontend/`) | `GITHUB_TOKEN`, `PUBLIC_SITE_URL`, `PUBLIC_SITE_DESCRIPTION` |
| CLI (`packages/cli/`) | `NO_COLOR`, `FORCE_COLOR`, `DEBUG` |

Cruzar las dos mitades es un error de diseño que conviene evitar explícitamente:
el CLI **no** lee `GITHUB_TOKEN` (no llama a la API de GitHub en runtime) y el
sitio **no** lee `DEBUG` (no hay CLI).

## Tabla de variables

| Variable | Descripción | Valor por defecto | Obligatoria | Entorno |
|---|---|---|---|---|
| `GITHUB_TOKEN` | Sube el límite de peticiones de la API REST de GitHub. Se usa para resolver estrellas, contribuidores, releases y fechas de actualización | Sin valor: el build funciona sin ella, con el límite no autenticado | **No** | Build del sitio |
| `PUBLIC_SITE_URL` | URL pública canónica del sitio. La usa `astro.config.mjs` (`site`) y el `<link rel="canonical">` y las URLs absolutas de Open Graph | `https://example.com` en `astro.config.mjs`; cadena vacía en `Layout.astro` | **Sí**, para canonical y Open Graph correctos | Build del sitio |
| `PUBLIC_SITE_DESCRIPTION` | Descripción por defecto del sitio, usada en `<meta name="description">` | La que declara `Layout.astro` como valor por defecto de su prop `description` | No | Build del sitio |
| `NO_COLOR` | Desactiva todo el color en la salida | Sin valor: el color depende de que la salida sea una TTY y de `FORCE_COLOR` | No | CLI |
| `FORCE_COLOR` | Fuerza el color aunque la salida no sea una TTY (útil en CI) | Sin valor | No | CLI |
| `DEBUG` | Activa los mensajes de nivel `debug` en stderr: rutas resueltas, decisiones de destino y trazas de error | Sin valor: desactivado | No | CLI |

## Detalle por variable

### `GITHUB_TOKEN`

| Aspecto | Detalle |
|---|---|
| Consume | Build del sitio, **nunca** el CLI |
| Por qué | El límite no autenticado de la API REST de GitHub es bajo. Un sitio que se reconstruye con frecuencia agota ese límite y empieza a devolver 403 |
| Formato | Token personal con alcance mínimo: solo lectura de repositorios públicos |
| Si no está | El build funciona igual: se consulta con el límite no autenticado y se cachea el resultado |
| Si está mal | El build **no falla**: se avisa en stderr y se cae al comportamiento sin token |
| Exposición | Sin prefijo `PUBLIC_`, Astro **no** la expone al navegador. No llega al bundle |
| Dónde se define | Variable de entorno del sistema de CI o de la máquina de build. **Nunca** en un archivo versionado |

El build debe leer el token **en el servidor de build**, no en el código: es un
valor de entorno, no una constante. Y debe cachear las respuestas, porque una
reconstrucción completa no debería volver a consultar lo que ya sabe.

### `PUBLIC_SITE_URL`

| Aspecto | Detalle |
|---|---|
| Consume | `astro.config.mjs` y `Layout.astro` |
| Exposición | **Pública por diseño**: lleva el prefijo `PUBLIC_`, así que Astro la incrusta en el bundle. Es correcto, porque es la URL del sitio y no hay nada secreto |
| Si no está | `astro.config.mjs` cae a `https://example.com`. Sin ella, las URLs absolutas de Open Graph y el `sitemap.xml` serían incorrectos |
| Efecto de cambiarla | Cambia `sitemap.xml`, las etiquetas canónicas y las URLs de Open Graph. Es un cambio con impacto de SEO: hay que cambiarla **una vez**, en el despliegue, no entre builds |
| Dónde se define | `.env` local (copiado de `.env.example`) y variable de entorno del sistema en producción |

### `PUBLIC_SITE_DESCRIPTION`

| Aspecto | Detalle |
|---|---|
| Consume | `Layout.astro`, como valor por defecto de la prop `description` |
| Efecto | Cualquier página puede sobreescribirla con su propia prop; esta es la descripción de la landing y el respaldo del resto |
| Si no está | Se usa el valor por defecto declarado en `Layout.astro` |
| Exposición | Pública, por el prefijo `PUBLIC_` |

Ambas variables ya están documentadas en `frontend/.env.example`, con su
descripción. Ese archivo **sí** está versionado, porque contiene solo nombres y
valores de ejemplo, nunca secretos.

### `NO_COLOR` y `FORCE_COLOR`

Pertenecen a la convención de la comunidad (no es una invención de este
proyecto): `NO_COLOR` con cualquier valor desactiva el color; `FORCE_COLOR` lo
impone.

| Situación | Color |
|---|---|
| `NO_COLOR` definido | Nunca |
| `FORCE_COLOR` definido | Siempre |
| Ninguno, y la salida es una TTY | Sí |
| Ninguno, y la salida es un archivo o una tubería | No |

El último caso es el que importa. Si alguien hace
`npx fwskills list > skills.txt`, el archivo no debe contener secuencias de
escape ANSI: se romperían cualquier procesamiento posterior del archivo.

El color se aplica **solo a stderr**. El resultado en stdout va sin color, porque
su destino es otro programa.

### `DEBUG`

| Aspecto | Detalle |
|---|---|
| Efecto | Mensajes `debug:` en stderr |
| Contenido | Rutas de destino resueltas, regla de precedencia aplicada, decisiones del plan de archivos, traza completa ante un error inesperado |
| Valores | Presente y no vacío activa; `DEBUG=0` y `DEBUG=false` **no** desactivan, porque no es un booleano sino una bandera |
| Riesgo | Los mensajes de depuración revelan rutas del sistema de archivos de quien lo ejecuta. Nunca deben incluir el valor de una variable sensible ni el contenido de un token |
| Destino | stderr. Nunca stdout |

## Reglas transversales

| Regla | Detalle |
|---|---|
| Solo **nombres** en documentación y logs | Nunca el valor de una variable sensible |
| Los `.env` no se versionan | Solo `.env.example`, que documenta nombres y valores de ejemplo |
| Sin secretos en el bundle | Solo lo que lleva prefijo `PUBLIC_` llega al cliente |
| Una variable, un dueño | `GITHUB_TOKEN` es del build; `DEBUG` es del CLI. Ninguna de las dos se comparte |
| El CLI no lee archivos `.env` | Ni los propios ni los del sitio. Su configuración es la línea de comandos |
| Validar temprano | Si el valor presente no tiene el formato esperado, se ignora con un aviso en stderr y se sigue con el valor por defecto. Un valor mal escrito no puede impedir que el CLI funcione |

## Variables que deliberadamente no existen

| No existe | Por qué |
|---|---|
| `FWSKILLS_TOKEN`, `FWSKILLS_API_KEY` | El CLI no se autentica contra ningún servicio. Un flag o variable de token en una herramienta que no lo necesita es una superficie de robo de credenciales |
| `FWSKILLS_REGISTRY` | El catálogo sale del registro de npm por diseño. Un registro alternativo se añade como comando, no como variable de entorno |
| `FWSKILLS_HOME` | El destino se resuelve con `--dir`, `--global` y detección. Una variable adicional sería una quinta fuente de verdad |
| `FWSKILLS_AGENT` | La detección de agente es automática y visible en `--dry-run` y `info`. Forzarla por entorno introduce un modo que casi nadie usaría y que nadie probaría |
| `FWSKILLS_CONFIG` | El CLI no tiene archivo de configuración persistente. Todo su estado está en la invocación y en los archivos que instala |

El criterio que decide esta lista: **cada variable añade una forma de
configurar el CLI que hay que probar y documentar**. Una variable que solo
necesita un usuario improbable no compensa ese coste.
