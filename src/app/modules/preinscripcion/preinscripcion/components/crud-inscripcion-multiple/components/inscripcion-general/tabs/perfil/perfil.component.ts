import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { PivotDocument } from 'src/app/services/pivot_document.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { ZipManagerService } from 'src/app/services/zip-manager.service';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';

@Component({
    selector: 'ngx-perfil',
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.scss'],
    standalone: false
})
export class PerfilComponent implements OnInit, OnDestroy {
  private onDestroy$ = new Subject<void>();

  info_persona_id!: number;
  info_inscripcion_id!: number;
  estado_inscripcion!: string;
  timer!: Subscription;
  @Input('info_persona_id')
  set name(info_persona_id: any) {
    this.info_persona_id = info_persona_id;
  }

  @Input('inscripcion_id')
  set dato(info_inscripcion_id: any) {
    this.info_inscripcion_id = info_inscripcion_id;
  }

  @Input('en_revision')
  en_revision: boolean = false;

  @Input('imprimir') imprimir: boolean = false;

  @Input('SuiteTags') SuiteTags: any;

  @Input('reloadTagComponent') reloadTagComponent: string = '';

  hasObservations: boolean = false;
  canUpdateDocument: boolean = false;

  linkFolderWithTag: any = {
    'Información Básica': 'info_persona',
    'Formación Académica': 'formacion_academica',
    'Experiencia Laboral': 'experiencia_laboral',
    'Producción Académica': 'produccion_academica',
    'Documentos Solicitados': 'documento_programa',
    'Descuentos de Matrícula': 'descuento_matricula',
    'Propuesta de Trabajo de Grado': 'propuesta_grado',
  };

  renderInscripcion: boolean = true;

  suiteLoaded: boolean = false;
  selectedTags: string[] = [];
  maxTags: number = 0;
  contTag: number = 0;
  failedTags: string[] = [];
  sectionLabels: { [key: string]: string } = {
    info_persona: 'inscripcion.info_basica',
    formacion_academica: 'inscripcion.formacion_academica',
    idiomas: 'inscripcion.idiomas',
    experiencia_laboral: 'inscripcion.experiencia_laboral',
    produccion_academica: 'inscripcion.produccion_academica',
    documento_programa: 'inscripcion.documento_programa',
    descuento_matricula: 'inscripcion.descuento_matricula',
    propuesta_grado: 'inscripcion.propuesta_grado',
  };
  private sectionStatus: { [key: string]: string } = {};
  private sectionTimers: { [key: string]: any } = {};
  private expansionStarted: boolean = false;
  private readonly sectionTimeoutMs: number = 20000;
  //reduceWhenloading: number = 0.9;
  data = {
    INSCRIPCION: {},
    ASPIRANTE: {},
    PAGO: {},
    DOCUMENTACION: {},
  };
  showErrors = false;
  progressDownloadDocs: number = 0;
  triggeredDownload: boolean = false;

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  @Output('notificar_obs') notificar_obs: EventEmitter<any> =
    new EventEmitter();

  constructor(
    private translate: TranslateService,
    public pivotDocument: PivotDocument,
    private zipManagerService: ZipManagerService,
    private popUpManager: PopUpManager,
    private inscripcionMidService: InscripcionMidService,
    private gestorDocumentalService: NewNuxeoService,
    private inscripcionService: InscripcionService
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(event: any, obj: any): any {
    this.url_editar.emit(obj);
  }

  ngOnInit() {
    this.zipManagerService.limpiarArchivos();
    this.canUpdateDocument =
      <string>(
        (sessionStorage.getItem('IdEstadoInscripcion') || '').toUpperCase()
      ) === 'INSCRITO CON OBSERVACIÓN';
  }

  ngOnDestroy() {
    this.clearSectionTimers();
  }

  ngOnChanges() {
    this.imprimir = this.imprimir.toString() === 'true';
    this.en_revision = this.en_revision.toString() === 'true';
    this.manageSuiteTags(this.SuiteTags);
    if (this.imprimir) {
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('inscripcion.imprimir_comprobante'),
        this.translate.instant('inscripcion.info_impresion_auto'),
        'info',
        false
      );
    }
    if (this.reloadTagComponent != '') {
      this.manageReloadComponent(
        this.linkFolderWithTag[this.reloadTagComponent]
      );
    }
  }

