import { Link } from 'react-router-dom';
import { Dumbbell, MapPin, Phone, Mail } from 'lucide-react';
import { Instagram, Facebook } from '../ui/Iconos';

const COLUMNAS = [
  {
    titulo: 'Activa Fitness',
    Icon: Dumbbell,
    contenido: (
      <p>Tu centro deportivo en Agost. Instalaciones premium, clases dirigidas y torneos oficiales.</p>
    ),
  },
  {
    titulo: 'Secciones',
    contenido: (
      <ul className="space-y-2">
        {[
          { to: '/', label: 'Gimnasio' },
          { to: '/futsal', label: 'Futsal' },
          { to: '/padel', label: 'Pádel' },
          { to: '/nosotros', label: 'Sobre Nosotros' },
        ].map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="hover:text-[#60A5FA] transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    ),
  },
  {
    titulo: 'Contacto',
    contenido: (
      <>
        <ul className="space-y-2">
          {[
            { Icono: MapPin, texto: 'Agost, 03698' },
            { Icono: Phone, texto: '676 681 910' },
            { Icono: Mail, texto: 'activafitnessagost@gmail.com' },
          ].map(({ Icono, texto }) => (
            <li key={texto} className="flex items-center gap-3">
              <Icono size={16} className="text-[#60A5FA]" /> {texto}
            </li>
          ))}
        </ul>
        <div className="flex gap-3 mt-6">
          {[
            { Icono: Instagram, href: 'https://www.instagram.com/activafitnessagost' },
            { Icono: Facebook, href: 'https://www.facebook.com/share/1JRXupkfXU' },
          ].map(({ Icono, href }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-800/50 p-2.5 rounded-lg hover:bg-[#60A5FA] hover:text-black transition-all"
            >
              <Icono size={20} />
            </a>
          ))}
        </div>
      </>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0b1121] border-t border-slate-800 pt-12 pb-8 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-slate-400 text-sm">
        {COLUMNAS.map((col) => (
          <div key={col.titulo}>
            <div className="flex items-center gap-3 text-white mb-6">
              {col.Icon && <col.Icon className="text-[#60A5FA]" size={24} />}
              <h4 className="font-black uppercase tracking-widest text-sm">{col.titulo}</h4>
            </div>
            {col.contenido}
          </div>
        ))}
      </div>
      <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 mt-10 pt-8 text-center text-xs text-slate-600 font-medium uppercase tracking-wider">
        © {new Date().getFullYear()} ACTIVA FITNESS · Todos los derechos reservados · Diseñado para rendir.
      </div>
    </footer>
  );
}
