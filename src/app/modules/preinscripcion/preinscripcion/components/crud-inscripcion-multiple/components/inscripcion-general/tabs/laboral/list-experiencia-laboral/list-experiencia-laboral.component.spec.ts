import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListExperienciaLaboralComponent } from './list-experiencia-laboral.component';

describe('ListExperienciaLaboralComponent', () => {
  let component: ListExperienciaLaboralComponent;
  let fixture: ComponentFixture<ListExperienciaLaboralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListExperienciaLaboralComponent]
    });
    fixture = TestBed.createComponent(ListExperienciaLaboralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
