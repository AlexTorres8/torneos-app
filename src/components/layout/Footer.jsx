import { Link } from 'react-router-dom';
import { Dumbbell, MapPin, Phone, Mail } from 'lucide-react';
import { Instagram, Facebook } from '../ui/Iconos';

export default function Footer() {
  return (
    <footer className="bg-[#0b1121] border-t border-slate-800 pt-12 pb-8 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-slate-400 text-sm">

        {/* Columna 1 — Marca */}
        <div>
          <div className="flex items-center gap-3 text-white mb-6">
            <Dumbbell className="text-[#60A5FA]" size={24} />
            <h4 className="font-black uppercase tracking-widest text-sm">Activa Fitness</h4>
          </div>
          <p className="leading-relaxed mb-6">
            Tu centro deportivo en Agost. Instalaciones premium, clases dirigidas y torneos oficiales.
          </p>
          {/* Google Maps embed pequeño */}
          <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg">
            <iframe
              title="Ubicación Activa Fitness Agost"
              src="https://maps.google.com/maps?q=Polideportivo+Municipal+Agost+Alicante&output=embed&z=15"
              width="100%"
              height="140"
              style={{ border: 0, display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Columna 2 — Secciones */}
        <div>
          <div className="flex items-center gap-3 text-white mb-6">
            <h4 className="font-black uppercase tracking-widest text-sm">Secciones</h4>
          </div>
          <ul className="space-y-2">
            {[
              { to: '/',        label: 'Inicio'        },
              { to: '/futsal',  label: 'Futbol Sala'   },
              { to: '/padel',   label: 'Pádel'         },
              { to: '/nosotros',label: 'Sobre Nosotros' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="hover:text-[#60A5FA] transition-colors flex items-center gap-2 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-[#60A5FA] transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Legal — separado visualmente */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Legal</p>
            <ul className="space-y-2">
              {[
                { to: '/legal',             label: 'Aviso Legal'            },
                { to: '/legal/privacidad',  label: 'Política de Privacidad' },
                { to: '/legal/cookies',     label: 'Política de Cookies'    },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-xs hover:text-[#60A5FA] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-slate-800 group-hover:bg-[#60A5FA] transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Columna 3 — Contacto */}
        <div>
          <div className="flex items-center gap-3 text-white mb-6">
            <h4 className="font-black uppercase tracking-widest text-sm">Contacto</h4>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="text-[#60A5FA] flex-shrink-0 mt-0.5" />
              <span>Polideportivo Municipal<br />Agost, 03698 (Alicante)</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={16} className="text-[#60A5FA] flex-shrink-0" />
              <a href="tel:+34676681910" className="hover:text-[#60A5FA] transition-colors">
                676 681 910
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={16} className="text-[#60A5FA] flex-shrink-0" />
              <a
                href="mailto:activafitnessagost@gmail.com"
                className="hover:text-[#60A5FA] transition-colors break-all"
              >
                activafitnessagost@gmail.com
              </a>
            </li>
          </ul>

          <div className="flex gap-3">
            {[
              { Icono: Instagram, href: 'https://www.instagram.com/activafitnessagost', label: 'Instagram' },
              { Icono: Facebook,  href: 'https://www.facebook.com/share/1JRXupkfXU',   label: 'Facebook'  },
            ].map(({ Icono, href, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="bg-slate-800/50 p-2.5 rounded-xl hover:bg-[#60A5FA] hover:text-black text-slate-300 transition-all border border-slate-700 hover:border-[#60A5FA]"
              >
                <Icono size={20} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 font-medium uppercase tracking-wider">
        <span>© {new Date().getFullYear()} Activa Fitness · Todos los derechos reservados</span>
        <div className="flex gap-4">
          <Link to="/legal"            className="hover:text-slate-400 transition-colors">Legal</Link>
          <Link to="/legal/privacidad" className="hover:text-slate-400 transition-colors">Privacidad</Link>
          <Link to="/legal/cookies"    className="hover:text-slate-400 transition-colors">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
