<<<<<<< HEAD
# Países

Aplicación en Angular 21 que lista los países del mundo, permite buscarlos, ver sus detalles y consultar su clima.

- Datos de países: [REST Countries v5](https://restcountries.com/docs/countries)
- Datos del clima: [Open-Meteo](https://open-meteo.com/) (no necesita clave)

## Cómo ejecutarlo

```bash
npm install
ng serve
```

Abre `http://localhost:4200/`. Otros comandos: `ng build` (compila) y `ng test` (pruebas unitarias).

## Rutas

| URL | Qué muestra |
|---|---|
| `/` | Buscador + lista paginada de países |
| `/clima/{nombrepais}` | Clima del país, ej. `/clima/Germany` |
| `/detalle/{nombrepais}` | Detalles del país, ej. `/detalle/Germany` |
| cualquier otra | Redirige a `/` |

## Cómo se conecta todo

```
app.routes
├── "" → Layout ─┬─ SearchComponent   (buscador)
│                └─ Paises            (lista + paginación)
│                     ├─ PaisCard × 9   (una card por país)
│                     └─ Paginador      (botones de página)
├── clima/:nombre   → ClimaComponent  ── ClimaInfo   (muestra el clima)
└── detalle/:nombre → DetalleComponent ─ PaisInfo    (muestra los detalles)

Servicios (compartidos por todos): PaisApi (países) y ClimaApi (clima)
```

El patrón es el mismo en las tres pantallas: un componente "padre" carga los datos y decide a dónde navegar, y un componente "hijo" solo dibuja lo que recibe con `@Input` y avisa de los clics con `@Output`.

---

## Servicios

### `pais-api` — [src/app/services/pais-api.ts](src/app/services/pais-api.ts)

Todo lo relacionado con la lista de países. Es un servicio único (`providedIn: 'root'`), así que todos los componentes comparten los mismos datos.

- **`paisesSignal`**: signal con la lista completa de países ya cargada.
- **`terminoBusqueda`**: signal con el texto que el usuario escribió en el buscador. Lo escribe `SearchComponent` y lo lee `Paises`.
- **`cargarPaises()`**: pide los países a la API. La API entrega máximo 100 por petición, así que hace 3 peticiones (offset 0, 100 y 200) en paralelo con `forkJoin` y junta los resultados. Si una petición falla, se sustituye por una lista vacía para no romper las demás. Guarda el resultado en `paisesSignal` y no vuelve a pedirlo si ya lo tiene (`shareReplay` evita peticiones duplicadas si varios componentes lo llaman a la vez). Por eso el detalle y el clima abren al instante cuando vienes de la lista.
- **`obtenerNombrePais(pais)`**: devuelve el nombre en inglés (`names.common`).
- **`normalizarTexto(texto)`**: pasa a minúsculas y quita acentos, para que buscar "Mexico" encuentre "México".
- **`buscarPaises(texto)`**: filtra la lista en tres pasos y se queda con el primero que dé resultados:
  1. países cuyo nombre común **empieza** con el texto (ordenados alfabéticamente);
  2. países cuyo nombre oficial empieza con el texto;
  3. países cuyo nombre común **contiene** el texto.

  Con el texto vacío devuelve todos.
- **`buscarPorNombre(nombre)`**: busca un país por nombre exacto (español o inglés, sin importar acentos ni mayúsculas). Lo usan las pantallas de clima y detalle para encontrar el país que viene en la URL.
- **`setTerminoBusqueda(texto)`**: actualiza `terminoBusqueda`.

> La clave de la API (`Bearer rc_live_...`) está escrita directamente en este archivo, por lo que es visible desde el navegador.

### `clima-api` — [src/app/services/clima-api.ts](src/app/services/clima-api.ts)

Todo lo relacionado con el clima. Define las interfaces `Clima`, `ClimaActual`, `ClimaDia` y `Coordenadas`.

- **`obtenerClima(lat, lon)`**: llama a `https://api.open-meteo.com/v1/forecast` y devuelve el clima actual (temperatura, sensación térmica, humedad, precipitación, viento, código del clima) y el pronóstico de 7 días (máxima, mínima, precipitación, código). Open-Meteo responde con listas paralelas, y este método las convierte a un arreglo de objetos por día.
- **`obtenerCoordenadas(pais)`**: Open-Meteo necesita latitud y longitud, así que primero las busca en los campos del país (`latlng`, `coordinates`...). Si no las encuentra, busca la capital en el geocoding de Open-Meteo (`geocoding-api.open-meteo.com`), usando el código ISO del país para elegir el resultado correcto. Devuelve `null` si no encuentra nada.
- **`describirCodigo(codigo)`**: Open-Meteo devuelve un número (código WMO) para el estado del tiempo. Este método lo traduce a un texto en inglés y un emoji (0 → "Clear sky ☀️", 61-67 → "Rain 🌧️", 95+ → "Thunderstorm ⛈️"...).

---

## Rutas

### `app.routes` — [src/app/app.routes.ts](src/app/app.routes.ts)

Define qué componente se muestra en cada URL:

- `''` carga `Layout` (que contiene el buscador y un `<router-outlet>`), y dentro de él la ruta hija `''` carga `Paises`. Así el buscador solo aparece en la pantalla principal.
- `clima/:nombre` carga `ClimaComponent`. Está **fuera** del `Layout`, por eso no muestra el buscador. `:nombre` es un parámetro de la URL.
- `detalle/:nombre` carga `DetalleComponent`, también sin buscador.
- `**` redirige a `''` cualquier URL que no exista.

---

## Pantalla principal

### `paises` — [src/app/paises/](src/app/paises/)

Es la lista de países. No dibuja las cards ni los botones de página, delega en `PaisCard` y `Paginador`.

- Al iniciar llama a `cargarPaises()` y muestra el gif de carga (Mario) hasta que terminan las peticiones, o un mensaje de error si fallan.
- **`paisesFiltrados`** (computed): aplica `buscarPaises` con el texto del buscador y ordena el resultado alfabéticamente por nombre.
- **Paginación**: `paisesPorPagina = 9`. `paginaActual` es un signal; `totalPaginas` y `paisesPagina` (los 9 países de la página actual) se calculan a partir de él. Un `effect` regresa a la página 1 cada vez que cambia la búsqueda.
- **`irAPagina(n)`**: cambia de página (si es válida) y sube al inicio de la pantalla.
- **`onVerClima(pais)`** y **`onVerDetalles(pais)`**: reciben el evento de la card y navegan a `/clima/{nombre}` o `/detalle/{nombre}` con el `Router`.
- Si la búsqueda no da resultados, muestra un mensaje "No se encontraron países".

### `search-component` — [src/app/search-component/](src/app/search-component/)

El buscador que aparece arriba, dentro de `Layout`.

- Cada vez que se escribe (`onInput`) guarda el texto en `PaisApi.terminoBusqueda` y `Paises` se actualiza solo, porque lee ese mismo signal.
- Muestra una lupa y una **X** para borrar el texto (`limpiarBusqueda`).
- Si escribes algo que no coincide con ningún país, muestra un aviso "No se encontraron países que comiencen con...".
- Un `@HostListener('document:click')` cierra ese aviso cuando haces clic fuera del buscador.

### `pais-card`
 — [src/app/pais-card/](src/app/pais-card/)

Una card de un país en la lista: bandera, nombre, capital, región, población y descripción corta. Usa `@Input` y `@Output`:

| | Nombre | Para qué |
|---|---|---|
| `@Input` | `pais` | El país que dibuja (obligatorio) |
| `@Output` | `verClima` | Emite el país cuando pulsas "ver clima" |
| `@Output` | `verDetalles` | Emite el país cuando pulsas "ver detalles" |

La card no navega por sí misma: solo avisa, y `Paises` decide qué hacer.

### `paginador` — [src/app/paginador/](src/app/paginador/)

Los botones "Anterior", los números de página y "Siguiente".

| | Nombre | Para qué |
|---|---|---|
| `@Input` | `paginaActual` | Página en la que estás |
| `@Input` | `totalPaginas` | Cuántas páginas hay |
| `@Output` | `paginaChange` | Emite el número de página que el usuario eligió |

Muestra la primera página, la última y las cercanas a la actual, con "…" en medio. No se muestra si solo hay una página.

---

## Pantalla de clima

### `clima-component` — [src/app/clima-component/](src/app/clima-component/)

Es la página `/clima/:nombre`. Hace el trabajo de cargar los datos:

1. Lee `:nombre` de la URL (`ActivatedRoute`).
2. Carga la lista de países (necesario si abres la URL directamente o recargas la página).
3. Busca el país con `buscarPorNombre`.
4. Obtiene sus coordenadas con `obtenerCoordenadas`.
5. Pide el clima con `obtenerClima`.

Mantiene el estado en signals (`cargando`, `error`, `pais`, `clima`). Mientras carga muestra el gif de Mario, y si algo falla ("país no encontrado", "no se pudo determinar la ubicación", error de la API) muestra el mensaje. Tiene el botón "← Volver a países" y, cuando hay datos, pasa todo a `ClimaInfo`. Cuando `ClimaInfo` avisa `verDetalles`, navega a `/detalle/{nombre}`.

### `clima-info` — [src/app/clima-info/](src/app/clima-info/)

Solo dibuja el clima: emoji y descripción, temperatura actual, sensación térmica, humedad, viento, precipitación y las 7 tarjetas del pronóstico.

| | Nombre | Para qué |
|---|---|---|
| `@Input` | `pais` | Para mostrar nombre, bandera y capital |
| `@Input` | `clima` | Los datos ya cargados |
| `@Output` | `verDetalles` | Emite el país cuando pulsas "Ver detalles" |

---

## Pantalla de detalle

### `detalle-component` — [src/app/detalle-component/](src/app/detalle-component/)

Es la página `/detalle/:nombre`. Igual que el clima, lee el nombre de la URL, carga los países si hace falta y busca el país con `buscarPorNombre`. Maneja los estados `cargando` y `error`, tiene el botón "← Volver a países" y le pasa el país a `PaisInfo`. Escucha dos eventos de `PaisInfo`:

- `verClima` → navega a `/clima/{nombre}`
- `verVecino` → navega a `/detalle/{nombre del vecino}`

### `pais-info` — [src/app/pais-info/](src/app/pais-info/)

Solo dibuja la información completa del país: bandera grande, nombre y nombre oficial, descripción y las tarjetas de:

- capital, región y subregión, población
- **área** en km² (la API la entrega como `{ kilometers, miles }`)
- **idiomas**
- **monedas** (nombre y símbolo)
- zonas horarias
- **fronteras**: la API entrega códigos de 3 letras (`["USA","MEX"]`); se traducen al nombre del país vecino y cada uno es un botón para ir a su detalle
- **códigos**: ISO alfa-2, ISO alfa-3, ISO numérico y prefijo telefónico

Si un dato no viene en la API, la tarjeta dice "No disponible" (o no aparece, en las opcionales).

| | Nombre | Para qué |
|---|---|---|
| `@Input` | `pais` | El país a mostrar (obligatorio) |
| `@Output` | `verClima` | Emite el país cuando pulsas "Ver clima" |
| `@Output` | `verVecino` | Emite el nombre del país vecino cuando pulsas una frontera |
=======
https://broad-credit-c2c2.glaconsa2014.workers.dev/
>>>>>>> 7d0a15613cb19ec970b999edfbb11c29437f5c76
