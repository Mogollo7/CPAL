import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { datosDePagina } from "@/servidor/pagina";
import { obtenerMiPerfilAccion } from "@/servidor/acciones";
import { GestorHorario } from "@/componentes/panel/psicologo/gestor-horario";

export default async function PaginaPsicologoHorario() {
  const perfil = datosDePagina(await obtenerMiPerfilAccion());
  const horario = perfil.horario.bloques;
  const bloqueos = perfil.bloqueos;

  return (
    <div className="space-y-4">
      <EncabezadoPagina
        titulo="Horario habitual"
        descripcion="Organiza tus franjas semanales de disponibilidad."
      />

      <GestorHorario horarioInicial={horario} bloqueosIniciales={bloqueos} />
    </div>
  );
}
