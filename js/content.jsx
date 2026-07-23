/* global React, SMY_DEFAULTS */
/* =========================================================================
   Content store — resolves what the site actually shows.

   Priority at boot:  published content from /api/content (Vercel Blob)
                    → local draft in localStorage (this browser only)
                    → SMY_DEFAULTS baked into js/data.jsx.

   The admin panel saves through publishContent(): always to localStorage,
   and to the API when it is configured, which is what makes an edit visible
   to every visitor.
   ========================================================================= */

const ContentContext = React.createContext(null);

const SMY_LS_KEY = 'smy.content.v1';

function smyDeepMerge(base, over) {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base) || Array.isArray(over)) return over;
  if (typeof base === 'object' && base && typeof over === 'object') {
    const out = { ...base };
    for (const k of Object.keys(over)) out[k] = smyDeepMerge(base[k], over[k]);
    return out;
  }
  return over;
}

function smyGet(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function smySet(obj, path, value) {
  const keys = path.split('.');
  const root = { ...obj };
  let cur = root;
  for (const k of keys.slice(0, -1)) {
    cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return root;
}

function smyLoadLocal() {
  try { return JSON.parse(localStorage.getItem(SMY_LS_KEY)); }
  catch { return null; }
}

/* -------------------------------------------------------------------------
   Image values.

   A stored image is either a plain URL string, or — once the admin has
   framed it with the crop tool — an object:

     { src, x, y, z, fit }

   x/y are the focal point as object-position percentages (50/50 = center),
   z is a zoom factor (1 = the normal cover fill), and fit is 'cover' or
   'contain' ('contain' letterboxes the whole photograph, nothing cropped).
   The crop is applied with CSS at render time, so the original file is
   never touched and the framing can be undone at any point.
   ------------------------------------------------------------------------- */

function smyImgVal(v) {
  if (v && typeof v === 'object') {
    const n = (x, d) => (Number.isFinite(Number(x)) ? Number(x) : d);
    return {
      src: typeof v.src === 'string' ? v.src : '',
      x: Math.min(100, Math.max(0, n(v.x, 50))),
      y: Math.min(100, Math.max(0, n(v.y, 50))),
      z: Math.min(4, Math.max(1, n(v.z, 1))),
      fit: v.fit === 'contain' ? 'contain' : 'cover',
    };
  }
  return { src: typeof v === 'string' ? v : '', x: 50, y: 50, z: 1, fit: 'cover' };
}

function smyImgSrc(v) { return smyImgVal(v).src; }
function smyImgHas(v) { return smyImgSrc(v).trim() !== ''; }

/* Inline style for an <img> that fills its box (the site's cover images).
   Plain strings produce no style at all, so untouched photographs render
   exactly as before. */
function smyImgStyle(v) {
  const a = smyImgVal(v);
  if (!a.src) return undefined;
  if (a.fit === 'contain') return { objectFit: 'contain' };
  const style = {};
  if (a.x !== 50 || a.y !== 50) style.objectPosition = `${a.x}% ${a.y}%`;
  if (a.z !== 1) {
    style.transform = `scale(${a.z})`;
    style.transformOrigin = `${a.x}% ${a.y}%`;
    if (!style.objectPosition) style.objectPosition = '50% 50%';
  }
  return Object.keys(style).length ? style : undefined;
}

/* The default framing (nothing cropped beyond the normal cover fill)
   collapses back to the bare string so untouched saves stay clean. */
function smyImgSerialize(a) {
  if (a.fit === 'cover' && a.x === 50 && a.y === 50 && a.z === 1) return a.src;
  return { src: a.src, x: Math.round(a.x * 10) / 10, y: Math.round(a.y * 10) / 10, z: Math.round(a.z * 100) / 100, fit: a.fit };
}

/* Saved content from older versions of the site needs two upgrades:
   - images.{mode} used to be plain arrays of URL strings; they are now
     products.{mode} arrays of objects (image, title, details, …)
   - pre-clean-URL saves hold relative image paths that break on nested
     routes.
   Both run pure — deepMerge can hand back SMY_DEFAULTS subtrees by
   reference, so mutating in place would rewrite the shared defaults. */

/* Leading-slash form of a stored path. Pre-clean-URL saves hold
   `uploads/x.png` where the defaults hold `/uploads/x.png`; smyAbsolutizePaths
   reconciles that, but it runs *after* migration, so anything comparing paths
   during migration has to normalize for itself. */
function smyNormalizePath(v) {
  return typeof v === 'string' && /^(uploads|assets)\//.test(v) ? '/' + v : v;
}

/* The category a shipped default gives this photograph, matched on the image
   path (which is what survives in older saves). '' when we don't know it. */
function smyDefaultCategoryFor(mode, image) {
  if (!image) return '';
  const want = smyNormalizePath(image);
  const defaults = (SMY_DEFAULTS.products && SMY_DEFAULTS.products[mode]) || [];
  const hit = defaults.find(d => smyNormalizePath(d.image) === want);
  return (hit && hit.category) || '';
}

function smyMigrateContent(c) {
  if (!c) return c;
  const out = { ...c };
  if (out.images && !out.products) {
    out.products = {};
    for (const k of Object.keys(out.images)) {
      if (Array.isArray(out.images[k])) {
        out.products[k] = out.images[k].map(src => ({ image: src }));
      }
    }
  }
  delete out.images;
  if (out.products) {
    out.products = { ...out.products };
    for (const k of Object.keys(out.products)) {
      if (Array.isArray(out.products[k])) {
        out.products[k] = out.products[k].map(p =>
          typeof p === 'string' ? { image: p } : p);
        // Buckets arrived after these were published, so nothing saved has a
        // category. Recover it from the shipped defaults by photograph;
        // anything unrecognised stays unfiled and shows only under All work,
        // until the admin files it on the product page.
        out.products[k] = out.products[k].map(p =>
          !p || p.category !== undefined
            ? p
            : { ...p, category: smyDefaultCategoryFor(k, p.image) });
      }
    }
  }
  // The hero became a slideshow (home.<mode>.heroImages). A save from before
  // that carries a single `heroImage` and no `heroImages`; promote it to a
  // one-frame list so it overrides the shipped default slideshow instead of
  // being buried under it when the two trees merge.
  if (out.home) {
    out.home = { ...out.home };
    for (const k of Object.keys(out.home)) {
      const h = out.home[k];
      if (h && typeof h === 'object' && !Array.isArray(h.heroImages)
          && String(h.heroImage == null ? '' : h.heroImage).trim() !== '') {
        out.home[k] = { ...h, heroImages: [h.heroImage] };
      }
    }
  }
  // Flat bio1/step1 fields became bios[]/steps[] arrays.
  if (out.about) {
    const a = { ...out.about };
    if (!a.bios && (a.bio1Label || a.bio1 || a.bio2Label || a.bio2 || a.bio3Label || a.bio3)) {
      a.bios = [
        { label: a.bio1Label || '', body: a.bio1 || '' },
        { label: a.bio2Label || '', body: a.bio2 || '' },
        { label: a.bio3Label || '', body: a.bio3 || '' },
      ];
    }
    if (!a.steps && (a.step1Title || a.step1Body || a.step2Title || a.step2Body || a.step3Title)) {
      a.steps = [
        { title: a.step1Title || '', body: a.step1Body || '' },
        { title: a.step2Title || '', body: a.step2Body || '' },
        { title: a.step3Title || '', body: a.step3BodyJewelry || a.step3BodyWoodwork || '' },
      ];
    }
    ['bio1Label', 'bio1', 'bio2Label', 'bio2', 'bio3Label', 'bio3',
     'step1Title', 'step1Body', 'step2Title', 'step2Body',
     'step3Title', 'step3BodyJewelry', 'step3BodyWoodwork'].forEach(k => delete a[k]);
    out.about = a;
  }
  return out;
}

function smyAbsolutizePaths(c) {
  // Image values can be crop objects now — normalize the src inside those.
  const fix = (v) => (v && typeof v === 'object'
    ? { ...v, src: smyNormalizePath(v.src) }
    : smyNormalizePath(v));
  if (!c) return c;
  const out = { ...c };
  if (out.products) {
    out.products = { ...out.products };
    for (const k of Object.keys(out.products)) {
      if (Array.isArray(out.products[k])) {
        out.products[k] = out.products[k].map(p => ({
          ...p,
          image: fix(p.image),
          images: Array.isArray(p.images) ? p.images.map(fix) : p.images,
        }));
      }
    }
  }
  if (out.categories) {
    out.categories = { ...out.categories };
    for (const k of Object.keys(out.categories)) {
      if (Array.isArray(out.categories[k])) {
        out.categories[k] = out.categories[k].map(c => ({ ...c, image: fix(c.image) }));
      }
    }
  }
  if (out.home) {
    out.home = { ...out.home };
    for (const k of Object.keys(out.home)) {
      const h = out.home[k];
      if (h && typeof h === 'object') {
        out.home[k] = {
          ...h,
          heroImage: fix(h.heroImage),
          heroImages: Array.isArray(h.heroImages) ? h.heroImages.map(fix) : h.heroImages,
          videoPoster: fix(h.videoPoster),
          videoUrl: fix(h.videoUrl),
        };
      }
    }
  }
  if (out.about) out.about = { ...out.about, portrait: fix(out.about.portrait) };
  if (out.branding) out.branding = {
    ...out.branding,
    jewelryLogo: fix(out.branding.jewelryLogo),
    woodworkLogo: fix(out.branding.woodworkLogo),
  };
  return out;
}

/* Full resolution pipeline for any loaded override. */
function smyResolveContent(saved) {
  return smyAbsolutizePaths(smyDeepMerge(SMY_DEFAULTS, smyMigrateContent(saved) || {}));
}

async function smyFetchRemote() {
  try {
    const r = await fetch('/api/content?ts=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return null;
    if (!(r.headers.get('content-type') || '').includes('json')) return null;
    return await r.json();
  } catch { return null; }
}

/* Statuses that mean "the publishing API isn't available here" (plain static
   server, or Blob store not connected yet) — as opposed to a real failure.
   501: python -m http.server answers POST with 501 Unsupported Method. */
function smyApiMissing(status) {
  return status === 404 || status === 405 || status === 501 || status === 503;
}

/* Save everywhere we can.
   Returns { ok: true,  remote: true }              — published for everyone
           { ok: true,  remote: false }             — API not set up; local only
           { ok: false, error }                     — real failure, retry needed */
async function publishContent(next, password) {
  try { localStorage.setItem(SMY_LS_KEY, JSON.stringify(next)); }
  catch { /* quota — inline images can overflow localStorage; remote still tried */ }
  let r;
  try {
    r = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, content: next }),
    });
  } catch {
    return { ok: false, error: 'Could not reach the server — your changes are saved on this device. Check the connection and press “Save & publish” again.' };
  }
  if (r.ok) return { ok: true, remote: true };
  if (r.status === 401) return { ok: false, error: 'The server rejected the password, so nothing was published. If the password was changed on the server, sign in again with the new one.' };
  if (smyApiMissing(r.status)) return { ok: true, remote: false };
  return { ok: false, error: `Publishing failed (error ${r.status}) — your changes are saved on this device. Press “Save & publish” to try again.` };
}

