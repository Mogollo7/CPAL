// Datos de EJEMPLO (E02 «Semilla»). Ningún dato real. En producción solo se crean configuración, servicios y admin inicial.
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../servidor/generado/client";

const bd = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const produccion = process.env.ENTORNO === "produccion";

const h = (dias: number, hora: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  d.setUTCHours(hora + 5, 0, 0, 0); // hora de Bogotá → UTC
  return d;
};

async function main() {
  await bd.configuracion.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      correoAdministracion:
        process.env.ADMIN_INICIAL_CORREO || "admin@ejemplo.test",
      dominiosPermitidos: [],
    },
  });

  const servicios = await Promise.all(
    [
      ["psicologia-individual", "Psicología individual", "PSICOLOGIA", true],
      ["orientacion-vocacional", "Orientación vocacional", "PSICOLOGIA", true],
      [
        "psicologia-adolescentes",
        "Psicología para adolescentes",
        "PSICOLOGIA",
        true,
      ],
      [
        "valoracion-neuropsicologica",
        "Valoración neuropsicológica",
        "NEUROPSICOLOGIA",
        false,
      ],
      [
        "certificacion-apoyo-emocional",
        "Certificación de mascotas de apoyo emocional",
        "PSICOLOGIA",
        false,
      ],
      ["taller-grupal", "Taller grupal", "PSICOLOGIA", false],
    ].map(([slug, nombre, area, enLinea], orden) =>
      bd.servicio.upsert({
        where: { slug: slug as string },
        update: {},
        create: {
          slug: slug as string,
          nombre: nombre as string,
          descripcion: `${nombre} (ejemplo)`,
          area: area as "PSICOLOGIA",
          agendableEnLinea: enLinea as boolean,
          orden,
        },
      }),
    ),
  );

  await bd.usuario.upsert({
    where: {
      correo: (
        process.env.ADMIN_INICIAL_CORREO || "admin@ejemplo.test"
      ).toLowerCase(),
    },
    update: {},
    create: {
      correo: (
        process.env.ADMIN_INICIAL_CORREO || "admin@ejemplo.test"
      ).toLowerCase(),
      nombre: "Administración (ejemplo)",
      rol: "ADMIN",
    },
  });
  if (produccion) return;

  // 4 psicólogos: 3 de psicología, 1 de neuropsicología; uno sin horario, uno inactivo.
  const psis: { id: string }[] = [];
  for (const [i, [nombre, area, activo]] of (
    [
      ["Psicóloga Uno", "PSICOLOGIA", true],
      ["Psicólogo Dos", "PSICOLOGIA", true],
      ["Psicóloga Tres (sin horario)", "PSICOLOGIA", true],
      ["Neuropsicólogo Cuatro (inactivo)", "NEUROPSICOLOGIA", false],
    ] as const
  ).entries()) {
    psis.push(
      await bd.usuario.upsert({
        where: { correo: `psicologo${i + 1}@ejemplo.test` },
        update: {},
        create: {
          correo: `psicologo${i + 1}@ejemplo.test`,
          nombre,
          rol: "PSICOLOGO",
          activo,
          perfil: {
            create: {
              area,
              visible: activo,
              servicios: {
                connect: servicios.slice(0, 3).map((s) => ({ id: s.id })),
              },
            },
          },
        },
      }),
    );
  }
  if ((await bd.disponibilidad.count()) === 0) {
    // Psicóloga Uno: lun, mar, vie 8–12; Psicólogo Dos: mié, jue 14–18.
    await bd.disponibilidad.createMany({
      data: [
        ...[1, 2, 5].map((d) => ({
          psicologoId: psis[0].id,
          diaSemana: d,
          inicioMin: 480,
          finMin: 720,
        })),
        ...[3, 4].map((d) => ({
          psicologoId: psis[1].id,
          diaSemana: d,
          inicioMin: 840,
          finMin: 1080,
        })),
      ],
    });
  }
  if ((await bd.bloqueo.count()) === 0) {
    await bd.bloqueo.createMany({
      data: [
        {
          psicologoId: psis[0].id,
          desde: h(10, 0),
          hasta: h(12, 0),
          motivo: "Vacaciones (ejemplo)",
          creadoPorId: psis[0].id,
        },
        {
          desde: h(20, 0),
          hasta: h(21, 0),
          motivo: "Cierre del centro (ejemplo)",
          creadoPorId: psis[0].id,
        },
      ],
    });
  }
  if ((await bd.cita.count()) === 0) {
    const estados = [
      "PENDIENTE",
      "AUTORIZADA",
      "RECHAZADA",
      "VENCIDA",
      "CANCELADA",
      "ATENDIDA",
      "NO_ASISTIO",
    ] as const;
    for (const [i, estado] of estados.entries()) {
      await bd.cita.create({
        data: {
          codigo: `CAPL-EJ0${i}`,
          servicioId: servicios[0].id,
          psicologoId: psis[i % 2].id,
          inicio: h(i + 1, 8 + (i % 3)),
          fin: h(i + 1, 9 + (i % 3)),
          estado,
          paraQuien: "PROPIA",
          solicitanteNombre: `Persona de ejemplo ${i}`,
          solicitanteCorreo: `persona${i}@ejemplo.test`,
          consentimientoEn: new Date(),
          consentimientoVersion: "1",
        },
      });
    }
  }
  if ((await bd.evento.count()) === 0) {
    await bd.evento.createMany({
      data: [
        {
          slug: "taller-estres",
          titulo: "Taller de manejo del estrés (ejemplo)",
          descripcion: "Ejemplo",
          inicio: h(15, 15),
          lugar: "Casa amarilla",
          cupo: 20,
          publicado: true,
        },
        {
          slug: "charla-abierta",
          titulo: "Charla abierta (ejemplo)",
          descripcion: "Ejemplo",
          inicio: h(25, 10),
          lugar: "Virtual",
          enlace: "https://ejemplo.test",
          publicado: true,
        },
        {
          slug: "evento-pasado",
          titulo: "Evento pasado (ejemplo)",
          descripcion: "Ejemplo",
          inicio: h(-10, 10),
          lugar: "Casa amarilla",
          publicado: true,
        },
      ],
    });
  }
}

main().finally(() => bd.$disconnect());
