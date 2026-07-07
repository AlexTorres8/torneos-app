import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, Share2, Wifi } from 'lucide-react';
import { useRealtimeTorneo } from '../../hooks/useRealtimeTorneo';
import { BracketConLineas }  from '../../components/ui/BracketConLineas';
import { StandingsTable }    from '../../components/ui/StandingsTable';
import { MatchNode }         from '../../components/ui/MatchNode';
import { Skeleton }          from '../../components/ui/Skeleton';
import { SancionesTorneo }   from '../../components/ui/SancionesTorneo';
import { calcularStats }     from '../../hooks/useCalcStats';
import { ordenarClasificacion } from '../../lib/clasificacion';
import { fechaDiaMes }       from '../../lib/fecha';
import { bloquesJornadas }   from '../../lib/jornadas';
import { construirRondas, fasesPorDefecto } from '../../lib/esquemasPreview';

const NOMBRES_JORNADAS = { 1:'Jornada 1', 2:'Jornada 2', 3:'Jornada 3', 4:'Jornada 4', 5:'Jornada 5', 6:'Jornada 6' };

export default function CuadroFutsal() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const { torneo, grupos, partidos, cargando, error, recargar } = useRealtimeTorneo(torneoId);

  const clasificaciones = useMemo(() =>
    grupos.map((g) => ({
      ...g,
      equipos: ordenarClasificacion(
        g.grupo_participantes.map((gp) => ({ ...gp.participantes, stats: calcularStats(partidos, gp.participantes.id, 'futsal') })),
        partidos,
        'futsal'
      ),
    })),
    [grupos, partidos]
  );

  // Bloques de jornada ordenados por fecha; los partidos aplazados
  // salen en su propio bloque "Jornada X · Aplazada".
  const bloques = useMemo(() => bloquesJornadas(partidos), [partidos]);

  const playoffs = useMemo(() => partidos.filter(p => p.fase === 'playoffs').sort((a,b) => a.jornada - b.jornada), [partidos]);
  const cuartos  = useMemo(() => partidos.filter(p => p.fase === 'cuartos').sort((a,b) => a.jornada - b.jornada), [partidos]);
  const semis    = useMemo(() => partidos.filter(p => p.fase === 'semis').sort((a,b) => a.jornada - b.jornada), [partidos]);
  const finales  = useMemo(() => partidos.filter(p => p.fase === 'final'), [partidos]);

  const rondas = construirRondas(
    torneo,
    { playoffs, cuartos, semis, final: finales },
    fasesPorDefecto({ deporte: 'futsal', ...torneo })
  );

  const compartir = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: 'Torneo Fútbol Sala — Activa Fitness', url });
    else { navigator.clipboard.writeText(url); alert('¡Enlace copiado al portapapeles!'); }
  };

  if (error) return (
    <div className="max-w-md mx-auto mt-20 flex flex-col items-center gap-4 text-center px-4">
      <AlertCircle size={48} className="text-red-400" />
      <p className="text-red-400 font-bold">{error}</p>
      <button onClick={recargar} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
        <RefreshCw size={15} /> Reintentar
      </button>
      <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-white">← Volver</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
          ← Volver a torneos
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <Wifi size={11} /> En directo
          </div>
          <button
            onClick={compartir}
            className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            <Share2 size={14} /> Compartir
          </button>
        </div>
      </div>

      <div className="space-y-20">
        <section>
          <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-blue-500 pl-4">
            Clasificación
          </h2>
          {cargando
            ? <Skeleton.Tabla grupos={2} />
            : <div className="grid lg:grid-cols-2 gap-8">
                {clasificaciones.map(g => <StandingsTable key={g.id} grupo={g} equipos={g.equipos} variant="futsal" />)}
              </div>
          }
        </section>

        {!cargando && bloques.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-blue-500 pl-4">Calendario de Grupos</h2>
            <div className="grid gap-8">
              {bloques.map(({ jornada, aplazada, fecha, partidos: delBloque }) => (
                <div key={`${jornada}-${fecha}-${aplazada}`} className="bg-[#1e293b]/50 rounded-xl border border-slate-800 p-6 shadow-md">
                  <h3 className="text-blue-400 font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2 flex-wrap border-b border-slate-700/50 pb-3">
                    <span>🕒</span> {NOMBRES_JORNADAS[jornada] || `Jornada ${jornada}`}{aplazada ? ' · Aplazada' : ''}
                    {fecha && (
                      <span className="text-slate-500 font-bold normal-case tracking-normal">· {fechaDiaMes(fecha)}</span>
                    )}
                  </h3>
                  <div className="flex flex-wrap gap-5">
                    {delBloque.map(p => <MatchNode key={p.id} p={p} variant="futsal" />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <SancionesTorneo torneoId={torneoId} accent="blue" />

        <section>
          <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-blue-500 pl-4">
            Fase Final
          </h2>
          {cargando
            ? <Skeleton.Bracket rondas={3} />
            : <BracketConLineas rondas={rondas} variant="futsal" />
          }
        </section>
      </div>
    </div>
  );
}
