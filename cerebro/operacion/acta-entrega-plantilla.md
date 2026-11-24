---
tags: [capl, operacion, entrega, acta, mantenimiento]
---

# Acta de entrega y puesta en producción — Plataforma CAPL (T-608)

Volver a [[00-Inicio]] · Tarea de referencia: [[E08-Backlog]] (`T-608`).  
Relacionado con: [[01-Contexto]], [[07-Protocolo-de-Equipo]] (§7 "Entornos y despliegue"), [[S08-Mantenimiento]] ("Entregables de mantenimiento") y [[03-Requisitos-No-Funcionales]] (`RNF-MAN-05`, `RNF-MAN-06`).

---

## 1. Información general

| Campo | Detalle |
|---|---|
| **Proyecto** | Plataforma Web y Sistema de Agendamiento del Centro de Atención Psicológica Lasallista (CAPL) |
| **Versión entregada** | `v1.0.0` (Etiqueta oficial en repositorio Git) |
| **Fecha de entrega** | [POR COMPLETAR] |
| **Hora de entrega** | [POR COMPLETAR] |
| **Lugar** | [POR COMPLETAR] (Caldas, Antioquia — Sede Unilasallista) |
| **URL del entorno de producción** | [POR COMPLETAR] |

---

## 2. Partes intervinientes

### 2.1 Por el equipo de desarrollo
- **Responsable de Servidor, Datos y Correos (Rol B):** [POR COMPLETAR - Nombre, Documento, Correo]
- **Responsable de Infraestructura y Despliegue (Rol C):** [POR COMPLETAR - Nombre, Documento, Correo]
- **Responsable de Diseño y Frontend Público (Rol A):** [POR COMPLETAR - Nombre, Documento, Correo]

### 2.2 Por el Centro de Atención Psicológica Lasallista (CAPL) y la Universidad
- **Coordinación general del CAPL:** [POR COMPLETAR - Nombre, Cargo, Documento, Correo]
- **Monitora principal de atención:** [POR COMPLETAR - Nombre, Cargo, Documento, Correo]
- **Segunda persona designada con acceso operativo (S08):** [POR COMPLETAR - Nombre, Cargo, Documento, Correo]
- **Representante / Delegado del área de Tecnología o Sistemas:** [POR COMPLETAR - Nombre, Cargo, Documento, Correo]

---

## 3. Componentes y entregables de software transferidos

El equipo de desarrollo hace entrega formal de los siguientes módulos y componentes verificados:

1. **Sitio web público:**
   - Portada informativa (`/`), catálogo de servicios (`/servicios`), preguntas frecuentes (bloque dentro de Inicio y Servicios), contacto (`/contacto`) y directorio de profesionales (`/equipo`).
   - Guía de emergencias (`/ayuda-inmediata`) con orientador de crisis, líneas de atención directa y tarjetas de códigos de color.
2. **Sistema de agendamiento en línea:**
   - Formulario de solicitud de citas en 5 pasos (`/pedir-cita`) con selección de horario en tiempo real y confirmación con código único.
   - Pantalla de autogestión de citas para el paciente (`/cita/[token]`) para cancelar o reprogramar sin necesidad de crear cuenta.
3. **Panel de administración para monitoras (`/panel/admin/`):**
   - Bandeja de citas con filtros y búsqueda, autorización y rechazo con motivo, reasignación, cancelación y marcado de asistencia.
   - Gestión de psicólogos (creación, invitaciones, desactivación).
   - Bloqueo de fechas institucionales y festivos colombianos automáticos.
   - Cartelera informativa de eventos y módulo de configuración global.
   - Exportación de citas a formato CSV compatible con Microsoft Excel.
4. **Panel de autogestión para psicólogos (`/panel/psicologo/`):**
   - Configuración de perfil y foto, definición de horario semanal de atención y ausencias puntuales.
   - Visualización de citas asignadas e información de contacto exclusiva de sus pacientes.
5. **Servicios de fondo y automatización:**
   - Envío y reintento de las 14 plantillas de correo transaccional (Resend).
   - Tarea programada de liberación de solicitudes vencidas (48 h), recordatorios automáticos (24 h antes) y anonimización de datos.
6. **Documentación técnica y operativa entregada:**
   - Manual rápido de administración y resolución de incidentes ("Qué hacer si...").
   - Bóveda de documentación completa del sistema (`cerebro/`).
   - Bitácora de infraestructura (`infra/BITACORA.md`) e inventario técnico (`infra/README.md`).

---

## 4. Inventario de accesos, cuentas y custodia de secretos

En cumplimiento de las normas de seguridad ([[S01-Seguridad]] y [[07-Protocolo-de-Equipo]]), los secretos y contraseñas maestras no se consignan en este documento en texto plano, sino que se transfieren a través del canal seguro convenido o gestor de claves institucional:

