import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransferenciaComponent } from './modules/transferencia/transferencia.component';
import { SolicitudTransferenciaComponent } from './modules/transferencia/components/solicitud-transferencia/solicitud-transferencia.component';

const routes: Routes = [
  { 
    path: "",
    loadChildren: () => import ('./modules/preinscripcion/preinscripcion.module').then(m => m.PreinscripcionModule),
  },
  { 
    path: "preinscripcion",
    loadChildren: () => import ('./modules/preinscripcion/preinscripcion.module').then(m => m.PreinscripcionModule),
  },
  { 
    path: "transferencia",
    component: TransferenciaComponent
  },
  {
    path: 'solicitud-transferencia/:id/:process',
    component: SolicitudTransferenciaComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/inscripcion/" }],
})
export class AppRoutingModule { }
