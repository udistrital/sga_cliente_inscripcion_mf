import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { distinctUntilChanged, debounceTime, switchMap } from 'rxjs';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TipoDocumento } from 'src/app/models/documento/tipo_documento';
import { EstadoAutorProduccion } from 'src/app/models/produccion_academica/estado_autor_produccion';
import { MetadatoSubtipoProduccion } from 'src/app/models/produccion_academica/metadato_subtipo_produccion';
import { ProduccionAcademicaPost } from 'src/app/models/produccion_academica/produccion_academica';
import { SubTipoProduccionAcademica } from 'src/app/models/produccion_academica/subtipo_produccion_academica';
import { TipoProduccionAcademica } from 'src/app/models/produccion_academica/tipo_produccion_academica';
import { Tercero } from 'src/app/models/terceros/tercero';
import { TipoContribuyente } from 'src/app/models/terceros/tipo_contribuyente';
import { DocumentoService } from 'src/app/services/documento.service';
import { ListService } from 'src/app/services/list.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
import { environment } from 'src/environments/environment';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { FORM_produccion_academica } from './form-produccion_academica';
import { NUEVO_AUTOR } from './form_new_autor';
import { ProduccionAcademicaService } from 'src/app/services/produccion_academica.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';

@Component({
  selector: 'ngx-crud-produccion-academica',
  templateUrl: './crud-produccion-academica.component.html',
  styleUrls: ['./crud-produccion-academica.component.scss'],
})
export class CrudProduccionAcademicaComponent implements OnInit {
  produccion_academica_selected!: ProduccionAcademicaPost;
  tipoProduccionAcademica!: TipoProduccionAcademica;
  SubtipoProduccionId: SubTipoProduccionAcademica | undefined;
  terceroId: number | null = null;
  listaTipoContibuyente!: TipoContribuyente[];
  listaTipoDocumento!: TipoDocumento[];

  @Input('produccion_academica_selected')
  set name(produccion_academica_selected: ProduccionAcademicaPost) {
    this.produccion_academica_selected = produccion_academica_selected;
    this.loadProduccionAcademica();
  }

  @Output()
  eventChange = new EventEmitter();

  @Output()
  updateList = new EventEmitter<void>();

  @Output('result')
  result: EventEmitter<any> = new EventEmitter();

  info_produccion_academica!: ProduccionAcademicaPost;
  tiposProduccionAcademica!: Array<TipoProduccionAcademica>;
  estadosAutor!: Array<EstadoAutorProduccion>;
  subtiposProduccionAcademica!: Array<SubTipoProduccionAcademica>;
  subtiposProduccionAcademicaFiltrados!: Array<SubTipoProduccionAcademica>;
  personas!: Array<Tercero>;
  source_authors: Array<any> = [];
  userData!: Tercero;
  nuevoAutor: boolean = false;
  formInfoNuevoAutor: any;
  autorSeleccionado: Tercero | undefined;
  formProduccionAcademica: any;
  regProduccionAcademica: any;
  clean!: boolean;
  formConstruido!: boolean;
  creandoAutor!: boolean;
  editando!: boolean;
  settings_authors: any;
  DatosAdicionales: any;
  terceroData!: Tercero;
  Metadatos!: any[];
  percentage!: number;
  formAutor = new FormGroup({
    autorSeleccionadoV2: new FormControl(''),
  });
  canEmit: boolean = false;

  displayedColumns = ['nombre', 'estado', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  constructor(
    public translate: TranslateService,
    private produccionAcademicaService: ProduccionAcademicaService,
    private popUpManager: PopUpManager,
    private user: UserService,
    private tercerosService: TercerosService,
    private listService: ListService,
    private store: Store<IAppState>,
    private http: HttpClient,
    private newNuxeoService: NewNuxeoService,
    private terceroMidService: TerceroMidService,
    private inscripcionMidService: InscripcionMidService,
    private utilidades: UtilidadesService,
    private snackBar: MatSnackBar
  ) {
    this.formProduccionAcademica = JSON.parse(
      JSON.stringify(FORM_produccion_academica)
    );
    this.formInfoNuevoAutor = NUEVO_AUTOR;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
  }

  construirForm() {
    this.formProduccionAcademica.titulo = this.translate.instant(
      'produccion_academica.produccion_academica'
    );
    this.formProduccionAcademica.btn = this.translate.instant('GLOBAL.guardar');
    for (let i = 0; i < this.formProduccionAcademica.campos.length; i++) {
      this.formProduccionAcademica.campos[i].label = this.translate.instant(
        'produccion_academica.' +
          this.formProduccionAcademica.campos[i].label_i18n
      );
      this.formProduccionAcademica.campos[i].placeholder =
        this.translate.instant(
          'produccion_academica.placeholder_' +
            this.formProduccionAcademica.campos[i].label_i18n
        );
    }

    this.formInfoNuevoAutor.btn = this.translate.instant('GLOBAL.guardar');
    this.formInfoNuevoAutor.btnLimpiar =
      this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formInfoNuevoAutor.campos.length; i++) {
      this.formInfoNuevoAutor.campos[i].label = this.translate.instant(
        'GLOBAL.' + this.formInfoNuevoAutor.campos[i].label_i18n
      );
      this.formInfoNuevoAutor.campos[i].placeholder = this.translate.instant(
        'GLOBAL.placeholder_' +
          this.formInfoNuevoAutor.campos[i].placeholder_i18n
      );
    }
  }

  setPercentage(event: any) {
    setTimeout(() => {
      this.percentage = event;
      if (this.canEmit) {
        this.result.emit(this.percentage);
        this.canEmit = false;
      }
    });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadOptions(): void {
    this.loadEstadosAutor()
      .then(() => {
        Promise.all([
          // this.loadEstadosAutor(),
          this.loadOptionsTipoProduccionAcademica(),
          this.loadOptionsSubTipoProduccionAcademica(),
          //this.loadAutores(),
          this.loadUserData(),
        ])
          .then(() => {})
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  loadUserData(): Promise<any> {
    this.source_authors = [];
    //this.source.load(this.source_authors);
    return new Promise((resolve, reject) => {
      this.tercerosService.get('tercero?query=Id:' + this.terceroId).subscribe(
        (res) => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.userData = <Tercero>res[0];
            this.userData['PuedeBorrar'] = false;
            /*
            this.userData['EstadoAutorProduccion'] = {
              Id: 1,
              Nombre: 'Autor principal',
            };
            */
            this.userData['NombreCompleto'] = this.userData.NombreCompleto;
            this.autorSeleccionado = JSON.parse(JSON.stringify(this.userData));
            this.agregarAutor(false, 1);
            // this.source_authors.push(this.userData);
            // this.source.load(this.source_authors);
            this.autorSeleccionado = undefined;
            resolve(true);
          } else {
            this.tiposProduccionAcademica = [];
            reject({ status: 404 });
          }
        },
        (error: HttpErrorResponse) => {
          reject(error);
        }
      );
    });
  }

  // getFullAuthorName(p: Persona): string {
  //   return p.PrimerNombre + ' ' + p.SegundoNombre + ' ' + p.PrimerApellido + ' ' + p.SegundoApellido;
  // }

  loadAutores(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.tercerosService
        .get('tercero/?query=TipoContribuyenteId.Id:1&limit=0')
        .subscribe(
          (res) => {
            // if (res !== null) {
            if (Object.keys(res[0]).length > 0) {
              this.personas = <Array<Tercero>>res;
              this.personas.forEach((persona: Tercero) => {
                // persona['Nombre'] = this.getFullAuthorName(persona);
                persona['NombreCompleto'] = persona.NombreCompleto;
                persona['Id'] = persona.Id;
              });
              resolve(true);
            } else {
              this.personas = [];
              reject({ status: 404 });
            }
          },
          (error: HttpErrorResponse) => {
            reject(error);
          }
        );
    });
  }

