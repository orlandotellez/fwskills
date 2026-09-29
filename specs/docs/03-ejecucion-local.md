# 03 — Ejecución local

Este documento contiene los comandos reales del repositorio. No hay comandos
inventados: los scripts que existen hoy están declarados en `frontend/package.json` y
son exactamente cuatro —`dev`, `build`, `preview` y `astro`. Cualquier otro comando
que este documento menciona está marcado explícitamente como **pendiente** o como
**propuesta**.

## Requisitos previos

| Requisito | Valor | Verificación |
| --- | --- | --- |
| Node.js | `>=22.12.0` | `node -v` |
| npm | El que acompanha a Node 22 | `npm -v` |
| Git | Cualquier versión reciente | `git --version` |

Node >= 22.12.0 no es una recomendación: está declarado en `frontend/package.json`
bajo `engines.node`. No se necesita ningún otro servicio. **No hay base de datos, ni
contenedor, ni Docker, ni variables secretas, ni credenciales de terceros** para
levantar el sitio.

### Estado actual del repositorio

A la fecha de este documento, el repositorio contiene únicamente `frontend/`. Todavía
**no** existen `cli/`, `skills/`, `src/content/` ni `starlight.config.mjs`;
son los elementos que el diseño target introduce (ADR-01, ADR-04, ADR-05, ADR-06).

Hay dos hechos del árbol actual que conviene tener presentes antes de seguir:

1. **El sitio se ejecuta desde `frontend/`, no desde la raíz.** La raíz todavía no tiene
   `package.json`.
2. **`frontend/package.json` declara `name: "fwskills"`.** Esto importa en cuanto se
   creen los workspaces: npm no admite dos workspaces con el mismo nombre
   (`EDUPLICATEWORKSPACE`). Si el paquete del CLI también se publica como `fwskills`
   —que es lo que exige la invocación `npx fwskills add <skill>`— el workspace del
   sitio deberá adoptar un nombre distinto, por ejemplo `@fwskills/site`, y
   declararse `private`. Ver «Punto abierto» más abajo.

## Instalación

### Situación actual: solo el sitio

```bash
cd frontend
cp .env.example .env
npm install
```

### Qué hace `cp .env.example .env`

`frontend/.env.example` documenta las dos variables que el sitio reconoce:

| Variable | Para qué se usa | Valor en el ejemplo |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | La consume `astro.config.mjs` como `site`. De ahí salen la URL canónica (`<link rel="canonical">`) y el `sitemap.xml`. | `https://example.com` |
| `PUBLIC_SITE_DESCRIPTION` | Descripción por defecto de la landing, usada en `<meta name="description">`. | `Landing estática creada con fwinit y Astro` |

Dos advertencias sobre este archivo:

- El prefijo `PUBLIC_` significa que Astro expone el valor al cliente. No se deben
  colocar secretos en estas variables; no son el lugar para ellos.
- El valor por defecto de `PUBLIC_SITE_DESCRIPTION` es texto de plantilla y debe
  reemplazarse. Lo mismo ocurre con el título de `src/pages/index.astro`, que hoy es
  `fwinit — ¡Hola!`, una marca de la plantilla de origen que no corresponde a este
  proyecto.
- `.env` está en `.gitignore` (tanto en la raíz del repositorio como en
  `frontend/.gitignore`). Solo se versiona `.env.example`.

### Estado objetivo: monorepo con npm workspaces (ADR-06)

Una vez creado el `package.json` raíz con `workspaces`, la instalación se hace **una
sola vez desde la raíz** y un único lockfile cubre todos los paquetes:

```bash
cp frontend/.env.example frontend/.env
npm install
```

Comportamiento esperado con esa estructura:

- `npm install` en la raíz instala las dependencias de `frontend/`, de
  `cli/` y de sus dependencias transitivas, con un solo `package-lock.json`.
- Los scripts se ejecutan por workspace con `-w`/`--workspace` o con
  `--filter`, por ejemplo `npm run dev -w <nombre-del-workspace>`.
- `skills/` **no** es un workspace: es contenido. No lleva `package.json` y no
  participa del `npm install`.

### Punto abierto: colisión de nombres de workspace

`frontend/package.json` ya se llama `fwskills` y el comando público del proyecto es
`npx fwskills add <skill>`. npm rechaza dos workspaces con el mismo nombre:

```
npm error code EDUPLICATEWORKSPACE
npm error must not have multiple workspaces with the same name
```

Por lo tanto, cuando se cree `cli/`, una de estas dos condiciones debe
resolverse en el mismo commit que introduce el workspace:

1. El workspace del sitio pasa a llamarse `@fwskills/site` (y se marca `private`),
   dejando `fwskills` libre para el paquete publicado en npm; o
2. El paquete del CLI se publica con un nombre distinto del bin, y `npx fwskills`
   se resuelve por el campo `bin` y no por el nombre del paquete.

La primera opción es la recomendada: el sitio nunca se publica en npm y no debería
ocupar el nombre del paquete distribuible.

## Ejecución (desarrollo)

```bash
cd frontend
npm run dev
```

El script es `astro dev` y el servidor queda disponible en
**http://localhost:4321**.

Otras variantes de uso frecuente, todas resueltas a través del script `astro`
(`"astro": "astro"`):

```bash
npm run astro -- check        # verificación de tipos y diagnósticos de Astro
npm run astro -- build        # equivalente a npm run build
npm run astro -- --help       # ayuda de la CLI de Astro
```

El script `astro` existe precisamente para no depender de una instalación global: es
la vía prevista para invocar cualquier comando de la CLI de Astro con la versión
fijada en el proyecto.

Con workspaces, los mismos comandos se dirigen por workspace:

```bash
npm run dev -w <nombre-del-workspace>
```

## Pruebas

### Estado actual: no hay runner de pruebas ni linter

Conviene decirlo sin rodeos: **el repositorio no tiene runner de pruebas y no tiene
linter configurado**. Los cuatro scripts de `frontend/package.json` son `dev`, `build`,
`preview` y `astro`; no existe `test` ni `lint`. `frontend/package.json` no declara
ninguna dependencia de `vitest`, `jest`, `playwright`, `eslint` ni `prettier`, y no hay
ninguna configuración de linter en el árbol.

**Por qué es aceptable en el estado actual.** El sitio no tiene lógica de negocio que
probar: es una landing estática que no envía JavaScript al navegador. Un runner de
pruebas sobre `.astro` sin JavaScript en runtime produciría pruebas que verifican que
una interpolación de texto funciona —cosas que el compilador ya garantiza— mientras
que el riesgo real del proyecto (un `SKILL.md` mal formado, un token sin contraste
suficiente) quedaría sin cubrir. Introducir un runner ahora sería configuración que
nadie usa.

**Por qué es una brecha, no una decisión permanente.** En cuanto exista
`cli/` habrá lógica real: resolución de rutas, lectura de `SKILL.md`,
validación de `compatibility`, escritura en disco. Ese código sí necesita pruebas
automáticas, y ese es el momento de añadir el runner.

### Qué existe hoy como verificación

| Mecanismo | Comando | Qué detecta |
| --- | --- | --- |
| Verificación de tipos y diagnósticos | `npm run astro -- check` | Errores de TypeScript y diagnósticos de plantillas `.astro`. Requiere `@astrojs/check` (`^0.9.10`) y `typescript` (`^6.0.3`), ambos ya instalados como `devDependencies`. |
| Integridad del contenido | `npm run build` | Una vez implementado ADR-05, una `SKILL.md` que no cumpla el esquema Zod hace fallar la compilación. Es el gate de validación del proyecto. |
| Build completo | `npm run build` | Errores de resolución de colecciones, rutas y generación de `sitemap.xml`. |
| Inspección manual | `npm run preview` | Revisión visual sobre la salida real, no sobre el servidor de desarrollo. |
| Auditoría de rendimiento y accesibilidad | Lighthouse sobre `npm run preview` | Objetivos de `05-requisitos-no-funcionales.md`. |

