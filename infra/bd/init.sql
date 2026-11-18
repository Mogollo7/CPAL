-- Roles de base de datos (S03). Se ejecuta SOLO la primera vez que se crea el volumen de PostgreSQL local.
-- Las claves de abajo son de DESARROLLO LOCAL. En pruebas y producción las claves salen de secretos del servidor.
--   capl_migrador : dueño de la base y del esquema; lo usa únicamente `npm run bd:migrar` (crea y altera tablas).
--   capl_app      : lo usa la aplicación; solo lee y escribe datos, NO puede crear ni alterar tablas.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'capl_migrador') THEN
    CREATE ROLE capl_migrador LOGIN PASSWORD 'migrador_local' CREATEDB; -- CREATEDB: base sombra de `migrate dev`
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'capl_app') THEN
    CREATE ROLE capl_app LOGIN PASSWORD 'app_local' CONNECTION LIMIT 10; -- tope de 10 conexiones (S03)
  END IF;
END $$;

ALTER DATABASE capl OWNER TO capl_migrador;
ALTER SCHEMA public OWNER TO capl_migrador;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT CONNECT ON DATABASE capl TO capl_app;
GRANT USAGE ON SCHEMA public TO capl_app;

-- Lo que cree el migrador (hoy y en migraciones futuras) queda usable por la aplicación, solo para datos.
ALTER DEFAULT PRIVILEGES FOR ROLE capl_migrador GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO capl_app;
ALTER DEFAULT PRIVILEGES FOR ROLE capl_migrador GRANT USAGE, SELECT ON SEQUENCES TO capl_app;