/* Check a password against the server before trusting it.
   'ok' | 'bad' | 'no-api' (nothing server-side to check against). */
async function verifyPassword(password) {
  try {
    const r = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, verifyOnly: true }),
    });
    if (r.status === 401) return 'bad';
    if (r.ok) return 'ok';
    return 'no-api';
  } catch { return 'no-api'; }
}

/* Upload one image. Returns { url, remote }; only falls back to an inline
   data URL when the upload API genuinely isn't available. Real failures
   throw with a message fit for the admin UI. */
async function uploadImage(file, password) {
  const dataUrl = await smyShrinkImage(file);
  let r;
  try {
    r = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, name: file.name, dataUrl }),
    });
  } catch {
    throw new Error('Could not reach the server — the photo was not added. Check the connection and try again.');
  }
  if (r.ok) {
    const j = await r.json().catch(() => null);
    if (j && j.url) return { url: j.url, remote: true };
    throw new Error('The upload API returned an unexpected response — the photo was not added.');
  }
  if (r.status === 401) throw new Error('The server rejected the password — the photo was not uploaded.');
  if (smyApiMissing(r.status)) return { url: dataUrl, remote: false };
  if (r.status === 413) throw new Error('That photo is too large, even after shrinking — the photo was not added.');
  throw new Error(`Uploading failed (error ${r.status}) — try that photo again.`);
}

