---
title: Anatomía de una skill
description: La carpeta de una skill, los 8 campos de su frontmatter, para qué sirven references, scripts y assets, y las reglas de nombre.
sidebar:
  label: Anatomía de una skill
---

Una skill es una carpeta. Dentro hay exactamente un `SKILL.md` obligatorio y, si
hace falta, tres carpetas opcionales. El `SKILL.md` tiene dos partes separadas por
`---`: el **frontmatter**, que es la ficha que leen el CLI y el sitio, y el
**cuerpo**, que es lo que tu agente lee y sigue.

## Estructura de la carpeta

```bash
skills/design/dark-luxury/
├── SKILL.md
├── references/
│   └── tokens.md
├── scripts/
│   └── comprobar-contrast.mjs
└── assets/
    └── paleta.svg
```

| Elemento | Obligatorio | Para qué sirve |
|---|---|---|
| `SKILL.md` | Sí | El frontmatter es la ficha; el cuerpo es el contrato de activación, las reglas y el flujo que sigue el agente |
| `references/` | No | Documentación extensa que se consulta bajo demanda. Saca del `SKILL.md` lo que no hace falta leer en cada activación |
| `scripts/` | No | Utilidades ejecutables de la skill. El CLI **no** las ejecuta: las ejecuta el agente, y solo cuando la persona decide hacerlo |
| `assets/` | No | Archivos que la skill usa como salida: plantillas, diagramas, iconos, datos de ejemplo |

La regla que sostiene la separación: `SKILL.md` es lo que se lee siempre, y
`references/` es lo que se lee cuando hace falta. Una skill cuyo `SKILL.md` tiene
mil líneas se lee peor que una que tiene doscientas y cuatro referencias.

## Los 8 campos del frontmatter

Los ocho campos son obligatorios y no tienen valores por defecto. Un campo ausente
es un fallo de validación, no una invitación a inventar un valor: el mismo
frontmatter alimenta la ficha del catálogo y la instalación del CLI, y un valor
inventado produce una ficha que miente.

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `name` | string | Sí | Identificador estable en kebab-case. Debe ser igual al nombre de la carpeta, porque es contra lo que resuelve `npx fwskills add <categoría>/<slug>` |
| `description` | string | Sí | Una frase, entre 20 y 240 caracteres, que dice qué hace la skill. Se recorta a dos líneas en la tarjeta del catálogo |
| `category` | string | Sí | Slug de la categoría en kebab-case. Debe coincidir con la subcarpeta que contiene el archivo |
| `version` | string SemVer | Sí | Versión de la skill, con formato `X.Y.Z`. La compara `update` y la muestra su ficha |
| `author` | string o lista de strings | Sí | Usuario o URL de perfil, con un formato resoluble |
| `tags` | lista de strings | Sí | Términos de búsqueda. Alimentan `npx fwskills search` |
| `compatibility` | lista de strings | Sí | Agentes en los que la skill puede instalarse. Ver [compatibilidad](/docs/compatibilidad/) |
| `featured` | booleano estricto | Sí | `true` o `false`. Un string como `"true"` se rechaza |

Los tipos son estrictos a propósito: `featured: 1`, `featured: "sí"`,
`tags: "uno, dos"` y `version: "1.0"` se rechazan. El mensaje de error nombra el
archivo, el campo, lo esperado y lo recibido, para que no haga falta abrir el
código para entender qué corregir.

## La regla de las dos líneas

`description` es lo primero que se lee de una skill, tanto en la tarjeta del
catálogo como en el resultado de `search`. Por eso está limitada a dos líneas y a
una sola frase.

Una buena descripción dice **qué hace la skill**, no para qué sirve el proyecto
entero. La diferencia se ve en tres ejemplos:

| Descripción | Por qué funciona o no |
|---|---|
| `Crea la carpeta specs/ para un proyecto nuevo: docs, módulos por backend, db y frontend, y listas de tareas por módulo.` | Dice qué produce y en qué momento del proyecto se usa |
| `Ayuda con proyectos de software.` | No dice qué hace ni cuándo activarla; no es accionable |
| `Genera especificaciones técnicas completas, con arquitectura, endpoints, entidades y tareas, a partir de una descripción del proyecto.` | Correcta, pero ocupa tres líneas en la tarjeta del catálogo |

## Reglas de nombre

| Regla | Detalle |
|---|---|
| Formato | `kebab-case`: minúsculas, dígitos y guiones, con el patrón `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| Sin acentos | `especificacion` sí, `especificación` no. Un acento hace que la referencia no se pueda escribir en una terminal |
| El nombre coincide con la carpeta | El campo `name` debe ser igual al nombre de la carpeta que contiene el `SKILL.md` |
| La categoría coincide con la subcarpeta | Una skill que declara `category: qa` y vive en `design/` se rechaza |
| Referencia completa | Siempre `<categoría>/<slug>`, tal como aparece en el catálogo |

## Ejemplo completo

```yaml
---
name: dark-luxury
description: "Design and build websites and web apps in the \"Dark Luxury\" style — restrained sophisticated dark premium aesthetic, near-black warm backgrounds, hairline borders, one warm metallic accent."
category: design
version: 1.0.0
author: "orlandotellez"
tags: [oscuro, premium, editorial]
compatibility: ["opencode", "agents", "pi", "claude"]
featured: true
---
```

Después del `---` de cierre empieza el cuerpo, que es la parte que sigue el agente.
Un cuerpo eficaz tiene tres bloques, en este orden:

1. **Contrato de activación**: cuándo se activa la skill y con qué se la invoca.
2. **Reglas duras**: lo que el agente no puede saltarse, con el motivo de cada una.
3. **Flujo**: los pasos concretos, en orden, y las puertas de decisión entre ellos.

La descripción del frontmatter y el contrato de activación no son lo mismo: la
primera es para quien elige la skill en el catálogo, y el segundo es para el agente
que ya la está ejecutando.

## Ver también

- [Crear una skill](/docs/crear-una-skill/): el tutorial de la primera skill.
- [Categorías](/docs/categorias/design/): dónde encaja cada tipo de trabajo.
- [CLI: fwskills info](/docs/cli/info/): la metadata resuelta de una skill del
  catálogo, sin instalar nada.
- [Versionado](/docs/versionado/): qué significa la versión de una skill.
