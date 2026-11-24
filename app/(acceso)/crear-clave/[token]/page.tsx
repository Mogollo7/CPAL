import { ActivarCuenta } from "@/componentes/panel/acceso";
import { Suspense } from "react";

type Parametros = { params: Promise<{ token: string }> };

async function FormularioCrearClave({ params }: Parametros) {
  const { token } = await params;
  return <ActivarCuenta token={token} />;
}

export default function PaginaCrearClave({ params }: Parametros) {
  return (
    <>
      <h1 className="text-h1 font-fuerte text-texto-titulo">
        Crea tu contraseña
      </h1>
      <p className="text-texto-secundario">Usa al menos 10 caracteres.</p>
      <Suspense fallback={<p role="status">Cargando formulario…</p>}>
        <FormularioCrearClave params={params} />
      </Suspense>
    </>
  );
}
