import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { SoporteDocumentoPrograma } from 'src/app/models/documento/soporte_documento_programa';
import { DocumentoService } from 'src/app/services/documento.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UserService } from 'src/app/services/users.service';
import { FORM_EXAMEN_ESTADO } from './examen-estado';
import { MatTableDataSource } from '@angular/material/table';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { MODALS } from 'src/app/models/informacion/diccionario';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { co } from '@fullcalendar/core/internal-common';

interface Examen {
  orden: number;
  examen: string;
  tipoExamen: string;
  tipoDocumento: string;
  documento: string;
  snp: string;
  confirmarSnp: string;
  anoPresentacion: string;
  soporte: File | null;
  linkDoc: any;
}

@Component({
  selector: 'ngx-view-examen-estado',
  templateUrl: './view-examen-estado.component.html',
  styleUrls: ['./view-examen-estado.component.scss']
})
export class ViewExamenEstadoComponent {

  documento_programa_id!: number;
  filesUp: any;
  Documento: any;
  persona!: number;
  programa!: number;
  periodo!: number;
  inscripcion!: number;
  soporteId!: number;
  tipoInscripcion!: number;
  listed: number[] = [];
  isEdit: boolean = false;

  displayedColumns: string[] = ['orden', 'examen', 'tipoExamen', 'tipoDocumento', 'documento', 'snp', 'confirmarSnp', 'anoPresentacion', 'soporte'];
  dataSource = new MatTableDataSource<Examen>([
    { orden: 1, examen: 'Saber 11 (ICFES)', tipoExamen: '', tipoDocumento: '', documento: '', snp: '', confirmarSnp: '', anoPresentacion: '', soporte: null, linkDoc: null },
    { orden: 2, examen: 'Saber TyT (ECAES)', tipoExamen: '', tipoDocumento: '', documento: '', snp: '', confirmarSnp: '', anoPresentacion: '', soporte: null, linkDoc: null }
  ]);
  tiposExamen: string[] = ['AC', 'VG'];

  onFileChange(event: any, element: any) {
    const files = <File[]>Object.values(event.target.files);
    const newFiles = files.map((f) => {
      return { file: f, urlTemp: URL.createObjectURL(f), err: false };
    });
    element.linkDoc = newFiles[0]["urlTemp"]
    element.soporte = newFiles[0];
  }

