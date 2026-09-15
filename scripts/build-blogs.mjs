import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blogDirectory = path.join(root, 'blogs');
const outputDirectory = path.join(root, 'pages', 'blogs');
const indexFile = path.join(root, 'data', 'blogs.json');
const localImagePath = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const displayDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
};

function imageSource(value, prefix) {
  if (/^https?:\/\/[^\s]+$/.test(value)) return value;
  if (!localImagePath.test(value)) return null;
  return `${prefix}assets/blog-images/${value}`;
}

function imageMarkup(alt, source, prefix, className = '') {
  const src = imageSource(source, prefix);
  if (!src) return null;
  const classAttribute = className ? ` class="${className}"` : '';
  return `<img${classAttribute} src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
}

function parsePost(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${filename} needs YAML front matter between --- lines.`);

  const metadata = Object.fromEntries(match[1].split(/\r?\n/).filter(Boolean).map((line) => {
    const separator = line.indexOf(':');
    if (separator === -1) throw new Error(`Invalid front matter in ${filename}: ${line}`);
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    return [key, value];
  }));

  if (!metadata.title || !metadata.date) {
    throw new Error(`${filename} needs title and date in its front matter.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date)) {
    throw new Error(`${filename} needs its date in YYYY-MM-DD format.`);
  }

  return { ...metadata, body: match[2].trim() };
}

function inlineMarkdown(text) {
  const images = [];
  const tokenized = text.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+|[a-zA-Z0-9][a-zA-Z0-9._/-]*)\)/g, (match, alt, source) => {
    const markup = imageMarkup(alt, source, '../../');
    if (!markup) return match;
    const token = `@@BLOG_IMAGE_${images.length}@@`;
    images.push(markup);
    return token;
  });
  const escaped = escapeHtml(tokenized);
  return escaped
    .replace(/@@BLOG_IMAGE_(\d+)@@/g, (match, index) => images[index])
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let paragraph = [];
  let list = [];
  let listType = '';

  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) blocks.push(`<${listType}>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</${listType}>`);
    list = [];
    listType = '';
  };

  for (const line of lines) {
    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    const quote = line.match(/^>\s*(.+)$/);
    const unordered = line.match(/^[-*]\s+(.+)$/);
    const ordered = line.match(/^\d+\.\s+(.+)$/);
    const image = line.match(/^!\[([^\]]*)\]\((https?:\/\/[^\s)]+|[a-zA-Z0-9][a-zA-Z0-9._/-]*)\)$/);

    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    if (heading) {
      flushParagraph(); flushList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
    } else if (image) {
      flushParagraph(); flushList();
      const markup = imageMarkup(image[1], image[2], '../../');
      if (markup) blocks.push(`<figure class="post-image">${markup}</figure>`);
    } else if (quote) {
      flushParagraph(); flushList();
      blocks.push(`<blockquote><p>${inlineMarkdown(quote[1])}</p></blockquote>`);
    } else if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? 'ul' : 'ol';
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      list.push((unordered || ordered)[1]);
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }

  flushParagraph();
  flushList();
  return blocks.join('\n');
}

function postPage({ title, subtitle, thumbnail, date, body }) {
  const safeTitle = escapeHtml(title);
  const subtitleMarkup = subtitle
    ? `<p class="post-subtitle">${escapeHtml(subtitle)}</p>`
    : '';
  const thumbnailImage = thumbnail ? imageMarkup(title, thumbnail, '../../') : null;
  const thumbnailMarkup = thumbnailImage
    ? `<figure class="post-image post-thumbnail">${thumbnailImage}</figure>`
    : '';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(title)} — a post by Rana Hanna." /><title>${safeTitle} — Rana Hanna</title>
    <link rel="stylesheet" href="../../styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header"><a class="wordmark" href="../../index.html" aria-label="Rana Hanna home">Rana Hanna<span>.</span></a><button class="menu-button" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-nav"><span aria-hidden="true"></span><span aria-hidden="true"></span></button><nav id="site-nav" class="site-nav" aria-label="Main navigation"><a href="../../index.html">Home</a><a href="../birdsintherain.html">Novel</a><a href="../press.html">In the Press</a><a href="../blog.html" aria-current="page">Blog</a><a href="../about.html">About</a><a href="../contact.html">Contact</a></nav></header>
    <main id="main"><article class="post section-shell"><header class="post-header${subtitle ? ' post-header--with-subtitle' : ''}"><p class="eyebrow">Blog</p><h1>${safeTitle}</h1>${subtitleMarkup}<p class="post-date">${escapeHtml(displayDate(date))}</p></header><div class="post-body">${thumbnailMarkup}${renderMarkdown(body)}</div><a class="back-link" href="../blog.html">← All posts</a></article></main>
    <footer class="site-footer section-shell"><a class="wordmark" href="../../index.html">Rana Hanna<span>.</span></a><p>© <span id="year"></span> Rana Hanna. All rights reserved.</p></footer><script src="../../script.js"></script>
  </body>
</html>`;
}

await mkdir(path.dirname(indexFile), { recursive: true });
await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });

const files = (await readdir(blogDirectory)).filter((file) => file.endsWith('.md')).sort();
const posts = await Promise.all(files.map(async (filename) => {
  const slug = path.basename(filename, '.md');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${filename} needs a lowercase, hyphenated filename.`);
  }
  const post = parsePost(await readFile(path.join(blogDirectory, filename), 'utf8'), filename);
  await writeFile(path.join(outputDirectory, `${slug}.html`), postPage(post));
  return {
    title: post.title,
    date: displayDate(post.date),
    description: post.description,
    thumbnail: post.thumbnail ? imageSource(post.thumbnail, '../') : undefined,
    url: `blogs/${slug}.html`,
    sortDate: post.date,
  };
}));

posts.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
const archive = posts.map(({ sortDate, ...post }) => post);
await writeFile(indexFile, `${JSON.stringify(archive, null, 2)}\n`);
console.log(`Built ${posts.length} blog post${posts.length === 1 ? '' : 's'}.`);
