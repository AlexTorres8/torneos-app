import { Target, Dumbbell, CircleDot } from 'lucide-react';

const CARDS = [
  {
    Icon: Target,
    title: 'Nuestra Misión',
    desc: 'Fomentar un estilo de vida saludable y activo a través de un entrenamiento de calidad, instalaciones modernas y una atención cercana.',
  },
  {
    Icon: Dumbbell,
    title: 'Instalaciones',
    desc: 'Contamos con zona de musculación, salas para clases dirigidas, pistas de pádel exteriores y un pabellón preparado.',
  },
  {
    Icon: CircleDot,
    title: 'Comunidad',
    desc: 'Organizamos torneos regulares de Fútbol Sala y Pádel, creando un ambiente competitivo y sano entre participantes.',
  },
];

export default function SobreNosotros() {
  return (
    <div className="w-full flex flex-col items-center bg-[#0f172a] animate-fade-in pb-20 relative">
      {/* HERO */}
      <div
        className="relative w-full h-[40vh] md:h-[50vh] flex flex-col items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/fondo-gym.jpg')" }}
      >
        <div className="absolute inset-0 bg-slate-900/80 pointer-events-none" />
        <div className="relative z-10 text-center px-4 mt-10">
          <Dumbbell className="w-12 h-12 md:w-16 md:h-16 text-[#60A5FA] mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-widest uppercase mb-4 drop-shadow-lg">
            Sobre Nosotros
          </h1>
          <p className="text-[#60A5FA] font-bold tracking-widest uppercase text-sm md:text-base">
            Pasión por el deporte en Agost
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 space-y-24 w-full relative z-10">
        {/* QUÉ ES */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black text-white mb-8 uppercase tracking-wider">
            ¿Qué es Activa Fitness?
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Nacimos con un objetivo claro: ofrecer a los vecinos de Agost y alrededores unas instalaciones
            deportivas de primer nivel. No somos solo un gimnasio, somos una comunidad donde el esfuerzo,
            la constancia y el compañerismo se unen para ayudarte a alcanzar tu mejor versión.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-8">
          {CARDS.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="bg-[#1e293b] border border-slate-700/50 p-8 rounded-2xl hover:border-[#60A5FA] transition-colors shadow-xl group"
            >
              <Icon className="w-12 h-12 text-[#60A5FA] mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-4">{title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
