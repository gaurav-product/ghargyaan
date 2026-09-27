import { HashRouter, Route, Routes, Link } from 'react-router-dom';
import { AppProvider } from './state/AppContext';
import { AskProvider } from './state/AskContext';
import { AppShell } from './components/AppShell';
import { Landing } from './pages/Landing';
import { Home } from './pages/Home';
import { Ask } from './pages/Ask';
import { Explore } from './pages/Explore';
import { Guide } from './pages/Guide';
import { Wisdom } from './pages/Wisdom';
import { Saved } from './pages/Saved';
import { Profile } from './pages/Profile';
import { Emergency } from './pages/Emergency';
import { Privacy } from './pages/Privacy';
import { Research } from './pages/Research';

function NotFound() {
  return (
    <div className="card p-6">
      <h1 className="font-display text-2xl text-ink">Page not found</h1>
      <p className="mt-2 text-muted">That link doesn’t lead anywhere.</p>
      <Link to="/app" className="mt-3 inline-block font-semibold text-primary underline">
        Go to Home
      </Link>
    </div>
  );
}

/**
 * Hash routing keeps the app working on any static host (and inside sandboxed
 * previews) without server rewrite rules.
 */
export default function App() {
  return (
    <AppProvider>
      <AskProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<AppShell />}>
              <Route path="/app" element={<Home />} />
              <Route path="/ask" element={<Ask />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/guide/:id" element={<Guide />} />
              <Route path="/wisdom" element={<Wisdom />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/emergency" element={<Emergency />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/research" element={<Research />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </HashRouter>
      </AskProvider>
    </AppProvider>
  );
}
