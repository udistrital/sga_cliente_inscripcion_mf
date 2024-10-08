import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PreinscripcionModule } from './modules/preinscripcion/preinscripcion.module';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { rootReducer } from './utils/reducers/rootReducer';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from 'src/environments/environment';
import { PopUpManager } from './managers/popUpManager';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AnyService } from './services/any.service';
import { CIDCService } from './services/cidc.service';
import { CoreService } from './services/core.service';
import { DescuentoAcademicoService } from './services/descuento_academico.service';
import { DocumentoProgramaService } from './services/documento_programa.service';
import { EnteService } from './services/ente.service';
import { EvaluacionInscripcionService } from './services/evaluacion_inscripcion.service';
import { EventoService } from './services/evento.service';
import { ExperienciaService } from './services/experiencia.service';
import { IdiomaService } from './services/idioma.service';
import { InscripcionService } from './services/inscripcion.service';
import { ListService } from './services/list.service';
import { NewNuxeoService } from './services/new_nuxeo.service';
import { ParametrosService } from './services/parametros.service';
import { ProyectoAcademicoService } from './services/proyecto_academico.service';
import { TercerosMidService } from './services/terceros_mid.service';
import { TimeService } from './services/time.service';
import { UbicacionService } from './services/ubicacion.service';
import { UserService } from './services/users.service';
import { UtilidadesService } from './services/utilidades.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DocumentoService } from './services/documento.service';
import { ProduccionAcademicaService } from './services/produccion_academica.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpinnerUtilInterceptor, SpinnerUtilModule } from 'spinner-util';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MAT_SELECT_SCROLL_STRATEGY_PROVIDER} from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { MAT_TOOLTIP_SCROLL_STRATEGY } from '@angular/material/tooltip';
import { Overlay } from '@angular/cdk/overlay';
import { LegalizacionMatriculaAspiranteComponent } from './modules/legalizacion/legalizacion-matricula-aspirante/legalizacion-matricula-aspirante.component';
import { InscripcionMidService } from './services/sga_inscripcion_mid.service';
import { CalendarioMidService } from './services/sga_calendario_mid.service';
import { TerceroMidService } from './services/sga_tercero_mid.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { LegalizacionMatriculaComponent } from './modules/legalizacion/legalizacion-matricula/legalizacion-matricula.component';
//import { ModalComponent } from './modules/legalizacion-matricula/components/modal/modal.component';
import { MatButtonModule } from '@angular/material/button';
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { SgaMidService } from './services/sga_mid.service';
import { LiquidacionMatriculaService } from './services/liquidacion_matricula.service';
import { CdkStepper } from '@angular/cdk/stepper';
import { ImplicitAutenticationService } from './services/implicit_autentication.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, environment.apiUrl + 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LegalizacionMatriculaAspiranteComponent,
    LegalizacionMatriculaComponent,
    //ModalComponent,
  ],
  imports: [
    NgxExtendedPdfViewerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatInputModule,
    MatSnackBarModule,
    BrowserModule,
    MatDialogModule,
    MatListModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatStepperModule,
    MatCardModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatExpansionModule,
    MatAutocompleteModule,
    NgxDocViewerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatMenuModule,
    MatButtonToggleModule,
    StoreModule.forRoot(rootReducer),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    HttpClientModule,
    SpinnerUtilModule,
  ],
  providers: [
    AnyService,
    CalendarioMidService,
    CIDCService,
    CoreService,
    DescuentoAcademicoService,
    DocumentoProgramaService,
    DocumentoService,
    EnteService,
    EvaluacionInscripcionService,
    EventoService,
    ExperienciaService,
    IdiomaService,
    InscripcionMidService,
    InscripcionService,
    ListService,
    NewNuxeoService,
    ParametrosService,
    PopUpManager,
    ProduccionAcademicaService,
    ProyectoAcademicoService,
    TerceroMidService,
    TercerosMidService,
    TimeService,
    TranslateService,
    TranslateStore,
    UbicacionService,
    UserService,
    CdkStepper,
    UtilidadesService,
    SgaMidService,
    LiquidacionMatriculaService,
    ImplicitAutenticationService,
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerUtilInterceptor, multi: true },
    { provide: MatDialogRef, useValue: {} },
    {
      provide: MAT_TOOLTIP_SCROLL_STRATEGY, 
      deps: [Overlay],
      useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 })
    },
    {
      provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
      useValue: MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
     },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
