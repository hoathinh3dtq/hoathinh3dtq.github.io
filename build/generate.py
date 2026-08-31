#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""HH3DTQ static page generator.

Generates every HTML page from the partials in build/partials.py.
Every page is a thin shell: content is rendered at runtime by
js/data.js + js/render.js from the JSON dataset.

No hardcoded series, slugs, page counts, or episode counts.
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from partials import *

# DATASET_ROOT is the D:/hh3dtq/ directory
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(encoding='utf-8')

# ---- page-specific inline scripts ----

INDEX_SCRIPT = """<script>
(function() {
  var D = window.HH3D, R = window.HH3DRender;
  D.ready().then(function() {
    // trending section: Firestore admin config, fallback to top 12 by rating
    function renderFallbackTrending() {
      var trending = D.sorted('rating').slice(0, 12);
      R.renderGrid(document.getElementById('trendingGrid'), trending, 'anime', 1);
    }
    var C = window.HH3DConfig;
    if (C && C.getTrendingItems) {
      C.getTrendingItems().then(function(tcfg) {
        if (tcfg && tcfg.items && tcfg.items.length > 0) {
          R.renderGrid(document.getElementById('trendingGrid'), tcfg.items.slice(0, tcfg.count), 'anime', 1);
        } else { renderFallbackTrending(); }
      }).catch(function() { renderFallbackTrending(); });
    } else { renderFallbackTrending(); }

    // schedule tabs: 7 days from data/schedule.json
    var scheduleEl = document.getElementById('scheduleSection');
    if (scheduleEl) {
      fetch(D.base() + 'data/schedule.json')
        .then(function(r) { return r.json(); })
        .then(function(sched) {
          var days = ['thu-2','thu-3','thu-4','thu-5','thu-6','thu-7','chu-nhat'];
          var html = '';
          for (var i = 0; i < days.length; i++) {
            var d = sched[days[i]];
            if (!d) continue;
            var cards = [];
            for (var j = 0; j < d.slugs.length; j++) {
              var rec = D.bySlug(d.slugs[j]);
              if (rec) cards.push(R.animeCard(rec));
            }
            html += '<div class="schedule-day" id="day' + i + '"' + (i > 0 ? ' style="display:none"' : '') + '>';
            html += '<h3 style="color:var(--accent);margin-bottom:15px;">📺 Phim chiếu ' + d.name + '</h3>';
            html += '<div class="episode-grid">' + (cards.join('') || '<p style="color:#888">Không có phim nào.</p>') + '</div>';
            html += '</div>';
          }
          scheduleEl.innerHTML = html;
        });
    }

    // full listing with pagination (481 series, 30 per page)
    R.mountListing({
      grid: '#listingGrid',
      pager: '#listingPager',
      countEl: '#listingCount',
      sort: 'latest',
      kind: 'episode',
      rank: false,
      filter: null
    });
  });
  // schedule tab switching
  document.addEventListener('click', function(e) {
    var tab = e.target.closest('.schedule-tab');
    if (!tab) return;
    document.querySelectorAll('.schedule-tab').forEach(function(t) { t.classList.remove('active'); });
    tab.classList.add('active');
    var dayIdx = tab.getAttribute('data-day');
    document.querySelectorAll('.schedule-day').forEach(function(d) { d.style.display = 'none'; });
    var dayEl = document.getElementById('day' + dayIdx);
    if (dayEl) dayEl.style.display = 'block';
  });
})();
</script>"""

LISTING_SCRIPT = """<script>
(function() {
  var D = window.HH3D, R = window.HH3DRender;
  R.mountListing({
    grid: '#listingGrid',
    pager: '#listingPager',
    countEl: '#listingCount',
    sort: '__SORT__',
    kind: '__KIND__',
    rank: __RANK__,
    filter: __FILTER__
  });
})();
</script>"""

