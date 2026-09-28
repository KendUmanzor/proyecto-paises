import { Component, ElementRef, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaisApi } from '../services/pais-api';

@Component({
  selector: 'app-search-component',
  imports: [CommonModule],
  templateUrl: './search-component.html',
  styleUrl: './search-component.css',
})
export class SearchComponent implements OnInit {
  recomendaciones = signal<any[]>([]);
  mostrarRecomendaciones = signal<boolean>(false);

  constructor(
    public apiService: PaisApi,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {

    this.apiService.cargarPaises().subscribe({
      next: () => {

        const termino = this.apiService.terminoBusqueda();
        if (termino) {
          this.actualizarRecomendaciones(termino);
        }
      }
    });
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.apiService.setTerminoBusqueda(value);
    this.actualizarRecomendaciones(value);
  }

  onFocus(): void {
    const actual = this.apiService.terminoBusqueda().trim();
    if (actual.length > 0) {
      this.actualizarRecomendaciones(actual);
    }
  }

  actualizarRecomendaciones(query: string): void {
    const q = query.trim();
    if (!q) {
      this.recomendaciones.set([]);
      this.mostrarRecomendaciones.set(false);
      return;
    }


    const resultados = this.apiService.buscarPaises(q);
    this.recomendaciones.set(resultados.slice(0, 8));
    this.mostrarRecomendaciones.set(true);
  }

  seleccionarPais(pais: any): void {
    const nombre = this.apiService.obtenerNombrePais(pais);
    this.apiService.setTerminoBusqueda(nombre);
    this.mostrarRecomendaciones.set(false);
  }

  limpiarBusqueda(): void {
    this.apiService.setTerminoBusqueda('');
    this.recomendaciones.set([]);
    this.mostrarRecomendaciones.set(false);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.mostrarRecomendaciones.set(false);
    }
  }
}
