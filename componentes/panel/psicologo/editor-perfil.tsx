"use client";
import { SIN_CONEXION } from "@/contratos/resultado";

import {
  useState,
  useTransition,
  type FormEvent,
  type ChangeEvent,
} from "react";
import { Camera, CheckCircle2, AlertCircle } from "lucide-react";
import { Boton } from "@/componentes/atomos/boton";
import { Titulo } from "@/componentes/atomos/titulo";
import type { PerfilPropio } from "@/contratos/psicologo";
import { actualizarPerfilAccion, subirFotoAccion } from "@/servidor/acciones";

interface ServicioOpcion {
  id: string;
  nombre: string;
}

const SERVICIOS_DISPONIBLES: ServicioOpcion[] = [
  { id: "serv-1", nombre: "Atención psicológica individual" },
  { id: "serv-2", nombre: "Orientación vocacional y profesional" },
  { id: "serv-3", nombre: "Terapia de apoyo emocional" },
  { id: "serv-4", nombre: "Acompañamiento en crisis" },
];

interface EditorPerfilProps {
  perfilInicial: PerfilPropio;
}

export function EditorPerfil({ perfilInicial }: EditorPerfilProps) {
  const [nombre] = useState(perfilInicial.nombre);
  const [area] = useState(perfilInicial.area);
  const [presentacion, setPresentacion] = useState(
    perfilInicial.presentacion || "",
  );
  const [visible, setVisible] = useState(perfilInicial.visible);
  const [servicioIds, setServicioIds] = useState<string[]>(
    perfilInicial.servicioIds && perfilInicial.servicioIds.length > 0
      ? perfilInicial.servicioIds
      : ["serv-1", "serv-3"],
  );

  const [fotoUrl, setFotoUrl] = useState<string | null>(perfilInicial.fotoUrl);
  const [previsualizacionFoto, setPrevisualizacionFoto] = useState<
    string | null
  >(null);

  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);
  const [guardandoPerfil, iniciarTransicionPerfil] = useTransition();
  const [subiendoFoto, iniciarTransicionFoto] = useTransition();

  // Alternar selección de servicios atendidos
  const alternarServicio = (id: string) => {
    setServicioIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  // Subir foto de perfil (400x400 px WebP según RF-PSI-01)
  const manejarSubidaFoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 6 * 1024 * 1024) {
      setMensaje({
        tipo: "error",
        texto: "La foto supera el límite permitido de 6 MB.",
      });
      return;
    }

    // Crear previsualización local inmediata
    const urlLocal = URL.createObjectURL(file);
    setPrevisualizacionFoto(urlLocal);

    const formData = new FormData();
    formData.append("foto", file);

    iniciarTransicionFoto(async () => {
      try {
        const res = await subirFotoAccion(formData);
        if (res.ok) {
          setFotoUrl(res.datos.fotoUrl);
          setMensaje({
            tipo: "exito",
            texto: "Foto de perfil actualizada correctamente.",
          });
        } else {
          setMensaje({
            tipo: "error",
            texto: res.mensaje || "Error al subir la imagen.",
          });
        }
      } catch {
        setMensaje({ tipo: "error", texto: SIN_CONEXION });
      }
    });
  };

  // Guardar datos del perfil
  const manejarGuardarPerfil = (e: FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    iniciarTransicionPerfil(async () => {
      try {
        const res = await actualizarPerfilAccion({
          presentacion: presentacion.trim(),
          servicioIds,
          visible,
        });

        if (res.ok) {
          setMensaje({
            tipo: "exito",
            texto: "Perfil profesional actualizado con éxito.",
          });
        } else {
          setMensaje({
            tipo: "error",
            texto: res.mensaje || "Error al actualizar perfil.",
          });
        }
      } catch {
        setMensaje({ tipo: "error", texto: SIN_CONEXION });
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Alerta de notificación */}
      {mensaje && (
        <div
          role="status"
          className={`p-4 rounded-m flex items-start gap-[10px] text-caption font-medio border ${
            mensaje.tipo === "exito"
              ? "bg-exito-fondo text-exito-texto border-agua-700/20"
              : "bg-error-fondo text-error-texto border-coral-700/20"
          }`}
        >
          {mensaje.tipo === "exito" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-1" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-1" />
          )}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* SECCIÓN 1: FOTO DE PERFIL E INFORMACIÓN GENERAL */}
      <div className="p-5 rounded-m bg-fondo-seccion flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar y Carga */}
        <div className="relative group shrink-0">
          <div className="w-[108px] h-[108px] rounded-circulo overflow-hidden bg-fondo-superficie flex items-center justify-center text-morado-700 font-fuerte text-h1 shadow-sm">
            {previsualizacionFoto || fotoUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previsualizacionFoto || fotoUrl || ""}
                alt={nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{nombre.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <label
            htmlFor="foto-input"
            className="absolute bottom-0 right-0 p-2 rounded-circulo bg-accion-fondo text-blanco hover:bg-accion-fondo-activo cursor-pointer shadow-md transition-transform group-hover:scale-105"
            title="Cambiar foto de perfil"
          >
            <Camera className="w-4 h-4" />
            <input
              id="foto-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={manejarSubidaFoto}
              disabled={subiendoFoto}
              className="sr-only"
            />
          </label>
        </div>

        {/* Datos Institucionales */}
        <div className="space-y-2 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-h1 font-fuerte text-texto-titulo tracking-tight">
              {nombre}
            </h3>
            <span className="self-center sm:self-auto px-[10px] py-[2px] rounded-pildora text-caption font-fuerte bg-morado-100 text-morado-700 border border-morado-300">
              {area}
            </span>
          </div>

          <p className="text-caption text-texto-secundario">
            Psicólogo(a) en formación clínica · Centro de Atención Psicológica
            Lasallista
          </p>

          <p className="text-[11px] text-texto-secundario/70 pt-1">
            Formatos admitidos: JPG, PNG o WebP (máx. 6 MB). Se ajusta
            automáticamente a 400 × 400 px.
          </p>
        </div>
      </div>

      {/* SECCIÓN 2: FORMULARIO DE PERFIL PROFESIONAL */}
      <form onSubmit={manejarGuardarPerfil} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 items-start">
          <div className="p-4 sm:p-5 rounded-m bg-fondo-superficie border border-borde-suave space-y-4">
            <Titulo tamano="tarjeta" className="text-subtitulo">
              Información profesional
            </Titulo>
            <div>
              <p className="text-caption text-texto-secundario">
                Área asignada
              </p>
              <p>{area}</p>
            </div>
            {/* Texto de Presentación */}
            <div>
              <div className="flex items-center justify-between mb-[6px]">
                <label
                  htmlFor="presentacion"
                  className="block text-caption font-fuerte text-texto-titulo"
                >
                  Presentación profesional (Directorio público)
                </label>
                <span className="text-[11px] text-texto-secundario">
                  {presentacion.length}/600 caracteres
                </span>
              </div>
              <textarea
                id="presentacion"
                rows={4}
                maxLength={600}
                required
                value={presentacion}
                onChange={(e) => setPresentacion(e.target.value)}
                placeholder="Describe brevemente tu enfoque terapéutico, experiencia e intereses clínicos..."
                className="w-full p-3 rounded-m border border-borde-control bg-fondo-superficie text-texto-principal placeholder:text-texto-secundario/50 text-caption focus-visible:outline-2 focus-visible:outline-morado-600 transition-colors resize-none leading-relaxed"
              />
              <p className="text-[11px] text-texto-secundario mt-1">
                Este texto será visible para los consultantes cuando busquen
                terapeutas en el directorio del CAPL.
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-5 rounded-m bg-fondo-superficie border border-borde-suave space-y-4">
            <Titulo tamano="tarjeta" className="text-subtitulo">
              Servicios que atiendes
            </Titulo>
            {/* Servicios que Atiende */}
            <div>
              <label className="block text-caption font-fuerte text-texto-titulo mb-2">
                Servicios clínicos que atiendes
              </label>
              <div className="grid grid-cols-1 gap-2">
                {SERVICIOS_DISPONIBLES.map((servicio) => {
                  const seleccionado = servicioIds.includes(servicio.id);

                  return (
                    <button
                      key={servicio.id}
                      type="button"
                      onClick={() => alternarServicio(servicio.id)}
                      className={`p-3 rounded-m border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        seleccionado
                          ? "bg-accion-suave-fondo/50 border-morado-500 text-texto-titulo"
                          : "bg-fondo-superficie border-borde-suave text-texto-secundario hover:border-borde-control"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 mt-1 rounded-s border flex items-center justify-center shrink-0 ${
                          seleccionado
                            ? "bg-accion-fondo border-accion-fondo text-blanco"
                            : "border-borde-control bg-fondo-superficie"
                        }`}
                      >
                        {seleccionado && <span className="text-[10px]">✓</span>}
                      </div>
                      <span className="text-caption font-medio leading-snug">
                        {servicio.nombre}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interruptor de Visibilidad en Directorio (RF-PSI-07) */}
            <div className="pt-4 border-t border-borde-suave flex items-center justify-between">
              <div>
                <span className="font-fuerte text-caption text-texto-titulo block">
                  Visible en el directorio público
                </span>
                <span className="text-caption text-texto-secundario">
                  Permite que tu perfil y foto aparezcan listados en la página
                  pública de terapeutas del centro.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className={`relative inline-flex h-[30px] w-[52px] shrink-0 cursor-pointer rounded-pildora border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-morado-600 ${
                  visible ? "bg-accion-fondo" : "bg-borde-suave"
                }`}
                role="switch"
                aria-checked={visible}
              >
                <span
                  className={`pointer-events-none inline-block h-[22px] w-[22px] transform rounded-circulo bg-blanco shadow-lg ring-0 transition duration-200 ease-in-out ${
                    visible ? "translate-x-[22px]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Botón Guardar Cambios */}
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <Boton type="submit" disabled={guardandoPerfil}>
            <span>
              {guardandoPerfil ? "Guardando..." : "Guardar cambios de perfil"}
            </span>
          </Boton>
        </div>
      </form>
    </div>
  );
}
