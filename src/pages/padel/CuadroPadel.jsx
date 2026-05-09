import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, Share2, Wifi } from 'lucide-react';
import { useRealtimeTorneo } from '../../hooks/useRealtimeTorneo';
import { BracketConLineas }  from '../../components/ui/BracketConLineas';
import { StandingsTable }    from '../../components/ui/StandingsTable';
import { MatchNode }         from '../../components/ui/MatchNode';
import { Skeleton }          from '../../components/ui/Skeleton';
import { calcularStats }     from '../../hooks/useCalcStats';

const ESQ_PLAYOFFS = [
  { id:'p1', hora:'20:30', ubicacion:'Pista 1', estado:'pendiente', local:{nombre:'2º Grupo A'}, visitante:{nombre:'3º Grupo C'} },
  { id:'p2', hora:'20:30', ubicacion:'Pista 2', estado:'pendiente', local:{nombre:'2º Grupo B'}, visitante:{nombre:'3º Grupo D'} },
  { id:'p3', hora:'22:00', ubicacion:'Pista 1', estado:'pendiente', local:{nombre:'2º Grupo C'}, visitante:{nombre:'3º Grupo A'} },
  { id:'p4', hora:'22:00', ubicacion:'Pista 2', estado:'pendiente', local:{nombre:'2º Grupo D'}, visitante:{nombre:'3º Grupo B'} },
];
const ESQ_CUARTOS = [
  { id:'c1', hora:'20:00', ubicacion:'Pista 1', estado:'pendiente', local:{nombre:'1º Grupo A'}, visitante:{nombre:'G. Playoff 1'} },
  { id:'c2', hora:'20:00', ubicacion:'Pista 2', estado:'pendiente', local:{nombre:'1º Grupo C'}, visitante:{nombre:'G. Playoff 2'} },
  { id:'c3', hora:'22:00', ubicacion:'Pista 1', estado:'pendiente', local:{nombre:'1º Grupo B'}, visitante:{nombre:'G. Playoff 3'} },
  { id:'c4', hora:'22:00', ubicacion:'Pista 2', estado:'pendiente', local:{nombre:'1º Grupo D'}, visitante:{nombre:'G. Playoff 4'} },
];
const ESQ_SEMIS = [
  { id:'s1', hora:'20:30', ubicacion:'Pista 1', estado:'pendiente', local:{nombre:'Ganador C1'}, visitante:{nombre:'Ganador C2'} },
  { id:'s2', hora:'22:00', ubicacion:'Pista 2', estado:'pendiente', local:{nombre:'Ganador C3'}, visitante:{nombre:'Ganador C4'} },
];
const ESQ_FINAL = [{ id:'f1', hora:'Por conf.', ubicacion:'Pista 1', estado:'pendiente', local:{nombre:'Ganador Semi 1'}, visitante:{nombre:'Ganador Semi 2'} }];

function ordenarPadel(equipos, partidos) {
  return [...equipos].sort((a, b) => {
    if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
    const pd = partidos.find(p =>
      p.fase === 'grupos' && p.estado === 'finalizado' &&
      ((p.local_id === a.id && p.visitante_id === b.id) || (p.local_id === b.id && p.visitante_id === a.id))
    );
    if (pd) {
      const esALocal = pd.local_id === a.id;
      const sA = esALocal ? pd.puntuacion_local : pd.puntuacion_visitante;
      const sB = esALocal ? pd.puntuacion_visitante : pd.puntuacion_local;
      if (sA !== sB) return sB - sA;
    }
    if (b.stats.dif !== a.stats.dif) return b.stats.dif - a.stats.dif;
    if ((b.stats.jdif ?? 0) !== (a.stats.jdif ?? 0)) return (b.stats.jdif ?? 0) - (a.stats.jdif ?? 0);
    return b.stats.gf - a.stats.gf;
  });
}

const NOMBRES_JORNADAS = { 1:'Jornada 1', 2:'Jornada 2', 3:'Jornada 3', 4:'Jornada 4', 5:'Jornada 5', 6:'Jornada 6' };

export default function CuadroPadel() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const { grupos, partidos, cargando, error, recargar } = useRealtimeTorneo(torneoId);

  const clasificaciones = useMemo(() =>
    grupos.map((g) => ({
      ...g,
      equipos: ordenarPadel(
        g.grupo_participantes.map((gp) => ({ ...gp.participantes, stats: calcularStats(partidos, gp.participantes.id, 'padel') })),
        partidos
      ),
    })),
    [grupos, partidos]
  );

  const jornadasGrupos = useMemo(() =>
    [...new Set(partidos.filter(p => p.fase === 'grupos').map(p => p.jornada))].sort((a,b) => a - b),
    [partidos]
  );

  const playoffs = useMemo(() => partidos.filter(p => p.fase === 'playoffs').sort((a,b) => a.jornada - b.jornada), [partidos]);
  const cuartos  = useMemo(() => partidos.filter(p => p.fase === 'cuartos').sort((a,b) => a.jornada - b.jornada), [partidos]);
  const semis    = useMemo(() => partidos.filter(p => p.fase === 'semis').sort((a,b) => a.jornada - b.jornada), [partidos]);
  const finales  = useMemo(() => partidos.filter(p => p.fase === 'final'), [partidos]);

  const rondas = [
    { label: 'Ronda Previa', partidos: playoffs.length > 0 ? playoffs : ESQ_PLAYOFFS },
    { label: 'Cuartos',      partidos: cuartos.length  > 0 ? cuartos  : ESQ_CUARTOS  },
    { label: 'Semifinales',  partidos: semis.length    > 0 ? semis    : ESQ_SEMIS    },
    { label: 'Gran Final',   partidos: finales.length  > 0 ? finales  : ESQ_FINAL    },
  ];

  const compartir = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: 'Torneo Pádel — Activa Fitness', url });
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
        <button onClick={() => navigate(-1)} className="text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2">
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
          <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-blue-500 pl-4">Clasificación</h2>
          {cargando
            ? <Skeleton.Tabla grupos={2} />
            : <div className="grid lg:grid-cols-2 gap-8">
                {clasificaciones.map(g => <StandingsTable key={g.id} grupo={g} equipos={g.equipos} variant="padel" />)}
              </div>
          }
        </section>

        {!cargando && jornadasGrupos.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-blue-500 pl-4">Calendario de Grupos</h2>
            <div className="grid gap-8">
              {jornadasGrupos.map(jornada => (
                <div key={jornada} className="bg-[#1e293b]/50 rounded-xl border border-slate-800 p-6 shadow-md">
                  <h3 className="text-blue-400 font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-3">
                    <span>🕒</span> {NOMBRES_JORNADAS[jornada] || `Jornada ${jornada}`}
                  </h3>
                  <div className="flex flex-wrap gap-5">
                    {partidos
                      .filter(p => p.fase === 'grupos' && p.jornada === jornada)
                      .sort((a,b) => (a.hora ?? '').localeCompare(b.hora ?? ''))
                      .map(p => <MatchNode key={p.id} p={p} variant="padel" />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-blue-500 pl-4">Fase Final</h2>
          {cargando
            ? <Skeleton.Bracket rondas={4} />
            : <BracketConLineas rondas={rondas} variant="padel" />
          }
        </section>
      </div>
    </div>
  );
}
