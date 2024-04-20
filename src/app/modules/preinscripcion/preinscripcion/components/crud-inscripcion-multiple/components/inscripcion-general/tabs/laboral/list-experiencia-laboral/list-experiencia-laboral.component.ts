import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Documento } from 'src/app/models/documento/documento';
import { DocumentoService } from 'src/app/services/documento.service';
import { ExperienciaService } from 'src/app/services/experiencia.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-list-experiencia-laboral',
  templateUrl: './list-experiencia-laboral.component.html',
  styleUrls: ['./list-experiencia-laboral.component.scss']
})
export class ListExperienciaLaboralComponent implements OnInit {
  uid!: number;
  id!: number;
  eid!: number;
  settings: any;
  //source: LocalDataSource = new LocalDataSource();
  data!: Array<any>;
  detalleExp: any;
  indexSelect!: number;
  crud = false;
  selected = 0;

  @Input('ente_id')
  set name(ente_id: number) {
    if (ente_id !== undefined && ente_id !== null && ente_id.toString() !== '') {
      this.eid = ente_id;
      this.loadData();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  percentage!: number;
  persona_id: number;

  displayedColumns = ['empresa', 'cargo', 'fecha_inicio', 'fecha_fin', 'estado', 'observacion', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private popUpManager: PopUpManager,
    private inscripcionMidService: InscripcionMidService,
    private documentoService: DocumentoService,
    private utilidades: UtilidadesService,
    private snackBar: MatSnackBar) {
    if (this.eid !== undefined && this.eid !== null && this.eid.toString() !== '') {
      this.loadData();
    }
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.persona_id = this.userService.getPersonaId();
    if (this.persona_id !== undefined && this.persona_id !== null && this.persona_id.toString() !== '') {
      this.loadData();
    }
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.inscripcionMidService.get('experiencia-laboral/tercero/?Id=' + this.persona_id).subscribe(
      (response: any) => {
        if (response !== null && response.status == '200') {
          this.data = <Array<any>>response.data;
          this.getPercentage(1);
          this.data.forEach(async (expLab) => {
            let estadoDoc = await <any>this.cargarEstadoDocumento(expLab.Soporte);
            expLab.Estado = estadoDoc.estadoObservacion;
            expLab.Observacion = estadoDoc.observacion;
            this.dataSource = new MatTableDataSource(this.data)
          });
        } else if (response !== null && response.status == '404') {
          this.popUpManager.showAlert('', this.translate.instant('experiencia_laboral.no_data'));
          this.getPercentage(0);
          this.dataSource = new MatTableDataSource();
        } else {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.error'),
            this.translate.instant('experiencia_laboral.error'));
            this.getPercentage(0);
            this.dataSource = new MatTableDataSource();
          }
      },
      (error: HttpErrorResponse) => {
        Swal.fire({
          icon: 'error',
          title: error.status + '',
          text: this.translate.instant('ERROR.' + error.status),
          footer: this.translate.instant('experiencia_laboral.cargar_experiencia'),
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
        this.getPercentage(0);
        //this.source.load([]);
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
    this.uid = 0;
    this.indexSelect = 0;
    this.detalleExp = [];
    this.irAIndexTab(0)
  }

  onEdit(event:any): void {
    this.id = event.Id;
    this.uid = event.Nit;
    this.indexSelect = event.index;
    this.detalleExp = this.data[0];
    this.crud = true;
    this.irAIndexTab(1)
  }

  onCreate(): void {
    this.uid = 0;
    this.crud = true;
    this.indexSelect = 0;
    this.detalleExp = [];
    this.irAIndexTab(1)
  }

  onChange(event:any) {
    if (event) {
      this.uid = 0;
      this.indexSelect = 0;
      this.detalleExp = [];
      this.loadData();
      this.irAIndexTab(0)
    }
  }

  getPercentage(event:any) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  itemselec(event:any): void {
    this.id = event.data.Id;
  }

  onDelete(event:any): void {
    const opt: any = {
      title: this.translate.instant('GLOBAL.eliminar'),
      text: this.translate.instant('experiencia_laboral.eliminar'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
      cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
    };
    Swal.fire(opt)
      .then((willDelete) => {
        if (willDelete.value) {
          //todo: falta parametro
          this.inscripcionMidService.delete('experiencia-laboral/', event).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.snackBar.open(this.translate.instant('GLOBAL.experiencia_laboral'), '', { duration: 3000, panelClass: ['info-snackbar'] }) 
            }
          },
            (error: HttpErrorResponse) => {
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                footer: this.translate.instant('GLOBAL.eliminar') + '-' +
                  this.translate.instant('GLOBAL.experiencia_laboral'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
        }
      });
  }

  tabChanged(event: MatTabChangeEvent) {
    this.irAIndexTab(event.index)
  }

  irAIndexTab(index:number){
    this.selected = index
  }
}