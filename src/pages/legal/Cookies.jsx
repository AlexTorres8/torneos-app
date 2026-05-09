export default function Cookies() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-300 py-20 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        <header>
          <p className="text-[#60A5FA] text-xs font-black uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black text-white uppercase tracking-widest">Política de Cookies</h1>
        </header>

        <Section titulo="¿Qué son las cookies?">
          <p>Las cookies son pequeños ficheros de texto que los sitios web almacenan en el dispositivo del usuario para recordar preferencias, analizar el uso del sitio o personalizar contenidos.</p>
        </Section>

        <Section titulo="Cookies que utiliza este sitio">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-separate border-spacing-0 mt-2">
              <thead>
                <tr className="text-slate-500 uppercase tracking-wider">
                  <th className="text-left pb-3 pr-4">Cookie</th>
                  <th className="text-left pb-3 pr-4">Proveedor</th>
                  <th className="text-left pb-3 pr-4">Tipo</th>
                  <th className="text-left pb-3">Finalidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {[
                  { nombre: '__session', proveedor: 'Supabase', tipo: 'Técnica', fin: 'Mantener la sesión de administración' },
                  { nombre: '_ga, _gid', proveedor: 'Google Analytics', tipo: 'Analítica', fin: 'Estadísticas anónimas de uso' },
                  { nombre: 'NID, SNID', proveedor: 'Google Maps', tipo: 'Terceros', fin: 'Mostrar el mapa de ubicación' },
                ].map((row) => (
                  <tr key={row.nombre} className="text-slate-400">
                    <td className="py-2.5 pr-4 font-mono text-[#60A5FA]">{row.nombre}</td>
                    <td className="py-2.5 pr-4">{row.proveedor}</td>
                    <td className="py-2.5 pr-4">{row.tipo}</td>
                    <td className="py-2.5">{row.fin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section titulo="Cómo gestionar o desactivar las cookies">
          <p>Puede configurar su navegador para bloquear o eliminar las cookies. A continuación encontrará los enlaces de ayuda de los principales navegadores:</p>
          <ul className="mt-3 space-y-1.5">
            {[
              { label: 'Google Chrome',    href: 'https://support.google.com/chrome/answer/95647'                    },
              { label: 'Mozilla Firefox',  href: 'https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies' },
              { label: 'Safari',           href: 'https://support.apple.com/es-es/guide/safari/sfri11471/mac'         },
              { label: 'Microsoft Edge',   href: 'https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09' },
            ].map(({ label, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#60A5FA] hover:underline">
                  {label} →
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3">Tenga en cuenta que deshabilitar las cookies puede afectar al correcto funcionamiento del sitio web.</p>
        </Section>

        <Section titulo="Más información">
          <p>Para cualquier duda sobre el uso de cookies, puede contactarnos en <a href="mailto:activafitnessagost@gmail.com" className="text-[#60A5FA] hover:underline">activafitnessagost@gmail.com</a>.</p>
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