  gridItems: any = {};



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
  set info(persona_id: number) {
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
  loading!: boolean;
  valido!: boolean;
  percentage!: number;
  sin_docs: boolean = false;
  tipos_icfes!: any;
  tipos_documentos!: any;
  existeIcfes!: boolean
  vigencia!: number;

  constructor(
    private translate: TranslateService,
    private documentoService: DocumentoService,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private newNuxeoService: NewNuxeoService,
    private evaluacionInscripcionService: EvaluacionInscripcionService,
    private sgamidService: SgaMidService,
    private tercerosService: TercerosService
  ) {
    this.formDocumentoPrograma = FORM_EXAMEN_ESTADO;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      // this.construirForm();
    });
    this.consultarVigencia();
  }

  async ngOnInit() {
    this.programa = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!, 10) // this.userService.getPrograma();
    this.periodo = parseInt(sessionStorage.getItem('IdPeriodo')!, 10) // this.userService.getPeriodo();
    this.tipoInscripcion = parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10);
    this.sin_docs = false;
    this.detallesExamenEstado();
    this.tipos_icfes = await this.recuperarTiposIcfes();
    this.tipos_documentos = await this.recuperarTiposDocumentos();
    await this.preCargarIcfes();
    // this.loadLists();
  }


  consultarVigencia(){
    
    this.evaluacionInscripcionService.get(
      "requisito_programa_academico?query=Activo:true,ProgramaAcademicoId:" +
      sessionStorage.getItem("ProgramaAcademicoId") +
      ",PeriodoId:" +
      localStorage.getItem('IdPeriodo')
    )
    .subscribe(response => {
      if (response[0].Id !== undefined && response[0] !== "{}" && response.Type !== "error")  {

        this.vigencia = JSON.parse(response[0].PorcentajeEspecifico).vigencia;
  
      }else {
        console.log("error consultando vigencia")
      
      }

    });
  }

  async preCargarIcfes() {
    const inscripcionPregrado: any = await this.recuperarInscripcionPregradoByInscripcion(this.inscripcion)
    if (Object.keys(inscripcionPregrado[0]).length > 0) {
      this.existeIcfes = true;
      const icfes: any = this.dataSource.filteredData.find((item: any) => item.examen === "Saber 11 (ICFES)")
      const tipoDoc: any = this.tipos_documentos.find((item: any) => item.Id === inscripcionPregrado[0].TipoDocumentoIcfes)
      icfes.anoPresentacion = inscripcionPregrado[0].AnoIcfes;
      icfes.confirmarSnp = inscripcionPregrado[0].CodigoIcfes;
      icfes.documento = inscripcionPregrado[0].NumeroIdentificacionIcfes;
      icfes.snp = inscripcionPregrado[0].CodigoIcfes;
      icfes.tipoDocumento = tipoDoc;
      icfes.tipoExamen = inscripcionPregrado[0].TipoIcfesId.CodigoAbreviacion;
    } else {
      this.existeIcfes = false;
    }
  }

  recuperarInscripcionPregradoByInscripcion(inscripcionId: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion_pregrado?query=Activo:true,InscripcionId.Id:' + inscripcionId + '&sortby=Id&order=asc&limit=0')
        .subscribe(
          (res: any) => {
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.tercero_error'));
            reject([]);
          }
        );
    });
  }

  recuperarTiposIcfes() {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('tipo_icfes?query=Activo:true&sortby=Id&order=asc&limit=0')
        .subscribe(
          (res: any) => {
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.tercero_error'));
            reject([]);
          }
        );
    });
  }

  recuperarTiposDocumentos() {
    return new Promise((resolve, reject) => {
      this.tercerosService.get('tipo_documento?query=Activo:true&sortby=Id&order=asc&limit=0')
        .subscribe(
          (res: any) => {
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.tercero_error'));
            reject([]);
          }
        );
    });
  }

  detallesExamenEstado() {
    this.evaluacionInscripcionService.get('detalle_evaluacion?limit=0&query=InscripcionId:574').subscribe(
      (response: any) => {
        if (response === undefined || response === null) {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        } else {
          response.forEach((element: any) => {
            if (element.DetalleCalificacion.length > 0) {
              this.gridItems = JSON.parse(element.DetalleCalificacion);
            }
          });
        }
      });
  }

  // public loadLists() {
  //   this.tipo_documentos = [];
  //   this.periodo = 9;
  //   this.programa = 25;
  //   console.log(this.periodo, this.programa, this.tipoInscripcion);
  //   this.sin_docs = false;
  //   // this.inscripcionService.get('documento_programa?query=Activo:true,PeriodoId:' + this.periodo + ',ProgramaId:' + this.programa + ',TipoInscripcionId:' + this.tipoInscripcion + '&limit=0').subscribe(
  //     this.inscripcionService.get('documento_programa?query=Activo:true,PeriodoId:' + this.periodo + ',ProgramaId:' + this.programa + '&limit=0').subscribe(
  //     (response: Object[]) => {
  //       console.log(response);
  //       if(response === undefined || response === null){
  //         this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
  //       }
  //       else if (response.length == 1 && !response[0].hasOwnProperty('TipoDocumentoProgramaId')){
  //         this.popUpManager.showErrorAlert(this.translate.instant('documento_programa.no_documentos'));
  //         this.tipo_documentos = [{TipoDocumentoProgramaId: {Id: 1, Nombre: "-"}}];
  //         this.sin_docs = true;
  //       }
  //       else{
  //         this.tipo_documentos = <any[]>response;
  //         this.sin_docs = false;
  //       }
  //         this.eventChange.emit(this.tipo_documentos.length);
  //         this.construirForm();
  //     },
  //     error => {
  //       this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
  //     },
  //   );
  // }

  // construirForm() {
  //   if(this.sin_docs){
  //     this.formDocumentoPrograma.btn = false;
  //     this.formDocumentoPrograma.btnLimpiar = false;
  //   }
  //   else{
  //     this.formDocumentoPrograma.btn = this.translate.instant('GLOBAL.guardar');
  //     this.formDocumentoPrograma.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
  //   }
  //   this.formDocumentoPrograma.campos.forEach((campo:any) => {
  //     campo.label = this.translate.instant('GLOBAL.' + campo.label_i18n);
  //     campo.placeholder = this.translate.instant('GLOBAL.placeholder_' + campo.label_i18n);
  //     campo.deshabilitar = this.sin_docs;
  //     if (campo.etiqueta === 'select') {
  //       this.tipo_documentos.map(tipo => {
  //         if (<boolean>tipo['Obligatorio'] == true){
  //           tipo['TipoDocumentoProgramaId']["Nombre"] = tipo['TipoDocumentoProgramaId']["Nombre"]+" *"
  //         }
  //       })
  //       campo.opciones = this.tipo_documentos.map(tipo => tipo['TipoDocumentoProgramaId']);
  //     }
  //   });
  // }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formDocumentoPrograma.campos.length; index++) {
      const element = this.formDocumentoPrograma.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

    //Bloquea inpur de snp para que no pueda copiar ni pegar
    blockEvent(event: ClipboardEvent) {
      event.preventDefault();  // Previene la acción predeterminada (copiar, cortar o pegar)
    }

  validarForm(event: any) {
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
    ).then((ok: any) => {
      if (ok.value) {
        this.loading = true;
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
              (response: any) => {
                this.loading = false;
                this.popUpManager.showSuccessAlert(this.translate.instant('documento_programa.documento_programa_registrado'));
                this.documento_programa_id = 0;
                this.info_documento_programa = undefined;
                this.clean = !this.clean;
                this.eventChange.emit(true);
              },
              (error: any) => {
                this.popUpManager.showErrorToast(this.translate.instant('documento_programa.documento_programa_no_registrado'));
                this.loading = false;
              },
            )
          },
        ).catch(
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
            this.loading = false;
          },
        );
      }
    });
  }

  updateDocumentoPrograma(documentoPrograma: any) {
    this.popUpManager.showConfirmAlert(
      this.translate.instant('documento_programa.seguro_continuar_registrar'),
      this.translate.instant('GLOBAL.actualizar'),
    ).then((ok: any) => {
      if (ok.value) {
        this.loading = true;
        this.inscripcionService.get('soporte_documento_programa/' + this.soporteId).subscribe(
          (response: any) => {
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
                    this.loading = false;
                    this.popUpManager.showSuccessAlert(this.translate.instant('documento_programa.documento_programa_registrado'));
                    this.documento_programa_id = 0;
                    this.info_documento_programa = undefined;
                    this.clean = !this.clean;
                    this.eventChange.emit(true);
                  },
                  (error: any) => {
                    this.popUpManager.showErrorToast(this.translate.instant('documento_programa.documento_programa_no_registrado'));
                    this.loading = false;
                  },
                )
              },
            ).catch(
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
                this.loading = false;
              },
            );
          },
          (error: any) => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.error_subir_documento'));
            this.loading = false;
          },
        );
      }
    });
  }

  uploadFile(file: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.newNuxeoService.uploadFiles([file]).subscribe(
        (responseNux: any[]) => {
          if (responseNux[0].Status == "200") {
            resolve(responseNux[0].res.Id);
          } else {
            reject()
          }
        }, (error: any) => {
          reject(error);
        });
    });
  }

  previewFile(url: string): void {
    const h = screen.height * 0.65;
    const w = (h * 3) / 4;
    const left = (screen.width * 3) / 4 - w / 2;
    const top = screen.height / 2 - h / 2;
    window.open(url, '', 'toolbar=no,' + 'location=no, directories=no, status=no, menubar=no,' + 'scrollbars=no, resizable=no, copyhistory=no, ' + 'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  }

  async guardar() {
    const data = this.dataSource.filteredData;
    const validacion: any = await this.validarData(data);
    if (validacion) {
      this.popUpManager.showPopUpGeneric(this.translate.instant('documento_programa.titulo'), this.translate.instant('documento_programa.guardar_documentos'), MODALS.INFO, true).then(
        async (action) => {
          if (action.value) {
            await this.prepararCreacion(data);
          }
        });
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('documento_programa.formulario_error'));
    }
  }

  async prepararCreacion(data: any) {
    for (const item of data) {
      // SE VERIFICA QUE SI EL ITEM ES EL DE ICFES NO TENGA DATOS EN LA DB
      if (item.examen === "Saber 11 (ICFES)" && this.existeIcfes) {
        this.popUpManager.showSuccessAlert(this.translate.instant('documento_programa.icfes_existente'));
        this.popUpManager.showAlert(this.translate.instant('documento_programa.documento_programa_registrado'), this.translate.instant('documento_programa.icfes_existente'))
        continue;
      }
      if (item.soporte) {
        if (item.examen === "Saber 11 (ICFES)") {
          const archivo: any = this.prepararArchivo(item.soporte);
          let idArchivo: any = await this.cargarArchivos(archivo);
          const tipo_icfes: any = this.tipos_icfes.find((tipo: any) => tipo.CodigoAbreviacion == item.tipoExamen)

          const info_pregrado: any = {
            "InscripcionId": {
              "Id": this.inscripcion
            },
            "CodigoIcfes": item.snp,
            "TipoDocumentoIcfes": item.tipoDocumento.Id,
            "NumeroIdentificacionIcfes": Number(item.documento), //aqui
            "AnoIcfes": Number(item.anoPresentacion), //aqui
            "Activo": true,
            "TipoIcfesId": {
              "Id": tipo_icfes.Id
            },
            "Valido": false,
            "Uid": idArchivo[0]
          }

          await this.crearInscripcionPregradoBySNP(info_pregrado)
        }
      }
    }
  }

  async validarData(data: any) {

    if(data[0].anoPresentacion){
      const tiempoDesdePresentacion = new Date().getFullYear() -  data[0].anoPresentacion;
     if(tiempoDesdePresentacion >= this.vigencia){
        return false;
     }
    }

    if(data[1].anoPresentacion){
      const tiempoDesdePresentacion = new Date().getFullYear() -  data[1].anoPresentacion;
     if(tiempoDesdePresentacion >= this.vigencia){
        return false;
     }
    }



    if (!this.existeIcfes) {
      const examenSaber11 = data.find((item: any) => item.examen === "Saber 11 (ICFES)");
      let snp;
      let confirmarSnp;

      //VALIDA QUE LA DATA DEL EXAMEN ICFES EXISTA
      if (!examenSaber11) {
        return false;
      }

      // VALIDA QUE ESTEN COMPLETOS LOS DATOS 
      for (const [key, value] of Object.entries(examenSaber11)) {
        if (key !== 'examen' && (value === null || value === "")) {
          return false; // Si se encuentra un campo nulo o vacío, retorna false.
        }
        if (key === 'snp') {
          snp = value;
        } else if (key === 'confirmarSnp') {
          confirmarSnp = value;
        }
      }

      // VALIDA QUE EL CÓDIGO SNP NO EXISTA YA EN LA DB
      const inscripcion: any = await this.recuperarInscripcionPregradoBySNP(snp)
      if (Object.keys(inscripcion[0]).length != 0) {
        this.popUpManager.showErrorToast(this.translate.instant('documento_programa.snp_repetido'));
        return false
      }

      // VALIDA QUE EL CÓDIGO SNP SEA EL MISMO QUE EN LA CONFIRMACIÓN
      if (snp != confirmarSnp) {
        return false;
      }
    }

    return true;
  }

  recuperarInscripcionPregradoBySNP(snp: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion_pregrado?query=Activo:true,CodigoIcfes:' + snp + '&sortby=Id&order=asc&limit=0')
        .subscribe(
          (res: any) => {
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.tercero_error'));
            reject([]);
          }
        );
    });
  }

  crearInscripcionPregradoBySNP(data: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.post('inscripcion_pregrado', data)
        .subscribe(
          (res: any) => {
            this.popUpManager.showSuccessAlert(this.translate.instant('documento_programa.creacion_inscripcion_pregrado_exito'));
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('documento_programa.creacion_inscripcion_pregrado_fallo'));
            reject([]);
          }
        );
    });
  }

  prepararArchivo(archivo: any) {
    const idTipoDocument = 171;
    let archivos: any = [];
    // TODO: RECUPERAR EL ARCHIVO
    const newArchivo = {
      IdDocumento: idTipoDocument,
      nombre: archivo.file.name.split('.')[0],
      descripcion: 'Soporte examen de estado',
      file: archivo.file,
    };
    archivos.push(newArchivo)
    return archivos
  }

  cargarArchivos(archivos: any): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      this.newNuxeoService
        .uploadFiles(archivos)
        .subscribe((respuesta: any[]) => {
          const listaIds = respuesta.map((f) => {
            return f.res.Id;
          });
          resolve(listaIds);
        });
    });
  }

}
