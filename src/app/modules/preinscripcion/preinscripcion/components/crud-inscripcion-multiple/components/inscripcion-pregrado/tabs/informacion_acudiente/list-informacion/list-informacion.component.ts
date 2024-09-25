// import { Component, EventEmitter, Input, Output} from '@angular/core';
// import {FormBuilder, Validators, FormGroup, FormControl , FormsModule , ReactiveFormsModule} from '@angular/forms';
// import {MatInputModule} from '@angular/material/input';
// import {MatFormFieldModule} from '@angular/material/form-field';
// import {MatStepperModule} from '@angular/material/stepper';
// import {MatButtonModule} from '@angular/material/button';
// import { TercerosMidService } from 'src/app/services/terceros_mid.service';

// @Component({
//   selector: 'ngx-list-informacion-acudiente',
//   templateUrl: './list-informacion.component.html',
//   styleUrls: ['./list-informacion.component.scss']
// })
// export class ListInformacionComponent {

//   tieneDatos = false;
//   terceroId: any
//   porcentaje!: number;

//   @Input('porcentaje')
//   set valPorcentaje(porcentaje: number) {
//     this.porcentaje = porcentaje / 100 * 2;
//   }

//   @Output('result') result: EventEmitter<any> = new EventEmitter();

//   firstFormGroup = this._formBuilder.group({
//     firstCtrl: ['', Validators.required],
//   });
//   secondFormGroup = this._formBuilder.group({
//     secondCtrl: ['', Validators.required],
//   });
//   thirdFormGroup = this._formBuilder.group({
//     thirdCtrl: ['', Validators.required],
//   });
//   fourthFormGroup = this._formBuilder.group({
//     fourthCtrl: ['', Validators.required],
//   });
//   fifthFormGroup = this._formBuilder.group({
//     fifthCtrl: ['', Validators.required],
//   });
//   sixthFormGroup = this._formBuilder.group({
//     sixthCtrl: ['', Validators.required],
//   });
//   seventhFormGroup = this._formBuilder.group({
//     seventhCtrl: ['', Validators.required],
//   });
//   eighthFormGroup = this._formBuilder.group({
//     eighthCtrl: ['', Validators.required],
//   });
//   ninthFormGroup = this._formBuilder.group({
//     ninthCtrl: ['', Validators.required],
//   });
//   tenthFormGroup = this._formBuilder.group({
//     tenthCtrl: ['', Validators.required],
//   });
//   isLinear = true;

//   constructor(private _formBuilder: FormBuilder, private tercerosMidService: TercerosMidService) {}

//   ngOnInit(){
//     this.terceroId = sessionStorage.getItem('IdTercero');
//     this.tercerosMidService.get('personas/datos-acudiente/'+this.terceroId).subscribe((res) => {
//       if (res.Data.length > 1) {
//         for (let i = 0; i < res.Data.length; i++) {
//           switch (res.Data[i].InfoComplementariaId.CodigoAbreviacion) {
//             case 'NOM_PRI_ACU':
//               this.firstFormGroup.patchValue({
//                 firstCtrl: JSON.parse(res.Data[i].Dato).Dato
//               });
//               break;
//             case 'PAREN_PRI_ACU':
//               this.secondFormGroup.patchValue({
//                 secondCtrl: JSON.parse(res.Data[i].Dato).Dato
//               });
//               break;
//             case 'CORREO_PRI_ACU':
//               this.thirdFormGroup.patchValue({
//                 thirdCtrl: JSON.parse(res.Data[i].Dato).Dato
//               });
//               break;
//             case 'DIREC_PRI_ACU':
//               this.fourthFormGroup.patchValue({
//                 fourthCtrl: JSON.parse(res.Data[i].Dato).Dato
//               });
//               break;
//             case 'TEL_PRI_ACU':
//               this.fifthFormGroup.patchValue({
//                 fifthCtrl: JSON.parse(res.Data[i].Dato).Dato
//               });
//               break;
//             case 'NOM_SEG_ACU':
//               this.sixthFormGroup.patchValue({
//                 sixthCtrl: JSON.parse(res.Data[i].Dato).Dato
//               });
//               break;
//             case 'PAREN_SEG_ACU':
//               this.seventhFormGroup.patchValue({
//                 seventhCtrl: JSON.parse(res.Data[i].Dato).Dato
//               });
//               break;
//             case 'CORREO_SEG_ACU':
//               this.eighthFormGroup.patchValue({
//                 eighthCtrl: JSON.parse(res.Data[i].Dato).Dato
//               });
//               break;
//             case 'DIREC_SEG_ACU':
//               this.ninthFormGroup.patchValue({
//                 ninthCtrl: JSON.parse(res.Data[i].Dato).Dato
//               });
//               break;
//             case 'TEL_SEG_ACU':
//               this.tenthFormGroup.patchValue({
//                 tenthCtrl: JSON.parse(res.Data[i].Dato).Dato
//               });
//               break;
//           }
//         }
//         this.tieneDatos = true;
//       }
//     });
//   }

//   submit() {
//     const data = {
//       nombre: this.firstFormGroup.get('firstCtrl')?.value,
//       parentezco: this.secondFormGroup.get('secondCtrl')?.value,
//       correo: this.thirdFormGroup.get('thirdCtrl')?.value,
//       direccion: this.fourthFormGroup.get('fourthCtrl')?.value,
//       telefono: this.fifthFormGroup.get('fifthCtrl')?.value,
//       nombreSegundo: this.sixthFormGroup.get('sixthCtrl')?.value,
//       parentezcoSegundo: this.seventhFormGroup.get('seventhCtrl')?.value,
//       correoSegundo: this.eighthFormGroup.get('eighthCtrl')?.value,
//       direccionSegundo: this.ninthFormGroup.get('ninthCtrl')?.value,
//       telefonoSegundo: this.tenthFormGroup.get('tenthCtrl')?.value
//     };


