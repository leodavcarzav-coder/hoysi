# Official Launch Roadmap

Actualizado: 6 de mayo de 2026

## Objetivo

Volver la beta compartible por internet con dominio propio, reclutar testers fuera de tu red local y dejar una ruta limpia hacia Google Play y App Store.

## Mi recomendacion corta

Si yo decidiera hoy por velocidad y claridad:

1. Comprar un dominio corto.
2. Desplegar la beta en un hosting publico.
3. Compartir esa URL a testers y amigos.
4. Validar feedback.
5. Solo despues empaquetar para tiendas.

## Dominio recomendado

### Mejor opcion de marca

- `hoysi.app`

Por que:
- se siente producto
- encaja con la categoria
- obliga a HTTPS, que igual vamos a necesitar
- es facil de recordar

### Buenas alternativas

- `hoysiapp.com`
- `usehoysi.com`
- `gethoysi.com`
- `hoysi.lat`

Nota:
- Que un dominio no resuelva en DNS no garantiza disponibilidad de compra, pero es una buena senal inicial.
- Al 6 de mayo de 2026, `hoysi.com` ya resuelve y no lo tomaria como opcion principal.

## Donde comprarlo

### Opcion 1: Cloudflare Registrar

La mas limpia si quieres:
- precio de renovacion sin markup
- DNS bueno
- SSL y capa tecnica simple

La elegiria si:
- quieres comprar dominio y dejar DNS serio desde el inicio

### Opcion 2: Railway Domains

La mas comoda si quieres:
- comprar dominio y conectarlo al deploy desde el mismo lugar
- menos pasos manuales

La elegiria si:
- quieres ir rapido y no quieres tocar mucho DNS por tu cuenta

### Opcion 3: Namecheap

La mas familiar para mucha gente:
- compra facil
- panel amigable
- buen punto de partida

La elegiria si:
- quieres algo conocido y simple para comprar hoy mismo

## Hosting recomendado

### Para salir ya con testers

- `Render`
- `Railway`

### Mi pick

- `Render` si quieres algo simple, estable y claro para una app Node como esta
- `Railway` si quieres una experiencia mas rapida y centralizada, sobre todo si terminas comprando dominio ahi mismo

## Ruta oficial que seguiria

### Fase 1: esta semana

- comprar dominio
- desplegar app y landing beta en internet
- apuntar dominio
- compartir a testers y amigos

### Fase 2: siguiente ronda

- corregir bugs y fricciones
- mejorar copy
- medir activacion y feedback

### Fase 3: tiendas

- Google Play primero
- App Store despues

## Google Play

Lo mas realista con el estado actual de la app:

- usar la web app como base
- empaquetarla como app Android con Trusted Web Activity o con un shell nativo ligero

Google Play es la salida mas natural primero porque la app ya esta pensada Android-first.

## App Store

No intentaria subir la web actual casi tal cual.

Primero haria una capa mas app-like:
- shell nativo
- mejor manejo offline
- mejor integracion movil
- polish extra

Apple es mas estricta con apps que se sienten como un sitio envuelto.

## Costos base que debes considerar

- Dominio: depende del TLD y registrador
- Hosting: bajo para una beta
- Google Play Console: pago unico
- Apple Developer Program: pago anual

## Decision ejecutiva

Si quieres verte oficial ya y compartirlo fuera de tu red:

- compra `hoysi.app`
- despliega en `Render` o `Railway`
- comparte esa URL esta misma semana
- deja App Store para despues de una ronda beta seria
- apunta a Google Play primero
