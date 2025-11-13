import { withMermaid } from 'vitepress-plugin-mermaid';
import { getAutoSidebar } from './utils/sidebar.mts';

// @ts-ignore: no declaration for 'markdown-it-wikilinks'
import markdownItWikilinks from 'markdown-it-wikilinks';

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
  sidebar_main: { ru: 'Основное', en: 'Main' },
  sidebar_resources: { ru: 'Навигация по проектам', en: 'Project Resources' },
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
  return {[normalizedLocale]: {
      label: localeVisibleName,
      lang: locale,
      description: t("description"),

      // Конфигурация темы для русского языка
      themeConfig: {
        nav: [
          { text: t("home"), link: '/' },
          { text: t("resources"), link: '/resources' },
          { text: t("introduction"), link: '/introduction' },
          { text: t("docs"), link: '/docs' },
        ],

        editLink: {
          pattern:
            'https://github.com/CompPrehension/CompPrehension.github.io/edit/production/:path',
          text: t("githubEdit"),
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
                ],
              },
              {
                text: 'DecisionTree',
                collapsed: true,
                link: '/docs/decision_tree',
                items: getAutoSidebar('docs/decision_tree'),
              },
              {
                text: 'MeaningTree',
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
    }};
}

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
    toc: { level: [1, 2, 3] },
    config: (md) => {
      md.use(markdownItWikilinks);
    },
  },

  locales: {
    ...getThemeConfig('ru', 'Русский'),
    ...getThemeConfig('en', 'English'),
  },
});
