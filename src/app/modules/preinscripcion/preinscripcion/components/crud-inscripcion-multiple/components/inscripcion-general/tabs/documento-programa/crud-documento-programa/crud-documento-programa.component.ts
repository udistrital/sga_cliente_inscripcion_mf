import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { SoporteDocumentoPrograma } from 'src/app/models/documento/soporte_documento_programa';
import { DocumentoService } from 'src/app/services/documento.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UserService } from 'src/app/services/users.service';
import { FORM_DOCUMENTO_PROGRAMA } from './form-documento_programa';

@Component({
  selector: 'ngx-crud-documento-programa',
  templateUrl: './crud-documento-programa.component.html',
  styleUrls: ['./crud-documento-programa.component.scss']
})
export class CrudDocumentoProgramaComponent implements OnInit {
  documento_programa_id!: number;
  filesUp: any;
  Documento: any;
  persona!: number | null;
  programa!: number;
  periodo!: number;
  inscripcion!: number;
  soporteId!: number;
  tipoInscripcion!: number;
  listed: number[] = [];
  isEdit: boolean = false;

  

  @Input('documento_programa_id')
  set name(documento_programa_id: number) {
    this.documento_programa_id = documento_programa_id;
    if (this.documento_programa_id !== undefined && this.documento_programa_id !== null &&
      this.documento_programa_id !== 0 && this.documento_programa_id.toString() !== '') {
      this.loadDocumentoPrograma();
      this.isEdit = true;
    }
  }

  @Input('persona_id')
  set info(persona_id: number | null) {
    this.persona = persona_id;
  }

  @Input('inscripcion_id')
  set info2(inscripcion_id: number) {
    this.inscripcion = inscripcion_id;
  }

  @Input('soporte_id')
  set info3(soporte_id: number) {
    this.soporteId = soporte_id;
  }

