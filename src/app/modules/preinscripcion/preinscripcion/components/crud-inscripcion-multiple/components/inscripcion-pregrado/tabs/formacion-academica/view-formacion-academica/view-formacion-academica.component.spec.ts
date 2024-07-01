import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFormacionAcademicaComponent } from './view-formacion-academica.component';

describe('ViewFormacionAcademicaComponent', () => {
  let component: ViewFormacionAcademicaComponent;
  let fixture: ComponentFixture<ViewFormacionAcademicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewFormacionAcademicaComponent]
    });
    fixture = TestBed.createComponent(ViewFormacionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
