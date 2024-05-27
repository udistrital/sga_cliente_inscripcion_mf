import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFormacionAcademicaComponent } from './list-formacion-academica.component';

describe('ListFormacionAcademicaComponent', () => {
  let component: ListFormacionAcademicaComponent;
  let fixture: ComponentFixture<ListFormacionAcademicaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListFormacionAcademicaComponent]
    });
    fixture = TestBed.createComponent(ListFormacionAcademicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
