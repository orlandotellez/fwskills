# Datos de GitHub en build

## Estado Actual

`frontend/src/lib/` no existe, así que no hay `github.ts` ni ninguna llamada a la
API REST de GitHub. El único dato externo que consume el build hoy es
`PUBLIC_SITE_DESCRIPTION` y `PUBLIC_SITE_URL`, que leen `astro.config.mjs` y
`Layout.astro`; `GITHUB_TOKEN` está documentada en `frontend/.env.example` como
opcional, pero no hay código que la lea. El header actual no muestra contador de
estrellas, la sección Comunidad no existe y la ficha de skill no muestra fecha de
última actualización. `public/` solo contiene `favicon.svg`.

## Objetivo

Resolver estrellas, contribuidores, releases, avatares y fechas de última
actualización durante el build, cachear cada respuesta, y que un fallo de GitHub
muestre el último valor conocido u omita la métrica sin romper la compilación.

## Alcance

- `frontend/src/lib/github.ts` con los cuatro recursos necesarios de la API REST
  de GitHub.
- Caché en disco con ventana en horas, por endpoint y parámetros.
- `GITHUB_TOKEN` opcional, con alcance mínimo de solo lectura.
- Degradación en tres niveles: valor cacheado, omisión de la métrica, y
  continuidad del build.
- Descarga de avatares a `public/contributors/` en build.
- Fecha de última actualización por skill, con la fecha de build como respaldo.
- Métrica compartida entre páginas para que el coste no crezca con el número de
  skills.

## Fuera de alcance

- La interfaz que muestra las métricas: el contador del header vive en
  [`02-componentes-globales.md`](./02-componentes-globales.md), la sección
  Comunidad en [`04-inicio.md`](./04-inicio.md) y la fecha de la ficha en
  [`06-ficha-de-skill.md`](./06-ficha-de-skill.md). Aquí se resuelve el dato, no se
  pinta.
- Cualquier métrica en runtime. El navegador no llama a la API de GitHub: la
  sección Comunidad se renderiza con los valores congelados en el HTML.
- La API REST de GitHub consumida por el CLI: el CLI no la usa nunca, porque se
  ejecuta en la máquina de otra persona y no necesita ningún token.
- Analítica, eventos, telemetría o cualquier dato de uso del visitante. No
  existen y no se añaden.
- Cualquier escritura: esta integración es de solo lectura.

## Tareas

- [x] 1. Crear `src/lib/github.ts` con el cliente de solo lectura
  - Detalle de implementación: una función `githubFetch<T>(path, params)` que
  llama a `https://api.github.com`, envía
  `Accept: application/vnd.github+json`, fija `X-GitHub-Api-Version`, adjunta
  `Authorization: Bearer <GITHUB_TOKEN>` solo si la variable existe y no está
  vacía, y devuelve solo los campos que el sitio necesita. Nunca devuelve ni
  publica el JSON crudo. La variable se lee con `import.meta.env.GITHUB_TOKEN` en
  el servidor de build, y al no llevar el prefijo `PUBLIC_` Astro no la expone al
  navegador.
- [x] 2. Resolver el token ausente, inválido o caducado sin romper el build
  - Detalle de implementación: sin token se funciona con el límite no autenticado.
  Con un token que la API rechaza se emite un aviso en stderr que nombre la
  variable —nunca su valor— y se continúa sin él. El build no falla por un secreto
  caducado: un secreto caducado se reporta, pero no bloquea una publicación. El
  error más común es el límite de peticiones agotado, y su causa probable es
  `GITHUB_TOKEN` ausente, así que el aviso de 403 lo dice explícitamente.
- [x] 3. Implementar la caché en disco con ventana en horas
  - Detalle de implementación: `src/lib/github-cache.ts` guarda cada respuesta en
  `node_modules/.cache/fwskills/github/`, con una clave
  `endpoint + params ordenados` y una marca de tiempo. La ventana se mide en
  horas, no en minutos, porque una estrella no cambia de forma relevante en ese
  intervalo. Un build en frío hace una petición por métrica y el resto sale de la
  caché. La caché se invalida al cambiar de repositorio y se limpia con un
  comando explícito.
- [x] 4. Resolver las cuatro métricas con una sola llamada por recurso
  - Detalle de implementación: `getRepoStats()` devuelve `{ stars, description,
  lastPushAt }` desde la ficha del repositorio; `getContributors(limit)`
  devuelve el listado de colaboradores con `login` y `avatar_url`;
  `getReleases(limit)` devuelve las últimas releases con `tag_name` y
  `published_at`; y `getPathLastCommit(categoria, slug)` devuelve la fecha del
  último commit de `skills/<categoria>/<slug>`. Cada función se llama una vez por
  build y su resultado se comparte: el número de peticiones no crece con el
  número de skills, salvo la fecha por skill, que se resuelve una vez por entrada
  de la colección.
- [x] 5. Implementar la degradación en tres niveles
  - Detalle de implementación: ante cualquier fallo —GitHub caído, 403 por límite,
  repositorio renombrado o un campo inesperado en la respuesta— se usa el último
  valor cacheado; si no hay caché, se marca la métrica como no disponible; y si no
  hay nada que mostrar, se **omite el elemento de la interfaz**. En ningún caso se
  muestra `0`: un cero de estrellas afirma que se consultó GitHub y no hay
  ninguna. «No lo sé» y «vale cero» son datos distintos, y la interfaz tiene que
  distinguirlos. El build nunca falla por esta integración.
