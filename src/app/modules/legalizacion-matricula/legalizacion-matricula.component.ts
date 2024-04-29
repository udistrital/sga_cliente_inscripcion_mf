import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { validateLang } from 'src/app/app.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ModalComponent } from './components/modal/modal.component';
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
import { DialogoDocumentosComponent } from '../components/dialogo-documentos/dialogo-documentos.component';
import { UtilidadesService } from 'src/app/services/utilidades.service';

// interface InfoSocioEconomica {
//   Orden: number;
//   Concepto: string;
//   Informacion: string;
//   Estado: string;
// }

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

  proyectosCurriculares!: any[]
  anios!: any[]
  periodos!: any[]
  facultades!: any[]

  infoLegalizacionAspirantes: any = {}
  estadoDocumentosAspirantes: any = {}
  aspiranteActualId: any;

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
    private popUpManager: PopUpManager
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
  }

  async ngOnInit() {
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
          console.log(this.facultades);
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
          console.log(this.periodos);
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

  async generarBusqueda(stepper: MatStepper) {
    const proyecto = this.firstFormGroup.get('validatorProyecto')?.value;
    const periodo = this.firstFormGroup.get('validatorPeriodo')?.value;
    const anio = this.firstFormGroup.get('validatorAño')?.value;
    console.log(proyecto, anio, periodo);

    let inscritosData: any[] = [];
    let ordenCount = 0 

    const inscripciones: any = await this.buscarInscripciones(stepper, proyecto, periodo)

    for (const inscripcion of inscripciones) {
      ordenCount += 1;
      const persona: any = await this.consultarTercero(inscripcion.PersonaId);
      const proyecto = this.proyectosCurriculares.find((item: any) => item.Id === inscripcion.ProgramaAcademicoId)
      const infoLegalizacion = await this.getLegalizacionMatricula(persona.Id)
      this.infoLegalizacionAspirantes[persona.Id] = infoLegalizacion
      const estados = await this.retornasEstadosDocumentos(infoLegalizacion);
      this.estadoDocumentosAspirantes[persona.Id] = estados;
      const estadoRevision = this.revisarEstadosRevision(estados)

      console.log("Genracion busqueda: ", persona, inscripcion, infoLegalizacion, estados, this.infoLegalizacionAspirantes, this.estadoDocumentosAspirantes)

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
        "estado_admision": inscripcion.EstadoInscripcionId.Nombre,
        "estado_revision": estadoRevision,
        "proyecto_admitido": proyecto.Nombre,
        // "fecha_nacimiento": persona.FechaNacimiento,
        "fecha_nacimiento": this.formatearFecha(persona.FechaNacimiento),
        "numero_celular": persona.Telefono,
        "correo": persona.UsuarioWSO2,
        "genero": persona.Genero.Nombre
      }
      inscritosData.push(personaData);
    }
    console.log("Data inscritos: ", inscritosData)

    this.personaDataSource = new MatTableDataSource<any>(inscritosData);
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
    let estado = "Sin revisar"
    // Boolean para saber si el aspirante puede tener todos los documentos aprobados, si un documento no esta aprobado se vuelve false
    let puedeAprobar = true;
    // Boolean para saber si ya se ha evaluado el estado de algún documento
    let hayEstado = false;
    for (const key in estados) {
      if (estados[key] != 'Sin revisar') {
        if (estados[key] == 'Aprobado' && puedeAprobar) {
          estado = "Aprobado"
          hayEstado = true
        } else if (estados[key] == 'No aprobado') {
          estado = "Revisado con observaciones"
          puedeAprobar = false
          hayEstado = true
          break;
        }
      } else if (puedeAprobar) {
        puedeAprobar = false
        if (hayEstado) {
          estado = "Revisado con observaciones"
        }
      }
    }
    return estado;
  }

  async retornasEstadosDocumentos(infoLegalizacion: any) {
    const keys = Object.keys(infoLegalizacion)
    //console.log("Llaves", keys);
    const filteredList = keys.filter(item => item.startsWith('soporte'));
    //console.log("Llaves soporte", filteredList);
    let estados: any = {}

    for (const key in infoLegalizacion) {
      if (filteredList.includes(key)) {
        const value = JSON.parse(infoLegalizacion[key]);
        //console.log("llave info: ", infoLegalizacion[key], typeof(infoLegalizacion[key]), value, typeof(value));
        for (const key in value) {
          const documentoId = value[key][0];
          const documento: any = await this.cargarDocumento(documentoId);
          const estadoDoc = this.utilidades.getEvaluacionDocumento(documento.Metadatos);
          estados[key] = estadoDoc.estadoObservacion === "Por definir" ? "Sin revisar" : estadoDoc.estadoObservacion;
          //console.log("llave value info: ", value[key], documentoId, documento, estadoDoc.estadoObservacion, estados);
        }
      }
    }
    return estados;
  }

  buscarInscripciones(stepper: MatStepper, proyecto: any, periodo: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + ',EstadoInscripcionId.Id:2&sortby=Id&order=asc')
        .subscribe((res: any) => {
          stepper.next();
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.inscripciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  consultarTercero(personaId: any) {
    return new Promise((resolve, reject) => {
      this.sgamidService.get('persona/consultar_persona/' + personaId)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.tercero_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  async openModal(data: any) {
    const idDoc = this.recuperarIdDocumento(data.DocumentoSoporte);
    const nombreSoporteDoc = this.recuperarNombreSoporteDoc(data.DocumentoSoporte)
    const documento: any = await this.cargarDocumento(idDoc);
    let estadoDoc = this.utilidades.getEvaluacionDocumento(documento.Metadatos);
    const documentoDialog = {
      "tabName": documento.Descripcion,
      "nombreDocumento": data.Concepto,
      "DocumentoId": documento.Id,
      "aprobado": estadoDoc.aprobado,
      "estadoObservacion": estadoDoc.estadoObservacion,
      "observacion": estadoDoc.observacion,
      "carpeta": documento.Descripcion,
      "nombreSoporte": nombreSoporteDoc,
    } 
    console.log("Data modal: ", data, idDoc, documento, estadoDoc, nombreSoporteDoc); 
    await this.abrirDocumento(idDoc);
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
      //const estados = this.estadoDocumentosAspirantes[this.aspiranteActualId];
      console.log("estados antes: ", this.estadoDocumentosAspirantes[this.aspiranteActualId]);
      this.estadoDocumentosAspirantes[this.aspiranteActualId][result["nombreSoporte"]] = metadatosDocumento["estadoObservacion"]
      //estados[result["nombreSoporte"]] = metadatosDocumento["estadoObservacion"];
      this.cargarInfoTablasSocioeconomicas(this.infoLegalizacionAspirantes[this.aspiranteActualId]);
      console.log('Modal cerrado, resultado: ', result, documento, metadatosDocumento, res, this.estadoDocumentosAspirantes[this.aspiranteActualId]);

    });
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
    // this.newNuxeoService.getByIdLocal(documentoId)
    //   .subscribe(file => {
    //     console.log(file);
    //   }, error => {
    //     this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
    //   })
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
    console.log(documentoId);
    this.newNuxeoService.getByIdLocal(documentoId)
      .subscribe((file: any) => {
        console.log(file);
      }, (error: any) => {
        console.log(error);
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
      })
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
    //const id = data2[keys[0]][0]
    return keys[0]
  }

  editar = async (data: any) => {
    console.log('Editando...');
    console.log(data);
    this.aspirante = data;
    this.aspiranteActualId = this.aspirante.personaId;
    this.infoAspiranteDataSource = new MatTableDataSource<any>([this.aspirante]);
    const infoLegalizacion = this.infoLegalizacionAspirantes[this.aspiranteActualId]
    console.log(infoLegalizacion);
    this.cargarInfoTablasSocioeconomicas(infoLegalizacion);
    this.formulario = true;
  }

  async getLegalizacionMatricula(personaId: any) {
    return new Promise((resolve, reject) => {
      //this.loading = true;
      this.inscripcionMidService.get('legalizacion/informacion-legalizacion/' + personaId)
        .subscribe((res: any) => {
          resolve(res.data);
        },
          (error: HttpErrorResponse) => {
            //this.loading = false;
            this.popUpManager.showErrorAlert(
              this.translate.instant('legalizacion_matricula.legalizacion_error')
            );
          });
    });
  }

  async cargarInfoTablasSocioeconomicas(infoLegalizacion: any) {
    // const estados = await this.retornasEstadosDocumentos(infoLegalizacion);
    const estados = this.estadoDocumentosAspirantes[this.aspiranteActualId];
    console.log("Estados: ", estados);
    //if (estados[key] = estadoDoc.estadoObservacion === "Por definir" ? "Sin revisar" : estadoDoc.estadoObservacion;)
    const infoSocioEcoPersonal: any[] = [
      {Orden: 1, Concepto: 'Dirección de residencia', Informacion: infoLegalizacion.direccionResidencia, Estado: '', Soporte: false},
      {Orden: 2, Concepto: 'Colegio donde se gradúo', Informacion: infoLegalizacion.colegioGraduado, Estado: estados["diplomaBachiller"], Soporte: true, DocumentoSoporte: infoLegalizacion.soporteColegio},
      {Orden: 3, Concepto: 'Valor de la pension mensual pagada grado once', Informacion: infoLegalizacion.pensionGrado11, Estado: estados["soportePension"], Soporte: true, DocumentoSoporte: infoLegalizacion.soportePensionGrado11},
      {Orden: 4, Concepto: 'Nucleo familiar', Informacion: infoLegalizacion.nucleoFamiliar, Estado: estados["soporteNucleo"], Soporte: true, DocumentoSoporte: infoLegalizacion.soporteNucleoFamiliar},
      // {Orden: 5, Concepto: 'Situacion laboral', Informacion: infoLegalizacion.situacionLaboral, Estado: estados["soporteSituacionLaboral"], Soporte: true, DocumentoSoporte: infoLegalizacion.soporteSituacionLaboral},
      {Orden: 5, Concepto: 'Situacion laboral', Informacion: infoLegalizacion.situacionLaboral, Estado: estados["soporteSituacionLaboral"], Soporte: estados["soporteSituacionLaboral"] ? true : false, DocumentoSoporte: infoLegalizacion.soporteSituacionLaboral},
    ];
    this.infoSocioEcopersonalDataSource = new MatTableDataSource<any>(infoSocioEcoPersonal);

    const infoSocioEcoCosteo: any[] = [
      {Orden: 1, Concepto: 'Direccion de residencia', Informacion: infoLegalizacion.direccionCostea, Estado: estados["soporteEstrato"], Soporte: true, DocumentoSoporte: infoLegalizacion.soporteEstratoCostea},
      {Orden: 2, Concepto: 'Ingresos del año anterior', Informacion: infoLegalizacion.ingresosCostea, Estado: estados["soporteIngresos"], Soporte: true, DocumentoSoporte: infoLegalizacion.soporteIngresosCostea},
    ];
    this.infoSocioEcoCosteaDataSource = new MatTableDataSource<any>(infoSocioEcoCosteo);

    const resumenGeneral: any[] = [
      {Orden: 1, Concepto: 'Soporte general', Informacion: 'Sin información', Estado: estados["documentosGeneral"], Soporte: true, DocumentoSoporte: infoLegalizacion.soporteGeneral},
    ];
    this.resumenGeneralDataSource = new MatTableDataSource<any>(resumenGeneral);
  }

  cerrar = () => {
    this.formulario = false;
  }



}
