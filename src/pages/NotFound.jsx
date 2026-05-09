import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 text-center animate-fade-in">

      {/* Número grande decorativo */}
      <div className="relative select-none mb-6">
        <span
          className="text-[160px] md:text-[220px] font-black leading-none tracking-tighter"
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search size={48} className="text-[#60A5FA]/40" strokeWidth={1.5} />
        </div>
      </div>

      {/* Mensaje */}
      <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-widest mb-3">
        Página no encontrada
      </h1>
      <p className="text-slate-400 text-sm md:text-base max-w-md mb-2 font-medium leading-relaxed">
        La URL{' '}
        <code className="bg-slate-800 text-[#60A5FA] px-2 py-0.5 rounded text-xs font-mono break-all">
          {location.pathname}
        </code>{' '}
        no existe o ha cambiado de dirección.
      </p>
      <p className="text-slate-500 text-sm mb-10">
        Si llegaste aquí desde un enlace compartido, pide al organizador que lo vuelva a copiar.
      </p>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-white font-black uppercase tracking-widest py-3 px-5 rounded-xl text-xs transition-all"
        >
          <ArrowLeft size={15} /> Volver
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex-1 flex items-center justify-center gap-2 bg-[#60A5FA] hover:bg-blue-400 text-black font-black uppercase tracking-widest py-3 px-5 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(96,165,250,0.2)]"
        >
          <Home size={15} /> Inicio
        </button>
      </div>

      {/* Links rápidos */}
      <div className="mt-12 flex flex-wrap justify-center gap-3">
        {[
          { label: '⚽ Futsal',    path: '/futsal'    },
          { label: '🎾 Pádel',    path: '/padel'     },
          { label: '🏋️ Gimnasio', path: '/'          },
        ].map(({ label, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="text-xs font-bold text-slate-500 hover:text-[#60A5FA] border border-slate-800 hover:border-[#60A5FA]/30 px-4 py-2 rounded-full transition-all"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
