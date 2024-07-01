import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudInformacionAcademicaComponent } from './crud-informacion-academica.component';

describe('CrudInformacionAcademicaComponent', () => {
  let component: CrudInformacionAcademicaComponent;
  let fixture: ComponentFixture<CrudInformacionAcademicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CrudInformacionAcademicaComponent]
    });
    fixture = TestBed.createComponent(CrudInformacionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
