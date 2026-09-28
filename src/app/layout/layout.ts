import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SearchComponent} from '../search-component/search-component';
@Component({
  selector: 'app-layout',
  imports: [SearchComponent, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}