import type { UsuarioResumen } from "@/contratos/psicologo";
import { listarPsicologosAccion } from "@/servidor/acciones";
import { GestorPsicologos } from "@/componentes/panel/admin/gestor-psicologos";

const PSICOLOGOS_SIMULADOS: UsuarioResumen[] = [
  {
    id: "psi-1",
    nombre: "Dra. Sofía Martínez",
    correo: "sofia.martinez@unilasallista.edu.co",
    rol: "PSICOLOGO",
    area: "PSICOLOGIA",
    estado: "ACTIVO",
    ultimoIngreso: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "psi-2",
    nombre: "Dr. Carlos Rodríguez",
    correo: "carlos.rodriguez@unilasallista.edu.co",
    rol: "PSICOLOGO",
    area: "NEUROPSICOLOGIA",
    estado: "INVITADO",
    ultimoIngreso: null,
  },
  {
    id: "psi-3",
    nombre: "Dra. Valentina Morales",
    correo: "valentina.morales@unilasallista.edu.co",
    rol: "PSICOLOGO",
    area: "PSICOLOGIA",
    estado: "ACTIVO",
    ultimoIngreso: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "psi-4",
    nombre: "Lic. Andrés Ruiz",
    correo: "andres.ruiz@unilasallista.edu.co",
    rol: "PSICOLOGO",
    area: "PSICOLOGIA",
    estado: "INACTIVO",
    ultimoIngreso: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

export default async function PaginaAdminPsicologos() {
  let psicologos: UsuarioResumen[] = [];

  try {
    const res = await listarPsicologosAccion();
    if (res.ok) {
      psicologos = res.datos;
    } else {
      throw new Error(res.mensaje);
    }
  } catch {
    psicologos = PSICOLOGOS_SIMULADOS;
  }

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
