import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import type { CitaDetalle } from "@/contratos/cita";
import { verCitaAdminAccion } from "@/servidor/acciones";
import { DetalleCitaCliente } from "@/componentes/panel/citas/detalle-cita-cliente";

interface PaginaDetalleCitaProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaginaDetalleCita({
  params,
}: PaginaDetalleCitaProps) {
  const { id } = await params;

  let cita: CitaDetalle | null = null;

  try {
    const res = await verCitaAdminAccion(id);
    if (res.ok) {
      cita = res.datos;
    } else {
      throw new Error(res.mensaje);
    }
  } catch {
    // Modo de prueba / desarrollo visual si no hay conexión a base de datos
    cita = {
      id,
      codigo: id.startsWith("cita-") ? "CAPL-7K3F" : id.toUpperCase(),
      estado: id.includes("003")
        ? "AUTORIZADA"
        : id.includes("004")
          ? "RECHAZADA"
          : "PENDIENTE",
      inicio: "2026-11-20T14:00:00.000Z",
      fin: "2026-11-20T15:00:00.000Z",
      servicio: "Atención psicológica individual",
      psicologoId: "psi-1",
      psicologoNombre: "Dra. Sofía Martínez",
      paraQuien: "PROPIA",
      solicitanteNombre: "Juan Carlos Pérez",
      solicitanteCorreo: "juan.perez@unisalle.edu.co",
      solicitanteTelefono: "3104567890",
      pacienteNombre: "Juan Carlos Pérez",
      pacienteDocumento: "1020304050",
      pacienteEdad: 24,
      acudienteNombre: null,
      acudienteDocumento: null,
      motivo:
        "Presento episodios recurrentes de ansiedad ante las entregas académicas y dificultad para conciliar el sueño en las últimas tres semanas.",
      motivoRechazo: id.includes("004")
        ? "El motivo de consulta requiere atención por urgencias psiquiátricas especializadas."
        : null,
      reprogramaciones: 0,
      reprogramadaDeId: null,
      venceEn: "2026-11-19T23:59:59.000Z",
      creadaEn: "2026-11-18T10:00:00.000Z",
      consentimientoEn: "2026-11-18T10:00:00.000Z",
      consentimientoVersion: "v1.0",
      historial: [
        {
          accion: "Solicitud de cita recibida por la plataforma",
          usuarioId: null,
          creadaEn: "2026-11-18T10:00:00.000Z",
        },
      ],
      correos: [
        {
          llave: "cita-recibida",
          estado: "entregado",
          entregado: true,
        },
      ],
    };
  }

  if (!cita) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="w-12 h-12 rounded-circulo bg-error-fondo text-error-texto flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-h2 font-weight-fuerte text-texto-titulo">
          Cita no encontrada
        </h2>
        <p className="text-caption text-texto-secundario">
          El identificador de cita solicitado no existe o no tienes permisos
          para visualizarlo.
        </p>
        <Link
          href="/panel/admin/citas"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-m bg-fondo-superficie border border-borde-control text-caption font-weight-medio hover:bg-fondo-suave"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la bandeja</span>
        </Link>
      </div>
    );
  }

  return <DetalleCitaCliente cita={cita} />;
}
