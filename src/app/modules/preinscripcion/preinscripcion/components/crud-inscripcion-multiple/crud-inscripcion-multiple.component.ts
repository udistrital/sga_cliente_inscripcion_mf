import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import * as momentTimezone from 'moment-timezone';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InfoPersona } from 'src/app/models/informacion/info_persona';
import { Inscripcion } from 'src/app/models/inscripcion/inscripcion';
import { ReciboPago } from 'src/app/models/inscripcion/recibo_pago';
import { Periodo } from 'src/app/models/periodo/periodo';
import { InstitucionEnfasis } from 'src/app/models/proyecto_academico/institucion_enfasis';
import { NivelFormacion } from 'src/app/models/proyecto_academico/nivel_formacion';
import { EventoService } from 'src/app/services/evento.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { UserService } from 'src/app/services/users.service';
import { environment } from 'src/environments/environment';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { LinkDownloadComponent } from './components/link-download/link-download.component';
import { ButtonPaymentComponent } from './components/button-payment/button-payment.component';
import { MatTableDataSource } from '@angular/material/table';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { CalendarioMidService } from 'src/app/services/sga_calendario_mid.service';
import { decrypt } from 'src/app/utils/util-encrypt';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'ngx-crud-inscripcion-multiple',
  templateUrl: './crud-inscripcion-multiple.component.html',
  styleUrls: ['./crud-inscripcion-multiple.component.scss'],
})
export class CrudInscripcionMultipleComponent implements OnInit {
  displayedColumns: string[] = [
    'recibo',
    'inscripcion',
    'programa',
    'estado_inscripcion',
    'fecha',
    'estado_recibo',
    'descargar',
    'opcion',
  ];
  dataSource!: MatTableDataSource<any>;

