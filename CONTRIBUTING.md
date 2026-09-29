# Cómo contribuir a fwskills

El catálogo de fwskills es un conjunto de carpetas en un repositorio
abierto. Añadir una skill es **añadir una carpeta**, escribir un `SKILL.md` y
abrir un pull request.

No hay comité, ni registro, ni lista de acceso, ni nadie que tenga que
aprobar que existas. La única condición es que la skill sea útil y esté bien
escrita.

Si falta la skill que necesitas, la forma más rápida de tenerlo es escribirla
tú.

---

## Las reglas, en corto

- Todo cambio entra por pull request y necesita **al menos una aprobación**
  antes de fusionarse. Nadie fusiona sus propios cambios.
- Las decisiones que afectan a todo el catálogo —una categoría nueva, un
  cambio de criterio, una skill de `security`— se discuten en una issue
  **antes** de escribir el pull request, para no gastar la revisión de nadie
  con una decisión ya tomada.
- Tu nombre va en el campo `author` del frontmatter. No hay perfil que
  mantener ni créditos que reclamar.

El detalle de los roles y del proceso de decisión está en
[GOVERNANCE.md](GOVERNANCE.md).

---

## Flujo en 6 pasos

Ninguno necesita permisos especiales.

### 1. Haz un fork

El repositorio es público y cualquiera trabaja sobre su propia copia.

### 2. Crea la carpeta en la categoría correcta

Una skill es una carpeta con su `SKILL.md` dentro:

```
skills/<categoría>/<tu-skill>/
├── SKILL.md
├── references/    (opcional)
├── scripts/       (opcional, con restricciones — ver abajo)
└── assets/        (opcional)
```

Si tu skill no encaja en `specs`, `design`, `qa` ni `security`, **no la
fuers dentro de una de esas**. Propón una categoría nueva.

### 3. Completa el `SKILL.md` con su frontmatter

El frontmatter es lo que el CLI y el sitio leen. El cuerpo es lo que tu
agente va a seguir.

```yaml
---
name: mi-skill              # kebab-case, igual al nombre de la carpeta
description: Una frase.     # 20-240 caracteres
category: specs             # kebab-case, igual a la carpeta padre
version: 1.0.0              # SemVer
author: "Tu nombre"
tags: [specs, documentación]
compatibility: [opencode, pi]
featured: false
---
```

Los **8 campos son obligatorios**. No hay valores por defecto: el build falla
con un `SKILL.md` al que le falte uno, y `name` y `category` tienen que
coincidir con el nombre de las carpetas.

`featured: true` es una excepción — la landing muestra un máximo de seis.
Deja las skills nuevas en `false`.

### 4. Valida localmente

```bash
cd frontend
bun run validate
```

Recorre `skills/**/SKILL.md` y falla con código 1 si algo no cumple el
esquema, diciendo qué campo y en qué archivo. Un `SKILL.md` mal formado
también rompe `bun run build`, porque el catálogo se genera en build time y
una entrada rota no debe llegar a la página.

### 5. Abre el pull request

Rellena la plantilla. Repite los seis puntos del checklist de abajo: es la
forma más rápida de que la primera revisión pase sin pedir cambios.

### 6. Revisión y merge

Al menos una aprobación. Si es tu primer pull request, no hay preferencia
por nadie: el criterio es el del proyecto, no la historia de quien escribe.

---

## Checklist de calidad de una skill

Seis puntos que un revisor va a mirar sí o sí. Son texto de referencia, no
un formulario: la confirmación real es la revisión del pull request.

1. **Descripción clara de la tarea que resuelve.** Una o dos frases, en el
   frontmatter, diciendo qué hace la skill y no para qué sirve el proyecto
   entero. Es lo primero que se lee: si no se entiende, no se instala.

2. **Casos de uso concretos.** Cuándo activarla y cuándo no. Una skill con
   un alcance claro rinde más que una que intenta resolver de todo.

3. **Ejemplos que funcionan de verdad.** Ejecutables y copiables, sin
   marcadores pendientes ni rutas que solo existen en tu máquina. Un ejemplo
   roto enseña lo contrario de lo que debería.

