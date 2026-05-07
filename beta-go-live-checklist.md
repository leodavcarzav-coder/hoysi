# HoySi Beta Go-Live Checklist

## Antes de compartir el link

- Subir el repo con `render.yaml`, `server.js` y `.env.example`
- Desplegar en Render y montar el disco persistente
- Definir `APP_BASE_URL` con la URL publica final
- Confirmar `BETA_STAGE=open`
- Revisar `CONTACT_EMAIL`
- Verificar que `https://tu-url/api/readiness` responda con `publicReady: true`

## Lo minimo para una beta oficial

- `launch.html` responde bien en celular
- `privacy.html` y `terms.html` estan visibles
- El formulario de postulacion guarda en `data/launch-store.json`
- `feedback.html` guarda feedback sin errores
- `tester-guide.html` explica claramente que probar
- La app abre en `/` y la demo en `/?demo=1`

## Si todavia no vas a cobrar

- Dejar Stripe sin configurar esta bien
- Confirmar que la landing siga diciendo `Sin cobro por ahora`
- Usar la beta para aprender, no para vender

## Primer grupo recomendado

- 20 a 40 personas invitadas manualmente
- Priorizar Android, WhatsApp y gente con ingresos variables
- Pedir 3 a 5 dias de uso real
- Pedir minimo 1 feedback concreto por tester

## Primeras 48 horas

- Revisar postulaciones en `data/launch-store.json`
- Responder rapido a testers valiosos
- Clasificar feedback en `bug`, `confusion`, `copy` o `feature request`
- Pausar postulaciones con `BETA_STAGE=paused` si entra mas gente de la que puedes acompanar
