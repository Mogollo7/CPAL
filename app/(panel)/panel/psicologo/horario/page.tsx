import { datosDePagina } from "@/servidor/pagina";
import { obtenerMiPerfilAccion } from "@/servidor/acciones";
import { GestorHorario } from "@/componentes/panel/psicologo/gestor-horario";

export default async function PaginaPsicologoHorario() {
  const perfil = datosDePagina(await obtenerMiPerfilAccion());
  const horario = perfil.horario.bloques;
  const bloqueos = perfil.bloqueos;

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Mi Horario y Disponibilidad
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Los cupos de atención que ven los consultantes en el sitio web se
          calculan automáticamente a partir de estas franjas.
        </p>
      </div>

      <GestorHorario horarioInicial={horario} bloqueosIniciales={bloqueos} />
    </div>
  );
}