4. **Sin secretos ni datos personales.** Ni tokens, ni claves, ni rutas
   privadas, ni nombres de clientes. Vale la pena revisar el diff antes de
   abrirlo.

5. **Licencia compatible.** Contenido original, o de una licencia que permita
   la redistribución bajo MIT. Si copiaste material de terceros, decláralo.

6. **Probada con al menos un agente.** Al menos uno de los declarados en
   `compatibility`, en una instalación real. Declara la lista de verdad, no
   la que te gustaría.

---

## Proponer una categoría nueva

Una categoría es una carpeta con un nombre y una descripción. Añadir
contenido **no toca el sitio**: el catálogo se construye leyendo las carpetas
del repositorio.

El proceso son tres pasos:

1. **Abre una issue** con la plantilla de issue, describiendo qué resuelve el
   área y qué skills reutilizables aporta. Se acepta cuando el área tiene al
   menos **tres skills reutilizables** y una descripción clara de qué
   resuelve.

2. **Se implementa** creando la carpeta en `skills/` y añadiendo una entrada
   al mapa de categorías. Ese mapa es `CATEGORY_META` en
   `frontend/src/lib/skills.ts`, y es la única excepción a la regla de no
   tocar `frontend/`: una carpeta no puede describirse sola, así que cada
   categoría necesita un nombre visible, una frase y un icono. Añadir una
   clave es todo el coste de una categoría nueva.

3. **No hace falta nada más.** Añadir `skills/<categoría>/<skill>/` con su
   `SKILL.md` es suficiente para que la categoría aparezca en el catálogo,
   sin una sola línea de código modificada.

---

## Scripts ejecutables dentro de una skill

Una skill puede incluir una carpeta `scripts/`. Es una capacidad legítima y
hay casos de uso evidentes.

La política tiene **cuatro reglas, y no son negociables**:

1. **Todo script se declara en el frontmatter.** Un campo de declaración
   lista los scripts ejecutables y su propósito. Un script sin declarar no
   se instala.

2. **Todo script exige revisión obligatoria antes de fusionar.** No es una
   revisión más: es un punto de bloqueo. Quien lo revise tiene que leerlo.

3. **Una skill de la categoría `security` no incluye scripts.** Una skill
   que audita no ejecuta nada por su cuenta.

4. **El aviso es visible al instalar.** `add` y `update` muestran qué
   scripts se instalan, siempre, incluso con `--dry-run`.

`npx fwskills add` **copia** los scripts al disco: no los ejecuta. El punto de
control es el pull request, no la instalación. Por eso un script sin
declarar en el frontmatter es un defecto, no un detalle de estilo.

---

## Seguridad

Un catálogo abierto significa que cualquiera puede proponer una skill. El
control de calidad es la revisión.

**Si una skill instalada hace algo que no debería** —envía datos a un
tercero, ejecuta un script que no declara, copia rutas fuera del proyecto— no
abras un issue público. Repórtalo por el canal privado de avisos de
seguridad: [Reportar un aviso de seguridad][advisory].

Incluye la referencia de la skill, qué hace y cómo se reproduce. Recibirás
acuse de recibo, la discusión ocurre en privado hasta que haya una
corrección, y el aviso aparece en las notas de la versión que lo corrige. La
skill se retira del catálogo si el problema es del contenido y no de una
versión concreta.

[advisory]: https://github.com/orlandotellez/fwskills/security/advisories/new

---

## Recursos

Los cuatro documentos que conviene leer antes de abrir el primer pull request:

| Documento | Qué resuelve |
|---|---|
| `CONTRIBUTING.md` (este) | Cómo se aporta una skill, paso a paso. |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Cómo nos tratamos al revisar y discutir. |
| [GOVERNANCE.md](GOVERNANCE.md) | Los tres roles, cómo se decide y quién mantiene qué. |

Plantillas:

- **Issue**: usa la plantilla de issue al abrirla.
- **Pull request**: repite los seis puntos del checklist de calidad.

---

## Antes de abrir el pull request

```bash
cd frontend
bun run validate    # el esquema de las SKILL.md
bun run check       # puerta de tipos
bun test            # tests de contrato
bun run build       # el sitio se genera
```

Los cuatro tienen que pasar. Si `build` falla con un error de esquema, casi
siempre es un campo del frontmatter.
