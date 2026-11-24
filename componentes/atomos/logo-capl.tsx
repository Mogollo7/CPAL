import Image from "next/image";
import logoClaro from "@/contenido/marca/logo-capl.webp";
import logoOscuro from "@/contenido/marca/logo-capl-sobre-oscuro.webp";

// Figma · Átomos/Logo CAPL: 60 px de alto; «oscuro» es la versión para fondos morados.
export function LogoCapl({ fondo = "claro" }: { fondo?: "claro" | "oscuro" }) {
  return (
    <Image
      src={fondo === "claro" ? logoClaro : logoOscuro}
      alt="CAPL · Unilasallista"
      className="h-[3rem] w-auto sm:h-[3.75rem]"
      sizes="(max-width: 599px) 118px, 147px"
      priority={fondo === "claro"}
    />
  );
}
