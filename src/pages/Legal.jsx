import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// Tabs: 'aviso' | 'privacidad' | 'cookies'
const TABS = [
  { id: 'aviso',      label: 'Aviso Legal'          },
  { id: 'privacidad', label: 'Política de Privacidad'},
  { id: 'cookies',    label: 'Política de Cookies'   },
];

export default function Legal() {
  const { seccion } = useParams();          // /legal/:seccion  (opcional)
  const [tab, setTab] = useState(seccion ?? 'aviso');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 pb-24 animate-fade-in">
      <Link to="/" className="text-sm text-slate-500 hover:text-white mb-8 inline-block">
        ← Volver al inicio
      </Link>

      <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-8">
        Información Legal
      </h1>

      {/* Tabs */}
      <div className="flex bg-[#1e293b] p-1.5 rounded-2xl border border-slate-700 mb-10 gap-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
              tab === id
                ? 'bg-[#60A5FA] text-black shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="prose-legal">
        {tab === 'aviso'      && <AvisoLegal />}
        {tab === 'privacidad' && <Privacidad />}
        {tab === 'cookies'    && <Cookies />}
      </div>
    </div>
  );
}

/* ── Estilos inline compartidos ── */
const H2 = ({ children }) => (
  <h2 className="text-base font-black text-white uppercase tracking-widest mt-8 mb-3 border-l-4 border-[#60A5FA] pl-3">
    {children}
  </h2>
);
const P  = ({ children }) => <p className="text-slate-400 text-sm leading-relaxed mb-4">{children}</p>;
const Ul = ({ children }) => <ul className="text-slate-400 text-sm leading-relaxed mb-4 space-y-1 list-disc list-inside">{children}</ul>;

/* ════════════════════════════════════════
   AVISO LEGAL
   ════════════════════════════════════════ */
function AvisoLegal() {
  return (
    <>
      <P>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</P>

      <H2>1. Datos identificativos del titular</H2>
      <P>
        En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los siguientes datos:
      </P>
      <Ul>
        <li><strong className="text-slate-300">Denominación:</strong> Activa Fitness Agost</li>
        <li><strong className="text-slate-300">Dirección:</strong> Polideportivo Municipal, Agost, Alicante (CP 03698)</li>
        <li><strong className="text-slate-300">Teléfono:</strong> 676 681 910</li>
        <li><strong className="text-slate-300">Email:</strong> activafitnessagost@gmail.com</li>
      </Ul>

      <H2>2. Objeto y ámbito de aplicación</H2>
      <P>
        El presente Aviso Legal regula el acceso y uso del sitio web de Activa Fitness Agost, cuya finalidad es informar sobre los servicios del centro deportivo y facilitar la consulta de torneos y competiciones organizados por el mismo.
      </P>

      <H2>3. Propiedad intelectual e industrial</H2>
      <P>
        Todos los contenidos del sitio web (textos, imágenes, logotipos, diseño gráfico y código fuente) son propiedad de Activa Fitness Agost o de terceros que han autorizado su uso. Queda prohibida su reproducción, distribución o comunicación pública sin autorización expresa y por escrito del titular.
      </P>

      <H2>4. Responsabilidad</H2>
      <P>
        Activa Fitness Agost no se hace responsable de los daños o perjuicios que pudieran derivarse de la interrupción, error o fallos en el acceso al sitio web, ni del uso que los usuarios hagan de los contenidos del mismo.
      </P>

      <H2>5. Legislación aplicable y jurisdicción</H2>
      <P>
        Las presentes condiciones se rigen por la legislación española. Para la resolución de cualquier controversia, las partes se someten, con renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales de Alicante.
      </P>
    </>
  );
}

/* ════════════════════════════════════════
   POLÍTICA DE PRIVACIDAD
   ════════════════════════════════════════ */