### Brechas de verificación declaradas

- Sin suite de pruebas automatizadas.
- Sin linter ni formateador, y por lo tanto sin regla automática de estilo.
- Sin verificación de accesibilidad automatizada (axe, Lighthouse CI).
- **Sin integración continua.** No existe un directorio `.github/` en el repositorio,
  de modo que ninguno de los comandos anteriores se ejecuta automáticamente. La
  verificación depende de que alguien la ejecute.
- Sin verificación de que el catálogo sigue siendo generable sin ediciones de
  frontend; esa invariante (ADR-05) se comprueba hoy de forma manual.

### Plan de pruebas para `cli/`

Cuando el CLI exista, la recomendación es **`node:test`**, el runner integrado en
Node 22. La razón es concreta: no requiere instalar ninguna dependencia, funciona con
el requisito de Node ya declarado (`>=22.12.0`) y evita añadir una cadena de
dependencias a un paquete cuyo propósito es ser instalado con `npx`. El script `test`
se agrega en el commit que introduce el CLI, no antes.

El orden de verificación de cada pull request, en este orden:

1. `npm run astro -- check` — falla si hay errores de tipos.
2. `npm run build` — falla si el contenido o las rutas no son válidas.
3. `npm test` — presente desde la introducción del CLI.
4. Lighthouse sobre `npm run preview`, cuando el cambio afecta estilos, peso o
   accesibilidad.

## Build y producción

```bash
cd frontend
npm run build       # genera dist/ (estático)
npm run preview     # sirve localmente el contenido de dist/
```

| Aspecto | Comportamiento verificado |
| --- | --- |
| Script | `build` es `astro build`; la salida es el directorio `dist/`. |
| Previsualización | `preview` es `astro preview`, que sirve `dist/`. Para validar lo que realmente se despliega hay que usar `preview`, no `dev`. |
| URL del sitio | `astro.config.mjs` define `site: process.env.PUBLIC_SITE_URL ?? 'https://example.com'`. Ese valor alimenta la URL canónica y el `sitemap.xml`. |
| Exclusión | `tsconfig.json` excluye `dist` de la comprobación de tipos. |
| Artefactos ignorados | `dist/`, `.astro/`, `node_modules/`, `.env` y `.env.production` están en `.gitignore`. `dist/` nunca se versiona. |
| Despliegue | La salida es estática: sirve en Vercel, Netlify, Cloudflare Pages o cualquier hosting de archivos, sin adapter de servidor. |

### Trampa conocida: el valor por defecto de `site`

`astro.config.mjs` usa el operador `??`, por lo que **si `PUBLIC_SITE_URL` no está
definida el build no falla**: usa `https://example.com`. El resultado es un sitio que
se publica con éxito y con canónicas y `sitemap.xml` apuntando a un dominio que no le
pertenece. Es un fallo silencioso, y el síntoma aparece semanas después, cuando el
sitio ya está indexado.

La mitigación es de proceso, no de código: el pipeline de publicación debe exportar
`PUBLIC_SITE_URL` de forma explícita, y la revisión de un despliegue debe comprobar
que la URL canónica de la portada corresponde al dominio real.

### Consideraciones de compilación

- La compilación debe ser reproducible: sin `Date.now()` en la generación de contenido
  y sin datos embebidos que cambien entre dos compilaciones del mismo commit.
- Los datos dinámicos del repositorio (estrellas, colaboradores, releases, fecha de
  actualización) se resuelven en build. Una API externa lenta o caída **no debe**
  romper la compilación: la fuente debe degradar con rescate al último valor conocido
  en lugar de fallar.
- La compilación se ejecuta con `PUBLIC_SITE_URL` presente, para no caer en el valor
  por defecto descrito arriba.
- Con workspaces, el build se ejecuta por workspace: `npm run build -w
  <nombre-del-workspace>`.
