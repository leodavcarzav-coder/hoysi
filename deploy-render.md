# Deploy de HoySi en Render

Actualizado: 29 de abril de 2026

## Lo que se va a desplegar

- `index.html` y la app principal
- `launch.html` como landing de salida
- `privacy.html` y `terms.html`
- `server.js` con:
  - endpoints de IA
  - checkout de Stripe
  - captura de leads
  - `robots.txt`, `sitemap.xml` y `health`

## 1. Sube el proyecto a GitHub

- Crea un repo nuevo.
- Sube todo el proyecto.
- Verifica que esten:
  - `package.json`
  - `server.js`
  - `.env.example`

## 2. Crea el servicio en Render

- Opcion recomendada:
  - usa `render.yaml` desde la raiz del repo
  - Render te va a proponer la configuracion base del servicio y el disco persistente

- Opcion manual:
  - En Render: `New > Web Service`
- Conecta tu repo
- Usa:
  - `Runtime`: Node
  - `Build Command`: `npm install`
  - `Start Command`: `npm start`
  - `Health Check Path`: `/api/health`

## 3. Variables de entorno

- `APP_BASE_URL`
- `CONTACT_EMAIL`
- `BETA_STAGE`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_MONTHLY`
- `STRIPE_PRICE_YEARLY`

## 4. Persistencia

Si vas a usar captura de leads o registro basico de checkout con archivo local:

- Monta un `Persistent Disk`
- Mount path recomendado: `/opt/render/project/src/data`

Si luego quieres algo mas serio:

- mueve leads y compras a Postgres o a un CRM

## 5. Dominio

- Agrega tu dominio en Render
- Configura DNS en tu registrador
- Verifica el dominio en Render
- Luego actualiza `APP_BASE_URL` con tu dominio final

## 6. Stripe

Antes de activar cobro:

- crea un producto `HoySi Pro`
- crea 2 precios:
  - mensual `USD 2.99`
  - anual `USD 24.99`
- copia ambos `price_id`
- pegalos en:
  - `STRIPE_PRICE_MONTHLY`
  - `STRIPE_PRICE_YEARLY`

## 7. OpenAI

Si quieres `Lumi` real:

- agrega `OPENAI_API_KEY`
- deja `OPENAI_MODEL=gpt-5-mini`

Sin eso, la app sigue viva, pero Lumi responde en fallback local.

## 8. URLs que deben responder

- `/`
- `/launch.html`
- `/privacy.html`
- `/terms.html`
- `/api/health`
- `/api/readiness`
- `/api/public-config`
- `/robots.txt`
- `/sitemap.xml`

## 9. Checklist final antes de anunciar

- Confirmar que `/api/readiness` devuelve `publicReady: true`
- Probar landing en celular
- Si vas a cobrar, probar checkout mensual
- Si vas a cobrar, probar checkout anual
- Si vas a cobrar, confirmar que `billing-success.html` devuelve a la app con Pro activo
- Confirmar que waitlist guarda leads
- Confirmar que `APP_BASE_URL` ya no apunta a localhost
- Confirmar privacidad y terminos con abogado
