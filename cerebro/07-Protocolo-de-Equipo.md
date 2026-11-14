---
tags: [capl, protocolo]
---

# 07 · Protocolo de equipo

Volver a [[00-Inicio]]. Reglas mínimas para **organizar, entregar y unificar** sin fricción.

## 1. Ramas y Equipo (GitHub Flow)

- `main`: **siempre funcional**, protegida. Solo recibe cambios mediante PR terminados.
- **Ramas secundarias por integrante:**
  - `dev/sebas`: Lógica central, diseño, contratos, BD, auth, Resend.
  - `dev/brand`: Frontend paneles (admin, psicólogo, login, 2FA, eventos).
  - `dev/cesar`: Frontend público (inicio, servicios, emergencias, formulario cita).
- De cada rama personal se pueden sacar ramas cortas de tarea puntual (`feat/ID-tarea`). Vida máxima: **1 día (24 h)**.

## 2. Protocolo de Commits y Versionado `v X.Y.Z` (De Derecha a Izquierda)

Para identificar con precisión el estado de cada cambio, los commits llevan una etiqueta de versión que avanza **de derecha a izquierda**:

```
v [MERGE_MAIN] . [PUSH_GIT] . [COMMIT_LOCAL]
         X     .      Y     .       Z
     (Izquierda)   (Centro)     (Derecha)
```

| Posición | Representa | Cuándo se incrementa | Ejemplo |
|---|---|---|---|
| **Derecha (Z)** | **Commit Local** | Cada commit guardado en tu máquina local en tu rama personal | `v0.0.1`, `v0.0.2`... |
| **Centro (Y)** | **Push a Git** | Cada vez que envías cambios al repositorio remoto (`git push origin ...`) para abrir un PR | `v0.1.0`, `v0.2.0`... (reinicia Z a 0) |
| **Izquierda (X)** | **Merge en Main** | Cada vez que un PR se aprueba, se une a `main` y queda terminado como hito | `v1.0.0`, `v2.0.0`... (reinicia Y y Z a 0) |

### Formato del mensaje de commit:
```
vX.Y.Z tipo(ID): qué cambia
```

**Ejemplos prácticos:**
- **Local (Sebas trabajando en su PC):**  
  `git commit -m "v0.0.1 feat(RF-CIT-03): calculo de cupos base"`
- **Push remoto (Brand sube sus cambios para PR):**  
  `git commit -m "v0.1.0 feat(RF-ADM-03): bandeja de citas lista para revision"`  
  `git push origin dev/brand`
- **Merge en main (Unión final aprobada):**  
  `v1.0.0 feat(Fase-1): integracion de sitio publico y emergencias en main`

Tipos permitidos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

## 3. Pull Request

Antes de abrirlo:

```bash
git fetch origin
```

```bash
git rebase origin/main
```

Plantilla del PR:

```markdown
## Qué hace
(1–2 frases) — Requisito: RF-XXX-00

## Cómo probarlo
1. …

## Capturas
(si toca interfaz)

## Lista
- [ ] Cumple el requisito tal como está en el cerebro
- [ ] Lint, tipos y pruebas pasan
- [ ] Probado en móvil (si toca interfaz)
- [ ] Sin secretos ni datos personales reales
- [ ] Si cambié `contratos/` o `prisma/`, avisé al equipo
```

Reglas:

- **1 aprobación** y CI en verde. Para agilizar el MVP, el dueño de la carpeta puede auto-aprobar si el PR es estrictamente dentro de su carpeta asignada y pasa CI.
- Revisión de PR cruzados en menos de **4 horas** (no dejar PRs esperando de un día para otro).
- PR pequeños: idealmente menos de 250 líneas.
- Se une con *Squash and merge*; la rama se borra de inmediato.

## 4. Definición de "terminado"

Un requisito está terminado cuando:

1. Hace lo que dice su fila en [[02-Requisitos-Funcionales]].
2. Está unido a `main` y **desplegado en staging**.
3. Otra persona lo probó en staging.
4. Su casilla está marcada en [[08-Ruta-de-Desarrollo]].

