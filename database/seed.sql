-- =============================================================
-- AutoCheck APP - Seeds de datos de prueba
-- =============================================================
-- Ejecutar: psql -U <usuario> -d <base_de_datos> -f seed.sql
-- Nota: Las contraseñas estan hasheadas con bcrypt (AutoCheck123!)
-- =============================================================

-- Limpiar datos existentes
DELETE FROM documents;
DELETE FROM mantenimientos;
DELETE FROM vehiculos;
DELETE FROM usuarios;

-- Resetear secuencias
ALTER SEQUENCE usuarios_id_seq RESTART WITH 1;
ALTER SEQUENCE vehiculos_id_seq RESTART WITH 1;
ALTER SEQUENCE mantenimientos_id_seq RESTART WITH 1;
ALTER SEQUENCE documents_id_seq RESTART WITH 1;

-- ========================
-- USUARIOS
-- Contraseña: AutoCheck123!
-- ========================
INSERT INTO usuarios (nombre, email, password, membresia) VALUES
  ('Carlos Rodríguez', 'carlos@autocheck.com', '$2b$10$6KRmj2ZV1QTLpPmKoIHmNOdCl1IA/cJHMb9XbPOzO5oFxHKC7WBGG', false),
  ('María González',   'maria@autocheck.com',  '$2b$10$6KRmj2ZV1QTLpPmKoIHmNOdCl1IA/cJHMb9XbPOzO5oFxHKC7WBGG', false),
  ('Juan Pérez',       'juan@autocheck.com',   '$2b$10$6KRmj2ZV1QTLpPmKoIHmNOdCl1IA/cJHMb9XbPOzO5oFxHKC7WBGG', false);

-- ========================
-- VEHICULOS
-- ========================
INSERT INTO vehiculos (usuario_id, marca, modelo, anio, placa, combustible, kilometraje, unidad) VALUES
  (1, 'Toyota',  'Corolla',  2019, 'ABC-123', 'Gasolina', 85000,  'km'),
  (1, 'Honda',   'CR-V',     2021, 'DEF-456', 'Gasolina', 42000,  'km'),
  (2, 'Hyundai', 'Tucson',   2020, 'GHI-789', 'Diesel',   63000,  'km'),
  (3, 'Kia',     'Sportage', 2018, 'JKL-012', 'Gasolina', 110000, 'km');

-- ========================
-- MANTENIMIENTOS
-- ========================
INSERT INTO mantenimientos (vehiculo_id, tipo, fecha, kilometraje, costo, notas, taller) VALUES
  -- Toyota Corolla (vehiculo 1)
  (1, 'Cambio de aceite',       '2024-01-15', 75000, 45000,  'Aceite 5W-30 sintético, filtro nuevo',         'Taller Rodríguez'),
  (1, 'Revisión de frenos',     '2024-03-10', 78000, 85000,  'Se cambiaron pastillas delanteras',             'Taller Rodríguez'),
  (1, 'Cambio de llantas',      '2024-05-20', 82000, 180000, 'Llantas Bridgestone 195/65 R15',               'AutoServicio SA'),
  (1, 'Cambio de aceite',       '2024-09-05', 84500, 45000,  'Aceite 5W-30 sintético',                       'Taller Rodríguez'),
  -- Honda CR-V (vehiculo 2)
  (2, 'Cambio de aceite',       '2024-02-20', 38000, 50000,  'Aceite 0W-20 Honda original',                  'Agencia Honda'),
  (2, 'Revisión general',       '2024-06-15', 41000, 120000, 'Revisión de 40.000 km, todo en orden',         'Agencia Honda'),
  -- Hyundai Tucson (vehiculo 3)
  (3, 'Cambio de aceite',       '2024-01-08', 58000, 48000,  'Aceite Diesel 5W-40',                          'Taller Central'),
  (3, 'Cambio de filtro aire',  '2024-04-22', 61000, 25000,  'Filtro de aire y cabina reemplazados',         'Taller Central'),
  (3, 'Revisión de suspensión', '2024-07-30', 62500, 95000,  'Se ajustaron amortiguadores traseros',         'Mecánica Pérez'),
  -- Kia Sportage (vehiculo 4)
  (4, 'Cambio de aceite',       '2023-11-10', 100000, 42000, 'Aceite 5W-40 semisintético',                   'Taller Kia'),
  (4, 'Distribución',           '2024-02-28', 105000, 250000,'Cambio de banda de distribución y tensor',     'Taller Kia'),
  (4, 'Cambio de batería',      '2024-08-14', 109000, 75000, 'Batería Bosch 60Ah',                           'AutoRepuestos MX');

-- ========================
-- VERIFICACION
-- ========================
SELECT 'usuarios'      AS tabla, COUNT(*) AS registros FROM usuarios
UNION ALL
SELECT 'vehiculos'     AS tabla, COUNT(*) AS registros FROM vehiculos
UNION ALL
SELECT 'mantenimientos'AS tabla, COUNT(*) AS registros FROM mantenimientos;
