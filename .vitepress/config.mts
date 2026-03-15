import { withMermaid } from 'vitepress-plugin-mermaid';
import { getAutoSidebar } from './utils/sidebar.mts';

// @ts-ignore: no declaration for 'markdown-it-wikilinks'
import markdownItWikilinks from 'markdown-it-wikilinks';

import { mark } from '@mdit/plugin-mark';
import { tasklist } from '@mdit/plugin-tasklist';
import { spoiler } from '@mdit/plugin-spoiler';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { buildRouteMappings } from './utils/routes.mts';
import { slugifyUrlPath } from './utils/slug.mts';

const locales = {
  home: { root: 'Главная', en: 'Home' },
  description: {
    root: 'Справочный веб-сайт для документации и внутренних целей CompPrehension ITS и ее экосистемы',
    en: 'Wiki for documentation and internal purposes of CompPrehension ITS and its ecosystem',
  },
  resources: { ru: 'Ресурсы', en: 'Resources' },
  introduction: { ru: 'Пользователям', en: 'Introduction' },
  docs: { ru: 'Документация', en: 'Documentation' },
  sidebar_introduction: {
    ru: 'Введение для пользователя',
    en: 'User Introduction',
  },
  sidebar_dt: {
    ru: 'Графы мыслительных процессов',
    en: 'Thought Process Graph',
  },
  sidebar_main: { ru: 'Основное', en: 'Main' },
  sidebar_resources: { ru: 'Навигация по проектам', en: 'Project Resources' },
  sidebar_domain_howtocreate: { ru: 'Как создать новый домен?', en: 'How to create a new domain?' },
  sidebar_domain_testguide: { ru: 'Руководство по тестированию домена', en: 'Domain testing guide' },
  lastUpdated: { ru: 'Последнее обновление', en: 'Last updated' },
  outlineTitle: { ru: 'На этой странице', en: 'Table of Contents' },
  githubEdit: { ru: 'Редактировать на GitHub', en: 'Edit on GitHub' },
} as const;

const defaultLocale = "ru";
type LocaleKey = keyof typeof locales;
type Language = 'ru' | 'en' | 'root';
type LocaleEntry = Partial<Record<Language, string>> & { root?: string };


function makeTranslations(locale: Language): (name: LocaleKey) => string {
  return (name: LocaleKey) => {
    const entry = locales[name] as LocaleEntry;
    return entry[locale] ?? entry.root ?? entry.en ?? '';
  }
}

function getThemeConfig(locale: Language, localeVisibleName: string) {
  const normalizedLocale = defaultLocale == locale ? "root" : locale
  const t = makeTranslations(locale);
  return {
    [normalizedLocale]: {
      label: localeVisibleName,
      lang: locale,
      description: t('description'),

      // Конфигурация темы для русского языка
      themeConfig: {
        nav: [
          { text: t('home'), link: '/' },
          { text: t('resources'), link: '/resources' },
          { text: t('introduction'), link: '/introduction' },
          { text: t('docs'), link: '/docs' },
        ],

        editLink: {
          pattern:
            'https://github.com/CompPrehension/CompPrehension.github.io/edit/production/:path',
          text: t('githubEdit'),
        },

        sidebar: [
          {
            text: t('sidebar_main'),
            items: [
              { text: t('sidebar_introduction'), link: '/introduction' },
              { text: t('sidebar_resources'), link: '/resources' },
            ],
          },
          {
            text: t('docs'),
            link: '/docs',
            items: [
              {
                text: 'CompPrehension ITS',
                collapsed: false,
                link: '/docs/its',
                items: [
                  {
                    text: 'Expression Evaluation Order Domain',
                    link: '/docs/its/domains/expression_order',
                    items: getAutoSidebar('/docs/its/domains/expression_order'),
                  },
                  {
                    text: 'Control Flow Statements Domain',
                    link: '/docs/its/domains/ctrlflow',
                    items: getAutoSidebar('/docs/its/domains/ctrlflow'),
                  },
                  {
                    text: t('sidebar_domain_howtocreate'),
                    link: '/docs/its/how_to_domain',
                  },
                  {
                    text: t('sidebar_domain_testguide'),
                    link: '/docs/its/testing_guide',
                  },
                ],
              },
              {
                text: t('sidebar_dt'),
                collapsed: true,
                link: '/docs/thought_process_graph',
                items: getAutoSidebar('docs/decision_tree'),
              },
              {
                text: 'Meaning Tree',
                collapsed: true,
                link: '/docs/meaning_tree',
                items: getAutoSidebar('docs/meaning_tree'),
              },
            ],
          },
        ],
        // Текст для кнопки "Последнее обновление"
        lastUpdatedText: t('lastUpdated'),
        // Текст для оглавления
        outlineTitle: t('outlineTitle'),
      },
    },
  };
}

const customSlugify = (str: string) => 
  str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Пробелы в дефисы
    .replace(/[^\p{L}\p{N}-]/gu, '') // Удаляем спецсимволы, сохраняем буквы (Unicode) и цифры
    .replace(/-+/g, '-') // Убираем двойные дефисы
    .replace(/^-+|-+$/g, ''); // Убираем дефисы по краям

const safeDecodeUri = (value: string) => {
  try {
    return decodeURI(value);
  } catch {
    return value;
  }
};

