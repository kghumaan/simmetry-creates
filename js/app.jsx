/* global React, ReactDOM, ModeProvider, TopNav, Footer, useRoute, currentSection,
   useMode, LandingA, LandingB, LandingC, Gallery, About,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakSelect */
const { useEffect } = React;

function PageRouter({ navigate, route, variant }) {
  const section = currentSection(route);
  // Sync mode from URL on every route change (deep link → /woodwork loads olive)
  const { mode, setMode } = useMode();
  useEffect(() => {
    if (route.startsWith('/woodwork') && mode !== 'woodwork') {
      // No animation — direct visit. Just commit theme.
      document.documentElement.setAttribute('data-mode', 'woodwork');
      localStorage.setItem('smy.mode', 'woodwork');
      // setState through context to keep React in sync
      setMode('woodwork', null);
    } else if (route.startsWith('/jewelry') && mode !== 'jewelry') {
      document.documentElement.setAttribute('data-mode', 'jewelry');
      localStorage.setItem('smy.mode', 'jewelry');
      setMode('jewelry', null);
    }
    // scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [route]);

  if (section === 'gallery') return <Gallery navigate={navigate} />;
  if (section === 'about')   return <About   navigate={navigate} />;
  return <LandingA navigate={navigate} />;
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{}/*EDITMODE-END*/;

function App() {
  const [route, navigate] = useRoute();
  useTweaks(TWEAK_DEFAULTS);

  return (
    <ModeProvider>
      <TopNav route={route} navigate={navigate} />
      <main className="smy-page">
        <PageRouter navigate={navigate} route={route} />
        <Footer navigate={navigate} />
      </main>
    </ModeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
