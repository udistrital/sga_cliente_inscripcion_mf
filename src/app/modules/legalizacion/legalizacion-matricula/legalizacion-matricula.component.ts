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
import { ROLES } from 'src/app/models/diccionario/diccionario';

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
    private popUpManager: PopUpManager
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  async ngOnInit() {
    this.autenticationService.getRole().then(
      (rol: any) => {
        const r1 = rol.find((role: string) => (role == ROLES.ADMIN_SGA));
        const r2 = rol.find((role: string) => (role == ROLES.ASISTENTE_ADMISIONES));
        if (r1 || r2) {
          this.estaAutorizado = true;
        }
      }
    );
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.facultades_error'));
            console.log(error);
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.anio_error'));
            console.log(error);
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.periodo_error'));
            console.log(error);
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

    this.inscritosData = [];
    this.inscripciones = [];
    let ordenCount = 0 ;

    this.inscripciones = await this.buscarInscripciones(stepper, proyecto, periodo)

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
        "estado_admision": inscripcion.EstadoInscripcionId.Nombre == "ADMITIDO" ? 'admision.estado_admitido' : 'admision.estado_admitido_legalizado',
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
      this.popUpManager.showAlert(this.translate.instant('legalizacion_matricula.titulo_sin_data_tabla'), this.translate.instant('legalizacion_matricula.sin_data_tabla'));
    }

    this.personaDataSource = new MatTableDataSource<any>(this.inscritosData);
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
    let estado = "legalizacion_matricula.estado_sin_revisar"
    let puedeAprobar = true;
    let hayEstado = false;
    for (const key in estados) {
      if (estados[key] != 1) {
        if (estados[key] == 2 && puedeAprobar) {
          estado = "GLOBAL.estado_aprobado"
          hayEstado = true
        } else if (estados[key] == 3) {
          estado = "legalizacion_matricula.estado_revisado_observaciones"
          puedeAprobar = false
          hayEstado = true
          break;
        }
      } else if (puedeAprobar) {
        puedeAprobar = false
        if (hayEstado) {
          estado = "legalizacion_matricula.estado_revisado_observaciones"
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
      return 'legalizacion_matricula.estado_sin_revisar'
    } else if (id == 2) {
      return 'GLOBAL.estado_aprobado'
    } else {
      return 'GLOBAL.estado_no_aprobado'
    }
  }

  async buscarInscripciones(stepper: MatStepper, proyecto: any, periodo: any) {
    const admitidos: any = await this.buscarInscripcionesAdmitidos(proyecto, periodo)
    const admitidosLeg: any = await this.buscarInscripcionesAdmitidosLegalizados(proyecto, periodo)
    const inscripciones = Object.keys(admitidosLeg[0]).length === 0 ? admitidos : admitidos.concat(admitidosLeg)
    stepper.next();
    return inscripciones
  }
  
  buscarInscripcionesAdmitidos(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:2&sortby=Id&order=asc')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  buscarInscripcionesAdmitidosLegalizados(proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:8&sortby=Id&order=asc')
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.inscripciones_error'));
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.inscripciones_error'));
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
      console.log(error);
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
      await this.cambioEstadoRevisionAspirante();

      this.cargarInfoTablasSocioeconomicas(this.infoLegalizacionAspirantes[this.aspiranteActualId]);
    });
  }

  async cambioEstadoRevisionAspirante() {
    const aspirante = this.inscritosData.find((inscrito: any) => inscrito.personaId === this.aspiranteActualId);
    let estadoRev
    let cambioEstado = false;

    if (aspirante.estado_revision == 'legalizacion_matricula.estado_sin_revisar' && !this.verificarEstadosSinRevisar()) {
      cambioEstado = true;
      estadoRev = 'legalizacion_matricula.estado_revisado_observaciones'
    } else if (aspirante.estado_revision == 'legalizacion_matricula.estado_revisado_observaciones' && this.verificarEstadosAprobados()) {
      cambioEstado = true;
      estadoRev = 'GLOBAL.estado_aprobado'
    }

    if (cambioEstado) {
      for (const inscrito of this.inscritosData) {
        if (inscrito.personaId == this.aspiranteActualId) {
          inscrito.estado_revision = estadoRev;
          if (estadoRev == 'GLOBAL.estado_aprobado') {
            inscrito.estado_admision = 'admision.estado_admitido_legalizado';
            const inscripcion = this.inscripciones.find((item: any) => item.PersonaId === this.aspiranteActualId);
            inscripcion.EstadoInscripcionId.Id = 8;
            const res = await this.actualizarEstadoInscripcion(inscripcion);
          }
        }
      }
      this.personaDataSource = new MatTableDataSource<any>(this.inscritosData);
    }
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.documento_error'));
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.actualizar_documento_error'));
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
            console.log(error);
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

  editar = async (data: any) => {
    this.aspirante = data;
    this.aspiranteActualId = this.aspirante.personaId;
    this.infoAspiranteDataSource = new MatTableDataSource<any>([this.aspirante]);
    const infoLegalizacion = this.infoLegalizacionAspirantes[this.aspiranteActualId]
    this.cargarInfoTablasSocioeconomicas(infoLegalizacion);
    if (!this.docsDescargados.includes(this.aspiranteActualId)) {
      this.docsDescargados.push(this.aspiranteActualId)
      this.descargarArchivos(infoLegalizacion);
    }
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
        console.log(res);
      }, (error: any) => {
        console.log(error);
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
      })
  }

  async getLegalizacionMatricula(personaId: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.get('legalizacion/informacion-legalizacion/' + personaId)
        .subscribe((res: any) => {
          resolve(res.data);
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(
              this.translate.instant('legalizacion_matricula.legalizacion_error')
            );
          });
    });
  }

  async cargarInfoTablasSocioeconomicas(infoLegalizacion: any) {
    const estados = this.estadoDocumentosAspirantes[this.aspiranteActualId];

    const infoSocioEcoPersonal: any[] = [
      {Orden: 1, Concepto: 'GLOBAL.direccion_residencia', Informacion: infoLegalizacion.direccionResidencia, Estado: '', Soporte: false},
      {Orden: 2, Concepto: 'legalizacion_matricula.colegio_graduado', Informacion: infoLegalizacion.colegioGraduado, Estado: this.retornarEstadoPorId(estados["diplomaBachiller"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soporteColegio},
      {Orden: 3, Concepto: 'legalizacion_matricula.pension_mesual_11', Informacion: infoLegalizacion.pensionGrado11, Estado: this.retornarEstadoPorId(estados["soportePension"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soportePensionGrado11},
      {Orden: 4, Concepto: 'legalizacion_matricula.nucleo_familiar', Informacion: infoLegalizacion.nucleoFamiliar, Estado: this.retornarEstadoPorId(estados["soporteNucleo"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soporteNucleoFamiliar},
      {Orden: 5, Concepto: 'legalizacion_matricula.situacion_laboral', Informacion: infoLegalizacion.situacionLaboral, Estado: estados["soporteSituacionLaboral"] ? this.retornarEstadoPorId(estados["soporteSituacionLaboral"]) : "", Soporte: estados["soporteSituacionLaboral"] ? true : false, DocumentoSoporte: infoLegalizacion.soporteSituacionLaboral},
    ];
    this.infoSocioEcopersonalDataSource = new MatTableDataSource<any>(infoSocioEcoPersonal);

    const infoSocioEcoCosteo: any[] = [
      {Orden: 1, Concepto: 'GLOBAL.direccion_residencia', Informacion: infoLegalizacion.direccionCostea, Estado: this.retornarEstadoPorId(estados["soporteEstrato"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soporteEstratoCostea},
      {Orden: 2, Concepto: 'legalizacion_matricula.ingresos_anio_anterior', Informacion: infoLegalizacion.ingresosCostea, Estado: this.retornarEstadoPorId(estados["soporteIngresos"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soporteIngresosCostea},
    ];
    this.infoSocioEcoCosteaDataSource = new MatTableDataSource<any>(infoSocioEcoCosteo);

    const resumenGeneral: any[] = [
      {Orden: 1, Concepto: 'legalizacion_matricula.soporte_general', Informacion: 'legalizacion_matricula.sin_informacion', Estado: this.retornarEstadoPorId(estados["documentosGeneral"]), Soporte: true, DocumentoSoporte: infoLegalizacion.soporteGeneral},
    ];
    this.resumenGeneralDataSource = new MatTableDataSource<any>(resumenGeneral);
  }

  cerrar = () => {
    this.formulario = false;
  }
}