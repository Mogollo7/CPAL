import { EncabezadoPagina } from "@/componentes/panel/encabezado-pagina";
import { FormularioCuenta } from "@/componentes/panel/psicologo/formulario-cuenta";

export default function PaginaPsicologoCuenta() {
  return (
    <div className="space-y-4">
      <EncabezadoPagina titulo="Perfil y cuenta" pestana="cuenta" />

      <FormularioCuenta />
    </div>
  );
}