function Privacidad() {
  return (
    <>
      <P>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</P>

      <H2>1. Responsable del tratamiento</H2>
      <Ul>
        <li><strong className="text-slate-300">Identidad:</strong> Activa Fitness Agost</li>
        <li><strong className="text-slate-300">Dirección:</strong> Polideportivo Municipal, Agost, 03698 Alicante</li>
        <li><strong className="text-slate-300">Contacto:</strong> activafitnessagost@gmail.com · 676 681 910</li>
      </Ul>

      <H2>2. Datos que tratamos</H2>
      <P>
        A través de este sitio web podemos tratar los siguientes datos personales:
      </P>
      <Ul>
        <li>Nombre y apellidos de participantes en torneos, facilitados por el organizador.</li>
        <li>Datos de contacto facilitados voluntariamente a través del correo electrónico.</li>
      </Ul>
      <P>
        Este sitio web <strong className="text-slate-300">no dispone de formularios de registro de usuarios</strong> ni recoge datos de los visitantes de forma automática más allá de los datos técnicos propios de cualquier conexión a internet (dirección IP, navegador, idioma).
      </P>

      <H2>3. Finalidad y base jurídica</H2>
      <Ul>
        <li><strong className="text-slate-300">Gestión de torneos:</strong> publicación de clasificaciones y resultados deportivos de interés público para los participantes. Base jurídica: interés legítimo (art. 6.1.f RGPD).</li>
        <li><strong className="text-slate-300">Atención al cliente:</strong> respuesta a consultas enviadas por email o teléfono. Base jurídica: consentimiento del interesado (art. 6.1.a RGPD).</li>
      </Ul>

      <H2>4. Conservación de los datos</H2>
      <P>
        Los datos de participantes en torneos se conservarán mientras el torneo esté activo o hasta que el interesado solicite su supresión. Los datos de contacto se conservarán el tiempo necesario para atender la consulta.
      </P>

      <H2>5. Destinatarios</H2>
      <P>
        Los datos no se cederán a terceros salvo obligación legal. La plataforma técnica del sitio web utiliza servicios de <strong className="text-slate-300">Supabase Inc.</strong> (base de datos, UE) y <strong className="text-slate-300">Vercel Inc.</strong> (alojamiento, UE), con las debidas garantías de seguridad.
      </P>

      <H2>6. Derechos de los interesados</H2>
      <P>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad enviando un email a <strong className="text-slate-300">activafitnessagost@gmail.com</strong> indicando el derecho que deseas ejercer.
      </P>
      <P>
        También puedes presentar una reclamación ante la Agencia Española de Protección de Datos (aepd.es) si consideras que el tratamiento no es adecuado.
      </P>
    </>
  );
}

/* ════════════════════════════════════════
   POLÍTICA DE COOKIES
   ════════════════════════════════════════ */
function Cookies() {
  return (
    <>
      <P>Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</P>

      <H2>1. ¿Qué son las cookies?</H2>
      <P>
        Las cookies son pequeños archivos que se almacenan en tu dispositivo cuando visitas una página web. Permiten que el sitio recuerde información sobre tu visita para mejorar la experiencia de usuario.
      </P>

      <H2>2. Cookies que utiliza este sitio</H2>
      <P>
        Este sitio web utiliza <strong className="text-slate-300">únicamente cookies técnicas estrictamente necesarias</strong> para su funcionamiento:
      </P>
      <Ul>
        <li><strong className="text-slate-300">Sesión de administrador:</strong> cookie de autenticación de Supabase Auth, necesaria para que el administrador pueda iniciar sesión. Solo se establece al hacer login y se elimina al cerrar sesión. No rastrea usuarios públicos.</li>
      </Ul>
      <P>
        Este sitio web <strong className="text-slate-300">no utiliza cookies analíticas, publicitarias ni de seguimiento</strong> de terceros. No hay Google Analytics, Facebook Pixel ni ningún otro sistema de rastreo.
      </P>

      <H2>3. Gestión de cookies</H2>
      <P>
        Puedes configurar tu navegador para rechazar o eliminar cookies en cualquier momento. Ten en cuenta que deshabilitar cookies técnicas puede afectar al funcionamiento del panel de administración.
      </P>
      <Ul>
        <li>Chrome: Configuración → Privacidad y seguridad → Cookies</li>
        <li>Firefox: Opciones → Privacidad y seguridad</li>
        <li>Safari: Preferencias → Privacidad</li>
      </Ul>

      <H2>4. Actualizaciones</H2>
      <P>
        Nos reservamos el derecho a actualizar esta política cuando sea necesario. Los cambios se publicarán en esta misma página.
      </P>
    </>
  );
}