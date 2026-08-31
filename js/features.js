/* ==========================================================================
   HH3DTQ Features — History, Bookmark, Auth UI
   localStorage-first with Firebase sync when logged in.
   No hardcoded data, no placeholders.
   ========================================================================== */
(function (global) {
  'use strict';

  var D = global.HH3D, R = global.HH3DRender;
  var LS_HISTORY = 'hh3dtq_history';
  var LS_BOOKMARKS = 'hh3dtq_bookmarks';
  var MAX_HISTORY = 200;

  /* ======================== HISTORY ======================== */

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]');
    } catch (e) { return []; }
  }

  function saveHistory(list) {
    try {
      localStorage.setItem(LS_HISTORY, JSON.stringify(list.slice(0, MAX_HISTORY)));
    } catch (e) { /* quota exceeded, silently drop */ }
  }

  function addToHistory(slug, title, poster, epNum, epLabel, progress) {
    var list = getHistory();
    // Remove existing entry for same slug+ep
    list = list.filter(function (item) {
      return !(item.slug === slug && item.ep === epNum);
    });
    list.unshift({
      slug: slug,
      title: title || '',
      poster: poster || '',
      ep: epNum || 0,
      epLabel: epLabel || '',
      progress: progress || 0,
      time: Date.now()
    });
    saveHistory(list);
    // Sync to Firebase if logged in
    syncHistoryToFirebase(list);
  }

  function removeFromHistory(slug, epNum) {
    var list = getHistory().filter(function (item) {
      return !(item.slug === slug && item.ep === epNum);
    });
    saveHistory(list);
    syncHistoryToFirebase(list);
    return list;
  }

  function clearHistory() {
    saveHistory([]);
    syncHistoryToFirebase([]);
  }

  function syncHistoryToFirebase(list) {
    if (typeof FIREBASE_READY === 'undefined' || !FIREBASE_READY || !currentUser) return;
    try {
      db.collection('users').doc(currentUser.uid).update({
        history: list.slice(0, MAX_HISTORY),
        historyUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(function () { /* silent */ });
    } catch (e) { /* silent */ }
  }

  function mergeHistory(localList, remoteList) {
    var merged = localList.slice();
    var seen = {};
    for (var i = 0; i < merged.length; i++) {
      seen[merged[i].slug + '|' + merged[i].ep] = true;
    }
    for (var j = 0; j < (remoteList || []).length; j++) {
      var key = remoteList[j].slug + '|' + remoteList[j].ep;
      if (!seen[key]) {
        merged.push(remoteList[j]);
        seen[key] = true;
      }
    }
    merged.sort(function (a, b) { return (b.time || 0) - (a.time || 0); });
    return merged.slice(0, MAX_HISTORY);
  }

  function showHistoryModal() {
    var list = getHistory();
    var html = '<div class="modal-overlay active" id="historyModal" onclick="if(event.target===this)closeHistoryModal()">' +
      '<div class="modal" style="max-width:700px;max-height:80vh;overflow-y:auto;">' +
      '<button class="modal-close" onclick="closeHistoryModal()">✕</button>' +
      '<h2>📜 Lịch sử xem phim</h2>';

    if (list.length === 0) {
      html += '<p style="text-align:center;padding:40px;color:#888;">📭 Chưa có lịch sử xem phim.</p>';
    } else {
      html += '<div style="margin-bottom:10px;text-align:right;">' +
        '<button onclick="if(confirm(\'Xóa toàn bộ lịch sử?\')){clearHistory();closeHistoryModal();showToast(\'✅ Đã xóa lịch sử\');}" style="background:#e74c3c;color:#fff;border:none;padding:6px 14px;border-radius:5px;cursor:pointer;font-size:12px;font-family:inherit;">🗑 Xóa tất cả</button>' +
        '</div>';
      html += '<div class="history-list">';
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        var timeStr = formatTime(item.time);
        html += '<div class="history-item" style="display:flex;gap:12px;padding:10px;border-bottom:1px solid #2a2a2a;align-items:center;">' +
          '<a href="xem-phim.html?id=' + encodeURIComponent(item.slug) + '" style="flex-shrink:0;">' +
          '<img src="' + R.esc(item.poster) + '" alt="" style="width:60px;height:85px;object-fit:cover;border-radius:4px;" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 85%22><rect fill=%22%23111%22 width=%2260%22 height=%2285%22/><text fill=%22%23f5a623%22 x=%2230%22 y=%2242%22 text-anchor=%22middle%22 font-size=%2220%22>🎬</text></svg>\'">' +
          '</a>' +
          '<div style="flex:1;min-width:0;">' +
          '<a href="xem-phim.html?id=' + encodeURIComponent(item.slug) + '" style="color:#fff;font-weight:600;font-size:14px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + R.esc(item.title) + '</a>' +
          '<div style="color:#888;font-size:12px;margin-top:2px;">' + R.esc(item.epLabel || ('Tập ' + item.ep)) + '</div>' +
          '<div style="color:#666;font-size:11px;margin-top:2px;">🕐 ' + R.esc(timeStr) + '</div>' +
          '</div>' +
          '<a href="player.html?slug=' + encodeURIComponent(item.slug) + '&ep=' + item.ep + '" style="background:#f5a623;color:#000;padding:6px 12px;border-radius:5px;font-size:12px;font-weight:600;text-decoration:none;white-space:nowrap;">▶ Tiếp tục</a>' +
          '<button onclick="var self=this;removeFromHistory(\'' + R.esc(item.slug) + '\',' + item.ep + ');self.closest(\'.history-item\').remove();if(!document.querySelectorAll(\'.history-item\').length)document.getElementById(\'historyModal\').querySelector(\'.modal\').innerHTML+=\'<p style=text-align:center;padding:40px;color:#888;>📭 Chưa có lịch sử xem phim.</p>\';" style="background:none;border:none;color:#e74c3c;cursor:pointer;font-size:16px;flex-shrink:0;" title="Xóa">🗑</button>' +
          '</div>';
      }
      html += '</div>';
    }

    html += '</div></div>';
    var existing = document.getElementById('historyModal');
    if (existing) existing.remove();
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
    document.body.style.overflow = 'hidden';
  }

  global.closeHistoryModal = function () {
    var modal = document.getElementById('historyModal');
    if (modal) { modal.remove(); document.body.style.overflow = ''; }
  };

  global.clearHistory = clearHistory;
  global.removeFromHistory = removeFromHistory;

  /* ======================== BOOKMARK ======================== */

  function getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(LS_BOOKMARKS) || '[]');
    } catch (e) { return []; }
  }

  function saveBookmarks(list) {
    try {
      localStorage.setItem(LS_BOOKMARKS, JSON.stringify(list));
    } catch (e) { /* quota exceeded */ }
  }

  function isBookmarked(slug) {
    return getBookmarks().indexOf(slug) !== -1;
  }

  function toggleBookmark(slug, title, poster) {
    var list = getBookmarks();
    var idx = list.indexOf(slug);
    if (idx === -1) {
      list.push(slug);
      // Store metadata for offline display
      try {
        var meta = JSON.parse(localStorage.getItem('hh3dtq_bookmark_meta') || '{}');
        meta[slug] = { title: title, poster: poster, time: Date.now() };
        localStorage.setItem('hh3dtq_bookmark_meta', JSON.stringify(meta));
      } catch (e) { /* ignore */ }
      saveBookmarks(list);
      syncBookmarksToFirebase(list);
      return true; // bookmarked
    } else {
      list.splice(idx, 1);
      saveBookmarks(list);
      syncBookmarksToFirebase(list);
      return false; // removed
    }
  }

  function syncBookmarksToFirebase(list) {
    if (typeof FIREBASE_READY === 'undefined' || !FIREBASE_READY || !currentUser) return;
    try {
      db.collection('users').doc(currentUser.uid).update({
        bookmarks: list,
        bookmarksUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(function () { /* silent */ });
    } catch (e) { /* silent */ }
  }

  function showBookmarkModal() {
    var list = getBookmarks();
    var meta = {};
    try { meta = JSON.parse(localStorage.getItem('hh3dtq_bookmark_meta') || '{}'); } catch (e) { }

    var html = '<div class="modal-overlay active" id="bookmarkModal" onclick="if(event.target===this)closeBookmarkModal()">' +
      '<div class="modal" style="max-width:700px;max-height:80vh;overflow-y:auto;">' +
      '<button class="modal-close" onclick="closeBookmarkModal()">✕</button>' +
      '<h2>🔖 Bookmark của bạn</h2>';

    if (list.length === 0) {
      html += '<p style="text-align:center;padding:40px;color:#888;">📭 Chưa có phim nào được bookmark.</p>';
    } else {
      html += '<div class="episode-grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr));">';
      for (var i = 0; i < list.length; i++) {
        var slug = list[i];
        var m = meta[slug] || {};
        var rec = D.bySlug ? D.bySlug(slug) : null;
        var title = rec ? rec.title : (m.title || slug);
        var poster = rec ? R.poster(rec) : (m.poster || '');
        html += '<div class="anime-card" style="position:relative;">' +
          '<a href="xem-phim.html?id=' + encodeURIComponent(slug) + '">' +
          '<div class="card-img"><img src="' + R.esc(poster) + '" alt="' + R.esc(title) + '" loading="lazy" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 450%22><rect fill=%22%23111%22 width=%22300%22 height=%22450%22/><text fill=%22%23f5a623%22 x=%22150%22 y=%22225%22 text-anchor=%22middle%22 font-size=%2240%22>🎬</text></svg>\'"></div>' +
          '<div class="card-info"><div class="card-title">' + R.esc(title) + '</div></div>' +
          '</a>' +
          '<button onclick="var self=this;toggleBookmark(\'' + R.esc(slug) + '\');self.closest(\'.anime-card\').remove();if(!document.querySelectorAll(\'#bookmarkModal .anime-card\').length)document.getElementById(\'bookmarkModal\').querySelector(\'.modal\').innerHTML+=\'<button class=modal-close onclick=closeBookmarkModal()>✕</button><h2>🔖 Bookmark của bạn</h2><p style=text-align:center;padding:40px;color:#888;>📭 Chưa có phim nào được bookmark.</p>\';" style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,0.7);border:none;color:#e74c3c;cursor:pointer;font-size:16px;padding:2px 6px;border-radius:3px;" title="Bỏ bookmark">✕</button>' +
          '</div>';
      }
      html += '</div>';
    }

    html += '</div></div>';
    var existing = document.getElementById('bookmarkModal');
    if (existing) existing.remove();
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
    document.body.style.overflow = 'hidden';
  }

  global.closeBookmarkModal = function () {
    var modal = document.getElementById('bookmarkModal');
    if (modal) { modal.remove(); document.body.style.overflow = ''; }
  };

  global.isBookmarked = isBookmarked;
  global.toggleBookmark = toggleBookmark;
  global.showBookmarkModal = showBookmarkModal;
  global.showHistoryModal = showHistoryModal;

  /* ======================== INIT ======================== */

  // Override header links to use real functionality
  function initHeaderActions() {
    var headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    // Find History and Bookmark links
    var links = headerActions.querySelectorAll('a');
    for (var i = 0; i < links.length; i++) {
      var text = links[i].textContent.trim();
      if (text === 'Lịch sử' || text === '📜 Lịch sử xem phim') {
        links[i].href = 'javascript:void(0)';
        links[i].setAttribute('data-has-handler', '1');
        links[i].onclick = function (e) { e.preventDefault(); showHistoryModal(); };
      } else if (text === 'Bookmark' || text === '🔖 Bookmark của bạn') {
        links[i].href = 'javascript:void(0)';
        links[i].setAttribute('data-has-handler', '1');
        links[i].onclick = function (e) { e.preventDefault(); showBookmarkModal(); };
      }
    }
  }

  // Track player views for history
  function trackPlayerView() {
    if (global.location.pathname.indexOf('player.html') === -1) return;
    var params = new URLSearchParams(global.location.search);
    var slug = params.get('slug');
    var ep = parseInt(params.get('ep'), 10) || 1;
    if (!slug) return;

    // Wait for data to load, then record
    D.ready().then(function () {
      var url = D.base() + 'data/series/' + encodeURIComponent(slug) + '.json';
      return fetch(url).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      });
    }).then(function (data) {
      var epList = data.episodes || [];
      var epData = null;
      for (var i = 0; i < epList.length; i++) {
        if (epList[i].episode_number === ep) { epData = epList[i]; break; }
      }
      addToHistory(
        slug,
        data.title || slug,
        R.poster(data),
        ep,
        epData ? (epData.label || 'Tập ' + ep) : ('Tập ' + ep),
        0
      );
    }).catch(function () { /* silent */ });
  }

  // Add bookmark button to anime detail page
  function addBookmarkButtonToDetail() {
    if (global.location.pathname.indexOf('xem-phim.html') === -1) return;
    var slug = new URLSearchParams(global.location.search).get('id');
    if (!slug) return;

    // Wait for content to render
    var check = setInterval(function () {
      var infoEl = document.querySelector('.anime-info h1');
      if (!infoEl) return;
      clearInterval(check);

      var title = infoEl.textContent.trim();
      var bookmarked = isBookmarked(slug);
      var btn = document.createElement('button');
      btn.id = 'bookmarkBtn';
      btn.style.cssText = 'background:#1a1a1a;border:1px solid #333;color:#f5a623;padding:8px 16px;border-radius:5px;cursor:pointer;font-size:14px;font-family:inherit;margin-top:10px;';
      btn.textContent = bookmarked ? '★ Đã bookmark' : '☆ Bookmark';
      btn.onclick = function () {
        var result = toggleBookmark(slug, title, '');
        btn.textContent = result ? '★ Đã bookmark' : '☆ Bookmark';
        showToast(result ? '✅ Đã thêm vào bookmark' : '🗑 Đã bỏ bookmark');
      };

      var voteSection = document.querySelector('.vote-section');
      if (voteSection) {
        voteSection.appendChild(btn);
      }
    }, 200);
  }

  // Merge Firebase history/bookmarks on login
  function mergeUserData() {
    if (typeof FIREBASE_READY === 'undefined' || !FIREBASE_READY || !currentUser) return;
    try {
      db.collection('users').doc(currentUser.uid).get().then(function (doc) {
        if (!doc.exists) return;
        var data = doc.data();
        if (data.history) {
          var merged = mergeHistory(getHistory(), data.history);
          saveHistory(merged);
        }
        if (data.bookmarks) {
          var local = getBookmarks();
          var remote = data.bookmarks || [];
          var mergedBm = local.slice();
          for (var i = 0; i < remote.length; i++) {
            if (mergedBm.indexOf(remote[i]) === -1) mergedBm.push(remote[i]);
          }
          saveBookmarks(mergedBm);
        }
      }).catch(function () { /* silent */ });
    } catch (e) { /* silent */ }
  }

  // Listen for auth changes to merge data
  if (typeof auth !== 'undefined' && auth) {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        currentUser = user;
        mergeUserData();
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initHeaderActions();
      trackPlayerView();
      addBookmarkButtonToDetail();
    });
  } else {
    initHeaderActions();
    trackPlayerView();
    addBookmarkButtonToDetail();
  }

  // Expose to global
  global.HH3DFeatures = {
    getHistory: getHistory,
    addToHistory: addToHistory,
    removeFromHistory: removeFromHistory,
    clearHistory: clearHistory,
    showHistoryModal: showHistoryModal,
    getBookmarks: getBookmarks,
    isBookmarked: isBookmarked,
    toggleBookmark: toggleBookmark,
    showBookmarkModal: showBookmarkModal
  };

})(window);