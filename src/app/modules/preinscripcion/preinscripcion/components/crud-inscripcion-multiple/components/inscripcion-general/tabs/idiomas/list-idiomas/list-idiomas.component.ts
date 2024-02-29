import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { IdiomaService } from 'src/app/services/idioma.service';
import { UserService } from 'src/app/services/users.service';

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
    this.cargarCampos();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.cargarCampos();
    });
    this.loading = false;
  }

  crear_inscripcion(data:any) {
    this.bridge_create_inscripcion.emit(data);
  }

  cargarCampos() {
    this.settings = {
      columns: {
        IdiomaId: {
          title: this.translate.instant('GLOBAL.idioma'),
          width: '20%',
          valuePrepareFunction: (value:any) => {
            return value.Nombre;
          },
        },
        NivelEscribeId: {
          title: this.translate.instant('GLOBAL.nivel_escribe'),
          width: '20%',
          valuePrepareFunction: (value:any) => {
            return value.Nombre;
          },
        },
        NivelEscuchaId: {
          title: this.translate.instant('GLOBAL.nivel_escucha'),
          width: '20%',
          valuePrepareFunction: (value:any) => {
            return value.Nombre;
          },
        },
        NivelHablaId: {
          title: this.translate.instant('GLOBAL.nivel_habla'),
          width: '20%',
          valuePrepareFunction: (value:any) => {
            return value.Nombre;
          },
        },
        NivelLeeId: {
          title: this.translate.instant('GLOBAL.nivel_lee'),
          width: '20%',
          valuePrepareFunction: (value:any) => {
            return value.Nombre;
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
        addButtonContent: '<i class="nb-plus" title="' + this.translate.instant('idiomas.tooltip_crear') + '"></i>',
        createButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
      edit: {
        editButtonContent: '<i class="nb-edit" title="' + this.translate.instant('idiomas.tooltip_editar') + '"></i>',
        saveButtonContent: '<i class="nb-checkmark"></i>',
        cancelButtonContent: '<i class="nb-close" title="' + this.translate.instant('GLOBAL.cancelar') + '"></i>',
      },
      delete: {
        deleteButtonContent: '<i class="nb-trash" title="' + this.translate.instant('idiomas.tooltip_eliminar') + '"></i>',
        confirmDelete: true,
      },
    };
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
      this.cambiotab = false;
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
  }

  onEdit(event:any): void {
    this.uid = event.Id;
    this.activetab();
  }

  onCreate(): void {
    this.uid = 0;
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

  itemselec(event:any): void {
  }
}
