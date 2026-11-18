// Acceso de emergencia (T-219): npm run admin:crear -- --correo persona@dominio --nombre "Nombre"
// Se ejecuta SOLO en la consola del servidor, con el .env de ese servidor. Crea (o reactiva) un administrador,
// le envía su enlace para crear la contraseña, deja la auditoría y avisa a los demás administradores.
import { parseArgs } from "node:util";

try {
  process.loadEnvFile();
} catch {}
// Import dinámico: la conexión a la BD se crea al importar y necesita DATABASE_URL ya cargada.
const { crearAdminEmergencia } =
  await import("../servidor/cuentas/adminEmergencia");

const { values } = parseArgs({
  options: { correo: { type: "string" }, nombre: { type: "string" } },
});

crearAdminEmergencia({ correo: values.correo, nombre: values.nombre })
  .then((r) => {
    if (!r.ok) {
      console.error(`No se creó el administrador: ${r.mensaje}`);
      process.exitCode = 1;
    } else {
      console.log(
        `Listo. Se envió el enlace de contraseña a ${values.correo} (sale con la cola de correos, cada minuto).`,
      );
    }
  })
  .finally(() => process.exit());
