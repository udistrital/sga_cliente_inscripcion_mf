import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalizacionMatriculaComponent } from './legalizacion-matricula.component';

describe('LegalizacionMatriculaComponent', () => {
  let component: LegalizacionMatriculaComponent;
  let fixture: ComponentFixture<LegalizacionMatriculaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LegalizacionMatriculaComponent]
    });
    fixture = TestBed.createComponent(LegalizacionMatriculaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
