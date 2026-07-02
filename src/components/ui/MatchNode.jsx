import { MapPin } from 'lucide-react';
import { fechaCorta } from '../../lib/fecha';

/**
 * Tarjeta de partido reutilizable.
 * variant: 'futsal' | 'futsal24h' | 'padel'
 */
export function MatchNode({ p, variant = 'futsal' }) {
  if (variant === 'futsal24h') return <MatchNode24H p={p} />;
  if (variant === 'padel') return <MatchNodePadel p={p} />;
  return <MatchNodeFutsal p={p} />;
}

// --- FUTSAL ESTÁNDAR ---
function MatchNodeFutsal({ p }) {
  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-lg p-3 w-52 shadow-2xl relative">
      <div className="text-[9px] font-black uppercase mb-2 flex justify-between items-center border-b border-slate-800/80 pb-1.5 text-slate-500">
        <span>{fechaCorta(p?.fecha) && `${fechaCorta(p?.fecha)} · `}{p?.hora || ''} {p?.ubicacion || 'Por definir'}</span>
        <span className={p?.estado === 'finalizado' ? 'text-emerald-500' : ''}>
          {p?.estado === 'pendiente' ? 'vs' : p?.estado === 'finalizado' ? 'FIN' : '---'}
        </span>
      </div>
      <div className="space-y-1.5 mt-2">
        <div className="flex justify-between text-[11px] font-bold text-white">
          <span className="truncate pr-2">{p?.local?.nombre || 'Esperando rival...'}</span>
          <span className="text-blue-400">{p?.estado === 'finalizado' ? p.puntuacion_local : '-'}</span>
        </div>
        <div className="flex justify-between text-[11px] font-bold text-white">
          <span className="truncate pr-2">{p?.visitante?.nombre || 'Esperando rival...'}</span>
          <span className="text-blue-400">{p?.estado === 'finalizado' ? p.puntuacion_visitante : '-'}</span>
        </div>
      </div>
    </div>
  );
}

// --- FUTSAL 24H ---
function MatchNode24H({ p }) {
  return (
    <div className="bg-[#0f172a] border border-slate-700/50 rounded-lg p-3 w-[260px] shadow-2xl relative transition-all hover:border-amber-500/50">
      <div className="text-[10px] font-black uppercase mb-3 flex justify-between items-center border-b border-slate-800/80 pb-2 text-slate-400">
        <span className="flex items-center gap-1.5">
          <MapPin size={12} className="text-amber-500" />
          {fechaCorta(p?.fecha) && `${fechaCorta(p?.fecha)} · `}{p?.ubicacion || 'Por definir'}
        </span>
        <span className={p?.estado === 'finalizado' ? 'text-emerald-500 font-black' : 'text-slate-500'}>
          {p?.estado === 'pendiente' ? p?.hora || 'vs' : p?.estado === 'finalizado' ? 'FIN' : '---'}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-white items-center bg-[#1e293b] p-1.5 rounded">
          <span className="truncate pr-2">{p?.local?.nombre || 'Esperando rival...'}</span>
          <span className="text-amber-500 bg-black/50 px-2 py-0.5 rounded text-sm">
            {p?.estado === 'finalizado' ? p.puntuacion_local : '-'}
          </span>
        </div>
        <div className="flex justify-between text-xs font-bold text-white items-center bg-[#1e293b] p-1.5 rounded">
          <span className="truncate pr-2">{p?.visitante?.nombre || 'Esperando rival...'}</span>
          <span className="text-amber-500 bg-black/50 px-2 py-0.5 rounded text-sm">
            {p?.estado === 'finalizado' ? p.puntuacion_visitante : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- PÁDEL (estilo Premier Padel) ---
function MatchNodePadel({ p }) {
  let setsL = [];
  let setsV = [];

  if (p?.detalle_resultado) {
    const matchSets = p.detalle_resultado
      .split(',')
      .map((s) => s.trim().split(/[-/ ]+/));
    setsL = matchSets.map((s) => s[0] || '-');
    setsV = matchSets.map((s) => s[1] || '-');
  }

  return (
    <div className="bg-[#0f172a] border border-slate-700/50 rounded-lg shadow-2xl relative w-64 overflow-hidden flex flex-col transition-all hover:border-slate-500">
      <div className="text-[9px] font-black uppercase flex justify-between items-center bg-slate-800/80 px-3 py-1.5 text-slate-400">
        <span>{fechaCorta(p?.fecha) && `${fechaCorta(p?.fecha)} · `}{p?.hora || ''} {p?.ubicacion || 'Por definir'}</span>
        <span className={p?.estado === 'finalizado' ? 'text-emerald-500' : ''}>
          {p?.estado === 'pendiente' ? 'vs' : p?.estado === 'finalizado' ? 'FIN' : '---'}
        </span>
      </div>
      <div className="flex-1 flex bg-[#111c2e]">
        <div className="flex-1 p-2 flex flex-col justify-around min-w-0">
          <span className={`font-bold text-[11px] truncate ${p?.puntuacion_local > p?.puntuacion_visitante ? 'text-white' : 'text-slate-400'}`}>
            {p?.local?.nombre || 'Esperando...'}
          </span>
          <div className="h-[1px] w-full bg-slate-700/50 my-1"></div>
          <span className={`font-bold text-[11px] truncate ${p?.puntuacion_visitante > p?.puntuacion_local ? 'text-white' : 'text-slate-400'}`}>
            {p?.visitante?.nombre || 'Esperando...'}
          </span>
        </div>
        <div className="flex bg-[#1e2b40] px-1 py-1.5 border-l border-slate-700/50">
          <div className="flex flex-col justify-around px-2 border-r border-slate-700/50 font-black text-white text-sm">
            <span>{p?.estado === 'finalizado' ? p.puntuacion_local : '-'}</span>
            <span>{p?.estado === 'finalizado' ? p.puntuacion_visitante : '-'}</span>
          </div>
          {p?.estado === 'finalizado' &&
            setsL.map((s, i) => (
              <div key={i} className="flex flex-col justify-around px-1.5 text-slate-400 font-bold text-xs text-center min-w-[20px]">
                <span className={parseInt(setsL[i]) > parseInt(setsV[i]) ? 'text-white' : ''}>{setsL[i]}</span>
                <span className={parseInt(setsV[i]) > parseInt(setsL[i]) ? 'text-white' : ''}>{setsV[i]}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
