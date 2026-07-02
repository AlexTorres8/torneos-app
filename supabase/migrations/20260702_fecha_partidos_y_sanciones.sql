-- Fecha (día/mes) de cada partido + registro de sanciones (tarjetas/expulsiones).
-- Aplicada en el proyecto ActivaFitness el 2026-07-02.

ALTER TABLE partidos ADD COLUMN IF NOT EXISTS fecha date;

CREATE TABLE IF NOT EXISTS sanciones (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  torneo_id        uuid NOT NULL REFERENCES torneos(id)       ON DELETE CASCADE,
  participante_id  uuid          REFERENCES participantes(id) ON DELETE SET NULL,
  jugador          varchar NOT NULL,
  tipo             varchar NOT NULL DEFAULT 'roja' CHECK (tipo IN ('amarilla','roja')),
  partidos_sancion integer NOT NULL DEFAULT 0 CHECK (partidos_sancion >= 0),
  motivo           varchar,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE sanciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_sanciones" ON sanciones;
CREATE POLICY "public_read_sanciones" ON sanciones FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_sanciones" ON sanciones;
CREATE POLICY "admin_all_sanciones" ON sanciones FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
