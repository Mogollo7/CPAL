// Carga de psicólogos reales desde un CSV (T-603). Uso:
//   tsx scripts/cargar-psicologos.ts <archivo.csv> [--simular]
// Columnas: correo,nombre,area,horario   — horario: "lun 08:00-12:00; mar 14:00-18:00"
// Idempotente: un correo que ya existe se omite (no se toca su horario). Crea cuentas SIN contraseña; la invitación se envía desde el panel.
import { readFileSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
import { horarioSchema } from "../contratos/horario";
import { crearPsicologoSchema } from "../contratos/psicologo";
import { PrismaClient } from "../servidor/generado/client";

const DIAS: Record<string, number> = {
  lun: 1,
  mar: 2,
  mie: 3,
  mié: 3,
  jue: 4,
  vie: 5,
  sab: 6,
  sáb: 6,
  dom: 7,
};
const CABECERA = ["correo", "nombre", "area", "horario"];

export type FilaPsicologo = z.infer<typeof crearPsicologoSchema> & {
  bloques: z.infer<typeof horarioSchema>["bloques"];
};
export type ErrorFila = { linea: number; mensaje: string };

// Parte una línea CSV con comillas dobles opcionales.
function partir(linea: string) {
  const campos: string[] = [];
  let actual = "";
  let entre = false;
  for (const c of linea) {
    if (c === '"') entre = !entre;
    else if (c === "," && !entre) {
      campos.push(actual);
      actual = "";
    } else actual += c;
  }
  return [...campos, actual].map((c) => c.trim());
}

const aMin = (h: string) => {
  const m = /^(\d{1,2}):([0-5]\d)$/.exec(h);
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

function leerHorario(texto: string) {
  const bloques = texto
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const m = /^(\S+)\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/.exec(t);
      return {
        diaSemana: DIAS[m?.[1].toLowerCase() ?? ""],
        inicioMin: aMin(m?.[2] ?? ""),
        finMin: aMin(m?.[3] ?? ""),
      };
    });
  return horarioSchema.safeParse({ bloques });
}

// Pura: no toca archivos ni BD. `dominios` vacío = no se comprueba el dominio.
export function validarCsv(texto: string, dominios: string[] = []) {
  const lineas = texto.replace(/^﻿/, "").split(/\r?\n/);
  const filas: FilaPsicologo[] = [];
  const errores: ErrorFila[] = [];
  if (
    partir(lineas[0] ?? "")
      .map((c) => c.toLowerCase())
      .join() !== CABECERA.join()
  )
    return {
      filas,
      errores: [
        { linea: 1, mensaje: `La cabecera debe ser: ${CABECERA.join(",")}` },
      ],
    };
  const vistos = new Set<string>();
  lineas.slice(1).forEach((l, i) => {
    const linea = i + 2;
    if (!l.trim()) return;
    const err = (mensaje: string) => errores.push({ linea, mensaje });
    const c = partir(l);
    if (c.length !== 4) return err(`Se esperaban 4 columnas y hay ${c.length}`);
    const p = crearPsicologoSchema.safeParse({
      correo: c[0],
      nombre: c[1],
      area: c[2].toUpperCase(),
    });
    if (!p.success)
      return err(
        p.error.issues
          .map((x) => `${x.path.join(".")}: ${x.message}`)
          .join("; "),
      );
    const h = leerHorario(c[3]);
    if (!h.success) return err(`horario: ${h.error.issues[0].message}`);
    if (!h.data.bloques.length) return err("horario: vacío");
    if (dominios.length && !dominios.includes(p.data.correo.split("@")[1]))
      return err(`correo: dominio no permitido (${dominios.join(", ")})`);
    if (vistos.has(p.data.correo)) return err("correo repetido en el archivo");
    vistos.add(p.data.correo);
    filas.push({ ...p.data, bloques: h.data.bloques });
  });
  return { filas, errores };
}

export type BdCarga = Pick<
  PrismaClient,
  "usuario" | "servicio" | "configuracion"
>;

// Con `simular` solo lee: no escribe nada.
export async function cargar(
  bd: BdCarga,
  filas: FilaPsicologo[],
  simular: boolean,
) {
  const nuevos: string[] = [];
  const existentes: string[] = [];
  const servicios = await bd.servicio.findMany({
    where: { activo: true, agendableEnLinea: true },
  });
  for (const f of filas) {
    if (await bd.usuario.findUnique({ where: { correo: f.correo } })) {
      existentes.push(f.correo);
      continue;
    }
    nuevos.push(f.correo);
    if (simular) continue;
    await bd.usuario.create({
      data: {
        correo: f.correo,
        nombre: f.nombre,
        rol: "PSICOLOGO",
        // SUPUESTO(P-11): atiende los servicios en línea de su área. visible=false: el psicólogo revisa su perfil y se publica él.
        perfil: {
          create: {
            area: f.area,
            servicios: {
              connect: servicios
                .filter((s) => s.area === f.area)
                .map((s) => ({ id: s.id })),
            },
          },
        },
        disponibilidades: { create: f.bloques },
      },
    });
  }
  return { nuevos, existentes };
}

async function main() {
  const [archivo, ...banderas] = process.argv.slice(2);
  if (!archivo)
    throw new Error(
      "Uso: tsx scripts/cargar-psicologos.ts <archivo.csv> [--simular]",
    );
  const simular = banderas.includes("--simular");
  if (!process.env.DATABASE_URL) throw new Error("Falta DATABASE_URL");
  const bd = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const conf = await bd.configuracion.findUnique({ where: { id: 1 } });
    if (!conf)
      throw new Error(
        "No hay configuración: ejecuta primero la semilla de producción",
      );
    if (!conf.dominiosPermitidos.length && process.env.ENTORNO === "produccion")
      throw new Error(
        "dominiosPermitidos está vacío: en producción no se carga nadie sin lista de dominios (E03 §7)",
      );
    const { filas, errores } = validarCsv(
      readFileSync(archivo, "utf8"),
      conf.dominiosPermitidos,
    );
    for (const e of errores) console.error(`Línea ${e.linea}: ${e.mensaje}`);
    if (errores.length)
      throw new Error(`${errores.length} error(es): no se cargó nada`);
    const r = await cargar(bd, filas, simular);
    console.log(
      `${simular ? "[SIMULACIÓN, no se escribió nada] " : ""}Nuevos: ${r.nuevos.length}; ya existían: ${r.existentes.length}`,
    );
  } finally {
    await bd.$disconnect();
  }
}

if (process.argv[1]?.endsWith("cargar-psicologos.ts")) {
  try {
    process.loadEnvFile();
  } catch {}
  main().catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