SCHEDULE_SCRIPT = """<script>
(function() {
  var D = window.HH3D, R = window.HH3DRender;
  D.ready().then(function() {
    fetch(D.base() + 'data/schedule.json')
      .then(function(r) { return r.json(); })
      .then(function(sched) {
        var days = ['thu-2','thu-3','thu-4','thu-5','thu-6','thu-7','chu-nhat'];
        var html = '';
        for (var i = 0; i < days.length; i++) {
          var d = sched[days[i]];
          if (!d) continue;
          var cards = [];
          for (var j = 0; j < d.slugs.length; j++) {
            var rec = D.bySlug(d.slugs[j]);
            if (rec) cards.push(R.episodeCard(rec));
          }
          html += '<div class="schedule-day" id="day' + i + '"' + (i > 0 ? ' style="display:none"' : '') + '>';
          html += '<h3 style="color:var(--accent);margin-bottom:15px;">📺 Phim chiếu ' + d.name + '</h3>';
          html += '<div class="episode-grid">' + (cards.join('') || '<p style="color:#888">Không có phim nào.</p>') + '</div>';
          html += '</div>';
        }
        document.getElementById('scheduleSection').innerHTML = html;
      });
  });
  document.addEventListener('click', function(e) {
    var tab = e.target.closest('.schedule-tab');
    if (!tab) return;
    document.querySelectorAll('.schedule-tab').forEach(function(t) { t.classList.remove('active'); });
    tab.classList.add('active');
    var dayIdx = tab.getAttribute('data-day');
    document.querySelectorAll('.schedule-day').forEach(function(d) { d.style.display = 'none'; });
    var dayEl = document.getElementById('day' + dayIdx);
    if (dayEl) dayEl.style.display = 'block';
  });
})();
</script>"""

