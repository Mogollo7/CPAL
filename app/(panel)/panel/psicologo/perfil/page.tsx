import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { datosDePagina } from "@/servidor/pagina";
import { obtenerMiPerfilAccion } from "@/servidor/acciones";
import { EditorPerfil } from "@/componentes/panel/psicologo/editor-perfil";

export default async function PaginaPsicologoPerfil() {
  const perfil = datosDePagina(await obtenerMiPerfilAccion());

  return (
    <div className="space-y-4">
      <EncabezadoPagina titulo="Perfil y cuenta" pestana="perfil" />

      <EditorPerfil perfilInicial={perfil} />
    </div>
  );
}
