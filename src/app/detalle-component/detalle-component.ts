import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { PaisApi } from '../services/pais-api';
import { PaisInfo } from '../pais-info/pais-info';

@Component({
  selector: 'app-detalle-component',
  imports: [CommonModule, PaisInfo],
  templateUrl: './detalle-component.html',
  styleUrl: './detalle-component.css',
})
export class DetalleComponent implements OnInit, OnChanges {

  @Input() pais: any = null;

  @Output() cerrar = new EventEmitter<void>();
  @Output() verClima = new EventEmitter<any>();

  paisActual = signal<any>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  constructor(public paisApi: PaisApi) {}

  ngOnInit(): void {
    if (this.pais) {
      this.cargarDetalle(this.pais);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pais'] && this.pais) {
      this.cargarDetalle(this.pais);
    }
  }

  cargarDetalle(paisONombre: any): void {
    if (!paisONombre) return;
    this.cargando.set(true);
    this.error.set(null);

    if (typeof paisONombre === 'object' && paisONombre !== null) {
      this.paisActual.set(paisONombre);
      this.cargando.set(false);
      return;
    }

    this.paisApi.cargarPaises().pipe(
      map(() => this.paisApi.buscarPorNombre(paisONombre)),
      catchError(() => {
        this.error.set('Error al cargar los datos de la API.');
        return of(null);
      })
    ).subscribe((p) => {
      if (!p && !this.error()) {
        this.error.set(`No se encontró el país "${paisONombre}".`);
      }
      this.paisActual.set(p);
      this.cargando.set(false);
    });
  }

  irAClima(pais: any): void {
    this.verClima.emit(pais);
  }

  irADetalle(nombreOVecino: string): void {
    this.cargarDetalle(nombreOVecino);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cerrar.emit();
  }
}
