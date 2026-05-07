/**
 * HoraUbicacionPicker
 *
 * Selector de hora (HH:MM con botones +/−) y ubicación (desplegable según deporte).
 *
 * Props:
 *   hora        {string}   "HH:MM" o ''
 *   ubicacion   {string}
 *   deporte     {string}   'futsal' | 'padel' | undefined
 *   onHora      {fn}       (hora: string) => void
 *   onUbicacion {fn}       (ubicacion: string) => void
 *   compact     {boolean}  true → diseño inline más pequeño (para tabla de pendientes)
 */

const PISTAS = {
  padel:  ['Pista 1', 'Pista 2'],
  futsal: ['Pabellón', 'Pista Exterior'],
};

const HORAS  = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTOS = ['00', '15', '30', '45'];

export function HoraUbicacionPicker({
  hora        = '',
  ubicacion   = '',
  deporte     = 'futsal',
  onHora,
  onUbicacion,
  compact     = false,
}) {
  // Parsear hora actual
  const [hh, mm] = hora ? hora.split(':') : ['', ''];
  const hhVal = HORAS.includes(hh) ? hh : '';
  const mmVal = MINUTOS.includes(mm) ? mm : '';

  const pistas = PISTAS[deporte] ?? PISTAS.futsal;

  const updateHora = (newHH, newMM) => {
    if (newHH && newMM) {
      onHora(`${newHH}:${newMM}`);
    } else {
      onHora('');
    }
  };

  const stepHH = (dir) => {
    const idx = HORAS.indexOf(hhVal);
    const next = HORAS[(idx + dir + 24) % 24];
    updateHora(next, mmVal || '00');
  };

  const stepMM = (dir) => {
    const idx = MINUTOS.indexOf(mmVal === '' ? '00' : mmVal);
    const next = MINUTOS[(idx + dir + MINUTOS.length) % MINUTOS.length];
    updateHora(hhVal || '00', next);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 flex-wrap mt-2">
        {/* Hora compacta */}
        <div className="flex items-center gap-1 bg-black border border-slate-700 rounded-lg px-2 py-1.5">
          {/* HH */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => stepHH(1)}
              className="text-slate-400 hover:text-white leading-none text-[10px] px-0.5"
            >▲</button>
            <span className="text-white font-black text-sm w-5 text-center tabular-nums">
              {hhVal || '--'}
            </span>
            <button
              type="button"
              onClick={() => stepHH(-1)}
              className="text-slate-400 hover:text-white leading-none text-[10px] px-0.5"
            >▼</button>
          </div>

          <span className="text-slate-500 font-black text-sm mb-0.5">:</span>

          {/* MM */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => stepMM(1)}
              className="text-slate-400 hover:text-white leading-none text-[10px] px-0.5"
            >▲</button>
            <span className="text-white font-black text-sm w-5 text-center tabular-nums">
              {mmVal || '--'}
            </span>
            <button
              type="button"
              onClick={() => stepMM(-1)}
              className="text-slate-400 hover:text-white leading-none text-[10px] px-0.5"
            >▼</button>
          </div>
        </div>

        {/* Pista compacta */}
        <select
          value={ubicacion}
          onChange={(e) => onUbicacion(e.target.value)}
          className="bg-black border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs font-bold focus:border-blue-400 outline-none"
        >
          <option value="">— Pista —</option>
          {pistas.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
    );
  }

  // ── Versión completa (para formularios) ──────────────────────────────
  return (
    <div className="grid grid-cols-2 gap-4">

      {/* Hora */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
          Hora <span className="text-slate-600 normal-case font-normal">(opcional)</span>
        </label>
        <div className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 flex items-center justify-between focus-within:border-[#60A5FA] transition-colors">
          {/* HH */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => stepHH(1)}
              className="w-7 h-6 flex items-center justify-center rounded text-slate-500 hover:text-white hover:bg-slate-700 transition-colors text-xs font-black"
            >▲</button>
            <span className="text-white font-black text-xl w-8 text-center tabular-nums leading-none">
              {hhVal || '--'}
            </span>
            <button
              type="button"
              onClick={() => stepHH(-1)}
              className="w-7 h-6 flex items-center justify-center rounded text-slate-500 hover:text-white hover:bg-slate-700 transition-colors text-xs font-black"
            >▼</button>
          </div>

          <span className="text-slate-400 font-black text-2xl mb-1 mx-1">:</span>

          {/* MM */}
          <div className="flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={() => stepMM(1)}
              className="w-7 h-6 flex items-center justify-center rounded text-slate-500 hover:text-white hover:bg-slate-700 transition-colors text-xs font-black"
            >▲</button>
            <span className="text-white font-black text-xl w-8 text-center tabular-nums leading-none">
              {mmVal || '--'}
            </span>
            <button
              type="button"
              onClick={() => stepMM(-1)}
              className="w-7 h-6 flex items-center justify-center rounded text-slate-500 hover:text-white hover:bg-slate-700 transition-colors text-xs font-black"
            >▼</button>
          </div>

          {/* Mostrar hora actual o limpiar */}
          <div className="ml-3 flex flex-col items-end gap-1">
            <span className="text-[#60A5FA] font-black text-base tabular-nums">
              {hhVal && mmVal ? `${hhVal}:${mmVal}` : '—:—'}
            </span>
            {(hhVal || mmVal) && (
              <button
                type="button"
                onClick={() => onHora('')}
                className="text-[10px] text-slate-600 hover:text-red-400 transition-colors font-bold uppercase tracking-widest"
              >
                limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pista / Ubicación */}
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
          Pista / Ubicación <span className="text-slate-600 normal-case font-normal">(opcional)</span>
        </label>
        <div className="relative">
          <select
            value={ubicacion}
            onChange={(e) => onUbicacion(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-[14px] text-white font-bold appearance-none focus:border-[#60A5FA] outline-none transition-colors"
          >
            <option value="">— Selecciona pista —</option>
            {pistas.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xs">▼</span>
        </div>
        {ubicacion && (
          <p className="text-[#60A5FA] text-xs font-bold mt-1.5 flex items-center gap-1">
            📍 {ubicacion}
          </p>
        )}
      </div>

    </div>
  );
}
