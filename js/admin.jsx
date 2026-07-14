/* global React, useContent, publishContent, uploadImage, smyGet, smySet,
   SMY_DEFAULTS, SMY_ADMIN_SCHEMA, SMY_LS_KEY, Lines */

/* =========================================================================
   Admin — #/admin. Password-gated editor for every image and every piece
   of text the site renders. Saves locally always; publishes through
   /api/content when the API is configured (see api/ + ADMIN.md).
   ========================================================================= */

const ADMIN_PASSWORD = '1111'; // client-side gate; the API checks it again server-side

function AdminPage({ navigate }) {
  const [password, setPassword] = React.useState(() => sessionStorage.getItem('smy.admin.pw') || '');
  const authed = password === ADMIN_PASSWORD;

  if (!authed) {
    return <AdminGate onUnlock={(pw) => {
      sessionStorage.setItem('smy.admin.pw', pw);
      setPassword(pw);
    }} />;
  }
  return <AdminEditor password={password} navigate={navigate} onLock={() => {
    sessionStorage.removeItem('smy.admin.pw');
    setPassword('');
  }} />;
}

function AdminGate({ onUnlock }) {
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) onUnlock(value);
    else setError(true);
  };

  return (
    <div className="adm-gate">
      <form className="adm-gate__card" onSubmit={submit}>
        <span className="caption caption--accent">— Studio admin</span>
        <h1 className="adm-gate__h">Hello, Ashish.</h1>
        <p className="smy-lede" style={{ fontSize: 15 }}>
          Enter the studio password to edit the photographs and the words on the site.
        </p>
        <label className="smy-field">
          <span className="smy-field__label">Password</span>
          <input
            className="smy-input"
            type="password"
            autoFocus
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="••••"
          />
        </label>
        {error && <p className="adm-error">That is not the password. Try again.</p>}
        <button type="submit" className="smy-cta smy-cta--solid">
          Enter the studio <span className="smy-cta__arrow">→</span>
        </button>
      </form>
    </div>
  );
}

/* ---------- Editor ------------------------------------------------------- */

