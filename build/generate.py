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
    // trending section: top 12 by rating
    var trending = D.sorted('rating').slice(0, 12);
    R.renderGrid(document.getElementById('trendingGrid'), trending, 'anime', 1);

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
  D.ready().then(function() {
    var url = D.base() + 'data/series/' + encodeURIComponent(slug) + '.json';
    return fetch(url).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }).then(function(data) {
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

    // episodes
    html += '<h2 class="section-heading"><span class="icon">📺</span> Danh sách tập</h2>';
    html += '<div class="ep-tabs">';
    html += '<button class="ep-tab active" onclick="switchEpType(\\'all\\',this)">Tất cả (' + epList.length + ')</button>';
    // count vietsub & thuyetminh
    var vsCount = 0, tmCount = 0;
    for (var i = 0; i < epList.length; i++) {
      if (epList[i].type === 'vietsub') vsCount++;
      else if (epList[i].type === 'thuyetminh') tmCount++;
    }
    html += '<button class="ep-tab" onclick="switchEpType(\\'vietsub\\',this)">🇻🇳 VietSub (' + vsCount + ')</button>';
    html += '<button class="ep-tab" onclick="switchEpType(\\'thuyetminh\\',this)">🎙 Thuyết Minh (' + tmCount + ')</button>';
    html += '</div>';
    html += '<div id="episodesContainer"></div>';

    // comments
    html += '<h2 class="section-heading" style="margin-top:30px;"><span class="icon">💬</span> Bình luận</h2>';
    html += '<div class="comment-form">';
    html += '<input type="text" id="commentInput" placeholder="Viết bình luận...">';
    html += '<button onclick="submitComment(\\'' + esc(slug) + '\\')">Gửi</button>';
    html += '</div>';
    html += '<div id="commentsContainer"><div class="loading">Đang tải bình luận...</div></div>';

    document.getElementById('animeDetail').innerHTML = html;

    // render episodes
    renderEpisodes(epList, 'all');
    window._epList = epList;
    window._slug = slug;

    // load comments and votes
    if (typeof loadComments === 'function') loadComments(slug);
    if (typeof loadVotes === 'function') loadVotes(slug);
  }).catch(function(e) {
    document.getElementById('animeDetail').innerHTML =
      '<div style="text-align:center;padding:50px;color:#888;">' +
      '<h2>⚠ Lỗi tải phim</h2>' +
      '<p>' + esc(e.message || String(e)) + '</p>' +
      '<a href="index.html" style="display:inline-block;margin-top:15px;background:#f5a623;color:#000;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:600;">🏠 Về trang chủ</a> ' +
      '<button onclick="location.reload()" style="display:inline-block;margin-top:15px;background:#1a1a1a;color:#f5a623;border:1px solid #333;padding:10px 20px;border-radius:5px;cursor:pointer;font-weight:600;font-family:inherit;">🔄 Thử lại</button>' +
      '</div>';
    console.error('[HH3DTQ] detail error:', e);
  });
})();

function renderEpisodes(epList, filter) {
  var html = '';
  for (var i = 0; i < epList.length; i++) {
    var ep = epList[i];
    if (filter !== 'all' && ep.type !== filter) continue;
    var badge = ep.type === 'vietsub'
      ? '<span class="ep-badge vietsub">VietSub</span>'
      : '<span class="ep-badge thuyetminh">Thuyết Minh</span>';
    html += '<div class="episode-item">';
    html += '<span class="ep-num">Tập ' + esc(String(ep.episode_number || '?')) + '</span>';
    html += badge;
    html += '<a href="player.html?slug=' + encodeURIComponent(slug) + '&amp;ep=' + esc(String(ep.episode_number || '?')) + '" class="ep-link">▶ Xem</a>';
    html += '</div>';
  }
  if (!html) html = '<p style="color:#888;padding:15px;">Không có tập nào.</p>';
  document.getElementById('episodesContainer').innerHTML = html;
}

function switchEpType(type, btn) {
  document.querySelectorAll('.ep-tab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  renderEpisodes(window._epList || [], type);
}
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