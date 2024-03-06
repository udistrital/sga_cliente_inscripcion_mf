import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { SolicitudDescuento } from 'src/app/models/descuento/solicitud_descuento';
import { CoreService } from 'src/app/services/core.service';
import { DescuentoAcademicoService } from 'src/app/services/descuento_academico.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ListService } from 'src/app/services/list.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
import Swal from 'sweetalert2';
import { FORM_DESCUENTO } from './form-descuento_academico';

@Component({
  selector: 'ngx-crud-descuento-academico',
  templateUrl: './crud-descuento-academico.component.html',
  styleUrls: ['./crud-descuento-academico.component.scss']
})
export class CrudDescuentoAcademicoComponent implements OnInit {
  descuento_academico_id!: number;
  filesUp: any;
  SoporteDescuento: any;
  estado!: number;
  persona!: number;
  programa!: number;
  periodo!: number;
  inscripcion!: number;
  listed: number[] = [];
  isEdit: boolean = false;

  @Input('descuento_academico_id')
  set name(descuento_academico_id: number) {
    this.descuento_academico_id = descuento_academico_id;
    if (this.descuento_academico_id > 0){
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.info'),
        this.translate.instant('documento_programa.documento_cambiar'),
      );
      this.loadDescuentoAcademico();
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
    if (this.inscripcion !== undefined && this.inscripcion !== null && this.inscripcion !== 0 &&
      this.inscripcion.toString() !== '') {
        // this.loadOptionsTipoDescuento();
    }
  }

