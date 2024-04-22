import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { DocumentoService } from 'src/app/services/documento.service';
import { ListService } from 'src/app/services/list.service';
import { UserService } from 'src/app/services/users.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
import Swal from 'sweetalert2';
import { FORM_PREGUNTAS } from './form-preguntas';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';

@Component({
  selector: 'ngx-crud-preguntas',
  templateUrl: './crud-preguntas.component.html',
  styleUrls: ['./crud-preguntas.component.scss']
})
export class CrudPreguntasComponent implements OnInit {
  info_formacion_academica_id!: number;
  persiona_id: number;

  @Input('info_formacion_academica_id')
  set name(info_formacion_academica_id: number) {
    this.info_formacion_academica_id = info_formacion_academica_id;
    // this.loadInfoFormacionAcademica();
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_universidad: any;
  formUniversidad: any;
  temp: any;
  clean!: boolean;
  percentage!: number;

  constructor(
    private translate: TranslateService,
    private inscripcionMidService: InscripcionMidService,
    private users: UserService,
    private store: Store<IAppState>,
    private listService: ListService,
    private snackBar: MatSnackBar) {
    this.formUniversidad = FORM_PREGUNTAS;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });

    this.persiona_id = this.users.getPersonaId();

    this.listService.findMediosEnteroUniversidad();
    this.listService.findSePresentaAUniversidadPor();
    this.listService.findTipoInscripcionUniversidad();
    this.loadLists();
  }

  construirForm() {
    // this.formUniversidad.titulo = this.translate.instant('GLOBAL.formacion_academica');
    this.formUniversidad.btn = this.translate.instant('GLOBAL.guardar');
    this.formUniversidad.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formUniversidad.campos.length; i++) {
      this.formUniversidad.campos[i].label = this.translate.instant('GLOBAL.' + this.formUniversidad.campos[i].label_i18n);
      this.formUniversidad.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formUniversidad.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formUniversidad.campos.length; index++) {
      const element = this.formUniversidad.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
       this.formUniversidad.campos[this.getIndexForm('MedioEntero')].opciones = list.listMediosEnteroUniversidad[0];
       this.formUniversidad.campos[this.getIndexForm('PresentoUniversidad')].opciones = list.listSePresentaAUniversidadPor[0];
       this.formUniversidad.campos[this.getIndexForm('TipoInscripcion')].opciones = list.listTipoInscripcionUniversidad[0];
      },
   );
 }

  ngOnInit() {
    // this.loadInfoFormacionAcademica();
  }

  setPercentage(event:any) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  createUniversidad(infoUniversidad: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('universidad_form.seguro_continuar_registrar'),
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
          this.info_universidad = <any>infoUniversidad;
          this.inscripcionMidService.post('inscripciones/informacion-complementaria/universidad', this.info_universidad)
            .subscribe((res:any) => {
              const r = <any>res;
              if (r !== null && r.message != 'error') {
                this.eventChange.emit(true);
                this.snackBar.open(this.translate.instant('universidad_form.universidad_form_registrado'), '', { duration: 3000, panelClass: ['info-snackbar'] })

                this.clean = !this.clean;
              } else {
                this.snackBar.open(this.translate.instant('universidad_form.universidad_form_no_registrado'), '', { duration: 3000, panelClass: ['error-snackbar'] })
              }
            },
            (error: HttpErrorResponse) => {
              this.snackBar.open(this.translate.instant('universidad_form.universidad_form_no_registrado'), '', { duration: 3000, panelClass: ['error-snackbar'] })
            });
          }
      });
  }

  validarForm(event:any) {
    if (event.valid) {
      const formData = event.data.InfoUniversidad;
      const tercero = {
        Id: this.persiona_id  || 1, // se debe cambiar solo por persona id
      }
      const dataUniversidad = {
        InfoComplementariaTercero: [
          {
            // Medio por el que se entero de la universidad
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: formData.MedioEntero,
            Dato: JSON.stringify(formData.MedioEntero),
            Activo: true,
          },
          {
            // Se presento a la universidad por cuantas veces
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: formData.PresentoUniversidad,
            Dato: JSON.stringify(formData.PresentoUniversidad),
            Activo: true,
          },
          {
            // Tipo de cupo al que aspira
            Id: 0,
            TerceroId: tercero,
            InfoComplementariaId: formData.TipoInscripcion,
            Dato: JSON.stringify(formData.TipoInscripcion),
            Activo: true,
          },
        ],
      }
      this.createUniversidad(dataUniversidad);
      this.result.emit(event);
    }
  }
}
