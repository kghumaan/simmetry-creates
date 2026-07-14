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

/* Downscale to keep uploads and inline fallbacks light. PNGs stay PNG so
   transparency survives; everything else re-encodes as JPEG. */
async function smyShrinkImage(file, maxDim = 1600, quality = 0.85) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  return file.type === 'image/png'
    ? canvas.toDataURL('image/png')
    : canvas.toDataURL('image/jpeg', quality);
}

function ContentProvider({ children }) {
  const [content, setContentState] = React.useState(() =>
    smyDeepMerge(SMY_DEFAULTS, smyLoadLocal() || {}));
  // 'loading' → then 'live' (API serving published content) or 'local'
  const [source, setSource] = React.useState('loading');

  React.useEffect(() => {
    let cancelled = false;
    smyFetchRemote().then(remote => {
      if (cancelled) return;
      if (remote) {
        setContentState(smyDeepMerge(SMY_DEFAULTS, remote));
        setSource('live');
      } else {
        setSource('local');
      }
    });
    return () => { cancelled = true; };
  }, []);

  const applyContent = React.useCallback((next) => {
    setContentState(smyDeepMerge(SMY_DEFAULTS, next));
  }, []);

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
  ContentProvider, useContent, Lines,
  publishContent, uploadImage, verifyPassword,
  smyDeepMerge, smyGet, smySet, smyHas, smyInquiryVisible, SMY_LS_KEY,
});
