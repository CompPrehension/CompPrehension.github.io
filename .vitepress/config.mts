import { withMermaid } from 'vitepress-plugin-mermaid';
import { getAutoSidebar } from './utils/sidebar.mts';

// @ts-ignore: no declaration for 'markdown-it-wikilinks'
import markdownItWikilinks from 'markdown-it-wikilinks';

import { mark } from '@mdit/plugin-mark';
import { tasklist } from '@mdit/plugin-tasklist';
import { spoiler } from '@mdit/plugin-spoiler';

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
    ru: 'Деревья мыслительных процессов',
    en: 'Thought Process Tree',
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
                link: '/docs/decision_tree',
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


// https://vitepress.dev/reference/site-config
export default withMermaid({
  title: 'CompPrehension Wiki',
  titleTemplate: 'CompPrehension Wiki',
  ignoreDeadLinks: true,
  lastUpdated: true,

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
          htmlAttributes: {
            class: 'wikilink',
          },
          generatePageNameFromLabel: (label: string) => {
            // Если в вики-ссылке есть якорь [[путь/файл#Заголовок]]
            if (label.includes('#')) {
              const [path, hash] = label.split('#');
              // Путь очищаем минимально (только пробелы), а якорь — через customSlugify
              return (
                path.trim().replace(/\s+/g, '-') + '#' + customSlugify(hash)
              );
            }
            // Для обычных ссылок [[docs/index]] просто меняем пробелы на дефисы,
            // не трогая слеши и точки
            return label.trim().replace(/\s+/g, '-');
          },
        })
      )
        .use(mark)
        .use(tasklist, { disabled: false })
        .use(spoiler);

      const defaultNormalizeLink = md.normalizeLink;

      md.normalizeLink = (url) => {
        try {
          // Сначала получаем стандартно обработанную ссылку и декодируем её (ваш старый код)
          let decoded = decodeURI(defaultNormalizeLink(url));

          // Если в ссылке есть якорь (решетка)
          if (decoded.includes('#')) {
            const [path, hash] = decoded.split('#');
            
            // Обрабатываем хеш той же функцией, что и заголовки
            const cleanHash = customSlugify(hash);
            
            // Возвращаем путь (декодированный) + корректный якорь
            return path + '#' + cleanHash;
          }

          return decoded;
        } catch (e) {
          return defaultNormalizeLink(url);
        }
      };
    },
  },

  locales: {
    ...getThemeConfig('ru', 'Русский'),
    ...getThemeConfig('en', 'English'),
  },
});
