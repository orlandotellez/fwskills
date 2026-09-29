---
title: Primeros pasos
description: Instalar el CLI, instalar tu primera skill, comprobar que llegó al destino y usarla con tu agente. Cuatro comandos y un minuto.
sidebar:
  label: Primeros pasos
---

Si ya sabes [qué es una skill](/docs/introduccion/), esta página es el camino
completo desde cero: instalar el CLI, instalar una skill, comprobar que está en su
sitio y usarla con tu agente. No hace falta cuenta, ni registro, ni configuración
previa.

## Requisitos

| Requisito | Detalle |
|---|---|
| Node.js | 22.12.0 o superior |
| Un agente | opencode, agentes genéricos o pi. La carpeta de cada uno está en [compatibilidad](/docs/compatibilidad/) |
| Un proyecto | Un directorio de trabajo. `init` y `add` operan siempre dentro de un proyecto |

No hace falta instalar el CLI de forma global: todos los comandos de esta
documentación se ejecutan con `npx`, que descarga el paquete, lo ejecuta y lo
descarta.

## 1. Prepara las carpetas de destino

El CLI instala las skills dentro de la carpeta que usa tu agente. Si el proyecto
todavía no la tiene, `init` la crea:

```bash
npx fwskills init
```

```text
info: agentes detectados: opencode, pi
info: creando /home/usuario/proyecto/.opencode/skills
info: creando /home/usuario/proyecto/.pi/skills
init: 2 carpetas de destino preparadas
```

Este paso es opcional si tu agente ya tiene su carpeta de skills. Es lo que evita
el error más común: ejecutar `add` sin destino y recibir el código de salida 7. Si
prefieres verlo antes de que pase, [`--dry-run`](/docs/cli/flags/) muestra lo que
haría sin tocar el disco.

## 2. Instala tu primera skill

```bash
npx fwskills add specs/create-specs
```

```text
info: destino resuelto en /home/usuario/proyecto/.opencode/skills
add: 6 archivos instalados en /home/usuario/proyecto/.opencode/skills/specs/create-specs
```

La skill queda en `<destino>/<categoría>/<slug>/`. La estructura del destino es la
misma que la del catálogo, así que puedes leer los archivos que acabas de instalar
antes de usarlos.

Si quieres ver el plan completo sin escribir nada:

```bash
npx fwskills add specs/create-specs --dry-run
```

## 3. Comprueba la instalación

Dos comprobaciones, una del catálogo y otra del destino:

```bash
npx fwskills list --category specs
```

```text
specs/create-specs                     2.0.0   specs
specs/create-specs-from-code           1.0.0   specs

list: 2 skills en 1 categoría
```

```bash
npx fwskills info specs/create-specs
```

```text
specs/create-specs
  version        2.0.0
  category       specs
  author         orlandotellez
  compatibility  opencode, agents, pi, claude
  tags           especificacion, arquitectura, requisitos
  featured       no

  files (6)
    SKILL.md
    references/checklist.md
    references/ejemplo.md
    scripts/validar.mjs
    assets/diagrama.png
    assets/logo.svg

  destino        /home/usuario/proyecto/.opencode/skills/specs/create-specs
  instalado      no
```

`info` nunca escribe en disco: es el comando seguro para comprobar a mano. La
línea `instalado` dice si la skill está en el destino resuelto.

## 4. Úsala con tu agente

`create-specs` se activa cuando pides al agente crear la carpeta `specs/` de un
proyecto nuevo. No hay comando que lanzar: la skill se activa por lo que pidas.

> Crea la carpeta `specs/` para este proyecto: una API de reservas de hotel con
> Node, Fastify y PostgreSQL.

El agente lee `.opencode/skills/specs/create-specs/SKILL.md`, comprueba que la
petición coincide con su contrato de activación y sigue el flujo que hay dentro. El
resultado es un árbol de especificación en el proyecto.

Para desinstalarla:

```bash
npx fwskills remove specs/create-specs --yes
```

## Qué sigue

- [Anatomía de una skill](/docs/anatomia-de-una-skill/): qué significa cada campo
  del frontmatter y por qué existen los 8.
- [Crear una skill](/docs/crear-una-skill/): el tutorial completo para publicar la
  tuya en el catálogo.
- [Referencia del CLI](/docs/cli/init/): los siete comandos, los seis flags y los
  siete códigos de salida.
- [Categorías](/docs/categorias/specs/): qué resuelve cada área del catálogo.
- [Versionado](/docs/versionado/): qué significa la versión de una skill y qué hace
  `update`.
