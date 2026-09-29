/**
 * Skill validation — `bun run validate`
 *
 * Reads every `skills/<categoria>/<skill>/SKILL.md` at the repository root and
 * checks the 8-field frontmatter contract:
 *
 *   name, description, category, version, author, tags, compatibility, featured
 *
 * All 8 are REQUIRED, with no defaults. A skill that passes here is a skill
 * the catalog can render. Failures exit non-zero with a per-skill report, so
 * the command is safe to run in CI and as the local gate before opening a PR.
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
// The repo root — this script runs from frontend/ by default, so go up.
const REPO = existsSync(join(ROOT, 'skills')) ? ROOT : join(ROOT, '..');
const SKILLS_DIR = join(REPO, 'skills');

const REQUIRED = ['name', 'description', 'category', 'version', 'author', 'tags', 'compatibility', 'featured'];

interface Failure {
  file: string;
  problems: string[];
}

/** Very small frontmatter parser: front matter between the first two --- lines. */
function parseFrontmatter(source: string): Map<string, string> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) return new Map();
  const fields = new Map<string, string>();
  for (const line of match[1]!.split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) fields.set(key, value);
  }
  return fields;
}

function validateOne(category: string, name: string, file: string): Failure | null {
  const source = readFileSync(file, 'utf8');
  const fields = parseFrontmatter(source);
  const problems: string[] = [];

  for (const field of REQUIRED) {
    if (!fields.has(field) || !fields.get(field)) {
      problems.push(`falta el campo requerido: ${field}`);
    }
  }

  const nameField = fields.get('name');
  if (nameField && nameField !== name) {
    problems.push(`el campo name ("${nameField}") no coincide con la carpeta ("${name}")`);
  }

  const categoryField = fields.get('category');
  if (categoryField && categoryField !== category) {
    problems.push(`el campo category ("${categoryField}") no coincide con la carpeta ("${category}")`);
  }

  const version = fields.get('version');
  if (version && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    problems.push(`version no es SemVer: "${version}"`);
  }

  const featured = fields.get('featured');
  if (featured && featured !== 'true' && featured !== 'false') {
    problems.push(`featured debe ser true o false, se encontró "${featured}"`);
  }

  const description = fields.get('description');
  if (description && description.length < 20) {
    problems.push(`description demasiado corta (${description.length} caracteres, mínimo 20)`);
  }

  return problems.length > 0 ? { file, problems } : null;
}

if (!existsSync(SKILLS_DIR)) {
  console.error(`✗ No existe la carpeta ${SKILLS_DIR}`);
  process.exit(1);
}

const failures: Failure[] = [];
let checked = 0;

for (const category of readdirSync(SKILLS_DIR, { withFileTypes: true })) {
  if (!category.isDirectory()) continue;
  const categoryDir = join(SKILLS_DIR, category.name);

  for (const skill of readdirSync(categoryDir, { withFileTypes: true })) {
    if (!skill.isDirectory()) continue;
    const file = join(categoryDir, skill.name, 'SKILL.md');
    if (!existsSync(file)) {
      failures.push({ file, problems: ['falta el archivo SKILL.md'] });
      continue;
    }
    checked++;
    const failure = validateOne(category.name, skill.name, file);
    if (failure) failures.push(failure);
  }
}

if (failures.length > 0) {
  console.error(`✗ ${failures.length} skill(s) con problemas (de ${checked} revisadas):`);
  for (const { file, problems } of failures) {
    console.error(`\n${file}`);
    for (const problem of problems) console.error(`    - ${problem}`);
  }
  process.exit(1);
}

console.log(`✓ ${checked} skill(s) válidas en ${SKILLS_DIR}`);