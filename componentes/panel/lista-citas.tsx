import Link from "next/link";
import type { PaginaCitas } from "@/contratos/cita";
import { Superficie } from "./controles";

const formato = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  dateStyle: "medium",
  timeStyle: "short",
});
const estados = {
  PENDIENTE: "Pendiente",
  AUTORIZADA: "Autorizada",
  RECHAZADA: "Rechazada",
  VENCIDA: "Vencida",
  CANCELADA: "Cancelada",
  ATENDIDA: "Atendida",
  NO_ASISTIO: "No asistió",
};

export function ListaCitas({
  datos,
  propias,
}: {
  datos: PaginaCitas;
  propias: boolean;
}) {
  const { citas, total, pagina, porPagina } = datos;
  return (
    <>
      <h1 className="text-h1 font-fuerte leading-titulo text-texto-titulo">
        {propias ? "Mis citas" : "Citas"}
      </h1>
      <Superficie titulo="Citas registradas" id="citas">
        {citas.length === 0 ? (
          <p className="text-texto-secundario">No hay citas en esta página.</p>
        ) : (
          <ul className="divide-y divide-borde-suave">
            {citas.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-fuerte">{c.servicio}</p>
                  <p className="text-texto-secundario">
                    {c.codigo} ·{" "}
                    <time dateTime={c.inicio}>
                      {formato.format(new Date(c.inicio))}
                    </time>
                  </p>
                </div>
                <div className="text-texto-secundario">
                  {!propias && <p>{c.psicologoNombre}</p>}
                  <p>{estados[c.estado]}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {(pagina > 1 || pagina * porPagina < total) && (
          <nav
            aria-label="Páginas de citas"
            className="flex flex-wrap gap-4 text-texto-enlace"
          >
            {pagina > 1 && (
              <Link href={`?pagina=${pagina - 1}`} className="underline">
                Anterior
              </Link>
            )}
            {pagina * porPagina < total && (
              <Link href={`?pagina=${pagina + 1}`} className="underline">
                Siguiente
              </Link>
            )}
          </nav>
        )}
      </Superficie>
    </>
  );
}
