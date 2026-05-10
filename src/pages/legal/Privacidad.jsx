export default function Privacidad() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        <header>
          <p className="text-[#60A5FA] text-xs font-black uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white uppercase tracking-widest">Política de Privacidad</h1>
        </header>

        <Section titulo="1. Responsable del tratamiento">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Identidad:</strong> Activa Fitness Agost</li>
            <li><strong>Dirección:</strong> Av. Elda s/n (Polideportivo), Agost, 03698 Alicante</li>
            <li><strong>Contacto:</strong> <a href="mailto:activafitnessagost@gmail.com" className="text-[#60A5FA] hover:underline">activafitnessagost@gmail.com</a></li>
          </ul>
        </Section>

        <Section titulo="2. Datos que recabamos">
          <p>Actualmente este sitio web es de carácter informativo y no dispone de formularios de recogida de datos personales. En caso de que el usuario contacte voluntariamente a través del correo electrónico o teléfono facilitados, los datos proporcionados (nombre, correo, teléfono) serán tratados exclusivamente para atender su consulta.</p>
        </Section>

        <Section titulo="3. Finalidad y base jurídica">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Atender consultas:</strong> base jurídica — interés legítimo / ejecución de una relación precontractual (art. 6.1.b RGPD).</li>
            <li><strong>Estadísticas de uso web:</strong> base jurídica — consentimiento del usuario (art. 6.1.a RGPD).</li>
          </ul>
        </Section>

        <Section titulo="4. Conservación de datos">
          <p>Los datos se conservarán únicamente durante el tiempo necesario para atender la solicitud y, en su caso, durante los plazos legales de prescripción aplicables.</p>
        </Section>

        <Section titulo="5. Destinatarios">
          <p>No se cederán datos a terceros salvo obligación legal. El sitio puede utilizar servicios de terceros (Google Maps, Supabase) que procesan datos según sus propias políticas de privacidad.</p>
        </Section>

        <Section titulo="6. Derechos del usuario">
          <p>Puede ejercer en cualquier momento los derechos de <strong>acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad</strong> escribiendo a <a href="mailto:activafitnessagost@gmail.com" className="text-[#60A5FA] hover:underline">activafitnessagost@gmail.com</a>, adjuntando copia de su DNI.</p>
          <p className="mt-2">Tiene derecho a presentar una reclamación ante la <strong>Agencia Española de Protección de Datos</strong> (www.aepd.es) si considera que el tratamiento no es conforme al RGPD.</p>
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
