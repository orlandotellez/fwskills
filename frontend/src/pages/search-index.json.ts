import { getSkills } from '../lib/skills';
import { skillHref } from '../lib/skills';

/**
 * /search-index.json — generated at build, fetched once by the search modal.
 *
 * Keeping the index as a file (rather than inlining it into every page) means
 * the 20 KB lives in one fetch on first search, not in every HTML response.
 * The query matching happens client-side; this file only describes what
 * exists.
 */
export async function GET() {
  const skills = await getSkills();

  const entries = skills.map((skill) => ({
    title: skill.data.name,
    description: skill.data.description,
    href: skillHref(skill),
    kind: 'skill',
    category: skill.data.category,
  }));

  return new Response(JSON.stringify(entries), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=14400, stale-while-revalidate=86400',
    },
  });
}