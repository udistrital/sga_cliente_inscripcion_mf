import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { 
    path: "",
    loadChildren: () => import ('./modules/preinscripcion/preinscripcion.module').then(m => m.PreinscripcionModule),
  },
  { 
    path: "preinscripcion",
    loadChildren: () => import ('./modules/preinscripcion/preinscripcion.module').then(m => m.PreinscripcionModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: "/inscripcion/" }],
})
export class AppRoutingModule { }