  @Input('already_listed')
  set info4(already_listed: number[]) {
    this.listed = already_listed;
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename

  tipo_documentos!: any[];
  info_documento_programa: any;
  documentoTemp: any;
  formDocumentoPrograma: any;
  regDocumentoPrograma: any;
  temp: any;
  programaDocumento: any;
  tipoProgramaDocumento: any;
  clean!: boolean;
  valido!: boolean;
  percentage!: number;
  sin_docs: boolean = false;

  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
    private newNuxeoService: NewNuxeoService,
  ) {
    this.formDocumentoPrograma = FORM_DOCUMENTO_PROGRAMA;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  ngOnInit() {
    this.programa = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!, 10) // this.userService.getPrograma();
    this.periodo = parseInt(sessionStorage.getItem('IdPeriodo')!, 10) // this.userService.getPeriodo();
    this.tipoInscripcion = parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10);
    this.sin_docs = false;
    this.loadLists();
  }

  public loadLists() {
    this.tipo_documentos = [];
    this.sin_docs = false;
    this.inscripcionService.get('documento_programa?query=Activo:true,PeriodoId:' + this.periodo + ',ProgramaId:' + this.programa + ',TipoInscripcionId:' + this.tipoInscripcion + '&limit=0').subscribe(
      (response: Object[]) => {
        if(response.length == 0){
          this.popUpManager.showErrorToast(this.translate.instant('inscripcion.no_documentos_proyecto'));
        }else{
          if(response === undefined || response === null){
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          }
          else if (response.length == 1 && !response[0].hasOwnProperty('TipoDocumentoProgramaId')){
            this.popUpManager.showErrorAlert(this.translate.instant('documento_programa.no_documentos'));
            this.tipo_documentos = [{TipoDocumentoProgramaId: {Id: 1, Nombre: "-"}}];
            this.sin_docs = true;
          }
          else{
            this.tipo_documentos = <any[]>response;
            this.sin_docs = false;
          }
        }
          this.eventChange.emit(this.tipo_documentos.length);
          this.construirForm();
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  construirForm() {
    if(this.sin_docs){
      this.formDocumentoPrograma.btn = false;
      this.formDocumentoPrograma.btnLimpiar = false;
    }
    else{
      this.formDocumentoPrograma.btn = this.translate.instant('GLOBAL.guardar');
      this.formDocumentoPrograma.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    }
    this.formDocumentoPrograma.campos.forEach((campo:any) => {
      campo.label = this.translate.instant('GLOBAL.' + campo.label_i18n);
      campo.placeholder = this.translate.instant('GLOBAL.placeholder_' + campo.label_i18n);
      campo.deshabilitar = this.sin_docs;
      if (campo.etiqueta === 'select') {
        this.tipo_documentos.map(tipo => {
          if (<boolean>tipo['Obligatorio'] == true){
            tipo['TipoDocumentoProgramaId']["Nombre"] = tipo['TipoDocumentoProgramaId']["Nombre"]+" *"
          }
        })
        campo.opciones = this.tipo_documentos.map(tipo => tipo['TipoDocumentoProgramaId']);
      }
    });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formDocumentoPrograma.campos.length; index++) {
      const element = this.formDocumentoPrograma.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  validarForm(event:any) {
    if (event.valid) {
      const idActualSelect = this.formDocumentoPrograma.campos[this.getIndexForm('DocumentoProgramaId')].valor.Id;
      if (this.listed.find(id => id === idActualSelect) && !this.isEdit) {
        this.popUpManager.showAlert(
          this.translate.instant('GLOBAL.info'),
          this.translate.instant('inscripcion.ya_existe_registro'),
        )
      } else if (this.info_documento_programa === undefined) {
        this.createDocumentoPrograma(event.data.DocumentoPrograma)
        this.isEdit = false;
      } else {
        this.updateDocumentoPrograma(event.data.DocumentoPrograma);
        this.isEdit = false;
      }
    }
  }

  public loadDocumentoPrograma(): void {
    this.info_documento_programa = new SoporteDocumentoPrograma();
    this.info_documento_programa.DocumentoProgramaId = { Id: this.documento_programa_id }
    this.popUpManager.showAlert(
      this.translate.instant('GLOBAL.info'),
      this.translate.instant('documento_programa.documento_cambiar'),
    );
  }

  createDocumentoPrograma(documentoPrograma: any): void {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('documento_programa.seguro_continuar_registrar'),
      this.translate.instant('GLOBAL.crear'),
    ).then((ok:any) => {
      if (ok.value) {
        this.info_documento_programa = <SoporteDocumentoPrograma>documentoPrograma;
        this.info_documento_programa.PersonaId = Number(this.persona) || 1;
        this.info_documento_programa.DocumentoProgramaId = this.info_documento_programa.DocumentoProgramaId;
        const file = {
          IdDocumento: 6,
          nombre: "soporte_documento_programa",
          file: this.info_documento_programa.Documento.file,
        }
        this.uploadFile(file).then(
          fileId => {
            const soporteDocumentoPrograma = new SoporteDocumentoPrograma();
            soporteDocumentoPrograma.DocumentoId = fileId;
            soporteDocumentoPrograma.DocumentoProgramaId = {
              Id: this.tipo_documentos.filter(
                obj => obj.TipoDocumentoProgramaId.Id === this.info_documento_programa.DocumentoProgramaId.Id,
              )[0].Id,
            };
            soporteDocumentoPrograma.InscripcionId = { Id: Number(this.inscripcion) };
            this.inscripcionService.post('soporte_documento_programa', soporteDocumentoPrograma).subscribe(
              (response:any) => {
                this.popUpManager.showSuccessAlert(this.translate.instant('documento_programa.documento_programa_registrado'));
                this.documento_programa_id = 0;
                this.info_documento_programa = undefined;
                this.clean = !this.clean;
                this.eventChange.emit("actualizar");
              },
              (error:any) => {
                this.popUpManager.showErrorToast(this.translate.instant('documento_programa.documento_programa_no_registrado'));
              },
            )
          },
        ).catch(
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
          },
        );
      }
    });
  }

  updateDocumentoPrograma(documentoPrograma: any) {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('documento_programa.seguro_continuar_registrar'),
      this.translate.instant('GLOBAL.actualizar'),
    ).then((ok:any) => {
      if (ok.value) {
        this.inscripcionService.get('soporte_documento_programa/' + this.soporteId).subscribe(
          (response:any) => {
            const soporte = <SoporteDocumentoPrograma>response;
            this.info_documento_programa = <SoporteDocumentoPrograma>documentoPrograma;
            this.info_documento_programa.PersonaId = Number(this.persona) || 1;
            const file = {
              IdDocumento: 6,
              nombre: "soporte_documento_programa",
              file: this.info_documento_programa.Documento.file,
            }
            this.uploadFile(file).then(
              fileId => {
                soporte.DocumentoId = fileId;
                this.inscripcionService.put('soporte_documento_programa', soporte).subscribe(
                  (response: any) => {
                    this.popUpManager.showSuccessAlert(this.translate.instant('documento_programa.documento_programa_registrado'));
                    this.documento_programa_id = 0;
                    this.info_documento_programa = undefined;
                    this.clean = !this.clean;
                    this.eventChange.emit("actualizar");
                  },
                  (error:any) => {
                    this.popUpManager.showErrorToast(this.translate.instant('documento_programa.documento_programa_no_registrado'));
                  },
                )
              },
            ).catch(
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
              },
            );
          },
          (error:any) => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
          },
        );
      }
    });
  }

  uploadFile(file:any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.newNuxeoService.uploadFiles([file]).subscribe(
        (responseNux: any[]) => {
          if(responseNux[0].Status == "200"){
            resolve(responseNux[0].res.Id);
          } else {
            reject()
          }
        }, (error:any) => {
          reject(error);
        });
    });
  }

}
