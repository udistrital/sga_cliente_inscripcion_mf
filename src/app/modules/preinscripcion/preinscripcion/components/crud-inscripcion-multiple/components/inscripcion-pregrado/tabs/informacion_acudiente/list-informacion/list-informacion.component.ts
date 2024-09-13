import { Component } from '@angular/core';
import {FormBuilder, Validators, FormGroup, FormControl , FormsModule , ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import { TercerosMidService } from 'src/app/services/terceros_mid.service';

@Component({
  selector: 'ngx-list-informacion-acudiente',
  templateUrl: './list-informacion.component.html',
  styleUrls: ['./list-informacion.component.scss']
})
export class ListInformacionComponent {

  tieneDatos = false;

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
  seventhFormGroup = this._formBuilder.group({
    seventhCtrl: ['', Validators.required],
  });
  eighthFormGroup = this._formBuilder.group({
    eighthCtrl: ['', Validators.required],
  });
  ninthFormGroup = this._formBuilder.group({
    ninthCtrl: ['', Validators.required],
  });
  tenthFormGroup = this._formBuilder.group({
    tenthCtrl: ['', Validators.required],
  });
  isLinear = true;

  constructor(private _formBuilder: FormBuilder, private tercerosMidService: TercerosMidService) {}

  ngOnInit(){
    const terceroId = sessionStorage.getItem('TerceroId');
    this.tercerosMidService.get('personas/datos-acudiente/'+terceroId).subscribe((res) => {
      console.log("BBBBBBBBBBBBBBBBBBBBBBBBB",res);
      if (res) {
        for (let i = 0; i < res.Data.length; i++) {
          switch (res.Data[i].InfoComplementariaId.CodigoAbreviacion) {
            case 'NOM_PRI_ACU':
              this.firstFormGroup.patchValue({
                firstCtrl: JSON.parse(res.Data[i].Dato).Dato
              });
              break;
            case 'PAREN_PRI_ACU':
              this.secondFormGroup.patchValue({
                secondCtrl: JSON.parse(res.Data[i].Dato).Dato
              });
              break;
            case 'CORREO_PRI_ACU':
              this.thirdFormGroup.patchValue({
                thirdCtrl: JSON.parse(res.Data[i].Dato).Dato
              });
              break;
            case 'DIREC_PRI_ACU':
              this.fourthFormGroup.patchValue({
                fourthCtrl: JSON.parse(res.Data[i].Dato).Dato
              });
              break;
            case 'TEL_PRI_ACU':
              this.fifthFormGroup.patchValue({
                fifthCtrl: JSON.parse(res.Data[i].Dato).Dato
              });
              break;
            case 'NOM_SEG_ACU':
              this.sixthFormGroup.patchValue({
                sixthCtrl: JSON.parse(res.Data[i].Dato).Dato
              });
              break;
            case 'PAREN_SEG_ACU':
              this.seventhFormGroup.patchValue({
                seventhCtrl: JSON.parse(res.Data[i].Dato).Dato
              });
              break;
            case 'CORREO_SEG_ACU':
              this.eighthFormGroup.patchValue({
                eighthCtrl: JSON.parse(res.Data[i].Dato).Dato
              });
              break;
            case 'DIREC_SEG_ACU':
              this.ninthFormGroup.patchValue({
                ninthCtrl: JSON.parse(res.Data[i].Dato).Dato
              });
              break;
            case 'TEL_SEG_ACU':
              this.tenthFormGroup.patchValue({
                tenthCtrl: JSON.parse(res.Data[i].Dato).Dato
              });
              break;
          }
        }
        this.tieneDatos = true;
      }
    });
  }

  submit() {
    const data = {
      nombre: this.firstFormGroup.get('firstCtrl')?.value,
      parentezco: this.secondFormGroup.get('secondCtrl')?.value,
      correo: this.thirdFormGroup.get('thirdCtrl')?.value,
      direccion: this.fourthFormGroup.get('fourthCtrl')?.value,
      telefono: this.fifthFormGroup.get('fifthCtrl')?.value,
      nombreSegundo: this.sixthFormGroup.get('sixthCtrl')?.value,
      parentezcoSegundo: this.seventhFormGroup.get('seventhCtrl')?.value,
      correoSegundo: this.eighthFormGroup.get('eighthCtrl')?.value,
      direccionSegundo: this.ninthFormGroup.get('ninthCtrl')?.value,
      telefonoSegundo: this.tenthFormGroup.get('tenthCtrl')?.value
    };

    const terceroId = sessionStorage.getItem('TerceroId');
    console.log(data);

    if (this.tieneDatos) {
      console.log('actualizar');
      //hacer un put con los datos
      this.tercerosMidService.put('personas/datos-acudiente/'+terceroId, data).subscribe((res) => {
        console.log(res);
      });
    }else{
      console.log('crear');
      //hacer un post con los datos
      this.tercerosMidService.post('personas/datos-acudiente/'+terceroId, data).subscribe((res) => {
        console.log(res);
      });
    }
  }
}
