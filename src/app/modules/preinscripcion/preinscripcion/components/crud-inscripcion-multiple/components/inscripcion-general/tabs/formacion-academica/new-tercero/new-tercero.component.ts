import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Lugar } from 'src/app/models/informacion/lugar';
import { TipoTercero } from 'src/app/models/terceros/tipo_tercero';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
import Swal from 'sweetalert2';
import { NUEVO_TERCERO } from './form_new_tercero';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';

@Component({
  selector: 'ngx-new-tercero',
  templateUrl: './new-tercero.component.html',
  styleUrls: ['./new-tercero.component.scss']
})
export class NewTerceroComponent implements OnInit {
  nuevoTercero: boolean = false;
  listaPaises!: Lugar[];
  listaTipoTercero!: TipoTercero[];

  @Output() eventChange = new EventEmitter();
  @Output('result')
  result: EventEmitter<any> = new EventEmitter();

  @Input('nit')
  set name(nit: number) {
    this.info_tercero = {
      Nit: nit,
    }
    this.formInfoNuevoTercero.campos[this.getIndexFormNew('Nit')].valor = nit;
    this.formInfoNuevoTercero.campos[this.getIndexFormNew('Nit')].deshabilitar = true;
  }
  terceroData = null;
  info_tercero: any;
  formInfoNuevoTercero: any;
  regInfoFormacionAcademica: any;
  temp_info_academica: any;
  clean!: boolean;
  percentage!: number;
  paisSelecccionado: any;
  infoComplementariaUniversidadId: number = 1;
  universidadConsultada: any;

  constructor(
    private translate: TranslateService,
    private inscripcionMidService: InscripcionMidService,
    private store: Store<IAppState>) {
    this.formInfoNuevoTercero = NUEVO_TERCERO;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadLists();
  }

  construirForm() {
    this.formInfoNuevoTercero.btn = this.translate.instant('GLOBAL.guardar');
    this.formInfoNuevoTercero.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formInfoNuevoTercero.campos.length; i++) {
      this.formInfoNuevoTercero.campos[i].label = this.translate.instant('GLOBAL.' + this.formInfoNuevoTercero.campos[i].label_i18n);
      this.formInfoNuevoTercero.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formInfoNuevoTercero.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexFormNew(nombre: String): number {
    for (let index = 0; index < this.formInfoNuevoTercero.campos.length; index++) {
      const element = this.formInfoNuevoTercero.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  createInfoTercero(infoTercero: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('informacion_academica.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willMake) => {
        if (willMake.value) {
          if (infoTercero.Nit.includes('-')) {
            let nitAux = infoTercero.Nit.split('-');
            infoTercero.Nit = nitAux[0];
            infoTercero.Verificacion = nitAux[1];
          }

          this.inscripcionMidService.post('academico/formacion/tercero', infoTercero)
            .subscribe((data) => {
              this.result.emit({
                infoPost: infoTercero,
                infoReturn: data,
              });
            });
        }
      });
  }

  ngOnInit() {
    const opt2: any = {
      title: this.translate.instant('GLOBAL.info'),
      text: this.translate.instant('inscripcion.alerta_veracidad_informacion'),
      icon: 'warning',
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
    };
    Swal.fire(opt2)
      .then((action2) => {
      });
  }

  setPercentage(event:any) {
    setTimeout(() => {
      this.percentage = event;
      // this.result.emit(this.percentage);
    });
  }

  validarFormNuevoTercero(event:any) {
    if (event.valid) {
      const formData = event.data.Tercero;
      this.createInfoTercero(formData)
    }
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.listaTipoTercero = list.listTipoTercero;
        this.formInfoNuevoTercero.campos[this.getIndexFormNew('TipoTrecero')].opciones = this.listaTipoTercero[0];

        // Ajuste de nombre
        this.formInfoNuevoTercero.campos[this.getIndexFormNew('TipoTrecero')].opciones.forEach((tipo:any) => {
          tipo.Nombre = tipo.Nombre.charAt(0) + tipo.Nombre.slice(1).toLowerCase().replaceAll('_', ' ');
        });

        this.listaPaises = list.listPais;
        this.formInfoNuevoTercero.campos[this.getIndexFormNew('Pais')].opciones = list.listPais[0];
      },
    );
  }
}

