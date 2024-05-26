import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { validateLang } from 'src/app/app.component';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Inscripcion } from 'src/app/models/inscripcion/inscripcion';
import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';

@Component({
  selector: 'app-preinscripcion',
  templateUrl: './preinscripcion.component.html',
  styleUrls: ['./preinscripcion.component.scss'],
})
export class PreinscripcionComponent implements OnInit {
  @Input('inscripcion_id')
  set name(inscripcion_id: number) {
    this.inscripcion_id = inscripcion_id;
    if (this.inscripcion_id === 0 || this.inscripcion_id.toString() === '0') {
      this.selectedValue = undefined;
      window.localStorage.setItem('programa', this.selectedValue);
    }
    if (
      this.inscripcion_id !== undefined &&
      this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== '' &&
      this.inscripcion_id.toString() !== '0'
    ) {
      // this.getInfoInscripcion();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  isLoading: boolean = true;
  inscripcion_id!: number;
  info_persona_id: number | null = null;
  info_ente_id!: number;
  estado_inscripcion!: number;
  info_info_persona: any;
  usuariowso2: any;
  datos_persona: any;
  inscripcion: Inscripcion = new Inscripcion();
  preinscripcion!: boolean;
  step = 0;
  isBarraOculta: boolean = false;
  nForms!: number;
  SelectedTipoBool: boolean = true;
  info_inscripcion: any;

  percentage_info: number = 0;
  percentage_acad: number = 0;
  percentage_expe: number = 0;
  percentage_proy: number = 0;
  percentage_prod: number = 0;
  percentage_desc: number = 0;
  percentage_docu: number = 0;
  percentage_total: number = 0;

  total: boolean = false;

  percentage_tab_info: any[] = [];
  percentage_tab_acad: any[] = [];
  percentage_tab_proy: any[] = [];
  percentage_tab_prod: any[] = [];
  percentage_tab_desc: any[] = [];
  percentage_tab_docu: any[] = [];

  show_info = false;
  show_profile = false;
  show_expe = false;
  show_acad = false;

  info_persona!: boolean;
  button_politica: boolean = true;
  programa_seleccionado: any;
  viewtag: any;
  selectedValue: any;
  selectedTipo: any;
  tipo_inscripcion_selected: any;
  selectTipo: any;
  selectTabView: any;
  tag_view_posg!: boolean;
  tag_view_pre!: boolean;
  selectprograma: boolean = true;
  periodo: any;
  selectednivel: any;
  habilitar_inscripcion: boolean = true;

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private popUpManager: PopUpManager
  ) {
    validateLang(this.translate);
    this.total = true;
    this.show_info = true;
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      this.info_persona_id = await this.userService.getPersonaId();
    } catch (error) {
      this.popUpManager.showErrorAlert(
        this.translate.instant('inscripcion.error_cargar_informacion' + error)
      );
    } finally {
      this.isLoading = false;
    }
  }

  setPercentage_info(number: any, tab: any) {
    this.percentage_tab_info[tab] = (number * 100) / 2;
    this.percentage_info = Math.round(
      UtilidadesService.getSumArray(this.percentage_tab_info)
    );
    if (number === 1) {
      this.habilitar_inscripcion = false;
    }
    this.setPercentage_total();
  }

  setPercentage_acad(number: any, tab: any) {
    this.percentage_tab_acad[tab] = (number * 100) / 2;
    this.percentage_acad = Math.round(
      UtilidadesService.getSumArray(this.percentage_tab_acad)
    );
    this.setPercentage_total();
  }

  setPercentage_total() {
    this.percentage_total =
      Math.round(UtilidadesService.getSumArray(this.percentage_tab_info)) / 2;
    this.percentage_total +=
      Math.round(UtilidadesService.getSumArray(this.percentage_tab_acad)) / 4;
    this.percentage_total +=
      Math.round(UtilidadesService.getSumArray(this.percentage_tab_docu)) / 4;
    this.percentage_total +=
      Math.round(UtilidadesService.getSumArray(this.percentage_tab_proy)) / 4;
    if (this.info_inscripcion !== undefined) {
      if (this.info_inscripcion.EstadoInscripcionId.Id > 1) {
        this.percentage_total = 100;
      }
      if (this.percentage_total >= 100) {
        if (this.info_inscripcion.EstadoInscripcionId.Id === 1) {
          this.total = false;
        }
      }
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  perfil_editar(event: any): void {
    switch (event) {
      case 'info_persona':
        this.show_info = true;
        break;
      case 'info_preinscripcion':
        this.preinscripcion = true;
        break;
      case 'perfil':
        this.show_info = false;
        this.show_profile = true;
        break;
      default:
        this.show_info = false;
        this.show_profile = false;
        break;
    }
  }

  cambioTab() {
    this.info_persona = false;
    this.preinscripcion = true;
  }

  ocultarBarra(event: boolean) {
    this.isBarraOculta = event;
  }
}
