import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { IdiomaService } from 'src/app/services/idioma.service';
import { UserService } from 'src/app/services/users.service';
import { CrudIdiomasComponent } from '../crud-idiomas/crud-idiomas.component';

@Component({
  selector: 'ngx-list-idiomas',
  templateUrl: './list-idiomas.component.html',
  styleUrls: ['./list-idiomas.component.scss']
})
export class ListIdiomasComponent implements OnInit {
  uid!: number;
  inscripcion_id!: number;
  cambiotab: boolean = false;
  settings: any;

  selected = 0;

  displayedColumns = ['idioma', 'escritura', 'escucha', 'habla', 'lee', 'acciones'];
  dataSource!: MatTableDataSource<any>;

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    if (inscripcion_id !== undefined && inscripcion_id !== 0 && inscripcion_id.toString() !== '') {
      this.inscripcion_id = inscripcion_id;
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();
  @Output() bridge_create_inscripcion: EventEmitter<any> = new EventEmitter();

  loading: boolean;
  percentage!: number;
  persona_id!: number;

  constructor(
    private translate: TranslateService,
    private idiomaService: IdiomaService,
    private userService: UserService,
    private popUpManager: PopUpManager,
  ) {
    this.loadData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {

    });
    this.loading = false;
  }

  crear_inscripcion(data:any) {
    this.bridge_create_inscripcion.emit(data);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  loadData(): void {
    this.loading = true;
    this.persona_id = this.userService.getPersonaId() || 1;
    // no tiene campo Activo ??? Activo:true,
    this.idiomaService.get('conocimiento_idioma?query=Activo:true,TercerosId:' + this.persona_id +
      '&limit=0')
      .subscribe(res => {
        if (res !== null && JSON.stringify(res[0]) !== '{}') {
          const data = <Array<any>>res;
          this.getPercentage(1);
          this.dataSource = new MatTableDataSource(data);
        } else {
          this.getPercentage(0);
          this.dataSource = new MatTableDataSource();
          this.popUpManager.showAlert('', this.translate.instant('idiomas.no_data'));
        }
        this.loading = false;
      },
        (error: HttpErrorResponse) => {
          this.loading = false;
          this.popUpManager.showErrorAlert(this.translate.instant('ERROR.' + error.status));
        });
  }

  onChange(event:any) {
    if (event) {
      this.uid = 0;
      this.loadData();
      this.irAIndexTab(0)
    }
  }

  getPercentage(event:any) {
    setTimeout(() => {
      this.percentage = event;
      this.result.emit(this.percentage);
    });
  }

  onDelete(event:any): void {
    this.popUpManager.showConfirmAlert(this.translate.instant('idiomas.eliminar'))
      .then((willDelete) => {
        this.loading = true;
        if (willDelete.value) {
          event.Activo = false;
          this.idiomaService.put('conocimiento_idioma', event).subscribe(res => {
          //this.idiomaService.delete('conocimiento_idioma', event.data).subscribe(res => {
            if (res !== null) {
              this.loadData();
              this.popUpManager.showInfoToast(
                this.translate.instant('GLOBAL.idioma') + ' ' + this.translate.instant('GLOBAL.confirmarEliminar'), 5000
              );
            }
            this.loading = false;
          },
            (error: HttpErrorResponse) => {
              this.loading = false;
              this.popUpManager.showErrorAlert(this.translate.instant('ERROR.' + error.status))
            });
        }
        this.loading = false;
      });
  }

  ngOnInit() {
    this.uid = 0;
    this.irAIndexTab(0)
  }

  onEdit(event:any): void {
    this.uid = event.Id;
    this.irAIndexTab(1)
  }

  onCreate(): void {
    this.uid = 0;
    this.irAIndexTab(1)
    
  }

  itemselec(event:any): void {
  }

  tabChanged(event: MatTabChangeEvent) {
    this.irAIndexTab(event.index)
  }

  irAIndexTab(index:number){
    this.selected = index
  }
}
