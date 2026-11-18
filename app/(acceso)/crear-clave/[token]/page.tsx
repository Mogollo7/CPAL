import { FormularioCrearClave } from "./formulario-crear-clave";

interface PaginaCrearClaveProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function PaginaCrearClave({
  params,
}: PaginaCrearClaveProps) {
  const { token } = await params;

  return <FormularioCrearClave token={token} />;
}
