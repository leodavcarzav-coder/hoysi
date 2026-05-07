# HoySi

App mobile-first de un copiloto financiero para ingresos inestables.

## Que ya resuelve

- Home con cifra central: `Hoy si puedes usar`
- Onboarding real para arrancar desde cero o cargar demo
- Flujo de 14 dias con escenarios de caja
- Pagos protegidos con reserva automatica segun cercania
- Cobros pendientes con recordatorio por WhatsApp
- Ahorros y metas simples con progreso visible
- Agente IA contextual con tips accionables
- Graficas semanales, mensuales y anuales con rango configurable
- Personalizacion de saludo, animaciones y vibracion
- Plan `HoySi Pro` con prueba gratis de 7 dias
- Bolsillos separados para `Casa`, `Negocio` y `Encargos y familia`
- Historial con filtros y eliminacion
- Exportacion e importacion de respaldo JSON
- Persistencia local con `localStorage`
- Optimizacion mobile-first para Android y sesiones cortas

## Como abrirlo

```powershell
C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe server.js
```

O con `npm`:

```powershell
npm start
```

## Produccion

- Archivo de ejemplo de entorno: `.env.example`
- Deploy base en Render: `deploy-render.md`
- Blueprint listo para Render: `render.yaml`
- Checklist de salida beta: `beta-go-live-checklist.md`
- La landing publica queda en `/launch.html`
- El estado de preparacion publica queda visible en `/api/readiness`
- El checkout real queda disponible cuando configuras:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PRICE_MONTHLY`
  - `STRIPE_PRICE_YEARLY`

## Beta oficial

- Para abrir la ronda de testers, configura `BETA_STAGE=open`
- Si quieres pausar postulaciones sin bajar la app, usa `BETA_STAGE=paused`
- La landing de testers vive en `/launch.html`
- La guia de prueba vive en `/tester-guide.html`
- El formulario guarda leads y feedback en `data/launch-store.json`

## Lumi con IA real

Si quieres que `Lumi` responda con una IA real y no solo con fallback local, exporta una API key antes de levantar el servidor:

```powershell
$env:OPENAI_API_KEY="tu_api_key"
$env:OPENAI_MODEL="gpt-5-mini"
C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe server.js
```

Sin esa variable, la app sigue funcionando y `Lumi` responde con fallback local.

Luego entra a:

`http://127.0.0.1:4173`

Si quieres verlo en tu celular dentro de la misma red Wi-Fi, usa la URL local que te imprime el servidor.

## Salida comercial

- Landing de lanzamiento: `http://127.0.0.1:4173/launch.html`
- Politica de privacidad: `http://127.0.0.1:4173/privacy.html`
- Terminos de uso: `http://127.0.0.1:4173/terms.html`
- Exito de checkout: `http://127.0.0.1:4173/billing-success.html`

## Archivos de lanzamiento

- `launch.html` y `launch.css`: pagina de venta lista para demo y captacion
- `launch.js`: CTA de cobro y waitlist
- `launch-playbook.md`: mensaje, oferta, hooks, canales y KPIs
- `legal-checklist.md`: base operativa para salir sin improvisar
- `deploy-render.md`: paso a paso para publicarla

## URLs utiles

- Demo lista para mostrar: `http://127.0.0.1:4173/?demo=1`
- Estado limpio para onboarding: `http://127.0.0.1:4173/?fresh=1`
- Reparacion de cache si algo se ve roto: `http://127.0.0.1:4173/repair.html`
- Reparacion con reinicio total de datos: `http://127.0.0.1:4173/?repair=1&reset=1`

## Nota

Esta version sigue siendo frontend-first: no usa backend ni autenticacion real todavia; todo se guarda en el navegador.
