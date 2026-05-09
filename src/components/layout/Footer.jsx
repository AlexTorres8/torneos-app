import { Link } from 'react-router-dom';
import { Dumbbell, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Instagram, Facebook } from '../ui/Iconos';

const MAPS_LINK = 'https://www.google.com/maps/search/?api=1&query=Polideportivo+Municipal,+Agost,+Alicante';

export default function Footer() {
  return (
    <footer className="bg-[#0b1121] border-t border-slate-800 pt-12 pb-8 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-3 gap-10 text-slate-400 text-sm mb-10">

          {/* Columna 1 — Marca + Mapa */}
          <div>
            <div className="flex items-center gap-3 text-white mb-6">
              <Dumbbell className="text-[#60A5FA]" size={24} />
              <h4 className="font-black uppercase tracking-widest text-sm">Activa Fitness</h4>
            </div>
            <p className="leading-relaxed mb-6">
              Tu centro deportivo en Agost. Instalaciones premium, clases dirigidas y torneos oficiales.
            </p>
            <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-lg">
              <iframe
                title="Ubicación Activa Fitness Agost"
                src="https://maps.google.com/maps?q=Polideportivo+Municipal+Agost+Alicante&output=embed&z=15"
                width="100%"
                height="140"
                style={{ border: 0, display: 'block', pointerEvents: 'none' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 z-10 flex items-end justify-end p-2"
                aria-label="Ver en Google Maps"
              >
                <span className="flex items-center gap-1 bg-[#60A5FA] text-black text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow-lg">
                  <ExternalLink size={10} /> Ver en Maps
                </span>
              </a>
            </div>
          </div>

          {/* Columna 2 — Secciones + Legal */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm text-white mb-6">Secciones</h4>
            <ul className="space-y-2">
              {[
                { to: '/',         label: 'Inicio'         },
                { to: '/futsal',   label: 'Futbol Sala'    },
                { to: '/padel',    label: 'Pádel'          },
                { to: '/nosotros', label: 'Sobre Nosotros' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-[#60A5FA] transition-colors flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-[#60A5FA] transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">Legal</p>
              <ul className="space-y-2">
                {[
                  { to: '/legal',            label: 'Aviso Legal'            },
                  { to: '/legal/privacidad', label: 'Política de Privacidad' },
                  { to: '/legal/cookies',    label: 'Política de Cookies'    },
                ].map(({ to, label }) => (
                  <li key={to}>
                    <Link to={to} className="text-xs hover:text-[#60A5FA] transition-colors flex items-center gap-2 group">
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
            <h4 className="font-black uppercase tracking-widest text-sm text-white mb-6">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-[#60A5FA] flex-shrink-0" />
                <span>Polideportivo Municipal, Agost 03698</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[#60A5FA] flex-shrink-0" />
                <a href="tel:+34676681910" className="hover:text-[#60A5FA] transition-colors">
                  676 681 910
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[#60A5FA] flex-shrink-0 mt-0.5" />
                <a href="mailto:activafitnessagost@gmail.com" className="hover:text-[#60A5FA] transition-colors break-all">
                  activafitnessagost@gmail.com
                </a>
              </li>
            </ul>
            <div className="flex gap-3 mt-6">
              {[
                { Icono: Instagram, href: 'https://www.instagram.com/activafitnessagost' },
                { Icono: Facebook,  href: 'https://www.facebook.com/share/1JRXupkfXU'   },
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
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-600 font-medium uppercase tracking-wider">
          © {new Date().getFullYear()} Activa Fitness · Todos los derechos reservados
        </div>

      </div>
    </footer>
  );
}
