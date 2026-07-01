import { supabase } from '../../supabase';

/**
 * Genera la estructura completa del Torneo 24h en Supabase.
 * Devuelve { ok: true } o { ok: false, error: string }
 */
export async function generarTorneo24h() {
  try {
    // 1. Crear el torneo
    const { data: torneo, error: errTorneo } = await supabase
      .from('torneos')
      .insert([{ nombre: 'Torneo 24h 2026', deporte: 'futsal', estado: 'Inscripciones cerradas', formato: '24h' }])
      .select()
      .single();

    if (errTorneo) throw new Error('Error creando torneo: ' + errTorneo.message);
    const tId = torneo.id;

    // 2. Crear los grupos
    const { data: grupos, error: errGrupos } = await supabase
      .from('grupos')
      .insert([
        { torneo_id: tId, nombre: 'GRUPO A' },
        { torneo_id: tId, nombre: 'GRUPO B' },
        { torneo_id: tId, nombre: 'GRUPO C' },
      ])
      .select();

    if (errGrupos) throw new Error('Error creando grupos: ' + errGrupos.message);

    const gA = grupos.find((g) => g.nombre === 'GRUPO A').id;
    const gB = grupos.find((g) => g.nombre === 'GRUPO B').id;
    const gC = grupos.find((g) => g.nombre === 'GRUPO C').id;

    // 3. Crear los 12 equipos (con alcance de este torneo)
    const nombresEquipos = [
      'WEST JAMON', 'MINAVO DE KIEV', 'CATICARDIAS', 'EL SEQUET',
      'K.91', 'KAULA Y ELIXIR', 'FZ FITNESS', 'FRAN GONZALEZ (LACADOS)',
      'GREÑAS FC', 'MOROS VELLS', 'ANIS TENIS FC', 'METETE QUE TE SALGO',
    ];

    const { data: equipos, error: errEquipos } = await supabase
      .from('participantes')
      .insert(nombresEquipos.map((nombre) => ({ nombre, torneo_id: tId })))
      .select();

    if (errEquipos) throw new Error('Error creando equipos: ' + errEquipos.message);

    const idEq = (nombre) => equipos.find((e) => e.nombre === nombre)?.id;

    // 4. Asignar equipos a grupos
    const { error: errAsig } = await supabase.from('grupo_participantes').insert([
      { grupo_id: gA, participante_id: idEq('WEST JAMON') },
      { grupo_id: gA, participante_id: idEq('MINAVO DE KIEV') },
      { grupo_id: gA, participante_id: idEq('CATICARDIAS') },
      { grupo_id: gA, participante_id: idEq('EL SEQUET') },
      { grupo_id: gB, participante_id: idEq('K.91') },
      { grupo_id: gB, participante_id: idEq('KAULA Y ELIXIR') },
      { grupo_id: gB, participante_id: idEq('FZ FITNESS') },
      { grupo_id: gB, participante_id: idEq('FRAN GONZALEZ (LACADOS)') },
      { grupo_id: gC, participante_id: idEq('GREÑAS FC') },
      { grupo_id: gC, participante_id: idEq('MOROS VELLS') },
      { grupo_id: gC, participante_id: idEq('ANIS TENIS FC') },
      { grupo_id: gC, participante_id: idEq('METETE QUE TE SALGO') },
    ]);

    if (errAsig) throw new Error('Error asignando equipos: ' + errAsig.message);

    // 5. Crear el calendario de partidos
    const partidos = [
      // Jornada 1
      { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '19:30', ubicacion: 'Pabellón', local_id: idEq('CATICARDIAS'), visitante_id: idEq('MINAVO DE KIEV') },
      { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '19:30', ubicacion: 'Pista Exterior', local_id: idEq('EL SEQUET'), visitante_id: idEq('WEST JAMON') },
      { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '20:20', ubicacion: 'Pabellón', local_id: idEq('FZ FITNESS'), visitante_id: idEq('KAULA Y ELIXIR') },
      { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '20:20', ubicacion: 'Pista Exterior', local_id: idEq('FRAN GONZALEZ (LACADOS)'), visitante_id: idEq('K.91') },
      { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '21:10', ubicacion: 'Pabellón', local_id: idEq('ANIS TENIS FC'), visitante_id: idEq('MOROS VELLS') },
      { torneo_id: tId, fase: 'grupos', jornada: 1, hora: '21:10', ubicacion: 'Pista Exterior', local_id: idEq('METETE QUE TE SALGO'), visitante_id: idEq('GREÑAS FC') },
      // Jornada 2
      { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '22:00', ubicacion: 'Pabellón', local_id: idEq('WEST JAMON'), visitante_id: idEq('CATICARDIAS') },
      { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '22:00', ubicacion: 'Pista Exterior', local_id: idEq('MINAVO DE KIEV'), visitante_id: idEq('EL SEQUET') },
      { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '22:50', ubicacion: 'Pabellón', local_id: idEq('K.91'), visitante_id: idEq('FZ FITNESS') },
      { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '22:50', ubicacion: 'Pista Exterior', local_id: idEq('KAULA Y ELIXIR'), visitante_id: idEq('FRAN GONZALEZ (LACADOS)') },
      { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '23:40', ubicacion: 'Pabellón', local_id: idEq('MOROS VELLS'), visitante_id: idEq('METETE QUE TE SALGO') },
      { torneo_id: tId, fase: 'grupos', jornada: 2, hora: '23:40', ubicacion: 'Pista Exterior', local_id: idEq('GREÑAS FC'), visitante_id: idEq('ANIS TENIS FC') },
      // Jornada 3
      { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '00:30', ubicacion: 'Pabellón', local_id: idEq('MINAVO DE KIEV'), visitante_id: idEq('WEST JAMON') },
      { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '00:30', ubicacion: 'Pista Exterior', local_id: idEq('EL SEQUET'), visitante_id: idEq('CATICARDIAS') },
      { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '01:20', ubicacion: 'Pabellón', local_id: idEq('KAULA Y ELIXIR'), visitante_id: idEq('K.91') },
      { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '01:20', ubicacion: 'Pista Exterior', local_id: idEq('FRAN GONZALEZ (LACADOS)'), visitante_id: idEq('FZ FITNESS') },
      { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '02:10', ubicacion: 'Pabellón', local_id: idEq('MOROS VELLS'), visitante_id: idEq('GREÑAS FC') },
      { torneo_id: tId, fase: 'grupos', jornada: 3, hora: '02:10', ubicacion: 'Pista Exterior', local_id: idEq('METETE QUE TE SALGO'), visitante_id: idEq('ANIS TENIS FC') },
    ];

    const { error: errPartidos } = await supabase.from('partidos').insert(partidos);
    if (errPartidos) throw new Error('Error creando partidos: ' + errPartidos.message);

    return { ok: true };
  } catch (err) {
    console.error('[generarTorneo24h]', err);
    return { ok: false, error: err.message };
  }
}
