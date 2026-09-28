import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { Paises } from './paises/paises';

export const routes: Routes = [
     {path: '',component: Layout,children: [{
          path: '',component: Paises
          }
     ]
     },

{path: '**',redirectTo: ''}
];