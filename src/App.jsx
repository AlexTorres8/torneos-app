import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout
import Header         from './components/layout/Header';
import Footer         from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Páginas públicas
import Home            from './pages/Home';
import SobreNosotros   from './pages/SobreNosotros';
import LigasFutsal     from './pages/futsal/LigasFutsal';
import CuadroFutsal    from './pages/futsal/CuadroFutsal';
import CuadroFutsal24H from './pages/futsal/CuadroFutsal24H';
import TorneosPadel    from './pages/padel/TorneosPadel';
import CuadroPadel     from './pages/padel/CuadroPadel';
import Legal           from './pages/Legal';
import NotFound        from './pages/NotFound';

// Panel admin (protegido)
import PanelAdmin from './pages/admin/PanelAdmin';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col relative">
        <Header />

        <main className="w-full flex-grow relative">
          <Routes>
            {/* ── Rutas públicas ── */}
            <Route path="/"                        element={<Home />} />
            <Route path="/nosotros"                element={<SobreNosotros />} />
            <Route path="/futsal"                  element={<LigasFutsal />} />
            <Route path="/torneo-futsal/:torneoId" element={<CuadroFutsal />} />
            <Route path="/torneo-24h/:torneoId"    element={<CuadroFutsal24H />} />
            <Route path="/padel"                   element={<TorneosPadel />} />
            <Route path="/torneo-padel/:torneoId"  element={<CuadroPadel />} />

            {/* ── Legal ── */}
            <Route path="/legal"          element={<Legal />} />
            <Route path="/legal/:seccion" element={<Legal />} />

            {/* ── Admin (protegido) ── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <PanelAdmin />
                </ProtectedRoute>
              }
            />

            {/* ── 404 — captura cualquier ruta no definida ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
