import { formatDate } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Documento } from 'src/app/models/documento/documento';
import { DocumentoService } from 'src/app/services/documento.service';
import { ExperienciaService } from 'src/app/services/experiencia.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
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
  cambiotab: boolean = false;
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

  loading: boolean;
  percentage!: number;
  persona_id: number;

  displayedColumns = ['empresa', 'cargo', 'fecha_inicio', 'fecha_fin', 'estado', 'observacion', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  constructor(private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private experienciaService: ExperienciaService,
    private userService: UserService,
    private popUpManager: PopUpManager,
    private organizacionService: OrganizacionService,
    private documentoService: DocumentoService,
    private utilidades: UtilidadesService,
    private snackBar: MatSnackBar) {
    if (this.eid !== undefined && this.eid !== null && this.eid.toString() !== '') {
      this.loadData();
    }
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.loading = false;
    this.persona_id = this.userService.getPersonaId();
    if (this.persona_id !== undefined && this.persona_id !== null && this.persona_id.toString() !== '') {
      this.loadData();
    }
  }

  cargarCampos() {
    this.settings = {
      columns: {
        NombreEmpresa: {
          title: this.translate.instant('GLOBAL.nombre_empresa'),
          width: '35%',
          valuePrepareFunction: (value:any) => {
            return value.NombreCompleto;
          },
        },
        Cargo: {
          title: this.translate.instant('GLOBAL.cargo'),
          width: '25%',
          valuePrepareFunction: (value:any) => {
            return value.Nombre;
          },
        },
        FechaInicio: {
          title: this.translate.instant('GLOBAL.fecha_inicio'),
          width: '20%',
          valuePrepareFunction: (value:any) => {
            return formatDate(value, 'yyyy-MM-dd', 'en');
          },
        },
        FechaFinalizacion: {
          title: this.translate.instant('GLOBAL.fecha_fin'),
          width: '20%',
          valuePrepareFunction: (value:any) => {
            if(value !== ''){
              return formatDate(value, 'yyyy-MM-dd', 'en');
            }else{
              return ('Actual')
            }
          },
        },
        Estado: {
          title: this.translate.instant('admision.estado'),
          width: '5%',
          valuePrepareFunction: (value:any) => {
            return value;
          },
        },
        Observacion: {
          title: this.translate.instant('admision.observacion'),
          width: '5%',
          valuePrepareFunction: (value:any) => {
            return value;
          },
        },
      },
      mode: 'external',
      actions: {
        add: true,
        edit: true,
        delete: true,
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
      },
      add: {
        addButtonContent: '<i class="nb-plus" title="' + this.translate.instant('experiencia_laboral.tooltip_crear') + '"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="' + this.translate.instant('experiencia_laboral.tooltip_editar') + '"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="' + this.translate.instant('experiencia_laboral.tooltip_eliminar') + '"></i>',
        confirmDelete: true,
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.loading = true;
    this.sgaMidService.get('experiencia_laboral/by_tercero?Id=' + this.persona_id).subscribe(
      (response: any) => {
        if (response !== null && response.Data.Code === '200') {
          this.data = <Array<any>>response.Data.Body[1];
          this.loading = false;
          this.getPercentage(1);
          this.data.forEach(async (expLab) => {
            let estadoDoc = await <any>this.cargarEstadoDocumento(expLab.Soporte);
            expLab.Estado = estadoDoc.estadoObservacion;
            expLab.Observacion = estadoDoc.observacion;
            console.log(this.data)
            this.dataSource = new MatTableDataSource(this.data)
          });
        } else if (response !== null && response.Data.Code === '404') {
          this.popUpManager.showAlert('', this.translate.instant('experiencia_laboral.no_data'));
          this.getPercentage(0);
          this.dataSource = new MatTableDataSource();
        } else {
          this.popUpManager.showAlert(this.translate.instant('GLOBAL.error'),
            this.translate.instant('experiencia_laboral.error'));
            this.getPercentage(0);
            this.dataSource = new MatTableDataSource();
          }
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        this.loading = false;
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
    this.indexSelect = NaN;
    this.detalleExp = undefined;
  }

  onEdit(event:any): void {
    console.log(event)
    this.id = event.Id;
    this.uid = event.Nit;
    this.indexSelect = event.index;
    this.detalleExp = this.data[0];
    this.crud = true;
    this.activetab();
  }

  onCreate(): void {
    this.uid = 0;
    this.crud = true;
    this.indexSelect = NaN;
    this.detalleExp = undefined;
    this.activetab();
  }

  selectTab(event:any): void {
    if (event.tabTitle === this.translate.instant('GLOBAL.lista')) {
      this.cambiotab = false;
    } else {
      this.cambiotab = true;
    }
  }

  activetab(): void {
    if(this.selected==0){
      this.selected = 1
    }else{
      this.selected = 0
    }
  }

  onChange(event:any) {
    if (event) {
      this.uid = 0;
      this.indexSelect = NaN;
      this.detalleExp = undefined;
      this.loadData();
      this.cargarCampos();
      this.cambiotab = false;
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
        this.loading = true;
        if (willDelete.value) {
          this.sgaMidService.delete('experiencia_laboral', event).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.snackBar.open(this.translate.instant('GLOBAL.experiencia_laboral'), '', { duration: 3000, panelClass: ['info-snackbar'] }) 
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
                  this.translate.instant('GLOBAL.experiencia_laboral'),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
        }
        this.loading = false;
      });
  }
}