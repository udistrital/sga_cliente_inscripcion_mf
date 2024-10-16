import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { PivotDocument } from 'src/app/services/pivot_document.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { ZipManagerService } from 'src/app/services/zip-manager.service';

@Component({
  selector: 'ngx-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
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

  @Input('reloadTagComponent') reloadTagComponent: string = "";

  hasObservations: boolean = false;
  canUpdateDocument: boolean = false;

  linkFolderWithTag:any = {
    "Información Básica": "info_persona",
    "Formación Académica": "formacion_academica",
    "Experiencia Laboral": "experiencia_laboral",
    "Producción Académica": "produccion_academica",
    "Documentos Solicitados": "documento_programa",
    "Descuentos de Matrícula": "descuento_matricula",
    "Propuesta de Trabajo de Grado": "propuesta_grado"
  }

  renderInscripcion: boolean = true;

  suiteLoaded: boolean = false;
  selectedTags: string[] = [];
  maxTags: number = 0;
  contTag: number = 0;
  //reduceWhenloading: number = 0.9;
  data = {
    "INSCRIPCION": {},
    "ASPIRANTE": {},
    "PAGO": {},
    "DOCUMENTACION": {}
  };
  showErrors = false;
  checkComplete: boolean = false;
  progressDownloadDocs: number = 0;
  triggeredDownload: boolean = false;

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

  // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  @Output('notificar_obs') notificar_obs: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService,
    public pivotDocument: PivotDocument,
    private zipManagerService: ZipManagerService,
    private popUpManager: PopUpManager,
    private inscripcionMidService: InscripcionMidService,
    private gestorDocumentalService: NewNuxeoService,
    private inscripcionService: InscripcionService,) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(event: any, obj: any): any {
    this.url_editar.emit(obj);
  }

  ngOnInit() {
    this.zipManagerService.limpiarArchivos();
    this.canUpdateDocument = <string>(sessionStorage.getItem('IdEstadoInscripcion') || "").toUpperCase() === "INSCRITO CON OBSERVACIÓN";
  }

  ngOnChanges() {
    this.imprimir = this.imprimir.toString() === 'true';
    this.en_revision = this.en_revision.toString() === 'true';
    this.manageSuiteTags(this.SuiteTags);
    if (this.imprimir) {
      this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.imprimir_comprobante'), this.translate.instant('inscripcion.info_impresion_auto'), 'info', false);
    }
    if (this.reloadTagComponent != "") {
      this.manageReloadComponent(this.linkFolderWithTag[this.reloadTagComponent]);
    } 

  }

  manageSuiteTags(Suite: any) {
    if (!this.suiteLoaded) {
      if (Suite == undefined) {
        this.suiteLoaded = false;
      } else {
        Object.keys(Suite).forEach((tag: string) => {
          Suite[tag]["render"] = false;
          Suite[tag]["observacion"] = false;
          if (Suite[tag].selected) {
            this.selectedTags = this.selectedTags.concat(tag);
          }
        })
        this.SuiteTags = Suite;
        this.maxTags = this.selectedTags.length;
        this.suiteLoaded = true;
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
    this.selectedTags.forEach(tag => {
      if (this.SuiteTags[tag].observacion) {
        console.log(tag,"-->",this.SuiteTags[tag].observacion)
        this.hasObservations = true;
      }
    });
  }

  changeToInscritoAgain() {
    this.inscripcionService.get('inscripcion/' + this.info_inscripcion_id)
      .subscribe((resG: any) => {
        resG.EstadoInscripcionId.Id = 5; // id inscrito.
        resG.TerceroId = this.info_persona_id;
        this.inscripcionMidService.post('inscripciones/actualizar-inscripcion', resG)
          .subscribe((res: any) => {
            if (res !== null && res.Status != '400') {
              sessionStorage.setItem('IdEstadoInscripcion', "");
              this.editar("", 'salir_preinscripcion');
              this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.cambio_estado_ok'));
            } else {
              this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.fallo_carga_mensaje'));
            }
          }, err => {
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.fallo_carga_mensaje'));
          })
      }, err => {
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.fallo_carga_mensaje'));
      });
  }

  abrirDocumento(documento: any) {
    console.log("DOCUMENTO A ABRIR", documento);
    if (this.en_revision) {
      this.revisar_doc.emit(documento)
    } else {
      documento.observando = true;
      this.revisar_doc.emit(documento)
    }
  }

  descargar_compilado_zip() {
    let nombre: any = sessionStorage.getItem('nameFolder');
    nombre = nombre.toUpperCase();
    this.zipManagerService.generarZip(nombre).then((zip: any) => {
      this.guardar_archivo(zip, nombre, ".zip");
    })
  }

  descargar_comprobante_inscription() {
    let documentacion = this.zipManagerService.listarArchivos();
    let documentacionOrganizada: any = {};
    documentacion.forEach(doc => {
      documentacionOrganizada[doc.carpeta] = {}
    })
    documentacion.forEach(doc => {
      documentacionOrganizada[doc.carpeta][doc.grupoDoc] = []
    })
    documentacion.forEach(doc => {
      documentacionOrganizada[doc.carpeta][doc.grupoDoc].push(doc.nombreDocumento)
    })
    this.data.DOCUMENTACION = documentacionOrganizada;

    this.inscripcionMidService.post('recibos/comprobante-inscripcion', this.data).subscribe(
      (response: any) => {
        const dataComprobante = new Uint8Array(atob(response['Data']).split('').map((char: any) => char.charCodeAt(0)));
        let comprobante_generado = window.URL.createObjectURL(new Blob([dataComprobante], { type: 'application/pdf' }));
        let nombre: any = sessionStorage.getItem('nameFolder');
        this.guardar_archivo(comprobante_generado, nombre, ".pdf");
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('inscripcion.fallo_carga_mensaje'));
      },
    );
  }

  descargar_archivos() {
    if (!this.triggeredDownload) {
      this.triggeredDownload = true;
      const lista = this.zipManagerService.listarArchivos();
      const limitQuery = lista.length;
      let idsForQuery = "";
      lista.forEach((f, i) => {
        idsForQuery += String(f.documentoId);
        if (i < limitQuery - 1) idsForQuery += '|';
      });
      this.gestorDocumentalService.getManyFiles('?query=Id__in:' + idsForQuery + '&limit=' + limitQuery)
        .subscribe(r => {
          if (r.downloadProgress) {
            const progressBar = document.getElementById("progressbar");
            if (progressBar) {
              progressBar.scrollIntoView({ behavior: 'smooth' });
            }
            this.progressDownloadDocs = r.downloadProgress;
          }
        }, e => {
          this.progressDownloadDocs = 0;
        });
    }
  }

  guardar_archivo(urlFile: string, nombre: string, extension: string) {
    let download = document.createElement("a");
    download.href = urlFile;
    download.download = nombre + extension;
    document.body.appendChild(download);
    download.click();
    document.body.removeChild(download);
  }

  siguienteTagDesde(actualTag: string) {
    if (this.contTag < this.maxTags - 1) {
      /*       if (actualTag != undefined) {
              this.SuiteTags[actualTag].buttonNext = false;
            } */
      this.SuiteTags[this.selectedTags[this.contTag]].render = true;
      //this.SuiteTags[this.selectedTags[this.contTag]].buttonNext = true;
      // HAHHAHAHAHAHAHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA HAY QUE SOLUCIONAR!! document.getElementById(this.selectedTags[this.contTag]).scrollIntoView({ behavior: 'smooth' })
      this.properlyCont(actualTag);
    } else if (this.contTag < this.maxTags) {
      //this.SuiteTags[this.selectedTags[this.contTag-1]].buttonNext = false;
      this.properlyCont(actualTag);
      this.descargar_archivos();

      if (this.imprimir) {
        this.descargar_comprobante_inscription();
      }
    }
  }

  

  properlyCont(actualTag: any) {
    if (this.contTag > 0) {
      if (this.selectedTags[this.contTag - 1] == actualTag) {
        this.contTag++;
      }
    } else {
      this.contTag++;
    }
  }

  manageLoading(infoCarga: any, actualTag: string) {
    if (infoCarga.status == "start") {
      this.checkComplete = false;
    }
    if (infoCarga.status == "completed") {
      if (actualTag == "inscripcion") {
        this.data.INSCRIPCION = infoCarga.outInfo;
      }
      if (actualTag == "info_persona") {
        this.data.ASPIRANTE = infoCarga.outInfo;
      }
    }

    if ((actualTag == "inscripcion") && infoCarga.EstadoInscripcion) {
      this.estado_inscripcion = infoCarga.EstadoInscripcion
      this.showErrors = infoCarga.EstadoInscripcion != "Inscripción solicitada";
    }

    if (infoCarga.status == "failed") {
      if (this.showErrors || this.en_revision) {
        if (actualTag != "inscripcion") {
          if (this.SuiteTags[actualTag].required) {
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.fallo_carga_mensaje'));
          }
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.fallo_carga_mensaje'));
        }
      }
      if (!this.checkComplete) {
        this.checkComplete = true;
        this.siguienteTagDesde(actualTag);
      }
    }

    if (infoCarga.status == "completed" && !this.checkComplete) {
      this.checkComplete = true;
      this.siguienteTagDesde(actualTag);
    }

  }

  notificar_observaciones_aspirante() {
    this.notificar_obs.emit(this.zipManagerService.listarArchivos());
  }

}
