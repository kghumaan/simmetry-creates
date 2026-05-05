/* global React, useMode, Tile, Emblem, Reveal, SMY_DATA */

/* =========================================================================
   Gallery — collection grid, 12 pieces per mode
   ========================================================================= */

function Gallery({ navigate }) {
  const { mode } = useMode();
  const images = mode === 'jewelry' ? SMY_DATA.JEWELRY_IMAGES : SMY_DATA.WOODWORK_IMAGES;

  return (
    <div className="gal">
      <section className="smy-container gal-head">
        <div className="gal-head__top">
          <span className="caption num" style={{ color: 'var(--fg-muted)' }}>
            {images.length} pieces
          </span>
        </div>
        <h1 className="gal-head__h">
          {mode === 'jewelry' ? 'Jewelry.' : 'Woodwork.'}
        </h1>
      </section>

      <section className="smy-container gal-grid">
        {images.map((src, i) => (
          <Reveal key={src} delay={(i % 6) * 50} className="gal-card">
            <Tile kind="portrait" image={src} />
          </Reveal>
        ))}
      </section>

      <section className="smy-container gal-end">
        <hr className="smy-rule" />
        <div className="gal-end__row">
          <a className="smy-cta smy-cta--solid" href={'#/' + mode + '/about'} onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>
            Begin a commission <span className="smy-cta__arrow">→</span>
          </a>
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

  return (
    <div className="ab">
      {/* Bio header */}
      <section className="smy-container ab-head">
        <div className="ab-head__left">
          <span className="caption caption--accent">— About</span>
          <h1 className="ab-head__h">
            Ashish Savani.<br />
            <em>One bench, two crafts.</em>
          </h1>
          <p className="smy-lede ab-head__lede">
            I work alone, in a north-facing room above a tannery in Mill Valley.
            In the morning I cut metal; in the afternoon I cut wood. I keep both
            practices small on purpose. A piece is finished when it is right —
            not when it is due.
          </p>
        </div>
        <div className="ab-head__portrait">
          <Tile kind="vhero" image={SMY_DATA.ABOUT_IMAGE} alt="Ashish Savani" corners />
          <div className="caption" style={{ marginTop: 14, color: 'var(--fg-muted)' }}>
            <span className="num">No. 09</span> &nbsp;·&nbsp; A portrait, away from the bench
          </div>
        </div>
      </section>

      {/* Bio body — three editorial paragraphs flanking an emblem */}
      <section className="smy-container ab-bio">
        <Reveal className="ab-bio__col">
          <span className="caption" style={{ color: 'var(--fg-muted)' }}>— 01 Beginnings</span>
          <p className="smy-lede" style={{ marginTop: 16 }}>
            I learned to set stones from my grandfather, in a back room in Surat,
            in the summers between school years. He taught me that a stone has a
            seat it wants, and the maker's job is to find it. I held that idea
            without knowing it for a long time.
          </p>
        </Reveal>

        <Reveal className="ab-bio__center" delay={100}>
          <Emblem size={220} />
        </Reveal>

        <Reveal className="ab-bio__col" delay={180}>
          <span className="caption" style={{ color: 'var(--fg-muted)' }}>— 02 Wood, after metal</span>
          <p className="smy-lede" style={{ marginTop: 16 }}>
            I came to wood late, through a chair that needed mending. The chair
            took six months. The thing I learned in those six months — that a
            joint should not need glue to hold — has stayed with me through every
            piece since.
          </p>
        </Reveal>

        <Reveal className="ab-bio__col ab-bio__col--full" delay={240}>
          <span className="caption" style={{ color: 'var(--fg-muted)' }}>— 03 The studio, today</span>
          <p className="smy-lede" style={{ marginTop: 16, maxWidth: '64ch' }}>
            The studio takes on roughly eighteen pieces a year, split between
            the two practices. Two are in progress at any time. We open the diary
            three times — January, May, September — and accept what fits the
            quarter. The wait is honest because the work is not hurried.
          </p>
        </Reveal>
      </section>

      {/* Process strip — three steps, hairline-divided */}
      <section className="smy-container ab-process">
        <div className="smy-secthead">
          <div>
            <div className="smy-secthead__num">— 04 Process</div>
            <h2>How a commission unfolds</h2>
          </div>
          <p className="smy-lede" style={{ fontSize: 15, maxWidth: '38ch' }}>
            Three quiet steps over roughly four months. No deposits before the drawing is right.
          </p>
        </div>

        <div className="ab-process__steps">
          {[
            ['01', 'Conversation', 'A long letter, a phone call, sometimes a visit. We talk about the piece you want and the life it will live in. Two to three weeks.'],
            ['02', 'Drawing',      'A drawing on paper, by hand, with a written specification. Materials are quoted at this point. Two weeks for revisions.'],
            ['03', 'Bench',        mode === 'jewelry' ? 'Metal is cut, set, finished. Photographs are taken in north light before the piece is sent.' : 'Lumber is selected, milled, joined, finished. The piece is photographed under linen before delivery.'],
          ].map(([n, t, b]) => (
            <Reveal key={n} className="ab-step">
              <span className="ab-step__num num">{n}</span>
              <h3 className="ab-step__h">{t}</h3>
              <p className="ab-step__b">{b}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Inquiry form */}
      <section className="ab-inquiry" id="contact">
        <div className="smy-container ab-inquiry__inner">
          <div className="ab-inquiry__left">
            <span className="caption caption--accent">— 05 Inquiry</span>
            <h2 className="ab-inquiry__h">Begin a commission.</h2>
            <p className="smy-lede">
              Tell us, in your own words, what you have in mind. There is no form
              for the kind of piece that doesn't fit a form — write a paragraph
              and we will write back within a week.
            </p>
            <div className="ab-inquiry__meta">
              <div>
                <span className="caption" style={{ color: 'var(--fg-muted)' }}>By post</span>
                <p>Box 41, Mill Valley<br />California 94941</p>
              </div>
              <div>
                <span className="caption" style={{ color: 'var(--fg-muted)' }}>By letter</span>
                <p>studio@simmetry.creates</p>
              </div>
              <div>
                <span className="caption" style={{ color: 'var(--fg-muted)' }}>Diary opens</span>
                <p className="num">January · May · September</p>
              </div>
            </div>
          </div>

          <form className="ab-form" onSubmit={onSubmit}>
            {sent ? (
              <div className="ab-form__sent">
                <span className="caption caption--accent">— Received</span>
                <h3 className="ab-form__sent-h">Thank you, {form.name.split(' ')[0]}.</h3>
                <p className="smy-lede">
                  Your note is in the studio inbox. We read inquiries on Friday mornings; you will hear back within a week.
                </p>
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
                    We reply on Fridays · Within a week
                  </span>
                  <button type="submit" className="smy-cta smy-cta--solid">
                    Send the letter <span className="smy-cta__arrow">→</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}

window.Gallery = Gallery;
window.About = About;
