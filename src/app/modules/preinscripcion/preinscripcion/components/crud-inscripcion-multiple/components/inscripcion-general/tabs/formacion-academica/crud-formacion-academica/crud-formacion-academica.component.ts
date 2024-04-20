import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { isDate } from 'moment-timezone';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InfoPersona } from 'src/app/models/informacion/info_persona';
import { Lugar } from 'src/app/models/informacion/lugar';
import { Parametro } from 'src/app/models/parametro/parametro';
import { DocumentoService } from 'src/app/services/documento.service';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { ListService } from 'src/app/services/list.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
import Swal from 'sweetalert2';
import { FORM_FORMACION_ACADEMICA, NUEVO_TERCERO } from './form-formacion_academica';
import { CalendarioMidService } from 'src/app/services/sga_calendario_mid.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';

@Component({
  selector: 'ngx-crud-formacion-academica',
  templateUrl: './crud-formacion-academica.component.html',
  styleUrls: ['./crud-formacion-academica.component.scss']
})
export class CrudFormacionAcademicaComponent implements OnInit {
  info_formacion_academica_id!: number;
  info_proyecto_id!: number;
  info_id_formacion!: number;
  edit_status!: boolean;
  organizacion: any;
  persona_id: number;
  nuevoTercero: boolean = false;
  SoporteDocumento: any;
  filesUp: any;
  listaPaises!: Lugar[];
  nit: any;
  nuevoPrograma: boolean = false;
  canEmit: boolean = false;

  isLinear = true;
  data: any = {};

  

  @Input('info_formacion_academica_id')
  set name(info_formacion_academica_id: number) {
    this.info_formacion_academica_id = info_formacion_academica_id;
  }

  @Input('info_id_formacion')
  set name_id(info_id_formacion: number) {
    this.info_id_formacion = info_id_formacion;
  }

  @Input('info_proyecto_id')
  set name_(info_proyecto_id: number) {
    this.info_proyecto_id = info_proyecto_id;
    this.loadInfoFormacionAcademica();
  }

  @Input('edit_status')
  set name_s(edit_status: boolean) {
    this.edit_status = edit_status;
    this.loadInfoFormacionAcademica();
  }

  @Output()
  eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result')
  result: EventEmitter<any> = new EventEmitter();
  @Output()
  updateFormacion: EventEmitter<void> = new EventEmitter();

  info_formacion_academica: any;
  formTestOne: any;
  formInfoFormacionAcademica: any;
  formInfoNuevoTercero: any;
  regInfoFormacionAcademica: any;
  temp_info_academica: any;
  clean!: boolean;
  percentage!: number;
  paisSelecccionado: any;
  infoComplementariaUniversidadId: number = 1;
  universidadConsultada: any;

  NombreProgramaNuevo = new FormControl('', [Validators.required]);

  constructor(private _formBuilder: FormBuilder,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private inscripcionMidService: InscripcionMidService,
    private tercerosService: TercerosService,
    private autenticationService: ImplicitAutenticationService,
    private users: UserService,
    private store: Store<IAppState>,
    private listService: ListService,
    private newNuxeoService: NewNuxeoService,
    private parametrosService: ParametrosService,
    private utilidades: UtilidadesService,) {
    this.formInfoFormacionAcademica = FORM_FORMACION_ACADEMICA;
    this.formInfoNuevoTercero = NUEVO_TERCERO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadLists();
    this.persona_id = this.users.getPersonaId();
    this.listService.findPais();
    //this.listService.findProgramaAcademico();
    this.listService.findTipoTercero();
  }

