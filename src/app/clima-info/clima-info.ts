import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaisApi } from '../services/pais-api';
import { Clima, ClimaApi } from '../services/clima-api';

@Component({
  selector: 'app-clima-info',
  imports: [CommonModule],
  templateUrl: './clima-info.html',
  styleUrl: './clima-info.css'
})
export class ClimaInfo {

  @Input({ required: true }) pais: any;
  @Input({ required: true }) clima!: Clima;

  @Output() verDetalles = new EventEmitter<any>();

  constructor(public paisApi: PaisApi, public climaApi: ClimaApi) {}
}
