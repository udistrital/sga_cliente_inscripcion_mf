import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInformacionAcademicaComponent } from './list-informacion-academica.component';

describe('ListInformacionAcademicaComponent', () => {
  let component: ListInformacionAcademicaComponent;
  let fixture: ComponentFixture<ListInformacionAcademicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListInformacionAcademicaComponent]
    });
    fixture = TestBed.createComponent(ListInformacionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
