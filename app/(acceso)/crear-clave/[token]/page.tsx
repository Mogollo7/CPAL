import { ActivarCuenta } from "@/componentes/panel/acceso";
import { TarjetaAcceso } from "@/componentes/panel/tarjeta-acceso";
import ilustracion from "@/contenido/ilustraciones/acceso-crear-clave.webp";
import { Suspense } from "react";

type Parametros = { params: Promise<{ token: string }> };

async function FormularioCrearClave({ params }: Parametros) {
  const { token } = await params;
  return <ActivarCuenta token={token} />;
}

export default function PaginaCrearClave({ params }: Parametros) {
  return (
    <TarjetaAcceso ilustracion={ilustracion} titulo="Crea tu contraseña">
      <p className="text-texto-secundario">Usa al menos 10 caracteres.</p>
      <Suspense fallback={<p role="status">Cargando formulario…</p>}>
        <FormularioCrearClave params={params} />
      </Suspense>
    </TarjetaAcceso>
  );
}
