import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PreinscripcionRoutingModule } from './preinscripcion-routing.module';
import { VideoModalComponent } from 'src/app/modules/components/video-modal.component/video-modal.component.component';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from 'src/environments/environment';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { CrudInscripcionMultipleComponent } from './preinscripcion/components/crud-inscripcion-multiple/crud-inscripcion-multiple.component';
import { ButtonPaymentComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/button-payment/button-payment.component';
import { LinkDownloadComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/link-download/link-download.component';
import { InscripcionGeneralComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/inscripcion-general.component';
import { DialogoDocumentosComponent } from 'src/app/modules/components/dialogo-documentos/dialogo-documentos.component';
import { CrudInfoPersonaComponent } from './preinscripcion/components/crud-info-persona/crud-info-persona.component';
import { DynamicFormComponent } from 'src/app/modules/components/dynamic-form/dynamic-form.component';
import { PreinscripcionComponent } from './preinscripcion/preinscripcion.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import { CrudInfoCaracteristicaPregradoComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/informacion-basica/crud-info-caracteristica-pregrado/crud-info-caracteristica-pregrado.component';
import { CrudInformacionContactoComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/informacion-basica/crud-informacion-contacto/crud-informacion-contacto.component';
import { CrudInformacionFamiliarComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/informacion-basica/crud-informacion-familiar/crud-informacion-familiar.component';
import { CrudInfoCaracteristicaComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/informacion-basica/crud-info-caracteristica/crud-info-caracteristica.component';
import { CrudIcfesComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/formacion-academica/crud-icfes/crud-icfes.component';
import { CrudPreguntasComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/formacion-academica/crud-preguntas/crud-preguntas.component';
import { ListFormacionAcademicaComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/formacion-academica/list-formacion-academica/list-formacion-academica.component';
import { CrudFormacionAcademicaComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/formacion-academica/crud-formacion-academica/crud-formacion-academica.component';
import { NewTerceroComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/formacion-academica/new-tercero/new-tercero.component';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.apiUrl + 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    VideoModalComponent,
    DialogoDocumentosComponent,
    VideoModalComponent,
    CrudInscripcionMultipleComponent,
    CrudInfoPersonaComponent,
    ButtonPaymentComponent,
    LinkDownloadComponent,
    InscripcionGeneralComponent,
    DynamicFormComponent,
    PreinscripcionComponent,
    CrudInfoCaracteristicaPregradoComponent,
    CrudInformacionContactoComponent,
    CrudInformacionFamiliarComponent,
    CrudInfoCaracteristicaComponent,
    CrudIcfesComponent,
    CrudPreguntasComponent,
    ListFormacionAcademicaComponent,
    CrudFormacionAcademicaComponent,
    NewTerceroComponent,
    
  ],
  imports: [
    MatTableModule,
    MatIconModule,
    MatInputModule,
    MatTabsModule,
    MatNativeDateModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatCardModule,
    MatSnackBarModule,
    MatSelectModule,
    CommonModule,
    NgbModule,
    PreinscripcionRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),

  ]
})
export class PreinscripcionModule { }
