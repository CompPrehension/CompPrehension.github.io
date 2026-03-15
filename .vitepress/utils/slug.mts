// .vitepress/utils/slug.mts
// Slug utilities for path segments and URL paths.

const SEGMENT_OVERRIDES: Record<string, string> = {
  decision_tree: 'thought_process_graph',
};

const SAFE_SEGMENT_RE = /^[A-Za-z0-9_-]+$/;

const CYRILLIC_MAP: Record<string, string> = {
  '\u0410': 'a', '\u0430': 'a', // А а
  '\u0411': 'b', '\u0431': 'b', // Б б
  '\u0412': 'v', '\u0432': 'v', // В в
  '\u0413': 'g', '\u0433': 'g', // Г г
  '\u0414': 'd', '\u0434': 'd', // Д д
  '\u0415': 'e', '\u0435': 'e', // Е е
  '\u0401': 'yo', '\u0451': 'yo', // Ё ё
  '\u0416': 'zh', '\u0436': 'zh', // Ж ж
  '\u0417': 'z', '\u0437': 'z', // З з
  '\u0418': 'i', '\u0438': 'i', // И и
  '\u0419': 'y', '\u0439': 'y', // Й й
  '\u041a': 'k', '\u043a': 'k', // К к
  '\u041b': 'l', '\u043b': 'l', // Л л
  '\u041c': 'm', '\u043c': 'm', // М м
  '\u041d': 'n', '\u043d': 'n', // Н н
  '\u041e': 'o', '\u043e': 'o', // О о
  '\u041f': 'p', '\u043f': 'p', // П п
  '\u0420': 'r', '\u0440': 'r', // Р р
  '\u0421': 's', '\u0441': 's', // С с
  '\u0422': 't', '\u0442': 't', // Т т
  '\u0423': 'u', '\u0443': 'u', // У у
  '\u0424': 'f', '\u0444': 'f', // Ф ф
  '\u0425': 'h', '\u0445': 'h', // Х х
  '\u0426': 'ts', '\u0446': 'ts', // Ц ц
  '\u0427': 'ch', '\u0447': 'ch', // Ч ч
  '\u0428': 'sh', '\u0448': 'sh', // Ш ш
  '\u0429': 'shch', '\u0449': 'shch', // Щ щ
  '\u042b': 'y', '\u044b': 'y', // Ы ы
  '\u042d': 'e', '\u044d': 'e', // Э э
  '\u042e': 'yu', '\u044e': 'yu', // Ю ю
  '\u042f': 'ya', '\u044f': 'ya', // Я я
  '\u042a': '', '\u044a': '', // Ъ ъ
  '\u042c': '', '\u044c': '', // Ь ь
};

const ASSET_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif',
  '.pdf', '.zip', '.rar', '.7z', '.csv', '.tsv', '.json',
  '.xml', '.yaml', '.yml', '.loqi', '.ttl', '.rdf',
]);

function transliterate(input: string): string {
  let out = '';
  for (const ch of input) {
    out += CYRILLIC_MAP[ch] ?? ch;
  }
  return out;
}

export function slugifySegment(segment: string): string {
  const override = SEGMENT_OVERRIDES[segment.toLowerCase()];
  if (override) return override;

  if (SAFE_SEGMENT_RE.test(segment)) return segment;

  const translit = transliterate(segment)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

  const slug = translit
    .replace(/&/g, ' and ')
    .replace(/['"`’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || segment;
}

function slugifyPathSegment(segment: string): string {
  if (!segment || segment === '.' || segment === '..') return segment;

  const lower = segment.toLowerCase();
  if (lower.endsWith('.md')) {
    const stem = segment.slice(0, -3);
    return `${slugifySegment(stem)}.md`;
  }

  const dotIdx = segment.lastIndexOf('.');
  if (dotIdx > 0) {
    const ext = segment.slice(dotIdx).toLowerCase();
    if (ASSET_EXTS.has(ext)) return segment;
  }

  return slugifySegment(segment);
}

export function slugifyUrlPath(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  const parts = normalized.split('/');
  const slugged = parts.map(slugifyPathSegment);
  return slugged.join('/');
}
