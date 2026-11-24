// Informe diario del estado del servidor (correo `estado-servidor`, destinatario: correo de administración).
// Solo cifras: nada de personas, correos ni motivos (S06). Las fechas viajan como texto ISO porque pasan por la cola (JSON).
export type InformeEstado = {
  desde: string; // inicio de la ventana observada (ISO)
  hasta: string; // fin (ISO)
  disponibilidad: number | null; // 0–100; null = todavía no hay sondeos
  minutosSinServicio: number;
  latenciaP95Ms: number | null;
  ultimoSondeo: string | null; // ISO
  incidente: { desde: string; hasta: string } | null; // la interrupción más larga (2 min o más)
  correos: {
    enviados: number;
    entregados: number;
    rebotados: number;
    pendientes: number;
    errores: number;
  };
  seguridad: {
    ingresosCorrectos: number;
    intentosFallidos: number;
    cuentasBloqueadas: number;
    accesosEmergencia: number;
    administradoresCreados: number;
  };
};
