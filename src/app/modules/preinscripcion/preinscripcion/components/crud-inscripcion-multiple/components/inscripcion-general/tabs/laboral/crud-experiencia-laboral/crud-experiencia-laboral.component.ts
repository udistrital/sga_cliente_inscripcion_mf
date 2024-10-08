import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InfoPersona } from 'src/app/models/informacion/info_persona';
import { ListService } from 'src/app/services/list.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { FORM_EXPERIENCIA_LABORAL } from './form-experiencia_laboral';
import { Organizacion } from 'src/app/models/ente/organizacion';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';

@Component({
  selector: 'ngx-crud-experiencia-laboral',
  templateUrl: './crud-experiencia-laboral.component.html',
  styleUrls: ['./crud-experiencia-laboral.component.scss']
})
export class CrudExperienciaLaboralComponent implements OnInit {
  info_experiencia_laboral_id!: number;
  info_id_experiencia!: number;
  organizacion!: Organizacion;
  ente_id!: number;
  soporte: any;
  detalleExp: any;
  indexSelect!: number;
  nuevoForm: boolean = false;
  nuevoTercero: boolean = false;
  nit: any;



  @Input('info_experiencia_laboral_id')
  set name(info_experiencia_laboral_id: number) {
    this.info_experiencia_laboral_id = info_experiencia_laboral_id;
  }

  @Input('ente_id')
  set ente_experiencia(ente_id: any) {
    this.ente_id = Number(ente_id);
  }

  @Input('info_id_experiencia')
  set name_id(info_id_experiencia: number) {
    this.info_id_experiencia = Number(info_id_experiencia);
  }

  @Input('index_select')
  set index_select(index_select: any) {
    this.indexSelect = Number(index_select);
  }

