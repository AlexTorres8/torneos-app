export default function AvisoLegal() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        <header>
          <p className="text-[#60A5FA] text-xs font-black uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white uppercase tracking-widest">Aviso Legal</h1>
        </header>

        <Section titulo="1. Datos identificativos">
          <p>En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa:</p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li><strong>Denominación:</strong> Activa Fitness Agost</li>
            <li><strong>Dirección:</strong> Av. Elda s/n (Polideportivo), Agost, 03698 Alicante</li>
            <li><strong>Teléfono:</strong> <a href="tel:+34676681910" className="text-[#60A5FA] hover:underline">676 681 910</a></li>
            <li><strong>Correo electrónico:</strong> <a href="mailto:activafitnessagost@gmail.com" className="text-[#60A5FA] hover:underline">activafitnessagost@gmail.com</a></li>
          </ul>
        </Section>

        <Section titulo="2. Objeto y ámbito de aplicación">
          <p>El presente Aviso Legal regula el acceso y uso del sitio web <strong>activafitnessagost.es</strong> (en adelante, «el sitio web»), cuya titularidad corresponde a Activa Fitness Agost.</p>
          <p className="mt-2">El acceso al sitio web implica la aceptación plena y sin reservas de las presentes condiciones.</p>
        </Section>

        <Section titulo="3. Propiedad intelectual e industrial">
          <p>Todos los contenidos del sitio web (textos, imágenes, logotipos, diseño, código fuente, etc.) son propiedad de Activa Fitness Agost o cuentan con las licencias correspondientes. Queda prohibida su reproducción, distribución o comunicación pública sin autorización expresa.</p>
        </Section>

        <Section titulo="4. Responsabilidad">
          <p>Activa Fitness Agost no se responsabiliza de los posibles daños o perjuicios derivados de interferencias, interrupciones, virus informáticos, averías o desconexiones del sistema informático, ni de retrasos o bloqueos en el uso del presente sitio web causados por deficiencias o sobrecargas ajenas al control del titular.</p>
        </Section>

        <Section titulo="5. Legislación aplicable">
          <p>Las presentes condiciones se rigen por la legislación española. Para cualquier controversia derivada del uso del sitio web, las partes se someten a los juzgados y tribunales de Alicante, con renuncia expresa a cualquier otro fuero.</p>
        </Section>

        <p className="text-xs text-slate-600 pt-4">Última actualización: mayo de 2025</p>
      </div>
    </div>
  );
}

function Section({ titulo, children }) {
  return (
    <section className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 space-y-2">
      <h2 className="text-white font-black text-lg mb-3">{titulo}</h2>
      <div className="text-slate-400 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
