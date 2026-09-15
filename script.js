// The only interactive behavior: a keyboard-accessible menu on smaller screens.
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.site-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navigation.classList.toggle('is-open', !isOpen);
  });

  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      navigation.classList.remove('is-open');
    });
  });
}

const year = document.querySelector('#year');

if (year) year.textContent = new Date().getFullYear();

const articleList = document.querySelector('#article-list');

if (articleList) {
  fetch('../data/articles.json')
    .then((response) => {
      if (!response.ok) throw new Error('Unable to load articles');
      return response.json();
    })
    .then((articles) => {
      if (!Array.isArray(articles)) throw new Error('Articles must be an array');

      articles.forEach(({ title, author, publisher, date, link }) => {
        if (!title || !publisher || !link) return;

        const item = document.createElement('li');
        const articleLink = document.createElement('a');
        const copy = document.createElement('div');
        const heading = document.createElement('h2');
        const source = document.createElement('p');
        const arrow = document.createElement('span');

        articleLink.href = link;
        articleLink.target = '_blank';
        articleLink.rel = 'noreferrer';
        heading.textContent = title;
        source.textContent = [author, publisher, date].filter(Boolean).join(' · ');
        arrow.className = 'article-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '↗';

        copy.append(heading, source);
        articleLink.append(copy, arrow);
        item.append(articleLink);
        articleList.append(item);
      });
    })
    .catch(() => {
      articleList.hidden = true;
    });
}

const blogList = document.querySelector('#blog-list');
const blogListEmpty = document.querySelector('#blog-list-empty');

if (blogList) {
  fetch(blogList.dataset.source)
    .then((response) => {
      if (!response.ok) throw new Error('Unable to load blog posts');
      return response.json();
    })
    .then((posts) => {
      if (!Array.isArray(posts)) throw new Error('Blog posts must be an array');

      posts.forEach(({ title, date, description, thumbnail, url }) => {
        if (!title || !url) return;

        const item = document.createElement('li');
        const postLink = document.createElement('a');
        const copy = document.createElement('div');
        const heading = document.createElement('h2');
        const summary = document.createElement('p');
        const arrow = document.createElement('span');

        postLink.href = url;
        heading.textContent = title;
        summary.textContent = [date, description].filter(Boolean).join(' · ');
        arrow.className = 'article-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '→';

        copy.append(heading, summary);
        if (thumbnail) {
          const thumbnailImage = document.createElement('img');
          thumbnailImage.className = 'article-thumbnail';
          thumbnailImage.src = thumbnail;
          thumbnailImage.alt = '';
          thumbnailImage.loading = 'lazy';
          postLink.append(thumbnailImage);
        }
        postLink.append(copy, arrow);
        item.append(postLink);
        blogList.append(item);
      });

      blogListEmpty.hidden = blogList.children.length > 0;
    })
    .catch(() => {
      blogList.hidden = true;
      blogListEmpty.hidden = false;
    });
}
