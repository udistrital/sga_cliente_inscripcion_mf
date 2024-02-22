import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreinscripcionComponent } from './preinscripcion/preinscripcion.component';
import { CrudFormacionAcademicaComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/formacion-academica/crud-formacion-academica/crud-formacion-academica.component';

const routes: Routes = [
  { path : '', component: PreinscripcionComponent},
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreinscripcionRoutingModule { }
