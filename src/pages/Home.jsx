import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Phone, Mail, MapPin, Users, Heart } from 'lucide-react';

const CLASES = ['PILATES', 'FIT', 'A.B.D', 'CICLO', 'FUNCIONAL / TRX', 'PUMP', 'G.A.P'];

const HORARIO = [
  { hora: '9:15 H',  L: 'PILATES', M: 'CICLO',   X: 'PUMP',    J: 'PILATES', V: 'CICLO'   },
  { hora: '10:15 H', L: '',        M: '',         X: '',        J: '',        V: ''         },
  { hora: '11:15 H', L: '',        M: '',         X: '',        J: '',        V: ''         },
  { hora: '16:15 H', L: '',        M: '',         X: '',        J: '',        V: ''         },
  { hora: '17:15 H', L: '',        M: '',         X: '',        J: '',        V: 'PUMP'     },
  { hora: '18:15 H', L: 'PILATES', M: 'PILATES',  X: 'CICLO',   J: 'G.A.P',  V: 'A.B.D'   },
  { hora: '19:15 H', L: 'FIT',     M: 'PUMP',     X: 'FUNC/TRX',J: 'PILATES', V: 'PILATES' },
  { hora: '20:15 H', L: 'CICLO',   M: 'CICLO',    X: 'PILATES', J: 'CICLO',  V: ''         },
];

const COLOR_CLASE = {
  PILATES:   'bg-[#dfbdf2]',
  CICLO:     'bg-[#fcf598]',
  PUMP:      'bg-[#f2948d]',
  'FUNC/TRX':'bg-[#fbcfe8] text-[10px]',
  'G.A.P':   'bg-[#a7f3d0]',
  'A.B.D':   'bg-[#fdba74]',
  FIT:       'bg-[#93c5fd]',
};

export default function Home() {
  return (
    <div className="animate-fade-in w-full bg-white text-slate-800 pb-24">
      {/* HERO */}
      <div
        className="relative h-[calc(100vh-4rem)] flex flex-col items-center justify-end pb-12 md:pb-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/fondo-gym.jpg')" }}
      >
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-8 w-full px-6 justify-center">
          {[
            { to: '/futsal',   label: 'Torneo Futsal'   },
            { to: '/nosotros', label: 'Sobre Nosotros'  },
            { to: '/padel',    label: 'Torneo Pádel'    },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="bg-[#60A5FA] text-black text-xs md:text-sm font-black uppercase tracking-widest py-4 px-8 text-center hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_20px_rgba(96,165,250,0.3)] w-full md:w-64"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-24 space-y-32">
        {/* CONTACTO + SERVICIOS */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Tarjeta de contacto */}
          <div className="relative max-w-md mx-auto w-full">
            <div className="absolute inset-0 bg-[#60A5FA] rounded-[3rem] translate-x-4 translate-y-4" />
            <div className="relative bg-white border-[3px] border-black rounded-[3rem] p-10 space-y-6 text-sm font-medium">
              <h3 className="text-[#60A5FA] text-2xl font-black italic text-center mb-8 uppercase">
                Gimnasio en Agost
              </h3>
              {[
                { Icon: Clock, title: 'Lunes a viernes', desc: '8:00-14:00 | 15:30-22:00' },
                { Icon: Clock, title: 'Sábados',          desc: '8:00 - 14:00'              },
                { Icon: Phone, desc: '676 681 910'                                           },
                { Icon: Mail,  desc: 'activafitnessagost@gmail.com'                          },
                { Icon: MapPin,desc: 'Polideportivo Municipal, Agost'                        },
              ].map(({ Icon, title, desc }, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Icon fill="black" stroke={i < 2 ? 'white' : 'black'} size={24} className="flex-shrink-0" />
                  <div>
                    {title && <p className="font-bold text-black">{title}</p>}
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Servicios */}
          <div className="space-y-12 pl-4">
            {['Zona de Musculación', 'Clases dirigidas'].map((title, i) => (
              <div key={title}>
                <h3 className="flex items-center gap-4 text-3xl md:text-4xl font-bold font-serif italic uppercase text-black mb-6 tracking-wide">
                  <div className="w-6 h-6 rounded-full bg-[#60A5FA] flex-shrink-0" />
                  {title}
                </h3>
                {i === 1 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-4 font-bold font-serif text-sm md:text-base text-black">
                    {CLASES.map((clase) => (
                      <div key={clase} className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#60A5FA] flex-shrink-0" />
                        {clase}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* VALORES */}
        <div className="space-y-16 pt-10 pb-16 max-w-4xl mx-auto">
          {[
            {
              Icon: Users,
              titulo: 'Asesoramiento Profesional',
              desc: 'Contamos con profesionales disponibles en cualquier momento para ayudarte en todo lo que sea necesario',
            },
            {
              Icon: Heart,
              titulo: 'Objetivo',
              desc: 'Nuestro objetivo es claro: mejorar tu salud, tu bienestar y tu calidad de vida a través del ejercicio, en un espacio cómodo, accesible y adaptado a ti.',
              fill: true,
            },
          ].map(({ Icon, titulo, desc, fill }) => (
            <div key={titulo} className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="flex-shrink-0">
                <Icon
                  size={80}
                  className="text-[#60A5FA]"
                  fill={fill ? '#60A5FA' : 'none'}
                  strokeWidth={fill ? 1 : 1.5}
                />
              </div>
              <div>
                <h3 className="text-[#60A5FA] text-3xl font-bold font-serif italic uppercase mb-4 tracking-wide">
                  {titulo}
                </h3>
                <p className="text-black font-bold font-serif italic uppercase leading-relaxed text-sm md:text-base tracking-wide">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* HORARIO CLASES */}
        <div className="pt-10">
          <h2 className="text-[#60A5FA] text-3xl md:text-5xl font-black italic text-center mb-10 uppercase tracking-widest drop-shadow-sm">
            Horario Clases Dirigidas
          </h2>
          <div className="overflow-x-auto pb-6">
            <table className="w-full min-w-[800px] text-center border-separate border-spacing-1 md:border-spacing-1.5 text-xs md:text-sm font-bold">
              <thead>
                <tr>
                  <th className="w-24" />
                  {['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'].map((d) => (
                    <th key={d} className="bg-[#6b92c5] text-white p-3 rounded">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {/* Fila vacía 8:00 */}
                <tr>
                  <td className="bg-[#6b92c5] text-white p-3 rounded">8:00 H</td>
                  {Array(5).fill(null).map((_, i) => (
                    <td key={i} className="bg-white border border-slate-200 rounded" />
                  ))}
                </tr>
                {/* Filas de clases */}
                {HORARIO.map(({ hora, L, M, X, J, V }, idx) => (
                  <Fragment key={hora}>
                    <tr>
                      <td className="bg-[#6b92c5] text-white p-3 rounded">{hora}</td>
                      {[L, M, X, J, V].map((clase, i) => (
                        <td key={i} className={`rounded p-2 ${clase ? COLOR_CLASE[clase] || 'bg-white border border-slate-200' : 'bg-white border border-slate-200'}`}>
                          {clase}
                        </td>
                      ))}
                    </tr>
                    {idx === 2 && (
                      <tr>
                        <td className="bg-[#6b92c5] text-white p-2 text-[10px] md:text-xs rounded leading-tight">14:00H-15:30H</td>
                        {Array(5).fill(null).map((_, i) => (
                          <td key={i} className="bg-[#e2e8f0] text-slate-500 rounded">CERRADO</td>
                        ))}
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
