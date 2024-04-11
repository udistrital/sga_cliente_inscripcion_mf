import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InformacionContacto } from 'src/app/models/informacion/informacion_contacto';
import { Lugar } from 'src/app/models/informacion/lugar';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { ListService } from 'src/app/services/list.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { UserService } from 'src/app/services/users.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
import Swal from 'sweetalert2';
import { FORM_INFORMACION_CONTACTO } from './form-informacion_contacto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';

@Component({
  selector: 'ngx-crud-informacion-contacto',
  templateUrl: './crud-informacion-contacto.component.html',
  styleUrls: ['./crud-informacion-contacto.component.scss']
})
export class CrudInformacionContactoComponent implements OnInit {
  persona_id: number;
  informacion_contacto_id!: number;
  info_informacion_contacto: any;
  InfoSocioEconomica: any;
  InfoContacto: any;
  IDsforPut!: {estrato: 0, codigoPostal: 0, telefono: 0, direccion: 0, correoReg: 0, correoAlt: 0};

  @Input('informacion_contacto_id')
  set name(informacion_contacto_id: number) {
    this.informacion_contacto_id = informacion_contacto_id;
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  formInformacionContacto: any;
  clean!: boolean;
  paisSeleccionado: any;
  departamentoSeleccionado: any;
  denied_acces: boolean = false;
  info_persona_id!: number;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private ubicacionesService: UbicacionService,
    private store: Store<IAppState>,
    private listService: ListService,
    private userService: UserService,
    private inscripcionMidService: InscripcionMidService,
    private autenticationService: ImplicitAutenticationService,
    private snackBar: MatSnackBar) {
    this.formInformacionContacto = FORM_INFORMACION_CONTACTO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.listService.findPais();
    this.listService.findInfoSocioEconomica();
    this.listService.findInfoContacto();
    this.loadLists();
    this.persona_id = this.userService.getPersonaId();
    this.loadInformacionContacto();
  }

  construirForm() {
    this.info_persona_id = this.userService.getPersonaId();
    this.formInformacionContacto.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInformacionContacto.campos.length; i++) {
      this.formInformacionContacto.campos[i].label = this.translate.instant('GLOBAL.' + this.formInformacionContacto.campos[i].label_i18n);
      this.formInformacionContacto.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' + this.formInformacionContacto.campos[i].label_i18n);
    }
    this.formInformacionContacto.campos[this.getIndexForm('CorreoIngreso')].valor = this.autenticationService.getPayload().email;
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getSeleccion(event:any) {
    if (event.nombre === 'PaisResidencia') {
      this.paisSeleccionado = event.valor;
      this.loadOptionsDepartamentoResidencia();
    } else if (event.nombre === 'DepartamentoResidencia') {
      this.departamentoSeleccionado = event.valor;
      this.loadOptionsCiudadResidencia();
    }
  }

