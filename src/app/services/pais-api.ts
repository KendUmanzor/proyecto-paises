import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap, shareReplay, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaisApi {

  private apiUrl = 'https://api.restcountries.com/countries/v5';
  private headers = new HttpHeaders({
    'Authorization': 'Bearer rc_live_b8b79ba2e00a4627ad6e853a0ebf196b'
  });


  paisesSignal = signal<any[]>([]);


  terminoBusqueda = signal<string>('');

  private peticionCarga$: Observable<any[]> | null = null;

  constructor(private http: HttpClient) {}

  getdata(): Observable<any[]> {
    return this.cargarPaises();
  }

  cargarPaises(): Observable<any[]> {
    if (this.paisesSignal().length > 0) {
      return of(this.paisesSignal());
    }

    if (this.peticionCarga$) {
      return this.peticionCarga$;
    }


    const p1 = this.http.get<any>(`${this.apiUrl}?limit=100&offset=0`, { headers: this.headers }).pipe(
      catchError(() => of({ data: { objects: [] } }))
    );
    const p2 = this.http.get<any>(`${this.apiUrl}?limit=100&offset=100`, { headers: this.headers }).pipe(
      catchError(() => of({ data: { objects: [] } }))
    );
    const p3 = this.http.get<any>(`${this.apiUrl}?limit=100&offset=200`, { headers: this.headers }).pipe(
      catchError(() => of({ data: { objects: [] } }))
    );

    this.peticionCarga$ = forkJoin([p1, p2, p3]).pipe(
      map(([r1, r2, r3]) => {
        const lista1 = r1?.data?.objects || (Array.isArray(r1) ? r1 : []);
        const lista2 = r2?.data?.objects || (Array.isArray(r2) ? r2 : []);
        const lista3 = r3?.data?.objects || (Array.isArray(r3) ? r3 : []);
        return [...lista1, ...lista2, ...lista3];
      }),
      tap((todos) => {
        console.log(`[PaisApi] Países cargados exitosamente: ${todos.length}`);
        this.paisesSignal.set(todos);
      }),
      shareReplay(1)
    );

    return this.peticionCarga$;
  }

  setTerminoBusqueda(termino: string): void {
    this.terminoBusqueda.set(termino);
  }


  normalizarTexto(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }


  obtenerNombrePais(pais: any): string {
    return (
      pais?.names?.translations?.spa?.common ||
      pais?.names?.common ||
      pais?.name?.common ||
      ''
    );
  }


  buscarPaises(query: string): any[] {
    const q = this.normalizarTexto(query);
    const todos = this.paisesSignal();

    if (!q) {
      return todos;
    }


    const queComienzanNombre = todos.filter((pais) => {

      const eng = this.normalizarTexto(pais?.names?.common || pais?.name?.common);
      return eng.startsWith(q);
    });

    if (queComienzanNombre.length > 0) {
      return queComienzanNombre.sort((a, b) =>
        this.obtenerNombrePais(a).localeCompare(this.obtenerNombrePais(b))
      );
    }

    const queComienzanSecundario = todos.filter((pais) => {
      const Eng = this.normalizarTexto(pais?.names?.official || pais?.name?.official);

      return Eng.startsWith(q);
    });

    if (queComienzanSecundario.length > 0) {
      return queComienzanSecundario;
    }

    return todos.filter((pais) => {
      const eng = this.normalizarTexto(pais?.names?.common || pais?.name?.common);

      return eng.includes(q);
    });
  }
}
