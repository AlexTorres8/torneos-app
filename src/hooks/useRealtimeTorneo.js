import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';

/**
 * useRealtimeTorneo
 *
 * Carga grupos y partidos de un torneo y se suscribe a cambios
 * en tiempo real. Cuando el admin guarda un resultado, todos los
 * dispositivos que tengan el torneo abierto lo ven actualizado
 * en menos de 1 segundo, sin recargar.
 *
 * @param {string} torneoId
 * @returns {{ grupos, partidos, cargando, error, recargar }}
 */
export function useRealtimeTorneo(torneoId) {
  const [grupos,   setGrupos]   = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState('');

  // Ref para evitar setState tras unmount
  const montado = useRef(true);
  useEffect(() => {
    montado.current = true;
    return () => { montado.current = false; };
  }, []);

  const cargar = useCallback(async () => {
    if (!torneoId) return;
    setCargando(true);
    setError('');

    const [{ data: g, error: e1 }, { data: p, error: e2 }] = await Promise.all([
      supabase
        .from('grupos')
        .select('id, nombre, grupo_participantes(participantes(id, nombre))')
        .eq('torneo_id', torneoId),
      supabase
        .from('partidos')
        .select([
          'id', 'estado', 'ubicacion', 'fase', 'jornada', 'hora', 'fecha',
          'local_id', 'visitante_id',
          'puntuacion_local', 'puntuacion_visitante', 'detalle_resultado',
          'local:participantes!local_id(nombre)',
          'visitante:participantes!visitante_id(nombre)',
        ].join(', '))
        .eq('torneo_id', torneoId),
    ]);

    if (!montado.current) return;

    if (e1 || e2) {
      setError('No se pudo cargar el torneo. Comprueba tu conexión.');
      console.error('[useRealtimeTorneo]', e1?.message || e2?.message);
    } else {
      setGrupos(g  || []);
      setPartidos(p || []);
    }
    setCargando(false);
  }, [torneoId]);

  // Carga inicial
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { cargar(); }, [cargar]);

  // Suscripción Realtime — escucha cambios en la tabla "partidos"
  // filtrados por torneo_id. Cuando el admin actualiza un partido,
  // actualizamos solo ese registro en el estado local (sin recargar todo).
  useEffect(() => {
    if (!torneoId) return;

    const channel = supabase
      .channel(`torneo_partidos_${torneoId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',           // INSERT | UPDATE | DELETE
          schema: 'public',
          table:  'partidos',
          filter: `torneo_id=eq.${torneoId}`,
        },
        async (payload) => {
          if (!montado.current) return;

          if (payload.eventType === 'UPDATE') {
            // Recargar el partido actualizado con los joins necesarios
            const { data } = await supabase
              .from('partidos')
              .select([
                'id', 'estado', 'ubicacion', 'fase', 'jornada', 'hora',
                'local_id', 'visitante_id',
                'puntuacion_local', 'puntuacion_visitante', 'detalle_resultado',
                'local:participantes!local_id(nombre)',
                'visitante:participantes!visitante_id(nombre)',
              ].join(', '))
              .eq('id', payload.new.id)
              .single();

            if (data && montado.current) {
              setPartidos((prev) =>
                prev.map((p) => p.id === data.id ? data : p)
              );
            }
          }

          if (payload.eventType === 'INSERT') {
            // Un nuevo partido de fase final — recarga completa para tener joins
            cargar();
          }

          if (payload.eventType === 'DELETE') {
            setPartidos((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [torneoId, cargar]);

  return { grupos, partidos, cargando, error, recargar: cargar };
}
