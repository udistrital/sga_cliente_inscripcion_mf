import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ListService } from 'src/app/services/list.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
import { FORM_INFO_PERSONA } from './form-info_persona';
import { InfoPersona } from 'src/app/models/informacion/info_persona';
import { HttpErrorResponse } from '@angular/common/http';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import * as moment from 'moment-timezone';
import * as momentTimezone from 'moment-timezone';
import { VideoModalComponent } from 'src/app/modules/components/video-modal.component/video-modal.component.component';
import { validateLang } from 'src/app/app.component';
import { environment } from 'src/environments/environment';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';
import { encrypt } from 'src/app/utils/util-encrypt';
import { UserService } from 'src/app/services/users.service';
import { ROLES } from 'src/app/models/diccionario/diccionario';

@Component({
  selector: 'ngx-crud-info-persona',
  templateUrl: './crud-info-persona.component.html',
  styleUrls: ['./crud-info-persona.component.scss'],
})
export class CrudInfoPersonaComponent implements OnInit {
  filesUp: any;
  info_persona_id: number | null = null;
  inscripcion_id!: number;
  faltandatos: boolean = false;
  existePersona: boolean = false;
  datosEncontrados: any;
  forzarCambioUsuario: boolean = false;

  @Input('info_persona_id')
  set persona(info_persona_id: number | null) {
    this.info_persona_id = info_persona_id;
    this.loadInfoPersona();
  }

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (
      this.inscripcion_id !== undefined &&
      this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== '' &&
      this.inscripcion_id.toString() !== '0'
    ) {
      //this.loadInscripcion();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter(true);

  // tslint:disable-next-line: no-output-rename
  @Output('success') success: EventEmitter<any> = new EventEmitter();

  info_info_persona: any;
  formInfoPersona: any;
  regInfoPersona: any;
  info_inscripcion: any;
  clean!: boolean;
  percentage!: number;
  aceptaTerminos: boolean = false;
  programa!: number;
  aspirante!: number;
  periodo: any;

  constructor(
    private dialog: MatDialog,
    private listService: ListService,
    private popUpManager: PopUpManager,
    private store: Store<IAppState>,
    private terceroMidService: TerceroMidService,
    private userService: UserService,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    this.formInfoPersona = UtilidadesService.hardCopy(FORM_INFO_PERSONA);
    this.construirForm();
    Promise.all([
      this.listService.findGenero(),
      this.listService.findTipoIdentificacion(),
    ]).then(() => {
      this.loadLists();
    });
    this.formInfoPersona.campos[this.getIndexForm('CorreoElectronico')].valor = this.userService.getPayload().email;
    console.log(this.info_persona_id, this.inscripcion_id)
  }

  construirForm() {
    validateLang(this.translate);
    setTimeout(() => {
      for (let i = 0; i < this.formInfoPersona.campos.length; i++) {
        this.formInfoPersona.campos[i].label = this.translate.instant(
          'GLOBAL.' + this.formInfoPersona.campos[i].label_i18n
        );
        this.formInfoPersona.campos[i].placeholder = this.translate.instant(
          'GLOBAL.placeholder_' + this.formInfoPersona.campos[i].label_i18n
        );
      }
    }, 1000);
    this.formInfoPersona.btn = this.translate.instant('GLOBAL.guardar');
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoPersona.campos.length; index++) {
      const element = this.formInfoPersona.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }

  async loadInfoPersona() {
    if (this.info_persona_id !== null) {
      const infoPersona: any = await this.recuperarInfoPersona(); 
      if (infoPersona !== null && infoPersona.Id !== undefined) {
        const temp = <InfoPersona>infoPersona;
        this.aceptaTerminos = true;
        this.info_info_persona = temp;
        this.datosEncontrados = { ...infoPersona };
        const files = [];
        this.formInfoPersona.btn = '';
        if (temp.Genero && temp.Genero.Nombre != 'NO APLICA') {
          this.formInfoPersona.campos[this.getIndexForm('Genero')].valor = temp.Genero;
        }
        this.formInfoPersona.campos[this.getIndexForm('TipoIdentificacion')].valor = temp.TipoIdentificacion;
        if (temp.FechaNacimiento != null) {
          temp.FechaNacimiento = temp.FechaNacimiento.replace('T00:00:00Z', 'T05:00:00Z');
          this.formInfoPersona.campos[this.getIndexForm('FechaNacimiento')].valor = moment(temp.FechaNacimiento, 'YYYY-MM-DDTHH:mm:ss').tz('America/Bogota').toDate();
        }
        if (temp.FechaExpedicion != null) {
          temp.FechaExpedicion = temp.FechaExpedicion.replace('T00:00:00Z', 'T05:00:00Z');
          this.formInfoPersona.campos[this.getIndexForm('FechaExpedicion')].valor = moment(temp.FechaExpedicion, 'YYYY-MM-DDTHH:mm:ss').tz('America/Bogota').toDate();
        }
        this.formInfoPersona.campos.splice(this.getIndexForm('VerificarNumeroIdentificacion'), 1);
        this.formInfoPersona.campos.forEach((campo: any) => {
          campo.deshabilitar = true;
        });
        if (temp.Telefono == null || temp.Telefono == undefined) {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info_persona'), this.translate.instant('inscripcion.sin_telefono'));
        }
      }
    } else {
      this.clean = !this.clean;
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('GLOBAL.no_info_persona'));
    }
  }

