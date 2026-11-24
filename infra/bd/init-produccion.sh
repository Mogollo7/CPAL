#!/bin/sh
set -eu
: "${CAPL_APP_PASSWORD:?Configura la clave de capl_app}"
: "${CAPL_MIGRADOR_PASSWORD:?Configura la clave de capl_migrador}"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
\getenv app_clave CAPL_APP_PASSWORD
\getenv migrador_clave CAPL_MIGRADOR_PASSWORD
BEGIN;
CREATE ROLE capl_app LOGIN PASSWORD :'app_clave' CONNECTION LIMIT 10;
CREATE ROLE capl_migrador LOGIN PASSWORD :'migrador_clave';
\i /opt/capl/permisos.sql
COMMIT;
SQL
