---
title: "CLI: fwskills search"
description: Busca skills en el catálogo por nombre, descripción y etiquetas, ignorando mayúsculas y acentos.
sidebar:
  label: search
  order: 3
---

## Sintaxis

```bash
npx fwskills search <consulta>
```

## Descripción

Busca skills por nombre, por descripción y por etiquetas. La comparación ignora
mayúsculas y acentos, y coincide por subcadena: `spec` encuentra `create-specs` y
también `especificacion`.

La consulta es obligatoria. `npx fwskills search` sin argumento es un error de uso
con código 2, no una búsqueda de todo: devolver el catálogo entero cuando alguien
quiso filtrar es exactamente el tipo de sorpresa que este CLI evita.

## Opciones

Ninguna propia. Acepta los flags globales `--yes` y `--dry-run`, que no alteran el
resultado de la búsqueda.

Para acotar por categoría en lugar de por texto, está
[`list --category`](/docs/cli/list/).

## Ejemplos

```bash
npx fwskills search specs
```

```text
specs/create-specs                     2.0.0   specs
specs/create-specs-from-code           1.0.0   specs

search: 2 resultados para "specs"
```

```bash
npx fwskills search oscuro
```

```text
design/dark-luxury                     1.0.0   design

search: 1 resultado para "oscuro"
```

El término `oscuro` es una etiqueta de `dark-luxury`, y con tilde se encontraría
igual: la comparación ignora los acentos.

```bash
npx fwskills search dashboard
```

```text
design/minimal-dashboard               1.0.0   design

search: 1 resultado para "dashboard"
```

```bash
npx fwskills search blockchain
```

```text
search: 0 resultados para "blockchain"
```

Cero resultados es un resultado, no un error: el comando termina con 0.

## Errores

| Situación | Código | Qué significa |
|---|---|---|
| Búsqueda ejecutada, con o sin resultados | 0 | La consulta se resolvió. Sin coincidencias no es un fallo |
| Consulta vacía | 2 | Falta el argumento obligatorio `<consulta>`. El mensaje dice cuál se esperaba |
| Error no previsto | 1 | Fallo no cubierto por ninguna otra clase, con la traza si `DEBUG` está activo |

## Ver también

- [CLI: fwskills list](/docs/cli/list/): listado completo y filtro por categoría.
- [CLI: fwskills add](/docs/cli/add/): instalar lo que la búsqueda encontró.
- [Flags](/docs/cli/flags/): los 6 flags del CLI.
