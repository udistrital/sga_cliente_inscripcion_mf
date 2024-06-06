import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudFormacionAcademicaComponent } from './crud-formacion-academica.component';

describe('CrudFormacionAcademicaComponent', () => {
  let component: CrudFormacionAcademicaComponent;
  let fixture: ComponentFixture<CrudFormacionAcademicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudFormacionAcademicaComponent]
    });
    fixture = TestBed.createComponent(CrudFormacionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
