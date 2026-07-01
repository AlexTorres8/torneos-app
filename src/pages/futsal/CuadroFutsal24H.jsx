import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, Share2, Wifi, Clock, Trophy, Zap, Medal } from 'lucide-react';
import { useRealtimeTorneo } from '../../hooks/useRealtimeTorneo';
import { BracketConLineas }  from '../../components/ui/BracketConLineas';
import { StandingsTable }    from '../../components/ui/StandingsTable';
import { MatchNode }         from '../../components/ui/MatchNode';
import { Skeleton }          from '../../components/ui/Skeleton';
import { calcularStats }     from '../../hooks/useCalcStats';
import { ordenarClasificacion } from '../../lib/clasificacion';

const ESQ_CUARTOS = [
  { id:'c1', hora:'Por conf.', ubicacion:'Pabellón', estado:'pendiente', local:{nombre:'1º Grupo A'}, visitante:{nombre:'Mejor 3º'}    },
  { id:'c2', hora:'Por conf.', ubicacion:'Pista',    estado:'pendiente', local:{nombre:'2º Grupo C'}, visitante:{nombre:'2º Grupo B'}   },
  { id:'c3', hora:'Por conf.', ubicacion:'Pabellón', estado:'pendiente', local:{nombre:'1º Grupo B'}, visitante:{nombre:'2º Mejor 3º'}  },
  { id:'c4', hora:'Por conf.', ubicacion:'Pista',    estado:'pendiente', local:{nombre:'1º Grupo C'}, visitante:{nombre:'2º Grupo A'}   },
];
const ESQ_SEMIS = [
  { id:'s1', hora:'Por conf.', ubicacion:'Pabellón', estado:'pendiente', local:{nombre:'Ganador C1'}, visitante:{nombre:'Ganador C2'} },
  { id:'s2', hora:'Por conf.', ubicacion:'Pabellón', estado:'pendiente', local:{nombre:'Ganador C3'}, visitante:{nombre:'Ganador C4'} },
];
const ESQ_FINAL = [{ id:'f1', hora:'Por conf.', ubicacion:'Pabellón', estado:'pendiente', local:{nombre:'Ganador Semi 1'}, visitante:{nombre:'Ganador Semi 2'} }];

