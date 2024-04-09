import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { Documento } from 'src/app/models/documento/documento';
import { SoporteDocumentoAux } from 'src/app/models/documento/soporte_documento_aux';
import { DocumentoService } from 'src/app/services/documento.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-list-documento-programa',
  templateUrl: './list-documento-programa.component.html',
  styleUrls: ['./list-documento-programa.component.scss']
})
export class ListDocumentoProgramaComponent implements OnInit {
  uid!: number;
  persona!: number;
  programa!: number;
  periodo!: number;
  inscripcion!: number;
  cambiotab: boolean = false;
  contador!: number;
  settings: any;
  tipo_documentos!: any[];
  data: any;
  info_data: any;
  programaDocumento: any;
  tipoProgramaDocumento: any;
  soporteDocumento!: SoporteDocumentoAux[];
  soporteId!: number;
  tipoInscripcion!: number;
  listAlreadyUploaded: number[] = [];
  selected = 0;
  displayedColumns = ['tipo_documento', 'estado', 'observacion','acciones'];
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

    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();

  loading: boolean;
  percentage: number;

  constructor(
    private translate: TranslateService,
    private documentoService: DocumentoService,
    private inscripcionService: InscripcionService,
    private popUpManager: PopUpManager,
    private newNuxeoService: NewNuxeoService,
    private utilidades: UtilidadesService
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.loading = false;
    this.percentage = 0;
  }

