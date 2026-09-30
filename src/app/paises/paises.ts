import { Component, OnInit, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaisApi } from '../services/pais-api';
import { PaisCard } from '../pais-card/pais-card';
import { Paginador } from '../paginador/paginador';
import { ModalesComponent, TipoModal } from '../modales-component/modales-component';

@Component({
  selector: 'app-paises',
  imports: [CommonModule, PaisCard, Paginador, ModalesComponent],
  templateUrl: './paises.html',
  styleUrl: './paises.css'
})
export class Paises implements OnInit {

  cargando: boolean = true;
  error: string | null = null;

  readonly paisesPorPagina = 9;
  paginaActual = signal(1);

  paisSeleccionadoModal = signal<any | null>(null);
  tipoModal = signal<TipoModal>('detalle');

  constructor(public apiService: PaisApi) {
    effect(() => {
      this.apiService.terminoBusqueda();
      this.paginaActual.set(1);
    });
  }

  ngOnInit(): void {
    this.apiService.cargarPaises().subscribe({
      next: () => {
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar países:', err);
        this.error = 'Error al cargar los datos de la API';
        this.cargando = false;
      }
    });
  }

  paisesFiltrados = computed(() => {
    return [...this.apiService.buscarPaises(this.apiService.terminoBusqueda())].sort((a, b) =>
      this.apiService.obtenerNombrePais(a).localeCompare(this.apiService.obtenerNombrePais(b), 'en')
    );
  });

  totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.paisesFiltrados().length / this.paisesPorPagina))
  );

  paisesPagina = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.paisesPorPagina;
    return this.paisesFiltrados().slice(inicio, inicio + this.paisesPorPagina);
  });

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) return;
    this.paginaActual.set(pagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onVerClima(pais: any): void {
    this.paisSeleccionadoModal.set(pais);
    this.tipoModal.set('clima');
  }

  onVerDetalles(pais: any): void {
    this.paisSeleccionadoModal.set(pais);
    this.tipoModal.set('detalle');
  }

  cerrarModal(): void {
    this.paisSeleccionadoModal.set(null);
  }
}
