/* global React, useMode, useContent, useEdit, E, EBtn, EUpload, EImgAdjustBtn,
   Lines, smyHas, smyImgSrc, smyImgHas, smyInquiryVisible, Tile, Emblem, Reveal,
   smyModePrefix, smyCategoryHref, smyRouteCategory */

/* =========================================================================
   Gallery — the pieces in one bucket (/jewelry/c/necklaces), or all of them
   (/jewelry/all). Empty text disappears for visitors; in edit mode
   everything stays visible with placeholders, and the grid gains
   reorder/remove/add controls.

   Products live in one flat list per mode, so a filtered view carries each
   card's index into that list — every edit path and product URL is built
   from the real index, never the position on screen.
   ========================================================================= */

function Gallery({ navigate, route }) {
  const { mode } = useMode();
  const { content } = useContent();
  const edit = useEdit();
  const all = content.products[mode] || [];
  const cats = (content.categories && content.categories[mode]) || [];
  const G = content.gallery;
  const prefix = smyModePrefix(mode);
  const listPath = `products.${mode}`;

  // A key with no bucket behind it — a link to a bucket since removed or
  // renamed — is not a collection at all, so show the full listing rather
  // than a dead page headlined with the raw key from the URL.
  const routeKey = smyRouteCategory(route);
  const cat = routeKey ? cats.find(c => c.key === routeKey) : null;
  const catKey = cat ? routeKey : null;

  // [{ p, i }] — i is the index into the flat list.
  const shown = all
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => !catKey || (p && p.category === catKey));

  const title = cat
    ? (smyHas(cat.label) ? cat.label : cat.key)
    : (mode === 'jewelry' ? G.jewelryTitle : G.woodworkTitle);
  const titlePath = cat
    ? null
    : `gallery.${mode === 'jewelry' ? 'jewelryTitle' : 'woodworkTitle'}`;

  // Reordering swaps a card with its neighbour *in this view*, using both
  // real indices — so it behaves the same filtered or not.
  const moveProduct = (pos, dir) => {
    const a = shown[pos], b = shown[pos + dir];
    if (!a || !b) return;
    edit.setField(listPath, cur => {
      const next = [...cur];
      [next[a.i], next[b.i]] = [next[b.i], next[a.i]];
      return next;
    });
  };
  const removeProduct = (i) =>
    edit.setField(listPath, cur => cur.filter((_, k) => k !== i));
  const addProducts = (urls) =>
    edit.setField(listPath, cur => [
      ...(cur || []),
      ...urls.map(url => ({
        category: catKey || '', image: url,
        title: '', description: '', price: '', details: [], images: [],
      })),
    ]);

  return (
    <div className="gal">
      {(edit.active || smyHas(G.countSuffix) || smyHas(title)) && (
        <section className="gal-head">
          {(edit.active || smyHas(G.countSuffix)) && (
            <div className="gal-head__top">
              <span className="caption num" style={{ color: 'var(--fg-muted)' }}>
                {shown.length} <E path="gallery.countSuffix" ph="pieces" />
              </span>
            </div>
          )}
          {(edit.active || smyHas(title)) && (
            <h1 className="gal-head__h">
              {titlePath ? <E path={titlePath} ph="Page title…" /> : title}
            </h1>
          )}
        </section>
      )}

      {/* The collections live in the top bar only — repeating them here read
          as a second, stale menu. */}

      <section className="gal-grid">
        {shown.map(({ p, i }, pos) => {
          const href = prefix + '/' + i;
          return (
            <Reveal key={smyImgSrc(p.image) + i} delay={(pos % 6) * 50} className="gal-card">
              <a
                className="gal-card__link"
                href={href}
                aria-label={`Open ${smyHas(p.title) ? p.title : 'piece ' + (i + 1)}`}
                onClick={(e) => { e.preventDefault(); navigate(href); }}
              >
                <Tile kind="portrait" image={p.image} />
              </a>
              {smyHas(p.title) && (
                <span className="gal-card__name">{p.title}</span>
              )}
              {edit.active && (
                <div className="e-cardbar">
                  <EBtn title="Move earlier" onClick={() => moveProduct(pos, -1)}>←</EBtn>
                  <span className="num">{String(i + 1).padStart(2, '0')}</span>
                  <EBtn title="Move later" onClick={() => moveProduct(pos, 1)}>→</EBtn>
                  <EImgAdjustBtn
                    value={p.image}
                    ratio={4 / 5}
                    title="Crop & zoom this photo"
                    onChange={(v) => edit.setField(`${listPath}.${i}.image`, v)}
                  />
                  <EBtn title="Open to edit details" onClick={() => navigate(href)}>✎</EBtn>
                  <EBtn danger title="Remove this piece" onClick={() => removeProduct(i)}>×</EBtn>
                </div>
              )}
            </Reveal>
          );
        })}
        {edit.active && (
          <div className="gal-card e-addtile">
            <EUpload label="+ Add photographs" multiple onDone={addProducts} />
            <p className="e-addtile__hint">
              {catKey
                ? 'New pieces land at the end of this bucket — open one to give it a title, details, and a price.'
                : 'New pieces land at the end with no bucket — open one to file it and give it a title.'}
            </p>
          </div>
        )}
      </section>

      {shown.length === 0 && !edit.active && smyHas(G.emptyBucket) && (
        <section className="smy-container gal-empty">
          <p className="smy-lede">{G.emptyBucket}</p>
        </section>
      )}

      {(edit.active || smyHas(G.ctaLabel)) && (
        <section className="smy-container gal-end">
          <hr className="smy-rule" />
          <div className="gal-end__row">
            <a className="smy-cta smy-cta--solid" href={prefix + '/about'} onClick={e => { e.preventDefault(); navigate(prefix + '/about'); }}>
              <E path="gallery.ctaLabel" ph="Button label…" /> <span className="smy-cta__arrow">→</span>
            </a>
          </div>
        </section>
      )}
    </div>
  );
}