DETAIL_SCRIPT = """<script>
(function() {
  var D = window.HH3D, R = window.HH3DRender;
  var slug = new URLSearchParams(window.location.search).get('id');
  if (!slug) {
    document.getElementById('animeDetail').innerHTML = '<div style="text-align:center;padding:50px;color:#888;"><h2>🔍 Không tìm thấy phim</h2><p>Vui lòng chọn phim từ <a href="index.html" style="color:#f5a623;">trang chủ</a>.</p></div>';
    return;
  }
  function esc(s) { return R.esc(s); }
  function poster(r) { return R.poster(r); }
  var C = window.HH3DConfig;
  var dataPromise = (C && C.loadSeriesData)
    ? C.loadSeriesData(slug)
    : D.ready().then(function() {
        var url = D.base() + 'data/series/' + encodeURIComponent(slug) + '.json';
        return fetch(url).then(function(r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        });
      });
  dataPromise.then(function(data) {
    var epList = data.episodes || [];
    var metaHtml = '';
    // genre
    var genres = (data.genres || []).join(', ');
    if (genres) metaHtml += '<span>🎭 ' + esc(genres) + '</span>';
    // duration
    if (data.duration) metaHtml += '<span>⏱ ' + esc(String(data.duration)) + ' Phút/Tập</span>';
    // episode count
    var have = data.available_episode_count || 0;
    var want = data.expected_episode_count;
    var epLabel = want && want > 0 ? have + '/' + want + ' tập' : have + ' tập';
    metaHtml += '<span>📺 ' + epLabel + '</span>';
    // status
    metaHtml += '<span>📅 ' + (data.status_label || (data.status === 'completed' ? 'Hoàn Thành' : 'Đang chiếu')) + '</span>';

    var html = '<div class="anime-detail">';
    html += '<div class="anime-poster"><img src="' + esc(poster(data)) + '" alt="' + esc(data.title || '') + '" onerror="this.src=\\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 450%22><rect fill=%22%23111%22 width=%22300%22 height=%22450%22/><text fill=%22%23f5a623%22 x=%22150%22 y=%22225%22 text-anchor=%22middle%22 font-size=%2240%22>🎬</text></svg>\\'"></div>';
    html += '<div class="anime-info">';
    html += '<h1>' + esc(data.title || slug) + '</h1>';
    html += '<div class="subtitle">' + esc(data.title_alt || '') + '</div>';
    html += '<div class="anime-meta">' + metaHtml + '</div>';
    if (data.description) html += '<div class="anime-desc">' + esc(data.description) + '</div>';
    // rating
    html += '<div class="vote-section">';
    html += '<div class="vote-stars" id="voteStars">';
    for (var s = 1; s <= 5; s++) {
      html += '<span class="vote-star' + (s <= Math.round(data.rating || 0) ? ' active' : '') + '" data-stars="' + s + '" onclick="submitVote(\\'' + esc(slug) + '\\',' + s + ')">★</span>';
    }
    html += '</div>';
    html += '<span class="vote-display" id="voteDisplay">⭐ ' + (data.rating || '?') + ' (' + (data.vote_count || 0) + ' lượt)</span>';
    html += '</div>';
    html += '</div></div>';

    // episodes — grid layout matching hoathinh3d.ee (12 cols desktop, 6 tablet, 4 mobile)
    // Two sections always visible: VIỆT SUB + THUYẾT MINH
    var epList = data.episodes || [];
    // Sort: latest-first (descending) — newest on top
    var sortedEps = epList.slice().sort(function(a, b) {
      return (b.episode_number || 0) - (a.episode_number || 0);
    });
    // Split by type
    var vsEps = [], tmEps = [];
    for (var i = 0; i < sortedEps.length; i++) {
      if (sortedEps[i].type === 'thuyetminh') tmEps.push(sortedEps[i]);
      else vsEps.push(sortedEps[i]);
    }

    // Get current episode from URL (for active state)
    var currentEp = parseInt(new URLSearchParams(window.location.search).get('ep'), 10) || null;

    function renderEpsGrid(eps, typeLabel) {
      if (!eps.length) {
        return '<p class="eps-empty">Chưa có tập ' + typeLabel + ' nào.</p>';
      }
      var html = '';
      for (var i = 0; i < eps.length; i++) {
        var ep = eps[i];
        var epNum = ep.episode_number || '?';
        var isActive = currentEp === epNum ? ' active' : '';
        var hasUrl = ep.url && ep.url.length > 0;
        var cls = 'eps-btn' + isActive + (hasUrl ? '' : ' unavailable');
        if (hasUrl) {
          html += '<a href="player.html?slug=' + encodeURIComponent(slug) + '&amp;ep=' + esc(String(epNum)) + '" class="' + cls + '">' + esc(String(epNum)) + '</a>';
        } else {
          html += '<span class="' + cls + '">' + esc(String(epNum)) + '</span>';
        }
      }
      return html;
    }

    html += '<div class="eps-list-container">';

    // VIỆT SUB section
    html += '<div class="eps-server">';
    html += '<div class="eps-server-name">📺 VIỆT SUB <span class="eps-count">(' + vsEps.length + ' tập)</span></div>';
    html += '<div class="eps-grid">' + renderEpsGrid(vsEps, 'VietSub') + '</div>';
    html += '</div>';

    // THUYẾT MINH section
    html += '<div class="eps-server">';
    html += '<div class="eps-server-name">🎙 THUYẾT MINH <span class="eps-count">(' + tmEps.length + ' tập)</span></div>';
    html += '<div class="eps-grid">' + renderEpsGrid(tmEps, 'Thuyết Minh') + '</div>';
    html += '</div>';

    html += '</div>';

    // comments
    html += '<h2 class="section-heading" style="margin-top:30px;"><span class="icon">💬</span> Bình luận</h2>';
    html += '<div class="comment-form">';
    html += '<input type="text" id="commentInput" placeholder="Viết bình luận...">';
    html += '<button onclick="submitComment(\\'' + esc(slug) + '\\')">Gửi</button>';
    html += '</div>';
    html += '<div id="commentsContainer"><div class="loading">Đang tải bình luận...</div></div>';

    document.getElementById('animeDetail').innerHTML = html;

    // load comments and votes
    if (typeof loadComments === 'function') loadComments(slug);
    if (typeof loadVotes === 'function') loadVotes(slug);
  }).catch(function(e) {
    document.getElementById('animeDetail').innerHTML =
      '<div style="text-align:center;padding:50px;color:#888;">' +
      '<h2>⚠ Lỗi tải phim</h2>' +
      '<p>' + esc(e.message || String(e)) + '</p>' +
      '<a href="index.html" style="display:inline-block;margin-top:15px;background:#f5a623;color:#000;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:600;">\U0001f3e0 Về trang chủ</a> ' +
      '<button onclick="location.reload()" style="display:inline-block;margin-top:15px;background:#1a1a1a;color:#f5a623;border:1px solid #333;padding:10px 20px;border-radius:5px;cursor:pointer;font-weight:600;font-family:inherit;">\U0001f504 Thử lại</button>' +
      '</div>';
    console.error('[HH3DTQ] detail error:', e);
  });
})();
</script>"""

