"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/componentes/ui/cn";

interface EnlaceNavProps {
  href: string;
  label: string;
  icono: LucideIcon;
  badge?: string | number;
  onClick?: () => void;
}

export function EnlaceNav({
  href,
  label,
  icono: Icono,
  badge,
  onClick,
}: EnlaceNavProps) {
  const pathname = usePathname();
  const activo = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center justify-between gap-3 px-4 py-3 rounded-m text-p font-weight-medio transition-all duration-200",
        activo
          ? "bg-accion-suave-fondo text-accion-suave-texto font-weight-fuerte shadow-xs"
          : "text-texto-secundario hover:text-texto-titulo hover:bg-fondo-suave",
      )}
      aria-current={activo ? "page" : undefined}
    >
      <div className="flex items-center gap-3">
        <Icono
          className={cn(
            "w-5 h-5 transition-transform duration-200 group-hover:scale-105",
            activo ? "text-accion-fondo" : "text-texto-secundario group-hover:text-texto-titulo",
          )}
          aria-hidden="true"
        />
        <span>{label}</span>
      </div>

      {badge !== undefined && (
        <span
          className={cn(
            "text-caption px-2 py-0.5 rounded-pildora font-weight-fuerte",
            activo
              ? "bg-accion-fondo text-accion-texto"
              : "bg-fondo-seccion text-texto-secundario",
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
