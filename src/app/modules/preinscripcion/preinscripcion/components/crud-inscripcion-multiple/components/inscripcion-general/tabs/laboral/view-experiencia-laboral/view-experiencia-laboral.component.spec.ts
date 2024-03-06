import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewExperienciaLaboralComponent } from './view-experiencia-laboral.component';

describe('ViewExperienciaLaboralComponent', () => {
  let component: ViewExperienciaLaboralComponent;
  let fixture: ComponentFixture<ViewExperienciaLaboralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewExperienciaLaboralComponent]
    });
    fixture = TestBed.createComponent(ViewExperienciaLaboralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