const normalizeWikilinkTarget = (target: string) => {
  const decoded = safeDecodeUri(target);
  const [pathWithQuery, ...hashParts] = decoded.split('#');
  const hash = hashParts.length > 0 ? hashParts.join('#') : '';
  const [pathOnly, query] = pathWithQuery.split('?');
  const normalizedPath = slugifyUrlPath(pathOnly);
  const normalizedHash = hash ? customSlugify(safeDecodeUri(hash)) : '';
  const normalizedQuery = query ? `?${query}` : '';
  const normalizedAnchor = normalizedHash ? `#${normalizedHash}` : '';
  return `${normalizedPath}${normalizedQuery}${normalizedAnchor}`;
};

const normalizeWikilinkMatchToken = (token: any) => {
  const match = token?.meta?.match;
  if (!Array.isArray(match)) return;
  if (typeof match[0] !== 'string' || !match[0].startsWith('[[')) return;
  if (typeof match[1] !== 'string') return;
  match[1] = normalizeWikilinkTarget(match[1]);
};


const routeMappings = buildRouteMappings(process.cwd());
const escapeRewriteSource = (sourcePath: string) =>
  sourcePath.replace(/([.+*?^${}()[\]|\\!:])/g, '\\$1');
const rewriteMap = Object.fromEntries(
  routeMappings
    .filter((m) => m.source !== m.dest)
    .map((m) => [escapeRewriteSource(m.source), m.dest])
);
const redirectMappings = routeMappings.filter((m) => m.fromRoute !== m.toRoute);

// https://vitepress.dev/reference/site-config
export default withMermaid({
  title: 'CompPrehension Wiki',
  titleTemplate: 'CompPrehension Wiki',
  ignoreDeadLinks: true,
  lastUpdated: true,
  rewrites: rewriteMap,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CompPrehension' },
      { icon: 'orcid', link: 'https://orcid.org/0000-0002-7296-2538' },
    ],

    search: {
      provider: 'local',
    },
  },

  markdown: {
    toc: { level: [1, 2, 3, 4, 5] },
    math: true,
    anchor: {
      slugify: customSlugify
    },
    config(md) {
      md.use(
        markdownItWikilinks({
          baseURL: '/',
          relativeBaseURL: '',
          htmlAttributes: {
            class: 'wikilink',
          },
          generatePagePathFromLabel: (label: string) => {
            const [rawPath, ...rawHashParts] = label.split('#');
            const rawHash = rawHashParts.length > 0 ? rawHashParts.join('#') : '';
            const cleanPath = slugifyUrlPath(safeDecodeUri(rawPath.trim())).replace(/\.md$/i, '');
            const cleanHash = rawHash ? customSlugify(safeDecodeUri(rawHash)) : '';
            return cleanHash ? `${cleanPath}#${cleanHash}` : cleanPath;
          },
          // Важно: применяется и к piped wikilinks [[path|label]]
          postProcessPagePath: (pagePath: string) =>
            slugifyUrlPath(safeDecodeUri(pagePath.trim())).replace(/\.md$/i, ''),
          postProcessPageHash: (pageHash: string) => customSlugify(safeDecodeUri(pageHash)),
        })
      )
        .use(mark)
        .use(tasklist, { disabled: false })
        .use(spoiler);

      md.core.ruler.push('normalize-wikilink-targets', (state) => {
        for (const token of state.tokens) {
          normalizeWikilinkMatchToken(token);
          if (!token.children) continue;
          for (const child of token.children) {
            normalizeWikilinkMatchToken(child);
          }
        }
      });

      const defaultNormalizeLink = md.normalizeLink;

      md.normalizeLink = (url) => {
        try {
          const normalized = defaultNormalizeLink(url);
          const decoded = decodeURI(normalized);

          if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(decoded)) {
            return normalized;
          }

          const [pathWithQuery, hash] = decoded.split('#');
          const [path, query] = pathWithQuery.split('?');
          const cleanPath = slugifyUrlPath(path);
          const cleanHash = hash ? customSlugify(hash) : '';
          const cleanQuery = query ? `?${query}` : '';
          const cleanAnchor = cleanHash ? `#${cleanHash}` : '';

          return `${cleanPath}${cleanQuery}${cleanAnchor}`;
        } catch (e) {
          return defaultNormalizeLink(url);
        }
      };
    },
  },

  buildEnd: async (siteConfig) => {
    const outDir = (siteConfig as any)?.outDir ?? resolve(process.cwd(), '.vitepress/dist');
    const base = (siteConfig as any)?.base ?? '/';
    const basePrefix = base === '/' ? '' : base.replace(/\/+$/, '');

    const withBase = (route: string) => {
      if (!basePrefix) return route;
      return `${basePrefix}${route.startsWith('/') ? '' : '/'}${route}`;
    };

    const toOutFile = (route: string) => {
      let clean = route.split('#')[0].split('?')[0];
      clean = clean.replace(/\/+$/, '');
      if (clean.startsWith('/')) clean = clean.slice(1);
      if (!clean) return resolve(outDir, 'index.html');
      return resolve(outDir, clean, 'index.html');
    };

    for (const m of redirectMappings) {
      if (m.fromRoute === m.toRoute || m.fromRoute === '/') continue;
      const target = withBase(m.toRoute);
      const outFile = toOutFile(m.fromRoute);
      mkdirSync(dirname(outFile), { recursive: true });
      const html = `<!doctype html><meta charset=\"utf-8\"><meta http-equiv=\"refresh\" content=\"0; url=${target}\"><link rel=\"canonical\" href=\"${target}\"><script>location.replace(${JSON.stringify(target)})</script>`;
      writeFileSync(outFile, html, 'utf8');
    }
  },

  locales: {
    ...getThemeConfig('ru', 'Русский'),
    ...getThemeConfig('en', 'English'),
  },
});