  @Input('detalle_experiencia_laboral')
  set detalleExperienciaLaboral(detalle_experiencia_laboral: any) {
    this.detalleExp = detalle_experiencia_laboral;
    if (this.detalleExp != null) {
      this.loadInfoExperienciaLaboral();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_experiencia_laboral: any;
  formInfoExperienciaLaboral: any;
  regInfoExperienciaLaboral: any;
  temp: any;
  clean!: boolean;
  percentage!: number;
  persona_id!: number | null;
  canEmit: boolean = false;

  constructor(
    private translate: TranslateService,
    private inscripcionMidService: InscripcionMidService,
    private store: Store<IAppState>,
    private listService: ListService,
    private newNuxeoService: NewNuxeoService,
    private popUpManager: PopUpManager,
    private users: UserService,
    private utilidades: UtilidadesService,) {
    this.formInfoExperienciaLaboral = FORM_EXPERIENCIA_LABORAL;
    this.limpiarBuscadorDeInstitucion()
    this.construirForm();
    this.loadLists();
    this.listService.findPais();
    this.listService.findTipoDedicacion();
    this.listService.findTipoVinculacion();
    this.listService.findTipoTercero();
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('Pais')].opciones = list.listPais[0];
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('TipoOrganizacion')].opciones = list.listTipoOrganizacion[0];
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('TipoDedicacion')].opciones = list.listTipoDedicacion[0];
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('TipoVinculacion')].opciones = list.listTipoVinculacion[0];
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('Cargo')].opciones = list.listCargo[0];
      },
    );
  }

  construirForm() {
    this.formInfoExperienciaLaboral.titulo = this.translate.instant('GLOBAL.experiencia_laboral');
    this.formInfoExperienciaLaboral.btn = this.translate.instant('GLOBAL.guardar');
    this.formInfoExperienciaLaboral.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formInfoExperienciaLaboral.campos.length; i++) {
      this.formInfoExperienciaLaboral.campos[i].label = this.translate.instant('GLOBAL.' +
        this.formInfoExperienciaLaboral.campos[i].label_i18n);
      this.formInfoExperienciaLaboral.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formInfoExperienciaLaboral.campos[i].label_i18n);
      if (this.formInfoExperienciaLaboral.campos[i].placeholder_i18n_2) {
        this.formInfoExperienciaLaboral.campos[i].placeholder2 = this.translate.instant('GLOBAL.placeholder_' +
          this.formInfoExperienciaLaboral.campos[i].placeholder_i18n_2)
      }
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  onChangeDate() {
    this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].minDate
      = this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaInicio')].valor
    if (this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].valor <
      this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaInicio')].valor) {
      this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].valor = ''
    }
  }

  updateFinishDate(data: any) {
    if (data.button == 'ExperienciaBoton' || data == 'EditOption') {
      this.formInfoExperienciaLaboral.campos[this.getIndexForm('Telefono')].ocultar = true
      this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].requerido = !this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].requerido
      this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].deshabilitar = !this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].deshabilitar
      this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].ocultar = !this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].ocultar
      if (this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].deshabilitar) {
        this.formInfoExperienciaLaboral.campos[this.getIndexForm('FechaFinalizacion')].valor = ''
      } 
    }
  }


  NuevoTercero(event: any) {
    this.nuevoTercero = false;
    const iNit = this.getIndexForm('Nit');
    this.formInfoExperienciaLaboral.campos[iNit].valor = event['infoPost'].Nit;
    this.searchOrganizacion(event['infoPost'].Nit);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoExperienciaLaboral.campos.length; index++) {
      const element = this.formInfoExperienciaLaboral.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public loadInfoExperienciaLaboral(): void {
    const init = this.getIndexForm('Nit');
    const inombre = this.getIndexForm('NombreEmpresa');
    const itipo = this.getIndexForm('TipoOrganizacion');
    const idir = this.getIndexForm('Direccion');
    const itel = this.getIndexForm('Telefono');
    const icorreo = this.getIndexForm('Correo');
    const ipais = this.getIndexForm('Pais');
    const ifechaInicio = this.getIndexForm('FechaInicio');
    const ifechaFin = this.getIndexForm('FechaFinalizacion');
    const itipoDedicacion = this.getIndexForm('TipoDedicacion');
    const itipoVinculacion = this.getIndexForm('TipoVinculacion');
    const icargo = this.getIndexForm('Cargo');
    const iactividades = this.getIndexForm('Actividades');
    const isoporte = this.getIndexForm('Soporte');
    const iExperienciaBoton = this.getIndexForm('ExperienciaBoton');

    if (this.detalleExp.FechaFinalizacion == '') {
      this.formInfoExperienciaLaboral.campos[ifechaFin].deshabilitar = true;
      this.formInfoExperienciaLaboral.campos[ifechaFin].requerido = false;
      this.formInfoExperienciaLaboral.campos[iExperienciaBoton].valor = "option1";
    }else {
      this.formInfoExperienciaLaboral.campos[ifechaFin].valor = (this.detalleExp.FechaFinalizacion);
      this.formInfoExperienciaLaboral.campos[ifechaFin].deshabilitar = false;
      this.formInfoExperienciaLaboral.campos[ifechaFin].requerido = true;
      this.formInfoExperienciaLaboral.campos[iExperienciaBoton].valor= "option2";
    }

    this.formInfoExperienciaLaboral.campos[init].valor = this.detalleExp.Nit;
    this.formInfoExperienciaLaboral.campos[inombre].valor = (this.detalleExp.NombreEmpresa &&
      this.detalleExp.NombreEmpresa.Id) ? this.detalleExp.NombreEmpresa : { Id: 0, NombreCompleto: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[idir].valor = (this.detalleExp.Direccion) ? this.detalleExp.Direccion : 'No registrado';
    this.formInfoExperienciaLaboral.campos[itel].valor = (this.detalleExp.Telefono) ? this.detalleExp.Telefono : 'No registrado';
    this.formInfoExperienciaLaboral.campos[icorreo].valor = (this.detalleExp.Correo) ? this.detalleExp.Correo : 'No registrado';
    this.formInfoExperienciaLaboral.campos[ipais].valor = (this.detalleExp.Ubicacion &&
      this.detalleExp.Ubicacion.Id) ? this.detalleExp.Ubicacion : { Id: 0, Nombre: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[itipo].valor = (this.detalleExp.TipoTerceroId &&
      this.detalleExp.TipoTerceroId.Id) ? this.detalleExp.TipoTerceroId : { Id: 0, Nombre: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[ifechaInicio].valor = (this.detalleExp.FechaInicio);
    this.formInfoExperienciaLaboral.campos[itipoDedicacion].valor = (this.detalleExp.TipoDedicacion &&
      this.detalleExp.TipoDedicacion.Id) ? this.detalleExp.TipoDedicacion : { Id: 0, Nombre: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[itipoVinculacion].valor = (this.detalleExp.TipoVinculacion &&
      this.detalleExp.TipoVinculacion.Id) ? this.detalleExp.TipoVinculacion : { Id: 0, Nombre: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[icargo].valor = (this.detalleExp.Cargo &&
      this.detalleExp.Cargo.Id) ? this.detalleExp.Cargo : { Id: 0, Nombre: 'No registrado' };
    this.formInfoExperienciaLaboral.campos[iactividades].valor = (this.detalleExp.Actividades);
    this.formInfoExperienciaLaboral.campos[init].deshabilitar = false;

    const files = []
    if (this.detalleExp.Soporte + '' !== '0') {
      files.push({ Id: this.detalleExp.Soporte });
    }

    if (this.detalleExp.Soporte !== undefined && this.detalleExp.Soporte !== null && this.detalleExp.Soporte !== 0) {
      this.newNuxeoService.get(files).subscribe(
        response => {
          const filesResponse = <Array<any>>response;
          if (Object.keys(filesResponse).length === files.length) {
            //this.formInfoExperienciaLaboral.campos[isoporte].urlTemp = filesResponse[0].url;
            this.formInfoExperienciaLaboral.campos[isoporte].valor = filesResponse[0].url;
            let estadoDoc = this.utilidades.getEvaluacionDocumento(filesResponse[0].Metadatos);
            this.formInfoExperienciaLaboral.campos[isoporte].estadoDoc = estadoDoc;
          } else {
          }
        },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.experiencia_laboral') + '|' +
              this.translate.instant('GLOBAL.soporte_documento'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    }
  }


  searchNit(event: any) {
    if (event.button == 'BusquedaBoton') {
      if (event != null) {
        this.searchOrganizacion(event.data.Nit)
      } else {
        FORM_EXPERIENCIA_LABORAL.campos.filter((campo: any) => {
          if (campo.nombre == "Buscador") {
            campo.opciones = [
              {
                "NIT": "Na-1",
                "NombreCompleto": "CREAR NUEVO REGISTRO",
                "Label": "CREAR NUEVO REGISTRO"
              }
            ]
          }
        })
      }
    }
  }

  getSeleccion(event: any) {
    switch (event.name) {
      case "selected_value_autocomplete_Buscador":
        if (event.value != null) {
          this.searchOrganizacion(event.value.NIT)
        } else {
          FORM_EXPERIENCIA_LABORAL.campos.filter((campo: any) => {
            if (campo.nombre == "Buscador") {
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

      case "selected_value_autocomplete_Cargo":
        break;
    }


  }

  loadListEmpresa(nombre: string): void {
    if (nombre) {
      let consultaEmpresa: Array<any> = [];
      const empresa: Array<any> = [];
      //todo: endpoint no existe?
      this.inscripcionMidService.get('experiencia-laboral/informacion-empresa?nombre=' + nombre)
        .subscribe(res => {
          if (res !== null) {
            consultaEmpresa = <Array<InfoPersona>>res.Data;
            for (let i = 0; i < consultaEmpresa.length; i++) {
              empresa.push(consultaEmpresa[i]);
            }
          }
          this.formInfoExperienciaLaboral.campos[this.getIndexForm('NombreEmpresa')].opciones = empresa;
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('experiencia_laboral.error_cargar_empresa'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.popUpManager.showAlert(this.translate.instant('inscripcion.experiencia_laboral'), this.translate.instant('GLOBAL.no_vacio'))
    }
  }

  searchOrganizacion(nit: string): void {
    if (nit != null) {
      nit = nit.trim();
      this.nit = nit.trim();
      const init = this.getIndexForm('Nit');
      const inombre = this.getIndexForm('NombreEmpresa');
      const itipo = this.getIndexForm('TipoOrganizacion');
      const idir = this.getIndexForm('Direccion');
      const itel = this.getIndexForm('Telefono');
      const icorreo = this.getIndexForm('Correo');
      const ipais = this.getIndexForm('Pais');
      this.inscripcionMidService.get('experiencia-laboral/informacion-empresa?Id=' + nit)
        .subscribe((response: any) => {
          const res = response.Data
          this.formInfoExperienciaLaboral.campos[init].valor = res.NumeroIdentificacion;
          this.formInfoExperienciaLaboral.campos[inombre].valor = (res.NombreCompleto &&
            res.NombreCompleto.Id) ? res.NombreCompleto : { Id: 0, NombreCompleto: 'No registrado' };
          this.formInfoExperienciaLaboral.campos[idir].valor = (res.Direccion) ? res.Direccion : 'No registrado';
          this.formInfoExperienciaLaboral.campos[itel].valor = (res.Telefono) ? res.Telefono : 'No registrado';
          this.formInfoExperienciaLaboral.campos[icorreo].valor = (res.Correo) ? res.Correo : 'No registrado';
          this.formInfoExperienciaLaboral.campos[ipais].valor = (res.Ubicacion && res.Ubicacion.Id) ? res.Ubicacion : { Id: 0, Nombre: 'No registrado' };
          this.formInfoExperienciaLaboral.campos[itipo].valor = (res.TipoTerceroId &&
            res.TipoTerceroId.Id) ? res.TipoTerceroId : { Id: 0, Nombre: 'No registrado' };
          [
            this.formInfoExperienciaLaboral.campos[init],
            this.formInfoExperienciaLaboral.campos[inombre],
            this.formInfoExperienciaLaboral.campos[idir],
            this.formInfoExperienciaLaboral.campos[icorreo],
            this.formInfoExperienciaLaboral.campos[ipais],
            this.formInfoExperienciaLaboral.campos[itipo],
            this.formInfoExperienciaLaboral.campos[itel]]
            .forEach(element => {
              element.deshabilitar = element.valor ? true : false
            });
            this.formInfoExperienciaLaboral.campos[init].deshabilitar = false;
        },
          (error: HttpErrorResponse) => {
            if (error.status === 404) {
              [this.formInfoExperienciaLaboral.campos[inombre],
              this.formInfoExperienciaLaboral.campos[idir],
              this.formInfoExperienciaLaboral.campos[icorreo],
              this.formInfoExperienciaLaboral.campos[ipais],
              this.formInfoExperienciaLaboral.campos[itipo],
              this.formInfoExperienciaLaboral.campos[itel]]
                .forEach(element => {
                  element.deshabilitar = true;
                  element.valor = '';
                });
            }
            const opt: any = {
              title: this.translate.instant('experiencia_laboral.titulo1_crear_entidad') + ` ${nit} ` +
                this.translate.instant('experiencia_laboral.titulo2_crear_entidad'),
              text: this.translate.instant('experiencia_laboral.crear_entidad'),
              icon: 'warning',
              buttons: true,
              dangerMode: true,
              showCancelButton: true,
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
            };
            Swal.fire(opt)
              .then((action: any) => {
                if (action.value) {
                  this.nuevoTercero = true;
                }
              });
          });
    } else {
      const opt: any = {
        title: this.translate.instant('experiencia_laboral.crear_entidad'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      };
      Swal.fire(opt)
        .then((action: any) => {
          if (action.value) {
            this.nuevoTercero = true;
          }
        });

    }
  }

  createInfoExperienciaLaboral(infoExperienciaLaboral: any): void {
    if (this.detalleExp != null && this.info_experiencia_laboral_id != 0) {
      this.putExperiencia(infoExperienciaLaboral);
    } else {
      const opt: any = {
        title: this.translate.instant('GLOBAL.crear'),
        text: this.translate.instant('experiencia_laboral.seguro_continuar_registrar'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      };
      Swal.fire(opt)
        .then((willDelete: any) => {
          if (willDelete.value) {
            this.info_experiencia_laboral = <any>infoExperienciaLaboral;
            const files = [];
            if (this.info_experiencia_laboral.Experiencia.Soporte.file !== undefined) {
              files.push({
                IdDocumento: 4,
                nombre: this.users.getPayload().sub,
                file: this.info_experiencia_laboral.Experiencia.Soporte.file,
              });
            }
            this.uploadResolutionFile(files);
          }
        });
    }
  }

  putExperiencia(infoExperienciaLaboral: any) {
    const opt: any = {
      title: this.translate.instant('inscripcion.update'),
      // text: this.translate.instant('experiencia_laboral.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete: any) => {
        if (willDelete.value) {
          this.info_experiencia_laboral = <any>infoExperienciaLaboral;
          const files = [];
          if (this.info_experiencia_laboral.Experiencia.Soporte.file !== undefined) {
            files.push({
              IdDocumento: 4,
              nombre: this.users.getPayload().sub,
              file: this.info_experiencia_laboral.Experiencia.Soporte.file,
            });
          }
          this.uploadResolutionFile(files);
        }
      });
  }

  uploadResolutionFile(file: any) {
    return new Promise((resolve, reject) => {
      if (file.length !== 0 && this.info_experiencia_laboral.Experiencia.Soporte.file !== undefined && this.info_experiencia_laboral.Experiencia.Soporte.file !== null) {
        this.newNuxeoService.uploadFiles(file).subscribe(
          (responseNux: any[]) => {
            if (responseNux[0].Status == "200") {
              this.info_experiencia_laboral.Experiencia.DocumentoId = responseNux[0].res.Id;
              this.info_experiencia_laboral.Experiencia.EnlaceDocumento = responseNux[0].res.Enlace;
              if (this.detalleExp != null && this.info_experiencia_laboral_id != 0) {
                this.info_experiencia_laboral.indexSelect = this.indexSelect;
                this.info_experiencia_laboral.Id = this.info_id_experiencia;
                this.info_experiencia_laboral.terceroID = this.persona_id;
                this.putExperianciaLaboral();
              } else {
                this.postExperianciaLaboral();
              }
            }
          }, error => {
            reject(error);
          });
      } else {
        if (this.detalleExp != null && this.info_experiencia_laboral_id != 0) {
          this.info_experiencia_laboral.indexSelect = this.indexSelect;
          this.info_experiencia_laboral.Id = this.info_id_experiencia;
          this.info_experiencia_laboral.terceroID = this.persona_id;
          this.info_experiencia_laboral.Experiencia.DocumentoId = this.detalleExp.Soporte;
          this.putExperianciaLaboral();
        } else {
          this.postExperianciaLaboral();
        }
      }
    });
  }

  putExperianciaLaboral() {
    this.inscripcionMidService.put('experiencia-laboral/', this.info_experiencia_laboral)
      .subscribe(res => {
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          this.eventChange.emit(true);
          this.popUpManager.showSuccessAlert(this.translate.instant('experiencia_laboral.experiencia_laboral_registrada'));
          this.info_experiencia_laboral_id = 0;
          this.info_experiencia_laboral = undefined;
          this.indexSelect = NaN;
          this.detalleExp = undefined;
          this.clean = !this.clean;
          this.canEmit = true;
          this.setPercentage(1);
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('experiencia_laboral.experiencia_laboral_no_registrada'));
        }
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('experiencia_laboral.experiencia_laboral_no_registrada'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  postExperianciaLaboral() {
    this.inscripcionMidService.post('experiencia-laboral/', this.info_experiencia_laboral)
      .subscribe(res => {
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          this.eventChange.emit(true);
          this.popUpManager.showSuccessAlert(this.translate.instant('experiencia_laboral.experiencia_laboral_registrada'));
          this.info_experiencia_laboral_id = 0;
          this.info_experiencia_laboral = undefined;
          this.indexSelect = NaN;
          this.detalleExp = undefined;
          this.clean = !this.clean;
          this.canEmit = true;
          this.setPercentage(1);
          // this.result.emit(event);
        } else {
          this.popUpManager.showErrorAlert(this.translate.instant('experiencia_laboral.experiencia_laboral_no_registrada'));
        }
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('experiencia_laboral.experiencia_laboral_no_registrada'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  async ngOnInit() {
    try {
      this.persona_id = await this.users.getPersonaId();
    } catch (error) {
      console.error('Error al obtener persona_id:', error);
    }
  }

  setPercentage(event: any) {
    this.percentage = event;
    if (this.percentage == 0) {
      this.formInfoExperienciaLaboral.campos[this.getIndexForm('Nit')].deshabilitar = true;
    } else {
      if (this.canEmit) {
        this.result.emit(this.percentage);
        this.canEmit = false;
      }
    }
  }

  validarForm(event: any) {
    console.log(event)
    if (event.valid) {
      const formData = event.data.InfoExperienciaLaboral;
      const organizacionData = {
        NumeroIdentificacion: formData.Nit,
        Direccion: formData.Direccion,
        Pais: formData.Pais,
        Nombre: formData.NombreEmpresa,
        TipoOrganizacion: formData.TipoOrganizacion,
        Telefono: formData.Telefono,
        Correo: formData.Correo,
      };
      const tercero = {
        Id: this.persona_id || 1, // se debe cambiar solo por persona id
      }
      const postData = {
        InfoComplementariaTercero: [
          {
            // Información de la universidad
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: 1, // Completar id faltante
            },
            Dato: JSON.stringify(organizacionData),
            Activo: true,
          },
        ],
        Experiencia: {
          Persona: this.persona_id || 1,
          Actividades: formData.Actividades,
          FechaInicio: formData.FechaInicio,
          FechaFinalizacion: formData.FechaFinalizacion,
          Organizacion: 0,
          TipoDedicacion: formData.TipoDedicacion,
          Cargo: formData.Cargo,
          TipoVinculacion: formData.TipoVinculacion,
          Soporte: formData.Soporte,
        },
      }
      this.createInfoExperienciaLaboral(postData);
      // this.result.emit(event);
    }
  }

  limpiarBuscadorDeInstitucion() {
    const buscadorIndex = this.getIndexForm('Nit');
    this.formInfoExperienciaLaboral.campos[buscadorIndex].valor = '';
    this.formInfoExperienciaLaboral.campos[buscadorIndex].deshabilitar = false;
  }
}
