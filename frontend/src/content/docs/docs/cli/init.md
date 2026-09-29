---
title: "CLI: fwskills init"
description: Crea las carpetas de destino de las skills para los agentes detectados en el proyecto. Es el paso previo a add.
sidebar:
  label: init
  order: 1
---

## Sintaxis

```bash
npx fwskills init [--dir <ruta>] [--global] [--yes] [--dry-run]
```

## Descripción

Crea las carpetas de destino de las skills para los agentes detectados en el
proyecto. Es el paso previo a `add`: sin destino, `add` termina con el código de
salida 7.

El CLI no inventa la carpeta de un agente: la busca en el proyecto. Si encuentra
varios, los prepara todos; el orden de preferencia que decide cuál recibe una
instalación es `opencode` → `pi` → `agents` → `claude`.

Que la carpeta ya exista no es un error. `init` es idempotente: la segunda vez
termina con 0 y lo dice.

## Opciones

- `--dir <ruta>` fija una raíz de destino concreta, en vez de la carpeta por
  defecto del agente.
- `--global` prepara el destino global del agente detectado en lugar del local.
- `--yes` no pregunta nada. Es lo que deja el CLI completamente no interactivo.
- `--dry-run` muestra qué carpetas crearía, sin crear ninguna.

## Ejemplos

```bash
npx fwskills init
```

```text
info: agentes detectados: opencode, pi
info: creando /home/usuario/proyecto/.opencode/skills
info: creando /home/usuario/proyecto/.pi/skills
init: 2 carpetas de destino preparadas
```

```bash
npx fwskills init --dry-run
```

```text
dry-run: se habrían creado 2 carpetas de destino
```

```bash
npx fwskills init --dir /home/usuario/skills
```

```text
init: 1 carpeta de destino preparada en /home/usuario/skills
```

## Errores

| Situación | Código | Qué significa |
|---|---|---|
| Al menos un agente detectado, o `--dir` dado | 0 | Las carpetas de destino están preparadas |
| No se detecta ningún agente y no hay `--dir` | 7 | El mensaje indica ejecutar `init` con un `--dir`, o detectar un agente en el proyecto |
| La carpeta ya existe | 0 | No es un error. El mensaje lo indica y el comando termina bien |
| Flag sin valor, como `--dir` sin argumento | 2 | Error de uso: la invocación está incompleta |
| Error no previsto | 1 | Fallo no cubierto por ninguna otra clase, con la traza si `DEBUG` está activo |

## Ver también

- [CLI: fwskills add](/docs/cli/add/): instala una skill en el destino preparado.
- [Flags](/docs/cli/flags/): los 6 flags y la precedencia de destinos.
- [Compatibilidad](/docs/compatibilidad/): qué agentes son y qué carpetas tienen.
