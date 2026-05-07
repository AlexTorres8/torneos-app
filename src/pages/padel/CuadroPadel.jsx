import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase';
import { MatchNode } from '../../components/ui/MatchNode';
import { StandingsTable } from '../../components/ui/StandingsTable';
import { calcularStats } from '../../hooks/useCalcStats';

// Las fechas de jornadas se gestionan desde la BD (campo hora del partido).
// Este objeto es solo un fallback de etiqueta para torneos históricos.
const NOMBRES_JORNADAS = {
  1: 'Jornada 1',
  2: 'Jornada 2',
  3: 'Jornada 3',
  4: 'Jornada 4',
  5: 'Jornada 5',
  6: 'Jornada 6',
};

const ESQ_PLAYOFFS  = [
  { id: 'p1', hora: '20:30', ubicacion: 'Pista N/V', local: { nombre: '2º Grupo A' }, visitante: { nombre: '3º Grupo C' } },
  { id: 'p2', hora: '20:30', ubicacion: 'Pista N/V', local: { nombre: '2º Grupo B' }, visitante: { nombre: '3º Grupo D' } },
  { id: 'p3', hora: '22:00', ubicacion: 'Pista N/V', local: { nombre: '2º Grupo C' }, visitante: { nombre: '3º Grupo A' } },
  { id: 'p4', hora: '22:00', ubicacion: 'Pista N/V', local: { nombre: '2º Grupo D' }, visitante: { nombre: '3º Grupo B' } },
];
const ESQ_CUARTOS = [
  { id: 'c1', hora: '20:00', ubicacion: 'Pista N/V', local: { nombre: '1º Grupo A' }, visitante: { nombre: 'G. Playoff 1' } },
  { id: 'c2', hora: '20:00', ubicacion: 'Pista N/V', local: { nombre: '1º Grupo C' }, visitante: { nombre: 'G. Playoff 2' } },
  { id: 'c3', hora: '22:00', ubicacion: 'Pista N/V', local: { nombre: '1º Grupo B' }, visitante: { nombre: 'G. Playoff 3' } },
  { id: 'c4', hora: '22:00', ubicacion: 'Pista N/V', local: { nombre: '1º Grupo D' }, visitante: { nombre: 'G. Playoff 4' } },
];
const ESQ_SEMIS = [
  { id: 's1', hora: '20:30', ubicacion: 'Pista N/V', local: { nombre: 'Ganador C1' }, visitante: { nombre: 'Ganador C2' } },
  { id: 's2', hora: '22:00', ubicacion: 'Pista N/V', local: { nombre: 'Ganador C3' }, visitante: { nombre: 'Ganador C4' } },
];
const ESQ_FINAL = { id: 'f1', hora: 'Por Conf.', ubicacion: 'Pista N/V', local: { nombre: 'Ganador Semi 1' }, visitante: { nombre: 'Ganador Semi 2' } };

