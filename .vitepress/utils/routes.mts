// .vitepress/utils/routes.mts
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { slugifyUrlPath } from './slug.mts';

export type RouteMapping = {
  source: string;   // source md path (posix, relative to repo root)
  dest: string;     // rewritten md path (posix, relative to repo root)
  fromRoute: string; // route path from source (leading slash)
  toRoute: string;   // route path from dest (leading slash)
};

const IGNORE_DIRS = new Set([
  '.git',
  '.github',
  '.husky',
  '.vitepress',
  'node_modules',
  'public',
  'dist',
  'cache',
]);

function toPosixPath(p: string): string {
  return p.replace(/\\/g, '/');
}

function walkMarkdownFiles(rootDir: string): string[] {
  const results: string[] = [];

  function walk(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        walk(join(dir, entry.name));
        continue;
      }
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        results.push(join(dir, entry.name));
      }
    }
  }

  walk(rootDir);
  return results;
}

export function pathToRoute(mdPath: string): string {
  let route = '/' + toPosixPath(mdPath).replace(/\.md$/i, '');
  route = route.replace(/\/index$/i, '/');
  return route === '' ? '/' : route;
}

export function buildRouteMappings(rootDir: string): RouteMapping[] {
  const files = walkMarkdownFiles(rootDir);
  const mappings: RouteMapping[] = [];
  const destSeen = new Map<string, string>();

  for (const file of files) {
    const rel = toPosixPath(relative(rootDir, file));
    const dest = slugifyUrlPath(rel);
    const fromRoute = pathToRoute(rel);
    const toRoute = pathToRoute(dest);

    const existing = destSeen.get(dest);
    if (existing && existing !== rel) {
      throw new Error(
        `Slug collision: "${rel}" and "${existing}" both map to "${dest}"`
      );
    }
    destSeen.set(dest, rel);

    mappings.push({ source: rel, dest, fromRoute, toRoute });
  }

  return mappings;
}
