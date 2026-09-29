import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaisApi } from '../services/pais-api';

@Component({
  selector: 'app-pais-info',
  imports: [CommonModule],
  templateUrl: './pais-info.html',
  styleUrl: './pais-info.css'
})
export class PaisInfo {

  @Input({ required: true }) pais: any;

  @Output() verClima = new EventEmitter<any>();
  @Output() verVecino = new EventEmitter<string>();

  constructor(public paisApi: PaisApi) {}

  aLista(valor: any): string[] {
    if (!valor) return [];
    const items = Array.isArray(valor) ? valor : typeof valor === 'object' ? Object.values(valor) : [valor];
    return items
      .map((i: any) => (typeof i === 'string' ? i : i?.name || i?.common || i?.code || ''))
      .filter((s: string) => !!s);
  }

  area(pais: any): number | null {
    const a = pais?.area;
    const km = typeof a === 'number' ? a : a?.kilometers ?? a?.km2;
    return typeof km === 'number' ? km : null;
  }

  idiomas(pais: any): string[] {
    return this.aLista(pais?.languages);
  }

  monedas(pais: any): string[] {
    const m = pais?.currencies;
    if (!m) return [];
    const entradas: [string, any][] = Array.isArray(m)
      ? m.map((c: any): [string, any] => [c?.code || '', c])
      : Object.entries(m);
    return entradas
      .map(([codigo, c]) => {
        const nombre = typeof c === 'string' ? c : c?.name || codigo;
        const simbolo = typeof c === 'object' && c?.symbol ? c.symbol : codigo;
        return nombre && simbolo && nombre !== simbolo ? `${nombre} (${simbolo})` : nombre;
      })
      .filter((s) => !!s);
  }

  fronteras(pais: any): { codigo: string; nombre: string; encontrado: boolean }[] {
    const codigos: string[] = Array.isArray(pais?.borders) ? pais.borders : [];
    const todos = this.paisApi.paisesSignal();
    return codigos.map((codigo) => {
      const vecino = todos.find((p) => p?.codes?.alpha_3 === codigo);
      return vecino
        ? { codigo, nombre: this.paisApi.obtenerNombrePais(vecino), encontrado: true }
        : { codigo, nombre: codigo, encontrado: false };
    });
  }

  codigos(pais: any): { etiqueta: string; valor: string }[] {
    const c = pais?.codes || {};
    const llamada = this.aLista(pais?.calling_codes).map((x) => (x.startsWith('+') ? x : '+' + x)).join(', ');
    return [
      { etiqueta: 'ISO alfa-2', valor: c.alpha_2 },
      { etiqueta: 'ISO alfa-3', valor: c.alpha_3 },
      { etiqueta: 'ISO numérico', valor: c.ccn3 },
      { etiqueta: 'Prefijo telefónico', valor: llamada }
    ].filter((x) => !!x.valor);
  }

  capital(pais: any): string {
    const c = pais?.capitals?.[0]?.name || pais?.capitals?.[0] || pais?.capital?.[0];
    return typeof c === 'string' ? c : '';
  }

  bandera(pais: any): string {
    return pais?.flag?.url_png || pais?.flags?.png || pais?.flag?.url_svg || pais?.flags?.svg || '';
  }
}
