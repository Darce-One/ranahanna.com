# Rana Hanna website

A lightweight static website for [Rana Hanna](https://www.ranahanna.com/). It uses plain HTML, CSS, and a small amount of JavaScript, with a dependency-free Node script to turn Markdown blog posts into static pages.

## Editing the site

- `index.html` is the home page. The secondary pages live in `pages/`, including `press.html` and `blog.html`. `writing.html` remains only as a redirect for older links.
- `styles.css` contains all visual styling, including the mobile layout.
- `data/articles.json` holds the article links used on the In the Press page. Each entry needs a `title`, `author`, `publisher`, `date`, and `link`.
- `blogs/` contains the Markdown source for blog posts. Every post needs `title`, `date` (`YYYY-MM-DD`), and `description` in its front matter. Use lowercase, hyphenated filenames.
- `scripts/build-blogs.mjs` scans `blogs/`, creates the blog archive data, and renders the corresponding individual pages in `pages/blogs/`.
- `script.js` controls the mobile navigation menu, footer year, and the press/blog archive lists.
- `assets/` contains the author portrait and the novel image.

To update copy, edit `index.html` in any text editor and refresh the browser. To change the colours, fonts, or layout, start with the variables at the top of `styles.css`.

## Publishing a blog post

1. Add or edit a Markdown file in `blogs/`, using the two included templates as a guide.
2. Run `node scripts/build-blogs.mjs` from the project folder.
3. Commit the Markdown file, `data/blogs.json`, and the generated file in `pages/blogs/` together.

The archive automatically orders posts by date. The build script has no package dependencies.

## Publishing with GitHub Pages

1. Push this repository to GitHub.
2. In the repository’s **Settings → Pages**, choose **Deploy from a branch**.
3. Select the `main` branch and the `/ (root)` folder, then save.

GitHub Pages will publish `index.html` automatically. The included `.nojekyll` file ensures GitHub serves the site as-is.

## Local preview

Run this from the project folder (the press and blog archive lists load JSON, so use a local server rather than opening the HTML file directly):

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
