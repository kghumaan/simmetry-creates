/* global React, ContentContext, useContent, Lines, publishContent, uploadImage,
   smyGet, smySet, smyHas, smyImgVal, smyImgSrc, smyImgHas, smyImgSerialize,
   SMY_DEFAULTS */

/* =========================================================================
   In-place edit mode — the admin IS the live site.

   Unlocking at /admin stores the password for the session and turns every
   piece of site content into an editable element right where it renders:
   click text to change it, empty it to remove it (empty blocks collapse
   exactly as they do for visitors), and use the small + / × / ‹ › controls
   for photographs and list items. Nothing is stored until "Save & publish"
   in the bar at the bottom.

   EditProvider sits inside ContentProvider and, while editing, overrides
   the content context with the draft — so the pages render the draft
   through the exact same components visitors see.
   ========================================================================= */

const EditContext = React.createContext(null);

const SMY_EDIT_INACTIVE = { active: false };

function useEdit() {
  return React.useContext(EditContext) || SMY_EDIT_INACTIVE;
}

function EditProvider({ children }) {
  const base = useContent();
  const [pw, setPw] = React.useState(() => sessionStorage.getItem('smy.admin.pw') || '');
  const active = pw !== '';

  const [draft, setDraft] = React.useState(base.content);
  const [dirty, setDirty] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState(null); // { kind, text }

  const draftRef = React.useRef(draft);
  React.useEffect(() => { draftRef.current = draft; }, [draft]);

  // Room for the fixed bottom bar while editing.
  React.useEffect(() => {
    document.documentElement.classList.toggle('is-editing', active);
    return () => document.documentElement.classList.remove('is-editing');
  }, [active]);

  // Unsaved edits live only in memory — warn before a reload/close eats them.
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Adopt newly loaded published content while nothing has been touched.
  React.useEffect(() => {
    if (!dirty) setDraft(base.content);
  }, [base.content]); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = React.useCallback((path, value) => {
    setDraft(d => {
      const next = typeof value === 'function' ? value(smyGet(d, path)) : value;
      return smySet(d, path, next);
    });
    setDirty(true);
    setStatus(null);
  }, []);

  const unlock = React.useCallback((password) => {
    sessionStorage.setItem('smy.admin.pw', password);
    setPw(password);
  }, []);

  const lock = React.useCallback(() => {
    sessionStorage.removeItem('smy.admin.pw');
    setPw('');
    setDirty(false);
    setStatus(null);
    setDraft(base.content);
  }, [base.content]);

  const save = React.useCallback(async () => {
    const snapshot = draftRef.current;
    setBusy(true);
    setStatus(null);
    const res = await publishContent(snapshot, pw);
    setBusy(false);
    if (!res.ok) { setStatus({ kind: 'err', text: res.error }); return; }
    base.applyContent(snapshot);
    if (draftRef.current === snapshot) setDirty(false);
    setStatus(res.remote
      ? { kind: 'ok', text: 'Published. The changes are live for every visitor.' }
      : { kind: 'warn', text: 'Saved on this device only — the publishing API is not set up yet (see ADMIN.md).' });
  }, [pw, base]);

  const discard = React.useCallback(() => {
    setDraft(base.content);
    setDirty(false);
    setStatus(null);
  }, [base.content]);

  const resetAll = React.useCallback(() => {
    setDraft(SMY_DEFAULTS);
    setDirty(true);
    setStatus({ kind: 'warn', text: 'Everything is back to the original content. “Save & publish” makes it stick; “Discard” brings your version back.' });
  }, []);

  const ctx = React.useMemo(() => ({
    active, pw, unlock, lock,
    setField, save, discard, resetAll,
    dirty, busy, status, setBusy, setStatus,
    loading: base.source === 'loading',
  }), [active, pw, unlock, lock, setField, save, discard, resetAll, dirty, busy, status, base.source]);

  // While editing, the whole site renders the draft.
  const contentValue = active
    ? { ...base, content: draft }
    : base;

  return (
    <EditContext.Provider value={ctx}>
      <ContentContext.Provider value={contentValue}>
        {children}
      </ContentContext.Provider>
    </EditContext.Provider>
  );
}

