import Link from "next/link";
import type { FichaPaciente as Ficha } from "@/servidor/pacientes/pacientes";
import { PildoraEstado } from "@/componentes/panel/citas/pildora-estado";
import { TarjetaPanel } from "@/componentes/panel/tarjeta-panel";
import { fechaHora } from "./fecha";

export function FichaPaciente({ ficha }: { ficha: Ficha }) {
  return (
    <div className="space-y-4">
      <Link
        href="/panel/psicologo/pacientes"
        className="text-caption text-morado-700 hover:underline"
      >
        ← Volver a pacientes
      </Link>
      <TarjetaPanel>
        <h2 className="text-h2 font-weight-fuerte text-texto-titulo">
          {ficha.nombre}
        </h2>
        <p className="text-p text-texto-secundario mt-2">
          Doc. {ficha.documento}
          {ficha.edad != null && ` · ${ficha.edad} años`} · {ficha.citas}{" "}
          {ficha.citas === 1 ? "cita" : "citas"}
        </p>
      </TarjetaPanel>
      <TarjetaPanel>
        <h2 className="text-h2 font-weight-fuerte text-texto-titulo mb-4">
          Historial de citas
        </h2>
        <ul className="divide-y divide-borde-suave">
          {ficha.historial.map((c) => (
            <li key={c.id} className="py-4 flex flex-wrap items-start gap-4">
              <div className="min-w-0 flex-1 wrap-anywhere">
                <p className="text-p font-medio text-texto-titulo">
                  {fechaHora(c.inicio)}
                </p>
                <p className="text-caption text-texto-secundario">
                  {c.servicio} · {c.codigo}
                </p>
                {c.motivo && (
                  <p className="text-p text-texto-secundario mt-2">
                    Motivo: {c.motivo}
                  </p>
                )}
              </div>
              <PildoraEstado estado={c.estado} />
            </li>
          ))}
        </ul>
      </TarjetaPanel>
    </div>
  );
}
