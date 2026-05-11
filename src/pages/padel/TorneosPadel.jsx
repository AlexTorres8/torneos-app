import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircleDot, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase';
import NormativaPadel from './NormativaPadel';

export default function TorneosPadel() {
  const [torneos,     setTorneos]     = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState('');
  const [cat,         setCat]         = useState('Oro');
  const [verNormativa,setVerNormativa]= useState(false);

  const cargar = async () => {
    setCargando(true);
    setError('');
    const { data, error: err } = await supabase
      .from('torneos')
      .select('*')
      .eq('deporte', 'padel')
      .order('created_at', { ascending: false });

    if (err) {
      setError('No se pudieron cargar los torneos. Comprueba tu conexión e inténtalo de nuevo.');
      console.error('[TorneosPadel]', err.message);
    } else {
      setTorneos(data || []);
    }
    setCargando(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargar(); }, []);

  const mostrar = torneos.filter((t) =>
    t.nombre.toLowerCase().includes(cat.toLowerCase())
  );

  return (
    <div
      className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col items-center bg-cover bg-center bg-no-repeat animate-fade-in"
      style={{ backgroundImage: "url('/fondo-padel.jpg')", backgroundColor: '#0f172a' }}
    >
      <div className="absolute inset-0 bg-slate-900/80 pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl px-4 py-8 md:py-16">
        <div className="bg-[#1e293b]/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-10 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-8 border-b border-slate-700/50 pb-4 uppercase tracking-widest flex items-center gap-3">
            <CircleDot className="text-amber-500" size={36} /> Torneos de Pádel
          </h2>

          {/* Tabs categoría */}
          <div className="flex bg-slate-800/80 p-1.5 rounded-xl mb-6 border border-slate-700 shadow-inner">
            <button
              onClick={() => setCat('Oro')}
              className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest rounded-lg transition-all ${
                cat === 'Oro' ? 'bg-amber-500 text-black shadow-lg scale-[1.02]' : 'text-slate-400 hover:text-white'
              }`}
            >
              🏆 Categoría Oro
            </button>
            <button
              onClick={() => setCat('Plata')}
              className={`flex-1 py-3 text-xs md:text-sm font-black uppercase tracking-widest rounded-lg transition-all ${
                cat === 'Plata' ? 'bg-slate-300 text-black shadow-lg scale-[1.02]' : 'text-slate-400 hover:text-white'
              }`}
            >
              🥈 Categoría Plata
            </button>
          </div>

          {/* Normativa desplegable */}
          <div className="mb-10 bg-[#0f172a]/80 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
            <button
              onClick={() => setVerNormativa(!verNormativa)}
              className="w-full flex justify-between items-center p-4 hover:bg-slate-800/80 transition-colors text-slate-300 hover:text-white"
            >
              <span className="font-bold uppercase tracking-widest text-sm md:text-base flex items-center gap-2">
                📜 Normativa Oficial del Torneo
              </span>
              <span className="text-2xl font-black text-amber-500">{verNormativa ? '−' : '+'}</span>
            </button>
            {verNormativa && <NormativaPadel />}
          </div>

          {/* Estado: cargando */}
          {cargando && (
            <p className="text-[#60A5FA] animate-pulse font-bold tracking-widest uppercase text-sm">
              Cargando...
            </p>
          )}

          {/* Estado: error */}
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

          {/* Estado: sin torneos en categoría */}
          {!cargando && !error && mostrar.length === 0 && (
            <p className="text-slate-400">No hay torneos registrados en esta categoría.</p>
          )}

          {/* Lista torneos */}
          {!cargando && !error && mostrar.length > 0 && (
            <div className="grid gap-5">
              {mostrar.map((torneo) => (
                <div
                  key={torneo.id}
                  className="bg-[#0f172a]/90 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-slate-400 transition-colors shadow-lg"
                >
                  <div className="text-center md:text-left">
                    <h3 className="text-xl md:text-2xl font-black text-white mb-1">{torneo.nombre}</h3>
                    <span className="text-xs text-[#60A5FA] uppercase tracking-widest font-black">{torneo.estado}</span>
                  </div>
                  <Link
                    to={`/torneo-padel/${torneo.id}`}
                    className="bg-[#60A5FA] hover:bg-blue-500 text-black px-8 py-3.5 rounded font-black uppercase tracking-widest transition-all w-full md:w-auto text-center shadow-[0_0_15px_rgba(96,165,250,0.3)]"
                  >
                    Ver Competición
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
