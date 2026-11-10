# GARAGE 36 — Proyecto de Programación II

Aplicación web de demostración para administrar un estacionamiento ficticio.

## Tecnologías
- HTML5
- CSS3
- JavaScript puro
- localStorage para conservar los datos en el navegador
- Vercel para publicar el sitio

No utiliza MySQL, servidor, API ni frameworks.

## Cómo ejecutar
1. Extrae la carpeta.
2. Abre `index.html` en el navegador.
3. Inicia sesión con:
   - Usuario: `admin`
   - Contraseña: `2026`

También puedes abrir la carpeta en Visual Studio Code y usar la extensión Live Server.

## Cómo publicar en Vercel
1. Sube esta carpeta a un repositorio de GitHub.
2. Entra a https://vercel.com e importa el repositorio.
3. Deja Framework Preset en **Other**.
4. No configures Build Command ni Output Directory.
5. Pulsa Deploy.

El archivo `vercel.json` configura el sitio como página estática.

## Funciones
- Resumen con ocupación e ingresos.
- Mapa de 40 espacios en tres zonas.
- Registro, edición, búsqueda y eliminación de clientes.
- Registro, edición, búsqueda y eliminación de vehículos.
- Registro de entradas y asignación de espacios.
- Cálculo automático de horas y cobro por hora iniciada.
- Registro de pagos y métodos de pago.
- Comprobantes imprimibles.
- Administración de tarifas.
- Datos de demostración y opción para restaurarlos.

## Importante para la exposición
Los datos se guardan en `localStorage`, es decir, en el navegador donde se utiliza el sistema. No se comparten entre computadoras y no es una base de datos real. Esta versión está pensada para una demostración académica.

El comprobante es únicamente un recibo de demostración, no una factura fiscal.