function AdminEditor({ password, navigate, onLock }) {
  const { content, source, applyContent } = useContent();
  const [draft, setDraft] = React.useState(content);
  const [dirty, setDirty] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState(null); // { kind: 'ok'|'warn'|'err', text }

  // If the published content arrives after mount and nothing was touched yet,
  // adopt it as the starting point.
  React.useEffect(() => {
    if (!dirty) setDraft(content);
  }, [content]); // eslint-disable-line react-hooks/exhaustive-deps

  const edit = (updater) => {
    setDraft(d => updater(d));
    setDirty(true);
    setStatus(null);
  };
  const setField = (path, value) => edit(d => smySet(d, path, value));

  const save = async () => {
    setBusy(true);
    setStatus(null);
    const res = await publishContent(draft, password);
    setBusy(false);
    if (!res.ok) { setStatus({ kind: 'err', text: res.error }); return; }
    applyContent(draft);
    setDirty(false);
    setStatus(res.remote
      ? { kind: 'ok', text: 'Published. The changes are live for every visitor.' }
      : { kind: 'warn', text: 'Saved on this device only. The publishing API is not set up yet, so other visitors will not see these changes — see ADMIN.md.' });
  };

  const discard = () => { setDraft(content); setDirty(false); setStatus(null); };

  return (
    <div className="adm">
      <div className="adm-container">
        <header className="adm-head">
          <div>
            <span className="caption caption--accent">— Studio admin</span>
            <h1 className="adm-head__h">The website, on the bench.</h1>
            <p className="smy-lede" style={{ fontSize: 15, maxWidth: '58ch' }}>
              Everything below is what the site shows. Change what you like, then press
              “Save &amp; publish” at the bottom. Nothing changes until you save.
              Empty a box to remove that text from the site — when every box in a
              section is empty, the whole section disappears.
            </p>
          </div>
          <div className="adm-head__actions">
            <a className="smy-cta" href="#/" onClick={e => { e.preventDefault(); navigate('/'); }}>
              View the site <span className="smy-cta__arrow">→</span>
            </a>
            <button type="button" className="adm-linkbtn" onClick={onLock}>Lock the door</button>
          </div>
        </header>

        {source === 'local' && (
          <p className="adm-note">
            Publishing API not detected — edits will save to this browser only until it is set up (ADMIN.md has the two-minute setup).
          </p>
        )}

        <ImageListEditor
          title="Jewelry photographs"
          hint="These appear on the jewelry gallery, in this order."
          list={draft.images.jewelry}
          password={password}
          onChange={(next) => setField('images.jewelry', next)}
          onBusy={setBusy}
        />

        <ImageListEditor
          title="Woodwork photographs"
          hint="These appear on the woodwork gallery, in this order."
          list={draft.images.woodwork}
          password={password}
          onChange={(next) => setField('images.woodwork', next)}
          onBusy={setBusy}
        />

        <PortraitEditor
          title="About page portrait"
          hint="The photograph of you at the top of the About page."
          src={draft.about.portrait}
          password={password}
          onChange={(url) => setField('about.portrait', url)}
          onBusy={setBusy}
        />

        {SMY_ADMIN_SCHEMA.map(group => (
          <section key={group.group} className="adm-section">
            <h2 className="adm-section__h">{group.group}</h2>
            <div className="adm-fields">
              {group.fields.map(f => (
                <label key={f.path} className="smy-field adm-field">
                  <span className="smy-field__label">{f.label}</span>
                  {f.type === 'textarea' ? (
                    <textarea
                      className="smy-textarea adm-textarea"
                      value={smyGet(draft, f.path) || ''}
                      onChange={e => setField(f.path, e.target.value)}
                    />
                  ) : (
                    <input
                      className="smy-input"
                      type="text"
                      value={smyGet(draft, f.path) || ''}
                      onChange={e => setField(f.path, e.target.value)}
                    />
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}

        <ResetSection onReset={() => {
          localStorage.removeItem(SMY_LS_KEY);
          setDraft(SMY_DEFAULTS);
          setDirty(true);
          setStatus({ kind: 'warn', text: 'Everything is back to the original text and photographs. Press “Save & publish” to make it stick.' });
        }} />
      </div>

      <div className="adm-savebar">
        <div className="adm-savebar__inner">
          <span className={`adm-status ${status ? 'adm-status--' + status.kind : ''}`}>
            {busy ? 'Working…' : status ? status.text : dirty ? 'Unsaved changes' : 'Everything is saved'}
          </span>
          <div className="adm-savebar__actions">
            {dirty && !busy && (
              <button type="button" className="adm-linkbtn" onClick={discard}>Discard changes</button>
            )}
            <button
              type="button"
              className="smy-cta smy-cta--solid"
              disabled={busy || !dirty}
              onClick={save}
            >
              Save &amp; publish <span className="smy-cta__arrow">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Image list (gallery) editor ----------------------------------- */

function ImageListEditor({ title, hint, list, password, onChange, onBusy }) {
  const inputRef = React.useRef(null);
  const [adding, setAdding] = React.useState(false);
  const [note, setNote] = React.useState(null);

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const remove = (i) => onChange(list.filter((_, k) => k !== i));

  const addFiles = async (files) => {
    if (!files || !files.length) return;
    setAdding(true); onBusy(true); setNote(null);
    const added = [];
    let inlineCount = 0;
    for (const file of files) {
      try {
        const { url, remote } = await uploadImage(file, password);
        added.push(url);
        if (!remote) inlineCount++;
      } catch {
        setNote(`Could not read “${file.name}” — skipped.`);
      }
    }
    if (added.length) onChange([...list, ...added]);
    if (inlineCount) setNote('New photographs are stored inside the page for now (the upload API is not set up). They will still publish with “Save & publish”.');
    setAdding(false); onBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="adm-section">
      <div className="adm-section__row">
        <div>
          <h2 className="adm-section__h">{title}</h2>
          <p className="adm-hint">{hint}</p>
        </div>
        <button
          type="button"
          className="smy-cta"
          disabled={adding}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          {adding ? 'Adding…' : 'Add photographs'} <span className="smy-cta__arrow">+</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={e => addFiles(Array.from(e.target.files || []))}
        />
      </div>

      <div className="adm-grid">
        {list.map((src, i) => (
          <figure key={src.slice(0, 80) + i} className="adm-thumb">
            <img src={src} alt="" loading="lazy" />
            <figcaption className="adm-thumb__bar">
              <button type="button" title="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}>←</button>
              <span className="num">{String(i + 1).padStart(2, '0')}</span>
              <button type="button" title="Move later" disabled={i === list.length - 1} onClick={() => move(i, 1)}>→</button>
              <button type="button" className="adm-thumb__x" title="Remove" onClick={() => remove(i)}>×</button>
            </figcaption>
          </figure>
        ))}
        {!list.length && <p className="adm-hint">No photographs yet — add some above.</p>}
      </div>
      {note && <p className="adm-note">{note}</p>}
    </section>
  );
}

/* ---------- Single portrait editor ---------------------------------------- */

function PortraitEditor({ title, hint, src, password, onChange, onBusy }) {
  const inputRef = React.useRef(null);
  const [adding, setAdding] = React.useState(false);

  const replace = async (file) => {
    if (!file) return;
    setAdding(true); onBusy(true);
    try {
      const { url } = await uploadImage(file, password);
      onChange(url);
    } catch { /* unreadable file — keep current portrait */ }
    setAdding(false); onBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <section className="adm-section">
      <div className="adm-section__row">
        <div>
          <h2 className="adm-section__h">{title}</h2>
          <p className="adm-hint">{hint}</p>
        </div>
        <button
          type="button"
          className="smy-cta"
          disabled={adding}
          onClick={() => inputRef.current && inputRef.current.click()}
        >
          {adding ? 'Replacing…' : 'Replace photograph'} <span className="smy-cta__arrow">↺</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => replace((e.target.files || [])[0])}
        />
      </div>
      <div className="adm-grid">
        <figure className="adm-thumb adm-thumb--tall">
          <img src={src} alt="Current portrait" />
        </figure>
      </div>
    </section>
  );
}

/* ---------- Reset (two-step, no native dialogs) ---------------------------- */

function ResetSection({ onReset }) {
  const [arm, setArm] = React.useState(false);
  return (
    <section className="adm-section adm-section--danger">
      <div className="adm-section__row">
        <div>
          <h2 className="adm-section__h">Start over</h2>
          <p className="adm-hint">
            Put every photograph and every line of text back the way the site first shipped.
            You still have to press “Save &amp; publish” afterwards.
          </p>
        </div>
        {arm ? (
          <span className="adm-armed">
            Are you sure?&nbsp;
            <button type="button" className="adm-linkbtn adm-linkbtn--danger" onClick={() => { onReset(); setArm(false); }}>Yes, reset everything</button>
            &nbsp;·&nbsp;
            <button type="button" className="adm-linkbtn" onClick={() => setArm(false)}>Keep my changes</button>
          </span>
        ) : (
          <button type="button" className="adm-linkbtn adm-linkbtn--danger" onClick={() => setArm(true)}>
            Reset to original…
          </button>
        )}
      </div>
    </section>
  );
}

window.AdminPage = AdminPage;
