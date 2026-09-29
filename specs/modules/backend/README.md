# Módulo `backend` — CLI `fwskills`

## Qué es

El paquete npm **`fwskills`**, publicado y ejecutado como `npx fwskills`. Es un
programa de línea de comandos que instala skills de IA en la carpeta de
configuración del agente que la persona está usando.

No es un servidor. No expone HTTP, no escucha en ningún puerto, no tiene base de
datos, ni sesiones, ni usuarios, ni login. Corre como el usuario local, con los
permisos de ese usuario, y su única salida es escribir archivos en disco.

## Para qué sirve

| Necesidad | Cómo la resuelve |
|---|---|
| Instalar una skill concreta | `npx fwskills add specs/crear-specs` |
| Instalar todas las skills de un área | `npx fwskills add --category security` |
| Saber qué hay disponible | `npx fwskills list`, `npx fwskills list --category qa` |
| Encontrar una skill sin conocer su nombre | `npx fwskills search testing` |
| Desinstalar una skill | `npx fwskills remove specs/crear-specs` |
| Traer las mejoras de las skills ya instaladas | `npx fwskills update` |
| Ver metadata y destino de una skill | `npx fwskills info qa/junit-reportes` |
| Preparar las carpetas de destino | `npx fwskills init` |

## Dónde vive y cómo se consume

| Aspecto | Valor |
|---|---|
| Ruta | `packages/cli/` |
| Nombre del paquete | `fwskills` |
| Binario | `fwskills` (se invoca con `npx fwskills <command>`) |
| Lenguaje | TypeScript sobre Node.js `>=22.12.0` |
| Formato | ESM (`"type": "module"`) |
| Payload de skills | Resuelto desde el repositorio en build/publicación |
| Destino de instalación | Carpeta de skills del agente detectado en la máquina |

**Estado: nada de esto existe todavía.** `packages/` no está en el repositorio
hoy. Este módulo es íntegramente `[ESPECIFICADO]`, a diferencia del módulo
`frontend`, que tiene una base real ya construida.

## Relación con `skills/` y con el sitio

```
skills/<categoria>/<slug>/SKILL.md
        │
        ├──→ npx fwskills          (lee el mismo frontmatter de 8 campos)
        │      │
        │      └──→ .opencode/skills/ · .agents/skills/ · .pi/skills/ · .claude/skills/
        │
        └──→ astro build           (genera catálogo, fichas y /docs)
```

El **contrato compartido** es el frontmatter de `SKILL.md` con exactamente 8
campos: `name`, `description`, `category`, `version`, `author`, `tags`,
`compatibility`, `featured`. Ambos consumidores lo validan por su cuenta: el
sitio con un esquema Zod de Astro, el CLI con su propio validador. La validación
del CLI es deliberadamente independiente, porque el CLI se ejecuta en la máquina
de otra persona, lejos de este repositorio y sin posibilidad de que el build de
Astro haya actuado.

## Archivos de este módulo

| Archivo | Propósito |
|---|---|
| [`01-stack.md`](./01-stack.md) | Lenguaje, versión de Node, empaquetado, parseo de argumentos y comandos de desarrollo. |
| [`02-architecture.md`](./02-architecture.md) | Capas, estructura de carpetas objetivo, flujo de `add` paso a paso y patrones (registro de comandos, puerto de filesystem, enum de códigos de salida). |
| [`03-api.md`](./03-api.md) | La superficie del CLI: los 7 comandos con sintaxis, opciones, ejemplo y salida esperada; los 6 flags; los 7 códigos de salida; y la precedencia de destinos. |
| [`04-security.md`](./04-security.md) | Sin autenticación por diseño, autorización por permisos de archivo, validación de entrada, prevención de path traversal y symlinks, política de secretos y política de scripts ejecutables en skills. |
| [`05-testing.md`](./05-testing.md) | Estrategia de pruebas: unitarias sobre lógica pura, integración con directorio temporal y puerto de filesystem falso, smoke test del binario construido y objetivos de cobertura. |
| [`06-configuracion.md`](./06-configuracion.md) | Tabla de variables de entorno con valor por defecto, obligatoriedad y entorno de uso. |
| [`07-integraciones.md`](./07-integraciones.md) | Las dos integraciones externas: el registro de npm (descarga del payload) y la API REST de GitHub (solo en build del sitio). |

## Invariantes del módulo

1. **stdout es para datos, stderr es para mensajes.** Todo lo que el usuario
   necesita leer como resultado va a stdout; los avisos, el progreso y los
   errores van a stderr. `npx fwskills list | grep qa` tiene que funcionar.
2. **Ningún comando falla en silencio.** Un error produce un mensaje accionable
   y un código de salida distinto de cero.
3. **Nada se escribe fuera del destino resuelto**, ni por ruta relativa con
   `..`, ni por symlink, ni por un `--dir` que se resuelve fuera del árbol
   permitido.
4. **`--dry-run` no escribe nada.** Es la misma ruta de código con el puerto de
   escritura en modo simulación, no una rama especial.
5. **Una operación no interactiva es una operación explícita.** Sin `--yes` ni
   `--force`, el CLI pregunta antes de sobrescribir.
