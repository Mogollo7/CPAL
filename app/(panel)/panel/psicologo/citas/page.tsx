import { datosDePagina } from "@/servidor/pagina";
import { listarMisCitasAccion } from "@/servidor/acciones";
import { MisCitasCliente } from "@/componentes/panel/psicologo/mis-citas-cliente";

export default async function PaginaPsicologoCitas() {
  const { citas } = datosDePagina(await listarMisCitasAccion({}));

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Mis Citas y Pacientes Asignados
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Consulta la agenda de tus próximas sesiones clínicas y los datos de
          contacto autorizados.
        </p>
      </div>

      <MisCitasCliente citasIniciales={citas} />
    </div>
  );
}
