// .vitepress/utils/sidebar.mts

import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
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
 * Файл _order.json задаёт порядок имён файлов (с .md) и подпапок.
 * Неуказанные пункты добавляются в конец по алфавиту.
 */
export function getAutoSidebar(dir: string): Array<object> {
  const normalizedDir = dir.replace(/\\/g, '/').replace(/^\/+/, '');
  const dirPath = join(process.cwd(), normalizedDir);
  const files = readdirSync(dirPath);
  const orderPath = join(dirPath, '_order.json');
  const order: unknown = existsSync(orderPath)
    ? JSON.parse(readFileSync(orderPath, 'utf8').replace(/^\uFEFF/, ''))
    : [];
  if (!Array.isArray(order) || !order.every((name) => typeof name === 'string')) {
    throw new Error(`${orderPath}: expected an array of file and directory names`);
  }
  const positions = new Map<string, number>();
  order.forEach((name: string, index: number) => {
    if (!positions.has(name)) positions.set(name, index);
  });

  return files
    .sort((a, b) => {
      const aPosition = positions.get(a) ?? Infinity;
      const bPosition = positions.get(b) ?? Infinity;
      if (aPosition !== bPosition) return aPosition - bPosition;
      return formatFilename(a).localeCompare(formatFilename(b));
    })
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
    .filter((obj) => obj != undefined && obj != null);
}
