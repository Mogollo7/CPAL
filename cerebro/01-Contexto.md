---
tags: [capl, contexto]
---

# 01 · Contexto

Volver a [[00-Inicio]].

## El CAPL (tomado del sitio previo)

- Centro de Atención Psicológica Lasallista, Unilasallista Corporación Universitaria, "casa amarilla", Caldas (Antioquia). Carrera 51 # 118 Sur – 57.
- Habilitado por MinSalud (n.º DHS803177, atención desde 29-jul-2019).
- **Servicios gratuitos**, con **cita previa**. No es un servicio de urgencias.
- Atienden **psicólogos en formación** de Unilasallista y neuropsicólogos del CES, supervisados por docentes.
- Hoy las citas las agendan **las monitoras** por WhatsApp (310 209 6266) o correo (capl@unilasallista.edu.co).
- Horario: solo entre semana, sin festivos. Psicología: lun, mar, vie mañana + mar tarde. Neuropsicología: mié, jue, vie tarde + jue parte de la mañana.
- Redes: Instagram `@cap_unilasallista`, `@unilasallista`; sitio oficial unilasallista.edu.co/centro-de-atencion-psicologica.

### Servicios publicados

1. Atención psicológica individual
2. Evaluación neuropsicológica
3. Orientación vocacional y proyecto de vida
4. Certificación de mascotas de apoyo emocional
5. Pruebas psicométricas
6. Charlas empresariales y educativas

> ⚠️ Todo este contenido viene del intento anterior y debe **validarlo el CAPL** antes de publicarse (ver [[10-Preguntas-Abiertas]]).

## El intento anterior

Sitio informativo (Inicio / Servicios / Contacto) cuyo agendamiento dependía de **WhatsApp**. Automatizar WhatsApp resultó complejo, así que se decidió **reestructurar**: el agendamiento pasa a un **formulario propio + correo (Resend)** y WhatsApp queda solo como enlace de contacto.

Referencia: `https://savvyskink285.ecogpt.site/capl-centro-de-atenci-n-psicol-gica-lasallista-d04544da/`

## Objetivos del nuevo sistema

1. **Agendar** cita en línea viendo la disponibilidad real de cada psicólogo.
2. **Confirmar por correo** cada paso (solicitud → autorización).
3. **Administrar**: crear psicólogos, autorizar citas, gestionar eventos.
4. **Visibilizar** los servicios y cómo funciona el centro.
5. **Orientar en emergencias**: ayudar a identificar el tipo de situación y mostrar a quién llamar.
6. **Difundir eventos** y permitir inscribirse.

## Actores

| Actor | Quién es | Qué hace |
|-------|----------|----------|
| Visitante / paciente | Cualquier persona, sin cuenta | Se informa, pide cita, se inscribe a eventos, consulta líneas de emergencia |
| Psicólogo en formación | Estudiante con correo institucional | Edita su perfil y su horario, ve sus citas |
| Administrador | Monitoras / coordinación CAPL | Crea psicólogos, autoriza citas, gestiona eventos y configuración |
| Sistema | Tareas automáticas | Envía correos, libera cupos, recordatorios |

## Equipo y herramientas

- 3 personas. Reparto en [[06-Division-del-Trabajo]].
- GitHub (flujo en [[07-Protocolo-de-Equipo]]), Figma (diseño → código), Resend (correo), servidor y dominio propios para pruebas.

## Decisiones ya tomadas

| # | Decisión | Motivo |
|---|----------|--------|
| D-01 | Correo (Resend) en vez de WhatsApp para el flujo de citas | WhatsApp automatizado resultó complejo |
| D-02 | El paciente **no crea cuenta** | Menos fricción; solo se necesita correo para confirmar |
| D-03 | Autorización manual por defecto, con opción de auto-autorizar | Pedido expreso; hoy las monitoras validan cada cita |
| D-04 | Los psicólogos los crea el administrador con correo institucional | No hay registro público de psicólogos |
| D-05 | El sistema **no guarda historia clínica** | Reduce drásticamente el riesgo legal — ver [[04-Restricciones-y-Riesgos]] |
| D-06 | El psicólogo crea su contraseña con un **enlace válido 24–48 h**, reabrible, que se deshabilita al crearla | Sin contraseña "default"; si pierde la sesión a mitad no queda bloqueado |
| D-07 | Arquitectura **resiliente a caídas y sin tareas manuales** | El mantenimiento tras la entrega será mínimo |
| D-08 | Stack de [[05-Arquitectura]] confirmado | — |
| D-09 | Tamaños por **escala de proporción áurea**, sin controles dinámicos de tamaño | Evitar desbordes; un solo sistema de medidas |
| D-10 | Dominio propio de pruebas ahora; **subdominio oficial** al lanzar | Aval del CAPL y la universidad |
| D-11 | Lo que el CAPL aún no define se construye como **valor configurable** | No reprogramar cuando respondan — [[11-Cuestionario-CAPL]] |
| D-14 | La paleta usa **los colores oficiales de Unilasallista sin modificar** (`#FFCB05`, `#1B2C65`, `#4850C0`, `#0B1037`, `#16BECF`); solo se añaden tonos derivados | Coherencia con la universidad — [[N02-Color]] |
| D-13 | Identidad: **morado y amarillo** principales, aguamarina de apoyo; curvas, ilustración plana sin negro; labs.google solo como referencia de carácter | Que la persona se sienta segura — [[N00-Normas-Inicio]] |
| D-12 | Sin cuentas de paciente, notas clínicas, chat, autodiagnóstico, app nativa ni pagos | Lista "No recomendadas" de [[09-Propuestas-por-Autorizar]], confirmada |
