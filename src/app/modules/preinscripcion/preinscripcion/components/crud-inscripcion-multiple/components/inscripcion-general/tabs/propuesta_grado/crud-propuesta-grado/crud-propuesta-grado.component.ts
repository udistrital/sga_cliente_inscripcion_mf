import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { PropuestaGrado } from 'src/app/models/inscripcion/propuesta_grado';
import { PropuestaPost } from 'src/app/models/inscripcion/propuesta_post';
import { DocumentoService } from 'src/app/services/documento.service';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ListService } from 'src/app/services/list.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
import Swal from 'sweetalert2';
import { FORM_PROPUESTA_GRADO } from './form-propuesta_grado';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'ngx-crud-propuesta-grado',
  templateUrl: './crud-propuesta-grado.component.html',
  styleUrls: ['./crud-propuesta-grado.component.scss']
})
export class CrudPropuestaGradoComponent implements OnInit {
  propuesta_grado_id!: number;
  prop_id!: number;
  inscripcion_id!: number;
  persona_id!: number;
  filesUp9: any;
  FormatoProyecto: any;

  @Input('propuesta_grado_id')
  set name(propuesta_grado_id: number) {
    this.propuesta_grado_id = propuesta_grado_id;
    if (this.propuesta_grado_id !== undefined && this.propuesta_grado_id !== null && this.propuesta_grado_id !== 0 &&
      this.propuesta_grado_id.toString() !== '') {
    }
  }

  @Input('persona_id')
  set info(persona_id: number) {
    this.persona_id = persona_id;
  }

  @Input('inscripcion_id')
  set info2(inscripcion_id: number) {
    if (inscripcion_id !== undefined && inscripcion_id !== 0 && inscripcion_id.toString() !== '') {
      this.inscripcion_id = inscripcion_id;
      // this.loadPropuestaGrado();
      if (this.formData) {
        this.createPropuestaGrado(this.formData);
      }
    }
  }