SEARCH_SCRIPT = """<script>
(function() {
  var D = window.HH3D, R = window.HH3DRender;
  var q = new URLSearchParams(window.location.search).get('q') || '';
  var input = document.getElementById('searchInput');
  if (input) input.value = q;
  var titleEl = document.getElementById('searchTitle');
  var grid = document.getElementById('searchGrid');
  var countEl = document.getElementById('searchCount');

  if (!q) {
    if (titleEl) titleEl.textContent = '🔍 Tìm kiếm phim';
    grid.innerHTML = '<p style="color:#888;padding:24px;">Nhập từ khóa để tìm kiếm phim.</p>';
    return;
  }

  if (titleEl) titleEl.textContent = '🔍 Kết quả tìm kiếm: "' + R.esc(q) + '"';

  D.ready().then(function() {
    var results = D.search(q);
    if (countEl) countEl.textContent = results.length + ' phim';
    R.renderGrid(grid, results, 'anime');
  }).catch(function(e) {
    grid.innerHTML = '<p style="color:#e55;padding:24px;">Lỗi: ' + R.esc(e.message) + '</p>';
  });
})();
</script>"""

# ---- page generators ----

def gen_index():
    """Generate index.html with trending, schedule tabs, and full paginated listing."""
    main = """  <section>
    <h2 class="section-heading"><span class="icon">🔥</span> Đang thịnh hành</h2>
    <div class="trending-grid" id="trendingGrid">
      <p style="padding:24px;color:#888;">Đang tải dữ liệu...</p>
    </div>
  </section>

  <section>
    <h2 class="section-heading"><span class="icon">📅</span> Lịch Chiếu & Mới Cập Nhật</h2>

    <div class="schedule-tabs">
      <button class="schedule-tab active" data-day="0">📺 Thứ Hai</button>
      <button class="schedule-tab" data-day="1">📺 Thứ Ba</button>
      <button class="schedule-tab" data-day="2">📺 Thứ Tư</button>
      <button class="schedule-tab" data-day="3">📺 Thứ Năm</button>
      <button class="schedule-tab" data-day="4">📺 Thứ Sáu</button>
      <button class="schedule-tab" data-day="5">📺 Thứ Bảy</button>
      <button class="schedule-tab" data-day="6">📺 Chủ Nhật</button>
    </div>

    <div id="scheduleSection">
      <p style="padding:24px;color:#888;">Đang tải lịch chiếu...</p>
    </div>
  </section>

  <section style="margin-top:30px;">
    <h2 class="section-heading"><span class="icon">🆕</span> Tất Cả Phim</h2>
    <div class="listing-count" id="listingCount" style="color:#888;font-size:13px;margin-bottom:10px;"></div>
    <div class="episode-grid" id="listingGrid">
      <p style="padding:24px;color:#888;">Đang tải dữ liệu...</p>
    </div>
    <div class="pagination" id="listingPager"></div>
  </section>"""
    return page_wrap(
        'HH3DTQ - Phim Hoạt Hình 3D Trung Quốc 4K Thuyết Minh VietSub',
        'HH3DTQ - Xem phim hoạt hình 3D Trung Quốc 4K, thuyết minh, vietsub. Kho phim donghua, tu tiên, huyền huyễn, đô thị mới nhất.',
        'Trang chủ', '', main, INDEX_SCRIPT)

def gen_listing(filename, title, desc, active, sort, kind, rank, filter_expr):
    """Generate a listing page (moi-cap-nhat, top-xem-nhieu, hoan-thanh)."""
    heading = {'Mới Cập Nhật': '🆕', 'Top Xem Nhiều': '🏆', 'Hoàn Thành': '✅'}.get(active, '📺')
    main = f"""  <section>
    <h2 class="section-heading"><span class="icon">{heading}</span> {active}</h2>
    <div class="listing-count" id="listingCount" style="color:#888;font-size:13px;margin-bottom:10px;"></div>
    <div class="episode-grid" id="listingGrid">
      <p style="padding:24px;color:#888;">Đang tải dữ liệu...</p>
    </div>
    <div class="pagination" id="listingPager"></div>
  </section>"""
    script = LISTING_SCRIPT.replace('__SORT__', sort).replace('__KIND__', kind)
    script = script.replace('__RANK__', 'true' if rank else 'false')
    script = script.replace('__FILTER__', filter_expr)
    return page_wrap(title, desc, active, '', main, script)

