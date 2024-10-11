import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';
import { APROBADO, NO_APROBADO } from '../../preinscripcion/preinscripcion/components/crud-inscripcion-multiple/components/inscripcion-general/tabs/constants';

@Component({
  selector: 'app-dialogo-documentos',
  templateUrl: './dialogo-documentos.component.html',
  styleUrls: ['./dialogo-documentos.component.scss']
})
export class DialogoDocumentosComponent implements OnInit {

  revisionForm!: FormGroup;
  tabName: string = "";
  documento: any;
  nombreDocumento: string = "";
  verEstado: string = "";
  observando!: boolean;
  isPDF: boolean = true;
  validsafe: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogoDocumentosComponent>,
    @Inject(MAT_DIALOG_DATA) private data:any,
    private translate: TranslateService,
    private popUpManager: PopUpManager,
    private builder: FormBuilder,
    private sanitization: DomSanitizer,
  ) {
    this.crearForm();
    this.dialogRef.backdropClick().subscribe(() => this.dialogRef.close());
  }

  ngOnInit() {
    this.isPDF = true;
    this.tabName = this.data.documento.tabName || "";
    console.log("DOCUMENTOOOO", this.data.documento);
    if(this.data.documento.hasOwnProperty('nombreDocumento')){
      this.nombreDocumento = this.data.documento.nombreDocumento;
    } else {
      this.nombreDocumento = "";
    }
    switch (this.data.documento.estadoObservacion) {
      case APROBADO:
        this.verEstado = this.translate.instant('GLOBAL.estado_aprobado');
        break;
      case NO_APROBADO:
        this.verEstado = this.translate.instant('GLOBAL.estado_no_aprobado');
        break;
      default:
        this.verEstado = this.translate.instant('GLOBAL.estado_no_definido');
        break;
    }
    if (this.data.documento.Documento.changingThisBreaksApplicationSecurity) {
      this.documento = this.data.documento.Documento['changingThisBreaksApplicationSecurity'];
    } else {
      this.documento = this.data.documento.Documento.url;
      this.isPDF = this.data.documento.Documento.type == '.pdf';
      if(!this.isPDF) {
        this.documento = this.sanitization.bypassSecurityTrustUrl(this.documento);
      }
    }
    this.observando = this.data.documento.observando ? true : false;
    this.revisionForm.setValue({
      observacion: this.data.documento.observacion ? this.data.documento.observacion : "",
      aprobado: this.data.documento.aprobado ? this.data.documento.aprobado : false,
    });
  }

  crearForm() {
    this.revisionForm = this.builder.group({
      observacion: ['', Validators.required],
      aprobado: [false, Validators.required],
    });
  }

  guardarRevision(accion:any) {
    switch (accion) {
      case "NoAprueba":
        this.revisionForm.patchValue({
          aprobado: false,
        });
        break;
      case "Aprueba":
        this.revisionForm.patchValue({
          observacion: this.revisionForm.value.observacion ? this.revisionForm.value.observacion : "Ninguna",
          aprobado: true,
        });
        break;
      default:
        break;
    }
    if (this.revisionForm.valid) {
      this.popUpManager.showConfirmAlert(this.translate.instant('admision.seguro_revision')).then(
        ok => {
          if (ok.value) {
            const data = {
              metadata: this.revisionForm.value,
              folderOrTag: this.data.documento.carpeta || "",
              nombreSoporte: this.data.documento.nombreSoporte,
            }
            this.dialogRef.close(data)
          } else {
            this.revisionForm.patchValue({
              observacion: "",
              aprobado: false,
            });
          }
        }
      )
    } else {
      this.popUpManager.showErrorAlert(this.translate.instant('GLOBAL.observacion_requerida'))
    }
  }

  docCargado() {
  }

}

