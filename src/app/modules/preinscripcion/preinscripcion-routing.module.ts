import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreinscripcionComponent } from './preinscripcion/preinscripcion.component';
import { CrudFormacionAcademicaComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/formacion-academica/crud-formacion-academica/crud-formacion-academica.component';
import { ListIdiomasComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/idiomas/list-idiomas/list-idiomas.component';
import { ListFormacionAcademicaComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/formacion-academica/list-formacion-academica/list-formacion-academica.component';
import { MatButtonModule } from '@angular/material/button';



const routes: Routes = [
  { path : '', 
    component: PreinscripcionComponent},
  
];

@NgModule({
  imports: [MatButtonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PreinscripcionRoutingModule { }
