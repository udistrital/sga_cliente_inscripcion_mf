import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'ngx-crud-inscripcion-multiple',
  templateUrl: './crud-inscripcion-multiple.component.html',
  styleUrls: ['./crud-inscripcion-multiple.component.scss'],
})
export class CrudInscripcionMultipleComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'recibo',
    'inscripcion',
    'programa',
    'estado_inscripcion',
    'fecha',
    'estado_recibo',
    'activo',
    'descargar',
    'opcion',
  ];
  dataSource!: MatTableDataSource<any>;

  info_persona_id!: number | null;
  persona_id!: number;
  inscripcion_id!: number;
  data: any[] = [];
  settings: any;
  pdfs: Blob[] = [];
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
  showSublevel: boolean;
  showPeriodo: boolean = false;
  showInscription: boolean;
  nivelInscripcion!: boolean;
  programa!: number;
  aspirante!: number;
  periodo: Periodo = new Periodo();
  periodos: any = [];
  selectednivel: any;
  tipo_inscripciones: any = [];
  proyectos_preinscripcion!: any[];
  proyectos_preinscripcion_post: any;
  niveles!: NivelFormacion[];
  subniveles!: any;
  selectedLevel: any;
  selectedSubLevel: any;
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
  Campo3Control = new FormControl('', [Validators.required]);

  tipoCupos: any = [];
  tipoCupo: any = 0;
  mostrarSelectorCupos = true;
  tipoCupoControl = new FormControl('', [Validators.required]);

  preinscripcionForm!: FormGroup;

  private dialogoPagadorService: any;

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
    private fb: FormBuilder
  ) {
    this.dialogoPagadorService = (window as any)['core-mf']?.DialogoPagadorService;
    this.showProyectoCurricular = false;
    this.showTipoInscripcion = false;
    this.showInfo = false;
    this.showNew = false;
    this.showSublevel = false;
    this.showInscription = true;

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
  }

  async ngOnInit() {
    // Inicializando formulario de preinscripción
    this.preinscripcionForm = this.fb.group({
      nivel: ['', Validators.required],
      proyecto: ['', Validators.required],
      tipoInscripcion: ['', Validators.required],
    });

    sessionStorage.setItem('EstadoInscripcion', 'false');
    // Inicializaciones sincrónicas
    this.parametros_pago = {
      recibo: '',
      REFERENCIA: '',
      NUM_DOC_IDEN: '',
      TIPO_DOC_IDEN: '',
    };
    await this.initializeAsync();
  }

  async initializeAsync() {
    try {
      this.info_persona_id = await this.userService.getPersonaId();
      await this.cargarPeriodo();
      await this.nivel_load();
      await this.loadInfoPersona();
      await this.cargarTipoCuposPorPeriodo(this.periodo.Id);
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
        const persona = await this.recuperarInfoPersona(this.info_persona_id);
        if (persona !== undefined && persona !== null) {
          const temp = <InfoPersona>persona;
          this.info_info_persona = temp;
          const files = [];
        }
        await this.loadInfoInscripcion();
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

  recuperarInfoPersona(personaId: any) {
    return new Promise((resolve, reject) => {
      this.terceroMidService.get('personas/' + personaId).subscribe(
        (res: any) => {
          if (res !== null) {
            resolve(res.Data);
          } else {
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
            reject(false);
          }
        },
        (error: any) => {
          console.error(error);
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
          reject(false);
        }
      );
    });
  }

  loadInscriptionModule() {
    this.inscripcion_id = parseInt(
      sessionStorage.getItem('IdInscripcion')!,
      10
    );
    this.showInscription = false;
  }

  async onRenderButtonPaymentComponent(data: any) {
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
      await this.itemSelect({ data: data.data });
    }
  }

  async itemSelect(event: any): Promise<void> {
    try {
      sessionStorage.setItem('IdInscripcion', event.data.Id);

      const response = await this.inscripcionService
        .get('inscripcion/' + event.data.Id)
        .toPromise();

      const response2 = await this.projectService
        .get(
          `proyecto_academico_institucion?limit=0&query=Id:${response.ProgramaAcademicoId},Activo:true&fields=Id,Nombre,NivelFormacionId,Codigo`
        )
        .toPromise();

      if (response2) {
        if (response2[0].NivelFormacionId.CodigoAbreviacion == 'PRE') {
          sessionStorage.setItem(
            'ProgramaAcademico',
            event.data.ProgramaAcademicoId
          );
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
            this.nivelInscripcion = true;
            this.loadInscriptionModule();
          }
        } else {
          sessionStorage.setItem(
            'ProgramaAcademico',
            event.data.ProgramaAcademicoId
          );
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
            this.nivelInscripcion = false;
            this.loadInscriptionModule();
          }
        }
      } else {
        this.popUpManager.showErrorToast(
          this.translate.instant('ERROR.general')
        );
      }
    } catch (error) {
      console.error(error);
      this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  nivel_load() {
    return new Promise((resolve, reject) => {
      this.projectService.get('nivel_formacion').subscribe(
        (response: NivelFormacion[]) => {
          if (response !== null) {
            this.niveles = response.filter(
              (nivel: NivelFormacion) => nivel.Id === 2 );
          }
          resolve(response);
        },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorAlert(
            this.translate.instant('legalizacion_admision.periodo_error')
          );
          reject([]);
        }
      );
    });
  }

  async loadInfoInscripcion() {
    await this.cargarPeriodo();
    const PeriodoActual: any = localStorage.getItem('IdPeriodo');
    if (this.info_persona_id != null && PeriodoActual != null) {
      const inscripciones: any = await this.recuperarEstadosReciboInscripciones(
        this.info_persona_id,
        PeriodoActual
      );

      if (!inscripciones || inscripciones.length === 0) {
        this.dataSource = new MatTableDataSource<any>([]);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        return;
      }

      const dataInfo = <Array<any>>[];
      this.recibos_pendientes = 0;

      for (const inscripcion of inscripciones) {
        if (inscripcion != null) {
          await this.procesarInscripcion(inscripcion, dataInfo);
        }
      }

      this.dataSource = new MatTableDataSource(dataInfo);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    //  console.log(this.dataSource);
     
    }
  }

  private async procesarInscripcion(inscripcion: any, dataInfo: Array<any>) {
    const proyecto: any = await this.recuperarProyectoAcademico(
      inscripcion.ProgramaAcademicoId
    );
    const auxRecibo = inscripcion.ReciboInscripcion;
    const NumRecibo = auxRecibo.split('/', 1);
    inscripcion.AnioRecibo = auxRecibo;
    inscripcion.ReciboInscripcion = NumRecibo;
    // inscripcion.FechaCreacion = momentTimezone
    //   .tz(inscripcion.FechaCreacion, 'America/Bogota')
    //   .format('DD-MM-YYYY hh:mm:ss');
    inscripcion.FechaCreacion = inscripcion.FechaCreacion.split('.')[0];
    inscripcion.ProgramaAcademicoId = proyecto.Nombre;
    let level = proyecto.NivelFormacionId.NivelFormacionPadreId;
    if (level == null || level == undefined) {
      level = proyecto.NivelFormacionId.Id;
    } else {
      level = proyecto.NivelFormacionId.NivelFormacionPadreId.Id;
    }
    inscripcion.NivelPP = level;
    if (inscripcion.Estado === 'Pendiente pago') {
      this.recibos_pendientes++;
    }
    this.result.emit(1);
    dataInfo.push(inscripcion);
  }

  recuperarEstadosReciboInscripciones(idPersona: number, idPeriodo: number) {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService
        .get(
          'inscripciones/estado-recibos?persona-id=' +
            idPersona +
            '&id-periodo=' +
            idPeriodo
        )
        .subscribe(
          (response: any) => {
            if (response != null && response.Status == '400') {
              this.popUpManager.showErrorToast(
                this.translate.instant('inscripcion.error')
              );
              reject(false);
            } else if (response != null && response.Status == '404') {
              this.popUpManager.showAlert(
                this.translate.instant('GLOBAL.info'),
                this.translate.instant('inscripcion.no_inscripcion')
              );
              reject(false);
            } else {
              const data = <Array<any>>response.Data.Inscripciones;
              resolve(data);
            }
          },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorToast(
              this.translate.instant('ERROR.general')
            );
            reject(false);
          }
        );
    });
  }

  recuperarProyectoAcademico(idProyecto: number) {
    return new Promise((resolve, reject) => {
      this.projectService
        .get('proyecto_academico_institucion?query=Id:' + idProyecto)
        .subscribe(
          (response: any) => {
            resolve(response[0]);
          },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorToast(
              this.translate.instant('ERROR.general')
            );
            reject(false);
          }
        );
    });
  }

  filtrarProyecto(proyecto: any, subNivel: any) {
    if (proyecto['NivelFormacionId']['Id'] === subNivel) {
      return true;
    } else {
      return false;
    }
  }

  async onSelectLevel() {
    // Capturar el id del nivel
    const selectedLevel = this.preinscripcionForm.get('nivel')?.value;

    // Limpiar todos los controles del FormGroup y resetear valores
    this.preinscripcionForm.reset({
      nivel: selectedLevel,
      subNivel: '',
      proyecto: '',
      tipoInscripcion: '',
    });
    this.showTipoInscripcion = false;
    this.showInfo = false;

    if (selectedLevel === undefined) {
      this.popUpManager.showInfoToast(
        this.translate.instant('inscripcion.erro_selec_nivel')
      );
    } else {
      if (selectedLevel === 2) {
        Swal.fire({
          icon: 'info',
          title: this.translate.instant('GLOBAL.info'),
          text: this.translate.instant('inscripcion.alerta_posgrado'),
        });
      }

      const proyectosResponse: any =
        await this.recuperarProyectosAcademicosInstitucion();
      this.projects = proyectosResponse;

      // Encontrar los niveles de formación únicos
      const nivelesSet = new Set();
      const niveles = [];
      for (const item of proyectosResponse) {
        const IdNivel = item.NivelFormacionId ? item.NivelFormacionId.Id : null;
        const Nombre = item.NivelFormacionId
          ? item.NivelFormacionId.Nombre
          : null;
        const IdNivelPadre =
          item.NivelFormacionId?.NivelFormacionPadreId?.Id ?? null;

        if (Nombre && !nivelesSet.has(Nombre)) {
          nivelesSet.add(Nombre);
          niveles.push({ IdNivel, Nombre, IdNivelPadre });
        }
      }

      // Filtrar los niveles por el nivel seleccionado
      this.showSublevel = true;
      this.subniveles = niveles.filter(
        (nivel) => nivel.IdNivelPadre === selectedLevel
      );

      await this.validateProject();
      this.showProyectoCurricular = true;
    }
  }

  recuperarProyectosAcademicosInstitucion() {
    return new Promise((resolve, reject) => {
      this.projectService
        .get(
          'proyecto_academico_institucion?limit=0&fields=Id,Nombre,NivelFormacionId,Codigo'
        )
        .subscribe(
          (response: any) => {
            if (response && Array.isArray(response)) {
              resolve(response);
            } else {
              this.popUpManager.showErrorToast(
                this.translate.instant('ERROR.general')
              );
              reject(false);
            }
          },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorToast(
              this.translate.instant('ERROR.general')
            );
            reject(false);
          }
        );
    });
  }

  nuevaPreinscripcion() {
    this.showNew = true;
  }

  async onSelectProyecto() {
    this.preinscripcionForm.patchValue({
      tipoInscripcion: '',
    });

    // validar fecha limite para generar inscripcion
    const tiempoActual = await firstValueFrom(
      this.inscripcionMidService.get('time_bog')
    );
    const fechaActual = new Date(tiempoActual.Data.BOG);

    let rawProyecto = this.preinscripcionForm.get('proyecto')?.value;
    const proyecto = parseInt(rawProyecto, 10);
    if ( isNaN(proyecto) ){
      console.error("Fallo en obtención del proyecto: ", proyecto);
    }

    const evento = this.inscripcionProjects
      .find( (p:any) => p.ProyectoId === proyecto )?.Evento
      ?.find( (ev:any) => !ev.Pago && ev.CodigoAbreviacion === "INSCR" );
    const fechaFinInsc = evento
      ? new Date (evento.FechaFinEvento.replace('Z', '-05:00'))
      : undefined;
    if (fechaFinInsc) {
      fechaFinInsc.setHours(23, 59, 59, 999);
    }

    // console.log(fechaActual);
    // console.log(fechaFinInsc);
    if (fechaFinInsc && fechaActual <= fechaFinInsc) {
      this.loadTipoInscripcion();
    } else {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.info'),
        this.translate.instant('inscripcion.no_fechas_inscripcion')
      );
      this.showTipoInscripcion = false;
      return
    }
  }

  onSelectTipoInscripcion(tipo: any) {
    this.showInfo = true;
  }

  async validateProject() {
    this.showTipoInscripcion = false;
    this.showInfo = false;

    const selectedNivel = this.preinscripcionForm.get('nivel')?.value;

    const resCalendario: any = await this.recuperarCalendarioProyecto(
      selectedNivel,
      this.periodo.Id
    );

    if (
      resCalendario === null ||
      resCalendario.length === 0 ||
      resCalendario === undefined
    ) {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.info'),
        this.translate.instant('inscripcion.no_proyectos_disponibles')
      );
    }
    this.inscripcionProjects = resCalendario;
  }

  recuperarCalendarioProyecto(idNivel: number, idPeriodo: number) {
    return new Promise((resolve, reject) => {
      this.calendarioMidService
        .get(
          'calendario-proyecto/calendario/proyecto?id-nivel=' +
            idNivel +
            '&id-periodo=' +
            idPeriodo
        )
        .subscribe({ 
          next: (response: any) => {
            const r = <any>response;
            if (
              response !== null &&
              response !== '{}' &&
              r.Type !== 'error' &&
              r.length !== 0
            ) {
              resolve(<Array<any>>response.Data);
            } else {
              this.popUpManager.showAlert(
                this.translate.instant('GLOBAL.info'),
                this.translate.instant('calendario.sin_proyecto_curricular')
              );
              this.showProyectoCurricular = false;
              this.showPeriodo = false;
              this.showTipoInscripcion = false;
              this.showInfo = false;
            }
          },
          error: (error: any) => {
            console.error(error);
            this.popUpManager.showAlert(
              this.translate.instant('GLOBAL.info'),
              this.translate.instant('calendario.sin_proyecto_curricular')
            );
            reject(false);
          }
        });
    });
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
              const persona = await this.recuperarInfoPersona(
                this.info_persona_id
              );
              const temp = <InfoPersona>persona;
              this.info_info_persona = temp;
              const files = [];
              await this.generar_inscripcion();
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
        if (response.Success && response.Data) {
          const byteArray = atob(response.Data);
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

  async generar_inscripcion() {
    const nivelId = this.preinscripcionForm.get('nivel')?.value;
    const proyectoId = this.preinscripcionForm.get('proyecto')?.value;
    const tipoInscripcionId =
      this.preinscripcionForm.get('tipoInscripcion')?.value;

    const inscripcion = {
      Id: parseInt(this.info_info_persona.NumeroIdentificacion, 10),
      Nombre: `${this.info_info_persona.PrimerNombre} ${this.info_info_persona.SegundoNombre}`,
      Apellido: `${this.info_info_persona.PrimerApellido} ${this.info_info_persona.SegundoApellido}`,
      Correo: JSON.parse(atob(localStorage.getItem('id_token')!.split('.')[1]))
        .email,
      PersonaId: Number(this.info_persona_id),
      PeriodoId: this.periodo.Id,
      Nivel: parseInt(nivelId, 10),
      ProgramaAcademicoId: parseInt(proyectoId, 10),
      ProgramaAcademicoCodigo: parseInt(
        this.projects.find((proyecto: any) => proyecto.Id === proyectoId)
          ?.Codigo,
        10
      ),
      TipoInscripcionId: parseInt(tipoInscripcionId, 10),
      Year: this.periodo.Year,
      Periodo: parseInt(this.periodo.Ciclo, 10),
      FechaPago: '',
      TipoCupo: this.tipoCupo,
    };

    const eventoPago = this.inscripcionProjects
      .find( (p:any) => p.ProyectoId === proyectoId )?.Evento
      ?.find( (ev:any) => ev.Pago && ev.CodigoAbreviacion === "INSCR" );
    
    if (eventoPago) {
      inscripcion.FechaPago = moment(
        eventoPago.FechaFinEvento,'YYYY-MM-DD'
      ).format('DD/MM/YYYY');
    } else {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.info'),
        this.translate.instant('inscripcion.no_fechas_pago')
      );
      return;
    }

    // console.log("Genera una nueva inscripción correcta");
    // console.log(inscripcion);
    const resInscripcion: any = await this.inscripcionNuevaPost(
      inscripcion
    );
    if (resInscripcion) {
      this.showProyectoCurricular = false;
      this.showPeriodo = false;
      this.showTipoInscripcion = false;
      this.showInfo = false;
      this.showNew = false;
      this.preinscripcionForm.reset();
      this.loadInfoInscripcion();
    }
  }

  inscripcionNuevaPost(body: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.post('inscripciones/nueva', body).subscribe({
        next: (response: any) => {
          if (response.Status == 200 && response.Success) {
            this.popUpManager.showSuccessAlert(
              this.translate.instant('recibo_pago.generado')
            );
            resolve(true);
          } else if (response.Status == 200 && !response.Success) {
            this.popUpManager.showErrorAlert(response.Message);
            reject(false);
          } else if (response.Status == 400) {
            this.popUpManager.showErrorToast(
              this.translate.instant('recibo_pago.no_generado')
            );
            reject(false);
          }
        },
        error: (error: any) => {
          console.error(error);
          this.popUpManager.showErrorToast(
            this.translate.instant(`ERROR.${error.status}`)
          );
          reject(false);
        }
      });
    });
  }

  // funcion para obtener parámetros de costos pecuniarios, devuelve vector
  async buscarParametrosPeriodo (parametroInscripcion: string ,anioConcepto: number): Promise<any[]> {
    // máximo dos intentos hacia años anteriores
    for (let intento=0; intento <= 2; intento ++){
      let anioActual = anioConcepto - intento;
      // revisa parametros hasta 2024, no tiene sentido ir más atras
      if (anioActual<2024){ break }

      try {
        const parametros = await firstValueFrom(
           this.parametrosService.get(
            `parametro_periodo?query=ParametroId.TipoParametroId.Id:2,ParametroId.CodigoAbreviacion:${parametroInscripcion},PeriodoId.Year:${anioActual},PeriodoId.CodigoAbreviacion:VG`
          )
        );

        if (parametros?.Data?.length > 0){
          return parametros.Data;
        }
      } catch (error) {
        console.error(`Error consultando ${anioActual}`, error);
      }
    }
    throw new Error(this.translate.instant('ERROR.general'));
  }

  async descargarReciboPago(data: any) {
    await this.itemSelect({ data: data });
    if (this.selectedLevel === undefined) {
      this.selectedLevel = parseInt(data.NivelPP, 10);
    }
    if (this.info_info_persona != null && data.Estado != 'Vencido') {
      this.selectedProject = parseInt(
        sessionStorage.getItem('ProgramaAcademicoId')!,
        10
      );

      this.recibo_pago = new ReciboPago();
      this.recibo_pago.NombreDelAspirante = [
          this.info_info_persona.PrimerNombre,
          this.info_info_persona.SegundoNombre,
          this.info_info_persona.PrimerApellido,
          this.info_info_persona.SegundoApellido
        ].filter(Boolean).join(' ');
      this.recibo_pago.DocumentoDelAspirante =this.info_info_persona.NumeroIdentificacion;
      this.recibo_pago.Periodo = this.periodo.Nombre;
      this.recibo_pago.ProyectoAspirante = data['ProgramaAcademicoId'];
      this.recibo_pago.Comprobante = data['ReciboInscripcion'][0];

      const nivelMap: Record<number, string> = {
        1: '13',
        2: '12'
      };
      this.parametro = nivelMap[this.selectedLevel];

      const responseCalendario: any = await this.recuperarCalendarioProyecto(
        this.selectedLevel, this.periodo.Id
      );   
  
      this.inscripcionProjects = responseCalendario;
      const eventoPago = this.inscripcionProjects
        .find((pr: any) => pr.ProyectoId === this.selectedProject)?.Evento
        ?.find((ev: any) => ev.Pago && ev.CodigoAbreviacion === 'INSCR');

      if (eventoPago) {
        this.recibo_pago.Fecha_pago = moment(eventoPago.FechaFinEvento, 'YYYY-MM-DD')
          .format('DD/MM/YYYY');
      }

      const parametro = await this.buscarParametrosPeriodo(this.parametro, this.periodo.Year);
      this.recibo_pago.Descripcion = parametro[0].ParametroId.Nombre;

      const valor = JSON.parse(parametro[0].Valor);
      this.recibo_pago.ValorDerecho = valor.Costo;

      const datosFormulario = {
        accion: 'descargar',
        persona_id: this.info_persona_id,
        info_recibo: this.recibo_pago,
        anioRecibo: data.AnioRecibo,
        tipo_usuario: 1,
        info_info_persona: this.info_info_persona
      }

      const result = await this.abrirDialogoPagador(datosFormulario);
      if (!result || !result.continuar) {
        return;
      }

      // console.log("Se completa con el CONTINUAR()");
      const responseRecibo: any = await firstValueFrom(
        this.inscripcionMidService.post('recibos/estudiantes', this.recibo_pago)
      );
      if (!responseRecibo) {
        console.error('Respuesta vacía del servicio de recibos');
        this.popUpManager.showErrorToast(
          this.translate.instant('recibo_pago.no_generado')
        );
        return;
      }
      if (!responseRecibo.Data) {
        console.error('Campo Data no encontrado en la respuesta:', responseRecibo);
        this.popUpManager.showErrorToast(
          this.translate.instant('recibo_pago.no_generado')
        );
        return;
      }
      // Verificar que Data no esté vacío
      if (!responseRecibo.Data.trim()) {
        console.error('Data está vacío');
        this.popUpManager.showErrorToast(
          this.translate.instant('recibo_pago.no_generado')
        );
        return;
      }
      const reciboData = new Uint8Array(
        atob(responseRecibo.Data)
          .split('')
          .map((char) => char.charCodeAt(0))
      );
      this.recibo_generado = window.URL.createObjectURL(
        new Blob([reciboData], { type: 'application/pdf' })
      );
      window.open(this.recibo_generado);
    }
  }

  async abrirDialogoPagador(data: any): Promise<any> {
    try {
      // Obtener el servicio del core_mf_cliente que está expuesto globalmente
      const dialogoPagadorService = (window as any)['core-mf']?.DialogoPagadorService;
      
      if (!dialogoPagadorService) {
        console.error('Servicio DialogoPagadorService no disponible en window[core-mf]');
        console.warn('Verificar que core_mf_cliente esté correctamente cargado');
        return null;
      }
    
      const dialogRef = dialogoPagadorService.openDialogoPagador(data);

      dialogRef.afterOpened().subscribe(() => {
        // Forzar detección de cambios
        dialogRef.componentInstance.cdr.detectChanges();
        if (dialogRef.componentInstance.selects) {
          dialogRef.componentInstance.selects.forEach((select: any) => select.updatePosition());
        }
      });

      // Manejo de resultado cuando el diálogo se cierra
      const result = await firstValueFrom(dialogRef.afterClosed());
      console.log('Diálogo cerrado con resultado:', result);

      return result;
      
    } catch (error) {
      console.error('Error al abrir el diálogo de pagador:', error);
      return null;
    }
  }

  async abrirPago(data: any) {
    await this.itemSelect({ data: data });
    const datosFormulario = {
      accion: 'pagar',
      persona_id: this.info_persona_id,
        info_recibo: this.recibo_pago,
        anioRecibo: data.AnioRecibo,
        tipo_usuario: 1,
        info_info_persona: this.info_info_persona
    }

    const result = await this.abrirDialogoPagador(datosFormulario);
    if (!result || !result.continuar) {
      return;
    }

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

  async loadTipoInscripcion() {
    this.tipo_inscripciones = new Array();
    let tiposInscripciones;

    const selectedLevel = this.preinscripcionForm.get('nivel')?.value;
    const tiposInscripcion: any = await this.recuperarTipoInscripcionNivel(
      selectedLevel
    );
    window.localStorage.setItem('IdNivel', String(selectedLevel));

    if (selectedLevel == 1) {
      tiposInscripciones = <Array<any>>tiposInscripcion;
    } else {
      tiposInscripciones = <Array<any>>tiposInscripcion;
      tiposInscripciones = tiposInscripciones.filter(function (e) {
        if (
          e['Nombre'] === 'Transferencia interna' ||
          e['Nombre'] === 'Transferencia externa' ||
          e['Nombre'] === 'Reingreso'
        ) {
          return false;
        } else {
          return true;
        }
      });
    }

    this.tipo_inscripciones = tiposInscripciones;
    // this.cargaproyectosacademicos();
    if (this.tipo_inscripciones.length === 0) {
      this.popUpManager.showAlert(
        '',
        this.translate.instant('calendario.sin_tipo_inscripcion')
      );
      this.showTipoInscripcion = false;
      this.showProyectoCurricular = false;
      this.showPeriodo = false;
      this.showInfo = false;
    } else {
      this.showTipoInscripcion = true;
    }
  }

  recuperarTipoInscripcionNivel(idNivel: number) {
    return new Promise((resolve, reject) => {
      this.inscripcionService
        .get(
          'tipo_inscripcion?query=NivelId:' +
            idNivel +
            ',Activo:true&sortby=NumeroOrden&order=asc&limit=0'
        )
        .subscribe(
          (response: any) => {
            const r = <any>response;
            if (response !== null && r.message !== 'error') {
              resolve(response);
            } else {
              reject(false);
            }
          },
          (error: any) => {
            console.error(error);
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
            reject(false);
          }
        );
    });
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get(
          'periodo?query=CodigoAbreviacion:PA,Activo:true&sortby=Id&order=desc&limit=0'
        )
        .subscribe(
          (response: any) => {
            if (response.Status && response.Data) {
              this.periodo = response['Data'][0];
              window.localStorage.setItem(
                'IdPeriodo',
                String(this.periodo['Id'])
              );
              this.periodos = response.Data;
              resolve(this.periodo);
            }
          },
          (error: HttpErrorResponse) => {
            console.error(error);
            this.popUpManager.showErrorAlert(
              this.translate.instant('legalizacion_admision.periodo_error')
            );
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
            this.info_inscripcion = <Inscripcion>(<unknown>res.Data);
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

  cargarTipoCuposPorPeriodo(idPeriodo: any) {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get(
          `parametro_periodo?limit=0&query=ParametroId.TipoParametroId.CodigoAbreviacion:TIP_CUP,PeriodoId.Id:${idPeriodo}`
        )
        .subscribe(
          (res: any) => {
            resolve(res.Data);
          },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorAlert(
              this.translate.instant('admision.facultades_error')
            );
            reject(false);
          }
        );
    });
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  actualizarEstadoInscripcion(inscripcionData: any) {
    inscripcionData.TerceroId = this.info_persona_id;
    return new Promise((resolve, reject) => {
      this.inscripcionMidService
        .post('inscripciones/actualizar-inscripcion', inscripcionData)
        .subscribe(
          (res: any) => {
            if (res !== null && res.Status != '400') {
              resolve(res.Data);
            } else {
              this.popUpManager.showErrorAlert(
                this.translate.instant(
                  'legalizacion_admision.inscripciones_error'
                )
              );
              reject([]);
            }
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(
              this.translate.instant(
                'legalizacion_admision.inscripciones_error'
              )
            );
            console.error(error);
            reject([]);
          }
        );
    });
  }
}
