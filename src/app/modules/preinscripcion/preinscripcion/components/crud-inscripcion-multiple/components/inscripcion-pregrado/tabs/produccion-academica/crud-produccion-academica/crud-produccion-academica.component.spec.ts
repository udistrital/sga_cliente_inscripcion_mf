import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudProduccionAcademicaComponent } from './crud-produccion-academica.component';

describe('CrudProduccionAcademicaComponent', () => {
  let component: CrudProduccionAcademicaComponent;
  let fixture: ComponentFixture<CrudProduccionAcademicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudProduccionAcademicaComponent]
    });
    fixture = TestBed.createComponent(CrudProduccionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