| Recurso / Plataforma | URL / Identificador | Usuario o Cuenta principal | Nivel de permiso | Custodio responsable designado |
|---|---|---|---|---|
| **Repositorio de código (GitHub)** | [POR COMPLETAR] | [POR COMPLETAR] | Propietario / Administrador | [POR COMPLETAR] |
| **Servidor de producción (VPS)** | [POR COMPLETAR] | [POR COMPLETAR] | Acceso SSH / Despliegue | [POR COMPLETAR] |
| **Base de datos (PostgreSQL)** | [POR COMPLETAR] | `capl_app` / `capl_migrador` | Conexión aplicación | [POR COMPLETAR] |
| **Plataforma de correos (Resend)** | `resend.com` | [POR COMPLETAR] | Propietario de la cuenta | [POR COMPLETAR] |
| **Panel Web CAPL (Admin 1)** | [POR COMPLETAR]/ingresar | [POR COMPLETAR - Correo] | Administrador (2FA activo) | [POR COMPLETAR] |
| **Panel Web CAPL (Admin 2)** | [POR COMPLETAR]/ingresar | [POR COMPLETAR - Correo] | Administrador (2FA activo) | [POR COMPLETAR] |
| **Archivo de llaves `.env.production`** | Servidor de producción | — | Lectura exclusiva de la app | [POR COMPLETAR] |

---

## 5. Pruebas de aceptación y conformidad realizadas

Antes de la firma de la presente acta, se completaron a satisfacción las siguientes tareas del hito de entrega:

- [ ] **Configuración de entorno de producción (T-601):** Subdominio institucional activo, certificado de seguridad HTTPS vigente y configuraciones de DNS (SPF, DKIM, DMARC) verificadas.
- [ ] **Base de datos en producción (T-602):** Migraciones ejecutadas, restricciones de no-duplicidad activas y primer administrador operativo con 2FA.
- [ ] **Carga inicial de profesionales (T-603):** Psicólogos reales dados de alta en el sistema con sus horarios de atención configurados y cupos visibles.
- [ ] **Prueba de cita de extremo a extremo en producción (T-604):** Solicitud real enviada desde un teléfono móvil, autorizada por la monitora en el panel, correos recibidos correctamente con archivo `.ics` y posterior cancelación de prueba exitosa.
- [ ] **Capacitación del equipo (T-606):** Sesión completada con las monitoras y los psicólogos en formación, según el plan y guion de capacitación documentado.
- [ ] **Simulacro de respaldo y restauración (T-506 / S08):** Copia de seguridad ejecutada y restauración validada exitosamente.
- [ ] **Entrega de correos validada (T-512):** Matriz de entrega comprobada en cuentas de Gmail, Outlook y correo institucional sin caer en spam.
- [ ] **Aprobación de política de datos (T-511):** Texto legal y términos de tratamiento de datos con visto bueno institucional.

---

## 6. Acuerdos de mantenimiento, garantías y soporte posterior

De acuerdo con lo establecido en [[S08-Mantenimiento]]:

### 6.1 Mantenimiento rutinario a cargo del CAPL
- **Semanal (5 min):** Verificación de ausencia de alertas o correos pendientes en el panel.
- **Mensual (30 min):** Revisión de citas vencidas, confirmación de existencia de copias de seguridad y verificación del consumo del plan de correos.
- **Semestral:** Desactivación de psicólogos salientes, invitación de nuevos psicólogos practicantes, rotación semestral de secretos y verificación telefónica de las líneas de la guía de emergencias.

### 6.2 Alcance del soporte técnico posterior a la entrega
- **Periodo de acompañamiento y garantía básica:** [POR COMPLETAR - Ejemplo: 30 días calendario contados a partir de esta firma].
- **Cobertura:** Corrección de fallos atribuibles al código fuente entregado, desajustes en el flujo de citas o problemas en el envío de correos transaccionales.
- **Exclusiones:** No incluye cambios en el alcance del proyecto, desarrollo de nuevas pantallas o módulos no estipulados en la especificación inicial `v1.0.0`, ni fallas derivadas de caídas generales de los proveedores externos de infraestructura (servidor, caída global de DNS o caída de los servicios de Resend). Todo nuevo requerimiento deberá regirse por el protocolo de cambios [[09-Propuestas-por-Autorizar]].

---

## 7. Directorio de contactos para escalamiento

| Rol | Nombre | Teléfono | Correo institucional |
|---|---|---|---|
| **Soporte técnico principal (Desarrollador)** | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] |
| **Soporte técnico secundario (Desarrollador)** | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] |
| **Contacto operativo CAPL (Monitoría)** | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] |
| **Contacto de infraestructura TI institucional** | [POR COMPLETAR] | [POR COMPLETAR] | [POR COMPLETAR] |

---

## 8. Firmas de conformidad y entrega

En constancia de lo anterior y manifestando la recepción a entera satisfacción del sistema de agendamiento y sus herramientas operativas, firman las partes en la fecha estipulada:

```
Por el Equipo de Desarrollo:


________________________________________
Firma: [POR COMPLETAR]
Nombre: [POR COMPLETAR]
Rol: Desarrollo Servidor e Infraestructura
Documento: [POR COMPLETAR]


________________________________________
Firma: [POR COMPLETAR]
Nombre: [POR COMPLETAR]
Rol: Desarrollo Frontend y Diseño
Documento: [POR COMPLETAR]
```

```
Por el Centro de Atención Psicológica Lasallista (CAPL) / Unilasallista:


________________________________________
Firma: [POR COMPLETAR]
Nombre: [POR COMPLETAR]
Cargo: Coordinación CAPL
Documento: [POR COMPLETAR]


________________________________________
Firma: [POR COMPLETAR]
Nombre: [POR COMPLETAR]
Cargo: Monitora Principal de Operación
Documento: [POR COMPLETAR]


________________________________________
Firma: [POR COMPLETAR]
Nombre: [POR COMPLETAR]
Cargo: Delegado / Representante de Sistemas y TI
Documento: [POR COMPLETAR]
```