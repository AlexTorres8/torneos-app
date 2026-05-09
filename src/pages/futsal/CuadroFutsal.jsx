import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase';
import { SEO } from '../../components/seo/SEO';
import { BracketConLineas } from '../../components/ui/BracketConLineas';
import { StandingsTable } from '../../components/ui/StandingsTable';
import { calcularStats } from '../../hooks/useCalcStats';

// Esquemas placeholder para cuando aún no hay partidos de fase final creados
const ESQ_CUARTOS = [
  { id: 'c1', hora: '21:00', ubicacion: 'Pista Ext.', estado: 'pendiente', local: { nombre: '1º Grupo A' }, visitante: { nombre: '4º Grupo B' } },
  { id: 'c2', hora: '21:00', ubicacion: 'Pabellón',  estado: 'pendiente', local: { nombre: '2º Grupo B' }, visitante: { nombre: '3º Grupo A' } },
  { id: 'c3', hora: '22:00', ubicacion: 'Pabellón',  estado: 'pendiente', local: { nombre: '1º Grupo B' }, visitante: { nombre: '4º Grupo A' } },
  { id: 'c4', hora: '22:00', ubicacion: 'Pista Ext.', estado: 'pendiente', local: { nombre: '2º Grupo A' }, visitante: { nombre: '3º Grupo B' } },
];
const ESQ_SEMIS = [
  { id: 's1', hora: '21:00', ubicacion: 'Pabellón', estado: 'pendiente', local: { nombre: 'Ganador C1' }, visitante: { nombre: 'Ganador C2' } },
  { id: 's2', hora: '22:00', ubicacion: 'Pabellón', estado: 'pendiente', local: { nombre: 'Ganador C3' }, visitante: { nombre: 'Ganador C4' } },
];
const ESQ_FINAL = [{ id: 'f1', hora: '21:00', ubicacion: 'Pabellón', estado: 'pendiente', local: { nombre: 'Ganador Semi 1' }, visitante: { nombre: 'Ganador Semi 2' } }];

export default function CuadroFutsal() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const [grupos,        setGrupos]        = useState([]);
  const [partidos,      setPartidos]      = useState([]);
  const [cargando,      setCargando]      = useState(true);
  const [error,         setError]         = useState('');
  const [nombreTorneo,  setNombreTorneo]  = useState('');

  useEffect(() => {
    if (!torneoId) return;
    supabase.from('torneos').select('nombre').eq('id', torneoId).single()
      .then(({ data }) => { if (data) setNombreTorneo(data.nombre); });
  }, [torneoId]);

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
        .select('id, estado, ubicacion, puntuacion_local, puntuacion_visitante, fase, jornada, hora, local_id, visitante_id, local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre)')
        .eq('torneo_id', torneoId),
    ]);

    if (e1 || e2) {
      setError('No se pudo cargar el torneo. Comprueba tu conexión e inténtalo de nuevo.');
      console.error('[CuadroFutsal]', e1?.message || e2?.message);
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
          stats: calcularStats(partidos, gp.participantes.id, 'futsal'),
        }))
        .sort((a, b) => b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf),
    })),
    [grupos, partidos]
  );

  const cuartos = useMemo(() => partidos.filter((p) => p.fase === 'cuartos').sort((a, b) => a.jornada - b.jornada), [partidos]);
  const semis   = useMemo(() => partidos.filter((p) => p.fase === 'semis').sort((a, b) => a.jornada - b.jornada), [partidos]);
  const finales = useMemo(() => partidos.filter((p) => p.fase === 'final'), [partidos]);

  // Rondas para BracketConLineas
  const rondas = [
    { label: 'Cuartos de Final', partidos: cuartos.length > 0 ? cuartos : ESQ_CUARTOS },
    { label: 'Semifinales',      partidos: semis.length > 0   ? semis   : ESQ_SEMIS   },
    { label: 'Gran Final',       partidos: finales.length > 0 ? finales : ESQ_FINAL   },
  ];

  if (cargando) return (
    <div className="text-center text-slate-400 mt-20 animate-pulse">Cargando torneo...</div>
  );

  if (error) return (
    <div className="max-w-md mx-auto mt-20 flex flex-col items-center gap-4 text-center px-4">
      <AlertCircle size={48} className="text-red-400" />
      <p className="text-red-400 font-bold">{error}</p>
      <button onClick={cargar} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
        <RefreshCw size={15} /> Reintentar
      </button>
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-white">← Volver</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      {nombreTorneo && (
        <SEO
          title={nombreTorneo}
          description={`Sigue en directo el torneo ${nombreTorneo}. Clasificaciones, resultados y cuadro de fase final.`}
          canonical={`/torneo-futsal/${torneoId}`}
        />
      )}
      <button onClick={() => navigate(-1)} className="mb-8 text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2">
        ← Volver a torneos
      </button>

      <div className="space-y-20">
        {/* Clasificación */}
        <section>
          <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-blue-500 pl-4">
            Clasificación
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {clasificaciones.map((g) => (
              <StandingsTable key={g.id} grupo={g} equipos={g.equipos} variant="futsal" />
            ))}
          </div>
        </section>

        {/* Fase final con bracket y líneas conectoras */}
        <section>
          <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-blue-500 pl-4">
            Fase Final
          </h2>
          <BracketConLineas rondas={rondas} variant="futsal" />
        </section>
      </div>
    </div>
  );
}
