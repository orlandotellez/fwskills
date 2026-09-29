---
title: Qué es una skill
description: Definición de skill, qué hace y por qué es una carpeta con un SKILL.md, no un plugin.
sidebar:
  label: Qué es una skill
---

Una **skill** es una carpeta con un archivo `SKILL.md` que le dice a tu agente de IA cómo hacer una tarea concreta. No es un plugin que se compila ni un binario que se ejecuta: es **contexto** que tu agente lee y sigue.

```bash
skills/
└── specs/
    └── create-specs/
        ├── SKILL.md
        └── references/
```

## ¿Qué resuelve?

Los agentes de IA hacen mejor una tarea cuando tienen instrucciones claras, ejemplos y reglas del ámbito. Eso es exactamente lo que hay dentro de cada `SKILL.md`:

- **Cuándo activarse**: el contrato de activación del archivo.
- **Cómo actuar**: el flujo paso a paso que el agente debe seguir.
- **Qué no hacer**: los límites y las cualidades que hay que cuidar.

## ¿Qué NO es una skill?

- No es un plugin que requiera instalación de binarios.
- No es una plantilla de prompt suelta: sigue un formato con campos estables.
- No ejecuta código por sí sola: los scripts que una skill declara pasan revisión obligatoria antes de aceptarse.

## Filosofía

Sin cuentas, sin telemetría, sin panel de administración. Una skill es un archivo de texto versionado en Git: cualquiera puede leerla, revisarla y proponer mejoras.

## Siguiente paso

La instalación lleva menos de un minuto. Seguí por [primeros pasos](/docs/primeros-pasos/).