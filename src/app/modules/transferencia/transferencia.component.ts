import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InfoPersona } from 'src/app/models/informacion/info_persona';
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
            console.log(res);
            resolve(res.Data);
          },
          (error: any) => {
            console.error(error);
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

        //todo: revisar este flujo
        if (inscripcion.EstadoSolicitud) {
          inscripcion.Estado = inscripcion.EstadoSolicitud
        } else {
          inscripcion.Estado = inscripcion.EstadoInscripcion
        }
        console.log(inscripcion.Estado)

        if (inscripcion.EstadoRecibo === 'Pendiente pago') {
          inscripcion.Opcion = {
            icon: 'fa fa-arrow-circle-right fa-2x',
            label: 'Pagar',
            class: "btn btn-primary",
            disabled: false
          }
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

        inscripcion.Descargar = {
          icon: 'fa fa-download fa-2x',
          label: 'Descargar',
          class: 'btn btn-primary',
          documento: ''
        }

        if (inscripcion.SolicitudFinalizada) {
          inscripcion.Descargar = {
            icon: 'fa fa-download fa-2x',
            label: 'Descargar',
            class: 'btn btn-primary',
            documento: inscripcion.VerRespuesta.DocRespuesta,
            disabled: false
          }
          inscripcion.Opcion.disabled = true;
        } else {
          inscripcion.Descargar.disabled = true;
        }

        dataInfo.push(inscripcion);
      }
    }
    console.log(dataInfo)
    this.dataSource = new MatTableDataSource(dataInfo);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  recuperarEstadoRecibos(id: number) {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.get('transferencia/estado-recibos/' + id).subscribe((response: any) => {
        console.log(response)
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
        (error: any) => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
          reject(false);
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
      this.parametrosService.get('periodo?query=Activo:true,CodigoAbreviacion:PA&sortby=Id&order=desc&limit=1')
        .subscribe(res => {
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
          (error: HttpErrorResponse) => {
            console.error(error);
            reject([]);
          });
    });
  }

  loadPeriodo() {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.get('transferencia/consultar-periodo').subscribe(
        (response: any) => {
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
        error => {
          console.error(error);
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          reject(error);
        },
      );
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
                if (opcion.Id == codigo.IdProyecto) {
                  aux.push(opcion)
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
      this.inscripcionMidService.get('transferencia/consultar-parametros/?id-calendario='+calendarioId+'&persona-id='+ this.uid).subscribe(
        (response: any) => {
          if (response.Success) {
            resolve(response);
          } else {
            if (response.Message == 'No se encuentran proyectos') {
              this.popUpManager.showErrorAlert(this.translate.instant('admision.error_no_proyecto'));
            } else {
              this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
            }
            reject();
          }
        },
        error => {
          this.popUpManager.showErrorToast(this.translate.instant('admision.error'));
          reject(error);
        },
      );
    });
  }

  validarForm(event: any) {
    if (event.valid) {
      this.recibo = true;
      this.formTransferencia.btn = '';
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

  generar_inscripcion() {
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


      let periodo = localStorage.getItem('IdPeriodo');
      //TODO: parametros
      
      this.calendarioMidService.get('calendario-proyecto/calendario/proyecto?id-nivel=' + this.dataTransferencia.TipoInscripcion!.NivelId + '&id-periodo=' + periodo).subscribe(
        (response: any) => {
          if (response !== null && response.Success == true) {
            this.inscripcionProjects = response.Data;  
            console.log(this.inscripcionProjects)          
            this.inscripcionProjects.forEach(proyecto => {
              if (proyecto.ProyectoId === this.dataTransferencia.ProyectoCurricular!.Id && proyecto.Evento != null) {
                inscripcion.FechaPago = moment(proyecto.Evento.FechaFinEvento, 'YYYY-MM-DD').format('DD/MM/YYYY');
                console.log(inscripcion.FechaPago)
                this.inscripcionMidService.post('inscripciones/nueva', inscripcion).subscribe(
                  (response: any) => {
                    if (response.Status == '200') {
                      this.listadoSolicitudes = true;

                      this.clean();

                      this.loadDataTercero(this.process);

                      this.popUpManager.showSuccessAlert(this.translate.instant('recibo_pago.generado'));
                    } else if (response.Status == '204') {
                      this.popUpManager.showErrorAlert(this.translate.instant('recibo_pago.recibo_duplicado'));
                    } else if (response.Status == '400') {
                      this.popUpManager.showErrorToast(this.translate.instant('recibo_pago.no_generado'));
                    }

                    const resEstado: any = this.actualizarEstadoInscripcion(inscripcion);
                    if (Object.keys(resEstado).length == 0) {
                      this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.cambio_estado_admitido_observaciones_error'));
                    } else {
                      this.popUpManager.showSuccessAlert(this.translate.instant('legalizacion_admision.cambio_estado_admitido_observaciones_ok'));
                    }


                  },
                  (error: HttpErrorResponse) => {
                    this.popUpManager.showErrorToast(this.translate.instant(`ERROR.${error.status}`));
                  },
                );
              }
            });
          }
        }
      );
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

  abrirPago(data: any) {
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

  descargarArchivo(data:any){
    this.nuxeo.get([{ 'Id': data.VerRespuesta.DocRespuesta }]).subscribe(
      (documentos) => {
        const assignConfig = new MatDialogConfig();
        assignConfig.width = '1300px';
        assignConfig.height = '800px';
        let aux = { ...documentos[0], observacion: data.VerRespuesta.Observacion, fecha: data.VerRespuesta.FechaEvaluacion, terceroResponsable: data.VerRespuesta.TerceroResponsable }
        assignConfig.data = { documento: aux, observando: true }
        const dialogo = this.dialog.open(DialogoDocumentosTransferenciasComponent, assignConfig);
      }
    );
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
