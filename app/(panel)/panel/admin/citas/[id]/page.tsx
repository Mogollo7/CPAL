import { datosDePagina } from "@/servidor/pagina";
import { connection } from "next/server";
import { verCitaAdminAccion } from "@/servidor/acciones";
import { DetalleCitaCliente } from "@/componentes/panel/citas/detalle-cita-cliente";

interface PaginaDetalleCitaProps {
  params: Promise<{
    id: string;
  }>;
}

export const instant = false;

export default async function PaginaDetalleCita({
  params,
}: PaginaDetalleCitaProps) {
  await connection();
  const { id } = await params;

  const cita = datosDePagina(await verCitaAdminAccion(id));
  return <DetalleCitaCliente cita={cita} />;
}
