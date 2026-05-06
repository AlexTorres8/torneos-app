import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

/**
 * Hook reutilizable para gestionar la sesión de Supabase Auth.
 * Devuelve { sesion, cargando }
 * - sesion: objeto Session de Supabase o null
 * - cargando: true mientras se comprueba la sesión inicial
 */
export function useAuth() {
  const [sesion,   setSesion]   = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Leer sesión actual al montar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session);
      setCargando(false);
    });

    // Escuchar cambios (login, logout, expiración de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { sesion, cargando };
}
