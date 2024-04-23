import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SoporteParams } from 'src/app/models/forms/define-form-fields';

@Component({
  selector: 'app-legalizacion-matricula',
  templateUrl: './legalizacion-matricula.component.html',
  styleUrls: ['./legalizacion-matricula.component.scss']
})
export class LegalizacionMatriculaComponent implements OnInit {

  constructor(private fb: FormBuilder) {}

  isLinear = false;

  formInfoPersonal!: FormGroup;
  formInfoSocioEconomicaPersonal!: FormGroup;
  formInfoSocioEconomicaCosteara!: FormGroup;
  formDocsGenerales!: FormGroup;

  infoPersonal = this.fb.group({
    'tipo_identificacion': ['', Validators.required],
    'numero_identificacion': ['', Validators.required],
    'primer_nombre': ['', Validators.required],
    'segundo_nombre': ['', Validators.required],
    'primer_apellido': ['', Validators.required],
    'segundo_apellido': ['', Validators.required],
    'fecha_nacimiento': ['', Validators.required],
    'celular': ['', Validators.required],
    'correo': ['', Validators.required],
    'genero': ['', Validators.required],
  })

  infoSocioEconomicaPersonal = this.fb.group({
    'direccion_residencia': ['', Validators.required],
    'localidad': ['', Validators.required],
    'colegio': ['', Validators.required],
    'diploma_bachiller': ['', Validators.required],
    'pension_valor': ['', Validators.required],
    'pension_valor_smv': ['', Validators.required],
    'soporte_pension_valor': ['', Validators.required],
    'nucleo_familiar': ['', Validators.required],
    'soporte_nucleo_familiar': ['', Validators.required],
    'situacion_laboral': ['', Validators.required],
    'soporte_situacion_laboral': ['', Validators.required],
  })

  infoSocioEconomicaCosteara = this.fb.group({
    'direccion_residencia_costeara': ['', Validators.required],
    'estrato': ['', Validators.required],
    'soporte_estrato': ['', Validators.required],
    'ingresos_ano_anterior': ['', Validators.required],
    'ingresos_ano_anterior_sm': ['', Validators.required],
    'soporte_ingresos_ano_anterior': ['', Validators.required],
  })

  docsGenerales = this.fb.group({
    'documentos': ['', Validators.required]
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

  ngOnInit() {
    this.formInfoPersonal = this.infoPersonal;
    this.formInfoSocioEconomicaPersonal = this.infoSocioEconomicaPersonal;
    this.formInfoSocioEconomicaCosteara = this.infoSocioEconomicaCosteara;
    this.formDocsGenerales = this.docsGenerales;
  }

  onChangeSelectFiles(label: string, event: any): void {
    const files = <File[]>Object.values(event.target.files);
    const newFiles = files.map(f => {
      return {file: f, urlTemp: URL.createObjectURL(f), err: false}
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
    return {"errTipo": errTipo, "errTam": errTam}
  }
}
