import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.html',
  styleUrl: './paginador.css'
})
export class Paginador implements OnChanges {

  @Input() paginaActual = 1;
  @Input() totalPaginas = 1;

  @Output() paginaChange = new EventEmitter<number>();

  paginasVisibles: (number | '...')[] = [];

  ngOnChanges(): void {
    const paginas: (number | '...')[] = [];
    for (let i = 1; i <= this.totalPaginas; i++) {
      if (i === 1 || i === this.totalPaginas || Math.abs(i - this.paginaActual) <= 1) {
        paginas.push(i);
      } else if (paginas[paginas.length - 1] !== '...') {
        paginas.push('...');
      }
    }
    this.paginasVisibles = paginas;
  }

  ir(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas || pagina === this.paginaActual) return;
    this.paginaChange.emit(pagina);
  }
}
