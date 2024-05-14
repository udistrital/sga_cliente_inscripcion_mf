// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { LegalizacionMatriculaAspiranteComponent } from './legalizacion-matricula-aspirante.component';

// describe('LegalizacionMatriculaAspiranteComponent', () => {
//   let component: LegalizacionMatriculaAspiranteComponent;
//   let fixture: ComponentFixture<LegalizacionMatriculaAspiranteComponent>;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       declarations: [LegalizacionMatriculaAspiranteComponent]
//     });
//     fixture = TestBed.createComponent(LegalizacionMatriculaAspiranteComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalizacionMatriculaAspiranteComponent } from './legalizacion-matricula-aspirante.component';

describe('LegalizacionMatriculaAspiranteComponent', () => {
  let component: LegalizacionMatriculaAspiranteComponent;
  let fixture: ComponentFixture<LegalizacionMatriculaAspiranteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LegalizacionMatriculaAspiranteComponent]
    });
    fixture = TestBed.createComponent(LegalizacionMatriculaAspiranteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
