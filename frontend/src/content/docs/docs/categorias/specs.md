---
title: Categoría specs
description: "Skills para documentar un proyecto antes de escribir una línea de código: procesos de especificación, arquitectura y tareas."
sidebar:
  label: specs
  order: 1
---

La categoría `specs` cubre el trabajo que ocurre **antes** de la primera línea de
código: entender qué se va a construir, escribirlo con la suficiente precisión como
para que otra persona lo implemente sin preguntar, y dejar las tareas Concrete
alguien pueda empezar mañana.

## Qué resuelve

Un agente que empieza a escribir código sin especificación produce software que
funciona y que nadie entiende seis meses después. Las skills de esta categoría
disciplinan el orden: primero la decisión, después el documento, después la tarea,
y solo entonces el código.

Cubren tres Momentos del proyecto:

- **Proyecto nuevo**: el árbol de especificación completo, con documentación, módulos
  y listas de tareas.
- **Código existente**: reconstruir la especificación a partir del código real que
  ya está escrito.
- **Verificación**: comprobar que la especificación y el código no se han
  desincidido.

## Skills de la categoría

| Skill | Qué hace |
|---|---|
| [`create-specs`](/skills/specs/create-specs/) | Crea la carpeta `specs/` de un proyecto nuevo: documentación, módulos por backend, db y frontend, y tareas por módulo. Es la más nueva de la categoría, en su versión 2.0.0 |
| [`create-specs-from-code`](/skills/specs/create-specs-from-code/) | Construye la misma estructura de especificación leyendo un proyecto que ya existe, para que la documentación describa lo que hay y no lo que debería haber |

Ambas se instalan con la misma forma:

```bash
npx fwskills add specs/create-specs
```

```bash
npx fwskills add specs/create-specs-from-code
```

## Qué hace buena a una skill de esta categoría

- **Empieza por el problema, no por la solución.** Una especificación que describe
  la arquitectura antes de decir qué tiene que resolver es un documento que se
  escribe dos veces.
- **Nombra entidades, endpoints, pantallas y campos reales.** El texto que podría
  estar en cualquier proyecto no es una especificación: es un marcador, y aquí está
  prohibido.
- **Detecta el stack antes de escribir.** Una skill que genera contenido genérico
  para un proyecto en TypeScript y para uno en .NET no está haciendo su trabajo.
- **Deja el trabajo rastreable.** Las tareas son la fuente única del trabajo de
  implementación: con una sección de estado actual y una lista numerada de
  acciones, cada casilla marcada es avance y ninguna casilla se puede perder.
- **Escribe en el idioma del repositorio.** Un repositorio en inglés recibe
  documentos en inglés; uno en español, en español.

## Ver también

- [Crear una skill](/docs/crear-una-skill/): el tutorial para publicar aquí.
- [Anatomía de una skill](/docs/anatomia-de-una-skill/): los 8 campos del
  frontmatter.
- [Categoría design](/docs/categorias/design/): la otra categoría con skills
  publicadas.
