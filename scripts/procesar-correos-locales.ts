import { bd } from "../servidor/bd";
import { EJECUTORES, procesarCola } from "../servidor/cola";

async function main() {
  if (
    process.env.ENTORNO !== "local" ||
    process.env.CORREO_MODO !== "consola" ||
    !process.env.CORREO_BUZON_LOCAL
  ) {
    console.error(
      "Configura ENTORNO=local, CORREO_MODO=consola y CORREO_BUZON_LOCAL para procesar el buzón local.",
    );
    process.exitCode = 1;
    return;
  }
  const resumen = await procesarCola({
    ejecutores: { CORREO: EJECUTORES.CORREO },
  });
  console.log(resumen);
}

void main()
  .catch(() => {
    console.error("No fue posible procesar los correos locales.");
    process.exitCode = 1;
  })
  .finally(() => bd.$disconnect());
