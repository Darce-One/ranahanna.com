import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteDirectory = path.join(root, '_site');
const generatedBlogDirectory = path.join(root, 'pages', 'blogs');
const generatedArchive = path.join(root, 'data', 'blogs.json');

await rm(siteDirectory, { recursive: true, force: true });
await mkdir(siteDirectory, { recursive: true });

for (const entry of ['index.html', 'styles.css', 'script.js', 'assets', 'data']) {
  await cp(path.join(root, entry), path.join(siteDirectory, entry), { recursive: true });
}

await cp(path.join(root, 'pages'), path.join(siteDirectory, 'pages'), {
  recursive: true,
  filter: (source) => source !== generatedBlogDirectory,
});
await rm(path.join(siteDirectory, path.relative(root, generatedArchive)), { force: true });

process.env.BLOG_OUTPUT_ROOT = siteDirectory;
await import('./build-blogs.mjs');
