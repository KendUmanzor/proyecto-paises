import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PaisApi } from '../services/pais-api';
import { Clima, ClimaApi } from '../services/clima-api';
import { ClimaInfo } from '../clima-info/clima-info';

@Component({
  selector: 'app-clima-component',
  imports: [CommonModule, ClimaInfo],
  templateUrl: './clima-component.html',
  styleUrl: './clima-component.css',
})
export class ClimaComponent implements OnInit, OnChanges {

  @Input() pais: any = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() verDetalles = new EventEmitter<any>();

  paisActual = signal<any>(null);
  clima = signal<Clima | null>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  constructor(
    public paisApi: PaisApi,
    public climaApi: ClimaApi
  ) {}

  ngOnInit(): void {
    if (this.pais) {
      this.cargarClima(this.pais);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pais'] && this.pais) {
      this.cargarClima(this.pais);
    }
  }

  cargarClima(paisOElemento: any): void {
    if (!paisOElemento) return;
    this.cargando.set(true);
    this.error.set(null);
    this.clima.set(null);

    const observablePais$ = typeof paisOElemento === 'object' && paisOElemento !== null
      ? of(paisOElemento)
      : this.paisApi.cargarPaises().pipe(
          map(() => this.paisApi.buscarPorNombre(paisOElemento))
        );

    observablePais$.pipe(
      switchMap((pais) => {
        if (!pais) {
          throw new Error('No se encontró el país.');
        }
        this.paisActual.set(pais);
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
    ).subscribe((clima) => {
      this.clima.set(clima);
      this.cargando.set(false);
    });
  }

  irADetalle(pais: any): void {
    this.verDetalles.emit(pais);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrar.emit();
  }
}