/* ---------- E — in-place editable text ------------------------------------
   View mode: renders the value (newlines honored) — exactly what visitors
   see. Edit mode: contentEditable in the same spot; commit on blur; empty
   values show a quiet placeholder instead of disappearing. ---------------- */

function smyEscapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function E({ path, ph = 'Type here…', as = 'span' }) {
  const edit = useEdit();
  const { content } = useContent();
  const value = smyGet(content, path);

  if (!edit.active) return <Lines text={value} />;

  const Tag = as;
  const commit = (e) => {
    const text = e.currentTarget.innerText
      .replace(/\u00a0/g, ' ')
      .replace(/\n+$/, '');
    if (text !== String(value == null ? '' : value)) edit.setField(path, text);
  };
  return (
    <Tag
      className="e-text"
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-ph={ph}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.blur(); }}
      dangerouslySetInnerHTML={{ __html: smyEscapeHtml(value).replace(/\n/g, '<br>') }}
    />
  );
}

/* ---------- Small edit-mode controls --------------------------------------- */

function EBtn({ title, onClick, danger, children }) {
  return (
    <button
      type="button"
      className={`e-btn ${danger ? 'e-btn--danger' : ''}`}
      title={title}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
    >{children}</button>
  );
}

/* Hidden-input photo upload; calls onDone(urls[]) with uploaded URLs. */
function EUpload({ label, multiple, onDone, className = '' }) {
  const edit = useEdit();
  const ref = React.useRef(null);
  const [busy, setLocalBusy] = React.useState(false);

  const handle = async (files) => {
    if (!files.length) return;
    setLocalBusy(true); edit.setBusy(true);
    const urls = [];
    const failures = [];
    let inline = 0;
    for (const file of files) {
      try {
        const { url, remote } = await uploadImage(file, edit.pw);
        urls.push(url);
        if (!remote) inline++;
      } catch (err) {
        failures.push(`“${file.name}”: ${err && err.message ? err.message : 'could not be read.'}`);
      }
    }
    if (failures.length) edit.setStatus({ kind: 'err', text: failures.join(' ') });
    else if (inline) edit.setStatus({ kind: 'warn', text: 'New photographs are stored inside the page for now (upload API not set up); they still publish with “Save & publish”.' });
    if (urls.length) onDone(urls);
    setLocalBusy(false); edit.setBusy(false);
    if (ref.current) ref.current.value = '';
  };

  return (
    <>
      <button
        type="button"
        className={`e-btn e-btn--label ${className}`}
        disabled={busy}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); ref.current && ref.current.click(); }}
      >{busy ? 'Adding…' : label}</button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple={!!multiple}
        style={{ display: 'none' }}
        onChange={(e) => handle(Array.from(e.target.files || []))}
      />
    </>
  );
}

/* ---------- Crop & zoom ----------------------------------------------------
   A small framing tool for any photograph on the site. It never touches the
   file itself — it stores a focal point + zoom that the pages apply with
   CSS — so "Undo framing" always brings the original photograph back.

   The preview box uses the exact same CSS the live page uses, so what is
   framed here is what visitors see. Drag to move the photo, use the slider
   (or scroll) to zoom, or switch to "Show whole photo" to letterbox it
   uncropped. ------------------------------------------------------------- */

