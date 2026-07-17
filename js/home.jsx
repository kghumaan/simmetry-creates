/* global React, useMode, useContent, useEdit, E, EBtn, EUpload, Reveal, smyHas,
   smyModePrefix, smyCategoryHref, smyCountIn */

/* =========================================================================
   Home — the landing page for each mode.

     1. a full-bleed hero, roughly three quarters of the screen tall
     2. six buckets, edge to edge, each opening its own collection
     3. a full-height film band

   Everything here is editable in place. The buckets carry the one admin
   affordance that doesn't exist anywhere else: bulk upload, which turns a
   pile of photographs into products already filed under that bucket.
   ========================================================================= */

/* -------------------------------------------------------------------------
   Hero — image behind, type over a left-weighted scrim.
   ------------------------------------------------------------------------- */

function HomeHero({ navigate }) {
  const { mode } = useMode();
  const { content } = useContent();
  const edit = useEdit();
  const H = (content.home && content.home[mode]) || {};
  const base = `home.${mode}`;
  const exploreHref = smyModePrefix(mode) + '/all';

  return (
    <section className="hm-hero">
      {smyHas(H.heroImage) && (
        <img className="hm-hero__img" src={H.heroImage} alt="" />
      )}
      <div className="hm-hero__scrim" />
      <div className="hm-hero__inner">
        <div className="hm-hero__type">
          {(edit.active || smyHas(H.heroEyebrow)) && (
            <span className="hm-hero__eyebrow caption">
              <E path={`${base}.heroEyebrow`} ph="— Small heading…" />
            </span>
          )}
          {(edit.active || smyHas(H.heroTitle)) && (
            <h1 className="hm-hero__h">
              <E path={`${base}.heroTitle`} ph="Headline…" />
            </h1>
          )}
          {(edit.active || smyHas(H.heroLede)) && (
            <p className="hm-hero__lede">
              <E path={`${base}.heroLede`} ph="A sentence or two…" />
            </p>
          )}
          {(edit.active || smyHas(H.heroCta)) && (
            <a
              className="hm-btn"
              href={exploreHref}
              onClick={e => { e.preventDefault(); if (!edit.active) navigate(exploreHref); }}
            >
              <E path={`${base}.heroCta`} ph="Button label…" />
            </a>
          )}
        </div>
      </div>
      {edit.active && (
        <div className="hm-hero__edit e-row">
          <EUpload
            label="Replace hero photograph"
            onDone={(urls) => edit.setField(`${base}.heroImage`, urls[0])}
          />
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------
   Buckets — six tiles, full width, no gutters.
   ------------------------------------------------------------------------- */

function HomeBuckets({ navigate }) {
  const { mode } = useMode();
  const { content } = useContent();
  const edit = useEdit();
  const cats = (content.categories && content.categories[mode]) || [];
  const products = content.products[mode] || [];
  const G = content.gallery;
  const H = (content.home && content.home[mode]) || {};
  const homePath = `home.${mode}`;
  const listPath = `categories.${mode}`;
  const prodPath = `products.${mode}`;

  const moveCat = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= cats.length) return;
    edit.setField(listPath, cur => {
      const next = [...cur];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const removeCat = (i) =>
    edit.setField(listPath, cur => cur.filter((_, k) => k !== i));

  /* Keys have to be unique: products point at them, and the admin can't edit
     a key once set. Counting the list would re-mint a key already in use as
     soon as a bucket has been removed, so probe for a free one. */
  const addCat = () =>
    edit.setField(listPath, cur => {
      const list = cur || [];
      const taken = new Set(list.map(c => c.key));
      let n = list.length + 1;
      while (taken.has('bucket-' + n)) n++;
      return [...list, { key: 'bucket-' + n, label: '', blurb: '', image: '' }];
    });

  /* Bulk upload: every photograph becomes a product already filed under this
     bucket, and the first one fills an empty tile so the grid never shows a
     hole. Titles and details are added later on each product page. */
  const bulkAdd = (key, urls) => {
    edit.setField(prodPath, cur => [
      ...(cur || []),
      ...urls.map(url => ({
        category: key, image: url, title: '', description: '', price: '', details: [], images: [],
      })),
    ]);
    edit.setField(listPath, cur =>
      (cur || []).map(c => (c.key === key && !smyHas(c.image) ? { ...c, image: urls[0] } : c))
    );
  };

  return (
    <section className="hm-buckets">
      {(edit.active || smyHas(H.bucketsEyebrow, H.bucketsTitle)) && (
        <div className="hm-buckets__head">
          {(edit.active || smyHas(H.bucketsEyebrow)) && (
            <span className="caption caption--accent">
              <E path={`${homePath}.bucketsEyebrow`} ph="— Small heading…" />
            </span>
          )}
          {(edit.active || smyHas(H.bucketsTitle)) && (
            <h2 className="hm-buckets__h">
              <E path={`${homePath}.bucketsTitle`} ph="Section title…" />
            </h2>
          )}
        </div>
      )}

      <div className="hm-grid">
        {cats.map((c, i) => {
          const href = smyCategoryHref(mode, c.key);
          const n = smyCountIn(products, c.key);
          return (
            <Reveal key={c.key + i} delay={(i % 3) * 70} className="hm-bucket">
              <a
                className="hm-bucket__link"
                href={href}
                aria-label={`Open ${smyHas(c.label) ? c.label : c.key}`}
                onClick={e => { e.preventDefault(); if (!edit.active) navigate(href); }}
              >
                {smyHas(c.image)
                  ? <img className="hm-bucket__img" src={c.image} alt="" loading="lazy" />
                  : <span className="hm-bucket__empty" />}
                <span className="hm-bucket__scrim" />
                <span className="hm-bucket__body">
                  <span className="hm-bucket__label">
                    {edit.active
                      ? <E path={`${listPath}.${i}.label`} ph="Bucket name…" />
                      : (smyHas(c.label) ? c.label : c.key)}
                  </span>
                  {(edit.active || smyHas(c.blurb)) && (
                    <span className="hm-bucket__blurb">
                      {edit.active
                        ? <E path={`${listPath}.${i}.blurb`} ph="One short line…" />
                        : c.blurb}
                    </span>
                  )}
                  <span className="hm-bucket__cta">
                    {smyHas(G.exploreLabel) ? G.exploreLabel : 'Explore'}
                    <span className="hm-bucket__count num">{n}</span>
                  </span>
                </span>
              </a>

              {edit.active && (
                <div className="hm-bucket__edit">
                  <div className="e-cardbar hm-bucket__bar">
                    <EBtn title="Move earlier" onClick={() => moveCat(i, -1)}>←</EBtn>
                    <span className="num">{String(i + 1).padStart(2, '0')}</span>
                    <EBtn title="Move later" onClick={() => moveCat(i, 1)}>→</EBtn>
                    <EBtn title="Open this bucket" onClick={() => navigate(href)}>✎</EBtn>
                    <EBtn danger title="Remove this bucket (its pieces stay)" onClick={() => removeCat(i)}>×</EBtn>
                  </div>
                  <div className="e-row hm-bucket__uploads">
                    <EUpload
                      label="Tile photo"
                      onDone={(urls) => edit.setField(`${listPath}.${i}.image`, urls[0])}
                    />
                    <EUpload
                      label={`+ Bulk upload to ${smyHas(c.label) ? c.label : c.key}`}
                      multiple
                      onDone={(urls) => bulkAdd(c.key, urls)}
                    />
                  </div>
                  <p className="hm-bucket__hint">
                    Bulk upload files every photograph under this bucket at once —
                    open one afterwards to give it a title and details.
                  </p>
                </div>
              )}
            </Reveal>
          );
        })}

        {edit.active && (
          <div className="hm-bucket e-addtile hm-addbucket">
            <EBtn title="Add a bucket" onClick={addCat}>+ Add a bucket</EBtn>
            <p className="e-addtile__hint">
              A new bucket starts empty — give it a name, a tile photograph, and bulk upload its pieces.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------
   Film band — full width, full height. A real <video> once the studio has
   supplied one; until then the poster stands in.
   ------------------------------------------------------------------------- */

function HomeVideo({ navigate }) {
  const { mode } = useMode();
  const { content } = useContent();
  const edit = useEdit();
  const H = (content.home && content.home[mode]) || {};
  const base = `home.${mode}`;
  const hasVideo = smyHas(H.videoUrl);
  const aboutHref = smyModePrefix(mode) + '/about';

  return (
    <section className="hm-video">
      {hasVideo ? (
        <video
          className="hm-video__media"
          src={H.videoUrl}
          poster={smyHas(H.videoPoster) ? H.videoPoster : undefined}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : smyHas(H.videoPoster) ? (
        <img className="hm-video__media" src={H.videoPoster} alt="" loading="lazy" />
      ) : (
        <div className="hm-video__media hm-video__media--empty" />
      )}

      <div className="hm-video__scrim" />

      <div className="hm-video__inner">
        <div className="hm-video__type">
          {!hasVideo && !edit.active && (
            <span className="hm-video__placeholder caption">Film to follow</span>
          )}
          {(edit.active || smyHas(H.videoEyebrow)) && (
            <span className="caption hm-video__eyebrow">
              <E path={`${base}.videoEyebrow`} ph="— Small heading…" />
            </span>
          )}
          {(edit.active || smyHas(H.videoTitle)) && (
            <h2 className="hm-video__h">
              <E path={`${base}.videoTitle`} ph="Headline…" />
            </h2>
          )}
          {(edit.active || smyHas(H.videoLede)) && (
            <p className="hm-video__lede">
              <E path={`${base}.videoLede`} ph="A sentence or two…" />
            </p>
          )}
          {(edit.active || smyHas(H.videoCta)) && (
            <a
              className="hm-btn"
              href={aboutHref}
              onClick={e => { e.preventDefault(); if (!edit.active) navigate(aboutHref); }}
            >
              <E path={`${base}.videoCta`} ph="Button label…" />
            </a>
          )}
        </div>
      </div>

      {edit.active && (
        <div className="hm-video__edit">
          <div className="e-row">
            <EUpload
              label="Replace poster image"
              onDone={(urls) => edit.setField(`${base}.videoPoster`, urls[0])}
            />
          </div>
          <label className="hm-video__urlfield">
            <span className="caption">Film address (mp4)</span>
            <E path={`${base}.videoUrl`} ph="Paste a link to the film — e.g. /uploads/studio.mp4" />
          </label>
          <p className="hm-bucket__hint">
            Leave the address empty and the poster stands in. Once a film is
            uploaded to the studio host, paste its address here.
          </p>
        </div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------
   Home
   ------------------------------------------------------------------------- */

function Home({ navigate }) {
  return (
    <div className="hm">
      <HomeHero navigate={navigate} />
      <HomeBuckets navigate={navigate} />
      <HomeVideo navigate={navigate} />
    </div>
  );
}

Object.assign(window, { Home, HomeHero, HomeBuckets, HomeVideo });