  @Input('already_listed')
  set info4(already_listed: number[]) {
    this.listed = already_listed;
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_descuento_academico: any;
  formDescuentoAcademico: any;
  regDescuentoAcademico: any;
  temp: any;
  info_temp: any;
  clean!: boolean;
  loading!: boolean;
  percentage!: number;

  constructor(
    private translate: TranslateService,
    private autenticationService: ImplicitAutenticationService,
    private documentoService: DocumentoService,
    private descuentoService: DescuentoAcademicoService,
    private inscripcionService: InscripcionService,
    private coreService: CoreService,
    private sgaMidService: SgaMidService,
    private store: Store<IAppState>,
    private listService: ListService,
    private popUpManager: PopUpManager,
    private newNuxeoService: NewNuxeoService,) {
    this.formDescuentoAcademico = FORM_DESCUENTO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    //this.cargarPeriodo();
    // this.listService.findDescuentoDependencia();
    this.findDescuentoAcademico(window.sessionStorage.getItem('ProgramaAcademicoId'));
    // this.loadLists();
  }

  findDescuentoAcademico(programa: any) {
    this.loading = true;
    // this.descuentoAcademicoService.get('tipo_descuento/?limit=0&query=Activo:true')
    this.sgaMidService.get('descuento_academico/descuentoAcademicoByID/' + programa)
    .subscribe(
      (result: any) => {
        const r = <any>result.Data.Body[1];
        if (result !== null && result.Data.Code == '404') {
          this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].opciones = []
        } else {
          this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].opciones = r.map((result: any) => {
            return {
              Id: result.Id,
              Nombre: result.Id + '. ' + result.Nombre,
            }
          });
        }
        this.loading = false;
      },
      error => {
        this.loading = false;
        this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].opciones = []
      },
    );
  }

  /* cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.coreService.get('periodo?query=Activo:true&sortby=Id&order=desc&limit=1')
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.periodo = <any>res[0].Id;
          resolve(this.periodo);
        }
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
        reject(error);
      });
    });
  } */

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        if (list.listDescuentoDependencia[0]) {
          this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].opciones = list.listDescuentoDependencia[0]
            .map((descuentoDependencia:any) => {
            return {
              Id: descuentoDependencia.Id,
              Nombre: descuentoDependencia.TipoDescuentoId.Id + '. ' + descuentoDependencia.TipoDescuentoId.Nombre,
            }
          });
        }
      },
   );
  }


  construirForm() {
    // this.formDescuentoAcademico.titulo = this.translate.instant('GLOBAL.descuento_academico');
    this.formDescuentoAcademico.btn = this.translate.instant('GLOBAL.guardar');
    this.formDescuentoAcademico.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formDescuentoAcademico.campos.length; i++) {
      this.formDescuentoAcademico.campos[i].label = this.translate.instant('GLOBAL.' + this.formDescuentoAcademico.campos[i].label_i18n);
      this.formDescuentoAcademico.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formDescuentoAcademico.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formDescuentoAcademico.campos.length; index++) {
      const element = this.formDescuentoAcademico.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public loadDescuentoAcademico(): void {
    this.loading = true;
    this.temp = {};
    this.SoporteDescuento = [];
    this.info_descuento_academico = {};
    this.filesUp = <any>{};
    if (this.descuento_academico_id !== undefined &&
      this.descuento_academico_id !== 0 &&
      this.descuento_academico_id.toString() !== '') {
        this.sgaMidService.get('descuento_academico?PersonaId=' + window.localStorage.getItem('persona_id') + '&SolicitudId=' + this.descuento_academico_id)
          .subscribe(solicitud => {
            if (solicitud !== null) {
              this.temp = <SolicitudDescuento>solicitud;
              this.info_descuento_academico = this.temp;
              this.loading = false;
                    this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].valor = (this.info_descuento_academico.DescuentosDependenciaId.TipoDescuentoId && this.info_descuento_academico.DescuentosDependenciaId.TipoDescuentoId.Id) ?
                    { Id: this.info_descuento_academico.DescuentosDependenciaId.TipoDescuentoId.Id,
                      Nombre: this.info_descuento_academico.DescuentosDependenciaId.TipoDescuentoId.Id + '. ' + this.info_descuento_academico.DescuentosDependenciaId.TipoDescuentoId.Nombre} :
                      { Id: 0, Nombre: 'No registrado' };
                    this.info_descuento_academico.Periodo = Number(window.sessionStorage.getItem('IdPeriodo'));
                    
            } else {
              this.loading = false;
            }
          },
          (error: HttpErrorResponse) => {
            this.loading = false;
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.descuento_matricula'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.temp = {};
      this.SoporteDescuento = [];
      this.filesUp = <any>{};
      this.info_descuento_academico = undefined;
      this.clean = !this.clean;
      this.loading = false;
    }
  }

  updateDescuentoAcademico(DescuentoAcademico: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('GLOBAL.actualizar') + '?',
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
          this.loading = true;
          this.info_descuento_academico = <SolicitudDescuento>DescuentoAcademico;
          const files = [];
          if (this.info_descuento_academico.Documento.file !== undefined) {
            files.push({
              IdDocumento: 7,
              nombre: this.autenticationService.getPayload().sub,
              file: this.info_descuento_academico.Documento.file, 
            })
          }
          if (files.length !== 0) {
            this.newNuxeoService.uploadFiles(files)
              .subscribe((responseNux: any[]) => {
                if (responseNux[0].Status == "200") {
                  const documentos_actualizados = <any>responseNux[0].res
                  this.info_descuento_academico.DocumentoId = documentos_actualizados.Id;
                  this.info_descuento_academico.Id = this.descuento_academico_id;
                  this.info_descuento_academico.PeriodoId = Number(window.sessionStorage.getItem('IdPeriodo'));
                  this.info_descuento_academico.PersonaId = (1 * this.persona);
                  this.info_descuento_academico.DescuentoDependencia.Dependencia = Number(window.sessionStorage.getItem('ProgramaAcademicoId'));
                  this.info_descuento_academico.DescuentoDependencia.Periodo = Number(window.sessionStorage.getItem('IdPeriodo'));
          
                  this.info_descuento_academico.DescuentosDependenciaId = this.info_descuento_academico.DescuentoDependencia;
                  
                  this.sgaMidService.put('descuento_academico', this.info_descuento_academico)
                    .subscribe(res => {
                      /* if (documentos_actualizados['SoporteDescuento'] !== undefined) {
                        this.info_descuento_academico.Documento = documentos_actualizados['SoporteDescuento'].url + '';
                      } */
                      this.loading = false;
                      this.eventChange.emit(true);
                      this.popUpManager.showSuccessAlert(this.translate.instant('descuento_academico.descuento_actualizado'));
                      this.clean = !this.clean;
                      this.info_descuento_academico = undefined;
                      this.descuento_academico_id = 0;
                      this.loadDescuentoAcademico();
                    },
                      (error: HttpErrorResponse) => {
                        Swal.fire({
                          icon:'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                            this.translate.instant('GLOBAL.descuento_matricula'),
                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                        });
                      });
                }
              },
                (error: HttpErrorResponse) => {
                  this.loading = false;
                  Swal.fire({
                    icon:'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                      this.translate.instant('GLOBAL.descuento_matricula') + '|' +
                      this.translate.instant('GLOBAL.soporte_documento'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          } else {
            this.info_descuento_academico.DocumentoId = this.SoporteDescuento;
            this.info_descuento_academico.Id = this.descuento_academico_id;
            this.info_descuento_academico.PeriodoId = Number(window.sessionStorage.getItem('IdPeriodo'));
            this.info_descuento_academico.PersonaId = (1 * this.persona);
            this.info_descuento_academico.DescuentosDependenciaId = this.info_descuento_academico.DescuentoDependencia;

            this.sgaMidService.put('descuento_academico', this.info_descuento_academico)
              .subscribe(res => {
                this.loading = false;
                this.eventChange.emit(true);
                this.popUpManager.showSuccessAlert(this.translate.instant('descuento_academico.descuento_actualizado'));
                this.clean = !this.clean;
                this.info_descuento_academico = undefined;
                this.descuento_academico_id = 0;
                this.loadDescuentoAcademico();
              },
                (error: HttpErrorResponse) => {
                  this.loading = false;
                  Swal.fire({
                    icon:'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                      this.translate.instant('GLOBAL.descuento_matricula'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          }
        }
      });
  }

  createDescuentoAcademico(DescuentoAcademico: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('descuento_academico.seguro_continuar_registrar_descuento'),
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
          this.loading = true;
          const files = [];
          this.info_descuento_academico = <SolicitudDescuento>DescuentoAcademico;
          this.info_descuento_academico.PersonaId = Number(window.localStorage.getItem('persona_id'));
          // this.info_descuento_academico.PeriodoId = this.periodo;
          this.info_descuento_academico.PeriodoId = Number(window.sessionStorage.getItem('IdPeriodo'));
          this.info_descuento_academico.DescuentoDependencia.Dependencia = Number(window.sessionStorage.getItem('ProgramaAcademicoId'));
          // this.info_descuento_academico.DescuentoDependencia.Periodo = Number(this.periodo);
          this.info_descuento_academico.DescuentoDependencia.Periodo = Number(window.sessionStorage.getItem('IdPeriodo'));
          this.info_descuento_academico.DescuentoDependencia.Activo = true;
          this.info_descuento_academico.DescuentosDependenciaId = this.info_descuento_academico.DescuentoDependencia;
          if (this.info_descuento_academico.Documento.file !== undefined) {
            files.push({
              IdDocumento: 7,
              nombre: this.autenticationService.getPayload().sub,
              file: this.info_descuento_academico.Documento.file, 
            });
          }
          this.newNuxeoService.uploadFiles(files).subscribe(
            (responseNux: any[]) => {
              if (responseNux[0].Status == "200") {
                
                  this.info_descuento_academico.DocumentoId = responseNux[0].res.Id;
                
                // this.info_descuento_academico.DocumentoId = 1234
                this.sgaMidService.post('descuento_academico/', this.info_descuento_academico)
                  .subscribe(res => {
                    const r = <any>res
                    if (r !== null && r.Type !== 'error') {
                      this.eventChange.emit(true);
                      // this.showToast('info', this.translate.instant('GLOBAL.crear'),
                      // this.translate.instant('descuento_academico.descuento_academico_registrado'));
                      this.popUpManager.showSuccessAlert(this.translate.instant('descuento_academico.descuento_academico_registrado'));
                      this.setPercentage(1);
                      this.descuento_academico_id = 0;
                      this.info_descuento_academico = undefined;
                      this.clean = !this.clean;
                    } else {
                      this.popUpManager.showErrorAlert(this.translate.instant('documento_programa.documento_programa_no_registrado'));
                      // this.showToast('error', this.translate.instant('GLOBAL.error'),
                      //   this.translate.instant('descuento_academico.descuento_academico_no_registrado'));
                    }
                    this.loading = false;
                  },
                  (error: HttpErrorResponse) => {
                    this.loading = false;
                    Swal.fire({
                      icon: 'error',
                      title: error.status + '',
                      text: this.translate.instant('ERROR.' + error.status),
                      footer: this.translate.instant('descuento_academico.descuento_academico_no_registrado'),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                  });
              }
              this.loading = false;
            },
            (error: HttpErrorResponse) => {
              this.loading = false;
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('descuento_academico.documento_descuento_academico_no_registrado'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
        }
      });
  }

  ngOnInit() {
    //this.loadDescuentoAcademico();
  }

  setPercentage(event:any) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  validarForm(event:any) {
    if (event.valid) {
      const idActualSelect = this.formDescuentoAcademico.campos[this.getIndexForm('DescuentoDependencia')].valor.Id;
      if (this.listed.find(id => id === idActualSelect) && !this.isEdit) {
        this.popUpManager.showAlert(
          this.translate.instant('GLOBAL.info'),
          this.translate.instant('inscripcion.ya_existe_registro'),
        )
      } else {
        if (this.info_descuento_academico === undefined) {
          this.createDescuentoAcademico(event.data.SolicitudDescuento);
        } else {
          this.updateDescuentoAcademico(event.data.SolicitudDescuento);
        }
        this.isEdit = false;
      }
      // this.result.emit(event);
    }
  }
}