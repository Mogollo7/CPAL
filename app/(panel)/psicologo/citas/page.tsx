import type { CitaLista } from "@/contratos/cita";
import { listarMisCitasAccion } from "@/servidor/acciones";
import { MisCitasCliente } from "@/componentes/panel/psicologo/mis-citas-cliente";

const CITAS_PSICOLOGO_SIMULADAS: CitaLista[] = [
  {
    id: "cita-psi-01",
    codigo: "CAPL-7K3F",
    estado: "AUTORIZADA",
    inicio: new Date(Date.now() + 86400000 * 1).toISOString(), // Mañana
    fin: new Date(Date.now() + 86400000 * 1 + 3600000).toISOString(),
    servicio: "Atención psicológica individual",
    psicologoId: "psi-1",
    psicologoNombre: "Dra. Sofía Martínez",
    paraQuien: "PROPIA",
    solicitanteNombre: "Juan Carlos Pérez",
    solicitanteCorreo: "juan.perez@unisalle.edu.co",
    solicitanteTelefono: "3104567890",
    pacienteNombre: "Juan Carlos Pérez",
    pacienteDocumento: "1020304050",
    venceEn: null,
    creadaEn: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "cita-psi-02",
    codigo: "CAPL-8N2M",
    estado: "PENDIENTE",
    inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
    fin: new Date(Date.now() + 86400000 * 3 + 3600000).toISOString(),
    servicio: "Orientación vocacional y profesional",
    psicologoId: "psi-1",
    psicologoNombre: "Dra. Sofía Martínez",
    paraQuien: "PROPIA",
    solicitanteNombre: "Mariana Gómez Ortiz",
    solicitanteCorreo: "mariana.gomez@unisalle.edu.co",
    solicitanteTelefono: "3159876543",
    pacienteNombre: "Mariana Gómez Ortiz",
    pacienteDocumento: "1098765432",
    venceEn: new Date(Date.now() + 86400000 * 2).toISOString(),
    creadaEn: new Date().toISOString(),
  },
  {
    id: "cita-psi-03",
    codigo: "CAPL-1X7R",
    estado: "ATENDIDA",
    inicio: new Date(Date.now() - 86400000 * 5).toISOString(),
    fin: new Date(Date.now() - 86400000 * 5 + 3600000).toISOString(),
    servicio: "Atención psicológica individual",
    psicologoId: "psi-1",
    psicologoNombre: "Dra. Sofía Martínez",
    paraQuien: "PROPIA",
    solicitanteNombre: "Camila Torres",
    solicitanteCorreo: "camila.torres@unisalle.edu.co",
    solicitanteTelefono: "3187778899",
    pacienteNombre: "Camila Torres",
    pacienteDocumento: "1032456789",
    venceEn: null,
    creadaEn: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export default async function PaginaPsicologoCitas() {
  let citas: CitaLista[] = [];

  try {
    const res = await listarMisCitasAccion({});
    if (res.ok) {
      citas = res.datos.citas;
    } else {
      throw new Error(res.mensaje);
    }
  } catch {
    citas = CITAS_PSICOLOGO_SIMULADAS;
  }

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Mis Citas y Pacientes Asignados
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Consulta la agenda de tus próximas sesiones clínicas y los datos de contacto autorizados.
        </p>
      </div>

      <MisCitasCliente citasIniciales={citas} />
    </div>
  );
}
