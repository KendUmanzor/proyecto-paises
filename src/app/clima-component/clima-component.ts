import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PaisApi } from '../services/pais-api';
import { Clima, ClimaApi } from '../services/clima-api';
import { ClimaInfo } from '../clima-info/clima-info';

@Component({
  selector: 'app-clima-component',
  imports: [CommonModule, RouterLink, ClimaInfo],
  templateUrl: './clima-component.html',
  styleUrl: './clima-component.css',
})
export class ClimaComponent implements OnInit {

  nombre = signal('');
  pais = signal<any>(null);
  clima = signal<Clima | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public paisApi: PaisApi,
    public climaApi: ClimaApi
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params) => params.get('nombre') || ''),
      switchMap((nombre) => {
        this.nombre.set(nombre);
        this.cargando.set(true);
        this.error.set(null);
        this.clima.set(null);

        return this.paisApi.cargarPaises().pipe(
          map(() => this.paisApi.buscarPorNombre(nombre)),
          switchMap((pais) => {
            if (!pais) {
              throw new Error(`No se encontró el país "${nombre}".`);
            }
            this.pais.set(pais);
            return this.climaApi.obtenerCoordenadas(pais);
          }),
          switchMap((coords) => {
            if (!coords) {
              throw new Error('No se pudo determinar la ubicación del país.');
            }
            return this.climaApi.obtenerClima(coords.lat, coords.lon);
          }),
          catchError((err) => {
            this.error.set(err?.message?.startsWith('No se') ? err.message : 'Error al obtener el clima.');
            return of(null);
          })
        );
      })
    ).subscribe((clima) => {
      this.clima.set(clima);
      this.cargando.set(false);
    });
  }

  irADetalle(pais: any): void {
    this.router.navigate(['/detalle', this.paisApi.obtenerNombrePais(pais)]);
  }
}
