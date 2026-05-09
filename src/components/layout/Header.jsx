import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <>
      {/*
        CORRECCIÓN: el header ahora tiene h-16 md:h-20 para que el logo
        no lo desborde. El logo usa h-10 md:h-14 — siempre menor que el header.
      */}
      <header className="fixed top-0 w-full flex justify-start items-center p-4 md:px-8 bg-[#0b1121]/70 backdrop-blur-md border-b border-white/10 z-50 shadow-lg h-16 md:h-20 transition-all">

        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="p-2 bg-[#1e293b]/80 text-white rounded-lg shadow-lg border border-white/10 hover:text-[#60A5FA] hover:border-[#60A5FA]/50 transition-all z-10"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
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
            alt="Activa Fitness Agost"
            className="h-10 md:h-14 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          />
        </Link>
      </header>

      {/* Spacer — misma altura que el header */}
      <div className="h-16 md:h-20" />

      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
    </>
  );
}