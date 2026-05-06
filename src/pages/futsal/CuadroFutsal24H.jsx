import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Trophy, Zap, Medal, MapPin } from 'lucide-react';
import { supabase } from '../../supabase';
import { MatchNode } from '../../components/ui/MatchNode';
import { StandingsTable } from '../../components/ui/StandingsTable';
import { calcularStats } from '../../hooks/useCalcStats';

const ESQ_CUARTOS = [
  { id: 'c1', hora: '04:00', ubicacion: 'Pabellón', local: { nombre: '1º Grupo A' }, visitante: { nombre: 'Mejor 3º' } },
  { id: 'c2', hora: '04:00', ubicacion: 'Pista',    local: { nombre: '2º Grupo C' }, visitante: { nombre: '2º Mejor 3º' } },
  { id: 'c3', hora: '05:00', ubicacion: 'Pabellón', local: { nombre: '1º Grupo B' }, visitante: { nombre: '2º Mejor 3º' } },
  { id: 'c4', hora: '05:00', ubicacion: 'Pista',    local: { nombre: '1º Grupo C' }, visitante: { nombre: '2º Grupo A' } },
];
const ESQ_SEMIS = [
  { id: 's1', hora: '07:00', ubicacion: 'Pabellón', local: { nombre: 'Ganador 04:00 (1)' }, visitante: { nombre: 'Ganador 05:00 (1)' } },
  { id: 's2', hora: '07:00', ubicacion: 'Pista',    local: { nombre: 'Ganador 04:00 (2)' }, visitante: { nombre: 'Ganador 05:00 (2)' } },
];
const ESQ_FINAL = { id: 'f1', hora: '09:00', ubicacion: 'Pabellón', local: { nombre: 'Ganador Semi 1' }, visitante: { nombre: 'Ganador Semi 2' } };

