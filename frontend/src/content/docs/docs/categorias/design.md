---
title: Categoría design
description: "Skills para sistemas visuales completos: estilos concretos, tokens y reglas, no fragmentos de CSS sueltos."
sidebar:
  label: design
  order: 2
---

La categoría `design` cubre la capa visual de una aplicación: no un color ni un
botón, sino un **sistema** que un agente pueda aplicar de principio a fin sin
inventar decisiones por el camino.

## Qué resuelve

Pedirle a un agente "hazlo oscuro y elegante" produce interfaces que se parecen
entre sí durante unos minutos y que se desvanecen en cuanto hay que añadir una
tabla de datos. El problema no es la falta de criterio, es la falta de
especificación: sin tokens, sin reglas de jerarquía y sin límites explícitos, cada
pantalla se resuelve por separado y el resultado no es un sistema.

Una skill de `design` arregla eso declarando el sistema completo: la paleta con su
papel, la tipografía con su escala, los espaciados, los bordes, los estados
interactivos y, sobre todo, **qué no se hace**.

## Skills de la categoría

| Skill | Versión | Qué define |
|---|---|---|
| [`dark-luxury`](/skills/design/dark-luxury/) | 1.0.0 | Oscuro sofisticado y contenido: fondos casi negros y cálidos, bordes de un píxel, un único acento metálico cálido, tipografía editorial |
| [`glassmorphism`](/skills/design/glassmorphism/) | 1.1.0 | Paneles de vidrio esmerilado con desenfoque de fondo, capas translúcidas y profundidad flotante |
| [`minimal-dashboard`](/skills/design/minimal-dashboard/) | 1.0.0 | Paneles de administración densos en datos: interfaz casi negra con el color reservado para el significado, no para decorar |
| [`minimal-light`](/skills/design/minimal-light/) | 1.1.0 | Claro y editorial: fondos blancos, mucho aire, un solo acento contenido y bordes finos |
| [`neo-brutalist`](/skills/design/neo-brutalist/) | 1.0.0 | Color saturado, bordes negros gruesos, sombras duras sin desenfoque y estructura a la vista |

Se instalan por su referencia completa:

```bash
npx fwskills add design/dark-luxury
```

```bash
npx fwskills add design/minimal-dashboard
```

## Qué hace buena a una skill de esta categoría

- **Declara los límites.** «Nada de sombras difusas» y «un solo acento» son las
  frases que separan un sistema de una colección de decisiones. Sin límites, el
  agente se desvía en la primera pantalla difícil.
- **Nombra los roles, no los colores.** «Acento metálico cálido» sobrevive a un
  cambio de paleta. Un valor literal en hexadecimal no sobrevive ni al siguiente
  diseño, y encima no le dice nada a quien lee la skill.
- **Cubre los estados que nadie recuerda.** Hover, focus, disabled, vacío, carga y
  error. Un sistema sin estados es un sistema que se completa a mano, mal.
- **Distingue cuándo no activarse.** Un panel de administración no es una landing, y
  una skill que se activa para todo termina compitiendo con otra.
- **Declara sus incompatibilidades.** Los sistemas visuales son excluyentes entre
  sí. Decir con qué skill no se combina es más útil que tener un buen criterio
  prolijo.

## Ver también

- [Categoría specs](/docs/categorias/specs/): documentar antes de codificar.
- [Crear una skill](/docs/crear-una-skill/): el tutorial para publicar aquí.
- [Compatibilidad](/docs/compatibilidad/): en qué agentes se instalan.
