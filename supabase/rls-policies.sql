-- ════════════════════════════════════════════════════════════════════════════
-- POLÍTICAS RLS — Activa Fitness Torneos App
--
-- Cómo aplicar:
--   1. Ve a Supabase Dashboard → SQL Editor
--   2. Pega este script completo y ejecuta (Run)
--   3. Verifica en Database → Tables que cada tabla muestra "RLS enabled"
--
-- Lógica:
--   · Lectura pública: cualquier visitante puede ver clasificaciones y partidos
--   · Escritura solo admin: únicamente usuarios autenticados (admin) pueden
--     crear, modificar o borrar datos
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Activa RLS en todas las tablas ────────────────────────────────────────
ALTER TABLE torneos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupo_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos            ENABLE ROW LEVEL SECURITY;


-- ── 2. Limpia políticas anteriores (por si se re-ejecuta el script) ──────────
DROP POLICY IF EXISTS "public_read_torneos"             ON torneos;
DROP POLICY IF EXISTS "public_read_grupos"              ON grupos;
DROP POLICY IF EXISTS "public_read_participantes"       ON participantes;
DROP POLICY IF EXISTS "public_read_grupo_participantes" ON grupo_participantes;
DROP POLICY IF EXISTS "public_read_partidos"            ON partidos;

DROP POLICY IF EXISTS "admin_all_torneos"               ON torneos;
DROP POLICY IF EXISTS "admin_all_grupos"                ON grupos;
DROP POLICY IF EXISTS "admin_all_participantes"         ON participantes;
DROP POLICY IF EXISTS "admin_all_grupo_participantes"   ON grupo_participantes;
DROP POLICY IF EXISTS "admin_all_partidos"              ON partidos;


-- ── 3. Lectura pública (anon key) ────────────────────────────────────────────
CREATE POLICY "public_read_torneos"
  ON torneos FOR SELECT USING (true);

CREATE POLICY "public_read_grupos"
  ON grupos FOR SELECT USING (true);

CREATE POLICY "public_read_participantes"
  ON participantes FOR SELECT USING (true);

CREATE POLICY "public_read_grupo_participantes"
  ON grupo_participantes FOR SELECT USING (true);

CREATE POLICY "public_read_partidos"
  ON partidos FOR SELECT USING (true);


-- ── 4. Escritura solo admin (usuario autenticado) ────────────────────────────
CREATE POLICY "admin_all_torneos"
  ON torneos FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_grupos"
  ON grupos FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_participantes"
  ON participantes FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_grupo_participantes"
  ON grupo_participantes FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "admin_all_partidos"
  ON partidos FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');


-- ── 5. Verifica que todo está correcto ───────────────────────────────────────
-- Esta query debe devolver 5 filas con rowsecurity = true
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('torneos','grupos','participantes','grupo_participantes','partidos');
