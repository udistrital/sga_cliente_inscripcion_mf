import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SoporteParams } from 'src/app/models/forms/define-form-fields';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { MODALS, ROLES } from 'src/app/models/informacion/diccionario';
import { LegalizacionMatricula } from 'src/app/models/legalizacion/legalizacion_matricula';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { InscripcionMidService } from 'src/app/services/inscripcion_mid.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/users.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { OikosService } from 'src/app/services/oikos.service';
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogoDocumentosComponent } from '../../components/dialogo-documentos/dialogo-documentos.component';
import { MatTableDataSource } from '@angular/material/table';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { POR_DEFINIR } from '../../preinscripcion/preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/constants';


@Component({
  selector: 'app-legalizacion-matricula-aspirante',
  templateUrl: './legalizacion-matricula-aspirante.component.html',
  styleUrls: ['./legalizacion-matricula-aspirante.component.scss'],
})
export class LegalizacionMatriculaAspiranteComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns: string[] = [
    'Nombre',
    'NuevoDcoumento',
    'Acciones',
  ];
  nombresColumnas: any
  dataSource!: MatTableDataSource<any>;
  
  constructor(
    private fb: FormBuilder,
    private ubicacionService: UbicacionService,
    private parametrosService: ParametrosService,
    private tercerosService: TercerosService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
    private gestorDocumentalService: NewNuxeoService,
    private inscripcionMidService: InscripcionMidService,
    private autenticationService: ImplicitAutenticationService,
    private oikosService: OikosService,
    private usuarioService: UserService,
    private inscripcionService: InscripcionService,
    private sgamidService: SgaMidService,
    private documentoService: DocumentoService,
    private utilidadesService: UtilidadesService,
    private dialog: MatDialog,
    private projectService: ProyectoAcademicoService,
    private route: ActivatedRoute
  ) {}

  isLinear = false;
  loading!: boolean;
  valorSML = 0;
  valorPension = 0;
  valorPensionSML = 0;
  valorIngresos = 0;
  valorIngresosSML = 0;
  numDocumentosRechazadosCargados = 0;
  numDocumentosRechazados = 0;

  estaAutorizado: boolean = true;
  yaHizoProceso: boolean = false;
  info_persona_id: any;
  infoLegalizacionPersona: any;
  persona: any;
  inscripcion: any;
  proyectoAcademico: any;
  proyectoAcademicoId: any;
  periodoId: any;
  estadoInscripcion: any;
  opcionPrograma: any = 1;
  estadoLaboralAspiranteActual: any;

  formInfoSocioEconomicaPersonal!: FormGroup;
  formInfoSocioEconomicaCosteara!: FormGroup;
  formDocsGenerales!: FormGroup;

  infoSocioEconomicaPersonal = this.fb.group({
    direccion_residencia: ['', Validators.required],
    localidad: ['', Validators.required],
    colegio: ['', Validators.required],
    diploma_bachiller: [''],
    pension_valor: ['', Validators.required],
    pension_valor_smv: ['', Validators.required],
    soporte_pension_valor: [''],
    nucleo_familiar: ['', Validators.required],
    soporte_nucleo_familiar: [''],
    situacion_laboral: ['', Validators.required],
    soporte_situacion_laboral: [''],
  });

  infoSocioEconomicaCosteara = this.fb.group({
    direccion_residencia_costeara: ['', Validators.required],
    estrato: ['', Validators.required],
    ubicacion_residencia: ['', Validators.required],
    soporte_estrato: [''],
    ingresos_ano_anterior: ['', Validators.required],
    ingresos_ano_anterior_sm: ['', Validators.required],
    soporte_ingresos_ano_anterior: [''],
  });

  docsGenerales = this.fb.group({
    documentos: [''],
  });

  soportes: SoporteParams = {
    diplomaBachiller: {
      archivosLocal: [],
      archivosLinea: [],
    },
    soportePension: {
      archivosLocal: [],
      archivosLinea: [],
    },
    soporteNucleo: {
      archivosLocal: [],
      archivosLinea: [],
    },
    soporteSituacionLaboral: {
      archivosLocal: [],
      archivosLinea: [],
    },
    soporteEstrato: {
      archivosLocal: [],
      archivosLinea: [],
    },
    soporteIngresos: {
      archivosLocal: [],
      archivosLinea: [],
    },
    documentosGeneral: {
      archivosLocal: [],
      archivosLinea: [],
    },
  };

  localidades!: any[];

  situacionesLaboral!: any[];
  estratos!: any[];
  nuceloFamiliar!: any[];
  ubicacionesResidencia!: any[];
  documentosRechazados: any[] = [];

  async ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const personaId = params.get('persona');
      const periodoId = params.get('periodo');
      const programaId = params.get('programa');

      console.log('Persona ID:', personaId);
      console.log('Periodo ID:', periodoId);
      console.log('Programa ID:', programaId);

      this.info_persona_id = personaId
      this.proyectoAcademicoId = programaId
      this.periodoId = periodoId
    });
    this.initFormularios();
    this.cargarDatosFormularios();

    await this.cargarSalarioMinimo(this.periodoId)
    this.inscripcion = await this.buscarInscripcionAspirante(this.info_persona_id, this.proyectoAcademicoId, this.periodoId)
    console.log(this.inscripcion)
    this.estadoInscripcion = this.inscripcion.EstadoInscripcionId.Id
    this.opcionPrograma = this.inscripcion.Opcion
    this.proyectoAcademico = await this.recuperarProyectoPorId(this.proyectoAcademicoId);
    this.persona = await this.consultarTercero(this.info_persona_id);
    this.persona = this.formatoPersona(this.persona);
    this.autenticationService.getRole().then(
      async (rol: any) => {
        const r1 = rol.find((role: string) => (role == ROLES.ADMIN_SGA));
        const r2 = rol.find((role: string) => (role == ROLES.ASISTENTE_ADMISIONES));
        const esEstudianteAdmitido = this.esEstudianteAdmitido(this.inscripcion)
        if (r1 || r2 || esEstudianteAdmitido) {
          this.estaAutorizado = true;
          this.loading = true;
          this.infoLegalizacionPersona = await this.getLegalizacionMatricula(this.info_persona_id);
          this.estadoLaboralAspiranteActual = this.infoLegalizacionPersona["situacionLaboral"]
          if ((this.infoLegalizacionPersona !== null && typeof this.infoLegalizacionPersona === 'object') && Object.keys(this.infoLegalizacionPersona).length > 0) {
            this.yaHizoProceso = true;
            this.descargarArchivos(this.infoLegalizacionPersona)
            this.setearCamposFormularios(this.infoLegalizacionPersona);
            if (this.estadoInscripcion == 10) {
              const estados = await this.retornasEstadosDocumentos(this.infoLegalizacionPersona);
              const docsRechazados = this.obtenerSoportesRechazados(estados);
              this.numDocumentosRechazados = docsRechazados.length;
              for (const doc of docsRechazados) {
                const soporte = this.seleccionarNombreSoporte(doc)
                const nombreDoc = this.seleccionarNombreDocumento(soporte)
                const item = {
                  "SoporteDB": doc,
                  "Soporte": soporte,
                  "Nombre": nombreDoc,
                  "HayNuevoDoc": false,
                  "NuevoDoc": 'legalizacion_admision.documento_sin_subir'
                }
                this.documentosRechazados.push(item);
              }
              this.dataSource = new MatTableDataSource(this.documentosRechazados);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            }
          } else if (this.infoLegalizacionPersona == 'No existe legalizacion') {
            this.yaHizoProceso = false;
          } 
          this.loading = false;
        } else {
          this.estaAutorizado = false;
        }
      }
    );
  }

  formatoPersona(persona: any) {
    persona.FechaNacimiento = this.formatearFecha(persona.FechaNacimiento);
    if (!persona.Genero) {
      persona.Genero = {
        "Nombre": "No especificado"
      };
    }

    return persona;
  }

  obtenerSoportesRechazados(estados: any) {
    let documentosRechazados: any[] = [];
    for (const key in estados) {
      if (estados.hasOwnProperty(key)) {
        if (estados[key] == 3) {
          documentosRechazados.push(key)
        }
      }
    }
    return documentosRechazados;
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
          const estadoDoc = this.utilidadesService.getEvaluacionDocumento(documento.Metadatos);
          estados[key] = this.retornarEstadoObservacion(estadoDoc.estadoObservacion);
        }
      }
    }
    return estados;
  }

  retornarEstadoObservacion(estado: any) {
    if (estado === POR_DEFINIR || estado === "To be defined") {
      return 1
    } else if (estado === "No aprobado" || estado === "Not approved") {
      return 3
    } else {
      return 2
    }
  }

  formatearFecha(fechaString: any) {
    const date = new Date(fechaString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear().toString();
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
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

  setearCamposFormularios(data: any) {
    this.loading = true;
    const infoPersonal = {
      direccion_residencia: data["direccionResidencia"],
      localidad: data["localidad"],
      colegio: data["colegioGraduado"],
      pension_valor: data["pensionGrado11"],
      pension_valor_smv: data["pensionSM11"],
      nucleo_familiar: data["nucleoFamiliar"],
      situacion_laboral: data["situacionLaboral"]
    };

    const infoCosteara = {
      direccion_residencia_costeara: data["direccionCostea"],
      estrato: data["estratoCostea"],
      ubicacion_residencia: data["ubicacionResidenciaCostea"],
      ingresos_ano_anterior: data["ingresosCostea"],
      ingresos_ano_anterior_sm: data["ingresosSMCostea"]
    };

    this.infoSocioEconomicaPersonal.patchValue(infoPersonal);
    this.infoSocioEconomicaCosteara.patchValue(infoCosteara);
    this.loading = false;
  }

  esEstudianteAdmitido(estudiante: any) {
    if (Object.keys(estudiante).length > 0 && (this.estadoInscripcion == 2 || this.estadoInscripcion == 8 || this.estadoInscripcion == 10)) {
      return true;
    } else {
      return false;
    }
  }

  buscarInscripcionAspirante(personaId: any, programaId: any, periodoId: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService
        .get('inscripcion?query=Activo:true,PersonaId:' + personaId + ',ProgramaAcademicoId:' + programaId+ ',PeriodoId:' + periodoId + '&sortby=Id&order=asc')
        .subscribe(
          (res: any) => {
            resolve(res[0]);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            reject([]);
          }
        );
    });
  }

  consultarTercero(personaId: any) {
    return new Promise((resolve, reject) => {
      this.sgamidService
        .get('persona/consultar_persona/' + personaId)
        .subscribe(
          (res: any) => {
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.tercero_error'));
            reject([]);
          }
        );
    });
  }

  async recuperarTerceroId(userEmail: any) {
    let persona: any = await this.recuperarTerceroByUsuario(userEmail);

    if (Object.keys(persona[0]).length > 0) {
      return persona[0].Id;
    } else {
      let emailUser: string = userEmail.slice(0, userEmail.indexOf('@'));
      persona = await this.recuperarTerceroByUsuario(emailUser);
      if (Object.keys(persona[0]).length > 0) {
        return persona[0].Id;
      } else {
        return 0;
      }
    }
  }

  recuperarTerceroByUsuario(usuario: any) {
    return new Promise((resolve, reject) => {
      this.tercerosService
        .get('tercero?query=UsuarioWSO2:' + usuario)
        .subscribe(
          (res: any) => {
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.tercero_error'));
            console.error(error);
            reject([]);
          }
        );
    });
  }

  recuperarProyectoPorId(proyectoId: any) {
    return new Promise((resolve, reject) => {
      this.projectService.get('proyecto_academico_institucion/' + proyectoId).subscribe(
        (res: any) => {
          resolve(res.Nombre);
        },
        (error: any) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant('admision.facultades_error')
          );
          console.error(error);
          reject([]);
        }
      );
    });
  }

  // MANJEO ARCHIVOS //

  async reEnviarDocumnetos() {
    this.popUpManager.showPopUpGeneric(
      this.translate.instant('legalizacion_admision.titulo'),
      this.translate.instant('legalizacion_admision.actualizar_legalizacion'),
      MODALS.INFO,
      true).then(
        async (action) => {
          if (action.value) {
            await this.prepararActualizacionSoportes();
          }
        });
  }

  async prepararActualizacionSoportes() {
    const archivos: { [key: string]: any } = this.prepararArchivosCorregidos();
    let idsArchivos: any = {};
    const propiedades = Object.keys(archivos);
    let bodyActualizacionSoportes: any = {
      "terceroId": this.info_persona_id,
    }
    let soportesActualizar: any[] = []

    for (const propiedad of propiedades) {
      const carpetaArchivos = archivos[propiedad];
      let ids = await this.cargarArchivos(carpetaArchivos);
      idsArchivos[propiedad] = ids;
    }

    for (const propiedad of propiedades) {
      const item = {
        "infoComplementariId": this.recuperarIdInfoComplementaria(propiedad),
        "dato": this.prepareIds2Stringify(idsArchivos[propiedad], propiedad)
      }
      soportesActualizar.push(item);
    }
    bodyActualizacionSoportes["arvivosActualizar"] = soportesActualizar

    let res: any = await this.actualizarSoportesLegalizacionMatricula(bodyActualizacionSoportes);
    if (res.Success && res.Status == 200) {
      this.infoLegalizacionPersona = await this.getLegalizacionMatricula(this.info_persona_id);
      this.descargarArchivos(this.infoLegalizacionPersona)
      this.setearCamposFormularios(this.infoLegalizacionPersona);
      this.inscripcion.EstadoInscripcionId.Id = 2;
      this.estadoInscripcion = 2;
      const resEstado: any = await this.actualizarEstadoInscripcion(this.inscripcion);
    }
  }

  actualizarEstadoInscripcion(inscripcionData: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.put('inscripcion', inscripcionData)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.inscripciones_error'));
            console.error(error);
            reject([]);
          });
    });
  }

  async actualizarSoportesLegalizacionMatricula(legalizacionBody: any) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.inscripcionMidService.put('legalizacion/actualizar-info-soportes-legalizacion', legalizacionBody)
        .subscribe((res: any) => {
          this.loading = false;
          this.popUpManager.showSuccessAlert(this.translate.instant('legalizacion_admision.legalizacion_actualizacion_ok'));
          resolve(res);
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(
              this.translate.instant('legalizacion_admision.legalizacion_actualizacion_error')
            );
          }
        );
    });
  }

  recuperarIdInfoComplementaria(soporte: any) {
    let id
    switch (soporte) {
      case "diplomaBachiller":
        id = 591;
        break;
      case "soportePension":
        id = 594;
        break;
      case "soporteNucleo":
        id = 596;
        break;
      case "soporteSituacionLaboral":
        id = 598;
        break;
      case "soporteEstrato":
        id = 603;
        break;
      case "soporteIngresos":
        id = 606;
        break;
      case "documentosGeneral":
        id = 599;
        break;
      default:
        id = 599;
    }
    return id;
  }

  onFileSelected(label: any, event: any) {
    const files = <File[]>Object.values(event.target.files);
    const newFiles = files.map((f) => {
      return { file: f, urlTemp: URL.createObjectURL(f), err: false };
    });
    for (const soporte of this.documentosRechazados) {
      if (soporte["Soporte"] == label ) {
        soporte["DocumentoNuevo"] = newFiles
        soporte["NuevoDoc"] = newFiles[0]["file"]["name"]
        soporte["LinkNuevoDoc"] = newFiles[0]["urlTemp"]
        soporte["HayNuevoDoc"] = true

        this.numDocumentosRechazadosCargados ++;
      }
    }
  }

  onChangeSelectFiles(label: string, event: any): void {
    const files = <File[]>Object.values(event.target.files);
    const newFiles = files.map((f) => {
      return { file: f, urlTemp: URL.createObjectURL(f), err: false };
    });
    this.soportes[label].archivosLocal =
      this.soportes[label].archivosLocal!.concat(newFiles);
    const nameFiles = this.passFilesToFormControl(
      this.soportes[label].archivosLocal ?? [],
      this.soportes[label].archivosLinea ?? []
    );
    const errs = this.validateFiles(
      this.soportes[label].tipoArchivos ?? '',
      this.soportes[label].tamMBArchivos ?? 0,
      this.soportes[label].archivosLocal ?? []
    );
    this.soportes[label].validaArchivos = errs;
  }

  passFilesToFormControl(archivosLocal: any[], archivosLinea: any[]): string {
    let nameFiles = '';
    archivosLocal.forEach((f) => {
      nameFiles += f.file.name + ', ';
    });
    archivosLinea.forEach((f) => {
      nameFiles += f.nombre + ', ';
    });
    return nameFiles;
  }

  validateFiles(
    tipoArchivos: string,
    tamMBArchivos: number,
    archivosLocal: any[]
  ) {
    let errTipo = false;
    let errTam = false;
    archivosLocal.forEach((f) => {
      if (tipoArchivos.indexOf(f.file.type.split('/')[1]) === -1) {
        f.err = true;
        errTipo = true;
      } else if (f.file.size > tamMBArchivos * 1024000) {
        f.err = true;
        errTam = true;
      } else {
        f.err = false;
      }
    });
    return { errTipo: errTipo, errTam: errTam };
  }

  previewFile(url: string): void {
    const h = screen.height * 0.65;
    const w = (h * 3) / 4;
    const left = (screen.width * 3) / 4 - w / 2;
    const top = screen.height / 2 - h / 2;
    window.open(
      url,
      '',
      'toolbar=no,' +
        'location=no, directories=no, status=no, menubar=no,' +
        'scrollbars=no, resizable=no, copyhistory=no, ' +
        'width=' +
        w +
        ', height=' +
        h +
        ', top=' +
        top +
        ', left=' +
        left
    );
  }

  deleteSelectedFile(label: string, fileName: string): void {
    const idf = this.soportes[label].archivosLocal!.findIndex(
      (f) => f.file.name == fileName
    );
    if (idf != -1) {
      this.soportes[label].archivosLocal!.splice(idf, 1);
      const nameFiles = this.passFilesToFormControl(
        this.soportes[label].archivosLocal ?? [],
        this.soportes[label].archivosLinea ?? []
      );
      const errs = this.validateFiles(
        this.soportes[label].tipoArchivos ?? '',
        this.soportes[label].tamMBArchivos ?? 0,
        this.soportes[label].archivosLocal ?? []
      );
      this.soportes[label].validaArchivos = errs;
    }
  }

  deleteSelectedFileLinea(label: string, idFile: number): void {
    const idf = this.soportes[label].archivosLinea!.findIndex(
      (f) => f.Id == idFile
    );
    if (idf != -1) {
      this.soportes[label].archivosLinea!.splice(idf, 1);
      this.soportes[label].archivosDelete!.push(idFile);
      const nameFiles = this.passFilesToFormControl(
        this.soportes[label].archivosLocal ?? [],
        this.soportes[label].archivosLinea ?? []
      );
      const errs = this.validateFiles(
        this.soportes[label].tipoArchivos ?? '',
        this.soportes[label].tamMBArchivos ?? 0,
        this.soportes[label].archivosLocal ?? []
      );
      this.soportes[label].validaArchivos = errs;
    }
  }

  // FIN MANJEO ARCHIVOS //

  initFormularios() {
    this.formInfoSocioEconomicaPersonal = this.infoSocioEconomicaPersonal;
    this.formInfoSocioEconomicaCosteara = this.infoSocioEconomicaCosteara;
    this.formDocsGenerales = this.docsGenerales;
  }

  async cargarDatosFormularios() {
    this.loading = true;
    await this.cargarLocalidades();
    await this.cargarSituacionesLaborales();
    await this.cargarEstratos();
    await this.cargarNucleoFamiliar();
    await this.cargarUbicacionesResidencia();
    this.loading = false;
  }

  cargarSalarioMinimo(periodoId: any) {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get('parametro_periodo?limit=0&query=Activo:true,ParametroId.Id:1,PeriodoId.Id:' + periodoId)
        .subscribe(
          (res: any) => {
            const data = res.Data
            console.log("AAAAAAAAAAAAAAAAAAAA", data)
            // const jsonObject = JSON.parse(data[0].Valor);
            // const valor: number = jsonObject.Valor;
            // this.valorSML = valor;
            this.valorSML = 1300000;
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.situaciones_laborales_error'));
            console.error(error);
            reject([]);
          }
        );
    });
  }

  cargarLocalidades() {
    return new Promise((resolve, reject) => {
      this.ubicacionService
        .get('lugar?limit=0&query=TipoLugarId__Id:3')
        .subscribe(
          (res: any) => {
            this.localidades = res;
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.localidad_error'));
            console.error(error);
            reject([]);
          }
        );
    });
  }

  cargarSituacionesLaborales() {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get('parametro?limit=0&query=TipoParametroId%3A89')
        .subscribe(
          (res: any) => {
            this.situacionesLaboral = res.Data;
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.situaciones_laborales_error'));
            console.error(error);
            reject([]);
          }
        );
    });
  }

  cargarEstratos() {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get('parametro?limit=0&query=TipoParametroId%3A90')
        .subscribe(
          (res: any) => {
            this.estratos = res.Data;
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.estratos_error'));
            console.error(error);
            reject([]);
          }
        );
    });
  }

  cargarNucleoFamiliar() {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get('parametro?limit=0&query=TipoParametroId%3A91')
        .subscribe(
          (res: any) => {
            this.nuceloFamiliar = res.Data;
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.nucleo_familiar_error'));
            console.error(error);
            reject([]);
          }
        );
    });
  }

  cargarUbicacionesResidencia() {
    return new Promise((resolve, reject) => {
      this.parametrosService
        .get('parametro?limit=0&query=TipoParametroId%3A92')
        .subscribe(
          (res: any) => {
            this.ubicacionesResidencia = res.Data;
            resolve(res);
          },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.ubicaciones_error'));
            console.error(error);
            reject([]);
          }
        );
    });
  }

  guardar() {
    if (this.validarFormulario()) {
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('legalizacion_admision.titulo'),
        this.translate.instant('legalizacion_admision.crear_legalizacion'),
        MODALS.INFO,
        true).then(
          (action) => {
            if (action.value) {
              this.prepararCreacion();
            }
          });
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.formulario_error'));
    }
  }

  validarArchivos() {
    let completos = true;
    const situacion = this.situacionesLaboral.find(
      (situacion: any) =>
        situacion.Id ==
        this.infoSocioEconomicaPersonal.get('situacion_laboral')!.value
    );

    for (const soporte in this.soportes) {
      const item = this.soportes[soporte];

      if (item.archivosLocal && !(item.archivosLocal.length > 0)) {
        if (
          soporte == 'soporteSituacionLaboral' &&
          situacion.Nombre == 'Desempleado'
        ) {
          continue;
        }
        completos = false;
        break;
      }
    }
    return completos;
  }

  validarFormulario() {
    this.marcarFormularios();
    if (
      this.formInfoSocioEconomicaPersonal.valid &&
      this.formInfoSocioEconomicaCosteara.valid &&
      this.formDocsGenerales.valid &&
      this.validarArchivos()
    ) {
      return true;
    } else {
      return false;
    }
  }

  marcarFormularios() {
    this.formInfoSocioEconomicaPersonal.markAllAsTouched();
    this.formInfoSocioEconomicaCosteara.markAllAsTouched();
    this.formDocsGenerales.markAllAsTouched();
  }

  async prepararCreacion() {
    this.loading = true;
    let newLegalizacionMatricula = new LegalizacionMatricula();
    newLegalizacionMatricula.TerceroId = this.info_persona_id;
    newLegalizacionMatricula.DireccionResidencia = this.formInfoSocioEconomicaPersonal.get('direccion_residencia')?.value;
    newLegalizacionMatricula.Localidad = this.localidades.find((localidad: any) => localidad.Id == this.formInfoSocioEconomicaPersonal.get('localidad')?.value).Nombre;
    newLegalizacionMatricula.ColegioGraduado = this.formInfoSocioEconomicaPersonal.get('colegio')?.value;
    newLegalizacionMatricula.PensionMensual11 = Number(this.formInfoSocioEconomicaPersonal.get('pension_valor')?.value);
    newLegalizacionMatricula.PensionMensualSM11 = Number(this.formInfoSocioEconomicaPersonal.get('pension_valor_smv')?.value);
    newLegalizacionMatricula.NucleoFamiliar = this.nuceloFamiliar.find((nucleo: any) => nucleo.Id == this.formInfoSocioEconomicaPersonal.get('nucleo_familiar')?.value).Nombre;
    newLegalizacionMatricula.SituacionLaboral = this.situacionesLaboral.find((situacion: any) => situacion.Id == this.formInfoSocioEconomicaPersonal.get('situacion_laboral')?.value).Nombre;
    newLegalizacionMatricula.DireccionResidenciaCostea = this.formInfoSocioEconomicaCosteara.get('direccion_residencia_costeara')?.value;
    newLegalizacionMatricula.EstratoCostea = this.estratos.find((estrato: any) => estrato.Id == this.formInfoSocioEconomicaCosteara.get('estrato')?.value).Nombre;
    newLegalizacionMatricula.UbicacionResidenciaCostea = this.ubicacionesResidencia.find((ubicacion: any) => ubicacion.Id == this.formInfoSocioEconomicaCosteara.get('ubicacion_residencia')?.value).Nombre;
    newLegalizacionMatricula.IngresosCostea = this.formInfoSocioEconomicaCosteara.get('ingresos_ano_anterior')?.value;
    newLegalizacionMatricula.IngresosCosteaSM = this.formInfoSocioEconomicaCosteara.get('ingresos_ano_anterior_sm')?.value;

    const archivos: { [key: string]: any } = this.prepararArchivos();
    let idsArchivos: any = {};
    const propiedades = Object.keys(archivos);

    for (const propiedad of propiedades) {
      const carpetaArchivos = archivos[propiedad];
      let ids = await this.cargarArchivos(carpetaArchivos);
      idsArchivos[propiedad] = ids;
    }

    newLegalizacionMatricula.SoporteDiploma = this.prepareIds2Stringify(idsArchivos['diplomaBachiller'], 'diplomaBachiller');
    newLegalizacionMatricula.SoportePension = this.prepareIds2Stringify(idsArchivos['soportePension'], 'soportePension');
    newLegalizacionMatricula.SoporteNucleo = this.prepareIds2Stringify(idsArchivos['soporteNucleo'], 'soporteNucleo');
    newLegalizacionMatricula.SoporteEstratoCostea = this.prepareIds2Stringify(idsArchivos['soporteEstrato'], 'soporteEstrato');
    newLegalizacionMatricula.SoporteIngresosCostea = this.prepareIds2Stringify(idsArchivos['soporteIngresos'], 'soporteIngresos');
    newLegalizacionMatricula.SoporteDocumental = this.prepareIds2Stringify(idsArchivos['documentosGeneral'], 'documentosGeneral');
    if (idsArchivos['soporteSituacionLaboral']) {
      newLegalizacionMatricula.SoporteSituacionLaboral =
        this.prepareIds2Stringify(idsArchivos['soporteSituacionLaboral'], 'soporteSituacionLaboral');
    }

    let res: any = await this.crearLegalizacionMatricula(newLegalizacionMatricula);
    if (res.Success && res.Status == 200) {
      this.yaHizoProceso = true;
      this.infoLegalizacionPersona = await this.getLegalizacionMatricula(this.info_persona_id);
      this.descargarArchivos(this.infoLegalizacionPersona)
      this.setearCamposFormularios(this.infoLegalizacionPersona);
    }
  }

  async crearLegalizacionMatricula(legalizacionBody: LegalizacionMatricula) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.inscripcionMidService.post('legalizacion/base', legalizacionBody)
        .subscribe((res: any) => {
          this.loading = false;
          this.popUpManager.showSuccessAlert(this.translate.instant('legalizacion_admision.legalizacion_creacion_ok'));
          resolve(res);
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(
              this.translate.instant('legalizacion_admision.legalizacion_creacion_error')
            );
            reject(false);
          }
        );
    });
  }

  prepararArchivos(): any[] {
    const idTipoDocument = 72; // carpeta Nuxeo
    let archivos: any = {};
    for (const soporte in this.soportes) {
      const archivosLoc = this.soportes[soporte].archivosLocal!;
      let newArchivosLoc: any = [];

      for (const archivo of archivosLoc) {
        const newArchivo = {
          IdDocumento: idTipoDocument,
          nombre: archivo.file.name.split('.')[0],
          descripcion: 'Soporte Legalización de matricula',
          file: archivo.file,
        };
        newArchivosLoc.push(newArchivo);
        archivos[soporte] = newArchivosLoc;
      }
    }
    return archivos;
  }

  prepararArchivosCorregidos(): any[] {
    const idTipoDocument = 72; // carpeta Nuxeo
    let archivos: any = {};
    //this.documentosRechazados

    for (const documento of this.documentosRechazados) {
      let newArchivos: any = [];
      for(const archivo of documento["DocumentoNuevo"]) {
        const newArchivo = {
          IdDocumento: idTipoDocument,
          nombre: archivo.file.name.split('.')[0],
          descripcion: 'Soporte Legalización de matricula',
          file: archivo.file,
        };
        newArchivos.push(newArchivo);
        archivos[documento["SoporteDB"]] = newArchivos;
      }
    }
    return archivos;
  }

  cargarArchivos(archivos: any): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      this.gestorDocumentalService
        .uploadFiles(archivos)
        .subscribe((respuesta: any[]) => {
          const listaIds = respuesta.map((f) => {
            return f.res.Id;
          });
          resolve(listaIds);
        });
    });
  }

  prepareIds2Stringify(idsArchivos: number[], nameField: string): string {
    let result: any = {};
    result[nameField] = [];
    if (idsArchivos) {
      result[nameField] = idsArchivos;
    }
    return JSON.stringify(result);
  }

  onPensionValorChange() {
    this.valorPensionSML = this.valorPension / this.valorSML;
    this.valorPensionSML = Number(this.valorPensionSML.toFixed(2));
  }

  onIngresosValorChange() {
    this.valorIngresosSML = this.valorIngresos / this.valorSML;
    this.valorIngresosSML = Number(this.valorIngresosSML.toFixed(2));
  }

  async openModal(soporte: string) {
    if (this.infoLegalizacionPersona.hasOwnProperty(soporte)) {
      const idDoc = this.recuperarIdDocumento(this.infoLegalizacionPersona[soporte]);
      const nombreSoporteDoc = this.recuperarNombreSoporteDoc(this.infoLegalizacionPersona[soporte])
      const documento: any = await this.cargarDocumento(idDoc);
      let estadoDoc = this.utilidadesService.getEvaluacionDocumento(documento.Metadatos);
      const dataDoc: any = await this.abrirDocumento(idDoc);
      const nombreDoc = this.seleccionarNombreDocumento(soporte)
      
      const documentoDialog = {
        "tabName": documento.Descripcion,
        "nombreDocumento": nombreDoc,
        "DocumentoId": documento.Id,
        "aprobado": estadoDoc.aprobado,
        "estadoObservacion": estadoDoc.estadoObservacion,
        "observacion": estadoDoc.observacion,
        "carpeta": documento.Descripcion,
        "nombreSoporte": nombreSoporteDoc,
        "Documento": dataDoc ? dataDoc : {},
        "observando": true,
      }
      const assignConfig = new MatDialogConfig();
      assignConfig.width = '1600px';
      assignConfig.height = '750px';
      assignConfig.data = { documento: documentoDialog }
      const dialogo = this.dialog.open(DialogoDocumentosComponent, assignConfig);

      dialogo.afterClosed().subscribe(async (result) => {
        console.log(result);
      });
    } else {
      console.log(`La clave ${soporte} no existe en el objeto.`);
    }
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

    this.gestorDocumentalService.getManyFiles('?query=Id__in:' + idsForQuery + '&limit=' + limitQuery)
      .subscribe((res: any) => {
      }, (error: any) => {
        console.error(error);
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
      })
  }

  seleccionarNombreSoporte(nombreDocumento: any) {
    let nombre
    switch (nombreDocumento) {
      case "diplomaBachiller":
        nombre = 'soporteColegio';
        break;
      case "soportePension":
        nombre = 'soportePensionGrado11';
        break;
      case "soporteNucleo":
        nombre = 'soporteNucleoFamiliar';
        break;
      case "soporteSituacionLaboral":
        nombre = 'soporteSituacionLaboral';
        break;
      case "soporteEstrato":
        nombre = 'soporteEstratoCostea';
        break;
      case "soporteIngresos":
        nombre = 'soporteIngresosCostea';
        break;
      case "documentosGeneral":
        nombre = 'soporteGeneral';
        break;
      default:
        nombre = 'soporteGeneral';
    }
    return nombre;
  }

  seleccionarNombreDocumento(nombreSoporte: any) {
    let nombre
    switch (nombreSoporte) {
      case "soporteColegio":
      case "diplomaBachiller":
        nombre = 'legalizacion_admision.colegio_graduado';
        break;
      case "soportePensionGrado11":
      case "soportePension":
        nombre = 'legalizacion_admision.pension_mesual_11';
        break;
      case "soporteNucleoFamiliar":
      case "soporteNucleo":
        nombre = 'legalizacion_admision.nucleo_familiar';
        break;
      case "soporteSituacionLaboral":
        nombre = 'legalizacion_admision.situacion_laboral';
        break;
      case "soporteEstratoCostea":
      case "soporteEstrato":
        nombre = 'GLOBAL.direccion_residencia';
        break;
      case "soporteIngresosCostea":
      case "soporteIngresos":
        nombre = 'legalizacion_admision.ingresos_anio_anterior';
        break;
      case "soporteGeneral":
      case "documentosGeneral":
        nombre = 'legalizacion_admision.soporte_general';
        break;
      default:
        nombre = 'legalizacion_admision.soporte_general';
    }
    return nombre;
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

  cargarDocumento(documentoId:any) {
    return new Promise((resolve, reject) => {
      this.documentoService.get('documento/' + documentoId)
        .subscribe((res: any) => {
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.documento_error'));
            console.error(error);
            reject([]);
          });
    });
  }

  abrirDocumento(documentoId: any) {
    return new Promise((resolve, reject) => {
      this.gestorDocumentalService.getByIdLocal(documentoId)
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

  onSituacionLaboralChange(event: any) {
    this.soportes["soporteSituacionLaboral"].archivosLocal = [];
    if (event.value == '5959') {
      this.estadoLaboralAspiranteActual = 'Desempleado'
    } else {
      this.estadoLaboralAspiranteActual = 'Empleado'
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}