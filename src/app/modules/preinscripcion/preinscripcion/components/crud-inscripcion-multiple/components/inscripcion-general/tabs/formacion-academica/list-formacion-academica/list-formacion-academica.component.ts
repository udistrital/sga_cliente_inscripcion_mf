import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Documento } from 'src/app/models/documento/documento';
import { DocumentoService } from 'src/app/services/documento.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';
import { formatDate } from '@angular/common';

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
  settings: any;
  persona_id!: number | null;
  loading: boolean = true;
  

  displayedColumns = ['nit', 'nombre', 'pais', 'programa', 'fecha_inicio', 'fecha_fin',
    'estado', 'observacion', 'acciones'];

  dataSource!: MatTableDataSource<any>;

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  percentage!: number;

  selected = 0;
  source: any;

  constructor(
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private userService: UserService,
    private inscripcionMidService: InscripcionMidService,
    private documentoService: DocumentoService,
    private utilidades: UtilidadesService,
    private snackBar: MatSnackBar) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.loading = true;    
  }

  getPercentage(event: any) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }


  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.inscripcionMidService.get('academico/formacion?Id=' + this.persona_id)
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
            if (FechaF !== '') {
              element.FechaFinalizacion = FechaF.substring(0, 2) + '-' + FechaF.substring(2, 4) + '-' + FechaF.substring(4, 8);
            } else {
              element.FechaFinalizacion = 'Actual';
            } let estadoDoc = await <any>this.cargarEstadoDocumento(element.Documento);
            element.Estado = estadoDoc.estadoObservacion;
            element.Observacion = estadoDoc.observacion;
            dataInfo.push(element);
            this.getPercentage(1);
            this.source.load(dataInfo);
          });
          this.loading = false;
        } 
      } 
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

  async ngOnInit() {
    await this.initializePersonaId();
    this.id = 0;
    this.uid = 0;
    this.pid = 0;
    this.UpdateInfo = false;
    this.irAIndexTab(0)
    this.loadData();
  }

  async initializePersonaId() {
    try {
      this.persona_id = await this.userService.getPersonaId();
    } catch (error) {
      this.persona_id = 1; // Valor por defecto en caso de error
      console.error('Error al obtener persona_id:', error);
    }
  }

  onEdit(event: any): void {
    this.id = event.Id;
    this.uid = event.Nit;
    this.pid = event.ProgramaAcademico.Id;
    this.UpdateInfo = true;
    this.irAIndexTab(1)
  }

  onCreate(): void {
    this.uid = 0;
    this.irAIndexTab(1)
  }

  onChange(event: any) {
    this.irAIndexTab(0)
  }

  itemselec(event: any): void {
    this.id = event.Id;
    this.uid = event.Nit;
    this.pid = event.ProgramaAcademico.Id;
  }

  onDelete(event: any): void {
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
      .then((willDelete: any) => {
        if (willDelete.value) {
          //todo, raro el ednpoint
          this.inscripcionMidService.delete('academico/formacion', event).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.snackBar.open(this.translate.instant('GLOBAL.confirmarEliminar'), '', { duration: 3000, panelClass: ['info-snackbar'] })
            }
          },
            (error: HttpErrorResponse) => {
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
      });
  }

  tabChanged(event: MatTabChangeEvent) {
    this.irAIndexTab(event.index)
  }

  irAIndexTab(index: number) {
    this.selected = index
  }
}