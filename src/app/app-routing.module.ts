import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransferenciaComponent } from './modules/transferencia/transferencia.component';
import { SolicitudTransferenciaComponent } from './modules/transferencia/components/solicitud-transferencia/solicitud-transferencia.component';
import { LegalizacionMatriculaComponent } from './modules/legalizacion/legalizacion-matricula/legalizacion-matricula.component';
import { LegalizacionMatriculaAspiranteComponent } from './modules/legalizacion/legalizacion-matricula-aspirante/legalizacion-matricula-aspirante.component';

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
  },
  { 
    path: "legalizacion-matricula",
    component: LegalizacionMatriculaComponent
  },
  { 
    path: "**",
    redirectTo: "preinscripcion"
  },
  {
    path: 'legalizacion-matricula-aspirante',
    component: LegalizacionMatriculaAspiranteComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/inscripcion/" }],
})
export class AppRoutingModule { }
