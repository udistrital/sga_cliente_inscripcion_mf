import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Tercero } from 'src/app/models/terceros/tercero';
import { TrPostInformacionFamiliar } from 'src/app/models/terceros/tercero_familiar';
import { TipoParentesco } from 'src/app/models/terceros/tipo_parentesco';
import { TercerosService } from 'src/app/services/terceros.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { UserService } from 'src/app/services/users.service';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { FORM_INFORMACION_FAMILIAR } from './form-informacion_familiar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';

@Component({
  selector: 'ngx-crud-informacion-familiar',
  templateUrl: './crud-informacion-familiar.component.html',
  styleUrls: ['./crud-informacion-familiar.component.scss'],
})
export class CrudInformacionFamiliarComponent implements OnInit {
  informacion_contacto_id!: number;
  info_persona_id!: number | null;
  info_info_familiar: any;
  tempcorreoPrincipal: any;
  tempcorreoAlterno: any;
  temptelefonoPrincipal: any;
  tempdireccionPrincipal: any;
  tempdireccionAlterno: any;
  temptelefonoAlterno: any;

  @Input('info_persona_id')
  set persona(info_persona_id: number) {
    this.info_persona_id = info_persona_id;
    this.loadInfoPersona();
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  //info_informacion_contacto: InformacionContacto;
  info_informacion_familiar: any;
  formInformacionFamiliar: any;
  regInformacionContacto: any;
  clean!: boolean;
  denied_acces: boolean = false;
  paisSeleccionado: any;
  departamentoSeleccionado: any;
  ciudadSeleccionada: any;
  datosPost: any;
  datosGet: any;
  datosPut: any;

  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private terceroMidService: TerceroMidService,
    private inscripcionMidService: InscripcionMidService,
    private userService: UserService,
    private tercerosService: TercerosService,
    private snackBar: MatSnackBar
  ) {
    this.formInformacionFamiliar = FORM_INFORMACION_FAMILIAR;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadOptionsParentesco();
  }

