/* global React, useContent, useEdit, E, EUpload, Lines, smyHas, smyInquiryVisible,
   smyImgSrc, smyImgStyle */
const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;

/* =========================================================================
   ModeContext + circular reveal
   ========================================================================= */

const ModeContext = createContext(null);

/* Logo for a mode — editable via branding.{jewelry,woodwork}Logo. */
function smyLogoFor(branding, m) {
  const key = m === 'woodwork' ? 'woodworkLogo' : 'jewelryLogo';
  return (branding && branding[key]) || `/assets/emblem-${m}.png`;
}

function readInitialMode() {
  // URL decides. (index.html's boot script has already normalized the path.)
  return routeMode(window.location.pathname || '/');
}

const WW_RE = /^\/(ww|woodwork)(\/|$)/;
const JW_RE = /^\/jewelry(\/|$)/;
function routeMode(route) {
  if (WW_RE.test(route)) return 'woodwork';
  if (JW_RE.test(route)) return 'jewelry';
  return 'jewelry'; // home `/` defaults to jewelry
}

function ModeProvider({ children }) {
  const [mode, setModeState] = useState(readInitialMode);
  const branding = useContent().content.branding;
  const brandingRef = useRef(branding);
  useEffect(() => { brandingRef.current = branding; }, [branding]);
  const overlayRef = useRef(null);
  const isAnimating = useRef(false);

  // Apply mode to <html> on mount + every change; the favicon follows the
  // mode's logo (the pre-sized favicon files when the logo is the default,
  // the uploaded image itself when it has been replaced).
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('smy.mode', mode);
    const fav = document.getElementById('smy-favicon');
    if (fav) {
      const logo = smyLogoFor(branding, mode);
      fav.href = logo === `/assets/emblem-${mode}.png` ? `/assets/favicon-${mode}.png` : logo;
    }
  }, [mode, branding]);

  // The reveal: paint overlay with the new theme, expand a circle from
  // the toggle origin, then commit the theme and hide the overlay.
  const setMode = useCallback((nextMode, originRect) => {
    if (nextMode === mode || isAnimating.current) return;

    const overlay = overlayRef.current;
    if (!overlay) {
      setModeState(nextMode);
      return;
    }

    const x = originRect ? originRect.left + originRect.width / 2 : window.innerWidth / 2;
    const y = originRect ? originRect.top + originRect.height / 2 : 60;
    const dx = Math.max(x, window.innerWidth - x);
    const dy = Math.max(y, window.innerHeight - y);
    const radius = Math.ceil(Math.hypot(dx, dy)) + 80;

    // Paint overlay with the *next* theme so it reveals the right colors,
    // and swap the single emblem layer to the incoming mode's image.
    overlay.setAttribute('data-mode', nextMode);
    overlay.style.setProperty('--reveal-x', x + 'px');
    overlay.style.setProperty('--reveal-y', y + 'px');
    overlay.style.setProperty('--reveal-radius', '0px');

    // Show only the incoming mode's emblem inside the reveal overlay.
    const layer = overlay.querySelector('.smy-reveal__emblem');
    if (layer) {
      layer.style.backgroundImage = `url(${smyLogoFor(brandingRef.current, nextMode)})`;
    }

    // Force a frame so initial 0px clip-path is registered before transition
    requestAnimationFrame(() => {
      overlay.classList.add('is-active');
      requestAnimationFrame(() => {
        overlay.style.setProperty('--reveal-radius', radius + 'px');
      });
    });

    isAnimating.current = true;
    document.documentElement.classList.add('is-revealing');

    const finish = () => {
      // Commit theme to <html>
      setModeState(nextMode);
      // Hide overlay
      overlay.classList.remove('is-active');
      overlay.style.setProperty('--reveal-radius', '0px');
      document.documentElement.classList.remove('is-revealing');
      isAnimating.current = false;
      overlay.removeEventListener('transitionend', finish);
    };
    overlay.addEventListener('transitionend', finish, { once: true });
    // Safety fallback
    setTimeout(() => { if (isAnimating.current) finish(); }, 1200);
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
      <ModeRevealOverlay ref={overlayRef} mode={mode} />
    </ModeContext.Provider>
  );
}

function useMode() { return useContext(ModeContext); }

