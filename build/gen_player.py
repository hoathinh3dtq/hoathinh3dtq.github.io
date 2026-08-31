#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""HH3DTQ player page generator."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(encoding='utf-8')
from partials import *

PLAYER_SCRIPT = """<style>
  .player-wrapper { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 8px; margin-bottom: 20px; }
  .player-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
  .player-info { margin-bottom: 20px; }
  .player-info h1 { font-size: 22px; color: #f5a623; margin-bottom: 5px; }
  .player-info .ep-label { color: #888; font-size: 14px; }
  .ep-nav { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .ep-nav-btn { padding: 8px 16px; background: #1a1a1a; border: 1px solid #2a2a2a; color: #ccc; border-radius: 5px; cursor: pointer; font-family: inherit; font-size: 13px; text-decoration: none; display: inline-block; }
  .ep-nav-btn:hover { border-color: #f5a623; color: #f5a623; }
  .ep-nav-btn.active { background: #f5a623; color: #000; border-color: #f5a623; font-weight: 600; }
  .loading { text-align: center; padding: 50px; color: #888; }
  .error { text-align: center; padding: 50px; color: #e55; }
</style>
<script>
(function() {
  var D = window.HH3D, R = window.HH3DRender;
  var params = new URLSearchParams(window.location.search);
  var slug = params.get('slug');
  var epNum = parseInt(params.get('ep'), 10) || 1;

  if (!slug) {
    document.getElementById('playerContainer').innerHTML =
      '<div class="error"><h2>🔍 Thiếu thông tin phim</h2><p>Vui lòng chọn phim từ <a href="index.html" style="color:#f5a623;">trang chủ</a>.</p></div>';
    return;
  }

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
    var ep = null;
    for (var i = 0; i < epList.length; i++) {
      if (epList[i].episode_number === epNum) { ep = epList[i]; break; }
    }
    if (!ep && epList.length > 0) { ep = epList[0]; epNum = ep.episode_number; }

    var html = '';

    // player
    if (ep && ep.url) {
      html += '<div class="player-wrapper"><iframe src="' + R.esc(ep.url) +
              '" allowfullscreen allow="autoplay; encrypted-media" referrerpolicy="no-referrer"></iframe></div>';
    } else {
      html += '<div class="error">⚠ Không có dữ liệu tập này.</div>';
    }

    // info
    html += '<div class="player-info">';
    html += '<h1>' + R.esc(data.title || slug) + '</h1>';
    html += '<div class="ep-label">' + (ep ? R.esc(ep.label || ('Tập ' + epNum)) : '') +
            ' | ' + (ep ? (ep.type === 'vietsub' ? '🇻🇳 VietSub' : '🎙 Thuyết Minh') : '') +
            ' | ⭐ ' + (data.rating || '?') + '</div>';
    html += '</div>';

    // episode navigation
    html += '<div class="ep-nav">';
    var total = epList.length;
    var start = Math.max(1, epNum - 5);
    var end = Math.min(total, epNum + 5);
    if (start > 1) {
      html += '<a href="?slug=' + encodeURIComponent(slug) + '&ep=1" class="ep-nav-btn">« Đầu</a>';
    }
    for (var n = start; n <= end; n++) {
      var cls = n === epNum ? ' active' : '';
      html += '<a href="?slug=' + encodeURIComponent(slug) + '&ep=' + n + '" class="ep-nav-btn' + cls + '">Tập ' + n + '</a>';
    }
    if (end < total) {
      html += '<a href="?slug=' + encodeURIComponent(slug) + '&ep=' + total + '" class="ep-nav-btn">Cuối »</a>';
    }
    html += '</div>';

    // back link
    html += '<p style="margin-top:15px;"><a href="xem-phim.html?id=' + encodeURIComponent(slug) +
            '" style="color:#f5a623;">← Quay lại trang phim</a></p>';

    document.getElementById('playerContainer').innerHTML = html;
    document.title = (ep ? R.esc(ep.label || 'Tập ' + epNum) + ' - ' : '') + R.esc(data.title || slug) + ' - HH3DTQ';
  }).catch(function(e) {
    document.getElementById('playerContainer').innerHTML =
      '<div class="error"><h2>⚠ Lỗi tải phim</h2><p>' + R.esc(e.message || String(e)) +
      '</p><a href="index.html" style="display:inline-block;margin-top:15px;background:#f5a623;color:#000;padding:10px 20px;border-radius:5px;text-decoration:none;font-weight:600;">🏠 Về trang chủ</a></div>';
    console.error('[HH3DTQ] player error:', e);
  });
})();
</script>"""

def gen_player():
    main = """  <div id="playerContainer">
    <div class="loading">⏳ Đang tải phim...</div>
  </div>"""
    return page_wrap(
        'Xem Phim - HH3DTQ',
        'HH3DTQ - Xem phim hoạt hình 3D Trung Quốc 4K thuyết minh vietsub.',
        None, '', main, PLAYER_SCRIPT)

if __name__ == '__main__':
    import os
    ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    html = gen_player()
    path = os.path.join(ROOT, 'player.html')
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
    print(f'player.html: {len(html):,} bytes')