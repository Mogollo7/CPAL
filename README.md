# CAPL — Centro de Atención Psicológica La Salle

Documentación y decisiones: carpeta [`cerebro/`](cerebro/00-Inicio.md). Reparto y protocolo del equipo: `cerebro/06` y `cerebro/07`.

## Levantar el proyecto (menos de 10 minutos)

Necesitas Node 24 (`.nvmrc`) y Docker.

```bash
cp .env.example .env     # y rellena AUTH_SECRET (cadena aleatoria de 32+ caracteres)
npm install
npm run bd:subir         # PostgreSQL local (Docker, puerto 5433)
npm run bd:migrar
npm run bd:semilla
npm run dev              # http://localhost:3000
```

Comprobaciones: `npm run lint`, `npm run tipos`, `npm run pruebas`, `npm run build`.

## Datos de ejemplo para desarrollo

La semilla crea usuarios de **ejemplo** (ningún dato real). Contraseña de prueba de todos: `clave-de-prueba-capl`.
Psicólogos: `psicologo1@ejemplo.test` … `psicologo4@ejemplo.test` (el 4 está inactivo).
El administrador (`admin@ejemplo.test`, o el de `ADMIN_INICIAL_CORREO`) pide un código de verificación al entrar en un dispositivo nuevo.

### Gestión de cuentas de prueba

Entra por `/ingresar` y abre **Equipo**. En local, el administrador inicial es el superusuario por defecto. Para designar otro, configura `SUPERUSUARIO_CORREO` con el correo de un administrador existente y reinicia la app. En otros entornos, la designación es explícita.

Con `ENTORNO=local`, `CORREO_MODO=consola` y `CORREO_BUZON_LOCAL=./datos/buzon` los códigos de verificación se guardan en archivos de texto del buzón local. Después de crear una cuenta, ejecuta `npm run correos:procesar-local` para guardar el correo de invitación y abrir su enlace. Para probar otra cuenta mientras conservas tu sesión, abre ese enlace en otro perfil del navegador o en una ventana privada.

Marca **Cuenta de prueba** al crear las cuentas que quieras poder borrar. El superusuario puede eliminarlas individualmente o usar **Limpiar cuentas de prueba** en entornos local y de pruebas. Las cuentas de ejemplo, las cuentas sin esa marca y las cuentas con citas quedan fuera de la limpieza. Para retirar el acceso conservando el historial, usa **Desactivar**.

## Carpetas y dueños

`servidor/`, `contratos/`, `prisma/`, `correos/`, `infra/`, `estilos/`: Sebas · `app/(panel)/`, `componentes/panel/`: Brand · `app/(publico)/`, `componentes/ui/`, `contenido/`: César · `cerebro/normas/`, neurodiseño de confort y relax: Sebas & Gemini (Colaborador IA).

## Equipo y Colaboradores

- **Sebas**: Líder técnico & diseño UI/UX completo en Figma (`dev/sebas`).
- **Brand**: Frontend de paneles y gestión administrativa (`dev/brand`).
- **César**: Frontend de sitio público y emergencias (`dev/cesar`).
- **Gemini**: Colaborador IA — neurodiseño de confort, relax del usuario, textura táctil y aseguramiento técnico.