//     if (this.tieneDatos) {
//       this.tercerosMidService.put('personas/datos-acudiente/'+this.terceroId, data).subscribe((res) => {
        
//       });
//     }else{
//       this.tercerosMidService.post('personas/datos-acudiente/'+this.terceroId, data).subscribe((res) => {

//       });
//     }
//   }

//   setPercentage(event: any) {
//     if (event > 1 || this.porcentaje > 1) {
//       setTimeout(() => {
//         this.result.emit(1);
//       });
//     } else if (event < this.porcentaje) {
//       setTimeout(() => {
//         this.result.emit(this.porcentaje);
//       });
//     } else {
//       setTimeout(() => {
//         this.result.emit(event);
//       });
//     }
//   }
// }


import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TercerosMidService } from 'src/app/services/terceros_mid.service';

@Component({
  selector: 'ngx-list-informacion-acudiente',
  templateUrl: './list-informacion.component.html',
  styleUrls: ['./list-informacion.component.scss']
})
export class ListInformacionComponent {

  tieneDatos = false;
  terceroId: any;
  porcentaje!: number;

  @Input('porcentaje') set valPorcentaje(porcentaje: number) {
    this.porcentaje = porcentaje / 100 * 10;
  }

  @Output('result') result: EventEmitter<any> = new EventEmitter();

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

  constructor(private _formBuilder: FormBuilder, private tercerosMidService: TercerosMidService) {}

  ngOnInit() {
    this.terceroId = sessionStorage.getItem('IdTercero');
    this.tercerosMidService.get('personas/datos-acudiente/' + this.terceroId).subscribe((res) => {
      if (res.Data.length > 1) {
        for (let i = 0; i < res.Data.length; i++) {
          switch (res.Data[i].InfoComplementariaId.CodigoAbreviacion) {
            case 'NOM_PRI_ACU':
              this.firstFormGroup.patchValue({ firstCtrl: JSON.parse(res.Data[i].Dato).Dato });
              break;
            case 'PAREN_PRI_ACU':
              this.secondFormGroup.patchValue({ secondCtrl: JSON.parse(res.Data[i].Dato).Dato });
              break;
            case 'CORREO_PRI_ACU':
              this.thirdFormGroup.patchValue({ thirdCtrl: JSON.parse(res.Data[i].Dato).Dato });
              break;
            case 'DIREC_PRI_ACU':
              this.fourthFormGroup.patchValue({ fourthCtrl: JSON.parse(res.Data[i].Dato).Dato });
              break;
            case 'TEL_PRI_ACU':
              this.fifthFormGroup.patchValue({ fifthCtrl: JSON.parse(res.Data[i].Dato).Dato });
              break;
            case 'NOM_SEG_ACU':
              this.sixthFormGroup.patchValue({ sixthCtrl: JSON.parse(res.Data[i].Dato).Dato });
              break;
            case 'PAREN_SEG_ACU':
              this.seventhFormGroup.patchValue({ seventhCtrl: JSON.parse(res.Data[i].Dato).Dato });
              break;
            case 'CORREO_SEG_ACU':
              this.eighthFormGroup.patchValue({ eighthCtrl: JSON.parse(res.Data[i].Dato).Dato });
              break;
            case 'DIREC_SEG_ACU':
              this.ninthFormGroup.patchValue({ ninthCtrl: JSON.parse(res.Data[i].Dato).Dato });
              break;
            case 'TEL_SEG_ACU':
              this.tenthFormGroup.patchValue({ tenthCtrl: JSON.parse(res.Data[i].Dato).Dato });
              break;
          }
        }
        this.tieneDatos = true;
      }
      this.calculatePercentage();
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
      telefonoSegundo: this.tenthFormGroup.get('tenthCtrl')?.value,
    };

    if (this.tieneDatos) {
      this.tercerosMidService.put('personas/datos-acudiente/' + this.terceroId, data).subscribe((res) => {
        // Acción después del PUT
      });
    } else {
      this.tercerosMidService.post('personas/datos-acudiente/' + this.terceroId, data).subscribe((res) => {
        // Acción después del POST
      });
    }
  }

  // Calcula el porcentaje basado en la cantidad de formularios completos
  calculatePercentage() {
    const totalForms = 10;
    let validForms = 0;

    if (this.firstFormGroup.valid) validForms++;
    if (this.secondFormGroup.valid) validForms++;
    if (this.thirdFormGroup.valid) validForms++;
    if (this.fourthFormGroup.valid) validForms++;
    if (this.fifthFormGroup.valid) validForms++;
    if (this.sixthFormGroup.valid) validForms++;
    if (this.seventhFormGroup.valid) validForms++;
    if (this.eighthFormGroup.valid) validForms++;
    if (this.ninthFormGroup.valid) validForms++;
    if (this.tenthFormGroup.valid) validForms++;

    const percentage = (validForms / totalForms) * 10;
    this.result.emit(percentage);
  }

  setPercentage(event: any) {
    if (event > 1 || this.porcentaje > 1) {
      setTimeout(() => {
        this.result.emit(1);
      });
    } else if (event < this.porcentaje) {
      setTimeout(() => {
        this.result.emit(this.porcentaje);
      });
    } else {
      setTimeout(() => {
        this.result.emit(event);
      });
    }
  }
}