"Funciona en mi computador" no cuenta.

## 5. Integración (cómo se unifica)

- **Dueños por carpeta** ([[05-Arquitectura]]): se edita lo propio; lo ajeno se pide o se propone por PR al dueño.
- **Contrato primero:** antes de empezar algo que cruza dos roles, se escribe el esquema en `contratos/` y se une en un PR pequeño. Después cada uno trabaja por su lado.
- **Base de datos:** solo B crea migraciones. Nunca se edita una migración ya unida; se crea otra.
- **Integración continua real:** cada unión a `main` se despliega sola en staging. Los problemas de integración aparecen el mismo día, no al final.
- **Sin ramas largas ni "rama de integración".** Si algo no está listo para verse, se oculta tras una variable de entorno, pero se une.

## 6. Diseño → código (Figma)

Las normas completas están en [[N00-Normas-Inicio]]; los nombres compartidos, en [[N10-Tokens-y-Figma]]; las convenciones de código, en [[N11-Normas-Tecnicas]].

1. A marca el marco en Figma como **"Listo para desarrollo"**. Solo eso se implementa.
2. Los colores, tipografías y espaciados salen de las **variables de Figma** a la configuración de estilos. No se escriben valores sueltos en las pantallas.
3. Todo componente nuevo nace en `componentes/ui/` y se reutiliza.
4. Si implementando se descubre que algo no cabe o falta un estado (vacío, error, cargando), se comenta **en Figma** y lo resuelve A.
5. Cada pantalla se diseña con sus estados: normal, vacío, cargando, error, y en móvil.

## 7. Entornos y despliegue

| Acción | Quién | Cuándo |
|--------|-------|--------|
| Despliegue a staging | Automático | En cada unión a `main` |
| Despliegue a producción | C | Al cierre de fase, con visto bueno de los tres |
| Copia de seguridad antes de desplegar a producción | C | Siempre |
| Vuelta atrás | C | Volver a desplegar la etiqueta anterior |

Versiones: una etiqueta por fase cerrada (`v0.1` … `v1.0`).

## 8. Secretos y datos

- Las claves (Resend, base de datos, sesión) viven **solo** en el servidor y en el `.env` local de cada uno. Se comparten por un canal privado, nunca por el repositorio ni por chat grupal.
- `.env.example` lista las variables **sin valores**.
- **Nunca** datos de pacientes reales en local, staging, capturas o issues.
- En staging los correos se redirigen al equipo (RNF-COR-04).

## 9. Comunicación ágil (Sprint MVP)

| Qué | Dónde | Frecuencia |
|-----|-------|------------|
| Tareas y tablero | Tablero de GitHub Projects (Por hacer / En curso / En revisión / Hecho) | Tiempo real |
| **Sincronización diaria (Daily)** | Chat de WhatsApp / Discord: (1) Qué terminé, (2) Qué hago hoy, (3) Qué me bloquea | **Cada mañana (9:00 a. m.)** |
| Avisos de PR listos | Enlace del PR enviado al chat grupal | Al abrir el PR |
| Bloqueos técnicos | Chat grupal con mención directa | **Inmediato (no esperar más de 1 hora)** |
| Decisiones de arquitectura | Se registran en este cerebro | Al momento |

> 🚨 **Regla de desbloqueo:** Si alguien está bloqueado por un contrato de datos, una variable de entorno o una maqueta de Figma, avisa de inmediato al chat grupal. La persona que lo desbloquea tiene prioridad de respuesta en menos de 1 hora.

## 10. Cambios de alcance

1. La idea se anota en [[09-Propuestas-por-Autorizar]].
2. Se estima esfuerzo y se dice qué fase afecta.
3. Quien autoriza marca ✅ o ❌.
4. Solo si es ✅ pasa a [[02-Requisitos-Funcionales]] con su ID y entra a una fase.
