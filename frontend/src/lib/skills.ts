import { getCollection, type CollectionEntry } from 'astro:content';

export type Skill = CollectionEntry<'skills'>;

/**
 * Categories are derived from the collection, never from a hardcoded list.
 *
 * This is why the schema types `category` as a string instead of an enum: a
 * new category is a new folder, and the catalog, the filter chips, the
 * landing grid and the docs pages all pick it up with no code change.
 */
export interface Category {
  slug: string;
  name: string;
  description: string;
  count: number;
  /** Lucide icon name, resolved by the caller. */
  icon: string;
}

/**
 * The one map a new category DOES need.
 *
 * A folder name cannot describe itself, so each category needs a display name,
 * a sentence and an icon. This is metadata about presentation, not about the
 * set of categories — adding a key is the entire cost of a new category.
 */
const CATEGORY_META: Record<string, Omit<Category, 'slug' | 'count'>> = {
  specs: {
    name: 'Specs',
    description: 'Documentar un proyecto antes de escribir una línea de código.',
    icon: 'file-text',
  },
  design: {
    name: 'Design',
    description: 'Sistemas visuales completos, no fragmentos de estilo sueltos.',
    icon: 'palette',
  },
  qa: {
    name: 'QA',
    description: 'Revisión, pruebas y control de calidad antes de mergear.',
    icon: 'check-circle',
  },
  security: {
    name: 'Security',
    description: 'Auditoría, superficie de ataque y respuesta a incidentes.',
    icon: 'shield',
  },
};

const FALLBACK_META = (slug: string) => ({
  name: slug.charAt(0).toUpperCase() + slug.slice(1),
  description: `Skills de la categoría ${slug}.`,
  icon: 'package',
});

export async function getSkills(): Promise<Skill[]> {
  const skills = await getCollection('skills');
  return skills.sort(
    (a, b) => a.data.name.localeCompare(b.data.name) || a.id.localeCompare(b.id),
  );
}

export function toCategory(slug: string, count: number): Category {
  const meta = CATEGORY_META[slug] ?? FALLBACK_META(slug);
  return { slug, count, ...meta };
}

export async function getCategories(): Promise<Category[]> {
  const skills = await getSkills();
  const counts = new Map<string, number>();
  for (const skill of skills) {
    counts.set(skill.data.category, (counts.get(skill.data.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([slug, count]) => toCategory(slug, count))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFeatured(limit = 6): Promise<Skill[]> {
  const skills = await getSkills();
  return skills.filter((s) => s.data.featured).slice(0, limit);
}

/** `design` -> `dark-luxury` becomes `design/dark-luxury`. */
export function skillSlug(skill: Skill): string {
  return `${skill.data.category}/${skill.data.name}`;
}

export function skillHref(skill: Skill): string {
  return `/skills/${skill.data.category}/${skill.data.name}/`;
}

/** The one command a visitor needs. */
export function installCommand(skill: Skill, runner = 'npx'): string {
  return `${runner} fwskills add ${skillSlug(skill)}`;
}

/** The skill name always reads as code, so it is recognisable at a glance. */
export function authorList(skill: Skill): string[] {
  const { author } = skill.data;
  if (!author) return [];
  return Array.isArray(author) ? author : [author];
}

/** Last modification, from git when available, else the frontmatter date. */
export function updatedAt(skill: Skill): string {
  return (skill.data.updatedAt ?? new Date(0)).toISOString();
}
