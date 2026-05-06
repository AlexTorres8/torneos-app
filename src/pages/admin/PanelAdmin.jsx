import { useState, useEffect } from 'react';
import { Target, Wand2, Zap, Trophy, Share2, LogOut } from 'lucide-react';
import { supabase } from '../../supabase';
import ResultadosPendientes  from './ResultadosPendientes';
import CreadorTorneo         from './CreadorTorneo';
import GestorFaseFinal       from './GestorFaseFinal';
import ExportarClasificacion from './ExportarClasificacion';
import { generarTorneo24h }  from '../../lib/generadores/generador24h';

const TABS = [
  { id: 'resultados', label: 'Resultados',  Icon: Target  },
  { id: 'crear',      label: 'Crear',       Icon: Wand2   },
  { id: 'fases',      label: 'Fases',       Icon: Trophy  },
  { id: 'exportar',   label: 'Exportar',    Icon: Share2  },
  { id: 'generadores',label: 'Auto',        Icon: Zap     },
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

// Títulos y subtítulos por pestaña
const TAB_INFO = {
  resultados: { titulo: 'Resultados Pendientes',   sub: 'Introduce los marcadores de los partidos jugados.' },
  crear:      { titulo: 'Crear Nuevo Torneo',       sub: 'Pega los equipos y genera el calendario automáticamente.' },
  fases:      { titulo: 'Gestión Fases Finales',    sub: 'Crea los cruces de cuartos, semifinales y final manualmente.' },
  exportar:   { titulo: 'Exportar Clasificación',   sub: 'Genera el texto de clasificación listo para WhatsApp.' },
  generadores:{ titulo: 'Generadores Automáticos',  sub: 'Torneos predefinidos: se crean con un solo clic.' },
};

export default function PanelAdmin() {
  const [tab,                setTab]                = useState('resultados');
  const [partidosPendientes, setPartidosPendientes] = useState([]);
  const [cargandoGen,        setCargandoGen]        = useState(null);
  const [usuarioEmail,       setUsuarioEmail]       = useState('');

  const cargarDatos = async () => {
    const { data: p } = await supabase
      .from('partidos')
      .select('id, ubicacion, fase, jornada, hora, torneo:torneos(nombre, deporte), local:participantes!local_id(nombre), visitante:participantes!visitante_id(nombre)')
      .eq('estado', 'pendiente')
      .order('torneo_id');
    setPartidosPendientes(p || []);
  };

  useEffect(() => {
    cargarDatos();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUsuarioEmail(user.email);
    });
  }, []);

  const handleLogout = () => supabase.auth.signOut();

  const handleGenerar = async (nombre) => {
    if (!window.confirm(`⚡ ¿Crear estructura completa para: ${nombre}?`)) return;
    setCargandoGen(nombre);

    const resultado =
      nombre === 'Torneo 24h 2026'
        ? await generarTorneo24h()
        : { ok: false, error: 'Usa la pestaña "Crear" para este torneo.' };

    setCargandoGen(null);

    if (resultado.ok) {
      alert(`✅ ${nombre} generado con éxito.`);
      cargarDatos();
    } else {
      alert(`❌ ${resultado.error}`);
    }
  };

  const { titulo, sub } = TAB_INFO[tab];

  return (
    <div className="max-w-4xl mx-auto pb-12 mt-8 px-4">

      {/* CABECERA */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-widest">Panel Admin</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Gestión de torneos · Activa Fitness Agost
          </p>
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
                ? 'bg-[#60A5FA] text-black shadow-lg'
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
            {titulo}
            {tab === 'resultados' && (
              <span className="bg-[#60A5FA]/20 text-[#60A5FA] text-xs px-2 py-0.5 rounded-full font-black">
                {partidosPendientes.length}
              </span>
            )}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{sub}</p>
        </div>

        {/* ── RESULTADOS ── */}
        {tab === 'resultados' && (
          <ResultadosPendientes partidos={partidosPendientes} onActualizar={cargarDatos} />
        )}

        {/* ── CREAR TORNEO ── */}
        {tab === 'crear' && (
          <CreadorTorneo onTorneoCreado={() => { cargarDatos(); setTab('resultados'); }} />
        )}

        {/* ── FASES FINALES ── */}
        {tab === 'fases' && (
          <GestorFaseFinal onPartidoCreado={cargarDatos} />
        )}

        {/* ── EXPORTAR ── */}
        {tab === 'exportar' && (
          <ExportarClasificacion />
        )}

        {/* ── GENERADORES ── */}
        {tab === 'generadores' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BOTONES_GENERADORES.map(({ nombre, emoji, color }) => (
              <button
                key={nombre}
                onClick={() => handleGenerar(nombre)}
                disabled={cargandoGen !== null}
                className={`${COLOR_BTN[color]} border p-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50`}
              >
                {cargandoGen === nombre ? '⏳ Generando...' : `${emoji} ${nombre}`}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