  construirForm() {

    this.formInfoFormacionAcademica.btn = this.translate.instant('GLOBAL.guardar');
    this.formInfoFormacionAcademica.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formInfoFormacionAcademica.campos.length; i++) {
      this.formInfoFormacionAcademica.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoFormacionAcademica.campos[i].label_i18n);
      this.formInfoFormacionAcademica.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formInfoFormacionAcademica.campos[i].label_i18n);
      if (this.formInfoFormacionAcademica.campos[i].placeholder_i18n_2) {
        this.formInfoFormacionAcademica.campos[i].placeholder2 = this.translate.instant('GLOBAL.placeholder_' + 
          this.formInfoFormacionAcademica.campos[i].placeholder_i18n_2)
      }
    }

    this.formInfoNuevoTercero.btn = this.translate.instant('GLOBAL.guardar');
    this.formInfoNuevoTercero.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formInfoNuevoTercero.campos.length; i++) {
      this.formInfoNuevoTercero.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoNuevoTercero.campos[i].label_i18n);
      this.formInfoNuevoTercero.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formInfoNuevoTercero.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getEvento(event:any) {
    switch (event.name) {
      case "selected_value_autocomplete_Buscador":
        if(event.value != null){
          this.searchNit(event.value.NIT)
        } else {
          FORM_FORMACION_ACADEMICA.campos.filter( (campo:any) => {
            if (campo.nombre == "Buscador"){
              campo.opciones = [
                {
                  "NIT": null,
                  "NombreCompleto": "CREAR NUEVO REGISTRO",
                  "Label": "CREAR NUEVO REGISTRO"
                }
              ]
            }
          }) 
        }
        break;
      case "selected_value_autocomplete_ProgramaAcademico":
        if(event.value.noOpciones){
          this.popUpManager.showPopUpGeneric(this.translate.instant('GLOBAL.programa_academico_no_encontrado'),this.translate.instant('GLOBAL.crear_programa_academico'), "info", true).then(
            accion => {
              if (accion.value) {
                this.nuevoPrograma = true;
                this.NombreProgramaNuevo.setValue(event.valorBuscado);
                this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'),this.translate.instant('inscripcion.alerta_veracidad_informacion'));
              }
            }
          )
        }

    }
    // if (event.nombre == "ProgramaAcademico" && event.noOpciones) {
      
    // }
  }

  guardarProgramaNuevo(){
    if (this.NombreProgramaNuevo.valid) {
      let nombre = <string>this.NombreProgramaNuevo.value;
      let ProgramaPost: Parametro = {
        Id: 0,
        Nombre: nombre.toUpperCase(),
        Descripcion: nombre.toUpperCase(),
        CodigoAbreviacion: "",
        Activo: true,
        NumeroOrden: 0,
        TipoParametroId: {
          Id: 60,
          Nombre: "",
          Descripcion: "",
          CodigoAbreviacion: "",
          Activo: false,
          NumeroOrden: 0
        }
      };
      
      this.popUpManager.showConfirmAlert(this.translate.instant('GLOBAL.crear_programa_academico')).then(
        (Accion) => {
          if (Accion.value) {
            this.parametrosService.post('parametro',ProgramaPost).subscribe(
              (response:any) => {
                if (response.Status == "201") {
                  this.popUpManager.showSuccessAlert(this.translate.instant('GLOBAL.programa_creado_ok'));
                  this.nuevoPrograma = false;
                  this.formInfoFormacionAcademica.campos[this.getIndexForm("ProgramaAcademico")].valor = response.Data;
                } else {
                  this.popUpManager.showErrorAlert(this.translate.instant('GLOBAL.programa_creado_fail'))
                }
              }, 
              (error) => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
              }
            );
          }
        }
      );
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoFormacionAcademica.campos.length; index++) {
      const element = this.formInfoFormacionAcademica.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  searchNit(nit: string | null) {
    if (nit != null){
      nit = nit.trim();
      this.nit = nit.trim();
      const init = this.getIndexForm('Nit');
      const inombre = this.getIndexForm('NombreUniversidad');
      const idir = this.getIndexForm('Direccion');
      const itel = this.getIndexForm('Telefono');
      const icorreo = this.getIndexForm('Correo');
      const iPais = this.getIndexForm('Pais');
      this.formInfoFormacionAcademica.campos[init].valor = nit;
      
      this.inscripcionMidService.get('academico/formacion/informacion-universidad/nit/?Id=' + nit)
        .subscribe((res: any) => {
          this.universidadConsultada = res.data;
          this.formInfoFormacionAcademica.campos[init].valor = this.universidadConsultada.NumeroIdentificacion;
          this.formInfoFormacionAcademica.campos[inombre].valor =
            (this.universidadConsultada.NombreCompleto && this.universidadConsultada.NombreCompleto.Id) ? this.universidadConsultada.NombreCompleto : { Id: 0, Nombre: 'No registrado' };
          this.formInfoFormacionAcademica.campos[idir].valor = (this.universidadConsultada.Direccion) ? this.universidadConsultada.Direccion : 'No registrado';
          this.formInfoFormacionAcademica.campos[itel].valor = (this.universidadConsultada.Telefono) ? this.universidadConsultada.Telefono : 'No registrado';
          this.formInfoFormacionAcademica.campos[icorreo].valor = (this.universidadConsultada.Correo) ? this.universidadConsultada.Correo : 'No registrado';
          this.formInfoFormacionAcademica.campos[iPais].valor = (this.universidadConsultada.Ubicacion && this.universidadConsultada.Ubicacion.Id) ? this.universidadConsultada.Ubicacion : { Id: 0, Nombre: 'No registrado' };
          [this.formInfoFormacionAcademica.campos[init],
          this.formInfoFormacionAcademica.campos[inombre],
          this.formInfoFormacionAcademica.campos[idir],
          this.formInfoFormacionAcademica.campos[icorreo],
          this.formInfoFormacionAcademica.campos[iPais],
          this.formInfoFormacionAcademica.campos[itel]]
            .forEach(element => {
              element.deshabilitar = element.valor ? true : false
            });
        },
          (error: HttpErrorResponse) => {
            if (error.status === 404) {
              [this.formInfoFormacionAcademica.campos[inombre],
              this.formInfoFormacionAcademica.campos[idir],
              this.formInfoFormacionAcademica.campos[icorreo],
              this.formInfoFormacionAcademica.campos[iPais],
              this.formInfoFormacionAcademica.campos[itel]]
                .forEach(element => {
                  element.deshabilitar = true;
                  element.valor = '';
                });
            }
            const opt: any = {
              title: this.translate.instant('informacion_academica.titulo1_crear_entidad') + ` ${nit} ` +
                this.translate.instant('informacion_academica.titulo2_crear_entidad'),
              text: this.translate.instant('informacion_academica.crear_entidad'),
              icon: 'warning',
              buttons: true,
              dangerMode: true,
              showCancelButton: true,
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
            };
            Swal.fire(opt)
              .then((action) => {
                if (action.value) {
                  this.nuevoTercero = true;
                }
              });
          });
    } else {
      const opt: any = {
        title: this.translate.instant('informacion_academica.crear_entidad'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      };
      Swal.fire(opt)
        .then((action) => {
          if (action.value) {
            this.nuevoTercero = true;
          }
        });
    }
  }

  NuevoTercero(event:any) {
    this.nuevoTercero = false;
    const iNit = this.getIndexForm('Nit');
    this.formInfoFormacionAcademica.campos[iNit].valor = event['infoPost'].Nit;
    this.searchNit(event['infoPost'].Nit);
  }

  onChangeDate (){
    this.formInfoFormacionAcademica.campos[this.getIndexForm('FechaFinalizacion')].minDate
    = this.formInfoFormacionAcademica.campos[this.getIndexForm('FechaInicio')].valor
    if(this.formInfoFormacionAcademica.campos[this.getIndexForm('FechaFinalizacion')].valor < 
    this.formInfoFormacionAcademica.campos[this.getIndexForm('FechaInicio')].valor){
      this.formInfoFormacionAcademica.campos[this.getIndexForm('FechaFinalizacion')].valor = ''
    }
  }

  updateFinishDate (data:any){
    if(data.button == 'FormacionBoton' || data == 'EditOption'){
      const fechaFinalizacion = this.formInfoFormacionAcademica.campos[this.getIndexForm('FechaFinalizacion')]
      this.formInfoFormacionAcademica.campos[this.getIndexForm('Telefono')].ocultar = true
      fechaFinalizacion.requerido = !fechaFinalizacion.requerido
      fechaFinalizacion.deshabilitar = !fechaFinalizacion.deshabilitar
      fechaFinalizacion.ocultar = !fechaFinalizacion.ocultar
      if(fechaFinalizacion.deshabilitar){
        fechaFinalizacion.valor = ''
        this.formInfoFormacionAcademica.campos[this.getIndexForm('FormacionBoton')].icono = 'fa fa-check'
      }else{
        this.formInfoFormacionAcademica.campos[this.getIndexForm('FormacionBoton')].icono = ''
      }
      
    }
  }

  searchDoc(data:any) {
    if(data.button == "BusquedaBoton"){
      if(data.data.Nit){
        const init = this.getIndexForm('Nit');
        const inombre = this.getIndexForm('NombreUniversidad');
        const idir = this.getIndexForm('Direccion');
        const itel = this.getIndexForm('Telefono');
        const icorreo = this.getIndexForm('Correo');
        const iPais = this.getIndexForm('Pais');
        const regex = /^[0-9]+(?:-[0-9]+)*$/;
        data.data.Nit = data.data.Nit.trim()
        const nit = typeof data === 'string' ? data : data.data.Nit;
        let IdUniversidad;
        if (regex.test(nit) === true) {
          this.searchNit(nit);
  
          this.info_formacion_academica = undefined;
          this.info_formacion_academica_id = 0;
          this.edit_status = false;
        } else {
          if (this.formInfoFormacionAcademica.campos[inombre].valor ? 
            this.formInfoFormacionAcademica.campos[inombre].valor.Id ? true : false : false) {
            IdUniversidad = this.formInfoFormacionAcademica.campos[this.getIndexForm('NombreUniversidad')].valor.Id;
            this.tercerosService.get('datos_identificacion?query=TerceroId__Id:' + IdUniversidad).subscribe(
              (res: any) => {
                this.searchNit(res[0]['Numero']);
  
                this.info_formacion_academica = undefined;
                this.info_formacion_academica_id = 0;
                this.edit_status = false;
              }
            )
          } else {
            /* [this.formInfoFormacionAcademica.campos[idir],
            this.formInfoFormacionAcademica.campos[icorreo],
            this.formInfoFormacionAcademica.campos[iPais],
            this.formInfoFormacionAcademica.campos[itel]]
              .forEach(element => {
                element.deshabilitar = false;
              }); */
            this.loadListUniversidades(nit);
            //this.nit = nit;
            //this.formInfoFormacionAcademica.campos[inombre].valor = nit;
            this.formInfoFormacionAcademica.campos[init].valor = null;
          }
        }
      } else {
        this.popUpManager.showAlert(this.translate.instant('inscripcion.formacion_academica'), this.translate.instant('GLOBAL.no_vacio'))
      }
    } 
  }

  loadListUniversidades(nombre: string): void {
    if (nombre) {
      nombre = nombre.trim();
      let consultaUniversidades: Array<any> = [];
      const universidad: Array<any> = [];
      this.inscripcionMidService.get('academico/formacion/informacion-universidad/nombre?nombre=' + nombre)
        .subscribe(res => {
          if (res !== null) {
            consultaUniversidades = <Array<InfoPersona>>res;
            for (let i = 0; i < consultaUniversidades.length; i++) {
              universidad.push(consultaUniversidades[i]);
            }
          }
          this.formInfoFormacionAcademica.campos[this.getIndexForm('NombreUniversidad')].opciones = universidad;
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('informacion_academica.error_cargar_universidad'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
      } else {
        this.popUpManager.showAlert(this.translate.instant('inscripcion.formacion_academica'), this.translate.instant('GLOBAL.no_vacio'))
      }
  }

  public loadInfoFormacionAcademica(): void {
    if ((this.info_formacion_academica_id !== 0 && this.info_proyecto_id !== 0 && this.persona_id !== 0 && this.info_id_formacion !== 0)
      && (this.info_formacion_academica_id !== undefined && this.info_proyecto_id !== undefined && this.persona_id !== undefined && this.info_id_formacion !== undefined)
      && this.edit_status === true) {
      this.temp_info_academica = {};
      this.SoporteDocumento = [];
      this.inscripcionMidService.get('academico/formacion/informacion-complementaria?Id=' + this.info_id_formacion)
        .subscribe((response: any) => {
          this.temp_info_academica = <any>response.data;
          if (response !== null && response !== undefined) {
            this.temp_info_academica = <any>response.data;
            const files = []
            if (this.temp_info_academica.Documento + '' !== '0') {
              files.push({ Id: this.temp_info_academica.Documento });
            }
            if (this.temp_info_academica.Documento !== undefined && this.temp_info_academica.Documento !== null && this.temp_info_academica.Documento !== 0) {
              this.newNuxeoService.get(files).subscribe(
                response => {
                  const filesResponse = <Array<any>>response;
                  if (Object.keys(filesResponse).length === files.length) {
                    this.SoporteDocumento = this.temp_info_academica.Documento;
                    const FechaI = moment(this.temp_info_academica.FechaInicio, 'DD-MM-YYYY').toDate();
                    let FechaF;
                    if(this.temp_info_academica.FechaFinalizacion !== ''){
                      FechaF = moment(this.temp_info_academica.FechaFinalizacion, 'DD-MM-YYYY').toDate();
                    }else{
                      this.updateFinishDate('EditOption')
                    }
                   
                    const init = this.getIndexForm('Nit');
                    this.info_formacion_academica = {
                      Nit: this.temp_info_academica.Nit,
                      ProgramaAcademico: this.temp_info_academica.ProgramaAcademico,
                      FechaInicio: FechaI,
                      FechaFinalizacion: FechaF,
                      TituloTrabajoGrado: this.temp_info_academica.TituloTrabajoGrado,
                      DescripcionTrabajoGrado: this.temp_info_academica.DescripcionTrabajoGrado,
                    }
                    this.formInfoFormacionAcademica.campos[init].valor = this.info_formacion_academica.Nit;
                    this.formInfoFormacionAcademica.campos[init].deshabilitar = true;
                    this.searchNit(this.temp_info_academica.Nit);
                    //this.formInfoFormacionAcademica.campos[this.getIndexForm('Documento')].urlTemp = filesResponse[0].url;
                    this.formInfoFormacionAcademica.campos[this.getIndexForm('Documento')].valor = filesResponse[0].url;
                    let estadoDoc = this.utilidades.getEvaluacionDocumento(filesResponse[0].Metadatos);
                    this.formInfoFormacionAcademica.campos[this.getIndexForm('Documento')].estadoDoc = estadoDoc;
                  }
                },
                  (error: HttpErrorResponse) => {
                    this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
                  });
            }
          }
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.formacion_academica') + '|' +
                this.translate.instant('GLOBAL.nombre_universidad'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  updateInfoFormacionAcademica(infoFormacionAcademica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.confirmar_actualizar'),
      text: this.translate.instant('formacion_academica.actualizar'),
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
          this.info_formacion_academica = <any>infoFormacionAcademica;
          const files = [];
          if (this.info_formacion_academica.DocumentoId.file !== undefined) {
            files.push({
              IdDocumento: 16,
              nombre: this.autenticationService.getPayload().sub,
              file: this.info_formacion_academica.DocumentoId.file
            });
          }
          if (files.length !== 0 && this.info_formacion_academica.DocumentoId.file !== null) {
            this.newNuxeoService.uploadFiles(files).subscribe(
              (responseNux: any[]) => {
                if (Object.keys(responseNux).length === files.length) {
                  const documentos_actualizados = <any>responseNux;
                  this.info_formacion_academica.DocumentoId = documentos_actualizados[0].res.Id
                  this.inscripcionMidService.put('academico/formacion/?Id=' + this.info_id_formacion, this.info_formacion_academica)
                    .subscribe(res => {
                      if (documentos_actualizados[0] !== undefined) {
                        this.info_formacion_academica.DocumentoId = documentos_actualizados[0].res.Enlace;
                      }
                      this.canEmit = true;
                      this.setPercentage(1);
                      this.popUpManager.showSuccessAlert(this.translate.instant('informacion_academica.informacion_academica_registrada'));
                      /* this.showToast('info', this.translate.instant('GLOBAL.actualizar'),
                        this.translate.instant('GLOBAL.formacion_academica') + ' ' +
                        this.translate.instant('GLOBAL.confirmarActualizar')); */
                      this.clean = !this.clean;
                      this.info_formacion_academica = undefined;
                      this.info_formacion_academica_id = 0;
                      this.edit_status = false;
                      this.updateFormacion.emit();
                      //this.popUpManager.showToast('info', this.translate.instant('inscripcion.cambiar_tab2'));
                    },
                      (error: HttpErrorResponse) => {
                        Swal.fire({
                          icon: 'error',
                          title: error.status + '',
                          text: this.translate.instant('ERROR.' + error.status),
                          footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                            this.translate.instant('GLOBAL.formacion_academica'),
                          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                        });
                      });
                }
              },
                (error: HttpErrorResponse) => {
                  Swal.fire({
                    icon: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                      this.translate.instant('GLOBAL.formacion_academica') + '|' +
                      this.translate.instant('GLOBAL.soporte_documento'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          } else {
            this.info_formacion_academica.DocumentoId = this.SoporteDocumento;
            this.inscripcionMidService.put('academico/formacion/?Id=' + this.info_id_formacion, this.info_formacion_academica)
              .subscribe(res => {
                this.canEmit = true;
                this.setPercentage(1);
                this.popUpManager.showSuccessAlert(this.translate.instant('informacion_academica.informacion_academica_registrada'));
                this.clean = !this.clean;
                this.info_formacion_academica = undefined;
                this.info_formacion_academica_id = 0;
                this.updateFormacion.emit();
              },
                (error: HttpErrorResponse) => {
                  Swal.fire({
                    icon: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                      this.translate.instant('GLOBAL.formacion_academica'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                })
          }
        }
      });
  }

  createInfoFormacionAcademica(infoFormacionAcademica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('informacion_academica.seguro_continuar_registrar'),
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
          const files = [];
          this.info_formacion_academica = <any>infoFormacionAcademica;
          if (this.info_formacion_academica.DocumentoId.file !== undefined) {
            files.push({
              IdDocumento: 16,
              nombre: this.autenticationService.getPayload().sub,
              file: this.info_formacion_academica.DocumentoId.file, 
            });
          }
          this.newNuxeoService.uploadFiles(files).subscribe(
            (responseNux: any[]) => {
              if (responseNux[0].Status == "200") {

                  this.info_formacion_academica.DocumentoId = responseNux[0].res.Id;
                
                this.inscripcionMidService.post('academico/formacion/', this.info_formacion_academica)
                  .subscribe(res => {
                    const r = <any>res;
                    if (r !== null && r.message != 'error') {
                      const inombre = this.getIndexForm('NombreUniversidad');
                      this.eventChange.emit(true);
                      this.popUpManager.showSuccessAlert(this.translate.instant('informacion_academica.informacion_academica_registrada'));
                      /* this.showToast('info', this.translate.instant('GLOBAL.crear'),
                        this.translate.instant('informacion_academica.informacion_academica_registrada')); */
                      this.formInfoFormacionAcademica.campos[inombre].valor = '';
                      this.info_formacion_academica_id = 0;
                      this.info_formacion_academica = undefined;
                      this.clean = !this.clean;
                      this.canEmit = true;
                      this.setPercentage(1);
                      this.updateFormacion.emit();
                      //this.popUpManager.showToast('info', this.translate.instant('inscripcion.cambiar_tab2'));
                    } else {
                      this.popUpManager.showToast('error', this.translate.instant('informacion_academica.informacion_academica_no_registrada'));
                    }
                  },
                    (error: HttpErrorResponse) => {
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('informacion_academica.informacion_academica_no_registrada'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    });
              }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('informacion_academica.documento_informacion_academica_no_registrado'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  ngOnInit() {
    this.loadInfoFormacionAcademica();
  }

  setPercentage(event:any) {
    setTimeout(() => {
      this.percentage = event;
      if(this.percentage == 0){
        this.formInfoFormacionAcademica.campos[this.getIndexForm('Nit')].deshabilitar = true;
      } else {
        if (this.canEmit) {
          this.result.emit(this.percentage);
          this.canEmit = false;
        }
      }
    });
  }

  validarForm(event:any) {
    if (event.valid) {
      const formData = event.data.InfoFormacionAcademica;
      const InfoFormacionAcademica = {
        TerceroId: this.persona_id,
        ProgramaAcademicoId: formData.ProgramaAcademico.Id,
        FechaInicio: momentTimezone.tz(formData.FechaInicio, 'America/Bogota').format('DDMMYYYY'),
        FechaFinalizacion: '',
        TituloTrabajoGrado: formData.TituloTrabajoGrado,
        DescripcionTrabajoGrado: formData.DescripcionTrabajoGrado,
        DocumentoId: formData.Documento,
        NitUniversidad: formData.Nit,
      };
      const tempfecha = momentTimezone.tz(formData.FechaFinalizacion, 'America/Bogota').format('DDMMYYYY');
      if(isDate(formData.FechaFinalizacion)){
        InfoFormacionAcademica.FechaFinalizacion = momentTimezone.tz(formData.FechaFinalizacion, 'America/Bogota').format('DDMMYYYY')
      }

      if (!this.info_formacion_academica || (this.info_formacion_academica === null && this.info_proyecto_id === null)
        || (this.info_formacion_academica_id === undefined && this.info_proyecto_id === undefined)) {
        this.createInfoFormacionAcademica(InfoFormacionAcademica);
        //this.result.emit(event);
      } else {
        this.updateInfoFormacionAcademica(InfoFormacionAcademica);
        //this.result.emit(event);
      }
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formInfoFormacionAcademica.campos[this.getIndexForm('Pais')].opciones = list.listPais[0];
        this.formInfoNuevoTercero.campos[this.getIndexForm('Pais')].opciones = list.listPais[0];
      },
    );
  }
}
