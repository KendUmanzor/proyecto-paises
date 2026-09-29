import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { PaisApi } from '../services/pais-api';
import { PaisInfo } from '../pais-info/pais-info';

@Component({
  selector: 'app-detalle-component',
  imports: [CommonModule, RouterLink, PaisInfo],
  templateUrl: './detalle-component.html',
  styleUrl: './detalle-component.css',
})
export class DetalleComponent implements OnInit {

  nombre = signal('');
  pais = signal<any>(null);
  cargando = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public paisApi: PaisApi
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params) => params.get('nombre') || ''),
      switchMap((nombre) => {
        this.nombre.set(nombre);
        this.cargando.set(true);
        this.error.set(null);
        this.pais.set(null);

        return this.paisApi.cargarPaises().pipe(
          map(() => this.paisApi.buscarPorNombre(nombre)),
          catchError(() => {
            this.error.set('Error al cargar los datos de la API.');
            return of(null);
          })
        );
      })
    ).subscribe((pais) => {
      if (!pais && !this.error()) {
        this.error.set(`No se encontró el país "${this.nombre()}".`);
      }
      this.pais.set(pais);
      this.cargando.set(false);
    });
  }

  irAClima(pais: any): void {
    this.router.navigate(['/clima', this.paisApi.obtenerNombrePais(pais)]);
  }

  irADetalle(nombre: string): void {
    this.router.navigate(['/detalle', nombre]);
  }
}
