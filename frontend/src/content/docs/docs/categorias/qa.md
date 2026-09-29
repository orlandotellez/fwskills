---
title: Categoría qa
description: Skills para revisión, pruebas y control de calidad antes de mergear. La categoría está declarada y todavía no tiene skills.
sidebar:
  label: qa
  order: 3
---

La categoría `qa` cubre el trabajo que ocurre **antes de mergear**: revisar, probar
y comprobar que lo que se entrega hace lo que dice hacer.

## Estado actual

La categoría está **declarada y abierta, pero todavía no tiene skills**. Aparece en
el catálogo con su descripción porque las categorías del proyecto son las cuatro
que cubren las áreas de trabajo, y no una lista de carpetas con contenido. La
primera skill que se publique aquí la convierte en una categoría con catálogo, sin
cambiar nada más.

En este momento:

```bash
npx fwskills list --category qa
```

```text
list: 0 skills
```

## Qué resuelve

La diferencia entre un cambio que funciona y un cambio que está terminado es, la
mayoría de las veces, una lista de verificación que nadie ejecutó. Las skills de
esta categoría cubren cuatro terrenos:

- **Revisión de pull requests**: qué se mira en un diff antes de aprobar, y con qué
  criterio se pide un cambio en lugar de aprobar por educación.
- **Estrategia de pruebas**: qué nivel de prueba corresponde a qué tipo de cambio, y
  qué casos no se pueden dejar fuera.
- **Verificación funcional**: recorrer el camino real de una funcionalidad, no solo
  la ruta feliz de una función.
- **Calidad de los datos de prueba**: fixtures que fallan por la razón correcta, y
  no por un dato mal preparado que convertiría un fallo real en un falso positivo.

## Qué hace buena a una skill de esta categoría

- **Es un filtro, no un estilo.** Una skill de QA que solo propone nombres de
  variables no aporta: aporta la que dice qué bloquea un merge y qué no.
- **Se apoya en el fallo concreto.** «Revisar la calidad» no es accionable;
  «comprobar que cada caso de error del endpoint tiene su prueba» sí.
- **Distingue bloqueante de recomendación.** Una revisión que no puede clasificar lo
  que encuentra se convierte en una lista de sugerencias, y eso es lo contrario de
  lo que se le pidió.
- **Distingue lo automatizable de lo manual.** No todo se puede probar, y una skill
  que promete cubrirlo todo produce una lista de pasos que nadie sostiene.
- **Declara el umbral.** Qué tiene que pasar para dar el cambio por bueno, escrito
  antes de mirar el diff, es lo que hace que dos revisores lleguen a la misma
  conclusión.

## Cómo contribuir aquí

Es la categoría donde más espacio hay. Si tienes un proceso de revisión que se
sostenga en varios proyectos, es un buen candidato: empieza por
[crear una skill](/docs/crear-una-skill/) y pon la carpeta en `skills/qa/`.

## Ver también

- [Categoría security](/docs/categorias/security/): la otra categoría abierta.
- [Crear una skill](/docs/crear-una-skill/): el tutorial completo.
- [CLI: fwskills list](/docs/cli/list/): listar y filtrar por categoría.