export default function CuadroFutsal24H() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const [{ data: g }, { data: p }] = await Promise.all([
        supabase
          .from('grupos')
          .select('id, nombre, grupo_participantes(participantes(id, nombre))')
          .eq('torneo_id', torneoId),
        supabase
          .from('partidos')
          .select('id, estado, ubicacion, puntuacion_local, puntuacion_visitante, fase, jornada, hora, local_id, visitante_id, local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre)')
          .eq('torneo_id', torneoId),
      ]);
      if (g) setGrupos(g);
      if (p) setPartidos(p);
      setCargando(false);
    }
    cargar();
  }, [torneoId]);

  const clasificaciones = useMemo(() =>
    grupos.map((g) => ({
      ...g,
      equipos: g.grupo_participantes
        .map((gp) => ({
          ...gp.participantes,
          stats: calcularStats(partidos, gp.participantes.id, 'futsal'),
          grupo: g.nombre,
        }))
        .sort((a, b) => b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf),
    })),
    [grupos, partidos]
  );

  // Terceros de cada grupo ordenados por puntos
  const terceros = useMemo(() =>
    clasificaciones
      .filter((g) => g.equipos.length >= 3)
      .map((g) => g.equipos[2])
      .sort((a, b) => b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf),
    [clasificaciones]
  );

  // Horas únicas con orden correcto para maratón nocturna
  const horasUnicas = useMemo(() => {
    const partidosGrupos = partidos.filter((p) => p.fase === 'grupos');
    return [...new Set(partidosGrupos.map((p) => p.hora))].sort((a, b) => {
      const hA = parseInt(a.split(':')[0]);
      const hB = parseInt(b.split(':')[0]);
      const pesoA = hA < 10 ? hA + 24 : hA;
      const pesoB = hB < 10 ? hB + 24 : hB;
      return pesoA !== pesoB ? pesoA - pesoB : a.localeCompare(b);
    });
  }, [partidos]);

  const partidosGrupos  = useMemo(() => partidos.filter((p) => p.fase === 'grupos'), [partidos]);
  const partidosCuartos = useMemo(() => partidos.filter((p) => p.fase === 'cuartos').sort((a, b) => a.hora.localeCompare(b.hora)), [partidos]);
  const partidosSemis   = useMemo(() => partidos.filter((p) => p.fase === 'semis').sort((a, b) => a.hora.localeCompare(b.hora)), [partidos]);
  const partidoFinal    = useMemo(() => partidos.find((p) => p.fase === 'final'), [partidos]);

  if (cargando) return <div className="text-center text-slate-400 mt-20 animate-pulse">Cargando Maratón 24H...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      <button onClick={() => navigate(-1)} className="mb-8 text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2">
        ← Volver a Ligas
      </button>

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
        {/* GRUPOS */}
        <section>
          <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-amber-500 pl-4">
            Fase de Grupos
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {clasificaciones.map((g) => (
              <StandingsTable key={g.id} grupo={g} equipos={g.equipos} variant="futsal24h" />
            ))}
          </div>
        </section>

        {/* MEJORES TERCEROS */}
        {terceros.length > 0 && (
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
                    <th className="px-4 py-3 text-center text-amber-500">Puntos</th>
                    <th className="px-4 py-3 text-center">Dif. Goles</th>
                    <th className="px-4 py-3 text-center">GF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-slate-200">
                  {terceros.map((t, i) => (
                    <tr key={t.id} className={i < 2 ? 'bg-emerald-500/10' : 'bg-red-500/5 opacity-50'}>
                      <td className="px-4 py-3 text-center font-bold">
                        {i < 2
                          ? <span className="text-emerald-500 uppercase text-[10px] tracking-widest bg-emerald-500/20 px-2 py-1 rounded">Clasificado</span>
                          : <span className="text-red-500 uppercase text-[10px] tracking-widest bg-red-500/20 px-2 py-1 rounded">Eliminado</span>}
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

        {/* TIMELINE HORARIOS */}
        {horasUnicas.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-amber-500 pl-4 flex items-center gap-3">
              <Clock className="text-amber-500" /> Horarios Ininterrumpidos
            </h2>
            <div className="relative border-l-2 border-slate-700/50 pl-6 md:pl-10 space-y-12 ml-4">
              {horasUnicas.map((hora) => (
                <div key={hora} className="relative">
                  <div className="absolute -left-[31px] md:-left-[47px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-[#0f172a]" />
                  <div className="bg-[#1e293b]/60 rounded-xl border border-slate-700 p-5">
                    <h3 className="text-amber-500 font-black text-xl tracking-wider mb-4">{hora}</h3>
                    <div className="flex flex-wrap gap-5">
                      {partidosGrupos
                        .filter((p) => p.hora === hora)
                        .map((p) => <MatchNode key={p.id} p={p} variant="futsal24h" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FASE FINAL */}
        <section>
          <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-amber-500 pl-4 flex items-center gap-3">
            <Trophy className="text-amber-500" /> Fase Final (Madrugada)
          </h2>
          <div className="overflow-x-auto pb-8">
            <div className="min-w-max">
              <div className="flex gap-16 mb-8">
                <div className="w-[260px] text-center"><span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-800 px-4 py-1.5 rounded-full">Cuartos (04:00 - 05:00)</span></div>
                <div className="w-[260px] text-center"><span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-800 px-4 py-1.5 rounded-full">Semifinales (07:00)</span></div>
                <div className="w-[260px] text-center"><span className="text-xs font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)]">Gran Final (09:00)</span></div>
              </div>
              <div className="flex gap-16 items-stretch">
                <div className="w-[260px] flex flex-col gap-6">
                  {(partidosCuartos.length > 0 ? partidosCuartos : ESQ_CUARTOS).map((x) => (
                    <MatchNode key={x.id} p={x} variant="futsal24h" />
                  ))}
                </div>
                <div className="w-[260px] flex flex-col justify-between py-[4.5rem]">
                  {(partidosSemis.length > 0 ? partidosSemis : ESQ_SEMIS).map((x) => (
                    <MatchNode key={x.id} p={x} variant="futsal24h" />
                  ))}
                </div>
                <div className="w-[260px] flex flex-col justify-center">
                  <MatchNode p={partidoFinal ?? ESQ_FINAL} variant="futsal24h" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
