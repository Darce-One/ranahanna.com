# Rana Hanna website

A lightweight static website for [Rana Hanna](https://www.ranahanna.com/). It uses plain HTML, CSS, and a small amount of JavaScript, with a dependency-free Node script to turn Markdown blog posts into static pages.

## Editing the site

- `index.html` is the home page. The secondary pages live in `pages/`, including `press.html` and `blog.html`. `writing.html` remains only as a redirect for older links.
- `styles.css` contains all visual styling, including the mobile layout.
- `data/articles.json` holds the article links used on the In the Press page. Each entry needs a `title`, `author`, `publisher`, `date`, and `link`.
- `blogs/` contains the Markdown source for blog posts. Every post needs `title` and `date` (`YYYY-MM-DD`) in its front matter; `description`, `subtitle`, `thumbnail`, and `thumbnailCredit` are optional. A subtitle appears below the title, while a thumbnail appears as the lead image on the post and in the blog archive. Its credit appears below the lead image on the post only. Use lowercase, hyphenated filenames.
- `scripts/build-blogs.mjs` scans `blogs/`, creates the blog archive data, and renders the corresponding individual pages in `pages/blogs/`.
- `script.js` controls the mobile navigation menu, footer year, and the press/blog archive lists.
- `assets/` contains the author portrait and the novel image. Put blog images in `assets/blog-images/`.

To update copy, edit `index.html` in any text editor and refresh the browser. To change the colours, fonts, or layout, start with the variables at the top of `styles.css`.

## Publishing a blog post

1. Add or edit a Markdown file in `blogs/`, using the two included templates as a guide.
2. Commit and push the Markdown file to `main`.
3. The deployment workflow generates the blog archive and individual pages before publishing the static site.

The archive automatically orders posts by date. Generated files in `data/blogs.json` and `pages/blogs/` are intentionally ignored by Git. For a local preview, run `node scripts/build-blogs.mjs` before starting the local server.

### Blog images and thumbnails

Save an image in `assets/blog-images/`, then refer to its filename (or a path within that folder) in Markdown. Standard Markdown image syntax inserts it into the post:

```md
![A descriptive alternative text](my-image.jpg)
```

Add the same image, or another one, as an archive thumbnail with `thumbnail` in the front matter:

```md
---
title: My post
date: 2026-09-15
thumbnail: my-image.jpg
thumbnailCredit: Photo by [Photographer](https://example.com) on [Unsplash](https://unsplash.com)
---
```

`thumbnailCredit` supports the same Markdown links as the body and displays below the lead image only. External `https://` image URLs also work for both. Use a descriptive alt text for every image in the body.

## Publishing with GitHub Pages

1. Push this repository to GitHub.
2. In the repository’s **Settings → Pages**, choose **GitHub Actions** as the publishing source.
3. Push to `main`, then wait for the **Deploy GitHub Pages** workflow to finish in the Actions tab.

The workflow runs the Markdown generator, then deploys the resulting static HTML, CSS, JavaScript, and JSON. Visitors never run the generator.

## Local preview

Run this from the project folder (the press and blog archive lists load JSON, so use a local server rather than opening the HTML file directly):

```sh
node scripts/build-blogs.mjs
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
