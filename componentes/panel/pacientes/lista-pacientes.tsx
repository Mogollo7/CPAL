import Link from "next/link";
import { Users } from "lucide-react";
import type { PacienteResumen } from "@/servidor/pacientes/pacientes";
import { PildoraEstado } from "@/componentes/panel/citas/pildora-estado";
import { EstadoVacio } from "@/componentes/panel/estado-vacio";
import { TarjetaPanel } from "@/componentes/panel/tarjeta-panel";
import { fechaHora } from "./fecha";

export function ListaPacientes({
  pacientes,
}: {
  pacientes: PacienteResumen[];
}) {
  if (!pacientes.length)
    return (
      <EstadoVacio
        icono={Users}
        titulo="Aún no tienes pacientes"
        descripcion="Cuando te asignen citas, aquí verás a cada persona con su historial."
      />
    );
  return (
    <TarjetaPanel>
      <div className="@container">
        <ul
          aria-label="Pacientes asignados"
          className="reticula-capl @min-[46rem]:hidden"
        >
          {pacientes.map((p) => (
            <li
              key={p.documento}
              className="col-span-4 min-w-0 rounded-m border border-borde-suave bg-fondo-superficie p-4 wrap-anywhere @min-[34rem]:col-span-2"
            >
              <Link
                href={`/panel/psicologo/pacientes/${encodeURIComponent(p.documento)}`}
                className="flex min-h-[44px] items-center text-h2 font-fuerte text-texto-enlace underline"
              >
                {p.nombre}
              </Link>
              <p className="text-caption text-texto-secundario">
                Doc. {p.documento}
              </p>
              <dl className="mt-3 space-y-2 text-p">
                <div>
                  <dt className="inline font-medio">Edad </dt>
                  <dd className="inline">{p.edad ?? "—"}</dd>
                </div>
                <div>
                  <dt className="inline font-medio">Citas </dt>
                  <dd className="inline">{p.citas}</dd>
                </div>
                <div>
                  <dt className="font-medio">Última cita</dt>
                  <dd>{fechaHora(p.ultimaCita)}</dd>
                </div>
                <div>
                  <dt className="font-medio">Próxima cita</dt>
                  <dd>
                    {p.proximaEstado ? (
                      <PildoraEstado estado={p.proximaEstado} />
                    ) : (
                      "Sin próxima"
                    )}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto @min-[46rem]:block">
          <table className="w-full min-w-[720px] text-left text-p">
            <thead className="bg-fondo-suave text-caption text-texto-secundario">
              <tr>
                <th scope="col" className="px-4 py-3 font-medio">
                  Paciente
                </th>
                <th scope="col" className="px-4 py-3 font-medio">
                  Edad
                </th>
                <th scope="col" className="px-4 py-3 font-medio">
                  Citas
                </th>
                <th scope="col" className="px-4 py-3 font-medio">
                  Última cita
                </th>
                <th scope="col" className="px-4 py-3 font-medio">
                  Próxima cita
                </th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr
                  key={p.documento}
                  className="border-b border-borde-suave last:border-0"
                >
                  <td className="px-4 py-4">
                    <Link
                      href={`/panel/psicologo/pacientes/${encodeURIComponent(p.documento)}`}
                      className="block font-medio text-morado-700 hover:underline focus-visible:outline-2 focus-visible:outline-morado-600"
                    >
                      {p.nombre}
                    </Link>
                    <span className="text-caption text-texto-secundario">
                      Doc. {p.documento}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-texto-secundario">
                    {p.edad ?? "—"}
                  </td>
                  <td className="px-4 py-4">{p.citas}</td>
                  <td className="px-4 py-4 text-texto-secundario">
                    {fechaHora(p.ultimaCita)}
                  </td>
                  <td className="px-4 py-4">
                    {p.proximaEstado ? (
                      <PildoraEstado estado={p.proximaEstado} />
                    ) : (
                      <span className="text-texto-secundario">Sin próxima</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TarjetaPanel>
  );
}
