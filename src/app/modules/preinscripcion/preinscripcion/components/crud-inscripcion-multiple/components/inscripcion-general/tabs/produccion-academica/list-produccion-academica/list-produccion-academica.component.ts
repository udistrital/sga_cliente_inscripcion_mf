import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { ProduccionAcademicaPost } from 'src/app/models/produccion_academica/produccion_academica';
import { SgaMidService } from 'src/app/services/sga_mid.service';
import { UserService } from 'src/app/services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ngx-list-produccion-academica',
  templateUrl: './list-produccion-academica.component.html',
  styleUrls: ['./list-produccion-academica.component.scss']
})
export class ListProduccionAcademicaComponent implements OnInit {
  prod_selected: ProduccionAcademicaPost | undefined;
  settings: any;
  persona_id: number;
  percentage!: number;
  loading: boolean = true;
  selected = 0;

  displayedColumns = ['titulo', 'tipo', 'resumen', 'estado', 'fecha', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  @Output('result') result: EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService,
    private sgaMidService: SgaMidService,
    private user: UserService,
    private popUpManager: PopUpManager,
    private snackBar: MatSnackBar) {
    this.persona_id = user.getPersonaId() || 1;
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
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
    this.sgaMidService.get('produccion_academica/pr_academica/' + this.persona_id)
      .subscribe(res => {
        if (res !== null && res.Response.Code === '200') {
          const data = <Array<ProduccionAcademicaPost>>res.Response.Body[0];
          this.dataSource = new MatTableDataSource(data)
          this.result.emit(1);
        } else if (res !== null && res.Response.Code === '404') {
          this.popUpManager.showAlert('', this.translate.instant('formacion_academica.no_data'));
          this.dataSource = new MatTableDataSource();
          this.result.emit(0);
        } else {
          Swal.fire({
            icon: 'error',
            text: this.translate.instant('ERROR.400'),
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
          confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
        });
      });
  }

  ngOnInit() {
    this.loadData();
    this.irAIndexTab(0)
  }

  onEdit(event:any): void {
    if (event.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 1 || event.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 2) {
      this.prod_selected = event;
      this.irAIndexTab(1)
    } else if (event.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 3) {
      this.updateEstadoAutor(event);
    } else {
      this.snackBar.open(this.translate.instant('GLOBAL.accion_no_permitida'), '', { duration: 3000, panelClass: ['info-snackbar'] }) 
    }
  }

  onCreate(): void {
    this.prod_selected = undefined;
    this.irAIndexTab(1)
  }

  onDelete(event:any): void {
    if (event.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 1) {
      const opt: any = {
        title: this.translate.instant('GLOBAL.eliminar'),
        text: this.translate.instant('produccion_academica.seguro_continuar_eliminar_produccion'),
        icon: 'warning',
        buttons: true,
        dangerMode: true,
        showCancelButton: true,
      };
      Swal.fire(opt)
        .then((willDelete) => {
          if (willDelete.value) {
            this.sgaMidService.delete('produccion_academica', event).subscribe((res: any) => {
              if (res !== null ) {
                this.dataSource = new MatTableDataSource();
                  this.loadData();
                  this.snackBar.open(this.translate.instant('produccion_academica.produccion_eliminada'), '', { duration: 3000, panelClass: ['info-snackbar'] }) 
                } else {
                  this.snackBar.open(this.translate.instant('produccion_academica.produccion_no_eliminada'), '', { duration: 3000, panelClass: ['error-snackbar'] }) 
                }
            }, (error: HttpErrorResponse) => {
              Swal.fire({
                icon: 'error',
                title: error.status + '',
                text: this.translate.instant('ERROR.' + error.status),
                confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
              });
            });
          }
        });
    } else if (event.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 2) {
      const opt: any = {
        title: 'Error',
        text: this.translate.instant('produccion_academica.autor_no_puede_borrar'),
        icon: 'warning',
        buttons: false,
      };
      Swal.fire(opt);
    } else if (event.EstadoEnteAutorId.EstadoAutorProduccionId.Id === 3) {
      this.updateEstadoAutor(event);
    } else {
      this.snackBar.open(this.translate.instant('GLOBAL.accion_no_permitida'), '', { duration: 3000, panelClass: ['info-snackbar'] }) 
    }
  }

  updateEstadoAutor(data: any): void {
    const opt: any = {
      title: 'Error',
      text: this.translate.instant('produccion_academica.autor_no_ha_confirmado'),
      icon: 'warning',
      buttons: true,
      dangerMode: true,
      showCancelButton: true,
    };
    Swal.fire(opt)
      .then((willConfirm) => {
        if (willConfirm.value) {
          const optConfirmar: any = {
            title: this.translate.instant('GLOBAL.confirmar'),
            text: this.translate.instant('produccion_academica.confirma_participar_produccion'),
            icon: 'warning',
            buttons: true,
            dangerMode: true,
            showCancelButton: true,
            confirmButtonText: this.translate.instant('GLOBAL.si'),
            cancelButtonText: this.translate.instant('GLOBAL.no'),
          };
          Swal.fire(optConfirmar)
            .then((isAuthor) => {
              const dataPut = {
                acepta: isAuthor.value ? true : false,
                AutorProduccionAcademica: data.EstadoEnteAutorId,
              }
              this.loading = true;
              this.sgaMidService.put('produccion_academica/estado_autor_produccion/' + dataPut.AutorProduccionAcademica.Id, dataPut)
                .subscribe((res: any) => {
                  if (res.Type === 'error') {
                    Swal.fire({
                      icon: 'error',
                      title: res.Code,
                      text: this.translate.instant('ERROR.' + res.Code),
                      confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                    });
                    this.snackBar.open(this.translate.instant('produccion_academica.estado_autor_no_actualizado'), '', { duration: 3000, panelClass: ['error-snackbar'] }) 
                  } else {
                    this.loadData();
                    this.snackBar.open(this.translate.instant('produccion_academica.estado_autor_actualizado'), '', { duration: 3000, panelClass: ['success-snackbar'] }) 
                  }
                  this.loading = false;
                }, (error: HttpErrorResponse) => {
                  this.loading = false;
                  Swal.fire({
                    icon: 'error',
                    title: error.status + '',
                    text: this.translate.instant('ERROR.' + error.status),
                    confirmButtonText: this.translate.instant('GLOBAL.aceptar'),
                  });
                });
            });
        }
      });
  }

  onChange(event:any) {
    if (event) {
      this.loadData();
      this.irAIndexTab(0)
    }
  }

  itemselec(event:any): void {
    // console.log("afssaf");
  }

  tabChanged(event: MatTabChangeEvent) {
    this.irAIndexTab(event.index)
  }

  irAIndexTab(index:number){
    this.selected = index
  }
}