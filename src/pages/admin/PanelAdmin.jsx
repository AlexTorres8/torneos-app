import { useState, useEffect, useCallback } from 'react';
import { Target, Wand2, Zap, Trophy, Share2, LogOut, Filter, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../../supabase';
import ResultadosPendientes  from './ResultadosPendientes';
import PartidosFinalizados   from './PartidosFinalizados';
import CreadorTorneo         from './CreadorTorneo';
import GestorFaseFinal       from './GestorFaseFinal';
import ExportarClasificacion from './ExportarClasificacion';
import EliminarTorneo        from './EliminarTorneo';
import { generarTorneo24h }  from '../../lib/generadores/generador24h';

const TABS = [
  { id: 'resultados', label: 'Resultados', Icon: Target  },
  { id: 'crear',      label: 'Crear',      Icon: Wand2   },
  { id: 'fases',      label: 'Fases',      Icon: Trophy  },
  { id: 'exportar',   label: 'Exportar',   Icon: Share2  },
  { id: 'generadores',label: 'Auto',       Icon: Zap     },
  { id: 'eliminar',   label: 'Eliminar',   Icon: Trash2  },
];

const BOTONES_GENERADORES = [
  { nombre: 'Torneo Oro',              emoji: '🏆', color: 'amber'  },
  { nombre: 'Torneo Plata',            emoji: '🥈', color: 'slate'  },
  { nombre: 'Liga Futsal Verano 2026', emoji: '⚽', color: 'blue'   },
  { nombre: 'Torneo 24h 2026',         emoji: '⚡', color: 'orange' },
];

const COLOR_BTN = {
  amber:  'bg-amber-500/10  hover:bg-amber-500/20  text-amber-500  border-amber-500/30',
  slate:  'bg-slate-400/10  hover:bg-slate-400/20  text-slate-300  border-slate-400/30',
  blue:   'bg-[#60A5FA]/10  hover:bg-[#60A5FA]/20  text-[#60A5FA] border-[#60A5FA]/30',
  orange: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border-orange-500/30',
};

const TAB_INFO = {
  resultados:  { titulo: 'Resultados',            sub: 'Introduce los marcadores de los partidos jugados.' },
  crear:       { titulo: 'Crear Nuevo Torneo',     sub: 'Pega los equipos y genera el calendario automáticamente.' },
  fases:       { titulo: 'Gestión Fases Finales',  sub: 'Crea los cruces de cuartos, semifinales y final manualmente.' },
  exportar:    { titulo: 'Exportar Clasificación', sub: 'Genera el texto de clasificación listo para WhatsApp.' },
  generadores: { titulo: 'Generadores Automáticos',sub: 'Torneos predefinidos: se crean con un solo clic.' },
  eliminar:    { titulo: 'Eliminar Torneo',        sub: 'Borra un torneo completo y todos sus datos asociados.' },
};

export default function PanelAdmin() {
  const [tab,                setTab]                = useState('resultados');
  const [subTabResultados,   setSubTabResultados]   = useState('pendientes');
  const [partidosPendientes, setPartidosPendientes] = useState([]);
  const [torneos,            setTorneos]            = useState([]);
  const [filtroTorneo,       setFiltroTorneo]       = useState('');
  const [cargandoGen,        setCargandoGen]        = useState(null);
  const [generandoLock,      setGenerandoLock]      = useState(false);
  const [usuarioEmail,       setUsuarioEmail]       = useState('');

  const cargarDatos = useCallback(async () => {
    const [{ data: p }, { data: t }] = await Promise.all([
      supabase
        .from('partidos')
        .select('id, ubicacion, fase, jornada, hora, torneo:torneos(nombre, deporte), local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre), torneo_id')
        .eq('estado', 'pendiente')
        .order('torneo_id'),
      supabase
        .from('torneos')
        .select('id, nombre')
        .order('nombre'),
    ]);
    setPartidosPendientes(p || []);
    setTorneos(t || []);
  }, []);

  useEffect(() => {
    cargarDatos();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUsuarioEmail(user.email);
    });
  }, [cargarDatos]);

  const handleLogout = () => supabase.auth.signOut();

  const handleGenerar = async (nombre) => {
    if (generandoLock) return;
    if (!window.confirm(`⚡ ¿Crear estructura completa para: ${nombre}?\n\nEsta acción no se puede deshacer.`)) return;

    setGenerandoLock(true);
    setCargandoGen(nombre);

    const resultado =
      nombre === 'Torneo 24h 2026'
        ? await generarTorneo24h()
        : { ok: false, error: 'Usa la pestaña "Crear" para este torneo.' };

    setCargandoGen(null);
    setGenerandoLock(false);

    if (resultado.ok) { alert(`✅ ${nombre} generado con éxito.`); cargarDatos(); }
    else              { alert(`❌ ${resultado.error}`); }
  };

  const partidosFiltrados = filtroTorneo
    ? partidosPendientes.filter((p) => p.torneo_id === filtroTorneo)
    : partidosPendientes;

  const { titulo, sub } = TAB_INFO[tab];

  return (
    <div className="max-w-4xl mx-auto pb-12 mt-8 px-4">

      {/* CABECERA */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-widest">Panel Admin</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Gestión de torneos · Activa Fitness Agost</p>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {usuarioEmail && (
            <span className="text-xs text-slate-500 font-medium hidden sm:block">{usuarioEmail}</span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            <LogOut size={14} /> Salir
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-[#1e293b] p-1.5 rounded-2xl border border-slate-700 mb-8 shadow-inner gap-1">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              tab === id
                ? id === 'eliminar'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-[#60A5FA] text-black shadow-lg'
                : id === 'eliminar'
                  ? 'text-red-400/70 hover:text-red-400'
                  : 'text-slate-400 hover:text-white'
            }`}
          >
            <Icon size={13} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* CONTENIDO */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 shadow-xl p-6 md:p-8">

        {/* Título dinámico */}
        <div className="mb-6 pb-5 border-b border-slate-700/60">
          <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
            {tab === 'resultados'  && <Target  className="text-[#60A5FA]" size={22} />}
            {tab === 'crear'       && <Wand2   className="text-[#60A5FA]" size={22} />}
            {tab === 'fases'       && <Trophy  className="text-[#60A5FA]" size={22} />}
            {tab === 'exportar'    && <Share2  className="text-[#60A5FA]" size={22} />}
            {tab === 'generadores' && <Zap     className="text-[#60A5FA]" size={22} />}
            {tab === 'eliminar'    && <Trash2  className="text-red-400"   size={22} />}
            {titulo}
            {tab === 'resultados' && subTabResultados === 'pendientes' && (
              <span className="bg-[#60A5FA]/20 text-[#60A5FA] text-xs px-2 py-0.5 rounded-full font-black">
                {partidosFiltrados.length}
              </span>
            )}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{sub}</p>
        </div>

        {/* ── RESULTADOS ── */}
        {tab === 'resultados' && (
          <>
            {/* Sub-tabs Pendientes / Finalizados */}
            <div className="flex bg-[#0f172a] p-1 rounded-xl border border-slate-700/60 mb-5 gap-1">
              {[
                { id: 'pendientes',  label: 'Pendientes',  Icon: Target        },
                { id: 'finalizados', label: 'Finalizados', Icon: CheckCircle   },
              ].map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setSubTabResultados(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                    subTabResultados === id
                      ? 'bg-[#60A5FA] text-black shadow'
                      : 'text-slate-500 hover:text-white'
                  }`}
                >
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>

            {/* Filtro por torneo (solo en pendientes) */}
            {subTabResultados === 'pendientes' && torneos.length > 1 && (
              <div className="flex items-center gap-3 mb-5 bg-[#0f172a]/60 border border-slate-700/50 rounded-xl p-3">
                <Filter size={14} className="text-slate-500 flex-shrink-0" />
                <select
                  value={filtroTorneo}
                  onChange={(e) => setFiltroTorneo(e.target.value)}
                  className="flex-1 bg-[#0f172a] text-white font-bold text-sm focus:outline-none cursor-pointer [&>option]:bg-[#0f172a]"
                >
                  <option value="">Todos los torneos ({partidosPendientes.length} partidos)</option>
                  {torneos.map((t) => {
                    const count = partidosPendientes.filter((p) => p.torneo_id === t.id).length;
                    return (
                      <option key={t.id} value={t.id}>{t.nombre} ({count} pendientes)</option>
                    );
                  })}
                </select>
              </div>
            )}

            {subTabResultados === 'pendientes' && (
              <ResultadosPendientes partidos={partidosFiltrados} onActualizar={cargarDatos} />
            )}
            {subTabResultados === 'finalizados' && (
              <PartidosFinalizados torneos={torneos} />
            )}
          </>
        )}

        {/* ── CREAR TORNEO ── */}
        {tab === 'crear' && (
          <CreadorTorneo onTorneoCreado={() => { cargarDatos(); setTab('resultados'); }} />
        )}

        {/* ── FASES FINALES ── */}
        {tab === 'fases' && <GestorFaseFinal onPartidoCreado={cargarDatos} />}

        {/* ── EXPORTAR ── */}
        {tab === 'exportar' && <ExportarClasificacion />}

        {/* ── GENERADORES ── */}
        {tab === 'generadores' && (
          <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 text-sm font-bold flex items-start gap-3">
              <Zap size={18} className="flex-shrink-0 mt-0.5" />
              <span>Los generadores crean estructura completa de forma irreversible. Úsalos solo una vez por torneo.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BOTONES_GENERADORES.map(({ nombre, emoji, color }) => (
                <button
                  key={nombre}
                  onClick={() => handleGenerar(nombre)}
                  disabled={generandoLock}
                  className={`${COLOR_BTN[color]} border p-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {cargandoGen === nombre ? '⏳ Generando...' : `${emoji} ${nombre}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── ELIMINAR ── */}
        {tab === 'eliminar' && <EliminarTorneo />}

      </div>
    </div>
  );
}