  loadEstadosAutor(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.produccionAcademicaService
        .get('estado_autor_produccion/?limit=0')
        .subscribe(
          (res) => {
            // if (res !== null) {
            if (Object.keys(res[0]).length > 0) {
              this.estadosAutor = <Array<EstadoAutorProduccion>>res;
              resolve(true);
            } else {
              this.estadosAutor = [];
              reject({ status: 404 });
            }
          },
          (error: HttpErrorResponse) => {
            reject(error);
          }
        );
    });
  }

  loadOptionsTipoProduccionAcademica(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.produccionAcademicaService.get('tipo_produccion/?limit=0').subscribe(
        (res) => {
          // if (res !== null) {
          if (Object.keys(res[0]).length > 0) {
            this.tiposProduccionAcademica = <Array<TipoProduccionAcademica>>res;
            resolve(true);
          } else {
            this.tiposProduccionAcademica = [];
            reject({ status: 404 });
          }
        },
        (error: HttpErrorResponse) => {
          reject(error);
        }
      );
    });
  }

  loadOptionsSubTipoProduccionAcademica(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.produccionAcademicaService
        .get('subtipo_produccion/?limit=0')
        .subscribe(
          (res) => {
            if (res !== null) {
              this.subtiposProduccionAcademica = <
                Array<SubTipoProduccionAcademica>
              >res;
              resolve(true);
            } else {
              this.subtiposProduccionAcademica = [];
              reject({ status: 404 });
            }
          },
          (error: HttpErrorResponse) => {
            reject(error);
          }
        );
    });
  }

  filterSubTypes(tipoProduccionAcademica: TipoProduccionAcademica) {
    this.SubtipoProduccionId = undefined;
    this.formConstruido = false;
    this.subtiposProduccionAcademicaFiltrados =
      this.subtiposProduccionAcademica.filter(
        (subTipo) => subTipo.TipoProduccionId.Id === tipoProduccionAcademica.Id
      );
  }

  loadSubTipoFormFields(
    subtipoProduccionAcademica: SubTipoProduccionAcademica,
    callback: Function | undefined
  ) {
    this.formProduccionAcademica = JSON.parse(
      JSON.stringify(FORM_produccion_academica)
    );
    this.construirForm();
    this.formConstruido = false;
    const query = `query=SubtipoProduccionId:${subtipoProduccionAcademica.Id}`;
    this.produccionAcademicaService
      .get(`metadato_subtipo_produccion/?limit=0&${query}`)
      .subscribe(
        (res) => {
          if (res !== null) {
            (<Array<MetadatoSubtipoProduccion>>res).forEach((metadato) => {
              if (Object.keys(metadato).length > 0) {
                metadato.TipoMetadatoId.FormDefinition =
                  metadato.TipoMetadatoId.FormDefinition.replace(
                    '"etiqueta":"file"',
                    '"etiqueta":"fileRev"'
                  );
                const field = JSON.parse(
                  metadato.TipoMetadatoId.FormDefinition
                );
                field.nombre = metadato.Id;
                this.formProduccionAcademica.campos.push(field);
              }
            });
            if (callback !== undefined) {
              callback(
                this.formProduccionAcademica.campos,
                this.info_produccion_academica.Metadatos,
                this.newNuxeoService,
                this.utilidades
              );
            }
            this.construirForm();
            this.formConstruido = true;
          }
        },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      );
  }

  public loadProduccionAcademica(): void {
    if (this.produccion_academica_selected !== undefined) {
      /*this.produccionAcademicaService.get('produccion_academica?query=id:' + this.produccion_academica_id)
        .subscribe(res => {
          if (res !== null) {
            this.info_produccion_academica = <ProduccionAcademicaPost>res[0];
          }
        });*/
      //this.DatosAdicionales = this.produccion_academica_selected
      this.info_produccion_academica = JSON.parse(
        JSON.stringify(this.produccion_academica_selected)
      );
      this.source_authors = this.info_produccion_academica.Autores;
      // this.source.load(this.source_authors);

      this.dataSource = new MatTableDataSource(this.source_authors);
      this.Metadatos = [];
      // this.formProduccionAcademica = JSON.parse(JSON.stringify(FORM_produccion_academica));
      const fillForm = (
        campos: any,
        Metadatos: any,
        newNuxeoService: any,
        utilidades: any
      ) => {
        const filesToGet: any = [];
        campos.forEach((campo: any) => {
          Metadatos.forEach((metadato: any) => {
            // const field = JSON.parse(datoAdicional.DatoAdicionalSubtipoProduccion.TipoDatoAdicional.FormDefiniton);
            if (campo.nombre === metadato.MetadatoSubtipoProduccionId.Id) {
              campo.valor = metadato.Valor;
              //metadato.TipoMetadatoId.FormDefinition = metadato.TipoMetadatoId.FormDefinition.replace('"etiqueta":"file"','"etiqueta":"fileRev"')
              let formDef = JSON.parse(
                metadato.MetadatoSubtipoProduccionId.TipoMetadatoId
                  .FormDefinition
              );
              if (formDef.hasOwnProperty('etiqueta')) {
                if (formDef.etiqueta == 'select') {
                  campo.valor = formDef.opciones[parseInt(metadato.Valor) - 1];
                }
              }
              if (campo.etiqueta === 'fileRev') {
                campo.idFile = parseInt(metadato.Valor, 10);
                filesToGet.push({ Id: campo.idFile, key: campo.nombre });
              }
            }
          });
        });
        if (filesToGet.length !== 0) {
          newNuxeoService.get(filesToGet).subscribe(
            (response: any) => {
              const filesResponse = <any>response;
              if (Object.keys(filesResponse).length === filesToGet.length) {
                campos.forEach((campo: any) => {
                  if (campo.etiqueta === 'fileRev') {
                    let f = filesResponse.find(
                      (res: any) => res.Id == campo.idFile
                    );
                    campo.valor = f.url;
                    let estadoDoc = utilidades.getEvaluacionDocumento(
                      f.Metadatos
                    );
                    campo.estadoDoc = estadoDoc;
                    //campo.urlTemp = f.url;
                  }
                });
              }
            },
            (error: HttpErrorResponse) => {
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            }
          );
        }
      };
      this.loadSubTipoFormFields(
        this.info_produccion_academica.SubtipoProduccionId,
        fillForm
      );
      this.construirForm();
      this.formConstruido = true;
      this.editando = true;
    } else {
      this.info_produccion_academica = new ProduccionAcademicaPost();
      this.clean = !this.clean;
      this.editando = false;
      this.formConstruido = false;
      if (this.terceroId != null) {
        this.loadUserData();
      }
      this.Metadatos = [];
    }
  }

  updateProduccionAcademica(ProduccionAcademica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.actualizar'),
      text: this.translate.instant(
        'produccion_academica.seguro_continuar_actualizar_produccion'
      ),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt).then((willDelete: any) => {
      if (willDelete.value) {
        this.info_produccion_academica = <ProduccionAcademicaPost>(
          ProduccionAcademica
        );
        this.inscripcionMidService
          .put('academico/produccion', this.info_produccion_academica)
          .subscribe((res: any) => {
            if (res !== null) {
              this.info_produccion_academica = <ProduccionAcademicaPost>(
                res.data
              );
              // this.showToast('info', this.translate.instant('GLOBAL.actualizar'), this.translate.instant('produccion_academica.produccion_actualizada'));
              this.popUpManager.showSuccessAlert(
                this.translate.instant(
                  'produccion_academica.produccion_actualizada'
                )
              );
              this.canEmit = true;
              this.setPercentage(1);
              this.updateList.emit();

              this.info_produccion_academica = new ProduccionAcademicaPost();
              this.clean = !this.clean;
              this.editando = false;
              this.formConstruido = false;
              this.loadUserData();
              this.Metadatos = [];
            } else {
              this.popUpManager.showErrorAlert(
                this.translate.instant(
                  'produccion_academica.produccion_no_actualizada'
                )
              );
            }
          });
      }
    });
  }

  createProduccionAcademica(ProduccionAcademica: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant(
        'produccion_academica.seguro_continuar_registrar_produccion'
      ),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt).then((willCreate: any) => {
      if (willCreate.value) {
        this.info_produccion_academica = <ProduccionAcademicaPost>(
          ProduccionAcademica
        );
        this.inscripcionMidService
          .post('academico/produccion/', this.info_produccion_academica)
          .subscribe(
            (res: any) => {
              if (res !== null) {
                this.info_produccion_academica = <ProduccionAcademicaPost>(
                  res.data
                );
                //this.showToast('info', this.translate.instant('GLOBAL.crear'), this.translate.instant('produccion_academica.produccion_creada'));
                this.popUpManager.showSuccessAlert(
                  this.translate.instant(
                    'produccion_academica.produccion_creada'
                  )
                );
                this.canEmit = true;
                this.setPercentage(1);
                this.updateList.emit();

                this.info_produccion_academica = new ProduccionAcademicaPost();
                this.clean = !this.clean;
                this.editando = false;
                this.formConstruido = false;
                this.loadUserData();
                this.Metadatos = [];
              } else {
                this.popUpManager.showErrorAlert(
                  this.translate.instant(
                    'produccion_academica.produccion_no_creada'
                  )
                );
              }
            },
            (error: HttpErrorResponse) => {
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant(
                  'produccion_academica.error_autor_no_existe'
                ),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            }
          );
      }
    });
  }

  agregarAutor(mostrarError: boolean, estadoAutor: number): void {
    if (this.autorSeleccionado === undefined) {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('produccion_academica.error_autor_vacio'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
      return;
    }
    if (
      this.source_authors.find(
        (author) => author.PersonaId === this.autorSeleccionado!.Id
      )
    ) {
      if (mostrarError) {
        Swal.fire({
          icon: 'error',
          title: 'ERROR',
          text: this.translate.instant(
            'produccion_academica.error_autor_ya_existe'
          ),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      }
    } else {
      if (this.estadosAutor != undefined) {
        this.source_authors.push({
          // Nombre: this.getFullAuthorName(this.autorSeleccionado),
          Nombre: this.autorSeleccionado!.NombreCompleto,
          PersonaId: this.autorSeleccionado!.Id,
          // EstadoAutorProduccion: this.estadosAutor.filter(estado => estado.Id === 3)[0],
          EstadoAutorProduccionId: this.estadosAutor.filter(
            (estado) => estado.Id === estadoAutor
          )[0],
          // PuedeBorrar: true,
          PuedeBorrar: estadoAutor !== 1,
        });
        this.autorSeleccionado = undefined;
        this.creandoAutor = false;
        this.dataSource = new MatTableDataSource(this.source_authors);
      }
    }
  }

  async ngOnInit() {
    this.terceroId = await this.user.getPersonaId();

    this.loadOptions();
    this.listService.findTipoDocumento();
    this.listService.findTipoContribuyente();
    this.loadLists();
    this.loadProduccionAcademica();
    this.formAutor.controls.autorSeleccionadoV2.valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(1000),
        switchMap((value) =>
          this.http.get(
            environment.TERCEROS_SERVICE +
              'tercero?query=NombreCompleto__icontains:' +
              value +
              ',TipoContribuyenteId.Id:1&fields=Id,NombreCompleto&limit=50'
          )
        )
      )
      .subscribe((data: any) => {
        this.personas = <Array<Tercero>>data;
        this.personas.forEach((persona: Tercero) => {
          persona['NombreCompleto'] = persona.NombreCompleto;
          persona['Id'] = persona.Id;
        });
      });
  }

  onSelected(event: any) {
    console.log(event);
    this.formAutor.patchValue({
      autorSeleccionadoV2: event.option.value.NombreCompleto,
    });
    this.autorSeleccionado = event.option.value;
  }

  onDeleteAuthor(event: any): void {
    if (event.PuedeBorrar) {
      this.source_authors.splice(
        this.source_authors.indexOf(event),
        this.source_authors.indexOf(event)
      );
      this.dataSource = new MatTableDataSource(this.source_authors);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('produccion_academica.error_autor_borrar'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  uploadFilesToMetadaData(files: any, metadatos: any) {
    return new Promise((resolve, reject) => {
      files.forEach((file: any) => {
        (file.Id = file.nombre),
          (file.nombre = 'soporte_' + file.Id + '_prod_' + this.userData.Id),
          (file.key = file.Id),
          (file.IdDocumento = 63);
      });
      this.newNuxeoService.uploadFiles(files).subscribe(
        (responseNux: any[]) => {
          if (Object.keys(responseNux).length === files.length) {
            files.forEach((file: any) => {
              let f = responseNux.find((res) => res.res.Nombre == file.nombre);
              metadatos.push({
                MetadatoSubtipoProduccionId: file.Id,
                Valor: f.res.Id,
              });
            });
            resolve(true);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  }

  validarForm(event: any) {
    if (event.valid) {
      if (
        !this.info_produccion_academica.Titulo ||
        !this.info_produccion_academica.Fecha ||
        !this.info_produccion_academica.Resumen
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'ERROR',
          text: this.translate.instant(
            'produccion_academica.alerta_llenar_campos_datos_basicos'
          ),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      } else if (
        this.info_produccion_academica.Resumen &&
        this.info_produccion_academica.Resumen.length > 400
      ) {
        Swal.fire({
          icon: 'warning',
          title: 'ERROR',
          text: this.translate.instant(
            'produccion_academica.alerta_caracteres_resumen'
          ),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      } else {
        const caracteresEspeciales1: RegExp = /[\"\\\/\b\f]/g; // pueden romper JSON string in api GO
        const caracteresEspeciales2: RegExp = /[\t\n\r]/g; // pueden romper JSON string in api GO
        const multiespacio: RegExp = /\s\s+/g; // bonus: quitar muchos espacios juntos
        this.info_produccion_academica.Resumen.replace(
          caracteresEspeciales1,
          ''
        );
        this.info_produccion_academica.Resumen.replace(
          caracteresEspeciales2,
          ' '
        ); // tabs y enter se reemplazan por espacio
        this.info_produccion_academica.Resumen.replace(multiespacio, ' ');
        const promises = [];
        if (event.data.ProduccionAcademica) {
          const tempMetadatos = event.data.ProduccionAcademica;
          const keys = Object.keys(tempMetadatos);
          const metadatos = [];
          const filesToUpload = [];
          for (let i = 0; i < keys.length; i++) {
            if (tempMetadatos[keys[i]] && tempMetadatos[keys[i]].nombre) {
              // Archivo se debe subir a nuxeo
              if (tempMetadatos[keys[i]].file !== undefined) {
                filesToUpload.push(tempMetadatos[keys[i]]);
              }
            } else {
              metadatos.push({
                MetadatoSubtipoProduccionId: parseInt(keys[i], 10),
                Valor: tempMetadatos[keys[i]],
              });
            }
          }
          if (filesToUpload.length > 0) {
            promises.push(
              this.uploadFilesToMetadaData(filesToUpload, metadatos)
            );
          }
          this.info_produccion_academica.Metadatos = metadatos;
        } else {
          this.info_produccion_academica.Metadatos = [];
        }
        this.info_produccion_academica.Autores = JSON.parse(
          JSON.stringify(this.source_authors)
        );
        Promise.all(promises)
          .then(() => {
            if (this.produccion_academica_selected === undefined) {
              this.createProduccionAcademica(this.info_produccion_academica);
              //this.result.emit(event);
            } else {
              this.updateProduccionAcademica(this.info_produccion_academica);
              //this.result.emit(event);
            }
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'ERROR',
              text: this.translate.instant('ERROR.error_subir_documento'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
      }
    }
  }

  onCreateAuthor(): void {
    if (!this.editando) {
      //this.loadAutores();
      this.creandoAutor = !this.creandoAutor;
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant(
          'produccion_academica.error_no_puede_editar_autores'
        ),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  getIndexFormNew(nombre: String): number {
    for (
      let index = 0;
      index < this.formInfoNuevoAutor.campos.length;
      index++
    ) {
      const element = this.formInfoNuevoAutor.campos[index];
      if (element.nombre === nombre) {
        return index;
      }
    }
    return 0;
  }

  NuevoAutor() {
    this.nuevoAutor = !this.nuevoAutor;
  }

  createInfoAutor(infoTercero: any) {
    return new Promise((resolve, reject) => {
      const opt: any = {
        title: this.translate.instant('GLOBAL.crear'),
        text: this.translate.instant(
          'produccion_academica.seguro_continuar_registrar'
        ),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      };
      Swal.fire(opt).then((willMake: any) => {
        if (willMake.value) {
          infoTercero.Activo = false;

          this.terceroMidService
            .post('personas/autores', infoTercero)
            .subscribe(
              (res: any) => {
                if (res.data !== null) {
                  this.snackBar.open(
                    this.translate.instant('produccion_academia.autor_creado'),
                    '',
                    { duration: 3000, panelClass: ['success-snackbar'] }
                  );
                  resolve(res);
                } else {
                  this.snackBar.open(
                    this.translate.instant(
                      'produccion_academia.autor_no_creado'
                    ),
                    '',
                    { duration: 3000, panelClass: ['error-snackbar'] }
                  );
                  reject();
                }
              },
              () => {
                this.snackBar.open(
                  this.translate.instant('produccion_academia.autor_no_creado'),
                  '',
                  { duration: 3000, panelClass: ['error-snackbar'] }
                );
                reject();
              }
            );
        }
      });
    });
  }

  validarFormNuevoAutor(event: any) {
    console.log('CREANDO NUEVO TERCERO', event);
    if (event.valid) {
      const formData = event.data.Autor;
      this.createInfoAutor(formData).then((newAutorResponse: any) => {
        console.log('NUEVO TERCERO', newAutorResponse);
        if (newAutorResponse.Data && newAutorResponse.Success) {
          this.autorSeleccionado = newAutorResponse.Data;
          this.agregarAutor(true, 3);
          this.NuevoAutor();
        }else {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: this.translate.instant(
              'solicitudes.error'
            ),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      });
    }
  }

  public loadLists() {
    this.store
      .select((state) => state)
      .subscribe((list) => {
        this.listaTipoContibuyente = list.listTipoContribuyente;
        this.formInfoNuevoAutor.campos[
          this.getIndexFormNew('TipoContribuyenteId')
        ].opciones = this.listaTipoContibuyente[0];

        this.listaTipoDocumento = list.listTipoDocumento;
        this.formInfoNuevoAutor.campos[
          this.getIndexFormNew('TipoDocumentoId')
        ].opciones = this.listaTipoDocumento[0];
      });
  }
}