  @Output() crear_inscripcion: EventEmitter<any> = new EventEmitter();

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_propuesta_grado: any;
  info_propuesta_grado_post: any;
  formPropuestaGrado: any;
  regPropuestaGrado: any;
  clean!: boolean;
  existePropuesta!: boolean;
  percentage!: number;
  grupoSeleccionado: any;
  formData: any;
  canEmit: boolean = false;

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private inscripcionService: InscripcionService,
    private store: Store<IAppState>,
    private listService: ListService,
    private popUpManager: PopUpManager,
    private newNuxeoService: NewNuxeoService,
    private utilidades: UtilidadesService,
    private snackBar: MatSnackBar) {
      this.listService.findGrupoInvestigacion();
      this.listService.findLineaInvestigacion();
      this.listService.findTipoProyecto();
    this.formPropuestaGrado = FORM_PROPUESTA_GRADO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.cargarValores().then(aux => {
      this.loadLists();
    });
    this.loadPropuestaGrado();
  }

  async cargarValores() {
    try {
      await this.listService.findGrupoInvestigacion();
      await this.listService.findLineaInvestigacion();
      await this.listService.findTipoProyecto();
    } catch (error) {
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
    }
  }

  construirForm() {
    this.formPropuestaGrado.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formPropuestaGrado.campos.length; i++) {
      this.formPropuestaGrado.campos[i].label = this.translate.instant('GLOBAL.' + this.formPropuestaGrado.campos[i].label_i18n);
      this.formPropuestaGrado.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formPropuestaGrado.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formPropuestaGrado.campos.length; index++) {
      const element = this.formPropuestaGrado.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  getSeleccion(event:any) {
  }

  setOption(field:any, id:any) {
    const campo = this.formPropuestaGrado.campos[this.getIndexForm(field)]
    const opciones = campo.opciones;
    const dataFilter = opciones.filter((f:any) => (f.id == id));
    if (dataFilter.length > 0) {
      campo.valor = dataFilter[0];
    }
  }

  public loadPropuestaGrado(): void {
    this.inscripcionService.get('propuesta?query=Activo:true,InscripcionId:' + Number(window.sessionStorage.getItem('IdInscripcion')))
      .subscribe(res => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          this.existePropuesta = true;
          const temp = <PropuestaGrado>res[0];
          const files9 = []
          if (temp.DocumentoId + '' !== '0') {
            files9.push({ Id: temp.DocumentoId });
          }
          this.newNuxeoService.get(files9).subscribe(
            response_2 => {
              const filesResponse_2 = <any>response_2;
              if ((Object.keys(filesResponse_2).length !== 0)) {
                temp.FormatoProyecto = filesResponse_2[0].url;
                temp.TipoProyecto = temp.TipoProyectoId;
                this.info_propuesta_grado = { ...this.info_propuesta_grado, ...temp };
                this.FormatoProyecto = temp.DocumentoId;
                this.setOption('GrupoInvestigacion', temp.GrupoInvestigacionId);
                this.setOption('LineaInvestigacion', temp.LineaInvestigacionId);
                let estadoDoc = this.utilidades.getEvaluacionDocumento(filesResponse_2[0].Metadatos);
                this.formPropuestaGrado.campos[this.getIndexForm('FormatoProyecto')].estadoDoc = estadoDoc;
              }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.cargar') + '-' +
                    this.translate.instant('GLOBAL.propuesta_grado') + '|' +
                    this.translate.instant('GLOBAL.linea_investigacion'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              })
        } else {
          this.percentage = 0;
          this.result.emit(this.percentage);
        }
      }, (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.cargar') + '-' +
            this.translate.instant('GLOBAL.propuesta_grado') + '|' +
            this.translate.instant('GLOBAL.linea_investigacion'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      })
  }

  createPropuestaGrado(propuestaGrado: any): void {
    const opt: any = {
      title: this.existePropuesta ? this.translate.instant('GLOBAL.actualizar') : this.translate.instant('GLOBAL.crear'),
      text: this.existePropuesta ? this.translate.instant('propuesta_grado.seguro_continuar_actualizar') : this.translate.instant('propuesta_grado.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_propuesta_grado = <PropuestaGrado>propuestaGrado;
          const files = [];
          if (this.info_propuesta_grado.FormatoProyecto.file !== undefined) {
            files.push({
              IdDocumento: 5,
              nombre: this.autenticationService.getPayload().sub,
              file: this.info_propuesta_grado.FormatoProyecto.file, 
            });
          }
          if (this.existePropuesta) {
            this.putPropuestaGrado(files);
          } else {
            this.uploadResolutionFile(files);
          }
        }
      });
  }

  uploadResolutionFile(file:any) {
    return new Promise((resolve, reject) => {
      this.newNuxeoService.uploadFiles(file).subscribe(
        (responseNux: any[]) => {
            if (responseNux[0].Status == "200") {
              this.info_propuesta_grado_post = new PropuestaPost;
              this.info_propuesta_grado_post.Id = 0;
              this.info_propuesta_grado_post.Activo = true;
              this.info_propuesta_grado_post.Nombre = this.info_propuesta_grado.Nombre;
              this.info_propuesta_grado_post.Resumen = this.info_propuesta_grado.Resumen;
              this.info_propuesta_grado_post.TipoProyectoId = this.info_propuesta_grado.TipoProyectoId;
              this.info_propuesta_grado_post.DocumentoId = responseNux[0].res.Id;
              this.info_propuesta_grado_post.GrupoInvestigacionId = this.info_propuesta_grado.GrupoInvestigacion.id;
              this.info_propuesta_grado_post.LineaInvestigacionId = this.info_propuesta_grado.LineaInvestigacion.id;

              this.inscripcionService.get('inscripcion/' + Number(window.sessionStorage.getItem('IdInscripcion')))
                .subscribe(res => {
                  const r = <any>res;
                  if (r !== null && r.Type !== 'error') {
                    this.info_propuesta_grado_post.InscripcionId = r;
                    this.inscripcionService.post('propuesta/', this.info_propuesta_grado_post)
                      .subscribe(res => {
                        const r = <any>res;
                        if (r !== null && r.Type !== 'error') {
                          this.info_propuesta_grado = <PropuestaGrado><unknown>res;
                          this.canEmit = true;
                          this.setPercentage(1);
                          this.eventChange.emit(true);
                          this.popUpManager.showSuccessAlert(this.translate.instant('propuesta_grado.propuesta_grado_registrada'));
                        } else {
                          this.popUpManager.showErrorToast(this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'));
                        }
                      },
                        (error: HttpErrorResponse) => {
                          Swal.fire({
                            icon: 'error',
                            title: error.status + '',
                            text: this.translate.instant('ERROR.' + error.status),
                            footer: this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'),
                            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                          });
                        });

                  } else {
                      this.snackBar.open(this.translate.instant('GLOBAL.error'), '', { duration: 3000, panelClass: ['error-snackbar'] }) 
                  }
                },
                  (error: HttpErrorResponse) => {
                    Swal.fire({
                      icon: 'error',
                      title: error.status + '',
                      text: this.translate.instant('ERROR.' + error.status),
                      footer: this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                  });
            }
        }, error => {
          reject(error);
        });
    });
  }

  putPropuestaGrado(file:any) {
    if (file.length > 0) {
      return new Promise((resolve, reject) => {
        this.newNuxeoService.uploadFiles(file).subscribe(
          (responseNux: any[]) => {
            if (responseNux[0].Status == "200") {
                this.actualizar(responseNux[0].res.Id);
            }
          }, error => {
            reject(error);
          });
      });
    } else {
      return new Promise((resolve, reject) => {
        this.actualizar(this.info_propuesta_grado.DocumentoId);
      });
    }
  }

  actualizar(documentoID: number) {
    this.info_propuesta_grado_post = new PropuestaPost;
    this.info_propuesta_grado_post.Id = this.info_propuesta_grado.Id;
    this.info_propuesta_grado_post.Activo = true;
    this.info_propuesta_grado_post.Nombre = this.info_propuesta_grado.Nombre;
    this.info_propuesta_grado_post.Resumen = this.info_propuesta_grado.Resumen;
    this.info_propuesta_grado_post.TipoProyectoId = this.info_propuesta_grado.TipoProyectoId;
    this.info_propuesta_grado_post.DocumentoId = documentoID;
    this.info_propuesta_grado_post.GrupoInvestigacionId = this.info_propuesta_grado.GrupoInvestigacion.id;
    this.info_propuesta_grado_post.LineaInvestigacionId = this.info_propuesta_grado.LineaInvestigacion.id;

    this.inscripcionService.get('inscripcion/' + Number(window.sessionStorage.getItem('IdInscripcion')))
      .subscribe(res => {
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          this.info_propuesta_grado_post.InscripcionId = r;
          this.inscripcionService.put('propuesta/', this.info_propuesta_grado_post)
            .subscribe(res => {
              const r = <any>res;
              if (r !== null && r.Type !== 'error') {
                this.info_propuesta_grado = <PropuestaGrado><unknown>res;
                this.canEmit = true;
                this.setPercentage(1);
                this.eventChange.emit(true);
                this.popUpManager.showSuccessAlert(this.translate.instant('propuesta_grado.propuesta_grado_actualizada'));
              } else {
                this.popUpManager.showErrorAlert(this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'));
              }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });

        } else {
          this.snackBar.open(this.translate.instant('GLOBAL.error'), '', { duration: 3000, panelClass: ['error-snackbar'] }) 
        }
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('propuesta_grado.propuesta_grado_no_registrada'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  ngOnInit() {
  }

  validarForm(event:any) {
    if (event.valid) {
      this.formData = event.data.PropuestaGrado;
      if (!this.inscripcion_id && this.inscripcion_id != undefined) {
        this.crear_inscripcion.emit(this.formData);
      } else {
        this.createPropuestaGrado(this.formData);
      }
      //this.result.emit(event);
    }
  }

  setPercentage(event:any) {
    this.percentage = event;
    if (this.canEmit) {
      this.result.emit(this.percentage);
      this.canEmit = false;
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list: any) => {
        this.formPropuestaGrado.campos[this.getIndexForm('GrupoInvestigacion')].opciones = [
          ...[{ id: 0, name: 'No aplica' }],
          ...list.listGrupoInvestigacion[0]
        ];
        this.formPropuestaGrado.campos[this.getIndexForm('LineaInvestigacion')].opciones = [
          ...[{ id: 0, st_name: 'No aplica' }],
          ...list.listLineaInvestigacion[0]
        ];
        this.formPropuestaGrado.campos[this.getIndexForm('TipoProyectoId')].opciones = list.listTipoProyecto[0];
      },
    );
  }
}