function EImgAdjust({ value, ratio = 4 / 5, title, onApply, onClose }) {
  const initial = React.useMemo(() => smyImgVal(value), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [adj, setAdj] = React.useState(initial);
  const boxRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const dragRef = React.useRef(null);

  const clampPos = (n) => Math.min(100, Math.max(0, n));
  const clampZoom = (n) => Math.min(4, Math.max(1, n));

  // How many pixels of the photo hang outside the box on each axis at the
  // current zoom — that's what a full 0→100 pan traverses.
  const overflowPx = () => {
    const box = boxRef.current, img = imgRef.current;
    if (!box || !img || !img.naturalWidth) return { x: 0, y: 0 };
    const bw = box.clientWidth, bh = box.clientHeight;
    const s = Math.max(bw / img.naturalWidth, bh / img.naturalHeight) * adj.z;
    return {
      x: Math.max(0, img.naturalWidth * s - bw),
      y: Math.max(0, img.naturalHeight * s - bh),
    };
  };

  const onPointerDown = (e) => {
    if (adj.fit === 'contain') return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { px: e.clientX, py: e.clientY, x: adj.x, y: adj.y };
  };
  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const o = overflowPx();
    setAdj(a => ({
      ...a,
      x: o.x > 0 ? clampPos(d.x - ((e.clientX - d.px) / o.x) * 100) : a.x,
      y: o.y > 0 ? clampPos(d.y - ((e.clientY - d.py) / o.y) * 100) : a.y,
    }));
  };
  const onPointerUp = () => { dragRef.current = null; };

  // Scroll-to-zoom needs a non-passive listener; React's onWheel is passive.
  React.useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      setAdj(a => (a.fit === 'contain'
        ? a
        : { ...a, z: clampZoom(a.z * (e.deltaY < 0 ? 1.06 : 1 / 1.06)) }));
    };
    box.addEventListener('wheel', onWheel, { passive: false });
    return () => box.removeEventListener('wheel', onWheel);
  }, []);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const covering = adj.fit === 'cover';
  const imgStyle = covering
    ? {
        objectFit: 'cover',
        objectPosition: `${adj.x}% ${adj.y}%`,
        transform: `scale(${adj.z})`,
        transformOrigin: `${adj.x}% ${adj.y}%`,
      }
    : { objectFit: 'contain' };

  return (
    <div className="e-adjust" onClick={onClose} role="dialog" aria-modal="true" aria-label={title || 'Crop and zoom'}>
      <div className="e-adjust__card" onClick={(e) => e.stopPropagation()}>
        <div className="e-adjust__head">
          <span className="caption">{title || 'Crop & zoom'}</span>
          <button type="button" className="e-btn e-btn--danger" title="Close without applying" onClick={onClose}>✕</button>
        </div>

        <div
          ref={boxRef}
          className={`e-adjust__frame ${covering ? 'is-draggable' : ''}`}
          style={{
            aspectRatio: String(ratio),
            // Tall ratios cap by height so the whole frame stays on screen.
            width: `min(100%, calc(52vh * ${ratio}))`,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <img ref={imgRef} src={adj.src} alt="" draggable={false} style={imgStyle} />
        </div>
        <p className="e-adjust__hint">
          {covering
            ? 'Drag the photo to choose what shows. Zoom with the slider or by scrolling on the photo.'
            : 'The whole photo shows, uncropped, with quiet bands filling the frame.'}
        </p>

        <div className="e-adjust__modes">
          <button
            type="button"
            className={`e-btn e-btn--label ${covering ? 'is-on' : ''}`}
            onClick={() => setAdj(a => ({ ...a, fit: 'cover' }))}
          >Fill the frame</button>
          <button
            type="button"
            className={`e-btn e-btn--label ${!covering ? 'is-on' : ''}`}
            onClick={() => setAdj(a => ({ ...a, fit: 'contain' }))}
          >Show whole photo</button>
        </div>

        {covering && (
          <label className="e-adjust__zoom">
            <span className="caption">Zoom · {adj.z.toFixed(2)}×</span>
            <input
              className="hm-hero__range"
              type="range"
              min="100"
              max="300"
              step="1"
              value={Math.round(Math.min(3, adj.z) * 100)}
              onChange={(e) => setAdj(a => ({ ...a, z: clampZoom(Number(e.target.value) / 100) }))}
            />
          </label>
        )}

        <div className="e-adjust__actions">
          <button
            type="button"
            className="adm-btn adm-btn--ghost"
            title="Back to the untouched photograph, centered"
            onClick={() => setAdj(a => ({ src: a.src, x: 50, y: 50, z: 1, fit: 'cover' }))}
          >Undo framing</button>
          <button
            type="button"
            className="adm-btn adm-btn--ghost"
            title="Back to how it was when this window opened"
            onClick={() => setAdj(initial)}
          >Revert</button>
          <span className="e-adjust__spacer" />
          <button type="button" className="adm-btn adm-btn--exit" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="adm-btn adm-btn--save"
            onClick={() => { onApply(smyImgSerialize(adj)); onClose(); }}
          >Apply</button>
        </div>
      </div>
    </div>
  );
}

/* The button that opens the framing tool. Renders nothing when there is no
   photograph to frame yet. */
function EImgAdjustBtn({ value, ratio, title = 'Crop & zoom', onChange, children, className = '' }) {
  const [open, setOpen] = React.useState(false);
  if (!smyImgHas(value)) return null;
  return (
    <>
      <button
        type="button"
        className={`e-btn ${className}`}
        title={title}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
      >{children || '⤢'}</button>
      {open && (
        <EImgAdjust
          value={value}
          ratio={ratio}
          title={title}
          onApply={onChange}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/* ---------- The bottom edit bar -------------------------------------------- */

function EditBar() {
  const edit = useEdit();
  const [armReset, setArmReset] = React.useState(false);
  if (!edit.active) return null;

  // The status colour: an explicit result wins; otherwise unsaved edits read
  // as a gentle "remember to publish" amber, and the resting state is neutral.
  const statusKind = edit.status ? edit.status.kind
    : edit.dirty ? 'dirty'
    : 'idle';

  return (
    <div className="adm-savebar e-bar" role="region" aria-label="Admin editing controls">
      <div className="adm-savebar__inner">
        {/* Left: a standing "you are in admin" badge + the live status */}
        <div className="adm-savebar__lead">
          <span className="adm-badge">
            <span className="adm-badge__dot" aria-hidden="true" />
            Admin editing
          </span>
          <span
            className={`adm-status adm-status--${statusKind}`}
            role="status"
            aria-live="polite"
          >
            {edit.loading ? 'Fetching the latest published content…'
              : edit.busy ? 'Working…'
              : edit.status ? edit.status.text
              : edit.dirty ? 'Unsaved changes — press “Save & publish” to make them live.'
              : 'Click any text to change it. Empty it to remove it.'}
          </span>
        </div>

        {/* Right: secondary controls, then Exit, then Save — Save is always the
            last child of a right-anchored row, so it never shifts. */}
        <div className="adm-savebar__actions">
          <div className="adm-savebar__secondary">
            {armReset ? (
              <span className="adm-armed">
                <span className="adm-armed__q">Reset everything?</span>
                <button type="button" className="adm-btn adm-btn--ghost adm-btn--danger" onClick={() => { edit.resetAll(); setArmReset(false); }}>Yes, reset</button>
                <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setArmReset(false)}>No</button>
              </span>
            ) : (
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setArmReset(true)}>Reset to original…</button>
            )}
            {edit.dirty && !edit.busy && (
              <button type="button" className="adm-btn adm-btn--ghost" onClick={edit.discard}>Discard changes</button>
            )}
          </div>

          <button type="button" className="adm-btn adm-btn--exit" onClick={edit.lock}>
            <span className="adm-btn__x" aria-hidden="true">✕</span> Exit editing
          </button>

          <button
            type="button"
            className="adm-btn adm-btn--save"
            disabled={edit.busy || !edit.dirty || edit.loading}
            onClick={edit.save}
          >
            Save &amp; publish <span className="smy-cta__arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { EditProvider, useEdit, E, EBtn, EUpload, EditBar, EImgAdjust, EImgAdjustBtn });