  recuperarInfoPersona() {
    return new Promise((resolve, reject) => {
      this.terceroMidService.get('personas/' + this.info_persona_id).subscribe(
          (res: any) => {
            console.log(res);
            resolve(res.Data);
          },
          (error: any) => {
            console.error(error);
            Swal.fire({
              icon: 'info',
              title: this.translate.instant('GLOBAL.info_persona'),
              text: this.translate.instant('GLOBAL.no_info_persona'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
            reject([]);
          }
        );
    });
  }

  checkExistePersona(e: any) {
    let doc = this.formInfoPersona.campos[this.getIndexForm('NumeroIdentificacion')].valor;
    let verif = this.formInfoPersona.campos[this.getIndexForm('VerificarNumeroIdentificacion')].valor;
    if (doc && verif && doc == verif && !this.aceptaTerminos) {
      this.terceroMidService.get('personas/existencia/' + doc).subscribe(
        (res) => {
          res = res.data;
          this.info_info_persona = res[0];
          this.datosEncontrados = { ...res[0] };
          if (res[0].FechaNacimiento != null) {
            res[0].FechaNacimiento = res[0].FechaNacimiento.replace('T00:00:00Z', 'T05:00:00Z');
            this.formInfoPersona.campos[this.getIndexForm('FechaNacimiento')].valor = moment(res[0].FechaNacimiento, 'YYYY-MM-DDTHH:mm:ss').tz('America/Bogota').toDate();
          }
          if (res[0].FechaExpedicion != null) {
            res[0].FechaExpedicion = res[0].FechaExpedicion.replace('T00:00:00Z', 'T05:00:00Z');
            this.formInfoPersona.campos[this.getIndexForm('FechaExpedicion')].valor = moment(res[0].FechaExpedicion, 'YYYY-MM-DDTHH:mm:ss').tz('America/Bogota').toDate();
          }
          if (res[0].Genero.Nombre != 'NO APLICA') {
            this.formInfoPersona.campos[this.getIndexForm('Genero')].valor = res[0].Genero;
          }

          this.formInfoPersona.campos.splice(this.getIndexForm('VerificarNumeroIdentificacion'), 1);

          this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.persona_ya_existe'), this.translate.instant('inscripcion.info_persona_ya_existe'), 'info', false)
            .then(() => {
              let UsuarioExistente = <string>this.info_info_persona.UsuarioWSO2;
              let correoActual = <string>this.userService.getPayload().email;
              if (
                UsuarioExistente.match(UtilidadesService.ListaPatrones.correo)
              ) {
                if (UsuarioExistente != correoActual) {
                  this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.info_persona'), this.translate.instant(
                        'inscripcion.ya_existe_usuarioCorreo'
                      ) +
                        '<br>' +
                        this.translate.instant('inscripcion.correo_anterior') +
                        ': ' +
                        UsuarioExistente +
                        '<br>' +
                        this.translate.instant('inscripcion.correo_actual') +
                        ': ' +
                        correoActual,
                      'info',
                      true
                    )
                    .then((action) => {
                      if (action.value) {
                        this.forzarCambioUsuario = true;
                      } else {
                        // this.autenticationService.logout('from inscripcion');
                      }
                    });
                }
              } else {
                this.forzarCambioUsuario = true;
              }
            });
          this.existePersona = true;
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }

  updateInfoPersona(infoPersona: any) {
    let prepareUpdate: any = {
      Tercero: { hasId: null, data: {} },
      Identificacion: { hasId: null, data: {} },
      Complementarios: {
        Genero: { hasId: null, data: {} },
        Telefono: { hasId: null, data: {} },
      },
    };

    prepareUpdate.Tercero.hasId = infoPersona.Id;

    if (!this.datosEncontrados.PrimerNombre) {
      prepareUpdate.Tercero.data['PrimerNombre'] = infoPersona.PrimerNombre;
    }
    if (!this.datosEncontrados.SegundoNombre) {
      prepareUpdate.Tercero.data['SegundoNombre'] = infoPersona.SegundoNombre;
    }
    if (!this.datosEncontrados.PrimerApellido) {
      prepareUpdate.Tercero.data['PrimerApellido'] = infoPersona.PrimerApellido;
    }
    if (!this.datosEncontrados.SegundoApellido) {
      prepareUpdate.Tercero.data['SegundoApellido'] = infoPersona.SegundoApellido;
    }
    if (!this.datosEncontrados.FechaNacimiento) {
      prepareUpdate.Tercero.data['FechaNacimiento'] = momentTimezone.tz(infoPersona.FechaNacimiento, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000';
    }
    if (!this.datosEncontrados.UsuarioWSO2 || this.forzarCambioUsuario) {
      prepareUpdate.Tercero.hasId = infoPersona.Id;
      prepareUpdate.Tercero.data['UsuarioWSO2'] = this.userService.getPayload().email;
    }

    if (!this.datosEncontrados.FechaExpedicion) {
      prepareUpdate.Identificacion.hasId = this.datosEncontrados.IdentificacionId;
      prepareUpdate.Identificacion.data = {
        FechaExpedicion: momentTimezone.tz(infoPersona.FechaExpedicion, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss') + ' +0000 +0000',
      };
    }

    if (this.datosEncontrados.hasOwnProperty('Genero')) {
      prepareUpdate.Complementarios.Genero.hasId = this.datosEncontrados.GeneroId;
    }
    prepareUpdate.Complementarios.Genero.data = infoPersona.Genero;

    if (this.datosEncontrados.hasOwnProperty('Telefono')) {
      prepareUpdate.Complementarios.Telefono.hasId = this.datosEncontrados.TelefonoId;
    }
    let dataTel = {
      principal: infoPersona.Telefono,
      alterno: this.datosEncontrados.TelefonoAlterno
        ? this.datosEncontrados.TelefonoAlterno
        : null,
    };
    prepareUpdate.Complementarios.Telefono.data = JSON.stringify(dataTel);

    this.terceroMidService.put('personas', prepareUpdate).subscribe(
      (response: any) => {
        response = response.Data;
        this.faltandatos = false;
        this.existePersona = false;
        this.formInfoPersona.btn = '';
        this.formInfoPersona.campos.forEach((campo: any) => {
          campo.deshabilitar = true;
        });
        window.localStorage.setItem('ente', response.tercero.Id);
        const tercero_id = encrypt(response.tercero.Id.toString());
        window.localStorage.setItem('persona_id', tercero_id);
        this.info_persona_id = response.tercero.Id;
        sessionStorage.setItem('IdTercero', String(this.info_persona_id));
        this.setPercentage(1);
        Swal.fire({
          icon: 'success',
          title: this.translate.instant('GLOBAL.persona_actualizado'),
          text: this.translate.instant('GLOBAL.operacion_exitosa'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar')
        }).then(() => {
          window.location.reload();
        });
        this.success.emit();
        // Evitar limpiar el formulario
        this.loadInfoPersona();
      },
      (error: HttpErrorResponse) => {
        console.error(error);
        this.popUpManager.showErrorAlert(
          this.translate.instant('GLOBAL.error_actualizar_persona')
        );
      }
    );
  }

  createInfoPersona(infoPersona: any): void {
    const files = [];
    infoPersona.FechaNacimiento = momentTimezone.tz(infoPersona.FechaNacimiento, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
    infoPersona.FechaNacimiento = infoPersona.FechaNacimiento + ' +0000 +0000';
    infoPersona.FechaExpedicion = momentTimezone.tz(infoPersona.FechaExpedicion, 'America/Bogota').format('YYYY-MM-DD HH:mm:ss');
    infoPersona.FechaExpedicion = infoPersona.FechaExpedicion + ' +0000 +0000';
    infoPersona.NumeroIdentificacion = infoPersona.NumeroIdentificacion.toString();
    infoPersona.Usuario = this.userService.getPayload().email;
    this.terceroMidService.post('personas', infoPersona).subscribe(
      (res: any) => {
        res = res.Data;
        const r = <any>res;
        if (r !== null && r.Type !== 'error') {
          window.localStorage.setItem('ente', r.Id);
          const r_id = encrypt(r.Id.toString());
          window.localStorage.setItem('persona_id', r_id);
          this.info_persona_id = r.Id;
          sessionStorage.setItem('IdTercero', String(this.info_persona_id));
          this.formInfoPersona.campos.splice(this.getIndexForm('VerificarNumeroIdentificacion'), 1);
          this.formInfoPersona.btn = '';
          this.formInfoPersona.campos.forEach((campo: any) => {
            campo.deshabilitar = true;
          });
          this.setPercentage(1);
          // Mostrar modal de éxito y recargar la página al cerrarlo
          Swal.fire({
            icon: 'success',
            title: this.translate.instant('GLOBAL.persona_creado'),
            text: this.translate.instant('GLOBAL.operacion_exitosa'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar')
          }).then(() => {
            window.location.reload();
          });
          this.success.emit();
          // Evitar limpiar el formulario
          this.loadInfoPersona();
        } else {
          this.popUpManager.showErrorToast(
            this.translate.instant('GLOBAL.error')
          );
        }
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('GLOBAL.crear') + '-' + this.translate.instant('GLOBAL.info_persona'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      }
    );
  }

  validarForm(event: any) {
    if (event.valid) {
      if (this.info_inscripcion === undefined) {
        this.validarTerminos(event);
      } else {
        if (this.info_inscripcion.AceptaTerminos !== true) {
          this.validarTerminos(event);
        } else {
          this.formInfoPersona.btn = '';
        }
      }
    }
  }

  validarTerminos(event: any) {
    Swal.fire({
      title: this.translate.instant('GLOBAL.terminos_datos'),
      width: 800,
      allowOutsideClick: false,
      allowEscapeKey: true,
      html:
        '<embed src=' +
        environment.apiUrl +
        'assets/pdf/politicasUD.pdf' +
        ' type="application/pdf" style="width:100%; height:375px;" frameborder="0"></embed>',
      input: 'checkbox',
      inputPlaceholder: this.translate.instant('GLOBAL.acepto_terminos'),
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    }).then((result: any) => {
      if (result.value) {
        this.aceptaTerminos = true;
        if (this.existePersona || this.faltandatos) {
          this.popUpManager.showPopUpGeneric(this.translate.instant('GLOBAL.actualizar'), this.translate.instant('GLOBAL.actualizar_info_persona'), 'warning', true)
            .then((action) => {
              if (action.value) {
                this.updateInfoPersona(event.data.InfoPersona);
              } else {
                this.aceptaTerminos = false;
              }
            });
        } else {
          this.popUpManager.showPopUpGeneric(this.translate.instant('GLOBAL.crear'), this.translate.instant('GLOBAL.crear_info_persona'), 'warning', true)
            .then((action) => {
              if (action.value) {
                this.createInfoPersona(event.data.InfoPersona);
              } else {
                this.aceptaTerminos = false;
              }
            });
        }
      } else if (result.value === 0) {
        Swal.fire({
          icon: 'error',
          text: this.translate.instant('GLOBAL.rechazo_terminos'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
        this.aceptaTerminos = false;
      }
    });
  }

  setPercentage(event: any) {
    if (this.aceptaTerminos) {
      this.percentage = event;
    } else {
      this.percentage = event * 0.98;
    }
    this.result.emit(this.percentage);
    if (event < 1.0) {
      this.formInfoPersona.campos.forEach((campo: any) => {
        if (!campo.valor) {
          campo.deshabilitar = false;
        }
      });
      this.formInfoPersona.btn = this.translate.instant('GLOBAL.guardar');
      this.faltandatos = true;
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe((list) => {
        if (list.listGenero && Array.isArray(list.listGenero)) {
          this.formInfoPersona.campos[this.getIndexForm('Genero')].opciones = (<any>list.listGenero[0]).filter((g: any) => g.Nombre != 'NO APLICA');
        }
        if (list.listTipoIdentificacion && Array.isArray(list.listTipoIdentificacion)) {
          this.formInfoPersona.campos[this.getIndexForm('TipoIdentificacion')].opciones = list.listTipoIdentificacion[0];
        }
      });
  }

  openVideoModal(videoId: string): void {
    const dialogRef = this.dialog.open(VideoModalComponent, {
      width: '600px',
      data: { videoId: videoId },
    });
  }
}
