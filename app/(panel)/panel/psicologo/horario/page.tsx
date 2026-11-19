import { obtenerMiPerfilAccion } from "@/servidor/acciones";
import { GestorHorario } from "@/componentes/panel/psicologo/gestor-horario";
import type { BloqueoGuardado } from "@/contratos/bloqueo";

export default async function PaginaPsicologoHorario() {
  let horario = [
    { diaSemana: 1, inicioMin: 480, finMin: 720 }, // Lunes 8:00 - 12:00
    { diaSemana: 3, inicioMin: 840, finMin: 1080 }, // Miércoles 14:00 - 18:00
    { diaSemana: 5, inicioMin: 540, finMin: 780 }, // Viernes 9:00 - 13:00
  ];
  let bloqueos: BloqueoGuardado[] = [];

  try {
    const res = await obtenerMiPerfilAccion();
    if (res.ok) {
      horario = res.datos.horario.bloques;
      bloqueos = res.datos.bloqueos;
    }
  } catch {
    // Si no hay DB, usamos los valores de simulación por defecto
  }

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h2 className="text-h1 font-weight-fuerte text-texto-titulo tracking-tight">
          Mi Horario y Disponibilidad
        </h2>
        <p className="text-p text-texto-secundario mt-1 text-sm">
          Los cupos de atención que ven los consultantes en el sitio web se
          calculan automáticamente a partir de estas franjas.
        </p>
      </div>

      <GestorHorario horarioInicial={horario} bloqueosIniciales={bloqueos} />
    </div>
  );
}