  info_persona_id!: number | null;
  persona_id!: number;
  inscripcion_id!: number;
  //dataSource: LocalDataSource;
  data: any[] = [];
  settings: any;
  pdfs: Blob[] = [];
  //periodosDoctorado: any[] = []; 
  nombresPeriodos!: string; 

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (
      this.inscripcion_id !== undefined &&
      this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== '' &&
      this.inscripcion_id.toString() !== '0'
    ) {
    }
  }

  @Input('info_persona_id')
  set persona(info_persona_id: number | null) {
    this.info_persona_id = info_persona_id;
  }

  @Output() eventChange = new EventEmitter();
  @Output('result') result: EventEmitter<any> = new EventEmitter(true);
  @Output('ocultarBarra') ocultarBarra: EventEmitter<boolean> =
    new EventEmitter();

  info_info_persona: InfoPersona = new InfoPersona();
  recibo_pago: ReciboPago = new ReciboPago();
  regInfoPersona: any;
  info_inscripcion: any;
  clean!: boolean;
  percentage!: number;
  aceptaTerminos!: boolean;
  showProyectoCurricular: boolean;
  showTipoInscripcion: boolean;
  showInfo: boolean;
  showNew: boolean;
  showInscription: boolean;
  programa!: number;
  aspirante!: number;
  periodo: Periodo = new Periodo();
  periodos: any = [];
  selectednivel: any;
  tipo_inscripciones: any = [];
  proyectos_preinscripcion!: any[];
  proyectos_preinscripcion_post: any;
  niveles!: NivelFormacion[];
  selectedLevel: any;
  selectedProject: any;
  tipo_inscripcion_selected: any;
  projects!: any[];
  countInscripcion: number = 0;
  cont: number = 0;
  inscripcionProjects!: any[];
  calendarioId: string = '0';
  projectId: number = 0;
  parametro!: string;
  recibo_generado: any;
  recibos_pendientes!: number;
  parametros_pago: any;

  arr_proyecto: InstitucionEnfasis[] = [];

  proyectos = [];

  CampoControl = new FormControl('', [Validators.required]);
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);

  constructor(
    private projectService: ProyectoAcademicoService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private terceroMidService: TerceroMidService,
    private inscripcionMidService: InscripcionMidService,
    private calendarioMidService: CalendarioMidService,
    private eventoService: EventoService
  ) {
    this.showProyectoCurricular = false;
    this.showTipoInscripcion = false;
    this.showInfo = false;
    this.showNew = false;
    this.showInscription = true;

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
  }

  async ngOnInit() {
    sessionStorage.setItem('EstadoInscripcion', 'false');
    // Inicializaciones sincrónicas
    this.parametros_pago = {
      recibo: '',
      REFERENCIA: '',
      NUM_DOC_IDEN: '',
      TIPO_DOC_IDEN: '',
    };
    this.cargarPeriodo();
    this.nivel_load();
    // Llamar a la función asíncrona para manejar la lógica asíncrona
    this.initializeAsync();
    if (localStorage.getItem('IdPeriodo') === undefined) {
      this.loadInfoPersona();
    }
  }

  async initializeAsync() {
    try {
      this.cargarPeriodo();
      this.nivel_load();
      this.info_persona_id = await this.userService.getPersonaId();
      if (localStorage.getItem('IdPeriodo') === undefined) {
        this.loadInfoPersona();
      }
    } catch (error) {
      if (error instanceof Error) {
        this.popUpManager.showErrorAlert(
          this.translate.instant('inscripcion.error_cargar_informacion') +
            ': ' +
            error.message
        );
      } else {
        this.popUpManager.showErrorAlert(
          this.translate.instant('inscripcion.error_cargar_informacion')
        );
      }
    }
  }

  return() {
    this.showInscription = true;
    sessionStorage.setItem('EstadoInscripcion', 'false');
    this.loadInfoInscripcion();
  }

  public async loadInfoPersona(): Promise<void> {
    try {
      if (this.info_persona_id !== null) {
        this.terceroMidService
          .get('personas/' + this.info_persona_id)
          .subscribe(
            (res: any) => {
              if (res !== null) {
                const temp = <InfoPersona>res.data;
                this.info_info_persona = temp;
                const files = [];
              }
              this.loadInfoInscripcion();
            },
            (error: HttpErrorResponse) => {
              Swal.fire({
                icon: 'info',
                title: this.translate.instant('GLOBAL.info_persona'),
                text: this.translate.instant('GLOBAL.no_info_persona'),
                footer:
                  this.translate.instant('GLOBAL.cargar') +
                  '-' +
                  this.translate.instant('GLOBAL.info_persona'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            }
          );
      } else {
        this.clean = !this.clean;
        this.popUpManager.showAlert(
          this.translate.instant('GLOBAL.info'),
          this.translate.instant('GLOBAL.no_info_persona')
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.popUpManager.showErrorAlert(
          this.translate.instant('inscripcion.error_cargar_informacion') +
            ': ' +
            error.message
        );
      } else {
        this.popUpManager.showErrorAlert(
          this.translate.instant('inscripcion.error_cargar_informacion')
        );
      }
    }
  }

  loadInscriptionModule() {
    this.inscripcion_id = parseInt(
      sessionStorage.getItem('IdInscripcion')!,
      10
    );
    this.showInscription = false;
  }

  onRenderButtonPaymentComponent(data: any) {
    sessionStorage.setItem('EstadoInscripcion', data.estado);
    // Solamente se usa esta linea para pruebas saltaldo el pago de recibo
    // sessionStorage.setItem('EstadoInscripcion', 'true');
    if (data.estado === false || data.estado === 'false') {
      this.abrirPago(data.data);
    } else if (data.estado === true || data.estado === 'true') {
      sessionStorage.setItem(
        'IdEstadoInscripcion',
        data.data.EstadoInscripcion
      );
      this.itemSelect({ data: data.data });
    }
  }

  itemSelect(event: any): void {
    sessionStorage.setItem('IdInscripcion', event.data.Id);
    sessionStorage.setItem('ProgramaAcademico', event.data.ProgramaAcademicoId);
    this.inscripcionService
      .get('inscripcion/' + event.data.Id)
      .subscribe((response: any) => {
        sessionStorage.setItem('IdPeriodo', response.PeriodoId);
        sessionStorage.setItem(
          'IdTipoInscripcion',
          response.TipoInscripcionId.Id
        );
        sessionStorage.setItem(
          'ProgramaAcademicoId',
          response.ProgramaAcademicoId
        );
        sessionStorage.setItem('IdEnfasis', response.EnfasisId);
        const EstadoIns = sessionStorage.getItem('EstadoInscripcion');
        if (EstadoIns === 'true') {
          this.loadInscriptionModule();
        }
      });
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  nivel_load() {
    this.projectService.get('nivel_formacion').subscribe(//?query=Id:2
      (response: NivelFormacion[]) => {
        this.niveles = response;//.filter(nivel => nivel.NivelFormacionPadreId === null)
        
      },
      (error) => {
        this.popUpManager.showErrorToast(
          this.translate.instant('ERROR.general')
        );
      }
    );
  }

  async loadInfoInscripcion() {
    // Función del MID que retorna el estado del recibo
    await this.cargarPeriodo();
    const PeriodoActual = localStorage.getItem('IdPeriodo');
    if (this.info_persona_id != null && PeriodoActual != null) {
      // if (this.persona_id != null){
      await this.inscripcionMidService
        .get(
          'inscripciones/estado-recibos?persona-id=' +
            this.info_persona_id +
            '&id-periodo=' +
            PeriodoActual
        )
        .subscribe(
          (response: any) => {
            if (response !== null && response.status == '400') {
              this.popUpManager.showErrorToast(
                this.translate.instant('inscripcion.error')
              );
            } else if (response != null && response.status == '404') {
              this.popUpManager.showAlert(
                this.translate.instant('GLOBAL.info'),
                this.translate.instant('inscripcion.no_inscripcion')
              );
            } else {
              const data = <Array<any>>response.data.Inscripciones;
              const dataInfo = <Array<any>>[];
              this.recibos_pendientes = 0;
              data.forEach((element) => {
                if (element != null) {
                  this.projectService
                    .get(
                      'proyecto_academico_institucion?query=Id:' +
                        element.ProgramaAcademicoId
                    )
                    .subscribe(
                      (res) => {
                        const auxRecibo = element.ReciboInscripcion;
                        const NumRecibo = auxRecibo.split('/', 1);
                        element.ReciboInscripcion = NumRecibo;
                        element.FechaCreacion = momentTimezone
                          .tz(element.FechaCreacion, 'America/Bogota')
                          .format('DD-MM-YYYY hh:mm:ss');
                        element.ProgramaAcademicoId = res[0].Nombre;
                        let level =
                          res[0].NivelFormacionId.NivelFormacionPadreId;
                        if (level == null || level == undefined) {
                          level = res[0].NivelFormacionId.Id;
                        } else {
                          level =
                            res[0].NivelFormacionId.NivelFormacionPadreId.Id;
                        }
                        element.NivelPP = level;
                        if (element.Estado === 'Pendiente pago') {
                          this.recibos_pendientes++;
                        }
                        this.result.emit(1);
                        dataInfo.push(element);
                        this.dataSource = new MatTableDataSource(dataInfo);
                        //this.dataSource.setSort([{ field: 'Id', direction: 'desc' }]);
                      },
                      (error: any) => {
                        this.popUpManager.showErrorToast(
                          this.translate.instant('ERROR.general')
                        );
                      }
                    );
                }
              });
            }
          },
          (error: any) => {
            this.popUpManager.showErrorToast(
              this.translate.instant('ERROR.general')
            );
          }
        );
    }
  }

  filtrarProyecto(proyecto: any) {
    if (this.selectedLevel === proyecto['NivelFormacionId']['Id']) {
      return true;
    }
    if (proyecto['NivelFormacionId']['NivelFormacionPadreId'] !== null) {
      if (
        proyecto['NivelFormacionId']['NivelFormacionPadreId']['Id'] ===
        this.selectedLevel
      ) {
        return true;
      }
    }
    return false;
  }

  onSelectLevel() {
    if (this.selectedLevel === undefined) {
      this.popUpManager.showInfoToast(
        this.translate.instant('inscripcion.erro_selec_nivel')
      );
    } else {
      Swal.fire({
        icon: 'info',
        title: this.translate.instant('GLOBAL.info'),
        text: this.translate.instant('inscripcion.alerta_posgrado'),
      });
      this.projectService
        .get(
          'proyecto_academico_institucion?limit=0&fields=Id,Nombre,NivelFormacionId,Codigo'
        )
        .subscribe(
          (response: any) => {
            this.projects = <any[]>(
              response.filter((proyecto: any) => this.filtrarProyecto(proyecto))
            );
            this.validateProject();
          },
          (error: any) => {
            this.popUpManager.showErrorToast(
              this.translate.instant('ERROR.general')
            );
          }
        );
    }
  }


  nuevaPreinscripcion() {
    this.showNew = true;
  }

  onSelectProyecto() {
    this.loadTipoInscripcion();
  }

  onSelectTipoInscripcion(tipo: any) {
    if (this.inscripcionProjects != null) {
      this.showInfo = true;
    }
  }

  validateProject() {
    this.inscripcionProjects = new Array();
    this.showProyectoCurricular = false;
    this.showTipoInscripcion = false;
    this.showInfo = false;
    let periodo = localStorage.getItem('IdPeriodo');
    this.calendarioMidService
      .get(
        'calendario-proyecto/calendario/proyecto?id-nivel=' +
          this.selectedLevel +
          '&id-periodo=' +
          periodo
      )
      .subscribe(
        (response: any) => {
          const r = <any>response;
          if (
            response !== null &&
            response !== '{}' &&
            r.Type !== 'error' &&
            r.length !== 0
          ) {
            const inscripcionP = <Array<any>>response.Data;
            this.inscripcionProjects = inscripcionP;
            this.showProyectoCurricular = true;
            // this.loadTipoInscripcion();
          } else {
            this.popUpManager.showAlert(
              '',
              this.translate.instant('calendario.sin_proyecto_curricular')
            );
            this.showProyectoCurricular = false;
            this.showTipoInscripcion = false;
            this.showInfo = false;
          }
        },
        (error: any) => {
          this.popUpManager.showErrorToast(
            this.translate.instant('ERROR.general')
          );
        }
      );
  }

  async generarRecibo() {
    if (this.recibos_pendientes >= 3) {
      this.popUpManager.showErrorAlert(
        this.translate.instant('recibo_pago.maximo_recibos')
      );
    } else {
      const ok = await this.popUpManager.showConfirmAlert(
        this.translate.instant('inscripcion.seguro_inscribirse')
      );

      if (ok.value) {
        if (this.info_info_persona === undefined) {
          try {
            if (this.info_persona_id == null) {
              this.info_persona_id = await this.userService.getPersonaId();
            }

            try {
              const res = await firstValueFrom(
                this.terceroMidService.get('personas/' + this.info_persona_id)
              );
              if (res !== null) {
                const temp = <InfoPersona>res.data;
                this.info_info_persona = temp;
                const files = [];
                await this.generar_inscripcion();
              }
            } catch (error) {
              if (error instanceof HttpErrorResponse) {
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer:
                    this.translate.instant('GLOBAL.cargar') +
                    '-' +
                    this.translate.instant('GLOBAL.info_persona'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: this.translate.instant(
                    'inscripcion.error_cargar_informacion'
                  ),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              }
            }
          } catch (error) {
            if (error instanceof HttpErrorResponse) {
              this.popUpManager.showErrorAlert(
                this.translate.instant('inscripcion.error_cargar_informacion') +
                  ': ' +
                  error.message
              );
            } else {
              this.popUpManager.showErrorAlert(
                this.translate.instant('inscripcion.error_cargar_informacion')
              );
            }
          }
        } else {
          await this.generar_inscripcion();
        }
      }
    }
  }

  generar_inscripcionv2() {
    const reciboConceptos = [];
    const reciboObs: { Ref: any; Descripcion: string }[] = [];
    reciboConceptos.push({ Ref: '1', Descripcion: 'INSCTIPCIÓN', Valor: 1111 });
    reciboObs.push({ Ref: '', Descripcion: 'Transferencia' });

    const recibo = {
      Documento: parseInt(this.info_info_persona.NumeroIdentificacion, 10),
      Nombre: `${this.info_info_persona.PrimerNombre} ${this.info_info_persona.SegundoNombre} ${this.info_info_persona.PrimerApellido} ${this.info_info_persona.SegundoApellido}`,
      Tipo: 'Inscripcion',
      Periodo: this.periodo.Id,
      Dependencia: {
        Tipo: 'Proyecto Curricular',
        Nombre: this.selectedProject.Nombre,
      },
      Conceptos: reciboConceptos,
      Observaciones: reciboObs,
      Fecha1: '30/02/2023',
      Fecha2: '30/02/2023',
      Recargo: 1,
      Comprobante: '0666',
    };
    this.inscripcionService.post('recibov2/', recibo).subscribe(
      (response: any) => {
        if (response.success && response.data) {
          const byteArray = atob(response.data);
          const byteNumbers = new Array(byteArray.length);
          for (let i = 0; i < byteArray.length; i++) {
            byteNumbers[i] = byteArray.charCodeAt(i);
          }
          const file = new Blob([new Uint8Array(byteNumbers)], {
            type: 'application/pdf',
          });
          this.pdfs.push(file);
        }
      },
      (error: HttpErrorResponse) => {
        console.error(error);
      }
    );
  }

  generar_inscripcion() {
    return new Promise((resolve, reject) => {
      const inscripcion = {
        Id: parseInt(this.info_info_persona.NumeroIdentificacion, 10),
        Nombre: `${this.info_info_persona.PrimerNombre} ${this.info_info_persona.SegundoNombre}`,
        Apellido: `${this.info_info_persona.PrimerApellido} ${this.info_info_persona.SegundoApellido}`,
        Correo: JSON.parse(
          atob(localStorage.getItem('id_token')!.split('.')[1])
        ).email,
        PersonaId: Number(this.info_persona_id),
        PeriodoId: this.periodo.Id,
        Nivel: parseInt(this.selectedLevel, 10),
        ProgramaAcademicoId: parseInt(this.selectedProject, 10),
        ProgramaAcademicoCodigo: parseInt(this.projects.find(proyecto => proyecto.Id === this.selectedProject).Codigo, 10),
        TipoInscripcionId: parseInt(this.tipo_inscripcion_selected, 10),
        Year: this.periodo.Year,
        Periodo: parseInt(this.periodo.Ciclo, 10),
        FechaPago: '',
      };
      let periodo = localStorage.getItem('IdPeriodo');
      this.calendarioMidService
        .get(
          'calendario-proyecto/calendario/proyecto?id-nivel=' +
            this.selectedLevel +
            '&id-periodo=' +
            periodo
        )
        .subscribe(
          (response: any) => {
            if (response !== null && response.length !== 0) {
              this.inscripcionProjects = response.Data;
              this.inscripcionProjects.forEach((proyecto) => {
                if (
                  proyecto.ProyectoId === this.selectedProject &&
                  proyecto.Evento != null
                ) {
                  inscripcion.FechaPago = moment(
                    proyecto.Evento.FechaFinEvento,
                    'YYYY-MM-DD'
                  ).format('DD/MM/YYYY');
                  this.inscripcionMidService
                    .post('inscripciones/nueva', inscripcion)
                    .subscribe(
                      (response: any) => {
                        if (response.status == '200') {
                          this.showProyectoCurricular = false;
                          this.showTipoInscripcion = false;
                          this.showInfo = false;
                          this.showNew = false;
                          this.loadInfoInscripcion();
                          resolve(response);
                          this.popUpManager.showSuccessAlert(
                            this.translate.instant('recibo_pago.generado')
                          );
                        } else if (response.status == '204') {
                          reject([]);
                          this.popUpManager.showErrorAlert(
                            this.translate.instant(
                              'recibo_pago.recibo_duplicado'
                            )
                          );
                        } else if (response.status == '400') {
                          reject([]);
                          this.popUpManager.showErrorToast(
                            this.translate.instant('recibo_pago.no_generado')
                          );
                        }
                      },
                      (error: HttpErrorResponse) => {
                        this.popUpManager.showErrorToast(
                          this.translate.instant(`ERROR.${error.status}`)
                        );
                      }
                    );
                } else {
                  this.popUpManager.showAlert(
                    this.translate.instant('inscripcion.preinscripcion'),
                    this.translate.instant('inscripcion.no_fechas_inscripcion')
                  );
                }
              });
            }
          },
          (error: any) => {
            this.popUpManager.showAlert(
              this.translate.instant('GLOBAL.info'),
              this.translate.instant('calendario.sin_proyecto_curricular')
            );
          }
        );
    });
  }

  descargarReciboPago(data: any) {
    this.itemSelect({ data: data });
    if (this.selectedLevel === undefined) {
      this.selectedLevel = parseInt(data.NivelPP, 10);
    }
    if (this.info_info_persona != null && data.Estado != 'Vencido') {
      this.selectedProject = parseInt(
        sessionStorage.getItem('ProgramaAcademicoId')!,
        10
      );
      this.recibo_pago = new ReciboPago();
      this.recibo_pago.NombreDelAspirante =
        this.info_info_persona.PrimerNombre +
        ' ' +
        this.info_info_persona.SegundoNombre +
        ' ' +
        this.info_info_persona.PrimerApellido +
        ' ' +
        this.info_info_persona.SegundoApellido;
      this.recibo_pago.DocumentoDelAspirante =
        this.info_info_persona.NumeroIdentificacion;
      this.recibo_pago.Periodo = this.periodo.Nombre;
      this.recibo_pago.ProyectoAspirante = data['ProgramaAcademicoId'];
      this.recibo_pago.Comprobante = data['ReciboInscripcion'][0];
      if (this.selectedLevel === 1) {
        this.parametro = '13';
      } else if (this.selectedLevel === 2) {
        this.parametro = '12';
      }
      let periodo = localStorage.getItem('IdPeriodo');
      this.calendarioMidService
        .get(
          'calendario-proyecto/calendario/proyecto?id-nivel=' +
            this.selectedLevel +
            '&id-periodo=' +
            periodo
        )
        .subscribe(
          (response: any) => {
            if (response !== null && response.length !== 0) {
              this.inscripcionProjects = response.data;
              this.inscripcionProjects.forEach((proyecto) => {
                if (
                  proyecto.ProyectoId === this.selectedProject &&
                  proyecto.Evento != null
                ) {
                  this.recibo_pago.Fecha_pago = moment(
                    proyecto.Evento.FechaFinEvento,
                    'YYYY-MM-DD'
                  ).format('DD/MM/YYYY');
                }
              });
              this.parametrosService
                .get(
                  'parametro_periodo?query=ParametroId.TipoParametroId.Id:2,' +
                    'ParametroId.CodigoAbreviacion:' +
                    this.parametro +
                    ',PeriodoId.Year:' +
                    this.periodo.Year +
                    ',PeriodoId.CodigoAbreviacion:VG'
                )
                .subscribe(
                  (response: any) => {
                    const parametro = <any>response['Data'][0];
                    this.recibo_pago.Descripcion =
                      parametro['ParametroId']['Nombre'];
                    const valor = JSON.parse(parametro['Valor']);
                    this.recibo_pago.ValorDerecho = valor['Costo'];
                    this.inscripcionMidService
                      .post('recibos/estudiantes', this.recibo_pago)
                      .subscribe(
                        (response: any) => {
                          const reciboData = new Uint8Array(
                            atob(response['data'])
                              .split('')
                              .map((char) => char.charCodeAt(0))
                          );
                          this.recibo_generado = window.URL.createObjectURL(
                            new Blob([reciboData], { type: 'application/pdf' })
                          );
                          window.open(this.recibo_generado);
                        },
                        (error: any) => {
                          this.popUpManager.showErrorToast(
                            this.translate.instant('recibo_pago.no_generado')
                          );
                        }
                      );
                  },
                  (error: any) => {
                    this.popUpManager.showErrorToast(
                      this.translate.instant('ERROR.general')
                    );
                  }
                );
            }
          },
          (error: any) => {
            this.popUpManager.showAlert(
              this.translate.instant('GLOBAL.info'),
              this.translate.instant('calendario.sin_proyecto_curricular')
            );
          }
        );
    }
  }

  abrirPago(data: any) {
    this.parametros_pago.NUM_DOC_IDEN =
      this.info_info_persona.NumeroIdentificacion;
    this.parametros_pago.REFERENCIA = data['ReciboInscripcion'][0];
    this.parametros_pago.TIPO_DOC_IDEN =
      this.info_info_persona.TipoIdentificacion.CodigoAbreviacion;
    const url = new URLSearchParams(this.parametros_pago).toString();
    const ventanaPSE = window.open(
      environment.PSE_SERVICE + url,
      'PagosPSE',
      'width=600,height=800,resizable,scrollbars,status'
    );
    ventanaPSE!.focus();
    const timer = window.setInterval(() => {
      if (ventanaPSE!.closed) {
        window.clearInterval(timer);
        this.loadInfoInscripcion();
      }
    }, 5000);
  }

  loadTipoInscripcion() {
    this.tipo_inscripciones = new Array();
    window.localStorage.setItem('IdNivel', String(this.selectedLevel));
    this.inscripcionService
      .get(
        'tipo_inscripcion?query=NivelId:' +
          Number(this.selectedLevel) +
          ',Activo:true&sortby=NumeroOrden&order=asc'
      )
      .subscribe(
        (res) => {
          const r = <any>res;
          if (res !== null && r.message !== 'error') {
            let tiposInscripciones = <Array<any>>res;

            tiposInscripciones = tiposInscripciones.filter(function (e) {
              if (
                e['Nombre'] === 'Transferencia interna' ||
                e['Nombre'] === 'Transferencia externa' ||
                e['Nombre'] === 'Reingreso'
              )
                return false;
              return true;
            });

            this.tipo_inscripciones = tiposInscripciones;
            // this.cargaproyectosacademicos();
            if (this.tipo_inscripciones.length === 0) {
              this.popUpManager.showAlert(
                '',
                this.translate.instant('calendario.sin_tipo_inscripcion')
              );
              this.showTipoInscripcion = false;
              this.showProyectoCurricular = false;
              this.showInfo = false;
            } else {
              this.showTipoInscripcion = true;
            }
          }
        },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer:
              this.translate.instant('GLOBAL.cargar') +
              '-' +
              this.translate.instant('GLOBAL.programa_academico'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        }
      );
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get(
          'periodo?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1'
        )
        .subscribe(
          (res: any) => {
            const r = <any>res;
            if (res !== null && r.Status == '200') {
              this.periodo = <any>res['Data'][0];
              window.localStorage.setItem(
                'IdPeriodo',
                String(this.periodo['Id'])
              );
              resolve(this.periodo);
              const periodos = <any[]>res['Data'];
              periodos.forEach((element) => {
                this.periodos.push(element);
              });
            }
          },
          (error: HttpErrorResponse) => {
            reject([]);
          }
        );
    });
  }

  public loadInscripcion(): void {
    if (
      this.inscripcion_id !== undefined &&
      this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== '' &&
      this.inscripcion_id.toString() !== '0'
    ) {
      this.inscripcionService
        .get('inscripcion/' + this.inscripcion_id)
        .subscribe(
          (res) => {
            if (res !== null) {
              this.info_inscripcion = <Inscripcion>res;
              this.aceptaTerminos = true;
            }
          },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer:
                this.translate.instant('GLOBAL.cargar') +
                '-' +
                this.translate.instant('GLOBAL.info_persona') +
                '|' +
                this.translate.instant('GLOBAL.admision'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          }
        );
    }
  }

  createInscripcion(): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.preinscripcion'),
      text: this.translate.instant('GLOBAL.preinscripcion_2') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt).then((willDelete: any) => {
      this.inscripcionMidService
        .post(
          'inscripciones/preinscripcion',
          this.proyectos_preinscripcion_post
        )
        .subscribe(
          (res: any) => {
            this.info_inscripcion = <Inscripcion>(<unknown>res.data);
            this.inscripcion_id = this.info_inscripcion.Id;
            this.eventChange.emit(true);
            Swal.fire({
              icon: 'info',
              title: this.translate.instant('GLOBAL.crear'),
              text:
                this.translate.instant('GLOBAL.inscrito') +
                ' ' +
                this.periodo.Nombre,
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
            this.eventChange.emit(true);
          },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer:
                this.translate.instant('GLOBAL.crear') +
                '-' +
                this.translate.instant('GLOBAL.info_persona') +
                '|' +
                this.translate.instant('GLOBAL.admision'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          }
        );
    });
  }

  // empieza nuevo
  onCreateEmphasys(event: any) {
    const projetc = event.value;
    if (
      !this.arr_proyecto.find(
        (proyectos: any) => projetc.Id === proyectos.Id
      ) &&
      projetc.Id
    ) {
      this.arr_proyecto.push(projetc);

      //this.source_emphasys.load(this.arr_proyecto);
      const matSelect: MatSelect = event.source;
      matSelect.writeValue(null);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('inscripcion.error_proyecto_ya_existe'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }

  onDeleteEmphasys(event: any) {
    const findInArray = (value: any, array: any, attr: any) => {
      for (let i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
          return i;
        }
      }
      return -1;
    };
    this.arr_proyecto.splice(
      findInArray(event.data.Id, this.arr_proyecto, 'Id'),
      1
    );
    //this.source_emphasys.load(this.arr_proyecto);
  }

  preinscripcion() {
    this.proyectos_preinscripcion = [];
    const id = decrypt(localStorage.getItem('persona_id'));
    this.arr_proyecto.forEach((proyecto: any) => {
      Number(localStorage.getItem('IdNivel'));
      this.proyectos_preinscripcion.push({
        PersonaId: Number(id),
        ProgramaAcademicoId: proyecto['Id'],
        PeriodoId: Number(localStorage.getItem('IdPeriodo')),
        EstadoInscripcionId: { Id: 1 },
        TipoInscripcionId: {
          Id: Number(localStorage.getItem('IdTipoInscripcion')),
        },
        AceptaTerminos: true,
        FechaAceptaTerminos: new Date(),
        Activo: true,
      });
    });
    if (this.proyectos_preinscripcion[0] != null) {
      this.info_inscripcion = <Inscripcion>(
        (<unknown>this.proyectos_preinscripcion)
      );
      this.proyectos_preinscripcion_post = {
        DatosPreinscripcion: this.info_inscripcion,
      };
      this.createInscripcion();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ERROR',
        text: this.translate.instant('inscripcion.erro_selec'),
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      });
    }
  }
  // termina

  setPercentage(event: any) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  ocultarBarraExterna(event: boolean) {
    this.ocultarBarra.emit(event);
  }

  async handleInfoPersonaId(info_persona_id: number) {
    try {
      this.info_persona_id = await this.userService.getPersonaId();
      await this.loadInfoPersona();
    } catch (error) {
      if (error instanceof Error) {
        this.popUpManager.showErrorAlert(
          this.translate.instant('inscripcion.error_cargar_informacion') +
            ': ' +
            error.message
        );
      } else {
        this.popUpManager.showErrorAlert(
          this.translate.instant('inscripcion.error_cargar_informacion')
        );
      }
    }
  }
}
