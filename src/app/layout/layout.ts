import { Component } from '@angular/core';
import { SearchComponent } from '../search-component/search-component';
import { Paises } from '../paises/paises';

@Component({
  selector: 'app-layout',
  imports: [SearchComponent, Paises],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}