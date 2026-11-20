# agentes.md — tablero de coordinación (orquestador: Claude)

Reglas: cada agente toca SOLO los archivos de su fila. No ejecutes comandos (Antigravity). No hagas commit ni push.
Al terminar, cambia tu estado a HECHO y anota abajo, en "Notas", lo que hiciste y lo que dudas. Claude revisa, corre tsc/eslint/pruebas y commitea.
Ya hecho por Claude: `Evento.tipo` (TALLER | CHARLA | ENCUENTRO; contrato `contratos/evento.ts` exporta `TIPOS_EVENTO`, `ROTULO_TIPO`, `TipoEvento`; `EventoDetalle.tipo`) y `cancelarCitaAccion(token, motivo?)` (motivo opcional, máx. 200).
Estilo: Tailwind con tokens del proyecto (`text-p`, `text-h2`, `text-caption`, `text-texto-secundario`, `gap-bloque`…, solo espaciados con nombre), Nunito, escala 32·20·16·13, componentes en `componentes/atomos|moleculas|organismos`, textos en español.

| # | Tarea | Dificultad | Quién | Archivos permitidos | Estado |
|---|-------|-----------|-------|---------------------|--------|
| 1 | Filtro por tipo en /eventos (chips Todos · Taller · Charla · Encuentro) | fácil | Antigravity A | `app/(publico)/eventos/page.tsx`, `componentes/moleculas/filtro-tipo-evento.tsx` (nuevo), `componentes/moleculas/tarjeta-evento.tsx` | HECHO |
| 2 | Campo «tipo» en el formulario admin de eventos | fácil | Antigravity A | `componentes/panel/admin/gestor-eventos.tsx` | HECHO |
| 3 | Motivo opcional al cancelar en «Mi cita» | fácil | Antigravity B | `componentes/publico/mi-cita.tsx` | HECHO |
| 4 | Consulta de cita por código (pie) | media | Claude | `servidor/citas/consulta.ts`, `servidor/acciones.ts`, `componentes/moleculas/consultar-cita.tsx`, correo | HECHO |
| 5 | Fichas de pacientes en el panel del psicólogo | difícil | Agente fichas | `servidor/pacientes/*`, `app/(panel)/panel/psicologo/pacientes/*`, `componentes/panel/pacientes/*` | HECHO |

Descartado por el backlog E08 (decisión pendiente del usuario, NO se construye): inscripción a eventos, ayuda sin conexión, plantillas de Resend desde el código.

## Notas
- Fila 1 (filtro por tipo en /eventos): creado `componentes/moleculas/filtro-tipo-evento.tsx` con chips «Todos · Taller · Charla · Encuentro» como `<Link>` con `aria-current="page"` en el activo. En `app/(publico)/eventos/page.tsx`, `Agenda` lee `searchParams.tipo` de forma asíncrona (`await searchParams`), filtra `eventos` por `e.tipo` antes de separar el destacado, incluye `<FiltroTipoEvento>`, pasa `tipo={ROTULO_TIPO[e.tipo]}` a `TarjetaEvento` y muestra «No hay eventos de este tipo por ahora.» cuando el filtro deja la lista vacía. En `componentes/moleculas/tarjeta-evento.tsx`, agregada la prop opcional `tipo?: string` con texto `text-caption`. Sin JS extra en el cliente para el filtro.
- Fila 2 (campo «tipo» en admin): en `componentes/panel/admin/gestor-eventos.tsx`, agregado `<select>` con etiqueta «Tipo», opciones de `TIPOS_EVENTO` con `ROTULO_TIPO` y valor por defecto `TALLER`. Se precarga `evento.tipo` al editar y se reinicia al crear. Se envía `tipo` dentro del payload a `crearEventoAccion` y `editarEventoAccion`.
- Fila 3 (motivo cancelación): en `componentes/publico/mi-cita.tsx`, agregado en el diálogo de cancelación el `<textarea>` opcional con etiqueta y placeholder «¿Quieres contarnos por qué cancelas? (opcional)», `maxLength={200}`, contador de caracteres `{motivo.length}/200` con clase `text-caption`, y línea «No escribas datos de salud: es opcional». Pasa `motivo` a `cancelarCitaAccion(token, motivo)`, y limpia el estado al terminar o al cerrar/descartar la confirmación sin alterar el resto del flujo.
- Fila 5 (fichas): `servidor/pacientes/pacientes.ts` (+test), acciones `listarPacientesAccion`/`verPacienteAccion`, páginas `psicologo/pacientes` y `[documento]`, componentes `panel/pacientes/*`, enlace «Pacientes» en `barra-lateral.tsx`. Auditoría `PACIENTE_FICHA_VER` (entidad Paciente, entidadId = id de una cita; sin documento). Pruebas BD sin verificar (sin conexión local).
