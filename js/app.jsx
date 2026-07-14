/* global React, ReactDOM, ModeProvider, ContentProvider, TopNav, Footer, useRoute,
   currentSection, useMode, LandingA, LandingB, LandingC, Gallery, About, AdminPage,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSelect */
const { useEffect } = React;

const WW_PATH_RE = /^\/(ww|woodwork)(\/|$)/;
const JW_PATH_RE = /^\/jewelry(\/|$)/;

function PageRouter({ navigate, route, variant }) {
  const section = currentSection(route);
  // Sync mode from URL on every route change. Bare `/` defaults to jewelry.
  const { mode, setMode } = useMode();
  useEffect(() => {
    const targetMode = WW_PATH_RE.test(route) ? 'woodwork' : 'jewelry';
    if (mode !== targetMode) {
      document.documentElement.setAttribute('data-mode', targetMode);
      localStorage.setItem('smy.mode', targetMode);
      setMode(targetMode, null);
    }
    // scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [route]);

  if (section === 'about') return <About navigate={navigate} />;
  return <Gallery navigate={navigate} route={route} />;
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{}/*EDITMODE-END*/;

function App() {
  const [route, navigate] = useRoute();
  useTweaks(TWEAK_DEFAULTS);
  const isAdmin = currentSection(route) === 'admin';

  return (
    <ContentProvider>
      <ModeProvider>
        {!isAdmin && <TopNav route={route} navigate={navigate} />}
        <main className="smy-page">
          {isAdmin
            ? <AdminPage navigate={navigate} />
            : (
              <>
                <PageRouter navigate={navigate} route={route} />
                <Footer navigate={navigate} />
              </>
            )}
        </main>
      </ModeProvider>
    </ContentProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
