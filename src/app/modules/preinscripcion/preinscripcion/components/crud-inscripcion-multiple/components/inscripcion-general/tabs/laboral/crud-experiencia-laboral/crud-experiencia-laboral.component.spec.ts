import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudExperienciaLaboralComponent } from './crud-experiencia-laboral.component';

describe('CrudExperienciaLaboralComponent', () => {
  let component: CrudExperienciaLaboralComponent;
  let fixture: ComponentFixture<CrudExperienciaLaboralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudExperienciaLaboralComponent]
    });
    fixture = TestBed.createComponent(CrudExperienciaLaboralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
