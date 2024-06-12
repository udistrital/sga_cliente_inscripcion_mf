import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { validateLang } from 'src/app/app.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
//import { ModalComponent } from './components/modal/modal.component';
//import multiMonthPlugin from '@fullcalendar/multimonth'
import { OikosService } from 'src/app/services/oikos.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ParametrosService } from 'src/app/services/parametros.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { SgaMidService } from 'src/app/services/sga_mid.service'; 
import { MatStepper } from '@angular/material/stepper';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { DialogoDocumentosComponent } from '../../components/dialogo-documentos/dialogo-documentos.component';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service'; 
import { MODALS, ROLES } from 'src/app/models/diccionario/diccionario';
import { LiquidacionMatriculaService } from 'src/app/services/liquidacion_matricula.service';
import { EventoService } from 'src/app/services/evento.service';
import { UserService } from 'src/app/services/users.service';

interface Proyecto {
  opcion: number;
  nombre: string;
}

@Component({
  selector: 'ngx-legalizacion-matricula',
  templateUrl: './legalizacion-matricula.component.html',
  styleUrls: ['./legalizacion-matricula.component.scss']
})
export class LegalizacionMatriculaComponent {
  formulario: boolean = false;

  firstFormGroup = this._formBuilder.group({
    validatorProyecto: ['', Validators.required],
    validatorPeriodo: ['', Validators.required],
    validatorAño: ['', Validators.required],
    validatorFacultad: ['', Validators.required],
    validatorCiclos: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = true;

  personaDataSource!: MatTableDataSource<any>;
  infoAspiranteDataSource!: MatTableDataSource<any>;
  infoSocioEcopersonalDataSource!: MatTableDataSource<any>;
  infoSocioEcoCosteaDataSource!: MatTableDataSource<any>;
  resumenGeneralDataSource!: MatTableDataSource<any>;
  
  personaColums: string [] = ['Orden', 'Credencial', 'Nombres', 'Apellidos', 'TipoDocumento', 'Documento', 'EstadoAdmision', 'EstadoRevision', 'Acciones'];
  infoPersonal1: string [] = ['TipoIdentificacion', 'NumeroIdentificacion', 'PrimerNombre', 'SegundoNombre', 'PrimerApellido', 'SegundoApellido'];
  infoPersonal2: string [] = ['FechaNacimiento', 'Numero', 'Correo', 'Genero'];
  infoSocioEconomicacolumns: string [] = ['Orden', 'Concepto', 'Informacion', 'Soporte', 'Estado'];

  aspirante: any
  estaAutorizado: boolean = false;
  puedeAprobar: boolean = false;
  puedeRechazar: boolean = true;
  puedePedirMod: boolean = false;
  cicloActual: any;

  proyectosCurriculares!: any[]
  periodosAnio!: any[]
  anios!: any[]
  periodos!: any[]
  facultades!: any[]

  infoLegalizacionAspirantes: any = {}
  estadoDocumentosAspirantes: any = {}
  aspiranteActualId: any;
  inscritosData: any[] = [];
  inscripciones: any[] = [];
  docsDescargados: any[] = [];

  constructor(
    private _formBuilder: FormBuilder, 
    private dialog: MatDialog, 
    private translate: TranslateService,
    private oikosService: OikosService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private sgamidService: SgaMidService,
    private inscripcionMidService: InscripcionMidService,
    private newNuxeoService: NewNuxeoService,
    private utilidades: UtilidadesService,
    private documentoService: DocumentoService,
    private autenticationService: ImplicitAutenticationService,
    private usuarioService: UserService,
    private eventosService: EventoService,
    private liquidacionMatriculaService: LiquidacionMatriculaService,
    private popUpManager: PopUpManager
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  async ngOnInit() {
    const rolesRequeridos = [ROLES.ADMIN_SGA, ROLES.ASISTENTE_ADMISIONES]
    this.usuarioService.esAutorizado(rolesRequeridos).then((esAutorizado: any) => {
      if (esAutorizado) this.estaAutorizado = true;
    }).catch( (error: any) => {
      console.error('Error al validar autorización', error)
    });
    validateLang(this.translate);
    await this.cargarSelects();
  }

  get proyecto() {
    const proyecto: Proyecto = {opcion: 1, nombre: 'Ing de sistemas'};
    return proyecto;
  }

  async cargarSelects() {
    await this.cargarAnios();
    await this.cargarPeriodos();
    await this.cargarFacultades();
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          this.facultades = res;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.facultades_error'));
            reject([]);
          });
    });
  }

  cargarAnios() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro?limit=0&query=TipoParametroId%3A93')
        .subscribe((res: any) => {
          this.anios = res.Data;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.anio_error'));
            reject([]);
          });
    });
  }

  cargarPeriodos() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/?query=CodigoAbreviacion:PA&sortby=Id&order=desc&limit=0')
        .subscribe((res: any) => {
          this.periodos = res.Data;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.periodo_error'));
            reject([]);
          });
    });
  }

  onFacultadChange(event: any) {
    const facultad = this.facultades.find((facultad: any) => facultad.Id === event.value);
    this.proyectosCurriculares = facultad.Opciones;
  }

  onAnioChange(event: any) {
    const anio = this.anios.find((item: any) => item.Id === event.value);
    const periodosAnio = this.periodos.filter((item: any) => item.Nombre.startsWith(anio.Nombre));
    this.periodosAnio = periodosAnio;
  }

  async generarBusqueda(stepper: MatStepper) {
    const proyecto = this.firstFormGroup.get('validatorProyecto')?.value;
    const periodo = this.firstFormGroup.get('validatorPeriodo')?.value;
    const tipoCiclos = this.firstFormGroup.get('validatorCiclos')?.value;

    this.inscritosData = [];
    this.inscripciones = [];
    let ordenCount = 0 ;

    await this.recuperarCiclo(periodo);
    this.inscripciones = await this.buscarInscripciones(stepper, proyecto, periodo, tipoCiclos)
    for (const inscripcion of this.inscripciones) {
      const persona: any = await this.consultarTercero(inscripcion.PersonaId);
      if (Array.isArray(persona) && persona.length === 0) {
        continue;
      }
      const proyecto = this.proyectosCurriculares.find((item: any) => item.Id === inscripcion.ProgramaAcademicoId)
      const infoLegalizacion = await this.getLegalizacionMatricula(persona.Id)
      if (infoLegalizacion == "No existe legalizacion") {
        continue;
      }
      ordenCount += 1;
      this.infoLegalizacionAspirantes[persona.Id] = infoLegalizacion
      const estados = await this.retornasEstadosDocumentos(infoLegalizacion);
      this.estadoDocumentosAspirantes[persona.Id] = estados;
      const estadoRevision = this.revisarEstadosRevision(estados)

      const personaData = {
        "personaId": persona.Id,
        "orden": ordenCount,
        "credencial": 123,
        "primer_nombre": persona.PrimerNombre,
        "segundo_nombre": persona.SegundoNombre,
        "primer_apellido": persona.PrimerApellido,
        "segundo_apellido": persona.SegundoApellido,
        "nombres": persona.PrimerNombre + " " + persona.SegundoNombre,
        "apellidos": persona.PrimerApellido + " " + persona.SegundoApellido,
        "tipo_documento": persona.TipoIdentificacion.Nombre,
        "documento": persona.NumeroIdentificacion,
        "estado_admision": inscripcion.EstadoInscripcionId.Nombre == "ADMITIDO" || inscripcion.EstadoInscripcionId.Nombre === "ADMITIDO CON OBSERVACIÓN" ? 'admision.estado_admitido' : 'admision.estado_admitido_legalizado',
        "estado_revision": estadoRevision,
        "proyecto_admitido": proyecto.Nombre,
        "fecha_nacimiento": this.formatearFecha(persona.FechaNacimiento),
        "numero_celular": persona.Telefono,
        "correo": persona.UsuarioWSO2,
        "genero": persona.Genero.Nombre
      }
      this.inscritosData.push(personaData);
    }
    if (this.inscritosData.length == 0) {
      this.popUpManager.showAlert(this.translate.instant('legalizacion_admision.titulo_sin_data_tabla'), this.translate.instant('legalizacion_admision.sin_data_tabla'));
    }

    this.personaDataSource = new MatTableDataSource<any>(this.inscritosData);
  }

  async recuperarCiclo(periodo: any) {
    const fechaActual = new Date();
    const responseCalendario: any = await this.buscarCalendariosPregradoPorPeriodo(periodo);
    const calendarioId = responseCalendario.Id;
    const responseEvento: any = await this.buscarEventosCiclosPorCalendario(calendarioId);
    const tipoEventoId = responseEvento.Id
    const responseCiclos: any = await this.buscarCiclosPorCalendario(tipoEventoId);

    for (const ciclo of responseCiclos) {
      const fechaInicio = new Date(ciclo.FechaInicio);
      const fechaFin = new Date(ciclo.FechaFin);
      if (fechaActual >= fechaInicio && fechaActual <= fechaFin) {
        this.cicloActual = ciclo.Descripcion
      }
    } 
  }

  buscarCalendariosPregradoPorPeriodo(periodo: any) {
    return new Promise((resolve, reject) => {
      this.eventosService.get('calendario?query=PeriodoId:' + periodo + ',Nivel:1,Activo:true&sortby=Id&order=asc')
        .subscribe((res: any) => {
          resolve(res[0]);
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  buscarEventosCiclosPorCalendario(calendario: any) {
    return new Promise((resolve, reject) => {
      this.eventosService.get('tipo_evento?query=CalendarioID.Id:' + calendario + ',CodigoAbreviacion:CIAD,Activo:true&sortby=Id&order=asc')
        .subscribe((res: any) => {
          resolve(res[0]);
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  buscarCiclosPorCalendario(tipoEvento: any) {
    return new Promise((resolve, reject) => {
      this.eventosService.get('calendario_evento?query=TipoEventoId.Id:' + tipoEvento + ',Activo:true&sortby=Id&order=asc')
        .subscribe((res: any) => {
          resolve(res);
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  formatearFecha(fechaString: any) {
    const date = new Date(fechaString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear().toString();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  }

  revisarEstadosRevision(estados: any) {
    let estado = "legalizacion_admision.estado_sin_revisar"
    let puedeAprobar = true;
    let hayEstado = false;
    for (const key in estados) {
      if (estados[key] != 1) {
        if (estados[key] == 2 && puedeAprobar) {
          estado = "GLOBAL.estado_aprobado"
          hayEstado = true
        } else if (estados[key] == 3) {
          estado = "legalizacion_admision.estado_revisado_observaciones"
          puedeAprobar = false
          hayEstado = true
          break;
        }
      } else if (puedeAprobar) {
        puedeAprobar = false
        if (hayEstado) {
          estado = "legalizacion_admision.estado_revisado_observaciones"
        }
      }
    }
    return estado;
  }

  async retornasEstadosDocumentos(infoLegalizacion: any) {
    const keys = Object.keys(infoLegalizacion)
    const filteredList = keys.filter(item => item.startsWith('soporte'));
    let estados: any = {}

    for (const key in infoLegalizacion) {
      if (filteredList.includes(key)) {
        const value = JSON.parse(infoLegalizacion[key]);
        for (const key in value) {
          const documentoId = value[key][0];
          const documento: any = await this.cargarDocumento(documentoId);
          const estadoDoc = this.utilidades.getEvaluacionDocumento(documento.Metadatos);
          estados[key] = this.retornarEstadoObservacion(estadoDoc.estadoObservacion);
        }
      }
    }
    return estados;
  }

  retornarEstadoObservacion(estado: any) {
    if (estado === "Por definir" || estado === "To be defined") {
      return 1
    } else if (estado === "No aprobado" || estado === "Not approved") {
      return 3
    } else {
      return 2
    }
  }

  retornarEstadoPorId(id: any) {
    if (id == 1) {
      return 'legalizacion_admision.estado_sin_revisar'
    } else if (id == 2) {
      return 'GLOBAL.estado_aprobado'
    } else {
      return 'GLOBAL.estado_no_aprobado'
    }
  }

  async buscarInscripciones(stepper: MatStepper, proyecto: any, periodo: any, tipoCiclo: any) {
    const admitidos: any = await this.buscarInscripcionesAdmitidos(proyecto, periodo, tipoCiclo)
    const admitidosLeg: any = await this.buscarInscripcionesAdmitidosLegalizados(proyecto, periodo, tipoCiclo)
    const admitidosObs: any = await this.buscarInscripcionesAdmitidosObservacion(proyecto, periodo, tipoCiclo)
    const inscripciones = Object.keys(admitidosLeg[0]).length === 0 ? Object.keys(admitidosObs[0]).length === 0 ? admitidos : admitidos.concat(admitidosObs) : Object.keys(admitidosObs[0]).length === 0 ? admitidos.concat(admitidosLeg) : admitidos.concat(admitidosLeg, admitidosObs)
    stepper.next();
    return inscripciones
  }
  
  buscarInscripcionesAdmitidos(proyecto: any, periodo: any, tipoCiclo: any) {
    let query = ''
    if (tipoCiclo == 1) {
      query = 'inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',Opcion:' + this.cicloActual + ',EstadoInscripcionId.Id:2,Activo:true,TipoInscripcionId.Id:13&sortby=Id&order=asc'
    } else {
      query = 'inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:2,Activo:true,TipoInscripcionId.Id:13&sortby=Id&order=asc'
    }
    return new Promise((resolve, reject) => {
      this.inscripcionService.get(query)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  buscarInscripcionesAdmitidosLegalizados(proyecto: any, periodo: any, tipoCiclo: any) {
    let query = ''
    if (tipoCiclo == 1) {
      query = 'inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',Opcion:' + this.cicloActual + ',EstadoInscripcionId.Id:8,Activo:true,TipoInscripcionId.Id:13&sortby=Id&order=asc'
    } else {
      query = 'inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:8,Activo:true,TipoInscripcionId.Id:13&sortby=Id&order=asc'
    }
    return new Promise((resolve, reject) => {
      this.inscripcionService.get(query)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  buscarInscripcionesAdmitidosObservacion(proyecto: any, periodo: any, tipoCiclo: any) {
    let query = ''
    if (tipoCiclo == 1) {
      query = 'inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',Opcion:' + this.cicloActual + ',EstadoInscripcionId.Id:10,Activo:true,TipoInscripcionId.Id:13&sortby=Id&order=asc'
    } else {
      query = 'inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:10,Activo:true,TipoInscripcionId.Id:13&sortby=Id&order=asc'
    }
    return new Promise((resolve, reject) => {
      this.inscripcionService.get(query)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  actualizarEstadoInscripcion(inscripcionData: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.put('inscripcion', inscripcionData)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  async consultarTercero(personaId: any): Promise<any | []> {
    try {
      const response = await this.sgamidService.get('persona/consultar_persona/' + personaId).toPromise();
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async openModal(data: any) {
    const idDoc = this.recuperarIdDocumento(data.DocumentoSoporte);
    const nombreSoporteDoc = this.recuperarNombreSoporteDoc(data.DocumentoSoporte)
    const documento: any = await this.cargarDocumento(idDoc);
    let estadoDoc = this.utilidades.getEvaluacionDocumento(documento.Metadatos);
    const dataDoc: any = await this.abrirDocumento(idDoc);
    const documentoDialog = {
      "tabName": documento.Descripcion,
      "nombreDocumento": data.Concepto,
      "DocumentoId": documento.Id,
      "aprobado": estadoDoc.aprobado,
      "estadoObservacion": estadoDoc.estadoObservacion,
      "observacion": estadoDoc.observacion,
      "carpeta": documento.Descripcion,
      "nombreSoporte": nombreSoporteDoc,
      "Documento": dataDoc ? dataDoc : {}
    }
    const assignConfig = new MatDialogConfig();
    assignConfig.width = '1600px';
    assignConfig.height = '750px';
    assignConfig.data = { documento: documentoDialog }
    const dialogo = this.dialog.open(DialogoDocumentosComponent, assignConfig);

    dialogo.afterClosed().subscribe(async(result) => {
      let metadatosDocumento = JSON.parse(documento.Metadatos)
      metadatosDocumento["aprobado"] = result["metadata"]["aprobado"];
      metadatosDocumento["observacion"] = result["metadata"]["observacion"];
      if (result["metadata"]["aprobado"]) {
        metadatosDocumento["estadoObservacion"] = "Aprobado";
      } else {
        metadatosDocumento["estadoObservacion"] = "No aprobado";
      }
      documento.Metadatos = JSON.stringify(metadatosDocumento);
      const res = await this.actualizarDocumento(documento);
      
      this.estadoDocumentosAspirantes[this.aspiranteActualId][result["nombreSoporte"]] = this.retornarEstadoObservacion(metadatosDocumento["estadoObservacion"])
      console.log(documento, this.estadoDocumentosAspirantes)
      this.cambioEstadoRevisionAspirante();
      this.calcularEstadoBotones();

      this.cargarInfoTablasSocioeconomicas(this.infoLegalizacionAspirantes[this.aspiranteActualId]);
    });
  }

  cambioEstadoRevisionAspirante() {
    const aspirante = this.inscritosData.find((inscrito: any) => inscrito.personaId === this.aspiranteActualId);
    let estadoRev
    let cambioEstado = false;

    if (aspirante.estado_revision == 'legalizacion_admision.estado_sin_revisar' && !this.verificarEstadosSinRevisar()) {
      cambioEstado = true;
      estadoRev = 'legalizacion_admision.estado_revisado_observaciones'
    }

    if (cambioEstado) {
      for (const inscrito of this.inscritosData) {
        if (inscrito.personaId == this.aspiranteActualId) {
          inscrito.estado_revision = estadoRev;
        }
      }
      this.personaDataSource = new MatTableDataSource<any>(this.inscritosData);
    }
  }

  async generarLiquidacionmatricula() {
    const periodo = this.firstFormGroup.get('validatorPeriodo')?.value;
    const programaAcademico = this.firstFormGroup.get('validatorProyecto')?.value;
    // Esta variable nivel apunta al id de nivel de formación de pregrado en la tabla nivel formacion del esquema proyecto acemico, siempre es uno porque esta pantalla solo es de pregrado
    const nivel = 1
    const liquidacionBody = {
      "tercero_id": this.aspiranteActualId,
      "periodo_id": periodo,
      "programa_academico_id": programaAcademico,
      "tipo_programa_id": nivel,
      "activo": true,
    }
    const resLiquidacion: any = await this.crearLiquidacionMatricula(liquidacionBody)
    if (Object.keys(resLiquidacion).length == 0) {
      return false;
    }

    const liquidacionId = resLiquidacion._id
    const resDetalle = await this.generarDetallesLiquidacionMatricula(liquidacionId);
    if (!resDetalle) {
      return false;
    }

    return true;
  }

  crearLiquidacionMatricula(liquidacionBody: any) {
    return new Promise((resolve, reject) => {
      this.liquidacionMatriculaService.post('liquidacion', liquidacionBody)
        .subscribe((res: any) => {
          if (res.Success) {
            resolve(res.Data)
          } else {
            resolve({})
          }
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.liquidacion_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  crearDetalleLiquidacionMatricula(detalleBody: any) {
    return new Promise((resolve, reject) => {
      this.liquidacionMatriculaService.post('liquidacion-detalle', detalleBody)
        .subscribe((res: any) => {
          if (res.Success) {
            resolve(res.Data)
          } else {
            resolve({})
          }
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.liquidacion_detalle_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  async generarDetallesLiquidacionMatricula(liquidacionId: any) {
    const conceptosLiquidacion: any = await this.recuperarConceptosLiquidacion();
    const valores: any = this.calcularValoresConceptos();
    for (const key in valores) {
      const concepto = conceptosLiquidacion.find((item: any) => item.Id == key);

      const detalleLiquidacionBody = {
        "tipo_concepto_id": concepto.ParametroPadreId.Id,
        "concepto_id": key,
        "valor": valores[key],
        "activo": true,
        "liquidacionbid": liquidacionId,
      }

      const res: any = await this.crearDetalleLiquidacionMatricula(detalleLiquidacionBody);
      if (Object.keys(res).length == 0) {
        return false;
      }
    }
    return true;
  }

  recuperarConceptosLiquidacion() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro?limit=0&query=TipoParametroId%3A95')
        .subscribe((res: any) => {
          resolve(res.Data)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.conceptos_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  calcularValoresConceptos() {
    const infoLegalizacion = this.infoLegalizacionAspirantes[this.aspiranteActualId]
    const valorA1 = this.calcularValorEstratoA1(infoLegalizacion["estratoCostea"])
    const valorA2 = this.calcularValorMatriculaSecundariaA2(infoLegalizacion["pensionSM11"])
    const valorA3 = this.calcularValorIngresosA3(infoLegalizacion["ingresosSMCostea"])
    const valorB1 = this.calcularValorLugarResidenciaB1(infoLegalizacion["estratoCostea"])
    const valorB2 = this.calcularValorLugarResB2(infoLegalizacion["ubicacionResidenciaCostea"])
    const valorB3 = this.calcularValorNucleoFamB3(infoLegalizacion["nucleoFamiliar"])
    const valorB4 = this.calcularValorSituacionLabB4(infoLegalizacion["situacionLaboral"])
    // Este valor se setea en 0 porque aún faltan datos para ser calculado y ese proceso se hace en una instancia más adelantada del proceso para admitir definitivamente a un estudiante
    const valorPBM = 0
    
    // Se relaciona el id que se encuentra en la base de datos de cada concepto con el valor para ese concepto del aspirante
    const valores = {
      "5986": valorA1,
      "5987": valorA2,
      "5988": valorA3,
      "5989": valorB2,
      "5990": valorB3,
      "5991": valorB4,
      "5992": valorB1,
      "5993": valorPBM,
    }
    console.log("INFO DE LEGALIZACION:", infoLegalizacion, valores);

    return valores;
  }

  calcularValorEstratoA1(estratoId: any) {
    let valor = 0;
    console.log("DATA CALCULO VALORES A1:", estratoId)

    switch (estratoId) {
      case "1":
        valor = 0;
        break;
      case "2":
        valor = 25;
        break;
      case "3":
        valor = 45;
        break;
      case "4":
        valor = 75;
        break;
      case "5":
        valor = 95;
        break;
      case "6":
        valor = 100;
        break;
      case "No Informa":
        valor = 100;
        break;
      case "Área rural":
        valor = 20;
        break;
      case "Ciudad menor de cien mil habitantes":
        valor = 45;
        break;
      case "Ciudad mayor de cien mil habitantes":
        valor = 70;
        break;
      default:
        valor = 100;
    }
    return valor
  }

  calcularValorMatriculaSecundariaA2(valorSM: any) {
    let valor = 0;
    console.log("DATA CALCULO VALORES A2:", valorSM)

    switch (true) {
      case valorSM <= 0.004:
        valor = 15
        break;
      case valorSM <= 0.08:
        valor = 20
        break;
      case valorSM <= 0.12:
        valor = 30
        break;
      case valorSM <= 0.16:
        valor = 40
        break;
      case valorSM <= 0.2:
        valor = 50
        break;
      case valorSM <= 0.3:
        valor = 60
        break;
      case valorSM <= 0.4:
        valor = 70
        break;
      case valorSM <= 0.5:
        valor = 80
        break;
      case valorSM <= 0.6:
        valor = 90
        break;
      case valorSM <= 0.7:
        valor = 100
        break;
      case valorSM > 0.7:
        valor = 100
        break;
      default:
        valor = 100
    }
    return valor
  }

  calcularValorIngresosA3(valorSM: any) {
    let valor = 0;
    console.log("DATA CALCULO VALORES A3:", valorSM)

    switch (true) {
      case valorSM <= 2:
        valor = 15
        break;
      case valorSM <= 2.5:
        valor = 25
        break;
      case valorSM <= 3:
        valor = 30
        break;
      case valorSM <= 4:
        valor = 35
        break;
      case valorSM <= 5:
        valor = 40
        break;
      case valorSM <= 5.5:
        valor = 45
        break;
      case valorSM <= 6:
        valor = 50
        break;
      case valorSM <= 6.5:
        valor = 55
        break;
      case valorSM <= 7:
        valor = 60
        break;
      case valorSM <= 7.5:
        valor = 70
        break;
      case valorSM <= 8:
        valor = 75
        break;
      case valorSM <= 9.5:
        valor = 80
        break;
      case valorSM <= 11:
        valor = 85
        break;
      case valorSM <= 14:
        valor = 90
        break;
      case valorSM <= 18:
        valor = 95
        break;
      case valorSM > 18:
        valor = 100
        break;
      default:
        valor = 100
    }

    return valor;
  }

  calcularValorLugarResidenciaB1(lugar: any) {
    let valor = 0;
    console.log("DATA CALCULO VALORES B1:", lugar)

    switch (lugar) {
      case "1":
        valor = 0.6;
        break;
      case "2":
        valor = 0.6;
        break;
      case "3":
        valor = 0.9;
        break;
      case "4":
        valor = 0.9;
        break;
      case "5":
        valor = 1;
        break;
      case "6":
        valor = 1;
        break;
      case "No Informa":
        valor = 1;
        break;
      case "Área rural":
        valor = 0.6;
        break;
      case "Ciudad menor de cien mil habitantes":
        valor = 0.9;
        break;
      case "Ciudad mayor de cien mil habitantes":
        valor = 1;
        break;
      default:
        valor = 1;
    }
    return valor
  }

  calcularValorLugarResB2(lugar: any) {
    let valor = 0;
    console.log("DATA CALCULO VALORES B2:", lugar)

    switch (lugar) {
      case "Fuera del perimetro urbano":
        valor = 0.9;
        break;
      case "Dentro del perimetro urbano":
        valor = 1;
        break;
      default:
        valor = 1;
    }

    return valor;
  }

  calcularValorNucleoFamB3(nucleo: any) {
    let valor = 0;
    console.log("DATA CALCULO VALORES B3:", nucleo)

    switch (nucleo) {
      case "Vive solo":
        valor = 0.85;
        break;
      case "Es casado":
        valor = 0.85;
        break;
      case "Otro":
        valor = 1;
        break;
      default:
        valor = 1;
    }

    return valor;
  }

  calcularValorSituacionLabB4(situacion: any) {
    let valor = 0;
    console.log("DATA CALCULO VALORES B4:", situacion)

    switch (situacion) {
      case "Empleado":
        valor = 0.9;
        break;
      case "Desempleado":
        valor = 1;
        break;
      default:
        valor = 1;
    }

    return valor;
  }

  verificarEstadosSinRevisar() {
    let todosSinRevisar = true
    for (const key in this.estadoDocumentosAspirantes[this.aspiranteActualId]) {
      if (this.estadoDocumentosAspirantes[this.aspiranteActualId][key] != 1) {
        todosSinRevisar = false;
        break;
      }
    }
    return todosSinRevisar
  }

  verificarEstadosAprobados() {
    let todosAprobados = true
    for (const key in this.estadoDocumentosAspirantes[this.aspiranteActualId]) {
      if (this.estadoDocumentosAspirantes[this.aspiranteActualId][key] != 2) {
        todosAprobados = false;
        break;
      }
    }
    return todosAprobados
  }

  cargarDocumento(documentoId:any) {
    return new Promise((resolve, reject) => {
      this.documentoService.get('documento/' + documentoId)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.documento_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  actualizarDocumento(documento:any) {
    return new Promise((resolve, reject) => {
      this.documentoService.put('documento', documento)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.actualizar_documento_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  abrirDocumento(documentoId: any) {
    return new Promise((resolve, reject) => {
      this.newNuxeoService.getByIdLocal(documentoId)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            console.error(error);
            this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
            reject([]);
          });
    });
  }

  recuperarIdDocumento(objeto: any) {
    const dataString: string = objeto;
    const data2 = JSON.parse(dataString);
    const keys = Object.keys(data2)
    const id = data2[keys[0]][0]
    return id
  }

  recuperarNombreSoporteDoc(objeto: any) {
    const dataString: string = objeto;
    const data2 = JSON.parse(dataString);
    const keys = Object.keys(data2)
    return keys[0]
  }

  calcularEstadoBotones() {
    if (this.verificarEstadosAprobados()) {
      this.puedeAprobar = true; 
    } else if (!this.verificarEstadosSinRevisar()) {
      this.puedePedirMod = true;
    }
  }

  editar = async (data: any) => {
    this.aspirante = data;
    console.log(this.aspirante);
    this.aspiranteActualId = this.aspirante.personaId;
    this.infoAspiranteDataSource = new MatTableDataSource<any>([this.aspirante]);
    const infoLegalizacion = this.infoLegalizacionAspirantes[this.aspiranteActualId]
    this.cargarInfoTablasSocioeconomicas(infoLegalizacion);
    if (!this.docsDescargados.includes(this.aspiranteActualId)) {
      this.docsDescargados.push(this.aspiranteActualId)
      this.descargarArchivos(infoLegalizacion);
    }
    this.calcularEstadoBotones();
    this.formulario = true;
  }

  descargarArchivos(infoLegalizacion: any) { 
    let idList: any[] = [];
    const keys = Object.keys(infoLegalizacion)
    const filteredList = keys.filter(item => item.startsWith('soporte'));

    for (const key in infoLegalizacion) {
      if (filteredList.includes(key)) {
        const docId = this.recuperarIdDocumento(infoLegalizacion[key]);
        idList.push(docId);
      }
    }

    const limitQuery = idList.length;
    let idsForQuery = "";
    idList.forEach((f, i) => {
      idsForQuery += f;
      if (i < limitQuery - 1) idsForQuery += '|';
    });

    this.newNuxeoService.getManyFiles('?query=Id__in:' + idsForQuery + '&limit=' + limitQuery)
      .subscribe((res: any) => {
      }, (error: any) => {
        console.error(error);
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
      })
  }

  async getLegalizacionMatricula(personaId: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.get('legalizacion/informacion-legalizacion/' + personaId)
        .subscribe((res: any) => {
          resolve(res.Data);
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(
              this.translate.instant('legalizacion_admision.legalizacion_error')
            );
          });
    });
  }

  async cargarInfoTablasSocioeconomicas(infoLegalizacion: any) {
    const estados = this.estadoDocumentosAspirantes[this.aspiranteActualId];

    const infoSocioEcoPersonal: any[] = [
      {Orden: 1, Concepto: 'GLOBAL.direccion_residencia', Informacion: infoLegalizacion.direccionResidencia, Estado: '', Soporte: false},
      {Orden: 2, Concepto: 'legalizacion_admision.colegio_graduado', Informacion: infoLegalizacion.colegioGraduado, Estado: this.retornarEstadoPorId(estados["diplomaBachiller"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soporteColegio},
      {Orden: 3, Concepto: 'legalizacion_admision.pension_mesual_11', Informacion: infoLegalizacion.pensionGrado11, Estado: this.retornarEstadoPorId(estados["soportePension"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soportePensionGrado11},
      {Orden: 4, Concepto: 'legalizacion_admision.nucleo_familiar', Informacion: infoLegalizacion.nucleoFamiliar, Estado: this.retornarEstadoPorId(estados["soporteNucleo"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soporteNucleoFamiliar},
      {Orden: 5, Concepto: 'legalizacion_admision.situacion_laboral', Informacion: infoLegalizacion.situacionLaboral, Estado: estados["soporteSituacionLaboral"] ? this.retornarEstadoPorId(estados["soporteSituacionLaboral"]) : "", Soporte: estados["soporteSituacionLaboral"] ? true : false, DocumentoSoporte: infoLegalizacion.soporteSituacionLaboral},
    ];
    this.infoSocioEcopersonalDataSource = new MatTableDataSource<any>(infoSocioEcoPersonal);

    const infoSocioEcoCosteo: any[] = [
      {Orden: 1, Concepto: 'GLOBAL.direccion_residencia', Informacion: infoLegalizacion.direccionCostea, Estado: this.retornarEstadoPorId(estados["soporteEstrato"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soporteEstratoCostea},
      {Orden: 2, Concepto: 'legalizacion_admision.ingresos_anio_anterior', Informacion: infoLegalizacion.ingresosCostea, Estado: this.retornarEstadoPorId(estados["soporteIngresos"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soporteIngresosCostea},
    ];
    this.infoSocioEcoCosteaDataSource = new MatTableDataSource<any>(infoSocioEcoCosteo);

    const resumenGeneral: any[] = [
      {Orden: 1, Concepto: 'legalizacion_admision.soporte_general', Informacion: 'legalizacion_admision.sin_informacion', Estado: this.retornarEstadoPorId(estados["documentosGeneral"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soporteGeneral},
    ];
    this.resumenGeneralDataSource = new MatTableDataSource<any>(resumenGeneral);
  }

  async aprobarAspirante() {
    this.popUpManager.showPopUpGeneric(
      this.translate.instant('legalizacion_admision.titulo_aprobacion_aspirante'),
      this.translate.instant('legalizacion_admision.aprobacion_aspirante'),
      MODALS.INFO,
      true).then(
        async (action) => {
          if (action.value) {
            for (const inscrito of this.inscritosData) {
              if (inscrito.personaId == this.aspiranteActualId) {
                inscrito.estado_revision = 'GLOBAL.estado_aprobado';
                inscrito.estado_admision = 'admision.estado_admitido_legalizado';
                const inscripcion = this.inscripciones.find((item: any) => item.PersonaId === this.aspiranteActualId);
                // Cambio de estado de la inscripción a admitido legalizado
                inscripcion.EstadoInscripcionId.Id = 8;
                const resEstado: any = await this.actualizarEstadoInscripcion(inscripcion);
                const resLiquidacion = await this.generarLiquidacionmatricula()
                if (Object.keys(resEstado).length == 0 || !resLiquidacion) {
                  this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.cambio_estado_legalizado_error'));
                } else {
                  this.popUpManager.showSuccessAlert(this.translate.instant('legalizacion_admision.cambio_estado_legalizado_ok'));
                }
                console.log("INFO AL ACTUALIZAR ESTADO GENERAL:", resEstado, resLiquidacion);
              }
            }
            this.personaDataSource = new MatTableDataSource<any>(this.inscritosData);
          }
        });
  }

  async rechazarAspirante() {
    this.popUpManager.showPopUpGeneric(
      this.translate.instant('legalizacion_admision.titulo_rechazo_aspirante'),
      this.translate.instant('legalizacion_admision.rechazo_aspirante'),
      MODALS.INFO,
      true).then(
        async (action) => {
          if (action.value) {
            const inscripcion = this.inscripciones.find((item: any) => item.PersonaId === this.aspiranteActualId);
            // Cambio de estado de la inscripción a no admitido
            inscripcion.EstadoInscripcionId.Id = 4;
            const resEstado: any = await this.actualizarEstadoInscripcion(inscripcion);
            if (Object.keys(resEstado).length == 0) {
              this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.cambio_estado_no_admitido_error'));
            } else {
              this.popUpManager.showSuccessAlert(this.translate.instant('legalizacion_admision.cambio_estado_no_admitido_ok'));
            }
            this.personaDataSource = new MatTableDataSource<any>(this.inscritosData);
          }
        });
  }

  async solicitarcambiosAspirante() {
    this.popUpManager.showPopUpGeneric(
      this.translate.instant('legalizacion_admision.titulo_modificaciones_aspirante'),
      this.translate.instant('legalizacion_admision.modificaciones_aspirante'),
      MODALS.INFO,
      true).then(
        async (action) => {
          if (action.value) {
            const inscripcion = this.inscripciones.find((item: any) => item.PersonaId === this.aspiranteActualId);
            // Cambio de estado de la inscripción a admitido con observaciones
            inscripcion.EstadoInscripcionId.Id = 10;
            const resEstado: any = await this.actualizarEstadoInscripcion(inscripcion);
            if (Object.keys(resEstado).length == 0) {
              this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.cambio_estado_admitido_observaciones_error'));
            } else {
              this.popUpManager.showSuccessAlert(this.translate.instant('legalizacion_admision.cambio_estado_admitido_observaciones_ok'));
            }
            this.personaDataSource = new MatTableDataSource<any>(this.inscritosData);
          }
        });
  }

  cerrar = () => {
    this.formulario = false;
  }
}