import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InscripcionService } from 'src/app/services/inscripcion.service';
import { ParametrosService } from 'src/app/services/parametros.service';
import { ProyectoAcademicoService } from 'src/app/services/proyecto_academico.service';
import { UserService } from 'src/app/services/users.service';

@Component({
  selector: 'ngx-view-inscripcion',
  templateUrl: './view-inscripcion.component.html',
  styleUrls: ['./view-inscripcion.component.scss']
})
export class ViewInscripcionComponent implements OnInit {

  displayedColumns: string[] = ['periodo', 'programa', 'enfasis', 'tipoInscripcion', 'numeroInscripcion', 'estado'];
  dataSource!: MatTableDataSource<any>;

  persona_id!: number | null;
  periodo_id!: number;
  programa_id!: number;
  inscripcion_id!: number;
  inscripcion: any;

  @Output('estadoCarga') estadoCarga: EventEmitter<any> = new EventEmitter(true);
  infoCarga: any = {
    porcentaje: 0,
    nCargado: 0,
    nCargas: 0,
    status: ""
  }

  constructor(
    private translate: TranslateService,
    private inscripcionService: InscripcionService,
    private parametrosService: ParametrosService,
    private userService: UserService,
    private popUpManager: PopUpManager,
    private programaService: ProyectoAcademicoService,
  ) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.inscripcion = {
      Periodo: '',
      Estado: '',
      Programa: '',
    }
  }

  async ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.programa_id = parseInt(sessionStorage.getItem('ProgramaAcademicoId')!);
    this.inscripcion_id = parseInt(sessionStorage.getItem('IdInscripcion')!);
    this.periodo_id = this.userService.getPeriodo();
    try {
      this.persona_id = await this.userService.getPersonaId();
      await this.loadInscripcion();
    } catch (error) {
      console.error('Error al obtener persona_id:', error);
    }
  }

  async loadInscripcion() {
    this.infoCarga.nCargas = 3;
    this.inscripcion.Programa = sessionStorage.getItem('ProgramaAcademico');
    const inscripcion: any = await this.recuperarInscripcion(this.inscripcion_id);
    console.log(inscripcion);
    this.inscripcion.Estado = inscripcion.EstadoInscripcionId.Nombre;
    this.estadoCarga.emit({ EstadoInscripcion: this.inscripcion.Estado });
    this.inscripcion.TipoInscripcion = inscripcion.TipoInscripcionId.Nombre;
    this.inscripcion.FechaInscribe = inscripcion.FechaModificacion;
    this.inscripcion.Enfasis = "";

    if (inscripcion.EnfasisId > 0) {
      const enfasis: any = await this.recuperarEnfasis(inscripcion.EnfasisId)
      this.inscripcion.Enfasis = enfasis.Nombre;
      this.addCargado(1);
    }else {
      this.addCargado(1);
    }

    this.inscripcion.idRecibo = inscripcion.ReciboInscripcion;
    this.addCargado(1);

    const periodo: any = await this.recuperarPeriodo(this.periodo_id);
    this.inscripcion.Periodo = periodo.Nombre;
    this.addCargado(1);

    this.setearTabla(this.inscripcion, this.inscripcion_id);
  }

  setearTabla(inscripcionActual: any, inscripcionId: any) {
    let data = []
    const item = {
      "periodo": inscripcionActual.Periodo,
      "programa": inscripcionActual.Programa,
      "enfasis": inscripcionActual.Enfasis ? inscripcionActual.Enfasis : "Desconocido",
      "tipoInscripcion": inscripcionActual.TipoInscripcion,
      "numeroInscripcion": inscripcionId,
      "estado": inscripcionActual.Estado,
    }

    data.push(item);

    this.dataSource = new MatTableDataSource(data);
  }

  recuperarInscripcion(IdInscripcion: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionService.get('inscripcion?query=Id:' + IdInscripcion)
        .subscribe((response: any) => {
          if (Object.keys(response[0]).length > 0) {
            resolve(response[0]);
          } else {
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.'));
            this.infoFalla();
            reject(false);
          }
        },
          (error: any) => {
            console.error(error);
            this.infoFalla();
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
            reject(false);
          });
    });
  }

  recuperarEnfasis(idEnfasis: any) {
    return new Promise((resolve, reject) => {
      this.programaService.get('enfasis/' + idEnfasis)
        .subscribe((response: any) => {
          if (response.Status != "404") {
            resolve(response);
          } else {
            this.infoFalla();
            reject(false);
          }
        },
          (error: any) => {
            console.error(error);
            this.infoFalla();
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
            reject(false);
          });
    });
  }

  recuperarPeriodo(idPeriodo: any) {
    return new Promise((resolve, reject) => {
      this.parametrosService.get('periodo/' + idPeriodo)
        .subscribe((response: any) => {
          resolve(response.Data);
        },
          (error: any) => {
            console.error(error);
            this.infoFalla();
            this.popUpManager.showErrorToast(this.translate.instant('ERROR.' + error.status));
            reject(false);
          });
    });
  }

  addCargado(carga: number) {
    this.infoCarga.nCargado += carga;
    this.infoCarga.porcentaje = this.infoCarga.nCargado/this.infoCarga.nCargas;
    if (this.infoCarga.porcentaje >= 1) {
      this.infoCarga.status = "completed";
      let fechaRaw = new Date(new Date(this.inscripcion.FechaInscribe).getTime()+5*3600*1000);
      this.infoCarga.outInfo = {
        id: this.inscripcion_id,
        programa_id: this.programa_id,
        nombrePrograma: this.inscripcion.Programa,
        enfasis: this.inscripcion.Enfasis,
        fechaInsripcion: fechaRaw.toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
        periodo: this.inscripcion.Periodo,
        idRecibo: this.inscripcion.idRecibo,
      }
    }
    this.estadoCarga.emit(this.infoCarga);
  }

  infoFalla() {
    this.infoCarga.status = "failed";
    this.estadoCarga.emit(this.infoCarga);
  }
}