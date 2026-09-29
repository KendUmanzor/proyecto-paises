import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Paises } from './paises/paises';
import { ClimaComponent } from './clima-component/clima-component';
import { DetalleComponent } from './detalle-component/detalle-component';

export const routes: Routes = [
     {path: '',component: Layout,children: [{
          path: '',component: Paises
          }
     ]
     },
     {path: 'clima/:nombre',component: ClimaComponent},
     {path: 'detalle/:nombre',component: DetalleComponent},

{path: '**',redirectTo: ''}
];
