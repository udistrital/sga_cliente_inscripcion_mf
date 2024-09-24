import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InfoCaracteristica } from 'src/app/models/informacion/info_caracteristica';
import { InfoCaracteristicaGet } from 'src/app/models/informacion/info_caracteristica_get';
import { ListService } from 'src/app/services/list.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { UserService } from 'src/app/services/users.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
import { FORM_INFO_CARACTERISTICA_PREGRADO } from './form-info_caracteristica_pregrado';
import { Lugar } from 'src/app/models/informacion/lugar';
import { HttpErrorResponse } from '@angular/common/http';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as momentTimezone from 'moment-timezone';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';

@Component({
  selector: 'ngx-crud-info-caracteristica_pregrado',
  templateUrl: './crud-info-caracteristica-pregrado.component.html',
  styleUrls: ['./crud-info-caracteristica-pregrado.component.scss']
})
export class CrudInfoCaracteristicaPregradoComponent implements OnInit {
  //config: ToasterConfig;
  info_caracteristica_id!: number;
  porcentaje!: number;

  @Input('info_caracteristica_id')
  set name(info_caracteristica_id: number) {
    this.info_caracteristica_id = info_caracteristica_id;
    if (this.info_caracteristica_id !== undefined && this.info_caracteristica_id !== 0 &&
      this.info_caracteristica_id.toString() !== '') {
      this.loadInfoCaracteristica();
    } else {
      this.info_caracteristica_id = Number(sessionStorage.getItem('IdTercero'))
    }
  }

  @Input('porcentaje')
  set valPorcentaje(porcentaje: number) {
    // this.porcentaje = porcentaje / 100 * 3;
    this.porcentaje = porcentaje / 100 * 2;
  }

  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_info_caracteristica: InfoCaracteristica = new InfoCaracteristica;
  info_persona_id!: number | null;
  info_info_persona: any;
  datosGet: InfoCaracteristicaGet = new InfoCaracteristicaGet;
  formInfoCaracteristica: any;
  regInfoCaracteristica: any;
  paisSeleccionado: any;
  departamentoSeleccionado: any;
  mensaje_discapcidades: boolean = false;
  mensaje_poblacion: boolean = false;
  mensaje_poblacion_discapcidades: boolean = false;
  clean!: boolean;
  denied_acces: boolean = false;

  constructor(
    private listService: ListService,
    private newNuxeoService: NewNuxeoService,
    private popUpManager: PopUpManager,
    private snackBar: MatSnackBar,
    private store: Store<IAppState>,
    private terceroMidService: TerceroMidService,
    private translate: TranslateService,
    private ubicacionesService: UbicacionService,
    private userService: UserService
  ) {
    this.formInfoCaracteristica = FORM_INFO_CARACTERISTICA_PREGRADO;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.listService.findGrupoSanguineo();
    this.listService.findFactorRh();
    this.listService.findPais();
    this.listService.findTipoPoblacion();
    this.listService.findTipoDiscapacidad();
    this.listService.findEPS();
    this.loadLists();
  }

