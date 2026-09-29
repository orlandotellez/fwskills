---
title: Crear una skill
description: "De cero a pull request: elegir categoría, crear la carpeta, escribir el SKILL.md, validar en local y abrir la propuesta."
sidebar:
  label: Crear una skill
---

El catálogo es un conjunto de carpetas en un repositorio abierto. Añadir una skill
es añadir una carpeta, escribir un `SKILL.md` y abrir un pull request. No hay
comité, ni registro, ni lista de acceso: la única condición es que la skill sea
útil y esté bien escrita.

Este tutorial lleva una skill desde cero hasta el pull request abierto.

## 1. Haz un fork

El repositorio es público y cualquiera trabaja sobre su propia copia. No hay
permisos que pedir ni cuentas que crear.

```bash
git clone https://github.com/tu-usuario/fwskills.git
cd fwskills
```

## 2. Elige la categoría

Una categoría es el área donde la skill aporta. Revisa las cuatro antes de crear
una nueva:

| Categoría | Qué cubre |
|---|---|
| [specs](/docs/categorias/specs/) | Documentar un proyecto antes de escribir código |
| [design](/docs/categorias/design/) | Sistemas visuales completos |
| [qa](/docs/categorias/qa/) | Revisión, pruebas y control de calidad |
| [security](/docs/categorias/security/) | Auditoría, superficie de ataque y respuesta a incidentes |

Si ninguna encaja, no la fuerces dentro de una: propón una categoría nueva en una
issue. Una categoría es una subcarpeta de `skills/`, así que el coste técnico es
cero; lo que cuesta más es decidir si el área justifica su propio espacio.

## 3. Crea la carpeta

```bash
mkdir -p skills/specs/mi-skill-de-specs
```

La ruta es `skills/<categoría>/<nombre>/`, en minúsculas, con guiones y sin
acentos. El nombre de la carpeta tiene que ser exactamente el que pongas en el
campo `name` del frontmatter.

## 4. Escribe el SKILL.md

Empieza por el frontmatter con los 8 campos. Si alguno falta, la validación falla:

```yaml
---
name: mi-skill-de-specs
description: "Genera el índice de contenidos de un árbol de specs/ existente y comprueba que cada módulo enlaza con su archivo de tareas."
category: specs
version: 0.1.0
author: "tu-usuario"
tags: [specs, indice, verificacion]
compatibility: ["opencode", "agents", "pi"]
featured: false
---
```

Después del `---` de cierre va el cuerpo, con los tres bloques que hacen que una
skill funcione: contrato de activación, reglas duras y flujo. Los detalles de cada
uno, y el ejemplo de las dos líneas de `description`, están en
[anatomía de una skill](/docs/anatomia-de-una-skill/).

Si la skill necesita documentación larga, scripts o plantillas, añádelos ahora en
sus carpetas: `references/`, `scripts/` y `assets/`.

## 5. Valida en local

```bash
npm run validate
```

El comando recorre `skills/**/SKILL.md` y aplica la misma regla de 8 campos que usa
el CLI. Imprime una línea por skill válida, una línea `error:` por archivo inválido
con su ruta y su campo, y termina con 0 si todas valen o con 1 en caso contrario.

```text
ok      skills/design/dark-luxury
ok      skills/specs/mi-skill-de-specs
```

La validación local añade cuatro reglas que solo tienen sentido en el repositorio:
que `category` coincida con la subcarpeta, que `version` sea SemVer, que el nombre
de la carpeta esté en minúsculas y sin acentos, y que no haya patrones de token o
clave privada en el archivo.

## 6. Comprueba que aparece en el catálogo

El catálogo se construye desde los archivos, así que una skill nueva aparece en el
siguiente despliegue sin tocar ninguna configuración:

```bash
npx fwskills list --category specs
```

```text
specs/create-specs                     2.0.0   specs
specs/create-specs-from-code           1.0.0   specs
specs/mi-skill-de-specs                0.1.0   specs

list: 3 skills en 1 categoría
```

Y para ver la metadata con la que se resolverá al instalarse:

```bash
npx fwskills info specs/mi-skill-de-specs
```

## 7. Abre el pull request

```bash
git add skills/specs/mi-skill-de-specs
git commit -m "feat(specs): añadir la skill mi-skill-de-specs"
git push origin mi-skill-de-specs
```

Abre el pull request desde tu fork usando la plantilla, que pide el checklist de
calidad de la página de contribución. Rellenarla completa es la forma más rápida
de que la primera revisión pase sin pedir cambios.

El proceso completo, con los roles y el checklist, está en [la página de
contribución](/contribuir).

## Qué revisa la revisión

Seis puntos, y todos se miran:

1. **Descripción clara de la tarea que resuelve.** Una o dos frases en el
   frontmatter, diciendo qué hace la skill. Es lo primero que se lee: si no se
   entiende, no se instala.
2. **Casos de uso concretos.** Cuándo activarla y cuándo no. Una skill con un
   alcance claro rinde más que una que intenta resolver de todo.
3. **Ejemplos que funcionan de verdad.** Ejecutables y copiables, sin marcadores
   pendientes ni rutas que solo existen en la máquina de quien los escribió.
4. **Sin secretos ni datos personales.** Ni tokens, ni claves, ni rutas privadas,
   ni nombres de clientes.
5. **Licencia compatible.** Contenido original, o de una licencia que permita la
   redistribución bajo MIT. Si copiaste material de terceros, decláralo.
6. **Probada con al menos un agente.** Al menos uno de los declarados en
   `compatibility`, en una instalación real. Declara la lista de verdad, no la que
   te gustaría.

Si la skill incluye `scripts/`, la revisión mira esos scripts con más atención: el
CLI nunca los ejecuta, así que el punto de control es el pull request que aprobó la
skill.

## Ver también

- [Anatomía de una skill](/docs/anatomia-de-una-skill/): los 8 campos y las reglas
  de nombre.
- [FAQ](/docs/faq/): preguntas sobre contribución, scripts y categorías nuevas.
- [CLI: fwskills add](/docs/cli/add/): cómo se instala lo que acabas de publicar.
