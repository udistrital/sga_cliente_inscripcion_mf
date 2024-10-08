import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as moment from 'moment';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Inscripcion } from 'src/app/models/inscripcion/inscripcion';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { TAGS_INSCRIPCION_PROGRAMA } from './def_tags_por_programa';
import { DocumentoService } from 'src/app/services/documento.service';
import { ListService } from 'src/app/services/list.service';
import { IdiomaService } from 'src/app/services/idioma.service';
import { EvaluacionInscripcionService } from 'src/app/services/evaluacion_inscripcion.service';
import { TimeService } from 'src/app/services/time.service';
import { DialogoDocumentosComponent } from 'src/app/modules/components/dialogo-documentos/dialogo-documentos.component';
import { VideoModalComponent } from 'src/app/modules/components/video-modal.component/video-modal.component.component';
import { CalendarioMidService } from 'src/app/services/sga_calendario_mid.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';
import { TercerosMidService } from 'src/app/services/terceros_mid.service';
import { CrudInfoCaracteristicaPregradoComponent } from '../inscripcion-general/tabs/informacion-basica/crud-info-caracteristica-pregrado/crud-info-caracteristica-pregrado.component';
import { decrypt } from 'src/app/utils/util-encrypt';

@Component({
  selector: 'ngx-inscripcion-pregrado',
  templateUrl: './inscripcion-pregrado.component.html',
  styleUrls: ['./inscripcion-pregrado.component.scss']
})
export class InscripcionPregradoComponent implements OnInit, OnChanges{
  hide_header_labels!: boolean;
  basic_info_button: boolean = false;
  formacion_academica_button: boolean = false;
  documentos_programa_button: boolean = false;
  detalle_inscripcion: boolean = false;
  experiencia_laboral: boolean = false;
  produccion_academica: boolean = false;
  es_transferencia: boolean = false;
  nivel: any;

  tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};

  @Input('inscriptionSettings')
  set nameInscription(inscriptionSettings: any) {
    if(inscriptionSettings){
      const {
        basic_info_button,
        hide_header_labels,
        formacion_academica_button,
        documentos_programa_button,
        nivel,
        select_tipo,
        detalle_inscripcion,
        experiencia_laboral,
        produccion_academica,
        es_transferencia,
      } = inscriptionSettings;
  
      this.nivel = nivel;
      this.selectTipo = select_tipo;
      this.hide_header_labels = !!hide_header_labels;
      this.basic_info_button = basic_info_button;
      this.formacion_academica_button = formacion_academica_button;
      this.documentos_programa_button = documentos_programa_button;
      this.detalle_inscripcion = detalle_inscripcion;
      this.experiencia_laboral = experiencia_laboral;
      this.produccion_academica = produccion_academica;
      this.es_transferencia = es_transferencia;
    }
  }

  @Input('inscripcion_id')
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id === 0 || this.inscripcion_id.toString() === '0') {
      this.selectedValue = undefined;
      window.localStorage.setItem('programa', this.selectedValue);
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();
  @Output() changeTab: EventEmitter<any> = new EventEmitter();
  @Output() ocultarBarra: EventEmitter<boolean> = new EventEmitter();

  // @ViewChild('videoModal', { static: true }) videoModal: ElementRef;

  inscripcion_id!: number;
  info_persona_id!: any;
  info_ente_id!: number;
  estado_inscripcion!: number;
  estado_inscripcion_nombre: string = "";
  estaInscrito: boolean = false;
  info_info_persona: any;
  usuariowso2: any;
  datos_persona: any;
  inscripcion!: Inscripcion;
  step = 0;
  enfasisSelected: any = null;
  cambioTab = 0;
  nForms!: number;
  SelectedTipoBool: boolean = true;
  Campo1Control = new FormControl('', [Validators.required]);
  Campo2Control = new FormControl('', [Validators.required]);
  Campo3Control = new FormControl('');
  enfasisControl = new FormControl('', [Validators.required]);

  percentage_info: number = 0;
  percentage_acad: number = 0;
  // percentage_idio: number = 0;
  // percentage_expe: number = 0;
  // percentage_proy: number = 0;
  // percentage_prod: number = 0;
  // percentage_desc: number = 0;
  percentage_docu: number = 0;
  percentage_infoacad: number = 0;
  percentage_examen: number = 0;
  percentage_familiar: number = 0;
  percentage_total: number = 0;

  total: boolean = false;

  percentage_tab_info: any[] = [];
  // percentage_tab_expe: any[] = [];
  percentage_tab_acad: any[] = [];
  // percentage_tab_idio: any[] = [];
  // percentage_tab_proy: any[] = [];
  // percentage_tab_prod: any[] = [];
  // percentage_tab_desc: any[] = [];
  percentage_tab_docu: any[] = [];
  percentage_tab_infoacad: any[] = [];
  percentage_tab_examen: any[] = [];
  percentage_tab_familiar: any[] = [];
  posgrados!: any[];
  tipo_inscripciones = [];

  show_info_pregrado = false;
  show_info_externa = false;
  show_info = false;
  show_profile = false;
  show_acad_pregrado = false;
  show_acad = false;
  show_idiomas = false;
  show_expe = false;
  show_proy = false;
  show_prod = false;
  show_desc = false;
  show_docu = false;
  show_acudiente = false;
  show_examen = false;
  showRegreso: boolean = true;

  info_contacto!: boolean;
  info_familiar!: boolean;
  info_persona!: boolean;
  info_caracteristica!: boolean;
  info_inscripcion: any;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedValue2: any;
  selectedValue3: any;
  selectedTipo: any;
  tipo_inscripcion_selected: any;
  selectTipo: any;
  selectTabView: any;
  tipo_documentos!: any[];
  tag_view_posg!: boolean;
  tag_view_pre!: boolean;
  selectprograma: boolean = true;
  periodo: any;
  imprimir: boolean = false;

  tieneEnfasis: boolean = false;
  enfasis: any = [];

  puedeInscribirse: boolean = false;
  soloPuedeVer: boolean = false;

  numberOfSelects!: number
  formControlsProyectos: FormControl[] = [];
  formControlsTipoCupo: FormControl[] = [];
  tipoCupos: any = [];
  puedePreInscribirse = false;
  preinscrito = false;
  incripcionInicial: any
  listaPreinscripciones: any

  IdPeriodo: any
  IdTipo: any 
  IdPrograma: any

  @ViewChild(CrudInfoCaracteristicaPregradoComponent, { static: true }) hijoComponente!: CrudInfoCaracteristicaPregradoComponent;
  
  constructor(
    private listService: ListService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private documentoService: DocumentoService,
    private idiomaService: IdiomaService,
    private userService: UserService,
    private parametrosService: ParametrosService,
    private programaService: ProyectoAcademicoService,
    private terceroMidService: TerceroMidService,
    private tercerosMid: TercerosMidService,
    private inscripcionMidService: InscripcionMidService,
    private calendarioMidService: CalendarioMidService,
    private dialog: MatDialog,
    private evaluacionInscripcionService: EvaluacionInscripcionService,
    private timeService: TimeService,
  ) {
    //sessionStorage.setItem('TerceroId', this.userService.getPersonaId().toString());
    this.translate = translate;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => { });
    this.total = true;
    this.listService.findPais();
    this.loadData();
  }

  async ngOnInit() {
    // Escuchar los cambios en los selects de la inscripción principal
    this.Campo1Control.valueChanges.subscribe(() => this.verificarHabilitarBoton());
    this.Campo2Control.valueChanges.subscribe(() => this.verificarHabilitarBoton());

    // Escuchar los cambios en los selects opcionales
    this.formControlsProyectos.forEach((control, index) => {
      control.valueChanges.subscribe(() => this.verificarHabilitarBoton());
    });
    this.formControlsTipoCupo.forEach((control, index) => {
      control.valueChanges.subscribe(() => this.verificarHabilitarBoton());
    });

    this.info_persona_id = await this.userService.getPersonaId();
    sessionStorage.setItem('IdTercero', String(this.info_persona_id));
  }

  activateTab() {
    // No se muestra la vista de inscripción sino la de preinscripción
    this.changeTab.emit(false);
  }

  async loadData() {
    if(<string>sessionStorage.getItem('IdEstadoInscripcion') != null){
      this.estado_inscripcion_nombre = <string>sessionStorage.getItem('IdEstadoInscripcion')!.toUpperCase();
    }
    this.inscripcion = new Inscripcion();
    this.inscripcion.Id = parseInt(sessionStorage.getItem('IdInscripcion')!, 10);
    this.inscripcion.ProgramaAcademicoId = sessionStorage.getItem('ProgramaAcademico');
    // this.IdPeriodo = parseInt(sessionStorage.getItem('IdPeriodo')!, 10);
    this.IdPeriodo = 59;
    this.IdTipo = parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10)
    this.IdPrograma = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!, 10)
    // Se carga el nombre del periodo al que se inscribió
    this.loadPeriodo(this.IdPeriodo);
    // Se carga el tipo de inscripción
    this.loadTipoInscripcion(this.IdTipo);
    // Se carga el nivel del proyecto
    this.loadNivel(this.IdPrograma);
    // Se cargan los tipos de cupo por perido
    this.cargarTipoCuposPorPeriodo(this.IdPrograma);
    // Se carga el numero de proyectos permitidos para pregardo
    this.loadNumeroProyectos(this.IdPeriodo)
  }

  loadNumeroProyectos(IdPeriodo: any) {
    this.parametrosService.get(`parametro_periodo?query=PeriodoId:58,Activo:true&limit=0`).subscribe(
    // this.parametrosService.get(`parametro_periodo?query=PeriodoId:${IdPeriodo},Activo:true&limit=0`).subscribe(
      response => {
        const valorObject = JSON.parse(response.Data[0].Valor);
        this.numberOfSelects = valorObject.Valor - 1;
  
        // Limpiar los arrays antes de volver a llenarlos
        this.formControlsProyectos = [];
        this.formControlsTipoCupo = [];
  
        for (let i = 0; i < this.numberOfSelects; i++) {
          const proyectoControl = new FormControl('');
          const tipoCupoControl = new FormControl('');
  
          // Agregar los controles al array
          this.formControlsProyectos.push(proyectoControl);
          this.formControlsTipoCupo.push(tipoCupoControl);
  
          // Suscribirse a los cambios de cada control
          proyectoControl.valueChanges.subscribe(() => this.verificarHabilitarBoton());
          tipoCupoControl.valueChanges.subscribe(() => this.verificarHabilitarBoton());
        }
  
        // Verificar si el botón debe estar habilitado después de cargar los proyectos
        this.verificarHabilitarBoton();
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      }
    );
  }

  cargarTipoCuposPorPeriodo(idPeriodo: any) {
    idPeriodo = 39
    return new Promise((resolve, reject) => {
      this.parametrosService.get(`parametro_periodo?limit=0&query=ParametroId.TipoParametroId.CodigoAbreviacion:T,PeriodoId.Id:${idPeriodo}`)
      // this.parametrosService.get(`parametro_periodo?limit=0&query=ParametroId.TipoParametroId.CodigoAbreviacion:TIP_CUP,PeriodoId.Id:${idPeriodo}`)
        .subscribe((res: any) => {
          this.tipoCupos = res.Data
        },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            reject(false);
          });
    });
  }

  cargarInscripcionInicial (inscripcionId: any) {
    this.inscripcionService.get(`inscripcion?query=Id:${inscripcionId},Activo:true&limit=0`).subscribe(
      response => {
        this.incripcionInicial = response[0]
        if(this.incripcionInicial.TipoCupo == 0){
          for (let i = 0; i < this.posgrados.length; i++) {
            if(this.posgrados[i].ProyectoId == this.incripcionInicial.ProgramaAcademicoId){
              this.Campo1Control.setValue(this.posgrados[i].ProyectoId);
              break;
            }
          }
        }else{
          console.log("AAAAAAAAAAAAAAAAA")
          this.preinscrito = true
          // this.puedeInscribirse = true;
          this.tipo_inscripcion("enfasis")
          this.loadSuitePrograma(this.IdPeriodo,this.IdPrograma,this.IdTipo)
        } 
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }
  


  loadProject() {
    this.posgrados = new Array;
    const IdNivel = parseInt(sessionStorage.getItem('IdNivel')!, 10);
    // let periodo = localStorage.getItem('IdPeriodo');
    let periodo = 59
    this.calendarioMidService.get('calendario-proyecto/calendario/proyecto?id-nivel=' + IdNivel + '&id-periodo=' + periodo).subscribe(
      response => {
        const r = <any>response;
        if (response !== null && response !== '{}' && r.Type !== 'error' && r.length !== 0) {
          const inscripcionP = <Array<any>>response.Data;
          this.posgrados = inscripcionP;
          this.selectedValue = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!, 10);
          // Se carga la inscripcion principal del aspirante
          this.cargarInscripcionInicial(this.inscripcion.Id)
        } else {
          this.popUpManager.showAlert('', this.translate.instant('inscripcion.no_inscripcion'));
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadNivel(IdPrograma: number) {
    this.programaService.get('proyecto_academico_institucion/?query=Id:' + IdPrograma).subscribe(
      (response: any) => {
        let IdNivel;
        if (response[0].NivelFormacionId.NivelFormacionPadreId !== null) {
          IdNivel = response[0].NivelFormacionId.NivelFormacionPadreId.Id;
        } else {
          IdNivel = response[0].NivelFormacionId.Id;
        }
        this.programaService.get('nivel_formacion/' + IdNivel).subscribe(
          (res: any) => {
            this.inscripcion.Nivel = res.Nombre;
            this.inscripcion.IdNivel = res.Id;
            sessionStorage.setItem('IdNivel', res.Id)
            this.loadProject();
          },
          error => {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          },
        );
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  async checkEventoInscripcion() {
    if(this.selectedValue) {
      let EventosPrograma = this.posgrados.find((EventsProgram) => EventsProgram.ProyectoId == this.selectedValue);
      if (EventosPrograma) {
        this.puedeInscribirse = true;
        // if (EventosPrograma.EventoInscripcion) {
          // let fechafin = moment(EventosPrograma.EventoInscripcion.FechaFinEvento,"YYYY-MM-DDTHH:mm:ss").tz("America/Bogota").toDate();
          // fechafin.setDate(fechafin.getDate() + 1);

          // const realhora = await this.timeService.getDate("BOG");
          // let ahora = moment(realhora).tz("America/Bogota").toDate();

          // if(fechafin > ahora) {
          //   this.puedeInscribirse = true;
          // } else {
          //   if(!this.estaInscrito){
          //     this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_puede_inscribirse'));
          //   }
          //   this.puedeInscribirse = false;
          // }
        // } else {
        //   this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_hay_programa_evento'));
        //   this.puedeInscribirse = false;
        // }
      } else {
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_hay_programa_evento'));
        this.puedeInscribirse = false;
      }
    }
    localStorage.setItem("goToEdit", String(this.puedeInscribirse && !this.soloPuedeVer));
    return this.puedeInscribirse;
  }

  loadTipoInscripcion(IdTipo: number) {
    this.inscripcionService.get('tipo_inscripcion/' + IdTipo).subscribe(
      (response: any) => {
        this.inscripcion.TipoInscripcion = response.Nombre;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  loadPeriodo(IdPeriodo: number) {
    this.parametrosService.get('periodo/' + IdPeriodo).subscribe(
      (response: any) => {
        this.inscripcion.PeriodoId = response.Data.Nombre;
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  create_inscription(data:any) {
    const info_inscripcion_temp = {
      Id: 0,
      PersonaId: this.info_persona_id || 4,
      ProgramaAcademicoId: this.selectedValue.Id || 0, // Cambiar por el periodo
      PeriodoId: this.periodo.Id,
      AceptaTerminos: true,
      FechaAceptaTerminos: new Date(),
      Activo: true,
      EstadoInscripcionId: {
        Id: 1,
      },
      TipoInscripcionId: this.tipo_inscripcion_selected,
    }
    this.inscripcionService.post('inscripcion', info_inscripcion_temp)
      .subscribe(res => {
        const r = <any>res;
        if (res !== null && r.Type !== 'error') {
          this.inscripcion_id = r.Id;
        }
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('inscripcion.error_registrar_informacion'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  setPercentage_info(number:any, tab:any) {
    this.percentage_tab_info[tab] = (number * 100) / 2;
    this.percentage_info = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info));
    this.setPercentage_total();
  }

  setPercentage_info_externo(number:any, tab:any) {
    // this.percentage_tab_info[tab] = (number * 100) / 3;
    this.percentage_tab_info[tab] = (number * 105) / 2;
    this.percentage_info = Math.round(UtilidadesService.getSumArray(this.percentage_tab_info));
    this.setPercentage_total();
  }

  setPercentage_acad(number:any, tab:any) {
    this.percentage_tab_acad[tab] = (number * 100) / 10;
    this.percentage_acad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad));
    this.setPercentage_total();
  }

  // setPercentage_idio(number:any, tab:any) {
  //   this.percentage_tab_idio[tab] = (number * 100) / 1;
  //   this.percentage_idio = Math.round(UtilidadesService.getSumArray(this.percentage_tab_idio));
  //   this.setPercentage_total();
  // }

  setPercentage_acad_pre(number:any, tab:any) {
    this.percentage_tab_acad[tab] = (number * 100);
    if (!this.es_transferencia) {
      this.percentage_tab_acad[tab] = (number * 100) / 2;
    }
    this.percentage_acad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad));
    this.setPercentage_total();
  }

  // setPercentage_expe(number:any, tab:any) {
  //   this.percentage_tab_expe[tab] = (number * 100) / 1;
  //   this.percentage_expe = Math.round(UtilidadesService.getSumArray(this.percentage_tab_expe));
  //   this.setPercentage_total();
  // }

  // setPercentage_proy(number:any, tab:any) {
  //   this.percentage_tab_proy[tab] = (number * 100) / 1;
  //   this.percentage_proy = Math.round(UtilidadesService.getSumArray(this.percentage_tab_proy));
  //   this.setPercentage_total();
  // }

  // setPercentage_desc(number:any, tab:any) {
  //   this.percentage_tab_desc[tab] = (number * 100) / 1;
  //   this.percentage_desc = Math.round(UtilidadesService.getSumArray(this.percentage_tab_desc));
  //   this.setPercentage_total();
  // }

  setPercentage_docu(number:any, tab:any) {
    this.percentage_tab_docu[tab] = (number * 100) / 1;
    this.percentage_docu = Math.round(UtilidadesService.getSumArray(this.percentage_tab_docu));
    this.setPercentage_total();
  }

  // setPercentage_prod(number:any, tab:any) {
  //   this.percentage_tab_prod[tab] = (number * 100) / 1;
  //   this.percentage_prod = Math.round(UtilidadesService.getSumArray(this.percentage_tab_prod));
  //   this.setPercentage_total();
  // }

  setPercentage_info_acad(number:any, tab:any) {
    this.percentage_tab_infoacad[tab] = (number * 100) / 10;
    this.percentage_infoacad = Math.round(UtilidadesService.getSumArray(this.percentage_tab_infoacad));
    this.setPercentage_total();
  }

  setPercentage_familiar(number:any, tab:any) {
    this.percentage_tab_familiar[tab] = (number * 100) / 10;
    this.percentage_familiar = Math.round(UtilidadesService.getSumArray(this.percentage_tab_familiar));
    this.setPercentage_total();
  }

  setPercentage_examen(number:any, tab:any) {
    this.percentage_tab_examen[tab] = (number * 100) / 1;
    this.percentage_examen = Math.round(UtilidadesService.getSumArray(this.percentage_tab_examen));
    this.setPercentage_total();
  }

  setPercentage_total() {

    let conteoObligatorios = 0;
    let sumaPorcentajes = 0;

    if (this.tagsObject.info_persona.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_info);
      console.log("3333333333333333", sumaPorcentajes)
      conteoObligatorios += 1;
    }

    if (this.tagsObject.documento_programa.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_docu);
      conteoObligatorios += 1;
    }

    if (this.tagsObject.examen_estado.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_examen);
      conteoObligatorios += 1;
    }

    if (this.tagsObject.informacion_academica.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_infoacad);
      conteoObligatorios += 1;
    }


    if (this.tagsObject.datos_acudiente.required) {
      sumaPorcentajes += UtilidadesService.getSumArray(this.percentage_tab_familiar);
      conteoObligatorios += 1;
    }

    this.percentage_total = Math.round(sumaPorcentajes / conteoObligatorios);

    console.log("Totallllllllllllllllllllll",this.percentage_total)

    this.result.emit(this.percentage_total);
    if (sessionStorage['EstadoInscripcion']) {
      if (this.percentage_total >= 100) {
        this.total = false;
        let enAlgunaVista = this.show_profile || this.show_info_pregrado ||
                            this.show_acad_pregrado || this.show_expe || 
                            this.show_proy || this.show_prod || this.show_desc ||
                            this.show_docu || this.show_info || this.show_acad || 
                            this.show_info_externa || this.show_idiomas || this.show_acudiente;
        if (!enAlgunaVista && this.estado_inscripcion_nombre == "INSCRIPCIÓN SOLICITADA"){
          this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.inscripcion'), this.translate.instant('inscripcion.mensaje_100_inscripcion'), "info", false)
        }
      } else {
        this.total = true;
      }
    }
  }

  // loadPercentageInfoCaracteristica(factor: number) {
  //     this.terceroMidService.get('personas/' + this.info_persona_id + '/complementarios')
  //       .subscribe(res => {
  //         if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Status != '404') {
  //           this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2));
  //           this.percentage_tab_info[1] = Number((100 / factor));
  //           console.log("11111111111", this.percentage_tab_info[1])
  //         } else {
  //           this.percentage_info = this.percentage_info + 0;
  //           this.percentage_tab_info[1] = 0;
  //         }
  //       });
  // }

  async loadPercentageInfoCaracteristica(factor: number): Promise<void> {
    return new Promise((resolve) => {
      this.terceroMidService.get('personas/' + this.info_persona_id + '/complementarios')
        .toPromise()
        .then(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Status != '404') {
            this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2));
            this.percentage_tab_info[1] = Number((100 / factor));
            console.log("11111111111", this.percentage_tab_info[1]);
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[1] = 0;
          }
          resolve();
        })
        .catch(err => {
          console.error('Error en loadPercentageInfoCaracteristica:', err);
          resolve();
        });
    });
  }

  // loadPercentageInfoContacto(factor: number) {
  //     this.inscripcionMidService.get('inscripciones/informacion-complementaria/tercero/' + this.info_persona_id)
  //       .subscribe(res => {
  //         if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Status != '404') {
  //           this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2));
  //           this.percentage_tab_info[2] = Number((100 / factor));
  //           console.log("22222222222222222", this.percentage_tab_info[2])
  //         } else {
  //           this.percentage_info = this.percentage_info + 0;
  //           this.percentage_tab_info[2] = 0;
  //         }
  //       });
  // }

  async loadPercentageInfoContacto(factor: number): Promise<void> {
    return new Promise((resolve) => {
      this.inscripcionMidService.get('inscripciones/informacion-complementaria/tercero/' + this.info_persona_id)
        .toPromise()
        .then(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Status != '404') {
            this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2));
            this.percentage_tab_info[2] = Number((100 / factor));
            console.log("22222222222222222", this.percentage_tab_info[2]);
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[2] = 0;
          }
          resolve();
        })
        .catch(err => {
          console.error('Error en loadPercentageInfoContacto:', err);
          resolve();
        });
    });
  }

  loadPercentageInfoFamiliar(factor: number) {
      this.terceroMidService.get('personas/' + this.info_persona_id + '/familiar')
        .subscribe(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Status != '404') {
            this.percentage_info = this.percentage_info + Number((100 / factor).toFixed(2)) + 0.01;
            this.percentage_tab_info[3] = Number((100 / factor));
          } else {
            this.percentage_info = this.percentage_info + 0;
            this.percentage_tab_info[3] = 0;
          }
        });
  }

  loadPercentageFormacionAcademica() {
      this.inscripcionMidService.get('academico/formacion?Id=' + this.info_persona_id)
        .subscribe(res => {
          if (res.Status == '200' && (Object.keys(res.Data).length > 0)) {
            this.percentage_acad = 100;
            this.percentage_tab_acad[0] = 100;
          } else {
            this.percentage_acad = 0;
            this.percentage_tab_acad[0] = 0;
          }
        
    });
  }

  // loadPercentageFormacionAcademicaPregado(factor:any) {
  //     this.terceroMidService.get('personas/' + this.info_persona_id + '/formacion-pregrado')
  //       .subscribe(res => {
  //         if (res.Status == '200') {
  //           this.percentage_acad = this.percentage_acad + (100 / factor);
  //           this.percentage_tab_acad[0] = (100 / factor);
  //         } else {
  //           this.percentage_acad = this.percentage_acad + 0;
  //           this.percentage_tab_acad[0] = 0;
  //         }
  //       });
  // }

  loadPercentageExamenEstado() {}



  async loadPercentageInformacionFamiliar(): Promise<void> {
    return new Promise((resolve) => {
      this.tercerosMid.get('personas/datos-acudiente/' + this.info_persona_id)
        .toPromise()
        .then(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Status != '404' && res.Data.length > 1) {
            this.percentage_familiar = 100;
            this.percentage_tab_familiar[0] = 100;
          } else {
            this.percentage_familiar = 0;
            this.percentage_tab_familiar[0] = 0;
          }
          resolve();
        })
        .catch(err => {
          console.error('Error en loadPercentageInfoContacto:', err);
          resolve();
        });
    });
  }


  async loadPercentageInformacionAcademica(): Promise<void> {
    return new Promise((resolve) => {
      this.tercerosMid.get('personas/localidades/'+this.info_persona_id)
        .toPromise()
        .then(res => {
          if (res !== null && JSON.stringify(res[0]) !== '{}' && res.Status != '404' && res.Data.colegio[0].Id != 0) {
            this.percentage_infoacad = 100;
            this.percentage_tab_infoacad[0] = 100;
          } else {
            this.percentage_infoacad = 0;
            this.percentage_tab_infoacad[0] = 0;
          }
          resolve();
        })
        .catch(err => {
          console.error('Error en loadPercentageInfoContacto:', err);
          resolve();
        });
    });
  }

  async loadPercentageDocumentos(): Promise<void> {
    return new Promise((resolve) => {
      this.inscripcionService.get('soporte_documento_programa?query=InscripcionId.Id:' +
        this.inscripcion.Id + ',DocumentoProgramaId.ProgramaId:' + parseInt(sessionStorage['ProgramaAcademicoId'], 10) + ',DocumentoProgramaId.TipoInscripcionId:' + parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10) + ',DocumentoProgramaId.PeriodoId:' + parseInt(sessionStorage.getItem('IdPeriodo')!, 10) + ',DocumentoProgramaId.Activo:true,DocumentoProgramaId.Obligatorio:true,Activo:true&limit=0')
        .toPromise()
        .then((res: any[]) => {
          if (Object.keys(res[0]).length > 0) {
            this.percentage_docu = Math.round((res.length / this.tipo_documentos.length) * 100);
            if(this.percentage_docu >= 100){
              this.percentage_docu = 100;
            }
            this.percentage_tab_docu[0] = Math.round(this.percentage_docu);
          } else {
            this.percentage_docu = 0;
            this.percentage_tab_docu[0] = 0;
          }
          resolve();
        })
        .catch(err => {
          console.error('Error en loadPercentageInfoContacto:', err);
          resolve();
        });
    });
  }


  // loadPercentageDocumentos() {
  //     this.inscripcionService.get('soporte_documento_programa?query=InscripcionId.Id:' +
  //       this.inscripcion.Id + ',DocumentoProgramaId.ProgramaId:' + parseInt(sessionStorage['ProgramaAcademicoId'], 10) + ',DocumentoProgramaId.TipoInscripcionId:' + parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10) + ',DocumentoProgramaId.PeriodoId:' + parseInt(sessionStorage.getItem('IdPeriodo')!, 10) + ',DocumentoProgramaId.Activo:true,DocumentoProgramaId.Obligatorio:true&limit=0').subscribe(
  //         (res: any[]) => {
  //           if (Object.keys(res[0]).length > 0) {
  //             this.percentage_docu = Math.round((res.length / this.tipo_documentos.length) * 100);
  //             if(this.percentage_docu >= 100){
  //               this.percentage_docu = 100;
  //             }
  //             this.percentage_tab_docu[0] = Math.round(this.percentage_docu);
  //           } else {
  //             this.percentage_docu = 0;
  //             this.percentage_tab_docu[0] = 0;
  //           }
  //         });
  // }



  loadLists() {  
    return new Promise((resolve, reject) => {
    this.inscripcionService.get('documento_programa?query=Activo:true,ProgramaId:' + parseInt(sessionStorage['ProgramaAcademicoId'], 10) + ',TipoInscripcionId:' + parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10) + ',PeriodoId:'+sessionStorage.getItem('IdPeriodo') + ',Obligatorio:true&limit=0').subscribe(
      response => {
        if (Object.keys(response[0]).length > 0) {
          this.tipo_documentos = <any[]>response;
        } else {
          this.tipo_documentos = [];
        }
        resolve(this.tipo_documentos)
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        reject(error)
      },
    );
    });
  }

  verificarHabilitarBoton() {
    // Verificar si ambos selects de la inscripción principal están seleccionados
    const principalCompleto = this.Campo1Control.valid && this.Campo2Control.valid;

    // Verificar que las inscripciones opcionales estén correctamente seleccionadas si es que están llenas
    let opcionalesValidas = true;
    for (let i = 0; i < this.formControlsProyectos.length; i++) {
      const proyectoSeleccionado = this.formControlsProyectos[i].value;
      const tipoCupoSeleccionado = this.formControlsTipoCupo[i].value;

      if (proyectoSeleccionado && !tipoCupoSeleccionado) {
        opcionalesValidas = false;
        break;
      }
    }

    // Habilitar o deshabilitar el botón
    this.puedePreInscribirse = principalCompleto && opcionalesValidas;
  }

  realizarPreInscripcion() {
    // Recoger la información de los selects principales
    const principal = {
      programa: this.Campo1Control.value,
      tipoCupo: this.Campo2Control.value,
    };

    // Recoger la información de las inscripciones opcionales seleccionadas
    const opcionales: any[] = [];
    for (let i = 0; i < this.formControlsProyectos.length; i++) {
      const proyectoSeleccionado = this.formControlsProyectos[i].value;
      const tipoCupoSeleccionado = this.formControlsTipoCupo[i].value;

      if (proyectoSeleccionado && tipoCupoSeleccionado) {
        opcionales.push({
          programa: proyectoSeleccionado,
          tipoCupo: tipoCupoSeleccionado,
        });
      }
    }

    this.preinscrito = true
    this.puedeInscribirse = true

    this.incripcionInicial.ProgramaAcademicoId = principal.programa
    this.incripcionInicial.TipoCupo = principal.tipoCupo

    this.inscripcionService.put(`inscripcion`, this.incripcionInicial).subscribe(
      response => {
        if(response){
          for (let i = 0; i < opcionales.length; i++) {

            const nuevasPreInscripciones = {
              AceptaTerminos: this.incripcionInicial.AceptaTerminos,
              Activo: true,
              EnfasisId: this.incripcionInicial.EnfasisId,
              FechaAceptaTerminos: this.incripcionInicial.FechaAceptaTerminos,
              NotaFinal: this.incripcionInicial.NotaFinal,
              Opcion: this.incripcionInicial.Opcion,
              PeriodoId: this.incripcionInicial.PeriodoId,
              PersonaId: this.incripcionInicial.PersonaId,
              Credencial: this.incripcionInicial.Credencial,
              ProgramaAcademicoId: opcionales[i].programa,
              ReciboInscripcion: this.incripcionInicial.ReciboInscripcion,   
              TipoCupo: opcionales[i].tipoCupo,
              EstadoInscripcionId: {
                Id: this.incripcionInicial.EstadoInscripcionId.Id
              },
              TipoInscripcionId: {
                Id: this.incripcionInicial.TipoInscripcionId.Id
              }
            };

            this.inscripcionService.post(`inscripcion`, nuevasPreInscripciones).subscribe(
              response => {
                console.log(response)
              },
              error => {
                this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
              },
            );
          }
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );

  }

  // async getPorcentajes() {

  //   // Consulta si hay información en el tab de información personal
  //   if (this.percentage_info === 0 && this.tagsObject.info_persona.selected) {
  //     await this.loadPercentageInfoCaracteristica(2);
  //     await this.loadPercentageInfoContacto(2);
  //     // if (this.selectTipo === 'Transferencia externa' || this.nivel == 'Pregrado') {
  //     //   await this.loadPercentageInfoCaracteristica(3);
  //     //   await this.loadPercentageInfoContacto(3);
  //     //   await this.loadPercentageInfoFamiliar(3);
  //     // } else {
  //     //   await this.loadPercentageInfoCaracteristica(2);
  //     //   await this.loadPercentageInfoContacto(2);
  //     // }
  //   }

  //   // Consulta si hay información en formación académica
  //   // if (this.percentage_acad === 0 && this.tagsObject.formacion_academica.selected) {
  //   //   if (this.nivel == 'Pregrado') {
  //   //     let factor = 1
  //   //     if (this.selectTipo != 'Transferencia interna' && this.selectTipo != 'Reingreso' && this.selectTipo != 'Transferencia externa') {
  //   //       let factor = 2
  //   //       ////////////////////////////////////////////////////////////////////////////////
  //   //       ////// TO DO: Preguntas de ingreso a al univerisdad en inscripción normal //////
  //   //       ////////////////////////////////////////////////////////////////////////////////
  //   //     }
  //   //     await this.loadPercentageFormacionAcademicaPregado(factor);
  //   //   } else {
  //   //     await this.loadPercentageFormacionAcademica();
  //   //   }
  //   // }

  //   // Consulta si hay información en idiomas
  //   // if (this.percentage_idio === 0 && this.tagsObject.idiomas.selected) {
  //   //   if (this.nivel == 'Pregrado') {
  //   //     let factor = 1
  //   //     if (this.selectTipo != 'Transferencia interna' && this.selectTipo != 'Reingreso' && this.selectTipo != 'Transferencia externa') {
  //   //       let factor = 2
  //   //       ////////////////////////////////////////////////////////////////////////////////
  //   //       ////// TO DO: Preguntas de ingreso a al univerisdad en inscripción normal //////
  //   //       ////////////////////////////////////////////////////////////////////////////////
  //   //     }
  //   //   } else {
  //   //     await this.loadPercentageIdiomas();
  //   //   }
  //   // }

  //   // Consulta si hay información en experiencia laboral
  //   // if (this.percentage_expe === 0 && this.tagsObject.experiencia_laboral.selected) {
  //   //   await this.loadPercentageExperienciaLaboral();
  //   // }

  //   // Consulta si hay información en produccion academica
  //   // if (this.percentage_prod === 0 && this.tagsObject.produccion_academica.selected) {
  //   //   await this.loadPercentageProduccionAcademica();
  //   // }



    

  //   // Consulta si hay información en documentos solicitados
  //   if (this.percentage_docu === 0 && this.tagsObject.documento_programa.selected) {
  //     await this.loadLists().then(async () => {
  //       await this.loadPercentageDocumentos();
  //     })
  //   }

  //   if (this.percentage_examen === 0 && this.tagsObject.examen_estado.selected) {
  //     await this.loadPercentageExamenEstado();
  //   }

  //   if (this.percentage_familiar === 0 && this.tagsObject.datos_acudiente.selected) {
  //     await this.loadPercentageInformacionFamiliar();
  //   }

  //   if (this.percentage_acad === 0 && this.tagsObject.informacion_academica.selected) {
  //     await this.loadPercentageInformacionAcademica();
  //   }


  //   // Consulta si hay información en descuento
  //   // if (this.percentage_desc === 0 && this.tagsObject.descuento_matricula.selected) {
  //   //   await this.loadPercentageDescuentos();
  //   // }

  //   // Consulta si hay información en propuesta trabajo de grado
  //   // if (this.percentage_proy === 0 && this.tagsObject.propuesta_grado.selected) {
  //   //   await this.loadPercentageTrabajoDeGrado();
  //   // }
  //   this.setPercentage_total();
  // }

  async getPorcentajes() {
    // Declarar un array de promesas
    const promises = [];
  
    // Consulta si hay información en el tab de información personal
    if (this.percentage_info === 0 && this.tagsObject.info_persona.selected) {
      promises.push(this.loadPercentageInfoCaracteristica(2));
      promises.push(this.loadPercentageInfoContacto(2));
    }
  
    // Consulta si hay información en documentos solicitados
    if (this.percentage_docu === 0 && this.tagsObject.documento_programa.selected) {
      promises.push(
        this.loadLists().then(() => {
          return this.loadPercentageDocumentos();
        })
      );
    }
  
    // // Consulta si hay información en examen estado
    // if (this.percentage_examen === 0 && this.tagsObject.examen_estado.selected) {
    //   promises.push(this.loadPercentageExamenEstado());
    // }
  
    // Consulta si hay información familiar
    if (this.percentage_familiar === 0 && this.tagsObject.datos_acudiente.selected) {
      promises.push(this.loadPercentageInformacionFamiliar());
    }
  
    // Consulta si hay información académica
    if (this.percentage_acad === 0 && this.tagsObject.informacion_academica.selected) {
      promises.push(this.loadPercentageInformacionAcademica());
    }
  
    // Esperar a que todas las promesas se resuelvan
    await Promise.all(promises);
  
    // Llamar a setPercentage_total al final
    this.setPercentage_total();
  }

  resetPercentages() {
    this.percentage_total = 0;
    this.percentage_info = 0;
    this.percentage_acad = 0;
    // this.percentage_idio = 0;
    // this.percentage_expe = 0;
    // this.percentage_prod = 0;
    this.percentage_docu = 0;
    // this.percentage_desc = 0;
    // this.percentage_proy = 0;
    this.percentage_familiar = 0;
    this.percentage_examen = 0;
    this.percentage_tab_info = [];
    this.percentage_tab_acad = [];
    // this.percentage_tab_idio = [];
    // this.percentage_tab_expe = [];
    // this.percentage_tab_prod = [];
    this.percentage_tab_docu = [];
    // this.percentage_tab_desc = [];
    // this.percentage_tab_proy = [];
    this.percentage_tab_familiar = [];
    this.percentage_tab_examen = [];
  }

  realizarInscripcion() {
    // if(this.Campo1Control.status == "VALID" && this.enfasisControl.status == "VALID") {

      this.inscripcionService.get('inscripcion/' + parseInt(sessionStorage['IdInscripcion'], 10)).subscribe(
        (response: any) => {
          const inscripcionPut: any = response;
          inscripcionPut.ProgramaAcademicoId = parseInt(sessionStorage['ProgramaAcademicoId'], 10);
          
          // if (this.tieneEnfasis) {
          //   if (this.enfasisSelected) {
          //     inscripcionPut.EnfasisId = parseInt(this.enfasisSelected, 10);
          //   } else {
          //     inscripcionPut.EnfasisId = parseInt(this.enfasisControl.value!,10);
          //   }
          // }

          this.inscripcionService.get('estado_inscripcion?query=Nombre:INSCRITO').subscribe(
            (response: any) => {
              const estadoInscripcio: any = response[0];
              inscripcionPut.EstadoInscripcionId = estadoInscripcio;
              inscripcionPut.TerceroId = this.info_persona_id;

              console.log("Inscripcionnnnnnnnnnnnnnnnnnn", response[0])
              console.log("Inscripcionnnnnnnnnnnnnnnnnnn", inscripcionPut)

              this.inscripcionMidService.post('inscripciones/actualizar-inscripcion', inscripcionPut)
                .subscribe(res_ins => {
                  const r_ins = <any>res_ins;
                  if (res_ins !== null && r_ins.Status !== '400') {
                    this.popUpManager.showSuccessAlert(this.translate.instant('inscripcion.actualizar'));
                    this.imprimir = true;
                    localStorage.setItem("goToEdit", String(false));
                    this.perfil_editar('perfil');
                  }
                },
                  (error: any) => {
                    if (error.System.Message.includes('duplicate')) {
                      Swal.fire({
                        icon: 'info',
                        text: this.translate.instant('inscripcion.error_update_programa_seleccionado'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),

                      });
                    } else {
                      Swal.fire({
                        icon: 'error',
                        title: error.status + '',
                        text: this.translate.instant('ERROR.' + error.status),
                        footer: this.translate.instant('GLOBAL.actualizar') + '-' +
                          this.translate.instant('GLOBAL.admision'),
                        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                      });
                    }
                  });
            },
            error => {
              this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
            },
          );
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        },
      );
    // } else {
    //   this.popUpManager.showAlert(this.translate.instant('inscripcion.preinscripcion'),this.translate.instant('enfasis.select_enfasis'));
    //   this.enfasisControl.markAsTouched();
    // }

  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  perfil_editar(event:any): void {
    console.log(event);
    this.ocultarBarra.emit(true);
    switch (event) {
      case 'info_contacto':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = true;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_proy = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_prod = false;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'info_caracteristica':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = true;
        this.info_persona = false;
        this.show_proy = false;
        this.show_docu = false;
        this.show_desc = false;
        this.show_prod = false;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'info_persona':
        console.log(this.selectTipo, this.viewtag);
        this.viewtag = 'Informacion_pregrado'
        this.selecttabview(this.viewtag);
        // if (this.selectTipo === 'Pregrado') {
        //   console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAA")
        //   this.viewtag = 'Informacion_pregrado'
        //   this.selecttabview(this.viewtag);
        // }
        // if (this.selectTipo === 'Posgrado') {
        //   this.viewtag = 'Informacion_posgrado'
        //   this.selecttabview(this.viewtag);
        // }
        // if (this.selectTipo === 'Transferencia interna' || this.selectTipo === 'Reingreso') {
        //   if (this.nivel === 'Pregrado') {
        //     this.viewtag = 'Informacion_pregrado'
        //     this.selecttabview(this.viewtag);
        //   }
        //   if (this.nivel === 'Posgrado') {
        //     this.viewtag = 'Informacion_posgrado'
        //     this.selecttabview(this.viewtag);
        //   }
        // }
        // if (this.inscripcion.TipoInscripcion === 'Transferencia externa') {
        //   this.viewtag = 'Informacion_externa'
        //   this.selecttabview(this.viewtag);
        // }
        break;
      case 'info_familiar':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_familiar = true;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_proy = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_prod = false;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'experiencia_laboral':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.show_acad = false;
        this.show_docu = false;
        this.show_idiomas = false;
        this.show_expe = true;
        this.info_persona = false;
        this.show_proy = false;
        this.show_desc = false;
        this.show_prod = false;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'formacion_academica':
        if (this.selectTipo === 'Pregrado') {
          this.viewtag = 'Formacion_pregrago'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Posgrado') {
          this.viewtag = 'Formacion_posgrago'
          this.selecttabview(this.viewtag);
        }
        if (this.selectTipo === 'Transferencia interna' || this.selectTipo === 'Reingreso' || this.selectTipo === 'Transferencia externa') {
          if (this.nivel === 'Pregrado') {
            this.viewtag = 'Formacion_pregrago'
            this.selecttabview(this.viewtag);
          }
          if (this.nivel === 'Posgrado') {
            this.viewtag = 'Formacion_posgrago'
            this.selecttabview(this.viewtag);
          }
        }
        break;
      case 'idiomas':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = true;
        this.show_expe = false;
        this.show_docu = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'produccion_academica':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.show_docu = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_proy = false;
        this.show_prod = true;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'documento_programa':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.show_docu = true;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'descuento_matricula':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.show_docu = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = true;
        this.show_proy = false;
        this.show_prod = false;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'propuesta_grado':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_docu = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.show_proy = true;
        this.info_persona = false;
        this.show_desc = false;
        this.show_prod = false;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'perfil':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = true;
        this.show_acad = false;
        this.show_idiomas = false;
        this.info_contacto = false;
        this.show_docu = false;
        this.info_caracteristica = false;
        this.show_desc = false;
        this.show_expe = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_desc = false;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'datos_acudiente':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_expe = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_desc = false;
        this.show_acudiente = true;
        this.show_examen = false;
        break;
      case 'examen_estado':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_desc = false;
        this.show_acudiente = false;
        this.show_examen = true;
        break;
      case 'informacion_academica':
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = true;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_desc = false;
        this.show_acudiente = false;
        this.show_examen = false;
        break;
      case 'salir_preinscripcion':
        this.activateTab();
        break;
      default:
        this.show_info = false;
        this.show_docu = false;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.show_desc = false;
        this.show_expe = false;
        this.show_proy = false;
        this.show_prod = false;
        this.show_desc = false;
        this.imprimir = false;
        this.show_acudiente = false;
        this.show_examen = false;
        this.showRegreso = true;
        break;
    }
  }

  selecttabview(viewtag:any) {
    switch (viewtag) {
      case ('Informacion_pregrado'):
        this.showRegreso = false;
        this.show_info_pregrado = true;
        this.show_profile = false;
        this.show_acad_pregrado = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Formacion_pregrago'):
        this.showRegreso = false;
        this.show_info_pregrado = false;
        this.show_profile = false;
        this.show_acad_pregrado = true;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Informacion_posgrado'):
        this.showRegreso = false;
        this.show_info = true;
        this.show_profile = false;
        this.show_acad = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Formacion_posgrago'):
        this.showRegreso = false;
        this.show_info = false;
        this.show_profile = false;
        this.show_acad = true;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = false;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
      case ('Informacion_externa'):
        this.showRegreso = false;
        this.show_info_externa = true;
        this.show_profile = false;
        this.show_acad_pregrado = false;
        this.show_idiomas = false;
        this.show_expe = false;
        this.info_contacto = false;
        this.info_caracteristica = false;
        this.info_persona = true;
        this.show_desc = false;
        this.show_docu = false;
        this.show_proy = false;
        this.show_prod = false;
        break;
    }

  }

  selectTab(event:any): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.info_persona')) {
      if (this.info_persona)
        this.perfil_editar('info_persona');
    } else if (event.tabTitle === this.translate.instant('GLOBAL.info_caracteristica')) {
      this.perfil_editar('info_caracteristica');
    } else if (event.tabTitle === this.translate.instant('GLOBAL.informacion_contacto')) {
      this.perfil_editar('info_contacto');
    }
  }

  ngOnChanges() {
  }

  async tipo_inscripcion(select:any) {
    console.log("Entramosssssssssssssssssssssssssssssssssssss")
    select = "enfasis"
    if (select == 'programa') {
      this.enfasisSelected = undefined;
      this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
    
      if (this.inscripcion.IdNivel === 1) {
        this.selectedTipo = 'Pregrado'
      } else {
        this.selectedTipo = 'Posgrado'
      }

      if (this.selectedValue !== undefined) {
        sessionStorage.setItem('ProgramaAcademicoId', this.selectedValue);
        this.programaService.get('proyecto_academico_enfasis/?query=Activo:true,ProyectoAcademicoInstitucionId.Id:' + this.selectedValue + '&limit=0')
          .subscribe((enfasis: any) => {
            this.enfasis = enfasis.map((e:any) => (e.EnfasisId));
            this.tieneEnfasis = this.enfasis.length > 0;
            this.enfasisSelected = parseInt(sessionStorage.getItem('IdEnfasis')!);
          })
      } else {
        this.tieneEnfasis = false;
        this.enfasis = [];
      }
    
      switch (this.selectedTipo) {
        case ('Pregrado'):
          this.selectTipo = 'Pregrado';
          this.selectprograma = true;
          break;
        case ('Posgrado'):
          this.selectTipo = 'Posgrado';
          this.selectprograma = true;
          break;
        case ('Transferencia interna'):
          this.selectprograma = false;
          this.selectTipo = 'Transferencia interna';
          break;
        case ('Reingreso'):
          this.selectprograma = false;
          this.selectTipo = 'Reingreso';
          break;
        case ('Transferencia externa'):
          this.selectprograma = true;
          this.selectTipo = 'Transferencia externa';
          break;
        case ('Profesionalización tecnólogos'):
          this.selectTipo = 'Pregrado';
          this.selectprograma = true;
          break;
        case ('Ciclos propedéuticos'):
          this.selectTipo = 'Pregrado';
          this.selectprograma = true;
          break;
        case ('Movilidad Académica'):
          this.selectTipo = 'Pregrado';
          this.selectprograma = true;
          break;
      }
    }


    if (select == 'enfasis') {
      // if (this.enfasisSelected) {
      if(this.preinscrito === true){
        console.log(this.IdPrograma)
        this.resetPercentages();
        const IdPeriodo = parseInt(sessionStorage.getItem('IdPeriodo')!, 10);
        const IdTipo = parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10)
        // if(await this.loadSuitePrograma(IdPeriodo, this.selectedValue, IdTipo)) {
        if(await this.loadSuitePrograma(IdPeriodo, this.IdPrograma, IdTipo)) {
          if (this.estado_inscripcion_nombre !== "INSCRIPCIÓN SOLICITADA") {
            console.log("AAAAAAAAAAAAAA")
            this.Campo1Control.disable();
            this.enfasisControl.disable();
            this.estaInscrito = true;
            this.soloPuedeVer = true;
            this.puedeInscribirse = false;
            localStorage.setItem("goToEdit", String(this.puedeInscribirse));
            if (this.estado_inscripcion_nombre == "INSCRITO CON OBSERVACIÓN"){
              this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.inscripcion'), 
                    this.translate.instant('inscripcion.informar_estado_inscrito_obs'), "info", false);
            }
          } else if (await this.checkEventoInscripcion()) {
            console.log("BBBBBBBBBBBBBBBB")
            this.percentage_total = 0;
            await this.getPorcentajes();
          }
        }
      }
      // }
    }
  }

  volverATabs(){
    const IdPeriodo = parseInt(sessionStorage.getItem('IdPeriodo')!, 10);
    const IdTipo = parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10)
    this.loadSuitePrograma(IdPeriodo, this.selectedValue, IdTipo)
  }

  redirectBecauseObservations() {
    if (this.estado_inscripcion_nombre == "INSCRITO CON OBSERVACIÓN"){
      this.popUpManager.showPopUpGeneric(this.translate.instant('inscripcion.inscripcion'), 
            this.translate.instant('inscripcion.info_boton_cambio_inscrito'), "info", false);
      this.perfil_editar('perfil');
    }
  }

  loadSuitePrograma(periodo:any, proyecto:any, tipoInscrip:any) {
    return new Promise((resolve) => {
    this.evaluacionInscripcionService.get('tags_por_dependencia?query=Activo:true,PeriodoId:'+periodo+',DependenciaId:'+proyecto+',TipoInscripcionId:'+tipoInscrip)
        .subscribe((response: any) => {
          if (response != null && response.Status == '200') {
            if (Object.keys(response.Data[0]).length > 0) {
              this.puedeInscribirse = true;
              this.tagsObject = JSON.parse(response.Data[0].ListaTags);
              // this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
              console.log(this.tagsObject)
              resolve(this.tagsObject)
            } else {
              this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
              this.puedeInscribirse = false;
              this.soloPuedeVer = false;
              this.popUpManager.showAlert(this.translate.instant('inscripcion.preinscripcion'), this.translate.instant('admision.no_tiene_suite'));
              resolve(false);
            }
          } else {
            this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
            this.puedeInscribirse = false;
            this.soloPuedeVer = false;
            this.popUpManager.showAlert(this.translate.instant('inscripcion.preinscripcion'), this.translate.instant('admision.no_tiene_suite'));
            resolve(false);
          }
        },
        (error: HttpErrorResponse) => {
          this.tagsObject = {...TAGS_INSCRIPCION_PROGRAMA};
          this.puedeInscribirse = false;
          this.soloPuedeVer = false;
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          resolve(false);
        });
  });
  }

  mostrarBarraExterna() {
    this.ocultarBarra.emit(false);
    this.setPercentage_total();
  }

  revisarDocumento(doc: any) {
      const assignConfig = new MatDialogConfig();
      assignConfig.width = '1300px';
      assignConfig.height = '750px';
      assignConfig.data = { documento: doc }
      const dialogo = this.dialog.open(DialogoDocumentosComponent, assignConfig);
//      dialogo.afterClosed().subscribe(data => {});
  }

  openVideoModal(videoId: string): void {
    const dialogRef = this.dialog.open(VideoModalComponent, {
      width: '600px', 
      data: { videoId: videoId }
    });
  
    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
