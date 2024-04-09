import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { SolicitudDescuento } from 'src/app/models/descuento/solicitud_descuento';
import { Documento } from 'src/app/models/documento/documento';
import { CampusMidService } from 'src/app/services/campus_mid.service';
import { DescuentoAcademicoService } from 'src/app/services/descuento_academico.service';
import { DocumentoService } from 'src/app/services/documento.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { decrypt } from 'src/app/utils/util-encrypt';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-list-descuento-academico',
  templateUrl: './list-descuento-academico.component.html',
  styleUrls: ['./list-descuento-academico.component.scss']
})
export class ListDescuentoAcademicoComponent implements OnInit {
  uid!: number;
  persona!: number;
  programa!: number;
  periodo!: number;
  inscripcion!: number;
  settings: any;
  data!: Array<SolicitudDescuento>;
  solicituddescuento: any;
  listAlreadyUploaded: number[] = [];
  selected = 0
  displayedColumns = ['tipo_documento', 'estado', 'observacion', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  @Input('persona_id')
  set info(info: number) {
    this.persona = info;
  }

  @Input('inscripcion_id')
  set info2(info2: number) {
    this.inscripcion = info2;
    if (this.inscripcion !== undefined && this.inscripcion !== null && this.inscripcion !== 0 &&
      this.inscripcion.toString() !== '') {
      this.loadData();
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  loading: boolean;
  percentage!: number;

  constructor(private translate: TranslateService,
    private mid: CampusMidService,
    private sgaMidService: SgaMidService,
    private popUpManager: PopUpManager,
    private documentoService: DocumentoService,
    private utilidades: UtilidadesService,
    private newNuxeoService: NewNuxeoService,
    private descuentoAcademicoService: DescuentoAcademicoService) {
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.loadData();
    this.loading = false;
  }

  cargarCampos() {
    this.settings = {
      columns: {
        DescuentosDependenciaId: {
          title: this.translate.instant('GLOBAL.tipo_descuento_matricula'),
          width: '30%',
          valuePrepareFunction: (value: any) => {
            return value.TipoDescuentoId.Nombre;
          },
        },
        EstadoObservacion: {
          title: this.translate.instant('admision.estado'),
          width: '20%',
          editable: false,
        },
        Observacion: {
          title: this.translate.instant('admision.observacion'),
          width: '40%',
          editable: false,
        },
      },
      mode: 'external',
      actions: {
        position: 'right',
        columnTitle: this.translate.instant('GLOBAL.acciones'),
        add: true,
        edit: false,
        delete: false,
        custom: [
          {
            name: 'open',
            title: '<i class="nb-compose" title="' + this.translate.instant('GLOBAL.tooltip_ver_registro') + '"></i>',
          },
          {
            name: 'edit',
            title: '<i class="nb-edit" title="' + this.translate.instant('GLOBAL.tooltip_editar_registro') + '"></i>',
          },
          {
            name: 'delete',
            title: '<i class="nb-trash" title="' + this.translate.instant('GLOBAL.eliminar') + '"></i>',
          },
        ],
      },
      add: {
        addButtonContent: '<i class="nb-plus" title="' + this.translate.instant('descuento_academico.tooltip_crear') + '"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
    };
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    const id = decrypt(window.localStorage.getItem('persona_id'));
    this.sgaMidService.get('descuento_academico/descuentopersonaperiododependencia?' +
      'PersonaId=' + Number(id) + '&DependenciaId=' +
      Number(window.sessionStorage.getItem('ProgramaAcademicoId')) + '&PeriodoId=' + Number(window.sessionStorage.getItem('IdPeriodo')))
      .subscribe((result: any) => {
        const r = <any>result.Data.Body[1];
        if (result !== null && (result.Data.Code == '400' || result.Data.Code == '404')) {
          this.popUpManager.showAlert('', this.translate.instant('inscripcion.sin_descuento'));
          this.getPercentage(0);
          this.dataSource = new MatTableDataSource()

        } else {
          this.data = <Array<SolicitudDescuento>>r;
          this.data.forEach(async (docDesc: any) => {
            let estadoDoc = await <any>this.cargarEstadoDocumento(docDesc["DocumentoId"]);
            this.listAlreadyUploaded.push(docDesc["DescuentosDependenciaId"].TipoDescuentoId.Id);
            docDesc["EstadoObservacion"] = estadoDoc.estadoObservacion;
            docDesc["Observacion"] = estadoDoc.observacion;
            docDesc["Aprobado"] = estadoDoc.aprobado;
            this.dataSource = new MatTableDataSource(this.data)
          });
          this.getPercentage(1);
          this.dataSource = new MatTableDataSource(this.data)
        }
        //this.loading = false;
      },
        (error: HttpErrorResponse) => {
          //this.loading = false;
          Swal.fire({
            icon: 'error',
            title: error.status + '',
            text: this.translate.instant('ERROR.' + error.status),
            footer: this.translate.instant('GLOBAL.cargar') + '-' +
              this.translate.instant('GLOBAL.descuento_matricula') + '|' +
              this.translate.instant('GLOBAL.descuento_matricula'),
            confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
          });
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
    this.selected = 0
    this.irAIndexTab(0)
  }
  
  
  onAction(event: any): void {
    switch (event.action) {
      case 'open':
        this.onOpen(event);
        break;
      case 'edit':
        this.onEdit(event);
        break;
      case 'delete':
        this.onDelete(event);
        break;
    }

  onOpen(event: any) {
    const filesToGet = [
      {
        Id: event.DocumentoId,
        key: event.DocumentoId,
      },
    ];
    this.newNuxeoService.get(filesToGet).subscribe(
      response => {
        const filesResponse = <any>response;
        if (Object.keys(filesResponse).length === filesToGet.length) {
          filesToGet.forEach((file: any) => {
            const url = filesResponse[0].url;
            window.open(url);
          });
        }
      },
      error => {
        this.popUpManager.showErrorToast('ERROR.error_cargar_documento');
      },
    );
  }

  onEdit(event: any): void {
    if (event.Aprobado != true) {
      this.uid = event.Id;
      this.irAIndexTab(1)
    } else {
      this.popUpManager.showAlert(
        this.translate.instant('GLOBAL.info'),
        this.translate.instant('inscripcion.no_edit_doc_aprobado'),
      )
    }
  }

  onCreate(): void {
    this.uid = 0;
    this.irAIndexTab(1)
  }

  onDelete(event: any): void {
    let estado: string = event.EstadoObservacion;
    let esAprobado: boolean = estado === "Aprobado";

    if (esAprobado) {
      const opt: any = {
        title: this.translate.instant('GLOBAL.eliminar'),
        text: this.translate.instant('descuento_academico.no_permite_borrar'),
        icon: 'info',
        dangerMode: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar')
      };
      Swal.fire(opt);
    } else {
      const opt: any = {
        title: this.translate.instant('GLOBAL.eliminar'),
        text: this.translate.instant('descuento_academico.seguro_borrar'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      };
      Swal.fire(opt)
        .then((willDelete) => {
          this.loading = true;
          if (willDelete.value) {
            event.Activo = false;
            this.descuentoAcademicoService.put('solicitud_descuento', event).subscribe(res => {
              if (res !== null) {
                this.loadData();
                Swal.fire({
                  icon: 'success',
                  title: this.translate.instant('descuento_academico.descuento_eliminado'),
                  text: this.translate.instant('descuento_academico.mensaje_eliminado'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
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
                    this.translate.instant('GLOBAL.descuento_academico'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
          }
          this.loading = false;
        });
    }
  }

  activetab(): void {
    if (this.selected == 0) {
      this.selected = 1
    } else {
      this.selected = 0
    }
  }

  onChange(event: any) {
    if (event) {
      this.uid = 0;
      this.loadData();
      this.irAIndexTab(0)
    }
  }

  itemselec(event: any): void {
  }

  getPercentage(event: any) {
    this.percentage = event;
    this.result.emit(this.percentage);
  }

  tabChanged(event: MatTabChangeEvent) {
    this.irAIndexTab(event.index)
  }

  irAIndexTab(index: number) {
    this.selected = index
  }
}
