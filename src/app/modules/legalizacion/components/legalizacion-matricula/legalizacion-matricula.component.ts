import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SoporteParams } from 'src/app/models/forms/define-form-fields';
import { UbicacionService } from 'src/app/services/ubicacion.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { TranslateService } from '@ngx-translate/core';
import { MODALS } from 'src/app/models/informacion/diccionario';

@Component({
  selector: 'app-legalizacion-matricula',
  templateUrl: './legalizacion-matricula.component.html',
  styleUrls: ['./legalizacion-matricula.component.scss']
})
export class LegalizacionMatriculaComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private ubicacionService: UbicacionService,
    private parametrosService: ParametrosService,
    private tercerosService: TercerosService,
    private popUpManager: PopUpManager,
    private translate: TranslateService,
  ) { }

  isLinear = false;
  loading!: boolean;
  valorSML = 1300000;
  valorPension = 0;
  valorPensionSML = 0;
  valorIngresos = 0;
  valorIngresosSML = 0;

  //formInfoPersonal!: FormGroup;
  formInfoSocioEconomicaPersonal!: FormGroup;
  formInfoSocioEconomicaCosteara!: FormGroup;
  formDocsGenerales!: FormGroup;

  // infoPersonal = this.fb.group({
  //   'tipo_identificacion': ['', Validators.required],
  //   'numero_identificacion': ['', Validators.required],
  //   'primer_nombre': ['', Validators.required],
  //   'segundo_nombre': ['', Validators.required],
  //   'primer_apellido': ['', Validators.required],
  //   'segundo_apellido': ['', Validators.required],
  //   'fecha_nacimiento': ['', Validators.required],
  //   'celular': ['', Validators.required],
  //   'correo': ['', Validators.required],
  //   'genero': ['', Validators.required],
  // })

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
    // this.formGroup.patchValue({[label]: nameFiles});
    // this.formGroup.get(label)!.markAsTouched({onlySelf: true});
    //this.putErrorIfRequired(label, errs);
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
      // this.formGroup.patchValue({[label]: nameFiles});
      // this.formGroup.get(label)!.markAsTouched({onlySelf: true});
      // this.putErrorIfRequired(label, errs);
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
      // this.formGroup.patchValue({[label]: nameFiles});
      // this.formGroup.get(label)!.markAsTouched({onlySelf: true});
      // this.putErrorIfRequired(label, errs);
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.localidad_error'));
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.situaciones_laborales_error'));
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.estratos_error'));
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.nucleo_familiar_error'));
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.ubicaciones_error'));
            console.log(error);
            reject([]);
          });
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

  prepararCreacion() {
    
  }

  onPensionValorChange() {
    this.valorPensionSML = this.valorPension / this.valorSML;
  }

  onIngresosValorChange() {
    this.valorIngresosSML = this.valorIngresos / this.valorSML;
  }
}
