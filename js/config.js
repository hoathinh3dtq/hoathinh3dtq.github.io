/* ==========================================================================
   HH3DTQ Dynamic Config — Firestore-first with static fallback
   Loads site config, trending, and episode data from Firestore at runtime.
   Falls back to static JSON when Firestore is unavailable.
   ========================================================================== */
(function (global) {
  'use strict';

  var D = global.HH3D, R = global.HH3DRender;

  var FB_READY = typeof FIREBASE_READY !== 'undefined' && FIREBASE_READY;
  var _siteConfig = null;
  var _trendingConfig = null;
  var _configPromise = null;

  /* ====================== SITE CONFIG ====================== */

  function loadSiteConfig() {
    if (_configPromise) return _configPromise;
    _configPromise = new Promise(function (resolve) {
      if (!FB_READY || !db) { resolve(null); return; }
      db.collection('config').doc('site').get().then(function (doc) {
        if (doc.exists) {
          _siteConfig = doc.data();
          applySiteConfig(_siteConfig);
        }
        resolve(_siteConfig);
      }).catch(function () { resolve(null); });
    });
    return _configPromise;
  }

  function applySiteConfig(cfg) {
    if (!cfg) return;
    // Update header logo text
    var logoSpans = document.querySelectorAll('.logo a span');
    for (var i = 0; i < logoSpans.length; i++) {
      if (cfg.siteName) logoSpans[i].textContent = cfg.siteName;
    }

    // Update footer brand
    var footerBrands = document.querySelectorAll('.footer-brand a span');
    for (var j = 0; j < footerBrands.length; j++) {
      if (cfg.siteName) footerBrands[j].textContent = cfg.siteName;
    }

    // Update logo text strong
    var logoTexts = document.querySelectorAll('.logo-text strong');
    for (var k = 0; k < logoTexts.length; k++) {
      if (cfg.siteName) logoTexts[k].textContent = cfg.siteName;
    }

    // Update copyright
    if (cfg.copyright) {
      var copyEl = document.querySelector('.copyright');
      if (copyEl) copyEl.textContent = cfg.copyright;
    }

    // Update contact
    if (cfg.telegram && cfg.telegramUrl) {
      var contactEl = document.querySelector('.contact a');
      if (contactEl) {
        contactEl.textContent = cfg.telegram;
        contactEl.href = cfg.telegramUrl;
      }
    }

    // Update page title
    if (cfg.siteName && document.title) {
      // Only update if title contains HH3DTQ
      if (document.title.indexOf('HH3DTQ') !== -1) {
        document.title = document.title.replace(/HH3DTQ/g, cfg.siteName);
      }
    }
  }

  /* ====================== TRENDING ====================== */

  function loadTrendingConfig() {
    return new Promise(function (resolve) {
      if (!FB_READY || !db) { resolve(null); return; }
      db.collection('config').doc('trending').get().then(function (doc) {
        if (doc.exists) {
          _trendingConfig = doc.data();
        }
        resolve(_trendingConfig);
      }).catch(function () { resolve(null); });
    });
  }

  /* Returns trending items with full series data, or null if Firestore unavailable */
  function getTrendingItems() {
    return loadTrendingConfig().then(function (cfg) {
      if (!cfg || !cfg.items || !cfg.items.length) return null;
      return D.ready().then(function () {
        var items = [];
        for (var i = 0; i < cfg.items.length; i++) {
          var rec = D.bySlug(cfg.items[i].slug);
          if (rec) items.push(rec);
        }
        return {
          items: items,
          title: cfg.title || '🔥 Đang thịnh hành',
          count: cfg.count || 12
        };
      });
    });
  }

  /* ====================== EPISODES ====================== */

  /* Load episodes from Firestore; returns null if Firestore unavailable */
  function loadEpisodesFromFirestore(slug) {
    return new Promise(function (resolve) {
      if (!FB_READY || !db) { resolve(null); return; }
      db.collection('episodes')
        .where('animeId', '==', slug)
        .orderBy('episodeNumber', 'asc')
        .get()
        .then(function (snapshot) {
          if (snapshot.empty) { resolve(null); return; }
          var episodes = [];
          snapshot.forEach(function (doc) {
            var ep = doc.data();
            episodes.push({
              episode_number: ep.episodeNumber,
              type: ep.type || 'vietsub',
              url: ep.url || '',
              label: ep.label || ('Tập ' + ep.episodeNumber)
            });
          });
          resolve(episodes);
        }).catch(function () { resolve(null); });
    });
  }

  /* Load full series data: Firestore episodes first, then JSON for metadata */
  function loadSeriesData(slug) {
    return D.ready().then(function () {
      // Load JSON for metadata
      var jsonUrl = D.base() + 'data/series/' + encodeURIComponent(slug) + '.json';
      return fetch(jsonUrl).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (jsonData) {
        // Try Firestore for episodes
        return loadEpisodesFromFirestore(slug).then(function (fsEpisodes) {
          if (fsEpisodes && fsEpisodes.length > 0) {
            // Use Firestore episodes (admin-managed)
            jsonData.episodes = fsEpisodes;
            jsonData.available_episode_count = fsEpisodes.length;
          }
          // else: use JSON episodes (already in jsonData)
          return jsonData;
        });
      });
    });
  }

  /* ====================== INIT ====================== */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { loadSiteConfig(); });
  } else {
    loadSiteConfig();
  }

  // Re-apply config when auth state changes
  if (typeof auth !== 'undefined' && auth && typeof auth.onAuthStateChanged === 'function') {
    auth.onAuthStateChanged(function () {
      // Refresh FB_READY state
      FB_READY = typeof FIREBASE_READY !== 'undefined' && FIREBASE_READY;
      if (FB_READY) {
        _configPromise = null;
        loadSiteConfig();
      }
    });
  }

  global.HH3DConfig = {
    loadSiteConfig: loadSiteConfig,
    getTrendingItems: getTrendingItems,
    loadTrendingConfig: loadTrendingConfig,
    loadEpisodesFromFirestore: loadEpisodesFromFirestore,
    loadSeriesData: loadSeriesData,
    siteConfig: function () { return _siteConfig; },
    trendingConfig: function () { return _trendingConfig; }
  };

})(window);