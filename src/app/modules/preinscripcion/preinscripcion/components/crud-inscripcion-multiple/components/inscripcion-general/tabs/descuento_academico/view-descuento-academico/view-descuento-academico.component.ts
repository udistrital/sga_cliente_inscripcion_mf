import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { SolicitudDescuento } from 'src/app/models/descuento/solicitud_descuento';
import { DocumentoService } from 'src/app/services/documento.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ZipManagerService } from 'src/app/services/zip-manager.service';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';

@Component({
  selector: 'ngx-view-descuento-academico',
  templateUrl: './view-descuento-academico.component.html',
  styleUrls: ['./view-descuento-academico.component.scss']
})
export class ViewDescuentoAcademicoComponent implements OnInit {
  persona!: number;
  inscripcion!: number;
  estado_inscripcion!: number;
  periodo!: number;
  programa!: number;
  info_descuento: any;
  info_temp: any;
  dataInfo: any;
  dataDes!: Array<any>;
  solicituddescuento!: SolicitudDescuento;
  docDesSoporte:any = [];
  variable = this.translate.instant('GLOBAL.tooltip_ver_registro')
  gotoEdit: boolean = false;

  @Input('persona_id')
  set info(info: any) {
    this.persona = info;
  }

  @Input('inscripcion_id')
  set info2(info2: any) {
    this.inscripcion = info2;
    if (this.inscripcion !== undefined && this.inscripcion !== 0 && this.inscripcion.toString() !== '') {
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

  updateDocument: boolean = false;
  canUpdateDocument: boolean = false;

  @Output('docs_editados') docs_editados: EventEmitter<any> = new EventEmitter(true);

  constructor(private translate: TranslateService,
    private inscripcionMidService: InscripcionMidService,
    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,
    private newNuxeoService: NewNuxeoService,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService,
    private popUpManager: PopUpManager,) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
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
    this.inscripcionMidService.get('academico/descuento/detalle?' +
      'PersonaId=' + sessionStorage.getItem('TerceroId') + '&DependenciaId=' +
      sessionStorage.getItem('ProgramaAcademicoId') + '&PeriodoId=' + sessionStorage.getItem('IdPeriodo'))
      .subscribe((result: any) => {
        const r = <any>result.Data;
        if (result.Data != null && result.Status == '200' ) {
          const data = <Array<SolicitudDescuento>>r;
          const soportes = [];
          let soportes1 = "";
          this.info_descuento = data;
          for (let i = 0; i < this.info_descuento.length; i++) {
            if (Number(this.info_descuento[i].DocumentoId) > 0) {
              soportes.push({ Id: this.info_descuento[i].DocumentoId, key: i });
              soportes1 += String(this.info_descuento[i].DocumentoId);
              if (i < this.info_descuento.length - 1 ) {
                soportes1 += '|';
              } else {
                soportes1 += `&limit=${Number(this.info_descuento.length)}`;
              }
            }
          }
          this.infoCarga.nCargas = soportes.length;
          
          if (soportes1 != '') {
            this.documentoService.get('documento?query=Id__in:'+soportes1)
              .subscribe((resp: any) => {
                if((resp.Status && (resp.Status == "400" || resp.Status == "404")) || Object.keys(resp[0]).length == 0) {
                  this.infoFalla();
                } else {
                  this.docDesSoporte = <Array<any>>resp;
                  this.info_descuento.forEach((info:any) => {
                    let doc = this.docDesSoporte.find((doc:any) => doc.Id === info.DocumentoId);
                    if (doc !== undefined) {
                      let estadoDoc = this.utilidades.getEvaluacionDocumento(doc.Metadatos);
                      if (estadoDoc.aprobado === false) {
                        this.updateDocument = true;
                      }
                      this.docs_editados.emit(this.updateDocument);
                      info.Soporte = {
                        //Documento: doc.Documento, 
                        DocumentoId: doc.Id,
                        aprobado: estadoDoc.aprobado, 
                        estadoObservacion: estadoDoc.estadoObservacion,
                        observacion: estadoDoc.observacion,
                        nombreDocumento: info.DescuentosDependenciaId ? info.DescuentosDependenciaId.TipoDescuentoId ? info.DescuentosDependenciaId.TipoDescuentoId.Nombre : '' : '',
                        tabName: this.translate.instant('inscripcion.descuento_matricula'),
                        carpeta: "Descuentos de Matrícula"
                      }
                      this.zipManagerService.adjuntarArchivos([info.Soporte]);
                      this.addCargado(1);
                    }
                  });
                }
              },
              (error) => {
                this.infoFalla();
                //this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
              }
              );
          }
        } else {
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
              this.translate.instant('GLOBAL.descuento_matricula') + '|' +
              this.translate.instant('GLOBAL.descuento_matricula'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.canUpdateDocument = <string>(sessionStorage.getItem('IdEstadoInscripcion') || "").toUpperCase() === "INSCRITO CON OBSERVACIÓN";
  }

  abrirDocumento(documento: any) {
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
