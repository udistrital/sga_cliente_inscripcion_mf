import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { InfoCaracteristica } from 'src/app/models/informacion/info_caracteristica';
import { InfoPersona } from 'src/app/models/informacion/info_persona';
import { DocumentoService } from 'src/app/services/documento.service';
import { NewNuxeoService } from 'src/app/services/new_nuxeo.service';
import { InscripcionMidService } from 'src/app/services/sga_inscripcion_mid.service';
import { TerceroMidService } from 'src/app/services/sga_tercero_mid.service';
import { UserService } from 'src/app/services/users.service';
import { UtilidadesService } from 'src/app/services/utilidades.service';
import { ZipManagerService } from 'src/app/services/zip-manager.service';
import { POR_DEFINIR } from '../../constants';

@Component({
  selector: 'ngx-view-info-persona',
  templateUrl: './view-info-persona.component.html',
  styleUrls: ['./view-info-persona.component.scss']
})
export class ViewInfoPersonaComponent implements OnInit {
  displayedColumnsBasica: string[] = ['nombres', 'apellidos', 'documento'];
  dataSourceBasica!: MatTableDataSource<any>;
  displayedColumnsContacto: string[] = ['correo', 'telefono', 'telefono_alter'];
  dataSourceContacto!: MatTableDataSource<any>;
  displayedColumnsUbicacion: string[] = ['fecha_nacimiento', 'lugar_nacimiento', 'direccion_residencia'];
  dataSourceUbicacion!: MatTableDataSource<any>;
  displayedColumnsDiscapacidad: string[] = ['info', 'estado', 'observacion', 'soporte'];
  dataSourceDiscapacidad!: MatTableDataSource<any>;
  displayedColumnsPoblacion: string[] = ['info', 'estado', 'observacion', 'soporte'];
  dataSourcePoblacion!: MatTableDataSource<any>;

  info_persona_id!: number;
  info_info_persona!: any;
  info_persona_user!: string;

  info_info_caracteristica!: any;
  tipoDiscapacidad: any = undefined;
  tipoPoblacion: any = undefined;
  idSoporteDiscapacidad: any = undefined;
  idSoportePoblacion: any = undefined;
  docDiscapacidad: any;
  docPoblacion: any;
  gotoEdit: boolean = false;
  lugarOrigen: string = "";
  fechaNacimiento: string = "";
  correo: string = "";
  telefono: string = "";
  telefonoAlt: string = "";
  direccion: string = "";
  updateDocument: boolean = false;
  canUpdateDocument: boolean = false;

  @Input('persona_id')
  set name(persona_id: any) {
    this.info_persona_id = persona_id;
    this.loadInfoPersona();
  }

  // tslint:disable-next-line: no-output-rename
  @Output('url_editar') url_editar: EventEmitter<boolean> = new EventEmitter();

   // tslint:disable-next-line: no-output-rename
  @Output('revisar_doc') revisar_doc: EventEmitter<any> = new EventEmitter();

  @Output('estadoCarga') estadoCarga: EventEmitter<any> = new EventEmitter(true);
  infoCarga: any = {
    porcentaje: 0,
    nCargado: 0,
    nCargas: 0,
    status: ""
  }

  @Output('docs_editados') docs_editados: EventEmitter<any> = new EventEmitter(true);

