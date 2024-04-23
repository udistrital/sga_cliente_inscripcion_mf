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
import { CalendarioMidService } from 'src/app/services/sga_calendario_mid.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { decrypt } from 'src/app/utils/util-encrypt';
// @ts-ignore
import Swal from 'sweetalert2/dist/sweetalert2';

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

  percentage!: number;

  constructor(private translate: TranslateService,
    private mid: CampusMidService,
    private inscripcionMidService: InscripcionMidService,
    private popUpManager: PopUpManager,
    private documentoService: DocumentoService,
    private utilidades: UtilidadesService,
    private newNuxeoService: NewNuxeoService,
    private descuentoAcademicoService: DescuentoAcademicoService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.loadData();
  }



  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    const id = decrypt(window.localStorage.getItem('persona_id'));
    this.inscripcionMidService.get('academico/descuento/detalle?' +
      'PersonaId=' + Number(id) + '&DependenciaId=' +
      Number(window.sessionStorage.getItem('ProgramaAcademicoId')) + '&PeriodoId=' + Number(window.sessionStorage.getItem('IdPeriodo')))
      .subscribe((result: any) => {
        const r = <any>result.data;
        if (result !== null && (result.status == '400' || result.status== '404')) {
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
      },
        (error: HttpErrorResponse) => {
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
        .then((willDelete: any) => {
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
            },
              (error: HttpErrorResponse) => {
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
