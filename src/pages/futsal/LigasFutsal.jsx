import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase';

export default function LigasFutsal() {
  const [torneos,  setTorneos]  = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');

  const cargar = async () => {
    setCargando(true);
    setError('');
    const { data, error: err } = await supabase
      .from('torneos')
      .select('*')
      .eq('deporte', 'futsal')
      .order('created_at', { ascending: false });

    if (err) {
      setError('No se pudieron cargar las competiciones. Comprueba tu conexión e inténtalo de nuevo.');
      console.error('[LigasFutsal]', err.message);
    } else {
      setTorneos(data || []);
    }
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  return (
    <div
      className="relative w-full min-h-[calc(100vh-5rem)] flex flex-col items-center bg-cover bg-center bg-no-repeat animate-fade-in"
      style={{ backgroundImage: "url('/fondo-futsal.jpg')", backgroundColor: '#0f172a' }}
    >
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm pointer-events-none" />
      <div className="relative z-10 w-full max-w-4xl px-4 py-8 md:py-16">
        <div className="bg-[#1e293b]/90 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 md:p-10 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-black text-[#60A5FA] mb-8 border-b border-slate-700/50 pb-4 uppercase tracking-widest flex items-center gap-3">
            <Target className="text-[#60A5FA]" size={36} /> Competiciones Futsal
          </h2>

          {/* Estado: cargando */}
          {cargando && (
            <p className="text-[#60A5FA] animate-pulse font-bold tracking-widest uppercase text-sm">
              Cargando competiciones...
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

          {/* Estado: sin torneos */}
          {!cargando && !error && torneos.length === 0 && (
            <p className="text-slate-400">No hay torneos registrados.</p>
          )}

          {/* Estado: lista */}
          {!cargando && !error && torneos.length > 0 && (
            <div className="grid gap-5">
              {torneos.map((torneo) => {
                const es24h = torneo.nombre.toLowerCase().includes('24');
                return (
                  <div
                    key={torneo.id}
                    className="bg-[#0f172a]/90 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-slate-400 transition-colors shadow-lg group relative overflow-hidden"
                  >
                    {es24h && (
                      <div className="absolute -right-6 -top-6 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                        <Zap size={120} />
                      </div>
                    )}
                    <div className="text-center md:text-left relative z-10">
                      <h3 className="text-xl md:text-2xl font-black text-white mb-1 tracking-tight">
                        {torneo.nombre}
                      </h3>
                      <span
                        className={`text-xs uppercase tracking-widest font-black ${
                          es24h ? 'text-amber-500' : 'text-[#60A5FA]'
                        }`}
                      >
                        {torneo.estado}
                      </span>
                    </div>
                    <Link
                      to={es24h ? `/torneo-24h/${torneo.id}` : `/torneo-futsal/${torneo.id}`}
                      className={`${
                        es24h
                          ? 'bg-amber-500 hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : 'bg-[#60A5FA] hover:bg-blue-500 shadow-[0_0_15px_rgba(96,165,250,0.3)]'
                      } text-black px-8 py-3.5 rounded font-black uppercase tracking-widest transition-all w-full md:w-auto text-center relative z-10`}
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
