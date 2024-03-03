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
import {MatStepperModule} from '@angular/material/stepper';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DialogPreviewFileComponent } from '../components/dialog-preview-file/dialog-preview-file.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ListIdiomasComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/idiomas/list-idiomas/list-idiomas.component';
import { CrudIdiomasComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/idiomas/crud-idiomas/crud-idiomas.component';
import { ListExperienciaLaboralComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/laboral/list-experiencia-laboral/list-experiencia-laboral.component';
import { CrudExperienciaLaboralComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/laboral/crud-experiencia-laboral/crud-experiencia-laboral.component';
import { ListProduccionAcademicaComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/produccion-academica/list-produccion-academica/list-produccion-academica.component';
import { CrudProduccionAcademicaComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/produccion-academica/crud-produccion-academica/crud-produccion-academica.component';
import { ListDocumentoProgramaComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/documento-programa/list-documento-programa/list-documento-programa.component';
import { CrudDocumentoProgramaComponent } from './preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/documento-programa/crud-documento-programa/crud-documento-programa.component';

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
    DialogPreviewFileComponent,
    ListIdiomasComponent,
    CrudIdiomasComponent,
    ListExperienciaLaboralComponent,
    CrudExperienciaLaboralComponent,
    ListProduccionAcademicaComponent,
    CrudProduccionAcademicaComponent,
    ListDocumentoProgramaComponent,
    CrudDocumentoProgramaComponent
  ],
  imports: [
    MatTooltipModule,
    NgxExtendedPdfViewerModule,
    MatCheckboxModule,
    MatStepperModule,
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
    })
  ]
})
export class PreinscripcionModule { }
