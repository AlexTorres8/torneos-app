import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { CircleDot, Target, Menu, X, Dumbbell, Clock, Phone, Mail, MapPin, Users, Heart, Zap, Trophy, Medal } from 'lucide-react';
import { supabase } from './supabase'; 

// Icono personalizado de Futsal (Balón clásico)
const IconoFutsal = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16l4-3-1.5-5h-5L8 13z" />
    <path d="M12 16v6" />
    <path d="M16 13l5.5 2" />
    <path d="M6.5 8L2 9.5" />
    <path d="M14.5 8L19 4" />
    <path d="M8 13L2.5 16" />
  </svg>
);

// Icono personalizado de Pádel (Pala con la X y agujeros)
const IconoPadel = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14a5 5 0 0 0 3-4V6a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v4a5 5 0 0 0 3 4l-1.5 5.5a1.5 1.5 0 0 0 1.5 1.5h2a1.5 1.5 0 0 0 1.5-1.5L15 14z" />
    <path d="M10.5 7.5l3 3M13.5 7.5l-3 3" />
    <circle cx="10" cy="5" r="0.5" fill="currentColor" />
    <circle cx="14" cy="5" r="0.5" fill="currentColor" />
    <circle cx="9" cy="11" r="0.5" fill="currentColor" />
    <circle cx="15" cy="11" r="0.5" fill="currentColor" />
  </svg>
);

// --- ICONOS REDES SOCIALES ---
const Instagram = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const Facebook = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

