# Rana Hanna website

A lightweight static website for [Rana Hanna](https://www.ranahanna.com/). It uses plain HTML, CSS, and a small amount of JavaScript—no build process or third-party code is needed.

## Editing the site

- `index.html` is the home page. The secondary pages live in `pages/`: `birdsintherain.html`, `writing.html`, `about.html`, and `contact.html`.
- `styles.css` contains all visual styling, including the mobile layout.
- `script.js` only controls the mobile navigation menu and footer year.
- `assets/` contains the author portrait and the novel image.

To update copy, edit `index.html` in any text editor and refresh the browser. To change the colours, fonts, or layout, start with the variables at the top of `styles.css`.

## Publishing with GitHub Pages

1. Push this repository to GitHub.
2. In the repository’s **Settings → Pages**, choose **Deploy from a branch**.
3. Select the `main` branch and the `/ (root)` folder, then save.

GitHub Pages will publish `index.html` automatically. The included `.nojekyll` file ensures GitHub serves the site as-is.

## Local preview

Open `index.html` directly in a browser, or run this from the project folder:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