  construirForm() {
    this.formInfoCaracteristica.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInfoCaracteristica.campos.length; i++) {
      this.formInfoCaracteristica.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoCaracteristica.campos[i].label_i18n);
      this.formInfoCaracteristica.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formInfoCaracteristica.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getSeleccion(event: any) {
    if (event.nombre === 'PaisNacimiento') {
      this.paisSeleccionado = event.valor;
      this.loadOptionsDepartamentoNacimiento();
    } else if (event.nombre === 'DepartamentoNacimiento') {
      this.departamentoSeleccionado = event.valor;
      this.loadOptionsCiudadNacimiento();
    } else if (event.nombre === 'TipoDiscapacidad') {
        if (Array.isArray(event.valor) && event.valor.length > 0){

          this.formInfoCaracteristica.campos[this.getIndexForm('ComprobanteDiscapacidad')].ocultar =
          !((event.valor.filter((data: any) => data.Nombre !== 'NO APLICA')).length > 0);
  
          if ((event.valor.filter((data: any) => data.Nombre !== 'NO APLICA')).length > 0) {
            this.mensaje_discapcidades = true;
          } else {
            this.mensaje_discapcidades = false;
          }
    
          this.mensaje_poblacion_discapcidades = this.mensaje_discapcidades && this.mensaje_poblacion;
    
          if (this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].valor.length === 0) {
            this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].valor = this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].opciones.filter((data: any) => data.Nombre === 'NO APLICA');
          } else if (this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].valor.length > 1) {
            this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].valor = this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].valor.filter((data: any) => data.Nombre !== 'NO APLICA');
          }

        } 
    } else if (event.nombre === 'TipoPoblacion') {
      if (Array.isArray(event.valor) && event.valor.length > 0){
        this.formInfoCaracteristica.campos[this.getIndexForm('ComprobantePoblacion')].ocultar =
        !((event.valor.filter((data: any) => data.Nombre !== 'NO APLICA')).length > 0);

        if ((event.valor.filter((data: any) => data.Nombre !== 'NO APLICA')).length > 0) {
          this.mensaje_poblacion = true;
        } else {
          this.mensaje_poblacion = false;
        }

        this.mensaje_poblacion_discapcidades = this.mensaje_discapcidades && this.mensaje_poblacion;

        if (this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].valor.length === 0) {
          this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].valor = this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].opciones.filter((data: any) => data.Nombre === 'NO APLICA');
        } else if (this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].valor.length > 1) {
          this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].valor = this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].valor.filter((data: any) => data.Nombre !== 'NO APLICA');
        }

      }
    }
  }

  loadOptionsDepartamentoNacimiento(): void {
    let consultaHijos: Array<any> = [];
    const departamentoNacimiento: Array<any> = [];
    if (this.paisSeleccionado) {
      this.ubicacionesService.get('relacion_lugares?query=LugarPadreId__Id:' + this.paisSeleccionado.Id +
        ',LugarHijoId__Activo:true&limit=0&order=asc&sortby=LugarHijoId__Nombre').subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              departamentoNacimiento.push(consultaHijos[i].LugarHijoId);
            }
          }
          this.formInfoCaracteristica.campos[this.getIndexForm('DepartamentoNacimiento')].opciones = departamentoNacimiento;
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_caracteristica') + '|' +
                this.translate.instant('GLOBAL.departamento_nacimiento'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  loadOptionsCiudadNacimiento(): void {
    let consultaHijos: Array<any> = [];
    const ciudadNacimiento: Array<any> = [];
    if (this.departamentoSeleccionado) {
      this.ubicacionesService.get('relacion_lugares?query=LugarPadreId__Id:' + this.departamentoSeleccionado.Id
        + ',LugarHijoId__Activo:true&limit=0&order=asc&sortby=LugarHijoId__Nombre')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              ciudadNacimiento.push(consultaHijos[i].LugarHijoId);
            }
          }
          this.formInfoCaracteristica.campos[this.getIndexForm('Lugar')].opciones = ciudadNacimiento;
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_caracteristica') + '|' +
                this.translate.instant('GLOBAL.ciudad_nacimiento'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoCaracteristica.campos.length; index++) {
      const element = this.formInfoCaracteristica.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  cargarDocs(files: any) {
    return new Promise((resolve, reject) => {
      files.forEach((file: any) => {
        const filesll = []
        filesll.push(file)
        this.newNuxeoService.get(filesll).subscribe(
          response => {
            const filesResponse = <Array<any>>response;
            if (Object.keys(filesResponse).length === filesll.length) {
              filesResponse.forEach(fileR => {
                if (fileR['Id'] === this.formInfoCaracteristica.ComprobantePoblacion) {
                  this.formInfoCaracteristica.campos[this.getIndexForm('ComprobantePoblacion')].urlTemp = fileR.url;
                  this.formInfoCaracteristica.campos[this.getIndexForm('ComprobantePoblacion')].valor = fileR.url;
                  this.formInfoCaracteristica.campos[this.getIndexForm('ComprobantePoblacion')].ocultar = false;
                } else if (fileR['Id'] === this.formInfoCaracteristica.ComprobanteDiscapacidad) {
                  this.formInfoCaracteristica.campos[this.getIndexForm('ComprobanteDiscapacidad')].urlTemp = fileR.url;
                  this.formInfoCaracteristica.campos[this.getIndexForm('ComprobanteDiscapacidad')].valor = fileR.url;
                  this.formInfoCaracteristica.campos[this.getIndexForm('ComprobanteDiscapacidad')].ocultar = false;
                }
              })
            }
          },
          (error: HttpErrorResponse) => {
            reject(error);
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
      });
      resolve(true);
    });
  }

  public loadInfoCaracteristica(): void {
    if (this.info_persona_id !== null) {
      this.denied_acces = false;
      this.terceroMidService.get('personas/' + this.info_persona_id + '/complementarios')
        .subscribe(async res => {
          if (res.status != "404") {
            this.datosGet = <InfoCaracteristicaGet>res.Data;
            this.info_info_caracteristica = <InfoCaracteristica>res.Data;
            this.info_info_caracteristica.GrupoSanguineo = this.info_info_caracteristica.GrupoSanguineo;
            this.info_info_caracteristica.Rh = this.info_info_caracteristica.Rh;
            this.info_info_caracteristica.TipoRelacionUbicacionEnte = 1;
            this.info_info_caracteristica.IdLugarEnte = this.datosGet.Lugar.Id;
            this.info_info_caracteristica.PaisNacimiento = this.datosGet.Lugar.Lugar.PAIS;
            if (this.datosGet.Lugar.Lugar.DEPARTAMENTO === undefined) {
              this.info_info_caracteristica.DepartamentoNacimiento = this.datosGet.Lugar.Lugar.CIUDAD;
              this.info_info_caracteristica.Lugar = this.datosGet.Lugar.Lugar.LOCALIDAD;
            } else {
              this.info_info_caracteristica.DepartamentoNacimiento = this.datosGet.Lugar.Lugar.DEPARTAMENTO;
              this.info_info_caracteristica.Lugar = this.datosGet.Lugar.Lugar.CIUDAD;
            }
            if (this.info_info_caracteristica.TipoPoblacion.length == 0) {
              this.info_info_caracteristica.TipoPoblacion =
                [this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].opciones.filter((data: any) => data.Nombre === 'NO APLICA')];
            }

            if (this.info_info_caracteristica.TipoDiscapacidad.length == 0) {
              this.info_info_caracteristica.TipoDiscapacidad =
                [this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].opciones.filter((data: any) => data.Nombre === 'NO APLICA')];
            }

            this.formInfoCaracteristica.campos[this.getIndexForm('DepartamentoNacimiento')].valor = this.info_info_caracteristica.DepartamentoNacimiento;
            this.formInfoCaracteristica.campos[this.getIndexForm('Lugar')].valor = this.info_info_caracteristica.Lugar;

            this.formInfoCaracteristica.ComprobantePoblacion = this.datosGet.IdDocumentoPoblacion;
            this.formInfoCaracteristica.ComprobanteDiscapacidad = this.datosGet.IdDocumentoDiscapacidad;
            const files = []
            if (this.formInfoCaracteristica.ComprobantePoblacion + '' !== '0' && this.formInfoCaracteristica.ComprobantePoblacion !== undefined) {
              files.push({ Id: this.formInfoCaracteristica.ComprobantePoblacion, key: 'Documento' });
            }
            if (this.formInfoCaracteristica.ComprobanteDiscapacidad + '' !== '0' && this.formInfoCaracteristica.ComprobanteDiscapacidad !== undefined) {
              files.push({ Id: this.formInfoCaracteristica.ComprobanteDiscapacidad, key: 'Documento' });
            }

            await this.cargarDocs(files)

            this.formInfoCaracteristica.campos[this.getIndexForm('GrupoSisben')].valor = this.datosGet.GrupoSisben;
            this.formInfoCaracteristica.campos[this.getIndexForm('FechaVinculacionEPS')].valor = momentTimezone.tz(this.datosGet.FechaVinculacionEPS, 'America/Bogota').toDate();

            this.formInfoCaracteristica.campos[this.getIndexForm('NumeroHermanos')].valor = parseInt(this.datosGet.hermanosUnivesidad);
            this.info_info_caracteristica.HermanosEnLaUniversidad = parseInt(this.datosGet.hermanosUnivesidad);
          } else {
            this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_info'));
          }
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.info_caracteristica'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.clean = !this.clean;
      this.denied_acces = false; // no muestra el formulario a menos que se le pase un id del ente info_caracteristica_id
    }
  }

  updateInfoCaracteristica(infoCaracteristica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant('inscripcion.update'),
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
          this.info_info_caracteristica = <InfoCaracteristica>infoCaracteristica;
          this.info_info_caracteristica.Ente = this.info_persona_id;
          this.terceroMidService.put('personas/complementarios', this.info_info_caracteristica)
            .subscribe(res => {
              this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar'));
              this.loadInfoCaracteristica();
              this.popUpManager.showToast('info', this.translate.instant('inscripcion.cambiar_tab'));
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                    this.translate.instant('GLOBAL.info_caracteristica'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  createInfoCaracteristica(infoCaracteristica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('inscripcion.crear'),
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
          const info_info_caracteristica_post = <any>infoCaracteristica;
          info_info_caracteristica_post.TipoRelacionUbicacionEnte = 1;
          info_info_caracteristica_post.Tercero = this.info_persona_id;
          this.terceroMidService.post('personas/complementarios', info_info_caracteristica_post)
            .subscribe(res => {
              if (res !== null) {
                this.info_info_caracteristica = <InfoCaracteristica>infoCaracteristica;
                this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.guardar'));
              }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.crear') + '-' +
                    this.translate.instant('GLOBAL.info_caracteristica'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
        }
      });
  }

  async ngOnInit() {
    await this.initializePersonaId();
    this.construirForm();
    this.loadInfoCaracteristica();
  }

  async initializePersonaId() {
    try {
      this.info_persona_id = await this.userService.getPersonaId();
    } catch (error) {
      this.info_persona_id = 1; // Valor por defecto en caso de error
      console.error('Error al obtener persona_id:', error);
    }
  }

  validarForm(event: any) {
    if (event.valid) {
      if (typeof event.data.InfoCaracteristica.ComprobantePoblacion.file !== 'undefined' && event.data.InfoCaracteristica.ComprobantePoblacion.file !== null) {
        const file = [{
          file: event.data.InfoCaracteristica.ComprobantePoblacion.file,
          IdDocumento: 64,
          nombre: 'ComprobantePoblacion',
        }]
        this.newNuxeoService.uploadFiles(file).subscribe(
          (responseNux: any[]) => {
            event.data.InfoCaracteristica.ComprobantePoblacion.Id = responseNux[0].res.Id;
            if (typeof event.data.InfoCaracteristica.ComprobanteDiscapacidad.file !== 'undefined' && event.data.InfoCaracteristica.ComprobanteDiscapacidad.file !== null) {
              const file = [{
                file: event.data.InfoCaracteristica.ComprobanteDiscapacidad.file,
                IdDocumento: 64,
                nombre: 'ComprobanteDiscapacidad',
              }]
              this.newNuxeoService.uploadFiles(file).subscribe(
                (responseNux: any[]) => {
                  event.data.InfoCaracteristica.ComprobanteDiscapacidad.Id = responseNux[0].res.Id;

                  if (this.info_info_caracteristica === undefined && !this.denied_acces) {
                    this.createInfoCaracteristica(event.data.InfoCaracteristica);
                  } else {
                    this.updateInfoCaracteristica(event.data.InfoCaracteristica);
                  }
                })
            } else {
              if (this.datosGet !== undefined) {
                if (this.datosGet.IdDocumentoDiscapacidad !== undefined && event.data.InfoCaracteristica.TipoDiscapacidad[0].Nombre !== 'NO APLICA') {
                  event.data.InfoCaracteristica.ComprobanteDiscapacidad.Id = this.datosGet.IdDocumentoDiscapacidad;
                }
              } else {
                event.data.InfoCaracteristica.ComprobanteDiscapacidad = { Id: "0" };
              }

              if (this.info_info_caracteristica === undefined && !this.denied_acces) {
                this.createInfoCaracteristica(event.data.InfoCaracteristica);
              } else {
                this.updateInfoCaracteristica(event.data.InfoCaracteristica);
              }
            }
          });

      } else {
        if (this.datosGet !== undefined) {
          if (this.datosGet.IdDocumentoPoblacion !== undefined && event.data.InfoCaracteristica.TipoPoblacion[0].Nombre !== 'NO APLICA') {
            event.data.InfoCaracteristica.ComprobantePoblacion.Id = this.datosGet.IdDocumentoPoblacion;
          }
        } else {
          event.data.InfoCaracteristica.ComprobantePoblacion = { Id: "0" };
        }

        if (typeof event.data.InfoCaracteristica.ComprobanteDiscapacidad.file !== 'undefined' && event.data.InfoCaracteristica.ComprobanteDiscapacidad.file !== null) {
          const file = [{
            file: event.data.InfoCaracteristica.ComprobanteDiscapacidad.file,
            IdDocumento: 64,
            nombre: 'ComprobanteDiscapacidad',
          }]
          this.newNuxeoService.uploadFiles(file).subscribe(
            (responseNux: any[]) => {
              event.data.InfoCaracteristica.ComprobanteDiscapacidad.Id = responseNux[0].res.Id;

              if (this.info_info_caracteristica === undefined && !this.denied_acces) {
                this.createInfoCaracteristica(event.data.InfoCaracteristica);
              } else {
                this.updateInfoCaracteristica(event.data.InfoCaracteristica);
              }
            })
        } else {
          if (this.datosGet !== undefined) {
            if (this.datosGet.IdDocumentoDiscapacidad !== undefined && event.data.InfoCaracteristica.TipoDiscapacidad[0].Nombre !== 'NO APLICA') {
              event.data.InfoCaracteristica.ComprobanteDiscapacidad.Id = this.datosGet.IdDocumentoDiscapacidad;
            }
          } else {
            event.data.InfoCaracteristica.ComprobanteDiscapacidad = { Id: "0" };
          }

          if (this.info_info_caracteristica === undefined && !this.denied_acces) {
            this.createInfoCaracteristica(event.data.InfoCaracteristica);
          } else {
            this.updateInfoCaracteristica(event.data.InfoCaracteristica);
          }
        }
      }
    }
  }

  setPercentage(event: any) {
    if (event > 1 || this.porcentaje > 1) {
      setTimeout(() => {
        this.result.emit(1);
      });
    } else if (event < this.porcentaje) {
      setTimeout(() => {
        this.result.emit(this.porcentaje);
      });
    } else {
      setTimeout(() => {
        this.result.emit(event);
      });
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formInfoCaracteristica.campos[this.getIndexForm('PaisNacimiento')].opciones = list.listPais[0];
        this.formInfoCaracteristica.campos[this.getIndexForm('TipoPoblacion')].opciones = list.listTipoPoblacion[0];
        this.formInfoCaracteristica.campos[this.getIndexForm('TipoDiscapacidad')].opciones = list.listTipoDiscapacidad[0];
        this.formInfoCaracteristica.campos[this.getIndexForm('GrupoSanguineo')].opciones = list.listGrupoSanguineo[0];
        this.formInfoCaracteristica.campos[this.getIndexForm('Rh')].opciones = list.listFactorRh[0];
        this.formInfoCaracteristica.campos[this.getIndexForm('EPS')].opciones = list.listEPS[0];
      },
    );
  }

}
