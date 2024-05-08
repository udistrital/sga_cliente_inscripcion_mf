
import { Component, OnInit } from '@angular/core';
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
import { ImplicitAutenticationService } from 'src/app/services/implicit_autentication.service';
import { UserService } from 'src/app/services/users.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { OikosService } from 'src/app/services/oikos.service';

@Component({
    selector: 'app-legalizacion-matricula-aspirante',
    templateUrl: './legalizacion-matricula-aspirante.component.html',
    styleUrls: ['./legalizacion-matricula-aspirante.component.scss']
  })
  export class LegalizacionMatriculaAspiranteComponent {

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
    private userService: UserService,
    private inscripcionService: InscripcionService,
    private sgamidService: SgaMidService,
  ) { 
    console.log("Empieza constructor")
  }

  isLinear = false;
  loading!: boolean;
  valorSML = 1300000;
  valorPension = 0;
  valorPensionSML = 0;
  valorIngresos = 0;
  valorIngresosSML = 0;

  estaAutorizado: boolean = true;
  info_persona_id: any;
  persona: any;
  inscripcion: any;
  proyectoAcademico: any;

  formInfoSocioEconomicaPersonal!: FormGroup;
  formInfoSocioEconomicaCosteara!: FormGroup;
  formDocsGenerales!: FormGroup;

  infoSocioEconomicaPersonal = this.fb.group({
    'direccion_residencia': ['', Validators.required],
    'localidad': ['', Validators.required],
    'colegio': ['', Validators.required],
    'diploma_bachiller': [''],
    'pension_valor': ['', Validators.required],
    'pension_valor_smv': ['', Validators.required],
    'soporte_pension_valor': [''],
    'nucleo_familiar': ['', Validators.required],
    'soporte_nucleo_familiar': [''],
    'situacion_laboral': ['', Validators.required],
    'soporte_situacion_laboral': [''],
  })

  infoSocioEconomicaCosteara = this.fb.group({
    'direccion_residencia_costeara': ['', Validators.required],
    'estrato': ['', Validators.required],
    'ubicacion_residencia': ['', Validators.required],
    'soporte_estrato': [''],
    'ingresos_ano_anterior': ['', Validators.required],
    'ingresos_ano_anterior_sm': ['', Validators.required],
    'soporte_ingresos_ano_anterior': [''],
  })

  docsGenerales = this.fb.group({
    'documentos': ['']
  })

  soportes: SoporteParams = {
    "diplomaBachiller": {
      archivosLocal: [],
      archivosLinea: []
    },
    "soportePension": {
      archivosLocal: [],
      archivosLinea: []
    },
    "soporteNucleo": {
      archivosLocal: [],
      archivosLinea: []
    },
    "soporteSituacionLaboral": {
      archivosLocal: [],
      archivosLinea: []
    },
    "soporteEstrato": {
      archivosLocal: [],
      archivosLinea: []
    },
    "soporteIngresos": {
      archivosLocal: [],
      archivosLinea: []
    },
    "documentosGeneral": {
      archivosLocal: [],
      archivosLinea: []
    }
  };

  localidades!: any[];
  situacionesLaboral!: any[];
  estratos!: any[];
  nuceloFamiliar!: any[];
  ubicacionesResidencia!: any[];

  async ngOnInit() {
    this.initFormularios();
    this.cargarDatosFormularios();

    //RECUPERACIÓN DE PERSONA ID 1
    const email: any = this.autenticationService.getMail();
    console.log("Email", email);
    this.info_persona_id = await this.recuperarTerceroId(email.__zone_symbol__value)

    //RECUPERACIÓN DE PERSONA ID 2 
    //this.info_persona_id = await this.userService.getPersonaIdNew();
    console.log("PERSONA ID", this.info_persona_id);
    this.inscripcion = await this.buscarInscritoAdmitido()
    this.proyectoAcademico = await this.recuperarProyectoPorId(this.inscripcion[0].ProgramaAcademicoId);
    console.log("PERSONA ID", this.info_persona_id, this.inscripcion, this.proyectoAcademico);
    this.persona = await this.consultarTercero(this.info_persona_id);
    this.autenticationService.getRole().then(
      async (rol: any) => {
        // const r = ROLES.ADMIN_SGA;
        // console.log("ROL: ", rol, r);
        const r1 = rol.find((role: string) => (role == ROLES.ADMIN_SGA));
        const r2 = rol.find((role: string) => (role == ROLES.ASISTENTE_ADMISIONES));
        const esEstudianteAdmitido = this.esEstudianteAdmitido(this.inscripcion)
        if (r1 || r2 || esEstudianteAdmitido) {
          // if (esEstudianteAdmitido && !r1 && !r2) {
          //   //const estudiante: any = await this.buscarInscritoAdmitido()
          // //   console.log(estudiante, Object.keys(estudiante[0]).length)
          // //   if (Object.keys(estudiante[0]).length > 0) {
          // //     this.estaAutorizado = true;
          // //     console.log("HAY TERCERO");
          // //   } else {
          // //     console.log("NO HAY TERCERO");
          // //   }
          // // } else {
          // //   this.estaAutorizado = true;
          // //   console.log(r1, r2, r3);
          // }
          this.estaAutorizado = true;
        }
        console.log(this.estaAutorizado);
      }
    );
    //this.persona = await this.consultarTercero(this.info_persona_id);
    console.log(this.persona)
  }

  // async ngOnInit() {
  //   this.initFormularios();
  //   this.cargarDatosFormularios();

  //   const email: any = this.autenticationService.getMail();
  //   this.info_persona_id = await this.recuperarTerceroId(email.__zone_symbol__value)
  //   this.inscripcion = await this.buscarInscritoAdmitido()
  //   this.persona = await this.consultarTercero(this.info_persona_id);
  //   this.autenticationService.getRole().then(
  //     async (rol: any) => {
  //       const r1 = rol.find((role: string) => (role == ROLES.ADMIN_SGA));
  //       const r2 = rol.find((role: string) => (role == ROLES.ASISTENTE_ADMISIONES));
  //       if (r1 || r2 || this.esEstudianteAdmitido(this.inscripcion)) {
  //         // if (r3 && !r1 && !r2) {
  //         //   //const estudiante: any = await this.buscarInscritoAdmitido()
  //         //   console.log(estudiante, Object.keys(estudiante[0]).length)
  //         //   if (Object.keys(estudiante[0]).length > 0) {
  //         //     this.estaAutorizado = true;
  //         //     console.log("HAY TERCERO");
  //         //   } else {
  //         //     console.log("NO HAY TERCERO");
  //         //   }
  //         // } else {
  //         //   this.estaAutorizado = true;
  //         //   console.log(r1, r2, r3);
  //         // }
  //         this.estaAutorizado = true;
  //       }
  //       console.log(this.estaAutorizado);
  //     }
  //   );
  //   //this.persona = await this.consultarTercero(this.info_persona_id);
  //   console.log(this.persona)
  // }

  esEstudianteAdmitido(estudiante: any) {
    console.log(estudiante, Object.keys(estudiante[0]).length)
    if (Object.keys(estudiante[0]).length > 0) {
      //this.estaAutorizado = true;
      console.log("HAY TERCERO");
      return true
    } else {
      console.log("NO HAY TERCERO");
      return false
    }
  }

  buscarInscritoAdmitido() {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=PersonaId:' + this.info_persona_id + ',EstadoInscripcionId.Id:2&sortby=Id&order=asc')
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

  async recuperarTerceroId(userEmail: any) {
    let persona: any = await this.recuperarTerceroByUsuario(userEmail);
    console.log("RECUPERACION USER 1",persona);
  
    if (Object.keys(persona[0]).length > 0) {
      return persona[0].Id
    } else {
      let emailUser: string = userEmail.slice(0, userEmail.indexOf('@'));
      persona = await this.recuperarTerceroByUsuario(emailUser);
      console.log("RECUPERACION USER 1",persona);
      if (Object.keys(persona[0]).length > 0) {
        return persona[0].Id
      } else {
        return 0;
      }
    }
  }

  recuperarTerceroByUsuario(usuario: any) {
    return new Promise((resolve, reject) => {
      this.tercerosService.get('tercero?query=UsuarioWSO2:' + usuario)
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

  recuperarProyectoPorId(proyectoId: any) {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia/' + proyectoId)
        .subscribe((res: any) => {
          console.log(res);
          resolve(res.Nombre)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('admision.facultades_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  // MANJEO ARCHIVOS //

  onChangeSelectFiles(label: string, event: any): void {
    const files = <File[]>Object.values(event.target.files);
    const newFiles = files.map(f => {
      return { file: f, urlTemp: URL.createObjectURL(f), err: false }
    });
    this.soportes[label].archivosLocal = this.soportes[label].archivosLocal!.concat(newFiles);
    const nameFiles = this.passFilesToFormControl(this.soportes[label].archivosLocal ?? [], this.soportes[label].archivosLinea ?? []);
    const errs = this.validateFiles(this.soportes[label].tipoArchivos ?? '', this.soportes[label].tamMBArchivos ?? 0, this.soportes[label].archivosLocal ?? []);
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

  validateFiles(tipoArchivos: string, tamMBArchivos: number, archivosLocal: any[]) {
    let errTipo = false;
    let errTam = false;
    archivosLocal.forEach(f => {
      if (tipoArchivos.indexOf(f.file.type.split('/')[1]) === -1) {
        f.err = true;
        errTipo = true;
      } else if (f.file.size > (tamMBArchivos * 1024000)) {
        f.err = true;
        errTam = true;
      } else {
        f.err = false;
      }
    });
    return { "errTipo": errTipo, "errTam": errTam }
  }

  previewFile(url: string): void {
    const h = screen.height * 0.65;
    const w = h * 3 / 4;
    const left = (screen.width * 3 / 4) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    window.open(url, '', 'toolbar=no,' +
      'location=no, directories=no, status=no, menubar=no,' +
      'scrollbars=no, resizable=no, copyhistory=no, ' +
      'width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
  }

  deleteSelectedFile(label: string, fileName: string): void {
    const idf = this.soportes[label].archivosLocal!.findIndex(f => f.file.name == fileName)
    if (idf != -1) {
      this.soportes[label].archivosLocal!.splice(idf, 1);
      const nameFiles = this.passFilesToFormControl(this.soportes[label].archivosLocal ?? [], this.soportes[label].archivosLinea ?? []);
      const errs = this.validateFiles(this.soportes[label].tipoArchivos ?? '', this.soportes[label].tamMBArchivos ?? 0, this.soportes[label].archivosLocal ?? []);
      this.soportes[label].validaArchivos = errs;
    }
  }

  deleteSelectedFileLinea(label: string, idFile: number): void {
    const idf = this.soportes[label].archivosLinea!.findIndex(f => f.Id == idFile);
    if (idf != -1) {
      this.soportes[label].archivosLinea!.splice(idf, 1);
      this.soportes[label].archivosDelete!.push(idFile);
      const nameFiles = this.passFilesToFormControl(this.soportes[label].archivosLocal ?? [], this.soportes[label].archivosLinea ?? []);
      const errs = this.validateFiles(this.soportes[label].tipoArchivos ?? '', this.soportes[label].tamMBArchivos ?? 0, this.soportes[label].archivosLocal ?? []);
      this.soportes[label].validaArchivos = errs;
    }
  }

  // MANJEO ARCHIVOS //

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

  cargarLocalidades() {
    return new Promise((resolve, reject) => {
      this.ubicacionService.get('lugar?limit=0&query=TipoLugarId__Id:3')
        .subscribe((res: any) => {
          this.localidades = res;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.localidad_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  cargarSituacionesLaborales() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro?limit=0&query=TipoParametroId%3A89')
        .subscribe((res: any) => {
          this.situacionesLaboral = res.Data;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.situaciones_laborales_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  cargarEstratos() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro?limit=0&query=TipoParametroId%3A90')
        .subscribe((res: any) => {
          this.estratos = res.Data;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.estratos_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  cargarNucleoFamiliar() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro?limit=0&query=TipoParametroId%3A91')
        .subscribe((res: any) => {
          this.nuceloFamiliar = res.Data;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.nucleo_familiar_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  cargarUbicacionesResidencia() {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('parametro?limit=0&query=TipoParametroId%3A92')
        .subscribe((res: any) => {
          this.ubicacionesResidencia = res.Data;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.ubicaciones_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  guardar() {
    if (this.validarFormulario()) {
      this.popUpManager.showPopUpGeneric(
        this.translate.instant('legalizacion_matricula.titulo'),
        this.translate.instant('legalizacion_matricula.crear_legalizacion'),
        MODALS.INFO,
        true).then(
          (action) => {
            if (action.value) {
              this.prepararCreacion();
            }
          });
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_matricula.formulario_error'));
    }
  }

  validarArchivos() {
    let completos = true;
    const situacion = this.situacionesLaboral.find((situacion: any) => situacion.Id == this.infoSocioEconomicaPersonal.get('situacion_laboral')!.value)

    for (const soporte in this.soportes) {
      const item = this.soportes[soporte];
      
      if (item.archivosLocal && !(item.archivosLocal.length > 0)) {
        if (soporte == 'soporteSituacionLaboral' && situacion.Nombre == 'Desempleado') {
          continue;
        }
        completos = false;
        break;
      }
    }

    console.log(completos, this.soportes, situacion);
    return completos;
  }

  validarFormulario() {
    this.marcarFormularios();
    if (this.formInfoSocioEconomicaPersonal.valid && this.formInfoSocioEconomicaCosteara.valid && this.formDocsGenerales.valid && this.validarArchivos()) {
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
    newLegalizacionMatricula.Localidad = this.localidades.find((localidad: any) => localidad.Id == this.formInfoSocioEconomicaPersonal.get('localidad')?.value).Nombre
    newLegalizacionMatricula.ColegioGraduado = this.formInfoSocioEconomicaPersonal.get('colegio')?.value;
    newLegalizacionMatricula.PensionMensual11 = Number(this.formInfoSocioEconomicaPersonal.get('pension_valor')?.value);
    newLegalizacionMatricula.PensionMensualSM11 = Number(this.formInfoSocioEconomicaPersonal.get('pension_valor_smv')?.value);
    newLegalizacionMatricula.NucleoFamiliar = this.nuceloFamiliar.find((nucleo: any) => nucleo.Id == this.formInfoSocioEconomicaPersonal.get('nucleo_familiar')?.value).Nombre
    newLegalizacionMatricula.SituacionLaboral = this.situacionesLaboral.find((situacion: any) => situacion.Id == this.formInfoSocioEconomicaPersonal.get('situacion_laboral')?.value).Nombre
    newLegalizacionMatricula.DireccionResidenciaCostea = this.formInfoSocioEconomicaCosteara.get('direccion_residencia_costeara')?.value;
    newLegalizacionMatricula.EstratoCostea = this.estratos.find((estrato: any) => estrato.Id == this.formInfoSocioEconomicaCosteara.get('estrato')?.value).Nombre
    newLegalizacionMatricula.UbicacionResidenciaCostea = this.ubicacionesResidencia.find((ubicacion: any) => ubicacion.Id == this.formInfoSocioEconomicaCosteara.get('ubicacion_residencia')?.value).Nombre
    newLegalizacionMatricula.IngresosCostea = this.formInfoSocioEconomicaCosteara.get('ingresos_ano_anterior')?.value;
    newLegalizacionMatricula.IngresosCosteaSM = this.formInfoSocioEconomicaCosteara.get('ingresos_ano_anterior_sm')?.value;

    const archivos: { [key: string]: any } = this.prepararArchivos();
    console.log(archivos);
    let idsArchivos: any = {};
    const propiedades = Object.keys(archivos);


    for (const propiedad of propiedades) {
      console.log(propiedades, propiedad)
      const carpetaArchivos = archivos[propiedad];
      console.log(`Propiedad: ${propiedad}`, carpetaArchivos);
      let ids = await this.cargarArchivos(carpetaArchivos);
      idsArchivos[propiedad] = ids
      console.log(idsArchivos)
    }

    newLegalizacionMatricula.SoporteDiploma = this.prepareIds2Stringify(idsArchivos['diplomaBachiller'], 'diplomaBachiller');
    newLegalizacionMatricula.SoportePension = this.prepareIds2Stringify(idsArchivos['soportePension'], 'soportePension');
    newLegalizacionMatricula.SoporteNucleo = this.prepareIds2Stringify(idsArchivos['soporteNucleo'], 'soporteNucleo');
    newLegalizacionMatricula.SoporteEstratoCostea = this.prepareIds2Stringify(idsArchivos['soporteEstrato'], 'soporteEstrato');
    newLegalizacionMatricula.SoporteIngresosCostea = this.prepareIds2Stringify(idsArchivos['soporteIngresos'], 'soporteIngresos');
    newLegalizacionMatricula.SoporteDocumental = this.prepareIds2Stringify(idsArchivos['documentosGeneral'], 'documentosGeneral');
    if (idsArchivos['soporteSituacionLaboral']) {
      newLegalizacionMatricula.SoporteSituacionLaboral = this.prepareIds2Stringify(idsArchivos['soporteSituacionLaboral'], 'soporteSituacionLaboral');
    }

    console.log(newLegalizacionMatricula);

    let res = await this.crearLegalizacionMatricula(newLegalizacionMatricula)
    console.log(res)
  }

  async crearLegalizacionMatricula(legalizacionBody: LegalizacionMatricula) {
    return new Promise((resolve, reject) => {
      this.loading = true;
      this.inscripcionMidService.post('legalizacion/base', legalizacionBody)
        .subscribe((res: any) => {
          this.loading = false;
          this.popUpManager.showSuccessAlert(this.translate.instant('legalizacion_matricula.legalizacion_creacion_ok'));
          resolve(res.data);
        },
          (error: HttpErrorResponse) => {
            this.loading = false;
            this.popUpManager.showErrorAlert(
              this.translate.instant('legalizacion_matricula.legalizacion_creacion_error')
            );
          });
    });
  }

  prepararArchivos(): any[] {
    const idTipoDocument = 72; // carpeta Nuxeo
    let archivos: any = {}
    for (const soporte in this.soportes) {
      const archivosLoc = this.soportes[soporte].archivosLocal!;
      let newArchivosLoc: any = [];
    
      for (const archivo of archivosLoc) {
        const newArchivo = {
          IdDocumento: idTipoDocument,
          nombre: (archivo.file.name).split('.')[0],
          descripcion: "Soporte Legalización de matricula",
          file: archivo.file
        }
        newArchivosLoc.push(newArchivo);
        archivos[soporte] = newArchivosLoc;
      }
    }
    return archivos
  }

  cargarArchivos(archivos: any): Promise<number[]> {
    return new Promise<number[]>((resolve) => {
      this.gestorDocumentalService.uploadFiles(archivos).subscribe(
        (respuesta: any[]) => {
          const listaIds = respuesta.map(f => {
            return f.res.Id;
          });
          resolve(listaIds);
        }
      );
    });
  }

  prepareIds2Stringify(idsArchivos: number[], nameField: string): string {
    let result: any = {}
    result[nameField] = []
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
}