  async loadData() {
    this.loading = true;
    this.soporteDocumento = [];
    this.percentage = 0;
    this.inscripcionService.get('soporte_documento_programa?query=InscripcionId.Id:' +
      this.inscripcion + ',DocumentoProgramaId.ProgramaId:' + 
      this.programa + ',DocumentoProgramaId.TipoInscripcionId:' + this.tipoInscripcion + 
      ',DocumentoProgramaId.PeriodoId:' + parseInt(sessionStorage.getItem('IdPeriodo')!, 10)  + 
      ',DocumentoProgramaId.Activo:true&limit=0').subscribe(
        (response: any[]) => {
          if (Object.keys(response[0]).length > 0) {
            response.forEach(async soporte => {
              const documento: SoporteDocumentoAux = new SoporteDocumentoAux();
              documento.TipoDocumentoId = soporte['DocumentoProgramaId']['TipoDocumentoProgramaId']['Id'];
              this.listAlreadyUploaded.push(documento.TipoDocumentoId);
              documento.TipoDocumento = soporte['DocumentoProgramaId']['TipoDocumentoProgramaId']['Nombre'];
              documento.DocumentoId = soporte['DocumentoId'];
              documento.SoporteDocumentoId = soporte['Id'];
              documento.DocumentoProgramaId = soporte['DocumentoProgramaId'];
              await this.cargarEstadoDocumento(documento).then((estado: any) => {
                documento.EstadoObservacion = estado.estadoObservacion;
                documento.Observacion = estado.observacion;
                documento.Aprobado = estado.aprobado; 
              });
              this.soporteDocumento.push(documento);
              this.dataSource = new MatTableDataSource(this.soporteDocumento)
              if (<boolean>soporte['DocumentoProgramaId']['Obligatorio'] == true){
                //if (documento.EstadoObservacion !== 'No aprobado') {
                  this.getPercentage((1 / this.tipo_documentos.length * 100));
                //}
              }
            });
          } else {
            this.dataSource = new MatTableDataSource()
            this.getPercentage(0);
            this.popUpManager.showAlert('', this.translate.instant('documento_programa.no_documentos'));
          }
          this.loading = false;
        },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('ERROR.' + error.status));
        },
      );
  }

  cargarEstadoDocumento(documento: SoporteDocumentoAux) {
    return new Promise((resolve) => {
      this.documentoService.get('documento/' + documento.DocumentoId).subscribe(
        (doc: Documento) => {
          let estadoDoc = this.utilidades.getEvaluacionDocumento(doc.Metadatos);
          resolve(estadoDoc)
        });
    });

  }

  ngOnInit() {
    this.uid = 0;
    this.soporteDocumento = [];
    this.inscripcion = parseInt(sessionStorage.getItem('IdInscripcion')!, 10);
    this.programa = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!, 10);
    this.periodo = parseInt(sessionStorage.getItem('IdPeriodo')!, 10);
    this.tipoInscripcion = parseInt(sessionStorage.getItem('IdTipoInscripcion')!, 10);
    
    if (this.inscripcion !== undefined && this.inscripcion !== null && this.inscripcion !== 0 &&
      this.inscripcion.toString() !== '') {
      this.loadData();
    }
    this.loadLists();
    this.irAIndexTab(0)
  }

  public loadLists() {
    this.inscripcionService.get('documento_programa?query=Activo:true,PeriodoId:' + this.periodo + ',ProgramaId:' + this.programa + ',TipoInscripcionId:' + this.tipoInscripcion + ',Obligatorio:true&limit=0').subscribe(
      (response: Object[]) => {
        if(response === undefined || response === null){
          this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
        }
        else if (response.length == 1 && !response[0].hasOwnProperty('TipoDocumentoProgramaId')){
        }
        else{
          this.tipo_documentos = <any[]>response;
        }
      },
      error => {
        this.popUpManager.showErrorToast(this.translate.instant('ERROR.general'));
      },
    );
  }

  onOpen(event:any) {
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

  onEdit(event:any): void {
    if(event.Aprobado == false) {
      this.uid = event.TipoDocumentoId;
      this.soporteId = event.SoporteDocumentoId;
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

  onDelete(event:any): void {
    let estado: string = event.EstadoObservacion;
    let esAprobado: boolean = estado === "Aprobado";

    if (esAprobado) {
      const opt: any = {
        title: this.translate.instant('GLOBAL.eliminar'),
        text: this.translate.instant('documento_programa.no_permite_borrar'),
        icon: 'info',
        showCancelButton: false,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar')
      };
      Swal.fire(opt);
    } else {
      const opt: any = {
        title: this.translate.instant('GLOBAL.eliminar'),
        text: this.translate.instant('documento_programa.seguro_borrar'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        cancelButtonText: this.translate.instant('GLOBAL.cancelar'),
      };
      Swal.fire(opt)
        .then((willDelete) => {
          this.loading = true;
          if (willDelete.value) {
            event.DocumentoProgramaId.Activo = false;
            this.inscripcionService.put('documento_programa/', event.DocumentoProgramaId).subscribe(res => {
              if (res !== null) {
                this.loadData();
                Swal.fire({
                  icon: 'success',
                  title: this.translate.instant('documento_programa.documento_eliminado'),
                  text: this.translate.instant('documento_programa.mensaje_eliminado'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              }
              this.loading = false;
            }, (error: HttpErrorResponse) => {
                this.loading = false;
                Swal.fire({
                  icon: 'error',
                  title: error.status + '',
                  text: this.translate.instant('ERROR.' + error.status),
                  footer: this.translate.instant('GLOBAL.eliminar') + '-' +
                    this.translate.instant('GLOBAL.documento_programa'),
                  confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                });
              });
          }
          this.loading = false;
        });
    }
  }

  onChange(event:any) {
    if (event) {
      this.uid = 0;
      this.loadData();
      this.irAIndexTab(0)
    }
  }

  getPercentage(event:any) {
    if (event !== undefined) {
      this.percentage += event;
      //this.percentage = Number(this.percentage.toFixed(0))
    }

    if (this.percentage > 100) {
      this.result.emit(1);
    } else {
      this.result.emit(this.percentage / 100);
    }
  }

  tabChanged(event: MatTabChangeEvent) {
    this.irAIndexTab(event.index)
  }

  irAIndexTab(index:number){
    this.selected = index
  }
}
