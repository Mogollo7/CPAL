import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { FichaPaciente } from "@/componentes/panel/pacientes/ficha-paciente";
import { verPacienteAccion } from "@/servidor/acciones";
import { datosDePagina } from "@/servidor/pagina";

export default async function PaginaFichaPaciente({
  params,
}: {
  params: Promise<{ documento: string }>;
}) {
  const { documento } = await params;
  const ficha = datosDePagina(
    await verPacienteAccion(decodeURIComponent(documento)),
  );
  return (
    <div className="space-y-4">
      <EncabezadoPagina titulo="Ficha del paciente" />
      <FichaPaciente ficha={ficha} />
    </div>
  );
}
