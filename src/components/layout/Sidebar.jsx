import { Link } from 'react-router-dom';
import { Dumbbell, Users } from 'lucide-react';
import { IconoFutsal, IconoPadel } from '../ui/Iconos';

const LINKS = [
  { to: '/', label: 'Gimnasio', Icon: Dumbbell },
  { to: '/futsal', label: 'Futsal', Icon: IconoFutsal },
  { to: '/padel', label: 'Pádel', Icon: IconoPadel },
  { to: '/nosotros', label: 'Sobre Nosotros', Icon: Users },
];

export default function Sidebar({ abierto, onCerrar }) {
  return (
    <>
      {/* Overlay */}
      {abierto && (
        <div
          className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm transition-opacity"
          onClick={onCerrar}
        />
      )}

      {/* Panel lateral */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-[#1e293b]/70 backdrop-blur-md border-r border-white/10 z-40 transform transition-transform duration-300 ease-in-out shadow-2xl pt-32 px-6 ${
          abierto ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
        }`}
      >
        <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
          Secciones
        </h3>

        <nav className="space-y-3">
          {LINKS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onCerrar}
              className="flex items-center gap-4 text-slate-300 hover:text-white hover:bg-white/5 p-3 rounded-xl font-bold transition-all group border border-transparent hover:border-white/10"
            >
              <div className="bg-[#60A5FA]/10 p-2 rounded-lg text-[#60A5FA] group-hover:bg-[#60A5FA]/20 group-hover:scale-110 transition-all">
                <Icon />
              </div>
              {label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-8 left-6 right-6 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest border-t border-white/10 pt-4">
          Centro Deportivo Agost
        </div>
      </div>
    </>
  );
}
