/* global React */
const { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } = React;

/* =========================================================================
   ModeContext + circular reveal
   ========================================================================= */

const ModeContext = createContext(null);

function readInitialMode() {
  // URL beats localStorage; "/jewelry/..." → jewelry, "/woodwork/..." → woodwork
  const hash = window.location.hash || '#/';
  const path = hash.replace(/^#/, '') || '/';
  if (path.startsWith('/woodwork')) return 'woodwork';
  if (path.startsWith('/jewelry')) return 'jewelry';
  const stored = localStorage.getItem('smy.mode');
  if (stored === 'woodwork' || stored === 'jewelry') return stored;
  return 'jewelry';
}

function ModeProvider({ children }) {
  const [mode, setModeState] = useState(readInitialMode);
  const overlayRef = useRef(null);
  const isAnimating = useRef(false);

  // Apply mode to <html> on mount + every change
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('smy.mode', mode);
  }, [mode]);

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
      layer.style.backgroundImage = `url(assets/emblem-${nextMode}.png)`;
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
  // We render a single emblem layer. Its background-image is set imperatively
  // in setMode() right before the reveal so the overlay shows only the
  // *incoming* mode's emblem during the animation.
  return (
    <div ref={ref} className="smy-reveal" aria-hidden="true">
      <div className="smy-reveal__inner">
        <div
          className="smy-reveal__emblem is-active"
          style={{ backgroundImage: `url(assets/emblem-${mode}.png)` }}
        />
      </div>
    </div>
  );
});

/* =========================================================================
   Hash router
   ========================================================================= */

function useRoute() {
  const [route, setRoute] = useState(() => {
    const h = window.location.hash || '#/';
    return h.replace(/^#/, '') || '/';
  });
  useEffect(() => {
    const onHash = () => setRoute((window.location.hash || '#/').replace(/^#/, '') || '/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return [route, (path) => { window.location.hash = path; }];
}

/* =========================================================================
   Top nav
   ========================================================================= */

function TopNav({ route, navigate }) {
  const { mode, setMode } = useMode();
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const toggleRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 80) { setHidden(false); lastY.current = y; return; }
      if (y > lastY.current + 6) setHidden(true);
      else if (y < lastY.current - 6) setHidden(false);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onToggle = (target, e) => {
    if (target === mode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMode(target, rect);
    // Update URL: keep "section" but swap mode prefix
    const sub = currentSection(route);
    if (sub === 'gallery') navigate('/' + target);
    else if (sub === 'about') navigate('/' + target + '/about');
    else navigate('/' + target);
  };

  const isOn = (path) => route === path || (path === '/' && (route === '/jewelry' || route === '/woodwork'));

  return (
    <header className={`smy-topnav ${hidden ? 'is-hidden' : ''}`}>
      <div className="smy-topnav__inner">
        <a className="smy-brand smy-brand--with-mark" href="#/" onClick={e => { e.preventDefault(); navigate('/'); }}>
          <span className="smy-brand__emblem" aria-hidden="true">
            <span
              className={`smy-brand__emblem-layer ${mode === 'jewelry' ? 'is-active' : ''}`}
              style={{ backgroundImage: 'url(assets/emblem-jewelry.png)' }}
            />
            <span
              className={`smy-brand__emblem-layer ${mode === 'woodwork' ? 'is-active' : ''}`}
              style={{ backgroundImage: 'url(assets/emblem-woodwork.png)' }}
            />
          </span>
          <span className="smy-brand__word">Simmetry<span className="dot">.</span>Creates</span>
        </a>
        <div className="smy-topnav__right">
          <div className="smy-modetoggle" ref={toggleRef}>
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
          <span className="smy-topnav__divider" />
          <nav className="smy-topnav__links">
            <a className="smy-navlink"
               href={'#/' + mode}
               aria-current={currentSection(route) === 'gallery' ? 'page' : undefined}
               onClick={e => { e.preventDefault(); navigate('/' + mode); }}>
              Gallery
            </a>
            <a className="smy-navlink"
               href={'#/' + mode + '/about'}
               aria-current={currentSection(route) === 'about' ? 'page' : undefined}
               onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>
              About
            </a>
            <a className="smy-navlink"
               href={'#/' + mode + '/about#contact'}
               onClick={e => {
                 e.preventDefault();
                 navigate('/' + mode + '/about');
                 setTimeout(() => {
                   const el = document.getElementById('contact');
                   if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                 }, 80);
               }}>
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

function currentSection(route) {
  if (route === '/' || route === '') return 'home';
  if (route === '/jewelry' || route === '/woodwork') return 'gallery';
  if (route.endsWith('/about')) return 'about';
  return 'home';
}

/* =========================================================================
   Footer
   ========================================================================= */

function Footer({ navigate }) {
  const { mode } = useMode();
  return (
    <footer className="smy-footer">
      <div className="smy-container">
        <div className="smy-footer__grid">
          <div>
            <div className="smy-footer__brand">
              Simmetry<span className="dot">.</span>Creates
            </div>
            <p className="smy-footer__tagline">
              Quiet objects, made slowly. A studio practice in fine jewelry and bespoke woodwork.
            </p>
          </div>
          <div className="smy-footer__col">
            <h6>Work</h6>
            <ul>
              <li><a href="#/jewelry" onClick={e => { e.preventDefault(); navigate('/jewelry'); }}>Jewelry</a></li>
              <li><a href="#/woodwork" onClick={e => { e.preventDefault(); navigate('/woodwork'); }}>Woodwork</a></li>
              <li><a href={'#/' + mode + '/about'} onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>Studio</a></li>
            </ul>
          </div>
          <div className="smy-footer__col">
            <h6>Practice</h6>
            <ul>
              <li><a href={'#/' + mode + '/about'} onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>About Ashish</a></li>
              <li><a href={'#/' + mode + '/about'} onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>Process</a></li>
              <li><a href={'#/' + mode + '/about'} onClick={e => { e.preventDefault(); navigate('/' + mode + '/about'); }}>Begin a commission</a></li>
            </ul>
          </div>
          <div className="smy-footer__col">
            <h6>Studio</h6>
            <ul>
              <li><a href="mailto:studio@simmetry.creates">studio@simmetry.creates</a></li>
              <li><a href="#">Mill Valley, California</a></li>
              <li><a href="#">By appointment</a></li>
            </ul>
          </div>
        </div>

        <div className="smy-footer__base">
          <span>© 2026 Ashish Savani · All work shown is one of one</span>
          <span>The studio observes a quiet month each January</span>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================================
   Tile (placeholder photography) — solid tonal blocks per brief
   ========================================================================= */

function Tile({ kind = 'portrait', label, tone = 0, corners = false, image, alt, fit = 'cover', children, className = '', style = {} }) {
  if (image) {
    return (
      <div
        className={`smy-tile smy-tile--${kind} smy-tile--photo ${corners ? 'smy-tile__corners' : ''} ${className}`}
        style={style}
      >
        <img className={`smy-tile__img smy-tile__img--${fit}`} src={image} alt={alt || label || ''} loading="lazy" />
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
  return (
    <div className="smy-emblem" style={{ width: size, height: size, ...style }}>
      <div
        className={`smy-emblem__layer ${mode === 'jewelry' ? 'is-active' : ''}`}
        style={{ backgroundImage: 'url(assets/emblem-jewelry.png)' }}
      />
      <div
        className={`smy-emblem__layer ${mode === 'woodwork' ? 'is-active' : ''}`}
        style={{ backgroundImage: 'url(assets/emblem-woodwork.png)' }}
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
  TopNav, Footer, Tile, Emblem, Reveal,
});