export default function CuadroPadel() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const [grupos,   setGrupos]   = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');

  const cargar = async () => {
    setCargando(true);
    setError('');
    const [{ data: g, error: e1 }, { data: p, error: e2 }] = await Promise.all([
      supabase
        .from('grupos')
        .select('id, nombre, grupo_participantes(participantes(id, nombre))')
        .eq('torneo_id', torneoId),
      supabase
        .from('partidos')
        .select('id, estado, ubicacion, puntuacion_local, puntuacion_visitante, detalle_resultado, fase, jornada, hora, local_id, visitante_id, local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre)')
        .eq('torneo_id', torneoId),
    ]);

    if (e1 || e2) {
      setError('No se pudo cargar el torneo. Comprueba tu conexión e inténtalo de nuevo.');
      console.error('[CuadroPadel]', e1?.message || e2?.message);
    } else {
      setGrupos(g || []);
      setPartidos(p || []);
    }
    setCargando(false);
  };

  useEffect(() => { cargar(); }, [torneoId]);

  const clasificaciones = useMemo(() =>
    grupos.map((g) => ({
      ...g,
      equipos: g.grupo_participantes
        .map((gp) => ({
          ...gp.participantes,
          stats: calcularStats(partidos, gp.participantes.id, 'padel'),
        }))
        .sort((a, b) => b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf),
    })),
    [grupos, partidos]
  );

  const jornadasGrupos    = useMemo(() => [...new Set(partidos.filter((p) => p.fase === 'grupos').map((p) => p.jornada))].sort((a, b) => a - b), [partidos]);
  const partidosPlayoffs  = useMemo(() => partidos.filter((p) => p.fase === 'playoffs').sort((a, b) => a.jornada - b.jornada), [partidos]);
  const partidosCuartos   = useMemo(() => partidos.filter((p) => p.fase === 'cuartos').sort((a, b) => a.jornada - b.jornada), [partidos]);
  const partidosSemis     = useMemo(() => partidos.filter((p) => p.fase === 'semis').sort((a, b) => a.jornada - b.jornada), [partidos]);
  const partidoFinal      = useMemo(() => partidos.find((p) => p.fase === 'final'), [partidos]);

  if (cargando) return (
    <div className="text-center text-slate-400 mt-20 animate-pulse">Cargando torneo...</div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-20 flex flex-col items-center gap-4 text-center px-4">
      <AlertCircle size={48} className="text-red-400" />
      <p className="text-red-400 font-bold">{error}</p>
      <button
        onClick={cargar}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
      >
        <RefreshCw size={15} /> Reintentar
      </button>
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-white">← Volver</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      <button onClick={() => navigate(-1)} className="mb-8 text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2">
        ← Volver a torneos
      </button>

      <div className="space-y-24">
        {/* CLASIFICACIÓN */}
        <section>
          <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-blue-500 pl-4">
            Clasificación
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {clasificaciones.map((g) => (
              <StandingsTable key={g.id} grupo={g} equipos={g.equipos} variant="padel" />
            ))}
          </div>
        </section>

        {/* CALENDARIO GRUPOS */}
        {jornadasGrupos.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-blue-500 pl-4">
              Calendario de Grupos
            </h2>
            <div className="grid gap-8">
              {jornadasGrupos.map((jornada) => (
                <div key={jornada} className="bg-[#1e293b]/50 rounded-xl border border-slate-800 p-6 shadow-md">
                  <h3 className="text-blue-400 font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-3">
                    <span>🕒</span> {NOMBRES_JORNADAS[jornada] || `Jornada ${jornada}`}
                  </h3>
                  <div className="flex flex-wrap gap-5">
                    {partidos
                      .filter((p) => p.fase === 'grupos' && p.jornada === jornada)
                      .sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''))
                      .map((p) => <MatchNode key={p.id} p={p} variant="padel" />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FASE FINAL */}
        <section>
          <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-blue-500 pl-4">
            Fase Final
          </h2>
          <div className="overflow-x-auto pb-8">
            <div className="min-w-max">
              <div className="flex gap-12 mb-6">
                {['Playoffs (Previa)', 'Cuartos de Final', 'Semifinales'].map((label) => (
                  <div key={label} className="w-64 text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                  </div>
                ))}
                <div className="w-64 text-center">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Gran Final</span>
                </div>
              </div>
              <div className="flex gap-12 items-stretch">
                <div className="w-64 flex flex-col gap-6">
                  {(partidosPlayoffs.length > 0 ? partidosPlayoffs : ESQ_PLAYOFFS).map((x) => <MatchNode key={x.id} p={x} variant="padel" />)}
                </div>
                <div className="w-64 flex flex-col gap-6">
                  {(partidosCuartos.length > 0 ? partidosCuartos : ESQ_CUARTOS).map((x) => <MatchNode key={x.id} p={x} variant="padel" />)}
                </div>
                <div className="w-64 flex flex-col justify-between py-14">
                  {(partidosSemis.length > 0 ? partidosSemis : ESQ_SEMIS).map((x) => <MatchNode key={x.id} p={x} variant="padel" />)}
                </div>
                <div className="w-64 flex flex-col justify-center">
                  <MatchNode p={partidoFinal ?? ESQ_FINAL} variant="padel" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
