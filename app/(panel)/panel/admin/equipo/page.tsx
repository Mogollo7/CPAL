import { Equipo } from "@/componentes/panel/equipo";
import { paginaProtegida } from "@/servidor/cuentas/sesionActual";
import {
  correoSuperusuario,
  exigirSuperusuario,
  permiteCuentasDePrueba,
} from "@/servidor/cuentas/superusuario";
import { idsCuentasDePrueba } from "@/servidor/psicologos/cuentasDePrueba";
import {
  listarAdministradores,
  listarPsicologos,
} from "@/servidor/psicologos/psicologos";
import type { UsuarioResumen } from "@/contratos/psicologo";

export const instant = false;

export default async function PaginaEquipo() {
  const sesion = await paginaProtegida("ADMIN");
  const superusuario = (await exigirSuperusuario(sesion)).ok;
  const protegido = correoSuperusuario();
  const adminHabilitado = superusuario;
  const limpiezaHabilitada = superusuario && permiteCuentasDePrueba();
  const [admins, psis, ids] = await Promise.all([
    adminHabilitado ? listarAdministradores(sesion) : null,
    listarPsicologos(sesion),
    limpiezaHabilitada ? idsCuentasDePrueba() : [],
  ]);
  const pruebas = new Set(ids);
  const describir = (u: UsuarioResumen) => ({
    ...u,
    prueba: pruebas.has(u.id),
    protegido: u.correo === protegido,
  });
  return (
    <>
      <div>
        <h1 className="text-h1 font-fuerte leading-titulo text-texto-titulo">
          Gestión del equipo
        </h1>
        <p className="mt-3 text-texto-secundario">
          Administra las invitaciones y el acceso al panel del CAPL.
        </p>
      </div>
      <Equipo
        administradores={admins?.ok ? admins.datos.map(describir) : []}
        psicologos={psis.ok ? psis.datos.map(describir) : []}
        adminHabilitado={adminHabilitado}
        limpiezaHabilitada={limpiezaHabilitada}
      />
    </>
  );
}
