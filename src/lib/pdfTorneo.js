import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { calcularStats } from '../hooks/useCalcStats';
import { ordenarClasificacion } from './clasificacion';
import { fechaCorta } from './fecha';

const ORDEN_FASES = ['playoffs', 'cuartos', 'semis', 'final'];
const LABEL_FASES = { playoffs: 'Ronda Previa', cuartos: 'Cuartos de Final', semis: 'Semifinales', final: 'Gran Final' };

const AZUL = [96, 165, 250];

/**
 * Genera y descarga un PDF con todo el torneo:
 * clasificación, enfrentamientos pendientes, finalizados y cuadro eliminatorio.
 *
 * @param {Object}   torneo    - { nombre, deporte }
 * @param {Array}    grupos    - [{ id, nombre, grupo_participantes:[{participantes:{id,nombre}}] }]
 * @param {Array}    partidos  - todos los partidos (con joins local/visitante)
 * @param {Array}    sanciones - opcional, [{ jugador, tipo, partidos_sancion, motivo, participantes:{nombre} }]
 */
export function generarPdfTorneo({ torneo, grupos, partidos, sanciones = [] }) {
  const deporte = torneo?.deporte || 'futsal';
  const esPadel = deporte === 'padel';
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const anchoUtil = doc.internal.pageSize.getWidth() - margin * 2;

  // ── Cabecera ──────────────────────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text((torneo?.nombre || 'Torneo').toUpperCase(), margin, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text(`${esPadel ? 'Pádel' : 'Fútbol Sala'} · Activa Fitness Agost`, margin, 66);
  doc.setTextColor(0);

  let y = 90;

  const heading = (texto) => {
    y = asegurarEspacio(doc, y, 60);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(texto, margin, y);
    y += 8;
  };

  const tabla = (head, body, opciones = {}) => {
    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: AZUL, textColor: 0, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      tableWidth: anchoUtil,
      ...opciones,
    });
    y = doc.lastAutoTable.finalY + 22;
  };

  // ── 1. Clasificación por grupo ──────────────────────────────────────────────
  heading('Clasificación');
  grupos.forEach((g) => {
    const equipos = ordenarClasificacion(
      g.grupo_participantes.map((gp) => ({
        ...gp.participantes,
        stats: calcularStats(partidos, gp.participantes.id, deporte),
      })),
      partidos,
      deporte
    );

    y = asegurarEspacio(doc, y, 60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(g.nombre, margin, y);
    y += 6;

    const head = esPadel
      ? ['#', 'Equipo', 'Pts', 'PJ', 'SF', 'SC', 'Dif']
      : ['#', 'Equipo', 'Pts', 'PJ', 'PG', 'PE', 'PP', 'GF', 'GC', 'Dif'];
    const body = equipos.map((e, i) => {
      const dif = e.stats.dif > 0 ? `+${e.stats.dif}` : String(e.stats.dif);
      return esPadel
        ? [i + 1, e.nombre, e.stats.pts, e.stats.pj, e.stats.gf, e.stats.gc, dif]
        : [i + 1, e.nombre, e.stats.pts, e.stats.pj, e.stats.pg, e.stats.pe, e.stats.pp, e.stats.gf, e.stats.gc, dif];
    });
    tabla(head, body);
  });

  // ── 2. Enfrentamientos pendientes ────────────────────────────────────────────
  const pendientes = partidos.filter((p) => p.estado !== 'finalizado');
  if (pendientes.length > 0) {
    heading('Enfrentamientos pendientes');
    const body = ordenarPartidos(pendientes).map((p) => [
      etiquetaFase(p),
      fechaCorta(p.fecha) || '—',
      p.hora || '—',
      p.ubicacion || '—',
      p.local?.nombre ?? 'Por definir',
      p.visitante?.nombre ?? 'Por definir',
    ]);
    tabla(['Fase/Jorn.', 'Fecha', 'Hora', 'Pista', 'Local', 'Visitante'], body);
  }

  // ── 3. Partidos finalizados ──────────────────────────────────────────────────
  const finalizados = partidos.filter((p) => p.estado === 'finalizado');
  if (finalizados.length > 0) {
    heading('Partidos finalizados');
    const body = ordenarPartidos(finalizados).map((p) => [
      etiquetaFase(p),
      fechaCorta(p.fecha) || '—',
      p.local?.nombre ?? '?',
      `${p.puntuacion_local} - ${p.puntuacion_visitante}`,
      p.visitante?.nombre ?? '?',
      esPadel && p.detalle_resultado ? p.detalle_resultado : '',
    ]);
    tabla(['Fase/Jorn.', 'Fecha', 'Local', 'Resultado', 'Visitante', 'Sets'], body);
  }

  // ── 4. Cuadro eliminatorio ───────────────────────────────────────────────────
  const fasesFinal = ORDEN_FASES.filter((f) => partidos.some((p) => p.fase === f));
  if (fasesFinal.length > 0) {
    heading('Cuadro eliminatorio');
    const body = [];
    fasesFinal.forEach((fase) => {
      partidos
        .filter((p) => p.fase === fase)
        .sort((a, b) => a.jornada - b.jornada)
        .forEach((p) => {
          const marcador = p.estado === 'finalizado'
            ? `${p.puntuacion_local} - ${p.puntuacion_visitante}`
            : 'vs';
          body.push([
            LABEL_FASES[fase],
            p.local?.nombre ?? 'Por definir',
            marcador,
            p.visitante?.nombre ?? 'Por definir',
          ]);
        });
    });
    tabla(['Ronda', 'Local', 'Resultado', 'Visitante'], body);
  }

  // ── 5. Sanciones ─────────────────────────────────────────────────────────────
  if (sanciones.length > 0) {
    heading('Sanciones');
    const body = sanciones.map((s) => [
      s.tipo === 'roja' ? 'Roja' : 'Amarilla',
      s.jugador,
      s.participantes?.nombre ?? '—',
      s.partidos_sancion > 0 ? `${s.partidos_sancion}` : '—',
      s.motivo || '',
    ]);
    tabla(['Tarjeta', 'Jugador', 'Equipo', 'Part. sanción', 'Motivo'], body);
  }

  // ── Pie ───────────────────────────────────────────────────────────────────────
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `activafitnessagost.es · ${new Date().toLocaleDateString('es-ES')} · Página ${i}/${total}`,
      margin,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  const nombreArchivo = `${(torneo?.nombre || 'torneo').replace(/[^a-z0-9]+/gi, '_').toLowerCase()}.pdf`;
  doc.save(nombreArchivo);
}

// ── Auxiliares ────────────────────────────────────────────────────────────────

function asegurarEspacio(doc, y, necesario) {
  const alto = doc.internal.pageSize.getHeight();
  if (y + necesario > alto - 40) {
    doc.addPage();
    return 50;
  }
  return y;
}

function etiquetaFase(p) {
  if (p.fase === 'grupos') return `Jorn. ${p.jornada ?? '—'}`;
  return LABEL_FASES[p.fase] ?? p.fase;
}

/** Ordena partidos: primero grupos por jornada, luego fases finales. */
function ordenarPartidos(lista) {
  const peso = (f) => (f === 'grupos' ? 0 : 1 + ORDEN_FASES.indexOf(f));
  return [...lista].sort((a, b) =>
    peso(a.fase) - peso(b.fase) || (a.jornada ?? 0) - (b.jornada ?? 0)
  );
}
