import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Coordenadas {
  lat: number;
  lon: number;
}

export interface ClimaActual {
  temperatura: number;
  sensacion: number;
  humedad: number;
  precipitacion: number;
  viento: number;
  codigo: number;
}

export interface ClimaDia {
  fecha: string;
  codigo: number;
  maxima: number;
  minima: number;
  precipitacion: number;
}

export interface Clima {
  actual: ClimaActual;
  dias: ClimaDia[];
}

@Injectable({
  providedIn: 'root',
})
export class ClimaApi {

  private forecastUrl = 'https://api.open-meteo.com/v1/forecast';
  private geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';

  constructor(private http: HttpClient) {}

  obtenerClima(lat: number, lon: number): Observable<Clima> {
    const params = {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
      timezone: 'auto',
      forecast_days: 7
    };

    return this.http.get<any>(this.forecastUrl, { params }).pipe(
      map((r) => ({
        actual: {
          temperatura: r.current.temperature_2m,
          sensacion: r.current.apparent_temperature,
          humedad: r.current.relative_humidity_2m,
          precipitacion: r.current.precipitation,
          viento: r.current.wind_speed_10m,
          codigo: r.current.weather_code
        },
        dias: r.daily.time.map((fecha: string, i: number) => ({
          fecha,
          codigo: r.daily.weather_code[i],
          maxima: r.daily.temperature_2m_max[i],
          minima: r.daily.temperature_2m_min[i],
          precipitacion: r.daily.precipitation_sum[i]
        }))
      }))
    );
  }

  obtenerCoordenadas(pais: any): Observable<Coordenadas | null> {
    const latlng = pais?.latlng || pais?.capitals?.[0]?.latlng || pais?.coordinates?.latlng;
    if (Array.isArray(latlng) && latlng.length >= 2) {
      return of({ lat: latlng[0], lon: latlng[1] });
    }

    const lat = pais?.coordinates?.latitude ?? pais?.capitals?.[0]?.latitude ?? pais?.latitude;
    const lon = pais?.coordinates?.longitude ?? pais?.capitals?.[0]?.longitude ?? pais?.longitude;
    if (typeof lat === 'number' && typeof lon === 'number') {
      return of({ lat, lon });
    }

    const capital = pais?.capitals?.[0]?.name || pais?.capitals?.[0] || pais?.capital?.[0];
    const busqueda = typeof capital === 'string' && capital
      ? capital
      : (pais?.names?.common || pais?.name?.common || '');
    const iso2 = pais?.codes?.alpha_2 || pais?.cca2;

    const params = { name: busqueda, count: 10, language: 'en' };
    return this.http.get<any>(this.geocodingUrl, { params }).pipe(
      map((r) => {
        const resultados: any[] = r?.results || [];
        const lugar = (iso2 && resultados.find((x) => x.country_code === iso2)) || resultados[0];
        return lugar ? { lat: lugar.latitude, lon: lugar.longitude } : null;
      })
    );
  }

  describirCodigo(codigo: number): { texto: string; icono: string; imagen?: string } {
    if (codigo === 0) return { texto: 'Clear sky', icono: '☀️', imagen: 'icons/clear-sky.png' };
    if (codigo === 1) return { texto: 'Mainly clear', icono: '🌤️', imagen: 'icons/mainly-clear.png' };
    if (codigo === 2) return { texto: 'Partly cloudy', icono: '⛅', imagen: 'icons/partly-cloudy.png' };
    if (codigo === 3) return { texto: 'Overcast', icono: '☁️', imagen: 'icons/overcast.png' };
    if (codigo === 45 || codigo === 48) return { texto: 'Fog', icono: '🌫️', imagen: 'icons/fog.png' };
    if (codigo >= 51 && codigo <= 57) return { texto: 'Drizzle', icono: '🌦️', imagen: 'icons/rain.png' };
    if (codigo >= 61 && codigo <= 67) return { texto: 'Rain', icono: '🌧️', imagen: 'icons/rain.png' };
    if (codigo >= 71 && codigo <= 77) return { texto: 'Snow', icono: '❄️', imagen: 'icons/snow.png' };
    if (codigo >= 80 && codigo <= 82) return { texto: 'Rain showers', icono: '🌧️', imagen: 'icons/rain.png' };
    if (codigo === 85 || codigo === 86) return { texto: 'Snow showers', icono: '🌨️', imagen: 'icons/snow-showers.png' };
    if (codigo >= 95) return { texto: 'Thunderstorm', icono: '⛈️', imagen: 'icons/thunderstorm.png' };
    return { texto: 'No data', icono: '❔' };
  }
}
