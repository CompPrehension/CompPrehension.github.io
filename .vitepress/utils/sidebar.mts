// .vitepress/utils/sidebar.mts

import { readdirSync, statSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { slugifyUrlPath } from './slug.mts';

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
  const normalizedDir = dir.replace(/\\/g, '/').replace(/^\/+/, '');
  const dirPath = join(process.cwd(), normalizedDir);
  const files = readdirSync(dirPath);

  return files
    .map((file) => {
      const filePath = join(dirPath, file);
      const stat = statSync(filePath);

      if (file === 'index.md') return null;

      if (stat.isDirectory()) {
        const indexPage = join(dirPath, file, "index.md");
        const rawLink = `/${normalizedDir}/${file}`;
        return {
          text: formatFilename(file),
          collapsed: true,
          items: getAutoSidebar(join(normalizedDir, file)),
          link: existsSync(indexPage) ? slugifyUrlPath(rawLink) : undefined
        };
      } else if (file.endsWith('.md')) {
        const rawLink = `/${normalizedDir}/${file.replace(/\.md$/, '')}`;
        let link = slugifyUrlPath(rawLink);
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
