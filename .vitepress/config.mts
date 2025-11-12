import { withMermaid } from 'vitepress-plugin-mermaid';
import { getAutoSidebar } from './utils/sidebar.mts';

// @ts-ignore: no declaration for 'markdown-it-wikilinks'
import markdownItWikilinks from 'markdown-it-wikilinks';

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
    root: {
      label: 'Русский',
      lang: 'ru',
      description:
        'Справочный веб-сайт для документации и внутренних целей CompPrehension ITS и ее экосистемы',

      // Конфигурация темы для русского языка
      themeConfig: {
        nav: [
          { text: 'Главная', link: '/' },
          { text: 'Ресурсы', link: '/resources' },
          { text: 'Пользователям', link: '/introduction' },
          { text: 'Документация', link: '/docs' },
        ],

        editLink: {
          pattern:
            'https://github.com/CompPrehension.github.io/edit/production/:path',
        },

        sidebar: [
          {
            text: 'Основное',
            items: [
              { text: 'Введение для пользователя', link: '/introduction' },
              { text: 'Навигация по проектам', link: '/resources' },
            ],
          },
          {
            text: 'Документация',
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
        lastUpdatedText: 'Последнее обновление',
        // Текст для оглавления
        outlineTitle: 'На этой странице',
      },
    },
    en: {
      label: 'English',
      lang: 'en',
      // Описание сайта на английском
      description:
        'Wiki for documentation and internal purposes of CompPrehension ITS and its ecosystem',

      // Конфигурация темы для английского языка
      themeConfig: {
        nav: [
          // Важно: ссылки для английского языка должны вести на /en/
          { text: 'Home', link: '/en/' },
          { text: 'Resources', link: '/resources' },
          { text: 'For Users', link: '/introduction' },
          { text: 'Documentation', link: '/docs' },
        ],

        editLink: {
          pattern:
            'https://github.com/CompPrehension.github.io/edit/production/:path',
        },

        sidebar: [
          {
            text: 'Main',
            items: [
              { text: 'User Introduction', link: '/introduction' },
              { text: 'Project Resources', link: '/resources' },
            ],
          },
          {
            text: 'Documentation',
            link: '/docs',
            items: [
              {
                text: 'CompPrehension ITS',
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
                link: '/docs/decision_tree',
                items: getAutoSidebar('docs/decision_tree'),
              },
              {
                text: 'MeaningTree',
                link: '/docs/meaning_tree',
                items: getAutoSidebar('docs/meaning_tree'),
              },
            ],
          },
        ],
        // Текст для кнопки "Последнее обновление" на английском
        lastUpdatedText: 'Last Updated',
        // Текст для оглавления на английском
        outlineTitle: 'On this page',
      },
    },
  },
});
