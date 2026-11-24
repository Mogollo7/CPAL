import { RecuperarAcceso } from "@/componentes/panel/acceso";
import { TarjetaAcceso } from "@/componentes/panel/tarjeta-acceso";
import ilustracion from "@/contenido/ilustraciones/acceso-recuperar.webp";

export default function PaginaRecuperarClave() {
  return (
    <TarjetaAcceso ilustracion={ilustracion} titulo="Recuperar contraseña">
      <p className="hidden text-h2 text-texto-secundario md:block">
        Te enviaremos un enlace de acceso seguro a tu correo institucional.
      </p>
      <RecuperarAcceso />
    </TarjetaAcceso>
  );
}
