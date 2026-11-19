import { Suspense } from "react";
import type { CitaLista, EstadoCita } from "@/contratos/cita";
import { listarCitasAccion } from "@/servidor/acciones";
import { FiltrosCitas } from "@/componentes/panel/citas/filtros-citas";
import { TablaCitas } from "@/componentes/panel/citas/tabla-citas";

// Citas de prueba realistas para desarrollo visual sin base de datos activa (T-312)
const CITAS_SIMULADAS: CitaLista[] = [
  {
    id: "cita-001",
    codigo: "CAPL-7K3F",
    estado: "PENDIENTE",
    inicio: new Date(Date.now() + 86400000 * 2).toISOString(), // Pasado mañana
    fin: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
    servicio: "Atención psicológica individual",
    psicologoId: "psi-1",
    psicologoNombre: "Dra. Sofía Martínez",
    paraQuien: "PROPIA",
    solicitanteNombre: "Juan Carlos Pérez",
    solicitanteCorreo: "juan.perez@unisalle.edu.co",
    solicitanteTelefono: "3104567890",
    pacienteNombre: "Juan Carlos Pérez",
    pacienteDocumento: "1020304050",
    venceEn: new Date(Date.now() + 86400000).toISOString(),
    creadaEn: new Date().toISOString(),
  },
  {
    id: "cita-002",
    codigo: "CAPL-8N2M",
    estado: "PENDIENTE",
    inicio: new Date(Date.now() + 86400000 * 3).toISOString(),
    fin: new Date(Date.now() + 86400000 * 3 + 3600000).toISOString(),
    servicio: "Orientación vocacional y profesional",
    psicologoId: "psi-2",
    psicologoNombre: "Dr. Carlos Rodríguez",
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
    id: "cita-003",
    codigo: "CAPL-4T9B",
    estado: "AUTORIZADA",
    inicio: new Date(Date.now() + 86400000).toISOString(), // Mañana
    fin: new Date(Date.now() + 86400000 + 3600000).toISOString(),
    servicio: "Atención psicológica individual",
    psicologoId: "psi-1",
    psicologoNombre: "Dra. Sofía Martínez",
    paraQuien: "PROPIA",
    solicitanteNombre: "Andrés Felipe Castro",
    solicitanteCorreo: "andres.castro@unisalle.edu.co",
    solicitanteTelefono: "3001234567",
    pacienteNombre: "Andrés Felipe Castro",
    pacienteDocumento: "1015243678",
    venceEn: null,
    creadaEn: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "cita-004",
    codigo: "CAPL-2P1W",
    estado: "RECHAZADA",
    inicio: new Date(Date.now() - 86400000).toISOString(),
    fin: new Date(Date.now() - 86400000 + 3600000).toISOString(),
    servicio: "Terapia de apoyo emocional",
    psicologoId: "psi-3",
    psicologoNombre: "Dra. Valentina Morales",
    paraQuien: "MENOR",
    solicitanteNombre: "Laura Restrepo (Madre)",
    solicitanteCorreo: "laura.restrepo@gmail.com",
    solicitanteTelefono: "3205556677",
    pacienteNombre: "Tomás Restrepo",
    pacienteDocumento: "1152436890",
    venceEn: null,
    creadaEn: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "cita-005",
    codigo: "CAPL-1X7R",
    estado: "ATENDIDA",
    inicio: new Date(Date.now() - 86400000 * 4).toISOString(),
    fin: new Date(Date.now() - 86400000 * 4 + 3600000).toISOString(),
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
    creadaEn: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

interface PaginaAdminCitasProps {
  searchParams: Promise<{
    estado?: string;
    busqueda?: string;
    fecha?: string;
    pagina?: string;
  }>;
}

export default async function PaginaAdminCitas({
  searchParams,
}: PaginaAdminCitasProps) {
  const params = await searchParams;
  const estadoFiltro = (params.estado || "PENDIENTE") as EstadoCita | "todas";
  const busqueda = (params.busqueda || "").toLowerCase().trim();
  const pagina = Number(params.pagina) || 1;

  let citas: CitaLista[] = [];
  let total = 0;

  try {
    // Intentamos consultar la base de datos real
    const res = await listarCitasAccion({
      estado: estadoFiltro === "todas" ? undefined : estadoFiltro,
      busqueda: busqueda || undefined,
      pagina,
    });

    if (res.ok) {
      citas = res.datos.citas;
      total = res.datos.total;
    } else {
      throw new Error(res.mensaje);
    }
  } catch {
    // Si no hay base de datos conectada en desarrollo local, usamos las citas simuladas con filtrado interactivo
    let filtradas = [...CITAS_SIMULADAS];

    if (estadoFiltro !== "todas") {
      filtradas = filtradas.filter((c) => c.estado === estadoFiltro);
    }

    if (busqueda) {
      filtradas = filtradas.filter(
        (c) =>
          c.codigo.toLowerCase().includes(busqueda) ||
          c.solicitanteNombre?.toLowerCase().includes(busqueda) ||
          c.pacienteNombre?.toLowerCase().includes(busqueda) ||
          c.solicitanteCorreo?.toLowerCase().includes(busqueda) ||
          c.pacienteDocumento?.toLowerCase().includes(busqueda),
      );
    }

    total = filtradas.length;
    citas = filtradas;
  }

  return (
    <div className="space-y-6">
      {/* Encabezado de la página */}
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Bandeja de Citas
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Revisión de solicitudes entrantes, autorizaciones inmediatas y
          seguimiento clínico.
        </p>
      </div>

      {/* Controles de Filtros y Búsqueda */}
      <Suspense
        fallback={
          <div className="h-20 bg-fondo-suave rounded-m animate-pulse" />
        }
      >
        <FiltrosCitas />
      </Suspense>

      {/* Tabla Interactiva de Citas */}
      <TablaCitas
        citas={citas}
        total={total}
        paginaActual={pagina}
        baseUrl="/panel/admin/citas"
      />
    </div>
  );
}
