#!/bin/sh
# Llama a la tarea programada (S05): POST /api/tareas con CRON_SECRET. Lo ejecuta un temporizador cada minuto.
# SUPUESTO: el secreto viaja como `Authorization: Bearer`; si el endpoint usa otra cabecera, cambiar solo esta línea.
# El secreto se pasa por un archivo de cabeceras temporal para que no aparezca en la lista de procesos.
set -eu
umask 077
: "${CRON_SECRET:?falta CRON_SECRET}"
cabeceras="$(mktemp)"
trap 'rm -f "$cabeceras"' EXIT
printf 'Authorization: Bearer %s\n' "$CRON_SECRET" > "$cabeceras"
curl --silent --show-error --fail --max-time 55 -X POST -H "@$cabeceras" \
  "${APP_URL_INTERNA:-http://127.0.0.1:3000}/api/tareas"
