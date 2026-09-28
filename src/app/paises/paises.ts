import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaisApi } from '../services/pais-api';

@Component({
  selector: 'app-paises',
  imports: [CommonModule],
  templateUrl: './paises.html',
  styleUrl: './paises.css'
})
export class Paises implements OnInit {

  cargando: boolean = true;
  error: string | null = null;

  constructor(public apiService: PaisApi) {}

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
    return this.apiService.buscarPaises(this.apiService.terminoBusqueda());
  });
}