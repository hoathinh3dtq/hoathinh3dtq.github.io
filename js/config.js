/* ==========================================================================
   HH3DTQ Dynamic Config — Firestore canonical with static fallback
   Firestore = canonical source of truth.
   JSON = cache/snapshot/emergency fallback only.
   Never silently hide Firestore errors.
   ========================================================================== */
(function (global) {
  'use strict';

  var D = global.HH3D, R = global.HH3DRender;

  var FB_READY = typeof FIREBASE_READY !== 'undefined' && FIREBASE_READY;
  var _siteConfig = null;
  var _trendingConfig = null;
  var _configPromise = null;
  var _fallbackWarned = {};  // track per-slug fallback warnings

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
      }).catch(function (err) {
        console.warn('[HH3DTQ] Site config: Firestore request failed (' + (err.message || err.code || 'unknown') + '), using static defaults.');
        resolve(null);
      });
    });
    return _configPromise;
  }

  function applySiteConfig(cfg) {
    if (!cfg) return;
    var logoSpans = document.querySelectorAll('.logo a span');
    for (var i = 0; i < logoSpans.length; i++) {
      if (cfg.siteName) logoSpans[i].textContent = cfg.siteName;
    }
    var footerBrands = document.querySelectorAll('.footer-brand a span');
    for (var j = 0; j < footerBrands.length; j++) {
      if (cfg.siteName) footerBrands[j].textContent = cfg.siteName;
    }
    var logoTexts = document.querySelectorAll('.logo-text strong');
    for (var k = 0; k < logoTexts.length; k++) {
      if (cfg.siteName) logoTexts[k].textContent = cfg.siteName;
    }
    if (cfg.copyright) {
      var copyEl = document.querySelector('.copyright');
      if (copyEl) copyEl.textContent = cfg.copyright;
    }
    if (cfg.telegram && cfg.telegramUrl) {
      var contactEl = document.querySelector('.contact a');
      if (contactEl) {
        contactEl.textContent = cfg.telegram;
        contactEl.href = cfg.telegramUrl;
      }
    }
    if (cfg.siteName && document.title) {
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
      }).catch(function (err) {
        console.warn('[HH3DTQ] Trending: Firestore request failed (' + (err.message || err.code || 'unknown') + '), using rating fallback.');
        resolve(null);
      });
    });
  }

  function getTrendingItems() {
    return loadTrendingConfig().then(function (cfg) {
      if (!cfg || !cfg.items || !cfg.items.length) return null;
      return D.ready().then(function () {
        var items = [];
        for (var i = 0; i < cfg.items.length; i++) {
          var rec = D.bySlug(cfg.items[i].slug);
          if (rec) items.push(rec);
        }
        return { items: items, title: cfg.title || '🔥 Đang thịnh hành', count: cfg.count || 12 };
      });
    });
  }

  /* ====================== EPISODE STATS ====================== */

  function computeEpisodeStats(episodes) {
    if (!episodes || !episodes.length) {
      return { availableEpisodes: 0, expectedEpisodes: 0, completedEpisodes: 0, latestEpisode: 0 };
    }
    var nums = [];
    for (var i = 0; i < episodes.length; i++) {
      var n = episodes[i].episode_number;
      if (typeof n === 'number' && n > 0) nums.push(n);
    }
    nums.sort(function (a, b) { return a - b; });
    var available = nums.length;
    var latest = nums[nums.length - 1] || 0;
    // expectedEpisodes = continuous range from 1 to latest (holes = missing episodes)
    var expected = latest;
    var completed = available;
    return {
      availableEpisodes: available,
      expectedEpisodes: expected,
      completedEpisodes: completed,
      latestEpisode: latest
    };
  }

  /* ====================== EPISODES (Firestore canonical) ====================== */

  function loadEpisodesFromFirestore(slug) {
    return new Promise(function (resolve) {
      if (!FB_READY || !db) {
        console.warn('[HH3DTQ] Episodes: Firestore not available for ' + slug + ', falling back to JSON.');
        resolve({ episodes: null, source: 'json_fallback', reason: 'firestore_unavailable' });
        return;
      }
      db.collection('episodes')
        .where('animeId', '==', slug)
        .orderBy('episodeNumber', 'asc')
        .get()
        .then(function (snapshot) {
          if (snapshot.empty) {
            resolve({ episodes: null, source: 'json_fallback', reason: 'firestore_empty' });
            return;
          }
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
          resolve({ episodes: episodes, source: 'firestore', reason: null });
        }).catch(function (err) {
          console.warn('[HH3DTQ] Episodes: Firestore request FAILED for ' + slug + ' (' + (err.message || err.code || 'unknown') + '), using JSON fallback.');
          resolve({ episodes: null, source: 'json_fallback', reason: 'firestore_error' });
        });
    });
  }

  /* ====================== SERIES METADATA (Firestore canonical) ====================== */

  function loadSeriesMetadataFromFirestore(slug) {
    return new Promise(function (resolve) {
      if (!FB_READY || !db) {
        resolve({ metadata: null, source: 'json_fallback', reason: 'firestore_unavailable' });
        return;
      }
      db.collection('series').doc(slug).get().then(function (doc) {
        if (doc.exists) {
          resolve({ metadata: doc.data(), source: 'firestore', reason: null });
        } else {
          resolve({ metadata: null, source: 'json_fallback', reason: 'firestore_empty' });
        }
      }).catch(function (err) {
        console.warn('[HH3DTQ] Metadata: Firestore request FAILED for ' + slug + ' (' + (err.message || err.code || 'unknown') + '), using JSON fallback.');
        resolve({ metadata: null, source: 'json_fallback', reason: 'firestore_error' });
      });
    });
  }

  /* ====================== LOAD SERIES DATA (canonical flow) ====================== */

  /* Load full series data:
   *   1. Fetch JSON for base data (always needed — images, video URLs, crawled data)
   *   2. Try Firestore series/{slug} for metadata overrides (admin-managed)
   *   3. Try Firestore episodes for episode data (admin-managed)
   *   4. Compute episode stats from real episode records
   *   5. Return merged data with source indicators
   */
  function loadSeriesData(slug) {
    return D.ready().then(function () {
      var jsonUrl = D.base() + 'data/series/' + encodeURIComponent(slug) + '.json';
      return fetch(jsonUrl).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (jsonData) {
        // Try Firestore for metadata overrides
        return loadSeriesMetadataFromFirestore(slug).then(function (metaResult) {
          var mergedData = jsonData;
          var metaSource = 'json';

          if (metaResult.metadata) {
            // Firestore has metadata — override relevant fields
            metaSource = metaResult.source;
            var fsMeta = metaResult.metadata;
            var overrideFields = ['title', 'other_name', 'description', 'status', 'rating',
                                  'poster_src', 'banner_src', 'country', 'year', 'schedule_day'];
            for (var fi = 0; fi < overrideFields.length; fi++) {
              var f = overrideFields[fi];
              if (fsMeta[f] !== undefined && fsMeta[f] !== null && fsMeta[f] !== '') {
                mergedData[f] = fsMeta[f];
              }
            }
            // Genres/tags override
            if (fsMeta.genres && Array.isArray(fsMeta.genres)) {
              mergedData.genres = fsMeta.genres;
            }
            if (fsMeta.tags && Array.isArray(fsMeta.tags)) {
              mergedData.tags = fsMeta.tags;
            }
          } else if (metaResult.reason === 'firestore_error') {
            // Firestore failed — log warning
            if (!_fallbackWarned[slug]) {
              console.warn('[HH3DTQ] Using JSON fallback for metadata: ' + slug + ' (Firestore: ' + metaResult.reason + ')');
              _fallbackWarned[slug] = true;
            }
          }
          // firestore_empty or firestore_unavailable: silently use JSON (no admin override exists)

          // Try Firestore for episodes
          return loadEpisodesFromFirestore(slug).then(function (epResult) {
            if (epResult.episodes) {
              mergedData.episodes = epResult.episodes;
              mergedData._episode_source = epResult.source;
            } else {
              mergedData._episode_source = epResult.source;
              if (epResult.reason === 'firestore_error') {
                if (!_fallbackWarned[slug]) {
                  console.warn('[HH3DTQ] Using JSON fallback for episodes: ' + slug + ' (Firestore: ' + epResult.reason + ')');
                  _fallbackWarned[slug] = true;
                }
              }
              // firestore_empty or firestore_unavailable: use JSON episodes (already in jsonData)
            }

            // Compute episode stats from real episode records
            var epList = mergedData.episodes || [];
            var stats = computeEpisodeStats(epList);
            mergedData.available_episode_count = stats.availableEpisodes;
            mergedData.expected_episode_count = stats.expectedEpisodes;
            mergedData.completed_episode_count = stats.completedEpisodes;
            mergedData.latest_episode = stats.latestEpisode;
            mergedData._metadata_source = metaSource;

            return mergedData;
          });
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

  if (typeof auth !== 'undefined' && auth && typeof auth.onAuthStateChanged === 'function') {
    auth.onAuthStateChanged(function () {
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
    loadSeriesMetadataFromFirestore: loadSeriesMetadataFromFirestore,
    computeEpisodeStats: computeEpisodeStats,
    siteConfig: function () { return _siteConfig; },
    trendingConfig: function () { return _trendingConfig; }
  };

})(window);