import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { IdiomaService } from 'src/app/services/idioma.service';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { UserService } from 'src/app/services/users.service';
import { SharedStateService } from '../shared-state.service';
import { Store } from '@ngrx/store';
import { IAppState } from 'src/app/utils/reducers/app.state';

@Component({
  selector: 'ngx-list-idiomas',
  templateUrl: './list-idiomas.component.html',
  styleUrls: ['./list-idiomas.component.scss'],
})
export class ListIdiomasComponent implements OnInit {
  uid!: number;
  inscripcion_id!: number;
  idiomaExamen!: number | null;
  cambiotab: boolean = false;
  settings: any;

  selected = 0;

  displayedColumns = [
    'idioma',
    'escritura',
    'escucha',
    'habla',
    'lee',
    'acciones',
  ];
  dataSource!: MatTableDataSource<any>;

  @Input('inscripcion_id')
  set admision(inscripcion_id: number) {
    if (
      inscripcion_id !== undefined &&
      inscripcion_id !== 0 &&
      inscripcion_id.toString() !== ''
    ) {
      this.inscripcion_id = inscripcion_id;
    }
  }

  @Output() eventChange = new EventEmitter();
  // tslint:disable-next-line: no-output-rename
  @Output('result') result: EventEmitter<any> = new EventEmitter();
  @Output() bridge_create_inscripcion: EventEmitter<any> = new EventEmitter();

  percentage!: number;
  persona_id!: number;

  constructor(
    private translate: TranslateService,
    private idiomaService: IdiomaService,
    private userService: UserService,
    private popUpManager: PopUpManager,
    private inscripcionService: InscripcionService,
    private sharedStateService: SharedStateService,
    private store: Store<IAppState>
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {});
  }

  ngOnInit() {
    this.sharedStateService.idiomaExamen$.subscribe((idioma) => {
      this.idiomaExamen = idioma;
    });

    this.loadData();
    this.uid = 0;
    this.irAIndexTab(0);
    this.cargarIdiomaExamen();
  }

  crear_inscripcion(data: any) {
    this.bridge_create_inscripcion.emit(data);
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  async loadData(): Promise<void> {
    this.persona_id = (await this.userService.getPersonaId()) || 1;
    // no tiene campo Activo ??? Activo:true,
    this.idiomaService
      .get(
        'conocimiento_idioma?query=Activo:true,TercerosId:' +
          this.persona_id +
          '&limit=0'
      )
      .subscribe(
        (res) => {
          if (res !== null && JSON.stringify(res[0]) !== '{}') {
            const data = <Array<any>>res;
            this.getPercentage(1);
            this.dataSource = new MatTableDataSource(data);
          } else {
            this.getPercentage(0);
            this.dataSource = new MatTableDataSource();
            this.popUpManager.showAlert(
              '',
              this.translate.instant('idiomas.no_data')
            );
          }
        },
        (error: HttpErrorResponse) => {
          this.popUpManager.showErrorAlert(
            this.translate.instant('ERROR.' + error.status)
          );
        }
      );
  }

  onChange(event: any) {
    if (event) {
      this.uid = 0;
      this.loadData();
      this.irAIndexTab(0);
    }
  }

  getPercentage(event: any) {
    setTimeout(() => {
      this.percentage = event;
      this.result.emit(this.percentage);
    });
  }

  async onDelete(event: any): Promise<void> {
    try {
      const willDelete = await this.popUpManager.showConfirmAlert(
        this.translate.instant('idiomas.eliminar')
      );
      if (willDelete.value) {
        event.Activo = false;
        const res = await this.idiomaService
          .put('conocimiento_idioma', event)
          .toPromise();
        if (res !== null) {
          this.loadData();
          this.popUpManager.showInfoToast(
            this.translate.instant('GLOBAL.idioma') +
              ' ' +
              this.translate.instant('GLOBAL.confirmarEliminar'),
            5000
          );

          // Verificar si el idioma tiene el check de SeleccionExamen
          if (event.SeleccionExamen === true) {
            const inscripcionId = Number(this.inscripcion_id);
            const resInscripcion = await this.inscripcionService
              .get('inscripcion_posgrado/?query=InscripcionId:' + inscripcionId)
              .toPromise();

            const r = <any>resInscripcion;
            if (
              r !== null &&
              r.Type !== 'error' &&
              JSON.stringify(r[0]).toString() !== '{}'
            ) {
              // Actualizar el registro para setear el campo Idioma en null
              const examen = {
                Idioma: null,
                Activo: true,
                InscripcionId: { Id: inscripcionId },
              };
              const resInscripcionActualizada = await this.inscripcionService
                .put('inscripcion_posgrado/' + r[0].Id, examen)
                .toPromise();
              const res = <any>resInscripcionActualizada;
              if (
                res !== null &&
                res.Type !== 'error' &&
                JSON.stringify(res).toString() !== '{}'
              ) {
                this.sharedStateService.setIdiomaExamen(null);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      if (error instanceof HttpErrorResponse) {
        this.popUpManager.showErrorAlert(
          this.translate.instant('ERROR.' + error.status)
        );
      } else {
        this.popUpManager.showErrorAlert(
          this.translate.instant('GLOBAL.error')
        );
      }
    }
  }

  onEdit(event: any): void {
    this.uid = event.Id;
    this.irAIndexTab(1);
  }

  onCreate(): void {
    this.uid = 0;
    this.irAIndexTab(1);
  }

  itemselec(event: any): void {}

  tabChanged(event: MatTabChangeEvent) {
    this.irAIndexTab(event.index);
  }

  irAIndexTab(index: number) {
    this.selected = index;
  }

  cargarIdiomaExamen(): void {
    if (
      this.inscripcion_id !== undefined &&
      this.inscripcion_id !== 0 &&
      this.inscripcion_id.toString() !== ''
    ) {
      this.inscripcionService
        .get('inscripcion_posgrado/?query=InscripcionId:' + this.inscripcion_id)
        .subscribe(
          (res) => {
            const r = <any>res;
            if (
              res !== null &&
              r.Type !== 'error' &&
              JSON.stringify(res[0]).toString() !== '{}'
            ) {
              const idioma = r[0].Idioma;
              this.sharedStateService.setIdiomaExamen(idioma);
            }
          },
          (error: HttpErrorResponse) => {
            console.error(error);
          }
        );
    }
  }

  getNombreIdioma(id: number): string {
    let idiomas: any = null;
    this.store
      .select((state) => state)
      .subscribe((list) => {
        idiomas = list.listIdioma[0];
      });
    if (!idiomas) {
      return 'Cargando...';
    }
    const idioma = idiomas.find((i: any) => i.Id === id);
    return idioma ? idioma.Nombre : 'Sin definir';
  }
}
