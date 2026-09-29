import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

/**
 * The catalog is file-driven: one folder per skill, one SKILL.md inside it.
 * Adding a skill or a whole category means adding a folder. No frontend file
 * changes, and that is the point (ADR-05).
 *
 * A malformed SKILL.md fails `astro build`. That is intended: a broken entry
 * must never reach the published catalog.
 */
const skills = defineCollection({
  // `base` is the repository root because skills/ lives there, next to
  // frontend/ and cli/ — that shared location is what lets the CLI
  // and the site read the same folders. The glob loader rejects a `../`
  // pattern, so the base is the parent and the pattern stays relative to it.
  loader: glob({ pattern: 'skills/*/*/SKILL.md', base: '..' }),
  schema: ({ image }) =>
    z.object({
      /**
       * Stable identifier. Must equal the folder name, because that is what
       * `npx fwskills add <categoria>/<slug>` resolves against.
       */
      name: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Debe ser kebab-case: minúsculas, dígitos y guiones'),

      /** One sentence. Clamped to two lines in the card. */
      description: z.string().min(20).max(240),

      /**
       * Deliberately a string, not an enum.
       *
       * An enum would make the four current categories the contract, and the
       * build would break on the first new category — directly contradicting
       * the goal that a category is just a folder. Real categories are
       * validated against the filesystem in lib/skills.ts instead.
       */
      category: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Debe ser kebab-case'),

      version: z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'Debe ser SemVer'),

      author: z.union([z.string(), z.array(z.string())]),

      tags: z.array(z.string()),

      /** Agent directories this skill can be installed into. */
      compatibility: z.array(z.string()),

      /** Exactly the six cards on the landing's "Skills destacadas". */
      featured: z.boolean(),

      /** Optional icon path relative to public/. */
      icon: z.string().optional(),

      updatedAt: z.coerce.date().optional(),
    }),
});

/** Starlight's own collection, registered here because a custom content
 *  config replaces the generated one. Loading and schema stay Starlight's. */
const docs = defineCollection({
  loader: docsLoader(),
  schema: docsSchema(),
});

export const collections = { skills, docs };
