#!/bin/sh
# Vigía de despliegue continuo (estilo Netlify) para una máquina SIN puertos abiertos (detrás del túnel de Cloudflare).
#
# Flujo: push/merge a `main` → CI pasa → `desplegar.yml` publica ghcr.io/mogollo7/cpal:pruebas (+ -migrador)
#        → este vigía nota la imagen nueva (consulta cada INTERVALO s) → migra → cambia la app → comprueba /api/salud.
# Si la migración falla, la app vieja sigue sirviendo. Si la app nueva no responde, vuelve a la anterior.
# Una imagen que falló no se reintenta en bucle: espera a la siguiente versión de `main`.
#
# Corre en un contenedor con el socket de Docker (ver infra/README.md, «Despliegue continuo en la máquina de pruebas»).
set -u

IMAGEN="${IMAGEN:-ghcr.io/mogollo7/cpal}"
ETIQUETA="${ETIQUETA:-pruebas}"
ENV_FILE="${ENV_FILE:?Falta ENV_FILE (ruta del .env dentro del contenedor del vigía)}"
APP="${APP:-capl-app}"
PUERTO="${PUERTO:-3000}"
VOLUMEN_ARCHIVOS="${VOLUMEN_ARCHIVOS:-capl_archivos}"
INTERVALO="${INTERVALO:-60}"
fallida=""

log() { echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $*"; }

sana() {
  for _ in $(seq 1 30); do
    wget -qO- "http://127.0.0.1:${PUERTO}/api/salud" 2>/dev/null | grep -q '"estado":"ok"' && return 0
    sleep 3
  done
  return 1
}

arrancar_app() { # $1 = id de imagen
  docker run -d --name "$APP" --restart unless-stopped --network host \
    --env-file "$ENV_FILE" -e PORT="$PUERTO" -e HOSTNAME=0.0.0.0 \
    -v "${VOLUMEN_ARCHIVOS}:/archivos" "$1" >/dev/null
}

desplegar() { # $1 = id de la imagen nueva
  nueva="$1"
  corto=$(echo "$nueva" | cut -c8-19)
  log "Nueva versión detectada ($corto). Migrando…"

  if ! docker pull -q "${IMAGEN}:${ETIQUETA}-migrador" >/dev/null 2>&1 ||
    ! docker run --rm --network host --env-file "$ENV_FILE" "${IMAGEN}:${ETIQUETA}-migrador"; then
    log "ERROR: la migración falló; la versión actual sigue sirviendo."
    fallida="$nueva"
    return 1
  fi

  docker rm -f "${APP}-anterior" >/dev/null 2>&1
  if docker inspect "$APP" >/dev/null 2>&1; then
    docker rename "$APP" "${APP}-anterior"
    docker stop -t 20 "${APP}-anterior" >/dev/null
  fi

  if arrancar_app "$nueva" && sana; then
    docker rm "${APP}-anterior" >/dev/null 2>&1
    log "Desplegado $corto: /api/salud responde ok."
    fallida=""
    return 0
  fi

  log "ERROR: la versión $corto no respondió en /api/salud. Volviendo a la anterior."
  docker logs --tail 30 "$APP" 2>&1 | sed 's/^/  | /'
  docker rm -f "$APP" >/dev/null 2>&1
  if docker inspect "${APP}-anterior" >/dev/null 2>&1; then
    docker rename "${APP}-anterior" "$APP"
    docker start "$APP" >/dev/null
  fi
  fallida="$nueva"
  return 1
}

log "Vigía activo: ${IMAGEN}:${ETIQUETA} cada ${INTERVALO}s → ${APP} (puerto ${PUERTO})."
while true; do
  if docker pull -q "${IMAGEN}:${ETIQUETA}" >/dev/null 2>&1; then
    nueva=$(docker image inspect -f '{{.Id}}' "${IMAGEN}:${ETIQUETA}")
    actual=$(docker inspect -f '{{.Image}}' "$APP" 2>/dev/null || echo ninguna)
    if [ "$nueva" != "$actual" ] && [ "$nueva" != "$fallida" ]; then
      desplegar "$nueva"
      docker image prune -f >/dev/null 2>&1 # imágenes viejas sin etiqueta
    fi
  else
    log "Aviso: no se pudo consultar ${IMAGEN}:${ETIQUETA} (¿sin red?)."
  fi
  sleep "$INTERVALO"
done