  manageSuiteTags(Suite: any) {
    if (!this.suiteLoaded) {
      if (Suite == undefined) {
        this.suiteLoaded = false;
      } else {
        this.clearSectionTimers();
        this.selectedTags = [];
        this.sectionStatus = {};
        this.failedTags = [];
        this.contTag = 0;
        this.expansionStarted = false;
        Object.keys(Suite).forEach((tag: string) => {
          Suite[tag]['render'] = false;
          Suite[tag]['observacion'] = false;
          if (Suite[tag].selected && this.sectionLabels[tag]) {
            this.selectedTags = this.selectedTags.concat(tag);
          }
        });
        this.SuiteTags = Suite;
        this.maxTags = this.selectedTags.length;
        this.suiteLoaded = true;
        this.startExpansion();
      }
    }
  }

  manageReloadComponent(tagName: any) {
    this.SuiteTags[tagName].render = false;
    this.renderInscripcion = false;
    setTimeout(() => {
      this.SuiteTags[tagName].render = true;
      this.renderInscripcion = true;
    }, 1);
  }

  checkZeroObservations() {
    this.hasObservations = false;
    this.selectedTags.forEach((tag) => {
      if (this.SuiteTags[tag].observacion) {
        this.hasObservations = true;
      }
    });
  }

  changeToInscritoAgain() {
    this.inscripcionService
      .get('inscripcion/' + this.info_inscripcion_id)
      .subscribe(
        (resG: any) => {
          resG.EstadoInscripcionId.Id = 5; // id inscrito.
          resG.TerceroId = this.info_persona_id;
          resG.ValidacionRequisitos = true;
          this.inscripcionMidService
            .post('inscripciones/actualizar-inscripcion', resG)
            .subscribe(
              (res: any) => {
                if (res !== null && res.Status != '400') {
                  sessionStorage.setItem('IdEstadoInscripcion', '');
                  this.editar('', 'salir_preinscripcion');
                  this.popUpManager.showSuccessAlert(
                    this.translate.instant('inscripcion.cambio_estado_ok')
                  );
                } else {
                  this.popUpManager.showErrorAlert(
                    this.translate.instant('inscripcion.fallo_carga_mensaje')
                  );
                }
              },
              (err: any) => {
                if (err?.Message?.includes('No se ha completado la validación de requisitos')) {
                  Swal.fire({
                    icon: 'warning',
                    text: 'Debe completar todos los requisitos obligatorios antes de finalizar la inscripción',
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                } else {
                  this.popUpManager.showErrorAlert(
                    this.translate.instant('inscripcion.fallo_carga_mensaje')
                  );
                }
              }
            );
        },
        (err) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant('inscripcion.fallo_carga_mensaje')
          );
        }
      );
  }

  abrirDocumento(documento: any) {
    if (this.en_revision) {
      this.revisar_doc.emit(documento);
    } else {
      documento.observando = true;
      this.revisar_doc.emit(documento);
    }
  }

  descargar_compilado_zip() {
    let nombre: any = sessionStorage.getItem('nameFolder');
    nombre = nombre.toUpperCase();
    this.zipManagerService.generarZip(nombre).then((zip: any) => {
      this.guardar_archivo(zip, nombre, '.zip');
    });
  }

  descargar_comprobante_inscription() {
    let documentacion = this.zipManagerService.listarArchivos();
    let documentacionOrganizada: any = {};
    documentacion.forEach((doc) => {
      documentacionOrganizada[doc.carpeta] = {};
    });
    documentacion.forEach((doc) => {
      documentacionOrganizada[doc.carpeta][doc.grupoDoc] = [];
    });
    documentacion.forEach((doc) => {
      documentacionOrganizada[doc.carpeta][doc.grupoDoc].push(
        doc.nombreDocumento
      );
    });
    this.data.DOCUMENTACION = documentacionOrganizada;

    this.inscripcionMidService
      .post('recibos/comprobante-inscripcion', this.data)
      .subscribe(
        (response: any) => {
          const dataComprobante = new Uint8Array(
            atob(response['Data'])
              .split('')
              .map((char: any) => char.charCodeAt(0))
          );
          let comprobante_generado = window.URL.createObjectURL(
            new Blob([dataComprobante], { type: 'application/pdf' })
          );
          let nombre: any = sessionStorage.getItem('nameFolder');
          this.guardar_archivo(comprobante_generado, nombre, '.pdf');
        },
        (error) => {
          this.popUpManager.showErrorToast(
            this.translate.instant('inscripcion.fallo_carga_mensaje')
          );
        }
      );
  }

