/* ==========================================================================
   HH3DTQ data layer
   Single source of truth = data/series-index.json (481 series, crawled from
   all 17 source listing pages) + data/series/{slug}.json (full record with
   the complete episode array).

   No hardcoded series list, no hardcoded page count, no hardcoded episode
   count. Every number below is derived from the dataset at runtime.
   ========================================================================== */
(function (global) {
  'use strict';

  var INDEX_URL = 'data/series-index.json';
  var SERIES_URL = 'data/series/';
  var PER_PAGE = 30;          // matches the source listing page size

  var _index = null;          // {total, total_episodes, genres, series:[...]}
  var _bySlug = {};
  var _indexPromise = null;
  var _detailCache = {};

  /* ---------- path helper: pages may live at depth 0 or 1 ---------- */
  function base() {
    // repo is served from the domain root; only /category/ adds one level
    return global.location.pathname.indexOf('/category/') !== -1 ? '../' : '';
  }

  function loadIndex() {
    if (_indexPromise) return _indexPromise;
    _indexPromise = fetch(base() + INDEX_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('index HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
        _index = d;
        _bySlug = {};
        for (var i = 0; i < d.series.length; i++) {
          _bySlug[d.series[i].slug] = d.series[i];
        }
        return d;
      });
    return _indexPromise;
  }

  /* ---------- counts, all derived ---------- */
  function totalSeries() { return _index ? _index.series.length : 0; }
  function totalEpisodes() { return _index ? _index.total_episodes : 0; }
  function perPage() { return PER_PAGE; }
  function totalPages(list) {
    var n = (list || (_index ? _index.series : [])).length;
    return Math.max(1, Math.ceil(n / PER_PAGE));
  }

  /* ---------- sorting / slicing ---------- */
  function all() { return _index ? _index.series.slice() : []; }

  function sorted(mode, list) {
    var a = (list || all()).slice();
    if (mode === 'views') {
      a.sort(function (x, y) { return viewsNum(y) - viewsNum(x); });
    } else if (mode === 'rating') {
      a.sort(function (x, y) { return (y.rating || 0) - (x.rating || 0); });
    } else if (mode === 'episodes') {
      a.sort(function (x, y) {
        return (y.available_episode_count || 0) - (x.available_episode_count || 0);
      });
    } else {
      // default: latest episode desc, the order the index was generated in
      a.sort(function (x, y) { return (y.latest_episode || 0) - (x.latest_episode || 0); });
    }
    return a;
  }

  function viewsNum(rec) {
    var s = rec.views_label || '';
    var m = s.replace(/[.,]/g, '').match(/(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function page(list, n) {
    var a = list || all();
    var tp = totalPages(a);
    n = parseInt(n, 10) || 1;
    if (n < 1) n = 1;
    if (n > tp) n = tp;
    var start = (n - 1) * PER_PAGE;
    return { page: n, totalPages: tp, total: a.length, items: a.slice(start, start + PER_PAGE) };
  }

  /* ---------- filters ---------- */
  function byGenre(genre, list) {
    var g = (genre || '').toLowerCase();
    return (list || all()).filter(function (r) {
      var arr = r.genres || [];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].toLowerCase() === g) return true;
      }
      return false;
    });
  }

  function byStatus(status, list) {
    return (list || all()).filter(function (r) { return r.status === status; });
  }

  /* ---------- search across the WHOLE index, not the current page ---------- */
  function norm(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\u0111/g, 'd');
  }

  function search(query) {
    var q = norm(query).trim();
    if (!q) return [];
    var terms = q.split(/\s+/);
    var out = [];
    var list = all();
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      var hay = norm(r.title) + ' ' + norm(r.title_alt) + ' ' +
                norm(r.slug).replace(/-/g, ' ') + ' ' + norm((r.genres || []).join(' '));
      var hit = true, score = 0;
      for (var t = 0; t < terms.length; t++) {
        var at = hay.indexOf(terms[t]);
        if (at === -1) { hit = false; break; }
        score += at === 0 ? 3 : 1;
      }
      if (hit) out.push({ rec: r, score: score });
    }
    out.sort(function (a, b) { return b.score - a.score; });
    return out.map(function (o) { return o.rec; });
  }

  global.HH3D = {
    ready: loadIndex,
    all: all,
    sorted: sorted,
    page: page,
    perPage: perPage,
    totalPages: totalPages,
    totalSeries: totalSeries,
    totalEpisodes: totalEpisodes,
    byGenre: byGenre,
    byStatus: byStatus,
    search: search,
    genres: function () { return _index ? _index.genres : []; },
    bySlug: function (s) { return _bySlug[s] || null; },
    base: base
  };
})(window);