  loadOptionsDepartamentoResidencia(): void {
    let consultaHijos: Array<any> = [];
    const departamentoResidencia: Array<any> = [];
    if (this.paisSeleccionado) {
      this.ubicacionesService.get('relacion_lugares?query=LugarPadreId__Id:' + this.paisSeleccionado.Id +
        ',LugarHijoId__Activo:true&limit=0&order=asc&sortby=LugarHijoId__Nombre')
        .subscribe(
          (res:any) => {
            if (res !== null) {
              consultaHijos = <Array<Lugar>>res;
              for (let i = 0; i < consultaHijos.length; i++) {
                departamentoResidencia.push(consultaHijos[i].LugarHijoId);
              }
            }
            this.formInformacionContacto.campos[this.getIndexForm('DepartamentoResidencia')].opciones = departamentoResidencia;
          },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.informacion_contacto') + '|' +
                this.translate.instant('GLOBAL.departamento_residencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  loadOptionsCiudadResidencia(): void {
    let consultaHijos: Array<any> = [];
    const ciudadResidencia: Array<any> = [];
    if (this.departamentoSeleccionado) {
      this.ubicacionesService.get('relacion_lugares?query=LugarPadreId__Id:' + this.departamentoSeleccionado.Id +
        ',LugarHijoId__Activo:true&limit=0&order=asc&sortby=LugarHijoId__Nombre')
        .subscribe((res:any) => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              ciudadResidencia.push(consultaHijos[i].LugarHijoId);
            }
          }

          this.formInformacionContacto.campos[this.getIndexForm('CiudadResidencia')].opciones = ciudadResidencia;
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.informacion_contacto') + '|' +
                this.translate.instant('GLOBAL.ciudad_residencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInformacionContacto.campos.length; index++) {
      const element = this.formInformacionContacto.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  ngOnInit() {
  }

  loadInformacionContacto() {
    if (this.persona_id) {
      this.inscripcionMidService.get('inscripciones/informacion-complementaria/tercero/' + this.persona_id)
        .subscribe((res:any) => {
          
          if (res !== null && res.status != '404') {
            this.info_informacion_contacto = <InformacionContacto>res.data;
            if (this.info_informacion_contacto.PaisResidencia !== null && this.info_informacion_contacto.DepartamentoResidencia !== null
              && this.info_informacion_contacto.CiudadResidencia != null) {
              this.formInformacionContacto.campos[this.getIndexForm('DepartamentoResidencia')].opciones = [this.info_informacion_contacto.DepartamentoResidencia];
              this.formInformacionContacto.campos[this.getIndexForm('CiudadResidencia')].opciones = [this.info_informacion_contacto.CiudadResidencia];
            }
          } else {
            this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_info'));
          }
        },
          (error: HttpErrorResponse) => {
            this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_info'));
            this.info_informacion_contacto = undefined;
          });
    }
  }

  validarForm(event:any) {
    if (event.valid) {
      const formData = event.data.InfoInformacionContacto;
      const tercero = {
        Id: this.persona_id || 1, // se debe cambiar solo por persona id
      }
      const dataInfoContacto = {
        InfoComplementariaTercero: [
          {
            // Estrato
            Id: this.info_informacion_contacto ? this.info_informacion_contacto.IdEstratoEnte || 0 : 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: this.InfoSocioEconomica.find((se:any) => se.CodigoAbreviacion == "ESTRATO").Id,
            },
            Dato: JSON.stringify({ value: formData.EstratoResidencia }),
            Activo: true,
          },
          {
            // CodigoPostal
            Id: this.info_informacion_contacto ? this.info_informacion_contacto.IdCodigoEnte || 0 : 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: this.InfoContacto.find((c:any) => c.CodigoAbreviacion == "CODIGO_POSTAL").Id,
            },
            Dato: JSON.stringify({ value: formData.CodigoPostal }),
            Activo: true,
          },
          {
            // Telefono
            Id: this.info_informacion_contacto ? this.info_informacion_contacto.IdTelefonoEnte || 0 : 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: this.InfoContacto.find((c:any) => c.CodigoAbreviacion == "TELEFONO").Id,
            },
            Dato: JSON.stringify({
              principal: formData.Telefono,
              alterno: formData.TelefonoAlterno,
            }),
            Activo: true,
          },
          {
            // Dirección
            Id: this.info_informacion_contacto ? this.info_informacion_contacto.IdLugarEnte || 0 : 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: this.InfoContacto.find((c:any) => c.CodigoAbreviacion == "DIRECCIÓN").Id,
            },
            Dato: JSON.stringify({
              country: formData.PaisResidencia,
              department: formData.DepartamentoResidencia,
              city: formData.CiudadResidencia,
              address: formData.DireccionResidencia,
            }),
            Activo: true,
          },
          {
            // Correo
            Id: this.info_informacion_contacto ? this.info_informacion_contacto.IdCorreo || 0 : 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: this.InfoContacto.find((c:any) => c.CodigoAbreviacion == "CORREO").Id,
            },
            Dato: JSON.stringify({ value: formData.CorreoIngreso }),
            Activo: true,
          },
          {
            // Correo alterno
            Id: this.info_informacion_contacto ? this.info_informacion_contacto.IdCorreoAlterno || 0 : 0,
            TerceroId: tercero,
            InfoComplementariaId: {
              Id: this.InfoContacto.find((c:any) => c.CodigoAbreviacion == "CORREOALTER").Id,
            },
            Dato: JSON.stringify({ value: formData.CorreoAlterno }),
            Activo: true,
          }
        ],
      }
      if (this.info_informacion_contacto === undefined && !this.denied_acces) {
        this.createInfoContacto(dataInfoContacto);
      } else {
        this.updateInfoContacto(dataInfoContacto);
      }
    }
  }

  updateInfoContacto(info_contacto: any): void {
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
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_informacion_contacto = <InformacionContacto>info_contacto;
          this.info_informacion_contacto.Ente = this.info_persona_id;
          this.inscripcionMidService.put('inscripciones/informacion-complementaria/tercero', this.info_informacion_contacto).subscribe(
            (res: any) => {
              if (res !== null && res.status == '404') {
                this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_data'));
              } else if (res !== null && res.status == '400') {
                this.popUpManager.showAlert('', this.translate.instant('inscripcion.error_update'));
              } else if (res !== null && res.status == '200') {
                  this.snackBar.open(this.translate.instant('inscripcion.actualizar'), '', { duration: 3000, panelClass: ['info-snackbar'] });

                this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar')).then(() => {
                  this.loadInformacionContacto();
                });
              }
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
            },
          );
        }
      });
  }

  createInfoContacto(info_contacto: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('informacion_contacto_posgrado.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        this.info_informacion_contacto = true;
        if (willDelete.value) {
          this.info_informacion_contacto = <any>info_contacto;
          this.inscripcionMidService.post('inscripciones/informacion-complementaria/tercero', this.info_informacion_contacto)
            .subscribe((res:any) => {
              const r = <any>res;
              if (r !== null && r.message !== 'error') {
                this.popUpManager.showSuccessAlert(this.translate.instant('informacion_contacto_posgrado.informacion_contacto_registrada')).then(() => {
                  this.loadInformacionContacto();
                });
                this.snackBar.open(
                  this.translate.instant('informacion_contacto_posgrado.informacion_contacto_registrada'), '', { duration: 3000, panelClass: ['info-snackbar'] });

              } else {
                this.snackBar.open(this.translate.instant('informacion_contacto_posgrado.informacion_contacto_no_registrada'), '', { duration: 3000, panelClass: ['error-snackbar'] });
              }
            },
              (error: HttpErrorResponse) => {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('informacion_contacto_posgrado.informacion_contacto_no_registrada'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
                this.snackBar.open(this.translate.instant('informacion_contacto_posgrado.informacion_contacto_no_registrada'), '', { duration: 3000, panelClass: ['error-snackbar'] });
              });
        }
      });
  }

  setPercentage(event:any) {
    setTimeout(() => {
      this.result.emit(event);
    });
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formInformacionContacto.campos[this.getIndexForm('PaisResidencia')].opciones = list.listPais[0];
        this.InfoContacto = list.listInfoContacto[0];
        this.InfoSocioEconomica = list.listInfoSocioEconomica[0];
      },
    );
  }

}