  descargar_archivos() {
    if (!this.triggeredDownload) {
      this.triggeredDownload = true;
      const lista = this.zipManagerService.listarArchivos();
      const limitQuery = lista.length;
      let idsForQuery = '';
      lista.forEach((f, i) => {
        idsForQuery += String(f.documentoId);
        if (i < limitQuery - 1) idsForQuery += '|';
      });
      this.gestorDocumentalService
        .getManyFiles('?query=Id__in:' + idsForQuery + '&limit=' + limitQuery)
        .subscribe(
          (r) => {
            if (r.downloadProgress) {
              const progressBar = document.getElementById('progressbar');
              if (progressBar) {
                progressBar.scrollIntoView({ behavior: 'smooth' });
              }
              this.progressDownloadDocs = r.downloadProgress;
            }
          },
          (e) => {
            this.progressDownloadDocs = 0;
            this.triggeredDownload = false;
          }
        );
    }
  }

  guardar_archivo(urlFile: string, nombre: string, extension: string) {
    let download = document.createElement('a');
    download.href = urlFile;
    download.download = nombre + extension;
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);
  }

  private startExpansion() {
    if (this.expansionStarted || this.selectedTags.length === 0) {
      return;
    }
    this.expansionStarted = true;
    this.selectedTags.forEach((tag: string) => this.armSectionTimer(tag));
    this.SuiteTags[this.selectedTags[0]].render = true;
  }

  private advanceExpansion() {
    if (!this.expansionStarted) {
      return;
    }
    while (this.contTag < this.selectedTags.length) {
      const tag = this.selectedTags[this.contTag];
      const status = this.sectionStatus[tag];
      if (status !== 'completed' && status !== 'failed') {
        return;
      }
      this.contTag++;
      if (this.contTag < this.selectedTags.length) {
        this.SuiteTags[this.selectedTags[this.contTag]].render = true;
      } else {
        this.onAllSectionsFinished();
      }
    }
  }

  private onAllSectionsFinished() {
    this.descargar_archivos();
    if (this.imprimir) {
      this.descargar_comprobante_inscription();
    }
  }

  private armSectionTimer(tag: string) {
    this.clearSectionTimer(tag);
    this.sectionTimers[tag] = setTimeout(() => {
      if (
        this.sectionStatus[tag] === 'completed' ||
        this.sectionStatus[tag] === 'failed'
      ) {
        return;
      }
      console.warn('[perfil] Tiempo de espera agotado en la sección:', tag);
      this.updateSectionStatus(tag, 'failed');
    }, this.sectionTimeoutMs);
  }

  private clearSectionTimer(tag: string) {
    if (this.sectionTimers[tag]) {
      clearTimeout(this.sectionTimers[tag]);
      delete this.sectionTimers[tag];
    }
  }

  private clearSectionTimers() {
    Object.keys(this.sectionTimers).forEach((tag: string) =>
      this.clearSectionTimer(tag)
    );
    this.sectionTimers = {};
  }

  private updateSectionStatus(tag: string, status: string) {
    if (!this.sectionLabels[tag]) {
      return;
    }
    this.sectionStatus[tag] = status;
    if (status === 'failed') {
      if (!this.failedTags.includes(tag)) {
        this.failedTags = this.failedTags.concat(tag);
      }
      console.error('[perfil] No se pudo cargar la sección:', tag);
    } else if (status === 'completed') {
      this.failedTags = this.failedTags.filter((failedTag: string) => failedTag !== tag);
    }
    if (status === 'completed' || status === 'failed') {
      this.clearSectionTimer(tag);
      this.advanceExpansion();
    }
  }

  manageLoading(infoCarga: any, actualTag: string) {
    if (infoCarga.status == 'completed') {
      if (actualTag == 'inscripcion') {
        this.data.INSCRIPCION = infoCarga.outInfo;
      }
      if (actualTag == 'info_persona') {
        this.data.ASPIRANTE = infoCarga.outInfo;
      }
    }

    if (actualTag == 'inscripcion' && infoCarga.EstadoInscripcion) {
      this.estado_inscripcion = infoCarga.EstadoInscripcion;
      this.showErrors = infoCarga.EstadoInscripcion != 'Inscripción solicitada';
    }

    if (actualTag == 'inscripcion' || !this.sectionLabels[actualTag]) {
      return;
    }

    if (infoCarga.status == 'start') {
      this.sectionStatus[actualTag] = 'loading';
      return;
    }

    if (infoCarga.status == 'completed' || infoCarga.status == 'failed') {
      this.updateSectionStatus(actualTag, infoCarga.status);
    }
  }

  notificar_observaciones_aspirante() {
    this.notificar_obs.emit(this.zipManagerService.listarArchivos());
  }
}
