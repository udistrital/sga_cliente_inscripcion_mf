import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InfoIdioma } from 'src/app/models/idioma/info_idioma';
import { IdiomaService } from 'src/app/services/idioma.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ListService } from 'src/app/services/list.service';
import { UserService } from 'src/app/services/users.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { FORM_IDIOMAS } from './form-idiomas';
import { SharedStateService } from '../shared-state.service';

@Component({
  selector: 'ngx-crud-idiomas',
  templateUrl: './crud-idiomas.component.html',
  styleUrls: ['./crud-idiomas.component.scss'],
})
export class CrudIdiomasComponent implements OnInit {
  info_idioma_id!: number;
  inscripcion_id!: number;

  @Input('info_idioma_id')
  set name(info_idioma_id: number) {
    this.info_idioma_id = info_idioma_id;
    this.loadInfoIdioma();
  }

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    if (
      inscripcion_id !== undefined &&
      inscripcion_id !== 0 &&
      inscripcion_id.toString() !== ''
    ) {
      this.inscripcion_id = inscripcion_id;
      if (this.formData) {
        this.createInfoIdioma(this.formData);
      }
    }
  }

  @Output() crear_inscripcion: EventEmitter<any> = new EventEmitter();

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_idioma: InfoIdioma | undefined;
  formInfoIdioma: any;
  formData: any;
  clean!: boolean;
  percentage!: number;
  terceroId!: number | null;
  idioma!: number | undefined;
  canEmit: boolean = false;
  idioma_examen!: number | null;

  constructor(
    private translate: TranslateService,
    private users: UserService,
    private idiomaService: IdiomaService,
    private inscripcionService: InscripcionService,
    private store: Store<IAppState>,
    private listService: ListService,
    private popUpManager: PopUpManager,
    private sharedStateService: SharedStateService
  ) {
    this.formInfoIdioma = FORM_IDIOMAS;
    this.construirForm();
    this.listService.findIdioma();
    this.listService.findNivelIdioma();
    this.listService.findClasificacionNivelIdioma();
    this.loadLists();
  }

  async ngOnInit() {
    this.sharedStateService.idiomaExamen$.subscribe((idioma) => {
      this.idioma_examen = idioma;
    });
    await this.initializePersonaId();
  }

  construirForm() {
    // this.formInfoIdioma.titulo = this.translate.instant('GLOBAL.idiomas');
    this.formInfoIdioma.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formInfoIdioma.campos.length; i++) {
      this.formInfoIdioma.campos[i].label = this.translate.instant(
        'GLOBAL.' + this.formInfoIdioma.campos[i].label_i18n
      );
      this.formInfoIdioma.campos[i].placeholder = this.translate.instant(
        'GLOBAL.placeholder_' + this.formInfoIdioma.campos[i].label_i18n
      );
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formInfoIdioma.campos.length; index++) {
      const element = this.formInfoIdioma.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }

  async initializePersonaId() {
    try {
      this.terceroId = await this.users.getPersonaId();
    } catch (error) {
      this.terceroId = 1; // Valor por defecto en caso de error
      console.error('Error al obtener persona_id:', error);
    }
  }

  setPercentage(event: any) {
    this.percentage = event;
    if (this.canEmit) {
      this.result.emit(this.percentage);
      this.canEmit = false;
    }
  }

  createInfoIdioma(infoIdioma: any): void {
    this.info_idioma = undefined;
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant('idiomas.seguro_continuar_registrar'),
        this.translate.instant('GLOBAL.crear')
      )
      .then((willDelete) => {
        if (willDelete.value) {
          this.info_idioma = <InfoIdioma>infoIdioma;
          console.log(this.info_idioma);
          if (this.info_idioma.Nativo != true) {
            this.info_idioma.Nativo = false;
          }
          if (this.info_idioma.SeleccionExamen != true) {
            this.info_idioma.SeleccionExamen = false;
          }
          this.info_idioma.TercerosId = this.terceroId || 1;
          if (
            this.info_idioma.Nativo === true &&
            this.info_idioma.Nativo === this.info_idioma.SeleccionExamen
          ) {
            this.popUpManager.showErrorAlert(
              this.translate.instant('idiomas.error_nativo_examen')
            );
          } else if (
            this.info_idioma.SeleccionExamen === true &&
            this.idioma_examen
          ) {
            const nombre = this.formInfoIdioma.campos[
              this.getIndexForm('IdiomaId')
            ].opciones.find(
              (idioma: any) => idioma.Id === this.idioma_examen
            )?.Nombre;
            this.popUpManager.showErrorAlert(
              this.translate.instant('idiomas.error_doble_examen') +
                ' : ' +
                nombre
            );
          } else {
            this.idiomaService
              .get(
                `conocimiento_idioma?query=TercerosId:${this.terceroId},IdiomaId:${this.info_idioma.IdiomaId.Id},Activo:true`
              )
              .subscribe((idiomas) => {
                if (idiomas.length > 0 && Object.keys(idiomas[0]).length > 0) {
                  this.popUpManager.showErrorAlert(
                    this.translate.instant('inscripcion.error_idioma_existente')
                  );
                  return;
                }

                if (this.info_idioma) {
                  this.info_idioma.Activo = true;
                }
                this.idiomaService
                  .post('conocimiento_idioma', this.info_idioma)
                  .subscribe(
                    (res) => {
                      const r = <any>res;
                      if (r !== null && r.Type !== 'error') {
                        if (this.info_idioma!.SeleccionExamen === true) {
                          const examen = {
                            Idioma: this.info_idioma!.IdiomaId.Id,
                            Activo: true,
                            InscripcionId: { Id: Number(this.inscripcion_id) },
                          };
                          this.inscripcionService
                            .get(
                              'inscripcion_posgrado/?query=InscripcionId:' +
                                examen.InscripcionId.Id
                            )
                            .subscribe(
                              (res) => {
                                const r = <any>res;
                                if (
                                  r !== null &&
                                  r.Type !== 'error' &&
                                  JSON.stringify(r[0]).toString() !== '{}'
                                ) {
                                  // El registro ya existe, realizar una actualización
                                  this.inscripcionService
                                    .put(
                                      'inscripcion_posgrado/' + r[0].Id,
                                      examen
                                    )
                                    .subscribe(
                                      (resexamen) => {
                                        const rex = <any>resexamen;
                                        if (
                                          rex !== null &&
                                          rex.Type !== 'error'
                                        ) {
                                          this.sharedStateService.setIdiomaExamen(
                                            rex.Idioma
                                          );
                                        }
                                      },
                                      (error: HttpErrorResponse) => {
                                        Swal.fire({
                                          icon: 'error',
                                          title: error.status + '',
                                          text: this.translate.instant(
                                            'ERROR.' + error.status
                                          ),
                                          footer: this.translate.instant(
                                            'idiomas.informacion_idioma_no_actualizada'
                                          ),
                                          confirmButtonText:
                                            this.translate.instant(
                                              'GLOBAL.aceptar'
                                            ),
                                        });
                                      }
                                    );
                                } else {
                                  // El registro no existe, realizar una inserción
                                  this.inscripcionService
                                    .post('inscripcion_posgrado/', examen)
                                    .subscribe(
                                      (resexamen) => {
                                        const rex = <any>resexamen;
                                        if (
                                          rex !== null &&
                                          rex.Type !== 'error'
                                        ) {
                                          this.sharedStateService.setIdiomaExamen(
                                            rex.Idioma
                                          );
                                        }
                                      },
                                      (error: HttpErrorResponse) => {
                                        Swal.fire({
                                          icon: 'error',
                                          title: error.status + '',
                                          text: this.translate.instant(
                                            'ERROR.' + error.status
                                          ),
                                          footer: this.translate.instant(
                                            'idiomas.informacion_idioma_no_registrada'
                                          ),
                                          confirmButtonText:
                                            this.translate.instant(
                                              'GLOBAL.aceptar'
                                            ),
                                        });
                                      }
                                    );
                                }
                              },
                              (error: HttpErrorResponse) => {
                                Swal.fire({
                                  icon: 'error',
                                  title: error.status + '',
                                  text: this.translate.instant(
                                    'ERROR.' + error.status
                                  ),
                                  footer: this.translate.instant(
                                    'idiomas.informacion_idioma_no_verificada'
                                  ),
                                  confirmButtonText:
                                    this.translate.instant('GLOBAL.aceptar'),
                                });
                              }
                            );
                        }
                        this.canEmit = true;
                        this.setPercentage(1);
                        this.eventChange.emit(true);
                        this.popUpManager.showSuccessAlert(
                          this.translate.instant(
                            'idiomas.informacion_idioma_registrada'
                          )
                        );
                        this.info_idioma_id = 0;
                        this.info_idioma = undefined;
                        this.clean = !this.clean;
                      }
                    },
                    (error: HttpErrorResponse) => {
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant(
                          'idiomas.informacion_idioma_no_registrada'
                        ),
                        confirmButtonText:
                          this.translate.instant('GLOBAL.aceptar'),
                      });
                    }
                  );
              });
          }
        }
      });
  }

  public loadInfoIdioma(): void {
    if (
      this.info_idioma_id !== undefined &&
      this.info_idioma_id !== 0 &&
      this.info_idioma_id.toString() !== ''
    ) {
      this.idiomaService
        .get('conocimiento_idioma/?query=Id:' + this.info_idioma_id)
        .subscribe(
          (res) => {
            if (res !== null) {
              this.info_idioma = <InfoIdioma>res[0];
              this.idioma = this.info_idioma.IdiomaId.Id;
            }
          },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant(
                'idiomas.error_cargar_informacion_idiomas'
              ),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          }
        );
    } else {
      this.info_idioma = undefined;
      this.idioma = undefined;
      this.clean = !this.clean;
    }
  }

  updateInfoIdioma(infoIdioma: InfoIdioma) {
    this.popUpManager
      .showConfirmAlert(
        this.translate.instant('idiomas.seguro_actualizar_idioma'),
        this.translate.instant('GLOBAL.actualizar')
      )
      .then((willUpdate) => {
        if (willUpdate.value) {
          this.info_idioma = infoIdioma;
          if (
            this.info_idioma.Nativo === true &&
            this.info_idioma.Nativo === this.info_idioma.SeleccionExamen
          ) {
            this.popUpManager.showErrorAlert(
              this.translate.instant('idiomas.error_nativo_examen')
            );
          } else if (
            this.info_idioma.SeleccionExamen === true &&
            this.idioma_examen
          ) {
            console.log('YA TENGO UN IDIOMA', this.idioma_examen);
            this.popUpManager.showErrorAlert(
              this.translate.instant('idiomas.error_doble_examen')
            );
          } else {
            this.idiomaService
              .put('conocimiento_idioma', this.info_idioma)
              .subscribe(
                (resp: any) => {
                  if (resp !== null && resp.Type !== 'error') {
                    this.canEmit = true;
                    this.setPercentage(1);
                    this.popUpManager.showSuccessAlert(
                      this.translate.instant(
                        'idiomas.informacion_idioma_actualizada'
                      )
                    );
                    if (this.info_idioma!.SeleccionExamen === true) {
                      const examen = {
                        Idioma: this.info_idioma!.IdiomaId.Id,
                        Activo: true,
                        InscripcionId: { Id: Number(this.inscripcion_id) },
                      };
                      this.inscripcionService
                        .get(
                          'inscripcion_posgrado/?query=InscripcionId:' +
                            examen.InscripcionId.Id
                        )
                        .subscribe(
                          (res) => {
                            const r = <any>res;
                            if (
                              r !== null &&
                              r.Type !== 'error' &&
                              JSON.stringify(r[0]).toString() !== '{}'
                            ) {
                              // El registro ya existe, realizar una actualización
                              this.inscripcionService
                                .put('inscripcion_posgrado/' + r[0].Id, examen)
                                .subscribe(
                                  (resexamen) => {
                                    const rex = <any>resexamen;
                                    if (rex !== null && rex.Type !== 'error') {
                                      console.log(
                                        'LA RESPUESTAAAAA IMPORTANTE',
                                        rex
                                      );
                                      this.sharedStateService.setIdiomaExamen(
                                        rex.Idioma
                                      );
                                    }
                                  },
                                  (error: HttpErrorResponse) => {
                                    Swal.fire({
                                      icon: 'error',
                                      title: error.status + '',
                                      text: this.translate.instant(
                                        'ERROR.' + error.status
                                      ),
                                      footer: this.translate.instant(
                                        'idiomas.informacion_idioma_no_actualizada'
                                      ),
                                      confirmButtonText:
                                        this.translate.instant(
                                          'GLOBAL.aceptar'
                                        ),
                                    });
                                  }
                                );
                            } else {
                              // El registro no existe, realizar una inserción
                              this.inscripcionService
                                .post('inscripcion_posgrado/', examen)
                                .subscribe(
                                  (resexamen) => {
                                    const rex = <any>resexamen;
                                    if (rex !== null && rex.Type !== 'error') {
                                      this.sharedStateService.setIdiomaExamen(
                                        this.info_idioma!.IdiomaId.Id
                                      );
                                    }
                                  },
                                  (error: HttpErrorResponse) => {
                                    Swal.fire({
                                      icon: 'error',
                                      title: error.status + '',
                                      text: this.translate.instant(
                                        'ERROR.' + error.status
                                      ),
                                      footer: this.translate.instant(
                                        'idiomas.informacion_idioma_no_registrada'
                                      ),
                                      confirmButtonText:
                                        this.translate.instant(
                                          'GLOBAL.aceptar'
                                        ),
                                    });
                                  }
                                );
                            }
                          },
                          (error: HttpErrorResponse) => {
                            Swal.fire({
                              icon: 'error',
                              title: error.status + '',
                              text: this.translate.instant(
                                'ERROR.' + error.status
                              ),
                              footer: this.translate.instant(
                                'idiomas.informacion_idioma_no_verificada'
                              ),
                              confirmButtonText:
                                this.translate.instant('GLOBAL.aceptar'),
                            });
                          }
                        );
                    } else {
                      if (
                        this.sharedStateService.getIdiomaExamen() ===
                        this.info_idioma!.IdiomaId.Id
                      ) {
                        const examen = {
                          Idioma: null,
                          Activo: true,
                          InscripcionId: { Id: Number(this.inscripcion_id) },
                        };
                        this.inscripcionService
                          .get(
                            'inscripcion_posgrado/?query=InscripcionId:' +
                              examen.InscripcionId.Id
                          )
                          .subscribe(
                            (res) => {
                              const r = <any>res;
                              if (
                                r !== null &&
                                r.Type !== 'error' &&
                                JSON.stringify(r[0]).toString() !== '{}'
                              ) {
                                // El registro ya existe, realizar una actualización
                                this.inscripcionService
                                  .put(
                                    'inscripcion_posgrado/' + r[0].Id,
                                    examen
                                  )
                                  .subscribe(
                                    (resexamen) => {
                                      const rex = <any>resexamen;
                                      if (
                                        rex !== null &&
                                        rex.Type !== 'error'
                                      ) {
                                        console.log(
                                          'LA RESPUESTAAAAA IMPORTANTE',
                                          rex
                                        );
                                        this.sharedStateService.setIdiomaExamen(
                                          rex.Idioma
                                        );
                                      }
                                    },
                                    (error: HttpErrorResponse) => {
                                      Swal.fire({
                                        icon: 'error',
                                        title: error.status + '',
                                        text: this.translate.instant(
                                          'ERROR.' + error.status
                                        ),
                                        footer: this.translate.instant(
                                          'idiomas.informacion_idioma_no_actualizada'
                                        ),
                                        confirmButtonText:
                                          this.translate.instant(
                                            'GLOBAL.aceptar'
                                          ),
                                      });
                                    }
                                  );
                              } else {
                                // El registro no existe, realizar una inserción
                                this.inscripcionService
                                  .post('inscripcion_posgrado/', examen)
                                  .subscribe(
                                    (resexamen) => {
                                      const rex = <any>resexamen;
                                      if (
                                        rex !== null &&
                                        rex.Type !== 'error'
                                      ) {
                                        this.sharedStateService.setIdiomaExamen(
                                          this.info_idioma!.IdiomaId.Id
                                        );
                                      }
                                    },
                                    (error: HttpErrorResponse) => {
                                      Swal.fire({
                                        icon: 'error',
                                        title: error.status + '',
                                        text: this.translate.instant(
                                          'ERROR.' + error.status
                                        ),
                                        footer: this.translate.instant(
                                          'idiomas.informacion_idioma_no_registrada'
                                        ),
                                        confirmButtonText:
                                          this.translate.instant(
                                            'GLOBAL.aceptar'
                                          ),
                                      });
                                    }
                                  );
                              }
                            },
                            (error: HttpErrorResponse) => {
                              Swal.fire({
                                icon: 'error',
                                title: error.status + '',
                                text: this.translate.instant(
                                  'ERROR.' + error.status
                                ),
                                footer: this.translate.instant(
                                  'idiomas.informacion_idioma_no_verificada'
                                ),
                                confirmButtonText:
                                  this.translate.instant('GLOBAL.aceptar'),
                              });
                            }
                          );
                      }
                    }
                    this.eventChange.emit(true);
                  }
                },
                (error) => {
                  this.popUpManager.showErrorToast(
                    this.translate.instant('ERROR.' + error.status)
                  );
                }
              );
          }
        }
      });
  }

  validarForm(event: any) {
    if (event.valid) {
      this.formData = event.data.InfoIdioma;
      if (!this.inscripcion_id) {
        this.crear_inscripcion.emit(this.formData);
      } else {
        if (
          this.info_idioma_id !== undefined &&
          this.info_idioma_id !== 0 &&
          this.info_idioma_id.toString() !== ''
        ) {
          this.updateInfoIdioma(this.formData);
        } else {
          this.createInfoIdioma(this.formData);
        }
      }
    }
  }

  public loadLists() {
    this.store
      .select((state) => state)
      .subscribe((list) => {
        this.formInfoIdioma.campos[this.getIndexForm('IdiomaId')].opciones =
          list.listIdioma[0];
        this.formInfoIdioma.campos[
          this.getIndexForm('NivelEscribeId')
        ].opciones = list.listNivelIdioma[0];
        this.formInfoIdioma.campos[
          this.getIndexForm('NivelEscuchaId')
        ].opciones = list.listNivelIdioma[0];
        this.formInfoIdioma.campos[this.getIndexForm('NivelHablaId')].opciones =
          list.listNivelIdioma[0];
        this.formInfoIdioma.campos[this.getIndexForm('NivelLeeId')].opciones =
          list.listNivelIdioma[0];
        this.formInfoIdioma.campos[this.getIndexForm('NivelId')].opciones =
          list.listClasificacionNivelIdioma[0];
      });
  }
}
