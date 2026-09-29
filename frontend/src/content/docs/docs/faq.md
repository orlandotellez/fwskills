---
title: FAQ
description: Preguntas frecuentes sobre qué es fwskills, dónde se instalan las skills, cómo contribuir y qué hacer cuando un comando falla.
sidebar:
  label: FAQ
---

## Conceptos

### ¿Qué es una skill?

Una carpeta con un archivo `SKILL.md` que le dice a tu agente de IA cómo hacer una
tarea concreta. No es un plugin que se compile ni un binario: es contexto que el
agente lee y sigue. El detalle completo está en
[qué es una skill](/docs/introduccion/) y en
[anatomía de una skill](/docs/anatomia-de-una-skill/).

### ¿Es gratis?

Sí. El sitio, el repositorio y el paquete npm son públicos, y no hay versión de
pago ni de pago por uso. La única cuenta que existe en todo el camino es la de
GitHub, y solo hace falta para contribuir.

### ¿Necesito cuenta para usar el CLI?

No. `npx fwskills` descarga el paquete público, lo ejecuta y no pide autenticación
en ningún paso. No hay registro, ni panel de administración, ni telemetría. Si
prefieres instalarlo de forma permanente, `npm install -g fwskills` también funciona
y expone el mismo binario.

### ¿Qué diferencia hay entre una skill y un plugin?

Un plugin se instala, se compila o se configura. Una skill se copia: es una carpeta
de archivos de texto que el agente lee cuando su contrato de activación coincide
con lo que le has pedido. No se ejecuta nada al instalarla, y el CLI no lanza
nada de lo que descarga.

### ¿Las skills se ejecutan solas?

No. El CLI copia archivos y nada más. Una skill puede incluir `scripts/`, y esos
scripts los ejecutará el agente cuando la persona lo decida, no el instalador. El
punto de control es el pull request que aprobó la skill, no la instalación.

## Instalación

### ¿Dónde se instala?

En la carpeta que usa tu agente dentro del proyecto: `.opencode/skills/`,
`.agents/skills/` o `.pi/skills/`, según cuál detecte el CLI. La carpeta creada es
`<destino>/<categoría>/<slug>/`, de modo que el destino mantiene la misma estructura
que el catálogo. Para instalar fuera del proyecto, o en otro sitio concreto, está
`--dir`.

### ¿Cómo desinstalo una skill?

Con el mismo ámbito con el que la instalaste:

```bash
npx fwskills remove specs/create-specs --yes
```

El CLI solo borra lo que él construyó. Si añadiste archivos a mano dentro de la
carpeta, los conserva y los avisa por `stderr`. Para desinstalar de la configuración
global, repite el comando con `--global`.

### ¿Se actualiza sola?

Ni las skills ni el CLI se actualizan solos. Las skills se actualizan cuando
ejecutas `npx fwskills update`, y el CLI se actualiza cuando lo pides a `npx`, que
resuelve siempre la última versión publicada. El detalle está en
[versionado](/docs/versionado/).

### ¿Tengo que ejecutar `init` antes de `add`?

Solo si tu proyecto todavía no tiene la carpeta de skills de tu agente. `init` crea
las carpetas de destino de los agentes que detecta, y es el paso que evita el error
más frecuente: ejecutar `add` sin destino y recibir el código de salida 7.

## Contribución

### ¿Qué pasa si mi skill tiene scripts?

Pasan revisión obligatoria antes de aceptarse. El CLI no los ejecuta nunca, así que
la revisión es el punto de control: quien lee el pull request mira qué hace el
script, qué toca y qué lee del entorno. Un script que solo lee y formatea suele
aceptarse sin discusión; uno que escribe fuera del proyecto, hace peticiones de red
o lee secretos necesita un motivo explícito en la descripción.

### ¿Puedo subir una categoría nueva?

Puedes proponerla, y es lo que se hace cuando ninguna de las cuatro encaja. Una
categoría es una subcarpeta de `skills/`, así que el coste técnico es cero. Lo que
se discute en la issue es si el área justifica su propio espacio en el catálogo.
Si la respuesta es que sí, la subcarpeta nueva aparece en el catálogo sin tocar
ninguna configuración.

### ¿La documentación está en español y mis skills en inglés?

Sí, y está bien así. El sitio está escrito en español; las skills del catálogo
están en inglés porque su lector principal es el agente. Escribe cada skill en el
idioma que mejor funcione para quien la va a leer.

### ¿Cuánto tarda una skill en estar disponible?

Desde que se fusiona, aparece en el catálogo en el siguiente despliegue del sitio.
No hay un paso de registro adicional.

## Solución de problemas

### El comando no encuentra la skill

El error es `not found` y el código de salida es 3. Ocurre cuando la referencia
existe en formato pero no en el catálogo, o cuando la categoría no existe. Comprueba
el nombre con la búsqueda, que ignora mayúsculas y acentos:

```bash
npx fwskills search specs
```

Si la búsqueda tampoco encuentra nada, el nombre probablemente sea otro: los
caracteres `\` se normalizan a `/`, pero un espacio interior, un acento o un `..`
en la referencia hacen que la validación la rechace con el código 2.

### La carpeta de destino no existe

El error es `no se detectó ninguna configuración de agente en este proyecto`, con
el código de salida 7. El CLI no detectó ninguna carpeta de agente en el directorio
desde el que lo ejecutaste, y sin `--dir` no hay dónde instalar. Se arregla
ejecutando `init` en el proyecto, o pasando la ruta:

```bash
npx fwskills init
```

```bash
npx fwskills add specs/create-specs --dir ~/skills
```

### No tengo red

El error es de red, con el código de salida 6. El CLI no pudo resolver o descargar
el paquete desde el registro de npm, y no instala nada a medias: o termina entero o
no escribe. `list`, `search` e `info` también necesitan red. Lo que funciona sin
red es `remove`, porque solo borra archivos locales.

### Hay archivos existentes y no los sobrescribe

El CLI avisa y sale con el código 4, sin tocar nada. Es el comportamiento correcto:
no destruye trabajo que puede ser tuyo. Si en efecto quieres reemplazar, decide
una de dos cosas: pasar `--force` para sobrescribir, o `npx fwskills remove <skill>
--yes` y volver a instalarla.

### La validación de una skill falla

`npm run validate` imprime una línea `error:` por archivo inválido, con la ruta, el
campo, lo esperado y lo recibido, y termina con 1. Los casos más frecuentes son
`featured: "sí"` en lugar de un booleano estricto, un `version` que no es SemVer, y
un `category` que no coincide con la subcarpeta que contiene el archivo.

## Ver también

- [Referencia del CLI](/docs/cli/init/): los siete comandos, los seis flags y los
  siete códigos de salida.
- [Crear una skill](/docs/crear-una-skill/): el tutorial completo para publicar una.
- [Página de contribución](/contribuir): roles, checklist de calidad y proceso de
  revisión.
