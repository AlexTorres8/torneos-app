import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../../supabase';

/**
 * Pantalla de login para proteger /admin.
 * Usa Supabase Auth (email + password).
 * No necesita registro — el admin crea el usuario desde
 * el dashboard de Supabase: Authentication → Users → Add user.
 */
export default function LoginAdmin() {
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [verPass,    setVerPass]     = useState(false);
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      // Mensaje amigable en español
      if (err.message.includes('Invalid login')) {
        setError('Email o contraseña incorrectos.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Confirma tu email antes de acceder.');
      } else {
        setError(err.message);
      }
    }
    // Si no hay error, useAuth detecta el cambio y redirige automáticamente
    setCargando(false);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* LOGO / TÍTULO */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#60A5FA]/10 border border-[#60A5FA]/30 mb-6">
            <Lock size={28} className="text-[#60A5FA]" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Panel Admin</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">Activa Fitness · Acceso restringido</p>
        </div>

        {/* FORMULARIO */}
        <form
          onSubmit={handleLogin}
          className="bg-[#1e293b] border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-5"
        >
          {/* Email */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@activafitness.com"
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white text-sm font-medium focus:border-[#60A5FA] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={verPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-9 pr-10 py-3 text-white text-sm font-medium focus:border-[#60A5FA] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setVerPass(!verPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm font-bold">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-[#60A5FA] hover:bg-blue-400 disabled:opacity-50 text-black font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(96,165,250,0.2)] flex items-center justify-center gap-2"
          >
            {cargando ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <Lock size={16} /> Entrar al panel
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6 font-medium">
          ¿Sin acceso? Contacta al desarrollador.
        </p>
      </div>
    </div>
  );
}
