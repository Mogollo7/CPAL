import { datosDePagina } from "@/servidor/pagina";
import { obtenerMiPerfilAccion } from "@/servidor/acciones";
import { EditorPerfil } from "@/componentes/panel/psicologo/editor-perfil";

export default async function PaginaPsicologoPerfil() {
  const perfil = datosDePagina(await obtenerMiPerfilAccion());

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Mi Perfil Profesional
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Personaliza tu fotografía, tu biografía clínica y los servicios que
          ofreces a los consultantes.
        </p>
      </div>

      <EditorPerfil perfilInicial={perfil} />
    </div>
  );
}
