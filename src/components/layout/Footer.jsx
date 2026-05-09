import { Link } from 'react-router-dom';
import { Dumbbell, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Instagram, Facebook } from '../ui/Iconos';

const MAPS_EMBED = 'https://maps.google.com/maps?q=Polideportivo+Municipal,+Agost,+Alicante,+Spain&output=embed&hl=es';
const MAPS_LINK  = 'https://www.google.com/maps/search/?api=1&query=Polideportivo+Municipal,+Agost,+Alicante';

export default function Footer() {
  return (
    <footer className="bg-[#0b1121] border-t border-slate-800 pt-12 pb-8 mt-auto z-10 relative">
      <div className="max-w-7xl mx-auto px-6">

        {/* Columnas principales */}
        <div className="grid md:grid-cols-3 gap-10 text-slate-400 text-sm mb-10">

          {/* Marca */}
          <div>
            <div className="flex items-center gap-3 text-white mb-6">
              <Dumbbell className="text-[#60A5FA]" size={24} />
              <h4 className="font-black uppercase tracking-widest text-sm">Activa Fitness</h4>
            </div>
            <p className="leading-relaxed">
              Tu centro deportivo en Agost. Instalaciones premium, clases dirigidas y torneos oficiales.
            </p>
          </div>

          {/* Secciones */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm text-white mb-6">Secciones</h4>
            <ul className="space-y-2">
              {[
                { to: '/',         label: 'Gimnasio'      },
                { to: '/futsal',   label: 'Futsal'        },
                { to: '/padel',    label: 'Pádel'         },
                { to: '/nosotros', label: 'Sobre Nosotros' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="hover:text-[#60A5FA] transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-sm text-white mb-6">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-[#60A5FA] flex-shrink-0" />
                <span>Polideportivo Municipal, Agost 03698</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[#60A5FA] flex-shrink-0" />
                <a
                  href="tel:+34676681910"
                  className="hover:text-[#60A5FA] transition-colors"
                >
                  676 681 910
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-[#60A5FA] flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:activafitnessagost@gmail.com"
                  className="hover:text-[#60A5FA] transition-colors break-all"
                >
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

        {/* Mapa */}
        <div className="mb-10">
          <div className="relative rounded-xl overflow-hidden h-52 border border-slate-800">
            <iframe
              src={MAPS_EMBED}
              className="w-full h-full border-0 pointer-events-none"
              title="Ubicación Activa Fitness Agost"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 z-10 flex items-end justify-end p-3"
              aria-label="Ver en Google Maps"
            >
            </a>
          </div>
        </div>

        {/* Barra inferior: copyright + legales */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 font-medium uppercase tracking-wider">
          <p>© {new Date().getFullYear()} Activa Fitness · Todos los derechos reservados</p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link to="/aviso-legal"  className="hover:text-slate-400 transition-colors">Aviso Legal</Link>
            <Link to="/privacidad"   className="hover:text-slate-400 transition-colors">Privacidad</Link>
            <Link to="/cookies"      className="hover:text-slate-400 transition-colors">Cookies</Link>
          </nav>
        </div>

      </div>
    </footer>
  );
}
