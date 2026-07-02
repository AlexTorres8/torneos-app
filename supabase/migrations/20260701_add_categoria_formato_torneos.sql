-- #1 categoria (padel: oro|plata|global) y #2 formato (futsal: liga|24h)
-- Aplicada en el proyecto ActivaFitness el 2026-07-01.

ALTER TABLE torneos ADD COLUMN IF NOT EXISTS categoria varchar;
ALTER TABLE torneos ADD COLUMN IF NOT EXISTS formato   varchar NOT NULL DEFAULT 'liga';

ALTER TABLE torneos DROP CONSTRAINT IF EXISTS torneos_categoria_check;
ALTER TABLE torneos ADD  CONSTRAINT torneos_categoria_check
  CHECK (categoria IS NULL OR categoria IN ('oro','plata','global'));

ALTER TABLE torneos DROP CONSTRAINT IF EXISTS torneos_formato_check;
ALTER TABLE torneos ADD  CONSTRAINT torneos_formato_check
  CHECK (formato IN ('liga','24h'));

-- Backfill de datos existentes
UPDATE torneos SET formato = '24h' WHERE lower(nombre) LIKE '%24%';
UPDATE torneos SET categoria = 'oro'    WHERE deporte = 'padel' AND lower(nombre) LIKE '%oro%';
UPDATE torneos SET categoria = 'plata'  WHERE deporte = 'padel' AND lower(nombre) LIKE '%plata%';
UPDATE torneos SET categoria = 'global' WHERE deporte = 'padel' AND categoria IS NULL;