def gen_hoan_thanh():
    return gen_listing('hoan-thanh.html',
        'Hoàn Thành - HH3DTQ',
        'HH3DTQ - Danh sách phim hoạt hình 3D Trung Quốc đã hoàn thành. Xem donghua 4K vietsub thuyết minh full.',
        'Hoàn Thành', 'latest', 'anime', False,
        'function(D) { return D.byStatus("completed"); }')

def gen_moi_cap_nhat():
    return gen_listing('moi-cap-nhat.html',
        'Mới Cập Nhật - HH3DTQ',
        'HH3DTQ - Phim hoạt hình 3D Trung Quốc mới cập nhật. Xem donghua 4K vietsub thuyết minh mới nhất.',
        'Mới Cập Nhật', 'latest', 'episode', False, 'null')

def gen_top_xem_nhieu():
    return gen_listing('top-xem-nhieu.html',
        'Top Xem Nhiều - HH3DTQ',
        'HH3DTQ - Top phim hoạt hình 3D Trung Quốc được xem nhiều nhất. Donghua 4K vietsub thuyết minh.',
        'Top Xem Nhiều', 'views', 'anime', True, 'null')

def gen_lich_chieu():
    """Generate lich-chieu.html with 7 schedule tabs."""
    main = """  <section>
    <h2 class="section-heading"><span class="icon">📅</span> Lịch Chiếu</h2>
    <div class="schedule-tabs">
      <button class="schedule-tab active" data-day="0">📺 Thứ Hai</button>
      <button class="schedule-tab" data-day="1">📺 Thứ Ba</button>
      <button class="schedule-tab" data-day="2">📺 Thứ Tư</button>
      <button class="schedule-tab" data-day="3">📺 Thứ Năm</button>
      <button class="schedule-tab" data-day="4">📺 Thứ Sáu</button>
      <button class="schedule-tab" data-day="5">📺 Thứ Bảy</button>
      <button class="schedule-tab" data-day="6">📺 Chủ Nhật</button>
    </div>
    <div id="scheduleSection">
      <p style="padding:24px;color:#888;">Đang tải lịch chiếu...</p>
    </div>
  </section>"""
    return page_wrap(
        'Lịch Chiếu - HH3DTQ',
        'HH3DTQ - Lịch chiếu phim hoạt hình 3D Trung Quốc. Xem lịch phát sóng donghua 4K vietsub thuyết minh.',
        'Lịch Chiếu', '', main, SCHEDULE_SCRIPT)

def gen_xem_phim():
    """Generate xem-phim.html detail page."""
    main = """  <div id="animeDetail">
    <div class="loading" style="text-align:center;padding:50px;color:#888;">⏳ Đang tải thông tin phim...</div>
  </div>"""
    return page_wrap(
        'Xem Phim - HH3DTQ',
        'HH3DTQ - Xem phim hoạt hình 3D Trung Quốc 4K thuyết minh vietsub.',
        None, '', main, DETAIL_SCRIPT)

def gen_tim_kiem():
    """Generate tim-kiem.html search results page."""
    main = """  <section>
    <h2 class="section-heading" id="searchTitle">🔍 Tìm kiếm phim</h2>
    <div class="search-box" style="margin-bottom:15px;">
      <form onsubmit="window.location.href='tim-kiem.html?q='+encodeURIComponent(document.getElementById('searchInput').value.trim());return false;">
        <input type="text" id="searchInput" placeholder="Tìm kiếm phim...">
        <button type="submit">🔍 Tìm kiếm</button>
      </form>
    </div>
    <div id="searchCount" style="color:#888;font-size:13px;margin-bottom:10px;"></div>
    <div class="trending-grid" id="searchGrid">
      <p style="padding:24px;color:#888;">Nhập từ khóa để tìm kiếm.</p>
    </div>
  </section>"""
    return page_wrap(
        'Tìm Kiếm - HH3DTQ',
        'HH3DTQ - Tìm kiếm phim hoạt hình 3D Trung Quốc 4K thuyết minh vietsub.',
        None, '', main, SEARCH_SCRIPT)

