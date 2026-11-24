// Ayuda SOLO para pruebas: crea un servicio y psicólogos de prueba con horario todos los días (8:00–12:00 en Bogotá)
// y lo borra al final. Cada escenario lleva una etiqueta única, así las pruebas no se pisan entre sí ni con la semilla.
import { randomBytes } from "node:crypto";

try {
  process.loadEnvFile();
} catch {}
process.env.AUTH_SECRET ||= "secreto-de-prueba-de-citas-para-tests";
process.env.CLAVE_CIFRADO ||= `1:${randomBytes(32).toString("base64")}`;

export async function crearEscenario(etiqueta: string, cuantosPsicologos = 1) {
  const { bd } = await import("../bd");
  const tag = `t3${etiqueta}${randomBytes(3).toString("hex")}`;
  const servicio = await bd.servicio.create({
    data: {
      slug: tag,
      nombre: `Servicio ${tag}`,
      descripcion: "prueba",
      area: "PSICOLOGIA",
      duracionMin: 60,
    },
  });
  const psicologos: Awaited<ReturnType<typeof bd.usuario.create>>[] = [];
  for (let i = 0; i < cuantosPsicologos; i++)
    psicologos.push(
      await bd.usuario.create({
        data: {
          correo: `${tag}-psi${i}@prueba.capl.test`,
          nombre: `Psicóloga ${tag} ${i}`,
          rol: "PSICOLOGO",
          perfil: {
            create: {
              area: "PSICOLOGIA",
              presentacion: "prueba",
              servicios: { connect: { id: servicio.id } },
            },
          },
          disponibilidades: {
            create: [1, 2, 3, 4, 5, 6, 7].map((diaSemana) => ({
              diaSemana,
              inicioMin: 480,
              finMin: 720,
            })),
          },
        },
      }),
    );

  /** Cupos libres reales (con el cálculo de producción) dentro de la ventana de reserva. */
  async function cupos(psicologoId?: string, ahora = new Date()) {
    const { cuposDeServicio } = await import("./datos");
    const r = await cuposDeServicio(
      servicio.id,
      new Date(ahora.getTime() + 2 * 86_400_000),
      new Date(ahora.getTime() + 9 * 86_400_000),
      ahora,
      { psicologoId },
    );
    return r!.cupos;
  }
  async function limpiar() {
    const ids = (
      await bd.cita.findMany({
        where: { servicioId: servicio.id },
        select: { id: true },
      })
    ).map((c) => c.id);
    await bd.trabajo.deleteMany({ where: { citaId: { in: ids } } });
    await bd.auditoria.deleteMany({
      where: { entidad: "Cita", entidadId: { in: ids } },
    });
    await bd.cita.deleteMany({ where: { servicioId: servicio.id } });
    await bd.bloqueo.deleteMany({
      where: { psicologoId: { in: psicologos.map((p) => p.id) } },
    });
    await bd.disponibilidad.deleteMany({
      where: { psicologoId: { in: psicologos.map((p) => p.id) } },
    });
    await bd.perfilPsicologo.deleteMany({
      where: { usuarioId: { in: psicologos.map((p) => p.id) } },
    });
    await bd.usuario.deleteMany({
      where: { id: { in: psicologos.map((p) => p.id) } },
    });
    await bd.servicio.delete({ where: { id: servicio.id } });
  }
  /** Solicitud válida de cita; `correo` distinto por persona para no chocar con el límite de citas activas. */
  const solicitud = (
    inicio: string,
    correo: string,
    extra: Record<string, unknown> = {},
  ) => ({
    servicioId: servicio.id,
    inicio,
    paraQuien: "PROPIA",
    solicitanteNombre: "Ana Prueba",
    solicitanteCorreo: correo,
    solicitanteTelefono: "+57 300 1234567",
    pacienteDocumento: `D${randomBytes(4).toString("hex")}`,
    aceptaTratamiento: true,
    sitioWeb: "",
    ...extra,
  });
  return {
    bd,
    servicio,
    psicologos,
    cupos,
    limpiar,
    solicitud,
    tag,
    correo: (n: string) => `${n}.${tag}@prueba.capl.test`,
  };
}
