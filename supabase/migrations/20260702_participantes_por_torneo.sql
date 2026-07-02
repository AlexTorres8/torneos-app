-- #4 Identidad de participante por torneo.
-- Antes: participantes.nombre era UNIQUE global, de modo que un mismo equipo
-- compartía fila (y estadísticas) entre torneos distintos. Esta migración divide
-- cada participante compartido en una fila por torneo y re-enlaza las referencias.
-- Aplicada en el proyecto ActivaFitness el 2026-07-02 (con backup previo en el schema `backup`).

-- Mapa: una fila por (torneo, nombre) realmente referenciado, con nuevo id
DROP TABLE IF EXISTS _part_map_tmp;
CREATE TABLE _part_map_tmp AS
SELECT torneo_id, old_id, nombre, gen_random_uuid() AS new_id
FROM (
  SELECT DISTINCT t.torneo_id, p.id AS old_id, p.nombre
  FROM participantes p
  JOIN (
    SELECT gp.participante_id AS pid, g.torneo_id
    FROM grupo_participantes gp JOIN grupos g ON g.id = gp.grupo_id
    UNION
    SELECT pa.local_id,     pa.torneo_id FROM partidos pa WHERE pa.local_id     IS NOT NULL
    UNION
    SELECT pa.visitante_id, pa.torneo_id FROM partidos pa WHERE pa.visitante_id IS NOT NULL
  ) t ON t.pid = p.id
  WHERE t.torneo_id IS NOT NULL
) d;

-- Quitar unique global de nombre → permite mismo nombre en distintos torneos
ALTER TABLE participantes DROP CONSTRAINT IF EXISTS participantes_nombre_key;

-- Crear participantes con alcance de torneo
INSERT INTO participantes (id, nombre, torneo_id)
SELECT new_id, nombre, torneo_id FROM _part_map_tmp;

-- Re-enlazar grupo_participantes (según torneo de su grupo)
UPDATE grupo_participantes gp
SET participante_id = pm.new_id
FROM grupos g, _part_map_tmp pm
WHERE g.id = gp.grupo_id
  AND pm.old_id = gp.participante_id
  AND pm.torneo_id = g.torneo_id;

-- Re-enlazar partidos (local y visitante, según torneo del partido)
UPDATE partidos pa
SET local_id = pm.new_id
FROM _part_map_tmp pm
WHERE pm.old_id = pa.local_id AND pm.torneo_id = pa.torneo_id;

UPDATE partidos pa
SET visitante_id = pm.new_id
FROM _part_map_tmp pm
WHERE pm.old_id = pa.visitante_id AND pm.torneo_id = pa.torneo_id;

-- Borrar participantes antiguos (globales/compartidos) y huérfanos ya sin referencias
DELETE FROM participantes WHERE id NOT IN (SELECT new_id FROM _part_map_tmp);

-- Integridad
ALTER TABLE participantes ALTER COLUMN torneo_id SET NOT NULL;
ALTER TABLE participantes DROP CONSTRAINT IF EXISTS participantes_torneo_nombre_key;
ALTER TABLE participantes ADD  CONSTRAINT participantes_torneo_nombre_key UNIQUE (torneo_id, nombre);

ALTER TABLE participantes DROP CONSTRAINT IF EXISTS participantes_torneo_id_fkey;
ALTER TABLE participantes ADD  CONSTRAINT participantes_torneo_id_fkey
  FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE;

DROP TABLE _part_map_tmp;
