/**
 * GitHub data, resolved once at BUILD TIME.
 *
 * The site is static: there is no server, so this module runs during
 * `astro build` and its results are baked into the HTML.
 *
 * Two hard rules:
 *  1. It must never fail the build. Every path here degrades to a cached
 *     value, then to a documented "unavailable" marker.
 *  2. Unauthenticated GitHub API calls are heavily rate limited (60/hour per
 *     IP), so a token is used when GITHUB_TOKEN is present, and every
 *     successful response is cached on disk. A second build with no changes
 *     performs zero requests.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SITE } from './site';

const CACHE_DIR = join(process.cwd(), 'node_modules', '.cache', 'fwskills', 'github');
const API = 'https://api.github.com';
const TIMEOUT_MS = 4000;

export interface RepoStats {
  stars: number | null;
  forks: number | null;
  openIssues: number | null;
  license: string | null;
  lastPush: string | null;
}

export interface Contributor {
  login: string;
  avatar: string;
  contributions: number;
  url: string;
}

export interface Release {
  tag: string;
  name: string;
  publishedAt: string;
  url: string;
}

export interface GitHubData {
  repo: RepoStats;
  contributors: Contributor[];
  releases: Release[];
  /** True when every value came from cache or fallback rather than a live call. */
  stale: boolean;
  /** Why the data is stale, for the build log. Never shown to visitors. */
  reason?: string;
}

const EMPTY: GitHubData = {
  repo: {
    stars: null,
    forks: null,
    openIssues: null,
    license: null,
    lastPush: null,
  },
  contributors: [],
  releases: [],
  stale: true,
  reason: 'not fetched',
};

function cachePath(name: string): string {
  return join(CACHE_DIR, `${name}.json`);
}

async function readCache<T>(name: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(cachePath(name), 'utf8')) as T;
  } catch {
    return null;
  }
}

async function writeCache(name: string, value: unknown): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
    await writeFile(cachePath(name), JSON.stringify(value), 'utf8');
  } catch {
    // A read-only cache directory must not break the build.
  }
}

async function gh<T>(path: string): Promise<T | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'fwskills-build',
  };
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API}${path}`, {
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Network down, DNS failure, timeout: fall through to cache.
    return null;
  }
}

interface RepoResponse {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  license: { spdx_id: string | null } | null;
}

/**
 * Resolve everything the site shows about the project.
 * `fetchLive: false` forces the cached/offline path, which is what you want
 * for an offline build or a reproducible one.
 */
export async function getGitHubData(fetchLive = true): Promise<GitHubData> {
  if (!fetchLive) {
    const [repo, contributors, releases] = await Promise.all([
      readCache<RepoStats>('repo'),
      readCache<Contributor[]>('contributors'),
      readCache<Release[]>('releases'),
    ]);
    return {
      repo: repo ?? EMPTY.repo,
      contributors: contributors ?? [],
      releases: releases ?? [],
      stale: true,
      reason: 'offline build (fetchLive=false)',
    };
  }

  const [repoRes, contribRes, releasesRes] = await Promise.all([
    gh<RepoResponse>(`/repos/${SITE.repo}`),
    gh<Array<{ login: string; avatar_url: string; contributions: number; html_url: string }>>(
      `/repos/${SITE.repo}/contributors?per_page=30`,
    ),
    gh<Array<{ tag_name: string; name: string | null; published_at: string; html_url: string }>>(
      `/repos/${SITE.repo}/releases?per_page=20`,
    ),
  ]);

  const reason = repoRes ? undefined : 'GitHub API unreachable or rate limited';
  const [cachedRepo, cachedContrib, cachedReleases] = await Promise.all([
    readCache<RepoStats>('repo'),
    readCache<Contributor[]>('contributors'),
    readCache<Release[]>('releases'),
  ]);

  const contributors: Contributor[] = contribRes
    ? contribRes.map((c) => ({
        login: c.login,
        avatar: c.avatar_url,
        contributions: c.contributions,
        url: c.html_url,
      }))
    : (cachedContrib ?? []);

  const releases: Release[] = releasesRes
    ? releasesRes.map((r) => ({
        tag: r.tag_name,
        name: r.name ?? r.tag_name,
        publishedAt: r.published_at,
        url: r.html_url,
      }))
    : (cachedReleases ?? []);

  const repo: RepoStats = repoRes
    ? {
        stars: repoRes.stargazers_count,
        forks: repoRes.forks_count,
        openIssues: repoRes.open_issues_count,
        license: repoRes.license?.spdx_id ?? null,
        lastPush: repoRes.pushed_at,
      }
    : (cachedRepo ?? EMPTY.repo);

  if (repoRes) await writeCache('repo', repo);
  if (contribRes) await writeCache('contributors', contributors);
  if (releasesRes) await writeCache('releases', releases);

  return {
    repo,
    contributors,
    releases,
    stale: !repoRes || !contribRes || !releasesRes,
    reason,
  };
}

/** Compact number for a stat tile: 1234 -> "1.2k". */
export function formatCount(n: number | null): string {
  if (n === null) return '—';
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
}

/** ISO date -> "14 mar 2026". */
export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
