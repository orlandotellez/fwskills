---
title: Categoría security
description: Skills para auditoría, análisis de superficie de ataque y reporte de vulnerabilidades. La categoría está declarada y abierta.
sidebar:
  label: security
  order: 4
---

La categoría `security` cubre el trabajo de **mirar el sistema buscando lo que
está mal antes de que lo encuentre alguien más**: auditar, medir la superficie de
ataque, revisar dependencias y reportar hallazgos con la evidencia suficiente para
que otro los confirme.

## Estado actual

La categoría está **declarada y abierta, pero todavía no tiene skills**. Aparece en
el catálogo con su descripción porque las áreas de trabajo del proyecto son cuatro,
y una categoría vacía se declara igual que una poblada: se anuncia que existe sin
inventar contenido para rellenar la ficha. La primera skill publicada aquí la
convierte en una categoría con catálogo, sin tocar ninguna configuración.

En este momento:

```bash
npx fwskills list --category security
```

```text
list: 0 skills
```

## Qué resuelve

Una auditoría útil no es una lista de recomendaciones genéricas, y ahí está el
problema que estas skills atacan. Un informe que repite «use HTTPS» y «valide las
entradas» no ayuda a nadie y entrena a quien lo lee a ignorar los informes. Lo que
hace falta es un método repetible y un umbral explícito de qué se reporta:

- **Superficie de ataque**: qué se puede alcanzar desde fuera, con qué
  autenticación y con qué datos de entrada.
- **Análisis de dependencias**: qué paquetes entran al despliegue, qué versiones se
  traen y qué se sabe de ellas.
- **Revisión de autorización**: dónde se decide si una petición puede hacerse, y si
  esa decisión se comprueba en el servidor o se confía en el cliente.
- **Reporte de vulnerabilidades**: cómo se escribe un hallazgo para que quien lo
  recibe pueda reproducirlo, y cómo se prioriza.

## Qué hace buena a una skill de esta categoría

- **Cada hallazgo es reproducible.** Ruta, método, condición previa y resultado. Un
  hallazgo que no se puede repetir no es un hallazgo, es una sospecha.
- **El impacto se demuestra, no se afirma.** Un fallo de autorización sin un par de
  peticiones que lo demuestren no se sostiene cuando alguien lo revisa.
- **Ordena por explotabilidad, no por severidad teórica.** El informe se lee de
  arriba abajo una vez, y el orden de lectura es el orden de riesgo.
- **Distingue confirmado de probable.** Mezclarlos destruye la confianza en el
  informe entero.
- **Incluye cómo se corrige.** Un hallazgo que nadie sabe arreglar se cierra con un
  comentario, no con una corrección.

## Cómo contribuir aquí

El punto de entrada más fácil es la revisión de dependencias y la superficie de
ataque de un tipo de proyecto concreto, porque el alcance está acotado y se puede
describir sin ambigüedad. Empieza por [crear una skill](/docs/crear-una-skill/) y
pon la carpeta en `skills/security/`.

## Ver también

- [Categoría qa](/docs/categorias/qa/): la otra categoría abierta.
- [Crear una skill](/docs/crear-una-skill/): el tutorial completo.
- [CLI: fwskills search](/docs/cli/search/): buscar skills por etiquetas.
