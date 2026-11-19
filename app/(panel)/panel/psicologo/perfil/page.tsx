import type { PerfilPropio } from "@/contratos/psicologo";
import { obtenerMiPerfilAccion } from "@/servidor/acciones";
import { EditorPerfil } from "@/componentes/panel/psicologo/editor-perfil";

export default async function PaginaPsicologoPerfil() {
  let perfil: PerfilPropio = {
    id: "psi-1",
    nombre: "Dra. Sofía Martínez",
    area: "PSICOLOGIA",
    presentacion:
      "Psicóloga en formación con enfoque cognitivo-conductual. Experiencia en orientación para el manejo del estrés académico, procesos adaptativos universitarios y habilidades interpersonales.",
    visible: true,
    fotoUrl: null,
    servicioIds: ["serv-1", "serv-3"],
    horario: { bloques: [] },
    bloqueos: [],
  };

  try {
    const res = await obtenerMiPerfilAccion();
    if (res.ok) {
      perfil = res.datos;
    }
  } catch {
    // Si no hay DB, usamos los valores simulados
  }

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