/* Prepare an upload without giving away quality it doesn't have to.

   The only hard ceiling is Vercel's ~4.5 MB request-body limit, so:
   - a web-ready file that already fits goes up untouched, byte for byte;
   - anything bigger is re-encoded from the full-resolution original at up
     to 2560px on the long edge (sharper than any laptop hero needs), then
     stepped down only as far as the body limit forces;
   - PNGs keep PNG only when they actually use transparency — a photograph
     saved as PNG re-encodes as JPEG at a fraction of the weight. */
const SMY_UPLOAD_LIMIT = 4.2 * 1024 * 1024; // data-URL chars; under Vercel's 4.5 MB body cap

function smyFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('could not be read.'));
    r.readAsDataURL(file);
  });
}

function smyBitmapHasAlpha(bitmap) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const ctx = c.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, 64, 64);
  const d = ctx.getImageData(0, 0, 64, 64).data;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return true;
  return false;
}

function smyEncodeBitmap(bitmap, maxDim, asPng, quality) {
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  return asPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality);
}

async function smyShrinkImage(file) {
  const webReady = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
  if (webReady && file.size * 1.37 < SMY_UPLOAD_LIMIT) {
    return smyFileToDataUrl(file); // fits as-is: original quality, untouched
  }
  const bitmap = await createImageBitmap(file);
  const keepPng = file.type === 'image/png' && smyBitmapHasAlpha(bitmap);
  const steps = [
    { dim: 2560, q: 0.9 },
    { dim: 2048, q: 0.85 },
    { dim: 1600, q: 0.82 },
    { dim: 1280, q: 0.78 },
  ];
  for (const s of steps) {
    const url = smyEncodeBitmap(bitmap, s.dim, keepPng, s.q);
    if (url.length <= SMY_UPLOAD_LIMIT) return url;
  }
  // A transparent PNG too heavy even at 1280 gives up its transparency.
  return smyEncodeBitmap(bitmap, 1280, false, 0.72);
}