  constructor(

    private documentoService: DocumentoService,
    private sanitization: DomSanitizer,
    private translate: TranslateService,
    private userService: UserService,
    private terceroMidService: TerceroMidService,
    private inscripcionMidService: InscripcionMidService,
    private newNuxeoService: NewNuxeoService,
    private popUpManager: PopUpManager,
    private utilidades: UtilidadesService,
    private zipManagerService: ZipManagerService) {
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
    });
    this.gotoEdit = localStorage.getItem('goToEdit') === 'true';
    // this.loadInfoPersona();
  }

  useLanguage(language: string) {
    this.translate.use(language);
  }

  public editar(): void {
    this.url_editar.emit(true);
  }

  public cleanURL(oldURL: string): SafeResourceUrl {
    return this.sanitization.bypassSecurityTrustUrl(oldURL);
  }

  async ngOnInit() {
    this.infoCarga.status = "start";
    this.estadoCarga.emit(this.infoCarga);
    this.canUpdateDocument = <string>(sessionStorage.getItem('IdEstadoInscripcion') || "").toUpperCase() === "INSCRITO CON OBSERVACIÓN";
    //await this.loadInfoPersona();
  }

  cargarDataBasica(data: any) {

  }

  public async loadInfoPersona() {
    this.infoCarga.nCargas = 5;
    const idPersona = await this.userService.getPersonaId();
    // const id: any = await this.userService.getPersonaId();
    const id: any = this.info_persona_id ? this.info_persona_id : idPersona;

    if (id !== undefined && id !== 0 && id.toString() !== '') {
      const persona: any = await this.recuperarPersona(id);
      this.info_info_persona = <InfoPersona>persona.Data;
      this.dataSourceBasica = new MatTableDataSource([this.info_info_persona]);
      let nombreAspirante: string = this.info_info_persona.PrimerApellido + ' ' + this.info_info_persona.SegundoApellido + ' ' + this.info_info_persona.PrimerNombre + ' ' + this.info_info_persona.SegundoNombre;
      let nombreCarpetaDocumental: string = sessionStorage.getItem('IdInscripcion') + ' ' + nombreAspirante;
      sessionStorage.setItem('nameFolder', nombreCarpetaDocumental);

      const info_complementaria: any = await this.recuperarInfoComplementariaTercero(this.info_persona_id);
      if (info_complementaria) {
        //let dataContacto = [];
        let rawDate = this.info_info_persona.FechaNacimiento.split('-')
        this.fechaNacimiento = rawDate[2].slice(0,2)+"/"+rawDate[1]+"/"+rawDate[0];
        let info = info_complementaria.Data;
        this.correo = info.Correo;
        this.direccion = info.DireccionResidencia;
        this.telefono = info.Telefono;
        this.telefonoAlt = info.TelefonoAlterno;
        this.lugarOrigen = info.CiudadResidencia.Nombre + ", " + info.DepartamentoResidencia.Nombre;

        const dataContacto = {
          "correo": this.correo,
          "telefono": this.telefono,
          "telefono_alter": this.telefonoAlt
        }

        const dataUbicacion = {
          "fecha_nacimiento": this.fechaNacimiento,
          "lugar_nacimiento": this.lugarOrigen,
          "direccion_residencia": this.direccion
        }

        this.dataSourceContacto = new MatTableDataSource([dataContacto]);
        this.dataSourceUbicacion = new MatTableDataSource([dataUbicacion]);
        this.addCargado(3);
      } else {
        this.dataSourceContacto = new MatTableDataSource();
        this.dataSourceUbicacion = new MatTableDataSource();
        console.log(this.dataSourceContacto)
      }

      const complementaria: any = await this.recuperarComplemantariaPersona(this.info_persona_id);
      this.info_info_caracteristica = <InfoCaracteristica>complementaria.Data;

      if(this.info_info_caracteristica.hasOwnProperty('IdDocumentoDiscapacidad')) {
        this.idSoporteDiscapacidad = <number>this.info_info_caracteristica["IdDocumentoDiscapacidad"];
        const documento: any = await this.recuperarDocumento(this.idSoporteDiscapacidad);

        if(documento.Status && (documento.Status == "400" || documento.Status == "404")) {
          this.infoFalla();
          this.dataSourceDiscapacidad = new MatTableDataSource();
        } else {
          let estadoDoc = this.utilidades.getEvaluacionDocumento(documento.Metadatos);
          //AQUIVOY1
          console.log("ESTADO DOC", estadoDoc);
          if (estadoDoc.aprobado === false && estadoDoc.estadoObservacion !== POR_DEFINIR) {
            this.updateDocument = true;
          }
          this.docs_editados.emit(this.updateDocument);
          this.tipoDiscapacidad = "";
          let total = this.info_info_caracteristica.TipoDiscapacidad.length - 1;
          this.info_info_caracteristica.TipoDiscapacidad.forEach((dis: any, i: any) => {
            this.tipoDiscapacidad += dis.Nombre;
            if (i < total) {
              this.tipoDiscapacidad += ", ";
            }
          });
          this.docDiscapacidad = {
            //Documento: response[0]["Documento"],
            DocumentoId: documento.Id,
            aprobado: estadoDoc.aprobado,
            estadoObservacion: estadoDoc.estadoObservacion,
            observacion: estadoDoc.observacion,
            nombreDocumento: this.tipoDiscapacidad,
            tabName: this.translate.instant('GLOBAL.comprobante_discapacidad'),
            carpeta: "Información Básica"
          }
          this.zipManagerService.adjuntarArchivos([this.docDiscapacidad]);
          this.dataSourceDiscapacidad = new MatTableDataSource([this.docDiscapacidad]);
          this.addCargado(1);
        }
      } else {
        this.addCargado(1);
      }

      if(this.info_info_caracteristica.hasOwnProperty('IdDocumentoPoblacion')) {
        this.idSoportePoblacion = <number>this.info_info_caracteristica["IdDocumentoPoblacion"];
        const documento: any = await this.recuperarDocumento(this.idSoportePoblacion);

        if(documento.Status && (documento.Status == "400" || documento.Status == "404")) {
          this.infoFalla();
          this.dataSourcePoblacion = new MatTableDataSource();
        } else {
          let estadoDoc = this.utilidades.getEvaluacionDocumento(documento.Metadatos);
          if (estadoDoc.aprobado === false && estadoDoc.estadoObservacion !== POR_DEFINIR) {
            this.updateDocument = true;
          }
          this.docs_editados.emit(this.updateDocument);
          this.tipoPoblacion = "";
          let total = this.info_info_caracteristica.TipoPoblacion.length - 1;
          this.info_info_caracteristica.TipoPoblacion.forEach((dis:any, i:any) => {
            this.tipoPoblacion += dis.Nombre;
            if(i < total){
              this.tipoPoblacion += ", ";
            }
          });
          this.docPoblacion = {
            //Documento: response[0]["Documento"],
            DocumentoId: documento.Id,
            aprobado: estadoDoc.aprobado,
            estadoObservacion: estadoDoc.estadoObservacion,
            observacion: estadoDoc.observacion,
            nombreDocumento: this.tipoPoblacion,
            tabName: this.translate.instant('GLOBAL.comprobante_poblacion'),
            carpeta: "Información Básica"
          }
          console.log("ESTADO DOC", estadoDoc);
          this.zipManagerService.adjuntarArchivos([this.docPoblacion]);
          this.dataSourcePoblacion = new MatTableDataSource([this.docPoblacion]);
          console.log("DATA SOURCE POBLACION", this.dataSourcePoblacion);
          this.addCargado(1);
        }

      } else {
        this.addCargado(1);
      }

    } else {
      this.info_info_persona = undefined
      this.dataSourceBasica = new MatTableDataSource();
      this.infoFalla();
    }
  }

  recuperarPersona(id: any) {
    return new Promise((resolve, reject) => {
      this.terceroMidService.get('personas/' + id)
        .subscribe((res: any) => {
          const r = <any>res;
          if (r !== null && r.Message !== 'error') {
            resolve(res);
          } else {
            this.info_info_persona = undefined;
            this.dataSourceBasica = new MatTableDataSource();
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

  recuperarComplemantariaPersona(id: any) {
    return new Promise((resolve, reject) => {
      this.terceroMidService.get('personas/'+ id +'/complementarios')
        .subscribe((res: any) => {
          if (res !== null && res.Status != '404') {
            resolve(res);
          } else {
            this.info_info_caracteristica = undefined;
            this.infoFalla();
            reject(false);
          }
        },
          (error: any) => {
            console.error(error);
            this.infoFalla();
            this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
            reject(false);
          });
    });
  }

  recuperarInfoComplementariaTercero(id: any) {
    return new Promise((resolve, reject) => {
      this.inscripcionMidService.get('inscripciones/informacion-complementaria/tercero/' + id)
        .subscribe((res: any) => {
          if (res.Status == "200") {
            resolve(res)
          } else {
            resolve(false);
          }
        },
          (error: any) => {
            console.error(error);
            this.infoFalla();
            this.popUpManager.showErrorToast(this.translate.instant('ERROR: ' + error.status));
            resolve(false);
          });
    });
  }

  recuperarDocumento(id: any) {
    return new Promise((resolve, reject) => {
      this.documentoService.get('documento/'+ id)
        .subscribe((res: any) => {
          resolve(res);
        },
          (error: any) => {
            console.error(error);
            this.infoFalla();
            this.popUpManager.showErrorToast(this.translate.instant('ERROR' + error.status));
            reject(false);
          });
    });
  }

  verInfoCaracteristca(documento: any) {
    this.newNuxeoService.getByIdLocal(documento.DocumentoId)
      .subscribe(file => {
        documento.Documento = file;
        this.revisar_doc.emit(documento);
      }, error => {
        this.popUpManager.showErrorAlert(this.translate.instant('inscripcion.sin_documento'));
      })
  }

  addCargado(carga: number) {
    this.infoCarga.nCargado += carga;
    this.infoCarga.porcentaje = this.infoCarga.nCargado/this.infoCarga.nCargas;
    if (this.infoCarga.porcentaje >= 1) {
      this.infoCarga.status = "completed";
      this.infoCarga.outInfo = {
        id: this.info_info_persona.Id,
        numeroDocId: this.info_info_persona.NumeroIdentificacion,
        nombre: this.info_info_persona["NombreCompleto"],
        tipoDoc: this.info_info_persona.TipoIdentificacion.Nombre.toLowerCase(),
        telefono: this.telefono,
        correo: this.correo,
      }
    }
    this.estadoCarga.emit(this.infoCarga);
  }

  infoFalla() {
    this.infoCarga.status = "failed";
    this.estadoCarga.emit(this.infoCarga);
  }
}