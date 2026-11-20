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
      <div className="overflow-x-auto">
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
    </TarjetaPanel>
  );
}