// ==========================================
// MÓDULO FUTSAL (Lista Unificada)
// ==========================================
function LigasFutsal() {
  const [torneos, setTorneos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const { data } = await supabase.from('torneos').select('*').eq('deporte', 'futsal');
      if (data) setTorneos(data);
      setCargando(false);
    }
    cargar();
  }, []); 

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col items-center bg-cover bg-center bg-no-repeat animate-fade-in" style={{ backgroundImage: "url('/fondo-futsal.jpg')", backgroundColor: '#0f172a' }}>
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-4xl px-4 py-8 md:py-16">
        
        <div className="bg-[#1e293b]/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-10 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8 border-b border-slate-700/50 pb-4 uppercase tracking-widest flex items-center gap-3 text-[#60A5FA]">
            <Target className="text-[#60A5FA]" size={36}/> Competiciones Futsal
          </h2>
          
          {cargando ? <p className="text-[#60A5FA] animate-pulse font-bold tracking-widest uppercase text-sm">Cargando competiciones...</p> : torneos.length === 0 ? <p className="text-slate-400">No hay torneos registrados.</p> : (
            <div className="grid gap-5">
              {torneos.map((torneo) => {
                // Detectamos si es un torneo 24h para cambiarle el color y la ruta
                const es24h = torneo.nombre.toLowerCase().includes('24');
                
                return (
                  <div key={torneo.id} className="bg-[#0f172a]/90 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-slate-400 transition-colors shadow-lg group relative overflow-hidden">
                    {/* Icono de rayo de fondo solo para los 24h */}
                    {es24h && <div className="absolute -right-6 -top-6 text-amber-500/10 group-hover:text-amber-500/20 transition-colors"><Zap size={120} /></div>}
                    
                    <div className="text-center md:text-left relative z-10">
                      <h3 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">{torneo.nombre}</h3>
                      <span className={`text-xs uppercase tracking-widest font-black ${es24h ? 'text-amber-500' : 'text-[#60A5FA]'}`}>{torneo.estado}</span>
                    </div>
                    
                    <Link 
                      // Redirige al diseño especial 24h o al regular automáticamente
                      to={es24h ? `/torneo-24h/${torneo.id}` : `/torneo-futsal/${torneo.id}`} 
                      className={`${es24h ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-[#60A5FA] hover:bg-blue-500 shadow-[0_0_15px_rgba(96,165,250,0.3)]'} text-black px-8 py-3.5 rounded font-black uppercase tracking-widest transition-all w-full md:w-auto text-center relative z-10`}
                    >
                      Ver Competición
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// NUEVO COMPONENTE: TORNEO 24 HORAS
// ==========================================
function CuadroFutsal24H() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const { data: g } = await supabase.from('grupos').select(`id, nombre, grupo_participantes(participantes(id, nombre))`).eq('torneo_id', torneoId);
      const { data: p } = await supabase.from('partidos').select(`id, estado, ubicacion, puntuacion_local, puntuacion_visitante, fase, jornada, hora, local_id, visitante_id, local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre)`).eq('torneo_id', torneoId);
      if (g) setGrupos(g); if (p) setPartidos(p);
      setCargando(false);
    }
    cargar();
  }, [torneoId]);

  const calcularStats = (id) => {
    let s = { id, pj: 0, pg: 0, pe: 0, pp: 0, pts: 0, gf: 0, gc: 0, dif: 0 };
    partidos.filter(p => p.fase === 'grupos' && p.estado === 'finalizado' && (p.local_id === id || p.visitante_id === id)).forEach(p => {
      s.pj++;
      const gf = Number(p.local_id === id ? p.puntuacion_local : p.puntuacion_visitante);
      const gc = Number(p.local_id === id ? p.puntuacion_visitante : p.puntuacion_local);
      s.gf += gf; s.gc += gc;
      if (gf > gc) { s.pts += 3; s.pg++; }
      else if (gf === gc) { s.pts += 1; s.pe++; }
      else { s.pp++; }
    });
    s.dif = s.gf - s.gc; return s;
  };

  // Pre-procesar grupos y obtener clasificaciones completas
  const clasificaciones = grupos.map(g => {
    const equipos = g.grupo_participantes.map(gp => ({ 
      ...gp.participantes, 
      stats: calcularStats(gp.participantes.id),
      grupo: g.nombre 
    })).sort((a, b) => b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf);
    return { ...g, equipos };
  });

  // Extraer a los terceros de cada grupo para compararlos
  const terceros = clasificaciones
    .filter(g => g.equipos.length >= 3)
    .map(g => g.equipos[2])
    .sort((a, b) => b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf);

  const Node24H = ({ p }) => (
    <div className="bg-[#0f172a] border border-slate-700/50 rounded-lg p-3 w-[260px] shadow-2xl relative transition-all hover:border-amber-500/50">
      <div className="text-[10px] font-black uppercase mb-3 flex justify-between items-center border-b border-slate-800/80 pb-2 text-slate-400">
        <span className="flex items-center gap-1.5"><MapPin size={12} className="text-amber-500" /> {p?.ubicacion || 'Por definir'}</span>
        <span className={p?.estado === 'finalizado' ? 'text-emerald-500 font-black' : 'text-slate-500'}>{p?.estado === 'pendiente' ? p?.hora || 'vs' : p?.estado === 'finalizado' ? 'FIN' : '---'}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-white items-center bg-[#1e293b] p-1.5 rounded">
          <span className="truncate pr-2">{p?.local?.nombre || 'Esperando rival...'}</span>
          <span className="text-amber-500 bg-black/50 px-2 py-0.5 rounded text-sm">{p?.estado === 'finalizado' ? p.puntuacion_local : '-'}</span>
        </div>
        <div className="flex justify-between text-xs font-bold text-white items-center bg-[#1e293b] p-1.5 rounded">
          <span className="truncate pr-2">{p?.visitante?.nombre || 'Esperando rival...'}</span>
          <span className="text-amber-500 bg-black/50 px-2 py-0.5 rounded text-sm">{p?.estado === 'finalizado' ? p.puntuacion_visitante : '-'}</span>
        </div>
      </div>
    </div>
  );

  // Esquema base 24 Horas según PDF
  const esqC = [
    { id: 'c1', hora: '04:00', ubicacion: 'Pabellón', local: { nombre: '1º Grupo A' }, visitante: { nombre: 'Mejor 3º' } }, 
    { id: 'c2', hora: '04:00', ubicacion: 'Pista', local: { nombre: '2º Grupo C' }, visitante: { nombre: '2º Grupo B' } }, 
    { id: 'c3', hora: '05:00', ubicacion: 'Pabellón', local: { nombre: '1º Grupo B' }, visitante: { nombre: '2º Mejor 3º' } }, 
    { id: 'c4', hora: '05:00', ubicacion: 'Pista', local: { nombre: '1º Grupo C' }, visitante: { nombre: '2º Grupo A' } }
  ];
  const esqS = [
    { id: 's1', hora: '07:00', ubicacion: 'Pabellón', local: { nombre: 'Ganador 04:00 (1)' }, visitante: { nombre: 'Ganador 05:00 (1)' } }, 
    { id: 's2', hora: '07:00', ubicacion: 'Pista', local: { nombre: 'Ganador 04:00 (2)' }, visitante: { nombre: 'Ganador 05:00 (2)' } }
  ];
  const esqF = { id: 'f1', hora: '09:00', ubicacion: 'Pabellón', local: { nombre: 'Ganador Semi 1' }, visitante: { nombre: 'Ganador Semi 2' } };

  if (cargando) return <div className="text-center text-slate-400 mt-20 animate-pulse">Cargando Maratón 24H...</div>;

  const partidosGrupos = partidos.filter(p => p.fase === 'grupos');
  
  // Ordenar horas de maratón: Las horas de madrugada (menores de 10) se empujan al final
  const horasUnicas = [...new Set(partidosGrupos.map(p => p.hora))].sort((a, b) => {
    const horaA = parseInt(a.split(':')[0]);
    const horaB = parseInt(b.split(':')[0]);
    
    // Si la hora es menor que 10 (ej: 00, 01, 02), internamente le sumamos 24h
    const pesoA = horaA < 10 ? horaA + 24 : horaA;
    const pesoB = horaB < 10 ? horaB + 24 : horaB;
    
    if (pesoA !== pesoB) return pesoA - pesoB;
    return a.localeCompare(b); // Si es la misma hora, desempata por minutos
  });

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      <button onClick={() => navigate(-1)} className="mb-8 text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2">← Volver a Ligas</button>
      
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
        {/* CLASIFICACIÓN GRUPOS */}
        <section>
          <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-amber-500 pl-4">Fase de Grupos</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {clasificaciones.map((g) => (
              <div key={g.id} className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800 shadow-lg">
                <div className="bg-gradient-to-r from-black/40 to-transparent px-4 py-3 text-amber-500 text-xs font-black uppercase tracking-widest border-b border-slate-800">{g.nombre}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] whitespace-nowrap">
                    <thead className="bg-[#0f172a]/50 uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-center">#</th>
                        <th className="px-3 py-2">Equipo</th>
                        <th className="px-3 py-2 text-center text-white">Pts</th>
                        <th className="px-2 py-2 text-center">PJ</th>
                        <th className="px-2 py-2 text-center text-slate-400">GF</th>
                        <th className="px-2 py-2 text-center text-slate-400">GC</th>
                        <th className="px-2 py-2 text-center text-slate-300">+/-</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-slate-300">
                      {g.equipos.map((e, index) => (
                        <tr key={e.id} className={`hover:bg-white/5 transition-colors ${index < 2 ? 'bg-emerald-500/5' : ''}`}>
                          <td className="px-3 py-2 text-center font-bold"><span className={index < 2 ? 'text-emerald-500' : 'text-slate-600'}>{index + 1}</span></td>
                          <td className="px-3 py-2 font-bold text-white max-w-[100px] truncate">{e.nombre}</td>
                          <td className="px-3 py-2 text-center font-black text-amber-500 text-[13px]">{e.stats.pts}</td>
                          <td className="px-2 py-2 text-center text-slate-400">{e.stats.pj}</td>
                          <td className="px-2 py-2 text-center text-slate-400">{e.stats.gf}</td>
                          <td className="px-2 py-2 text-center text-slate-400">{e.stats.gc}</td>
                          <td className={`px-2 py-2 text-center font-bold ${e.stats.dif > 0 ? 'text-emerald-500' : e.stats.dif < 0 ? 'text-red-500' : 'text-slate-500'}`}>{e.stats.dif > 0 ? `+${e.stats.dif}` : e.stats.dif}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LOS MEJORES TERCEROS */}
        {terceros.length > 0 && (
          <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3"><Medal className="text-amber-500" /> Clasificación Mejores 3º</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap bg-[#1e293b] rounded-xl overflow-hidden shadow-xl border border-slate-700">
                <thead className="bg-[#0f172a] uppercase font-black text-slate-500 text-xs">
                  <tr><th className="px-4 py-3 text-center">Status</th><th className="px-4 py-3">Equipo</th><th className="px-4 py-3 text-slate-400">Grupo</th><th className="px-4 py-3 text-center text-amber-500">Puntos</th><th className="px-4 py-3 text-center">Dif. Goles</th><th className="px-4 py-3 text-center">Goles Favor</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-slate-200">
                  {terceros.map((t, i) => (
                    <tr key={t.id} className={i < 2 ? 'bg-emerald-500/10' : 'bg-red-500/5 opacity-50'}>
                      <td className="px-4 py-3 text-center font-bold">{i < 2 ? <span className="text-emerald-500 uppercase text-[10px] tracking-widest bg-emerald-500/20 px-2 py-1 rounded">Clasificado</span> : <span className="text-red-500 uppercase text-[10px] tracking-widest bg-red-500/20 px-2 py-1 rounded">Eliminado</span>}</td>
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
            <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-amber-500 pl-4 flex items-center gap-3"><Clock className="text-amber-500" /> Horarios Ininterrumpidos</h2>
            <div className="relative border-l-2 border-slate-700/50 pl-6 md:pl-10 space-y-12 ml-4">
              {horasUnicas.map(hora => (
                <div key={hora} className="relative">
                  <div className="absolute -left-[31px] md:-left-[47px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-[#0f172a]"></div>
                  <div className="bg-[#1e293b]/60 rounded-xl border border-slate-700 p-5">
                    <h3 className="text-amber-500 font-black text-xl tracking-wider mb-4">{hora}</h3>
                    <div className="flex flex-wrap gap-5">
                      {partidosGrupos.filter(p => p.hora === hora).map(p => <Node24H key={p.id} p={p} />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FASE FINAL 24H */}
        <section>
          <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-amber-500 pl-4 flex items-center gap-3"><Trophy className="text-amber-500" /> Fase Final (Madrugada)</h2>
          <div className="overflow-x-auto pb-8 scrollbar-hide">
            <div className="min-w-max">
              <div className="flex gap-16 mb-8">
                <div className="w-[260px] text-center"><span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-800 px-4 py-1.5 rounded-full">Cuartos (04:00 - 05:00)</span></div>
                <div className="w-[260px] text-center"><span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-800 px-4 py-1.5 rounded-full">Semifinales (07:00)</span></div>
                <div className="w-[260px] text-center"><span className="text-xs font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)]">Gran Final (09:00)</span></div>
              </div>
              <div className="flex gap-16 items-stretch relative">
                <div className="w-[260px] flex flex-col gap-6">{(() => { const p = partidos.filter(p => p.fase === 'cuartos').sort((a,b)=>a.hora.localeCompare(b.hora)); return p.length > 0 ? p.map(x => <Node24H key={x.id} p={x}/>) : esqC.map(x => <Node24H key={x.id} p={x}/>); })()}</div>
                <div className="w-[260px] flex flex-col justify-between py-[4.5rem]">{(() => { const p = partidos.filter(p => p.fase === 'semis').sort((a,b)=>a.hora.localeCompare(b.hora)); return p.length > 0 ? p.map(x => <Node24H key={x.id} p={x}/>) : esqS.map(x => <Node24H key={x.id} p={x}/>); })()}</div>
                <div className="w-[260px] flex flex-col justify-center">{(() => { const p = partidos.find(p => p.fase === 'final'); return p ? <Node24H p={p}/> : <Node24H p={esqF}/>; })()}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function CuadroFutsal() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const { data: g } = await supabase.from('grupos').select(`id, nombre, grupo_participantes(participantes(id, nombre))`).eq('torneo_id', torneoId);
      const { data: p } = await supabase.from('partidos').select(`id, estado, ubicacion, puntuacion_local, puntuacion_visitante, fase, jornada, hora, local_id, visitante_id, local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre)`).eq('torneo_id', torneoId);
      if (g) setGrupos(g); if (p) setPartidos(p);
      setCargando(false);
    }
    cargar();
  }, [torneoId]);

  const calcularStats = (id) => {
    let s = { pj: 0, pg: 0, pe: 0, pp: 0, pts: 0, gf: 0, gc: 0, dif: 0 };
    partidos.filter(p => p.fase === 'grupos' && p.estado === 'finalizado' && (p.local_id === id || p.visitante_id === id)).forEach(p => {
      s.pj++;
      const gf = p.local_id === id ? p.puntuacion_local : p.puntuacion_visitante;
      const gc = p.local_id === id ? p.puntuacion_visitante : p.puntuacion_local;
      s.gf += gf; s.gc += gc;
      if (gf > gc) { s.pts += 3; s.pg++; }
      else if (gf === gc) { s.pts += 1; s.pe++; }
      else { s.pp++; }
    });
    s.dif = s.gf - s.gc; return s;
  };

  const Node = ({ p }) => (
    <div className="bg-[#1e293b] border border-slate-800 rounded-lg p-3 w-52 shadow-2xl relative">
      <div className="text-[9px] font-black uppercase mb-2 flex justify-between items-center border-b border-slate-800/80 pb-1.5 text-slate-500">
        <span>{p?.hora || ''} {p?.ubicacion || 'Por definir'}</span>
        <span className={p?.estado === 'finalizado' ? 'text-emerald-500' : ''}>{p?.estado === 'pendiente' ? 'vs' : p?.estado === 'finalizado' ? 'FIN' : '---'}</span>
      </div>
      <div className="space-y-1.5 mt-2">
        <div className="flex justify-between text-[11px] font-bold text-white"><span className="truncate pr-2">{p?.local?.nombre || 'Esperando rival...'}</span><span className="text-blue-400">{p?.estado === 'finalizado' ? p.puntuacion_local : '-'}</span></div>
        <div className="flex justify-between text-[11px] font-bold text-white"><span className="truncate pr-2">{p?.visitante?.nombre || 'Esperando rival...'}</span><span className="text-blue-400">{p?.estado === 'finalizado' ? p.puntuacion_visitante : '-'}</span></div>
      </div>
    </div>
  );

  const esqC = [
    { id: 'c1', hora: '21:00', ubicacion: 'Pista Ext.', local: { nombre: '1º Grupo A' }, visitante: { nombre: '4º Grupo B' } }, 
    { id: 'c2', hora: '21:00', ubicacion: 'Pabellón', local: { nombre: '2º Grupo B' }, visitante: { nombre: '3º Grupo A' } }, 
    { id: 'c3', hora: '22:00', ubicacion: 'Pabellón', local: { nombre: '1º Grupo B' }, visitante: { nombre: '4º Grupo A' } }, 
    { id: 'c4', hora: '22:00', ubicacion: 'Pista Ext.', local: { nombre: '2º Grupo A' }, visitante: { nombre: '3º Grupo B' } }
  ];
  const esqS = [
    { id: 's1', hora: '21:00', ubicacion: 'Pabellón', local: { nombre: 'Ganador C1' }, visitante: { nombre: 'Ganador C2' } }, 
    { id: 's2', hora: '22:00', ubicacion: 'Pabellón', local: { nombre: 'Ganador C3' }, visitante: { nombre: 'Ganador C4' } }
  ];
  const esqF = { id: 'f1', hora: '21:00', ubicacion: 'Pabellón', local: { nombre: 'Ganador Semi 1' }, visitante: { nombre: 'Ganador Semi 2' } };
  if (cargando) return <div className="text-center text-slate-400 mt-20 animate-pulse">Cargando torneo...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      <button onClick={() => navigate(-1)} className="mb-8 text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2">← Volver a torneos</button>
      <div className="space-y-24">
        {/* CLASIFICACIÓN FUTSAL */}
        <section>
          <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-blue-500 pl-4">Clasificación</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {grupos.map((g) => {
              const eq = g.grupo_participantes.map(gp => ({ ...gp.participantes, stats: calcularStats(gp.participantes.id) })).sort((a, b) => b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf);
              return (
                <div key={g.id} className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800">
                  <div className="bg-black/20 px-5 py-3 text-blue-400 text-xs font-bold uppercase tracking-widest">{g.nombre}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px] whitespace-nowrap">
                      <thead className="bg-[#0f172a]/50 uppercase font-bold text-slate-500">
                        <tr>
                          <th className="px-3 py-3 text-center">#</th>
                          <th className="px-3 py-3">Equipo</th>
                          <th className="px-3 py-3 text-center text-white">Pts</th>
                          <th className="px-3 py-3 text-center">PJ</th>
                          <th className="px-3 py-3 text-center">PG</th>
                          <th className="px-3 py-3 text-center">PE</th>
                          <th className="px-3 py-3 text-center">PP</th>
                          <th className="px-3 py-3 text-center">GF</th>
                          <th className="px-3 py-3 text-center">GC</th>
                          <th className="px-3 py-3 text-center text-slate-300">+/-</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-slate-300">
                        {eq.map((e, index) => (
                          <tr key={e.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-3 py-3 text-center text-slate-600 font-bold">{index + 1}</td>
                            <td className="px-3 py-3 font-bold text-white">
                              <div className="flex items-center gap-2">
                                {index === 0 && e.stats.pts > 0 && <span className="text-yellow-500">👑</span>}
                                <span className="truncate max-w-[120px]">{e.nombre}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center font-black text-blue-400 text-[14px]">{e.stats.pts}</td>
                            <td className="px-3 py-3 text-center text-slate-400">{e.stats.pj}</td>
                            <td className="px-3 py-3 text-center text-emerald-500/70">{e.stats.pg}</td>
                            <td className="px-3 py-3 text-center text-amber-500/70">{e.stats.pe}</td>
                            <td className="px-3 py-3 text-center text-red-500/70">{e.stats.pp}</td>
                            <td className="px-3 py-3 text-center text-slate-400">{e.stats.gf}</td>
                            <td className="px-3 py-3 text-center text-slate-400">{e.stats.gc}</td>
                            <td className={`px-3 py-3 text-center font-bold ${e.stats.dif > 0 ? 'text-emerald-500' : e.stats.dif < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                              {e.stats.dif > 0 ? `+${e.stats.dif}` : e.stats.dif}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        {/* FASE FINAL 3 COLUMNAS */}
        <section>
          <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-blue-500 pl-4">Fase Final</h2>
          <div className="overflow-x-auto pb-8 scrollbar-hide">
            <div className="min-w-max">
              <div className="flex gap-12 mb-6">
                <div className="w-52 text-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cuartos de Final</span></div>
                <div className="w-52 text-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Semifinales</span></div>
                <div className="w-52 text-center"><span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Gran Final</span></div>
              </div>
              <div className="flex gap-12 items-stretch relative">
                <div className="w-52 flex flex-col gap-6">{(() => { const p = partidos.filter(p => p.fase === 'cuartos').sort((a,b)=>a.jornada-b.jornada); return p.length > 0 ? p.map(x => <Node key={x.id} p={x}/>) : esqC.map(x => <Node key={x.id} p={x}/>); })()}</div>
                <div className="w-52 flex flex-col justify-between py-14">{(() => { const p = partidos.filter(p => p.fase === 'semis').sort((a,b)=>a.jornada-b.jornada); return p.length > 0 ? p.map(x => <Node key={x.id} p={x}/>) : esqS.map(x => <Node key={x.id} p={x}/>); })()}</div>
                <div className="w-52 flex flex-col justify-center">{(() => { const p = partidos.find(p => p.fase === 'final'); return p ? <Node p={p}/> : <Node p={esqF}/>; })()}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ==========================================
// MÓDULO PÁDEL 
// ==========================================
function TorneosPadel() {
  const [torneos, setTorneos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cat, setCat] = useState('Oro'); 
  const [verNormativa, setVerNormativa] = useState(false);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const { data } = await supabase.from('torneos').select('*').eq('deporte', 'padel');
      if (data) setTorneos(data);
      setCargando(false);
    }
    cargar();
  }, []); 

  const mostrar = torneos.filter(t => t.nombre.toLowerCase().includes(cat.toLowerCase()));

  return (
    <div className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col items-center bg-cover bg-center bg-no-repeat animate-fade-in" style={{ backgroundImage: "url('/fondo-padel.jpg')", backgroundColor: '#0f172a' }}>
      <div className="absolute inset-0 bg-slate-900/80"></div>
      <div className="relative z-10 w-full max-w-4xl px-4 py-8 md:py-16">
        <div className="bg-[#1e293b]/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-10 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8 border-b border-slate-700/50 pb-4 uppercase tracking-widest flex items-center gap-3">
            <CircleDot className="text-amber-500" size={36}/> Torneos de Pádel
          </h2>
          
          <div className="flex bg-slate-800/80 p-1.5 rounded-xl mb-6 border border-slate-700 shadow-inner">
            <button onClick={() => setCat('Oro')} className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest rounded-lg transition-all ${cat === 'Oro' ? 'bg-amber-500 text-black shadow-lg scale-[1.02]' : 'text-slate-400 hover:text-white'}`}>🏆 Categoría Oro</button>
            <button onClick={() => setCat('Plata')} className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest rounded-lg transition-all ${cat === 'Plata' ? 'bg-slate-300 text-black shadow-lg scale-[1.02]' : 'text-slate-400 hover:text-white'}`}>🥈 Categoría Plata</button>
          </div>

          {/* === DESPLEGABLE DE NORMATIVA ÍNTEGRA === */}
          <div className="mb-10 bg-[#0f172a]/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg transition-all">
            <button 
              onClick={() => setVerNormativa(!verNormativa)} 
              className="w-full flex justify-between items-center p-4 hover:bg-slate-800/80 transition-colors text-slate-300 hover:text-white"
            >
              <span className="font-bold uppercase tracking-widest text-sm md:text-base flex items-center gap-2">
                📜 Normativa Oficial del Torneo
              </span>
              <span className="text-2xl font-black text-amber-500">{verNormativa ? '−' : '+'}</span>
            </button>
            
            {verNormativa && (
              <div className="p-5 md:p-8 bg-black/40 border-t border-slate-700 text-sm text-slate-300 space-y-6 max-h-[60vh] overflow-y-auto">
                
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest">TORNEO PÁDEL</h3>
                  <p>El presente reglamento interno tiene como objetivo establecer las normas de la competición[cite: 1].</p>
                  <p>Estas reglas deberán ser <span className="font-bold text-white">entendidas, conocidas y aceptadas</span> por la totalidad de los participantes, y así colaborar en un mejor desarrollo del torneo[cite: 1].</p>
                  <p>En cuanto al reglamento del juego de Pádel, y en todo lo que no contemple la presente normativa, se regirá por el reglamento oficial establecido por la Federación Española de Pádel[cite: 1].</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-amber-500 font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">1.- REQUISITOS PARA LOS PARTICIPANTES</h4>
                  <p>Podrán participar en el torneo todas aquellas personas que cumplan los siguientes requisitos[cite: 1]:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>1.1.- Abonar, previo al comienzo del torneo, el importe de la inscripción que se establezca por parte de la organización (<span className="text-amber-500 font-bold">10€ x jugador</span>)[cite: 1].</li>
                    <li>1.2.- Aceptar íntegramente la normativa que rige esta competición[cite: 1].</li>
                    <li>1.3.- Tener disponibilidad para la disputa de los partidos en los días y horarios que se establezcan[cite: 1].</li>
                    <li>1.4.- Disponer de teléfono móvil para mantener contacto con la Organización[cite: 1].</li>
                    <li>1.5.- Únicamente se podrá jugar el partido con las <span className="text-amber-500 font-bold">pelotas proporcionadas por la Organización o, en su defecto, pelotas nuevas a estrenar</span> para el partido si ambas parejas quisieran[cite: 1].</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-amber-500 font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">2.- INSCRIPCIONES, PRECIOS, DÍAS Y HORARIOS</h4>
                  <ul className="list-none space-y-2">
                    <li><span className="font-bold text-white">2.1.-</span> Los equipos estarán formados por dos jugadores y deberán aportar los datos correspondientes a nombre y apellidos de los dos participantes, D.N.I, teléfonos móviles y designación de capitán del mismo para poder establecer contacto directo con la Organización[cite: 1].</li>
                    <li><span className="font-bold text-white">2.2.-</span> La organización, una vez comprobada toda la información de las parejas inscritas, así como confirmado el pago de la inscripción será la competente para confirmar la inscripción de los equipos y se pondrá en contacto con los mismos para comunicarle las instrucciones necesarias que deberán saber para el transcurso del torneo[cite: 1].</li>
                    <li><span className="font-bold text-white">2.3.-</span> Se establecen como oficiales para jugar los partidos de liga cualquier día de la semana en <span className="text-amber-500 font-bold">horario de 20:00h a 23:00h</span>[cite: 1].</li>
                    <li><span className="font-bold text-white">2.4.-</span> Los partidos se disputarán en las <span className="text-amber-500 font-bold">instalaciones del polideportivo de Agost</span>. Nunca se podrán jugar partidos de liga en otras instalaciones. En ningún caso las fases finales se podrán jugar en otras instalaciones[cite: 1].</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-amber-500 font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">3.- EQUIPOS, ORGANIZACIÓN DE PARTIDOS Y ACTAS</h4>
                  <ul className="list-none space-y-2">
                    <li><span className="font-bold text-white">3.1.-</span> Cada equipo estará formado por dos jugadores siendo uno de estos el capitán, que será la persona de contacto con la organización y con los demás equipos para el caso de darse la circunstancia de tener que aplazar algún partido o cualquier otro motivo[cite: 1].</li>
                    <li><span className="font-bold text-white">3.2.- El capitán:</span> Además de lo mencionado anteriormente, los capitanes son de gran importancia para el buen funcionamiento del torneo. En la organización de los partidos, <span className="text-amber-500 font-bold">la pareja designada como local</span>, es decir, la que aparezca primera en el enfrentamiento (Juan/Pedro(C) VS Antonio/Carlos(C)), <span className="text-amber-500 font-bold">es la encargada</span> a través de su capitán de ponerse en contacto con la otra pareja para acordar la permuta del partido en caso de no poder jugarlo en el tiempo establecido. (No ser la pareja local no significa que no podamos llamar a la otra pareja para proponer el partido, es más, para agilizar los partidos deberíamos de hacerlo)[cite: 1].</li>
                    <li><span className="font-bold text-white">3.3.-</span> Al finalizar cada partido, el acta del partido se le pasará al organizador confirmando por ambas parejas que está todo correcto. En cualquier caso, el plazo máximo para rellenar el acta será de <span className="text-amber-500 font-bold">24 horas tras el transcurso del partido jugado</span>[cite: 1].</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-amber-500 font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">4.- DURACIÓN DE LOS PARTIDOS Y PUNTUACIÓN</h4>
                  <ul className="list-none space-y-2">
                    <li><span className="font-bold text-white">4.1.- El calentamiento.</span> El tiempo destinado al calentamiento es <span className="text-amber-500 font-bold">entre 5 y 10 minutos</span> contando desde la hora de inicio del partido. Si algún jugador llega tarde al partido el tiempo de calentamiento no variará, perdiendo éste su derecho a calentar[cite: 1].</li>
                    <li><span className="font-bold text-white">4.2.-</span> Todos los partidos se disputarán al <span className="text-amber-500 font-bold">mejor de 3 sets</span>. Cuando en cualquiera de los sets se produzca un empate a 6 juegos, se resolverá por el sistema de <span className="text-amber-500 font-bold">muerte súbita o tie break</span>[cite: 1].</li>
                    <li><span className="font-bold text-white">4.3.-</span> Sin perjuicio de lo expuesto en el apartado 4.2, la duración de cada partido no debe exceder de hora y media; sí transcurrido este tiempo ninguno de los equipos ha logrado ganar 2 sets y si la pista sigue libre y con la autorización de la Organización podrán continuar hasta finalizar, de lo contrario se deberá buscar una solución consensuada. Para evitar que los partidos se alarguen a más de 1h y media, <span className="text-red-400 font-bold text-base bg-red-500/10 px-1 rounded">todos los partidos serán a punto de oro</span>[cite: 1].</li>
                    <li>
                      <span className="font-bold text-white">4.4.- La puntuación del partido se aplicará de la siguiente forma[cite: 1]:</span>
                      <ul className="list-disc pl-8 mt-2 space-y-1">
                        <li>El equipo ganador obtendrá <span className="text-emerald-400 font-bold">3 puntos</span>[cite: 1].</li>
                        <li>El equipo perdedor obtendrá <span className="text-amber-500 font-bold">1 punto</span>[cite: 1].</li>
                        <li>Partido no jugado SIN RAZÓN NI PREVIO AVISO <span className="text-red-500 font-bold">-1 puntos</span> al equipo infractor[cite: 1].</li>
                      </ul>
                      <p className="mt-2 text-xs italic">La organización designará ganadores y perdedores en aquellos partidos que no se jueguen, analizando los motivos de ambas parejas y pudiendo establecer el empate[cite: 1].</p>
                    </li>
                    <li><span className="font-bold text-white">4.5.-</span> El arbitraje del partido se llevará a cabo entre los 4 jugadores, tratando de evitar posibles discusiones o enfrentamientos. En ningún caso ninguna persona ajena al partido podrá ejercer de árbitro, solo la Organización[cite: 1].</li>
                    <li>
                      <span className="font-bold text-white">4.6.-</span> En caso de empate a puntos al finalizar la Fase Regular entre dos o más equipos, el orden en la clasificación se resolverá atendiendo al <span className="text-amber-500 font-bold">resultado producido en los partidos jugados entre los equipos implicados directamente</span>[cite: 1]. Si persistiera el empate, se tendrá en cuenta y por este orden[cite: 1]:
                      <ul className="list-disc pl-8 mt-1">
                        <li><span className="text-white font-bold">Set-average</span> (sets a favor - sets en contra en el global de los partidos)[cite: 1]</li>
                        <li><span className="text-white font-bold">Juego-average</span> (juegos a favor - juegos en contra en el global de los partidos)[cite: 1]</li>
                        <li>Moneda al aire[cite: 1].</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-amber-500 font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">5.- APLAZAMIENTO DE PARTIDOS</h4>
                  <p><span className="font-bold text-white">5.1.-</span> El equipo que necesite aplazar un partido deberá ponerse en contacto con el capitán del equipo contrario con la mayor antelación posible notificándose dicho aplazamiento. Si el equipo contrario concede el aplazamiento, el siguiente paso será comunicarlo a la Organización[cite: 1].</p>
                  <p className="text-red-400 font-bold bg-red-500/10 p-2 rounded border border-red-500/20">
                    (Con menos de 24 horas de antelación el partido se dará por perdido)[cite: 1], siendo el equipo aplazante el responsable y por consiguiente, perdedor del partido, teniendo en cuenta que[cite: 1]:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>La primera opción que se ha de intentar será la permuta del partido por otro[cite: 1].</li>
                    <li>También existe la opción de jugar en horario de fin de semana el partido, aunque esto no debe ser tomado por costumbre y previamente notificado y acordado por los 4 jugadores y notificado a la Organización para que ésta aporte el visto bueno[cite: 1]. Si la pareja a la que le solicitan el aplazamiento no está conforme, por la razón que sea, de jugar en fin de semana y al final no puede llevarse a cabo el partido, <span className="text-red-400 font-bold">se daría por partido perdido a la pareja que no pudo jugar en el horario establecido</span> y por consiguiente victoria para la pareja rival[cite: 1].</li>
                    <li>En caso de quedar algún día libre entre medias podría negociarse el partido durante esas fechas[cite: 1].</li>
                  </ul>
                  <p>La organización tratará dentro de lo posible, acomodar los partidos aplazados en pistas que se hayan liberado por otros aplazamientos, por lo tanto es importante que todas las peticiones de pistas libres y aplazamientos sean comunicados a la organización con la mayor antelación posible[cite: 1].</p>
                  <p className="font-bold text-white">Salvo en casos de lesión de algún jugador, y con el fin de conseguir un buen funcionamiento de la liga, <span className="text-red-400">no se permitirán más de 4 aplazamientos por equipo</span>[cite: 1].</p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-amber-500 font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">6.- HORARIO DE JUEGO</h4>
                  <ul className="list-none space-y-2">
                    <li><span className="font-bold text-white">6.1.-</span> Como principio básico de la competición, esperamos el compromiso por parte de todos los jugadores de no ralentizar ni dificultar el desarrollo de los partidos y pedir el máximo respeto para el adversario[cite: 1].</li>
                    <li><span className="font-bold text-white">6.2.-</span> Los partidos comenzarán a la hora indicada en el calendario. Las parejas intentarán estar en las pistas de juego al menos con 10 minutos de antelación del horario del partido[cite: 1].</li>
                    <li><span className="font-bold text-white">6.3.-</span> Se establecen 10 minutos a partir de la hora de comienzo del partido, como el tiempo necesario para realizar el calentamiento previo al inicio del juego[cite: 1].</li>
                    <li><span className="font-bold text-white">6.4.-</span> Si pasados <span className="text-red-400 font-bold">10 minutos de la hora de comienzo</span> del partido algún jugador no estuviera presente sin causa justificada, se le dará el partido por perdido[cite: 1].</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-amber-500 font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">7.- SUSPENSIÓN DEL PARTIDO</h4>
                  <ul className="list-none space-y-2">
                    <li>
                      <span className="font-bold text-white">7.1.- Con el partido en juego[cite: 1]:</span>
                      <ul className="list-disc pl-8 mt-1 space-y-1">
                        <li>Si es por <span className="text-amber-500 font-bold">lesión</span> de un jugador y no puede terminar, <span className="text-amber-500 font-bold">ganará el equipo contrario</span>[cite: 1].</li>
                        <li>Si es por lluvia, falta de luz, rotura de la red, etc..., el partido se suspenderá debiendo ponerse de acuerdo los equipos para establecer el día y hora de continuación del mismo, teniendo en cuenta que <span className="text-amber-500 font-bold">se reanudará el partido con el mismo resultado que reflejaba el marcador cuando se suspendió</span>[cite: 1]. En este caso, la suspensión deberá ser puesta en conocimiento de la Organización, que tratará de proporcionales una pista[cite: 1].</li>
                      </ul>
                    </li>
                    <li><span className="font-bold text-white">7.2.-</span> Antes del partido, si se suspende por causa de fuerza mayor y existe acuerdo por parte de los dos equipos, cualquiera de los capitanes deberá ponerlo en conocimiento de la Organización, para tratar de consensuar una fecha en la que disputarlo[cite: 1].</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-amber-500 font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">8.- SUSTITUCIÓN DE JUGADORES Y EQUIPOS</h4>
                  <ul className="list-none space-y-2">
                    <li><span className="font-bold text-white">8.1.-</span> Como norma general, se procurará que el jugador sustituto sea de un nivel similar al del jugador sustituido. La organización se reserva el derecho de autorizar la sustitución[cite: 1].</li>
                    <li><span className="font-bold text-white">8.2.- Sustitución definitiva.</span> Si un equipo quiere sustituir a algún jugador para el resto de la competición, siempre que no sea por lesión o alguna otra causa de fuerza mayor, deberá solicitarlo a la Organización, la cual analizará los motivos que se aleguen y decidirá sobre su autorización[cite: 1]. <br/><span className="text-red-400 font-bold bg-red-500/10 px-1 mt-1 inline-block">Las sustituciones están permitidas durante la fase de LIGA GRUPOS o antes de los PLAY OFF finales, en ningún caso durante el transcurso de los PLAY OFF</span>[cite: 1].</li>
                    <li><span className="font-bold text-white">8.3.-</span> Si un equipo causa baja voluntaria durante el transcurso de la competición, perderá todos los derechos adquiridos, y la Organización podrá autorizar la incorporación de otro equipo que se encuentre en reserva, asumiendo el equipo entrante los puntos y el puesto en la clasificación que ostentaba el equipo saliente[cite: 1]. En el caso de que no se pueda sustituir, se anularán todos los resultados obtenidos por el equipo que abandona la competición dándole todos los partidos por perdido[cite: 1].</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-amber-500 font-black uppercase tracking-wider mt-6 border-b border-slate-700/50 pb-2">9.- PENALIZACIONES</h4>
                  <p><span className="font-bold text-white">9.1.-</span> Se establecen las letras W.O. como penalizaciones, distinguiendo entre falta leve (1 W.O.), falta grave (2 W.O.) y falta muy grave (3 W.O.), restando 1, 2 y 3 puntos respectivamente en la clasificación, independientemente de que conlleve la pérdida del partido o no[cite: 1]. <span className="text-red-400 font-bold">Si un equipo acumula 2 faltas muy graves supondrá la expulsión directa de la liga</span>[cite: 1].</p>
                  
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded">
                    <p><span className="font-bold text-amber-500">9.2.- Faltas Leves 1 W.O. restan 1 punto[cite: 1]:</span></p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Si un equipo aplaza un partido y no lo notifica a la Organización dentro del plazo establecido para hacerlo, aunque sea por motivo justificado[cite: 1].</li>
                      <li>Si el equipo aplazador por las circunstancias que sean no consigue jugar el partido en el tiempo establecido para hacerlo[cite: 1].</li>
                      <li>Realizar más de dos aplazamientos, consecutivos o no sin causa debidamente justificada[cite: 1].</li>
                    </ul>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded">
                    <p><span className="font-bold text-orange-500">9.3.- Faltas Graves 2 W.O. restan 2 puntos[cite: 1]:</span></p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>No entregar el acta del partido en tiempo y forma[cite: 1].</li>
                    </ul>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded">
                    <p><span className="font-bold text-red-500">9.4.- Faltas muy Graves restan 3 puntos[cite: 1]:</span></p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>No presentarse a un partido sin avisar al equipo contrario ni a la Organización, misma penalización si no se presenta ninguno de los dos equipos, en este caso el partido se considera nulo y no puntúa[cite: 1].</li>
                      <li>Si un equipo se presenta con un jugador no inscrito previamente o sin el visto bueno de la Organización para que actúe como sustituto. <span className="font-bold">Además perderá el partido por un doble 6-0</span>[cite: 1].</li>
                      <li>Comportamiento incorrecto, indecoroso, despectivo, violento o antideportivo por parte de los jugadores; la organización, dependiendo de la gravedad de los hechos se reserva la potestad para expulsar al equipo de la liga[cite: 1].</li>
                    </ul>
                  </div>

                  <p><span className="font-bold text-white">9.5.-</span> La organización se reserva el derecho de aplicar cualquier tipo de penalización aunque no esté contemplada en este apartado o cualquier otro cambio en el sistema[cite: 1].</p>
                  
                  <ul className="list-disc pl-5 text-xs text-slate-400 mt-4 border-t border-slate-700/50 pt-4">
                    <li>La organización se reserva el derecho de modificar cualquier punto de esta normativa siempre que lo considere justificado y de interés para la competición, notificándose a los equipos participantes con tiempo de antelación suficiente[cite: 1].</li>
                    <li>La organización no se hace responsable de cualquier lesión que pueda sufrir algún jugador durante la disputa de un partido, así como la pérdida o sustracción de cualquier objeto perteneciente a los mismos, ni de las consecuencias derivadas de cualquier disputa o enfrentamiento que pueda surgir entre los jugadores[cite: 1].</li>
                  </ul>
                </div>

              </div>
            )}
          </div>
          {/* === FIN DESPLEGABLE === */}

          {cargando ? <p className="text-[#60A5FA] animate-pulse font-bold tracking-widest uppercase text-sm">Cargando...</p> : mostrar.length === 0 ? <p className="text-slate-400">No hay torneos registrados en esta categoría.</p> : (
            <div className="grid gap-5">
              {mostrar.map((torneo) => (
                <div key={torneo.id} className="bg-[#0f172a]/90 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-slate-400 transition-colors shadow-lg">
                  <div className="text-center md:text-left"><h3 className="text-xl md:text-2xl font-black text-white mb-1">{torneo.nombre}</h3><span className="text-xs text-[#60A5FA] uppercase tracking-widest font-black">{torneo.estado}</span></div>
                  <Link to={`/torneo-padel/${torneo.id}`} className="bg-[#60A5FA] hover:bg-blue-500 text-black px-8 py-3.5 rounded font-black uppercase tracking-widest transition-all w-full md:w-auto text-center shadow-[0_0_15px_rgba(96,165,250,0.3)]">Ver Competición</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CuadroPadel() {
  const { torneoId } = useParams();
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      const { data: g } = await supabase.from('grupos').select(`id, nombre, grupo_participantes(participantes(id, nombre))`).eq('torneo_id', torneoId);
      const { data: p } = await supabase.from('partidos').select(`id, estado, ubicacion, puntuacion_local, puntuacion_visitante, detalle_resultado, fase, jornada, hora, local_id, visitante_id, local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre)`).eq('torneo_id', torneoId);
      if (g) setGrupos(g); if (p) setPartidos(p);
      setCargando(false);
    }
    cargar();
  }, [torneoId]);

  const calcularStats = (id) => {
    let s = { pj: 0, pg: 0, pe: 0, pp: 0, pts: 0, gf: 0, gc: 0, dif: 0 };
    
    partidos.filter(p => p.fase === 'grupos' && p.estado === 'finalizado' && (p.local_id === id || p.visitante_id === id)).forEach(p => {
      s.pj++;
      
      // Forzamos que sean Números (Number) para evitar errores de Javascript
      const gf = Number(p.local_id === id ? p.puntuacion_local : p.puntuacion_visitante);
      const gc = Number(p.local_id === id ? p.puntuacion_visitante : p.puntuacion_local);
      
      s.gf += gf; 
      s.gc += gc;
      
      // REGLA PÁDEL OFICIAL: 3 puntos al ganador, 1 punto al perdedor
      if (gf > gc) { 
        s.pts += 3; 
        s.pg++; 
      } else if (gf === gc) { 
        s.pts += 1; 
        s.pe++; 
      } else { 
        s.pts += 1; // ¡AQUÍ ESTÁ EL PUNTO DEL PERDEDOR!
        s.pp++; 
      } 
    });
    
    s.dif = s.gf - s.gc; 
    return s;
  };

  // ==============================================
  // DISEÑO DE MARCADOR "ESTILO PREMIER PADEL"
  // ==============================================
  const Node = ({ p }) => {
    let setsL = []; let setsV = [];
    if (p?.detalle_resultado) {
      const matchSets = p.detalle_resultado.split(',').map(s => s.trim().split(/[-/ ]+/));
      setsL = matchSets.map(s => s[0] || '-');
      setsV = matchSets.map(s => s[1] || '-');
    }

    return (
      <div className="bg-[#0f172a] border border-slate-700/50 rounded-lg shadow-2xl relative w-64 overflow-hidden flex flex-col transition-all hover:border-slate-500">
        <div className="text-[9px] font-black uppercase flex justify-between items-center bg-slate-800/80 px-3 py-1.5 text-slate-400">
          <span>{p?.hora || ''} {p?.ubicacion || 'Por definir'}</span>
          <span className={p?.estado === 'finalizado' ? 'text-emerald-500' : ''}>{p?.estado === 'pendiente' ? 'vs' : p?.estado === 'finalizado' ? 'FIN' : '---'}</span>
        </div>
        
        <div className="flex-1 flex bg-[#111c2e]">
           <div className="flex-1 p-2 flex flex-col justify-around min-w-0">
              <span className={`font-bold text-[11px] truncate ${p?.puntuacion_local > p?.puntuacion_visitante ? 'text-white' : 'text-slate-400'}`}>{p?.local?.nombre || 'Esperando...'}</span>
              <div className="h-[1px] w-full bg-slate-700/50 my-1"></div>
              <span className={`font-bold text-[11px] truncate ${p?.puntuacion_visitante > p?.puntuacion_local ? 'text-white' : 'text-slate-400'}`}>{p?.visitante?.nombre || 'Esperando...'}</span>
           </div>

           <div className="flex bg-[#1e2b40] px-1 py-1.5 border-l border-slate-700/50">
              <div className="flex flex-col justify-around px-2 border-r border-slate-700/50 font-black text-white text-sm">
                 <span>{p?.estado === 'finalizado' ? p.puntuacion_local : '-'}</span>
                 <span>{p?.estado === 'finalizado' ? p.puntuacion_visitante : '-'}</span>
              </div>
              {p?.estado === 'finalizado' && setsL.map((s, i) => (
                <div key={i} className="flex flex-col justify-around px-1.5 text-slate-400 font-bold text-xs text-center min-w-[20px]">
                  <span className={parseInt(setsL[i]) > parseInt(setsV[i]) ? 'text-white' : ''}>{setsL[i]}</span>
                  <span className={parseInt(setsV[i]) > parseInt(setsL[i]) ? 'text-white' : ''}>{setsV[i]}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  const esqP = [{ id: 'p1', hora: '20:30', ubicacion: 'Pista N/V', local: { nombre: '2º Grupo A' }, visitante: { nombre: '3º Grupo C' } }, { id: 'p2', hora: '20:30', ubicacion: 'Pista N/V', local: { nombre: '2º Grupo B' }, visitante: { nombre: '3º Grupo D' } }, { id: 'p3', hora: '22:00', ubicacion: 'Pista N/V', local: { nombre: '2º Grupo C' }, visitante: { nombre: '3º Grupo A' } }, { id: 'p4', hora: '22:00', ubicacion: 'Pista N/V', local: { nombre: '2º Grupo D' }, visitante: { nombre: '3º Grupo B' } }];
  const esqC = [{ id: 'c1', hora: '20:00', ubicacion: 'Pista N/V', local: { nombre: '1º Grupo A' }, visitante: { nombre: 'G. Playoff 1' } }, { id: 'c2', hora: '20:00', ubicacion: 'Pista N/V', local: { nombre: '1º Grupo C' }, visitante: { nombre: 'G. Playoff 2' } }, { id: 'c3', hora: '22:00', ubicacion: 'Pista N/V', local: { nombre: '1º Grupo B' }, visitante: { nombre: 'G. Playoff 3' } }, { id: 'c4', hora: '22:00', ubicacion: 'Pista N/V', local: { nombre: '1º Grupo D' }, visitante: { nombre: 'G. Playoff 4' } }];
  const esqS = [{ id: 's1', hora: '20:30', ubicacion: 'Pista N/V', local: { nombre: 'Ganador C1' }, visitante: { nombre: 'Ganador C2' } }, { id: 's2', hora: '22:00', ubicacion: 'Pista N/V', local: { nombre: 'Ganador C3' }, visitante: { nombre: 'Ganador C4' } }];
  const esqF = { id: 'f1', hora: 'Por Conf.', ubicacion: 'Pista N/V', local: { nombre: 'Ganador Semi 1' }, visitante: { nombre: 'Ganador Semi 2' } };

  if (cargando) return <div className="text-center text-slate-400 mt-20 animate-pulse">Cargando torneo...</div>;

  const jornadasGrupos = [...new Set(partidos.filter(p => p.fase === 'grupos').map(p => p.jornada))].sort((a, b) => a - b);

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      <button onClick={() => navigate(-1)} className="mb-8 text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2">← Volver a torneos</button>
      <div className="space-y-24">
        
        {/* 1. CLASIFICACIÓN PÁDEL */}
        <section>
          <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-blue-500 pl-4">Clasificación</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {grupos.map((g) => {
              const eq = g.grupo_participantes.map(gp => ({ ...gp.participantes, stats: calcularStats(gp.participantes.id) })).sort((a, b) => b.stats.pts - a.stats.pts || b.stats.dif - a.stats.dif || b.stats.gf - a.stats.gf);
              return (
                <div key={g.id} className="bg-[#1e293b] rounded-xl overflow-hidden border border-slate-800">
                  <div className="bg-black/20 px-5 py-3 text-blue-400 text-xs font-bold uppercase tracking-widest">{g.nombre}</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12px] whitespace-nowrap">
                      <thead className="bg-[#0f172a]/50 uppercase font-bold text-slate-500">
                        <tr>
                          <th className="px-3 py-3 text-center">#</th>
                          <th className="px-3 py-3">Equipo</th>
                          <th className="px-3 py-3 text-center text-white" title="Puntos (3 Victoria, 1 Derrota)">Pts</th>
                          <th className="px-3 py-3 text-center">PJ</th>
                          <th className="px-3 py-3 text-center text-emerald-500/70" title="Sets a Favor">SF</th>
                          <th className="px-3 py-3 text-center text-red-500/70" title="Sets en Contra">SC</th>
                          <th className="px-3 py-3 text-center text-slate-300" title="Diferencia de Sets">+/-</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50 text-slate-300">
                        {eq.map((e, index) => (
                          <tr key={e.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-3 py-3 text-center text-slate-600 font-bold">{index + 1}</td>
                            <td className="px-3 py-3 font-bold text-white">
                              <div className="flex items-center gap-2">
                                {index === 0 && e.stats.pts > 0 && <span className="text-yellow-500">👑</span>}
                                <span className="truncate max-w-[120px]">{e.nombre}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-center font-black text-blue-400 text-[14px]">{e.stats.pts}</td>
                            <td className="px-3 py-3 text-center text-slate-400">{e.stats.pj}</td>
                            <td className="px-3 py-3 text-center text-emerald-500/70">{e.stats.gf}</td>
                            <td className="px-3 py-3 text-center text-red-500/70">{e.stats.gc}</td>
                            <td className={`px-3 py-3 text-center font-bold ${e.stats.dif > 0 ? 'text-emerald-500' : e.stats.dif < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                              {e.stats.dif > 0 ? `+${e.stats.dif}` : e.stats.dif}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. CALENDARIO FASE DE GRUPOS */}
        {jornadasGrupos.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-l-4 border-blue-500 pl-4">Calendario de Grupos</h2>
            <div className="grid gap-8">
              {jornadasGrupos.map(jornada => {
                const nombresJornadas = { 1: "J1. LUNES 15/07", 2: "J2. MIÉRCOLES 17/07", 3: "J3. VIERNES 19/07", 4: "J4. LUNES 22/07", 5: "J5. MIÉRCOLES 24/07", 6: "J6. JUEVES 18/07 (ESPECIAL)" };
                return (
                  <div key={jornada} className="bg-[#1e293b]/50 rounded-xl border border-slate-800 p-6 shadow-md">
                    <h3 className="text-blue-400 font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2 border-b border-slate-700/50 pb-3">
                      <span>🕒</span> {nombresJornadas[jornada] || `Jornada ${jornada}`}
                    </h3>
                    <div className="flex flex-wrap gap-5">
                      {partidos.filter(p => p.fase === 'grupos' && p.jornada === jornada).sort((a, b) => a.hora.localeCompare(b.hora)).map(p => (
                        <Node key={p.id} p={p} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. FASE FINAL */}
        <section>
          <h2 className="text-xl font-black text-white mb-10 uppercase tracking-widest border-l-4 border-blue-500 pl-4">Fase Final</h2>
          <div className="overflow-x-auto pb-8 scrollbar-hide">
            <div className="min-w-max">
              <div className="flex gap-12 mb-6">
                <div className="w-64 text-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Playoffs (Previa)</span></div>
                <div className="w-64 text-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cuartos de Final</span></div>
                <div className="w-64 text-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Semifinales</span></div>
                <div className="w-64 text-center"><span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Gran Final</span></div>
              </div>
              <div className="flex gap-12 items-stretch relative">
                <div className="w-64 flex flex-col gap-6">{(() => { const p = partidos.filter(p => p.fase === 'playoffs').sort((a,b)=>a.jornada-b.jornada); return p.length > 0 ? p.map(x => <Node key={x.id} p={x}/>) : esqP.map(x => <Node key={x.id} p={x}/>); })()}</div>
                <div className="w-64 flex flex-col gap-6">{(() => { const p = partidos.filter(p => p.fase === 'cuartos').sort((a,b)=>a.jornada-b.jornada); return p.length > 0 ? p.map(x => <Node key={x.id} p={x}/>) : esqC.map(x => <Node key={x.id} p={x}/>); })()}</div>
                <div className="w-64 flex flex-col justify-between py-14">{(() => { const p = partidos.filter(p => p.fase === 'semis').sort((a,b)=>a.jornada-b.jornada); return p.length > 0 ? p.map(x => <Node key={x.id} p={x}/>) : esqS.map(x => <Node key={x.id} p={x}/>); })()}</div>
                <div className="w-64 flex flex-col justify-center">{(() => { const p = partidos.find(p => p.fase === 'final'); return p ? <Node p={p}/> : <Node p={esqF}/>; })()}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


// ==========================================
// PANEL DE ADMINISTRACIÓN (Adaptado a Pádel)
// ==========================================
function PanelAdmin() {
  const [torneos, setTorneos] = useState([]);
  const [partidosPendientes, setPartidosPendientes] = useState([]);

  const cargarDatos = async () => {
    const { data: t } = await supabase.from('torneos').select('*');
    setTorneos(t || []);
    const { data: p } = await supabase.from('partidos').select(`id, ubicacion, fase, jornada, hora, torneo:torneos(nombre, deporte), local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre)`).eq('estado', 'pendiente').order('torneo_id');
    setPartidosPendientes(p || []);
  };

  useEffect(() => { cargarDatos(); }, []);

  const guardarResultado = async (id, l, v, detalle = null) => {
    const payload = { puntuacion_local: parseInt(l), puntuacion_visitante: parseInt(v), estado: 'finalizado' };
    if (detalle) payload.detalle_resultado = detalle;
    const { error } = await supabase.from('partidos').update(payload).eq('id', id);
    if (!error) cargarDatos();
  };

  // ========================================================
  // GENERADOR AUTOMÁTICO: TORNEO 24 HORAS
  // ========================================================
  const generarTorneo24h = async () => {
    try {
      // 1. Crear el torneo
      const { data: torneo, error: errTorneo } = await supabase
        .from('torneos')
        .insert([{ nombre: 'Torneo 24h 2026', deporte: 'futsal', estado: 'Inscripciones cerradas' }])
        .select();
      
      if (errTorneo || !torneo) throw new Error("Error creando torneo: " + errTorneo?.message);
      const tId = torneo[0].id;

      // 2. Crear los Grupos
      const { data: grupos, error: errGrupos } = await supabase
        .from('grupos')
        .insert([
          { torneo_id: tId, nombre: 'GRUPO A' },
          { torneo_id: tId, nombre: 'GRUPO B' },
          { torneo_id: tId, nombre: 'GRUPO C' }
        ])
        .select();

      if (errGrupos) throw new Error("Error creando grupos");

      const gA = grupos.find(g => g.nombre === 'GRUPO A').id;
      const gB = grupos.find(g => g.nombre === 'GRUPO B').id;
      const gC = grupos.find(g => g.nombre === 'GRUPO C').id;

      // 3. Crear los 12 Equipos
      const nombresEquipos = [
        'WEST JAMON', 'MINAVO DE KIEV', 'CATICARDIAS', 'EL SEQUET', // Grupo A
        'K.91', 'KAULA Y ELIXIR', 'FZ FITNESS', 'FRAN GONZALEZ (LACADOS)', // Grupo B
        'GREÑAS FC', 'MOROS VELLS', 'ANIS TENIS FC', 'METETE QUE TE SALGO' // Grupo C
      ];

      // Usamos upsert por si algún equipo ya existía en la base de datos de otro torneo
      const { data: equipos, error: errEquipos } = await supabase
        .from('participantes')
        .upsert(nombresEquipos.map(nombre => ({ nombre })), { onConflict: 'nombre' })
        .select();

      if (errEquipos) throw new Error("Error creando equipos");

      const idEq = (nombreBusqueda) => equipos.find(e => e.nombre === nombreBusqueda).id;

      // 4. Asignar equipos a sus grupos
      await supabase.from('grupo_participantes').insert([
        { grupo_id: gA, participante_id: idEq('WEST JAMON') }, { grupo_id: gA, participante_id: idEq('MINAVO DE KIEV') },
        { grupo_id: gA, participante_id: idEq('CATICARDIAS') }, { grupo_id: gA, participante_id: idEq('EL SEQUET') },
        { grupo_id: gB, participante_id: idEq('K.91') }, { grupo_id: gB, participante_id: idEq('KAULA Y ELIXIR') },
        { grupo_id: gB, participante_id: idEq('FZ FITNESS') }, { grupo_id: gB, participante_id: idEq('FRAN GONZALEZ (LACADOS)') },
        { grupo_id: gC, participante_id: idEq('GREÑAS FC') }, { grupo_id: gC, participante_id: idEq('MOROS VELLS') },
        { grupo_id: gC, participante_id: idEq('ANIS TENIS FC') }, { grupo_id: gC, participante_id: idEq('METETE QUE TE SALGO') }
      ]);

      // 5. Crear el Calendario de Partidos (Fase Grupos)
      const partidos = [
        { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '19:30', ubicacion: 'Pabellón', local_id: idEq('CATICARDIAS'), visitante_id: idEq('MINAVO DE KIEV') },
        { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '19:30', ubicacion: 'Pista Exterior', local_id: idEq('EL SEQUET'), visitante_id: idEq('WEST JAMON') },
        { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '20:20', ubicacion: 'Pabellón', local_id: idEq('FZ FITNESS'), visitante_id: idEq('KAULA Y ELIXIR') },
        { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '20:20', ubicacion: 'Pista Exterior', local_id: idEq('FRAN GONZALEZ (LACADOS)'), visitante_id: idEq('K.91') },
        { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '21:10', ubicacion: 'Pabellón', local_id: idEq('ANIS TENIS FC'), visitante_id: idEq('MOROS VELLS') },
        { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '21:10', ubicacion: 'Pista Exterior', local_id: idEq('METETE QUE TE SALGO'), visitante_id: idEq('GREÑAS FC') },
        { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '22:00', ubicacion: 'Pabellón', local_id: idEq('WEST JAMON'), visitante_id: idEq('CATICARDIAS') },
        { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '22:00', ubicacion: 'Pista Exterior', local_id: idEq('MINAVO DE KIEV'), visitante_id: idEq('EL SEQUET') },
        { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '22:50', ubicacion: 'Pabellón', local_id: idEq('K.91'), visitante_id: idEq('FZ FITNESS') },
        { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '22:50', ubicacion: 'Pista Exterior', local_id: idEq('KAULA Y ELIXIR'), visitante_id: idEq('FRAN GONZALEZ (LACADOS)') },
        { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '23:40', ubicacion: 'Pabellón', local_id: idEq('MOROS VELLS'), visitante_id: idEq('METETE QUE TE SALGO') },
        { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '23:40', ubicacion: 'Pista Exterior', local_id: idEq('GREÑAS FC'), visitante_id: idEq('ANIS TENIS FC') },
        { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '00:30', ubicacion: 'Pabellón', local_id: idEq('MINAVO DE KIEV'), visitante_id: idEq('WEST JAMON') },
        { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '00:30', ubicacion: 'Pista Exterior', local_id: idEq('EL SEQUET'), visitante_id: idEq('CATICARDIAS') },
        { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '01:20', ubicacion: 'Pabellón', local_id: idEq('KAULA Y ELIXIR'), visitante_id: idEq('K.91') },
        { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '01:20', ubicacion: 'Pista Exterior', local_id: idEq('FRAN GONZALEZ (LACADOS)'), visitante_id: idEq('FZ FITNESS') },
        { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '02:10', ubicacion: 'Pabellón', local_id: idEq('MOROS VELLS'), visitante_id: idEq('GREÑAS FC') },
        { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '02:10', ubicacion: 'Pista Exterior', local_id: idEq('METETE QUE TE SALGO'), visitante_id: idEq('ANIS TENIS FC') }
      ];

      const { error: errPartidos } = await supabase.from('partidos').insert(partidos);
      if (errPartidos) throw new Error("Error creando partidos");

      return true; // Todo salió bien
    } catch (error) {
      console.error(error);
      alert(error.message);
      return false;
    }
  };

  const handleGenerar = async (nombreTorneo) => {
    if (nombreTorneo === 'Torneo 24h 2026') {
      const confirmacion = window.confirm(`⚡ ¿Estás seguro de que quieres crear y generar toda la estructura para el ${nombreTorneo}?`);
      if (!confirmacion) return;

      // Mostramos un mensajito de carga (opcional, pero queda bien)
      const btn = document.activeElement;
      const textoOriginal = btn.innerText;
      btn.innerText = "⏳ Generando...";
      btn.disabled = true;

      const exito = await generarTorneo24h();
      
      btn.innerText = textoOriginal;
      btn.disabled = false;

      if (exito) {
        alert('✅ ¡Torneo 24h generado con éxito en la base de datos!');
        cargarDatos(); // Recarga la lista de partidos pendientes
      }
    } else {
      alert(`🛠️ La generación automática para ${nombreTorneo} la conectaremos en el siguiente paso.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 mt-8 px-4 space-y-12">
      
      {/* === HERRAMIENTAS AUTOMÁTICAS === */}
      <div className="bg-[#1e293b] p-6 md:p-8 rounded-2xl border border-slate-700 shadow-xl">
        <h3 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-widest flex items-center gap-3">
          <Zap className="text-[#60A5FA]" size={28} /> Herramientas Automáticas
        </h3>
        <p className="text-slate-400 text-sm mb-8 font-medium">Genera la estructura de partidos y cruces para las competiciones activas.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => handleGenerar('Torneo Oro')} 
            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 p-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            🏆 Generar Torneo Oro
          </button>
          
          <button 
            onClick={() => handleGenerar('Torneo Plata')} 
            className="bg-slate-400/10 hover:bg-slate-400/20 text-slate-300 border border-slate-400/30 p-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            🥈 Generar Torneo Plata
          </button>
          
          <button 
            onClick={() => handleGenerar('Liga Futsal Verano 2026')} 
            className="bg-[#60A5FA]/10 hover:bg-[#60A5FA]/20 text-[#60A5FA] border border-[#60A5FA]/30 p-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            ⚽ Generar Futsal Verano
          </button>
          
          <button 
            onClick={() => handleGenerar('Torneo 24h 2026')} 
            className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 p-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            ⚡ Generar Torneo 24h
          </button>
        </div>
      </div>

      {/* === RESULTADOS PENDIENTES === */}
      <div>
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-wider flex items-center gap-3">
          <Target className="text-[#60A5FA]" /> Resultados Pendientes ({partidosPendientes.length})
        </h2>
        <div className="space-y-4">
          {partidosPendientes.map(p => (
            <div key={p.id} className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center gap-4 justify-between shadow-lg">
              <div className="flex-1 w-full text-center md:text-left">
                <span className="bg-[#60A5FA] text-black text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest">{p.torneo.nombre}</span>
                <div className="text-white font-bold mt-1.5 text-lg">{p?.local?.nombre || 'Esperando...'} <span className="text-slate-500 mx-1">vs</span> {p?.visitante?.nombre || 'Esperando...'}</div>
                <span className="text-slate-400 text-xs font-medium uppercase tracking-widest">{p.fase} · {p.hora} · {p.ubicacion}</span>
              </div>
              
              {p.local && p.visitante ? (
                <form className="flex flex-col gap-3 w-full md:w-auto bg-slate-800/50 p-3 rounded-lg border border-slate-700" onSubmit={(e) => { 
                  e.preventDefault(); 
                  guardarResultado(p.id, e.target.l.value, e.target.v.value, e.target.detalle ? e.target.detalle.value : null); 
                }}>
                  <div className="flex justify-center md:justify-end items-center gap-3">
                    <div className="flex flex-col items-center"><span className="text-[10px] text-slate-400 font-bold uppercase mb-1">{p.torneo.deporte === 'padel' ? 'Sets Local' : 'Local'}</span><input name="l" type="number" required min="0" max={p.torneo.deporte === 'padel' ? 2 : 99} className="w-12 h-10 bg-black border border-slate-600 rounded text-center text-white font-black" /></div>
                    <span className="text-slate-500 font-black mt-4">-</span>
                    <div className="flex flex-col items-center"><span className="text-[10px] text-slate-400 font-bold uppercase mb-1">{p.torneo.deporte === 'padel' ? 'Sets Vis.' : 'Visitante'}</span><input name="v" type="number" required min="0" max={p.torneo.deporte === 'padel' ? 2 : 99} className="w-12 h-10 bg-black border border-slate-600 rounded text-center text-white font-black" /></div>
                  </div>
                  {p.torneo.deporte === 'padel' && (
                    <input name="detalle" type="text" placeholder="Ej: 6-4, 4-6, 7-6" className="w-full bg-black border border-slate-600 rounded p-2 text-center text-xs text-white uppercase tracking-wider focus:border-amber-500 outline-none" required/>
                  )}
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2 rounded text-xs transition-colors uppercase tracking-widest shadow-lg">Guardar Partido</button>
                </form>
              ) : (
                <div className="text-xs font-bold text-amber-500 uppercase tracking-widest px-4 py-2 border border-amber-500/30 rounded bg-amber-500/10 whitespace-nowrap">Faltan Clasificados</div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function SobreNosotros() {
  return (
    <div className="w-full flex flex-col items-center bg-[#0f172a] animate-fade-in pb-20 relative">
      <div className="relative w-full h-[40vh] md:h-[50vh] flex flex-col items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/fondo-gym.jpg')" }}>
        <div className="absolute inset-0 bg-slate-900/80"></div>
        <div className="relative z-10 text-center px-4 mt-10">
          <Dumbbell className="w-12 h-12 md:w-16 md:h-16 text-[#60A5FA] mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase mb-4 drop-shadow-lg">Sobre Nosotros</h1>
          <p className="text-[#60A5FA] font-bold tracking-widest uppercase text-sm md:text-base">Pasión por el deporte en Agost</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 space-y-24 w-full relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-8 uppercase tracking-wider">¿Qué es Activa Fitness?</h2>
          <p className="text-slate-400 text-lg leading-relaxed">Nacimos con un objetivo claro: ofrecer a los vecinos de Agost y alrededores unas instalaciones deportivas de primer nivel. No somos solo un gimnasio, somos una comunidad donde el esfuerzo, la constancia y el compañerismo se unen para ayudarte a alcanzar tu mejor versión.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { Icon: Target, title: "Nuestra Misión", desc: "Fomentar un estilo de vida saludable y activo a través de un entrenamiento de calidad, instalaciones modernas y una atención cercana." },
            { Icon: Dumbbell, title: "Instalaciones", desc: "Contamos con zona de musculación, salas para clases dirigidas, pistas de pádel exteriores y un pabellón preparado." },
            { Icon: CircleDot, title: "Comunidad", desc: "Organizamos torneos regulares de Fútbol Sala y Pádel, creando un ambiente competitivo y sano entre participantes." }
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="bg-[#1e293b] border border-slate-700/50 p-8 rounded-2xl hover:border-[#60A5FA] transition-colors shadow-xl group">
              <Icon className="w-12 h-12 text-[#60A5FA] mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4">{title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a] text-slate-200 flex flex-col relative">
        
        {/* === CABECERA FINA CON EFECTO DIFUMINADO === */}
        <header className="fixed top-0 w-full flex justify-start items-center p-4 md:px-8 bg-[#0b1121]/70 backdrop-blur-md border-b border-white/10 z-50 shadow-lg h-14 md:h-16 transition-all">
          
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)} 
            className="p-2 bg-[#1e293b]/80 text-white rounded-lg shadow-lg border border-white/10 hover:text-[#60A5FA] hover:border-[#60A5FA]/50 transition-all z-10"
          >
            {menuAbierto ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link 
            to="/" 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group" 
            onClick={() => setMenuAbierto(false)}
          >
            <img 
              src="/logo.png" 
              alt="Activa Fitness" 
              className="h-20 md:h-32 w-auto object-contain group-hover:scale-110 transition-transform drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" 
            />
          </Link>
        </header>

        <div className="h-14 md:h-16"></div>

        {/* === MENÚ LATERAL CON EFECTO DIFUMINADO (SIDEBAR) === */}
        <div>
          {menuAbierto && (
            <div className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm transition-opacity" onClick={() => setMenuAbierto(false)}></div>
          )}
          
          <div className={`fixed top-0 left-0 h-full w-72 bg-[#1e293b]/70 backdrop-blur-md border-r border-white/10 z-40 transform transition-transform duration-300 ease-in-out shadow-2xl pt-32 px-6 ${menuAbierto ? 'translate-x-0' : '-translate-x-full'}`}>
            <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Secciones</h3>
            
            <div className="space-y-3">
              <Link to="/" onClick={() => setMenuAbierto(false)} className="flex items-center gap-4 text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-xl font-bold transition-all group border border-transparent hover:border-white/10">
                <div className="bg-[#60A5FA]/10 p-2 rounded-lg text-[#60A5FA] group-hover:bg-[#60A5FA]/20 group-hover:scale-110 transition-all">
                  <Dumbbell size={24} />
                </div> 
                Gimnasio
              </Link>
              <Link to="/futsal" onClick={() => setMenuAbierto(false)} className="flex items-center gap-4 text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-xl font-bold transition-all group border border-transparent hover:border-white/10">
                <div className="bg-[#60A5FA]/10 p-2 rounded-lg text-[#60A5FA] group-hover:bg-[#60A5FA]/20 group-hover:scale-110 transition-all">
                  <IconoFutsal />
                </div> 
                Futsal
              </Link>
              <Link to="/padel" onClick={() => setMenuAbierto(false)} className="flex items-center gap-4 text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-xl font-bold transition-all group border border-transparent hover:border-white/10">
                <div className="bg-[#60A5FA]/10 p-2 rounded-lg text-[#60A5FA] group-hover:bg-[#60A5FA]/20 group-hover:scale-110 transition-all">
                  <IconoPadel />
                </div> 
                Pádel
              </Link>
              <Link to="/nosotros" onClick={() => setMenuAbierto(false)} className="flex items-center gap-4 text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-xl font-bold transition-all group border border-transparent hover:border-white/10">
                <div className="bg-[#60A5FA]/10 p-2 rounded-lg text-[#60A5FA] group-hover:bg-[#60A5FA]/20 group-hover:scale-110 transition-all">
                  <Users size={24} />
                </div> 
                Sobre Nosotros
              </Link>
            </div>
            
            <div className="absolute bottom-8 left-6 right-6 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest border-t border-white/10 pt-4">
              Centro Deportivo Agost
            </div>
          </div>
        </div>

        {/* === CONTENIDO PRINCIPAL === */}
        <main className="w-full flex-grow relative">
          <Routes>
            <Route path="/" element={
              <div className="animate-fade-in w-full bg-white text-slate-800 pb-24">
                <div className="relative h-[calc(100vh-4rem)] flex flex-col items-center justify-end pb-12 md:pb-20 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/fondo-gym.jpg')" }}>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-8 w-full px-6 justify-center">
                    {[ { to: "/futsal", label: "Torneo Futsal" }, { to: "/nosotros", label: "Sobre Nosotros" }, { to: "/padel", label: "Torneo Pádel" } ].map(({to, label}) => (
                      <Link key={to} to={to} className="bg-[#60A5FA] text-black text-xs md:text-sm font-black uppercase tracking-widest py-4 px-8 text-center hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_20px_rgba(96,165,250,0.3)] w-full md:w-64">
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 pt-24 space-y-32">
                  <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative max-w-md mx-auto w-full">
                      <div className="absolute inset-0 bg-[#60A5FA] rounded-[3rem] translate-x-4 translate-y-4"></div>
                      <div className="relative bg-white border-[3px] border-black rounded-[3rem] p-10 space-y-6 text-sm font-medium">
                        <h3 className="text-[#60A5FA] text-2xl font-black italic text-center mb-8 uppercase">Gimnasio en Agost</h3>
                        {[ 
                          { Icon: Clock, title: "Lunes a viernes", desc: "8:00-14:00 | 15:30-22:00" }, 
                          { Icon: Clock, title: "Sábados", desc: "8:00 - 14:00" }, 
                          { Icon: Phone, desc: "676 681 910" }, 
                          { Icon: Mail, desc: "activafitnessagost@gmail.com" }, 
                          { Icon: MapPin, desc: "Polideportivo Municipal, Agost" } 
                        ].map(({Icon, title, desc}, i) => (
                          <div key={i} className="flex gap-4 items-center">
                            <Icon fill="black" stroke={i === 2 ? "black" : "white"} size={24} className="flex-shrink-0" />
                            <div>{title && <p className="font-bold text-black">{title}</p>}<p>{desc}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-12 pl-4">
                      {["Zona de Musculación", "Clases dirigidas"].map((title, i) => (
                        <div key={title}>
                          <h3 className="flex items-center gap-4 text-3xl md:text-4xl font-bold font-serif italic uppercase text-black mb-6 tracking-wide">
                            <div className="w-6 h-6 rounded-full bg-[#60A5FA] flex-shrink-0"></div>{title}
                          </h3>
                          {i === 1 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4 font-bold font-serif text-sm md:text-base text-black">
                              {["PILATES", "FIT", "A.B.D", "CICLO", "FUNCIONAL / TRX", "PUMP", "G.A.P"].map(clase => (
                                <div key={clase} className="flex items-center gap-3">
                                  <div className="w-3.5 h-3.5 rounded-full bg-[#60A5FA] flex-shrink-0"></div>{clase}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-16 pt-10 pb-16 max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                      <div className="flex-shrink-0"><Users size={80} className="text-[#60A5FA]" strokeWidth={1.5} /></div>
                      <div>
                        <h3 className="text-[#60A5FA] text-3xl font-bold font-serif italic uppercase mb-4 tracking-wide">Asesoramiento Profesional</h3>
                        <p className="text-black font-bold font-serif italic uppercase leading-relaxed text-sm md:text-base tracking-wide">Contamos con profesionales disponibles en cualquier momento para ayudarte en todo lo que sea necesario</p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                      <div className="flex-shrink-0"><Heart size={80} className="text-[#60A5FA]" fill="#60A5FA" strokeWidth={1} /></div>
                      <div>
                        <h3 className="text-[#60A5FA] text-3xl font-bold font-serif italic uppercase mb-4 tracking-wide">Objetivo</h3>
                        <p className="text-black font-bold font-serif italic uppercase leading-relaxed text-sm md:text-base tracking-wide">Nuestro objetivo es claro: mejorar tu salud, tu bienestar y tu calidad de vida a través del ejercicio, en un espacio cómodo, accesible y adaptado a ti.</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10">
                    <h2 className="text-[#60A5FA] text-3xl md:text-5xl font-black italic text-center mb-10 uppercase tracking-widest drop-shadow-sm">Horario Clases Dirigidas</h2>
                    <div className="overflow-x-auto pb-6">
                      <table className="w-full min-w-[800px] text-center border-separate border-spacing-1 md:border-spacing-1.5 text-xs md:text-sm font-bold">
                        <thead>
                          <tr>
                            <th className="w-24"></th>
                            <th className="bg-[#6b92c5] text-white p-3 rounded">LUNES</th>
                            <th className="bg-[#6b92c5] text-white p-3 rounded">MARTES</th>
                            <th className="bg-[#6b92c5] text-white p-3 rounded">MIÉRCOLES</th>
                            <th className="bg-[#6b92c5] text-white p-3 rounded">JUEVES</th>
                            <th className="bg-[#6b92c5] text-white p-3 rounded">VIERNES</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-700">
                          <tr><td className="bg-[#6b92c5] text-white p-3 rounded">8:00 H</td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td></tr>
                          <tr><td className="bg-[#6b92c5] text-white p-3 rounded">9:15 H</td><td className="bg-[#dfbdf2] rounded">PILATES</td><td className="bg-[#fcf598] rounded">CICLO</td><td className="bg-[#f2948d] rounded">PUMP</td><td className="bg-[#dfbdf2] rounded">PILATES</td><td className="bg-[#fcf598] rounded">CICLO</td></tr>
                          <tr><td className="bg-[#6b92c5] text-white p-3 rounded">10:15 H</td><td className="bg-white border border-slate-200 rounded p-3"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td></tr>
                          <tr><td className="bg-[#6b92c5] text-white p-3 rounded">11:15 H</td><td className="bg-white border border-slate-200 rounded p-3"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td></tr>
                          <tr><td className="bg-[#6b92c5] text-white p-2 text-[10px] md:text-xs rounded leading-tight">14:00H-15:30H</td><td className="bg-[#e2e8f0] text-slate-500 rounded p-3">CERRADO</td><td className="bg-[#e2e8f0] text-slate-500 rounded">CERRADO</td><td className="bg-[#e2e8f0] text-slate-500 rounded">CERRADO</td><td className="bg-[#e2e8f0] text-slate-500 rounded">CERRADO</td><td className="bg-[#e2e8f0] text-slate-500 rounded">CERRADO</td></tr>
                          <tr><td className="bg-[#6b92c5] text-white p-3 rounded">16:15 H</td><td className="bg-white border border-slate-200 rounded p-3"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td></tr>
                          <tr><td className="bg-[#6b92c5] text-white p-3 rounded">17:15 H</td><td className="bg-white border border-slate-200 rounded p-3"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-white border border-slate-200 rounded"></td><td className="bg-[#f2948d] rounded">PUMP</td></tr>
                          <tr><td className="bg-[#6b92c5] text-white p-3 rounded">18:15 H</td><td className="bg-[#dfbdf2] rounded p-3">PILATES</td><td className="bg-[#dfbdf2] rounded">PILATES</td><td className="bg-[#fcf598] rounded">CICLO</td><td className="bg-[#a7f3d0] rounded">G.A.P</td><td className="bg-[#fdba74] rounded">A.B.D</td></tr>
                          <tr><td className="bg-[#6b92c5] text-white p-3 rounded">19:15 H</td><td className="bg-[#93c5fd] rounded p-3">FIT</td><td className="bg-[#f2948d] rounded">PUMP</td><td className="bg-[#fbcfe8] text-[10px] md:text-xs rounded">FUNCIONAL/TRX</td><td className="bg-[#dfbdf2] rounded">PILATES</td><td className="bg-[#dfbdf2] rounded">PILATES</td></tr>
                          <tr><td className="bg-[#6b92c5] text-white p-3 rounded">20:15 H</td><td className="bg-[#fcf598] rounded p-3">CICLO</td><td className="bg-[#fcf598] rounded">CICLO</td><td className="bg-[#dfbdf2] rounded">PILATES</td><td className="bg-[#fcf598] rounded">CICLO</td><td className="bg-white border border-slate-200 rounded"></td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            } />

            <Route path="/nosotros" element={<SobreNosotros />} />
            <Route path="/futsal" element={<LigasFutsal />} />
            <Route path="/torneo-futsal/:torneoId" element={<CuadroFutsal />} />
            <Route path="/padel" element={<TorneosPadel />} />
            <Route path="/torneo-padel/:torneoId" element={<CuadroPadel />} />
            <Route path="/admin" element={<PanelAdmin />} />
            <Route path="/torneo-24h/:torneoId" element={<CuadroFutsal24H />} />
          </Routes>
        </main>
        
        <footer className="bg-[#0b1121] border-t border-slate-800 pt-12 pb-8 mt-auto z-10 relative">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-slate-400 text-sm">
            {[
              { title: "Activa Fitness", content: <p>Tu centro deportivo en Agost. Instalaciones premium, clases dirigidas y torneos oficiales.</p>, Icon: Dumbbell },
              { 
                title: "Secciones", 
                content: (
                  <ul className="space-y-2">
                    {[ {to: "/", label: "Gimnasio"}, {to: "/futsal", label: "Futsal"}, {to: "/padel", label: "Pádel"}, {to: "/nosotros", label: "Sobre Nosotros"} ].map(link => (
                      <li key={link.to}><Link to={link.to} className="hover:text-[#60A5FA] transition-colors">{link.label}</Link></li>
                    ))}
                  </ul>
                ) 
              },
              { 
                title: "Contacto", 
                content: (
                  <ul className="space-y-2">
                    {[ {Icon: MapPin, text: "Agost, 03698"}, {Icon: Phone, text: "676 681 910"}, {Icon: Mail, text: "activafitnessagost@gmail.com"} ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3"><item.Icon size={16} className="text-[#60A5FA]" /> {item.text}</li>
                    ))}
                  </ul>
                ) 
              }
            ].map(col => (
              <div key={col.title}>
                <div className="flex items-center gap-3 text-white mb-6">
                  {col.Icon && <col.Icon className="text-[#60A5FA]" size={24} />}
                  <h4 className="font-black uppercase tracking-widest text-sm">{col.title}</h4>
                </div>
                {col.content}
                {col.title === "Contacto" && (
                  <div className="flex gap-3 mt-6">
                    {[ { Icon: Instagram, href: "https://www.instagram.com/activafitnessagost" }, { Icon: Facebook, href: "https://www.facebook.com/share/1JRXupkfXU" } ].map((sock, i) => <a key={i} href={sock.href} target="_blank" rel="noopener noreferrer" className="bg-slate-800/50 p-2.5 rounded-lg hover:bg-[#60A5FA] hover:text-black transition-all"><sock.Icon size={20} /></a>)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 mt-10 pt-8 text-center text-xs text-slate-600 font-medium uppercase tracking-wider">
            © {new Date().getFullYear()} ACTIVA FITNESS · Todos los derechos reservados · Diseñado para rendir.
          </div>
        </footer>
      </div>
    </Router>
  );
}
export default App;