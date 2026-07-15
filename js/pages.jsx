/* global React, useMode, useContent, Lines, smyHas, smyInquiryVisible, Tile, Emblem, Reveal */

/* =========================================================================
   Gallery — collection grid, driven by the editable content store.
   Any text field left empty in the admin disappears from the page; when a
   whole block is empty, the block's section is dropped entirely.
   ========================================================================= */

function Gallery({ navigate, route }) {
  const { mode } = useMode();
  const { content } = useContent();
  const images = content.images[mode] || [];
  const G = content.gallery;
  const title = mode === 'jewelry' ? G.jewelryTitle : G.woodworkTitle;
  const showCount = smyHas(G.countSuffix);
  const showTitle = smyHas(title);
  const prefix = mode === 'woodwork' ? '/ww' : '/jewelry';

  const itemMatch = (route || '').match(/^\/(?:jewelry|ww|woodwork)\/(\d+)\/?$/);
  const itemIndex = itemMatch ? Math.min(images.length - 1, Math.max(0, parseInt(itemMatch[1], 10))) : null;
  const itemImage = itemIndex !== null ? images[itemIndex] : null;

  const closeItem = React.useCallback(() => navigate(prefix), [navigate, prefix]);

  React.useEffect(() => {
    if (!itemImage) return;
    const onKey = (e) => { if (e.key === 'Escape') closeItem(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [itemImage, closeItem]);

  return (
    <div className="gal">
      {(showCount || showTitle) && (
        <section className="smy-container gal-head">
          {showCount && (
            <div className="gal-head__top">
              <span className="caption num" style={{ color: 'var(--fg-muted)' }}>
                {images.length} {G.countSuffix}
              </span>
            </div>
          )}
          {showTitle && <h1 className="gal-head__h">{title}</h1>}
        </section>
      )}

      <section className="smy-container gal-grid">
        {images.map((src, i) => {
          const href = prefix + '/' + i;
          return (
            <Reveal key={src + i} delay={(i % 6) * 50} className="gal-card">
              <a
                className="gal-card__link"
                href={href}
                aria-label={`Open piece ${i + 1}`}
                onClick={(e) => { e.preventDefault(); navigate(prefix + '/' + i); }}
              >
                <Tile kind="portrait" image={src} />
              </a>
            </Reveal>
          );
        })}
      </section>

      {smyHas(G.ctaLabel) && (
        <section className="smy-container gal-end">
          <hr className="smy-rule" />
          <div className="gal-end__row">
            <a className="smy-cta smy-cta--solid" href={'/' + mode + '/about'} onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>
              {G.ctaLabel} <span className="smy-cta__arrow">→</span>
            </a>
          </div>
        </section>
      )}

      {itemImage && (
        <div
          className="gal-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Piece ${itemIndex + 1}`}
          onClick={closeItem}
        >
          <button
            type="button"
            className="gal-lightbox__close"
            onClick={(e) => { e.stopPropagation(); closeItem(); }}
            aria-label="Close"
          >×</button>
          <img
            className="gal-lightbox__img"
            src={itemImage}
            alt={`${mode === 'jewelry' ? 'Jewelry' : 'Woodwork'} piece ${itemIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   About / Contact — founder bio + inquiry form on one page
   ========================================================================= */

function About({ navigate }) {
  const { mode } = useMode();
  const A = useContent().content.about;
  const [form, setForm] = React.useState({
    name: '', email: '', project: 'jewelry', message: ''
  });
  const [sent, setSent] = React.useState(false);

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSent(true);
  };

  // Empty content collapses: a bio column, a process step, or a contact block
  // vanishes when its fields are blank; a whole section vanishes when every
  // block inside it is blank.
  const bios = [
    { label: A.bio1Label, body: A.bio1 },
    { label: A.bio2Label, body: A.bio2 },
    { label: A.bio3Label, body: A.bio3 },
  ].filter(b => smyHas(b.label, b.body));

  const steps = [
    { title: A.step1Title, body: A.step1Body },
    { title: A.step2Title, body: A.step2Body },
    { title: A.step3Title, body: mode === 'jewelry' ? A.step3BodyJewelry : A.step3BodyWoodwork },
  ].filter(s => smyHas(s.title, s.body));
  const showProcess = smyHas(A.processNum, A.processTitle, A.processIntro) || steps.length > 0;

  const metaBlocks = [
    { label: A.postLabel, value: A.postValue },
    { label: A.emailLabel, value: A.emailValue },
    { label: A.diaryLabel, value: A.diaryValue, num: true },
  ].filter(m => smyHas(m.label, m.value));
  // Shared with TopNav so the Contact link disappears along with the section.
  const showInquiry = smyInquiryVisible(A);

  return (
    <div className="ab">
      {/* Bio header */}
      <section className="smy-container ab-head">
        <div className="ab-head__left">
          {smyHas(A.eyebrow) && <span className="caption caption--accent">{A.eyebrow}</span>}
          {smyHas(A.title, A.titleEm) && (
            <h1 className="ab-head__h">
              {smyHas(A.title) && A.title}
              {smyHas(A.title) && smyHas(A.titleEm) && <br />}
              {smyHas(A.titleEm) && <em>{A.titleEm}</em>}
            </h1>
          )}
          {smyHas(A.lede) && <p className="smy-lede ab-head__lede"><Lines text={A.lede} /></p>}
        </div>
        <div className="ab-head__portrait">
          <Tile kind="vhero" image={A.portrait} alt={A.title} corners />
          {smyHas(A.portraitCaption) && (
            <div className="caption" style={{ marginTop: 14, color: 'var(--fg-muted)' }}>
              <span className="num">No. 09</span> &nbsp;·&nbsp; {A.portraitCaption}
            </div>
          )}
        </div>
      </section>

      {/* Bio body — editorial paragraphs flanking an emblem */}
      {bios.length > 0 && (
        <section className="smy-container ab-bio">
          {bios.map((b, i) => (
            <React.Fragment key={i}>
              {i === 1 && (
                <Reveal className="ab-bio__center" delay={100}>
                  <Emblem size={220} />
                </Reveal>
              )}
              <Reveal
                className={`ab-bio__col ${i === 2 ? 'ab-bio__col--full' : ''}`}
                delay={i * 90}
              >
                {smyHas(b.label) && <span className="caption" style={{ color: 'var(--fg-muted)' }}>{b.label}</span>}
                {smyHas(b.body) && (
                  <p className="smy-lede" style={{ marginTop: 16, ...(i === 2 ? { maxWidth: '64ch' } : null) }}>
                    <Lines text={b.body} />
                  </p>
                )}
              </Reveal>
            </React.Fragment>
          ))}
        </section>
      )}

      {/* Process strip — steps, hairline-divided */}
      {showProcess && (
        <section className="smy-container ab-process">
          {smyHas(A.processNum, A.processTitle, A.processIntro) && (
            <div className="smy-secthead">
              <div>
                {smyHas(A.processNum) && <div className="smy-secthead__num">{A.processNum}</div>}
                {smyHas(A.processTitle) && <h2>{A.processTitle}</h2>}
              </div>
              {smyHas(A.processIntro) && (
                <p className="smy-lede" style={{ fontSize: 15, maxWidth: '38ch' }}>
                  <Lines text={A.processIntro} />
                </p>
              )}
            </div>
          )}

          {steps.length > 0 && (
            <div className="ab-process__steps">
              {steps.map((s, i) => (
                <Reveal key={i} className="ab-step">
                  <span className="ab-step__num num">{String(i + 1).padStart(2, '0')}</span>
                  {smyHas(s.title) && <h3 className="ab-step__h">{s.title}</h3>}
                  {smyHas(s.body) && <p className="ab-step__b"><Lines text={s.body} /></p>}
                </Reveal>
              ))}
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
              {smyHas(A.inquiryEyebrow) && <span className="caption caption--accent">{A.inquiryEyebrow}</span>}
              {smyHas(A.inquiryTitle) && <h2 className="ab-inquiry__h">{A.inquiryTitle}</h2>}
              {smyHas(A.inquiryLede) && <p className="smy-lede"><Lines text={A.inquiryLede} /></p>}
              {metaBlocks.length > 0 && (
                <div className="ab-inquiry__meta">
                  {metaBlocks.map((m, i) => (
                    <div key={i}>
                      {smyHas(m.label) && <span className="caption" style={{ color: 'var(--fg-muted)' }}>{m.label}</span>}
                      {smyHas(m.value) && <p className={m.num ? 'num' : undefined}><Lines text={m.value} /></p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form className="ab-form" onSubmit={onSubmit}>
              {sent ? (
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

                  <div className="ab-form__foot">
                    <span className="caption" style={{ color: 'var(--fg-muted)' }}>
                      {smyHas(A.replyNote) ? A.replyNote : ''}
                    </span>
                    <button type="submit" className="smy-cta smy-cta--solid">
                      {smyHas(A.submitLabel) ? A.submitLabel : 'Send'} <span className="smy-cta__arrow">→</span>
                    </button>
                  </div>
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
window.About = About;
