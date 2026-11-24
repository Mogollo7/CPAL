import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { ListaPacientes } from "@/componentes/panel/pacientes/lista-pacientes";
import { listarPacientesAccion } from "@/servidor/acciones";
import { datosDePagina } from "@/servidor/pagina";

export default async function PaginaPsicologoPacientes() {
  const pacientes = datosDePagina(await listarPacientesAccion());
  return (
    <div className="space-y-4">
      <EncabezadoPagina
        titulo="Pacientes"
        descripcion="Personas que has atendido o tienes agendadas, con su historial de citas."
      />
      <ListaPacientes pacientes={pacientes} />
    </div>
  );
}