  construirForm() {
    // this.formInformacionContacto.titulo = this.translate.instant('GLOBAL.informacion_contacto');
    this.formInformacionFamiliar.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInformacionFamiliar.campos.length; i++) {
      this.formInformacionFamiliar.campos[i].label = this.translate.instant(
        'GLOBAL.' + this.formInformacionFamiliar.campos[i].label_i18n
      );
      this.formInformacionFamiliar.campos[i].placeholder =
        this.translate.instant(
          'GLOBAL.placeholder_' +
            this.formInformacionFamiliar.campos[i].label_i18n
        );
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (
      let index = 0;
      index < this.formInformacionFamiliar.campos.length;
      index++
    ) {
      const element = this.formInformacionFamiliar.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }

  async ngOnInit() {
    await this.initializePersonaId();
    this.construirForm();
    this.loadInfoPersona();
  }

  async initializePersonaId() {
    try {
      this.info_persona_id = await this.userService.getPersonaId();
    } catch (error) {
      this.info_persona_id = 1; // Valor por defecto en caso de error
      console.error('Error al obtener persona_id:', error);
    }
  }

  public loadInfoPersona(): void {
    if (this.info_persona_id !== null) {
      this.terceroMidService
        .get('personas/' + this.info_persona_id + '/familiar')
        .subscribe(
          (res) => {
            if (res !== null && res.status == '404') {
              this.popUpManager.showAlert(
                '',
                this.translate.instant('inscripcion.no_info')
              );
            } else if (res !== null && res.status == '400') {
              //MENSAJE DE ALGO ANDA MAL
            } else if (res !== null && res.status == '200') {
              this.info_info_familiar = <any>res.data;
            }
          },
          (error: HttpErrorResponse) => {
            this.popUpManager.showAlert(
              '',
              this.translate.instant('inscripcion.no_info')
            );
          }
        );
    } else {
      this.info_info_familiar = undefined;
      this.clean = !this.clean;
      this.denied_acces = false; // no muestra el formulario a menos que se le pase un id del ente info_caracteristica_id
    }
  }

  setPercentage(event: any) {
    setTimeout(() => {
      this.result.emit(event);
    });
  }

  loadOptionsParentesco(): void {
    let parentescos: Array<any> = [];
    this.tercerosService
      .get('tipo_parentesco?limit=0&query=Activo:true')
      .subscribe((res) => {
        if (res !== null) {
          parentescos = <Array<TipoParentesco>>res;
        }
        this.formInformacionFamiliar.campos[
          this.getIndexForm('Parentesco')
        ].opciones = parentescos;
        this.formInformacionFamiliar.campos[
          this.getIndexForm('ParentescoAlterno')
        ].opciones = parentescos;
      });
  }

  public validarForm(event: any) {
    if (event.valid) {
      const formData = event.data.InformacionFamiliar;
      const tercero: Tercero = {
        Id: Number(this.info_persona_id),
        NombreCompleto: undefined,
        TipoContribuyenteId: {
          Id: 1,
          Nombre: undefined,
        },
      };
      const informacionFamiliarPost: TrPostInformacionFamiliar = {
        Tercero_Familiar: tercero,
        Familiares: [
          {
            Familiar: {
              Id: 0,
              TerceroId: tercero,
              TerceroFamiliarId: {
                Id: 0,
                NombreCompleto: formData.NombreFamiliarPrincipal,
                TipoContribuyenteId: {
                  Id: 1,
                  Nombre: undefined,
                },
              },
              TipoParentescoId: formData.Parentesco,
              CodigoAbreviacion: 'CONTPRIN',
            },
            InformacionContacto: [
              {
                // telefono
                Id: 0,
                TerceroId: tercero,
                InfoComplementariaId: {
                  Id: 51,
                  Nombre: undefined,
                  CodigoAbreviacion: undefined,
                  Activo: undefined,
                  GrupoInfoComplementariaId: undefined,
                },
                Dato: JSON.stringify({ value: formData.Telefono }),
                Activo: true,
              },
              {
                // correo
                Id: 0,
                TerceroId: tercero,
                InfoComplementariaId: {
                  Id: 53,
                  Nombre: undefined,
                  CodigoAbreviacion: undefined,
                  Activo: undefined,
                  GrupoInfoComplementariaId: undefined,
                },
                Dato: JSON.stringify({ value: formData.CorreoElectronico }),
                Activo: true,
              },
              {
                // dirección
                Id: 0,
                TerceroId: tercero,
                InfoComplementariaId: {
                  Id: 54,
                  Nombre: undefined,
                  CodigoAbreviacion: undefined,
                  Activo: undefined,
                  GrupoInfoComplementariaId: undefined,
                },
                Dato: JSON.stringify({ value: formData.DireccionResidencia }),
                Activo: true,
              },
            ],
          },
          {
            Familiar: {
              Id: 0,
              TerceroId: tercero,
              TerceroFamiliarId: {
                Id: 0,
                NombreCompleto: formData.NombreFamiliarAlterno,
                TipoContribuyenteId: {
                  Id: 1,
                  Nombre: undefined,
                },
              },
              TipoParentescoId: formData.ParentescoAlterno,
              CodigoAbreviacion: 'CONTALT',
            },
            InformacionContacto: [
              {
                // telefono
                Id: 0,
                TerceroId: tercero,
                InfoComplementariaId: {
                  Id: 51,
                  Nombre: undefined,
                  CodigoAbreviacion: undefined,
                  Activo: undefined,
                  GrupoInfoComplementariaId: undefined,
                },
                Dato: JSON.stringify({ value: formData.TelefonoAlterno }),
                Activo: true,
              },
              {
                // correo
                Id: 0,
                TerceroId: tercero,
                InfoComplementariaId: {
                  Id: 53,
                  Nombre: undefined,
                  CodigoAbreviacion: undefined,
                  Activo: undefined,
                  GrupoInfoComplementariaId: undefined,
                },
                Dato: JSON.stringify({
                  value: formData.CorreoElectronicoAlterno,
                }),
                Activo: true,
              },
              {
                // dirección
                Id: 0,
                TerceroId: tercero,
                InfoComplementariaId: {
                  Id: 54,
                  Nombre: undefined,
                  CodigoAbreviacion: undefined,
                  Activo: undefined,
                  GrupoInfoComplementariaId: undefined,
                },
                Dato: JSON.stringify({
                  value: formData.DireccionResidenciaAlterno,
                }),
                Activo: true,
              },
            ],
          },
        ],
      };
      if (this.info_info_familiar === undefined && !this.denied_acces) {
        this.createInfoFamiliar(informacionFamiliarPost);
      } else {
        this.updateInfoFamiliar(informacionFamiliarPost);
      }
    }
  }

  updateInfoFamiliar(info_familiar: any) {
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
    Swal.fire(opt).then((willDelete: any) => {
      if (willDelete.value) {
        //FUNCION PUT
        this.terceroMidService
          .put('personas/info-familiar', info_familiar)
          .subscribe(
            (res: any) => {
              if (res !== null && res.status == '404') {
                this.popUpManager.showAlert(
                  '',
                  this.translate.instant('inscripcion.no_data')
                );
              } else if (res !== null && res.status == '400') {
                this.popUpManager.showAlert(
                  '',
                  this.translate.instant('inscripcion.error_update')
                );
              } else if (res !== null && res.status == '200') {
                this.popUpManager.showSuccessAlert(
                  this.translate.instant('inscripcion.actualizar')
                );
                this.loadInfoPersona();
              }
            },
            (error: HttpErrorResponse) => {
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer:
                  this.translate.instant('GLOBAL.actualizar') +
                  '-' +
                  this.translate.instant('GLOBAL.info_caracteristica'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            }
          );
      }
    });
  }

  createInfoFamiliar(info_familiar: any) {
    this.inscripcionMidService
      .post('inscripciones/informacion-familiar', info_familiar)
      .subscribe(
        (res: any) => {
          if (res.message === 'error') {
            Swal.fire({
              icon: 'error',
              title: res.Code,
              text: this.translate.instant('ERROR.' + res.status),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });

            this.snackBar.open(
              this.translate.instant(
                'informacion_familiar.informacion_familiar_no_actualizada'
              ),
              '',
              { duration: 3000, panelClass: ['error-snackbar'] }
            );
          } else {
            this.snackBar.open(
              this.translate.instant(
                'informacion_familiar.informacion_familiar_actualizada'
              ),
              '',
              { duration: 3000, panelClass: ['success-snackbar'] }
            );
          }
        },
        () => {
          this.snackBar.open(
            this.translate.instant(
              'informacion_familiar.informacion_familiar_no_actualizada'
            ),
            '',
            { duration: 3000, panelClass: ['error-snackbar'] }
          );
        }
      );
  }
}
