import { Component } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';
import { forEach } from 'jszip';
import { TercerosMidService } from 'src/app/services/terceros_mid.service';

@Component({
  selector: 'ngx-list-informacion-academica',
  templateUrl: './list-informacion-academica.component.html',
  styleUrls: ['./list-informacion-academica.component.scss']
})
export class ListInformacionAcademicaComponent {
  localidades : any[] = [];
  tiposColegio : any[] = [];
  validar : any[] = [];
  semestres : any[] = [];
  medios : any[] = [];
  oportunidades : any[] = [];

  tieneDatos = false;
  terceroId: any

  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  thirdFormGroup = this._formBuilder.group({
    thirdCtrl: ['', Validators.required],
  });
  fourthFormGroup = this._formBuilder.group({
    fourthCtrl: ['', Validators.required],
  });
  fifthFormGroup = this._formBuilder.group({
    fifthCtrl: ['', Validators.required],
  });
  sixthFormGroup = this._formBuilder.group({
    sixthCtrl: ['', Validators.required],
  });
  isLinear = true;

  constructor(private _formBuilder: FormBuilder, private tercerosMidService: TercerosMidService) {}

  ngOnInit(){
    this.terceroId = sessionStorage.getItem('IdTercero');
    this.tercerosMidService.get('personas/localidades').subscribe((res) => {
      if (res) {
        res.Data.localidades.forEach((element: any) => {
          this.localidades.push(element);
        });
        res.Data.tipoColegio.forEach((element: any) => {
          this.tiposColegio.push(element);
        });
        res.Data.valido.forEach((element: any) => {
          this.validar.push(element);
        });
        res.Data.semestres.forEach((element: any) => {
          this.semestres.push(element);
        });
        res.Data.medio.forEach((element: any) => {
          this.medios.push(element);
        });
        res.Data.presentacion.forEach((element: any) => {
          this.oportunidades.push(element);
        });
      } 
    });

    this.tercerosMidService.get('personas/localidades/'+ this.terceroId).subscribe((res) => {
      if (res.Data.colegio[0].Id != 0) {
        this.firstFormGroup.get('firstCtrl')?.setValue(res.Data.localidades[0].InfoComplementariaId.Id);
        this.secondFormGroup.get('secondCtrl')?.setValue(res.Data.colegio[0].InfoComplementariaId.Id);
        this.thirdFormGroup.get('thirdCtrl')?.setValue(res.Data.valido[0].InfoComplementariaId.Id);
        this.fourthFormGroup.get('fourthCtrl')?.setValue(res.Data.semestres[0].InfoComplementariaId.Id);
        this.fifthFormGroup.get('fifthCtrl')?.setValue(res.Data.medio[0].InfoComplementariaId.Id);
        this.sixthFormGroup.get('sixthCtrl')?.setValue(res.Data.presentacion[0].InfoComplementariaId.Id);
        this.tieneDatos = true;
      } 
    });

  }

  submit() {
    const data = {
      localidad : this.firstFormGroup.get('firstCtrl')?.value,
      tipoColegio : this.secondFormGroup.get('secondCtrl')?.value,
      valido : this.thirdFormGroup.get('thirdCtrl')?.value,
      semestre : this.fourthFormGroup.get('fourthCtrl')?.value,
      medio : this.fifthFormGroup.get('fifthCtrl')?.value,
      oportunidad : this.sixthFormGroup.get('sixthCtrl')?.value,
    }


    if (this.tieneDatos) {
      this.tercerosMidService.put('personas/localidades/'+ this.terceroId, data).subscribe((res) => {

      });
    } else {
      this.tercerosMidService.post('personas/localidades/'+ this.terceroId, data).subscribe((res) => {

      });
    }
  }

}
