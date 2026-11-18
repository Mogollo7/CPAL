#!/bin/sh
# Copia de seguridad (E07, T-506). Uso: respaldo.sh [diario|despliegue]   (por defecto: diario)
#   diario     : BD + archivos subidos, retención 14 días, copia cifrada a destino externo (retención 30 días)
#   despliegue : copia extra antes de desplegar a producción, se conservan las 5 últimas
# Variables (de /etc/capl/respaldo.env; nunca en git; ver infra/README.md):
#   PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE   usuario con lectura total (capl_migrador)
#   DIR_RESPALDOS          carpeta local de copias (volumen `respaldos`)           [/srv/capl/respaldos]
#   RUTA_ARCHIVOS          fotos e imágenes subidas                                [/srv/capl/archivos]
#   RESPALDO_CLAVE_ARCHIVO archivo con la frase de cifrado (guardado FUERA de las copias, S08)
#   RESPALDO_DESTINO_EXTERNO  usuario@servidor:/ruta  (rsync sobre SSH con llave)  [SUPUESTO(P-21)]
# Sin entradas de usuarios: solo variables del servidor. No se ejecuta nada con datos de peticiones.
set -eu
umask 077

modo="${1:-diario}"
dir="${DIR_RESPALDOS:-/srv/capl/respaldos}"
archivos="${RUTA_ARCHIVOS:-/srv/capl/archivos}"
sello="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$dir/local" "$dir/externo"

case "$modo" in diario | despliegue) ;; *) echo "modo desconocido: $modo" >&2; exit 2 ;; esac
: "${PGDATABASE:?falta PGDATABASE}"

# 1) Base de datos, formato personalizado (comprimido). Se escribe a .parcial y se renombra al terminar.
pg_dump --format=custom --no-owner --file="$dir/local/bd-$modo-$sello.dump.parcial"
mv "$dir/local/bd-$modo-$sello.dump.parcial" "$dir/local/bd-$modo-$sello.dump"

# 2) Archivos subidos
if [ -d "$archivos" ]; then
  tar -czf "$dir/local/archivos-$modo-$sello.tar.gz" -C "$archivos" .
fi

# 3) Retención local
if [ "$modo" = "diario" ]; then
  find "$dir/local" -type f \( -name 'bd-diario-*' -o -name 'archivos-diario-*' \) -mtime +14 -delete
else
  for prefijo in bd-despliegue archivos-despliegue; do
    ls -1t "$dir/local/$prefijo"-* 2>/dev/null | tail -n +6 | while read -r f; do rm -f -- "$f"; done
  done
fi

# 4) Copia externa cifrada (solo la diaria). Sin destino configurado el script FALLA: sin copia externa no se lanza.
if [ "$modo" = "diario" ]; then
  : "${RESPALDO_CLAVE_ARCHIVO:?falta la frase de cifrado}"
  : "${RESPALDO_DESTINO_EXTERNO:?falta el destino externo (P-21)}"
  for f in "$dir/local/bd-diario-$sello.dump" "$dir/local/archivos-diario-$sello.tar.gz"; do
    [ -f "$f" ] || continue
    gpg --batch --yes --pinentry-mode loopback --passphrase-file "$RESPALDO_CLAVE_ARCHIVO" \
      --symmetric --cipher-algo AES256 --output "$dir/externo/$(basename "$f").gpg" "$f"
  done
  find "$dir/externo" -type f -name '*.gpg' -mtime +30 -delete
  rsync -a --delete -e "ssh -o BatchMode=yes" "$dir/externo/" "$RESPALDO_DESTINO_EXTERNO/"
fi

echo "respaldo $modo $sello: ok"
