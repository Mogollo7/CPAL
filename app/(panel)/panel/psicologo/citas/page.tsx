import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { datosDePagina } from "@/servidor/pagina";
import { listarMisCitasAccion } from "@/servidor/acciones";
import { MisCitasCliente } from "@/componentes/panel/psicologo/mis-citas-cliente";

export default async function PaginaPsicologoCitas() {
  const { citas } = datosDePagina(await listarMisCitasAccion({}));

  return (
    <div className="space-y-4">
      <EncabezadoPagina titulo="Mis citas" />

      <MisCitasCliente citasIniciales={citas} />
    </div>
  );
}
