import {Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, signal,} from '@angular/core';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PaisApi } from '../services/pais-api';
import { Clima, ClimaApi } from '../services/clima-api';
import { PaisInfo } from '../pais-info/pais-info';
import { ClimaInfo } from '../clima-info/clima-info';

export type TipoModal = 'clima' | 'detalle';

@Component({
  selector: 'app-modales-component',
  imports: [CommonModule, PaisInfo, ClimaInfo],
  templateUrl: './modales-component.html',
  styleUrl: './modales-component.css',
})
export class ModalesComponent implements OnInit, OnChanges {
  @Input() pais: any = null;
  @Input() tipo: TipoModal = 'detalle';

  @Output() cerrar = new EventEmitter<void>();

  tipoActual = signal<TipoModal>('detalle');
  paisActual = signal<any>(null);


  clima = signal<Clima | null>(null);
  cargandoClima = signal(false);
  errorClima = signal<string | null>(null);


  cargandoDetalle = signal(false);
  errorDetalle = signal<string | null>(null);

  constructor(
    public paisApi: PaisApi,
    public climaApi: ClimaApi
  ) {}

  ngOnInit(): void {
    if (this.tipo) {
      this.tipoActual.set(this.tipo);
    }
    if (this.pais) {
      this.inicializar(this.pais, this.tipoActual());
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tipo'] && this.tipo) {
      this.cambiarTipo(this.tipo);
    }
    if (changes['pais'] && this.pais) {
      this.inicializar(this.pais, this.tipoActual());
    }
  }

  inicializar(paisOElemento: any, tipo: TipoModal): void {
    this.cargarDetalle(paisOElemento, () => {
      if (tipo === 'clima') {
        this.cargarClima(this.paisActual());
      }
    });
  }

  cambiarTipo(tipo: TipoModal): void {
    this.tipoActual.set(tipo);
    if (tipo === 'clima' && !this.clima() && !this.cargandoClima()) {
      this.cargarClima(this.paisActual());
    }
  }

  cargarDetalle(paisONombre: any, callback?: () => void): void {
    if (!paisONombre) return;
    this.cargandoDetalle.set(true);
    this.errorDetalle.set(null);

    if (typeof paisONombre === 'object' && paisONombre !== null) {
      this.paisActual.set(paisONombre);
      this.cargandoDetalle.set(false);
      if (callback) callback();
      return;
    }

    this.paisApi
      .cargarPaises()
      .pipe(
        map(() => this.paisApi.buscarPorNombre(paisONombre)),
        catchError(() => {
          this.errorDetalle.set('Error al cargar los datos de la API.');
          return of(null);
        })
      )
      .subscribe((p) => {
        if (!p && !this.errorDetalle()) {
          this.errorDetalle.set(`No se encontró el país "${paisONombre}".`);
        }
        this.paisActual.set(p);
        this.cargandoDetalle.set(false);
        if (callback) callback();
      });
  }

  cargarClima(paisOElemento: any): void {
    const targetPais = paisOElemento || this.paisActual();
    if (!targetPais) return;

    this.cargandoClima.set(true);
    this.errorClima.set(null);
    this.clima.set(null);

    const observablePais$ =
      typeof targetPais === 'object' && targetPais !== null
        ? of(targetPais)
        : this.paisApi.cargarPaises().pipe(
            map(() => this.paisApi.buscarPorNombre(targetPais))
          );

    observablePais$
      .pipe(
        switchMap((pais) => {
          if (!pais) {
            throw new Error('No se encontro el país.');
          }
          this.paisActual.set(pais);
          return this.climaApi.obtenerCoordenadas(pais);
        }),
        switchMap((coords) => {
          if (!coords) {
            throw new Error('No se pudo la ubicación del país.');
          }
          return this.climaApi.obtenerClima(coords.lat, coords.lon);
        }),
        catchError((err) => {
          this.errorClima.set(
            err?.message?.startsWith('No se')
              ? err.message
              : 'Error al obtener el clima.'
          );
          return of(null);
        })
      )
      .subscribe((clima) => {
        this.clima.set(clima);
        this.cargandoClima.set(false);
      });
  }

  irAClima(pais?: any): void {
    if (pais) {
      this.paisActual.set(pais);
    }
    this.tipoActual.set('clima');
    this.cargarClima(this.paisActual());
  }

  irADetalle(nombreOVecino?: string): void {
    this.tipoActual.set('detalle');
    if (nombreOVecino) {
      this.clima.set(null);
      this.cargarDetalle(nombreOVecino);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrar.emit();
  }
}
