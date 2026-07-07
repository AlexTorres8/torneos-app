import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import ErrorBoundary  from './components/layout/ErrorBoundary';
import ScrollToTop    from './components/layout/ScrollToTop';
import Header         from './components/layout/Header';
import Footer         from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

const Home            = lazy(() => import('./pages/Home'));
const CalendarioPartidos = lazy(() => import('./pages/CalendarioPartidos'));
const SobreNosotros   = lazy(() => import('./pages/SobreNosotros'));
const LigasFutsal     = lazy(() => import('./pages/futsal/LigasFutsal'));
const CuadroFutsal    = lazy(() => import('./pages/futsal/CuadroFutsal'));
const CuadroFutsal24H = lazy(() => import('./pages/futsal/CuadroFutsal24H'));
const TorneosPadel    = lazy(() => import('./pages/padel/TorneosPadel'));
const CuadroPadel     = lazy(() => import('./pages/padel/CuadroPadel'));
const PanelAdmin      = lazy(() => import('./pages/admin/PanelAdmin'));
const Legal           = lazy(() => import('./pages/Legal'));
const NotFound        = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col relative">
          <ScrollToTop />
          <Header />

          <main className="w-full flex-grow relative">
            <Suspense fallback={<div className="flex-grow" />}>
              <Routes>
                <Route path="/"                        element={<Home />} />
                <Route path="/nosotros"                element={<SobreNosotros />} />
                <Route path="/calendario"              element={<CalendarioPartidos />} />
                <Route path="/futsal"                  element={<LigasFutsal />} />
                <Route path="/torneo-futsal/:torneoId" element={<CuadroFutsal />} />
                <Route path="/torneo-24h/:torneoId"    element={<CuadroFutsal24H />} />
                <Route path="/padel"                   element={<TorneosPadel />} />
                <Route path="/torneo-padel/:torneoId"  element={<CuadroPadel />} />
                <Route path="/legal"                   element={<Legal />} />
                <Route path="/legal/:seccion"          element={<Legal />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <PanelAdmin />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>
      </ErrorBoundary>
    </Router>
  );
}
