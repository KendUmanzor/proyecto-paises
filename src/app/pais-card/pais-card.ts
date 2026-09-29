import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaisApi } from '../services/pais-api';

@Component({
  selector: 'app-pais-card',
  imports: [CommonModule],
  templateUrl: './pais-card.html',
  styleUrl: './pais-card.css'
})
export class PaisCard {

  @Input({ required: true }) pais: any;

  @Output() verClima = new EventEmitter<any>();
  @Output() verDetalles = new EventEmitter<any>();

  constructor(public apiService: PaisApi) {}
}