/* =========================================================================
   Product page — /jewelry/3, /woodwork/0. Thumbnails run down the left, the
   selected photograph fills the stage beside them, and the title,
   description, specs and price sit in the right column. In edit mode every
   field is editable in place; detail lines and angle photos can be added.
   ========================================================================= */

function ProductPage({ navigate, route }) {
  const { mode } = useMode();
  const { content } = useContent();
  const edit = useEdit();
  const products = content.products[mode] || [];
  const cats = (content.categories && content.categories[mode]) || [];
  const prefix = smyModePrefix(mode);

  const m = (route || '').match(/^\/(?:jewelry|ww|woodwork)\/(\d+)$/);
  const idx = m ? parseInt(m[1], 10) : -1;
  const product = idx >= 0 && idx < products.length ? products[idx] : null;
  const base = `products.${mode}.${idx}`;

  const [active, setActive] = React.useState(0);
  React.useEffect(() => { setActive(0); }, [route]);

  // A stale or hand-typed index falls back to the listing — the bare mode
  // prefix is the home hero now, which would drop the reader out of the work
  // entirely.
  React.useEffect(() => {
    if (!product) navigate(prefix + '/all');
  }, [product, prefix]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!product) return null;

  const angles = Array.isArray(product.images) ? product.images : [];
  // Each photo remembers where it lives (main image or which angle), so the
  // crop tool can write back to the right field even when the main image is
  // empty and the list starts with an angle.
  const photoRefs = [
    { val: product.image, angle: -1 },
    ...angles.map((val, k) => ({ val, angle: k })),
  ].filter(p => smyImgHas(p.val));
  const photos = photoRefs.map(p => p.val);
  const details = Array.isArray(product.details) ? product.details : [];
  const specs = edit.active
    ? details
    : details.filter(d => d && (smyHas(d.label) || smyHas(d.value)));
  const num = String(idx + 1).padStart(2, '0');
  const showTitle = edit.active || smyHas(product.title);

  // The bucket this piece is filed under drives the breadcrumb; an
  // unfiled piece falls back to the full list.
  const cat = smyHas(product.category)
    ? cats.find(c => c.key === product.category)
    : null;
  const backHref = cat ? smyCategoryHref(mode, cat.key) : prefix + '/all';
  const backLabel = cat
    ? (smyHas(cat.label) ? cat.label : cat.key)
    : `All ${mode === 'jewelry' ? 'jewelry' : 'woodwork'}`;

  const patch = (partial) => edit.setField(base, cur => ({ ...cur, ...partial }));

  return (
    <div className="pd">
      <section className="smy-container pd-crumb">
        <a className="pd-back caption" href={backHref} onClick={e => { e.preventDefault(); navigate(backHref); }}>
          ← {backLabel}
        </a>
      </section>

      <section className="smy-container pd-main">
        <div className="pd-media">
          <div className="pd-gallery">
            {(photos.length > 1 || edit.active) && (
              <div className="pd-thumbs" role="group" aria-label="More photographs">
                {photoRefs.map((ref, i) => (
                  <span key={smyImgSrc(ref.val).slice(0, 80) + i} className="pd-thumbwrap">
                    <button
                      type="button"
                      className={`pd-thumb ${i === active ? 'is-active' : ''}`}
                      aria-label={`Photograph ${i + 1}`}
                      aria-pressed={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => setActive(i)}
                    >
                      <img src={smyImgSrc(ref.val)} alt="" loading="lazy" />
                    </button>
                    {edit.active && ref.angle >= 0 && (
                      <EBtn danger title="Remove this angle" onClick={() => {
                        setActive(0);
                        patch({ images: angles.filter((_, k) => k !== ref.angle) });
                      }}>×</EBtn>
                    )}
                  </span>
                ))}
                {edit.active && (
                  <span className="pd-thumbwrap pd-thumbwrap--add">
                    <EUpload label="+ Angles" multiple onDone={(urls) => patch({ images: [...angles, ...urls] })} />
                  </span>
                )}
              </div>
            )}

            <div className="pd-stage">
              <Tile kind="vhero" image={photos[active] || product.image} alt={smyHas(product.title) ? product.title : `Piece No. ${num}`} corners />
            </div>
          </div>

          {edit.active && (
            <div className="e-row">
              <EUpload label="Replace main photograph" onDone={(urls) => { patch({ image: urls[0] }); setActive(0); }} />
              {photoRefs[active] && (
                <EImgAdjustBtn
                  value={photoRefs[active].val}
                  ratio={3 / 4}
                  title="Crop & zoom the photo on the stage"
                  onChange={(v) => {
                    const ref = photoRefs[active];
                    if (ref.angle < 0) patch({ image: v });
                    else patch({ images: angles.map((a, k) => (k === ref.angle ? v : a)) });
                  }}
                >⤢ Crop &amp; zoom</EImgAdjustBtn>
              )}
            </div>
          )}
        </div>

        <div className="pd-info">
          <span className="caption caption--accent">
            — No. {num} · {cat ? (smyHas(cat.label) ? cat.label : cat.key) : (mode === 'jewelry' ? 'Jewelry' : 'Woodwork')}
          </span>

          {edit.active && (
            <label className="pd-catpick">
              <span className="caption" style={{ color: 'var(--fg-muted)' }}>Bucket</span>
              <select
                className="smy-input"
                value={product.category || ''}
                onChange={(e) => patch({ category: e.target.value })}
              >
                <option value="">— No bucket —</option>
                {cats.map((c, i) => (
                  <option key={c.key + i} value={c.key}>
                    {smyHas(c.label) ? c.label : c.key}
                  </option>
                ))}
              </select>
            </label>
          )}
          {showTitle && (
            <h1 className="pd-title"><E path={`${base}.title`} ph="Title…" /></h1>
          )}
          {!showTitle && <h1 className="pd-title">Piece No. {num}</h1>}
          {(edit.active || smyHas(product.description)) && (
            <p className="smy-lede pd-desc"><E path={`${base}.description`} ph="A few sentences about this piece…" /></p>
          )}

          {(specs.length > 0 || edit.active || smyHas(product.price)) && (
            <dl className="pd-specs">
              {specs.map((d, i) => (
                <div className="pd-spec" key={i}>
                  <dt className="caption">
                    <E path={`${base}.details.${i}.label`} ph="Label…" />
                  </dt>
                  <dd>
                    <E path={`${base}.details.${i}.value`} ph="Value…" />
                    {edit.active && (
                      <EBtn danger title="Remove this line" onClick={() =>
                        patch({ details: details.filter((_, k) => k !== i) })
                      }>×</EBtn>
                    )}
                  </dd>
                </div>
              ))}
              {(edit.active || smyHas(product.price)) && (
                <div className="pd-spec pd-spec--price">
                  <dt className="caption">Price</dt>
                  <dd><E path={`${base}.price`} ph="Optional — e.g. On request" /></dd>
                </div>
              )}
              {edit.active && (
                <div className="e-row">
                  <EBtn title="Add a detail line" onClick={() =>
                    patch({ details: [...details, { label: '', value: '' }] })
                  }>+ Add a detail line</EBtn>
                </div>
              )}
            </dl>
          )}

          <div className="pd-cta">
            <a className="smy-cta smy-cta--solid" href={prefix + '/about'} onClick={e => { e.preventDefault(); navigate(prefix + '/about'); }}>
              {smyHas(content.gallery.ctaLabel) ? content.gallery.ctaLabel : 'Begin a commission'} <span className="smy-cta__arrow">→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   About / Contact — founder bio + inquiry form on one page
   ========================================================================= */

function About({ navigate }) {
  const { mode } = useMode();
  const { content } = useContent();
  const edit = useEdit();
  const A = content.about;
  const [form, setForm] = React.useState({
    name: '', email: '', project: 'jewelry', message: ''
  });
  const [sent, setSent] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState(null);

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending || edit.active) return;
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSending(true);
    setSendError(null);
    let ok = false;
    try {
      const r = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      ok = r.ok;
    } catch { ok = false; }
    setSending(false);
    if (ok) setSent(true);
    else setSendError(
      `The letter could not be sent just now. Write to us directly at ${A.emailValue || 'the studio email'}, or try again in a moment — nothing you typed has been lost.`
    );
  };

  // A fresh load of /…/about#contact can't use native anchor scrolling —
  // the #contact element doesn't exist until React renders it.
  React.useEffect(() => {
    if (window.location.hash !== '#contact') return;
    const t = setTimeout(() => {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ block: 'start' });
    }, 150);
    return () => clearTimeout(t);
  }, []);

  // In edit mode every block stays visible (with placeholders); for
  // visitors, empty blocks collapse.
  const allBios = Array.isArray(A.bios) ? A.bios : [];
  const bios = allBios
    .map((b, idx) => ({ ...b, idx }))
    .filter(b => edit.active || smyHas(b.label, b.body));

  const allSteps = Array.isArray(A.steps) ? A.steps : [];
  const steps = allSteps
    .map((s, idx) => ({ ...s, idx }))
    .filter(s => edit.active || smyHas(s.title, s.body));
  const showProcess = edit.active || smyHas(A.processNum, A.processTitle, A.processIntro) || steps.length > 0;

  const metaBlocks = [
    { labelPath: 'about.postLabel', valuePath: 'about.postValue', label: A.postLabel, value: A.postValue },
    { labelPath: 'about.emailLabel', valuePath: 'about.emailValue', label: A.emailLabel, value: A.emailValue },
    { labelPath: 'about.diaryLabel', valuePath: 'about.diaryValue', label: A.diaryLabel, value: A.diaryValue, num: true },
  ].filter(m => edit.active || smyHas(m.label, m.value));
  const showInquiry = edit.active || smyInquiryVisible(A);

  const removeBio = (idx) => edit.setField('about.bios', cur => cur.filter((_, k) => k !== idx));
  const addBio = () => edit.setField('about.bios', cur => [
    ...(cur || []),
    { label: `— 0${(cur || []).length + 1} A new chapter`, body: '' },
  ]);
  const removeStep = (idx) => edit.setField('about.steps', cur => cur.filter((_, k) => k !== idx));
  const addStep = () => edit.setField('about.steps', cur => [...(cur || []), { title: '', body: '' }]);

  return (
    <div className="ab">
      {/* Bio header */}
      <section className="smy-container ab-head">
        <div className="ab-head__left">
          {(edit.active || smyHas(A.eyebrow)) && (
            <span className="caption caption--accent"><E path="about.eyebrow" ph="— Small heading…" /></span>
          )}
          {(edit.active || smyHas(A.title, A.titleEm)) && (
            <h1 className="ab-head__h">
              {(edit.active || smyHas(A.title)) && <E path="about.title" ph="Title, first line…" />}
              {(edit.active || (smyHas(A.title) && smyHas(A.titleEm))) && <br />}
              {(edit.active || smyHas(A.titleEm)) && <em><E path="about.titleEm" ph="Title, second line…" /></em>}
            </h1>
          )}
          {(edit.active || smyHas(A.lede)) && (
            <p className="smy-lede ab-head__lede"><E path="about.lede" ph="Intro paragraph…" /></p>
          )}
        </div>
        <div className="ab-head__portrait">
          <Tile kind="vhero" image={A.portrait} alt={A.title} corners />
          {edit.active && (
            <div className="e-row">
              <EUpload label="Replace portrait" onDone={(urls) => edit.setField('about.portrait', urls[0])} />
              <EImgAdjustBtn
                value={A.portrait}
                ratio={3 / 4}
                title="Crop & zoom the portrait"
                onChange={(v) => edit.setField('about.portrait', v)}
              >⤢ Crop</EImgAdjustBtn>
            </div>
          )}
          {(edit.active || smyHas(A.portraitCaption)) && (
            <div className="caption" style={{ marginTop: 14, color: 'var(--fg-muted)' }}>
              <span className="num">No. 09</span> &nbsp;·&nbsp; <E path="about.portraitCaption" ph="Caption…" />
            </div>
          )}
        </div>
      </section>

      {/* Bio body — editorial paragraphs flanking an emblem */}
      {(bios.length > 0 || edit.active) && (
        <section className="smy-container ab-bio">
          {bios.map((b, i) => (
            <React.Fragment key={b.idx}>
              {i === 1 && (
                <Reveal className="ab-bio__center" delay={100}>
                  <Emblem size={220} />
                </Reveal>
              )}
              <Reveal
                className={`ab-bio__col ${i === 2 ? 'ab-bio__col--full' : ''}`}
                delay={i * 90}
              >
                <span className="caption" style={{ color: 'var(--fg-muted)' }}>
                  <E path={`about.bios.${b.idx}.label`} ph="— Label…" />
                  {edit.active && <EBtn danger title="Remove this paragraph" onClick={() => removeBio(b.idx)}>×</EBtn>}
                </span>
                <p className="smy-lede" style={{ marginTop: 16, ...(i === 2 ? { maxWidth: '64ch' } : null) }}>
                  <E path={`about.bios.${b.idx}.body`} ph="Paragraph…" />
                </p>
              </Reveal>
            </React.Fragment>
          ))}
          {edit.active && (
            <div className="ab-bio__col e-row">
              <EBtn title="Add a story paragraph" onClick={addBio}>+ Add a paragraph</EBtn>
            </div>
          )}
        </section>
      )}

      {/* Process strip — steps, hairline-divided */}
      {showProcess && (
        <section className="smy-container ab-process">
          {(edit.active || smyHas(A.processNum, A.processTitle, A.processIntro)) && (
            <div className="smy-secthead">
              <div>
                {(edit.active || smyHas(A.processNum)) && (
                  <div className="smy-secthead__num"><E path="about.processNum" ph="— Small heading…" /></div>
                )}
                {(edit.active || smyHas(A.processTitle)) && (
                  <h2><E path="about.processTitle" ph="Section title…" /></h2>
                )}
              </div>
              {(edit.active || smyHas(A.processIntro)) && (
                <p className="smy-lede" style={{ fontSize: 15, maxWidth: '38ch' }}>
                  <E path="about.processIntro" ph="Section intro…" />
                </p>
              )}
            </div>
          )}

          {(steps.length > 0 || edit.active) && (
            <div className="ab-process__steps">
              {steps.map((s, i) => (
                <Reveal key={s.idx} className="ab-step">
                  <span className="ab-step__num num">{String(i + 1).padStart(2, '0')}</span>
                  {edit.active && <EBtn danger title="Remove this step" onClick={() => removeStep(s.idx)}>×</EBtn>}
                  <h3 className="ab-step__h"><E path={`about.steps.${s.idx}.title`} ph="Step title…" /></h3>
                  <p className="ab-step__b"><E path={`about.steps.${s.idx}.body`} ph="Step text…" /></p>
                </Reveal>
              ))}
              {edit.active && (
                <div className="ab-step e-row">
                  <EBtn title="Add a step" onClick={addStep}>+ Add a step</EBtn>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Inquiry form — the whole section (form included) drops out when
          every inquiry text field has been emptied in the admin */}
      {showInquiry && (
        <section className="ab-inquiry" id="contact">
          <div className="smy-container ab-inquiry__inner">
            <div className="ab-inquiry__left">
              {(edit.active || smyHas(A.inquiryEyebrow)) && (
                <span className="caption caption--accent"><E path="about.inquiryEyebrow" ph="— Small heading…" /></span>
              )}
              {(edit.active || smyHas(A.inquiryTitle)) && (
                <h2 className="ab-inquiry__h"><E path="about.inquiryTitle" ph="Section title…" /></h2>
              )}
              {(edit.active || smyHas(A.inquiryLede)) && (
                <p className="smy-lede"><E path="about.inquiryLede" ph="Section intro…" /></p>
              )}
              {metaBlocks.length > 0 && (
                <div className="ab-inquiry__meta">
                  {metaBlocks.map((mb, i) => (
                    <div key={i}>
                      <span className="caption" style={{ color: 'var(--fg-muted)' }}>
                        <E path={mb.labelPath} ph="Label…" />
                      </span>
                      <p className={mb.num ? 'num' : undefined}><E path={mb.valuePath} ph="Value…" /></p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form className="ab-form" onSubmit={onSubmit}>
              {sent && !edit.active ? (
                <div className="ab-form__sent">
                  <span className="caption caption--accent">— Received</span>
                  <h3 className="ab-form__sent-h">Thank you, {form.name.split(' ')[0]}.</h3>
                  {smyHas(A.sentBody) && <p className="smy-lede"><Lines text={A.sentBody} /></p>}
                  <button type="button" className="smy-cta" onClick={() => { setSent(false); setForm({ name:'', email:'', project:'jewelry', message:'' }); }}>
                    Write another <span className="smy-cta__arrow">→</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="ab-form__row2">
                    <label className="smy-field">
                      <span className="smy-field__label">Name</span>
                      <input className="smy-input" type="text" required value={form.name} onChange={update('name')} placeholder="Your name" />
                    </label>
                    <label className="smy-field">
                      <span className="smy-field__label">Email</span>
                      <input className="smy-input" type="email" required value={form.email} onChange={update('email')} placeholder="you@elsewhere.com" />
                    </label>
                  </div>

                  <div className="smy-field">
                    <span className="smy-field__label">Project type</span>
                    <div className="smy-radios">
                      {[
                        ['jewelry',  'Jewelry'],
                        ['woodwork', 'Woodwork'],
                        ['both',     'Both / unsure'],
                      ].map(([v, l]) => (
                        <label key={v}>
                          <input type="radio" name="project" value={v} checked={form.project === v} onChange={update('project')} />
                          {l}
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="smy-field">
                    <span className="smy-field__label">A few sentences about the piece</span>
                    <textarea className="smy-textarea" required value={form.message} onChange={update('message')} placeholder="Materials in mind, the room it will live in, the occasion, anything else." />
                  </label>

                  {sendError && <p className="ab-form__error">{sendError}</p>}

                  <div className="ab-form__foot">
                    <span className="caption" style={{ color: 'var(--fg-muted)' }}>
                      {(edit.active || smyHas(A.replyNote)) && <E path="about.replyNote" ph="Note next to the button…" />}
                    </span>
                    <button type="submit" className="smy-cta smy-cta--solid" disabled={sending || edit.active}>
                      {sending ? 'Sending…' : <E path="about.submitLabel" ph="Send" />} <span className="smy-cta__arrow">→</span>
                    </button>
                  </div>

                  {edit.active && (
                    <div className="e-sentpreview">
                      <span className="caption" style={{ color: 'var(--fg-muted)' }}>
                        Shown after a letter is sent:
                      </span>
                      <p className="smy-lede"><E path="about.sentBody" ph="Thank-you message…" /></p>
                    </div>
                  )}
                </>
              )}
            </form>
          </div>
        </section>
      )}
    </div>
  );
}

window.Gallery = Gallery;
window.ProductPage = ProductPage;
window.About = About;
