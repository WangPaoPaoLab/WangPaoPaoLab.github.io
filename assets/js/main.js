/* ==========================================================================
   WangPaoPaoLab — site index
   Loads data/sites.json, renders the card grid, handles search + filters,
   language (EN / 中文) and light/dark theme.

   To add a site: append an entry to data/sites.json. Nothing else to change.
   ========================================================================== */

(function () {
  'use strict';

  var root = document.documentElement;
  var DATA_URL = 'data/sites.json';

  var STORAGE_LANG = 'lang';
  var STORAGE_THEME = 'theme';

  /* ---------- state --------------------------------------------------- */

  var store = { categories: [], sites: [] };
  var activeCat = 'all';
  var query = '';
  var lang = 'en';

  var STATUS = {
    live:     { en: 'Live',        zh: '已上线' },
    wip:      { en: 'In progress', zh: '建设中' },
    archived: { en: 'Archived',    zh: '已归档' }
  };

  /* ---------- helpers ------------------------------------------------- */

  function t(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] || obj.en || obj.zh || '';
  }

  function hostOf(url) {
    try { return new URL(url).host.replace(/^www\./, ''); }
    catch (e) { return url; }
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function svgIcon(paths, size) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', size || 16);
    svg.setAttribute('height', size || 16);
    svg.setAttribute('aria-hidden', 'true');
    paths.forEach(function (d) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    });
    return svg;
  }

  /* ---------- language ------------------------------------------------ */

  function detectLang() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_LANG); } catch (e) {}
    if (stored === 'zh' || stored === 'en') return stored;
    return (navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  }

  function applyLang(next) {
    lang = next;
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
    document.title = lang === 'zh' ? 'WangPaoPaoLab — 站点合集' : 'WangPaoPaoLab — Site index';

    document.querySelectorAll('[data-en][data-zh]').forEach(function (node) {
      node.textContent = lang === 'zh' ? node.getAttribute('data-zh') : node.getAttribute('data-en');
    });

    document.querySelectorAll('[data-ph-en][data-ph-zh]').forEach(function (node) {
      node.placeholder = lang === 'zh' ? node.getAttribute('data-ph-zh') : node.getAttribute('data-ph-en');
    });

    try { localStorage.setItem(STORAGE_LANG, lang); } catch (e) {}

    renderChips();
    renderGrid();
  }

  /* ---------- theme --------------------------------------------------- */

  function detectTheme() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_THEME); } catch (e) {}
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORAGE_THEME, theme); } catch (e) {}
  }

  /* ---------- filtering ----------------------------------------------- */

  function matches(site) {
    if (activeCat !== 'all' && site.category !== activeCat) return false;
    if (!query) return true;

    var haystack = [
      t(site.title), t(site.desc),
      site.url, site.repo,
      (site.tags || []).join(' ')
    ].join(' ').toLowerCase();

    return query.split(/\s+/).every(function (word) {
      return !word || haystack.indexOf(word) !== -1;
    });
  }

  /* ---------- rendering ----------------------------------------------- */

  function renderChips() {
    var box = document.getElementById('chips');
    if (!box) return;
    box.textContent = '';

    var cats = [{ id: 'all', en: 'All', zh: '全部' }].concat(store.categories || []);

    cats.forEach(function (cat) {
      var count = cat.id === 'all'
        ? store.sites.length
        : store.sites.filter(function (s) { return s.category === cat.id; }).length;
      if (cat.id !== 'all' && count === 0) return;

      var btn = el('button', 'chip');
      btn.type = 'button';
      btn.setAttribute('aria-pressed', String(cat.id === activeCat));
      btn.textContent = t(cat) + ' · ' + count;
      btn.addEventListener('click', function () {
        activeCat = cat.id;
        renderChips();
        renderGrid();
      });
      box.appendChild(btn);
    });
  }

  function buildCard(site) {
    var card = el('article', 'site-card' + (site.featured ? ' is-pinned' : ''));

    /* top: icon + title + host */
    var top = el('div', 'card-top');
    var icon = el('div', 'card-icon', site.icon || t(site.title).slice(0, 1).toUpperCase());
    top.appendChild(icon);

    var heading = el('div', 'card-heading');
    var title = el('h3', 'card-title');
    var titleLink = el('a', null, t(site.title));
    titleLink.href = site.url;
    titleLink.target = '_blank';
    titleLink.rel = 'noopener';
    title.appendChild(titleLink);
    heading.appendChild(title);
    heading.appendChild(el('div', 'card-host', hostOf(site.url)));
    top.appendChild(heading);
    card.appendChild(top);

    /* description */
    card.appendChild(el('p', 'card-desc', t(site.desc)));

    /* tags */
    if (site.tags && site.tags.length) {
      var tags = el('div', 'tags');
      site.tags.forEach(function (tag) { tags.appendChild(el('span', null, tag)); });
      card.appendChild(tags);
    }

    /* footer: status + repo + visit */
    var foot = el('div', 'card-foot');

    var statusKey = STATUS[site.status] ? site.status : 'live';
    var badge = el('span', 'badge');
    badge.setAttribute('data-status', statusKey);
    badge.appendChild(el('span', 'dot'));
    badge.appendChild(el('span', null, STATUS[statusKey][lang]));
    foot.appendChild(badge);

    foot.appendChild(el('span', 'spacer'));

    if (site.repo) {
      var repo = el('a', 'icon-link');
      repo.href = site.repo;
      repo.target = '_blank';
      repo.rel = 'noopener';
      repo.title = 'GitHub';
      repo.setAttribute('aria-label', 'GitHub repository');
      repo.appendChild(svgIcon([
        'M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.85-2.35 4.7-4.58 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z'
      ], 16));
      foot.appendChild(repo);
    }

    var visit = el('a', 'site-link');
    visit.href = site.url;
    visit.target = '_blank';
    visit.rel = 'noopener';
    visit.appendChild(el('span', null, lang === 'zh' ? '访问' : 'Visit'));
    visit.appendChild(svgIcon(['M5 12h13', 'M12.5 5.5l6.5 6.5-6.5 6.5'], 14));
    foot.appendChild(visit);

    card.appendChild(foot);
    return card;
  }

  function renderGrid() {
    var grid = document.getElementById('siteGrid');
    var empty = document.getElementById('empty');
    var loading = document.getElementById('loading');
    if (!grid) return;

    if (loading) loading.remove();

    var visible = store.sites
      .filter(matches)
      .sort(function (a, b) {
        if (!!b.featured !== !!a.featured) return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        return 0;
      });

    /* remove old cards, keep the empty message node */
    Array.prototype.slice.call(grid.querySelectorAll('.site-card')).forEach(function (n) { n.remove(); });

    visible.forEach(function (site) { grid.appendChild(buildCard(site)); });

    if (empty) empty.hidden = visible.length > 0;

    var stat = document.getElementById('statLine');
    if (stat) {
      var n = store.sites.length;
      stat.textContent = lang === 'zh'
        ? n + ' 个站点已收录'
        : n + (n === 1 ? ' site indexed' : ' sites indexed');
    }

    revealCards();
  }

  function revealCards() {
    var cards = document.querySelectorAll('.site-card');
    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });

    cards.forEach(function (card) {
      card.classList.add('reveal');
      io.observe(card);
    });
  }

  function fail(message) {
    var grid = document.getElementById('siteGrid');
    if (!grid) return;
    grid.textContent = '';
    grid.appendChild(el('p', 'empty', message));
  }

  /* ---------- boot ---------------------------------------------------- */

  applyTheme(detectTheme());

  document.getElementById('langToggle').addEventListener('click', function () {
    applyLang(lang === 'zh' ? 'en' : 'zh');
  });

  document.getElementById('themeToggle').addEventListener('click', function () {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  var search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', function () {
      query = search.value.trim().toLowerCase();
      renderGrid();
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* start with the shell translated, then load the data */
  var startLang = detectLang();
  root.setAttribute('data-lang', startLang);
  root.setAttribute('lang', startLang === 'zh' ? 'zh-CN' : 'en');
  document.querySelectorAll('[data-en][data-zh]').forEach(function (node) {
    node.textContent = startLang === 'zh' ? node.getAttribute('data-zh') : node.getAttribute('data-en');
  });
  document.querySelectorAll('[data-ph-en][data-ph-zh]').forEach(function (node) {
    node.placeholder = startLang === 'zh' ? node.getAttribute('data-ph-zh') : node.getAttribute('data-ph-en');
  });
  lang = startLang;
  document.title = lang === 'zh' ? 'WangPaoPaoLab — 站点合集' : 'WangPaoPaoLab — Site index';

  fetch(DATA_URL, { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      store.categories = data.categories || [];
      store.sites = (data.sites || []).filter(function (s) { return s && s.url; });
      renderChips();
      renderGrid();
    })
    .catch(function (err) {
      fail(
        lang === 'zh'
          ? '站点数据加载失败（' + err.message + '）。本地预览请用 HTTP 服务打开，例如 python -m http.server。'
          : 'Could not load site data (' + err.message + '). For local preview serve over HTTP, e.g. python -m http.server.'
      );
    });
})();