def gen_category():
    """Generate category/{genre}.html for each genre."""
    pages = []
    for gslug, gname in GENRES:
        main = f"""  <section>
    <h2 class="section-heading"><span class="icon">🎭</span> {gname}</h2>
    <div class="listing-count" id="listingCount" style="color:#888;font-size:13px;margin-bottom:10px;"></div>
    <div class="trending-grid" id="listingGrid">
      <p style="padding:24px;color:#888;">Đang tải dữ liệu...</p>
    </div>
    <div class="pagination" id="listingPager"></div>
  </section>"""
        script = LISTING_SCRIPT.replace('__SORT__', 'latest')
        script = script.replace('__KIND__', 'anime')
        script = script.replace('__RANK__', 'false')
        script = script.replace('__FILTER__', f'function(D) {{ return D.byGenre("{gname.lower()}", D.all()); }}')
        html = page_wrap(
            f'{gname} - HH3DTQ',
            f'HH3DTQ - Phim hoạt hình 3D Trung Quốc thể loại {gname}. Xem donghua 4K vietsub thuyết minh.',
            'Thể Loại', '../', main, script)
        pages.append((f'category/{gslug}.html', html))
    return pages

def gen_sitemap():
    """Generate sitemap.html listing all pages."""
    links = [
        ('index.html', '🏠 Trang chủ'),
        ('moi-cap-nhat.html', '🆕 Mới Cập Nhật'),
        ('top-xem-nhieu.html', '🏆 Top Xem Nhiều'),
        ('lich-chieu.html', '📅 Lịch Chiếu'),
        ('hoan-thanh.html', '✅ Hoàn Thành'),
        ('tim-kiem.html', '🔍 Tìm kiếm'),
    ]
    cat_links = [(f'category/{gslug}.html', f'🎭 {gname}') for gslug, gname in GENRES]

    main = """  <section>
    <h2 class="section-heading"><span class="icon">🗺</span> Sitemap</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:15px;margin-top:20px;">
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:20px;">
        <h3 style="color:#f5a623;margin-bottom:12px;">📄 Trang Chính</h3>
        <ul style="list-style:none;padding:0;">"""
    for href, label in links:
        main += f'\n          <li style="padding:6px 0;"><a href="{href}" style="color:#ccc;">{label}</a></li>'
    main += """
        </ul>
      </div>
      <div style="background:#1a1a1a;border:1px solid #2a2a2a;border-radius:10px;padding:20px;">
        <h3 style="color:#f5a623;margin-bottom:12px;">🎭 Thể Loại</h3>
        <ul style="list-style:none;padding:0;">"""
    for href, label in cat_links:
        main += f'\n          <li style="padding:6px 0;"><a href="{href}" style="color:#ccc;">{label}</a></li>'
    main += """
        </ul>
      </div>
    </div>
    <p style="margin-top:30px;color:#888;font-size:13px;text-align:center;">HH3DTQ — Kho phim hoạt hình 3D Trung Quốc 4K Thuyết Minh VietSub</p>
  </section>"""
    return page_wrap(
        'Sitemap - HH3DTQ',
        'HH3DTQ - Sitemap - Danh sách tất cả trang. Phim hoạt hình 3D Trung Quốc 4K.',
        None, '', main, '')

# ---- main ----

def write_file(path, content):
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    return len(content)

def main():
    generated = []

    # root-level pages
    pages = [
        ('index.html', gen_index()),
        ('moi-cap-nhat.html', gen_moi_cap_nhat()),
        ('top-xem-nhieu.html', gen_top_xem_nhieu()),
        ('hoan-thanh.html', gen_hoan_thanh()),
        ('lich-chieu.html', gen_lich_chieu()),
        ('xem-phim.html', gen_xem_phim()),
        ('tim-kiem.html', gen_tim_kiem()),
        ('sitemap.html', gen_sitemap()),
    ]

    for fname, html in pages:
        path = os.path.join(ROOT, fname)
        sz = write_file(path, html)
        generated.append((fname, sz))
        print(f'  {fname:30s} {sz:>7,} bytes')

    # category pages
    for fname, html in gen_category():
        path = os.path.join(ROOT, fname)
        sz = write_file(path, html)
        generated.append((fname, sz))
        print(f'  {fname:30s} {sz:>7,} bytes')

    total = sum(sz for _, sz in generated)
    print(f'\nGenerated {len(generated)} pages, {total:,} bytes total')

if __name__ == '__main__':
    main()