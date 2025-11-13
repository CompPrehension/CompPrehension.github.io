// .vitepress/utils/sidebar.mts

import { readdirSync, statSync, existsSync } from 'fs';
import { join, basename } from 'path';

/**
 * Вспомогательная функция для форматирования имени файла.
 * 'expression_order.md' -> 'Expression Order'
 */
function formatFilename(file: string): string {
  const name = basename(file, '.md');
  return name
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Рекурсивно сканирует директорию и генерирует элементы sidebar
 * @param {string} dir - Директория для сканирования (относительно корня проекта)
 * E.g., 'docs/its'
 */
export function getAutoSidebar(dir: string): Array<object> {
  const dirPath = join(process.cwd(), dir);
  const files = readdirSync(dirPath);

  return files
    .map((file) => {
      const filePath = join(dirPath, file);
      const stat = statSync(filePath);

      if (file === 'index.md') return null;

      if (stat.isDirectory()) {
        const indexPage = join(dirPath, file, "index.md");
        return {
          text: formatFilename(file),
          collapsed: true,
          items: getAutoSidebar(join(dir, file)),
          link: existsSync(indexPage) ? `/${dir}/${file.replace(/\.md$/, '')}` : undefined
        };
      } else if (file.endsWith('.md')) {
        let link = `${dir}/${file.replace(/\.md$/, '')}`;
        if (!dir.startsWith("/")) {
          link = '/' + link;
        }
        return {
          text: formatFilename(file),
          link: link,
        };
      }
    })
    .filter(Boolean)
    .filter((obj) => obj != undefined && obj != null)
    .sort((a, b) => (a?.text as string).localeCompare(b?.text as string));
}