export default function CuadroFutsal24H() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const { grupos, partidos, cargando, error, recargar } = useRealtimeTorneo(torneoId);

  const clasificaciones = useMemo(() =>
    grupos.map(g => ({
      ...g,
      equipos: ordenarClasificacion(
        g.grupo_participantes.map(gp => ({ ...gp.participantes, stats: calcularStats(partidos, gp.participantes.id, 'futsal'), grupo: g.nombre })),
        partidos,
        'futsal'
      ),
    })),
    [grupos, partidos]
  );

  const terceros = useMemo(() =>
    clasificaciones
      .filter(g => g.equipos.length >= 3)
      .map(g => g.equipos[2])
      .sort((a,b) => b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf),
    [clasificaciones]
  );

  const horasUnicas = useMemo(() => {
    const pGrupos = partidos.filter(p => p.fase === 'grupos');
    return [...new Set(pGrupos.map(p => p.hora))].sort((a,b) => {
      const hA = parseInt(a?.split(':')[0] ?? '0');
      const hB = parseInt(b?.split(':')[0] ?? '0');
      return (hA < 10 ? hA+24 : hA) - (hB < 10 ? hB+24 : hB);
    });
  }, [partidos]);

  const pGrupos = useMemo(() => partidos.filter(p => p.fase === 'grupos'), [partidos]);
  const cuartos = useMemo(() => partidos.filter(p => p.fase === 'cuartos').sort((a,b) => (a.hora??'').localeCompare(b.hora??'')), [partidos]);
  const semis   = useMemo(() => partidos.filter(p => p.fase === 'semis').sort((a,b) => (a.hora??'').localeCompare(b.hora??'')), [partidos]);
  const finales = useMemo(() => partidos.filter(p => p.fase === 'final'), [partidos]);

  const rondas = [
    { label: 'Cuartos',     partidos: cuartos.length > 0 ? cuartos : ESQ_CUARTOS },
    { label: 'Semifinales', partidos: semis.length   > 0 ? semis   : ESQ_SEMIS   },
    { label: 'Gran Final',  partidos: finales.length > 0 ? finales : ESQ_FINAL   },
  ];

  const compartir = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: 'Torneo 24H — Activa Fitness', url });
    else { navigator.clipboard.writeText(url); alert('¡Enlace copiado!'); }
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
          ← Volver a Ligas
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <Wifi size={11} /> En directo
          </div>
          <button onClick={compartir} className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            <Share2 size={14} /> Compartir
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 md:p-8 mb-16 flex items-center justify-between shadow-xl">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest flex items-center gap-4 mb-2">
            <Zap className="text-amber-500" size={40} /> Torneo 24 Horas
          </h1>
          <p className="text-amber-500 font-bold tracking-widest uppercase text-sm flex items-center gap-2">
            <Trophy size={16} /> Se clasifican los 2 primeros de cada grupo y los 2 mejores terceros
          </p>
        </div>
      </div>

      <div className="space-y-24">
        {/* Grupos */}
        <section>
          <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-amber-500 pl-4">Fase de Grupos</h2>
          {cargando
            ? <Skeleton.Tabla grupos={3} />
            : <div className="grid lg:grid-cols-3 gap-6">
                {clasificaciones.map(g => <StandingsTable key={g.id} grupo={g} equipos={g.equipos} variant="futsal24h" />)}
              </div>
          }
        </section>

        {/* Mejores terceros */}
        {!cargando && terceros.length > 0 && (
          <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
              <Medal className="text-amber-500" /> Clasificación Mejores 3º
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap bg-[#1e293b] rounded-xl overflow-hidden shadow-xl border border-slate-700">
                <thead className="bg-[#0f172a] uppercase font-black text-slate-500 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Equipo</th>
                    <th className="px-4 py-3 text-slate-400">Grupo</th>
                    <th className="px-4 py-3 text-center text-amber-500">Pts</th>
                    <th className="px-4 py-3 text-center">Dif.</th>
                    <th className="px-4 py-3 text-center">GF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-slate-200">
                  {terceros.map((t, i) => (
                    <tr key={t.id} className={i < 2 ? 'bg-emerald-500/10' : 'opacity-50'}>
                      <td className="px-4 py-3 text-center">
                        {i < 2
                          ? <span className="text-emerald-500 text-[10px] font-black bg-emerald-500/20 px-2 py-1 rounded uppercase tracking-widest">Clasificado</span>
                          : <span className="text-red-500 text-[10px] font-black bg-red-500/20 px-2 py-1 rounded uppercase tracking-widest">Eliminado</span>}
                      </td>
                      <td className="px-4 py-3 font-black text-white">{t.nombre}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-bold">{t.grupo}</td>
                      <td className="px-4 py-3 text-center font-black text-amber-500 text-base">{t.stats.pts}</td>
                      <td className="px-4 py-3 text-center font-bold">{t.stats.dif > 0 ? `+${t.stats.dif}` : t.stats.dif}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{t.stats.gf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Timeline horarios */}
        {!cargando && horasUnicas.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-amber-500 pl-4 flex items-center gap-3">
              <Clock className="text-amber-500" /> Horarios Ininterrumpidos
            </h2>
            <div className="relative border-l-2 border-slate-700/50 pl-6 md:pl-10 space-y-12 ml-4">
              {horasUnicas.map(hora => (
                <div key={hora} className="relative">
                  <div className="absolute -left-[31px] md:-left-[47px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-[#0f172a]" />
                  <div className="bg-[#1e293b]/60 rounded-xl border border-slate-700 p-5">
                    <h3 className="text-amber-500 font-black text-xl tracking-wider mb-4">{hora}</h3>
                    <div className="flex flex-wrap gap-5">
                      {pGrupos.filter(p => p.hora === hora).map(p => <MatchNode key={p.id} p={p} variant="futsal24h" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Fase final */}
        <section>
          <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-amber-500 pl-4 flex items-center gap-3">
            <Trophy className="text-amber-500" /> Fase Final (Madrugada)
          </h2>
          {cargando
            ? <Skeleton.Bracket rondas={3} />
            : <BracketConLineas rondas={rondas} variant="futsal24h" />
          }
        </section>
      </div>
    </div>
  );
}
