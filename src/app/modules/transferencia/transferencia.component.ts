import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InfoPersona } from 'src/app/models/informacion/info_persona';
import { ReciboPago } from 'src/app/models/inscripcion/recibo_pago';
import { TransferenciaInterna } from 'src/app/models/inscripcion/transferencia_interna';
import { Periodo } from 'src/app/models/periodo/periodo';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';

import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { environment } from 'src/environments/environment';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { CalendarioMidService } from 'src/app/services/sga_calendario_mid.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';
import { FORM_TRANSFERENCIA_INTERNA } from './forms-transferencia';
import { DialogoDocumentosTransferenciasComponent } from 'src/app/modules/components/dialogo-documentos-transferencias/dialogo-documentos-transferencias.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-transferencia',
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.scss']
})
export class TransferenciaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  formTransferencia: any = null;
  listadoSolicitudes: boolean = true;
  actions: boolean = true;
  recibo: boolean = false;
  settings: any = null;
  uid: any;
  sub: any;
  process: string = '';
  info_info_persona!: InfoPersona;
  recibo_pago: ReciboPago = new ReciboPago();
  inscripcionProjects!: any[];
  proyectosCurriculares!: any[];
  codigosEstudiante!: any[];
  parametros_pago: any;
  periodo!: Periodo;
  periodos: any[] = [];

  displayedColumns = ['recibo', 'concepto', 'programa', 'estadoInscripcion', 'fecha', 'estadoRecibo', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  dataTransferencia: TransferenciaInterna = {
    Periodo: null,
    CalendarioAcademico: null,
    TipoInscripcion: null,
    CodigoEstudiante: null,
    ProyectoCurricular: null,
  };
  recibo_generado: any;

  private dialogoPagadorService: any;

  constructor(
    private translate: TranslateService,
    private utilidades: UtilidadesService,
    private parametrosService: ParametrosService,
    private projectService: ProyectoAcademicoService,
    private nuxeo: NewNuxeoService,
    private dialog: MatDialog,
    private terceroMidService: TerceroMidService,
    private inscripcionMidService: InscripcionMidService,
    private calendarioMidService: CalendarioMidService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private router: Router,
    private _Activatedroute: ActivatedRoute
  ) {
    this.dialogoPagadorService = (window as any)['core-mf']?.DialogoPagadorService;
    this.formTransferencia = FORM_TRANSFERENCIA_INTERNA;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.construirForm();
    });
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.');
  }

  construirForm() {
    this.formTransferencia.btn = this.translate.instant('GLOBAL.guardar');
    this.utilidades.translateFields(this.formTransferencia, 'inscripcion.', 'inscripcion.');
    this.formTransferencia.campos.forEach((campo: any) => {
      if (campo.nombre === 'Periodo') {
        campo.valor = campo.opciones[0];
      }
    });
  }

  getIndexForm(nombre: String): number {
    for (let index = 0; index < this.formTransferencia.campos.length; index++) {
      const element = this.formTransferencia.campos[index];
      if (element.nombre === nombre) {
        return index
      }
    }
    return 0;
  }

  async ngOnInit() {
    this.parametros_pago = {
      recibo: '',
      REFERENCIA: '',
      NUM_DOC_IDEN: '',
      TIPO_DOC_IDEN: '',
    };
    await this.loadInfoPersona();

    this.dataSource = new MatTableDataSource()
    this.sub = this._Activatedroute.paramMap.subscribe(async (params: any) => {
      const { process } = params.params;
      this.actions = (this.process === 'my');
        await this.loadDataTercero(this.process).then(e => {
          Swal.fire({
            icon: 'warning',
            text: this.translate.instant('inscripcion.alerta_transferencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
        });
    });
  }

  public async loadInfoPersona() {
    this.uid = await this.userService.getPersonaId();
    if (this.uid !== undefined && this.uid !== 0 && this.uid.toString() !== '' && this.uid.toString() !== '0') {
      const persona: any = await this.recuperarInfoPersona(this.uid)
      const temp = <InfoPersona>persona;
      this.info_info_persona = temp;
      const files = [];
      
      // this.terceroMidService.get('personas/' + this.uid).subscribe((res: any) => {
      //   if (res !== null) {
      //     const temp = <InfoPersona>res.Data;
      //     this.info_info_persona = temp;
      //     const files = [];
      //   }
      // });
    } else {
      this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('GLOBAL.no_info_persona'));
    }
  }

  recuperarInfoPersona(idPersona: any) {
    return new Promise((resolve, reject) => {
      this.terceroMidService.get('personas/' + idPersona).subscribe(
          (res: any) => {
            // console.log(res);
            resolve(res.Data);
          },
          (error: any) => {
            // console.error(error);
            Swal.fire({
              icon: 'info',
              title: this.translate.instant('GLOBAL.info_persona'),
              text: this.translate.instant('GLOBAL.no_info_persona'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });
            reject([]);
          }
        );
    });
  }

  async loadDataTercero(process: any) {
    await this.cargarPeriodo();
    const estadoRecibo: any = await this.recuperarEstadoRecibos(this.uid);
    const inscripciones = <Array<any>>estadoRecibo;
    const dataInfo = <Array<any>>[];

    for (const inscripcion of inscripciones) {
      if (inscripcion.Programa > 0) {
        const proyecto: any = await this.recuperarProyectoAcademicoInstitucion(inscripcion.Programa);
        const auxRecibo = inscripcion.Recibo;
        const NumRecibo = auxRecibo.split('/', 1);
        inscripcion.Recibo = NumRecibo[0];
        inscripcion.FechaGeneracion = moment(inscripcion.FechaGeneracion, 'YYYY-MM-DD').format('DD/MM/YYYY');
        inscripcion.IdPrograma = inscripcion.Programa;
        inscripcion.Programa = proyecto.Nombre;
        inscripcion.Periodo = this.periodo.Id;
        inscripcion.AnioRecibo = auxRecibo;

        if (inscripcion.EstadoInscripcion) {
          inscripcion.Estado = inscripcion.EstadoInscripcion.Nombre;
        }
        // console.log("Inscripcion recibida:        --------");
        // console.log(inscripcion);

        inscripcion.Descargar = {
          icon: 'fa fa-download fa-2x',
          label: 'Descargar',
          class: 'btn btn-primary',
          documento: '',
          disabled: true
        }

        if (inscripcion.EstadoRecibo === 'Pendiente pago') {
          inscripcion.Opcion = {
            icon: 'fa fa-arrow-circle-right fa-2x',
            label: 'Pagar',
            class: "btn btn-primary",
            disabled: false
          }
          inscripcion.Descargar.disabled = false;

        } else if (inscripcion.EstadoRecibo === 'Pago') {
          inscripcion.Opcion = {
            icon: 'fa fa-pencil fa-2x',
            label: 'Inscribirme',
            class: "btn btn-primary",
            disabled: false
          }
        } else {
          inscripcion.Opcion = {
            icon: 'fa fa-pencil fa-2x',
            label: 'Inscribirme',
            class: "btn btn-primary",
            disabled: true
          }
        }

        if (inscripcion.EstadoInscripcion.Nombre === 'INSCRITO' || inscripcion.EstadoInscripcion.Nombre === 'ADMITIDO') {
          inscripcion.Descargar = {
            icon: 'fa fa-download fa-2x',
            label: 'Descargar',
            class: 'btn btn-primary',
            // documento: inscripcion.VerRespuesta.DocRespuesta,
            documento: '',
            disabled: true
          }
          inscripcion.Opcion.disabled = true;
        }

        dataInfo.push(inscripcion);
      }
    }
    // console.log(dataInfo)
    this.dataSource = new MatTableDataSource(dataInfo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  recuperarEstadoRecibos(id: number) {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.get('transferencia/estado-recibos/' + id).subscribe({
        next: (response: any) => {
        // console.log(response)
        if (response !== null && response.Status == '400') {
          this.popUpManager.showErrorToast(this.translate.instant('inscripcion.error'));
          reject(false);
        } else if ((response != null && response.Status == '404') || response.Data.length == 0) {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('inscripcion.no_inscripcion'));
          reject(false);
        } else {
          resolve(response.Data)
        }
      },
      error: (error: any) => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(false);
        }
      });
    });
  }

  recuperarProyectoAcademicoInstitucion(idProyecto: number) {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion/' + idProyecto).subscribe((response: any) => {
        resolve(response)
      },
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(false);
        });
    });
  }

  // async loadDataTercero(process: any) {
  //   await this.cargarPeriodo(); 

  //   this.inscripcionMidService.get('transferencia/estado-recibos/' + this.uid)
  //     .subscribe(response => {
  //       console.log(response)
  //       if (response !== null && response.Status == '400') {
  //         this.popUpManager.showErrorToast(this.translate.instant('inscripcion.error'));
  //       } else if ((response != null && response.Status == '404') || response.Data.length == 0) {
  //         this.popUpManager.showAlert(this.translate.instant('GLOBAL.info'), this.translate.instant('inscripcion.no_inscripcion'));
  //       } else {
  //         const inscripciones = <Array<any>>response.Data;
  //         const dataInfo = <Array<any>>[];
  //         inscripciones.forEach(element => {
  //           this.projectService.get('proyecto_academico_institucion/' + element.Programa).subscribe(
  //             res => {
  //               const auxRecibo = element.Recibo;
  //               const NumRecibo = auxRecibo.split('/', 1);
  //               element.Recibo = NumRecibo[0];
  //               element.FechaGeneracion = moment(element.FechaGeneracion, 'YYYY-MM-DD').format('DD/MM/YYYY');
  //               element.IdPrograma = element.Programa;
  //               element.Programa = res.Nombre;
  //               element.Periodo = this.periodo.Id;

  //               //todo: revisar este flujo
  //               if(element.EstadoSolicitud){
  //                 element.Estado = element.EstadoSolicitud
  //               }else{
  //                 element.Estado = element.EstadoInscripcion
  //               }
  //               console.log(element.Estado)

  //               if (element.EstadoRecibo === 'Pendiente pago') {
  //                 element.Opcion = {
  //                   icon: 'fa fa-arrow-circle-right fa-2x',
  //                   label: 'Pagar',
  //                   class: "btn btn-primary",
  //                   disabled: false
  //                 }
  //               } else if (element.EstadoRecibo === 'Pago') {
  //                 element.Opcion = {
  //                   icon: 'fa fa-pencil fa-2x',
  //                   label: 'Inscribirme',
  //                   class: "btn btn-primary",
  //                   disabled: false
  //                 }
  //               } else {
  //                 element.Opcion = {
  //                   icon: 'fa fa-pencil fa-2x',
  //                   label: 'Inscribirme',
  //                   class: "btn btn-primary",
  //                   disabled: true
  //                 }
  //               }
                
  //               element.Descargar = {
  //                 icon: 'fa fa-download fa-2x',
  //                 label: 'Descargar',
  //                 class: 'btn btn-primary',
  //                 documento: ''
  //               }
                
  //               if (element.SolicitudFinalizada) {
  //                 element.Descargar = {
  //                   icon: 'fa fa-download fa-2x',
  //                   label: 'Descargar',
  //                   class: 'btn btn-primary',
  //                   documento: element.VerRespuesta.DocRespuesta,
  //                   disabled: false
  //                 }
  //                 element.Opcion.disabled = true;
  //               } else {
  //                 element.Descargar.disabled = true;
  //               }

  //               dataInfo.push(element);
  //               this.dataSource = new MatTableDataSource(dataInfo)
  //               // this.dataSource.setSort([{ field: 'Id', direction: 'desc' }]);
  //             },
  //             error => {
  //               this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
  //             },
  //           );
  //         });
  //       }
  //     },
  //       (error: HttpErrorResponse) => {
  //         this.popUpManager.showErrorToast(this.translate.instant(`ERROR.${error.status}`));
  //       });
  // }

  descargarNormativa() {
    window.open('https://www.udistrital.edu.co/admisiones-pregrado', '_blank');
  }

  async nuevaSolicitud() {
    this.listadoSolicitudes = false;
    await this.loadPeriodo();
    this.construirForm();
  }

  cargarPeriodo() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1').subscribe({
        next: (res: any) => {
          const r = <any>res;
          if (res !== null && r.Status == '200') {
            this.periodo = <any>res['Data'][0];
            window.localStorage.setItem('IdPeriodo', String(this.periodo['Id']));
            const periodos = <any[]>res['Data'];
            periodos.forEach((element) => {
              this.periodos.push(element);
            });
            resolve(this.periodo);
          }
        },
        error:  (error: HttpErrorResponse) => {
            console.error(error);
            reject([]);
        }
      });
    });
  }

  loadPeriodo() {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.get('transferencia/consultar-periodo').subscribe({
        next: (response: any) => {
          if (response.Success) {
            this.formTransferencia.campos.forEach((campo: any) => {
              if (campo.etiqueta === 'select') {
                campo.opciones = response.Data[campo.nombre];
                if (campo.nombre === 'Periodo') {
                  campo.valor = campo.opciones[0];
                }
              }
            });
            resolve(response.Data)
          } else {
            Swal.fire({
              icon: 'warning',
              title: this.translate.instant('GLOBAL.info'),
              text: this.translate.instant('admision.error_calendario') + '. ' + this.translate.instant('admision.error_nueva_transferencia'),
              confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
            });

            this.clean();
            this.listadoSolicitudes = true;
            reject(false);
          }
          
        },
        error: error => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          reject(error);
        },
      });
    });
  }

  async seleccion(event: any) {
    this.recibo = false;
    this.formTransferencia.btn = this.translate.instant('GLOBAL.guardar');

    this.formTransferencia.campos.forEach((campo: any) => {
      (this.dataTransferencia as any)[campo.nombre] = campo.valor;
    });

    if (event.nombre === 'CalendarioAcademico' && !this.recibo && event.valor != null) {

      let parametros = await this.loadParams(this.dataTransferencia.CalendarioAcademico!.Id).catch(e => {
        return false;
      }) as any;

      if (parametros == false) {
        this.formTransferencia.campos.forEach((campo: any) => {
          if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
            campo.opciones = null;
            campo.ocultar = true;
          }

        });
      } else {
        this.codigosEstudiante = parametros["Data"]["CodigoEstudiante"];
        this.proyectosCurriculares = parametros["Data"]["ProyectoCurricular"];

        this.formTransferencia.campos.forEach((campo: any) => {

          if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
            campo.opciones = parametros["Data"][campo.nombre];
            campo.ocultar = false;
          }
        });
      }
    }

    if (event.nombre === 'TipoInscripcion' && !this.recibo && event.valor != null) {
      this.formTransferencia.campos.forEach((campo: any) => {

        if (event.valor.Nombre === 'Transferencia interna' || event.valor.Nombre === 'Reingreso') {
          Swal.fire({
            icon: 'warning',
            html: this.translate.instant('inscripcion.alerta_recibo_transferencia'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          })
        }

        if (campo.nombre === 'ProyectoCurricular') {
          if (event.valor.Nombre === 'Reingreso') {
            let aux: any[] = [];

            this.codigosEstudiante.forEach(codigo => {
              this.proyectosCurriculares.forEach(opcion => {
                if (opcion.Codigo == codigo.IdProyectoCondor) {
                  aux.push(opcion);
                }

              });
            });
            campo.valor = null;
            campo.opciones = aux;
          } else {
            campo.opciones = this.proyectosCurriculares;
          }
        }
      });
    }
  }

  loadParams(calendarioId: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.get('transferencia/consultar-parametros?id-calendario='+calendarioId+'&persona-id='+ this.uid).subscribe({
        next: (response: any) => {
          // console.log(response);
          if (response.Success) {
            resolve(response);
          } else {
            if (response.Message == 'No se encuentran proyectos') {
              this.popUpManager.showErrorAlert(this.translate.instant('admision.error_no_proyecto'));
            } else if (response.Status == 404) {
              this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_codigos_estudiante'));
            } else {
              this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
            }
            reject();
          }
        },
        error: (error: any) => {
          if (error.Message == 'No se encuentran proyectos') {
              this.popUpManager.showErrorAlert(this.translate.instant('admision.error_no_proyecto'));
            } else if (error.Status == 404) {
              this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.no_codigos_estudiante'));
            } else {
              this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
            }
          reject(error);
        },
      });
    });
  }

  validarForm(event: any) {
    if (event.valid) {
      this.recibo = true;
      this.formTransferencia.btn = '';
    }

  }

  recuperarCalendarioProyecto(idNivel: number, idPeriodo: number) {
    return new Promise( (resolve, reject) => {
      this.calendarioMidService.get('calendario-proyecto/calendario/proyecto?id-nivel=' + idNivel + '&id-periodo=' + idPeriodo ).subscribe({
        next: (response: any) => {
          const r = <any>response;
          if (response !== null && response !== '{}' && r.Type !== 'error' && r.length !== 0) {
            resolve(<Array<any>>response.Data);
          } else {
            this.popUpManager.showAlert(
              this.translate.instant('GLOBAL.info'),
              this.translate.instant('calendario.sin_proyecto_curricular')
            );
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
    } );
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

  async validarFechas(){
    const tiempoActual = await firstValueFrom(
      this.inscripcionMidService.get('time_bog')
    );
    const fechaActual = new Date(tiempoActual.Data.BOG);

    let rawProyecto = this.dataTransferencia.ProyectoCurricular?.Id;
    if (!rawProyecto) {
      console.error("ProyectoCurricular no está definido");
      return;
    }
    const proyecto = parseInt(rawProyecto.toString(), 10);
    if ( isNaN(proyecto) ){
      console.error("Fallo en obtención del proyecto: ", proyecto);
    }

    let periodo = this.periodo['Id'];
    const resCalendario:any = await this.recuperarCalendarioProyecto(this.dataTransferencia.TipoInscripcion!.NivelId, periodo);

    if (resCalendario === null || resCalendario.length === 0 || resCalendario === undefined) {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.info'),
        this.translate.instant('inscripcion.no_fechas_inscripcion')
      );
      return;
    }
    this.inscripcionProjects = resCalendario;

    const evento = this.inscripcionProjects
      .find( (p:any) => p.ProyectoId === proyecto )?.Evento
      ?.find( (ev:any) => !ev.Pago && ev.CodigoAbreviacion === "REIN" );
    const fechaFinInsc = evento
      ? new Date (evento.FechaFinEvento.replace('Z', '-05:00'))
      : undefined;
    if (fechaFinInsc) {
      fechaFinInsc.setHours(23, 59, 59, 999);
    }
    // console.log(fechaActual);
    // console.log(fechaFinInsc);

    if (fechaFinInsc && fechaActual <= fechaFinInsc) {
      this.generarRecibo();
    } else {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.info'),
        this.translate.instant('inscripcion.no_proyectos_disponibles')
      );
      return;
    }
  }

  generarRecibo() {
    this.popUpManager.showConfirmAlert(this.translate.instant('inscripcion.seguro_inscribirse')).then(
      async ok => {
        if (ok.value) {
          if (this.info_info_persona === undefined) {
            this.terceroMidService.get('personas/' + this.uid)
              .subscribe(async res => {
                if (res != null) {
                  const temp = <InfoPersona>res.Data;
                  this.info_info_persona = temp;
                  const files = [];
                  await this.generar_inscripcion();
                }
              },
                (error: HttpErrorResponse) => {
                  Swal.fire({
                    icon: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    footer: this.translate.instant('GLOBAL.cargar') + '-' +
                      this.translate.instant('GLOBAL.info_persona'),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
          } else {
            await this.generar_inscripcion();
          }
        }
      },
    );
  }

  async generar_inscripcion() {
      const inscripcion = {
        Id: parseInt(this.info_info_persona.NumeroIdentificacion, 10),
        Nombre: `${this.info_info_persona.PrimerNombre} ${this.info_info_persona.SegundoNombre}`,
        Apellido: `${this.info_info_persona.PrimerApellido} ${this.info_info_persona.SegundoApellido}`,
        Correo: JSON.parse(atob(localStorage.getItem('id_token')!.split('.')[1])).email,
        PersonaId: Number(this.uid),
        PeriodoId: this.dataTransferencia.Periodo!.Id,
        Nivel: this.dataTransferencia.TipoInscripcion!.NivelId,
        ProgramaAcademicoId: this.dataTransferencia.ProyectoCurricular!.Id,
        ProgramaAcademicoCodigo:   parseInt(this.dataTransferencia.ProyectoCurricular!.Codigo, 10),
        TipoInscripcionId: this.dataTransferencia.TipoInscripcion!.Id,
        Year: this.dataTransferencia.Periodo!.Year,
        Periodo: parseInt(this.dataTransferencia.Periodo!.Ciclo, 10),
        FechaPago: '',
      };

      const eventoPago = this.inscripcionProjects
        .find( (pr: any) => pr.ProyectoId === inscripcion.ProgramaAcademicoId )?.Evento
        ?.find((ev: any) => ev.Pago && ev.CodigoAbreviacion === 'REIN');

      if (eventoPago){
        inscripcion.FechaPago = moment(
          eventoPago.FechaFinEvento, 'YYYY-MM-DD'
        ).format('DD/MM/YYYY');
      } else {
        this.popUpManager.showAlert(
          this.translate.instant('GLOBAL.info'),
          this.translate.instant('inscripcion.no_fechas_pago')
        );
        return;
      }

      // console.log("Genera una nueva inscripción correcta");
      // console.log(inscripcion)

      const resInscripcion: any = await this.inscripcionNuevaPost(inscripcion);
      if (resInscripcion){
        this.listadoSolicitudes = true;
        this.clean();
        this.loadDataTercero(this.process);

        const resEstado: any = this.actualizarEstadoInscripcion(inscripcion);
        if (Object.keys(resEstado).length == 0) {
          this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.cambio_estado_admitido_observaciones_error'));
        } else {
          this.popUpManager.showSuccessAlert(this.translate.instant('legalizacion_admision.cambio_estado_admitido_observaciones_ok'));
        }
      }
    
  }

  inscripcionNuevaPost(body:any) {
    return new Promise( (resolve, reject) => {
      this.inscripcionMidService.post('inscripciones/nueva', body).subscribe({
        next: (response: any) => {
          if (response.Status == 200 && response.Success) {
            this.popUpManager.showSuccessAlert(
              this.translate.instant('recibo_pago.generado')
            );
            resolve(true);
          } else if (response.Status == 204) {
            this.popUpManager.showErrorAlert(
              this.translate.instant('recibo_pago.recibo_duplicado')
            );
            resolve(false);
          } else if (response.Status == 200 && !response.Success) {
            this.popUpManager.showErrorAlert(response.Message);
            reject(false); 
          } else if (response.Status == 400 ) {
            this.popUpManager.showErrorToast(
              this.translate.instant('recibo_pago.no_generado')
            );
            resolve(false);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant(`ERROR.${error.status}`));
        }
      });
    } );
  }

  clean() {
    this.dataTransferencia = {
      Periodo: null,
      CalendarioAcademico: null,
      TipoInscripcion: null,
      CodigoEstudiante: null,
      ProyectoCurricular: null,
    };
    this.formTransferencia.campos.forEach((campo: any) => {
      if (campo.nombre === 'ProyectoCurricular' || campo.nombre === 'TipoInscripcion') {
        campo.ocultar = true;
      }
      if (campo.nombre === 'CalendarioAcademico') {
        campo.valor = null;
      }
    });
  }

  async abrirPago(data: any) {

    await this.llenadoReciboPago(data);

    const datosFormulario = {
      accion: 'pagar',
      persona_id: this.info_info_persona.Id,
      info_recibo: this.recibo_pago,
      anioRecibo: data.AnioRecibo,
      tipo_usuario: 1,
      info_info_persona: this.info_info_persona
    }

    // console.log("Datos recibidos por boton pagar:");
    // console.log(datosFormulario);

    const result = await this.abrirDialogoPagador(datosFormulario);
    if (!result || !result.continuar) {
      return;
    }

    this.parametros_pago.NUM_DOC_IDEN = this.info_info_persona.NumeroIdentificacion;
    this.parametros_pago.REFERENCIA = data['Recibo'];
    this.parametros_pago.TIPO_DOC_IDEN = this.info_info_persona.TipoIdentificacion.CodigoAbreviacion;
    const url = new URLSearchParams(this.parametros_pago).toString();
    const ventanaPSE = window.open(environment.PSE_SERVICE + url, 'PagosPSE', 'width=600,height=800,resizable,scrollbars,status');
    ventanaPSE!.focus();
    const timer = window.setInterval(() => {
      if (ventanaPSE!.closed) {
        window.clearInterval(timer);
        this.loadDataTercero(this.process);
      }
    }, 5000);
  }

  async descargarArchivo(data:any){
    if (this.info_info_persona != null && data.Estado !== 'Vencido'){
      await this.llenadoReciboPago(data);

        const datosFormulario = {
          accion: 'descargar',
          persona_id: this.info_info_persona.Id,
          info_recibo: this.recibo_pago,
          anioRecibo: data.AnioRecibo,
          tipo_usuario: 1,
          info_info_persona: this.info_info_persona
        }

        // console.log("Datos recibidos por boton descargar:");
        // console.log(datosFormulario);

        const result = await this.abrirDialogoPagador(datosFormulario);
        if (!result || !result.continuar) {
          return;
        }

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

    // this.nuxeo.get([{ 'Id': data.VerRespuesta.DocRespuesta }]).subscribe(
    //   (documentos) => {
    //     const assignConfig = new MatDialogConfig();
    //     assignConfig.width = '1300px';
    //     assignConfig.height = '800px';
    //     let aux = { ...documentos[0], observacion: data.VerRespuesta.Observacion, fecha: data.VerRespuesta.FechaEvaluacion, terceroResponsable: data.VerRespuesta.TerceroResponsable }
    //     assignConfig.data = { documento: aux, observando: true }
    //     const dialogo = this.dialog.open(DialogoDocumentosTransferenciasComponent, assignConfig);
    //   }
    // );
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

  async llenadoReciboPago (data: any) {
    if (this.recibo_pago.Comprobante === data.Recibo && this.recibo_pago.ProyectoAspirante === data.Programa){
      // se trata del mismo recibo
      // console.log("Mismo recibo, no se hace nada");
      return;
    } else {
      // console.log("Diferente, se llenan datos en momeria");
      this.recibo_pago = new ReciboPago();
        this.recibo_pago.NombreDelAspirante = [
          this.info_info_persona.PrimerNombre,
          this.info_info_persona.SegundoNombre,
          this.info_info_persona.PrimerApellido,
          this.info_info_persona.SegundoApellido
        ].filter(Boolean).join(' ');
        this.recibo_pago.DocumentoDelAspirante =this.info_info_persona.NumeroIdentificacion;
        this.recibo_pago.Periodo = this.periodo.Nombre;
        this.recibo_pago.ProyectoAspirante = data.Programa;
        this.recibo_pago.Comprobante = data.Recibo;

        const responseCalendario: any = await this.recuperarCalendarioProyecto(
          data.Nivel, this.periodo.Id
        );

        const eventoPago = responseCalendario
        .find((pr: any) => pr.ProyectoId === data.IdPrograma)?.Evento
        ?.find((ev: any) => ev.Pago && ev.CodigoAbreviacion === 'REIN');

        if (eventoPago) {
          this.recibo_pago.Fecha_pago = moment(eventoPago.FechaFinEvento, 'YYYY-MM-DD')
            .format('DD/MM/YYYY');
        } else {
          this.popUpManager.showAlert(
            this.translate.instant('GLOBAL.info'),
            this.translate.instant('inscripcion.no_fechas_pago')
          );
          return;
        }


        const nivelMap: Record<number, string> = {
          1: '13',
          2: '12'
        };
        const parametro_nivel = nivelMap[data.Nivel];

        const parametro = await this.buscarParametrosPeriodo(parametro_nivel, this.periodo.Year);
        this.recibo_pago.Descripcion = parametro[0].ParametroId.Nombre + ' - ' + (data.Concepto).toUpperCase();
        const valor = JSON.parse(parametro[0].Valor);
        this.recibo_pago.ValorDerecho = valor.Costo;
        return;
    }
  }

  solicitar(data:any){
    if (data.EstadoRecibo == 'Pendiente pago') {
      this.abrirPago(data)
    } else {
      const idInscripcion = data['Id'];

      sessionStorage.setItem('IdInscripcion', data.Id)
      sessionStorage.setItem('ProgramaAcademico', data.Programa)
      sessionStorage.setItem('IdPeriodo', data.Periodo)
      sessionStorage.setItem('IdTipoInscripcion', data.IdTipoInscripcion)
      sessionStorage.setItem('ProgramaAcademicoId', data.IdPrograma)
      sessionStorage.setItem('NivelId', data.Nivel)

      this.router.navigate([`solicitud-transferencia/${idInscripcion}/${btoa(data)}`])
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
    inscripcionData.TerceroId = this.uid;
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.post('inscripciones/actualizar-inscripcion', inscripcionData)
        .subscribe((res: any) => {
          if (res !== null && res.Status != '400') {
            resolve(res.Data)
          } else {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            console.log(res.Message);
            reject([]);
          }
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }


}
