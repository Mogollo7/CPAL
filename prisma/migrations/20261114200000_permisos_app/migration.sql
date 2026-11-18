-- T-016 (S03): la aplicación se conecta como `capl_app`, que solo lee y escribe datos.
-- Un reset recrea el esquema y pierde este permiso, por eso va en una migración y no solo en infra/bd/init.sql.
-- Protegido con IF EXISTS: en CI o bases sin el rol no hace nada. Los permisos sobre tablas los dan los
-- ALTER DEFAULT PRIVILEGES de infra/bd/init.sql (siguen valiendo tras un reset).
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'capl_app') THEN
    GRANT USAGE ON SCHEMA public TO capl_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO capl_app;
  END IF;
END $$;
