# Imagen de la aplicación (E07). Tres salidas:
#   --target app       → lo mínimo para servir el sitio (salida "standalone" de Next), sin código fuente ni herramientas.
#   --target migrador  → Prisma y las migraciones; corre una vez antes de la app y termina.
# Construir a mano:  docker build --target app -t capl .

FROM node:24-alpine AS dependencias
WORKDIR /app
# `postinstall` ejecuta `prisma generate`, que necesita el esquema.
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

FROM dependencias AS construccion
COPY . .
# Las páginas estáticas se generan aquí: la medición de uso se decide al construir (--build-arg MEDICION=si).
ARG MEDICION=no
# Id del despliegue (SHA del commit) para que Next recargue las pestañas de una versión anterior. Vacío = sin protección.
ARG NEXT_DEPLOYMENT_ID=
ENV NEXT_OUTPUT=standalone NEXT_TELEMETRY_DISABLED=1 MEDICION=$MEDICION NEXT_DEPLOYMENT_ID=$NEXT_DEPLOYMENT_ID
RUN npm run build

# Aplica las migraciones con el usuario capl_migrador (DATABASE_URL_MIGRADOR) y termina.
FROM dependencias AS migrador
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:24-alpine AS app
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 RUTA_ARCHIVOS=/archivos
# El volumen de fotos e imágenes hereda este dueño la primera vez que se crea.
RUN mkdir -p /archivos && chown node:node /archivos
COPY --from=construccion --chown=node:node /app/.next/standalone ./
COPY --from=construccion --chown=node:node /app/.next/static ./.next/static
COPY --from=construccion --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/salud >/dev/null || exit 1
CMD ["node", "server.js"]
