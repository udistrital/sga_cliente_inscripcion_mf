import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Documento } from 'src/app/models/documento/documento';
import { DocumentoService } from 'src/app/services/documento.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-list-formacion-academica',
  templateUrl: './list-formacion-academica.component.html',
  styleUrls: ['./list-formacion-academica.component.scss']
})
export class ListFormacionAcademicaComponent implements OnInit {
  uid!: number;
  id!: number;
  pid!: number;
  UpdateInfo: boolean = false;
  cambiotab: boolean = false;
  settings: any;
  persona_id: number;

  displayedColumns = ['nit', 'nombre', 'pais', 'programa', 'fecha_inicio', 'fecha_fin',
  'estado', 'observacion', 'acciones'];

  dataSource!: MatTableDataSource<any>;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  loading: boolean = true;
  percentage!: number;

  selected = 0;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private sgaMidService: SgaMidService,
    private documentoService: DocumentoService,
    private utilidades: UtilidadesService,
    private snackBar: MatSnackBar) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.persona_id = this.userService.getPersonaId();
    //this.loadData();
    this.loading = true;
  }

  getPercentage(event:any) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }


  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.loading = true;
    this.sgaMidService.get('formacion_academica?Id=' + this.persona_id)
    .subscribe(response => {
      if (response !== null && response.Response.Code === '404') {
        this.loading = false;
        this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
      } else if (response !== null && response.Response.Code === '200') {
        if (Object.keys(response.Response.Body[0]).length > 0) {
        const data = <Array<any>>response.Response.Body[0];
        const dataInfo = <Array<any>>[];
        data.forEach(async element => {
          const FechaI = element.FechaInicio;
          const FechaF = element.FechaFinalizacion;
          element.FechaInicio = FechaI.substring(0, 2) + '-' + FechaI.substring(2, 4) + '-' + FechaI.substring(4, 8);
          if(FechaF !== ''){
            element.FechaFinalizacion = FechaF.substring(0, 2) + '-' + FechaF.substring(2, 4) + '-' + FechaF.substring(4, 8);
          }else{
            element.FechaFinalizacion = 'Actual';
          }
          let estadoDoc = await <any>this.cargarEstadoDocumento(element.Documento);
          element.Estado = estadoDoc.estadoObservacion;
          element.Observacion = estadoDoc.observacion;
          dataInfo.push(element);
          this.getPercentage(1);
          console.log(dataInfo)
          this.dataSource = new MatTableDataSource(dataInfo);
        });
        this.loading = false;
      } else {
        this.getPercentage(0);
        //this.source.load([]);
        this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
      }
      } else {
        this.loading = false;
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.400'));
      }
    },
    (error: HttpErrorResponse) => {
      this.loading = false;
      this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
    });
  }

  cargarEstadoDocumento(Id: any) {
    return new Promise((resolve) => {
      this.documentoService.get('documento/' + Id).subscribe(
        (doc: Documento) => {
          let estadoDoc = this.utilidades.getEvaluacionDocumento(doc.Metadatos);
          resolve(estadoDoc)
        });
    });
  }

  ngOnInit() {
    this.id = 0;
    this.uid = 0;
    this.pid = 0;
    this.UpdateInfo = false;
    this.loadData();
    this.cambiotab = false;
  }

  activetab(): void {
    if(this.selected==0){
      this.selected = 1
    }else{
      this.selected = 0
    }
  }

  onEdit(event:any): void {
    this.id = event.Id;
    this.uid = event.Nit;
    this.pid = event.ProgramaAcademico.Id;
    this.UpdateInfo = true;
    this.activetab();
  }

  onCreate(event:any): void {
    this.uid = 0;
    this.activetab();
  }

  selectTab(event:any): void {
    console.log(event)
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  onChange(event:any) {
  }

  itemselec(event:any): void {
    this.id = event.data.Id;
    this.uid = event.data.Nit;
    this.pid = event.data.ProgramaAcademico.Id;
  }

  onDelete(event:any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('formacion_academica.eliminar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          this.sgaMidService.delete('formacion_academica', event.data).subscribe(res => {
            if (res !== null) {
              this.loadData();
                this.snackBar.open(this.translate.instant('GLOBAL.formacion_academica'), '', { duration: 3000, panelClass: ['info-snackbar'] })
            }
            this.loading = false;
          },
            (error: HttpErrorResponse) => {
              this.loading = false;
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.eliminar') + '-' +
                  this.translate.instant('GLOBAL.formacion_academica'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
        }
        this.loading = false;
      });
  }
}
