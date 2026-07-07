import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../supabase';
import { SEO } from '../components/seo/SEO';

/* ── Utilidades de fecha (todas trabajan con 'YYYY-MM-DD') ── */

const DIAS_CORTOS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DIAS_LARGOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MESES_LARGOS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function aISO(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

function deISO(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

function sumarDias(iso, n) {
  const d = deISO(iso);
  d.setDate(d.getDate() + n);
  return aISO(d);
}

/** Lunes de la semana a la que pertenece la fecha (semana española L-D). */
function lunesDe(iso) {
  const d = deISO(iso);
  const offset = (d.getDay() + 6) % 7; // 0 = lunes
  return sumarDias(iso, -offset);
}

function etiquetaDia(iso) {
  const d = deISO(iso);
  const diaSemana = DIAS_LARGOS[(d.getDay() + 6) % 7];
  return `${diaSemana} ${d.getDate()} de ${MESES_LARGOS[d.getMonth()].toLowerCase()}`;
}

/* ── Deporte / categoría ── */

const FILTROS = [
  { key: 'todos',  label: 'Todos' },
  { key: 'futsal', label: 'Futsal' },
  { key: 'oro',    label: 'P. Oro' },
  { key: 'plata',  label: 'P. Plata' },
];

/** Clave de deporte/categoría de un partido según su torneo. */
function claveDeporte(torneo) {
  if (!torneo) return null;
  if (torneo.deporte === 'futsal') return 'futsal';
  if (torneo.deporte === 'padel') {
    const cat = torneo.categoria || (torneo.nombre?.toLowerCase().includes('plata') ? 'plata' : 'oro');
    return cat === 'plata' ? 'plata' : 'oro';
  }
  return null;
}

const ESTILO_DEPORTE = {
  futsal: { punto: 'bg-[#60A5FA]', badge: 'bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/30', label: 'Futsal' },
  oro:    { punto: 'bg-amber-500', badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30',  label: 'Pádel Oro' },
  plata:  { punto: 'bg-slate-300', badge: 'bg-slate-300/15 text-slate-300 border-slate-300/30',  label: 'Pádel Plata' },
};

/** Ruta pública del torneo al que pertenece el partido. */
function rutaTorneo(t) {
  if (!t) return '/';
  if (t.deporte === 'futsal') {
    const es24h = t.formato ? t.formato === '24h' : t.nombre?.toLowerCase().includes('24');
    return es24h ? `/torneo-24h/${t.id}` : `/torneo-futsal/${t.id}`;
  }
  return `/torneo-padel/${t.id}`;
}

/* ── Tarjeta de un partido ── */

function TarjetaPartido({ p }) {
  const clave = claveDeporte(p.torneo);
  const estilo = ESTILO_DEPORTE[clave] || ESTILO_DEPORTE.futsal;
  const finalizado = p.estado === 'finalizado';

  return (
    <Link
      to={rutaTorneo(p.torneo)}
      className="block bg-[#0f172a]/90 border border-slate-700 rounded-xl p-4 hover:border-slate-400 transition-colors shadow-lg"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="flex items-center gap-1.5 min-w-0">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${estilo.badge}`}>
            {estilo.label}
          </span>
          {p.aplazado && (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Aplazado
            </span>
          )}
        </span>
        <span className="text-xs font-black text-white bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg flex-shrink-0">
          {p.hora ? p.hora.slice(0, 5) : 'Por definir'}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm md:text-base font-bold text-white text-center">
        <span className="flex-1 min-w-0 text-right truncate">{p.local?.nombre || 'Por definir'}</span>
        {finalizado ? (
          <span className="flex-shrink-0 text-emerald-400 font-black px-2">
            {p.puntuacion_local} - {p.puntuacion_visitante}
          </span>
        ) : (
          <span className="flex-shrink-0 text-slate-500 font-black px-2">vs</span>
        )}
        <span className="flex-1 min-w-0 text-left truncate">{p.visitante?.nombre || 'Por definir'}</span>
      </div>

      <div className="flex items-center justify-between gap-2 mt-2 text-[11px] text-slate-400 font-bold">
        <span className="min-w-0 truncate">{p.torneo?.nombre}{p.fase ? ` · ${p.fase}` : ''}</span>
        {p.ubicacion && (
          <span className="flex items-center gap-1 flex-shrink-0">
            <MapPin size={11} /> {p.ubicacion}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ── Página ── */

export default function CalendarioPartidos() {
  const hoy = aISO(new Date());

  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');
  const [vista,    setVista]    = useState('mes');  // dia | semana | mes
  const [filtro,   setFiltro]   = useState('todos');
  const [diaSel,   setDiaSel]   = useState(hoy);    // ancla de las tres vistas

  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; };
  }, []);

  const cargar = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('partidos')
      .select([
        'id', 'fecha', 'hora', 'ubicacion', 'estado', 'fase', 'aplazado',
        'puntuacion_local', 'puntuacion_visitante',
        'torneo:torneos(id, nombre, deporte, categoria, formato)',
        'local:participantes!local_id(nombre)',
        'visitante:participantes!visitante_id(nombre)',
      ].join(', '))
      .not('fecha', 'is', null)
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true });

    if (!montado.current) return;
    if (err) {
      setError('No se pudo cargar el calendario. Comprueba tu conexión.');
      console.error('[CalendarioPartidos]', err.message);
    } else {
      setError('');
      setPartidos(data || []);
    }
    setCargando(false);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargar(); }, [cargar]);

  // Realtime: cualquier cambio en "partidos" (mover de día, nueva hora,
  // resultado...) recarga el calendario. Con debounce para agrupar ráfagas.
  useEffect(() => {
    let timer = null;
    const channel = supabase
      .channel('calendario_partidos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partidos' }, () => {
        clearTimeout(timer);
        timer = setTimeout(() => { if (montado.current) cargar(); }, 400);
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [cargar]);

  /* ── Datos derivados ── */

  const filtrados = useMemo(
    () => partidos.filter((p) => {
      const clave = claveDeporte(p.torneo);
      if (!clave) return false;
      return filtro === 'todos' || clave === filtro;
    }),
    [partidos, filtro]
  );

  const porDia = useMemo(() => {
    const mapa = {};
    for (const p of filtrados) {
      (mapa[p.fecha] ||= []).push(p);
    }
    return mapa;
  }, [filtrados]);

  const fechaSel = deISO(diaSel);
  const tituloMes = `${MESES_LARGOS[fechaSel.getMonth()]} ${fechaSel.getFullYear()}`;

  // Celdas del mes (empezando en lunes)
  const celdasMes = useMemo(() => {
    const primero = new Date(fechaSel.getFullYear(), fechaSel.getMonth(), 1);
    const inicio = lunesDe(aISO(primero));
    const celdas = [];
    let cursor = inicio;
    // Avanza semana a semana hasta cubrir todo el mes
    do {
      for (let i = 0; i < 7; i++) {
        celdas.push(cursor);
        cursor = sumarDias(cursor, 1);
      }
    } while (deISO(cursor).getMonth() === fechaSel.getMonth());
    return celdas;
  }, [diaSel]); // eslint-disable-line react-hooks/exhaustive-deps

  const diasSemana = useMemo(() => {
    const lunes = lunesDe(diaSel);
    return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  }, [diaSel]);

  /* ── Navegación ── */

  const navegar = (dir) => {
    if (vista === 'dia') {
      setDiaSel(sumarDias(diaSel, dir));
    } else if (vista === 'semana') {
      setDiaSel(sumarDias(diaSel, dir * 7));
    } else {
      const d = new Date(fechaSel.getFullYear(), fechaSel.getMonth() + dir, 1);
      // Si volvemos al mes actual, ancla en hoy para que quede seleccionado
      setDiaSel(d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear() ? hoy : aISO(d));
    }
  };

  const tituloNav =
    vista === 'dia'    ? etiquetaDia(diaSel)
    : vista === 'semana' ? `${deISO(diasSemana[0]).getDate()} ${MESES_LARGOS[deISO(diasSemana[0]).getMonth()].slice(0, 3)} — ${deISO(diasSemana[6]).getDate()} ${MESES_LARGOS[deISO(diasSemana[6]).getMonth()].slice(0, 3)}`
    : tituloMes;

  /* ── Render ── */

  return (
    <>
      <SEO
        title="Calendario de Partidos"
        description="Calendario con todos los partidos de futsal y pádel en Activa Fitness Agost. Consulta día a día los horarios de cada competición."
        canonical="/calendario"
      />

      <div className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col items-center bg-[#0f172a] animate-fade-in">
        <div className="relative z-10 w-full max-w-3xl px-3 md:px-4 py-6 md:py-12">
          <div className="bg-[#1e293b]/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 md:p-8 shadow-2xl">
            <h2 className="text-xl md:text-3xl font-black text-white mb-6 border-b border-slate-700/50 pb-4 uppercase tracking-widest flex items-center gap-3">
              <CalendarDays className="text-[#60A5FA]" size={30} /> Calendario de Partidos
            </h2>

            {/* Filtro deporte */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
              {FILTROS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFiltro(key)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[11px] md:text-xs font-black uppercase tracking-widest border transition-all ${
                    filtro === key
                      ? 'bg-[#60A5FA] text-black border-[#60A5FA]'
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {key !== 'todos' && (
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${ESTILO_DEPORTE[key].punto}`} />
                  )}
                  {label}
                </button>
              ))}
            </div>

            {/* Selector de vista */}
            <div className="flex bg-slate-800/80 p-1 rounded-xl mb-4 border border-slate-700 shadow-inner">
              {[['dia', 'Día'], ['semana', 'Semana'], ['mes', 'Mes']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setVista(key)}
                  className={`flex-1 py-2.5 text-xs md:text-sm font-black uppercase tracking-widest rounded-lg transition-all ${
                    vista === key ? 'bg-[#60A5FA] text-black shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Navegación temporal */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navegar(-1)}
                aria-label="Anterior"
                className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:border-slate-500 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <p className="text-sm md:text-base font-black text-white uppercase tracking-widest">{tituloNav}</p>
                {diaSel !== hoy && (
                  <button
                    onClick={() => setDiaSel(hoy)}
                    className="text-[10px] font-black text-[#60A5FA] uppercase tracking-widest hover:underline"
                  >
                    Volver a hoy
                  </button>
                )}
              </div>
              <button
                onClick={() => navegar(1)}
                aria-label="Siguiente"
                className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:border-slate-500 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Estados de carga / error */}
            {cargando && (
              <p className="text-[#60A5FA] animate-pulse font-bold tracking-widest uppercase text-sm py-8 text-center">
                Cargando...
              </p>
            )}

            {!cargando && error && (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <AlertCircle size={40} className="text-red-400" />
                <p className="text-red-400 font-bold text-sm">{error}</p>
                <button
                  onClick={cargar}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  <RefreshCw size={15} /> Reintentar
                </button>
              </div>
            )}

            {!cargando && !error && (
              <>
                {/* ── VISTA MES ── */}
                {vista === 'mes' && (
                  <>
                    <div className="grid grid-cols-7 gap-1 mb-1">
                      {DIAS_CORTOS.map((d) => (
                        <div key={d} className="text-center text-[10px] md:text-xs font-black text-slate-500 uppercase py-1">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-6">
                      {celdasMes.map((iso) => {
                        const enMes = deISO(iso).getMonth() === fechaSel.getMonth();
                        const claves = [...new Set((porDia[iso] || []).map((p) => claveDeporte(p.torneo)))];
                        const esHoy = iso === hoy;
                        const sel = iso === diaSel;
                        return (
                          <button
                            key={iso}
                            onClick={() => setDiaSel(iso)}
                            className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 text-xs md:text-sm font-bold transition-all border ${
                              sel
                                ? 'bg-[#60A5FA] text-black border-[#60A5FA]'
                                : esHoy
                                ? 'bg-slate-800 text-white border-[#60A5FA]/60'
                                : enMes
                                ? 'bg-slate-800/60 text-slate-200 border-slate-700/60 hover:border-slate-500'
                                : 'bg-transparent text-slate-600 border-transparent'
                            }`}
                          >
                            {deISO(iso).getDate()}
                            <span className="flex gap-0.5 h-1.5">
                              {claves.slice(0, 3).map((c) => (
                                <span key={c} className={`w-1.5 h-1.5 rounded-full ${sel ? 'bg-black/60' : ESTILO_DEPORTE[c].punto}`} />
                              ))}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Partidos del día seleccionado */}
                    <h3 className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                      {etiquetaDia(diaSel)}
                    </h3>
                    {(porDia[diaSel] || []).length === 0 ? (
                      <p className="text-slate-500 text-sm font-bold py-4 text-center">No hay partidos este día.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {porDia[diaSel].map((p) => <TarjetaPartido key={p.id} p={p} />)}
                      </div>
                    )}
                  </>
                )}

                {/* ── VISTA SEMANA ── */}
                {vista === 'semana' && (
                  <div className="space-y-5">
                    {diasSemana.map((iso) => (
                      <div key={iso}>
                        <h3 className={`text-xs md:text-sm font-black uppercase tracking-widest mb-2 ${
                          iso === hoy ? 'text-[#60A5FA]' : 'text-slate-400'
                        }`}>
                          {etiquetaDia(iso)}{iso === hoy ? ' · Hoy' : ''}
                        </h3>
                        {(porDia[iso] || []).length === 0 ? (
                          <p className="text-slate-600 text-xs font-bold pl-1">Sin partidos</p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {porDia[iso].map((p) => <TarjetaPartido key={p.id} p={p} />)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── VISTA DÍA ── */}
                {vista === 'dia' && (
                  (porDia[diaSel] || []).length === 0 ? (
                    <p className="text-slate-500 text-sm font-bold py-8 text-center">No hay partidos este día.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {porDia[diaSel].map((p) => <TarjetaPartido key={p.id} p={p} />)}
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
