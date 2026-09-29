---
title: Versionado
description: SemVer para las skills y para el CLI, cómo se publican las versiones, qué hace update y cómo fijar una versión.
sidebar:
  label: Versionado y releases
---

Hay dos versiones distintas en este proyecto y se mueven de forma independiente:

- La **versión de una skill**, en su frontmatter. Es la que muestra su ficha y la
  que `update` compara.
- La **versión del paquete npm**, la del CLI. Es la que imprime
  `npx fwskills --version`.

Publicar un CLI nuevo no obliga a reversionar ninguna skill, y reversionar una
skill no obliga a publicar un CLI.

## SemVer

Las dos versiones usan SemVer: `X.Y.Z`.

| Parte | Significado | Ejemplo |
|---|---|---|
| Mayor | Cambio incompatible | `1.0.0` → `2.0.0` |
| Menor | Funcionalidad nueva compatible | `1.0.0` → `1.1.0` |
| Parche | Corrección sin cambio de comportamiento | `1.0.0` → `1.0.1` |

Para el CLI, en concreto:

| Cambio | Versión |
|---|---|
| Un comando desaparece, un flag cambia de significado, un código de salida se reasigna | Mayor |
| Un comando nuevo o un flag nuevo | Menor |
| Un mensaje o una ruta corregidos | Parche |

Los códigos de salida son parte de la API. Que `add` devuelva 4 significa algo
concreto, y la gente escribe scripts alrededor del CLI, así que reasignar un código
es un cambio incompatible aunque el mensaje sea parecido.

## Publicación

Cada skill se publica en el registro público de npm como un tarball independiente,
sin credenciales de lectura. La versión es la del campo `version` del frontmatter, y
`npm` exige que una versión publicada no se reutilice: si corriges algo, sube el
número.

El proceso de publicación del CLI es una lista de comprobación con un comando por
paso, y termina comprobando que la versión de `package.json`, la etiqueta de git
`v<major>.<minor>.<patch>` y la entrada del changelog declaran el mismo número. Una
etiqueta sin entrada de changelog es una release que nadie puede entender.

## Comportamiento de `update`

`update` actualiza a la versión publicada las skills **instaladas por el CLI**:

```bash
npx fwskills update
```

```text
info: 3 skills instaladas
info: 2 actualizaciones disponibles
update: specs/create-specs 2.0.0 -> 2.1.0
update: design/glassmorphism 1.1.0 -> 1.2.0
update: design/dark-luxury sin cambios
update: 2 skills actualizadas, 1 sin cambios
```

Para ver qué cambiaría sin tocar nada:

```bash
npx fwskills update --dry-run
```

```text
dry-run: 2 actualizaciones disponibles: specs/create-specs (2.0.0 -> 2.1.0), design/glassmorphism (1.1.0 -> 1.2.0)
```

Tres cosas que conviene tener claras sobre `update`:

1. **Sin argumento actualiza todas.** No pregunta cuáles: aplica las
   actualizaciones disponibles y termina.
2. **Solo actúa sobre skills instaladas por el CLI.** Cada instalación escribe un
   archivo de manifiesto `<destino>/<categoría>/<slug>/.fwskills.json` con la
   versión instalada y la fecha. No es un archivo de la skill: lo genera el CLI,
   nunca se sobrescribe al actualizar y solo se compara. Por eso una skill que
   copiaste a mano en tu carpeta no se actualiza, ni se rompe.
3. **Valida antes de escribir.** Una versión recién descargada que no cumpla el
   esquema de 8 campos termina con el código 5 y no corrompe la instalación
   existente.

## Fijar una versión

`add` instala la versión publicada en el momento de la ejecución. Si necesitas
reproducir exactamente lo que se instaló, hay dos formas, y las dos están en el
cliente, no en el servidor:

- **Guardar el manifiesto.** El archivo `.fwskills.json` que dejó la instalación
  dice qué versión quedó escrita. Versionarlo con tu proyecto es la forma más
  barata de fijar el estado.
- **Copiar la skill fuera del destino.** Una carpeta de skill es texto plano. Copiada
  a un repositorio propio, es un pin exacto que no depende del registro.

Lo que **no** hay es un flag de versión: `--force` sobrescribe, no fija. Fijar una
versión es una decisión de tu proyecto, no del CLI, y por eso se toma con un
archivo versionado y no con un argumento.

## Por qué la versión se muestra en el catálogo

La ficha de cada skill muestra su versión y la **fecha de última actualización**,
que se resuelve en el despliegue desde el último commit de la carpeta de la skill.

La fecha importa tanto como el número, y por un motivo concreto: una skill sin
fecha de última actualización no se puede evaluar. Un número de versión menor, con
cambios dos veces al mes, es más reciente que un número alto y congelado hace un
año. Las dos señales juntas dicen si vale la pena leer los cambios antes de
instalar.

## Ver también

- [CLI: fwskills update](/docs/cli/update/): el comando con y sin nombre de skill.
- [CLI: fwskills info](/docs/cli/info/): la versión y la metadata resuelta de una
  skill.
- [Changelog](/docs/changelog/): el historial de releases del CLI.
