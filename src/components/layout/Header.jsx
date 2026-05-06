import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full flex justify-start items-center p-4 md:px-8 bg-[#0b1121]/70 backdrop-blur-md border-b border-white/10 z-50 shadow-lg h-14 md:h-16 transition-all">
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="p-2 bg-[#1e293b]/80 text-white rounded-lg shadow-lg border border-white/10 hover:text-[#60A5FA] hover:border-[#60A5FA]/50 transition-all z-10"
          aria-label="Abrir menú"
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

      {/* Spacer para compensar el header fijo */}
      <div className="h-14 md:h-16" />

      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
    </>
  );
}
