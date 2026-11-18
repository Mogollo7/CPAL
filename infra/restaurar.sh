#!/bin/sh
# Restaurar una copia (E07, T-506). Uso: restaurar.sh <archivo.dump | archivo.dump.gpg> [archivos.tar.gz]
# Pensado para el ENTORNO DE PRUEBAS o para un servidor nuevo. Reemplaza el contenido de la base indicada en PG*.
# Pide escribir el nombre de la base para confirmar; NO sirve para automatizar.
# Variables: PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE (dueño del esquema: capl_migrador), RESPALDO_CLAVE_ARCHIVO
#            RUTA_ARCHIVOS (si se pasa el segundo archivo)
set -eu
umask 077

copia="${1:?uso: restaurar.sh <copia.dump|copia.dump.gpg> [archivos.tar.gz]}"
extra="${2:-}"
: "${PGDATABASE:?falta PGDATABASE}"

printf 'Se REEMPLAZARÁ la base "%s" en "%s". Escribe el nombre de la base para continuar: ' "$PGDATABASE" "${PGHOST:-local}"
read -r confirmacion
[ "$confirmacion" = "$PGDATABASE" ] || { echo "cancelado"; exit 1; }

trabajo="$(mktemp -d)"
trap 'rm -rf "$trabajo"' EXIT

case "$copia" in
  *.gpg)
    : "${RESPALDO_CLAVE_ARCHIVO:?falta la frase de cifrado}"
    gpg --batch --yes --pinentry-mode loopback --passphrase-file "$RESPALDO_CLAVE_ARCHIVO" \
      --decrypt --output "$trabajo/bd.dump" "$copia"
    ;;
  *) cp "$copia" "$trabajo/bd.dump" ;;
esac

# --clean --if-exists: borra y recrea los objetos de la copia; --no-owner: quedan a nombre del usuario que restaura.
pg_restore --clean --if-exists --no-owner --dbname="$PGDATABASE" "$trabajo/bd.dump"

if [ -n "$extra" ]; then
  : "${RUTA_ARCHIVOS:?falta RUTA_ARCHIVOS}"
  mkdir -p "$RUTA_ARCHIVOS"
  tar -xzf "$extra" -C "$RUTA_ARCHIVOS"
fi
echo "restauración terminada: comprueba /api/salud y abre el panel"