function ContentProvider({ children }) {
  const [content, setContentState] = React.useState(() =>
    smyResolveContent(smyLoadLocal()));
  // 'loading' → then 'live' (API serving published content) or 'local'
  const [source, setSource] = React.useState('loading');

  React.useEffect(() => {
    let cancelled = false;
    smyFetchRemote().then(remote => {
      if (cancelled) return;
      if (remote) {
        setContentState(smyResolveContent(remote));
        setSource('live');
      } else {
        setSource('local');
      }
    });
    return () => { cancelled = true; };
  }, []);

  const applyContent = React.useCallback((next) => {
    setContentState(smyResolveContent(next));
  }, []);

  /* share.jsx runs before React and only knows the shipped defaults. Hand it
     the resolved content so link previews describe what is actually
     published — a renamed bucket, a replaced tile — and re-stamp the tags for
     the route already on screen. */
  React.useEffect(() => {
    window.SMY_LIVE_CONTENT = content;
    if (typeof window.SMY_updateShareMeta === 'function') window.SMY_updateShareMeta();
  }, [content]);

  const value = React.useMemo(
    () => ({ content, source, applyContent }),
    [content, source, applyContent]
  );
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

function useContent() { return React.useContext(ContentContext); }

/* True when at least one of the values has visible text. Sections whose
   every field fails this check are removed from the page entirely. */
function smyHas(...vals) {
  return vals.some(v => String(v == null ? '' : v).trim() !== '');
}

/* Whether the About page's inquiry/contact section renders. The nav's
   Contact link must follow the same rule or it points at nothing. */
function smyInquiryVisible(about) {
  return smyHas(
    about.inquiryEyebrow, about.inquiryTitle, about.inquiryLede,
    about.postLabel, about.postValue,
    about.emailLabel, about.emailValue,
    about.diaryLabel, about.diaryValue
  );
}

/* Render a saved string, honoring newlines. */
function Lines({ text }) {
  const parts = String(text == null ? '' : text).split('\n');
  return parts.map((p, i) => (
    <React.Fragment key={i}>{i > 0 && <br />}{p}</React.Fragment>
  ));
}

Object.assign(window, {
  ContentProvider, ContentContext, useContent, Lines,
  publishContent, uploadImage, verifyPassword,
  smyDeepMerge, smyGet, smySet, smyHas, smyInquiryVisible,
  smyImgVal, smyImgSrc, smyImgHas, smyImgStyle, smyImgSerialize,
  smyResolveContent, SMY_LS_KEY,
});
