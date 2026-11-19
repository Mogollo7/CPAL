import { datosDePagina } from "@/servidor/pagina";
import { listarPsicologosAccion } from "@/servidor/acciones";
import { GestorPsicologos } from "@/componentes/panel/admin/gestor-psicologos";

export default async function PaginaAdminPsicologos() {
  const psicologos = datosDePagina(await listarPsicologosAccion());

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Equipo de Psicólogos
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Administración de terapeutas, emisión de invitaciones institucionales
          y control de estado activo.
        </p>
      </div>

      <GestorPsicologos psicologosIniciales={psicologos} />
    </div>
  );
}
