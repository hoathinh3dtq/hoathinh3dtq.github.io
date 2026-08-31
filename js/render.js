/* ==========================================================================
   HH3DTQ render layer
   Builds every card, grid and pager from the dataset exposed by js/data.js.
   Nothing here hardcodes a series, a slug, a page count or an episode count.
   ========================================================================== */
(function (global) {
  'use strict';

  var D = global.HH3D;

  function esc(s) {
    return (s == null ? '' : String(s))
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function poster(rec) {
    return D.base() + (rec.poster || '');
  }

  /* three distinct concepts, never conflated */
  function epLabel(rec) {
    var have = rec.available_episode_count || 0;
    var want = rec.expected_episode_count;
    if (want && want > 0) return have + ' / ' + want + ' t\u1EADp';
    return have + ' t\u1EADp';
  }

  function detailHref(rec) {
    return D.base() + 'xem-phim.html?id=' + encodeURIComponent(rec.slug);
  }

  function animeCard(rec, rank) {
    var badges = '';
    if (rank) {
      badges += '<span class="rank-badge top' + (rank <= 3 ? rank : '') + '">' + rank + '</span>';
    }
    if (rec.rating) {
      badges += '<span class="rating-badge">&#11088; ' + esc(rec.rating) + '</span>';
    }
    return '' +
      '<div class="anime-card" data-slug="' + esc(rec.slug) + '">' +
        '<a href="' + esc(detailHref(rec)) + '">' +
          '<div class="card-img">' +
            '<img src="' + esc(poster(rec)) + '" alt="' + esc(rec.title) + '" loading="lazy">' +
            badges +
          '</div>' +
          '<div class="card-info">' +
            '<div class="card-title">' + esc(rec.title) + '</div>' +
            '<div class="card-subtitle">' + esc(rec.title_alt || epLabel(rec)) + '</div>' +
          '</div>' +
        '</a>' +
      '</div>';
  }

  function episodeCard(rec) {
    var q = rec.is4k ? '<span class="quality-badge">4K</span>' : '';
    var dur = rec.duration ? esc(rec.duration) + ' Ph\u00FAt/T\u1EADp' : epLabel(rec);
    return '' +
      '<div class="episode-card" data-slug="' + esc(rec.slug) + '">' +
        '<a href="' + esc(detailHref(rec)) + '">' +
          '<div class="card-img">' +
            '<img src="' + esc(poster(rec)) + '" alt="' + esc(rec.title) + '" loading="lazy">' +
            q +
            '<div class="episode-overlay">' +
              '<span class="ep-duration">' + dur + '</span>' +
              '<span class="ep-progress">' + epLabel(rec) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="card-info">' +
            '<div class="card-title">' + esc(rec.title) + '</div>' +
            '<div class="card-subtitle">' +
              (rec.latest_episode_label ? esc(rec.latest_episode_label)
                                        : 'T\u1EADp ' + (rec.latest_episode || 0)) +
            '</div>' +
          '</div>' +
        '</a>' +
      '</div>';
  }

  function renderGrid(el, list, kind, startRank) {
    if (!el) return;
    var html = '';
    for (var i = 0; i < list.length; i++) {
      html += kind === 'episode' ? episodeCard(list[i])
                                 : animeCard(list[i], startRank ? startRank + i : 0);
    }
    el.innerHTML = html || '<p style="padding:24px;color:#888">Kh\u00F4ng c\u00F3 phim n\u00E0o.</p>';
  }

  /* ------------------------------- pager -------------------------------- */
  function renderPager(container, cur, totalPages, hrefFor) {
    if (!container) return;
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    function num(n, active) {
      return '<a href="' + esc(hrefFor(n)) + '" class="page-num' + (active ? ' active' : '') +
             '" data-page="' + n + '">' + n + '</a>';
    }
    var html = '';
    html += cur > 1
      ? '<a href="' + esc(hrefFor(cur - 1)) + '" class="page-prev" data-page="' + (cur - 1) + '">&#8249; Tr\u01B0\u1EDBc</a>'
      : '<span class="page-prev" style="opacity:.35;cursor:default">&#8249; Tr\u01B0\u1EDBc</span>';

    html += '<span id="pageNumbers">';
    var from = Math.max(1, cur - 2), to = Math.min(totalPages, cur + 2);
    if (from > 1) {
      html += num(1, false);
      if (from > 2) html += '<span class="page-dots">...</span>';
    }
    for (var i = from; i <= to; i++) html += num(i, i === cur);
    if (to < totalPages) {
      if (to < totalPages - 1) html += '<span class="page-dots">...</span>';
      html += num(totalPages, false);
    }
    html += '</span>';

    html += cur < totalPages
      ? '<a href="' + esc(hrefFor(cur + 1)) + '" class="page-next" data-page="' + (cur + 1) + '">Sau &#8250;</a>'
      : '<span class="page-next" style="opacity:.35;cursor:default">Sau &#8250;</span>';

    container.innerHTML = html;
  }

  function currentPage() {
    var n = parseInt(new URLSearchParams(global.location.search).get('page'), 10);
    return n > 0 ? n : 1;
  }

  function pageHref(n) {
    var u = new URL(global.location.href);
    u.searchParams.set('page', n);
    return u.pathname + u.search;
  }

  /* --------------- one call wires a whole listing page ------------------ */
  function mountListing(opts) {
    var grid = document.querySelector(opts.grid);
    var pager = document.querySelector(opts.pager);
    if (grid) {
      grid.innerHTML = '<p class="grid-loading" style="padding:24px;color:#888">' +
                       '\u0110ang t\u1EA3i d\u1EEF li\u1EC7u...</p>';
    }
    return D.ready().then(function () {
      var list = opts.filter ? opts.filter(D) : D.sorted(opts.sort || 'latest');
      var pg = D.page(list, currentPage());
      renderGrid(grid, pg.items, opts.kind || 'anime',
                 opts.rank ? (pg.page - 1) * D.perPage() + 1 : 0);
      renderPager(pager, pg.page, pg.totalPages, pageHref);
      var c = opts.countEl && document.querySelector(opts.countEl);
      if (c) {
        c.textContent = pg.total + ' phim \u00B7 trang ' + pg.page + '/' + pg.totalPages;
      }
      return pg;
    }).catch(function (e) {
      if (grid) {
        grid.innerHTML = '<p style="padding:24px;color:#e55">' +
          'L\u1ED7i t\u1EA3i d\u1EEF li\u1EC7u: ' + esc(e.message) +
          ' <a href="javascript:location.reload()" style="color:#f5a623">Th\u1EED l\u1EA1i</a></p>';
      }
      throw e;
    });
  }

  global.HH3DRender = {
    esc: esc,
    poster: poster,
    epLabel: epLabel,
    detailHref: detailHref,
    animeCard: animeCard,
    episodeCard: episodeCard,
    renderGrid: renderGrid,
    renderPager: renderPager,
    currentPage: currentPage,
    pageHref: pageHref,
    mountListing: mountListing
  };
})(window);
