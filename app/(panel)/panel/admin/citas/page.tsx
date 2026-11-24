import { ListaCitas } from "@/componentes/panel/lista-citas";
import { filtrosCitaSchema } from "@/contratos/filtros-cita";
import { consultarCitas } from "@/servidor/citas/admin";
import { paginaProtegida } from "@/servidor/cuentas/sesionActual";

export const instant = false;

export default async function PaginaCitas({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>;
}) {
  await paginaProtegida("ADMIN");
  const filtros = filtrosCitaSchema.safeParse({
    pagina: Number((await searchParams).pagina ?? 1),
  });
  return (
    <ListaCitas
      datos={await consultarCitas(
        filtros.success ? filtros.data : { pagina: 1 },
      )}
      propias={false}
    />
  );
}
