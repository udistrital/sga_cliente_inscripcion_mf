import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { validateLang } from 'src/app/app.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from './components/modal/modal.component';
//import multiMonthPlugin from '@fullcalendar/multimonth'
import { OikosService } from 'src/app/services/oikos.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ParametrosService } from 'src/app/services/parametros.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';


interface Food {
  value: string;
  viewValue: string;
}


interface colums {
  Orden: number;
  Credencial: string;
  Nombres: string;
  Apellidos: string;
  TipoDocumento: string;
  Documento: string;
  EstadoAdmision: string;
  EstadoRevision: string;
}

interface InfoSocioEconomica {
  Orden: number;
  Concepto: string;
  Informacion: string;
  Estado: string;
}

interface InfoPersonal1 {
  TipoIdentificacion: string;
  NumeroIdentificacion: string;
  PrimerNombre: string;
  SegundoNombre: string;
  PrimerApellido: string;
  SegundoApellido: string;
}

interface InfoPersonal2 {
  FechaNacimiento: string;
  Numero: string;
  Correo: string;
  Genero: string;
}

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
  dataSource = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();
  dataSource3 = new MatTableDataSource<any>();
  dataSource4 = new MatTableDataSource<any>();
  dataSource5 = new MatTableDataSource<any>();
  dataSource6 = new MatTableDataSource<any>();

  colums: string [] = ['Orden', 'Credencial', 'Nombres', 'Apellidos', 'TipoDocumento', 'Documento', 'EstadoAdmision', 'EstadoRevision', 'Acciones'];
  columns2: string [] = ['Orden', 'Concepto', 'Informacion', 'Soporte', 'Estado'];

  infoPersonal1: string [] = ['TipoIdentificacion', 'NumeroIdentificacion', 'PrimerNombre', 'SegundoNombre', 'PrimerApellido', 'SegundoApellido'];
  infoPersonal2: string [] = ['FechaNacimiento', 'Numero', 'Correo', 'Genero'];


  firstFormGroup = this._formBuilder.group({
    validatorProyecto: ['', Validators.required],
    validatorPeriodo: ['', Validators.required],
    validatorAño: ['', Validators.required],
    validatorNivel: ['', Validators.required],
    validatorFacultad: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = true; //////////////////////////////////////////////////////

  foods: Food[] = [
    {value: 'steak-0', viewValue: 'Steak'},
    {value: 'pizza-1', viewValue: 'Pizza'},
    {value: 'tacos-2', viewValue: 'Tacos'},
  ];

  proyectosCurriculares!: any[]
  anios!: any[]
  periodos!: any[]
  facultades!: any[]

  constructor(
    private _formBuilder: FormBuilder, 
    private dialog: MatDialog, 
    private translate: TranslateService,
    private oikosService: OikosService,
    private parametrosService: ParametrosService,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });

    const colums: colums[] = [
      {Orden: 1, Credencial: '123', Nombres: 'Juan', Apellidos: 'Perez', TipoDocumento: 'Cedula', Documento: '1234567890', EstadoAdmision: 'Admitido', EstadoRevision: 'Revisado'},
      {Orden: 2, Credencial: '456', Nombres: 'Maria', Apellidos: 'Rodriguez', TipoDocumento: 'Cedula', Documento: '0987654321', EstadoAdmision: 'Admitido', EstadoRevision: 'Revisado'},
      {Orden: 3, Credencial: '789', Nombres: 'Pedro', Apellidos: 'Gomez', TipoDocumento: 'Cedula', Documento: '1357924680', EstadoAdmision: 'Admitido', EstadoRevision: 'Revisado'},
    ];

    const combinedData = colums.map((detalles, index) => ({
      colums: colums[index]
    }));

    this.dataSource.data = combinedData;

    const infoPersonal1: InfoPersonal1[] = [
      {TipoIdentificacion: 'Cedula', NumeroIdentificacion: '1234567890', PrimerNombre: 'Juan', SegundoNombre: 'Carlos', PrimerApellido: 'Perez', SegundoApellido: 'Rodriguez'},
    ];

    this.dataSource5.data = infoPersonal1.map(info => ({infoPersonal1: info}));

    const infoPersonal2: InfoPersonal2[] = [
      {FechaNacimiento: '01/01/1990', Numero: '1234567890', Correo: 'asd@correo.com', Genero: 'Masculino'},
    ];

    this.dataSource6.data = infoPersonal2.map(info => ({infoPersonal2: info}));

    const infoSocioEconomica: InfoSocioEconomica[] = [
      {Orden: 1, Concepto: 'Dirección', Informacion: 'Fila 1', Estado: 'No revisado'},
      {Orden: 2, Concepto: 'Nombre colegio', Informacion: 'Fila 2', Estado: 'No revisado'},
      {Orden: 3, Concepto: 'Valor de la pension mensual pagada grado once', Informacion: 'Fila 3', Estado: 'No revisado'},
      {Orden: 4, Concepto: 'Nucleo familiar', Informacion: 'Fila 4', Estado: 'No revisado'},
      {Orden: 5, Concepto: 'Situacion laboral', Informacion: 'Fila 5', Estado: 'No revisado'},
    ];

    this.dataSource2.data = infoSocioEconomica.map(info => ({columns2: info}));

    const infoSocioEconomicaCosteo: InfoSocioEconomica[] = [
      {Orden: 1, Concepto: 'Direccion de residencia', Informacion: 'Fila 1', Estado: 'No revisado'},
      {Orden: 2, Concepto: 'Valor de los ingresos', Informacion: 'Fila 2', Estado: 'No revisado'},
    ];

    this.dataSource3.data = infoSocioEconomicaCosteo.map(info => ({columns2: info}));

    const resumenGeneral: InfoSocioEconomica[] = [
      {Orden: 1, Concepto: 'Soporte genera', Informacion: 'Fila 1', Estado: 'No revisado'},
    ];

    this.dataSource4.data = resumenGeneral.map(info => ({columns2: info}));

  }

  async ngOnInit() {
    validateLang(this.translate);
    //await this.cargarProyectos();
    await this.cargarAnios();
    await this.cargarPeriodos();
    await this.cargarFacultades();
  }

  get proyecto() {
    const proyecto: Proyecto = {opcion: 1, nombre: 'Ing de sistemas'};
    return proyecto;
  }

  cargarFacultades() {
    return new Promise((resolve, reject) => {
      this.oikosService.get('dependencia_padre/FacultadesConProyectos?Activo:true&limit=0')
        .subscribe((res: any) => {
          console.log(res);
          this.facultades = res;
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.localidad_error'));
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.situaciones_laborales_error'));
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
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.situaciones_laborales_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  onFacultadChange(event: any) {
    const facultad = this.facultades.find((facultad: any) => facultad.Id === event.value);
    this.proyectosCurriculares = facultad.Opciones;
  }

  GenerarBusqueda() {
    const proyecto = this.firstFormGroup.get('validatorProyecto')?.value;
    const periodo = this.firstFormGroup.get('validatorPeriodo')?.value;
    const anio = this.firstFormGroup.get('validatorAño')?.value;
    console.log(proyecto, anio, periodo);

    return new Promise((resolve, reject) => {
      // this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + '&sortby=Id&order=asc')
      this.inscripcionService.get('inscripcion?query=ProgramaAcademicoId:' + proyecto + ',PeriodoId:' + periodo + '&sortby=Id&order=asc')
        .subscribe((res: any) => {
          console.log(res);
          resolve(res)
        },
          (error: any) => {
            this.popUpManager.showErrorAlert(this.translate.instant('legalizacion_admision.situaciones_laborales_error'));
            console.log(error);
            reject([]);
          });
    });
  }

  openModal(data: any) {
    const dialogRef = this.dialog.open(ModalComponent, {
      data: { title: 'Modal', content: data }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Modal cerrado');
    });
  }


  editar = (data: any) => {
    console.log('Editando...');
    console.log(data);
    this.formulario = true;
  }

  cerrar = () => {
    this.formulario = false;
  }

}
