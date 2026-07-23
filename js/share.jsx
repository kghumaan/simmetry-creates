/* =========================================================================
   Link-share preview — keeps document.title and OG/Twitter meta tags in sync
   with the current path, so shared links show the right title + image.

   Note: most social-network scrapers don't execute JS, so the values baked
   into index.html are what they'll usually pick up regardless of path.
   This updater is for in-app title changes and JS-aware crawlers.
   ========================================================================= */

(function () {
  const SITE = 'Simmetry.Creates';
  const HOME_DESC = 'Fine jewelry and bespoke woodwork from the studio of Ashish Savani.';

  function setMeta(key, value, attr) {
    attr = attr || 'property';
    let el = document.head.querySelector('meta[' + attr + '="' + key + '"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
  }

  function abs(url) {
    try { return new URL(url, document.baseURI).href; } catch (e) { return url; }
  }

  function decodeSeg(s) {
    try { return decodeURIComponent(s); } catch (e) { return s; }
  }

  /* Image values can be crop objects ({ src, x, y, … }); og:image needs the
     bare URL. */
  function imgSrc(v) {
    if (v && typeof v === 'object') return typeof v.src === 'string' ? v.src : '';
    return typeof v === 'string' ? v : '';
  }

  /* Published content once ContentProvider has resolved it (see
     js/content.jsx); the shipped defaults until then. Reading the live tree
     is what keeps a renamed or newly added bucket from sharing under its old
     name — or under no name at all. */
  function categoriesFor(isWw) {
    const live = window.SMY_LIVE_CONTENT;
    const key = isWw ? 'woodwork' : 'jewelry';
    if (live && live.categories && Array.isArray(live.categories[key])) {
      return live.categories[key];
    }
    const data = window.SMY_DATA || {};
    return (isWw ? data.WOODWORK_CATEGORIES : data.JEWELRY_CATEGORIES) || [];
  }

  function pickForRoute(route) {
    const data = window.SMY_DATA || {};
    const live = window.SMY_LIVE_CONTENT;
    const liveImages = (k) =>
      live && live.products && Array.isArray(live.products[k])
        ? live.products[k].map(p => imgSrc(p && p.image))
        : null;
    const jw = liveImages('jewelry') || data.JEWELRY_IMAGES || [];
    const ww = liveImages('woodwork') || data.WOODWORK_IMAGES || [];

    const wwItem = route.match(/^\/(?:ww|woodwork)\/(\d+)\/?$/);
    const jwItem = route.match(/^\/jewelry\/(\d+)\/?$/);
    const wwAny  = /^\/(?:ww|woodwork)(?:\/|$)/.test(route);
    const jwAny  = /^\/jewelry(?:\/|$)/.test(route);
    const isAbout = /\/about(?:#|$)/.test(route);

    // A bucket — /jewelry/c/necklaces — shares under its own name and tile.
    const cat = route.match(/^\/(jewelry|ww|woodwork)\/c\/([^/]+)\/?$/);
    if (cat) {
      const isWw = cat[1] !== 'jewelry';
      const key = decodeSeg(cat[2]);
      const hit = categoriesFor(isWw).find(c => c.key === key);
      if (hit) {
        const fallbackDesc = isWw
          ? 'Bespoke woodwork, made slowly.'
          : 'Fine jewelry, made slowly.';
        return {
          title: SITE + ' — ' + (hit.label || key),
          desc:  hit.blurb || fallbackDesc,
          image: imgSrc(hit.image) || ('/assets/emblem-' + (isWw ? 'woodwork' : 'jewelry') + '.png'),
        };
      }
    }

    if (wwItem && ww[+wwItem[1]]) {
      return {
        title: SITE + ' — Woodwork, no. ' + (+wwItem[1] + 1),
        desc:  'A piece from the woodwork register.',
        image: ww[+wwItem[1]],
      };
    }
    if (jwItem && jw[+jwItem[1]]) {
      return {
        title: SITE + ' — Jewelry, no. ' + (+jwItem[1] + 1),
        desc:  'A piece from the jewelry register.',
        image: jw[+jwItem[1]],
      };
    }
    if (isAbout) {
      return {
        title: SITE + ' — About',
        desc:  'Ashish Savani — one bench, two crafts.',
        image: (data.ABOUT_IMAGE) || '/assets/emblem-jewelry.png',
      };
    }
    if (wwAny) {
      return {
        title: SITE + ' — Woodwork',
        desc:  'Bespoke woodwork, made slowly.',
        image: '/assets/emblem-woodwork.png',
      };
    }
    if (jwAny) {
      return {
        title: SITE + ' — Jewelry',
        desc:  'Fine jewelry, made slowly.',
        image: '/assets/emblem-jewelry.png',
      };
    }
    return {
      title: SITE,
      desc:  HOME_DESC,
      image: '/assets/emblem-jewelry.png',
    };
  }

  function apply(route) {
    const m = pickForRoute(route);
    const imageAbs = abs(m.image);
    document.title = m.title;
    setMeta('og:title', m.title);
    setMeta('og:description', m.desc);
    setMeta('og:image', imageAbs);
    setMeta('og:url', window.location.href);
    setMeta('twitter:title', m.title, 'name');
    setMeta('twitter:description', m.desc, 'name');
    setMeta('twitter:image', imageAbs, 'name');
    setMeta('description', m.desc, 'name');
  }

  function currentRoute() {
    return window.location.pathname || '/';
  }

  apply(currentRoute());
  // pushState fires no event; useRoute() calls SMY_updateShareMeta directly.
  window.addEventListener('popstate', () => apply(currentRoute()));
  window.SMY_updateShareMeta = () => apply(currentRoute());
})();
