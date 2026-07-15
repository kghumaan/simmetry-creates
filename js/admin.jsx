/* global React, useEdit, verifyPassword */

/* =========================================================================
   /admin — just the door. The editing itself happens in place on the live
   pages (js/edit.jsx): unlock here, land on the site, click anything to
   change it, publish from the bar at the bottom.
   ========================================================================= */

// Offline fallback only: when the publishing API is deployed, the password is
// checked server-side (ADMIN_PASSWORD env var) and this constant is ignored.
const ADMIN_PASSWORD = '1111';

function AdminPage({ navigate }) {
  const edit = useEdit();

  // Already unlocked — straight to the site in edit mode.
  React.useEffect(() => {
    if (edit.active) navigate('/jewelry');
  }, [edit.active]); // eslint-disable-line react-hooks/exhaustive-deps

  if (edit.active) return null;
  return <AdminGate onUnlock={(pw) => { edit.unlock(pw); navigate('/jewelry'); }} />;
}

function AdminGate({ onUnlock }) {
  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState(false);
  const [checking, setChecking] = React.useState(false);

  // The server is the authority when it exists; the hardcoded constant only
  // gates offline/local preview, where nothing can be published anyway.
  const submit = async (e) => {
    e.preventDefault();
    if (checking) return;
    setChecking(true);
    const res = await verifyPassword(value);
    setChecking(false);
    if (res === 'ok' || (res === 'no-api' && value === ADMIN_PASSWORD)) onUnlock(value);
    else setError(true);
  };

  return (
    <div className="adm-gate">
      <form className="adm-gate__card" onSubmit={submit}>
        <span className="caption caption--accent">— Studio admin</span>
        <h1 className="adm-gate__h">Hello, Ashish.</h1>
        <p className="smy-lede" style={{ fontSize: 15 }}>
          Enter the studio password, and the site becomes editable in place —
          click any text or photograph to change it, right where it is.
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
        <button type="submit" className="smy-cta smy-cta--solid" disabled={checking}>
          {checking ? 'Checking…' : 'Enter the studio'} <span className="smy-cta__arrow">→</span>
        </button>
      </form>
    </div>
  );
}

window.AdminPage = AdminPage;
