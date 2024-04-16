import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Lugar } from 'src/app/models/informacion/lugar';
import { ListService } from 'src/app/services/list.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { IAppState } from 'src/app/utils/reducers/app.state';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { FORM_ICFES } from './form-icfes';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CalendarioMidService } from 'src/app/services/sga_calendario_mid.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';

@Component({
  selector: 'ngx-crud-icfes',
  templateUrl: './crud-icfes.component.html',
  styleUrls: ['./crud-icfes.component.scss']
})
export class CrudIcfesComponent implements OnInit {
  info_formacion_academica_id!: number;
  info_persona_id!: number;
  persiona_id!: number;
  denied_acces: boolean = false;



  @Input('info_persona_id')
  set inscripcion(info_persona_id: number) {
    this.info_persona_id = info_persona_id;
    this.loadInfoFormacionAcademica();
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  info_icfes: any;
  formIcfes: any;
  temp: any;
  clean!: boolean;
  paisSeleccionado: any;
  percentage!: number;
  ciudadSeleccionada: any;
  tipoSeleccionado: any;
  tipocolegio!: Number;
  datosPost: any;
  id_inscripcion!: Number;
  departamentoSeleccionado: any;
  datosGet: any;

  constructor(
    private translate: TranslateService,
    private ubicacionesService: UbicacionService,
    private terceroService: TercerosService,
    private inscripcionMidService: InscripcionMidService,
    private store: Store<IAppState>,
    private listService: ListService,
    private snackBar: MatSnackBar) {
    this.formIcfes = FORM_ICFES;
    this.construirForm();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.loadLists();
    this.listService.findTipoICFES();
    this.listService.findLocalidadesBogota();
    this.listService.findTipoColegio();
    this.listService.findSemestresSinEstudiar();
    this.construirForm();
  }

  construirForm() {
    // this.formIcfes.titulo = this.translate.instant('GLOBAL.formacion_academica');
    this.formIcfes.btn = this.translate.instant('GLOBAL.guardar');
    this.formIcfes.btnLimpiar = this.translate.instant('GLOBAL.limpiar');
    for (let i = 0; i < this.formIcfes.campos.length; i++) {
      this.formIcfes.campos[i].label = this.translate.instant('GLOBAL.' + this.formIcfes.campos[i].label_i18n);
      this.formIcfes.campos[i].placeholder = this.translate.instant('GLOBAL.placeholder_' +
        this.formIcfes.campos[i].label_i18n);
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  ngOnInit() {

  }

  setPercentage(event:any) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  getSeleccion(event:any) {
    if (event.nombre === 'PaisResidencia') {
      this.paisSeleccionado = event.valor;
      this.loadOptionsDepartamentoResidencia();
      this.formIcfes.campos[this.getIndexForm('DepartamentoResidencia')].valor = null;
      this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].valor = null;
      this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].opciones = null;

      this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = true;
      this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = true;
      this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = true;
      this.formIcfes.campos[this.getIndexForm('NombreColegio')].valor = null;
      this.formIcfes.campos[this.getIndexForm('DireccionColegio')].valor = null;

    } else if (event.nombre === 'DepartamentoResidencia') {
      this.departamentoSeleccionado = event.valor;
      this.loadOptionsCiudadResidencia();
      this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].valor = null;

      this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = true;
      this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = true;
      this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = true;
      this.formIcfes.campos[this.getIndexForm('NombreColegio')].valor = null;
      this.formIcfes.campos[this.getIndexForm('DireccionColegio')].valor = null;

      if (this.paisSeleccionado.Nombre.toString().toLowerCase() === 'colombia' &&
        (event.valor.Nombre.toString().toLowerCase() === 'cundinamarca' || event.valor.Nombre.toString().toLowerCase() === 'cundinamarca')) {

        this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = true;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = true;
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].valor = null;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].valor = null;
        this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].entrelazado = true;

      } if (this.paisSeleccionado.Nombre.toString().toLowerCase() === 'colombia' &&
        (event.valor.Nombre.toString().toLowerCase() !== 'cundinamarca' || event.valor.Nombre.toString().toLowerCase() !== 'cundinamarca')) {
        this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].entrelazado = true;
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;

        this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
      }
    } else if (event.nombre === 'CiudadResidencia') {
      this.ciudadSeleccionada = event.valor;

      if (this.paisSeleccionado.Nombre.toString().toLowerCase() === 'colombia' &&
        (event.valor.Nombre.toString().toLowerCase() === 'bogotá' || event.valor.Nombre.toString().toLowerCase() === 'bogota')) {
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;

        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = true;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = true;

        this.construirForm();

      } else if (this.paisSeleccionado.Nombre.toString().toLowerCase() === 'colombia' &&
        (this.paisSeleccionado.Nombre.toString().toLowerCase() !== 'bogotá' || this.paisSeleccionado.Nombre.toString().toLowerCase() !== 'bogota')) {
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;
        this.construirForm();

      } else {
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;
        this.construirForm();
      }

    } else if (event.nombre === 'Tipo') {
      this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
      this.tipoSeleccionado = event.valor;
      if (String(this.tipoSeleccionado['Id']).toLowerCase() === 'oficial' &&
        (String(this.departamentoSeleccionado.Nombre).toLowerCase() === 'bogotá' || String(this.departamentoSeleccionado.Nombre).toLowerCase() === 'bogota')) {
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.construirForm();
        this.loadOptionscolegiooficial();
      } else if (String(this.tipoSeleccionado.Id).toLowerCase() === 'privado' &&
        (String(this.departamentoSeleccionado.Nombre).toLowerCase() === 'bogotá' || String(this.departamentoSeleccionado.Nombre).toLowerCase() === 'bogota')) {
        this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
        this.construirForm();
        this.loadOptionscolegioprivado();
      } else if (String(this.tipoSeleccionado['Id']).toLowerCase() === 'oficial') {
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = false;
        this.tipocolegio = 7;
      } else if (String(this.tipoSeleccionado['Id']).toLowerCase() === 'privado') {
        this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = false;
        this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = false;
        this.tipocolegio = 12;
      }
    }
  }

  loadOptionscolegiooficial(): void {
    let consultaColegio: Array<any> = [];
    const colegiosoficiales: Array<any> = [];
    this.terceroService.get('tercero_tipo_tercero/?query=TipoTerceroId.Id:7' + ',TerceroId.Activo:true&limit=0')
      .subscribe(res => {
        if (res !== null) {
          consultaColegio = <Array<any>>res;
          for (let i = 0; i < consultaColegio.length; i++) {
            colegiosoficiales.push(consultaColegio[i].TerceroId);
          }
        }
        this.formIcfes.campos[this.getIndexForm('Colegio')].opciones = colegiosoficiales;
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.informacion_contacto') + '|' +
              this.translate.instant('GLOBAL.departamento_residencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  loadOptionscolegioprivado(): void {
    let consultaColegio: Array<any> = [];
    const colegiosprivado: Array<any> = [];
    this.terceroService.get('tercero_tipo_tercero/?query=TipoTerceroId.Id:12' + ',TerceroId.Activo:true&limit=0')
      .subscribe(res => {
        if (res !== null) {
          consultaColegio = <Array<any>>res;
          for (let i = 0; i < consultaColegio.length; i++) {
            colegiosprivado.push(consultaColegio[i].TerceroId);
          }
        }
        this.formIcfes.campos[this.getIndexForm('Colegio')].opciones = colegiosprivado;
      },
        (error: HttpErrorResponse) => {
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.informacion_contacto') + '|' +
              this.translate.instant('GLOBAL.departamento_residencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
  }

  loadOptionsDepartamentoResidencia(): void {
    let consultaHijos: Array<any> = [];
    const departamentoResidencia: Array<any> = [];
    if (this.paisSeleccionado) {
      this.ubicacionesService.get('relacion_lugares?query=LugarPadreId__Id:' + this.paisSeleccionado.Id +
        ',LugarHijoId__Activo:true&limit=0&order=asc&sortby=LugarHijoId__Nombre').subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              departamentoResidencia.push(consultaHijos[i].LugarHijoId);
            }
          }
          this.formIcfes.campos[this.getIndexForm('DepartamentoResidencia')].opciones = departamentoResidencia;
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.informacion_contacto') + '|' +
                this.translate.instant('GLOBAL.departamento_residencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  loadOptionsCiudadResidencia(): void {
    let consultaHijos: Array<any> = [];
    const ciudadResidencia: Array<any> = [];
    if (this.departamentoSeleccionado) {
      this.ubicacionesService.get('relacion_lugares/?query=LugarPadreId__Id:' + this.departamentoSeleccionado.Id + ',LugarHijoId__Activo:true&limit=0&order=asc&sortby=LugarHijoId__Nombre')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              ciudadResidencia.push(consultaHijos[i].LugarHijoId);
            }
          }
          this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].opciones = ciudadResidencia;
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.informacion_contacto') + '|' +
                this.translate.instant('GLOBAL.ciudad_residencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  loadOptionsLocalidadResidencia(): void {
    let consultaHijos: Array<any> = [];
    const localidadResidencia: Array<any> = [];
    if (this.departamentoSeleccionado) {
      this.ubicacionesService.get('relacion_lugares/?query=LugarPadreId.Id:' + this.ciudadSeleccionada.Id + ',LugarHijoId.Activo:true&limit=0')
        .subscribe(res => {
          if (res !== null) {
            consultaHijos = <Array<Lugar>>res;
            for (let i = 0; i < consultaHijos.length; i++) {
              localidadResidencia.push(consultaHijos[i].LugarHijo);
            }
          }
          this.formIcfes.campos[this.getIndexForm('LocalidadResidencia')].opciones = localidadResidencia;
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.informacion_contacto') + '|' +
                this.translate.instant('GLOBAL.localidad_residencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    }
  }

  public loadInfoFormacionAcademica(): void {
    if (this.info_persona_id !== undefined && this.info_persona_id !== 0 &&
      this.info_persona_id.toString() !== '') {
      this.denied_acces = false;

      this.inscripcionMidService.get('personas/'+ this.info_persona_id+ '/formacion-pregrado')
        .subscribe(res => {
          if (res.success) {
            this.datosGet = <any>res.data;
            this.formIcfes.campos[this.getIndexForm('TipoIcfes')].valor = res['data']['TipoIcfes']
            this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfes')].valor = res['data']['NúmeroRegistroIcfes']
            this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfesConfirmar')].valor = res['data']['NúmeroRegistroIcfes']
            if (res['data']['Valido'] === true) {
              this.formIcfes.campos[this.getIndexForm('Valido')].valor = { 'Id': 'Si' }
            } else if (res['data']['Valido'] === false) {
              this.formIcfes.campos[this.getIndexForm('Valido')].valor = { 'Id': 'No' }
            } else {
              this.formIcfes.campos[this.getIndexForm('Valido')].valor = 0
            }
            this.formIcfes.campos[this.getIndexForm('numeroSemestres')].valor = res['data']['numeroSemestres']['InfoComplementariaId']
            this.formIcfes.campos[this.getIndexForm('PaisResidencia')].valor = res['data']['Lugar']['PAIS']
            this.paisSeleccionado = res['data']['Lugar']['PAIS'];
            this.loadOptionsDepartamentoResidencia();

            this.formIcfes.campos[this.getIndexForm('DepartamentoResidencia')].valor = res['data']['Lugar']['DEPARTAMENTO']
            this.departamentoSeleccionado = res['data']['Lugar']['DEPARTAMENTO'];
            this.loadOptionsCiudadResidencia();

            this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].valor = res['data']['Lugar']['CIUDAD']
            this.ciudadSeleccionada = res['data']['Lugar']['CIUDAD'];

            if (String(this.departamentoSeleccionado.Nombre).toLowerCase() === 'bogotá' ||
              String(this.departamentoSeleccionado.Nombre).toLowerCase() === 'bogota') {
              this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = false;
              this.formIcfes.campos[this.getIndexForm('Colegio')].valor = res['data']['Colegio']
            } else {
              this.formIcfes.campos[this.getIndexForm('NombreColegio')].ocultar = false;
              this.formIcfes.campos[this.getIndexForm('NombreColegio')].valor = res['data']['Colegio']['NombreCompleto']

              this.formIcfes.campos[this.getIndexForm('DireccionColegio')].ocultar = false;
              this.formIcfes.campos[this.getIndexForm('DireccionColegio')].valor = res['data']['DireccionColegio']
            }

            if (res['data']['TipoColegio'] === 7) {
              this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
              this.formIcfes.campos[this.getIndexForm('Tipo')].valor = { 'Id': 'Oficial' }
            } else if (res['data']['TipoColegio'] === 12) {
              this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = false;
              this.formIcfes.campos[this.getIndexForm('Tipo')].valor = { 'Id': 'Privado' }
            } else {
              this.formIcfes.campos[this.getIndexForm('Tipo')].ocultar = true;
              this.formIcfes.campos[this.getIndexForm('Tipo')].valor = 0;
              this.formIcfes.campos[this.getIndexForm('Colegio')].ocultar = true;
              this.formIcfes.campos[this.getIndexForm('Colegio')].valor = 0;
            }
          }
        },
          (error: HttpErrorResponse) => {
            Swal.fire({
              icon: 'error',
              title: error.status + '',
              text: this.translate.instant('ERROR.' + error.status),
              footer: this.translate.instant('GLOBAL.cargar') + '-' +
                this.translate.instant('GLOBAL.formacion_academica'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
          });
    } else {
      this.clean = !this.clean;
      this.denied_acces = false; // no muestra el formulario a menos que se le pase un id del ente info_caracteristica_id
    }
  }

  createIcfesColegio(infoIcfes: any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.registrar'),
      text: this.translate.instant('icfes_colegio.seguro_continuar_registrar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete: any) => {
        if (willDelete.value) {
          this.info_icfes = <any>infoIcfes;
          this.inscripcionMidService.post('inscripciones/pruebas-de-estado/informacion/saber-once', this.info_icfes)
            .subscribe(res => {
              const r = <any>res;
              if (r !== null && r.message != 'error') {
                this.eventChange.emit(true);
                this.snackBar.open(this.translate.instant('icfes_colegio.icfes_colegio_registrado'), '', { duration: 3000, panelClass: ['success-snackbar'] }) 
                this.clean = !this.clean;
              } else {
                this.snackBar.open(this.translate.instant('icfes_colegio.icfes_colegio_no_registrado'), '', { duration: 3000, panelClass: ['error-snackbar'] })
              }
            },
              (error: HttpErrorResponse) => {
                this.snackBar.open(this.translate.instant('icfes_colegio.icfes_colegio_no_registrado'), '', { duration: 3000, panelClass: ['error-snackbar'] })
              });
        }
      });
  }

  createColegioeIcfesColegio() {
    this.persiona_id = Number(this.info_persona_id);
    const opt: any = {
      title: this.translate.instant('GLOBAL.crear'),
      text: this.translate.instant('GLOBAL.crear') + '?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete: any) => {
        if (willDelete.value) {
          this.id_inscripcion = Number(sessionStorage.getItem('IdInscripcion'));
          const inscripcion = {
            Id: this.id_inscripcion, // se debe cambiar solo por inscripcion
          }
          this.datosPost = {
            'Tercero': {
              'TerceroId': {
                'Id': this.persiona_id,
              },
            },
            'InscripcionPregrado': {
              Id: 0,
              InscripcionId: inscripcion,
              TipoIcfesId: this.formIcfes.campos[this.getIndexForm('TipoIcfes')].valor,
              CodigoIcfes: this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfes')].valor,
              TipoDocumentoIcfes: 1,
              NumeroIdentificacionIcfes: 1,
              AnoIcfes: Number(this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfes')].valor.substr(0, 4)),
              Activo: true,
              Valido: (this.formIcfes.campos[this.getIndexForm('Valido')].valor.Id === 'Si') ? true : false,
            },
            'InfoComplementariaTercero': {
              // Semestres sin estudiar
              'Id': 0,
              'TerceroId': {
                'Id': this.persiona_id,
              },
              InfoComplementariaId: this.formIcfes.campos[this.getIndexForm('numeroSemestres')].valor,
              Dato: JSON.stringify(this.formIcfes.campos[this.getIndexForm('numeroSemestres')].valor.Nombre),
              Activo: true,
            },
            'TerceroColegio': {
              'NombreCompleto': String(this.formIcfes.campos[this.getIndexForm('NombreColegio')].valor),
              'TipoContribuyenteId': {
                'Id': 2,
              },
              'Activo': false,
            },
            'TipoColegio': {
              'TerceroId': {
                'Id': this.persiona_id,
              },
              'TipoTerceroId': {
                'Id': this.tipocolegio,
              },
              'Activo': true,
            },
            'DireccionColegio': {
              'InfoComplementariaId': {
                'Id': 54,
              },


              'Dato': JSON.stringify({ "DIRECCIÓN": this.formIcfes.campos[this.getIndexForm('DireccionColegio')].valor }),
              'Activo': true,
            },
            'UbicacionColegio': {
              'InfoComplementariaId': {
                'Id': 89,
              },
              'Dato': JSON.stringify(this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].valor.Id),
              'Activo': true,
            },
          };

          this.inscripcionMidService.post('inscripciones/pruebas-de-estado/informacion/saber-once-nuevo', this.datosPost)
            .subscribe(res => {
              const r = <any>res;
              if (r !== null && r.message != 'error') {
                this.eventChange.emit(true);
                  this.snackBar.open(this.translate.instant('icfes_colegio.icfes_colegio_registrado'), '', { duration: 3000, panelClass: ['info-snackbar'] })

                this.clean = !this.clean;
              } else {
                this.snackBar.open(this.translate.instant('icfes_colegio.icfes_colegio_no_registrado'), '', { duration: 3000, panelClass: ['error-snackbar'] })
              }
            },
              (error: HttpErrorResponse) => {
                this.snackBar.open(this.translate.instant('icfes_colegio.icfes_colegio_no_registrado'), '', { duration: 3000, panelClass: ['error-snackbar'] })
              });
        }
      });
  }

  validarForm(event:any) {
    if (String(this.departamentoSeleccionado.Nombre).toLowerCase() === 'bogotá' ||
      String(this.departamentoSeleccionado.Nombre).toLowerCase() === 'bogota') {
      this.persiona_id = Number(this.info_persona_id);
      this.id_inscripcion = Number(sessionStorage.getItem('IdInscripcion'));
      const inscripcion = {
        Id: this.id_inscripcion, // se debe cambiar solo por inscripcion
      }
      const dataIcfesColegio = {
        'Tercero': {
          'TerceroId': {
            'Id': this.persiona_id,
          },
        },
        InscripcionPregrado: {
          Id: 0,
          InscripcionId: inscripcion,
          TipoIcfesId: this.formIcfes.campos[this.getIndexForm('TipoIcfes')].valor,
          CodigoIcfes: this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfes')].valor,
          TipoDocumentoIcfes: 1,
          NumeroIdentificacionIcfes: 1,
          AnoIcfes: Number(this.formIcfes.campos[this.getIndexForm('NúmeroRegistroIcfes')].valor.substr(0, 4)),
          Activo: true,
          Valido: (this.formIcfes.campos[this.getIndexForm('Valido')].valor.Id === 'Si') ? true : false,
        },
        InfoComplementariaTercero: [

          {
            // Semestres sin estudiar
            'Id': 0,
            'TerceroId': {
              'Id': this.persiona_id,
            },
            InfoComplementariaId: this.formIcfes.campos[this.getIndexForm('numeroSemestres')].valor,
            Dato: JSON.stringify(this.formIcfes.campos[this.getIndexForm('numeroSemestres')].valor.Nombre),
            Activo: true,
          },
        ],
        dataColegio: this.formIcfes.campos[this.getIndexForm('Colegio')].valor,
        pais: this.formIcfes.campos[this.getIndexForm('PaisResidencia')].valor,
        departameto: this.formIcfes.campos[this.getIndexForm('DepartamentoResidencia')].valor,
        ciudad: this.formIcfes.campos[this.getIndexForm('CiudadResidencia')].valor,
      }

      this.createIcfesColegio(dataIcfesColegio);
      this.result.emit(event);
    } else {
      this.createColegioeIcfesColegio();
    }
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formIcfes.campos.length; index++) {
      const element = this.formIcfes.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  public loadLists() {
    this.store.select((state) => state).subscribe(
      (list) => {
        this.formIcfes.campos[this.getIndexForm('PaisResidencia')].opciones = list.listPais[0];
        this.formIcfes.campos[this.getIndexForm('LocalidadColegio')].opciones = list.listLocalidadesBogota[0];
        this.formIcfes.campos[this.getIndexForm('numeroSemestres')].opciones = list.listSemestresSinEstudiar[0];
        this.formIcfes.campos[this.getIndexForm('TipoIcfes')].opciones = list.listICFES[0];
      },
    );
  }

}
