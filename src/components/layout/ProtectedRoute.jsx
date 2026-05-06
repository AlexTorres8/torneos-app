import { useAuth } from '../../hooks/useAuth';
import LoginAdmin from '../../pages/admin/LoginAdmin';

/**
 * Envuelve cualquier ruta que requiera autenticación.
 * - Mientras carga la sesión: spinner
 * - Sin sesión: muestra LoginAdmin (no redirige, evita flash)
 * - Con sesión: renderiza los children normalmente
 */
export default function ProtectedRoute({ children }) {
  const { sesion, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sesion) {
    return <LoginAdmin />;
  }

  return children;
}
