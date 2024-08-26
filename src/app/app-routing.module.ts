import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransferenciaComponent } from './modules/transferencia/transferencia.component';
import { SolicitudTransferenciaComponent } from './modules/transferencia/components/solicitud-transferencia/solicitud-transferencia.component';
import { LegalizacionMatriculaComponent } from './modules/legalizacion/legalizacion-matricula/legalizacion-matricula.component';
import { LegalizacionMatriculaAspiranteComponent } from './modules/legalizacion/legalizacion-matricula-aspirante/legalizacion-matricula-aspirante.component';
import { AuthGuard } from 'src/_guards/auth.guard';

const routes: Routes = [
  { 
    path: "",
    canActivate: [AuthGuard],
    loadChildren: () => import ('./modules/preinscripcion/preinscripcion.module').then(m => m.PreinscripcionModule),
  },
  { 
    path: "preinscripcion",
    canActivate: [AuthGuard],
    loadChildren: () => import ('./modules/preinscripcion/preinscripcion.module').then(m => m.PreinscripcionModule),
  },
  { 
    path: "transferencia",
    canActivate: [AuthGuard],
    component: TransferenciaComponent
  },
  {
    path: 'solicitud-transferencia/:id/:process',
    canActivate: [AuthGuard],
    component: SolicitudTransferenciaComponent,
  },
  {
    path: 'legalizacion-matricula-aspirante/:persona/:periodo/:programa',
    canActivate: [AuthGuard],
    component: LegalizacionMatriculaAspiranteComponent,
  },
  { 
    path: "legalizacion-matricula",
    canActivate: [AuthGuard],
    component: LegalizacionMatriculaComponent
  },
  {
    path: "**",
    redirectTo: "preinscripcion"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/inscripcion/" }],
})
export class AppRoutingModule { }