- [x] 6. Definir cómo se manifiesta la ausencia de cada métrica en la interfaz
  - Detalle de implementación: el tipo de retorno distingue `number` de `null`, y
  cada consumidor decide. Sin estrellas, el contador del header no se renderiza
  pero el enlace a GitHub **sí**, porque siempre funciona. Sin contribuidores, la
  sección Comunidad se renderiza con el número de skills —dato local— y sin las
  cifras remotas. Sin avatares, el bloque de avatares no se renderiza y no queda un
  hueco vacío. Sin releases, se omite solo esa cifra.
- [ ] 7. Descargar los avatares de contribuidores a `public/contributors/`
  - Detalle de implementación: en build, los avatares de los contribuidores
  mostrados se descargan a `public/contributors/<login>.webp` con dimensiones
  fijas, y la página los referencia como rutas locales. La descarga ocurre solo en
  el servidor de build, nunca desde el navegador: el sitio no hace peticiones a
  terceros en runtime, y el presupuesto de red del sitio es cero solicitudes
  externas. Si un avatar falla, se omite ese avatar y se avisa en stderr.
- [ ] 8. Resolver la fecha de última actualización por skill con respaldo
  - Detalle de implementación: la ficha recibe `lastUpdated: Date | null`,
  resuelto desde el último commit del path de la skill. Cuando la API no
  responde y no hay caché, el valor es la fecha del propio build, que siempre
  existe y nunca es incorrecta del todo: describe cuando se generó la página. La
  fecha se formatea en español en el servidor, no en el cliente, para no enviar
  código de formateo por el peso de un dato que se puede resolver en build.
- [ ] 9. Añadir la limpieza explícita de caché y su exclusión del repositorio
  - Detalle de implementación: un script `clean:cache` en `frontend/package.json`
  elimina `node_modules/.cache/fwskills/`. El directorio de caché está dentro de
  `node_modules/` y por tanto ya ignorado; se comprueba que `.gitignore` no
  necesita una entrada adicional. Ningún dato de GitHub se versiona en el
  repositorio.
- [ ] 10. Documentar la variable y su alcance sin exponer su valor
  - Detalle de implementación: `frontend/.env.example` mantiene `GITHUB_TOKEN`
  con su descripción, su alcance mínimo de solo lectura de repositorios públicos y
  la nota de que es opcional. En ningún archivo versionado aparece un valor de
  token: solo el nombre, el propósito y el alcance. La documentación del sitio
  menciona la variable por su nombre cuando explica por qué el contador de
  estrellas puede ir atrasado.
- [ ] 11. Cubrir la degradación con pruebas que no dependen de la red
  - Detalle de implementación: el cliente acepta un `fetch` inyectado, de modo que
  las pruebas simulan respuesta correcta, 403 por límite, 404 de repositorio
  inexistente, respuesta con un campo inesperado y fallo de red, y comprueban en
  cada caso que la resolución devuelve el valor cacheado, `null`, o el valor por
  defecto del campo, **sin lanzar**. Ninguna prueba de este archivo hace una
  petición real a la API.

## Criterios de Done

- [ ] Un build con red disponible resuelve estrellas, contribuidores, releases y las fechas por skill, y sus valores aparecen congelados en el HTML generado.
- [x] El navegador no hace ninguna petición a `api.github.com`: `grep -rn 'api.github.com' frontend/src` solo devuelve coincidencias en `src/lib/github.ts`, que se ejecuta en build.
- [x] Un segundo build consecutivo sin cambios no hace ninguna petición a GitHub porque todo sale de la caché, y la caché vive en `node_modules/.cache/fwskills/github/`.
- [x] Con la red caída, el build **termina correctamente** y el sitio se genera con los valores cacheados.
- [x] Con la red caída y sin caché, el build **termina correctamente** y las métricas no disponibles se omiten de la interfaz; en ningún caso aparece un `0` en lugar de una métrica ausente.
- [ ] Con `GITHUB_TOKEN` ausente, el build funciona con el límite no autenticado y emite un aviso en stderr que nombra la variable sin mostrar su valor.
- [ ] Con `GITHUB_TOKEN` inválido, el build emite un aviso y continúa sin él; nunca falla por un token caducado.
- [x] La sección Comunidad renderiza con el número de skills —dato local— aunque GitHub no haya respondido, y el enlace al repositorio sigue presente.
- [ ] Los avatares de contribuidores se sirven desde `public/contributors/` y ninguna imagen apunta a un host externo.
- [ ] La ficha de cada skill muestra una fecha de última actualización, y esa fecha es la del último commit del path cuando la API responde, o la fecha del build cuando no responde y no hay caché.
- [ ] El número de peticiones a GitHub no crece con el número de skills más allá de una petición de fecha por skill.
- [x] `grep -rn 'ghp_\|github_pat_' frontend/` no devuelve ninguna coincidencia, y ningún valor de token aparece en un archivo versionado.
- [x] `GITHUB_TOKEN` no llega al bundle del navegador: no lleva el prefijo `PUBLIC_` y el HTML generado no la contiene.

---

<!-- Auditoría 2026-09-29. COMPLETAS T1-T6: github.ts resuelve estrellas, releases y contribuyentes en build time con cache en disco (.cache/fwskills/github), GITHUB_TOKEN opcional, AbortSignal.timeout, Promise.all (una llamada por recurso), y degradacion en tres niveles verificada con Playwright bloqueando api.github.com: la pagina renderiza y las metricas ausentes caen a "—". PENDIENTES REALES: T7 (avatares NO se descargan a public/contributors: hoy son URLs remotas de GitHub), T8 (0/7 skills tienen updatedAt en el frontmatter), T9 (no hay script de limpieza de cache), T11 (no hay test de degradacion automatizado: se verifico a mano con Playwright, no esta en la suite). -->
