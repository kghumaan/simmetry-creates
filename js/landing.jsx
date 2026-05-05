/* global React, useMode, Tile, Emblem, Reveal, SMY_DATA */
const { useEffect: useEffectL } = React;

function modeImages(mode) {
  return mode === 'jewelry' ? SMY_DATA.JEWELRY_IMAGES : SMY_DATA.WOODWORK_IMAGES;
}

/* =========================================================================
   LandingA — Editorial spread (full-bleed hero + asymmetric grid)
   ========================================================================= */
function LandingA({ navigate }) {
  const { mode } = useMode();
  const copy = SMY_DATA.HERO_COPY[mode];
  const images = modeImages(mode);
  const featured = images.slice(0, 6);
  const sections = SMY_DATA.SECTION_INTROS[mode];

  return (
    <div className="lA">
      {/* Hero — full-bleed image left, type right, hairline column */}
      <section className="lA-hero">
        <div className="lA-hero__image">
          <Tile kind="vhero" image={images[0]} corners />
          <div className="lA-hero__caption caption">
            <span>Studio frame · 2025 spring intake</span>
            <span className="num">01 / {String(images.length).padStart(2, '0')}</span>
          </div>
        </div>
        <div className="lA-hero__type">
          <div className="smy-eyebrow"><span className="num">04</span>Selected work · spring</div>
          <h1 className="smy-display">{copy.headline}</h1>
          <p className="smy-lede">{copy.lede}</p>
          <a className="smy-cta" href={'#/' + mode} onClick={e => { e.preventDefault(); navigate('/' + mode); }}>
            View the {mode === 'jewelry' ? 'jewelry' : 'woodwork'} <span className="smy-cta__arrow">→</span>
          </a>
          <div className="lA-hero__meta">
            <div><span className="caption">Studio</span><span className="num">Mill Valley, CA</span></div>
            <div><span className="caption">Practice</span><span>{mode === 'jewelry' ? 'Bench, single seat' : 'Two pieces at a time'}</span></div>
            <div><span className="caption">Wait</span><span className="num">{mode === 'jewelry' ? '14 weeks' : '6 months'}</span></div>
          </div>
        </div>
      </section>

      {/* Section 01 — selected work */}
      <section className="smy-container lA-section">
        <Reveal as="div" className="smy-secthead">
          <div>
            <div className="smy-secthead__num">— {sections.selected.num}</div>
            <h2>{sections.selected.title}</h2>
          </div>
          <p className="smy-lede" style={{ fontSize: 15, maxWidth: '38ch' }}>{sections.selected.body}</p>
        </Reveal>

        <div className="lA-grid">
          {featured.map((src, i) => (
            <Reveal key={src} delay={i * 60} className={`lA-card lA-card--${i % 4}`}>
              <a className="smy-piece" href={'#/' + mode} onClick={e => { e.preventDefault(); navigate('/' + mode); }}>
                <Tile kind="portrait" image={src} />
              </a>
            </Reveal>
          ))}
        </div>

        <div className="lA-section__more">
          <a className="smy-cta" href={'#/' + mode} onClick={e => { e.preventDefault(); navigate('/' + mode); }}>
            All {images.length} pieces <span className="smy-cta__arrow">→</span>
          </a>
        </div>
      </section>

      {/* Section 02 — practice (two-column editorial) */}
      <section className="smy-container lA-section lA-practice">
        <Reveal className="lA-practice__col">
          <div className="smy-eyebrow"><span className="num">{sections.process.num}</span>The practice</div>
          <h2 className="lA-practice__h">{sections.process.title}</h2>
          <p className="smy-lede">{sections.process.body}</p>
          <p className="smy-lede" style={{ marginTop: 16 }}>
            We do not photograph commissions until the client has lived with them. The pieces shown here have left the studio, returned to be photographed, and gone home again.
          </p>
          <a className="smy-cta" href={'#/' + mode + '/about'} onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>
            Begin a commission <span className="smy-cta__arrow">→</span>
          </a>
        </Reveal>
        <Reveal className="lA-practice__media" delay={120}>
          <Tile kind="tall" image={images[Math.min(2, images.length - 1)]} corners />
        </Reveal>
      </section>

      {/* Section 03 — materials, list-style */}
      <section className="smy-container lA-section lA-materials">
        <Reveal className="smy-secthead">
          <div>
            <div className="smy-secthead__num">— {sections.materials.num}</div>
            <h2>{sections.materials.title}</h2>
          </div>
          <p className="smy-lede" style={{ fontSize: 15, maxWidth: '38ch' }}>{sections.materials.body}</p>
        </Reveal>

        <div className="lA-mat__list">
          {(mode === 'jewelry'
            ? [
                ['01', 'Gold',         '18k & 22k',     'Fairmined or recycled, alloyed in studio'],
                ['02', 'Silver',       'Sterling & fine', 'Hand-finished, oxidized to order'],
                ['03', 'Stones',       'Cut, not heated', 'Sourced from family dealers in Jaipur'],
                ['04', 'Pearls',       'Freshwater, akoya', 'Drilled and knotted by hand'],
              ]
            : [
                ['01', 'Walnut',       'Western black',     'Air-dried, two seasons minimum'],
                ['02', 'White oak',    'Quarter-sawn',      'Milled within four hundred miles'],
                ['03', 'Cherry',       'Mill-end',          'Patinas to a deep amber over a year'],
                ['04', 'Brass & oil',  'Hardware only',     'Hand-rubbed, no lacquer'],
              ]
          ).map(([n, k, sub, body]) => (
            <Reveal key={n} className="lA-mat__row">
              <span className="lA-mat__num num">{n}</span>
              <div className="lA-mat__h">
                <h3>{k}</h3>
                <span className="caption" style={{ color: 'var(--fg-muted)' }}>{sub}</span>
              </div>
              <p className="lA-mat__body">{body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing — emblem + commission CTA */}
      <section className="lA-close">
        <div className="smy-container lA-close__inner">
          <Emblem size={160} />
          <h2 className="lA-close__h">A piece begins<br /><em>with a conversation.</em></h2>
          <a className="smy-cta smy-cta--solid" href={'#/' + mode + '/about'} onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>
            Begin a commission <span className="smy-cta__arrow">→</span>
          </a>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   LandingB — Index style. Quiet centered statement; pieces as a visual index.
   ========================================================================= */
function LandingB({ navigate }) {
  const { mode } = useMode();
  const copy = SMY_DATA.HERO_COPY[mode];
  const images = modeImages(mode);
  const featured = images.slice(0, 3);

  return (
    <div className="lB">
      <section className="lB-hero">
        <div className="smy-container lB-hero__inner">
          <div className="lB-hero__top">
            <span className="caption" style={{ color: 'var(--fg-muted)' }}>Spring intake · No. 04</span>
            <span className="smy-rule smy-rule--accent" />
            <span className="caption num" style={{ color: 'var(--fg-muted)' }}>EST. 2018</span>
          </div>
          <h1 className="smy-display lB-hero__h">{copy.headline}</h1>
          <p className="smy-lede lB-hero__lede">{copy.lede}</p>
        </div>

        <div className="lB-hero__band">
          <div className="lB-hero__band-l"><Tile kind="wide" image={images[1] || images[0]} corners /></div>
          <div className="lB-hero__band-c"><Emblem size={'min(220px, 24vw)'} /></div>
          <div className="lB-hero__band-r"><Tile kind="wide" image={images[2] || images[0]} corners /></div>
        </div>
      </section>

      <section className="smy-container lB-featured">
        <div className="lB-featured__head">
          <span className="caption caption--accent">— 01 Featured</span>
          <h2 className="lB-featured__h">Three pieces<br /><em>worth slowing for.</em></h2>
        </div>
        <div className="lB-featured__grid">
          {featured.map((src, i) => (
            <Reveal key={src} delay={i * 100} className="lB-feat">
              <Tile kind="tall" image={src} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="smy-container lB-index">
        <Reveal className="smy-secthead">
          <div>
            <div className="smy-secthead__num">— 02 The full register</div>
            <h2>Every piece, in order</h2>
          </div>
          <p className="smy-lede" style={{ fontSize: 15, maxWidth: '38ch' }}>
            A list, kept in the studio, of every piece. Each photograph below is one of one.
          </p>
        </Reveal>

        <div className="lB-thumbs">
          {images.map((src, i) => (
            <Reveal key={src} delay={(i % 6) * 40} className="lB-thumb">
              <Tile kind="square" image={src} />
            </Reveal>
          ))}
        </div>

        <div style={{ marginTop: 64 }}>
          <a className="smy-cta" href={'#/' + mode} onClick={e => { e.preventDefault(); navigate('/' + mode); }}>
            Open the gallery <span className="smy-cta__arrow">→</span>
          </a>
        </div>
      </section>

      <section className="lB-close">
        <div className="smy-container">
          <hr className="smy-rule" />
          <div className="lB-close__row">
            <h2 className="lB-close__h">Begin a conversation.</h2>
            <a className="smy-cta smy-cta--solid" href={'#/' + mode + '/about'} onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>
              Begin a commission <span className="smy-cta__arrow">→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   LandingC — Magazine cover. Heavy type, side-set metadata, single hero
   image, slow scroll into a pair of process notes.
   ========================================================================= */
function LandingC({ navigate }) {
  const { mode } = useMode();
  const copy = SMY_DATA.HERO_COPY[mode];
  const images = modeImages(mode);

  return (
    <div className="lC">
      <section className="lC-cover">
        <div className="lC-cover__inner smy-container">
          <aside className="lC-mast">
            <div className="caption" style={{ color: 'var(--fg-muted)' }}>Volume IV<br />Spring · 2026</div>
            <div className="lC-mast__rule" />
            <div className="caption" style={{ color: 'var(--fg-muted)' }}>{mode === 'jewelry' ? 'Cream edition' : 'Olive edition'}</div>
            <div className="lC-mast__emblem"><Emblem size={120} /></div>
            <div className="caption num" style={{ color: 'var(--fg-muted)' }}>No. 04 / 12</div>
          </aside>

          <div className="lC-type">
            <h1 className="lC-display">
              Quiet<br />
              <em>objects,</em><br />
              made<br />
              slowly.
            </h1>
            <p className="smy-lede lC-lede">{copy.lede}</p>
            <div className="lC-cta-row">
              <a className="smy-cta" href={'#/' + mode} onClick={e => { e.preventDefault(); navigate('/' + mode); }}>
                Open the {mode === 'jewelry' ? 'jewelry' : 'woodwork'} <span className="smy-cta__arrow">→</span>
              </a>
              <a className="smy-cta" href={'#/' + mode + '/about'} onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>
                Begin a commission <span className="smy-cta__arrow">→</span>
              </a>
            </div>
          </div>
        </div>
        <div className="lC-cover__base smy-container">
          <span className="caption">In this issue</span>
          <span className="smy-rule" />
          <span className="caption">Bench notes · Selected pieces · Materials · Studio</span>
        </div>
      </section>

      <section className="lC-plate">
        <Tile kind="hero" image={images[0]} corners />
        <div className="smy-container lC-plate__cap">
          <span className="caption num" style={{ color: 'var(--fg-muted)' }}>Plate I</span>
          <span>— A piece from the studio, photographed in north light.</span>
        </div>
      </section>

      <section className="smy-container lC-notes">
        <Reveal className="lC-note">
          <span className="caption caption--accent">— Bench note 01</span>
          <h3 className="lC-note__h">{mode === 'jewelry' ? 'Why we set, slowly.' : 'Why we wait, on lumber.'}</h3>
          <p className="smy-lede">
            {mode === 'jewelry'
              ? 'A stone wants to be seated, not gripped. Cut prongs from sheet, file them down, and the metal remembers the seat. The light follows.'
              : 'A board cut last winter is not the same board in May. We rest lumber in the loft for a season, weighed and stickered, before a single line is drawn.'}
          </p>
        </Reveal>
        <Reveal delay={120} className="lC-note">
          <span className="caption caption--accent">— Bench note 02</span>
          <h3 className="lC-note__h">{mode === 'jewelry' ? 'On the year mark.' : 'On signing the underside.'}</h3>
          <p className="smy-lede">
            {mode === 'jewelry'
              ? 'Each piece is stamped with the year only. No maker mark on the face. The mark belongs inside, where the wearer finds it after a while.'
              : 'Each piece is signed in pencil under the apron, with the year and the wood. A small thing, but it tells the next maker what they are looking at.'}
          </p>
        </Reveal>
      </section>

      <section className="smy-container lC-selected">
        <div className="lC-selected__head">
          <span className="caption caption--accent">— Selected this issue</span>
          <h2 className="lC-selected__h">In the order they left the {mode === 'jewelry' ? 'bench' : 'shop'}.</h2>
        </div>
        <div className="lC-selected__grid">
          {images.slice(0, 8).map((src, i) => (
            <Reveal key={src} delay={i * 40} className="lC-tile">
              <Tile kind="square" image={src} />
            </Reveal>
          ))}
        </div>
        <div style={{ marginTop: 64, display: 'flex', justifyContent: 'flex-end' }}>
          <a className="smy-cta" href={'#/' + mode} onClick={e => { e.preventDefault(); navigate('/' + mode); }}>
            Continue to the gallery <span className="smy-cta__arrow">→</span>
          </a>
        </div>
      </section>
    </div>
  );
}

window.LandingA = LandingA;
window.LandingB = LandingB;
window.LandingC = LandingC;