const ModeRevealOverlay = React.forwardRef(function ModeRevealOverlay({ mode }, ref) {
  const branding = useContent().content.branding;
  // We render a single emblem layer. Its background-image is set imperatively
  // in setMode() right before the reveal so the overlay shows only the
  // *incoming* mode's emblem during the animation.
  return (
    <div ref={ref} className="smy-reveal" aria-hidden="true">
      <div className="smy-reveal__inner">
        <div
          className="smy-reveal__emblem is-active"
          style={{ backgroundImage: `url(${smyLogoFor(branding, mode)})` }}
        />
      </div>
    </div>
  );
});

/* =========================================================================
   Hash router
   ========================================================================= */

function useRoute() {
  // History-API router over clean paths (/jewelry, /woodwork/about, /admin).
  // The server rewrites every path to index.html (vercel.json), and
  // index.html's boot script normalizes `/`, /ww, and legacy #/ routes.
  const readPath = () => {
    const p = window.location.pathname || '/';
    return p.length > 1 ? (p.replace(/\/+$/, '') || '/') : p;
  };
  const [route, setRoute] = useState(readPath);
  useEffect(() => {
    // share.jsx has its own popstate listener for the meta tags.
    const onPop = () => setRoute(readPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const navigate = (path) => {
    if (path === window.location.pathname) return;
    window.history.pushState({}, '', path);
    setRoute(path);
    // pushState fires no event — nudge the share-meta updater by hand.
    if (window.SMY_updateShareMeta) window.SMY_updateShareMeta();
  };
  return [route, navigate];
}

/* =========================================================================
   Top nav
   ========================================================================= */

function TopNav({ route, navigate }) {
  const { mode, setMode } = useMode();
  // Hide the Contact link when the admin has emptied the whole inquiry
  // section — otherwise it points at an anchor that no longer exists.
  // (Always visible in edit mode so the section can be brought back.)
  const { content } = useContent();
  const edit = useEdit();
  const contactVisible = smyInquiryVisible(content.about) || edit.active;
  const branding = content.branding;
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setAtTop(y < 40);
      if (y < 80) { setHidden(false); lastY.current = y; return; }
      if (y > lastY.current + 6) setHidden(true);
      else if (y < lastY.current - 6) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu whenever the route changes (link tap, brand tap, etc.)
  useEffect(() => { setMenuOpen(false); }, [route]);

  // Lock body scroll while the panel is open so the page underneath doesn't drift.
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = menuOpen ? 'hidden' : prev;
    return () => { document.documentElement.style.overflow = prev; };
  }, [menuOpen]);

  // Close on Escape; close on viewport growing past mobile breakpoint.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    const onResize = () => { if (window.innerWidth > 720) setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);


  const onToggle = (target, e) => {
    if (target === mode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMode(target, rect);
    // Keep the reader roughly where they were, but bucket keys and piece
    // indices don't carry across modes — those land on the mode's own root.
    const sub = currentSection(route);
    const prefix = smyModePrefix(target);
    if (sub === 'about') navigate(prefix + '/about');
    else if (sub === 'gallery') navigate(prefix + '/all');
    else navigate(prefix);
  };

  const goContact = (e) => {
    e.preventDefault();
    navigate(smyModePrefix(mode) + '/about');
    setTimeout(() => {
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const section = currentSection(route);
  const cats = (content.categories && content.categories[mode]) || [];
  // On the home page the bar floats over the hero photograph until the
  // reader scrolls — white type, no ground. Everywhere else it is solid.
  const overHero = section === 'home' && atTop && !menuOpen;

  return (
    <header className={`smy-topnav ${hidden && !menuOpen ? 'is-hidden' : ''} ${menuOpen ? 'is-menu-open' : ''} ${overHero ? 'is-over-hero' : ''}`}>
      <div className="smy-topnav__inner">
        <div className="smy-topnav__left">
          <a className="smy-brand smy-brand--with-mark" href={smyModePrefix(mode)} onClick={e => { e.preventDefault(); navigate(smyModePrefix(mode)); }}>
            <span className="smy-brand__emblem" aria-hidden="true">
              <span
                className={`smy-brand__emblem-layer ${mode === 'jewelry' ? 'is-active' : ''}`}
                style={{ backgroundImage: `url(${smyLogoFor(branding, 'jewelry')})` }}
              />
              <span
                className={`smy-brand__emblem-layer ${mode === 'woodwork' ? 'is-active' : ''}`}
                style={{ backgroundImage: `url(${smyLogoFor(branding, 'woodwork')})` }}
              />
            </span>
            <span className="smy-brand__word">Simmetry<span className="dot">.</span>Creates</span>
          </a>
          {edit.active && (
            <span className="e-logobtn">
              <EUpload
                label={`Replace ${mode} logo`}
                onDone={(urls) => edit.setField(`branding.${mode === 'woodwork' ? 'woodworkLogo' : 'jewelryLogo'}`, urls[0])}
              />
            </span>
          )}
        </div>

        {/* Centre — every bucket, in the order they run on the home page.
            The list follows adds/removes/reorders live; when it outgrows the
            row it scrolls sideways rather than truncating. */}
        <nav className="smy-topnav__nav smy-topnav__inline" aria-label="Main">
          {cats.map((c, i) => (
            <a key={c.key + i}
               className="smy-navlink"
               href={smyCategoryHref(mode, c.key)}
               aria-current={smyRouteCategory(route) === c.key ? 'page' : undefined}
               onClick={e => { e.preventDefault(); navigate(smyCategoryHref(mode, c.key)); }}>
              {smyHas(c.label) ? c.label : c.key}
            </a>
          ))}
          <a className="smy-navlink"
             href={smyModePrefix(mode) + '/all'}
             aria-current={section === 'gallery' && !smyRouteCategory(route) ? 'page' : undefined}
             onClick={e => { e.preventDefault(); navigate(smyModePrefix(mode) + '/all'); }}>
            All work
          </a>
          <a className="smy-navlink"
             href={smyModePrefix(mode) + '/about'}
             aria-current={section === 'about' ? 'page' : undefined}
             onClick={e => { e.preventDefault(); navigate(smyModePrefix(mode) + '/about'); }}>
            Our story
          </a>
          {contactVisible && (
            <a className="smy-navlink"
               href={smyModePrefix(mode) + '/about#contact'}
               onClick={goContact}>
              Contact
            </a>
          )}
        </nav>

        <div className="smy-topnav__right">
          <div className="smy-modetoggle smy-topnav__inline">
            <button
              className="smy-modetoggle__btn"
              aria-pressed={mode === 'jewelry'}
              onClick={(e) => onToggle('jewelry', e)}
            >Jewelry</button>
            <span className="smy-modetoggle__sep" />
            <button
              className="smy-modetoggle__btn"
              aria-pressed={mode === 'woodwork'}
              onClick={(e) => onToggle('woodwork', e)}
            >Woodwork</button>
          </div>

          <button
            className={`smy-menubtn ${menuOpen ? 'is-open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="smy-mobile-panel"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span className="smy-menubtn__icon" aria-hidden="true">
              <span /><span /><span />
            </span>
          </button>
        </div>
      </div>

      <div
        id="smy-mobile-panel"
        className={`smy-panel ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="smy-panel__inner">
          <div className="smy-panel__group">
            <span className="smy-panel__label">Mode</span>
            <div className="smy-modetoggle smy-modetoggle--lg">
              <button
                className="smy-modetoggle__btn"
                aria-pressed={mode === 'jewelry'}
                onClick={(e) => onToggle('jewelry', e)}
              >Jewelry</button>
              <span className="smy-modetoggle__sep" />
              <button
                className="smy-modetoggle__btn"
                aria-pressed={mode === 'woodwork'}
                onClick={(e) => onToggle('woodwork', e)}
              >Woodwork</button>
            </div>
          </div>

          {cats.length > 0 && (
            <nav className="smy-panel__group smy-panel__nav">
              <span className="smy-panel__label">Collections</span>
              {cats.map((c, i) => (
                <a key={c.key + i}
                   className="smy-panel__link"
                   aria-current={smyRouteCategory(route) === c.key ? 'page' : undefined}
                   href={smyCategoryHref(mode, c.key)}
                   onClick={e => { e.preventDefault(); navigate(smyCategoryHref(mode, c.key)); }}>
                  {smyHas(c.label) ? c.label : c.key}
                </a>
              ))}
            </nav>
          )}

          <nav className="smy-panel__group smy-panel__nav">
            <span className="smy-panel__label">Pages</span>
            <a className="smy-panel__link"
               aria-current={section === 'home' ? 'page' : undefined}
               href={smyModePrefix(mode)}
               onClick={e => { e.preventDefault(); navigate(smyModePrefix(mode)); }}>
              Home
            </a>
            <a className="smy-panel__link"
               aria-current={section === 'gallery' && !smyRouteCategory(route) ? 'page' : undefined}
               href={smyModePrefix(mode) + '/all'}
               onClick={e => { e.preventDefault(); navigate(smyModePrefix(mode) + '/all'); }}>
              All work
            </a>
            <a className="smy-panel__link"
               aria-current={section === 'about' ? 'page' : undefined}
               href={smyModePrefix(mode) + '/about'}
               onClick={e => { e.preventDefault(); navigate(smyModePrefix(mode) + '/about'); }}>
              Our story
            </a>
            {contactVisible && (
              <a className="smy-panel__link"
                 href={smyModePrefix(mode) + '/about#contact'}
                 onClick={goContact}>
                Contact
              </a>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

/* Routes, per mode:
     /jewelry            home — hero, buckets, film
     /jewelry/all        every piece
     /jewelry/c/<key>    one bucket
     /jewelry/3          one piece
     /jewelry/about      about + contact
     /admin              the door into edit mode                          */
const SMY_CAT_RE = /^\/(?:jewelry|ww|woodwork)\/c\/([^/]+)$/;

function currentSection(route) {
  if (/^\/admin(\/|$)/.test(route)) return 'admin';
  if (route.endsWith('/about')) return 'about';
  if (/^\/(jewelry|ww|woodwork)\/\d+$/.test(route)) return 'product';
  if (SMY_CAT_RE.test(route)) return 'gallery';
  if (/^\/(jewelry|ww|woodwork)\/all$/.test(route)) return 'gallery';
  // Any bare mode root is the home page
  return 'home';
}

/* Decode a URL segment without letting a malformed escape (…/c/%zz, from a
   truncated link or a crawler) throw through render and blank the page. A
   segment we can't decode can't name a bucket, so the raw text is a fine
   answer — nothing will match it. */
function smyDecodeSegment(s) {
  try { return decodeURIComponent(s); } catch { return s; }
}

/* The bucket key a route points at, or null for /…/all and everything else. */
function smyRouteCategory(route) {
  const m = SMY_CAT_RE.exec(route || '');
  return m ? smyDecodeSegment(m[1]) : null;
}

function smyModePrefix(mode) {
  return mode === 'woodwork' ? '/woodwork' : '/jewelry';
}

/* The `c` segment keeps bucket keys from colliding with the numeric
   product routes (/jewelry/3). */
function smyCategoryHref(mode, key) {
  return smyModePrefix(mode) + '/c/' + encodeURIComponent(key);
}

function smyCountIn(products, key) {
  return (products || []).filter(p => p && p.category === key).length;
}

/* =========================================================================
   Footer
   ========================================================================= */

function Footer({ navigate }) {
  const { mode } = useMode();
  const F = useContent().content.footer;
  const editing = useEdit().active;
  const wwHref = '/woodwork';
  const aboutHref = (mode === 'woodwork' ? '/woodwork' : '/jewelry') + '/about';

  const go = (href) => (e) => { e.preventDefault(); navigate(href); };

  // Emptied fields drop their row; a column with no heading and no rows
  // drops entirely. In edit mode everything stays, with placeholders.
  // Links get an href; plain lines don't.
  const columns = [
    {
      heading: F.workHeading, headingPath: 'footer.workHeading',
      rows: [
        { label: F.workJewelry, path: 'footer.workJewelry', href: '/jewelry' },
        { label: F.workWoodwork, path: 'footer.workWoodwork', href: wwHref },
        { label: F.workStudio, path: 'footer.workStudio', href: aboutHref },
      ],
    },
    {
      heading: F.practiceHeading, headingPath: 'footer.practiceHeading',
      rows: [
        { label: F.practiceAbout, path: 'footer.practiceAbout', href: aboutHref },
        { label: F.practiceProcess, path: 'footer.practiceProcess', href: aboutHref },
        { label: F.practiceCommission, path: 'footer.practiceCommission', href: aboutHref },
      ],
    },
    {
      heading: F.studioHeading, headingPath: 'footer.studioHeading',
      rows: [
        // Only link mailto: when the text actually is a bare email address.
        { label: F.email, path: 'footer.email', mailto: /^\S+@\S+\.\S+$/.test(String(F.email || '').trim()) },
        { label: F.location, path: 'footer.location' },
        { label: F.hours, path: 'footer.hours' },
      ],
    },
  ]
    .map(col => ({ ...col, rows: col.rows.filter(r => editing || smyHas(r.label)) }))
    .filter(col => editing || smyHas(col.heading) || col.rows.length > 0);

  return (
    <footer className="smy-footer">
      <div className="smy-container">
        <div className="smy-footer__grid">
          <div>
            <div className="smy-footer__brand">
              Simmetry<span className="dot">.</span>Creates
            </div>
            {(editing || smyHas(F.tagline)) && (
              <p className="smy-footer__tagline"><E path="footer.tagline" ph="Tagline…" /></p>
            )}
          </div>
          {columns.map((col, ci) => (
            <div key={ci} className="smy-footer__col">
              {(editing || smyHas(col.heading)) && <h6><E path={col.headingPath} ph="Heading…" /></h6>}
              <ul>
                {col.rows.map((r, ri) => (
                  <li key={ri}>
                    {r.mailto && !editing
                      ? <a href={'mailto:' + String(r.label).trim()}>{r.label}</a>
                      : r.href && !editing
                        ? <a href={r.href} onClick={go(r.href)}>{r.label}</a>
                        : editing
                          ? <a href="#" onClick={e => e.preventDefault()}><E path={r.path} ph="Line…" /></a>
                          : <a href="#" onClick={e => e.preventDefault()}>{r.label}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {(editing || smyHas(F.baseLeft, F.baseRight)) && (
          <div className="smy-footer__base">
            <span>{editing ? <E path="footer.baseLeft" ph="Bottom line, left…" /> : (smyHas(F.baseLeft) ? F.baseLeft : '')}</span>
            <span>{editing ? <E path="footer.baseRight" ph="Bottom line, right…" /> : (smyHas(F.baseRight) ? F.baseRight : '')}</span>
          </div>
        )}
      </div>
    </footer>
  );
}

/* =========================================================================
   Tile (placeholder photography) — solid tonal blocks per brief
   ========================================================================= */

function Tile({ kind = 'portrait', label, tone = 0, corners = false, image, alt, fit = 'cover', children, className = '', style = {} }) {
  // `image` can be a plain URL or a crop object from the framing tool.
  const src = image ? smyImgSrc(image) : '';
  if (src) {
    return (
      <div
        className={`smy-tile smy-tile--${kind} smy-tile--photo ${corners ? 'smy-tile__corners' : ''} ${className}`}
        style={style}
      >
        <img
          className={`smy-tile__img smy-tile__img--${fit}`}
          style={smyImgStyle(image)}
          src={src}
          alt={alt || label || ''}
          loading="lazy"
        />
        {children}
      </div>
    );
  }
  const t = (tone % 6) / 6;
  const css = {
    ...style,
    '--tile-bg': `color-mix(in oklab, var(--photo-ground) ${100 - Math.round(t * 18)}%, var(--fg) ${Math.round(t * 18)}%)`,
    background: `color-mix(in oklab, var(--photo-ground) ${100 - Math.round(t * 18)}%, var(--fg) ${Math.round(t * 18)}%)`,
  };
  return (
    <div className={`smy-tile smy-tile--${kind} ${corners ? 'smy-tile__corners' : ''} ${className}`} style={css}>
      {label && <span className="smy-tile__mark">{label}</span>}
      {children}
    </div>
  );
}

/* =========================================================================
   Decorative emblem with cross-fade
   ========================================================================= */

function Emblem({ size = 240, style = {} }) {
  const { mode } = useMode();
  const branding = useContent().content.branding;
  return (
    <div className="smy-emblem" style={{ width: size, height: size, ...style }}>
      <div
        className={`smy-emblem__layer ${mode === 'jewelry' ? 'is-active' : ''}`}
        style={{ backgroundImage: `url(${smyLogoFor(branding, 'jewelry')})` }}
      />
      <div
        className={`smy-emblem__layer ${mode === 'woodwork' ? 'is-active' : ''}`}
        style={{ backgroundImage: `url(${smyLogoFor(branding, 'woodwork')})` }}
      />
    </div>
  );
}

/* =========================================================================
   Reveal-on-scroll
   ========================================================================= */

function Reveal({ children, as: Tag = 'div', delay = 0, className = '', ...rest }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setVis(true), delay);
        obs.disconnect();
      }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <Tag
      ref={ref}
      className={`smy-reveal-up ${vis ? 'is-in' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* =========================================================================
   Export
   ========================================================================= */

Object.assign(window, {
  ModeProvider, useMode,
  useRoute, currentSection,
  smyRouteCategory, smyModePrefix, smyCategoryHref, smyCountIn,
  TopNav, Footer, Tile, Emblem, Reveal,
});
