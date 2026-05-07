# Beta Launch Plan

## Objetivo

Conseguir testers y feedback accionable antes de lanzar HoySi en serio.

## Entregables ya listos

- Landing beta: `launch.html`
- Formulario de postulacion: `POST /api/testers/apply`
- Formulario de feedback: `feedback.html` + `POST /api/feedback`
- Guia de prueba: `tester-guide.html`
- Playbook operativo: `launch-playbook.md`
- Copys de reclutamiento: `beta-outreach-copy.md`

## Plan de ejecucion

### Fase 1: Reclutamiento

- Compartir la landing beta.
- Invitar manualmente a 20 a 40 personas con perfil real.
- Priorizar testers que usen Android y WhatsApp para vender o cobrar.

### Fase 2: Activacion

- Pedir que hagan onboarding.
- Pedir que registren movimientos reales.
- Pedir que visiten `Flujo` e `IA`.

### Fase 3: Aprendizaje

- Recoger feedback por formulario.
- Revisar postulaciones y feedback almacenados en `data/launch-store.json`.
- Detectar patrones repetidos.

### Fase 4: Iteracion

- Corregir primero bugs duros.
- Luego resolver copys, fricciones y orden visual.
- Solo despues pensar en segundo grupo de testers o pre-lanzamiento.

## Lo que sigue despues de esta fase

- segunda ronda beta
- deploy publico real
- dominio
- analytics mas formales
- legal y cobro
