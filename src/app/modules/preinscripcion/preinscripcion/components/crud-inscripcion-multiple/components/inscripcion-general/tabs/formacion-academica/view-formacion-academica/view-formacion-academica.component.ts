import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { DocumentoService } from 'src/app/services/documento.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ZipManagerService } from 'src/app/services/zip-manager.service';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { POR_DEFINIR } from '../../constants';

@Component({
  selector: 'ngx-view-formacion-academica',
  templateUrl: './view-formacion-academica.component.html',
  styleUrls: ['./view-formacion-academica.component.scss']
})
export class ViewFormacionAcademicaComponent implements OnInit {
  displayedColumns: string[] = ['institucion', 'programa', 'nivel', 'fechaInicio', 'fechaFin', 'estado', 'observacion', 'soporte'];
  dataSource!: MatTableDataSource<any>;
  
  info_formacion_academica_id!: number;
  organizacion: any;
  persona_id!: number;
  gotoEdit: boolean = false;

  @Input('persona_id')
  set info(info: any) {
    if (info) {
      this.persona_id = info;
      this.loadData();
    }
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  @Output('estadoCarga') estadoCarga: EventEmitter<any> = new EventEmitter(true);
  infoCarga: any = {
    porcentaje: 0,
    nCargado: 0,
    nCargas: 0,
    status: ""
  }

  info_formacion_academica: any;
  soporte: any;

  updateDocument: boolean = false;
  canUpdateDocument: boolean = false;

  @Output('docs_editados') docs_editados: EventEmitter<any> = new EventEmitter(true);

  constructor(
    private translate: TranslateService,
    private inscripcionMidService: InscripcionMidService,
    private documentoService: DocumentoService,
    private newNuxeoService: NewNuxeoService,
    private sanitization: DomSanitizer,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService,
    private popUpManager: PopUpManager,) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
    //this.loadData();
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  loadData(): void {
    this.inscripcionMidService.get('academico/formacion?Id=' + this.persona_id)
      .subscribe((response:any) => {
        if (response !== null && response.Status == '200' && (Object.keys(response.Data).length > 0)) {
          const data = <Array<any>>response.Data
          this.infoCarga.nCargas = data.length;
          const dataInfo = <Array<any>>[];
          data.forEach(element => {
            const FechaI = element.FechaInicio;
            const FechaF = element.FechaFinalizacion;
            element.FechaInicio = FechaI.substring(0, 2) + '/' + FechaI.substring(2, 4) + '/' + FechaI.substring(4, 8);
            element.FechaFinalizacion = FechaF.substring(0, 2) + '/' + FechaF.substring(2, 4) + '/' + FechaF.substring(4, 8);
            dataInfo.push(element);

            if (Number(element.Documento) > 0) {
              this.documentoService.get('documento/'+element.Documento)
                .subscribe((resp: any) => {
                    if(resp.Status && (resp.Status == "400" || resp.Status == "404")) {
                      this.infoFalla();
                    } else {
                      //element.Documento = response[0]["Documento"]; 
                      element.DocumentoId = resp.Id;
                      let estadoDoc = this.utilidades.getEvaluacionDocumento(resp.Metadatos);
                      if (estadoDoc.aprobado === false && estadoDoc.estadoObservacion !== POR_DEFINIR) {
                        this.updateDocument = true;
                      }
                      this.docs_editados.emit(this.updateDocument);
                      element.aprobado = estadoDoc.aprobado;
                      element.estadoObservacion = estadoDoc.estadoObservacion;
                      element.observacion = estadoDoc.observacion;
                      element.nombreDocumento = element.ProgramaAcademico ? element.ProgramaAcademico.Nombre : '';
                      element.tabName = this.translate.instant('GLOBAL.formacion_academica');
                      element.carpeta = "Formación Académica";
                      this.zipManagerService.adjuntarArchivos([element]);
                      this.addCargado(1);
                    }
                  },
                  (error: HttpErrorResponse) => {
                    this.infoFalla();
                    //this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
                  }
                );
            } else {
              this.infoFalla();
            }
          })
          this.info_formacion_academica = data;
          this.dataSource = new MatTableDataSource(this.info_formacion_academica);
        } else {
          this.dataSource = new MatTableDataSource();
          this.infoFalla();
        }
      },
        (error: HttpErrorResponse) => {
          this.infoFalla();
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.formacion_academica') + '|' +
              this.translate.instant('GLOBAL.soporte_documento'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.canUpdateDocument = <string>(sessionStorage.getItem('IdEstadoInscripcion') || "").toUpperCase() === "INSCRITO CON OBSERVACIÓN";
  }

  abrirDocumento(documento:any) {
  
    this.newNuxeoService.getByIdLocal(documento.DocumentoId)
      .subscribe(file => {

        documento.Documento = file;
        this.revisar_doc.emit(documento);
      }, error => {
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
      })
  }

  addCargado(carga: number) {
    this.infoCarga.nCargado += carga;
    this.infoCarga.porcentaje = this.infoCarga.nCargado/this.infoCarga.nCargas;
    if (this.infoCarga.porcentaje >= 1) {
      this.infoCarga.status = "completed";
    }
    this.estadoCarga.emit(this.infoCarga);
  }

  infoFalla() {
    this.infoCarga.status = "failed";
    this.estadoCarga.emit(this.infoCarga);
  }
}
